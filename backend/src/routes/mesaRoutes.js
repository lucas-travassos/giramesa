const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verificarPermissao = require('../middlewares/verificarPermissao');
const mesaController = require('../controllers/mesaController');

router.use(verifyToken);

const operacional = verificarPermissao('garcom', 'caixa', 'administrador');
const somenteAdmin = verificarPermissao('administrador');

// Leitura: todos os perfis (o salao precisa listar as mesas)
router.get('/', operacional, mesaController.listar);
router.get('/:id', operacional, mesaController.buscarPorId);

// Escrita: somente administrador
router.post('/', somenteAdmin, mesaController.criar);
router.put('/:id', somenteAdmin, mesaController.atualizar);
router.delete('/:id', somenteAdmin, mesaController.remover);

module.exports = router;
