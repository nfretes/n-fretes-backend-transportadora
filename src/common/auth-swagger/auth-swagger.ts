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
