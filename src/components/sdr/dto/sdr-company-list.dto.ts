import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SdrCompanyListQueryDto {
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

export class SdrContactDto {
  @ApiProperty({
    description: 'Identificador único do contato',
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do contato',
    example: 'João Silva',
    nullable: true,
  })
  name: string;

  @ApiProperty({
    description: 'Número de telefone do contato',
    example: '+55 11 99999-9999',
    nullable: true,
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Indica se o contato está ativo',
    example: true,
  })
  isActive: boolean;
}

export class SdrSubscriptionStatusDto {
  @ApiProperty({
    description: 'Identificador único da assinatura',
    example: 'b8b9f9a4-1a23-4d3b-b30c-3b8e780204e7',
    nullable: true,
  })
  id: string | null;

  @ApiProperty({
    description: 'Status da assinatura: 1 = Ativo, 2 = Cancelado, 3 = Vencido',
    example: 1,
    enum: [1, 2, 3],
    nullable: true,
  })
  status: number | null;

  @ApiProperty({
    description: 'Nome do plano da assinatura',
    example: 'Plano Premium',
    nullable: true,
  })
  planName: string | null;

  @ApiProperty({
    description: 'Próxima data de renovação da assinatura',
    example: '2025-04-01T00:00:00.000Z',
    nullable: true,
  })
  nextRecurrency: string | null;

  @ApiProperty({
    description: 'Data de término da assinatura',
    example: '2025-12-31T00:00:00.000Z',
    nullable: true,
  })
  endDate: string | null;

  @ApiProperty({
    description: 'Indica se a assinatura está vencida ou próxima de vencer',
    example: false,
  })
  isExpiringSoon: boolean;

  @ApiProperty({
    description: 'Indica se a empresa está em período de teste',
    example: false,
  })
  isInTrial: boolean;

  @ApiProperty({
    description: 'Data de fim do período de teste',
    example: '2025-03-15T00:00:00.000Z',
    nullable: true,
  })
  trialEndDate: Date | null;
}

export class SdrCompanyDto {
  @ApiProperty({
    description: 'Identificador único da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da empresa (razão social)',
    example: 'Transportadora ABC Ltda',
    nullable: true,
  })
  name: string;

  @ApiProperty({
    description: 'Nome fantasia da empresa',
    example: 'ABC Transportes',
    nullable: true,
  })
  nameFantasy: string;

  @ApiProperty({
    description: 'CNPJ da empresa',
    example: '12.345.678/0001-90',
    nullable: true,
  })
  cnpj: string;

  @ApiProperty({
    description: 'Telefone principal da empresa',
    example: '+55 11 3456-7890',
    nullable: true,
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Lista de contatos adicionais da empresa',
    type: [SdrContactDto],
  })
  contacts: SdrContactDto[];

  @ApiProperty({
    description: 'Informações sobre o status da assinatura da empresa',
    type: SdrSubscriptionStatusDto,
  })
  subscription: SdrSubscriptionStatusDto;

  @ApiProperty({
    description: 'Data de cadastro da empresa',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Indica se a empresa está ativa no sistema',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indica se a empresa completou o cadastro',
    example: true,
  })
  isCompleted: boolean;
}

export class SdrCompanyListResponseDto {
  @ApiProperty({
    description: 'Lista de empresas encontradas',
    type: [SdrCompanyDto],
  })
  data: SdrCompanyDto[];

  @ApiProperty({
    description: 'Total de empresas encontradas',
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
}
