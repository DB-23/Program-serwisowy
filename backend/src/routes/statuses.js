const router = require('express').Router();
const { Status } = require('../models');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    res.json(await Status.findAll());
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Nazwa jest wymagana' });
    const status = await Status.create({ name, color });
    res.status(201).json(status);
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const s = await Status.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Nie znaleziono' });
    await s.update(req.body);
    res.json(s);
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const s = await Status.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Nie znaleziono' });
    await s.destroy();
    res.json({ message: 'Status usunięty' });
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

module.exports = router;
