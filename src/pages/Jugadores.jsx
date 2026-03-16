import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useTheme } from '../ThemeContext.jsx';
import { useAuth } from '../AuthContext.jsx';
import { cleanCat, catColor } from '../theme.js';
import { useEquipos } from '../hooks/useEquipos.js';
import { useJugadores } from '../hooks/useJugadores.js';
import { Card, Badge, Btn, Modal, Fld, Inp, Sel, Ico, Table, TR, TD, SearchBar } from '../components/ui.jsx';
import { Spinner, ErrorBanner } from '../components/LoadingState.jsx';

const POSICIONES = ['', 'Base', 'Escolta', 'Alero', 'Ala-Pivot', 'Pivot'];
const TALLAS     = ['', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const BLANK = {
  nombre: '', apellidos: '', fecha_nacimiento: '',
  email: '', movil: '', dorsal: '',
  talla_camiseta: '', talla_pantaloneta: '', camiseta_reversible: false,
  categoria: '', equipo: '', posicion: '',
};

function exportarJugadores(jugadores) {
  const rows = jugadores.map(j => ({
    Dorsal:                j.dorsal ?? '',
    Nombre:                j.nombre,
    Apellidos:             j.apellidos ?? '',
    'Fecha Nacimiento':    j.fecha_nacimiento ?? '',
    'E-Mail':              j.email ?? '',
    Móvil:                 j.movil ?? '',
    Equipo:                j.equipo ?? '',
    Categoría:             cleanCat(j.categoria || ''),
    'Talla Camiseta':      j.talla_camiseta ?? '',
    'Talla Pantaloneta':   j.talla_pantaloneta ?? '',
    'Camiseta Reversible': j.camiseta_reversible ? 'Sí' : 'No',
    Posición:              j.posicion ?? '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Jugadores');
  XLSX.writeFile(wb, 'Jugadores_SanCernin.xlsx');
}

function Chk({ label, checked, onChange }) {
  const { T } = useTheme();
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }}>
      <input type="checkbox" checked={checked} onChange={onChange}
        style={{ width: 16, height: 16, accentColor: T.blue, cursor: 'pointer', flexShrink: 0 }} />
      <span style={{ color: T.textSub, fontSize: 13 }}>{label}</span>
    </label>
  );
}

export default function Jugadores() {
  const { T } = useTheme();
  const { canEdit } = useAuth();
  const { jugadores, loading: lj, error: ej, add, update, remove } = useJugadores();
  const { equipos,   loading: le, error: ee } = useEquipos();

  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState(BLANK);
  const [q,      setQ]      = useState('');
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null);

  if (lj || le) return <Spinner />;
  if (ej || ee) return <ErrorBanner message={ej || ee} />;

  const eqOpts  = Array.from(new Set(equipos.map(e => e.nombre))).sort();
  const catOpts = form.equipo
    ? equipos.filter(e => e.nombre === form.equipo).map(e => e.categoria)
    : [];

  const ql = q.toLowerCase();
  const filtered = jugadores.filter(j =>
    (j.nombre    || '').toLowerCase().includes(ql) ||
    (j.apellidos || '').toLowerCase().includes(ql) ||
    (j.equipo    || '').toLowerCase().includes(ql)
  );

  const set = (k, v) => setForm(f => ({
    ...f, [k]: v,
    ...(k === 'equipo' ? { categoria: '' } : {}),
  }));
  const openAdd  = () => { setForm(BLANK); setErr(null); setModal('add'); };
  const openEdit = (j) => { setForm(j);    setErr(null); setModal('edit'); };

  const save = async () => {
    if (!form.nombre) { setErr('El nombre es obligatorio'); return; }
    if (!form.equipo) { setErr('El equipo es obligatorio'); return; }
    setSaving(true);
    try {
      const payload = {
        nombre:              form.nombre.trim(),
        apellidos:           form.apellidos?.trim()   || null,
        fecha_nacimiento:    form.fecha_nacimiento    || null,
        email:               form.email?.trim()       || null,
        movil:               form.movil?.trim()       || null,
        dorsal:              form.dorsal !== '' ? +form.dorsal : null,
        talla_camiseta:      form.talla_camiseta      || null,
        talla_pantaloneta:   form.talla_pantaloneta   || null,
        camiseta_reversible: Boolean(form.camiseta_reversible),
        categoria:           form.categoria           || null,
        equipo:              form.equipo,
        posicion:            form.posicion            || null,
      };
      if (modal === 'add') await add(payload);
      else                 await update(form.id, payload);
      setModal(null);
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar jugador?')) return;
    try { await remove(id); } catch (e) { alert(e.message); }
  };

  return (
    <div className="page-jugadores">
      {/* Cabecera */}
      <div className="jugadores-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <h2 style={{ color: T.text, fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Jugadores</h2>
          <p style={{ color: T.muted, marginTop: 4, fontSize: 13 }}>Total fichas: {jugadores.length}</p>
        </div>
        <div className="jugadores-actions" style={{ display: 'flex', gap: 8 }}>
          <Btn ghost small icon="download" onClick={() => exportarJugadores(filtered)}>Exportar Excel</Btn>
          {canEdit && <Btn onClick={openAdd} icon="plus">Nuevo Jugador</Btn>}
        </div>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: 16 }}>
        <SearchBar value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, apellidos o equipo…" />
      </div>

      {/* Tabla */}
      <Card>
        <Table headers={['#', 'Jugador', 'Equipo', 'Categoría', 'Camiseta', 'Pantalón', 'Rev.', ...(canEdit ? [''] : [])]}>
          {filtered.map((j, i) => {
            const cc = catColor(j.categoria || '', T);
            return (
              <TR key={j.id} i={i}>
                <TD>
                  <span style={{ color: T.gold, fontWeight: 900, fontSize: 16 }}>{j.dorsal ?? '—'}</span>
                </TD>
                <TD>
                  <div style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>{j.nombre}</div>
                  {j.apellidos && (
                    <div style={{ color: T.textSub, fontSize: 11, marginTop: 1 }}>{j.apellidos}</div>
                  )}
                </TD>
                <TD style={{ color: T.textSub, fontSize: 12 }}>{j.equipo ?? '—'}</TD>
                <TD>
                  <span style={{ color: cc, fontSize: 11, fontWeight: 700 }}>{cleanCat(j.categoria || '')}</span>
                </TD>
                <TD style={{ color: T.muted, fontSize: 12 }}>{j.talla_camiseta    ?? '—'}</TD>
                <TD style={{ color: T.muted, fontSize: 12 }}>{j.talla_pantaloneta ?? '—'}</TD>
                <TD>
                  {j.camiseta_reversible
                    ? <Badge color={T.blue} small>Sí</Badge>
                    : <span style={{ color: T.dim, fontSize: 11 }}>No</span>}
                </TD>
                {canEdit && (
                  <TD>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEdit(j)} style={{ background: T.bgSub, border: `1px solid ${T.border}`, borderRadius: 7, color: T.muted, cursor: 'pointer', padding: '5px 7px', display: 'flex' }}>
                        <Ico n="edit" s={13} />
                      </button>
                      <button onClick={() => del(j.id)} style={{ background: T.redAlpha, border: `1px solid ${T.red}30`, borderRadius: 7, color: T.red, cursor: 'pointer', padding: '5px 7px', display: 'flex' }}>
                        <Ico n="trash" s={13} />
                      </button>
                    </div>
                  </TD>
                )}
              </TR>
            );
          })}
        </Table>
        {filtered.length === 0 && (
          <div style={{ padding: 50, textAlign: 'center', color: T.muted, fontSize: 13 }}>
            {jugadores.length === 0
              ? 'No hay jugadores registrados. Añade el primero o importa desde el script.'
              : 'No se encontraron resultados para esa búsqueda.'}
          </div>
        )}
      </Card>

      {/* Modal añadir / editar */}
      {modal && (
        <Modal
          className="jugadores-modal"
          title={modal === 'add' ? 'Nuevo Jugador' : 'Editar Jugador'}
          sub="Los datos se guardan directamente en Supabase"
          onClose={() => setModal(null)}
        >
          {err && (
            <div style={{ background: T.redAlpha, border: `1px solid ${T.red}35`, borderRadius: 9, padding: '11px 15px', color: T.red, fontSize: 12, marginBottom: 16 }}>
              {err}
            </div>
          )}

          {/* Nombre + Apellidos */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fld label="Nombre *">
              <Inp value={form.nombre || ''}    onChange={e => set('nombre',    e.target.value)} placeholder="María" />
            </Fld>
            <Fld label="Apellidos">
              <Inp value={form.apellidos || ''} onChange={e => set('apellidos', e.target.value)} placeholder="García López" />
            </Fld>
          </div>

          {/* Email + Móvil */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fld label="E-Mail">
              <Inp value={form.email || ''} onChange={e => set('email', e.target.value)} type="email" placeholder="jugadora@email.com" />
            </Fld>
            <Fld label="Móvil">
              <Inp value={form.movil || ''} onChange={e => set('movil', e.target.value)} placeholder="600 000 000" />
            </Fld>
          </div>

          {/* Fecha Nacimiento + Dorsal */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fld label="Fecha Nacimiento">
              <Inp value={form.fecha_nacimiento || ''} onChange={e => set('fecha_nacimiento', e.target.value)} type="date" />
            </Fld>
            <Fld label="Nº Dorsal">
              <Inp value={form.dorsal || ''} onChange={e => set('dorsal', e.target.value)} type="number" placeholder="7" />
            </Fld>
          </div>

          {/* Tallas + Reversible */}
          <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
            <Fld label="Talla Camiseta">
              <Sel value={form.talla_camiseta || ''} onChange={e => set('talla_camiseta', e.target.value)}
                options={TALLAS.map(t => ({ value: t, label: t || '—' }))} />
            </Fld>
            <Fld label="Talla Pantaloneta">
              <Sel value={form.talla_pantaloneta || ''} onChange={e => set('talla_pantaloneta', e.target.value)}
                options={TALLAS.map(t => ({ value: t, label: t || '—' }))} />
            </Fld>
            <Fld label=" ">
              <div style={{ paddingBottom: 2 }}>
                <Chk
                  label="Reversible"
                  checked={Boolean(form.camiseta_reversible)}
                  onChange={e => set('camiseta_reversible', e.target.checked)}
                />
              </div>
            </Fld>
          </div>

          {/* Equipo + Categoría */}
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fld label="Equipo *">
              <Sel value={form.equipo || ''} onChange={e => set('equipo', e.target.value)}
                options={[{ value: '', label: 'Seleccionar equipo…' }, ...eqOpts.map(e => ({ value: e, label: e }))]} />
            </Fld>
            <Fld label="Categoría">
              {catOpts.length > 0
                ? <Sel value={form.categoria || ''} onChange={e => set('categoria', e.target.value)}
                    options={[{ value: '', label: 'Seleccionar…' }, ...catOpts.map(c => ({ value: c, label: cleanCat(c) }))]} />
                : <Inp value={form.categoria || ''} onChange={e => set('categoria', e.target.value)}
                    placeholder={form.equipo ? 'Sin categorías' : 'Selecciona equipo antes'} />
              }
            </Fld>
          </div>

          {/* Posición (opcional) */}
          <Fld label="Posición (opcional)">
            <Sel value={form.posicion || ''} onChange={e => set('posicion', e.target.value)}
              options={POSICIONES.map(p => ({ value: p, label: p || '— Sin asignar —' }))} />
          </Fld>

          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <Btn onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Btn>
            <Btn ghost onClick={() => setModal(null)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
