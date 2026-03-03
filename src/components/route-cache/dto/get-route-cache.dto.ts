import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetRouteCacheQueryDto {
  @ApiProperty({
    description: 'Cidade de origem com estado (ex: Uberlândia, MG)',
    example: 'Uberlândia, MG',
  })
  @IsString()
  @IsNotEmpty()
  originCity: string;

  @ApiProperty({
    description: 'Cidade de destino com estado (ex: São Paulo, SP)',
    example: 'São Paulo, SP',
  })
  @IsString()
  @IsNotEmpty()
  destinationCity: string;
}
