import { useState } from 'react';
import { useTheme } from '../ThemeContext.jsx';
import { cleanCat, fmtDate, catColor } from '../theme.js';
import { useEquipos } from '../hooks/useEquipos.js';
import { usePartidos, getSC, getRival, getTipo, getResult } from '../hooks/usePartidos.js';
import { Card, CardHead, Badge, Pill, ProgressBar, Ico } from '../components/ui.jsx';
import { Spinner, ErrorBanner } from '../components/LoadingState.jsx';

const CAT_GROUPS = ['Todos','Senior','Junior','Cadete','Infantil','Minibasket','Premini/Preinfantil','Benjamín','Veteranos'];
const matchGroup = (cat, grp) => {
  const l = cat.toLowerCase();
  if (grp === 'Senior')              return l.includes('senior');
  if (grp === 'Junior')              return l.includes('junior');
  if (grp === 'Cadete')              return l.includes('cadete');
  if (grp === 'Infantil')            return l.includes('infantil');
  if (grp === 'Minibasket')          return l.includes('minibasket');
  if (grp === 'Premini/Preinfantil') return l.includes('premini') || l.includes('preinfantil');
  if (grp === 'Benjamín')            return l.includes('benjamin') || l.includes('benjamín');
  if (grp === 'Veteranos')           return l.includes('veterano');
  return true;
};

function EquipoDetalle({ eq, partidos, onClose }) {
  const { T } = useTheme();
  const mis = partidos.filter(p =>
    (p.local === eq.nombre || p.visitante === eq.nombre) && p.categoria === eq.categoria
  ).sort((a, b) => b.fecha.localeCompare(a.fecha));

  const jugados  = mis.filter(p =>  p.resultado);
  const proximos = mis.filter(p => !p.resultado);
  const pct = eq.jugados > 0 ? Math.round(eq.victorias / eq.jugados * 100) : 0;
  const cc  = catColor(eq.categoria, T);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: T.card, border: `1px solid ${T.borderMid}`, borderRadius: 18, width: '100%', maxWidth: 660, maxHeight: '90vh', overflowY: 'auto', boxShadow: T.shadowLg }}>
        <div style={{ height: 4, background: cc, borderRadius: '18px 18px 0 0' }} />
        <div style={{ padding: '22px 26px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: T.text, fontWeight: 900, fontSize: 19 }}>{eq.nombre}</div>
            <div style={{ color: cc, fontSize: 12, fontWeight: 700, marginTop: 3 }}>{cleanCat(eq.categoria)}</div>
          </div>
          <button onClick={onClose} style={{ background: T.bgSub, border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, cursor: 'pointer', padding: '5px 7px', display: 'flex' }}>
            <Ico n="x" s={16} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, padding: '18px 26px', borderBottom: `1px solid ${T.border}` }}>
          {[
            { l: 'Victorias', v: eq.victorias,  c: T.green  },
            { l: 'Derrotas',  v: eq.derrotas,   c: T.red    },
            { l: '% Vict.',   v: `${pct}%`,     c: pct>=60?T.green:pct>=40?T.gold:T.red },
            { l: 'Pts/P fav', v: eq.jugados>0?Math.round(eq.pts_favor/eq.jugados):'—', c: T.blue },
            { l: 'Pts/P con', v: eq.jugados>0?Math.round(eq.pts_contra/eq.jugados):'—', c: T.orange },
          ].map(s => (
            <div key={s.l} style={{ background: T.bgSub, borderRadius: 10, padding: '12px 8px', textAlign: 'center', border: `1px solid ${T.border}` }}>
              <div style={{ color: s.c, fontWeight: 900, fontSize: 22 }}>{s.v}</div>
              <div style={{ color: T.dim, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
        {proximos.length > 0 && (
          <div style={{ padding: '16px 26px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ color: T.muted, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Próximos partidos</div>
            {proximos.slice(0, 3).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px dashed ${T.border}` }}>
                <span style={{ color: T.text, fontSize: 12 }}>vs {getRival(p)}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: T.muted, fontSize: 11 }}>{fmtDate(p.fecha)} {p.hora_tbd ? '' : p.hora?.slice(0,5)}</span>
                  <Badge color={getTipo(p)==='Local'?T.green:T.blue} small>{getTipo(p)}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ padding: '16px 26px' }}>
          <div style={{ color: T.muted, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Historial</div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {jugados.map(p => {
              const r = getResult(p);
              return (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div>
                    <span style={{ color: T.muted, fontSize: 11, marginRight: 10 }}>{fmtDate(p.fecha)}</span>
                    <span style={{ color: T.text, fontSize: 12 }}>vs {getRival(p)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge color={getTipo(p)==='Local'?T.green:T.blue} small>{getTipo(p)}</Badge>
                    <span style={{ color: r?.win?T.green:T.red, fontWeight: 900, fontSize: 14 }}>{r?.sc}–{r?.rival}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Equipos() {
  const { T } = useTheme();
  const { equipos, loading: le, error: ee } = useEquipos();
  const { partidos, loading: lp, error: ep } = usePartidos();
  const [grp,     setGrp]     = useState('Todos');
  const [detalle, setDetalle] = useState(null);

  if (le || lp) return <Spinner />;
  if (ee || ep) return <ErrorBanner message={ee || ep} />;

  const enriched = equipos.map(e => ({
    ...e,
    pct:      e.jugados > 0 ? Math.round(e.victorias / e.jugados * 100) : 0,
    diff:     e.pts_favor - e.pts_contra,
    proximos: partidos.filter(p => !p.resultado && getSC(p)===e.nombre && p.categoria===e.categoria).length,
  })).sort((a, b) => b.pct - a.pct);

  const shown = grp === 'Todos' ? enriched : enriched.filter(e => matchGroup(e.categoria, grp));

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ color: T.text, fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>25 Equipos</h2>
        <p style={{ color: T.muted, marginTop: 4, fontSize: 13 }}>Datos en tiempo real · Temporada 2025/2026</p>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {CAT_GROUPS.map(g => <Pill key={g} active={grp===g} onClick={()=>setGrp(g)}>{g}</Pill>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(295px,1fr))', gap: 14 }}>
        {shown.map(e => {
          const cc = catColor(e.categoria, T);
          const pColor = e.pct >= 60 ? T.green : e.pct >= 40 ? T.gold : T.red;
          return (
            <div key={e.id} onClick={() => setDetalle(e)}
              style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', boxShadow: T.shadow, transition: 'all .18s' }}
              onMouseEnter={ev => { ev.currentTarget.style.borderColor = cc; ev.currentTarget.style.transform = 'translateY(-2px)'; ev.currentTarget.style.boxShadow = T.shadowMd; }}
              onMouseLeave={ev => { ev.currentTarget.style.borderColor = T.border; ev.currentTarget.style.transform = 'none'; ev.currentTarget.style.boxShadow = T.shadow; }}>
              <div style={{ height: 3, background: cc }} />
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1, marginRight: 10 }}>
                    <div style={{ color: T.text, fontWeight: 900, fontSize: 14 }}>{e.nombre}</div>
                    <div style={{ color: cc, fontSize: 11, fontWeight: 700, marginTop: 3 }}>{cleanCat(e.categoria)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: pColor, fontWeight: 900, fontSize: 26, lineHeight: 1, letterSpacing: -1 }}>{e.pct}%</div>
                    <div style={{ color: T.dim, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>victorias</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 12 }}>
                  {[
                    {l:'V', v:e.victorias, c:T.green},
                    {l:'D', v:e.derrotas,  c:T.red  },
                    {l:'Dif', v:`${e.diff>0?'+':''}${e.diff}`, c:e.diff>=0?T.green:T.red},
                    {l:'Próx', v:e.proximos, c:T.blue},
                  ].map(s=>(
                    <div key={s.l} style={{ background: T.bgSub, borderRadius: 8, padding: '7px 4px', textAlign: 'center', border: `1px solid ${T.border}` }}>
                      <div style={{ color: s.c, fontWeight: 900, fontSize: 16 }}>{s.v}</div>
                      <div style={{ color: T.dim, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <ProgressBar pct={e.pct} color={pColor} />
                <div style={{ color: T.dim, fontSize: 10, marginTop: 6 }}>
                  {e.jugados} partidos · {e.jugados>0?Math.round(e.pts_favor/e.jugados):0} pts/partido
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {detalle && <EquipoDetalle eq={detalle} partidos={partidos} onClose={() => setDetalle(null)} />}
    </div>
  );
}
