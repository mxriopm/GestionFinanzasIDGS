const express = require('express');
const router = express.Router();
const aportacionesController = require('../controllers/aportacionesController');
const verificarToken = require('../Middlewares/verificarToken');

const crear = aportacionesController.crearAportacion || aportacionesController.crear || ((req, res) => res.json({ msg: 'crear' }));
const obtener = aportacionesController.obtenerAportaciones || aportacionesController.obtener || ((req, res) => res.json({ msg: 'obtener' }));
const consultar = aportacionesController.consultarAportacion || aportacionesController.consultar || ((req, res) => res.json({ msg: 'consultar' }));
const modificar = aportacionesController.modificarAportacion || aportacionesController.modificar || ((req, res) => res.json({ msg: 'modificar' }));
const eliminar = aportacionesController.eliminarAportacion || aportacionesController.eliminar || ((req, res) => res.json({ msg: 'eliminar' }));

router.post('/', verificarToken, crear);
router.get('/', verificarToken, obtener);
router.get('/:id', verificarToken, consultar);
router.put('/:id', verificarToken, modificar);
router.delete('/:id', verificarToken, eliminar);

module.exports = router;