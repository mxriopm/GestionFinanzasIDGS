const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');


router.post('/registro', registroController.registrar)
    .post('/login', registroController.login)

module.exports = router;