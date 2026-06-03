import React, { useEffect, useState } from 'react';
import api from '../services/api';

const defaultColors = ['#ffc107', '#28a745', '#dc3545', '#17a2b8', '#6c757d', '#0d6efd', '#6f42c1'];

export default function StatusesPage() {
  const [statuses, setStatuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#6c757d' });
  const [error, setError] = useState('');

  const load = () => api.get('/statuses').then(r => setStatuses(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditItem(null); setForm({ name: '', color: '#6c757d' }); setError(''); setShowModal(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ name: s.name, color: s.color }); setError(''); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editItem) {
        await api.put(`/statuses/${editItem.id}`, form);
      } else {
        await api.post('/statuses', form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Blad zapisu');
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Usunac status "${s.name}"?`)) return;
    await api.delete(`/statuses/${s.id}`);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Statusy</h1>
        <button className="btn btn-primary" onClick={openAdd}>Dodaj status</button>
      </div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 600 }}>
          <table>
            <thead><tr><th>Nazwa</th><th>Kolor</th><th>Akcje</th></tr></thead>
            <tbody>
              {statuses.map(s => (
                <tr key={s.id}>
                  <td>
                    <span className="badge" style={{ background: s.color }}>{s.name}</span>
                  </td>
                  <td><span style={{ fontFamily: 'monospace' }}>{s.color}</span></td>
                  <td>
                    <div className="d-flex gap-8">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edytuj</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)}>Usun</button>
                    </div>
                  </td>
                </tr>
              ))}
              {statuses.length === 0 && <tr><td colSpan={3} className="text-muted" style={{ textAlign: 'center' }}>Brak statusow</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Edytuj status' : 'Nowy status'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label required">Nazwa</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Kolor</label>
                  <div className="d-flex gap-8 align-center">
                    <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: 40, height: 34, border: '1px solid #ced4da', borderRadius: 4, cursor: 'pointer' }} />
                    <input className="form-control" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ fontFamily: 'monospace', width: 100 }} />
                  </div>
                  <div className="d-flex gap-8" style={{ marginTop: 8 }}>
                    {defaultColors.map(c => (
                      <div key={c} onClick={() => setForm({ ...form, color: c })}
                        style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '2px solid #212529' : '2px solid transparent' }} />
                    ))}
                  </div>
                </div>
                <div>
                  Podglad: <span className="badge" style={{ background: form.color }}>{form.name || 'Status'}</span>
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
