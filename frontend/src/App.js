import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import DevicesPage from './pages/DevicesPage';
import ClientsPage from './pages/ClientsPage';
import StatusesPage from './pages/StatusesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import InitialConfigPage from './pages/InitialConfigPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('devices');

  if (loading) {
    return <div className="spinner" style={{ paddingTop: 100 }}>Ladowanie...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (page) {
      case 'devices': return <DevicesPage />;
      case 'clients': return <ClientsPage />;
      case 'statuses': return <StatusesPage />;
      case 'activities': return <ActivitiesPage />;
      case 'initial-config': return <InitialConfigPage />;
      case 'users': return user.role === 'admin' ? <UsersPage /> : <DevicesPage />;
      case 'settings': return user.role === 'admin' ? <SettingsPage /> : <DevicesPage />;
      default: return <DevicesPage />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
