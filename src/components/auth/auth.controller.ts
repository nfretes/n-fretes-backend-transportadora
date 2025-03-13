import { Body, Controller, Get, Headers, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/Login.dto';
import { AuthResponseDto, AuthResponseRegisterDto } from './dto/Auth.dto';
import { EmailJson } from './interfaces/IAuth'; // Mantém como interface
import { ChangePasswordDto, ResetPasswordDto } from './dto/Password.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { Admin } from '@entities/admin-users.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo administrador' })
  @ApiResponse({ status: 201, description: 'Administrador registrado com sucesso', type: AuthResponseRegisterDto })
  @ApiResponse({ status: 400, description: 'Erro ao registrar o administrador, como CPF já registrado' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseRegisterDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Realizar login do administrador' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto, @Req() req: any): Promise<AuthResponseDto> {
    return this.authService.login(loginDto, req.ip);
  }

  @Post('send-recovery-code')
  @ApiOperation({ summary: 'Enviar código de recuperação de senha' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email do usuário',
          example: 'joaoadm@example.com',
        },
      },
      required: ['email'],
    },
  }) // Define o corpo manualmente
  @ApiResponse({ status: 201, description: 'Email enviado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async sendRecoveryCode(@Body() email: EmailJson) { 
    return this.authService.generateRecoveryCodeAndSendEmail(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Redefinir senha com código de recuperação' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 201, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.changePasswordByRecoveryCode(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Obter informações do administrador autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso', type: Admin })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getProfile(@Headers('authorization') authHeader: string): Promise<Admin> {
    const token = authHeader.replace('Bearer ', '');
    return this.authService.getUserByToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/password/reset')
  @ApiOperation({ summary: 'Trocar senha do administrador logado' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao alterar a senha' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUserId() userId: string,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(userId, changePasswordDto);
  }
}