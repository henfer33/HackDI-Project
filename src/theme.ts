/**
 * Dark "jungle" palette: deep forest ground, cream serif display type,
 * a single mint accent for action and gold reserved for the wali.
 */
export const C = {
  // grounds
  bg: '#06180F',
  bgTop: '#0B2A1E',
  sheet: '#0E3323',
  card: 'rgba(255,255,255,0.045)',
  cardEdge: 'rgba(255,255,255,0.09)',
  raised: '#12402C',

  // type
  cream: '#EAF7CE',
  ink: '#EAF7CE',
  soft: '#9BD3A6',
  muted: '#6FA37E',
  faint: '#4A7659',

  // accents
  mint: '#4ADE80',
  mintDim: 'rgba(74,222,128,0.14)',
  gold: '#F2C230',
  goldDim: 'rgba(242,194,48,0.14)',
  danger: '#F1846F',
  dangerDim: 'rgba(241,132,111,0.14)',
};

export const S = { radius: 22, pill: 999, pad: 22, gap: 14 };

/** Playfair for display, system sans for everything else. */
export const F = {
  display: 'PlayfairDisplay_700Bold',
  displayReg: 'PlayfairDisplay_400Regular',
};

export const eyebrow = {
  fontSize: 12,
  letterSpacing: 2.2,
  fontWeight: '700' as const,
  textTransform: 'uppercase' as const,
};
