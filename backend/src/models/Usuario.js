const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  usuario_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  senha: { type: DataTypes.STRING(255), allowNull: false },
  nivel_acesso: { type: DataTypes.ENUM('garcom', 'caixa', 'administrador'), allowNull: false },
  status: { type: DataTypes.ENUM('ativo', 'inativo'), allowNull: false, defaultValue: 'ativo' },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'usuarios', timestamps: false });

module.exports = Usuario;
