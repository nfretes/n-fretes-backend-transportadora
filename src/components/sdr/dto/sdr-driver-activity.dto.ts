import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SdrDriverActivityListQueryDto {
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
}

export class SdrDriverContactDto {
  @ApiProperty({
    description: 'Telefone de contato do motorista',
    example: '+55 11 98765-4321',
    nullable: true,
  })
  phoneNumber: string | null;

  @ApiProperty({
    description: 'Email do motorista',
    example: 'joao.motorista@email.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Indica se o telefone está disponível',
    example: true,
  })
  hasPhone: boolean;

  @ApiProperty({
    description: 'Indica se o email está disponível',
    example: true,
  })
  hasEmail: boolean;
}

export class SdrDriverVehicleSummaryDto {
  @ApiProperty({
    description: 'Tipo do veículo principal',
    example: 'TRUCK',
    nullable: true,
  })
  vehicleType: string | null;

  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC-1234',
    nullable: true,
  })
  plateNumber: string | null;
}

export class SdrDriverActivityDto {
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
    description: 'Data de cadastro do motorista no sistema',
    example: '2025-01-15T10:30:00.000Z',
  })
  signupDate: Date;

  @ApiProperty({
    description: 'Data da primeira ativação/primeira solicitação de frete',
    example: '2025-01-18T14:20:00.000Z',
    nullable: true,
  })
  activationDate: Date | null;

  @ApiProperty({
    description: 'Quantidade de dias entre cadastro e primeira ativação',
    example: 3,
    nullable: true,
  })
  daysToActivation: number | null;

  @ApiProperty({
    description: 'Indica se o motorista já foi ativado (fez pelo menos uma solicitação)',
    example: true,
  })
  isActivated: boolean;

  @ApiProperty({
    description: 'Total de solicitações de fretes realizadas',
    example: 12,
  })
  totalRequests: number;

  @ApiProperty({
    description: 'Data da última atividade do motorista',
    example: '2025-02-28T16:45:00.000Z',
    nullable: true,
  })
  lastActivityDate: Date | null;

  @ApiProperty({
    description: 'Informações do veículo principal',
    type: SdrDriverVehicleSummaryDto,
    nullable: true,
  })
  vehicle: SdrDriverVehicleSummaryDto | null;

  @ApiProperty({
    description: 'Meios de contato disponíveis',
    type: SdrDriverContactDto,
  })
  contact: SdrDriverContactDto;

  @ApiProperty({
    description: 'Cidade da última localização registrada',
    example: 'São Paulo',
    nullable: true,
  })
  lastKnownCity: string | null;

  @ApiProperty({
    description: 'Status de engajamento: ATIVO (ativo nos últimos 30 dias), INATIVO (>30 dias), NOVO (cadastrado há menos de 7 dias)',
    example: 'ATIVO',
    enum: ['ATIVO', 'INATIVO', 'NOVO', 'NÃO ATIVADO'],
  })
  engagementStatus: string;
}

export class SdrDriverActivityListResponseDto {
  @ApiProperty({
    description: 'Lista de motoristas com informações de ativação e contato',
    type: [SdrDriverActivityDto],
  })
  data: SdrDriverActivityDto[];

  @ApiProperty({
    description: 'Total de motoristas cadastrados',
    example: 450,
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
    example: 23,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Total de motoristas ativados',
    example: 320,
  })
  totalActivated: number;

  @ApiProperty({
    description: 'Total de motoristas não ativados',
    example: 130,
  })
  totalNotActivated: number;

  @ApiProperty({
    description: 'Taxa de ativação em porcentagem',
    example: 71.1,
  })
  activationRate: number;

  @ApiProperty({
    description: 'Tempo médio de ativação em dias',
    example: 5.2,
  })
  averageDaysToActivation: number;
}
