const mongoose = require('mongoose');
const aportacionSchema = new mongoose.Schema({

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    },
    presupuesto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Presupuestos',
        required: true
    },
    monto: {
        type: Number,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    nota: {
        type: String
    }
    }, { timestamps: true });

const aportacionModel = mongoose.model('Aportaciones', aportacionSchema);
module.exports = aportacionModel;
