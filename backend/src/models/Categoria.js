const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  categoria_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(50), allowNull: false, unique: true },
}, { tableName: 'categorias', timestamps: false });

module.exports = Categoria;
