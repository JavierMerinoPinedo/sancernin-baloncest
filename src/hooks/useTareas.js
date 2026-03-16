// ─── Hook: CRUD de tareas con Realtime ────────────────────────────────────────
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export function useTareas() {
  const [tareas,  setTareas]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { setError(error.message); setLoading(false); return; }
    setTareas(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();

    // Realtime: sincroniza cambios entre pestañas/usuarios
    const channel = supabase
      .channel('tareas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, () => {
        load();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const add = async (values) => {
    const { data, error } = await supabase
      .from('tareas')
      .insert(values)
      .select()
      .single();
    if (error) throw error;
    setTareas(prev => [data, ...prev]);
    return data;
  };

  const update = async (id, values) => {
    const { data, error } = await supabase
      .from('tareas')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setTareas(prev => prev.map(t => t.id === id ? data : t));
    return data;
  };

  const remove = async (id) => {
    const { error } = await supabase
      .from('tareas')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setTareas(prev => prev.filter(t => t.id !== id));
  };

  return { tareas, loading, error, add, update, remove, refetch: load };
}
