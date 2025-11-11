import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, Length, IsUUID } from 'class-validator';

export class UpdateCompanyLoginDto {
  @ApiProperty({
    description: 'CPF do responsável da empresa',
    example: '12345678901',
  })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf: string;

  @ApiProperty({
    description: 'Senha para login da empresa',
    example: 'MinhaSenh@123',
  })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString({ message: 'Senha deve ser uma string' })
  @Length(6, 50, { message: 'Senha deve ter entre 6 e 50 caracteres' })
  password: string;

  @ApiProperty({
    description: 'CNPJ do responsável da empresa',
    example: '12345678901',
  })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ deve ser uma string' })
  cnpj: string;

  @ApiProperty({
    description: 'Email da empresa',
    example: 'contato@empresa.com',
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email: string;

  @ApiProperty({
    description: 'ID do ContactCompany',
    example: '12345678-1234-1234-1234-123456789abc',
  })
  @IsNotEmpty({ message: 'Contact ID é obrigatório' })
  @IsString({ message: 'Contact ID deve ser uma string' })
  contactId: string;
}
