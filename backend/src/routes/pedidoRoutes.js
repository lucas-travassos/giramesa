const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verificarPermissao = require('../middlewares/verificarPermissao');
const pedidoController = require('../controllers/pedidoController');

router.use(verifyToken);

const operacional = verificarPermissao('garcom', 'caixa', 'administrador');
const fechamento = verificarPermissao('caixa', 'administrador');

router.get('/', operacional, pedidoController.listar);
router.get('/:id', operacional, pedidoController.buscarPorId);
router.post('/', operacional, pedidoController.abrirOuBuscarPedido);
router.post('/:id/itens', operacional, pedidoController.adicionarItem);
router.put('/:id/itens/:itemId', operacional, pedidoController.atualizarItem);
router.delete('/:id/itens/:itemId', operacional, pedidoController.removerItem);

router.post('/:id/fechar', fechamento, pedidoController.iniciarFechamento);
router.post('/:id/cancelar-fechamento', fechamento, pedidoController.cancelarFechamento);
router.post('/:id/pagamentos', fechamento, pedidoController.registrarPagamento);
router.get('/:id/pagamentos', fechamento, pedidoController.listarPagamentos);

module.exports = router;
