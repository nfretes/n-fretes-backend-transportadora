import { ApiProperty } from '@nestjs/swagger';
import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';

export class ContactGroupResponseDto {
  @ApiProperty({
    description: 'ID do grupo',
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do grupo',
    example: 'Motoristas São Paulo',
  })
  name: string;

  @ApiProperty({
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId: string;

  @ApiProperty({
    description: 'Lista de contatos no grupo',
    type: () => [CompanyUsersContacts],
  })
  contacts: CompanyUsersContacts[];

  @ApiProperty({
    description: 'Status ativo ou inativo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-09T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-10T12:34:56.789Z',
  })
  updatedAt: Date;
}

export class ContactGroupUpdateResponseDto {
  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Grupo atualizado com sucesso',
  })
  message: string;
}

export class GetContactGroupsResponseDto {
  @ApiProperty({
    description: 'Lista de grupos',
    type: () => [ContactGroupResponseDto],
  })
  data: ContactGroupResponseDto[];

  @ApiProperty({
    description: 'Total de grupos',
    example: 10,
  })
  count: number;
}
