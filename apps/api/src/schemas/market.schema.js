const { z } = require('zod');

const createProductSchema = z.object({
  title: z.string()
    .min(3, 'O título do anúncio deve ter no mínimo 3 caracteres.')
    .max(100, 'O título não pode ultrapassar 100 caracteres.'),
  category: z.enum(['Eletrônicos', 'Periféricos', 'Móveis', 'Outros'], {
    errorMap: () => ({ message: 'Selecione uma categoria válida (Eletrônicos, Periféricos, Móveis ou Outros).' })
  }),
  description: z.string()
    .min(5, 'A descrição deve ter no mínimo 5 caracteres.')
    .max(1000, 'A descrição não pode ultrapassar 1000 caracteres.'),
  price: z.number({ invalid_type_error: 'O preço deve ser um valor numérico.' })
    .positive('O preço deve ser maior que zero.')
    .max(100000, 'O valor máximo por produto é R$ 100.000,00.'),
  imageUrl: z.string().url('URL da imagem inválida.').optional().or(z.literal(''))
});

const depositSchema = z.object({
  amount: z.number({ invalid_type_error: 'O valor do depósito deve ser numérico.' })
    .min(10, 'O valor mínimo para depósito é de R$ 10,00.')
    .max(50000, 'O valor máximo para depósito por transação é de R$ 50.000,00.')
});

module.exports = {
  createProductSchema,
  depositSchema
};
