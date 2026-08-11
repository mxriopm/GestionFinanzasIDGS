const { app, port } = require('./src/app');
const conexion = require('./src/config/conexion');

conexion.conect();

app.listen(port);