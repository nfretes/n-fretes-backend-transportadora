import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExternalAuthService } from '../services/external-auth.service';
import {
  ExternalLoginDto,
  ExternalLoginResponseDto,
} from '../dto/auth-external.dto';

@ApiTags('External API - Authentication')
@Controller('external/auth')
export class ExternalAuthController {
  constructor(private readonly externalAuthService: ExternalAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login para API externa',
    description:
      'Autentica usuário e retorna token JWT válido por 30 minutos para acesso à API de fretes',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: ExternalLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Credenciais inválidas' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async login(
    @Body() loginDto: ExternalLoginDto,
  ): Promise<ExternalLoginResponseDto> {
    return this.externalAuthService.login(loginDto);
  }
}
