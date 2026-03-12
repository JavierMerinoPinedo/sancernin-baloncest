-- ─── Migración: Recrear tablas equipos y jugadores ───────────────────────────
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ¡ATENCIÓN! Esto borra todos los datos existentes en ambas tablas.

-- 1. Eliminar tablas
DROP TABLE IF EXISTS jugadores CASCADE;
-- DROP TABLE IF EXISTS equipos   CASCADE;

-- 2. Recrear equipos (misma estructura, constraint UNIQUE añadido)
-- CREATE TABLE equipos (
--   id         bigint  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
--   nombre     text    NOT NULL,
--   categoria  text    NOT NULL,
--   victorias  integer NOT NULL DEFAULT 0,
--   derrotas   integer NOT NULL DEFAULT 0,
--   pts_favor  integer NOT NULL DEFAULT 0,
--   pts_contra integer NOT NULL DEFAULT 0,
--   jugados    integer NOT NULL DEFAULT 0,
--   UNIQUE(nombre, categoria)
-- );

-- 3. Recrear jugadores con nuevo esquema (campos del Excel del club)
CREATE TABLE jugadores (
  id                   bigint  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre               text    NOT NULL,
  apellidos            text,
  fecha_nacimiento     date,
  email                text,
  movil                text,
  dorsal               integer,
  talla_camiseta       text,
  talla_pantaloneta    text,
  camiseta_reversible  boolean NOT NULL DEFAULT false,
  categoria            text,
  equipo               text,
  posicion             text,   -- campo manual (no viene del Excel)
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- 4. Activar Row Level Security (necesario para Supabase Auth)
ALTER TABLE equipos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;

-- 5. Policies: lectura pública, escritura sólo autenticados
CREATE POLICY "Lectura pública equipos"
  ON equipos FOR SELECT USING (true);

CREATE POLICY "Escritura autenticados equipos"
  ON equipos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Lectura pública jugadores"
  ON jugadores FOR SELECT USING (true);

CREATE POLICY "Escritura autenticados jugadores"
  ON jugadores FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
