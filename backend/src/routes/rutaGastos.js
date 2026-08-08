const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');
const verificarToken = require('../Middlewares/verificarToken');

const crear = gastosController.crearGasto || gastosController.crear || ((req, res) => res.json({ msg: 'crear' }));
const obtener = gastosController.obtenerGastos || gastosController.obtener || ((req, res) => res.json({ msg: 'obtener' }));
const consultar = gastosController.consultarGasto || gastosController.consultar || ((req, res) => res.json({ msg: 'consultar' }));
const modificar = gastosController.modificarGasto || gastosController.modificar || ((req, res) => res.json({ msg: 'modificar' }));
const eliminar = gastosController.eliminarGasto || gastosController.eliminar || ((req, res) => res.json({ msg: 'eliminar' }));

router.post('/', verificarToken, crear);
router.get('/', verificarToken, obtener);
router.get('/:id', verificarToken, consultar);
router.put('/:id', verificarToken, modificar);
router.delete('/:id', verificarToken, eliminar);

module.exports = router;