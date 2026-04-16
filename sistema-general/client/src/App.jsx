import { useState, useEffect } from 'react';
import Login from './Login.jsx';
import MainApp from './MainApp.jsx';
import { api } from './api.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sg_token');
    if (!token) { setChecking(false); return; }
    api.me()
      .then(u => { setUser(u); setChecking(false); })
      .catch(() => { localStorage.removeItem('sg_token'); setChecking(false); });
  }, []);

  function handleLogout() {
    localStorage.removeItem('sg_token');
    setUser(null);
  }

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, color: '#64748b' }}>Cargando...</p>
    </div>
  );

  if (!user) return <Login onLogin={setUser} />;
  return <MainApp user={user} onLogout={handleLogout} />;
}
