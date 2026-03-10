#!/usr/bin/env node
// ─── Script: Reimportar Excel FNB a Supabase ──────────────────────────────────
//
// Uso:
//   node scripts/import-fnb.js ruta/al/Portal_de_Clubs.xlsx
//
// Variables de entorno necesarias (.env o exportadas en terminal):
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY=eyJhbGci...   <-- SERVICE KEY (no la anon key)
//
// Instalar dependencias:
//   npm install xlsx @supabase/supabase-js dotenv
//

import 'dotenv/config';
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

  const col = (name) => hdrs.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
  const C = {
    id:   col('Id Partido'),
    loc:  col('Equipo Local'),
    vis:  col('Equipo Visitante'),
    ptsl: hdrs.findIndex(h => h === 'Columna1') > -1 ? hdrs.findIndex(h => h === 'Columna1') : 7,
    ptsv: hdrs.findIndex(h => h === 'Columna3') > -1 ? hdrs.findIndex(h => h === 'Columna3') : 9,
    fec:  col('Fecha Juego'),
    ins:  col('Instalación'),
    com:  col('Competición'),
    cat:  col('Categoría'),
  };

  const isSC = s => String(s).includes('SAN CERNIN');
  const partidos = [], eqMap = {};

  for (const row of rows.slice(1)) {
    const loc = String(row[C.loc] || '').trim();
    const vis = String(row[C.vis] || '').trim();
    if (!isSC(loc) && !isSC(vis)) continue;

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

  return { partidos, equipos: Object.values(eqMap).map((e, i) => ({ ...e, id: i + 1 })) };
}

async function main() {
  console.log(`📂 Leyendo: ${file}`);
  const { partidos, equipos } = parseExcel(file);
  console.log(`   ${partidos.length} partidos · ${equipos.length} equipos únicos`);

  console.log('\n🗑  Limpiando tablas...');
  await supabase.from('partidos').delete().neq('id', 0);
  await supabase.from('equipos').delete().neq('id', 0);

  console.log('📥 Insertando equipos...');
  const { error: e1 } = await supabase.from('equipos').insert(equipos);
  if (e1) throw e1;
  console.log(`   ✓ ${equipos.length} equipos`);

  console.log('📥 Insertando partidos (batches de 500)...');
  for (let i = 0; i < partidos.length; i += 500) {
    const { error } = await supabase.from('partidos').insert(partidos.slice(i, i + 500));
    if (error) throw error;
    process.stdout.write(`\r   ✓ ${Math.min(i + 500, partidos.length)} / ${partidos.length}`);
  }

  console.log('\n\n✅ Importación completada');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
