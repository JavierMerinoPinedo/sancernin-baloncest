// ─── Hook: partidos desde Supabase con Realtime ───────────────────────────────
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase.js';

export const TODAY = new Date().toISOString().split('T')[0];

// ── Helpers de lógica San Cernin ─────────────────────────────────────────────
export const isSC     = (s = '') => s.includes('SAN CERNIN');
export const getSC    = (p) => isSC(p.local) ? p.local : p.visitante;
export const getRival = (p) => isSC(p.local) ? p.visitante : p.local;
export const getTipo  = (p) => isSC(p.local) ? 'Local' : 'Visitante';

export const getResult = (p) => {
  if (!p.resultado) return null;
  const [pl, pv] = p.resultado.split('-').map(Number);
  const sc    = isSC(p.local) ? pl : pv;
  const rival = isSC(p.local) ? pv : pl;
  return { sc, rival, win: sc > rival, local: pl, visit: pv };
};

// ── Hook principal ────────────────────────────────────────────────────────────
export function usePartidos() {
  const [partidos, setPartidos] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    // Carga inicial
    const load = async () => {
      const { data, error } = await supabase
        .from('partidos')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora',  { ascending: true });
      if (error) { setError(error.message); setLoading(false); return; }
      setPartidos(data ?? []);
      setLoading(false);
    };
    load();

    // Suscripción Realtime — se actualiza automáticamente si cambia la BD
    const channel = supabase
      .channel('partidos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidos' }, () => {
        load(); // recarga al detectar cualquier cambio
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Stats derivados (recalculados sólo cuando cambia partidos)
  const stats = useMemo(() => {
    const jugados   = partidos.filter(p =>  p.resultado);
    const proximos  = partidos.filter(p => !p.resultado && p.fecha >= TODAY)
                       .sort((a, b) => a.fecha.localeCompare(b.fecha));
    const victorias = jugados.filter(p => getResult(p)?.win).length;
    const derrotas  = jugados.length - victorias;
    const pct       = jugados.length > 0 ? Math.round(victorias / jugados.length * 100) : 0;
    const ptsFavor  = jugados.reduce((s, p) => {
      const r = getResult(p); return s + (isSC(p.local) ? r.local : r.visit);
    }, 0);
    const ptsContra = jugados.reduce((s, p) => {
      const r = getResult(p); return s + (isSC(p.local) ? r.visit : r.local);
    }, 0);
    return { jugados, proximos, victorias, derrotas, pct, ptsFavor, ptsContra };
  }, [partidos]);

  return { partidos, loading, error, ...stats };
}
