const router = require('express').Router();
const { ServiceActivity } = require('../models');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try { res.json(await ServiceActivity.findAll()); }
  catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nazwa jest wymagana' });
    const item = await ServiceActivity.create({ name });
    res.status(201).json(item);
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await ServiceActivity.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Nie znaleziono' });
    await item.update(req.body);
    res.json(item);
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await ServiceActivity.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Nie znaleziono' });
    await item.destroy();
    res.json({ message: 'Usunięto' });
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

module.exports = router;
