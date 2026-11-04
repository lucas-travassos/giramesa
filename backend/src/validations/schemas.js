const { exigir } = require('../utils/erroHttp');
const { emCentavos, formatarCentavos } = require('../utils/dinheiro');

const texto = (max) => (v) => {
  exigir(typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max, 400, `Texto obrigatório, com até ${max} caracteres.`);
  return v.trim();
};
const inteiro = (v) => {
  exigir((typeof v === 'number' || typeof v === 'string') && /^\d+$/.test(String(v)), 400, 'Identificador ou número inválido.');
  const numero = Number(v);
  exigir(Number.isSafeInteger(numero) && numero > 0 && numero <= 2147483647, 400, 'Número deve ser um inteiro positivo.');
  return numero;
};
const opcao = (...opcoes) => (v) => { exigir(opcoes.includes(v), 400, 'Opção inválida.'); return v; };
const dinheiro = (v) => {
  const centavos = emCentavos(v);
  exigir(centavos !== null && centavos > 0, 400, 'Valor deve ser positivo, com até duas casas decimais.');
  return formatarCentavos(centavos);
};
const email = (v) => {
  const normalizado = texto(150)(v).toLowerCase();
  exigir(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado), 400, 'E-mail inválido.');
  return normalizado;
};
const senha = (v) => {
  exigir(typeof v === 'string' && v.length > 0 && Buffer.byteLength(v, 'utf8') <= 72, 400, 'Senha obrigatória, com até 72 bytes.');
  return v;
};
const senhaCadastro = (v) => { const valor = senha(v); exigir(valor.length >= 6, 400, 'A senha deve ter no mínimo 6 caracteres.'); return valor; };
const descricao = (v) => { exigir(v === null || (typeof v === 'string' && v.length <= 65535), 400, 'Descrição inválida.'); return v || ''; };
const schemas = {
  pedido: { mesa_id: inteiro },
  item: { produto_id: inteiro, quantidade: inteiro, observacao: (v) => { exigir(v === null || (typeof v === 'string' && v.length <= 255), 400, 'Observação inválida.'); return v; } },
  pagamento: { forma_pagamento: opcao('dinheiro', 'debito', 'credito', 'pix'), valor: dinheiro },
  usuario: { nome: texto(100), email, senha: senhaCadastro, nivel_acesso: opcao('garcom', 'caixa', 'administrador') },
  usuarioEditar: { nome: texto(100), email, senha: senhaCadastro, nivel_acesso: opcao('garcom', 'caixa', 'administrador'), status: opcao('ativo', 'inativo') },
  produto: { categoria_id: inteiro, nome: texto(100), preco: dinheiro, descricao },
  produtoEditar: { categoria_id: inteiro, nome: texto(100), preco: dinheiro, descricao, status: opcao('ativo', 'inativo') },
  mesa: { numero: inteiro },
  mesaEditar: { numero: inteiro, status: opcao('disponivel', 'ocupada', 'caixa', 'inativa') },
  categoria: { nome: texto(50) },
  login: { email, senha },
};

function validar(corpo, nome, parcial = false) {
  exigir(corpo && typeof corpo === 'object' && !Array.isArray(corpo), 400, 'Informe um objeto JSON.');
  const schema = schemas[nome], dados = {};
  for (const [campo, converter] of Object.entries(schema)) {
    const informado = Object.hasOwn(corpo, campo);
    const opcional = ['descricao', 'quantidade', 'observacao'].includes(campo);
    if (nome === 'usuarioEditar' && campo === 'senha' && corpo[campo] === '') continue;
    exigir(informado || parcial || opcional, 400, `Campo ${campo} é obrigatório.`);
    if (informado) dados[campo] = converter(corpo[campo]);
  }
  exigir(Object.keys(dados).length > 0, 400, 'Nenhum campo válido informado.');
  return dados;
}

function validarId(req, res, next, valor, nome) {
  try { req.params[nome] = inteiro(valor); next(); }
  catch (erro) { next(erro); }
}

module.exports = { validar, validarId, inteiro };
