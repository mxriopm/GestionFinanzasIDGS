const modeloIngreso = require('../models/ingresoModel');

function CrearIngreso(req, res) {
    const { monto, categoria } = req.body;

    // Validaciones preventivas en Backend
    if (monto === undefined || monto === null || isNaN(monto) || Number(monto) <= 0) {
        return res.status(400).json({ error: 'El monto debe ser un número mayor a 0' });
    }

    if (!categoria || typeof categoria !== 'string' || !categoria.trim()) {
        return res.status(400).json({ error: 'La categoría es requerida' });
    }

    const nuevoIngreso = new modeloIngreso({
        ...req.body,
        monto: Number(monto),
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
    .sort({ fecha: -1 }) // Ordenar del más reciente al más antiguo
    .then((ingresos) => {
        res.status(200).json({ ingresos });
    })
    .catch((error) => {
        res.status(500).json({ error: error.message });
    });
}

function consultarIngreso(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloIngreso.findOne(consulta)
    .then((ingreso) => {
        if (!ingreso) {
            return res.status(404).json({ message: 'ingreso no encontrado' });
        }
        res.status(200).json({ ingreso });
    })
    .catch((error) => {
        res.status(400).json({ error: 'Consulta inválida o formato incorrecto' });
    });
}

function eliminarIngreso(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    modeloIngreso.findOneAndDelete(consulta)
    .then((ingreso) => {
        if (!ingreso) {
            return res.status(404).json({ message: 'ingreso no encontrado' });
        }
        res.status(200).json({ message: 'ingreso eliminado correctamente' });
    })
    .catch((error) => {
        res.status(400).json({ error: 'Consulta inválida o formato incorrecto' });
    });
}

function modificarIngreso(req, res) {
    const consulta = { usuario: req.usuario.id };
    consulta[req.params.key] = req.params.value;

    // Si intenta modificar el monto, se valida que sea positivo
    if (req.body.monto !== undefined) {
        if (isNaN(req.body.monto) || Number(req.body.monto) <= 0) {
            return res.status(400).json({ error: 'El monto debe ser un número mayor a 0' });
        }
    }

    modeloIngreso.findOneAndUpdate(consulta, req.body, { new: true, runValidators: true })
    .then((ingreso) => {
        if (!ingreso) {
            return res.status(404).json({ message: 'ingreso no encontrado' });
        }
        res.status(200).json({ message: 'ingreso modificado correctamente', ingreso });
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
}

module.exports = {
    CrearIngreso,
    crearIngreso: CrearIngreso,
    ObtenerIngresos,
    obtenerIngresos: ObtenerIngresos,
    consultarIngreso,
    eliminarIngreso,
    modificarIngreso
};