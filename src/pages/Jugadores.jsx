import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useTheme } from '../ThemeContext.jsx';
import { useAuth } from '../AuthContext.jsx';
import { cleanCat, catColor } from '../theme.js';
import { useEquipos } from '../hooks/useEquipos.js';
import { useJugadores } from '../hooks/useJugadores.js';
import { Card, Badge, Btn, Modal, Fld, Inp, Sel, Ico, Table, TR, TD, SearchBar } from '../components/ui.jsx';
import { Spinner, ErrorBanner } from '../components/LoadingState.jsx';

const POSICIONES = ['Base','Escolta','Alero','Ala-Pivot','Pivot'];
const BLANK = { nombre:'', equipo:'', categoria:'', posicion:'Base', dorsal:'', edad:'' };

function exportarJugadores(jugadores) {
  const rows = jugadores.map(j => ({
    Dorsal:    j.dorsal ?? '',
    Nombre:    j.nombre,
    Equipo:    j.equipo,
    Categoría: cleanCat(j.categoria || ''),
    Posición:  j.posicion,
    Edad:      j.edad ?? '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Jugadores');
  XLSX.writeFile(wb, 'Jugadores_SanCernin.xlsx');
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
  const catOpts = form.equipo ? equipos.filter(e => e.nombre === form.equipo).map(e => e.categoria) : [];
  const filtered = jugadores.filter(j =>
    j.nombre.toLowerCase().includes(q.toLowerCase()) ||
    j.equipo.toLowerCase().includes(q.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v, ...(k==='equipo' ? {categoria:''} : {}) }));
  const openAdd  = () => { setForm(BLANK); setErr(null); setModal('add'); };
  const openEdit = (j) => { setForm(j);    setErr(null); setModal('edit'); };

  const save = async () => {
    if (!form.nombre || !form.equipo) { setErr('Nombre y equipo son obligatorios'); return; }
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre, equipo: form.equipo, categoria: form.categoria,
        posicion: form.posicion,
        dorsal: form.dorsal ? +form.dorsal : null,
        edad:   form.edad   ? +form.edad   : null,
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <h2 style={{ color: T.text, fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Jugadores</h2>
          <p style={{ color: T.muted, marginTop: 4, fontSize: 13 }}>{jugadores.length} fichas guardadas en Supabase</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn ghost small icon="download" onClick={() => exportarJugadores(filtered)}>
            Exportar Excel
          </Btn>
          {canEdit && <Btn onClick={openAdd} icon="plus">Nuevo Jugador</Btn>}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <SearchBar value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar jugador u equipo…" />
      </div>

      <Card>
        <Table headers={['#','Nombre','Equipo','Categoría','Posición','Edad', ...(canEdit ? [''] : [])]}>
          {filtered.map((j, i) => {
            const cc = catColor(j.categoria || '', T);
            return (
              <TR key={j.id} i={i}>
                <TD><span style={{ color: T.gold, fontWeight: 900, fontSize: 16 }}>{j.dorsal ?? '—'}</span></TD>
                <TD style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>{j.nombre}</TD>
                <TD style={{ color: T.textSub, fontSize: 12 }}>{j.equipo}</TD>
                <TD><span style={{ color: cc, fontSize: 11, fontWeight: 700 }}>{cleanCat(j.categoria || '')}</span></TD>
                <TD><Badge color={T.blue} small>{j.posicion}</Badge></TD>
                <TD style={{ color: T.muted, fontSize: 12 }}>{j.edad ?? '—'}</TD>
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
            {jugadores.length === 0 ? 'No hay jugadores registrados aún. Añade el primero con el botón de arriba.' : 'No se encontraron resultados para esa búsqueda.'}
          </div>
        )}
      </Card>

      {modal && (
        <Modal title={modal==='add' ? 'Nuevo Jugador' : 'Editar Jugador'}
               sub="Los datos se guardan directamente en Supabase"
               onClose={() => setModal(null)}>
          {err && (
            <div style={{ background: T.redAlpha, border: `1px solid ${T.red}35`, borderRadius: 9, padding: '11px 15px', color: T.red, fontSize: 12, marginBottom: 16 }}>
              {err}
            </div>
          )}
          <Fld label="Nombre completo">
            <Inp value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre y apellidos" />
          </Fld>
          <Fld label="Equipo">
            <Sel value={form.equipo} onChange={e => set('equipo', e.target.value)}
              options={[{value:'',label:'Seleccionar equipo…'}, ...eqOpts.map(e => ({value:e,label:e}))]} />
          </Fld>
          {catOpts.length > 0 && (
            <Fld label="Categoría">
              <Sel value={form.categoria} onChange={e => set('categoria', e.target.value)}
                options={[{value:'',label:'Seleccionar categoría…'}, ...catOpts.map(c => ({value:c,label:cleanCat(c)}))]} />
            </Fld>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Fld label="Posición">
              <Sel value={form.posicion} onChange={e => set('posicion', e.target.value)}
                options={POSICIONES.map(p => ({value:p,label:p}))} />
            </Fld>
            <Fld label="Dorsal"><Inp value={form.dorsal} onChange={e => set('dorsal', e.target.value)} type="number" placeholder="7" /></Fld>
            <Fld label="Edad"><Inp   value={form.edad}   onChange={e => set('edad',   e.target.value)} type="number" placeholder="18" /></Fld>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <Btn onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Btn>
            <Btn ghost onClick={() => setModal(null)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
