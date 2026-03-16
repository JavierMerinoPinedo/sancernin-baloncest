// ─── Página de Login ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useTheme } from '../ThemeContext.jsx';
import { Ico } from '../components/ui.jsx';

const ORB = {
  position: 'absolute', borderRadius: '50%',
  pointerEvents: 'none', filter: 'blur(90px)',
};

export default function Login() {
  const { login } = useAuth();
  const { T, dark } = useTheme();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await login(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  const inpStyle = {
    width: '100%', background: T.bgSub, border: `1px solid ${T.border}`,
    borderRadius: 10, padding: '11px 14px', color: T.text, fontSize: 14,
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color .15s',
  };

  return (
    <div className="page-login" style={{
      minHeight: '100vh', background: T.bgGrad, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Orbs decorativos */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="orb-1" style={{ ...ORB, top: '10%',  right: '15%', width: 560, height: 560, background: T.orb1 }} />
        <div className="orb-2" style={{ ...ORB, bottom: '15%', left: '10%',  width: 460, height: 460, background: T.orb2 }} />
        <div className="orb-3" style={{ ...ORB, top: '55%', right: '40%', width: 360, height: 360, background: T.orb3 }} />
      </div>

      <div className="login-card" style={{
        background: T.card, border: `1px solid ${T.borderMid}`,
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 20, padding: '40px 44px', width: '100%', maxWidth: 420,
        boxShadow: T.shadowLg, position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.blue}, ${T.blueDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 28px ${T.blueGlow}`,
            color: '#fff',
          }}>
            <Ico n="ball" s={24} />
          </div>
          <div>
            <div style={{ color: T.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.8 }}>Club Deportivo</div>
            <div style={{ color: T.text, fontWeight: 900, fontSize: 18, letterSpacing: -0.4, lineHeight: 1.1 }}>San Cernin</div>
          </div>
        </div>

        <div style={{ color: T.text, fontWeight: 800, fontSize: 20, marginBottom: 6, letterSpacing: -0.4 }}>
          Acceso al panel
        </div>
        <div style={{ color: T.muted, fontSize: 13, marginBottom: 28 }}>
          Inicia sesión con tu cuenta de la sección
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: `rgba(239,68,68,.12)`, border: `1px solid rgba(239,68,68,.3)`,
              borderRadius: 10, padding: '11px 14px', color: T.red,
              fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Ico n="x" s={14} color={T.red} />
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: T.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 7 }}>
              Correo electrónico
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="entrenador@sancernin.es" required style={inpStyle}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', color: T.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 7 }}>
              Contraseña
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required style={inpStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', background: T.blue, border: 'none', borderRadius: 12,
            padding: '13px 20px', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.65 : 1, transition: 'all .15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            boxShadow: `0 4px 18px ${T.blueGlow}`, fontFamily: 'inherit',
          }}>
            <Ico n="check" s={15} />
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="login-roles" style={{ marginTop: 28, padding: '16px', background: T.bgSub, borderRadius: 10, border: `1px solid ${T.border}` }}>
          <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Roles disponibles</div>
          {[
            { role: 'admin',      color: T.gold,  desc: 'Acceso completo · editar todo' },
            { role: 'entrenador', color: T.blue,  desc: 'Gestionar jugadores' },
            { role: 'consulta',   color: T.muted, desc: 'Solo lectura' },
          ].map(({ role, color, desc }) => (
            <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ color, fontSize: 11, fontWeight: 700 }}>{role}</span>
              <span style={{ color: T.dim, fontSize: 11 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

