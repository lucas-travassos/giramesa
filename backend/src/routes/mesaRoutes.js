const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verificarPermissao = require('../middlewares/verificarPermissao');
const mesaController = require('../controllers/mesaController');

router.use(verifyToken);
router.use(verificarPermissao('administrador'));

router.get('/', mesaController.listar);
router.get('/:id', mesaController.buscarPorId);
router.post('/', mesaController.criar);
router.put('/:id', mesaController.atualizar);
router.delete('/:id', mesaController.remover);

module.exports = router;
