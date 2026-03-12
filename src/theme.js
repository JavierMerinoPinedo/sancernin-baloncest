// ─── TOKENS DE TEMA GLASSMORPHISM — Club Deportivo San Cernin ─────────────────

export const DARK = {
  blue:       '#3B82F6',
  blueDark:   '#1D4ED8',
  blueLight:  '#93C5FD',
  blueGlow:   'rgba(59,130,246,0.35)',
  blueAlpha:  'rgba(59,130,246,0.12)',
  blueBorder: 'rgba(59,130,246,0.35)',

  // Fondo sólido para el body (fallback) y gradiente principal
  bg:         '#060615',
  bgGrad:     'linear-gradient(135deg, #060615 0%, #0c0e2a 35%, #060615 65%, #0f0620 100%)',
  bgMid:      'rgba(8,8,22,0.82)',
  bgSub:      'rgba(255,255,255,0.04)',
  card:       'rgba(255,255,255,0.05)',
  cardHover:  'rgba(255,255,255,0.09)',
  border:     'rgba(255,255,255,0.09)',
  borderMid:  'rgba(255,255,255,0.16)',

  text:       '#F0F0F8',
  textSub:    '#A8A8C8',
  muted:      '#6A6A88',
  dim:        '#40405A',
  white:      '#FFFFFF',
  silver:     '#C0C0D4',

  gold:       '#F59E0B',
  goldAlpha:  'rgba(245,158,11,0.14)',
  green:      '#22C55E',
  greenAlpha: 'rgba(34,197,94,0.12)',
  orange:     '#F97316',
  red:        '#EF4444',
  redAlpha:   'rgba(239,68,68,0.12)',

  catSenior:   '#3B82F6',
  catJunior:   '#06B6D4',
  catCadete:   '#10B981',
  catInfantil: '#F59E0B',
  catMini:     '#8B5CF6',
  catPreMini:  '#EC4899',
  catBenjamin: '#14B8A6',
  catVeterano: '#6B7280',

  shadow:   '0 4px 20px rgba(0,0,0,0.40), inset 0 0 0 1px rgba(255,255,255,0.07)',
  shadowMd: '0 8px 32px rgba(0,0,0,0.50), inset 0 0 0 1px rgba(255,255,255,0.06)',
  shadowLg: '0 24px 80px rgba(0,0,0,0.65), 0 0 60px rgba(59,130,246,0.10)',

  // Orbs decorativos (usados en App.jsx y Login.jsx)
  orb1: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 65%)',
  orb2: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)',
  orb3: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 65%)',
};

export const LIGHT = {
  blue:       '#2563EB',
  blueDark:   '#1D4ED8',
  blueLight:  '#1D4ED8',
  blueGlow:   'rgba(37,99,235,0.20)',
  blueAlpha:  'rgba(37,99,235,0.09)',
  blueBorder: 'rgba(37,99,235,0.28)',

  bg:         '#b8cef5',
  bgGrad:     'linear-gradient(135deg, #bdd0f8 0%, #d8e5ff 35%, #e5d6f8 65%, #cce5f8 100%)',
  bgMid:      'rgba(255,255,255,0.78)',
  bgSub:      'rgba(255,255,255,0.52)',
  card:       'rgba(255,255,255,0.65)',
  cardHover:  'rgba(255,255,255,0.82)',
  border:     'rgba(255,255,255,0.78)',
  borderMid:  'rgba(200,218,255,0.88)',

  text:       '#0A0A18',
  textSub:    '#3A3A58',
  muted:      '#606080',
  dim:        '#9898B8',
  white:      '#FFFFFF',
  silver:     '#606080',

  gold:       '#D97706',
  goldAlpha:  'rgba(217,119,6,0.12)',
  green:      '#16A34A',
  greenAlpha: 'rgba(22,163,74,0.10)',
  orange:     '#EA580C',
  red:        '#DC2626',
  redAlpha:   'rgba(220,38,38,0.10)',

  catSenior:   '#2563EB',
  catJunior:   '#0891B2',
  catCadete:   '#059669',
  catInfantil: '#D97706',
  catMini:     '#7C3AED',
  catPreMini:  '#DB2777',
  catBenjamin: '#0D9488',
  catVeterano: '#6B7280',

  shadow:   '0 4px 20px rgba(31,38,135,0.12), inset 0 0 0 1px rgba(255,255,255,0.85)',
  shadowMd: '0 8px 32px rgba(31,38,135,0.16), inset 0 0 0 1px rgba(255,255,255,0.75)',
  shadowLg: '0 24px 64px rgba(31,38,135,0.22)',

  orb1: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)',
  orb2: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 65%)',
  orb3: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)',
};

export const catColor = (cat = '', T = DARK) => {
  const l = cat.toLowerCase();
  if (l.includes('senior'))     return T.catSenior;
  if (l.includes('junior'))     return T.catJunior;
  if (l.includes('cadete'))     return T.catCadete;
  if (l.includes('infantil'))   return T.catInfantil;
  if (l.includes('minibasket')) return T.catMini;
  if (l.includes('premini') || l.includes('preinfantil')) return T.catPreMini;
  if (l.includes('benjamin') || l.includes('benjamín'))  return T.catBenjamin;
  if (l.includes('veterano'))   return T.catVeterano;
  return T.muted;
};

export const cleanCat = (cat = '') =>
  cat.replace(/^JDN - /i, '').replace(/^JDN -/i, '').trim();

export const fmtDate = (d = '') => {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
};

export const TODAY = new Date().toISOString().split('T')[0];

export const C = DARK;
