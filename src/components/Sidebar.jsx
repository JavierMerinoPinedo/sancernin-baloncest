import { useTheme } from '../ThemeContext.jsx';
import { useAuth } from '../AuthContext.jsx';
import { Ico, ThemeToggle } from './ui.jsx';

const NAV = [
  { key: 'dashboard',    label: 'Dashboard',    icon: 'home'   },
  { key: 'equipos',      label: 'Equipos',       icon: 'shield' },
  { key: 'calendario',   label: 'Calendario',    icon: 'cal'    },
  { key: 'estadisticas', label: 'Estadísticas',  icon: 'bar'    },
  { key: 'jugadores',    label: 'Jugadores',     icon: 'users'  },
];

export default function Sidebar({ page, setPage, pendientes = 0 }) {
  const { T, dark } = useTheme();
  const { user, role, logout } = useAuth();

  return (
    <aside style={{
      width: 230, flexShrink: 0,
      background: T.bgMid,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderRight: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
      transition: 'background .25s, border-color .25s',
    }}>

      {/* Logo */}
      <div style={{ padding: '22px 18px 18px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.blue}, ${T.blueDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 24px ${T.blueGlow}`,
            color: '#fff',
          }}>
            <Ico n="ball" s={20} />
          </div>
          <div>
            <div style={{ color: T.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.6 }}>Club Deportivo</div>
            <div style={{ color: T.text, fontWeight: 900, fontSize: 15, letterSpacing: -0.3, lineHeight: 1.1 }}>San Cernin</div>
          </div>
        </div>

        {/* Badge live */}
        <div style={{
          background: T.blueAlpha, border: `1px solid ${T.blueBorder}`,
          borderRadius: 8, padding: '6px 11px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: T.blue, boxShadow: `0 0 8px ${T.blue}`,
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{ color: T.blueLight, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
            Supabase · Live
          </span>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 10px', flex: 1, overflowY: 'auto' }}>
        <div style={{ color: T.dim, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.6, padding: '0 8px 10px' }}>
          Menú
        </div>
        {NAV.map(item => {
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, border: 'none',
                background: active
                  ? dark ? `rgba(59,130,246,0.14)` : `rgba(37,99,235,0.09)`
                  : 'transparent',
                color: active ? T.blue : T.muted,
                cursor: 'pointer', marginBottom: 2, textAlign: 'left',
                fontWeight: active ? 700 : 500, fontSize: 13, fontFamily: 'inherit',
                transition: 'all .15s',
                outline: 'none',
              }}
            >
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8,
                background: active ? T.blue : T.bgSub,
                color: active ? '#fff' : T.muted,
                transition: 'all .15s', flexShrink: 0,
              }}>
                <Ico n={item.icon} s={14} />
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.key === 'calendario' && pendientes > 0 && (
                <span style={{
                  background: T.blue, color: '#fff',
                  borderRadius: 10, padding: '2px 8px',
                  fontSize: 10, fontWeight: 800, lineHeight: 1.4,
                }}>
                  {pendientes}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 16px', borderTop: `1px solid ${T.border}` }}>
        <div style={{ marginBottom: 10 }}>
          <ThemeToggle />
        </div>

        {/* Usuario activo */}
        {user && (
          <div style={{
            background: T.bgSub, border: `1px solid ${T.border}`,
            borderRadius: 10, padding: '10px 12px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: role === 'admin' ? `${T.gold}22` : T.blueAlpha,
              border: `1px solid ${role === 'admin' ? `${T.gold}35` : T.blueBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>
              {role === 'admin' ? '👑' : role === 'entrenador' ? '🏀' : '👁'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: T.text, fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email?.split('@')[0]}
              </div>
              <div style={{ color: T.dim, fontSize: 10 }}>{role}</div>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              style={{
                background: 'transparent', border: 'none',
                color: T.muted, cursor: 'pointer', display: 'flex',
                padding: 4, borderRadius: 6, transition: 'color .15s',
              }}
            >
              <Ico n="logout" s={14} />
            </button>
          </div>
        )}

        <div style={{ color: T.dim, fontSize: 10, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, color: T.muted }}>CD San Cernin</div>
          <div>Avda. Barañáin nº3, Pamplona</div>
        </div>
      </div>
    </aside>
  );
}
