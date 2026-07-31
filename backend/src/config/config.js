require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    db: process.env.MONGODB || 'mongodb://localhost:27017/finanzasIDGS',
    jwtSecret: process.env.JWT_SECRET || 'clave_secreta_cambirla'
}