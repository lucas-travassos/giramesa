const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pagamento = sequelize.define('Pagamento', {
  pagamento_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  pedido_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  forma_pagamento: { type: DataTypes.ENUM('dinheiro', 'debito', 'credito', 'pix'), allowNull: false },
  valor: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
  data_pagamento: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'pagamentos', timestamps: false });

module.exports = Pagamento;
