const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const modeloUsuario = require('../models/usuarioModel');
const { jwtSecret } = require('../config/config');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function registrar(req, res) {
    const { nombre, correo, password, edad, sexo, telefono } = req.body;

    const correoLimpio = correo ? correo.trim().toLowerCase() : '';
    const passwordLimpia = password ? password.trim() : '';

    // 1. Validaciones de presencia
    if (!nombre || !correoLimpio || !passwordLimpia) {
        return res.status(400).json({ error: 'Por favor llena todos los campos obligatorios' });
    }

    // 2. Validación de formato de correo
    if (!EMAIL_REGEX.test(correoLimpio)) {
        return res.status(400).json({ error: 'El formato del correo electrónico no es válido' });
    }

    // 3. Validación de longitud y caracteres en la contraseña
    if (passwordLimpia.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // 4. Verificar si el usuario / correo ya existe
    modeloUsuario.findOne({ correo: correoLimpio })
    .then((usuarioExistente) => {
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado' });
        }

        // Si no existe, hasheamos e insertamos
        return bcrypt.hash(passwordLimpia, 10)
        .then((passwordHasheado) => {
            return new modeloUsuario({
                nombre: nombre.trim(),
                correo: correoLimpio,
                password: passwordHasheado,
                edad,
                sexo,
                telefono
            }).save();
        })
        .then((usuario) => {
            usuario.password = undefined;
            res.status(201).json({ message: 'Usuario registrado correctamente', usuario });
        });
    })
    .catch((error) => {
        res.status(500).json({ error: error.message || 'Error interno al registrar usuario' });
    });
}

function login(req, res) {
    const { correo, password } = req.body;

    const correoLimpio = correo ? correo.trim().toLowerCase() : '';
    const passwordLimpia = password ? password.trim() : '';

    if (!correoLimpio || !passwordLimpia) {
        return res.status(400).json({ message: 'Por favor ingresa correo y contraseña' });
    }

    if (!EMAIL_REGEX.test(correoLimpio)) {
        return res.status(400).json({ message: 'El formato del correo electrónico no es válido' });
    }

    modeloUsuario.findOne({ correo: correoLimpio })
    .then((usuario) => {
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        bcrypt.compare(passwordLimpia, usuario.password)
        .then((esValido) => {
            if (!esValido) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            const token = jwt.sign(
                { id: usuario._id, correo: usuario.correo },
                jwtSecret,
                { expiresIn: '8h' }
            );

            res.status(200).json({
                message: 'Login exitoso',
                token,
                usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo }
            });
        });
    })
    .catch((error) => {
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
    });
}

module.exports = {
    registrar,
    login
};