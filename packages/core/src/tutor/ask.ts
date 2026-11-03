import type { Catalog } from '../content/schema';
import { visibilityOf, type VisibilityOptions } from '../content/visibility';
import { classifySafety, type SafetyCategory } from '../safety/classify';
import { normalizeForMatch } from '../text/normalize';
import { SAFETY_REPLY } from './templates';

/**
 * "Bilimjondan so'ra" — erkin savol. Cheklangan niyatlar ro'yxati; javoblar oldindan yozilgan.
 * HECH QACHON hisoblab natijani aytmaydi — strategiya va dars taklif qiladi.
 */
export type AskIntent = 'safety' | 'greeting' | 'math_division' | 'math_multiplication' | 'math_add_sub' | 'topic' | 'other_subject' | 'unknown';

export interface AskReply {
  intent: AskIntent;
  text: string;
  safetyCategory?: Exclude<SafetyCategory, 'ok'>;
  suggestedLessonId?: string;
  isDemo: true;
}

interface Ctx {
  catalog: Catalog;
  grade: number;
  visibility: VisibilityOptions;
}

function findLesson(ctx: Ctx, kinds: string[], number?: number): string | undefined {
  const visible = ctx.catalog.lessons.filter((l) => l.grade === ctx.grade && visibilityOf(l.status, ctx.visibility) !== 'hidden');
  const matches = visible.filter((l) =>
    l.practice.some((p) => {
      if (!kinds.includes(p.kind)) return false;
      if (number === undefined) return true;
      const v = p.params.divisor ?? p.params.factor;
      return v === number || (Array.isArray(v) && v.length === 1 && v[0] === number);
    }),
  );
  return (matches[0] ?? visible.find((l) => l.practice.some((p) => kinds.includes(p.kind))))?.id;
}

const DIV = [/(\d+)\s*(?:ni|ta)?\s*(\d+)\s*(?:ga|ta)\s*bo'l/, /(\d+)\s*[:/]\s*(\d+)/];
const MUL = [/(\d+)\s*(?:ni)?\s*(\d+)\s*(?:ga)\s*ko'paytir/, /(\d+)\s*[×x*]\s*(\d+)/, /(\d+)\s*karra\s*(\d+)/];
const ADDSUB = [/(\d+)\s*[+-]\s*(\d+)/, /(\d+)\s*(?:ga|ni)?\s*(\d+)\s*(?:ni)?\s*(qo'sh|ayir)/];

export function askBilimjon(raw: string, ctx: Ctx): AskReply {
  const base = { isDemo: true as const };
  if (raw.length > 500) return { ...base, intent: 'unknown', text: 'Savolingni qisqaroq yozib ko‘r.' };
  const safety = classifySafety(raw);
  if (safety.category !== 'ok') return { ...base, intent: 'safety', safetyCategory: safety.category, text: SAFETY_REPLY[safety.category] };

  const s = normalizeForMatch(raw);

  for (const re of DIV) {
    const m = s.match(re);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (b === 0) return { ...base, intent: 'math_division', text: 'Nolga bo‘lib bo‘lmaydi — buni matematiklar ham qila olmaydi! Boshqa son bilan urinib ko‘raylik.' };
      const lessonId = findLesson(ctx, ['div_fact', 'word_share'], b);
      const remainder = a % b !== 0;
      return {
        ...base,
        intent: 'math_division',
        ...(lessonId ? { suggestedLessonId: lessonId } : {}),
        text: remainder
          ? `${a} ni ${b} ga bo‘lsak, teng bo‘linmaydi — ortib qoladigan qism bo‘ladi. Buni “qoldiqli bo‘lish” deyiladi va keyingi sinflarda o‘rganiladi. Hozir ${a} ta buyumni ${b} guruhga bittadan tarqatib ko‘r: nechta ortib qoldi?`
          : `Keling, birga o‘ylaymiz. ${a} ta buyumni ${b} ta teng guruhga ajratamiz: har bir guruhga bittadan qo‘yib chiq, buyumlar tugaguncha. Bitta guruhda nechta bo‘ldi? Javobingni tekshirish uchun: o‘sha sonni ${b} ga ko‘paytirsang, ${a} chiqishi kerak.${lessonId ? ' Shu mavzudagi darsni ham ochib beraman.' : ''}`,
      };
    }
  }
  for (const re of MUL) {
    const m = s.match(re);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      const lessonId = findLesson(ctx, ['mul_fact', 'word_groups'], b);
      return {
        ...base,
        intent: 'math_multiplication',
        ...(lessonId ? { suggestedLessonId: lessonId } : {}),
        text: `${a} × ${b} — bu ${a} ta guruh, har birida ${b} tadan degani. ${b} ni ${a} marta qo‘shib ko‘r: ${Array.from({ length: Math.min(a, 6) }, () => b).join(' + ')}${a > 6 ? ' + …' : ''}. Nechta chiqdi?${lessonId ? ' Shu mavzudagi darsni ham ochib beraman.' : ''}`,
      };
    }
  }
  for (const re of ADDSUB) {
    if (re.test(s))
      return {
        ...base,
        intent: 'math_add_sub',
        text: 'Qo‘shish va ayirishni sonlar nurida yoki barmoqlar bilan sanab tekshirish mumkin. Avval o‘nliklarni, keyin birliklarni hisoblab ko‘r. Hozircha bu mavzu bo‘yicha alohida darsim tayyor emas.',
      };
  }

  if (/^(salom|assalomu|assalom|hello|hi)\b/.test(s))
    return { ...base, intent: 'greeting', text: 'Assalomu alaykum! Men Bilimjonman. Matematikadan savol ber, masalan: “12 ni 3 ga bo‘lishni tushuntir”.' };

  if (/ko'paytir|karra|jadval/.test(s)) {
    const lessonId = findLesson(ctx, ['mul_fact', 'table_mixed']);
    return {
      ...base,
      intent: 'topic',
      ...(lessonId ? { suggestedLessonId: lessonId } : {}),
      text: 'Ko‘paytirish — bir xil sonlarni bir necha marta qo‘shishning qisqa yo‘li. Masalan, 3 ta likopchada 2 tadan olma bo‘lsa: 2 + 2 + 2 = 3 × 2. Darsni ochib, birga mashq qilamizmi?',
    };
  }
  if (/bo'lish|taqsimla|teng bo'l/.test(s)) {
    const lessonId = findLesson(ctx, ['div_fact', 'word_share']);
    return {
      ...base,
      intent: 'topic',
      ...(lessonId ? { suggestedLessonId: lessonId } : {}),
      text: 'Bo‘lish — hammasini teng qismlarga ajratish. Masalan, olmalarni do‘stlarga teng tarqatish. Darsni ochib, birga mashq qilamizmi?',
    };
  }
  if (/o'qish|kitob|ona tili|ingliz|english|tabiat|rasm|musiqa|harf/.test(s))
    return {
      ...base,
      intent: 'other_subject',
      text: 'Hozircha men faqat matematika bo‘yicha yordam bera olaman. Boshqa fanlar keyinroq qo‘shiladi. Bu savolni ota-onang yoki o‘qituvchingdan so‘rab ko‘r.',
    };

  return {
    ...base,
    intent: 'unknown',
    text: 'Buni hali bilmayman, noto‘g‘ri javob berib qo‘ymaslik uchun taxmin qilmayman. Bu savolni ota-onang yoki o‘qituvchingdan so‘ra. Matematikadan savol bersang, yordam beraman!',
  };
}
