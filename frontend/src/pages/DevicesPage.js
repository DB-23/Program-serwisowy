import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import DeviceModal from '../components/DeviceModal';
import DeviceDetailModal from '../components/DeviceDetailModal';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [viewDevice, setViewDevice] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/devices').then(r => { setDevices(r.data); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (device) => {
    if (!window.confirm(`Usunac urzadzenie nr ${device.id} (${device.client?.name})?`)) return;
    await api.delete(`/devices/${device.id}`);
    load();
  };

  const filtered = devices.filter(d => {
    const q = search.toLowerCase();
    return (
      d.client?.name?.toLowerCase().includes(q) ||
      d.serialNumber?.toLowerCase().includes(q) ||
      d.status?.name?.toLowerCase().includes(q) ||
      d.equipmentType?.name?.toLowerCase().includes(q) ||
      String(d.id).includes(q)
    );
  });

  return (
    <div>
      <div className="page-header">
        <h1>Lista urzadzen</h1>
        <button className="btn btn-primary" onClick={() => { setEditDevice(null); setShowAdd(true); }}>
          Dodaj urzadzenie
        </button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="d-flex align-center gap-12 mb-16">
            <div className="search-bar flex-1">
              <span className="search-icon">&#128269;</span>
              <input
                className="form-control"
                placeholder="Szukaj po kliencie, numerze seryjnym, statusie..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          {loading ? (
            <div className="spinner">Ladowanie...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Klient</th>
                    <th>Typ sprzetu</th>
                    <th>Nr seryjny</th>
                    <th>Typ zgloszenia</th>
                    <th>Data przyjecia</th>
                    <th>Serwisant</th>
                    <th>Status</th>
                    <th>Faktura</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>{d.client?.name || '-'}</td>
                      <td>{d.equipmentType?.name || '-'}</td>
                      <td>{d.serialNumber || '-'}</td>
                      <td>{d.entryType === 'new_computer' ? 'Nowy komputer' : 'Serwis'}</td>
                      <td>{d.receivedDate}</td>
                      <td>{d.technician ? `${d.technician.firstName} ${d.technician.lastName}` : '-'}</td>
                      <td>
                        {d.status ? (
                          <span className="badge" style={{ background: d.status.color || '#6c757d' }}>
                            {d.status.name}
                          </span>
                        ) : '-'}
                      </td>
                      <td>{d.invoiceIssued ? 'Tak' : 'Nie'}</td>
                      <td>
                        <div className="d-flex gap-8">
                          <button className="btn btn-outline btn-sm" onClick={() => setViewDevice(d)}>Podglad</button>
                          <button className="btn btn-outline btn-sm" onClick={() => { setEditDevice(d); setShowAdd(true); }}>Edytuj</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d)}>Usun</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="text-muted" style={{ textAlign: 'center' }}>Brak urzadzen</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <DeviceModal
          device={editDevice}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); load(); }}
        />
      )}
      {viewDevice && (
        <DeviceDetailModal device={viewDevice} onClose={() => setViewDevice(null)} onEdit={() => { setEditDevice(viewDevice); setViewDevice(null); setShowAdd(true); }} />
      )}
    </div>
  );
}
