import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth();
  const [serviceName, setServiceName] = useState('Serwis Komputerowy');

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data.service_name) setServiceName(res.data.service_name);
    }).catch(() => {});
  }, []);

  const navItem = (id, label) => (
    <div
      className={`nav-item${currentPage === id ? ' active' : ''}`}
      onClick={() => onNavigate(id)}
    >
      {label}
    </div>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>{serviceName}</h2>
        <div className="subtitle">Panel serwisowy</div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Serwis</div>
        {navItem('devices', 'Lista urzadzen')}
        {navItem('clients', 'Klienci')}
        <div className="nav-section-label">Slowniki</div>
        {navItem('statuses', 'Statusy')}
        {navItem('activities', 'Czynnosci serwisowe')}
        {navItem('initial-config', 'Konfiguracja wstepna')}
        {user?.role === 'admin' && (
          <>
            <div className="nav-section-label">Administracja</div>
            {navItem('users', 'Uzytkownicy')}
            {navItem('settings', 'Ustawienia')}
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">{user?.firstName} {user?.lastName}</div>
        <div className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Serwisant'}</div>
        <button className="logout-btn" onClick={logout}>Wyloguj sie</button>
      </div>
    </div>
  );
}
