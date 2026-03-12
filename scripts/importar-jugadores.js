#!/usr/bin/env node
// ─── Script: Importar jugadores desde Excel a Supabase ────────────────────────
//
// Uso:
//   node scripts/importar-jugadores.js C:\Users\jmeri\Downloads\Jugadores.xlsx
//
// Variables de entorno necesarias (.env o exportadas en terminal):
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY=eyJhbGci...  <-- SERVICE KEY (no la anon key)
//
// Columnas esperadas en el Excel (primera fila = encabezados):
//   Nombre, Apellidos, Fecha Nacimiento, E-Mail, Móvil,
//   Nº Dorsal, Talla Camiseta, Talla pantaloneta, Camiseta reversible,
//   Categoría, NombreEquipo
//

import dotenv from 'dotenv';
dotenv.config();                        // lee .env
dotenv.config({ path: '.env.local' });  // sobreescribe con .env.local (credenciales del proyecto)
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const XLSX    = require('xlsx');

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;

if (!URL || !KEY) {
  console.error('❌ Faltan SUPABASE_URL y SUPABASE_SERVICE_KEY en el entorno');
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error('❌ Uso: node scripts/importar-jugadores.js ruta/al/Jugadores.xlsx');
  process.exit(1);
}

const supabase = createClient(URL, KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normaliza una fecha a formato ISO YYYY-MM-DD.
 *  Acepta: serial Excel, "DD/MM/YYYY", "YYYY-MM-DD", Date object. */
function parseFecha(val) {
  if (!val && val !== 0) return null;

  // Número serial de Excel
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (!d) return null;
    const mm = String(d.m).padStart(2, '0');
    const dd = String(d.d).padStart(2, '0');
    return `${d.y}-${mm}-${dd}`;
  }

  // Objeto Date
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }

  const s = String(val).trim();
  if (!s) return null;

  // DD/MM/YYYY o DD-MM-YYYY
  const ddmm = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmm) return `${ddmm[3]}-${ddmm[2].padStart(2,'0')}-${ddmm[1].padStart(2,'0')}`;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  return null;
}

/** Convierte cualquier valor a boolean: Sí/Si/YES/1/TRUE → true */
function parseBool(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number')  return val !== 0;
  const s = String(val || '').trim().toLowerCase();
  return ['sí', 'si', 'yes', 'true', '1', 'x'].includes(s);
}

/** Busca el índice de una columna por coincidencia parcial (case-insensitive) */
function findCol(headers, search) {
  const s = search.toLowerCase();
  const idx = headers.findIndex(h => String(h).toLowerCase().includes(s));
  return idx >= 0 ? idx : null;
}

// ── Parsear Excel ─────────────────────────────────────────────────────────────

function parseExcel(path) {
  const wb   = XLSX.readFile(path, { cellDates: false });
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  if (rows.length < 2) {
    console.error('❌ El fichero está vacío o sólo tiene encabezados');
    process.exit(1);
  }

  const hdrs = rows[0].map(h => String(h).trim());
  console.log('📋 Columnas detectadas:', hdrs.join(', '));

  // Mapeo flexible de columnas
  const C = {
    nombre:      findCol(hdrs, 'nombre'),
    apellidos:   findCol(hdrs, 'apellido'),
    fecha:       findCol(hdrs, 'nacimiento') ?? findCol(hdrs, 'fecha'),
    email:       findCol(hdrs, 'mail'),
    movil:       findCol(hdrs, 'móvil') ?? findCol(hdrs, 'movil') ?? findCol(hdrs, 'telefono'),
    dorsal:      findCol(hdrs, 'dorsal'),
    camiseta:    findCol(hdrs, 'camiseta') !== null ? hdrs.findIndex((h, i) =>
                   String(h).toLowerCase().includes('camiseta') && !hdrs.slice(0, i).some(prev =>
                     String(prev).toLowerCase().includes('camiseta'))) : null,
    pantalon:    findCol(hdrs, 'pantalo'),
    reversible:  findCol(hdrs, 'reversible'),
    categoria:   findCol(hdrs, 'categoría') ?? findCol(hdrs, 'categoria'),
    equipo:      findCol(hdrs, 'nombreequipo') ?? findCol(hdrs, 'equipo'),
  };

  // Detectar "Talla Camiseta" vs "Camiseta reversible" correctamente
  const tallaIdx = hdrs.findIndex(h => {
    const l = String(h).toLowerCase();
    return l.includes('talla') && l.includes('camiseta');
  });
  const revIdx = hdrs.findIndex(h => String(h).toLowerCase().includes('reversible'));
  if (tallaIdx >= 0) C.camiseta = tallaIdx;
  if (revIdx   >= 0) C.reversible = revIdx;

  // Validar columnas obligatorias
  const missing = [];
  if (C.nombre   === null) missing.push('Nombre');
  if (C.equipo   === null) missing.push('NombreEquipo');
  if (C.categoria=== null) missing.push('Categoría');
  if (missing.length) {
    console.error('❌ Columnas obligatorias no encontradas:', missing.join(', '));
    process.exit(1);
  }

  const jugadores = [];
  const eqSet = new Map(); // "nombre|||categoria" → { nombre, categoria }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    const nombre = String(row[C.nombre] || '').trim();
    if (!nombre) continue; // saltar filas vacías

    const eqNombre   = String(row[C.equipo]    || '').trim();
    const eqCategoria= String(row[C.categoria] || '').trim();
    const key = `${eqNombre}|||${eqCategoria}`;
    if (eqNombre && !eqSet.has(key)) {
      eqSet.set(key, { nombre: eqNombre, categoria: eqCategoria });
    }

    jugadores.push({
      nombre,
      apellidos:           C.apellidos  !== null ? (String(row[C.apellidos]  || '').trim() || null) : null,
      fecha_nacimiento:    C.fecha      !== null ? parseFecha(row[C.fecha])                         : null,
      email:               C.email      !== null ? (String(row[C.email]      || '').trim() || null) : null,
      movil:               C.movil      !== null ? (String(row[C.movil]      || '').trim() || null) : null,
      dorsal:              C.dorsal     !== null ? (parseInt(row[C.dorsal])  || null)               : null,
      talla_camiseta:      C.camiseta   !== null ? (String(row[C.camiseta]   || '').trim() || null) : null,
      talla_pantaloneta:   C.pantalon   !== null ? (String(row[C.pantalon]   || '').trim() || null) : null,
      camiseta_reversible: C.reversible !== null ? parseBool(row[C.reversible])                     : false,
      categoria:           eqCategoria || null,
      equipo:              eqNombre    || null,
    });
  }

  return {
    jugadores,
    equipos: [...eqSet.values()].map((e, i) => ({ ...e, id: i + 1 })),
  };
}

// ── Insertar en Supabase ──────────────────────────────────────────────────────

async function main() {
  console.log(`\n📂 Leyendo: ${file}`);
  const { jugadores, equipos } = parseExcel(file);
  console.log(`   ${jugadores.length} jugadores · ${equipos.length} equipos únicos\n`);

  if (jugadores.length === 0) {
    console.warn('⚠️  No se encontraron jugadores. Revisa el fichero y las columnas.');
    process.exit(0);
  }

  // Preguntar confirmación
  console.log('⚠️  Se borrarán los datos actuales de las tablas jugadores y equipos.');
  console.log('   Equipos a insertar:');
  equipos.forEach(e => console.log(`     · ${e.nombre} (${e.categoria})`));
  console.log('');

  // ── Limpiar tablas ──
  console.log('🗑  Limpiando tablas...');
  const { error: d1 } = await supabase.from('jugadores').delete().neq('id', 0);
  if (d1) { console.error('❌ Error limpiando jugadores:', d1.message); process.exit(1); }
  const { error: d2 } = await supabase.from('equipos').delete().neq('id', 0);
  if (d2) { console.error('❌ Error limpiando equipos:', d2.message); process.exit(1); }

  // ── Insertar equipos ──
  if (equipos.length > 0) {
    console.log('📥 Insertando equipos...');
    const { error: e1 } = await supabase.from('equipos').insert(equipos);
    if (e1) { console.error('❌ Error insertando equipos:', e1.message); process.exit(1); }
    console.log(`   ✓ ${equipos.length} equipos`);
  }

  // ── Insertar jugadores en batches de 200 ──
  console.log('📥 Insertando jugadores...');
  const BATCH = 200;
  for (let i = 0; i < jugadores.length; i += BATCH) {
    const batch = jugadores.slice(i, i + BATCH);
    const { error } = await supabase.from('jugadores').insert(batch);
    if (error) {
      console.error(`\n❌ Error en batch ${i}–${i + BATCH}:`, error.message);
      process.exit(1);
    }
    process.stdout.write(`\r   ✓ ${Math.min(i + BATCH, jugadores.length)} / ${jugadores.length}`);
  }

  console.log('\n\n✅ Importación completada correctamente');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
