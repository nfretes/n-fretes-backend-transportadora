import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { FreightRequestStatus } from '@entities/freight-requests.entity';

export class CreateFreightRequestDto {
  @ApiProperty({
    description: 'ID do frete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  freightId: string;

  @ApiProperty({
    description: 'Transportador id empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'ID do motorista',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  userDriveId: string;

  @ApiProperty({
    description: 'Status da solicitação de frete',
    enum: FreightRequestStatus,
    example: FreightRequestStatus.PENDING,
  })
  @IsEnum(FreightRequestStatus)
  @IsOptional()
  status?: FreightRequestStatus;
}
