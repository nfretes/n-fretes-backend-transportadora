import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsEnum, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum PostingPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class SdrPostingFrequencyQueryDto {
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
    description: 'Período de análise: daily (diário), weekly (semanal), monthly (mensal)',
    example: 'weekly',
    enum: PostingPeriod,
    default: PostingPeriod.WEEKLY,
    required: false,
  })
  @IsOptional()
  @IsEnum(PostingPeriod)
  period?: PostingPeriod = PostingPeriod.WEEKLY;

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

export class SdrCompanyPostingFrequencyDto {
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
    description: 'Total de fretes publicados',
    example: 150,
  })
  totalFreights: number;

  @ApiProperty({
    description: 'Média de fretes por dia',
    example: 2.5,
  })
  averagePerDay: number;

  @ApiProperty({
    description: 'Média de fretes por semana',
    example: 17.5,
  })
  averagePerWeek: number;

  @ApiProperty({
    description: 'Média de fretes por mês',
    example: 75,
  })
  averagePerMonth: number;

  @ApiProperty({
    description: 'Data do primeiro frete publicado',
    example: '2025-01-15T14:30:00.000Z',
    nullable: true,
  })
  firstFreightDate: Date | null;

  @ApiProperty({
    description: 'Data do último frete publicado',
    example: '2025-02-28T16:45:00.000Z',
    nullable: true,
  })
  lastFreightDate: Date | null;

  @ApiProperty({
    description: 'Dias de atividade (entre primeiro e último frete)',
    example: 44,
  })
  activeDays: number;

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
    description: 'Nível de atividade: ALTO (>10/semana), MÉDIO (3-10/semana), BAIXO (<3/semana), INATIVO',
    example: 'ALTO',
    enum: ['ALTO', 'MÉDIO', 'BAIXO', 'INATIVO'],
  })
  activityLevel: 'ALTO' | 'MÉDIO' | 'BAIXO' | 'INATIVO';
}

export class SdrPostingFrequencyResponseDto {
  @ApiProperty({
    description: 'Lista de empresas com análise de frequência de publicação',
    type: [SdrCompanyPostingFrequencyDto],
  })
  data: SdrCompanyPostingFrequencyDto[];

  @ApiProperty({
    description: 'Total de empresas analisadas',
    example: 85,
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
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Total de fretes publicados por todas as empresas',
    example: 3500,
  })
  totalFreightsAllCompanies: number;

  @ApiProperty({
    description: 'Média geral de fretes por dia',
    example: 25.5,
  })
  overallAveragePerDay: number;

  @ApiProperty({
    description: 'Média geral de fretes por semana',
    example: 178.5,
  })
  overallAveragePerWeek: number;

  @ApiProperty({
    description: 'Média geral de fretes por mês',
    example: 775,
  })
  overallAveragePerMonth: number;

  @ApiProperty({
    description: 'Empresas com alta atividade',
    example: 25,
  })
  highActivity: number;

  @ApiProperty({
    description: 'Empresas com média atividade',
    example: 40,
  })
  mediumActivity: number;

  @ApiProperty({
    description: 'Empresas com baixa atividade',
    example: 15,
  })
  lowActivity: number;

  @ApiProperty({
    description: 'Empresas inativas (sem publicações)',
    example: 5,
  })
  inactive: number;
}
