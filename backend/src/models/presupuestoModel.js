const mongoose = require('mongoose');
const presupuestoSchema = new mongoose.Schema({

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    },
    concepto: {
        type: String,
        required: true
    },
    montoObjetivo: {
        type: Number,
        required: true
    },
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    fechaLimite: {
        type: Date,
        required: true
    },
    frecuenciaAhorro: {
        type: String,
        enum: ['semanal', 'quincenal', 'mensual'],
        default: 'semanal'
    },
    estado: {
        type: String,
        enum: ['activo', 'cumplido', 'vencido'],
        default: 'activo'
    }
    }, { timestamps: true });

const presupuestoModel = mongoose.model('Presupuestos', presupuestoSchema);
module.exports = presupuestoModel;
