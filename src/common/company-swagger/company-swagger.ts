import { ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';

export const companyUpdateDtoSwagger = {
  summary: 'Atualizar empresa',
  description: 'Atualiza os dados da empresa vinculada ao usuário autenticado.',
  requestBody: {
    type: 'object',
    properties: {
      fantasyName: {
        type: 'string',
        example: 'Minha Empresa',
        description: 'Nome fantasia da empresa.',
      },
      cnpj: {
        type: 'string',
        example: '12.345.678/0001-99',
        description: 'CNPJ da empresa.',
      },
      city: {
        type: 'string',
        example: 'São Paulo',
        description: 'Cidade onde a empresa está localizada.',
      },
      district: {
        type: 'string',
        example: 'Centro',
        description: 'Bairro da empresa.',
      },
      street: {
        type: 'string',
        example: 'Rua das Flores',
        description: 'Nome da rua da empresa.',
      },
      number: {
        type: 'string',
        example: '123',
        description: 'Número do endereço da empresa.',
      },
      isHeadOffice: {
        type: 'boolean',
        example: true,
        description: 'Indica se é a matriz da empresa.',
      },
      photoUrl: {
        type: 'string',
        example: 'data:image/png;base64,...',
        description: 'Imagem base64 do logo da empresa.',
      },
    },
  },
  responses: {
    200: {
      description: 'Empresa atualizada com sucesso.',
      content: {
        'application/json': {
          example: {
            message: 'Empresa atualizada com sucesso',
            photoUrl: 'https://s3.amazonaws.com/bucket-name/avatar.jpg',
          },
        },
      },
    },
    400: {
      description:
        'Erro ao atualizar empresa (exemplo: empresa não encontrada).',
      content: {
        'application/json': {
          example: {
            statusCode: 400,
            message: 'Não foi possível atualizar a empresa',
          },
        },
      },
    },
    500: {
      description: 'Erro interno do servidor.',
      content: {
        'application/json': {
          example: {
            statusCode: 500,
            message: 'Erro ao atualizar empresa',
          },
        },
      },
    },
  },
};
