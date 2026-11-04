const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const { ErroHttp } = require('../utils/erroHttp');

function positivo(nome, padrao) {
  const numero = process.env[nome] === undefined ? padrao : Number(process.env[nome]);
  if (!Number.isSafeInteger(numero) || numero <= 0) throw new Error(`Configuração ${nome} inválida.`);
  return numero;
}

function configurarSeguranca(app) {
  // Ambiente local HTTP; HSTS e upgrade de HTTPS dependem de uma publicacao futura.
  app.use(helmet({ strictTransportSecurity: false, contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } } }));
  const origens = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(v => v.trim()).filter(Boolean);
  app.use(cors({ origin(origem, callback) {
    if (!origem || origens.includes(origem)) return callback(null, true);
    return callback(new ErroHttp(403, 'Origem não autorizada.'));
  } }));
}

const limitarLogin = rateLimit({
  windowMs: positivo('LOGIN_JANELA_MS', 15 * 60 * 1000),
  limit: positivo('LOGIN_MAX_TENTATIVAS', 10),
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Aguarde e tente novamente.' },
});

module.exports = { configurarSeguranca, limitarLogin };
