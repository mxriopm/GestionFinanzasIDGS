const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorMiddleware = require('./Middlewares/errorMiddleware');

const app = express();
const port = process.env.PORT || 3000;

// 1. Cabeceras de seguridad HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// 2. Control de CORS (maneja automáticamente las peticiones sin romper Express)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// 3. Limitador de peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas peticiones desde esta IP. Intenta de nuevo más tarde.' },
});
app.use(limiter);

// 4. Parsers de petición
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Rutas de la API
const rutaRegistro = require('./routes/rutaRegistro');
const rutaUsuarios = require('./routes/rutaUsuarios');
const rutaIngresos = require('./routes/rutaIngresos');
const rutaGastos = require('./routes/rutaGastos');
const rutaPresupuestos = require('./routes/rutaPresupuestos');
const rutaAportaciones = require('./routes/rutaAportaciones');

app.use('/auth', rutaRegistro);
app.use('/usuarios', rutaUsuarios);
app.use('/ingresos', rutaIngresos);
app.use('/gastos', rutaGastos);
app.use('/presupuestos', rutaPresupuestos);
app.use('/aportaciones', rutaAportaciones);

app.get('/', (req, res) => {
  res.json({ message: 'API Gestión Finanzas OK' });
});

// 6. Middleware global de manejo de errores
app.use(errorMiddleware);

module.exports = {
  app,
  port
};