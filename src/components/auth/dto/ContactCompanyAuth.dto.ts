import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ContactCompanyRegisterDto {
  @ApiProperty({ description: 'Nome do contato', example: 'Maria Oliveira' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email do contato', example: 'contato@email.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'CPF do contato', example: '123.456.789-00' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({ description: 'Senha', example: 'senha123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Telefone', example: '(11) 99999-9999', required: false })
  @IsString()
  phoneNumber?: string;
}

export class ContactCompanyLoginDto {
  @ApiProperty({ description: 'Email do contato', example: 'contato@email.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Senha', example: 'senha123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
