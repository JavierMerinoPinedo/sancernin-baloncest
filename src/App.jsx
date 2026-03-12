import { useState } from 'react';
import './App.css';
import { useTheme } from './ThemeContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { usePartidos } from './hooks/usePartidos.js';
import { useNotificaciones } from './hooks/useNotificaciones.js';
import { Ico } from './components/ui.jsx';
import Sidebar       from './components/Sidebar.jsx';
import Dashboard     from './pages/Dashboard.jsx';
import Equipos       from './pages/Equipos.jsx';
import Calendario    from './pages/Calendario.jsx';
import Estadisticas  from './pages/Estadisticas.jsx';
import Jugadores     from './pages/Jugadores.jsx';
import Login         from './pages/Login.jsx';
import { Spinner }   from './components/LoadingState.jsx';

const PAGE_LABELS = {
  dashboard:    'Dashboard',
  equipos:      'Equipos',
  calendario:   'Calendario',
  estadisticas: 'Estadísticas',
  jugadores:    'Jugadores',
};

const ORB = {
  position: 'absolute', borderRadius: '50%',
  pointerEvents: 'none', filter: 'blur(90px)',
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const { T, dark } = useTheme();
  const { session, loading: authLoading, role } = useAuth();
  const { proximos } = usePartidos();
  const { permiso, soportado, pedirPermiso } = useNotificaciones(proximos);

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: T.bgGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  );

  if (!session) return <Login />;

  const PAGES = {
    dashboard:    <Dashboard />,
    equipos:      <Equipos />,
    calendario:   <Calendario />,
    estadisticas: <Estadisticas />,
    jugadores:    <Jugadores />,
  };

  const bellColor = permiso === 'granted' ? T.green : permiso === 'denied' ? T.red : T.muted;

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: T.bgGrad,
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      color: T.text,
      transition: 'background .4s, color .25s',
      position: 'relative',
    }}>
      {/* Orbs decorativos */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="orb-1" style={{ ...ORB, top: '8%',  right: '18%', width: 640, height: 640, background: T.orb1 }} />
        <div className="orb-2" style={{ ...ORB, top: '45%', left: '8%',  width: 520, height: 520, background: T.orb2 }} />
        <div className="orb-3" style={{ ...ORB, bottom: '5%', right: '38%', width: 420, height: 420, background: T.orb3 }} />
      </div>

      {/* Contenido con z-index sobre los orbs */}
      <div style={{ display: 'contents' }}>
        <Sidebar page={page} setPage={setPage} pendientes={proximos.length} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
          {/* Topbar */}
          <header style={{
            height: 60, flexShrink: 0,
            background: T.bgMid,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center',
            padding: '0 28px', gap: 16,
            position: 'sticky', top: 0, zIndex: 20,
            transition: 'background .25s, border-color .25s',
          }}>
            <div style={{ flex: 1 }}>
              <span style={{
                fontWeight: 900, fontSize: 17, letterSpacing: -0.5,
                background: `linear-gradient(90deg, ${T.text} 0%, ${T.textSub} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {PAGE_LABELS[page]}
              </span>
              <span style={{ color: T.dim, fontSize: 12, marginLeft: 10 }}>
                · Temporada 2025/2026
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Botón notificaciones */}
              {soportado && (
                <button
                  onClick={pedirPermiso}
                  title={
                    permiso === 'granted' ? 'Notificaciones activas — pulsa para probar' :
                    permiso === 'denied'  ? 'Notificaciones bloqueadas en el navegador' :
                    'Activar notificaciones de partidos'
                  }
                  style={{
                    background: T.bgSub,
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${T.border}`,
                    borderRadius: 10, padding: '6px 10px',
                    color: bellColor, cursor: permiso === 'denied' ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
                    fontFamily: 'inherit', transition: 'all .15s',
                  }}>
                  <Ico n="bell" s={13} color={bellColor} />
                  {permiso === 'granted' ? 'Activas' : permiso === 'denied' ? 'Bloqueadas' : 'Notif.'}
                </button>
              )}

              {/* Badge rol */}
              <div style={{
                background: role === 'admin'
                  ? `${T.gold}18`
                  : role === 'entrenador' ? T.blueAlpha : T.bgSub,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${role === 'admin' ? `${T.gold}35` : role === 'entrenador' ? T.blueBorder : T.border}`,
                borderRadius: 10, padding: '5px 12px',
                color: role === 'admin' ? T.gold : role === 'entrenador' ? T.blueLight : T.muted,
                fontSize: 11, fontWeight: 700,
              }}>
                {role === 'admin' ? '👑 Admin' : role === 'entrenador' ? '🏀 Entrenador' : '👁 Consulta'}
              </div>

              <div style={{
                background: T.blueAlpha,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${T.blueBorder}`,
                borderRadius: 10, padding: '5px 12px',
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
    </div>
  );
}
