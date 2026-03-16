// ─── Contexto de Autenticación — Supabase Auth ────────────────────────────────
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase.js';

const Ctx = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Refrescar el token para garantizar que user_metadata está actualizado
        const { data } = await supabase.auth.refreshSession();
        setSession(data.session ?? session);
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // El rol se almacena en user_metadata.role al crear el usuario desde el dashboard de Supabase
  // Valores: 'admin' | 'entrenador' | 'consulta'
  const role = session?.user?.user_metadata?.role ?? 'consulta';
  const isAdmin = role === 'admin';
  const canEdit = role === 'admin' || role === 'entrenador';

  const login  = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const logout = () => supabase.auth.signOut();

  return (
    <Ctx.Provider value={{ session, user: session?.user, role, isAdmin, canEdit, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
