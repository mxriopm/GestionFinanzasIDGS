const modeloGasto = require('../models/gastoModel');

async function CrearGasto(req, res) {
  try {
    const { monto, categoria, descripcion, fecha } = req.body;

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número válido mayor a 0' });
    }

    // Extracción ultra robusta adaptada al payload { id, correo } de tu login
    const usuarioId = req.usuario?.id || req.usuario?._id || req.user?.id || req.user?._id || (typeof req.usuario === 'string' ? req.usuario : null);

    if (!usuarioId) {
      return res.status(401).json({ error: 'No autorizado: Token inválido o sin ID de usuario' });
    }

    const nuevoGasto = new modeloGasto({
      usuario: usuarioId, 
      monto: montoNum,
      categoria: categoria || 'General',
      descripcion: descripcion || '',
      fecha: fecha || new Date()
    });

    const gastoGuardado = await nuevoGasto.save(); 
    return res.status(201).json({ message: 'Gasto guardado', gasto: gastoGuardado });
  } catch (error) {
    console.error('Error al guardar gasto:', error);
    return res.status(400).json({ error: error.message });
  }
}

async function ObtenerGastos(req, res) {
  try {
    // Extracción ultra robusta adaptada al payload { id, correo } de tu login
    const usuarioId = req.usuario?.id || req.usuario?._id || req.user?.id || req.user?._id || (typeof req.usuario === 'string' ? req.usuario : null);

    if (!usuarioId) {
      return res.status(401).json({ error: 'No autorizado: Token inválido o sin ID de usuario' });
    }

    const listaGastos = await modeloGasto.find({ usuario: usuarioId }).sort({ fecha: -1 });
    
    return res.status(200).json(listaGastos);
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
    CrearGasto,
    crearGasto: CrearGasto,
    ObtenerGastos,
    obtenerGastos: ObtenerGastos
};