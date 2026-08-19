import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IntegrationLoginDto {
  @ApiProperty({
    description: 'Nome de usuário da integração',
    example: 'promoflex',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Senha da integração',
    example: 'senha123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class IntegrationTokenDto {
  @ApiProperty({
    description: 'Access token JWT válido por 30 minutos',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token válido por 7 dias',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description:
      'Tempo de expiração do access token em segundos (1800 = 30 minutos)',
    example: 1800,
  })
  expiresIn: number;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token recebido no login para gerar novo access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
