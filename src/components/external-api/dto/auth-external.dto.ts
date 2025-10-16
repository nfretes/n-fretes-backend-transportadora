import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExternalLoginDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'empresa@exemplo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ExternalLoginResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Tempo de expiração em segundos',
    example: 1800,
  })
  expires_in: number;

  @ApiProperty({
    description: 'Tipo do token',
    example: 'Bearer',
  })
  token_type: string;
}
