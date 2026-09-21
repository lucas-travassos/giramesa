const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const usuarioController = require('../controllers/usuarioController');

router.use(verifyToken);

router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.buscarPorId);
router.post('/', usuarioController.criar);
router.put('/:id', usuarioController.atualizar);
router.delete('/:id', usuarioController.remover);

module.exports = router;
