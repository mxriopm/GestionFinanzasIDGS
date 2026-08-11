const modeloAportacion = require('../models/aportacionModel');
const modeloPresupuesto = require('../models/presupuestoModel');

function CrearAportacion(req, res) {
    // primero verificamos que el presupuesto exista y sea del usuario logueado
    modeloPresupuesto.findOne({ _id: req.body.presupuesto, usuario: req.usuario.id })
    .then((presupuesto) => {
        if (!presupuesto) {
            return res.status(404).json({ message: 'presupuesto no encontrado' });
        }

        return new modeloAportacion({
            ...req.body,
            usuario: req.usuario.id
        }).save();
    })
    .then((aportacion) => {
        if (aportacion) {
            res.status(201).json({ message: 'aportación registrada correctamente', aportacion });
        }
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

function ObtenerAportacionesPorPresupuesto(req, res) {
    modeloAportacion.find({
        usuario: req.usuario.id,
        presupuesto: req.params.presupuestoId
    }).sort({ fecha: -1 })
    .then((aportaciones) => {
        res.status(200).json({ aportaciones });
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

function eliminarAportacion(req, res) {
    modeloAportacion.findOneAndDelete({
        _id: req.params.id,
        usuario: req.usuario.id
    })
    .then((aportacion) => {
        if (!aportacion) {
            return res.status(404).json({ message: 'aportación no encontrada' });
        }
        res.status(200).json({ message: 'aportación eliminada correctamente' });
    })
    .catch((error) => {
        res.status(404).json({ message: 'aportación no encontrada' });
    });
}

module.exports = {
    CrearAportacion,
    crearAportacion: CrearAportacion,
    ObtenerAportacionesPorPresupuesto,
    obtenerAportaciones: ObtenerAportacionesPorPresupuesto,
    eliminarAportacion
};