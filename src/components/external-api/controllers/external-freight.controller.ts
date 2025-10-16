import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ExternalFreightService } from '../services/external-freight.service';
import { ExternalApiGuard } from '../guards/external-api.guard';
import {
  FreightQueryDto,
  FreightListResponseDto,
  FreightDataDto,
} from '../dto/freight-external.dto';

@ApiTags('External API - Freights')
@Controller('external/freights')
@UseGuards(ExternalApiGuard)
@ApiBearerAuth()
export class ExternalFreightController {
  constructor(
    private readonly externalFreightService: ExternalFreightService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar dados de cargas',
    description:
      'Consulta via API com token de acesso para buscar dados de cargas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de fretes com paginação',
    type: FreightListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Token expirado' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async getFreights(
    @Query() queryDto: FreightQueryDto,
  ): Promise<FreightListResponseDto> {
    return this.externalFreightService.getFreights(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar frete por ID',
    description:
      'Retorna os dados completos de um frete específico pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do frete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do frete',
    type: FreightDataDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Frete não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async getFreightById(@Param('id') id: string): Promise<FreightDataDto> {
    return this.externalFreightService.getFreightById(id);
  }
}
