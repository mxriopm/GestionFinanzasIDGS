const mongoose = require('mongoose');

const GastoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  monto: {
    type: Number,
    required: true,
    min: [0.01, 'El monto debe ser mayor a 0'],
  },
  categoria: {
    type: String,
    required: true,
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Indexación para optimizar consultas de búsquedas y reportes
GastoSchema.index({ usuario: 1, fecha: -1 });

module.exports = mongoose.model('Gasto', GastoSchema);