import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function SettingsPage() {
  const [serviceName, setServiceName] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings').then(r => {
      setServiceName(r.data.service_name || '');
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.put('/settings/service_name', { value: serviceName });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="spinner">Ladowanie...</div>;

  return (
    <div>
      <div className="page-header"><h1>Ustawienia</h1></div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-title">Ustawienia serwisu</div>
          {saved && <div className="alert alert-success">Ustawienia zapisane</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label required">Nazwa serwisu</label>
              <input
                className="form-control"
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Zapisz</button>
          </form>
        </div>
      </div>
    </div>
  );
}
