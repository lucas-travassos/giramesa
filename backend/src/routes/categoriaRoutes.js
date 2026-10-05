const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verificarPermissao = require('../middlewares/verificarPermissao');
const categoriaController = require('../controllers/categoriaController');

router.use(verifyToken);
router.use(verificarPermissao('administrador'));

router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.buscarPorId);
router.post('/', categoriaController.criar);
router.put('/:id', categoriaController.atualizar);
router.delete('/:id', categoriaController.remover);

module.exports = router;
