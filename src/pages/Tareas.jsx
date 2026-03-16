// ─── Panel Kanban de Tareas — solo admin ─────────────────────────────────────
import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext.jsx';
import { useAuth }  from '../AuthContext.jsx';
import { useTareas } from '../hooks/useTareas.js';
import { supabase }  from '../lib/supabase.js';
import { Btn, Modal, Fld, Inp, Sel, Ico } from '../components/ui.jsx';
import { Spinner, ErrorBanner } from '../components/LoadingState.jsx';
import { fmtDate } from '../theme.js';

// ── Constantes ────────────────────────────────────────────────────────────────
const ESTADOS = [
  { key: 'pendiente',   label: 'Pendiente',   color: '#6A6A88' },
  { key: 'en_progreso', label: 'En Progreso', color: '#3B82F6' },
  { key: 'revision',    label: 'En Revisión', color: '#F59E0B' },
  { key: 'completada',  label: 'Completada',  color: '#22C55E' },
];

const PRIORIDADES = [
  { key: 'baja',    label: 'Baja',    color: '#22C55E' },
  { key: 'media',   label: 'Media',   color: '#3B82F6' },
  { key: 'alta',    label: 'Alta',    color: '#F59E0B' },
  { key: 'urgente', label: 'Urgente', color: '#EF4444' },
];

const EMPTY_FORM = {
  titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '',
  estado: 'pendiente', prioridad: 'media', asignado_a: '',
};

const TODAY = new Date().toISOString().split('T')[0];

const prioData = (key) => PRIORIDADES.find(p => p.key === key) ?? PRIORIDADES[1];

// ── KPI por columna ───────────────────────────────────────────────────────────
function KanbanKPI({ label, value, color, T }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '14px 18px',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      boxShadow: T.shadow,
    }}>
      <div style={{ color: T.muted, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ color: color || T.text, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ── Tarjeta de tarea (draggable) ──────────────────────────────────────────────
function TareaCard({ tarea, colIdx, totalCols, onEdit, onDelete, onMove, onDragStart, onDragEnd, isDragging, T }) {
  const prio      = prioData(tarea.prioridad);
  const isOverdue = tarea.fecha_fin && tarea.fecha_fin < TODAY && tarea.estado !== 'completada';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        background: T.card,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${isOverdue ? T.red + '55' : T.border}`,
        borderRadius: 12, padding: 14,
        boxShadow: isDragging
          ? `0 12px 40px rgba(0,0,0,.4), 0 0 0 2px ${T.blue}60`
          : isOverdue
            ? `0 0 0 1px ${T.red}22, ${T.shadow}`
            : T.shadow,
        opacity:   isDragging ? 0.55 : 1,
        cursor:    isDragging ? 'grabbing' : 'grab',
        transform: isDragging ? 'rotate(1.5deg) scale(0.97)' : 'none',
        transition: isDragging
          ? 'opacity .1s, transform .1s, box-shadow .1s'
          : 'border-color .2s, box-shadow .2s, opacity .2s, transform .2s',
        userSelect: 'none',
      }}
    >
      {/* Barra de prioridad + título */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 3, borderRadius: 2, flexShrink: 0, alignSelf: 'stretch',
          background: prio.color, minHeight: 16,
        }} />
        <div style={{ fontWeight: 700, fontSize: 13, color: T.text, lineHeight: 1.4, flex: 1 }}>
          {tarea.titulo}
        </div>
      </div>

      {/* Descripción */}
      {tarea.descripcion && (
        <p style={{
          margin: '0 0 8px', fontSize: 11, color: T.textSub, lineHeight: 1.5,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {tarea.descripcion}
        </p>
      )}

      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        <span style={{
          background: `${prio.color}20`, color: prio.color,
          border: `1px solid ${prio.color}35`,
          borderRadius: 6, padding: '2px 6px',
          fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
        }}>
          {prio.label}
        </span>
        {isOverdue && (
          <span style={{
            background: `${T.red}18`, color: T.red,
            border: `1px solid ${T.red}30`,
            borderRadius: 6, padding: '2px 6px',
            fontSize: 9, fontWeight: 800,
          }}>
            VENCIDA
          </span>
        )}
      </div>

      {/* Fechas */}
      {(tarea.fecha_inicio || tarea.fecha_fin) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 10, color: T.muted, flexWrap: 'wrap' }}>
          {tarea.fecha_inicio && <span>📅 {fmtDate(tarea.fecha_inicio)}</span>}
          {tarea.fecha_fin && (
            <span style={{ color: isOverdue ? T.red : T.muted }}>
              → {fmtDate(tarea.fecha_fin)}
            </span>
          )}
        </div>
      )}

      {/* Asignado a */}
      {tarea.asignado_a && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
            background: T.blueAlpha, border: `1px solid ${T.blueBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800, color: T.blueLight,
          }}>
            {tarea.asignado_a.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 11, color: T.textSub }}>{tarea.asignado_a}</span>
        </div>
      )}

      {/* Acciones (quitar pointer events cuando se arrastra para no bloquear drop) */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}`,
          pointerEvents: isDragging ? 'none' : 'auto',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {colIdx > 0 && (
          <button onClick={e => { e.stopPropagation(); onMove(tarea, -1); }} title="Mover atrás"
            style={{
              background: T.bgSub, border: `1px solid ${T.border}`,
              borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
              color: T.muted, fontSize: 11, fontFamily: 'inherit', transition: 'all .15s',
            }}>←</button>
        )}
        {colIdx < totalCols - 1 && (
          <button onClick={e => { e.stopPropagation(); onMove(tarea, 1); }} title="Avanzar"
            style={{
              background: T.blueAlpha, border: `1px solid ${T.blueBorder}`,
              borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
              color: T.blueLight, fontSize: 11, fontFamily: 'inherit', transition: 'all .15s',
            }}>→</button>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={e => { e.stopPropagation(); onEdit(tarea); }} title="Editar"
          style={{
            background: T.bgSub, border: `1px solid ${T.border}`,
            borderRadius: 6, padding: '4px 6px', cursor: 'pointer',
            color: T.muted, display: 'flex', alignItems: 'center', transition: 'all .15s',
          }}>
          <Ico n="edit" s={12} />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(tarea.id); }} title="Eliminar"
          style={{
            background: T.redAlpha, border: `1px solid ${T.red}30`,
            borderRadius: 6, padding: '4px 6px', cursor: 'pointer',
            color: T.red, display: 'flex', alignItems: 'center', transition: 'all .15s',
          }}>
          <Ico n="trash" s={12} />
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Tareas() {
  const { T }    = useTheme();
  const { isAdmin, user } = useAuth();
  const { tareas, loading, error, add, update, remove } = useTareas();

  // ── Estado modal ─────────────────────────────────────────────────────────────
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [editing,    setEditing]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [formErr,    setFormErr]    = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  // ── Estado drag & drop ───────────────────────────────────────────────────────
  const [dragging, setDragging] = useState(null);   // tarea.id en vuelo
  const [dragOver, setDragOver] = useState(null);   // estado.key de columna destino

  // ── Usuarios del sistema (para el selector de asignación) ───────────────────
  const [usuarios, setUsuarios] = useState([]);
  useEffect(() => {
    supabase
      .from('vista_usuarios')
      .select('id, email, nombre, rol')
      .then(({ data }) => { if (data) setUsuarios(data); });
  }, []);

  // ── Guardia admin ────────────────────────────────────────────────────────────
  if (!isAdmin) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{
        background: T.redAlpha, border: `1px solid ${T.red}35`,
        borderRadius: 12, padding: '20px 32px',
        color: T.red, fontWeight: 700, fontSize: 14,
      }}>
        Acceso restringido — solo administradores.
      </div>
    </div>
  );

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner msg={error} />;

  // ── Helpers modal ─────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErr('');
    setModal(true);
  };
  const openEdit = (tarea) => {
    setEditing(tarea.id);
    setForm({
      titulo:       tarea.titulo       ?? '',
      descripcion:  tarea.descripcion  ?? '',
      fecha_inicio: tarea.fecha_inicio ?? '',
      fecha_fin:    tarea.fecha_fin    ?? '',
      estado:       tarea.estado,
      prioridad:    tarea.prioridad,
      asignado_a:   tarea.asignado_a   ?? '',
    });
    setFormErr('');
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErr('');
  };
  const handleSave = async () => {
    if (!form.titulo.trim()) { setFormErr('El título es obligatorio.'); return; }
    setSaving(true);
    setFormErr('');
    try {
      if (editing) {
        await update(editing, form);
      } else {
        await add({ ...form, created_by: user?.email ?? '' });
      }
      closeModal();
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    try { await remove(id); } catch (e) { alert(e.message); }
    setConfirmDel(null);
  };
  const handleMove = async (tarea, dir) => {
    const idx  = ESTADOS.findIndex(e => e.key === tarea.estado);
    const next = ESTADOS[idx + dir];
    if (!next) return;
    try { await update(tarea.id, { ...tarea, estado: next.key }); } catch (e) { alert(e.message); }
  };
  const assignSelf = () => {
    // Buscar el usuario actual en la lista para usar exactamente el mismo valor que el dropdown
    const yo     = usuarios.find(u => u.email === user?.email);
    const nombre = yo
      ? (yo.nombre || yo.email)                                  // coincide con el value de la opción
      : (user?.user_metadata?.nombre || user?.email || '');      // fallback si la vista no está cargada
    setForm(p => ({ ...p, asignado_a: nombre }));
  };
  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  // ── Handlers drag & drop ──────────────────────────────────────────────────────
  const handleDragStart = (e, tarea) => {
    setDragging(tarea.id);
    e.dataTransfer.effectAllowed = 'move';
    // Guardar id en dataTransfer también (necesario en algunos navegadores)
    e.dataTransfer.setData('text/plain', String(tarea.id));
  };
  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };
  const handleColDragOver = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOver !== colKey) setDragOver(colKey);
  };
  const handleColDragLeave = (e) => {
    // Solo resetear si el cursor salió del contenedor (no de un hijo)
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null);
  };
  const handleColDrop = async (e, colKey) => {
    e.preventDefault();
    setDragOver(null);
    const id    = dragging ?? Number(e.dataTransfer.getData('text/plain'));
    const tarea = tareas.find(t => t.id === id);
    setDragging(null);
    if (!tarea || tarea.estado === colKey) return;
    try { await update(tarea.id, { ...tarea, estado: colKey }); } catch (err) { alert(err.message); }
  };

  // ── KPIs ──────────────────────────────────────────────────────────────────────
  const kpis = ESTADOS.map(e => ({
    ...e, count: tareas.filter(t => t.estado === e.key).length,
  }));
  const vencidas = tareas.filter(t =>
    t.fecha_fin && t.fecha_fin < TODAY && t.estado !== 'completada'
  ).length;

  // Opciones para el selector "Asignado a"
  const opcionesUsuarios = [
    { value: '', label: '— Sin asignar —' },
    ...usuarios.map(u => ({
      value: u.nombre || u.email,
      label: u.rol === 'admin'
        ? `${u.nombre || u.email}  ★`
        : u.nombre || u.email,
    })),
  ];

  return (
    <div className="page-tareas">
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 22, color: T.text }}>Panel Tareas</h2>
          <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>
            {tareas.length} tarea{tareas.length !== 1 ? 's' : ''} en total
            {vencidas > 0 && (
              <span style={{ color: T.red, fontWeight: 700, marginLeft: 10 }}>
                · {vencidas} vencida{vencidas !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <Btn icon="plus" onClick={openAdd}>Nueva Tarea</Btn>
      </div>

      {/* KPIs */}
      <div className="tareas-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {kpis.map(k => (
          <KanbanKPI key={k.key} label={k.label} value={k.count} color={k.color} T={T} />
        ))}
      </div>

      {/* Tablero Kanban */}
      <div className="tareas-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, alignItems: 'start' }}>
        {ESTADOS.map((estado, colIdx) => {
          const col      = tareas.filter(t => t.estado === estado.key);
          const isTarget = dragOver === estado.key;

          return (
            <div className="tareas-col" key={estado.key}>
              {/* Cabecera columna */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 14px', borderRadius: 10,
                background: `${estado.color}15`,
                border: `1px solid ${estado.color}28`,
                marginBottom: 12,
              }}>
                <div style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: estado.color, flexShrink: 0,
                }} />
                <span style={{
                  fontWeight: 800, fontSize: 11, color: estado.color,
                  textTransform: 'uppercase', letterSpacing: 0.8, flex: 1,
                }}>
                  {estado.label}
                </span>
                <span style={{
                  background: estado.color, color: '#fff',
                  borderRadius: 8, padding: '1px 7px',
                  fontSize: 10, fontWeight: 800,
                }}>
                  {col.length}
                </span>
              </div>

              {/* Zona de drop */}
              <div
                onDragOver={e  => handleColDragOver(e, estado.key)}
                onDragLeave={e => handleColDragLeave(e)}
                onDrop={e      => handleColDrop(e, estado.key)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 10,
                  minHeight: 80, borderRadius: 10,
                  padding:    isTarget ? 6 : 2,
                  outline:    isTarget ? `2px dashed ${estado.color}70` : '2px dashed transparent',
                  background: isTarget ? `${estado.color}08` : 'transparent',
                  transition: 'all .15s',
                }}
              >
                {col.length === 0 && !isTarget && (
                  <div style={{
                    border: `2px dashed ${T.border}`,
                    borderRadius: 12, padding: '28px 12px',
                    textAlign: 'center', color: T.dim, fontSize: 12,
                  }}>
                    Sin tareas
                  </div>
                )}
                {col.map(tarea => (
                  <TareaCard
                    key={tarea.id}
                    tarea={tarea}
                    colIdx={colIdx}
                    totalCols={ESTADOS.length}
                    onEdit={openEdit}
                    onDelete={setConfirmDel}
                    onMove={handleMove}
                    onDragStart={e => handleDragStart(e, tarea)}
                    onDragEnd={handleDragEnd}
                    isDragging={dragging === tarea.id}
                    T={T}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal nueva / editar tarea ─────────────────────────────────────────── */}
      {modal && (
        <Modal
          className="tareas-modal"
          title={editing ? 'Editar tarea' : 'Nueva tarea'}
          sub={editing ? 'Modifica los campos y guarda.' : 'Rellena los datos de la nueva tarea.'}
          onClose={closeModal}
        >
          <Fld label="Título *">
            <Inp value={form.titulo} onChange={f('titulo')} placeholder="Nombre de la tarea" />
          </Fld>

          <Fld label="Descripción">
            <textarea
              value={form.descripcion}
              onChange={f('descripcion')}
              placeholder="Descripción detallada..."
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: T.bgSub, border: `1px solid ${T.border}`,
                borderRadius: 9, padding: '9px 13px',
                color: T.text, fontSize: 13, fontFamily: 'inherit',
                resize: 'vertical', outline: 'none', transition: 'border-color .15s',
              }}
            />
          </Fld>

          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Fld label="Estado">
              <Sel value={form.estado} onChange={f('estado')}
                options={ESTADOS.map(e => ({ value: e.key, label: e.label }))} />
            </Fld>
            <Fld label="Prioridad">
              <Sel value={form.prioridad} onChange={f('prioridad')}
                options={PRIORIDADES.map(p => ({ value: p.key, label: p.label }))} />
            </Fld>
          </div>

          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Fld label="Fecha inicio">
              <Inp type="date" value={form.fecha_inicio} onChange={f('fecha_inicio')} />
            </Fld>
            <Fld label="Fecha fin">
              <Inp type="date" value={form.fecha_fin} onChange={f('fecha_fin')} />
            </Fld>
          </div>

          {/* Asignado a: botón "Yo" + dropdown de usuarios */}
          <Fld label="Asignado a">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {usuarios.length > 0 ? (
                  <Sel
                    value={form.asignado_a}
                    onChange={f('asignado_a')}
                    options={opcionesUsuarios}
                  />
                ) : (
                  <Inp
                    value={form.asignado_a}
                    onChange={f('asignado_a')}
                    placeholder="Nombre del responsable"
                  />
                )}
              </div>
              <Btn small ghost icon="pin" onClick={assignSelf}>Yo</Btn>
            </div>
          </Fld>

          {formErr && (
            <div style={{ color: T.red, fontSize: 12, marginBottom: 12 }}>{formErr}</div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn ghost onClick={closeModal}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear tarea'}
            </Btn>
          </div>
        </Modal>
      )}

      {/* ── Modal confirmar eliminación ─────────────────────────────────────────── */}
      {confirmDel && (
        <Modal
          title="¿Eliminar tarea?"
          sub="Esta acción no se puede deshacer."
          onClose={() => setConfirmDel(null)}
        >
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Btn ghost onClick={() => setConfirmDel(null)}>Cancelar</Btn>
            <Btn danger onClick={() => handleDelete(confirmDel)}>Eliminar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
