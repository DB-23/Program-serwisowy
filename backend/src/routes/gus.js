const router = require('express').Router();
const https = require('https');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

function parseAddress(str) {
  if (!str) return null;
  // Format: "UL. PRZYKŁADOWA 1, 00-001 WARSZAWA"
  const match = str.match(/^(.+),\s*(\d{2}-\d{3})\s+(.+)$/);
  if (match) {
    return { street: match[1].trim(), postalCode: match[2].trim(), city: match[3].trim() };
  }
  const parts = str.split(',');
  if (parts.length >= 2) {
    return { street: parts[0].trim(), city: parts.slice(1).join(',').trim(), postalCode: '' };
  }
  return { street: str, city: '', postalCode: '' };
}

router.get('/nip/:nip', (req, res) => {
  const nip = req.params.nip.replace(/[\s\-]/g, '');
  if (!/^\d{10}$/.test(nip)) {
    return res.status(400).json({ message: 'NIP musi składać się z 10 cyfr' });
  }

  const today = new Date().toISOString().split('T')[0];
  const url = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${today}`;

  https.get(url, { headers: { 'Accept': 'application/json' } }, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => { data += chunk; });
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);

        if (json.code) {
          return res.status(404).json({ message: 'Nie znaleziono podmiotu o podanym NIP w rejestrze MF' });
        }

        const subject = json.result?.subject;
        if (!subject) {
          return res.status(404).json({ message: 'Brak danych dla podanego NIP' });
        }

        const rawAddress = subject.workingAddress || subject.residenceAddress || null;
        const parsedAddress = parseAddress(rawAddress);

        res.json({
          name: subject.name,
          nip: subject.nip,
          regon: subject.regon || '',
          krs: subject.krs || '',
          statusVat: subject.statusVat,
          rawAddress,
          parsedAddress,
        });
      } catch {
        res.status(500).json({ message: 'Błąd parsowania odpowiedzi z API MF' });
      }
    });
  }).on('error', (err) => {
    res.status(502).json({ message: 'Błąd połączenia z API Ministerstwa Finansów: ' + err.message });
  });
});

module.exports = router;
