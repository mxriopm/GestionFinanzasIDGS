const mongoose = require('mongoose');
const gastoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    },
    monto: {
        type: Number,
        required: true
    },
    categoria: {
        type: String,
        required: true
    },
    descripcion: {
        type: String
    },
    fecha: {
        type: Date,
        default: Date.now
    }
    }, { timestamps: true });
const gastoModel = mongoose.model('Gastos', gastoSchema);
module.exports = gastoModel;
