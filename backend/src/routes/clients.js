const router = require('express').Router();
const { Client, Address } = require('../models');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const clients = await Client.findAll({ include: [{ model: Address, as: 'addresses' }] });
    res.json(clients);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, email, taxId, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Nazwa klienta jest wymagana' });
    const client = await Client.create({ name, phone, email, taxId, notes });
    res.status(201).json(client);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Nie znaleziono klienta' });
    await client.update(req.body);
    res.json(client);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Nie znaleziono klienta' });
    await client.destroy();
    res.json({ message: 'Klient usunięty' });
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// Addresses for a client
router.get('/:id/addresses', async (req, res) => {
  try {
    const addresses = await Address.findAll({ where: { clientId: req.params.id } });
    res.json(addresses);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.post('/:id/addresses', async (req, res) => {
  try {
    const { label, street, city, postalCode } = req.body;
    if (!street || !city) return res.status(400).json({ message: 'Ulica i miasto są wymagane' });
    const address = await Address.create({ clientId: req.params.id, label, street, city, postalCode });
    res.status(201).json(address);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.put('/addresses/:id', async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.id);
    if (!address) return res.status(404).json({ message: 'Nie znaleziono adresu' });
    await address.update(req.body);
    res.json(address);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.delete('/addresses/:id', async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.id);
    if (!address) return res.status(404).json({ message: 'Nie znaleziono adresu' });
    await address.destroy();
    res.json({ message: 'Adres usunięty' });
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
