// Solo carga dotenv si estamos en entorno local (desarrollo)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = {
    port: process.env.PORT || 3000,
    db: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/finanzasIDGS',
    jwtSecret: process.env.JWT_SECRET || 'clave_secreta_cambiarla'
};