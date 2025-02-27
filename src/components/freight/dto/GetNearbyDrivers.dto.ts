import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class GetNearbyDriversDto {
  @ApiProperty({ description: 'Latitude da carga', example: '-23.55052' })
  @IsNumberString()
  latitude: string;

  @ApiProperty({ description: 'Longitude da carga', example: '-46.633308' })
  @IsNumberString()
  longitude: string;

  @ApiProperty({ description: 'Raio de busca em km', example: '10', required: false })
  @IsOptional()
  @IsNumberString()
  radius?: string;
}
