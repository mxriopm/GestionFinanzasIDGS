const modeloGasto = require('../models/gastoModel');

function CrearGasto(req, res) {
    const nuevoGasto = new modeloGasto({
        ...req.body,
        usuario: req.usuario.id
    });

    nuevoGasto.save()
    .then((gasto) => {
        res.status(201).json({ message: 'gasto registrado correctamente', gasto });
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

function ObtenerGastos(req, res) {
    modeloGasto.find({ usuario: req.usuario.id })
    .then((gastos) => {
        res.status(200).json({ gastos });
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

function consultarGasto(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloGasto.findOne(consulta)
    .then((gasto) => {
        res.status(200).json({ gasto });
    })
    .catch((error) => {
        res.status(404).json({ message: 'gasto no encontrado' });
    });
}

function eliminarGasto(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloGasto.findOneAndDelete(consulta)
    .then((gasto) => {
        res.status(200).json({ message: 'gasto eliminado correctamente' });
    })
    .catch((error) => {
        res.status(404).json({ message: 'gasto no encontrado' });
    });
}

function modificarGasto(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloGasto.findOneAndUpdate(consulta, req.body, { new: true })
    .then((gasto) => {
        res.status(200).json({ message: 'gasto modificado correctamente', gasto });
    })
    .catch((error) => {
        res.status(404).json({ message: 'gasto no encontrado' });
    });
}

module.exports = {
    CrearGasto,
    ObtenerGastos,
    consultarGasto,
    eliminarGasto,
    modificarGasto
};