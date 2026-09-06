const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produto = sequelize.define('Produto', {
  produto_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  categoria_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: false },
  preco: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
  status: { type: DataTypes.ENUM('ativo', 'inativo'), allowNull: false, defaultValue: 'ativo' },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'produtos', timestamps: false });

module.exports = Produto;
