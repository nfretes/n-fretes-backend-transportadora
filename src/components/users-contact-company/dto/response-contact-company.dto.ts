import { ApiProperty } from "@nestjs/swagger";

export class UsersContactUpdateCompanyResponseDto {
  @ApiProperty({
    description: 'Retorno da atualização do seu contanto.',
    example: 'Contato atualizada com sucesso',
  })
  message: string;
}



export class GetCompanyUsersContactsResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the contact record',
    example: 'e9d4f72c-6d9b-4b1b-9936-b857a3d939a7',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the associated company',
    example: 'c4d4f72c-6d9b-4b1b-9936-b857a3d939b8',
    nullable: true,
  })
  companyId: string | null;

  @ApiProperty({
    description: 'ID of the associated user',
    example: 'b4d4f72c-6d9b-4b1b-9936-b857a3d939c9',
    nullable: true,
  })
  userId: string | null;

  @ApiProperty({
    description: 'Details of the associated company',
    example: {
      email: 'contact@company.com',
      cnpj: '12.345.678/0001-95',
      fantasyName: 'Company Name',
    },
    nullable: true,
  })
  companyDetails?: {
    email: string;
    cnpj: string;
    fantasyName: string;
  };

  @ApiProperty({
    description: 'Details of the associated user',
    example: {
      name: 'John Doe',
    },
    nullable: true,
  })
  users?: {
    name: string; 
  };

  @ApiProperty({
    description: 'Indicates if the contact is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Date when the record was created',
    example: '2025-01-14T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the record was last updated',
    example: '2025-01-14T12:00:00.000Z',
  })
  updatedAt: Date;
}

export class PaginatedGetCompanyUsersContactsResponseDto {
  @ApiProperty({
    description: 'List of company users contacts',
    type: [GetCompanyUsersContactsResponseDto],
  })
  data: GetCompanyUsersContactsResponseDto[];

  @ApiProperty({
    description: 'Total number of records available',
    example: 50,
  })
  count: number;
}
