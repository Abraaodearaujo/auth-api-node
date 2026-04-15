const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório.' })
    .min(2, 'Nome deve ter pelo menos 2 caracteres.')
    .max(100, 'Nome deve ter no máximo 100 caracteres.')
    .trim(),

  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .email('E-mail inválido.')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(6, 'Senha deve ter pelo menos 6 caracteres.')
    .max(100, 'Senha deve ter no máximo 100 caracteres.'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .email('E-mail inválido.')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(1, 'Senha é obrigatória.'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required.' }).min(1),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .email('E-mail inválido.')
    .toLowerCase()
    .trim(),
});

const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Token is required.' }).min(1),
  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(6, 'Senha deve ter pelo menos 6 caracteres.')
    .max(100, 'Senha deve ter no máximo 100 caracteres.'),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};