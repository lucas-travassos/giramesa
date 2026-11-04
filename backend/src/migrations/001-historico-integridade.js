const { DataTypes } = require('sequelize');

const regras = [
  ['pedidos', 'ck_pedidos_total', 'valor_total >= 0'],
  ['pagamentos', 'ck_pagamentos_valor', 'valor > 0'],
  ['itens_pedido', 'ck_itens_quantidade', 'quantidade > 0'],
  ['itens_pedido', 'ck_itens_preco', 'preco_unitario > 0'],
  ['produtos', 'ck_produtos_preco', 'preco > 0'],
];

async function up(sequelize) {
  const qi = sequelize.getQueryInterface();
  // Preflight antes de DDL: nao corrige dados antigos silenciosamente.
  for (const [tabela, , expressao] of regras) {
    const [r] = await sequelize.query(`SELECT COUNT(*) AS invalidos FROM ${tabela} WHERE NOT (${expressao})`);
    if (Number(r[0].invalidos)) throw new Error(`Migração bloqueada: registros inválidos em ${tabela}.`);
  }
  const [orfaos] = await sequelize.query('SELECT COUNT(*) AS n FROM itens_pedido i LEFT JOIN produtos p ON p.produto_id=i.produto_id WHERE p.produto_id IS NULL');
  if (Number(orfaos[0].n)) throw new Error('Migração bloqueada: item sem produto de origem.');
  const colunas = await qi.describeTable('itens_pedido');
  if (!colunas.nome_produto) await qi.addColumn('itens_pedido', 'nome_produto', { type: DataTypes.STRING(100), allowNull: true });
  // O cadastro atual e a unica fonte disponivel para nomes de vendas anteriores.
  await sequelize.query('UPDATE itens_pedido i JOIN produtos p ON p.produto_id=i.produto_id SET i.nome_produto=p.nome WHERE i.nome_produto IS NULL');
  await qi.changeColumn('itens_pedido', 'nome_produto', { type: DataTypes.STRING(100), allowNull: false });
  const indices = await qi.showIndex('pedidos');
  if (!indices.some(i => i.name === 'ix_pedidos_status_fechamento')) {
    await qi.addIndex('pedidos', ['status', 'data_fechamento'], { name: 'ix_pedidos_status_fechamento' });
  }
  for (const [tabela, nome, expressao] of regras) {
    const [r] = await sequelize.query('SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME=:tabela AND CONSTRAINT_NAME=:nome', { replacements: { tabela, nome } });
    if (!r.length) await sequelize.query(`ALTER TABLE ${tabela} ADD CONSTRAINT ${nome} CHECK (${expressao})`);
  }
}

module.exports = { up };
