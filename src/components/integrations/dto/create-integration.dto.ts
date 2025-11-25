import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIntegrationDto {
  @ApiProperty({
    description: 'Nome da integração/empresa',
    example: 'Promoflex',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Nome de usuário único para login',
    example: 'promoflex',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Senha de acesso',
    example: 'senha_segura_123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Promoflex Ltda',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    description: 'Email de contato',
    example: 'contato@promoflex.com.br',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({
    description: 'Telefone de contato',
    example: '(11) 98765-4321',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({
    description: 'Permissões específicas da integração',
    example: {
      endpoints: ['driver.status'],
      rateLimit: { requestsPerMinute: 100, requestsPerDay: 10000 },
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  permissions?: any;

  @ApiProperty({
    description: 'Metadados adicionais',
    example: { description: 'Integração para consulta de status' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
