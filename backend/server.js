const { app, port } = require('./src/app');
const conexion = require('./src/config/conexion');

conexion.conect()

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});