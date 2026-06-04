import React, { useEffect, useState } from 'react';
import api from '../services/api';

const emptyClient = { name: '', phone: '', email: '', taxId: '', notes: '' };
const emptyAddress = { label: '', street: '', city: '', postalCode: '' };

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [editAddress, setEditAddress] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientForm, setClientForm] = useState(emptyClient);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [nipInput, setNipInput] = useState('');
  const [gusLoading, setGusLoading] = useState(false);
  const [gusError, setGusError] = useState('');
  const [gusSuccess, setGusSuccess] = useState('');

  const load = () => api.get('/clients').then(r => setClients(r.data));
  useEffect(() => { load(); }, []);

  const handleGusLookup = async () => {
    const nip = nipInput.replace(/[\s\-]/g, '');
    if (!nip) { setGusError('Wpisz NIP'); return; }
    setGusError(''); setGusSuccess(''); setGusLoading(true);
    try {
      const res = await api.get(`/gus/nip/${nip}`);
      const d = res.data;
      setClientForm(f => ({
        ...f,
        name: toTitleCase(d.name || f.name),
        taxId: d.nip || f.taxId,
      }));
      setGusSuccess(`Pobrano: ${toTitleCase(d.name)}${d.statusVat ? ` (VAT: ${d.statusVat})` : ''}`);
    } catch (err) {
      setGusError(err.response?.data?.message || 'Błąd pobierania danych z GUS');
    } finally {
      setGusLoading(false);
    }
  };

  const openAddClient = () => { setEditClient(null); setClientForm(emptyClient); setNipInput(''); setGusError(''); setGusSuccess(''); setError(''); setShowClientModal(true); };
  const openEditClient = (c) => { setEditClient(c); setClientForm({ name: c.name, phone: c.phone || '', email: c.email || '', taxId: c.taxId || '', notes: c.notes || '' }); setNipInput(c.taxId || ''); setGusError(''); setGusSuccess(''); setError(''); setShowClientModal(true); };

  const openAddAddress = (client) => { setSelectedClient(client); setEditAddress(null); setAddressForm(emptyAddress); setError(''); setShowAddressModal(true); };
  const openEditAddress = (client, addr) => { setSelectedClient(client); setEditAddress(addr); setAddressForm({ label: addr.label || '', street: addr.street, city: addr.city, postalCode: addr.postalCode || '' }); setError(''); setShowAddressModal(true); };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editClient) {
        await api.put(`/clients/${editClient.id}`, clientForm);
      } else {
        await api.post('/clients', clientForm);
      }
      setShowClientModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Blad zapisu');
    }
  };

  const handleDeleteClient = async (c) => {
    if (!window.confirm(`Usunac klienta "${c.name}"?`)) return;
    await api.delete(`/clients/${c.id}`);
    load();
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editAddress) {
        await api.put(`/clients/addresses/${editAddress.id}`, addressForm);
      } else {
        await api.post(`/clients/${selectedClient.id}/addresses`, addressForm);
      }
      setShowAddressModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Blad zapisu');
    }
  };

  const handleDeleteAddress = async (clientId, addr) => {
    if (!window.confirm(`Usunac adres?`)) return;
    await api.delete(`/clients/addresses/${addr.id}`);
    load();
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="page-header">
        <h1>Klienci</h1>
        <button className="btn btn-primary" onClick={openAddClient}>Dodaj klienta</button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="search-bar mb-16">
            <span className="search-icon">&#128269;</span>
            <input className="form-control" placeholder="Szukaj klienta..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nazwa</th>
                  <th>Telefon</th>
                  <th>Email</th>
                  <th>NIP</th>
                  <th>Adresy</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <React.Fragment key={c.id}>
                    <tr>
                      <td>
                        <button className="btn btn-link" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                          {c.name}
                        </button>
                      </td>
                      <td>{c.phone || '-'}</td>
                      <td>{c.email || '-'}</td>
                      <td>{c.taxId || '-'}</td>
                      <td>
                        <span className="text-muted">{c.addresses?.length || 0} adres(y)</span>
                      </td>
                      <td>
                        <div className="d-flex gap-8">
                          <button className="btn btn-outline btn-sm" onClick={() => openAddAddress(c)}>+ Adres</button>
                          <button className="btn btn-outline btn-sm" onClick={() => openEditClient(c)}>Edytuj</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClient(c)}>Usun</button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr>
                        <td colSpan={6} style={{ background: '#f8f9fa', padding: '8px 20px' }}>
                          {c.addresses?.length === 0 && <span className="text-muted">Brak adresow</span>}
                          {c.addresses?.map(a => (
                            <div key={a.id} className="d-flex align-center justify-between" style={{ padding: '4px 0', borderBottom: '1px solid #e9ecef' }}>
                              <div>
                                {a.label && <strong>{a.label}: </strong>}
                                {a.street}, {a.postalCode} {a.city}
                              </div>
                              <div className="d-flex gap-8">
                                <button className="btn btn-outline btn-sm" onClick={() => openEditAddress(c, a)}>Edytuj</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAddress(c.id, a)}>Usun</button>
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="text-muted" style={{ textAlign: 'center' }}>Brak klientow</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Client modal */}
      {showClientModal && (
        <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editClient ? 'Edytuj klienta' : 'Nowy klient'}</h3>
              <button className="modal-close" onClick={() => setShowClientModal(false)}>x</button>
            </div>
            <form onSubmit={handleSaveClient}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                {/* GUS lookup */}
                <div className="card" style={{ background: '#f8f9fa', marginBottom: 16 }}>
                  <div className="card-title" style={{ fontSize: 13 }}>Pobierz dane z rejestru MF (Biala Lista VAT)</div>
                  <div className="d-flex gap-8 align-center">
                    <input
                      className="form-control flex-1"
                      placeholder="Wpisz NIP (10 cyfr)"
                      value={nipInput}
                      onChange={e => { setNipInput(e.target.value); setGusError(''); setGusSuccess(''); }}
                      maxLength={13}
                    />
                    <button type="button" className="btn btn-outline" onClick={handleGusLookup} disabled={gusLoading} style={{ whiteSpace: 'nowrap' }}>
                      {gusLoading ? 'Pobieranie...' : 'Pobierz dane'}
                    </button>
                  </div>
                  {gusError && <div className="error-text" style={{ marginTop: 6 }}>{gusError}</div>}
                  {gusSuccess && <div style={{ color: '#198754', fontSize: 12, marginTop: 6 }}>{gusSuccess}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label required">Nazwa klienta / firmy</label>
                  <input className="form-control" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} required />
                </div>
                <div className="form-row cols-2">
                  <div className="form-group">
                    <label className="form-label">Telefon</label>
                    <input className="form-control" type="tel" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-control" type="email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">NIP</label>
                  <input className="form-control" value={clientForm.taxId} onChange={e => setClientForm({ ...clientForm, taxId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Uwagi</label>
                  <textarea className="form-control" rows={2} value={clientForm.notes} onChange={e => setClientForm({ ...clientForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowClientModal(false)}>Anuluj</button>
                <button type="submit" className="btn btn-primary">Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editAddress ? 'Edytuj adres' : `Nowy adres - ${selectedClient?.name}`}</h3>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>x</button>
            </div>
            <form onSubmit={handleSaveAddress}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Etykieta (np. "Sklep ul. Glowna")</label>
                  <input className="form-control" value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} placeholder="np. Sklep centrum, Magazyn..." />
                </div>
                <div className="form-group">
                  <label className="form-label required">Ulica i numer</label>
                  <input className="form-control" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} required />
                </div>
                <div className="form-row cols-2">
                  <div className="form-group">
                    <label className="form-label required">Miasto</label>
                    <input className="form-control" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kod pocztowy</label>
                    <input className="form-control" value={addressForm.postalCode} onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })} placeholder="00-000" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddressModal(false)}>Anuluj</button>
                <button type="submit" className="btn btn-primary">Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function toTitleCase(str) {
  if (!str) return str;
  return str.toLowerCase().replace(/(?:^|\s|[,.\-/])(\S)/g, (m, c) => m.replace(c, c.toUpperCase()));
}
