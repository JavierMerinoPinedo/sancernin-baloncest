// ─── TOKENS DE TEMA — Club Deportivo San Cernin ───────────────────────────────

export const DARK = {
  blue:       '#3B82F6',
  blueDark:   '#1D4ED8',
  blueLight:  '#93C5FD',
  blueGlow:   'rgba(59,130,246,0.25)',
  blueAlpha:  'rgba(59,130,246,0.1)',
  blueBorder: 'rgba(59,130,246,0.3)',

  bg:         '#0A0A0F',
  bgMid:      '#0F0F15',
  bgSub:      '#141420',
  card:       '#16161F',
  cardHover:  '#1C1C28',
  border:     '#1E1E2E',
  borderMid:  '#2D2D42',

  text:       '#F1F1F6',
  textSub:    '#A0A0B8',
  muted:      '#6B6B85',
  dim:        '#44445A',
  white:      '#FFFFFF',
  silver:     '#C0C0D0',

  gold:       '#F59E0B',
  goldAlpha:  'rgba(245,158,11,0.12)',
  green:      '#22C55E',
  greenAlpha: 'rgba(34,197,94,0.1)',
  orange:     '#F97316',
  red:        '#EF4444',
  redAlpha:   'rgba(239,68,68,0.1)',

  catSenior:   '#3B82F6',
  catJunior:   '#06B6D4',
  catCadete:   '#10B981',
  catInfantil: '#F59E0B',
  catMini:     '#8B5CF6',
  catPreMini:  '#EC4899',
  catBenjamin: '#14B8A6',
  catVeterano: '#6B7280',

  shadow:   '0 1px 3px rgba(0,0,0,0.6)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.5)',
  shadowLg: '0 24px 80px rgba(0,0,0,0.7)',
};

export const LIGHT = {
  blue:       '#2563EB',
  blueDark:   '#1D4ED8',
  blueLight:  '#1D4ED8',
  blueGlow:   'rgba(37,99,235,0.15)',
  blueAlpha:  'rgba(37,99,235,0.07)',
  blueBorder: 'rgba(37,99,235,0.25)',

  bg:         '#F0F0F5',
  bgMid:      '#FFFFFF',
  bgSub:      '#F7F7FB',
  card:       '#FFFFFF',
  cardHover:  '#F5F5FA',
  border:     '#E2E2EC',
  borderMid:  '#CDCDD8',

  text:       '#0A0A15',
  textSub:    '#44445A',
  muted:      '#6B6B85',
  dim:        '#A0A0B8',
  white:      '#FFFFFF',
  silver:     '#6B6B85',

  gold:       '#D97706',
  goldAlpha:  'rgba(217,119,6,0.1)',
  green:      '#16A34A',
  greenAlpha: 'rgba(22,163,74,0.07)',
  orange:     '#EA580C',
  red:        '#DC2626',
  redAlpha:   'rgba(220,38,38,0.07)',

  catSenior:   '#2563EB',
  catJunior:   '#0891B2',
  catCadete:   '#059669',
  catInfantil: '#D97706',
  catMini:     '#7C3AED',
  catPreMini:  '#DB2777',
  catBenjamin: '#0D9488',
  catVeterano: '#6B7280',

  shadow:   '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.08)',
  shadowLg: '0 24px 80px rgba(0,0,0,0.14)',
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

// Exportación de compatibilidad — las páginas que aún usen C directamente
// recibirán DARK como fallback. Migrar a useTheme().T progresivamente.
export const C = DARK;
