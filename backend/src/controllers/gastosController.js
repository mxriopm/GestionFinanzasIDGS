const modeloGasto = require('../models/gastoModel');

async function CrearGasto(req, res) {
  try {
    const { monto, categoria, descripcion, fecha } = req.body;

    // Validación estricta
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número válido mayor a 0' });
    }

    const nuevoGasto = new modeloGasto({
      usuario: req.usuario.id, // Viene del middleware de JWT
      monto: montoNum,
      categoria: categoria || 'General',
      descripcion: descripcion || '',
      fecha: fecha || new Date()
    });

    const gastoGuardado = await nuevoGasto.save(); // 👈 Guarda en MongoDB
    return res.status(201).json({ message: 'Gasto guardado', gasto: gastoGuardado });
  } catch (error) {
    console.error('Error al guardar gasto:', error);
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
    CrearGasto,
    ObtenerGastos,
    consultarGasto,
    eliminarGasto,
    modificarGasto
};