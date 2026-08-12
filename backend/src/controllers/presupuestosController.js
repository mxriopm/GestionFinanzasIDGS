const modeloPresupuesto = require('../models/presupuestoModel');
const modeloAportacion = require('../models/aportacionModel');
const mongoose = require('mongoose');

function CrearPresupuesto(req, res) {
    const nuevoPresupuesto = new modeloPresupuesto({
        ...req.body,
        usuario: req.usuario.id
    });

    nuevoPresupuesto.save()
    .then((presupuesto) => {
        res.status(201).json({ message: 'presupuesto creado correctamente', presupuesto });
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

function ObtenerPresupuestos(req, res) {
    modeloPresupuesto.find({ usuario: req.usuario.id })
    .then(async (presupuestos) => {
        const conProgreso = await Promise.all(
            presupuestos.map(async (p) => {
                const ahorrado = await calcularAhorrado(p._id);
                const estado = ahorrado >= p.montoObjetivo ? 'cumplido' : p.estado || 'activo';
                return { ...p.toObject(), montoAhorrado: ahorrado, estado };
            })
        );
        res.status(200).json({ presupuestos: conProgreso });
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

function consultarPresupuesto(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloPresupuesto.findOne(consulta).orFail()
    .then(async (presupuesto) => {
        const ahorrado = await calcularAhorrado(presupuesto._id);
        const sugerido = calcularAhorroSugerido(presupuesto, ahorrado);
        const estado = ahorrado >= presupuesto.montoObjetivo ? 'cumplido' : presupuesto.estado || 'activo';

        res.status(200).json({
            presupuesto: { ...presupuesto.toObject(), montoAhorrado: ahorrado, estado },
            ahorroSugeridoPorPeriodo: sugerido
        });
    })
    .catch((error) => {
        res.status(404).json({ message: 'presupuesto no encontrado' });
    });
}

function eliminarPresupuesto(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloPresupuesto.findOneAndDelete(consulta).orFail()
    .then((presupuesto) => {
        res.status(200).json({ message: 'presupuesto eliminado correctamente' });
    })
    .catch((error) => {
        res.status(404).json({ message: 'presupuesto no encontrado' });
    });
}

function modificarPresupuesto(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloPresupuesto.findOneAndUpdate(consulta, req.body, { new: true }).orFail()
    .then((presupuesto) => {
        res.status(200).json({ message: 'presupuesto modificado correctamente', presupuesto });
    })
    .catch((error) => {
        res.status(404).json({ message: 'presupuesto no encontrado' });
    });
}


function calcularAhorrado(presupuestoId) {
    return modeloAportacion.aggregate([
        { $match: { presupuesto: new mongoose.Types.ObjectId(presupuestoId) } },
        { $group: { _id: null, total: { $sum: '$monto' } } }
    ]).then((resultado) => resultado[0]?.total || 0);
}

function calcularAhorroSugerido(presupuesto, montoAhorrado) {
    const hoy = new Date();
    const limite = new Date(presupuesto.fechaLimite);
    const montoRestante = presupuesto.montoObjetivo - montoAhorrado;

    const diasRestantes = (limite - hoy) / (1000 * 60 * 60 * 24);
    if (diasRestantes <= 0) return montoRestante;

    let periodosRestantes;
    if (presupuesto.frecuenciaAhorro === 'semanal') periodosRestantes = diasRestantes / 7;
    else if (presupuesto.frecuenciaAhorro === 'quincenal') periodosRestantes = diasRestantes / 15;
    else periodosRestantes = diasRestantes / 30;

    return Math.max(montoRestante / periodosRestantes, 0);
}

module.exports = {
    CrearPresupuesto,
    crearPresupuesto: CrearPresupuesto,
    ObtenerPresupuestos,
    obtenerPresupuestos: ObtenerPresupuestos,
    consultarPresupuesto,
    eliminarPresupuesto,
    modificarPresupuesto
};