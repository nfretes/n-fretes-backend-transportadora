import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersDrive } from '@entities/users-drive.entity';
import {
  ExternalLoginDto,
  ExternalLoginResponseDto,
} from '../dto/auth-external.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ExternalAuthService {
  constructor(
    @InjectRepository(UsersDrive)
    private usersDriveRepository: Repository<UsersDrive>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: ExternalLoginDto): Promise<ExternalLoginResponseDto> {
    try {
      const { email, password } = loginDto;
      const user = await this.usersDriveRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        type: 'external_api',
      };

      const access_token = this.jwtService.sign(payload, {
        expiresIn: '30m',
      });

      return {
        access_token,
        expires_in: 1800,
        token_type: 'Bearer',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('Erro no login da API externa:', error);
      throw new HttpException(
        'Erro interno do servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateUser(userId: string): Promise<UsersDrive> {
    const user = await this.usersDriveRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}
