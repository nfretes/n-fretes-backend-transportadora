import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStates } from 'src/enum/subscription-company';

export class SubscriptionCompanyResponseDto {
  @ApiProperty({
    description: 'ID único da subscrição gerado automaticamente.',
    example: 'b8b9f9a4-1a23-4d3b-b30c-3b8e780204e7',
  })
  id: string;

  @ApiProperty({
    description: 'Estado atual da subscrição.',
    enum: SubscriptionStates,
    example: SubscriptionStates.ACTIVE,
  })
  status: SubscriptionStates;

  @ApiProperty({
    description: 'ID da ordem do comerciante.',
    example: 'ORD-123456789',
    nullable: true,
  })
  merchantOrderId?: string;

  @ApiProperty({
    description: 'ID do plano associado à subscrição.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  planId: string;

  @ApiProperty({
    description: 'ID da empresa associada à subscrição.',
    example: '987e6543-e21b-65d3-b321-426614170000',
    nullable: true,
  })
  companyId?: string;

  @ApiProperty({
    description: 'Valor da subscrição.',
    example: 100.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Próxima data de recorrência da subscrição.',
    example: '2025-01-31T00:00:00.000Z',
    nullable: true,
  })
  nextRecurrency?: string;

  @ApiProperty({
    description: 'Data de término da subscrição.',
    example: '2025-12-31T00:00:00.000Z',
    nullable: true,
  })
  endDate?: string;

  @ApiProperty({
    description: 'Intervalo de recorrência em dias.',
    example: 30,
    nullable: true,
  })
  interval?: number;

  @ApiProperty({
    description: 'Data de criação do registro da subscrição.',
    example: '2025-01-09T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de última atualização do registro da subscrição.',
    example: '2025-01-09T12:34:56.789Z',
  })
  updatedAt: Date;
}

export class SubscriptionUpdateCompanyResponseDto {
  @ApiProperty({
    description: 'Retorno da atualização da subscrição.',
    example: 'Subscrição atualizada com sucesso',
  })
  message: string;
}
