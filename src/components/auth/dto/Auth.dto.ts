import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acesso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  access_token: string;
}

export class AuthResponseRegisterDto {
  @ApiProperty({
    description: 'Resposta',
    example: 'Cadastro enviado para análise',
  })
  message: string;
}
