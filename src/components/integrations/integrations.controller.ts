import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import {
  IntegrationLoginDto,
  IntegrationTokenDto,
  RefreshTokenDto,
} from './dto/integration-auth.dto';
import { CreateIntegrationDto } from './dto/create-integration.dto';

@ApiTags('External API')
@Controller('api/external')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('register')
  @ApiExcludeEndpoint()
  async register(@Body() createDto: CreateIntegrationDto) {
    const integration =
      await this.integrationsService.createIntegration(createDto);

    const { password, refreshToken, ...result } = integration;

    return {
      ...result,
      message: 'Integração criada com sucesso',
    };
  }

  @Post('auth/login')
  @ApiOperation({
    summary: 'Login para integração externa',
    description:
      'Autentica com username e password e retorna JWT token válido por 30 minutos',
  })
  async login(
    @Body() loginDto: IntegrationLoginDto,
  ): Promise<IntegrationTokenDto> {
    return await this.integrationsService.login(loginDto);
  }

  @Post('auth/refresh')
  @ApiOperation({
    summary: 'Renovar access token',
    description: 'Usa o refresh token para gerar um novo access token',
  })
  async refreshToken(
    @Body() refreshDto: RefreshTokenDto,
  ): Promise<IntegrationTokenDto> {
    return await this.integrationsService.refreshToken(refreshDto.refreshToken);
  }

  @Get('driver/status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar status de motorista por CPF',
    description:
      'Endpoint para integração externa consultar se motorista está em rota',
  })
  @ApiQuery({
    name: 'cpf',
    description: 'CPF do motorista (com ou sem formatação)',
    required: true,
  })
  async getDriverStatus(
    @Headers('authorization') authorization: string,
    @Query('cpf') cpf: string,
  ) {
    if (!authorization) {
      throw new HttpException('Token não fornecido', HttpStatus.UNAUTHORIZED);
    }

    if (!cpf) {
      throw new HttpException('CPF não fornecido', HttpStatus.BAD_REQUEST);
    }

    const token = authorization.replace('Bearer ', '');
    await this.integrationsService.validateToken(token);

    return await this.integrationsService.getDriverStatusByCpf(cpf);
  }
}
