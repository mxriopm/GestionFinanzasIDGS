const { app, port } = require('./src/app');
const conexion = require('./src/config/conexion');

// Intentar conexión a la base de datos
try {
  if (typeof conexion.conectar === 'function') {
    conexion.conectar();
  } else if (typeof conexion.conect === 'function') {
    conexion.conect();
  }
} catch (error) {
  console.error('Error al conectar con la base de datos:', error.message);
}

// Arrancar el servidor escuchando en la interfaz 0.0.0.0 exigida por Railway
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose correctamente en el puerto ${port}`);
});