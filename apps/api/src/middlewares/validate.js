/**
 * Middleware Zero-Trust com Zod e sanitização de inputs contra XSS
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Sanitização de strings para evitar payloads maliciosos
    if (req.body && typeof req.body === 'object') {
      for (const key of Object.keys(req.body)) {
        if (typeof req.body[key] === 'string') {
          // Remove scripts básicos e tags perigosas se presentes
          req.body[key] = req.body[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .trim();
        }
      }
    }

    const parsed = schema.parse(req.body);
    // Substitui req.body pelos dados limpos e parseados pelo Zod (prevenindo Mass Assignment)
    req.body = parsed;
    next();
  } catch (err) {
    if (err.errors) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return res.status(400).json({
        error: 'Erro de validação nos campos informados.',
        details: formattedErrors,
        code: 'VALIDATION_ERROR'
      });
    }
    return res.status(400).json({
      error: 'Requisição inválida.',
      code: 'BAD_REQUEST'
    });
  }
};

module.exports = validate;
