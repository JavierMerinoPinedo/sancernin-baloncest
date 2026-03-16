-- ─── Tabla de Tareas — Panel Kanban (solo admin) ─────────────────────────────
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS tareas (
  id           bigserial PRIMARY KEY,
  titulo       text NOT NULL,
  descripcion  text,
  fecha_inicio date,
  fecha_fin    date,
  estado       text NOT NULL DEFAULT 'pendiente'
               CHECK (estado IN ('pendiente','en_progreso','revision','completada')),
  prioridad    text NOT NULL DEFAULT 'media'
               CHECK (prioridad IN ('baja','media','alta','urgente')),
  asignado_a   text,
  created_by   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden leer
CREATE POLICY "Lectura autenticados tareas"
  ON tareas FOR SELECT
  USING (auth.role() = 'authenticated');

-- Solo usuarios autenticados pueden escribir (create/update/delete)
CREATE POLICY "Escritura autenticados tareas"
  ON tareas FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
