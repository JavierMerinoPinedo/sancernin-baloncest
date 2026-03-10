import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export function useEquipos() {
  const [equipos,  setEquipos]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    supabase
      .from('equipos')
      .select('*')
      .order('id')
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else       setEquipos(data ?? []);
        setLoading(false);
      });
  }, []);

  return { equipos, loading, error };
}
