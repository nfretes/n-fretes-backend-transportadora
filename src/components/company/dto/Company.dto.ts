import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
} from 'class-validator';

export class companyUpdateDto {
  @ApiProperty({
    description: 'Número de telefone da transportadora',
    example: '(00) 00000-0000',
  })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Estado da transportadora',
    example: 'MG',
  })
  @IsOptional()
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Cidade da transportadora',
    example: 'Uberlândia',
  })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Endereço da transportadora',
    example: 'Uberlândia',
  })
  @IsOptional()
  @IsString()
  street: string;

  @ApiProperty({
    description: 'Cep da transportadora',
    example: '00000-000',
  })
  @IsOptional()
  @IsString()
  zipcode: string;

  @ApiProperty({
    description: 'Foto da transportadora',
    example: 'Foto da transportadora',
  })
  @IsOptional()
  @IsString()
  photoUrl: string;
}
