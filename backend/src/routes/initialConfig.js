const router = require('express').Router();
const { InitialConfigItem } = require('../models');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try { res.json(await InitialConfigItem.findAll()); }
  catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Nazwa jest wymagana' });
    const item = await InitialConfigItem.create({ name, description });
    res.status(201).json(item);
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await InitialConfigItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Nie znaleziono' });
    await item.update(req.body);
    res.json(item);
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await InitialConfigItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Nie znaleziono' });
    await item.destroy();
    res.json({ message: 'Usunięto' });
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

module.exports = router;
