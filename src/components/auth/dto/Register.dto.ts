import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsBoolean,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Nome do usuário', example: 'João da Silva' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email do usuário', example: 'email@gmail.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Cnpj da empresa',
    example: '45.896.154/0001-41',
  })
  @IsNotEmpty()
  @IsString()
  cnpj: string;

  @ApiProperty({ description: 'CPF de contato', example: '130.422.146-64' })
  @IsNotEmpty()
  @IsString()
  cpf: string;

  @ApiProperty({
    description: 'Número de telefone do usuário',
    example: '(00) 00000-0000',
  })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Senha do usuário', example: 'senha123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdateUserDto extends PartialType(RegisterDto) {}
