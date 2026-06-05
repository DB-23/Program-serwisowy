const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Address = require('./Address');
const EquipmentType = require('./EquipmentType');
const Status = require('./Status');
const ServiceActivity = require('./ServiceActivity');
const InitialConfigItem = require('./InitialConfigItem');
const Device = require('./Device');
const Setting = require('./Setting');

// Client <-> Address
Client.hasMany(Address, { foreignKey: 'client_id', as: 'addresses' });
Address.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Device associations
Device.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Device.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Device.belongsTo(User, { foreignKey: 'technician_id', as: 'technician' });
Device.belongsTo(User, { foreignKey: 'repair_technician_id', as: 'repairTechnician' });
Device.belongsTo(EquipmentType, { foreignKey: 'equipment_type_id', as: 'equipmentType' });
Device.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });

// Device <-> ServiceActivity (many-to-many)
Device.belongsToMany(ServiceActivity, {
  through: 'device_service_activities',
  foreignKey: 'device_id',
  otherKey: 'service_activity_id',
  as: 'serviceActivities',
});
ServiceActivity.belongsToMany(Device, {
  through: 'device_service_activities',
  foreignKey: 'service_activity_id',
  otherKey: 'device_id',
  as: 'devices',
});

// Device <-> InitialConfigItem (many-to-many with checked flag)
const { DataTypes } = require('sequelize');
const DeviceInitialConfig = sequelize.define('DeviceInitialConfig', {
  checked: { type: DataTypes.BOOLEAN, defaultValue: false },
  value: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
}, { tableName: 'device_initial_config', timestamps: false });

Device.belongsToMany(InitialConfigItem, {
  through: DeviceInitialConfig,
  foreignKey: 'device_id',
  otherKey: 'initial_config_item_id',
  as: 'initialConfigItems',
});
InitialConfigItem.belongsToMany(Device, {
  through: DeviceInitialConfig,
  foreignKey: 'initial_config_item_id',
  otherKey: 'device_id',
  as: 'devices',
});

const syncDatabase = async () => {
  await sequelize.sync({ alter: true });

  // Seed default data
  const { Op } = require('sequelize');

  // Equipment types
  const defaultTypes = ['PC', 'Laptop', 'Inny'];
  for (const name of defaultTypes) {
    await EquipmentType.findOrCreate({ where: { name } });
  }

  // Default statuses
  const defaultStatuses = [
    { name: 'Na serwisie', color: '#ffc107' },
    { name: 'U klienta', color: '#28a745' },
    { name: 'Oczekuje na części', color: '#dc3545' },
    { name: 'Gotowe do odbioru', color: '#17a2b8' },
  ];
  for (const s of defaultStatuses) {
    await Status.findOrCreate({ where: { name: s.name }, defaults: s });
  }

  // Default admin user
  const adminExists = await User.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    await User.create({
      username: 'admin',
      password: 'zaq12wsxCDE#admin',
      firstName: 'Administrator',
      lastName: 'Systemu',
      role: 'admin',
    });
  }

  // Default service name setting
  await Setting.findOrCreate({
    where: { key: 'service_name' },
    defaults: { value: 'Serwis Komputerowy' },
  });
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Client,
  Address,
  EquipmentType,
  Status,
  ServiceActivity,
  InitialConfigItem,
  Device,
  Setting,
  DeviceInitialConfig,
};
