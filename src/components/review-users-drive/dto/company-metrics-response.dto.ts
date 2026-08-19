import { ApiProperty } from '@nestjs/swagger';

export class CompanyMetricsResponseDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: 'abc-123-def',
  })
  companyId: string;

  @ApiProperty({
    description: 'Percentual de satisfação (avaliações 4-5 estrelas recebidas pela empresa)',
    example: 100,
  })
  satisfactionPercentage: number;

  @ApiProperty({
    description: 'Total de avaliações recebidas pela empresa',
    example: 3,
  })
  totalReviewsReceived: number;

  @ApiProperty({
    description: 'Avaliações satisfatórias recebidas (4-5 estrelas)',
    example: 3,
  })
  satisfiedReviews: number;

  @ApiProperty({
    description: 'Avaliações insatisfatórias recebidas (1-3 estrelas)',
    example: 0,
  })
  dissatisfiedReviews: number;

  @ApiProperty({
    description: 'Taxa de resposta - % de fretes avaliados pela empresa',
    example: 40,
  })
  responseRate: number;

  @ApiProperty({
    description: 'Total de fretes completados',
    example: 10,
  })
  totalCompletedFreights: number;

  @ApiProperty({
    description: 'Total de fretes avaliados pela empresa',
    example: 4,
  })
  reviewedFreights: number;

  @ApiProperty({
    description: 'Fretes não avaliados pela empresa',
    example: 6,
  })
  notReviewedFreights: number;

  @ApiProperty({
    description: 'Conformidade SLA - % de avaliações feitas em até 7 dias',
    example: 67,
  })
  slaCompliance: number;

  @ApiProperty({
    description: 'Avaliações feitas dentro do prazo (até 7 dias)',
    example: 2,
  })
  onTimeReviews: number;

  @ApiProperty({
    description: 'Avaliações feitas fora do prazo (após 7 dias)',
    example: 1,
  })
  lateReviews: number;

  @ApiProperty({
    description: 'Fretes pendentes de avaliação',
    example: 3,
  })
  pendingReviews: number;

  @ApiProperty({
    description: 'Fretes pendentes atrasados (completados há mais de 7 dias sem avaliação)',
    example: 1,
  })
  overdueReviews: number;
}
