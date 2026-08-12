const mongoose = require('mongoose');
const { db } = require('./config');

module.exports = {
    connection: null,
    conect: async function () {
        if (this.connection) return this.connection;

        try {
            const connection = await mongoose.connect(db, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });
            this.connection = connection;
            console.log('[DB] MongoDB conectado');
            return connection;
        } catch (error) {
            console.error('[DB] Error conectando a MongoDB:', error.message || error);
            return Promise.reject(error);
        }
    }
};