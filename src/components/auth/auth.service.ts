import * as bcrypt from 'bcrypt';
import { Like, Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthResponseDto, AuthResponseRegisterDto } from './dto/Auth.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/Login.dto';
import { ChangePasswordDto, ResetPasswordDto } from './dto/Password.dto';
import * as jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import { RedisService } from 'src/libs/redisClient';
import { EmailJson } from './interfaces/IAuth';
import { Company } from '@entities/company.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  private generateRecoveryCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateJwt(payload: any) {
    const secret = this.configService.get<string>('JWT_SECRET');
    const expiration = this.configService.get<string>('JWT_EXPIRATION') || '2h';
    return jwt.sign(payload, secret, { expiresIn: expiration });
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseRegisterDto> {
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

      const msg = {
        to: newUser.email,
        from: 'thiagolimadesenvolvedor@gmail.com',
        subject: 'Cadastro enviado para análise',
        templateId: this.configService.get<string>('TEMPLATE_ID_WELCOME'),
      };

      await sgMail.send(msg);

      return { message: 'Cadastro enviado para análise' };
    } catch (error) {
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
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.companyRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new HttpException('Senha antiga inválida', HttpStatus.BAD_REQUEST);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await this.companyRepository.save(user);
    return {
      message: 'Senha alterada com sucesso',
    };
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
      const redisClient = this.redisService.getClient();
      await redisClient.set(redisKey, recoveryCode, 'EX', 180);

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
    const redisClient = this.redisService.getClient();
    const storedCode = await redisClient.get(redisKey);

    if (!storedCode) {
      throw new HttpException(
        'Código expirado ou inválido',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (storedCode !== code) {
      throw new HttpException('Código inválido', HttpStatus.BAD_REQUEST);
    }
    await redisClient.del(redisKey);
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
}
