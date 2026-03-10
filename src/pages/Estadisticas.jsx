import { useTheme } from '../ThemeContext.jsx';
import { cleanCat, fmtDate, catColor } from '../theme.js';
import { usePartidos, getSC, getRival, getResult, isSC } from '../hooks/usePartidos.js';
import { useEquipos } from '../hooks/useEquipos.js';
import { KPI, Card, CardHead, ProgressBar } from '../components/ui.jsx';
import { Spinner, ErrorBanner } from '../components/LoadingState.jsx';

export default function Estadisticas() {
  const { T } = useTheme();
  const { jugados, victorias, pct, ptsFavor, ptsContra, loading: lp, error: ep } = usePartidos();
  const { equipos, loading: le, error: ee } = useEquipos();

  if (lp || le) return <Spinner />;
  if (ep || ee) return <ErrorBanner message={ep || ee} />;

  const catStats = {};
  jugados.forEach(p => {
    const k = p.categoria;
    if (!catStats[k]) catStats[k] = { v: 0, d: 0 };
    if (getResult(p)?.win) catStats[k].v++; else catStats[k].d++;
  });
  const catList = Object.entries(catStats)
    .map(([cat, s]) => ({ cat, ...s, total: s.v + s.d, pct: Math.round(s.v / (s.v + s.d) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const withDiff = jugados.map(p => {
    const r = getResult(p);
    const sc    = isSC(p.local) ? r.local : r.visit;
    const rival = isSC(p.local) ? r.visit : r.local;
    return { ...p, sc_pts: sc, rival_pts: rival, diff: sc - rival };
  });
  const bigWins = [...withDiff].sort((a, b) => b.diff - a.diff).slice(0, 5);
  const bigLoss = [...withDiff].sort((a, b) => a.diff - b.diff).slice(0, 5);

  const topEq = equipos
    .filter(e => e.jugados > 0)
    .map(e => ({ ...e, pctV: Math.round(e.victorias / e.jugados * 100), avg: Math.round(e.pts_favor / e.jugados) }))
    .sort((a, b) => b.pctV - a.pctV);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ color: T.text, fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Estadísticas</h2>
        <p style={{ color: T.muted, marginTop: 4, fontSize: 13 }}>Basado en {jugados.length} partidos jugados · Temporada 2025/2026</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
        <KPI label="Victorias"     value={victorias}   color={T.green}  icon="trophy" sub={`${pct}% ratio`} />
        <KPI label="Derrotas"      value={jugados.length - victorias} color={T.red} icon="ball" />
        <KPI label="Pts favor/p."  value={(ptsFavor  / jugados.length).toFixed(1)} color={T.gold}   icon="bar" sub="promedio" />
        <KPI label="Pts contra/p." value={(ptsContra / jugados.length).toFixed(1)} color={T.orange} icon="bar" sub="promedio" />
        <KPI label="Dif. total"    value={`${ptsFavor-ptsContra>0?'+':''}${ptsFavor-ptsContra}`} color={ptsFavor>ptsContra?T.green:T.red} icon="bar" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card>
          <CardHead title="🏆 Mayores Victorias" sub="diferencia de puntos" />
          <div style={{ padding: '4px 22px 10px' }}>
            {bigWins.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none' }}>
                <div>
                  <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{getSC(p)} <span style={{ color: T.dim }}>vs</span> {getRival(p)}</div>
                  <div style={{ color: T.dim, fontSize: 10, marginTop: 2 }}>{fmtDate(p.fecha)} · {cleanCat(p.categoria).slice(0, 32)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ color: T.green, fontWeight: 900, fontSize: 15 }}>{p.sc_pts}–{p.rival_pts}</div>
                  <div style={{ color: T.green, fontSize: 10, fontWeight: 700 }}>+{p.diff}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="😓 Mayores Derrotas" sub="diferencia de puntos" />
          <div style={{ padding: '4px 22px 10px' }}>
            {bigLoss.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none' }}>
                <div>
                  <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{getSC(p)} <span style={{ color: T.dim }}>vs</span> {getRival(p)}</div>
                  <div style={{ color: T.dim, fontSize: 10, marginTop: 2 }}>{fmtDate(p.fecha)} · {cleanCat(p.categoria).slice(0, 32)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ color: T.red, fontWeight: 900, fontSize: 15 }}>{p.sc_pts}–{p.rival_pts}</div>
                  <div style={{ color: T.red, fontSize: 10, fontWeight: 700 }}>{p.diff}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Ranking tabla */}
      <Card style={{ marginBottom: 18 }}>
        <CardHead title="Ranking de Equipos" sub="por porcentaje de victorias" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.bgSub, borderBottom: `2px solid ${T.border}` }}>
                {['#','Equipo','Categoría','J','V','D','% Vict.','Pts/P','Dif.'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: T.muted, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topEq.map((e, i) => {
                const cc   = catColor(e.categoria, T);
                const dif  = e.pts_favor - e.pts_contra;
                const pCol = e.pctV >= 60 ? T.green : e.pctV >= 40 ? T.gold : T.red;
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${T.border}`, background: i%2!==0 ? T.bgSub : 'transparent' }}>
                    <td style={{ padding: '10px 16px', color: i===0?T.gold:T.dim, fontWeight: 900, fontSize: 13 }}>{i+1}</td>
                    <td style={{ padding: '10px 16px', color: T.text, fontWeight: 700, fontSize: 13 }}>{e.nombre}</td>
                    <td style={{ padding: '10px 16px' }}><span style={{ color: cc, fontSize: 11, fontWeight: 700 }}>{cleanCat(e.categoria)}</span></td>
                    <td style={{ padding: '10px 16px', color: T.muted, fontSize: 12 }}>{e.jugados}</td>
                    <td style={{ padding: '10px 16px', color: T.green, fontWeight: 700, fontSize: 12 }}>{e.victorias}</td>
                    <td style={{ padding: '10px 16px', color: T.red, fontWeight: 700, fontSize: 12 }}>{e.derrotas}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 48, background: T.border, borderRadius: 3, height: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${e.pctV}%`, height: '100%', background: pCol, borderRadius: 3 }} />
                        </div>
                        <span style={{ color: pCol, fontWeight: 800, fontSize: 12 }}>{e.pctV}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', color: T.blue, fontWeight: 700, fontSize: 12 }}>{e.avg}</td>
                    <td style={{ padding: '10px 16px', color: dif>=0?T.green:T.red, fontWeight: 700, fontSize: 12 }}>{dif>0?'+':''}{dif}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Por categoría */}
      <Card>
        <CardHead title="Rendimiento por Categoría" sub={`${catList.length} categorías`} />
        <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(215px,1fr))', gap: 10 }}>
          {catList.map(({ cat, v, d, pct: p, total }) => {
            const cc   = catColor(cat, T);
            const pCol = p >= 60 ? T.green : p >= 40 ? T.gold : T.red;
            return (
              <div key={cat} style={{ background: T.bgSub, border: `1px solid ${T.border}`, borderRadius: 10, padding: '13px 15px' }}>
                <div style={{ color: cc, fontSize: 11, fontWeight: 800, marginBottom: 7 }}>{cleanCat(cat)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: T.muted, fontSize: 11 }}>{v}V · {d}D · {total}P</span>
                  <span style={{ color: pCol, fontWeight: 900, fontSize: 15 }}>{p}%</span>
                </div>
                <ProgressBar pct={p} color={pCol} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
