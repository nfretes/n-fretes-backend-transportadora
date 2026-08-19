import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SdrFirstFreightAnalysisQueryDto {
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
    description: 'ID da empresa para análise específica (opcional)',
    example: 'cmp12345-6789-0abc-defg-hijklmnopqrs',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({
    description: 'Data inicial para filtrar empresas por data de cadastro (formato: YYYY-MM-DD)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data final para filtrar empresas por data de cadastro (formato: YYYY-MM-DD)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SdrCompanyFirstFreightDto {
  @ApiProperty({
    description: 'Identificador único da empresa',
    example: 'cmp12345-6789-0abc-defg-hijklmnopqrs',
  })
  companyId: string;

  @ApiProperty({
    description: 'Nome da empresa',
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
    description: 'Data de cadastro da empresa',
    example: '2025-01-10T08:00:00.000Z',
  })
  signupDate: Date;

  @ApiProperty({
    description: 'Data do primeiro frete publicado',
    example: '2025-01-15T14:30:00.000Z',
    nullable: true,
  })
  firstFreightDate: Date | null;

  @ApiProperty({
    description: 'Dias entre cadastro e primeira publicação de frete',
    example: 5,
    nullable: true,
  })
  daysToFirstFreight: number | null;

  @ApiProperty({
    description: 'Indica se a empresa já publicou algum frete',
    example: true,
  })
  hasPublished: boolean;

  @ApiProperty({
    description: 'Total de fretes publicados pela empresa',
    example: 45,
  })
  totalFreights: number;

  @ApiProperty({
    description: 'Telefone de contato da empresa',
    example: '+55 11 3456-7890',
    nullable: true,
  })
  phoneNumber: string | null;

  @ApiProperty({
    description: 'Email de contato da empresa',
    example: 'contato@transportadoraabc.com.br',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Status de engajamento: RÁPIDO (<3 dias), MÉDIO (3-7 dias), LENTO (>7 dias), NÃO PUBLICOU',
    example: 'RÁPIDO',
    enum: ['RÁPIDO', 'MÉDIO', 'LENTO', 'NÃO PUBLICOU'],
  })
  engagementSpeed: 'RÁPIDO' | 'MÉDIO' | 'LENTO' | 'NÃO PUBLICOU';
}

export class SdrFirstFreightAnalysisResponseDto {
  @ApiProperty({
    description: 'Lista de empresas com análise de tempo até primeiro frete',
    type: [SdrCompanyFirstFreightDto],
  })
  data: SdrCompanyFirstFreightDto[];

  @ApiProperty({
    description: 'Total de empresas analisadas',
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
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas disponíveis',
    example: 8,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Tempo médio em dias para publicar o primeiro frete',
    example: 6,
  })
  averageDaysToFirstFreight: number;

  @ApiProperty({
    description: 'Total de empresas que ainda não publicaram fretes',
    example: 35,
  })
  companiesNotPublished: number;

  @ApiProperty({
    description: 'Total de empresas com engajamento rápido (<3 dias)',
    example: 45,
  })
  fastEngagement: number;

  @ApiProperty({
    description: 'Total de empresas com engajamento médio (3-7 dias)',
    example: 50,
  })
  mediumEngagement: number;

  @ApiProperty({
    description: 'Total de empresas com engajamento lento (>7 dias)',
    example: 20,
  })
  slowEngagement: number;
}
