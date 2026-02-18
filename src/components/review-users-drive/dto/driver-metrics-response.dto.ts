import { ApiProperty } from '@nestjs/swagger';

export class DriverMetricsResponseDto {
  @ApiProperty({
    description: 'ID do motorista',
    example: 'abc-123-def',
  })
  userDriveId: string;

  @ApiProperty({
    description: 'Nome do motorista',
    example: 'João Silva',
  })
  driverName: string;

  @ApiProperty({
    description: 'Percentual de satisfação (reviews 4 e 5 estrelas)',
    example: 85.5,
  })
  satisfactionPercentage: number;

  @ApiProperty({
    description: 'Percentual de insatisfação (reviews 1, 2 e 3 estrelas)',
    example: 14.5,
  })
  dissatisfactionPercentage: number;

  @ApiProperty({
    description: 'Quantidade total de avaliações',
    example: 50,
  })
  totalReviews: number;

  @ApiProperty({
    description: 'Quantidade de reviews satisfatórias (4 e 5 estrelas)',
    example: 43,
  })
  satisfiedReviews: number;

  @ApiProperty({
    description: 'Quantidade de reviews insatisfatórias (1, 2 e 3 estrelas)',
    example: 7,
  })
  dissatisfiedReviews: number;

  @ApiProperty({
    description: 'Taxa de resposta (% de solicitações respondidas)',
    example: 92.3,
  })
  responseRate: number;

  @ApiProperty({
    description: 'Total de solicitações enviadas',
    example: 65,
  })
  totalRequests: number;

  @ApiProperty({
    description: 'Total de solicitações respondidas (aceitas ou rejeitadas)',
    example: 60,
  })
  respondedRequests: number;

  @ApiProperty({
    description: 'Total de solicitações não respondidas (pendentes/expiradas)',
    example: 5,
  })
  notRespondedRequests: number;

  @ApiProperty({
    description: 'Conformidade SLA (% de entregas no prazo)',
    example: 88.0,
  })
  slaCompliance: number;

  @ApiProperty({
    description: 'Total de entregas completadas',
    example: 50,
  })
  totalCompletedDeliveries: number;

  @ApiProperty({
    description: 'Entregas no prazo',
    example: 44,
  })
  onTimeDeliveries: number;

  @ApiProperty({
    description: 'Entregas atrasadas',
    example: 6,
  })
  lateDeliveries: number;

  @ApiProperty({
    description: 'Solicitações pendentes atualmente',
    example: 3,
  })
  pendingRequests: number;
}
