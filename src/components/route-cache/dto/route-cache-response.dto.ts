import { ApiProperty } from '@nestjs/swagger';
import {
  TollDataDto,
  RouteCoordinatesDto,
} from './create-update-route-cache.dto';

export class RouteCacheResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [TollDataDto] })
  tolls: TollDataDto[];

  @ApiProperty({ example: 274.3 })
  totalToll: number;

  @ApiProperty({ example: 607 })
  distance: number;

  @ApiProperty({ example: '607 km' })
  distanceText: string;

  @ApiProperty({ example: '05:53:42' })
  duration: string;

  @ApiProperty({ example: 376.34 })
  fuelConsumption: number;

  @ApiProperty({ type: RouteCoordinatesDto })
  coordinates: RouteCoordinatesDto;

  @ApiProperty({
    example: '2026-03-03T12:00:00.000Z',
    description: 'Data de criação do cache',
  })
  cachedAt?: Date;

  @ApiProperty({
    example: true,
    description: 'Indica se o cache ainda é válido (menos de 20 dias)',
  })
  isValid?: boolean;
}

export class SaveRouteCacheResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Dados de rota salvos com sucesso' })
  message: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;
}
