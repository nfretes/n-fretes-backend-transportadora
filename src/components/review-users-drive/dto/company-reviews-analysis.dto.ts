import { ApiProperty } from '@nestjs/swagger';

class StarDistribution {
  @ApiProperty({ example: 5 })
  stars: number;

  @ApiProperty({ example: 6 })
  count: number;

  @ApiProperty({ example: 50 })
  percentage: number;
}

class TopTag {
  @ApiProperty({ example: 'OTIMO_MOTORISTA' })
  tag: string;

  @ApiProperty({ example: 'Ótimo motorista' })
  label: string;

  @ApiProperty({ example: 8 })
  count: number;

  @ApiProperty({ example: 'positive' })
  type: 'positive' | 'negative';
}

export class CompanyReviewsAnalysisDto {
  @ApiProperty({ example: 4.5 })
  averageRating: number;

  @ApiProperty({ example: 12 })
  totalReviews: number;

  @ApiProperty({ type: [StarDistribution] })
  starDistribution: StarDistribution[];

  @ApiProperty({ type: [TopTag] })
  topTags: TopTag[];

  @ApiProperty({ example: 'Excelente' })
  overallQuality: string;
}
