const pedidos = require('../services/pedidoService');
const { validar } = require('../validations/schemas');
const { exigir } = require('../utils/erroHttp');

const schemas = { abrirOuBuscarPedido: 'pedido', adicionarItem: 'item', registrarPagamento: 'pagamento' };
function contexto(req, nome) {
  let body = req.body || {};
  exigir(typeof body === 'object' && !Array.isArray(body), 400, 'Informe um objeto JSON.');
  if (schemas[nome]) body = validar(body, schemas[nome]);
  return { id: req.params.id, itemId: req.params.itemId, query: req.query, body, usuarioId: req.usuario.usuario_id };
}
const responder = (nome, status = 200) => async (req, res) => {
  const resultado = await pedidos[nome](contexto(req, nome));
  res.status(status).json(resultado);
};

async function abrirOuBuscarPedido(req, res) {
  const resultado = await pedidos.abrirOuBuscarPedido(contexto(req, 'abrirOuBuscarPedido'));
  res.status(resultado.criado ? 201 : 200).json(resultado.pedido);
}

module.exports = {
  abrirOuBuscarPedido,
  buscarPorId: responder('buscarPorId'),
  listar: responder('listar'),
  adicionarItem: responder('adicionarItem', 201),
  atualizarItem: responder('atualizarItem'),
  removerItem: responder('removerItem'),
  iniciarFechamento: responder('iniciarFechamento'),
  cancelarFechamento: responder('cancelarFechamento'),
  registrarPagamento: responder('registrarPagamento', 201),
  listarPagamentos: responder('listarPagamentos'),
};
