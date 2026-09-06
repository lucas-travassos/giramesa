const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Mesa = require('./Mesa');
const Categoria = require('./Categoria');
const Produto = require('./Produto');
const Pedido = require('./Pedido');
const ItemPedido = require('./ItemPedido');
const Pagamento = require('./Pagamento');

// Categoria 1:N Produto
Categoria.hasMany(Produto, { foreignKey: 'categoria_id' });
Produto.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Mesa 1:N Pedido
Mesa.hasMany(Pedido, { foreignKey: 'mesa_id' });
Pedido.belongsTo(Mesa, { foreignKey: 'mesa_id' });

// Usuario 1:N Pedido
Usuario.hasMany(Pedido, { foreignKey: 'usuario_id' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Pedido 1:N ItemPedido
Pedido.hasMany(ItemPedido, { foreignKey: 'pedido_id' });
ItemPedido.belongsTo(Pedido, { foreignKey: 'pedido_id' });

// Produto 1:N ItemPedido
Produto.hasMany(ItemPedido, { foreignKey: 'produto_id' });
ItemPedido.belongsTo(Produto, { foreignKey: 'produto_id' });

// Pedido 1:N Pagamento
Pedido.hasMany(Pagamento, { foreignKey: 'pedido_id' });
Pagamento.belongsTo(Pedido, { foreignKey: 'pedido_id' });

module.exports = {
  sequelize,
  Usuario,
  Mesa,
  Categoria,
  Produto,
  Pedido,
  ItemPedido,
  Pagamento,
};
