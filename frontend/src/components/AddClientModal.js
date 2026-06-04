import React, { useState } from 'react';
import api from '../services/api';

const emptyForm = { name: '', phone: '', email: '', taxId: '', notes: '' };
const emptyAddress = { label: '', street: '', city: '', postalCode: '' };

export default function AddClientModal({ onClose, onSaved }) {
  const [clientForm, setClientForm] = useState(emptyForm);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [addAddress, setAddAddress] = useState(false);
  const [nipInput, setNipInput] = useState('');
  const [gusLoading, setGusLoading] = useState(false);
  const [gusError, setGusError] = useState('');
  const [gusSuccess, setGusSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGusLookup = async () => {
    const nip = nipInput.replace(/[\s\-]/g, '');
    if (!nip) { setGusError('Wpisz NIP'); return; }
    setGusError('');
    setGusSuccess('');
    setGusLoading(true);
    try {
      const res = await api.get(`/gus/nip/${nip}`);
      const data = res.data;
      setClientForm(f => ({
        ...f,
        name: toTitleCase(data.name || f.name),
        taxId: data.nip || f.taxId,
      }));
      if (data.parsedAddress) {
        setAddressForm({
          label: '',
          street: toTitleCase(data.parsedAddress.street || ''),
          city: toTitleCase(data.parsedAddress.city || ''),
          postalCode: data.parsedAddress.postalCode || '',
        });
        setAddAddress(true);
      }
      setGusSuccess(`Pobrano dane: ${toTitleCase(data.name)}${data.statusVat ? ` (VAT: ${data.statusVat})` : ''}`);
    } catch (err) {
      setGusError(err.response?.data?.message || 'Błąd pobierania danych z GUS');
    } finally {
      setGusLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!clientForm.name.trim()) { setError('Nazwa klienta jest wymagana'); return; }
    setSaving(true);
    try {
      const clientRes = await api.post('/clients', clientForm);
      const newClient = clientRes.data;
      if (addAddress && addressForm.street && addressForm.city) {
        await api.post(`/clients/${newClient.id}/addresses`, addressForm);
      }
      onSaved(newClient);
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd zapisu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Dodaj nowego klienta</h3>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <form onSubmit={handleSubmit}>
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
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleGusLookup}
                  disabled={gusLoading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {gusLoading ? 'Pobieranie...' : 'Pobierz dane'}
                </button>
              </div>
              {gusError && <div className="error-text" style={{ marginTop: 6 }}>{gusError}</div>}
              {gusSuccess && <div style={{ color: '#198754', fontSize: 12, marginTop: 6 }}>{gusSuccess}</div>}
            </div>

            {/* Client fields */}
            <div className="form-group">
              <label className="form-label required">Nazwa klienta / firmy</label>
              <input
                className="form-control"
                value={clientForm.name}
                onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                required
              />
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

            {/* Optional address */}
            <div className="form-check" style={{ marginBottom: 12 }}>
              <input type="checkbox" id="addAddr" checked={addAddress} onChange={e => setAddAddress(e.target.checked)} />
              <label htmlFor="addAddr" style={{ fontWeight: 500 }}>Dodaj adres klienta</label>
            </div>

            {addAddress && (
              <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 4, border: '1px solid #e9ecef' }}>
                <div className="form-group">
                  <label className="form-label">Etykieta (np. "Siedziba", "Sklep")</label>
                  <input className="form-control" value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Ulica i numer</label>
                  <input className="form-control" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} required={addAddress} />
                </div>
                <div className="form-row cols-2">
                  <div className="form-group">
                    <label className="form-label required">Miasto</label>
                    <input className="form-control" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} required={addAddress} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kod pocztowy</label>
                    <input className="form-control" value={addressForm.postalCode} onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })} placeholder="00-000" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Anuluj</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Zapisywanie...' : 'Dodaj klienta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function toTitleCase(str) {
  if (!str) return str;
  return str.toLowerCase().replace(/(?:^|\s|[,.\-/])(\S)/g, (m, c) => m.replace(c, c.toUpperCase()));
}
