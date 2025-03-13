export const UserNotFoundResponse = {
  status: 404,
  description: 'Usuário não encontrado',
  schema: {
    example: {
      statusCode: 404,
      message: 'Não possui cadastro',
    },
  },
};

export const InternalServerErrorResponse = {
  status: 500,
  description: 'Erro interno ao buscar usuário',
  schema: {
    example: {
      statusCode: 500,
      message: 'Erro ao buscar o usuário',
    },
  },
};

export const UserFoundResponse = {
  status: 200,
  description: 'Usuário encontrado',
  schema: {
    example: {
      result: true,
      user: {
        id: 1,
        cpf: '12345678901',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@example.com',
      },
    },
  },
};

export const UserPhotoBody = {
  description: 'Base64 das fotos do documento e da face',
  schema: {
    type: 'object',
    properties: {
      documentPhoto: {
        type: 'string',
        description: 'Foto do documento em formato base64',
        example: 'data:image/jpeg;base64,...',
      },
      photoFace: {
        type: 'string',
        description: 'Foto do rosto em formato base64',
        example: 'data:image/jpeg;base64,...',
      },
    },
  },
};

export const UserPhotoSucessResponse = {
  description: 'Fotos atualizadas com sucesso.',
  schema: {
    example: {
      message: 'Fotos atualizadas com sucesso.',
      userId: '123456789',
    },
  },
};

export const UserPhotoErrorResponseSendPhoto = {
  status: 400,
  description: 'Erro ao atualizar as fotos.',
  schema: {
    example: {
      message:
        'Não foi possível atualizar as fotos. Verifique os dados enviados.',
    },
  },
};

export const UserUpdateBody = {
  description: 'Update usar Schema',
  schema: {
    type: 'object',
    properties: {
      phoneNumber: {
        type: 'string',
        description: 'Telefone do usuário',
        example: '34 00000-0000',
      },
      street: {
        type: 'string',
        description: 'Endereço do usuário',
        example: 'Rua serra do espinhaço',
      },
      number: {
        type: 'string',
        description: 'Número da casa do usuário',
        example: '415',
      },
      city: {
        type: 'string',
        description: 'Cidade do usuário',
        example: 'Uberlândia',
      },
      state: {
        type: 'string',
        description: 'Estado do usuário',
        example: 'Minas Gerais',
      },
      district: {
        type: 'string',
        description: 'Distrito do usuário',
        example: 'Bairro São Jorge',
      },
      complement: {
        type: 'string',
        description: 'Complemento do endereço',
        example: 'AP 207 bloco 2',
      },
    },
  },
};

export const UserSucessUpdateUser = {
  status: 200,
  description: 'Usuário atualizado',
  schema: {
    example: {
      message: 'Update successful',
    },
  },
};
