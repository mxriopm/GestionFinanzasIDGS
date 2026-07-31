const modeloIngreso = require('../models/ingresoModel');

function CrearIngreso(req, res) {
    const nuevoIngreso = new modeloIngreso({
        ...req.body,
        usuario: req.usuario.id
    });

    nuevoIngreso.save()
    .then((ingreso) => {
        res.status(201).json({ message: 'ingreso registrado correctamente', ingreso });
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

function ObtenerIngresos(req, res) {
    modeloIngreso.find({ usuario: req.usuario.id })
    .then((ingresos) => {
        res.status(200).json({ ingresos });
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

function consultarIngreso(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloIngreso.findOne(consulta)
    .then((ingreso) => {
        res.status(200).json({ ingreso });
    })
    .catch((error) => {
        res.status(404).json({ message: 'ingreso no encontrado' });
    });
}

function eliminarIngreso(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloIngreso.findOneAndDelete(consulta)
    .then((ingreso) => {
        res.status(200).json({ message: 'ingreso eliminado correctamente' });
    })
    .catch((error) => {
        res.status(404).json({ message: 'ingreso no encontrado' });
    });
}

function modificarIngreso(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloIngreso.findOneAndUpdate(consulta, req.body, { new: true })
    .then((ingreso) => {
        res.status(200).json({ message: 'ingreso modificado correctamente', ingreso });
    })
    .catch((error) => {
        res.status(404).json({ message: 'ingreso no encontrado' });
    });
}

module.exports = {
    CrearIngreso,
    ObtenerIngresos,
    consultarIngreso,
    eliminarIngreso,
    modificarIngreso
};