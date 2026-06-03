const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EquipmentType = sequelize.define('EquipmentType', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
}, {
  tableName: 'equipment_types',
  timestamps: false,
});

module.exports = EquipmentType;
