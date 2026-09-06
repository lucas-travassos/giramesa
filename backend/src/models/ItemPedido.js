const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ItemPedido = sequelize.define('ItemPedido', {
  item_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  pedido_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  produto_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  quantidade: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  preco_unitario: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
  observacao: { type: DataTypes.STRING(255), allowNull: true },
}, { tableName: 'itens_pedido', timestamps: false });

module.exports = ItemPedido;
