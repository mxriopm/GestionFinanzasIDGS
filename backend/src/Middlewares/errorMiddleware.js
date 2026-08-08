const errorMiddleware = (err, req, res, next) => {
  console.error('💥 Error detectado en el servidor:', err.stack || err.message);

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Identificador (ID) con formato inválido',
    });
  }

  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(400).json({
      error: `El valor ingresado para '${campo}' ya está registrado`,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
};

module.exports = errorMiddleware;