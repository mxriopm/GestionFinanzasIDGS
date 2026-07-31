const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');
const verificarToken = require('../middlewares/verificarToken');

router.post('/', verificarToken, gastosController.CrearGasto)
    .get('/', verificarToken, gastosController.ObtenerGastos)
    .get('/:key/:value', verificarToken, gastosController.consultarGasto)
    .delete('/:key/:value', verificarToken, gastosController.eliminarGasto)
    .put('/:key/:value', verificarToken, gastosController.modificarGasto)

module.exports = router;