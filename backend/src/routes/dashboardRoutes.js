const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const verificarPermissao = require('../middlewares/verificarPermissao');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();
router.use(verifyToken);
router.get('/', verificarPermissao('administrador'), dashboardController.resumir);

module.exports = router;
