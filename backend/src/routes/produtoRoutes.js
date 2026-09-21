const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const produtoController = require('../controllers/produtoController');

router.use(verifyToken);

router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscarPorId);
router.post('/', produtoController.criar);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.remover);

module.exports = router;
