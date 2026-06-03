const router = require('express').Router();
const { User } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, password, firstName, lastName, role } = req.body;
    if (!username || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Wypełnij wszystkie wymagane pola' });
    }
    const exists = await User.findOne({ where: { username } });
    if (exists) {
      return res.status(409).json({ message: 'Użytkownik o tej nazwie już istnieje' });
    }
    const user = await User.create({ username, password, firstName, lastName, role });
    const { password: _p, ...data } = user.toJSON();
    res.status(201).json(data);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
    const { firstName, lastName, role, active, password } = req.body;
    await user.update({ firstName, lastName, role, active, ...(password ? { password } : {}) });
    const { password: _p, ...data } = user.toJSON();
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Nie możesz usunąć własnego konta' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
    await user.update({ active: false });
    res.json({ message: 'Użytkownik dezaktywowany' });
  } catch {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
