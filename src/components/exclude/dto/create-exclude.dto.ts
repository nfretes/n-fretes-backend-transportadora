import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateExcludeDto {
  @ApiProperty({ required: false, example: '12345678901' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiProperty({ required: false, example: '12345678000199' })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiProperty({ example: 'Não uso mais o serviço' })
  @IsNotEmpty({ message: 'motivo é obrigatório' })
  @IsString()
  reason: string;
}
