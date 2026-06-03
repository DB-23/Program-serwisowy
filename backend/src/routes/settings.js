const router = require('express').Router();
const { Setting } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json(obj);
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

router.put('/:key', requireAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    const [setting] = await Setting.findOrCreate({ where: { key: req.params.key } });
    await setting.update({ value });
    res.json(setting);
  } catch { res.status(500).json({ message: 'Błąd serwera' }); }
});

module.exports = router;
