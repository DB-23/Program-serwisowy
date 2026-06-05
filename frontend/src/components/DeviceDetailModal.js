import React from 'react';

const Row = ({ label, value }) => value ? (
  <div style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
    <div style={{ width: 200, color: '#6c757d', flexShrink: 0, fontSize: 13 }}>{label}</div>
    <div style={{ flex: 1, fontSize: 13 }}>{value}</div>
  </div>
) : null;

export default function DeviceDetailModal({ device: d, onClose, onEdit }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Urzadzenie #{d.id} - {d.client?.name}</h3>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <div className="modal-body">
          <div className="d-flex align-center justify-between mb-16">
            <div>
              {d.status && <span className="badge" style={{ background: d.status.color || '#6c757d', marginRight: 8 }}>{d.status.name}</span>}
              <span className="text-muted" style={{ fontSize: 12 }}>{d.entryType === 'new_computer' ? 'Nowy komputer' : 'Serwis'}</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onEdit}>Edytuj</button>
          </div>

          <div className="card-title">Dane podstawowe</div>
          <Row label="Klient" value={d.client?.name} />
          <Row label="Adres" value={d.address ? `${d.address.street}, ${d.address.city}${d.address.label ? ` (${d.address.label})` : ''}` : null} />
          <Row label="Data przyjecia" value={d.receivedDate} />
          <Row label="Przyjal serwisant" value={d.technician ? `${d.technician.firstName} ${d.technician.lastName}` : null} />
          <Row label="Typ sprzetu" value={d.equipmentType?.name} />
          <Row label="Nr seryjny" value={d.serialNumber} />

          <div className="card-title" style={{ marginTop: 16 }}>Oprogramowanie</div>
          <Row label="System operacyjny" value={d.operatingSystem} />
          <Row label="Microsoft SQL" value={d.mssqlVersion} />

          <div className="card-title" style={{ marginTop: 16 }}>Podzespoly</div>
          <Row label="Producent" value={d.manufacturer} />
          <Row label="Procesor" value={d.cpu} />
          <Row label="Plyta glowna" value={d.motherboard} />
          <Row label="RAM" value={d.ramAmount && `${d.ramAmount}${d.ramType ? ` ${d.ramType}` : ''}`} />
          <Row label="Dysk" value={d.storageSize && `${d.storageSize}${d.storageType ? ` ${d.storageType}` : ''}`} />
          <Row label="Karta graficzna" value={d.gpu} />

          {d.entryType !== 'new_computer' && (
            <>
              <div className="card-title" style={{ marginTop: 16 }}>Informacje serwisowe</div>
              <Row label="Opis uszkodzenia" value={d.damageDescription} />
              <Row label="Roboczogodziny" value={d.workHours} />
              <Row label="Naprawial" value={d.repairTechnician ? `${d.repairTechnician.firstName} ${d.repairTechnician.lastName}` : null} />
              <Row label="Data wydania" value={d.releaseDate} />
              <Row label="Opis naprawy" value={d.repairDescription} />
              <Row label="Faktura" value={d.invoiceIssued ? 'Tak' : 'Nie'} />
            </>
          )}

          {d.serviceActivities?.length > 0 && (
            <>
              <div className="card-title" style={{ marginTop: 16 }}>Czynnosci serwisowe</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {d.serviceActivities.map(a => (
                  <span key={a.id} className="badge" style={{ background: '#0d6efd' }}>{a.name}</span>
                ))}
              </div>
            </>
          )}

          {d.entryType === 'new_computer' && d.initialConfigItems?.length > 0 && (
            <>
              <div className="card-title" style={{ marginTop: 16 }}>Konfiguracja wstepna</div>
              {d.initialConfigItems.map(ci => {
                const checked = ci.DeviceInitialConfig?.checked || false;
                const val = ci.DeviceInitialConfig?.value;
                return (
                  <div key={ci.id} style={{ marginBottom: 6 }}>
                    <div className="form-check" style={{ marginBottom: val && checked ? 2 : 0 }}>
                      <input type="checkbox" readOnly checked={checked} />
                      <label style={{ color: checked ? '#198754' : '#6c757d' }}>{ci.name}</label>
                    </div>
                    {checked && val && (
                      <div style={{ fontSize: 12, color: '#495057', paddingLeft: 24, fontFamily: 'monospace' }}>
                        ID: {val}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Zamknij</button>
        </div>
      </div>
    </div>
  );
}
