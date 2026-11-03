import { normalizeForMatch } from '../text/normalize';

/**
 * Bola kiritgan matn uchun qoida asosidagi xavfsizlik tasniflagichi.
 * Tartib muhim: avval xavf (distress), keyin shaxsiy ma'lumot, keyin injection.
 *
 * DIQQAT: bu kalit so'z ro'yxatlari — birinchi himoya qatlami, to'liq yechim emas.
 * Production'dan oldin mahalliy bolalar psixologi va yurist bilan ko'rib chiqilishi va
 * red-team testlari bilan kengaytirilishi SHART (docs/SAFETY_MODEL.md).
 */
export type SafetyCategory =
  | 'ok'
  | 'distress' // bola xavf ostida yoki qattiq xafa bo'lishi mumkin
  | 'pii_shared' // bola o'z shaxsiy ma'lumotini yozdi
  | 'pii_request' // bola boshqa birovning/Bilimjonning shaxsiy ma'lumotini so'rayapti yoki ma'lumot almashmoqchi
  | 'injection' // ko'rsatmalarni chetlab o'tishga urinish
  | 'unsafe_topic' // bolaga mos bo'lmagan mavzu
  | 'companion'; // do'stlik/romantik munosabat, sir saqlash

export interface SafetyResult {
  category: SafetyCategory;
  /** Logga yozish mumkin bo'lgan, shaxsiy ma'lumotlardan tozalangan matn. */
  redacted: string;
}

const DISTRESS = [
  'urishadi', 'urdi', 'kaltakla', "o'lgim", 'jonimga', "o'zimni o'ldir", 'qasd', 'qo\'rqaman', "yig'layapman",
  'hech kim yaxshi ko\'rmaydi', "uydan qochaman", 'xafa qilishadi', "tegib ketdi", 'teginishdi', "og'riyapti",
  'yomon qilishdi', 'zo\'rla', 'tahdid', 'bezori',
];
const UNSAFE = ['qurol', 'pichoq bilan', 'bomba', 'portlat', 'giyohvand', 'narkotik', 'sigaret', 'aroq', 'pivo', 'qimor', 'jinsiy', '18+', 'porno', 'yalang\'och'];
const INJECTION = [
  'ignore previous', 'ignore all', 'system prompt', 'developer mode', 'jailbreak', 'api key', 'api kalit', 'apikey',
  'oldingi ko\'rsatma', "ko'rsatmalarni unut", 'qoidalarni unut', 'parolni ayt', 'admin', 'secret', 'token', 'dan mode', 'yashirin buyruq',
];
const COMPANION = ['sevaman', 'sevgilim', 'meni sev', 'do\'stim bo\'l', 'turmush', 'sirimni saqla', 'hech kimga aytma', 'sir saqlaymiz', 'uchrashaylik'];
const PII_REQUEST = [
  'manzilingni', 'qayerda yashaysan', 'telefoningni', 'raqamingni', 'rasmingni', 'suratingni', 'mening maktabim qayerda',
  'maktabim qayerda', 'manzilim qayerda', 'uyimni top', 'rasm yubor', 'surat yubor',
];
const PII_SELF_MARKERS = ['mening ismim', 'ismim', 'familiyam', 'manzilim', 'uyim ', "ko'chasi", "ko'cha", 'mahalla', 'telefonim', 'raqamim', 'parolim', 'onamning ismi', 'otamning ismi'];

const PHONE = /(?:\+?998[\s-]?)?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/g;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g;
const LONG_DIGITS = /\b\d{6,}\b/g;
const NAME_AFTER = /(ismim|familiyam|mening ismim|onamning ismi|otamning ismi)\s+\S+/g;
const SCHOOL_NO = /\b\d{1,3}\s*-?\s*(son|sonli)?\s*maktab\w*/g;
const STREET = /\S+\s+(ko'chasi|ko'cha|mahallasi|mahalla)\b[^,.]*/g;

export function redactPII(text: string): string {
  return normalizeForMatch(text)
    .replace(EMAIL, '[email]')
    .replace(PHONE, '[telefon]')
    .replace(LONG_DIGITS, '[raqam]')
    .replace(NAME_AFTER, '$1 [ism]')
    .replace(SCHOOL_NO, '[maktab]')
    .replace(STREET, '[manzil]');
}

const has = (s: string, list: readonly string[]) => list.some((k) => s.includes(k));

export function classifySafety(raw: string): SafetyResult {
  const s = normalizeForMatch(raw);
  const redacted = redactPII(raw);
  if (has(s, DISTRESS)) return { category: 'distress', redacted };
  if (has(s, UNSAFE)) return { category: 'unsafe_topic', redacted };
  const piiPattern = new RegExp(PHONE.source).test(s) || new RegExp(EMAIL.source).test(s);
  if (has(s, PII_REQUEST)) return { category: 'pii_request', redacted };
  if (piiPattern || has(s, PII_SELF_MARKERS)) return { category: 'pii_shared', redacted };
  if (has(s, INJECTION)) return { category: 'injection', redacted };
  if (has(s, COMPANION)) return { category: 'companion', redacted };
  return { category: 'ok', redacted };
}

/**
 * Audit hodisasi: xom matn HECH QACHON saqlanmaydi — faqat toifa va uzunlik.
 * (docs/PEDAGOGY_AND_SAFETY.md: "audit log stripped of child PII")
 */
export function toSafetyAuditEvent(result: SafetyResult, rawLength: number) {
  return { type: 'safety_check' as const, category: result.category, inputLength: rawLength, at: new Date().toISOString() };
}
