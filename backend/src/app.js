const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const rutaRegistro = require('./routes/rutaRegistro');
const rutaUsuarios = require('./routes/rutaUsuarios');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', rutaRegistro);
app.use('/usuarios', rutaUsuarios);

module.exports = {
    app,
    port
}