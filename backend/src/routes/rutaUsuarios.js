const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const verificarToken = require('../Middlewares/verificarToken');

router.get('/', verificarToken, usuariosController.ObtenerUsuarios)
    .get('/:key/:value', verificarToken, usuariosController.consultarUsuario)
    .delete('/:key/:value', verificarToken, usuariosController.eliminarUsuario)
    .put('/:key/:value', verificarToken, usuariosController.modificarUsuario);

module.exports = router;