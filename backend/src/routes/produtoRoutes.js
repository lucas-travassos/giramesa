const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verificarPermissao = require('../middlewares/verificarPermissao');
const produtoController = require('../controllers/produtoController');

router.use(verifyToken);

router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscarPorId);
router.post('/', verificarPermissao('administrador'), produtoController.criar);
router.put('/:id', verificarPermissao('administrador'), produtoController.atualizar);
router.delete('/:id', verificarPermissao('administrador'), produtoController.remover);

module.exports = router;
