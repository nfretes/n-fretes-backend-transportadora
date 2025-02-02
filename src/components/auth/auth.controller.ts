import { Body, Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/Login.dto';
import { AuthResponseDto, AuthResponseRegisterDto } from './dto/Auth.dto';
import { EmailJson } from './interfaces/IAuth';
import {
  AuthcodeEmail,
  NotFoundUser,
  recoveryPasswordAndCode,
  ResponseAuthMe,
  ResponseAuthMeTokenInvalid,
} from 'src/common/auth-swagger/auth-swagger';
import { ResetPasswordDto } from './dto/Password.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { Company } from '@entities/company.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao registrar o usuário, como CPF já registrado',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<AuthResponseRegisterDto> {
    return this.authService.register(registerDto);
  }

  /********************************************************************************** */

  @Post('login')
  @ApiOperation({ summary: 'Realizar login do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: any,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginDto, req.ip);
  }

  /********************************************************************************** */

  @ApiOperation({
    summary: 'Chega um código de verificação',
    description: 'Chega um código de verificação para troca de senha',
  })
  @ApiBody(AuthcodeEmail)
  @ApiResponse({
    status: 201,
    description: 'Email enviado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Não encontramos usuário em nossa base de dados',
  })
  @Post('send-recovery-code')
  async sendRecoveryCode(@Body() email: EmailJson) {
    return this.authService.generateRecoveryCodeAndSendEmail(email);
  }

  /********************************************************************************** */

  @ApiOperation({
    summary: 'Troca de senha',
    description: 'Troca de senha depois da validação do COD enviado no email',
  })
  @ApiResponse({
    status: 201,
    description: 'Senha alterada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Não encontramos usuário em nossa base de dados',
  })
  @ApiBody(recoveryPasswordAndCode)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.changePasswordByRecoveryCode(resetPasswordDto);
  }

  /********************************************************************************** */

   @UseGuards(JwtAuthGuard)
   @Get('me')
   @ApiOperation({ summary: 'Obter informações do usuário autenticado' })
   @ApiResponse(ResponseAuthMe)
   @ApiResponse(ResponseAuthMeTokenInvalid)
   @ApiResponse(NotFoundUser)
   async getProfile(
     @Headers('authorization') authHeader: string,
   ): Promise<Company> {
     const token = authHeader.replace('Bearer ', '');
     return this.authService.getUserByToken(token);
   }
}
