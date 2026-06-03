const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceActivity = sequelize.define('ServiceActivity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
}, {
  tableName: 'service_activities',
  timestamps: false,
});

module.exports = ServiceActivity;
