const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Podaj login i hasło' });
    }
    const user = await User.findOne({ where: { username } });
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Nieprawidłowy login lub hasło' });
    }
    const valid = await user.validatePassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Nieprawidłowy login lub hasło' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

module.exports = router;
