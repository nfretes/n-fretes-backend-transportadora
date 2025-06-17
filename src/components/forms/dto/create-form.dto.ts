import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateFormDto {
  @ApiProperty({ required: false, example: 'email@exemplo.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Nome da empresa' })
  @IsNotEmpty({ message: 'nome é obrigatório' })
  @IsString()
  nome: string;

  @ApiProperty({ example: '11999999999' })
  @IsNotEmpty({ message: 'whatsapp é obrigatório' })
  @IsString()
  whatsapp: string;

  @ApiProperty({ example: '12345678000199' })
  @IsNotEmpty({ message: 'cnpj é obrigatório' })
  @IsString()
  cnpj: string;
}
