import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function InitialConfigPage() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const load = () => api.get('/initial-config').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditItem(null); setForm({ name: '', description: '' }); setError(''); setShowModal(true); };
  const openEdit = (i) => { setEditItem(i); setForm({ name: i.name, description: i.description || '' }); setError(''); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editItem) {
        await api.put(`/initial-config/${editItem.id}`, form);
      } else {
        await api.post('/initial-config', form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Blad zapisu');
    }
  };

  const handleDelete = async (i) => {
    if (!window.confirm(`Usunac "${i.name}"?`)) return;
    await api.delete(`/initial-config/${i.id}`);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Konfiguracja wstepna</h1>
        <button className="btn btn-primary" onClick={openAdd}>Dodaj pozycje</button>
      </div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 700 }}>
          <p className="text-muted mb-16" style={{ fontSize: 13 }}>
            Pozycje z tej listy beda wyswietlane jako checkboxami przy dodawaniu nowego komputera.
          </p>
          <table>
            <thead><tr><th>Nazwa</th><th>Opis</th><th>Akcje</th></tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td className="text-muted">{i.description || '-'}</td>
                  <td>
                    <div className="d-flex gap-8">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(i)}>Edytuj</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i)}>Usun</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={3} className="text-muted" style={{ textAlign: 'center' }}>Brak pozycji</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Edytuj pozycje' : 'Nowa pozycja konfiguracji'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label required">Nazwa</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Opis</label>
                  <input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Anuluj</button>
                <button type="submit" className="btn btn-primary">Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
