import {
  ContactCompanyResponseDto,
  GetContactCompanyResponseDto,
} from '@components/contact-company/dto/response-contact-company.dto';

export const CreateContactCompanySucess = {
  status: 200,
  description: 'Atualizado com sucesso',
  schema: {
    example: {
      statusCode: 200,
      type: ContactCompanyResponseDto,
    },
  },
};

export const GetCompanySucess = {
  status: 200,
  description: 'Contatos da empresa recuperados',
  schema: {
    example: {
      statusCode: 200,
      type: GetContactCompanyResponseDto,
    },
  },
};

export const ContactCompanyErroUpdate = {
  status: 500,
  description: 'Erro ao atualizar a contato',
  schema: {
    example: {
      statusCode: 500,
      message: 'Erro ao Atualizar a contato',
    },
  },
};

export const ContactNotFound = {
  status: 401,
  description: 'Contato não encontrada',
  schema: {
    example: {
      statusCode: 401,
      message: 'Subscrição não encontrada',
    },
  },
};

export const UpdateContactSucess = {
  status: 200,
  description: 'Contato atualizada com sucesso',
  schema: {
    example: {
      statusCode: 200,
      message: 'update da subinscrição realizada com sucesso',
    },
  },
};
