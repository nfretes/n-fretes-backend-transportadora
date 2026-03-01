import { ApiProperty } from '@nestjs/swagger';

class FreightInfo {
  @ApiProperty({ example: 'freight-uuid-123' })
  id: string;

  @ApiProperty({ example: 'São Paulo' })
  originCity: string;

  @ApiProperty({ example: 'SP' })
  originState: string;

  @ApiProperty({ example: 'Rio de Janeiro' })
  destinyCity: string;

  @ApiProperty({ example: 'RJ' })
  destinyState: string;

  @ApiProperty({ example: 'Eletrônicos' })
  product: string;
}


class DriverInfo {
  @ApiProperty({ example: 'driver-uuid-456' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'https://...' })
  photoUrl: string;

  @ApiProperty({ example: '123.456.789-00' })
  cpf: string;
}

export class PendingReviewDto {
  @ApiProperty({ example: 'route-uuid-789' })
  freightRouteId: string;

  @ApiProperty({ type: FreightInfo })
  freight: FreightInfo;

  @ApiProperty({ type: DriverInfo })
  driver: DriverInfo;

  @ApiProperty({ example: '2026-02-15T18:30:00.000Z' })
  completedAt: Date;
}

export class PendingReviewsResponseDto {
  @ApiProperty({ type: [PendingReviewDto] })
  data: PendingReviewDto[];

  @ApiProperty({ example: 15 })
  count: number;
}
