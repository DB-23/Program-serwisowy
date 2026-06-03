const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clientId: { type: DataTypes.INTEGER, allowNull: false, field: 'client_id' },
  label: { type: DataTypes.STRING(100) },
  street: { type: DataTypes.STRING(200), allowNull: false },
  city: { type: DataTypes.STRING(100), allowNull: false },
  postalCode: { type: DataTypes.STRING(10), field: 'postal_code' },
}, {
  tableName: 'addresses',
  timestamps: true,
});

module.exports = Address;
