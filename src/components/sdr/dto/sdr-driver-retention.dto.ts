import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class SdrDriverRetentionRiskQueryDto {
  @ApiProperty({
    description:
      'Número mínimo de dias desde o cadastro para considerar o motorista em análise',
    example: 30,
    default: 7,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  min_days_since_signup?: number = 7;

  @ApiProperty({
    description:
      'Filtrar apenas motoristas que nunca fizeram solicitações de fretes',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  never_requested?: boolean = false;

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
}

export class SdrDriverVehicleDto {
  @ApiProperty({
    description: 'Identificador único do veículo',
    example: 'veh12345-6789-0abc-defg-hijklmnopqrs',
    nullable: true,
  })
  id: string | null;

  @ApiProperty({
    description: 'Tipo de veículo',
    example: 'Caminhão',
    nullable: true,
  })
  vehicleType: string | null;

  @ApiProperty({
    description: 'Tipo de carroceria',
    example: 'Baú',
    nullable: true,
  })
  bodyType: string | null;

  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC-1234',
    nullable: true,
  })
  plateNumber: string | null;

  @ApiProperty({
    description: 'Estado da placa',
    example: 'SP',
    nullable: true,
  })
  plateState: string | null;

  @ApiProperty({
    description: 'Indica se este é o veículo principal do motorista',
    example: true,
  })
  isMainVehicle: boolean;
}

export class SdrDriverRiskDto {
  @ApiProperty({
    description: 'Identificador único do motorista',
    example: 'drv12345-6789-0abc-defg-hijklmnopqrs',
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do motorista',
    example: 'João Pedro Santos',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: 'CPF do motorista',
    example: '123.456.789-00',
    nullable: true,
  })
  cpf: string | null;

  @ApiProperty({
    description: 'Telefone de contato do motorista',
    example: '+55 11 98765-4321',
    nullable: true,
  })
  phoneNumber: string | null;

  @ApiProperty({
    description: 'Email do motorista',
    example: 'joao.santos@email.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Data de cadastro do motorista no sistema',
    example: '2025-01-15T10:30:00.000Z',
  })
  signupDate: Date;

  @ApiProperty({
    description: 'Quantidade de dias desde o cadastro',
    example: 45,
  })
  daysSinceSignup: number;

  @ApiProperty({
    description: 'Lista de veículos cadastrados pelo motorista',
    type: [SdrDriverVehicleDto],
  })
  vehicles: SdrDriverVehicleDto[];

  @ApiProperty({
    description: 'Total de solicitações de fretes realizadas pelo motorista',
    example: 0,
  })
  totalRequests: number;

  @ApiProperty({
    description: 'Indica se o motorista nunca fez solicitações',
    example: true,
  })
  neverRequested: boolean;

  @ApiProperty({
    description: 'Última data de atividade do motorista (última solicitação)',
    example: null,
    nullable: true,
  })
  lastActivityDate: Date | null;

  @ApiProperty({
    description: 'Nível de risco: ALTO (>30 dias sem atividade), MÉDIO (15-30 dias), BAIXO (<15 dias)',
    example: 'ALTO',
    enum: ['ALTO', 'MÉDIO', 'BAIXO'],
  })
  riskLevel: string;
}

export class SdrDriverRetentionRiskResponseDto {
  @ApiProperty({
    description:
      'Lista de motoristas em risco de churn, ordenados pelo tempo sem atividade',
    type: [SdrDriverRiskDto],
  })
  data: SdrDriverRiskDto[];

  @ApiProperty({
    description: 'Total de motoristas em risco encontrados',
    example: 45,
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
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Quantidade de motoristas em risco alto',
    example: 25,
  })
  highRiskCount: number;

  @ApiProperty({
    description: 'Quantidade de motoristas em risco médio',
    example: 15,
  })
  mediumRiskCount: number;

  @ApiProperty({
    description: 'Quantidade de motoristas em risco baixo',
    example: 5,
  })
  lowRiskCount: number;

  @ApiProperty({
    description: 'Quantidade de motoristas que nunca fizeram solicitações',
    example: 30,
  })
  neverRequestedCount: number;

  @ApiProperty({
    description: 'Média de dias desde o cadastro dos motoristas analisados',
    example: 42,
  })
  averageDaysSinceSignup: number;
}
