require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { syncDatabase } = require('./models');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/statuses', require('./routes/statuses'));
app.use('/api/service-activities', require('./routes/serviceActivities'));
app.use('/api/initial-config', require('./routes/initialConfig'));
app.use('/api/equipment-types', require('./routes/equipmentTypes'));
app.use('/api/settings', require('./routes/settings'));

const PORT = process.env.PORT || 5000;

syncDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend działa na porcie ${PORT}`));
  })
  .catch(err => {
    console.error('Błąd połączenia z bazą danych:', err.message);
    process.exit(1);
  });
