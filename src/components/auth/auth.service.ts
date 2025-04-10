import * as bcrypt from 'bcrypt';
import { Like, Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthResponseDto, AuthResponseRegisterDto } from './dto/Auth.dto';
import { LoginDto } from './dto/Login.dto';
import { ChangePasswordDto, ResetPasswordDto } from './dto/Password.dto';
import * as jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import { EmailJson } from './interfaces/IAuth';
import { Company } from '@entities/company.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private configService: ConfigService,
  ) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  private generateRecoveryCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

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

  async generateRecoveryCodeAndSendEmail(
    emailJson: EmailJson,
  ): Promise<{ status: boolean; message: string }> {
    try {
      const { email } = emailJson;

      const user = await this.companyRepository.findOne({
        where: { email: Like(`%${email}%`) },
        select: ['name'],
      });

      if (!user) {
        throw new HttpException(
          'Usuário não encontrado em nossa base de dados',
          HttpStatus.NOT_FOUND,
        );
      }

      const { name } = user;

      const recoveryCode = this.generateRecoveryCode();
      const redisKey = `recoveryCode:${email}`;

      const msg = {
        to: email,
        from: 'thiagolimadesenvolvedor@gmail.com',
        subject: 'Código de recuperação de senha',
        text: `Seu código de recuperação de senha é: ${recoveryCode}`,
        html: `<p>Olá <strong>${name}</strong>, seu código de recuperação de senha é: <strong>${recoveryCode}</strong></p>`,
      };
      await sgMail.send(msg);

      return {
        status: true,
        message: 'Email enviado com sucesso',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async validateRecoveryCode(email: string, code: string): Promise<boolean> {
    const redisKey = `recoveryCode:${email}`;


    return true;
  }

  async changePasswordByRecoveryCode(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email, newPassword } = resetPasswordDto;
    const user = await this.companyRepository.findOne({ where: { email } });

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
          'number'
        ],
        relations: [
          'freights',
          'subscription',
          'subscription.plan',
          'contacts',
          'CompanyUsersContacts',
          'creditCard'
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
}
