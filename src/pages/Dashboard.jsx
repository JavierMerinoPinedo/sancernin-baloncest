import { useTheme } from '../ThemeContext.jsx';
import { cleanCat, fmtDate, catColor } from '../theme.js';
import { usePartidos, getSC, getRival, getTipo, getResult } from '../hooks/usePartidos.js';
import { useEquipos } from '../hooks/useEquipos.js';
import { KPI, Card, CardHead, Badge, ProgressBar } from '../components/ui.jsx';
import { Spinner, ErrorBanner } from '../components/LoadingState.jsx';

export default function Dashboard() {
  const { T, dark } = useTheme();
  const { jugados, proximos, victorias, pct, ptsFavor, ptsContra, loading: lp, error: ep } = usePartidos();
  const { equipos, loading: le, error: ee } = useEquipos();

  if (lp || le) return <Spinner />;
  if (ep || ee) return <ErrorBanner message={ep || ee} />;

  const topEquipos = [...equipos]
    .map(e => ({ ...e, pctV: e.jugados > 0 ? Math.round(e.victorias / e.jugados * 100) : 0 }))
    .sort((a, b) => b.pctV - a.pctV).slice(0, 6);

  const ultimos = [...jugados].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);

  return (
    <div>
      {/* Hero banner */}
      <div style={{
        background: dark
          ? `linear-gradient(135deg, #0F1E4A 0%, #0A0A0F 100%)`
          : `linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)`,
        borderRadius: 16, padding: '30px 32px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        border: `1px solid ${dark ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.2)'}`,
        boxShadow: T.shadowMd,
      }}>
        {/* Balón decorativo fondo */}
        <div style={{ position: 'absolute', right: -20, top: -20, opacity: dark ? 0.05 : 0.08 }}>
          <svg width={180} height={180} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.8">
            <circle cx="12" cy="12" r="10"/>
            <path d="M4.93 4.93c4.08 4.08 10.06 4.08 14.14 0"/>
            <path d="M4.93 19.07c4.08-4.08 10.06-4.08 14.14 0"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
        </div>
        <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
          Sección Baloncesto · Temporada 2025/2026
        </div>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 28, letterSpacing: -0.5, marginBottom: 20 }}>
          Club Deportivo San Cernin
        </div>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            { val: `${pct}%`,       label: 'victorias'             },
            { val: victorias,       label: `de ${jugados.length} jugados` },
            { val: proximos.length, label: 'próximos partidos'     },
            { val: equipos.length,  label: 'equipos FNB'           },
          ].map(({ val, label }) => (
            <div key={label}>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: 32, letterSpacing: -1.5, lineHeight: 1 }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
        <KPI label="Equipos"          value={equipos.length}  color={T.blue}  icon="shield" sub="inscritos FNB" />
        <KPI label="Partidos jugados" value={jugados.length}  color={T.text}  icon="ball" />
        <KPI label="Victorias"        value={victorias}       color={T.green} icon="trophy" sub={`${pct}% ratio`} />
        <KPI label="Próximos"         value={proximos.length} color={T.gold}  icon="cal"   sub="pendientes" />
        <KPI label="Pts favor/p."     value={jugados.length > 0 ? (ptsFavor / jugados.length).toFixed(1) : '—'} color={T.blue} icon="bar" sub="promedio" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Próximos */}
        <Card>
          <CardHead title="Próximos Partidos" sub={`${proximos.length} pendientes`}
            right={<Badge color={T.blue}>● Live</Badge>} />
          <div style={{ padding: '4px 22px 8px' }}>
            {proximos.slice(0, 6).map((p, i) => {
              const tipo = getTipo(p);
              const cc = catColor(p.categoria, T);
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < Math.min(proximos.length, 6) - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, background: `${cc}14`, border: `1px solid ${cc}28`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: cc, fontSize: 9, fontWeight: 800 }}>{fmtDate(p.fecha).slice(0, 5)}</div>
                    <div style={{ color: cc, fontSize: 8, marginTop: 1, opacity: 0.8 }}>{p.hora_tbd ? '—' : p.hora?.slice(0, 5)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: T.text, fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getSC(p)}</div>
                    <div style={{ color: T.muted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>vs {getRival(p)}</div>
                  </div>
                  <Badge color={tipo === 'Local' ? T.green : T.blue} small>{tipo}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top equipos */}
        <Card>
          <CardHead title="Rendimiento Equipos" sub="% victorias temporada" />
          <div style={{ padding: '14px 22px 18px' }}>
            {topEquipos.map((e, i) => {
              const cc = catColor(e.categoria, T);
              const pColor = e.pctV >= 60 ? T.green : e.pctV >= 40 ? T.gold : T.red;
              return (
                <div key={e.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: i === 0 ? T.gold : T.dim, fontWeight: 900, fontSize: 11, width: 14, textAlign: 'center' }}>{i + 1}</span>
                      <div>
                        <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{e.nombre.replace('SAN CERNIN', 'SC')}</div>
                        <div style={{ color: T.dim, fontSize: 10 }}>{cleanCat(e.categoria).slice(0, 28)}</div>
                      </div>
                    </div>
                    <span style={{ color: pColor, fontWeight: 800, fontSize: 12 }}>{e.victorias}V {e.derrotas}D</span>
                  </div>
                  <ProgressBar pct={e.pctV} color={pColor} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Últimos resultados */}
      <Card>
        <CardHead title="Últimos Resultados" sub="5 partidos más recientes" />
        <div style={{ padding: '4px 22px 8px' }}>
          {ultimos.map((p, i) => {
            const r = getResult(p);
            const cc = catColor(p.categoria, T);
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ color: T.muted, fontSize: 11, fontWeight: 600, width: 54, flexShrink: 0 }}>{fmtDate(p.fecha)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: T.text, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getSC(p)} <span style={{ color: T.dim }}>vs</span> {getRival(p)}
                  </div>
                  <div style={{ color: cc, fontSize: 11, fontWeight: 600, marginTop: 1 }}>{cleanCat(p.categoria)}</div>
                </div>
                <Badge color={getTipo(p) === 'Local' ? T.green : T.blue} small>{getTipo(p)}</Badge>
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 52 }}>
                  <div style={{ color: r?.win ? T.green : T.red, fontWeight: 900, fontSize: 16 }}>{r?.sc}–{r?.rival}</div>
                  <div style={{ color: r?.win ? T.green : T.red, fontSize: 10, fontWeight: 700 }}>{r?.win ? 'Victoria' : 'Derrota'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
