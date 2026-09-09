const { sequelize, Categoria, Produto } = require('../models');

const produtos = [
  { categoria: 'Refrigerantes', nome: 'Coca-Cola Lata', descricao: 'Refrigerante 350ml', preco: 6.00 },
  { categoria: 'Refrigerantes', nome: 'Guaraná Antarctica Lata', descricao: 'Refrigerante 350ml', preco: 6.00 },
  { categoria: 'Sucos', nome: 'Suco de Laranja', descricao: 'Suco natural 300ml', preco: 8.00 },
  { categoria: 'Sucos', nome: 'Suco de Maracujá', descricao: 'Suco natural 300ml', preco: 8.00 },
  { categoria: 'Pizzas', nome: 'Pizza Margherita', descricao: 'Molho, mussarela e manjericão', preco: 45.00 },
  { categoria: 'Pizzas', nome: 'Pizza Calabresa', descricao: 'Molho, mussarela e calabresa', preco: 48.00 },
  { categoria: 'Hamburguers', nome: 'X-Burguer', descricao: 'Pão, carne, queijo e salada', preco: 22.00 },
  { categoria: 'Hamburguers', nome: 'X-Bacon', descricao: 'Pão, carne, queijo, bacon e salada', preco: 26.00 },
];

async function seed() {
  try {
    for (const p of produtos) {
      const categoria = await Categoria.findOne({ where: { nome: p.categoria } });
      if (!categoria) {
        console.warn(`Categoria "${p.categoria}" não encontrada, pulando produto "${p.nome}"`);
        continue;
      }
      const [produto, criado] = await Produto.findOrCreate({
        where: { nome: p.nome },
        defaults: {
          categoria_id: categoria.categoria_id,
          descricao: p.descricao,
          preco: p.preco,
        },
      });
      console.log(criado ? `Criado: ${produto.nome}` : `Já existia: ${produto.nome}`);
    }
    console.log('Seed finalizado.');
  } catch (err) {
    console.error('Erro no seed:', err.message);
  } finally {
    process.exit();
  }
}

seed();
