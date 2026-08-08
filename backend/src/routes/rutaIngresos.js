const express = require('express');
const router = express.Router();
const ingresosController = require('../controllers/ingresosController');
const verificarToken = require('../Middlewares/verificarToken');

// Métodos de controlador con fallback por si varían en nombre
const crear = ingresosController.crearIngreso || ingresosController.crear || ((req, res) => res.json({ msg: 'crear' }));
const obtener = ingresosController.obtenerIngresos || ingresosController.obtener || ((req, res) => res.json({ msg: 'obtener' }));
const consultar = ingresosController.consultarIngreso || ingresosController.consultar || ((req, res) => res.json({ msg: 'consultar' }));
const modificar = ingresosController.modificarIngreso || ingresosController.modificar || ((req, res) => res.json({ msg: 'modificar' }));
const eliminar = ingresosController.eliminarIngreso || ingresosController.eliminar || ((req, res) => res.json({ msg: 'eliminar' }));

router.post('/', verificarToken, crear);
router.get('/', verificarToken, obtener);
router.get('/:id', verificarToken, consultar);
router.put('/:id', verificarToken, modificar);
router.delete('/:id', verificarToken, eliminar);

module.exports = router;