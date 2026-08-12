const modeloAportacion = require('../models/aportacionModel');
const modeloPresupuesto = require('../models/presupuestoModel');
const modeloGasto = require('../models/gastoModel');

async function CrearAportacion(req, res) {
    try {
        const presupuesto = await modeloPresupuesto.findOne({ _id: req.body.presupuesto, usuario: req.usuario.id });
        if (!presupuesto) {
            return res.status(404).json({ message: 'presupuesto no encontrado' });
        }

        const acumulado = await modeloAportacion.aggregate([
            { $match: { presupuesto: presupuesto._id, usuario: req.usuario.id } },
            { $group: { _id: null, total: { $sum: '$monto' } } }
        ]);

        const totalAhorrado = acumulado[0]?.total || 0;
        const restante = presupuesto.montoObjetivo - totalAhorrado;

        if (restante <= 0) {
            return res.status(400).json({ error: 'Esta meta ya está cumplida. No puedes abonar más.' });
        }

        if (req.body.monto > restante) {
            return res.status(400).json({ error: `El monto ingresado supera lo que falta (${restante}).` });
        }

        const aportacion = await new modeloAportacion({
            ...req.body,
            usuario: req.usuario.id
        }).save();

        if (totalAhorrado + aportacion.monto >= presupuesto.montoObjetivo) {
            await modeloPresupuesto.findByIdAndUpdate(presupuesto._id, { estado: 'cumplido' });
        }

        const nuevoGasto = new modeloGasto({
            usuario: aportacion.usuario,
            monto: aportacion.monto,
            categoria: 'Aportación a meta',
            descripcion: aportacion.concepto || `Aportación a presupuesto ${aportacion.presupuesto}`,
            fecha: aportacion.fecha || Date.now()
        });

        await nuevoGasto.save();
        res.status(201).json({ message: 'aportación registrada correctamente', aportacion });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
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