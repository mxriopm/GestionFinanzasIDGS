const mongoose = require('mongoose');
const { db } = require('./config');

module.exports = {
    connection: null,
    conect: function () {
        if (this.connection) return this.connection;
        return mongoose.connect(db, {
            
        }).then((connection) => {
            this.connection = connection;
            console.log('Conexión a la base de datos establecida');
        }).catch((error) => { console.log(error) });
    }
}