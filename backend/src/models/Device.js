const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Device = sequelize.define('Device', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  entryType: {
    type: DataTypes.ENUM('new_computer', 'service'),
    allowNull: false,
    defaultValue: 'service',
    field: 'entry_type',
  },
  clientId: { type: DataTypes.INTEGER, allowNull: false, field: 'client_id' },
  addressId: { type: DataTypes.INTEGER, field: 'address_id' },
  receivedDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'received_date' },
  technicianId: { type: DataTypes.INTEGER, allowNull: false, field: 'technician_id' },
  equipmentTypeId: { type: DataTypes.INTEGER, field: 'equipment_type_id' },
  serialNumber: { type: DataTypes.STRING(100), field: 'serial_number' },
  operatingSystem: { type: DataTypes.STRING(100), field: 'operating_system' },
  mssqlVersion: { type: DataTypes.STRING(100), field: 'mssql_version' },
  manufacturer: { type: DataTypes.STRING(100) },
  cpu: { type: DataTypes.STRING(150) },
  motherboard: { type: DataTypes.STRING(150) },
  ramAmount: { type: DataTypes.STRING(50), field: 'ram_amount' },
  ramType: { type: DataTypes.STRING(50), field: 'ram_type' },
  storageSize: { type: DataTypes.STRING(50), field: 'storage_size' },
  storageType: { type: DataTypes.STRING(50), field: 'storage_type' },
  gpu: { type: DataTypes.STRING(150) },
  damageDescription: { type: DataTypes.TEXT, field: 'damage_description' },
  workHours: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0, field: 'work_hours' },
  repairTechnicianId: { type: DataTypes.INTEGER, field: 'repair_technician_id' },
  statusId: { type: DataTypes.INTEGER, field: 'status_id' },
  releaseDate: { type: DataTypes.DATEONLY, field: 'release_date' },
  repairDescription: { type: DataTypes.TEXT, field: 'repair_description' },
  invoiceIssued: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'invoice_issued' },
}, {
  tableName: 'devices',
  timestamps: true,
});

module.exports = Device;
