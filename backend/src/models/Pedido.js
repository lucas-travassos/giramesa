const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  pedido_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  mesa_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  usuario_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  data_abertura: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  data_fechamento: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('aberto', 'em_fechamento', 'finalizado'), allowNull: false, defaultValue: 'aberto' },
  valor_total: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0.00 },
}, { tableName: 'pedidos', timestamps: false });

module.exports = Pedido;
