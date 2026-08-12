const { app, port } = require('./src/app');
const conexion = require('./src/config/conexion');

conexion.conect()
    .then(() => {
        app.listen(port, () => {
            console.log(`[SERVER] Escuchando en puerto ${port}`);
        });
    })
    .catch((error) => {
        console.error('[SERVER] No se pudo conectar a la DB, servidor detenido');
        console.error(error);
        process.exit(1);
    });