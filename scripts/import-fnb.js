#!/usr/bin/env node
// ─── Script: Reimportar Excel FNB a Supabase ──────────────────────────────────
//
// Uso:
//   node scripts/import-fnb.js "C:\Users\jmeri\Downloads\Portal de Clubs (2).xlsx"
//
// Variables de entorno necesarias (.env o exportadas en terminal):
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY=eyJhbGci...   <-- SERVICE KEY (no la anon key)
//
// Instalar dependencias:
//   npm install xlsx @supabase/supabase-js dotenv
//

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const XLSX    = require('xlsx');

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;

if (!URL || !KEY) {
  console.error('❌ Faltan SUPABASE_URL y SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error('❌ Uso: node scripts/import-fnb.js ruta/al/Excel.xlsx');
  process.exit(1);
}

const supabase = createClient(URL, KEY);

function parseExcel(path) {
  const wb   = XLSX.readFile(path);
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const hdrs = rows[0].map(h => String(h).trim());

  // Mostrar encabezados detectados para diagnóstico
  console.log('📋 Encabezados detectados:', hdrs.join(' | '));

  const col = (name) => hdrs.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
  const C = {
    id:   col('Id Partido'),
    loc:  hdrs.findIndex(h => h.toLowerCase() === 'equipo local'),
    vis:  hdrs.findIndex(h => h.toLowerCase() === 'equipo visitante'),
    ptsl: hdrs.findIndex(h => h === 'Columna1') > -1 ? hdrs.findIndex(h => h === 'Columna1') : 7,
    ptsv: hdrs.findIndex(h => h === 'Columna3') > -1 ? hdrs.findIndex(h => h === 'Columna3') : 9,
    fec:  col('Fecha Juego'),
    ins:  col('Instalación'),
    com:  col('Competición'),
    cat:  col('Categoría'),
  };

  console.log(`   id=${C.id} loc=${C.loc} vis=${C.vis} fec=${C.fec} ins=${C.ins} com=${C.com} cat=${C.cat}`);

  if (C.id < 0 || C.loc < 0 || C.vis < 0) {
    console.error('❌ No se encontraron las columnas clave (Id Partido / Equipo Local / Equipo Visitante).');
    console.error('   Revisa que el Excel es el correcto y que la primera fila contiene los encabezados.');
    process.exit(1);
  }

  const isSC = s => String(s).toUpperCase().includes('SAN CERNIN');
  const partidos = [], eqMap = {};
  let filasSC = 0, filasTotal = 0;

  for (const row of rows.slice(1)) {
    const loc = String(row[C.loc] || '').trim();
    const vis = String(row[C.vis] || '').trim();
    filasTotal++;
    if (!isSC(loc) && !isSC(vis)) continue;
    filasSC++;

    const id = parseInt(row[C.id]);
    if (!id) continue;

    const cat = String(row[C.cat] || '').trim();
    const fRaw = String(row[C.fec] || '').trim();
    let fecha = '', hora = '00:00';
    if (fRaw) {
      const [dp, tp] = fRaw.split(' ');
      const [dd, mm, yyyy] = dp.split('/');
      fecha = `${yyyy}-${mm}-${dd}`;
      hora  = tp || '00:00';
    }

    const ptsl = String(row[C.ptsl] || '').trim();
    const ptsv = String(row[C.ptsv] || '').trim();
    const resultado = /^\d+$/.test(ptsl) && /^\d+$/.test(ptsv) ? `${ptsl}-${ptsv}` : null;

    const sc = isSC(loc) ? loc : vis;
    const key = `${sc}|||${cat}`;
    if (!eqMap[key]) eqMap[key] = { nombre: sc, categoria: cat, victorias: 0, derrotas: 0, pts_favor: 0, pts_contra: 0, jugados: 0 };

    if (resultado) {
      const pl = +ptsl, pv = +ptsv;
      const sp = isSC(loc) ? pl : pv, rp = isSC(loc) ? pv : pl;
      const e = eqMap[key];
      e.jugados++; e.pts_favor += sp; e.pts_contra += rp;
      if (sp > rp) e.victorias++; else e.derrotas++;
    }

    partidos.push({ id, local: loc, visitante: vis, fecha, hora, hora_tbd: hora === '00:00',
      instalacion: String(row[C.ins]||'').trim(), competicion: String(row[C.com]||'').trim(),
      categoria: cat, resultado, equipo_id: key });
  }

  console.log(`   Filas leídas: ${filasTotal} · con SAN CERNIN: ${filasSC}`);
  return { partidos, equipos: Object.values(eqMap) };
}

async function main() {
  console.log(`📂 Leyendo: ${file}`);
  const { partidos, equipos } = parseExcel(file);
  console.log(`   ${partidos.length} partidos · ${equipos.length} equipos únicos\n`);

  if (partidos.length === 0) {
    console.warn('⚠️  No se encontraron partidos de San Cernin. No se modificará nada en la BD.');
    process.exit(0);
  }

  // ── Solo borrar y reimportar partidos (NO tocar equipos) ──────────────────
  console.log('🗑  Limpiando partidos...');
  await supabase.from('partidos').delete().neq('id', 0);

  console.log('📥 Insertando partidos (batches de 500)...');
  for (let i = 0; i < partidos.length; i += 500) {
    const { error } = await supabase.from('partidos').insert(partidos.slice(i, i + 500));
    if (error) throw error;
    process.stdout.write(`\r   ✓ ${Math.min(i + 500, partidos.length)} / ${partidos.length}`);
  }
  console.log('');

  // ── Actualizar stats de equipos existentes (sin borrar ni crear nuevos) ───
  console.log('📊 Actualizando stats de equipos...');
  let actualizados = 0, noEncontrados = 0;
  for (const eq of equipos) {
    const { data } = await supabase
      .from('equipos')
      .select('id')
      .eq('nombre', eq.nombre)
      .eq('categoria', eq.categoria)
      .maybeSingle();

    if (data) {
      await supabase.from('equipos').update({
        victorias:  eq.victorias,
        derrotas:   eq.derrotas,
        pts_favor:  eq.pts_favor,
        pts_contra: eq.pts_contra,
        jugados:    eq.jugados,
      }).eq('id', data.id);
      actualizados++;
    } else {
      console.log(`   ⚠️  Equipo no encontrado en BD: "${eq.nombre}" (${eq.categoria})`);
      noEncontrados++;
    }
  }
  console.log(`   ✓ ${actualizados} equipos actualizados · ${noEncontrados} no encontrados`);

  console.log('\n✅ Importación completada');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
