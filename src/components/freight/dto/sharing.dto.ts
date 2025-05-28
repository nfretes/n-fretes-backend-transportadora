import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';

export class SharingFreightDto {
  @ApiProperty({
    description: 'Lista de IDs dos usuários que receberão o frete',
    example: ['user1', 'user2'],
    type: [String],
  })
  @IsArray({ message: 'userIds deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos 1 usuário' })
  @IsString({ each: true, message: 'Cada userId deve ser uma string' })
  usersIds: string[];

  @ApiProperty({
    description: 'ID do frete a ser compartilhado',
    example: 'freight123',
  })
  @IsString({ message: 'freightId deve ser uma string' })
  @IsNotEmpty({ message: 'freightId não pode estar vazio' })
  freightId: string;
}

export class FreightIsFeatured {
  @ApiProperty({
    description: 'ID do frete a ser compartilhado',
    example: 'freight123',
  })
  @IsString({ message: 'freightId deve ser uma string' })
  @IsNotEmpty({ message: 'freightId não pode estar vazio' })
  freightId: string;
}
