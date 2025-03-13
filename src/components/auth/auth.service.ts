import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthResponseDto, AuthResponseRegisterDto } from './dto/Auth.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/Login.dto';
import { ChangePasswordDto, ResetPasswordDto } from './dto/Password.dto';
import { Admin } from '@entities/admin-users.entity';
import { AdminRole } from 'src/enum/admin';
import * as jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import { RedisService } from 'src/libs/redisClient';
import { EmailJson } from './interfaces/IAuth';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private configService: ConfigService,
    private redisService: RedisService, // Adicionado para recuperação de senha
  ) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  private async generateJwt(payload: any): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET');
    const expiration = this.configService.get<string>('JWT_EXPIRATION') || '2h';
    return jwt.sign(payload, secret, { expiresIn: expiration });
  }

  private generateRecoveryCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseRegisterDto> {
    try {
      const { cpf, password, name, email, phoneNumber, photoUrl, isActive, birthDate } = registerDto;

      const existingAdmin = await this.adminRepository.findOne({ where: { cpf } });
      if (existingAdmin) {
        throw new HttpException('CPF já cadastrado', HttpStatus.BAD_REQUEST);
      }

      const existingAdminEmail = await this.adminRepository.findOne({ where: { email } });
      if (existingAdminEmail) {
        throw new HttpException('Email já cadastrado', HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      if (isActive) {
        const newAdmin = this.adminRepository.create({
          cpf,
          name,
          email,
          phoneNumber,
          photoUrl,
          password: hashedPassword,
          role: AdminRole.ADMIN,
          birthDate: birthDate || new Date('1990-01-01'),
          isActive: true,
          lastAccess: null,
        });
        await this.adminRepository.save(newAdmin);
        return { message: 'Administrador cadastrado com sucesso' };
      } else {
        throw new HttpException('Somente administradores podem ser cadastrados aqui', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error, 'Resposta');
      if (error.code === '23505') {
        throw new HttpException('CPF ou Email já cadastrado', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        error?.message || 'Erro interno no servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginDto: LoginDto, ip: string): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.adminRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST);
    }

    if (!user.isActive) {
      throw new HttpException('Usuário inativo', HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Dados inválidos', HttpStatus.BAD_REQUEST);
    }

    user.lastAccess = new Date();
    await this.adminRepository.save(user);

    const payload = {
      username: user.cpf,
      sub: user.id,
      role: user.role,
    };
    const token = await this.generateJwt(payload);

    return { access_token: token };
  }

  async generateRecoveryCodeAndSendEmail(emailJson: EmailJson): Promise<{ status: boolean; message: string }> {
    try {
      const { email } = emailJson;

      const user = await this.adminRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException('Usuário não encontrado em nossa base de dados', HttpStatus.NOT_FOUND);
      }

      const recoveryCode = this.generateRecoveryCode();
      const redisKey = `recoveryCode:${email}`;
      const redisClient = this.redisService.getClient();
      await redisClient.set(redisKey, recoveryCode, 'EX', 180);

      const msg = {
        to: email,
        from: 'thiagolimadesenvolvedor@gmail.com',
        subject: 'Código de recuperação de senha',
        text: `Seu código de recuperação de senha é: ${recoveryCode}`,
        html: `<p>Olá <strong>${user.name}</strong>, seu código de recuperação de senha é: <strong>${recoveryCode}</strong></p>`,
      };
      await sgMail.send(msg);

      return { status: true, message: 'Email enviado com sucesso' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async changePasswordByRecoveryCode(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, newPassword } = resetPasswordDto;

    const user = await this.adminRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await this.adminRepository.save(user);

    return { message: 'Senha alterada com sucesso' };
  }

  async getUserByToken(token: string): Promise<Admin> { // Alterado para retornar Admin
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const decoded = jwt.verify(token, secret) as { sub: string };

      const user = await this.adminRepository.findOne({ where: { id: decoded.sub } });
      if (!user) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    try {
      const { oldPassword, newPassword } = changePasswordDto;

      const user = await this.adminRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }

      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new HttpException('Senha antiga inválida', HttpStatus.BAD_REQUEST);
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await this.adminRepository.save(user);

      return { message: 'Senha alterada com sucesso' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}