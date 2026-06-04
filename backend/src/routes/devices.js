const router = require('express').Router();
const { Device, Client, Address, User, EquipmentType, Status, ServiceActivity, InitialConfigItem } = require('../models');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

const deviceIncludes = [
  { model: Client, as: 'client', attributes: ['id', 'name'] },
  { model: Address, as: 'address' },
  { model: User, as: 'technician', attributes: ['id', 'firstName', 'lastName'] },
  { model: User, as: 'repairTechnician', attributes: ['id', 'firstName', 'lastName'] },
  { model: EquipmentType, as: 'equipmentType' },
  { model: Status, as: 'status' },
  { model: ServiceActivity, as: 'serviceActivities', through: { attributes: [] } },
  { model: InitialConfigItem, as: 'initialConfigItems', through: { attributes: ['checked'] } },
];

router.get('/', async (req, res) => {
  try {
    const devices = await Device.findAll({ include: deviceIncludes, order: [['createdAt', 'DESC']] });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id, { include: deviceIncludes });
    if (!device) return res.status(404).json({ message: 'Nie znaleziono urządzenia' });
    res.json(device);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

const nullifyEmptyIds = (fields) => {
  const idFields = ['clientId', 'addressId', 'equipmentTypeId', 'repairTechnicianId', 'statusId', 'technicianId'];
  for (const f of idFields) {
    if (fields[f] === '' || fields[f] === null) fields[f] = null;
    else if (fields[f] !== undefined) fields[f] = Number(fields[f]) || null;
  }
  return fields;
};

router.post('/', async (req, res) => {
  try {
    const { serviceActivityIds, initialConfigItems, ...fields } = req.body;
    fields.technicianId = req.user.id;
    nullifyEmptyIds(fields);
    const device = await Device.create(fields);

    if (serviceActivityIds?.length) {
      await device.setServiceActivities(serviceActivityIds);
    }
    if (initialConfigItems?.length) {
      const { DeviceInitialConfig } = require('../models');
      for (const item of initialConfigItems) {
        await DeviceInitialConfig.findOrCreate({
          where: { device_id: device.id, initial_config_item_id: item.id },
          defaults: { checked: item.checked || false },
        });
      }
    }

    const created = await Device.findByPk(device.id, { include: deviceIncludes });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera: ' + err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (!device) return res.status(404).json({ message: 'Nie znaleziono urządzenia' });

    const { serviceActivityIds, initialConfigItems, ...fields } = req.body;
    nullifyEmptyIds(fields);
    await device.update(fields);

    if (serviceActivityIds !== undefined) {
      await device.setServiceActivities(serviceActivityIds);
    }
    if (initialConfigItems?.length) {
      const { DeviceInitialConfig } = require('../models');
      await DeviceInitialConfig.destroy({ where: { device_id: device.id } });
      for (const item of initialConfigItems) {
        await DeviceInitialConfig.create({
          device_id: device.id,
          initial_config_item_id: item.id,
          checked: item.checked || false,
        });
      }
    }

    const updated = await Device.findByPk(device.id, { include: deviceIncludes });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera: ' + err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (!device) return res.status(404).json({ message: 'Nie znaleziono urządzenia' });
    await device.destroy();
    res.json({ message: 'Urządzenie usunięte' });
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
