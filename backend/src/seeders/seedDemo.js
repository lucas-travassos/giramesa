const { Op } = require('sequelize');
const { sequelize, Usuario, Mesa, Categoria, Produto, Pedido, ItemPedido, Pagamento } = require('../models');

const PREFIXO = 'giramesa:demo:v1';
const DIA_MS = 86400000;
const FORMAS = ['dinheiro', 'debito', 'credito', 'pix'];
const CARDAPIO = [
  { nome: 'Demo - Refeição', categoria: 'Demo - Pratos', centavos: 2500 },
  { nome: 'Demo - Suco', categoria: 'Demo - Bebidas', centavos: 800 },
  { nome: 'Demo - Sobremesa', categoria: 'Demo - Sobremesas', centavos: 1200 },
];

async function criarDadosDemo(transaction, agora = new Date()) {
  // O bloqueio da conta serializa duas execucoes da seed, sem alterar o usuario.
  const usuario = await Usuario.findOne({
    where: { email: 'garcom@giramesa.com', status: 'ativo', nivel_acesso: 'garcom' },
    attributes: ['usuario_id'],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!usuario) throw new Error('O usuário de demonstração garcom@giramesa.com deve existir e estar ativo como garçom.');

  const hoje = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(agora);
  const inicioHoje = new Date(`${hoje}T00:00:00-03:00`);
  const anterior = await ItemPedido.findOne({
    where: { observacao: { [Op.like]: `${PREFIXO}:%` } },
    include: [{ model: Pedido, attributes: ['mesa_id'], required: true }],
    order: [['item_id', 'ASC']],
    transaction,
  });
  let mesaId = anterior?.Pedido.mesa_id;
  if (!mesaId) {
    const maiorNumero = await Mesa.max('numero', { transaction });
    const mesa = await Mesa.create({ numero: Number(maiorNumero ?? 0) + 1, status: 'disponivel' }, { transaction });
    mesaId = mesa.mesa_id;
  }

  const produtos = [];
  for (const item of CARDAPIO) {
    const [categoria] = await Categoria.findOrCreate({ where: { nome: item.categoria }, transaction });
    const [produto] = await Produto.findOrCreate({
      where: { nome: item.nome, categoria_id: categoria.categoria_id },
      defaults: {
        descricao: 'Produto fictício para demonstração do GiraMesa.',
        preco: (item.centavos / 100).toFixed(2),
        status: 'ativo',
      },
      transaction,
    });
    produtos.push(produto);
  }

  let criados = 0;
  let existentes = 0;
  for (let deslocamento = 6; deslocamento >= 0; deslocamento--) {
    const inicioDia = new Date(inicioHoje.getTime() - deslocamento * DIA_MS);
    const data = inicioDia.toISOString().slice(0, 10);
    const consumos = [
      [[0, 1], [1, 1 + deslocamento % 2]],
      [[0, 2 + deslocamento % 3], [1, 2], [2, 1]],
      [[0, 1], [2, 1 + deslocamento % 2]],
    ];
    for (let indice = 0; indice < consumos.length; indice++) {
      const marcador = `${PREFIXO}:${data}:${indice + 1}`;
      if (await ItemPedido.findOne({ where: { observacao: marcador }, attributes: ['item_id'], transaction })) {
        existentes++;
        continue;
      }

      // As vendas de hoje nunca recebem horario posterior ao momento da execucao.
      const fechamento = new Date(Math.min(inicioDia.getTime() + (12 + indice * 3) * 3600000, agora.getTime()));
      const totalCentavos = consumos[indice].reduce((soma, [produto, quantidade]) => (
        soma + CARDAPIO[produto].centavos * quantidade
      ), 0);
      const pedido = await Pedido.create({
        mesa_id: mesaId,
        usuario_id: usuario.usuario_id,
        status: 'finalizado',
        data_abertura: new Date(fechamento.getTime() - 30 * 60000),
        data_fechamento: fechamento,
        valor_total: (totalCentavos / 100).toFixed(2),
      }, { transaction });
      await ItemPedido.bulkCreate(consumos[indice].map(([produto, quantidade]) => ({
        pedido_id: pedido.pedido_id,
        produto_id: produtos[produto].produto_id,
        quantidade,
        preco_unitario: (CARDAPIO[produto].centavos / 100).toFixed(2),
        observacao: marcador,
      })), { transaction });

      const partes = indice === 1
        ? [Math.floor(totalCentavos / 2), totalCentavos - Math.floor(totalCentavos / 2)]
        : [totalCentavos];
      await Pagamento.bulkCreate(partes.map((centavos, parte) => ({
        pedido_id: pedido.pedido_id,
        forma_pagamento: FORMAS[(deslocamento + (indice === 2 ? 3 : indice) + parte) % FORMAS.length],
        valor: (centavos / 100).toFixed(2),
        data_pagamento: fechamento,
      })), { transaction });
      criados++;
    }
  }
  return { criados, existentes, mesaId, dataReferencia: hoje };
}

async function seedDemo() {
  return sequelize.transaction((transaction) => criarDadosDemo(transaction));
}

async function executar() {
  try {
    await sequelize.authenticate();
    const resultado = await seedDemo();
    console.log(`Demonstração preparada: ${resultado.criados} pedidos criados e ${resultado.existentes} já existentes.`);
    console.log(`Período: últimos sete dias até ${resultado.dataReferencia} (São Paulo). Mesa de demonstração ID: ${resultado.mesaId}.`);
    console.log('Dados anteriores preservados. Abra o Dashboard e clique em Atualizar.');
  } catch {
    console.error('Não foi possível gerar a demonstração. Verifique a conexão, as tabelas e o usuário garcom@giramesa.com ativo como garçom. As alterações desta execução foram revertidas.');
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) executar();

module.exports = { seedDemo, criarDadosDemo };
