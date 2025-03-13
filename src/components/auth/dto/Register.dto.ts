import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Nome do administrador', example: 'João da Silva' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email do administrador', example: 'email@gmail.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: 'CPF do administrador', example: '130.422.146-64' })
  @IsNotEmpty()
  @IsString()
  cpf: string;

  @ApiProperty({ description: 'Número de telefone', example: '(00) 00000-0000' })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Senha do administrador', example: 'senha123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'URL da foto', example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  photoUrl: string;

  @ApiProperty({ description: 'Status ativo (sempre true para admins)', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ description: 'Data de nascimento', example: '1990-01-01' })
  @IsOptional()
  @IsDate()
  birthDate?: Date;
}

export class UpdateUserDto extends PartialType(RegisterDto) {}