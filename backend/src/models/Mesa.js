const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mesa = sequelize.define('Mesa', {
  mesa_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  numero: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  status: { type: DataTypes.ENUM('disponivel', 'ocupada', 'caixa'), allowNull: false, defaultValue: 'disponivel' },
}, { tableName: 'mesas', timestamps: false });

module.exports = Mesa;
