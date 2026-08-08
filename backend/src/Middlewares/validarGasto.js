const Joi = require('joi');

const gastoSchema = Joi.object({
  monto: Joi.number().positive().required().messages({
    'number.base': 'El monto debe ser un número válido',
    'number.positive': 'El monto debe ser un valor positivo mayor a 0',
    'any.required': 'El monto es un campo obligatorio',
  }),
  categoria: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'La categoría no puede estar vacía',
    'any.required': 'La categoría es obligatoria',
  }),
  descripcion: Joi.string().trim().allow('', null).max(250),
});

const validarGasto = (req, res, next) => {
  const { error } = gastoSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const mensajes = error.details.map((detail) => detail.message);
    return res.status(400).json({ error: mensajes[0], detalles: mensajes });
  }
  next();
};

module.exports = validarGasto;