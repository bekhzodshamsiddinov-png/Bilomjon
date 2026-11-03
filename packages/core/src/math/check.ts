import { normalizeForMatch } from '../text/normalize';
import { parseAnswerNumber } from '../text/numbers';
import type { CheckResult, Exercise, GeneratorKind, GeneratorSpec } from './types';
import { maxNumberOfSpec } from './generators';

const YES = new Set(['ha', 'xa', 'ha bo\'linadi', 'bo\'linadi', 'да', 'yes', 'xo\'p']);
const NO = new Set(["yo'q", 'yoq', "yo'q bo'linmaydi", "bo'linmaydi", 'нет', 'no']);

/**
 * Deterministik javob tekshirgich. AI/LLM hech qachon to'g'ri-noto'g'ri qaror qilmaydi —
 * faqat shu funksiya.
 */
export function checkAnswer(ex: Exercise, raw: string): CheckResult {
  if (typeof raw !== 'string' || raw.length > 200) return { status: 'unparseable', understood: null };

  if (ex.answer.type === 'choice') {
    const s = normalizeForMatch(raw);
    const v = YES.has(s) ? 'ha' : NO.has(s) ? 'yo‘q' : null;
    if (v === null) return { status: 'unparseable', understood: null };
    if (v === ex.answer.value) return { status: 'correct', understood: v };
    const m = ex.misconceptions.find((x) => x.value === v);
    return { status: 'incorrect', understood: v, ...(m ? { misconception: m.code } : {}) };
  }

  const n = parseAnswerNumber(raw);
  if (n === null) return { status: 'unparseable', understood: null };
  if (n === ex.answer.value) return { status: 'correct', understood: String(n) };
  const m = ex.misconceptions.find((x) => x.value === String(n));
  return { status: 'incorrect', understood: String(n), ...(m ? { misconception: m.code } : {}) };
}

/**
 * Sinf darajasidagi cheklovlar. Darslik mundarijasi asosida (Repyova, Novda Edutainment):
 * 1-sinf — 100 gacha qo'shish/ayirish, ko'paytirish yo'q; 2-sinf — 1000 gacha, ko'paytirish jadvali;
 * 3-sinf — ko'p xonali sonlar; 4-sinf — kasrlar, katta sonlar.
 * DIQQAT: bu qiymatlar AI metodist taklifi, o'qituvchi tasdiqlashi kerak.
 */
export const GRADE_LIMITS: Record<1 | 2 | 3 | 4, { maxNumber: number; kinds: readonly GeneratorKind[] }> = {
  1: { maxNumber: 100, kinds: [] },
  2: {
    maxNumber: 1000,
    kinds: ['mul_fact', 'div_fact', 'missing_factor', 'word_groups', 'word_share', 'times_more', 'times_less', 'mul_div_link', 'table_mixed', 'divisor_check'],
  },
  3: {
    maxNumber: 1_000_000,
    kinds: ['mul_fact', 'div_fact', 'missing_factor', 'word_groups', 'word_share', 'times_more', 'times_less', 'mul_div_link', 'table_mixed', 'divisor_check'],
  },
  4: {
    maxNumber: 1_000_000_000,
    kinds: ['mul_fact', 'div_fact', 'missing_factor', 'word_groups', 'word_share', 'times_more', 'times_less', 'mul_div_link', 'table_mixed', 'divisor_check'],
  },
};

/** 2-sinf ko'paytirish jadvali: natija 100 dan oshmasligi kerak. */
const TABLE_KINDS: readonly GeneratorKind[] = ['mul_fact', 'div_fact', 'missing_factor', 'word_groups', 'word_share', 'times_more', 'times_less', 'mul_div_link', 'table_mixed'];

export function validateSpecForGrade(spec: GeneratorSpec, grade: 1 | 2 | 3 | 4): string[] {
  const errors: string[] = [];
  const lim = GRADE_LIMITS[grade];
  if (!lim.kinds.includes(spec.kind)) errors.push(`${grade}-sinfda "${spec.kind}" turidagi mashq ruxsat etilmagan`);
  const max = maxNumberOfSpec(spec);
  if (max > lim.maxNumber) errors.push(`Eng katta son ${max} > ${grade}-sinf chegarasi ${lim.maxNumber}`);
  if (grade === 2 && TABLE_KINDS.includes(spec.kind) && max > 100)
    errors.push(`2-sinf ko'paytirish jadvali doirasidan chiqadi (${max} > 100)`);
  return errors;
}
