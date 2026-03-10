import { useState } from 'react';
import { useTheme } from './ThemeContext.jsx';
import { usePartidos } from './hooks/usePartidos.js';
import { ThemeToggle } from './components/ui.jsx';
import Sidebar       from './components/Sidebar.jsx';
import Dashboard     from './pages/Dashboard.jsx';
import Equipos       from './pages/Equipos.jsx';
import Calendario    from './pages/Calendario.jsx';
import Estadisticas  from './pages/Estadisticas.jsx';
import Jugadores     from './pages/Jugadores.jsx';

const PAGE_LABELS = {
  dashboard:    'Dashboard',
  equipos:      'Equipos',
  calendario:   'Calendario',
  estadisticas: 'Estadísticas',
  jugadores:    'Jugadores',
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const { T } = useTheme();
  const { proximos } = usePartidos();

  const PAGES = {
    dashboard:    <Dashboard />,
    equipos:      <Equipos />,
    calendario:   <Calendario />,
    estadisticas: <Estadisticas />,
    jugadores:    <Jugadores />,
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: T.bg,
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      color: T.text,
      transition: 'background .25s, color .25s',
    }}>
      <Sidebar page={page} setPage={setPage} pendientes={proximos.length} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 58, flexShrink: 0,
          background: T.bgMid,
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: 16,
          position: 'sticky', top: 0, zIndex: 10,
          transition: 'background .25s, border-color .25s',
        }}>
          <div style={{ flex: 1 }}>
            <span style={{ color: T.text, fontWeight: 800, fontSize: 16 }}>
              {PAGE_LABELS[page]}
            </span>
            <span style={{ color: T.dim, fontSize: 13, marginLeft: 10 }}>
              · Temporada 2025/2026
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: T.blueAlpha, border: `1px solid ${T.blueBorder}`,
              borderRadius: 8, padding: '5px 12px',
              color: T.blueLight, fontSize: 11, fontWeight: 700,
            }}>
              🏀 Sección Baloncesto
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {PAGES[page]}
        </main>
      </div>
    </div>
  );
}
