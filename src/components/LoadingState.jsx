import { useTheme } from '../ThemeContext.jsx';

export const Spinner = ({ size = 36 }) => {
  const { T } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid ${T.border}`,
        borderTopColor: T.blue,
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }} />
      <span style={{ color: T.muted, fontSize: 13 }}>Cargando datos…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export const ErrorBanner = ({ message }) => {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.redAlpha, border: `1px solid ${T.red}35`,
      borderRadius: 12, padding: '16px 20px', color: T.red,
      display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13,
    }}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>⚠️</span>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 3 }}>Error de conexión con Supabase</div>
        <div style={{ opacity: 0.75, fontSize: 12 }}>{message}</div>
      </div>
    </div>
  );
};
