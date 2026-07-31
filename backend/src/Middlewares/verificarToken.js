// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'formato de token inválido' });
    }

    jwt.verify(token, jwtSecret, (error, decoded) => {
        if (error) {
            return res.status(401).json({ message: 'token inválido o expirado' });
        }

        req.usuario = decoded; // { id, correo }
        next();
    });
}

module.exports = verificarToken;