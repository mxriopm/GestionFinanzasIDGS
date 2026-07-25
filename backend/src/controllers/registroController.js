const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const modeloUsuario = require('../models/usuarioModel');
const { jwtSecret } = require('../config/config');

function registrar(req, res) {
    const { nombre, correo, password, edad, sexo, telefono } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'la contraseña debe tener al menos 6 caracteres' });
    }

    bcrypt.hash(password, 10)
    .then((passwordHasheado) => {
        return new modeloUsuario({
            nombre,
            correo,
            password: passwordHasheado,
            edad,
            sexo,
            telefono
        }).save();
    })
    .then((usuario) => {
        usuario.password = undefined;
        res.status(201).json({ message: 'usuario registrado correctamente', usuario });
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

function login(req, res) {
    const { correo, password } = req.body;

    modeloUsuario.findOne({ correo })
    .then((usuario) => {
        if (!usuario) {
            return res.status(404).json({ message: 'usuario no encontrado' });
        }

        bcrypt.compare(password, usuario.password)
        .then((esValido) => {
            if (!esValido) {
                return res.status(401).json({ message: 'contraseña incorrecta' });
            }

            const token = jwt.sign(
                { id: usuario._id, correo: usuario.correo },
                jwtSecret,
                { expiresIn: '8h' }
            );

            res.status(200).json({
                message: 'login exitoso',
                token,
                usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo }
            });
        });
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

module.exports = {
    registrar,
    login
};