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
  ) {}

  async generateJwt(payload: any) {
    const secret = this.configService.get<string>('JWT_SECRET');
    const expiration = this.configService.get<string>('JWT_EXPIRATION') || '2h';
    return jwt.sign(payload, secret, { expiresIn: '2h' });
  }

  async register(registerDto: any): Promise<AuthResponseRegisterDto> {
    try {
      const { cnpj, password, name, ...userData } = registerDto;

      const existingUser = await this.companyRepository.findOne({
        where: { cnpj },
      });
      if (existingUser) {
        throw new HttpException('CNPJ já cadastrado', HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = this.companyRepository.create({
        ...userData,

        cnpj,

        password: hashedPassword,
      });

      await this.companyRepository.save(newUser);

      return { message: 'Cadastro enviado para análise' };
    } catch (error) {
      console.log(error, 'Resposta');
      throw new HttpException(
        error?.message || 'Erro interno no servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginDto: LoginDto, ip: string): Promise<AuthResponseDto> {
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

    return { access_token: token };
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
        ],
        relations: [
          'freights',
          'subscription',
          'subscription.plan',
          'contacts',
          'CompanyUsersContacts',
          'creditCard',
        ],
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
      relations: ['plan', 'plan.featureLimits', 'plan.featureLimits.feature']
    });

    if (!subscription) {
      return [
        {
          name: 'Sem assinatura ativa',
          quantityUsed: 0,
          limit: 0,
          remaining: 0,
          description: 'O usuário ainda não possui uma assinatura ativa',
          isUnlimited: false
        }
      ];
    }

   
    const featureUsageUser = await this.featureUsageRepository.find({
      where: { subscriptionId: subscription.id },
      relations: ['feature']
    });


    const benefits = subscription.plan.featureLimits.map(limit => {
      const usage = featureUsageUser.find(u => u.featureId === limit.featureId) || {
        quantityUsed: 0,
        feature: limit.feature
      };

      return {
        name: limit.feature.name,
        quantityUsed: usage.quantityUsed,
        limit: limit.monthlyLimit,
        remaining: limit.monthlyLimit !== null 
          ? Math.max(0, limit.monthlyLimit - usage.quantityUsed)
          : null,
        description: limit.feature.description,
        isUnlimited: limit.monthlyLimit === null
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
}
