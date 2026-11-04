const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { limitarLogin } = require('../config/seguranca');

router.post('/login', limitarLogin, login);

module.exports = router;
