const mongoose = require('mongoose');
const ingresoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    },
    monto: {
        type: Number,
        required: true
    },
    concepto: {
        type: String,
        required: true
    },
    mes: {
        type: Number,
        required: true
    },
    año: {
        type: Number,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
    }, { timestamps: true });

const ingresoModel = mongoose.model('Ingresos', ingresoSchema);
module.exports = ingresoModel;
