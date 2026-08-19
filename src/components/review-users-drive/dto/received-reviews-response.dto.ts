import { ApiProperty } from '@nestjs/swagger';

class ReviewerInfo {
  @ApiProperty({ example: 'abc-123-def' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'https://...' })
  photoUrl: string;
}

class RouteInfo {
  @ApiProperty({ example: 'São Paulo' })
  originCity: string;

  @ApiProperty({ example: 'SP' })
  originState: string;

  @ApiProperty({ example: 'Rio de Janeiro' })
  destinyCity: string;

  @ApiProperty({ example: 'RJ' })
  destinyState: string;
}

export class ReceivedReviewDto {
  @ApiProperty({ example: 'review-id-123' })
  id: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Excelente empresa, muito profissional!' })
  comment: string;

  @ApiProperty({ type: ReviewerInfo })
  reviewer: ReviewerInfo;

  @ApiProperty({ type: RouteInfo })
  route: RouteInfo;

  @ApiProperty({ example: ['OTIMO_MOTORISTA', 'RESPONDE_RAPIDO'] })
  tags: string[];

  @ApiProperty({ example: '2026-02-18T10:30:00.000Z' })
  createdAt: Date;
}

class StarDistribution {
  @ApiProperty({ example: 5 })
  stars: number;

  @ApiProperty({ example: 20 })
  count: number;

  @ApiProperty({ example: 42 })
  percentage: number;
}

class TopTag {
  @ApiProperty({ example: 'BOA_COMUNICACAO' })
  tag: string;

  @ApiProperty({ example: 'Boa comunicação' })
  label: string;

  @ApiProperty({ example: 32 })
  count: number;

  @ApiProperty({ example: 'positive' })
  type: string;
}

export class ReceivedReviewsResponseDto {
  @ApiProperty({ type: [ReceivedReviewDto] })
  data: ReceivedReviewDto[];

  @ApiProperty({ example: 25 })
  count: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  @ApiProperty({ type: [StarDistribution] })
  starDistribution: StarDistribution[];

  @ApiProperty({ type: [TopTag] })
  topTags: TopTag[];
}
