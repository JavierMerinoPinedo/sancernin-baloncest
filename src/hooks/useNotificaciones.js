// ─── Hook: Notificaciones de partidos próximos ───────────────────────────────
import { useEffect } from 'react';
import { getSC, getRival } from './usePartidos.js';

const STORAGE_KEY = 'sc-notif-v1';

function getNotificados() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveNotificados(set) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])); } catch {}
}

export function useNotificaciones(proximos = []) {
  const permiso = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  const soportado = 'Notification' in window;

  // Mostrar notificaciones automáticamente al cargar si hay permiso y hay partidos hoy/mañana
  useEffect(() => {
    if (permiso !== 'granted' || proximos.length === 0) return;

    const hoy   = new Date().toISOString().split('T')[0];
    const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const relevantes = proximos.filter(p => p.fecha === hoy || p.fecha === manana);
    if (relevantes.length === 0) return;

    const notificados = getNotificados();
    const nuevos = relevantes.filter(p => !notificados.has(String(p.id)));
    if (nuevos.length === 0) return;

    nuevos.forEach(p => {
      const cuando = p.fecha === hoy ? 'Hoy' : 'Mañana';
      const hora   = p.hora_tbd ? 'Hora TBD' : (p.hora?.slice(0, 5) ?? '');
      new Notification(`🏀 ${cuando}: ${getSC(p)}`, {
        body: `vs ${getRival(p)} · ${hora} · ${p.instalacion}`,
        icon: '/sancernin.webp',
        tag:  `sc-partido-${p.id}`,
      });
      notificados.add(String(p.id));
    });

    saveNotificados(notificados);
  }, [proximos, permiso]);

  const pedirPermiso = async () => {
    if (!soportado) return 'unsupported';
    if (permiso === 'granted') {
      // Forzar notificación de prueba
      new Notification('🏀 Notificaciones activas', {
        body: 'Recibirás avisos de los partidos de hoy y mañana al abrir la app.',
        icon: '/sancernin.webp',
      });
      return 'granted';
    }
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      new Notification('🏀 Notificaciones activas', {
        body: 'Recibirás avisos de los partidos de hoy y mañana al abrir la app.',
        icon: '/sancernin.webp',
      });
    }
    return result;
  };

  return { permiso, soportado, pedirPermiso };
}
