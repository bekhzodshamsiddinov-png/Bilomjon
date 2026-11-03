import { normalizeForMatch } from './normalize';

/** O'zbekcha son so'zlari (normallashtirilgan, ASCII apostrof bilan). */
const UNITS: Record<string, number> = {
  nol: 0, bir: 1, ikki: 2, uch: 3, "to'rt": 4, besh: 5, olti: 6, yetti: 7, sakkiz: 8, "to'qqiz": 9,
};
const TENS: Record<string, number> = {
  "o'n": 10, yigirma: 20, "o'ttiz": 30, qirq: 40, ellik: 50, oltmish: 60, yetmish: 70, sakson: 80, "to'qson": 90,
};
// Bolalar ko'p yozadigan imlo xatolari / apostrofsiz shakllar
const ALIASES: Record<string, string> = {
  tort: "to'rt", toqqiz: "to'qqiz", on: "o'n", ottiz: "o'ttiz", toqson: "to'qson", yetti: 'yetti', etti: 'yetti',
  ikk: 'ikki', besh: 'besh',
};
const SUFFIXES = ['tadan', 'tasi', 'tta', 'ta', 'ga', 'dan', 'ni', 'ning', 'inchi', 'nchi'];

function stripSuffix(token: string): string {
  if (isNumberWord(token)) return token;
  for (const suf of SUFFIXES) {
    if (token.endsWith(suf)) {
      let root = token.slice(0, -suf.length);
      // "to'rtta" → "to'rt" (+ta), "ikkita" → "ikki"
      if (suf === 'tta' && !isNumberWord(root)) root = root + 't';
      root = ALIASES[root] ?? root;
      if (isNumberWord(root) || /^\d+$/.test(root)) return root;
    }
  }
  return ALIASES[token] ?? token;
}

function isNumberWord(t: string): boolean {
  return t in UNITS || t in TENS || t === 'yuz' || t === 'ming';
}

/**
 * Bolaning javobidan sonni ajratib oladi: "4", "4 ta", "4ta", "to'rt", "to‘rtta", "тўрт", "o'n ikki".
 * Bir nechta turli son bo'lsa yoki son topilmasa — null (taxmin qilinmaydi).
 */
export function parseAnswerNumber(raw: string): number | null {
  const s = normalizeForMatch(raw);
  if (s.length === 0 || s.length > 60) return null;

  const digitMatches = s.match(/-?\d+/g);
  if (digitMatches) {
    const unique = [...new Set(digitMatches)];
    if (unique.length !== 1) return null;
    const n = Number(unique[0]);
    return Number.isSafeInteger(n) ? n : null;
  }
  return parseNumberWords(s);
}

export function parseNumberWords(s: string): number | null {
  const tokens = s.split(' ').map(stripSuffix).filter((t) => isNumberWord(t));
  if (tokens.length === 0) return null;
  let total = 0;
  let current = 0;
  for (const t of tokens) {
    if (t in UNITS) current += UNITS[t]!;
    else if (t in TENS) current += TENS[t]!;
    else if (t === 'yuz') current = (current === 0 ? 1 : current) * 100;
    else if (t === 'ming') {
      total += (current === 0 ? 1 : current) * 1000;
      current = 0;
    }
  }
  return total + current;
}

/** Sonni o'zbekcha so'z bilan yozish (0..999 999) — ovozli o'qish va ota-ona matnlari uchun. */
export function numberToUzWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) throw new RangeError(`Qo'llab-quvvatlanmaydi: ${n}`);
  if (n === 0) return 'nol';
  const unitW = Object.fromEntries(Object.entries(UNITS).map(([k, v]) => [v, k]));
  const tensW = Object.fromEntries(Object.entries(TENS).map(([k, v]) => [v, k]));
  const below1000 = (x: number): string => {
    const parts: string[] = [];
    const h = Math.floor(x / 100);
    const t = Math.floor((x % 100) / 10) * 10;
    const u = x % 10;
    if (h > 0) parts.push(h === 1 ? 'yuz' : `${unitW[h]} yuz`);
    if (t > 0) parts.push(tensW[t]!);
    if (u > 0) parts.push(unitW[u]!);
    return parts.join(' ');
  };
  const th = Math.floor(n / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (th > 0) parts.push(th === 1 ? 'ming' : `${below1000(th)} ming`);
  if (rest > 0) parts.push(below1000(rest));
  return parts.join(' ').replace(/'/g, '‘');
}
