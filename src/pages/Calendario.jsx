import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useTheme } from '../ThemeContext.jsx';
import { cleanCat, fmtDate, catColor, TODAY } from '../theme.js';
import { usePartidos, getSC, getRival, getTipo, getResult } from '../hooks/usePartidos.js';
import { useEquipos } from '../hooks/useEquipos.js';
import { Card, Badge, Pill, Btn, Ico, Table, TR, TD, SearchBar, Modal } from '../components/ui.jsx';
import { Spinner, ErrorBanner } from '../components/LoadingState.jsx';

const PER_PAGE = 25;

function exportarCalendario(partidos, filtro = '') {
  const rows = partidos.map(p => {
    const res = getResult(p);
    return {
      Fecha: fmtDate(p.fecha),
      Hora: p.hora_tbd ? 'TBD' : (p.hora?.slice(0, 5) ?? ''),
      'Equipo SC': getSC(p),
      Rival: getRival(p),
      Tipo: getTipo(p),
      Categoría: cleanCat(p.categoria),
      Competición: p.competicion ?? '',
      Pabellón: p.instalacion ?? '',
      Resultado: res ? `${res.sc}–${res.rival}` : 'Pendiente',
      Victoria: res ? (res.win ? 'Sí' : 'No') : '',
    };
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Calendario');
  XLSX.writeFile(wb, `Calendario_SanCernin${filtro ? `_${filtro}` : ''}.xlsx`);
}

export default function Calendario() {
  const { T } = useTheme();
  const { partidos, loading: lp, error: ep } = usePartidos();
  const { equipos,  loading: le, error: ee } = useEquipos();

  const [q,          setQ]          = useState('');
  const [fEq,        setFEq]        = useState('Todos');
  const [fCat,       setFCat]       = useState('Todas');
  const [fEstado,    setFEstado]    = useState('Todos');
  const [page,       setPage]       = useState(0);
  const [selected,   setSelected]   = useState(null); // partido seleccionado para el modal

  const reset = () => setPage(0);

  const filtered = useMemo(() => {
    let res = partidos;
    if (fEq !== 'Todos')         res = res.filter(p => getSC(p) === fEq);
    if (fCat !== 'Todas')        res = res.filter(p => p.categoria === fCat);
    if (fEstado === 'Jugados')   res = res.filter(p =>  p.resultado);
    if (fEstado === 'Próximos')  res = res.filter(p => !p.resultado && p.fecha >= TODAY);
    if (fEstado === 'Esta semana') {
      const nw = new Date(TODAY); nw.setDate(nw.getDate() + 7);
      const nwStr = nw.toISOString().split('T')[0];
      res = res.filter(p => !p.resultado && p.fecha >= TODAY && p.fecha <= nwStr);
    }
    if (q) {
      const ql = q.toLowerCase();
      res = res.filter(p =>
        p.local.toLowerCase().includes(ql) ||
        p.visitante.toLowerCase().includes(ql) ||
        p.instalacion.toLowerCase().includes(ql)
      );
    }
    const asc = fEstado === 'Próximos' || fEstado === 'Esta semana';
    return [...res].sort((a, b) => asc
      ? a.fecha.localeCompare(b.fecha)
      : b.fecha.localeCompare(a.fecha)
    );
  }, [partidos, q, fEq, fCat, fEstado]);

  if (lp || le) return <Spinner />;
  if (ep || ee) return <ErrorBanner message={ep || ee} />;

  const equiposList = ['Todos', ...Array.from(new Set(equipos.map(e => e.nombre))).sort()];
  const catsList    = ['Todas', ...Array.from(new Set(partidos.map(p => p.categoria))).sort()];

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const items = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const selStyle = {
    background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
    padding: '9px 14px', color: T.text, fontSize: 12, outline: 'none',
    fontFamily: 'inherit', boxShadow: T.shadow, cursor: 'pointer',
  };

  return (
    <div className="page-calendario">
      <div className="cal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <h2 style={{ color: T.text, fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Calendario FNB</h2>
          <p style={{ color: T.muted, marginTop: 4, fontSize: 13 }}>{filtered.length} partidos · Federación Navarra de Baloncesto</p>
        </div>
        <div className="cal-header-actions" style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: T.greenAlpha, border: `1px solid ${T.green}30`, borderRadius: 8, padding: '6px 14px', color: T.green, fontSize: 11, fontWeight: 700 }}>
            ✓ {partidos.filter(p => p.resultado).length} jugados
          </div>
          <div style={{ background: T.blueAlpha, border: `1px solid ${T.blue}30`, borderRadius: 8, padding: '6px 14px', color: T.blue, fontSize: 11, fontWeight: 700 }}>
            ⏳ {partidos.filter(p => !p.resultado).length} pendientes
          </div>
          {/* Botón exportar */}
          <Btn ghost small icon="download" onClick={() => exportarCalendario(filtered, fEq !== 'Todos' ? fEq : fCat !== 'Todas' ? fCat : '')}>
            Exportar Excel
          </Btn>
        </div>
      </div>

      {/* Filtros */}
      <div className="cal-filters-row" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar value={q} onChange={e => { setQ(e.target.value); reset(); }} placeholder="Rival, pabellón…" />
        <select value={fEq} onChange={e => { setFEq(e.target.value); reset(); }} style={selStyle}>
          {equiposList.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={fCat} onChange={e => { setFCat(e.target.value); reset(); }} style={{ ...selStyle, maxWidth: 240 }}>
          {catsList.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['Todos','Próximos','Esta semana','Jugados'].map(s => (
          <Pill key={s} active={fEstado===s} onClick={() => { setFEstado(s); reset(); }}>{s}</Pill>
        ))}
      </div>

      <Card>
        <Table headers={['Fecha','Hora','Equipo SC','Rival','Categoría','Pabellón','Tipo','Resultado']}>
          {items.map((p, i) => {
            const tipo = getTipo(p);
            const res  = getResult(p);
            const cc   = catColor(p.categoria, T);
            return (
              <TR key={p.id} i={i} onClick={() => setSelected(p)}>
                <TD style={{ color: T.text, fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(p.fecha)}</TD>
                <TD style={{ color: p.hora_tbd ? T.dim : T.muted, fontSize: 12 }}>{p.hora_tbd ? '—' : p.hora?.slice(0,5)}</TD>
                <TD style={{ color: T.gold, fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap' }}>{getSC(p)}</TD>
                <TD style={{ color: T.text, fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getRival(p)}</TD>
                <TD><span style={{ color: cc, fontSize: 11, fontWeight: 700 }}>{cleanCat(p.categoria)}</span></TD>
                <TD style={{ color: T.muted, fontSize: 11 }}>{p.instalacion}</TD>
                <TD><Badge color={tipo==='Local'?T.green:T.blue} small>{tipo}</Badge></TD>
                <TD>
                  {res
                    ? <span style={{ color: res.win?T.green:T.red, fontWeight: 900, fontSize: 14 }}>{res.sc}–{res.rival}</span>
                    : <span style={{ color: T.dim, fontSize: 11 }}>Pendiente</span>}
                </TD>
              </TR>
            );
          })}
        </Table>
        {pages > 1 && (
          <div className="cal-pagination" style={{ padding: '14px 22px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: T.muted, fontSize: 12 }}>Página {page+1} de {pages} · {filtered.length} partidos</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost small onClick={() => setPage(p => Math.max(0, p-1))}        disabled={page === 0}>← Anterior</Btn>
              <Btn ghost small onClick={() => setPage(p => Math.min(pages-1, p+1))}  disabled={page === pages-1}>Siguiente →</Btn>
            </div>
          </div>
        )}
      </Card>

      {/* Modal detalle de partido */}
      {selected && <PartidoModal partido={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function PartidoModal({ partido: p, onClose }) {
  const { T } = useTheme();
  const tipo  = getTipo(p);
  const res   = getResult(p);
  const cc    = catColor(p.categoria, T);

  const row = (label, val) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
      <span style={{ color: T.muted, fontSize: 12, fontWeight: 600 }}>{label}</span>
      <span style={{ color: T.text, fontSize: 12, fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
    </div>
  );

  return (
    <Modal
      title={`${getSC(p)} vs ${getRival(p)}`}
      sub={`${fmtDate(p.fecha)} · ${p.hora_tbd ? 'Hora TBD' : p.hora?.slice(0, 5)}`}
      onClose={onClose}
    >
      {/* Resultado destacado */}
      {res ? (
        <div style={{
          background: res.win ? T.greenAlpha : T.redAlpha,
          border: `1px solid ${res.win ? T.green : T.red}35`,
          borderRadius: 12, padding: '18px 22px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: T.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Resultado final
            </div>
            <div style={{ color: res.win ? T.green : T.red, fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
              {res.sc} – {res.rival}
            </div>
          </div>
          <div style={{
            background: res.win ? T.green : T.red,
            color: '#fff', fontWeight: 900, fontSize: 16,
            borderRadius: 10, padding: '8px 18px',
          }}>
            {res.win ? 'Victoria' : 'Derrota'}
          </div>
        </div>
      ) : (
        <div style={{
          background: T.blueAlpha, border: `1px solid ${T.blueBorder}`,
          borderRadius: 12, padding: '14px 22px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Ico n="cal" s={18} color={T.blue} />
          <div>
            <div style={{ color: T.blue, fontWeight: 800, fontSize: 14 }}>Partido pendiente</div>
            <div style={{ color: T.muted, fontSize: 12 }}>{fmtDate(p.fecha)} · {p.hora_tbd ? 'Hora por confirmar' : p.hora?.slice(0, 5)}</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 4 }}>
        {row('Equipo San Cernin', getSC(p))}
        {row('Rival', getRival(p))}
        {row('Tipo', <Badge color={tipo === 'Local' ? T.green : T.blue} small>{tipo}</Badge>)}
        {row('Fecha', fmtDate(p.fecha))}
        {row('Hora', p.hora_tbd ? 'Por confirmar' : (p.hora?.slice(0, 5) ?? '—'))}
        {row('Pabellón', p.instalacion || '—')}
        {row('Competición', p.competicion || '—')}
        {row('Categoría', <span style={{ color: cc, fontWeight: 700 }}>{cleanCat(p.categoria)}</span>)}
      </div>
    </Modal>
  );
}
