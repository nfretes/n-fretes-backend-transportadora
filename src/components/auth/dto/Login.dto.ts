import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'ntfretes@example.com"',
    example: '45.896.154/0001-41',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Senha do usuário', example: 'senha123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
