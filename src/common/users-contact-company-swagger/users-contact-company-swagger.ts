import { CompanyUsersContactsDto } from '@components/users-contact-company/dto/users-contact.dto';
import { GetCompanyUsersContactsResponseDto } from '@components/users-contact-company/dto/response-contact-company.dto';

export const CreateContactUsersCompanySucess = {
  status: 200,
  description: 'Usuário criado',
  schema: {
    example: {
      statusCode: 200,
      type: CompanyUsersContactsDto,
    },
  },
};

export const GetUsersCompanySucess = {
  status: 200,
  description: 'Contatos da empresa recuperados',
  schema: {
    example: {
      statusCode: 200,
      type: GetCompanyUsersContactsResponseDto,
    },
  },
};
