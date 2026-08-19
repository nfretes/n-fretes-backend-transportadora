import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsUUID, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SdrPostHistoryQueryDto {
  @ApiProperty({
    description: 'Identificador único da empresa para filtrar o histórico de fretes',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  companyId: string;

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
    description: 'Data inicial para filtrar fretes por data de postagem (formato: YYYY-MM-DD)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data final para filtrar fretes por data de postagem (formato: YYYY-MM-DD)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SdrFreightRouteDto {
  @ApiProperty({
    description: 'Cidade de origem do frete',
    example: 'São Paulo',
    nullable: true,
  })
  originCity: string | null;

  @ApiProperty({
    description: 'Estado de origem do frete',
    example: 'SP',
    nullable: true,
  })
  originState: string | null;

  @ApiProperty({
    description: 'Cidade de destino do frete',
    example: 'Rio de Janeiro',
    nullable: true,
  })
  destinyCity: string | null;

  @ApiProperty({
    description: 'Estado de destino do frete',
    example: 'RJ',
    nullable: true,
  })
  destinyState: string | null;

  @ApiProperty({
    description: 'Distância calculada em quilômetros',
    example: '429',
    nullable: true,
  })
  distance: string | null;
}

export class SdrFreightPostDto {
  @ApiProperty({
    description: 'Identificador único do frete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Informações da rota do frete',
    type: SdrFreightRouteDto,
  })
  route: SdrFreightRouteDto;

  @ApiProperty({
    description: 'Tipos de veículos aceitos para o frete',
    example: ['Caminhão', 'Carreta'],
    isArray: true,
    nullable: true,
  })
  vehicleTypes: string[] | null;

  @ApiProperty({
    description: 'Tipos de carroceria aceitos para o frete',
    example: ['Baú', 'Sider'],
    isArray: true,
    nullable: true,
  })
  bodyTypes: string[] | null;

  @ApiProperty({
    description: 'Data de coleta/origem do frete',
    example: '2025-03-15T08:00:00.000Z',
    nullable: true,
  })
  dateOrigin: Date | null;

  @ApiProperty({
    description: 'Data de entrega/destino do frete',
    example: '2025-03-17T18:00:00.000Z',
    nullable: true,
  })
  dateReceiver: Date | null;

  @ApiProperty({
    description: 'Tipo de carga (Completa, Fracionada, etc)',
    example: 'Completa',
    nullable: true,
  })
  typeOfLoad: string | null;

  @ApiProperty({
    description: 'Espécie da carga (Granel, Container, etc)',
    example: 'Granel',
    nullable: true,
  })
  specieOfLoad: string | null;

  @ApiProperty({
    description: 'Produto transportado',
    example: 'Soja em grãos',
    nullable: true,
  })
  product: string | null;

  @ApiProperty({
    description: 'Peso da carga',
    example: '30000',
    nullable: true,
  })
  weightOfLoad: string | null;

  @ApiProperty({
    description: 'Valor do frete',
    example: 15000.50,
    nullable: true,
  })
  valueFreight: number | null;

  @ApiProperty({
    description: 'Data de criação do frete no sistema',
    example: '2025-03-01T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do frete',
    example: '2025-03-01T14:20:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Indica se o frete está ativo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indica se o frete está aceitando solicitações',
    example: true,
  })
  openSolicitations: boolean;
}

export class SdrPostHistoryResponseDto {
  @ApiProperty({
    description: 'Lista de fretes postados pela empresa',
    type: [SdrFreightPostDto],
  })
  data: SdrFreightPostDto[];

  @ApiProperty({
    description: 'Total de fretes encontrados para a empresa',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Quantidade de registros por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas disponíveis',
    example: 15,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Identificador único da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId: string;

  @ApiProperty({
    description: 'Nome da empresa (razão social)',
    example: 'Transportadora ABC Ltda',
  })
  companyName: string;

  @ApiProperty({
    description: 'Nome fantasia da empresa',
    example: 'ABC Transportes',
  })
  companyFantasyName: string;
}
