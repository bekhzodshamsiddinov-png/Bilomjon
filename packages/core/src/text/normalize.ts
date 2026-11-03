/**
 * O'zbek matnini taqqoslash uchun normallashtirish.
 *
 * Muammo (v0.1 demo): kod faqat `‘` belgisini kutardi, bolalar esa `o'`, `o`'`, `oʻ`, `o’`
 * deb yozadi, ko'p ota-onalar kirillda yozadi. Shu sababli BARCHA matn moslash va javob
 * tekshirish shu funksiyalardan o'tadi.
 */

/** Barcha apostrof/okina variantlari — taqqoslashda bitta ASCII `'` ga keltiriladi. */
const APOSTROPHES = /[‘’ʻʼʹ`´′ˈ']/g;

// O'zbek kirill → lotin (rasmiy jadval asosida, taqqoslash maqsadida soddalashtirilgan).
const CYR: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'x', ц: 's', ч: 'ch', ш: 'sh', ъ: "'", ь: '', э: 'e', ю: 'yu', я: 'ya',
  ў: "o'", қ: 'q', ғ: "g'", ҳ: 'h', ы: 'i', щ: 'sh',
};
const VOWELS_LATIN = new Set(['a', 'e', 'i', 'o', 'u']);

export function cyrillicToLatin(input: string): string {
  let out = '';
  const chars = [...input];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const lower = ch.toLowerCase();
    const isUpper = ch !== lower;
    let mapped: string;
    if (lower === 'е') {
      // so'z boshida yoki unlidan keyin "ye", aks holda "e"
      const prev = out.slice(-1).toLowerCase();
      mapped = i === 0 || !/[a-z']/.test(prev) || VOWELS_LATIN.has(prev) ? 'ye' : 'e';
    } else {
      mapped = CYR[lower] ?? ch;
    }
    out += isUpper && mapped.length > 0 ? mapped[0]!.toUpperCase() + mapped.slice(1) : mapped;
  }
  return out;
}

export function hasCyrillic(input: string): boolean {
  return /[Ѐ-ӿ]/.test(input);
}

/**
 * Moslash uchun kanonik shakl: kichik harf, lotin, `'` apostrof, ortiqcha bo'shliqsiz.
 * Matematik belgilar (× x * : ÷ / + - = ?) saqlanadi.
 */
export function normalizeForMatch(input: string): string {
  let s = input.normalize('NFC');
  if (hasCyrillic(s)) s = cyrillicToLatin(s);
  s = s.toLowerCase().replace(APOSTROPHES, "'");
  // g' va o' dan keyin keladigan ortiqcha apostroflarni bittaga
  s = s.replace(/'{2,}/g, "'");
  s = s.replace(/[÷]/g, ':').replace(/[×✕✖]/g, '×');
  s = s.replace(/[!,.;"«»“”()[\]{}]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/** Ko'rsatish uchun: ASCII `'` o'rniga o'zbek lotin alifbosidagi `ʻ` (o‘, g‘). */
export function toDisplayUz(input: string): string {
  return input.replace(/([oOgG])['`’‘ʼ]/g, '$1‘');
}
