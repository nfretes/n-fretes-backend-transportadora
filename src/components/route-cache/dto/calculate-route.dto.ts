import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNumberString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateRouteDto {
  @ApiProperty({
    description: 'Cidade de origem com estado',
    example: 'Uberlândia, MG',
  })
  @IsString()
  @IsNotEmpty()
  originCity: string;

  @ApiProperty({
    description: 'Cidade de destino com estado',
    example: 'São Paulo, SP',
  })
  @IsString()
  @IsNotEmpty()
  destinationCity: string;

  @ApiPropertyOptional({
    description: 'Quantidade de eixos do veículo (1-9). Padrão: 2',
    example: 2,
    minimum: 1,
    maximum: 9,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  axis?: number;

  @ApiPropertyOptional({
    description: 'Preço do combustível em R$. Padrão: "6.20"',
    example: '6.20',
  })
  @IsOptional()
  @IsNumberString()
  fuelPrice?: string;

  @ApiPropertyOptional({
    description: 'Consumo do veículo em km/L. Padrão: "10.0"',
    example: '10.0',
  })
  @IsOptional()
  @IsNumberString()
  kmPerLiter?: string;

  @ApiPropertyOptional({
    description: 'Tipo de rota: "efficient" ou "fastest". Padrão: "efficient"',
    example: 'efficient',
    enum: ['efficient', 'fastest'],
  })
  @IsOptional()
  @IsString()
  routeType?: string;
}
