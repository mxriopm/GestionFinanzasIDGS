const express = require('express');
const router = express.Router();
const presupuestosController = require('../controllers/presupuestosController');
const verificarToken = require('../middlewares/verificarToken');

router.post('/', verificarToken, presupuestosController.CrearPresupuesto)
    .get('/', verificarToken, presupuestosController.ObtenerPresupuestos)
    .get('/:key/:value', verificarToken, presupuestosController.consultarPresupuesto)
    .delete('/:key/:value', verificarToken, presupuestosController.eliminarPresupuesto)
    .put('/:key/:value', verificarToken, presupuestosController.modificarPresupuesto)

module.exports = router;