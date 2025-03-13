import { ApiProperty } from '@nestjs/swagger';
import { Company } from '@entities/company.entity';
import { Freight } from '@entities/freight.entity';

export class ContactCompanyResponseDto {
  @ApiProperty({
    description: 'ID do contato da empresa gerado automaticamente.',
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do contato da empresa.',
    example: 'João Silva',
    nullable: true,
  })
  name: string;

  @ApiProperty({
    description: 'Número de telefone do contato da empresa.',
    example: '+5511999999999',
    nullable: true,
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'ID da empresa associada ao contato.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId: string;

  @ApiProperty({
    description: 'Informações da empresa associada ao contato.',
    type: () => Company,
  })
  company: Company;

  @ApiProperty({
    description: 'Lista de fretes associados ao contato da empresa.',
    type: () => [Freight],
  })
  freights: Freight[];

  @ApiProperty({
    description: 'Status ativo ou inativo do contato.',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Data de criação do registro.',
    example: '2024-01-09T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro.',
    example: '2024-01-10T12:34:56.789Z',
  })
  updatedAt: Date;
}

export class ContactCompanyUpdateResponseDto {
  @ApiProperty({
    description: 'Retorno da atualização do contato da empresa.',
    example: 'Contato atualizado com sucesso',
  })
  message: string;
}

export class GetContactCompanyResponseDto {
  @ApiProperty({
    description: 'Lista de contatos da empresa encontrados.',
    type: () => [ContactCompanyResponseDto],
  })
  data: ContactCompanyResponseDto[];

  @ApiProperty({
    description: 'Total de contatos da empresa encontrados.',
    example: 25,
  })
  count: number;
}
