import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SdrMatchPerformanceQueryDto {
  @ApiProperty({
    description:
      'Identificador único da empresa para filtrar solicitações pendentes (opcional - se não fornecido, retorna todas as empresas)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;

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
    description: 'Data inicial para filtrar solicitações por data de criação (formato: YYYY-MM-DD)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data final para filtrar solicitações por data de criação (formato: YYYY-MM-DD)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SdrRequesterInfoDto {
  @ApiProperty({
    description: 'Identificador único do motorista que fez a solicitação',
    example: 'abc12345-6789-0def-ghij-klmnopqrstuv',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do motorista que solicitou o frete',
    example: 'Carlos Silva',
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
    description: 'Telefone do motorista',
    example: '+55 11 98765-4321',
    nullable: true,
  })
  phoneNumber: string | null;

  @ApiProperty({
    description: 'Email do motorista',
    example: 'carlos.silva@email.com',
    nullable: true,
  })
  email: string | null;
}

export class SdrFreightMatchDto {
  @ApiProperty({
    description: 'Identificador único da solicitação de frete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  requestId: string;

  @ApiProperty({
    description: 'Identificador único do frete postado',
    example: '660f9511-f40c-52e5-b827-537725551111',
  })
  freightId: string;

  @ApiProperty({
    description: 'Identificador único da empresa que postou o frete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId: string;

  @ApiProperty({
    description: 'Nome da empresa que postou o frete (razão social)',
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
    description: 'Data em que a solicitação foi criada',
    example: '2025-03-01T14:30:00.000Z',
  })
  requestDate: Date;

  @ApiProperty({
    description: 'Tempo em horas que a solicitação está sem resposta',
    example: 48,
  })
  hoursWithoutResponse: number;

  @ApiProperty({
    description: 'Tempo em dias que a solicitação está sem resposta',
    example: 2,
  })
  daysWithoutResponse: number;

  @ApiProperty({
    description: 'Status da solicitação',
    example: 'PENDING',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'AWAITING_USER_DRIVE_RESPONSE'],
  })
  requestStatus: string;

  @ApiProperty({
    description: 'Informações do motorista que fez a solicitação',
    type: SdrRequesterInfoDto,
  })
  requester: SdrRequesterInfoDto;

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
    example: '2025-02-28T10:00:00.000Z',
  })
  freightCreatedAt: Date;
}

export class SdrMatchPerformanceResponseDto {
  @ApiProperty({
    description:
      'Lista de solicitações de fretes pendentes de resposta, ordenadas pela mais recente',
    type: [SdrFreightMatchDto],
  })
  data: SdrFreightMatchDto[];

  @ApiProperty({
    description: 'Total de solicitações pendentes encontradas',
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
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas disponíveis',
    example: 8,
  })
  totalPages: number;

  @ApiProperty({
    description:
      'Tempo médio de resposta em horas de todas as solicitações pendentes',
    example: 36.5,
  })
  averageResponseTimeHours: number;
}
