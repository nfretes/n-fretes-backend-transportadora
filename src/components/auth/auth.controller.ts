import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/Login.dto';
import { AuthResponseDto, AuthResponseRegisterDto } from './dto/Auth.dto';
import { PhoneJson } from './interfaces/IAuth';
import {
  AuthcodeEmail,
  NotFoundUser,
  recoveryPasswordAndCode,
  ResponseAuthMe,
  ResponseAuthMeTokenInvalid,
} from 'src/common/auth-swagger/auth-swagger';
import { ChangePasswordDto, ResetPasswordDto } from './dto/Password.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { Company } from '@entities/company.entity';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { ContactCompanyRegisterDto, ContactCompanyLoginDto } from './dto/ContactCompanyAuth.dto';

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
  async register(@Body() registerDto: any): Promise<AuthResponseRegisterDto> {
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
  @Post('password/forgot')
  async sendRecoveryCode(@Body() phoneNumber: PhoneJson) {
    return this.authService.generateRecoveryCodeAndSendNumber(phoneNumber);
  }

    @Post('verify-phone')
  async sendCodeVerify(@Body() phoneNumber: PhoneJson) {
    return this.authService.sendCodeVerify(phoneNumber);
  }

  /********************************************************************************** */

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
  @Post('password/code')
  async validateRecoveryCode(@Body() recoveryDto: any) {
    return this.authService.validateRecoveryCode(recoveryDto);
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

  /********************************************************************************** */

  @UseGuards(JwtAuthGuard)
  @Put('/password/reset')
  @ApiOperation({
    summary: 'Troca senha do usuário transportadora logado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao criar a contato da empresa',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUserId() userId: string,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(userId, changePasswordDto);
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
  @Post('password/reset-password')
  async resetPassword(@Body() resetPasswordDto: any) {
    return this.authService.changePasswordByRecoveryCode(resetPasswordDto);
  }

  @Get('beneficits')
  async getBeneficitsUser(@GetUserId() userId: string) {
    return this.authService.getBeneficitsUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('contact-company/register')
  @ApiOperation({ summary: 'Registrar um novo contato administrativo da empresa' })
  @ApiResponse({ status: 201, description: 'Contato registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao registrar o contato' })
  async registerContactCompany(@Body() dto: ContactCompanyRegisterDto, @GetUserId() userId: string) {
    return this.authService.registerContactCompany(dto, userId);
  }

  @Post('contact-company/login')
  @ApiOperation({ summary: 'Login do contato administrativo da empresa' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async loginContactCompany(@Body() dto: ContactCompanyLoginDto) {
    return this.authService.loginContactCompany(dto);
  }
}
