const { z } = require('zod');

// Validador matemático de CPF real
const isValidCPF = (cpf) => {
  if (typeof cpf !== 'string') return false;
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false; // Bloqueia 111.111.111-11, etc.

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
};

const registerSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),
  cpf: z.string()
    .refine((val) => isValidCPF(val), {
      message: 'CPF inválido de acordo com a validação matemática de dígitos verificadores.'
    }),
  phone: z.string()
    .min(10, 'O telefone deve possuir DDD e ao menos 8 dígitos.')
    .max(20, 'Formato de telefone excedeu o limite.'),
  address: z.string()
    .min(5, 'O endereço deve ser detalhado (mínimo 5 caracteres).')
    .max(200, 'Endereço muito extenso.'),
  cardNumber: z.string()
    .refine((val) => val.replace(/\D/g, '').length >= 15 && val.replace(/\D/g, '').length <= 16, {
      message: 'Número de cartão inválido (necessário 15 ou 16 dígitos).'
    }),
  password: z.string()
    .min(6, 'A senha deve conter no mínimo 6 caracteres.')
    .max(128, 'A senha excede o limite seguro de 128 caracteres.')
});

const loginSchema = z.object({
  cpf: z.string().min(11, 'Informe um CPF válido.'),
  password: z.string().min(1, 'A senha é obrigatória.')
});

const recoveryRequestSchema = z.object({
  cpf: z.string().min(11, 'CPF obrigatório.'),
  phone: z.string().min(10, 'Telefone celular obrigatório.')
});

const resetPasswordSchema = z.object({
  cpf: z.string().min(11, 'CPF obrigatório.'),
  newPassword: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres.')
});

module.exports = {
  isValidCPF,
  registerSchema,
  loginSchema,
  recoveryRequestSchema,
  resetPasswordSchema
};
