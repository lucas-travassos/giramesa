const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const pedidoController = require('../controllers/pedidoController');

router.use(verifyToken);

router.get('/', pedidoController.listar);
router.get('/:id', pedidoController.buscarPorId);
router.post('/', pedidoController.abrirOuBuscarPedido);
router.post('/:id/itens', pedidoController.adicionarItem);
router.put('/:id/itens/:itemId', pedidoController.atualizarItem);
router.delete('/:id/itens/:itemId', pedidoController.removerItem);

module.exports = router;
