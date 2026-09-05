/**
 * Lighter forest palette. Grounds are raised well above black so the app reads
 * green rather than near-black, with IBM Plex throughout.
 */
export const C = {
  // grounds — lighter than the first pass
  bg: '#12352A',
  bgTop: '#1B4A38',
  sheet: '#1E5240',
  card: 'rgba(255,255,255,0.05)',
  cardEdge: 'rgba(255,255,255,0.14)',
  raised: '#24614A',

  // type
  cream: '#F1FBE2',
  ink: '#F1FBE2',
  soft: '#B6E6BE',
  muted: '#8FC79C',
  faint: '#82BA92',

  // accents
  mint: '#7DE6A3',
  mintDim: 'rgba(125,230,163,0.16)',
  mintEdge: 'rgba(125,230,163,0.55)',
  gold: '#F4CE5E',
  goldDim: 'rgba(244,206,94,0.14)',
  goldEdge: 'rgba(244,206,94,0.55)',
  danger: '#F79B87',
  dangerDim: 'rgba(247,155,135,0.14)',
  dangerEdge: 'rgba(247,155,135,0.55)',
};

export const S = { radius: 22, pill: 999, pad: 22, gap: 14 };

/** IBM Plex. Serif for display headings, Sans for everything else. */
export const F = {
  display: 'IBMPlexSerif_600SemiBold',
  displayBold: 'IBMPlexSerif_700Bold',
  sans: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semi: 'IBMPlexSans_600SemiBold',
  bold: 'IBMPlexSans_700Bold',
};

export const eyebrow = {
  fontSize: 12,
  letterSpacing: 2.2,
  fontFamily: F.semi,
  textTransform: 'uppercase' as const,
};
