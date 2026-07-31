const express = require('express');
const router = express.Router();
const aportacionesController = require('../controllers/aportacionesController');
const verificarToken = require('../middlewares/verificarToken');

router.post('/', verificarToken, aportacionesController.CrearAportacion)
    .get('/:presupuestoId', verificarToken, aportacionesController.ObtenerAportacionesPorPresupuesto)
    .delete('/:id', verificarToken, aportacionesController.eliminarAportacion)

module.exports = router;