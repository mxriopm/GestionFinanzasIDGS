// models/usuarioModel.js
const mongoose = require('mongoose');
const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
       minlength: 6
    },
    edad: {
        type: Number,
        required: true
    },
    sexo: {
        type: String,
        required: true
    },
    telefono: {
        type: Number,
        required: true
    }
});

const usuarioModel = mongoose.model('Usuarios', usuarioSchema);
module.exports = usuarioModel;