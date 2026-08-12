const { app, port } = require('./src/app');
const conexion = require('./src/config/conexion');

conexion.conect()
    .then(() => {
        app.listen(port, '0.0.0.0', () => {
            console.log(`Servidor corriendo en el puerto ${port}`);
        });
    })
    .catch((error) => {
        console.error('[SERVER] No se pudo conectar a la DB:', error.message || error);
        process.exit(1);
    });