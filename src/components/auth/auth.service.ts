import * as bcrypt from 'bcrypt';
import { Like, MoreThan, Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthResponseDto, AuthResponseRegisterDto } from './dto/Auth.dto';
import { LoginDto } from './dto/Login.dto';
import { ChangePasswordDto, ResetPasswordDto } from './dto/Password.dto';
import * as jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import { PhoneJson } from './interfaces/IAuth';
import { Company } from '@entities/company.entity';
import { RecoveryCode } from '@entities/recovery-codes.entity';
import { WhatsappService } from 'src/external/services/WHATSCODE/whatsapp-code.service';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import { FeatureUsage } from '@entities/feature-usage.entity';
import { FeatureLog } from '@entities/feature-logs.entity';
import { ContactCompany } from '@entities/contact-company.entity';
import {
  ContactCompanyRegisterDto,
  ContactCompanyLoginDto,
} from './dto/ContactCompanyAuth.dto';
import { CompanySearchService } from '@components/company-search/company-search.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(RecoveryCode)
    private recoverCodeRepository: Repository<RecoveryCode>,
    private configService: ConfigService,
    private whatsappService: WhatsappService,
    @InjectRepository(SubscriptionCompany)
    private subscriptionCompanyRepository: Repository<SubscriptionCompany>,
    @InjectRepository(FeatureUsage)
    private featureUsageRepository: Repository<FeatureUsage>,
    @InjectRepository(FeatureLog)
    private featureLogsRepository: Repository<FeatureLog>,
    @InjectRepository(ContactCompany)
    private contactCompanyRepository: Repository<ContactCompany>,
    private companySearchService: CompanySearchService,
  ) {}

  async generateJwt(payload: any) {
    const secret = this.configService.get<string>('JWT_SECRET');
    const expiration = this.configService.get<string>('JWT_EXPIRATION') || '30d';
    return jwt.sign(payload, secret, { expiresIn: '30d' });
  }

  async register(registerDto: any): Promise<AuthResponseRegisterDto> {
    const queryRunner =
      this.companyRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { cnpj, password, name, nameFantasy, ...userData } = registerDto;

      const existingUser = await this.companyRepository.findOne({
        where: { cnpj },
      });
      if (existingUser) {
        throw new HttpException('CNPJ já cadastrado', HttpStatus.BAD_REQUEST);
      }
      const existingCpf = await this.companyRepository.findOne({
        where: { cpf: registerDto.cpf },
      });
      if (existingCpf) {
        throw new HttpException('CPF já cadastrado', HttpStatus.BAD_REQUEST);
      }

      const existingEmail = await this.companyRepository.findOne({
        where: { email: registerDto.email },
      });
      if (existingEmail) {
        throw new HttpException('E-mail já cadastrado', HttpStatus.BAD_REQUEST);
      }

      const findByCnpj = await this.companySearchService.getCnpjData(cnpj);

      if (!findByCnpj) {
        throw new HttpException(
          'CNPJ inválido ou não encontrado',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (findByCnpj.dataAbertura) {
        const dataAbertura = new Date(findByCnpj.dataAbertura);
        const hoje = new Date();
        const diferencaEmMeses =
          (hoje.getFullYear() - dataAbertura.getFullYear()) * 12 +
          (hoje.getMonth() - dataAbertura.getMonth());

        if (diferencaEmMeses < 6) {
          throw new HttpException(
            'Não é possível registrar empresas com menos de 6 meses de existência. Por favor, tente novamente quando sua empresa atingir este requisito.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (findByCnpj.situacao !== 'ATIVA') {
        throw new HttpException(
          'CNPJ não está ativo na Receita Federal',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = this.companyRepository.create({
        ...userData,
        isActive: true,
        isCompleted: true,
        isOn: true,
        cnpj,
        name: this.formatName(name),
        nameFantasy: this.formatName(nameFantasy),
        zipcode: findByCnpj.endereco.cep,
        state: findByCnpj.endereco.uf,
        city: findByCnpj.endereco.municipio,
        street: findByCnpj.endereco.logradouro,
        district: findByCnpj.endereco.bairro,
        password: hashedPassword,
      });

      const savedUser = await queryRunner.manager.save(newUser);

      const subscriptionCompany = this.subscriptionCompanyRepository.create({
        //@ts-ignore
        companyId: savedUser.id,
        status: 1,
        planId: '4',
        interval: 1,
        amount: 249.0,
        nextRecurrency: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });

      await queryRunner.manager.save(subscriptionCompany);

      await queryRunner.commitTransaction();

      return { message: 'Cadastro enviado para análise' };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.log(error, 'Resposta');
      throw new HttpException(
        error?.message || 'Erro interno no servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async login(
    loginDto: LoginDto,
    ip: string,
  ): Promise<AuthResponseDto & { company: boolean }> {
    const { cnpj, password } = loginDto;
    const user = await this.companyRepository.findOne({ where: { cnpj } });

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST);
    }

    if (!user.isActive) {
      throw new HttpException(
        'Cadastro encontra-se em análise',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Dados inválidos', HttpStatus.BAD_REQUEST);
    }

    await this.companyRepository.save(user);
    const payload = { username: user.cnpj, sub: user.id };
    const token = await this.generateJwt(payload);

    return { access_token: token, company: true };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      const { oldPassword, newPassword } = changePasswordDto;

      const user = await this.companyRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }

      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        throw new HttpException(
          'Senha antiga inválida',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await this.companyRepository.save(user);
      return {
        message: 'Senha alterada com sucesso',
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('55')) {
      return cleaned;
    }
    return `55${cleaned}`;
  }

  private formatName(name: string): string {
    if (!name) return '';

    return name
      .trim()
      .toLowerCase()
      .split(' ')
      .map((word) => {
        const minusculas = [
          'de',
          'da',
          'do',
          'das',
          'dos',
          'e',
          'a',
          'o',
          'as',
          'os',
        ];
        if (minusculas.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  async generateRecoveryCodeAndSendNumber(
    phone: PhoneJson,
  ): Promise<{ status: boolean; message: string }> {
    try {
      const { phoneNumber } = phone;
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const phoneNumberVariations = [
        phoneNumber,
        phoneNumber.replace(')', ') '),
      ];

      const user = await this.companyRepository.findOne({
        where: phoneNumberVariations.map((variation) => ({
          phoneNumber: Like(`%${variation}%`),
        })),
      });

      if (!user) {
        throw new HttpException(
          'Não localizamos esse número em nossa base de dados',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.recoverCodeRepository.delete({
        phoneNumber: formattedPhone,
      });

      const code = Math.floor(100000 + Math.random() * 900000);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const response = await this.whatsappService.whatsAppCode(
        formattedPhone,
        code,
      );

      if (response.status === 200) {
        await this.recoverCodeRepository.save({
          code,
          phoneNumber: formattedPhone,
          expiresAt,
          used: false,
        });
      } else {
        throw new HttpException(
          'Por favor tente novamente, daqui a pouco',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        status: true,
        message: 'Código enviado com sucesso',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Não conseguimos enviar o código de redefinição',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sendCodeVerify(
    phone: PhoneJson,
  ): Promise<{ status: boolean; message: string }> {
    try {
      const { phoneNumber } = phone;
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const code = Math.floor(100000 + Math.random() * 900000);

      const response = await this.whatsappService.whatsAppCode(
        formattedPhone,
        code,
      );

      return {
        status: true,
        message: 'Código enviado com sucesso',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Não conseguimos enviar o código de verificação',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async validateRecoveryCode(recoveryDto: any): Promise<any> {
    try {
      const { phoneNumber, code } = recoveryDto;

      const phoneNumberVariations = [
        phoneNumber,
        phoneNumber.replace(')', ') '),
      ];

      const user = await this.companyRepository.findOne({
        where: phoneNumberVariations.map((variation) => ({
          phoneNumber: Like(`%${variation}%`),
        })),
      });

      if (!user) {
        throw new HttpException(
          'Não conseguimos localizar nenhum usuário com esse número',
          HttpStatus.NOT_FOUND,
        );
      }

      const recoveryCode = await this.recoverCodeRepository.findOne({
        where: {
          code,
          used: false,
          expiresAt: MoreThan(new Date()),
        },
      });

      if (!recoveryCode) {
        throw new HttpException(
          'Código expirado ou inválido',
          HttpStatus.BAD_REQUEST,
        );
      }

      function normalizePhoneNumber(phoneNumber: string): string {
        let normalized = phoneNumber.replace(/\D/g, '');
        if (!normalized.startsWith('55') && normalized.length >= 10) {
          normalized = '55' + normalized;
        }

        return normalized;
      }

      const normalizedUserPhone = normalizePhoneNumber(user.phoneNumber);
      const normalizedRecoveryPhone = normalizePhoneNumber(
        recoveryCode.phoneNumber,
      );

      if (normalizedUserPhone !== normalizedRecoveryPhone) {
        throw new HttpException(
          'O código não corresponde ao número do usuário',
          HttpStatus.FORBIDDEN,
        );
      }

      await this.recoverCodeRepository.update(recoveryCode.id, {
        used: true,
      });

      return {
        success: true,
        message: 'Código validado com sucesso',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Erro na validação do código:', error);

      throw new HttpException(
        'Ocorreu um erro ao validar o código. Tente novamente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePasswordByRecoveryCode(
    resetPasswordDto: any,
  ): Promise<{ message: string }> {
    const { phoneNumber, newPassword } = resetPasswordDto;
    const phoneNumberVariations = [phoneNumber, phoneNumber.replace(')', ') ')];

    const user = await this.companyRepository.findOne({
      where: phoneNumberVariations.map((variation) => ({
        phoneNumber: Like(`%${variation}%`),
      })),
    });

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await this.companyRepository.save(user);

    return { message: 'Senha alterada com sucesso' };
  }
  async getUserByToken(token: string): Promise<Company> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');

      const decoded = jwt.verify(token, secret) as { sub: string };

      const user = await this.companyRepository.findOne({
        where: { id: decoded.sub },
        select: [
          'id',
          'name',
          'email',
          'isActive',
          'cpf',
          'createdAt',
          'cnpj',
          'antt',
          'phoneContact',
          'photoUrl',
          'phoneNumber',
          'city',
          'nameFantasy',
          'state',
          'zipcode',
          'street',
          'number',
          'isOn',
        ],
        relations: ['contacts', 'CompanyUsersContacts'],
      });

      if (!user) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }

  async getBeneficitsUser(userId: string) {
    try {
      const subscription = await this.subscriptionCompanyRepository.findOne({
        where: { companyId: userId },
        relations: ['plan', 'plan.featureLimits', 'plan.featureLimits.feature'],
      });

      if (!subscription) {
        return [
          {
            name: 'Sem assinatura ativa',
            quantityUsed: 0,
            limit: 0,
            remaining: 0,
            description: 'O usuário ainda não possui uma assinatura ativa',
            isUnlimited: false,
          },
        ];
      }

      const featureUsageUser = await this.featureUsageRepository.find({
        where: { subscriptionId: subscription.id },
        relations: ['feature'],
      });

      const benefits = subscription.plan.featureLimits.map((limit) => {
        const usage = featureUsageUser.find(
          (u) => u.featureId === limit.featureId,
        ) || {
          quantityUsed: 0,
          feature: limit.feature,
        };

        return {
          name: limit.feature.name,
          quantityUsed: usage.quantityUsed,
          limit: limit.monthlyLimit,
          remaining:
            limit.monthlyLimit !== null
              ? Math.max(0, limit.monthlyLimit - usage.quantityUsed)
              : null,
          description: limit.feature.description,
          isUnlimited: limit.monthlyLimit === null,
        };
      });

      return benefits;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro ao buscar benefícios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async registerContactCompany(
    dto: ContactCompanyRegisterDto,
    userId: string,
  ): Promise<AuthResponseRegisterDto> {
    const { email, cpf, password, ...rest } = dto;

    const subscription = await this.subscriptionCompanyRepository.findOne({
      where: { companyId: userId },
      relations: ['plan', 'plan.featureLimits', 'plan.featureLimits.feature'],
    });
    if (!subscription || subscription.status !== 1) {
      throw new HttpException(
        'Empresa sem assinatura ativa',
        HttpStatus.FORBIDDEN,
      );
    }

    const contactFeature = subscription.plan.featureLimits.find(
      (f) => f.feature.name === 'contact_company',
    );
    if (!contactFeature) {
      throw new HttpException(
        'Plano não permite cadastro de contatos administrativos',
        HttpStatus.FORBIDDEN,
      );
    }

    const totalContacts = await this.contactCompanyRepository.count({
      where: { companyId: userId, isActive: true },
    });
    if (
      contactFeature.monthlyLimit !== null &&
      totalContacts >= contactFeature.monthlyLimit
    ) {
      throw new HttpException(
        'Limite de contatos administrativos atingido',
        HttpStatus.FORBIDDEN,
      );
    }
    const exists = await this.contactCompanyRepository.findOne({
      where: [{ email }, { cpf }],
    });
    if (exists) {
      throw new HttpException('Contato já cadastrado', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const contact = this.contactCompanyRepository.create({
      ...rest,
      email,
      cpf,
      password: hashedPassword,
      companyId: userId,
      isActive: true,
    });
    await this.contactCompanyRepository.save(contact);
    if (contactFeature.monthlyLimit !== null) {
      const usage = await this.featureUsageRepository.findOne({
        where: {
          subscriptionId: subscription.id,
          featureId: contactFeature.feature.id,
        },
      });
      if (usage) {
        usage.quantityUsed -= 1;
        await this.featureUsageRepository.save(usage);
      }
    }
    await this.featureLogsRepository.save({
      subscriptionId: subscription.id,
      featureId: contactFeature.feature.id,
      quantityChange: 1,
      metadata: { contactId: contact.id },
      relatedEntityId: contact.id,
      description: `Cadastro de contato administrativo (${email})`,
      performedById: userId,
      performedByType: 'USER',
    });
    return { message: 'Contato cadastrado com sucesso' };
  }

  async loginContactCompany(
    dto: ContactCompanyLoginDto,
  ): Promise<AuthResponseDto & { company: boolean }> {
    const { email, password } = dto;
    const contact = await this.contactCompanyRepository.findOne({
      where: { email },
      relations: ['company'],
    });
    if (!contact) {
      throw new HttpException('Contato não encontrado', HttpStatus.BAD_REQUEST);
    }
    if (!contact.isActive) {
      throw new HttpException('Cadastro inativo', HttpStatus.BAD_REQUEST);
    }
    const isPasswordValid = await bcrypt.compare(password, contact.password);
    if (!isPasswordValid) {
      throw new HttpException('Dados inválidos', HttpStatus.BAD_REQUEST);
    }

    const payload = { username: contact.company.cnpj, sub: contact.companyId };
    const token = await this.generateJwt(payload);
    return { access_token: token, company: false };
  }
}
