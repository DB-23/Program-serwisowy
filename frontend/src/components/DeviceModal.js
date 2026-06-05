import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddClientModal from './AddClientModal';

const today = () => new Date().toISOString().split('T')[0];

const emptyForm = {
  entryType: 'service',
  clientId: '',
  addressId: '',
  receivedDate: today(),
  equipmentTypeId: '',
  serialNumber: '',
  operatingSystem: '',
  mssqlVersion: '',
  manufacturer: '',
  cpu: '',
  motherboard: '',
  ramAmount: '',
  ramType: '',
  storageSize: '',
  storageType: '',
  gpu: '',
  damageDescription: '',
  workHours: '',
  repairTechnicianId: '',
  statusId: '',
  releaseDate: '',
  repairDescription: '',
  invoiceIssued: false,
  serviceActivityIds: [],
  initialConfigItems: [],
};

export default function DeviceModal({ device, onClose, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [clients, setClients] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [configItems, setConfigItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: '', street: '', city: '', postalCode: '' });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  const reloadClients = () => api.get('/clients').then(r => setClients(r.data));
  const reloadAddresses = () => form.clientId
    ? api.get(`/clients/${form.clientId}/addresses`).then(r => setAddresses(r.data))
    : Promise.resolve();

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    setAddressSaving(true);
    try {
      const res = await api.post(`/clients/${form.clientId}/addresses`, addressForm);
      const newAddr = res.data;
      await reloadAddresses();
      set('addressId', String(newAddr.id));
      setShowAddAddress(false);
      setAddressForm({ label: '', street: '', city: '', postalCode: '' });
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Błąd zapisu');
    } finally {
      setAddressSaving(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/clients'),
      api.get('/equipment-types'),
      api.get('/statuses'),
      api.get('/service-activities'),
      api.get('/initial-config'),
      api.get('/users'),
    ]).then(([c, et, s, sa, ic, u]) => {
      setClients(c.data);
      setEquipmentTypes(et.data);
      setStatuses(s.data);
      setActivities(sa.data);
      setConfigItems(ic.data);
      setUsers(u.data.filter(x => x.active));
    });

    if (device) {
      setForm({
        entryType: device.entryType || 'service',
        clientId: device.clientId || '',
        addressId: device.addressId || '',
        receivedDate: device.receivedDate || today(),
        equipmentTypeId: device.equipmentTypeId || '',
        serialNumber: device.serialNumber || '',
        operatingSystem: device.operatingSystem || '',
        mssqlVersion: device.mssqlVersion || '',
        manufacturer: device.manufacturer || '',
        cpu: device.cpu || '',
        motherboard: device.motherboard || '',
        ramAmount: device.ramAmount || '',
        ramType: device.ramType || '',
        storageSize: device.storageSize || '',
        storageType: device.storageType || '',
        gpu: device.gpu || '',
        damageDescription: device.damageDescription || '',
        workHours: device.workHours || '',
        repairTechnicianId: device.repairTechnicianId || '',
        statusId: device.statusId || '',
        releaseDate: device.releaseDate || '',
        repairDescription: device.repairDescription || '',
        invoiceIssued: device.invoiceIssued || false,
        serviceActivityIds: device.serviceActivities?.map(a => a.id) || [],
        initialConfigItems: device.initialConfigItems?.map(i => ({ id: i.id, checked: i.DeviceInitialConfig?.checked || false, value: i.DeviceInitialConfig?.value || '' })) || [],
      });
    }
  }, [device]);

  useEffect(() => {
    if (form.clientId) {
      api.get(`/clients/${form.clientId}/addresses`).then(r => setAddresses(r.data));
    } else {
      setAddresses([]);
    }
  }, [form.clientId]);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const toggleActivity = (id) => {
    setForm(f => ({
      ...f,
      serviceActivityIds: f.serviceActivityIds.includes(id)
        ? f.serviceActivityIds.filter(x => x !== id)
        : [...f.serviceActivityIds, id],
    }));
  };

  const toggleConfigItem = (id, checked) => {
    setForm(f => {
      const exists = f.initialConfigItems.find(x => x.id === id);
      if (exists) {
        return { ...f, initialConfigItems: f.initialConfigItems.map(x => x.id === id ? { ...x, checked } : x) };
      }
      return { ...f, initialConfigItems: [...f.initialConfigItems, { id, checked, value: '' }] };
    });
  };

  const setConfigValue = (id, value) => {
    setForm(f => ({
      ...f,
      initialConfigItems: f.initialConfigItems.map(x => x.id === id ? { ...x, value } : x),
    }));
  };

  const getConfigChecked = (id) => {
    const item = form.initialConfigItems.find(x => x.id === id);
    return item ? item.checked : false;
  };

  const getConfigValue = (id) => {
    const item = form.initialConfigItems.find(x => x.id === id);
    return item ? item.value || '' : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.clientId) { setError('Wybierz klienta'); setSaving(false); return; }
      if (!payload.receivedDate) { setError('Podaj date przyjecia'); setSaving(false); return; }
      if (device) {
        await api.put(`/devices/${device.id}`, payload);
      } else {
        await api.post('/devices', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Blad zapisu');
    } finally {
      setSaving(false);
    }
  };

  const isNewComputer = form.entryType === 'new_computer';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{device ? 'Edytuj urzadzenie' : 'Nowe zgloszenie'}</h3>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Typ zgloszenia */}
            <div className="form-group">
              <label className="form-label required">Typ zgloszenia</label>
              <div className="d-flex gap-12">
                <label className="form-check">
                  <input type="radio" name="entryType" value="service" checked={form.entryType === 'service'} onChange={() => set('entryType', 'service')} />
                  <span>Komputer serwisowany</span>
                </label>
                <label className="form-check">
                  <input type="radio" name="entryType" value="new_computer" checked={form.entryType === 'new_computer'} onChange={() => set('entryType', 'new_computer')} />
                  <span>Nowy komputer</span>
                </label>
              </div>
            </div>

            <hr className="section-divider" />

            {/* Dane podstawowe */}
            <div className="card-title">Dane podstawowe</div>
            <div className="form-row cols-3">
              <div className="form-group">
                <label className="form-label required">Klient</label>
                <div className="d-flex gap-8 align-center">
                  <select className="form-control flex-1" value={form.clientId} onChange={e => { set('clientId', e.target.value); set('addressId', ''); }} required>
                    <option value="">-- wybierz --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowAddClient(true)}
                    title="Dodaj nowego klienta"
                    style={{ flexShrink: 0, padding: '8px 10px', fontWeight: 700 }}
                  >
                    + Nowy
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Adres (lokalizacja)</label>
                <div className="d-flex gap-8 align-center">
                  <select className="form-control flex-1" value={form.addressId} onChange={e => set('addressId', e.target.value)} disabled={!form.clientId}>
                    <option value="">-- wybierz --</option>
                    {addresses.map(a => <option key={a.id} value={a.id}>{a.label ? `${a.label} - ` : ''}{a.street}, {a.city}</option>)}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => { setAddressForm({ label: '', street: '', city: '', postalCode: '' }); setAddressError(''); setShowAddAddress(true); }}
                    disabled={!form.clientId}
                    title="Dodaj nowy adres dla wybranego klienta"
                    style={{ flexShrink: 0, padding: '8px 10px', fontWeight: 700 }}
                  >
                    + Nowy
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label required">Data przyjecia</label>
                <div className="d-flex gap-8 align-center">
                  <input className="form-control" type="date" value={form.receivedDate} onChange={e => set('receivedDate', e.target.value)} required />
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => set('receivedDate', today())}>Dzis</button>
                </div>
              </div>
            </div>
            <div className="form-row cols-3">
              <div className="form-group">
                <label className="form-label">Typ sprzetu</label>
                <select className="form-control" value={form.equipmentTypeId} onChange={e => set('equipmentTypeId', e.target.value)}>
                  <option value="">-- wybierz --</option>
                  {equipmentTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nr seryjny / serwisowy</label>
                <input className="form-control" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.statusId} onChange={e => set('statusId', e.target.value)}>
                  <option value="">-- wybierz --</option>
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <hr className="section-divider" />

            {/* Oprogramowanie */}
            <div className="card-title">Oprogramowanie</div>
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">System operacyjny</label>
                <input className="form-control" value={form.operatingSystem} onChange={e => set('operatingSystem', e.target.value)} placeholder="np. Windows 11 Pro" />
              </div>
              <div className="form-group">
                <label className="form-label">Wersja Microsoft SQL</label>
                <input className="form-control" value={form.mssqlVersion} onChange={e => set('mssqlVersion', e.target.value)} placeholder="np. SQL Server 2019" />
              </div>
            </div>

            <hr className="section-divider" />

            {/* Podzespoly */}
            <div className="card-title">Podzespoly i specyfikacja</div>
            <div className="form-row cols-3">
              <div className="form-group">
                <label className="form-label">Producent</label>
                <input className="form-control" value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)} placeholder="np. Dell, HP, własny" />
              </div>
              <div className="form-group">
                <label className="form-label">Procesor</label>
                <input className="form-control" value={form.cpu} onChange={e => set('cpu', e.target.value)} placeholder="np. Intel Core i7-12700" />
              </div>
              <div className="form-group">
                <label className="form-label">Plyta glowna</label>
                <input className="form-control" value={form.motherboard} onChange={e => set('motherboard', e.target.value)} />
              </div>
            </div>
            <div className="form-row cols-3">
              <div className="form-group">
                <label className="form-label">Ilosc RAM</label>
                <input className="form-control" value={form.ramAmount} onChange={e => set('ramAmount', e.target.value)} placeholder="np. 16 GB" />
              </div>
              <div className="form-group">
                <label className="form-label">Typ RAM</label>
                <input className="form-control" value={form.ramType} onChange={e => set('ramType', e.target.value)} placeholder="np. DDR4 3200 MHz" />
              </div>
              <div className="form-group">
                <label className="form-label">Karta graficzna</label>
                <input className="form-control" value={form.gpu} onChange={e => set('gpu', e.target.value)} placeholder="np. NVIDIA RTX 3060" />
              </div>
            </div>
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">Pojemnosc dysku</label>
                <input className="form-control" value={form.storageSize} onChange={e => set('storageSize', e.target.value)} placeholder="np. 512 GB" />
              </div>
              <div className="form-group">
                <label className="form-label">Typ dysku</label>
                <input className="form-control" value={form.storageType} onChange={e => set('storageType', e.target.value)} placeholder="np. SSD NVMe" />
              </div>
            </div>

            {!isNewComputer && (
              <>
                <hr className="section-divider" />
                <div className="card-title">Informacje serwisowe</div>
                <div className="form-group">
                  <label className="form-label">Opis uszkodzenia</label>
                  <textarea className="form-control" rows={3} value={form.damageDescription} onChange={e => set('damageDescription', e.target.value)} />
                </div>
                <div className="form-row cols-3">
                  <div className="form-group">
                    <label className="form-label">Roboczogodziny</label>
                    <input className="form-control" type="number" step="0.5" min="0" value={form.workHours} onChange={e => set('workHours', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Naprawial serwisant</label>
                    <select className="form-control" value={form.repairTechnicianId} onChange={e => set('repairTechnicianId', e.target.value)}>
                      <option value="">-- wybierz --</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data wydania klientowi</label>
                    <input className="form-control" type="date" value={form.releaseDate} onChange={e => set('releaseDate', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Opis naprawy / wykonanych czynnosci</label>
                  <textarea className="form-control" rows={3} value={form.repairDescription} onChange={e => set('repairDescription', e.target.value)} />
                </div>
                <div className="form-check">
                  <input type="checkbox" id="invoice" checked={form.invoiceIssued} onChange={e => set('invoiceIssued', e.target.checked)} />
                  <label htmlFor="invoice">Faktura wystawiona</label>
                </div>
              </>
            )}

            {/* Czynnosci serwisowe */}
            {activities.length > 0 && (
              <>
                <hr className="section-divider" />
                <div className="card-title">Czynnosci serwisowe</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 16px' }}>
                  {activities.map(a => (
                    <label key={a.id} className="form-check">
                      <input
                        type="checkbox"
                        checked={form.serviceActivityIds.includes(a.id)}
                        onChange={() => toggleActivity(a.id)}
                      />
                      <span>{a.name}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Konfiguracja wstepna - tylko dla nowych komputerow */}
            {isNewComputer && configItems.length > 0 && (
              <>
                <hr className="section-divider" />
                <div className="card-title">Konfiguracja wstepna</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 16px' }}>
                  {configItems.map(ci => (
                    <div key={ci.id}>
                      <label className="form-check">
                        <input
                          type="checkbox"
                          checked={getConfigChecked(ci.id)}
                          onChange={e => toggleConfigItem(ci.id, e.target.checked)}
                        />
                        <span>{ci.name}{ci.description && <span className="text-muted"> - {ci.description}</span>}</span>
                      </label>
                      {getConfigChecked(ci.id) && (
                        <input
                          className="form-control"
                          style={{ marginTop: 4, fontSize: 13 }}
                          placeholder="ID do zdalnego połączenia (opcjonalnie)"
                          value={getConfigValue(ci.id)}
                          onChange={e => setConfigValue(ci.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Anuluj</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Zapisywanie...' : 'Zapisz'}</button>
          </div>
        </form>
      </div>

      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onSaved={async (newClient) => {
            setShowAddClient(false);
            await reloadClients();
            set('clientId', String(newClient.id));
            set('addressId', '');
          }}
        />
      )}

      {showAddAddress && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowAddAddress(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nowy adres</h3>
              <button className="modal-close" onClick={() => setShowAddAddress(false)}>x</button>
            </div>
            <form onSubmit={handleSaveAddress}>
              <div className="modal-body">
                {addressError && <div className="alert alert-danger">{addressError}</div>}
                <div className="form-group">
                  <label className="form-label">Etykieta (np. "Siedziba", "Sklep")</label>
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
                <button type="button" className="btn btn-outline" onClick={() => setShowAddAddress(false)}>Anuluj</button>
                <button type="submit" className="btn btn-primary" disabled={addressSaving}>{addressSaving ? 'Zapisywanie...' : 'Dodaj adres'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
