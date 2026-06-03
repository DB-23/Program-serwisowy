const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Brak tokenu autoryzacji' });
  }
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Nieprawidłowy token' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Token wygasł lub jest nieprawidłowy' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Brak uprawnień administratora' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
