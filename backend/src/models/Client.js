const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(150) },
  taxId: { type: DataTypes.STRING(20), field: 'tax_id' },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'clients',
  timestamps: true,
});

module.exports = Client;
