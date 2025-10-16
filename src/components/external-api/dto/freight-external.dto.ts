import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FreightQueryDto {
  @ApiProperty({
    description: 'Número da página',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filtrar por cidade de origem',
    example: 'São Paulo',
    required: false,
  })
  @IsOptional()
  @IsString()
  originCity?: string;

  @ApiProperty({
    description: 'Filtrar por cidade de destino',
    example: 'Rio de Janeiro',
    required: false,
  })
  @IsOptional()
  @IsString()
  destinyCity?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de carga',
    example: 'Granel',
    required: false,
  })
  @IsOptional()
  @IsString()
  specieOfLoad?: string;
}

export class FreightDataDto {
  @ApiProperty({
    description: 'ID do frete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Cidade de origem',
    example: 'São Paulo',
  })
  originCity: string;

  @ApiProperty({
    description: 'Estado de origem',
    example: 'SP',
  })
  originState: string;

  @ApiProperty({
    description: 'Cidade de destino',
    example: 'Rio de Janeiro',
  })
  destinyCity: string;

  @ApiProperty({
    description: 'Estado de destino',
    example: 'RJ',
  })
  destinyState: string;

  @ApiProperty({
    description: 'Data de coleta',
    example: '2025-10-20T08:00:00.000Z',
  })
  dateOrigin: Date;

  @ApiProperty({
    description: 'Data de entrega',
    example: '2025-10-22T18:00:00.000Z',
  })
  dateReceiver: Date;

  @ApiProperty({
    description: 'Tipo de carregamento',
    example: 'Completa',
  })
  typeOfLoad: string;

  @ApiProperty({
    description: 'Espécie da carga',
    example: 'Granel',
  })
  specieOfLoad: string;

  @ApiProperty({
    description: 'Peso total da carga',
    example: '30000',
  })
  weightOfLoad: string;

  @ApiProperty({
    description: 'Valor do frete',
    example: 15000.5,
  })
  valueFreight: number;

  @ApiProperty({
    description: 'Cálculo do valor',
    example: 'Por toneladas',
  })
  valueCall: string;

  @ApiProperty({
    description: 'Data de cadastro',
    example: '2025-10-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Produto/mercadoria',
    example: 'Soja em grãos',
  })
  product: string;

  @ApiProperty({
    description: 'Distância em km',
    example: '429',
  })
  distance: string;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-10-16T14:20:00.000Z',
  })
  updatedAt: Date;
}

export class FreightListResponseDto {
  @ApiProperty({
    description: 'Lista de fretes',
    type: [FreightDataDto],
  })
  data: FreightDataDto[];

  @ApiProperty({
    description: 'Total de registros',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Itens por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 15,
  })
  totalPages: number;
}
