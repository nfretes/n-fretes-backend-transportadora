import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DistanceService } from './distance.service';

@ApiTags('Distance - Cálculo de Distância')
@Controller('distance')
export class DistanceController {
  constructor(private readonly distanceService: DistanceService) {}

  @Get('by-cities')
  @ApiOperation({
    summary: 'Calcular distância rodoviária entre cidades',
    description:
      'Retorna a distância real de estrada (km) e duração estimada (minutos) entre duas cidades. ' +
      'Usa a Google Distance Matrix API. Aceita nomes de cidades com ou sem estado.',
  })
  @ApiQuery({
    name: 'originCity',
    description: 'Cidade de origem',
    example: 'Uberlândia, MG',
  })
  @ApiQuery({
    name: 'destinationCity',
    description: 'Cidade de destino',
    example: 'São Paulo, SP',
  })
  @ApiResponse({
    status: 200,
    description: 'Distância calculada com sucesso',
    schema: {
      example: {
        originCity: 'Uberlândia, MG',
        destinationCity: 'São Paulo, SP',
        distanceKm: 543,
        durationMinutes: 360,
        status: 'OK',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Cidades inválidas ou não encontradas' })
  async distanceByCities(
    @Query('originCity') originCity: string,
    @Query('destinationCity') destinationCity: string,
  ) {
    return this.distanceService.calculateDistanceByCities(originCity, destinationCity);
  }
}
