/**
 * Dizayn tizimi: "katakli daftar".
 * Bola tanish muhit — maktab daftari: och ko'k katak, ruchka siyohi, marker.
 * Xato uchun qizil rang ATAYLAB ishlatilmaydi — bola uyalmasligi uchun xato "sariq marker" bilan belgilanadi.
 */
export const C = {
  page: '#EAF1F8',
  paper: '#FBFDFF',
  grid: '#D6E4F2',
  ink: '#1D2A4D',
  inkSoft: '#56637F',
  pen: '#2F5BEA',
  penDark: '#2245B8',
  marker: '#FFC93C',
  markerSoft: '#FFF2C7',
  leaf: '#2BA84A',
  leafSoft: '#DDF4E3',
  stamp: '#C2410C',
  line: '#C9D7E6',
  white: '#FFFFFF',
} as const;

export const F = {
  display: 'Baloo2_700Bold',
  displaySemi: 'Baloo2_600SemiBold',
  body: 'Nunito_400Regular',
  bodyBold: 'Nunito_700Bold',
  bodyHeavy: 'Nunito_800ExtraBold',
} as const;

/** Tipografik shkala (1.25 nisbat), boshlang'ich sinf uchun kattaroq asos — 17px. */
export const T = {
  hero: 44,
  h1: 30,
  h2: 23,
  h3: 19,
  body: 17,
  small: 14,
  numeral: 56,
} as const;

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Bolalar uchun minimal bosish maydoni (WCAG 2.2 — 24px; biz 56px ishlatamiz). */
export const TOUCH = 56;
export const MAX_W = 720;
