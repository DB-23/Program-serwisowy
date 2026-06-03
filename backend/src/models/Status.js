const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Status = sequelize.define('Status', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  color: { type: DataTypes.STRING(7), defaultValue: '#6c757d' },
}, {
  tableName: 'statuses',
  timestamps: false,
});

module.exports = Status;
