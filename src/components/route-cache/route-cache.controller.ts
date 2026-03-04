import { Controller, Get, Post, Put, Body, Query, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RouteCacheService } from './route-cache.service';
import { GetRouteCacheQueryDto } from './dto/get-route-cache.dto';
import { CreateUpdateRouteCacheDto } from './dto/create-update-route-cache.dto';
import { RouteCacheResponseDto, SaveRouteCacheResponseDto } from './dto/route-cache-response.dto';
import { CalculateRouteDto } from './dto/calculate-route.dto';

@ApiTags('Route Cache - Cache de Rotas e Pedágios')
@Controller('route-cache')
export class RouteCacheController {
  constructor(private readonly routeCacheService: RouteCacheService) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar dados de rota em cache',
    description:
      'Busca dados de pedágios e informações de rota previamente calculados. ' +
      'O cache é válido por 20 dias. Se o cache estiver expirado ou não existir, retorna status 404. ' +
      'Use este endpoint antes de fazer cálculos de rota para economizar processamento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de rota encontrados em cache e ainda válidos',
    type: RouteCacheResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cache não encontrado ou expirado (mais de 20 dias)',
  })
  async getRouteCache(
    @Query() query: GetRouteCacheQueryDto,
  ): Promise<RouteCacheResponseDto> {
    const result = await this.routeCacheService.getRouteCache(
      query.originCity,
      query.destinationCity,
    );

    if (!result) {
      throw new Error(
        'Cache não encontrado ou expirado. Calcule novamente a rota.',
      );
    }

    return result;
  }

  @Post('calculate')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Calcular rota com cache inteligente',
    description:
      'Busca dados de rota no cache (válido por 20 dias). ' +
      'Se não encontrar ou estiver expirado, chama a API QUALP, salva o resultado e retorna. ' +
      'Endpoints preferível para uso no front-end.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de rota (do cache ou recém calculados pela API QUALP)',
    type: RouteCacheResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 500, description: 'Erro na API QUALP' })
  async calculateRoute(
    @Body() dto: CalculateRouteDto,
  ): Promise<RouteCacheResponseDto> {
    return this.routeCacheService.calculateOrGetCached(dto);
  }

  @Post()
  @ApiOperation({
    summary: 'Salvar dados de rota em cache',
    description:
      'Salva dados calculados de rota (pedágios, distância, duração, etc.) em cache. ' +
      'Se já existir um cache para a mesma rota, cria um novo registro. ' +
      'O cache será válido por 20 dias.',
  })
  @ApiResponse({
    status: 201,
    description: 'Dados salvos com sucesso',
    type: SaveRouteCacheResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async createRouteCache(
    @Body() data: CreateUpdateRouteCacheDto,
  ): Promise<SaveRouteCacheResponseDto> {
    return this.routeCacheService.saveOrUpdateRouteCache(data);
  }

  @Put()
  @ApiOperation({
    summary: 'Atualizar dados de rota em cache',
    description:
      'Atualiza dados de rota existentes ou cria um novo cache se não existir. ' +
      'Use este endpoint quando recalcular uma rota após 20 dias ou quando os dados mudarem. ' +
      'Reseta a data de criação do cache.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados atualizados com sucesso',
    type: SaveRouteCacheResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async updateRouteCache(
    @Body() data: CreateUpdateRouteCacheDto,
  ): Promise<SaveRouteCacheResponseDto> {
    return this.routeCacheService.saveOrUpdateRouteCache(data);
  }
}
