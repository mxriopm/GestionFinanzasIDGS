const express = require('express');
const router = express.Router();
const presupuestosController = require('../controllers/presupuestosController');
const verificarToken = require('../Middlewares/verificarToken');

const crear = presupuestosController.crearPresupuesto || presupuestosController.crear || ((req, res) => res.json({ msg: 'crear' }));
const obtener = presupuestosController.obtenerPresupuestos || presupuestosController.obtener || ((req, res) => res.json({ msg: 'obtener' }));
const consultar = presupuestosController.consultarPresupuesto || presupuestosController.consultar || ((req, res) => res.json({ msg: 'consultar' }));
const modificar = presupuestosController.modificarPresupuesto || presupuestosController.modificar || ((req, res) => res.json({ msg: 'modificar' }));
const eliminar = presupuestosController.eliminarPresupuesto || presupuestosController.eliminar || ((req, res) => res.json({ msg: 'eliminar' }));

router.post('/', verificarToken, crear);
router.get('/', verificarToken, obtener);
router.get('/:id', verificarToken, consultar);
router.put('/:id', verificarToken, modificar);
router.delete('/:id', verificarToken, eliminar);

module.exports = router;