import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SdrMarketHeatmapQueryDto {
  @ApiProperty({
    description: 'Número da página para paginação',
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
    description: 'Quantidade de registros por página (máximo 100)',
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Data inicial para filtrar fretes ativos por data de criação (formato: YYYY-MM-DD)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data final para filtrar fretes ativos por data de criação (formato: YYYY-MM-DD)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SdrRouteHeatmapDto {
  @ApiProperty({
    description: 'Identificador único do frete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  freightId: string;

  @ApiProperty({
    description: 'Cidade de origem da rota',
    example: 'Cuiabá',
  })
  originCity: string;

  @ApiProperty({
    description: 'Estado de origem da rota',
    example: 'MT',
  })
  originState: string;

  @ApiProperty({
    description: 'Cidade de destino da rota',
    example: 'Campo Grande',
  })
  destinyCity: string;

  @ApiProperty({
    description: 'Estado de destino da rota',
    example: 'MS',
  })
  destinyState: string;

  @ApiProperty({
    description: 'Quantidade de motoristas próximos à cidade de origem',
    example: 15,
  })
  driversNearOrigin: number;

  @ApiProperty({
    description: 'Quantidade de motoristas próximos à cidade de destino',
    example: 8,
  })
  driversNearDestiny: number;

  @ApiProperty({
    description: 'Total de motoristas que estão na rota ou próximos',
    example: 20,
  })
  totalDriversInRoute: number;

  @ApiProperty({
    description:
      'Nível de oportunidade: ALTO (>15 motoristas), MÉDIO (5-15), BAIXO (<5)',
    example: 'ALTO',
    enum: ['ALTO', 'MÉDIO', 'BAIXO'],
  })
  opportunityLevel: 'ALTO' | 'MÉDIO' | 'BAIXO';

  @ApiProperty({
    description: 'Nome da empresa que postou o frete',
    example: 'Transportadora ABC Ltda',
    nullable: true,
  })
  companyName: string | null;

  @ApiProperty({
    description: 'Nome fantasia da empresa',
    example: 'ABC Transportes',
    nullable: true,
  })
  companyFantasyName: string | null;

  @ApiProperty({
    description: 'Valor do frete',
    example: 15000.5,
    nullable: true,
  })
  freightValue: number | null;

  @ApiProperty({
    description: 'Produto a ser transportado',
    example: 'Soja em grãos',
    nullable: true,
  })
  product: string | null;

  @ApiProperty({
    description: 'Data de criação do frete',
    example: '2025-03-01T10:30:00.000Z',
  })
  freightCreatedAt: Date;
}

export class SdrMarketHeatmapResponseDto {
  @ApiProperty({
    description:
      'Lista de rotas com densidade de motoristas, ordenada pela maior quantidade de motoristas',
    type: [SdrRouteHeatmapDto],
  })
  data: SdrRouteHeatmapDto[];

  @ApiProperty({
    description: 'Total de rotas ativas analisadas',
    example: 75,
  })
  total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Quantidade de registros por página',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas disponíveis',
    example: 4,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Média de motoristas por rota',
    example: 8,
  })
  averageDriversPerRoute: number;
}
