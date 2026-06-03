const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InitialConfigItem = sequelize.define('InitialConfigItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
}, {
  tableName: 'initial_config_items',
  timestamps: false,
});

module.exports = InitialConfigItem;
