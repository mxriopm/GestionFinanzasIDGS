const express = require('express');
const router = express.Router();
const ingresosController = require('../controllers/ingresosController');
const verificarToken = require('../middlewares/verificarToken');

router.post('/', verificarToken, ingresosController.CrearIngreso)
    .get('/', verificarToken, ingresosController.ObtenerIngresos)
    .get('/:key/:value', verificarToken, ingresosController.consultarIngreso)
    .delete('/:key/:value', verificarToken, ingresosController.eliminarIngreso)
    .put('/:key/:value', verificarToken, ingresosController.modificarIngreso);

module.exports = router;