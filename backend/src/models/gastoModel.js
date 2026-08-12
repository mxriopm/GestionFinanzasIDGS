const mongoose = require('mongoose');

const gastoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0.01, 'El monto debe ser mayor a 0'],
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Gasto', gastoSchema);