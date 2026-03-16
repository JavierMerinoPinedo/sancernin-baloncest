// ─── Biblioteca UI — tema dinámico oscuro/claro ──────────────────────────────
import { useTheme } from '../ThemeContext.jsx';

// ── Iconos SVG inline ─────────────────────────────────────────────────────────
export const Ico = ({ n, s = 18, color }) => {
  const paths = {
    home:    'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    shield:  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    cal:     'M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18',
    bar:     'M18 20V10 M12 20V4 M6 20v-6',
    users:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    ball:    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M4.93 4.93c4.08 4.08 10.06 4.08 14.14 0 M4.93 19.07c4.08-4.08 10.06-4.08 14.14 0 M2 12h20',
    search:  'M21 21l-4.35-4.35 M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',
    plus:    'M12 5v14 M5 12h14',
    x:       'M18 6L6 18 M6 6l12 12',
    edit:    'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z',
    trash:   'M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
    trophy:  'M8 21h8 M12 17v4 M7 4h10v7a5 5 0 0 1-10 0V4z M7 8H4a2 2 0 0 0 0 4h3 M17 8h3a2 2 0 1 1 0 4h-3',
    chevron: 'M9 18l6-6-6-6',
    check:   'M20 6L9 17l-5-5',
    sun:     'M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z',
    moon:    'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
    pin:      'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
    bell:     'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    logout:   'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {(paths[n] || '').split(' M').filter(Boolean).map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  );
};

// ── Toggle Oscuro/Claro ───────────────────────────────────────────────────────
export const ThemeToggle = () => {
  const { T, dark, toggle } = useTheme();
  return (
    <button onClick={toggle}
      title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: T.bgSub, border: `1px solid ${T.border}`,
        borderRadius: 50, padding: '6px 14px 6px 10px',
        cursor: 'pointer', color: T.textSub, fontSize: 12, fontWeight: 600,
        fontFamily: 'inherit', transition: 'all .2s', boxShadow: T.shadow,
      }}>
      <span style={{ color: dark ? T.gold : T.blue, display: 'flex', transition: 'color .2s' }}>
        <Ico n={dark ? 'sun' : 'moon'} s={14} />
      </span>
      {dark ? 'Claro' : 'Oscuro'}
    </button>
  );
};

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, color, small }) => {
  const { T } = useTheme();
  const c = color || T.blue;
  return (
    <span style={{
      background: `${c}18`, color: c, border: `1px solid ${c}35`,
      borderRadius: 6, padding: small ? '2px 8px' : '3px 11px',
      fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: 0.3,
      whiteSpace: 'nowrap', display: 'inline-block', lineHeight: 1.5,
    }}>{children}</span>
  );
};

// ── Botón ─────────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, ghost, small, danger, icon, disabled, style: sx = {} }) => {
  const { T } = useTheme();
  let bg = T.blue, border = 'none', col = '#fff', sh = T.shadow;
  if (ghost)  { bg = T.bgSub; border = `1px solid ${T.border}`; col = T.textSub; sh = 'none'; }
  if (danger) { bg = T.redAlpha; border = `1px solid ${T.red}40`; col = T.red; sh = 'none'; }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg, border, borderRadius: 10,
      padding: small ? '6px 14px' : '9px 20px',
      color: col, fontSize: small ? 12 : 13, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 7,
      opacity: disabled ? 0.45 : 1, transition: 'all .15s',
      boxShadow: sh, letterSpacing: 0.2, ...sx,
    }}>
      {icon && <Ico n={icon} s={13} />}{children}
    </button>
  );
};

// ── Pill ──────────────────────────────────────────────────────────────────────
export const Pill = ({ children, active, onClick }) => {
  const { T } = useTheme();
  return (
    <button onClick={onClick} style={{
      background: active ? T.blue : T.bgSub,
      border: `1px solid ${active ? T.blue : T.border}`,
      borderRadius: 50, padding: '5px 16px',
      color: active ? '#fff' : T.muted,
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
      transition: 'all .15s', boxShadow: active ? T.shadow : 'none',
      fontFamily: 'inherit',
    }}>{children}</button>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style: sx = {} }) => {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 14, boxShadow: T.shadow,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      transition: 'background .25s, border-color .25s',
      ...sx,
    }}>{children}</div>
  );
};

// ── CardHead ──────────────────────────────────────────────────────────────────
export const CardHead = ({ title, sub, right }) => {
  const { T } = useTheme();
  return (
    <div style={{
      padding: '18px 22px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', borderBottom: `1px solid ${T.border}`,
    }}>
      <div>
        <div style={{ color: T.text, fontWeight: 800, fontSize: 14 }}>{title}</div>
        {sub && <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
};

// ── KPI ───────────────────────────────────────────────────────────────────────
export const KPI = ({ label, value, sub, color, icon }) => {
  const { T } = useTheme();
  const c = color || T.text;
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: '20px 22px', position: 'relative', overflow: 'hidden',
      boxShadow: T.shadow, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      transition: 'background .25s, border-color .25s',
    }}>
      <div style={{ position: 'absolute', right: 14, top: 12, color: c, opacity: 0.07 }}>
        <Ico n={icon} s={54} />
      </div>
      <div style={{ color: T.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 8 }}>{label}</div>
      <div style={{ color: c, fontSize: 34, fontWeight: 900, lineHeight: 1, letterSpacing: -1.5 }}>{value}</div>
      {sub && <div style={{ color: T.muted, fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ title, sub, onClose, children }) => {
  const { T } = useTheme();
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: T.card, border: `1px solid ${T.borderMid}`,
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 18, width: '100%', maxWidth: 500,
        maxHeight: '92vh', overflowY: 'auto', boxShadow: T.shadowLg,
      }}>
        <div style={{ padding: '22px 26px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 17 }}>{title}</div>
            {sub && <div style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{ background: T.bgSub, border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, cursor: 'pointer', padding: '4px 6px', display: 'flex' }}>
            <Ico n="x" s={16} />
          </button>
        </div>
        <div style={{ padding: 26 }}>{children}</div>
      </div>
    </div>
  );
};

// ── Form Fields ───────────────────────────────────────────────────────────────
export const Fld = ({ label, children }) => {
  const { T } = useTheme();
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', color: T.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
};

export const Inp = (props) => {
  const { T } = useTheme();
  return (
    <input {...props} style={{
      width: '100%', background: T.bgSub, border: `1px solid ${T.border}`,
      borderRadius: 9, padding: '9px 13px', color: T.text, fontSize: 13,
      boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
      transition: 'border-color .15s',
    }} />
  );
};

export const Sel = ({ value, onChange, options }) => {
  const { T } = useTheme();
  return (
    <select value={value} onChange={onChange} style={{
      width: '100%', background: T.bgSub, border: `1px solid ${T.border}`,
      borderRadius: 9, padding: '9px 13px', color: T.text, fontSize: 13,
      boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
    }}>
      {options.map(o => (
        <option key={o.value} value={o.value}
          style={{ background: T.bg, color: T.text }}>
          {o.label}
        </option>
      ))}
    </select>
  );
};

// ── ProgressBar ───────────────────────────────────────────────────────────────
export const ProgressBar = ({ pct, color }) => {
  const { T } = useTheme();
  return (
    <div style={{ background: T.border, borderRadius: 4, height: 5, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .6s cubic-bezier(.4,0,.2,1)' }} />
    </div>
  );
};

// ── Table ─────────────────────────────────────────────────────────────────────
export const Table = ({ headers, children }) => {
  const { T } = useTheme();
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: T.bgSub, borderBottom: `2px solid ${T.border}` }}>
            {headers.map(h => (
              <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: T.muted, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export const TR = ({ children, i, onClick }) => {
  const { T } = useTheme();
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: `1px solid ${T.border}`,
        background: i % 2 !== 0 ? T.bgSub : 'transparent',
        transition: 'background .1s',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </tr>
  );
};

export const TD = ({ children, style: sx = {} }) => (
  <td style={{ padding: '10px 16px', ...sx }}>{children}</td>
);

// ── SearchBar ─────────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder }) => {
  const { T } = useTheme();
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 9, flex: '1 1 200px', boxShadow: T.shadow, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <span style={{ color: T.muted, display: 'flex' }}><Ico n="search" s={14} /></span>
      <input value={value} onChange={onChange} placeholder={placeholder}
        style={{ background: 'none', border: 'none', color: T.text, fontSize: 13, outline: 'none', flex: 1, fontFamily: 'inherit' }} />
    </div>
  );
};
