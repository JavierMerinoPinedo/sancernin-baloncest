// ─── Página de Perfil de usuario ─────────────────────────────────────────────
import { useState } from 'react';
import { useTheme } from '../ThemeContext.jsx';
import { useAuth }  from '../AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { Card, CardHead, Fld, Inp, Btn, Ico } from '../components/ui.jsx';

const ROL_LABEL = { admin: '👑 Admin', entrenador: '🏀 Entrenador', consulta: '👁 Consulta' };
const ROL_COLOR = (role, T) =>
  role === 'admin' ? T.gold : role === 'entrenador' ? T.blueLight : T.muted;
const ROL_BG = (role, T) =>
  role === 'admin' ? `${T.gold}18` : role === 'entrenador' ? T.blueAlpha : T.bgSub;
const ROL_BORDER = (role, T) =>
  role === 'admin' ? `${T.gold}35` : role === 'entrenador' ? T.blueBorder : T.border;

// ── Mensaje de feedback (éxito / error) ───────────────────────────────────────
function Msg({ text }) {
  const { T } = useTheme();
  if (!text) return null;
  const ok = text.startsWith('✓');
  return (
    <div style={{
      background: ok ? T.greenAlpha : T.redAlpha,
      border: `1px solid ${ok ? T.green : T.red}35`,
      borderRadius: 8, padding: '8px 12px',
      color: ok ? T.green : T.red,
      fontSize: 12, fontWeight: 600, marginBottom: 14,
    }}>
      {text}
    </div>
  );
}

export default function Perfil() {
  const { T }              = useTheme();
  const { user, role }     = useAuth();

  const nombreInicial = user?.user_metadata?.nombre || '';

  // ── Estado: datos del perfil ─────────────────────────────────────────────────
  const [nombre,      setNombre]      = useState(nombreInicial);
  const [savingDatos, setSavingDatos] = useState(false);
  const [msgDatos,    setMsgDatos]    = useState('');

  // ── Estado: cambio de contraseña ─────────────────────────────────────────────
  const [pwd,         setPwd]         = useState('');
  const [pwd2,        setPwd2]        = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [savingPwd,   setSavingPwd]   = useState(false);
  const [msgPwd,      setMsgPwd]      = useState('');

  // ── Guardar datos del perfil ─────────────────────────────────────────────────
  const saveDatos = async () => {
    setSavingDatos(true);
    setMsgDatos('');
    try {
      const { error } = await supabase.auth.updateUser({ data: { nombre: nombre.trim() } });
      if (error) throw error;
      setMsgDatos('✓ Nombre actualizado correctamente');
    } catch (e) {
      setMsgDatos(e.message);
    } finally {
      setSavingDatos(false);
    }
  };

  // ── Cambiar contraseña ───────────────────────────────────────────────────────
  const savePwd = async () => {
    if (pwd.length < 6) { setMsgPwd('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (pwd !== pwd2)   { setMsgPwd('Las contraseñas no coinciden.'); return; }
    setSavingPwd(true);
    setMsgPwd('');
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      setMsgPwd('✓ Contraseña actualizada correctamente');
      setPwd('');
      setPwd2('');
    } catch (e) {
      setMsgPwd(e.message);
    } finally {
      setSavingPwd(false);
    }
  };

  const displayName = nombre.trim() || user?.email?.split('@')[0] || '—';
  const initial     = displayName.charAt(0).toUpperCase();

  return (
    <div className="page-perfil" style={{ maxWidth: 580, margin: '0 auto' }}>

      {/* ── Cabecera de perfil ── */}
      <div className="perfil-header" style={{
        display: 'flex', alignItems: 'center', gap: 20,
        marginBottom: 32,
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: 18, flexShrink: 0,
          background: ROL_BG(role, T),
          border: `2px solid ${ROL_BORDER(role, T)}`,
          boxShadow: `0 0 28px ${ROL_BG(role, T)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 900, color: ROL_COLOR(role, T),
        }}>
          {initial}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 4px', fontWeight: 900, fontSize: 20, color: T.text }}>
            {displayName}
          </h2>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 8 }}>
            {user?.email}
          </div>
          <span style={{
            background: ROL_BG(role, T),
            border: `1px solid ${ROL_BORDER(role, T)}`,
            borderRadius: 8, padding: '3px 10px',
            color: ROL_COLOR(role, T),
            fontSize: 11, fontWeight: 700,
          }}>
            {ROL_LABEL[role] ?? role}
          </span>
        </div>
      </div>

      {/* ── Card: Información del perfil ── */}
      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title="Información del perfil"
          sub="Nombre que aparece en las tareas asignadas"
        />
        <div style={{ padding: 22 }}>
          <Fld label="Nombre visible">
            <Inp
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              onKeyDown={e => e.key === 'Enter' && saveDatos()}
            />
          </Fld>

          <Fld label="Email">
            <div style={{
              width: '100%', boxSizing: 'border-box',
              background: T.bgSub, border: `1px solid ${T.border}`,
              borderRadius: 9, padding: '9px 13px',
              color: T.muted, fontSize: 13, opacity: 0.7,
            }}>
              {user?.email}
            </div>
            <div style={{ color: T.dim, fontSize: 11, marginTop: 6 }}>
              El email solo puede cambiarlo un administrador desde Supabase.
            </div>
          </Fld>

          <Fld label="Rol">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: ROL_BG(role, T), border: `1px solid ${ROL_BORDER(role, T)}`,
              borderRadius: 9, padding: '8px 14px',
              color: ROL_COLOR(role, T), fontSize: 13, fontWeight: 700,
            }}>
              {ROL_LABEL[role] ?? role}
            </div>
            <div style={{ color: T.dim, fontSize: 11, marginTop: 6 }}>
              El rol lo asigna el administrador del club.
            </div>
          </Fld>

          <Msg text={msgDatos} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn icon="check" onClick={saveDatos} disabled={savingDatos}>
              {savingDatos ? 'Guardando…' : 'Guardar nombre'}
            </Btn>
          </div>
        </div>
      </Card>

      {/* ── Card: Seguridad ── */}
      <Card>
        <CardHead
          title="Seguridad"
          sub="Cambia tu contraseña de acceso"
        />
        <div style={{ padding: 22 }}>
          <Fld label="Nueva contraseña">
            <div style={{ position: 'relative' }}>
              <Inp
                type={showPwd ? 'text' : 'password'}
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                onClick={() => setShowPwd(p => !p)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.muted, display: 'flex', padding: 2,
                }}
              >
                <Ico n={showPwd ? 'sun' : 'moon'} s={14} />
              </button>
            </div>
          </Fld>

          <Fld label="Confirmar contraseña">
            <Inp
              type={showPwd ? 'text' : 'password'}
              value={pwd2}
              onChange={e => setPwd2(e.target.value)}
              placeholder="Repite la contraseña"
              onKeyDown={e => e.key === 'Enter' && savePwd()}
            />
          </Fld>

          {/* Indicador de fortaleza visual */}
          {pwd.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map(n => (
                  <div key={n} style={{
                    flex: 1, height: 4, borderRadius: 2,
                    background: pwd.length >= n * 3
                      ? pwd.length >= 12 ? T.green : pwd.length >= 8 ? T.gold : T.orange
                      : T.border,
                    transition: 'background .2s',
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 10, color: T.muted }}>
                {pwd.length < 6 ? 'Demasiado corta' : pwd.length < 8 ? 'Aceptable' : pwd.length < 12 ? 'Buena' : 'Excelente'}
              </div>
            </div>
          )}

          <Msg text={msgPwd} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn icon="check" onClick={savePwd} disabled={savingPwd || pwd.length < 6}>
              {savingPwd ? 'Guardando…' : 'Cambiar contraseña'}
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}
