-- ─── Vista de usuarios para el selector de asignación de tareas ──────────────
-- Ejecutar en el SQL Editor de Supabase (después de migration-tareas.sql)
--
-- Expone email, nombre y rol de todos los usuarios registrados
-- a los usuarios autenticados, sin revelar datos sensibles.

CREATE OR REPLACE VIEW public.vista_usuarios AS
SELECT
  id::text                                                            AS id,
  email,
  COALESCE(raw_user_meta_data->>'role', 'consulta')                  AS rol,
  COALESCE(raw_user_meta_data->>'nombre', split_part(email, '@', 1)) AS nombre
FROM auth.users
ORDER BY email;

-- Permitir lectura solo a usuarios autenticados
GRANT SELECT ON public.vista_usuarios TO authenticated;
