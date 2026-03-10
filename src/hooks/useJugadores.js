// ─── Hook: CRUD de jugadores con Realtime ─────────────────────────────────────
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export function useJugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('jugadores')
      .select('*')
      .order('nombre');
    if (error) { setError(error.message); setLoading(false); return; }
    setJugadores(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();

    // Realtime: si otro usuario del club añade/edita un jugador, se refleja aquí
    const channel = supabase
      .channel('jugadores-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jugadores' }, () => {
        load();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const add = async (values) => {
    const { data, error } = await supabase
      .from('jugadores')
      .insert(values)
      .select()
      .single();
    if (error) throw error;
    // Realtime actualizará la lista automáticamente; también lo hacemos local para respuesta inmediata
    setJugadores(prev => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    return data;
  };

  const update = async (id, values) => {
    const { data, error } = await supabase
      .from('jugadores')
      .update(values)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setJugadores(prev => prev.map(j => j.id === id ? data : j));
    return data;
  };

  const remove = async (id) => {
    const { error } = await supabase
      .from('jugadores')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setJugadores(prev => prev.filter(j => j.id !== id));
  };

  return { jugadores, loading, error, add, update, remove, refetch: load };
}
