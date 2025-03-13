import { ResetPasswordDto } from '@components/auth/dto/Password.dto';

export const AuthcodeEmail = {
  description:
    'Objeto contendo o email do usuário para envio do código de recuperação',
  schema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'exemplo@dominio.com',
      },
    },
  },
};

export const recoveryPasswordAndCode = {
  description:
    'Endpoint para redefinição de senha usando um código de recuperação.',
  type: ResetPasswordDto,
  schema: {
    type: 'object',
    properties: {
      email: { type: 'string', example: 'usuario@example.com' },
      newPassword: { type: 'string', example: 'NovaSenha123!' },
    },
    required: ['email', 'newPassword'],
  },
};

export const ResponseAuthMe = {
  status: 200,
  description: 'Retorna os dados do usuário autenticado (exceto a senha)',
  schema: {
    example: {
      id: '1a2b3c4d5e',
      name: 'João da Silva',
      email: 'joao.silva@email.com',
      role: 'CLIENT',
    },
  },
};

export const ResponseAuthMeTokenInvalid = {
  status: 401,
  description: 'Token inválido ou expirado',
  schema: {
    example: {
      statusCode: 401,
      message: 'Token inválido ou expirado',
    },
  },
};

export const NotFoundUser = {
  status: 404,
  description: 'Usuário não encontrado',
  schema: {
    example: {
      statusCode: 404,
      message: 'Usuário não encontrado',
    },
  },
};
