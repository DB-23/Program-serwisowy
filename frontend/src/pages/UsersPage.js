import React, { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = { username: '', password: '', firstName: '', lastName: '', role: 'serwisant' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditUser(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ username: u.username, password: '', firstName: u.firstName, lastName: u.lastName, role: u.role });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editUser) {
        const payload = { firstName: form.firstName, lastName: form.lastName, role: form.role };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editUser.id}`, payload);
      } else {
        await api.post('/users', form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Blad zapisu');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (u) => {
    if (!window.confirm(`Dezaktywowac uzytkownika ${u.firstName} ${u.lastName}?`)) return;
    await api.delete(`/users/${u.id}`);
    load();
  };

  const handleActivate = async (u) => {
    await api.put(`/users/${u.id}`, { active: true });
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Uzytkownicy</h1>
        <button className="btn btn-primary" onClick={openAdd}>Dodaj uzytkownika</button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Imie i nazwisko</th>
                  <th>Login</th>
                  <th>Rola</th>
                  <th>Status</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.username}</td>
                    <td>{u.role === 'admin' ? 'Administrator' : 'Serwisant'}</td>
                    <td>
                      <span className="badge" style={{ background: u.active ? '#198754' : '#6c757d' }}>
                        {u.active ? 'Aktywny' : 'Nieaktywny'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-8">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>Edytuj</button>
                        {u.active
                          ? <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(u)}>Dezaktywuj</button>
                          : <button className="btn btn-success btn-sm" onClick={() => handleActivate(u)}>Aktywuj</button>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="text-muted" style={{ textAlign: 'center' }}>Brak uzytkownikow</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editUser ? 'Edytuj uzytkownika' : 'Nowy uzytkownik'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-row cols-2">
                  <div className="form-group">
                    <label className="form-label required">Imie</label>
                    <input className="form-control" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Nazwisko</label>
                    <input className="form-control" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row cols-2">
                  <div className="form-group">
                    <label className="form-label required">Login</label>
                    <input className="form-control" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required disabled={!!editUser} />
                  </div>
                  <div className="form-group">
                    <label className={`form-label${editUser ? '' : ' required'}`}>
                      Haslo {editUser && <span className="text-muted">(zostaw puste, by nie zmieniać)</span>}
                    </label>
                    <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editUser} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label required">Rola</label>
                  <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="serwisant">Serwisant</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Anuluj</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Zapisywanie...' : 'Zapisz'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
