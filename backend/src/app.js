const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const rutaRegistro = require('./routes/rutaRegistro');
const rutaUsuarios = require('./routes/rutaUsuarios');
const rutaIngresos = require('./routes/rutaIngresos');
const rutaGastos = require('./routes/rutaGastos');
const rutaPresupuestos = require('./routes/rutaPresupuestos');
const rutaAportaciones = require('./routes/rutaAportaciones');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', rutaRegistro);
app.use('/usuarios', rutaUsuarios);
app.use('/ingresos', rutaIngresos);
app.use('/gastos', rutaGastos);
app.use('/presupuestos', rutaPresupuestos);
app.use('/aportaciones', rutaAportaciones);

module.exports = {
    app,
    port
}