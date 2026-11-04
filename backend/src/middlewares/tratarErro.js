const { ErroHttp } = require('../utils/erroHttp');

function tratarErro(erro, req, res, next) {
  if (res.headersSent) return next(erro);
  if (erro instanceof ErroHttp) return res.status(erro.status).json({ erro: erro.message });
  if (erro.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido.' });
  if (erro.type === 'entity.too.large') return res.status(413).json({ erro: 'Corpo da requisição excede o limite permitido.' });
  if (erro.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ erro: 'Registro já cadastrado.' });
  if (erro.name === 'SequelizeForeignKeyConstraintError') return res.status(409).json({ erro: 'Operação bloqueada por registros vinculados.' });
  if (erro.name === 'SequelizeValidationError') return res.status(400).json({ erro: 'Dados inválidos.' });
  return res.status(500).json({ erro: 'Não foi possível processar a solicitação.' });
}

module.exports = tratarErro;
