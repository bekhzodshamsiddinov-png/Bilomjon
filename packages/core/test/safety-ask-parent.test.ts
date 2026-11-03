import { describe, expect, it } from 'vitest';
import { canTransition, LessonSchema } from '../src/content/schema';
import { childCatalog, findVisibleLesson, visibilityOf } from '../src/content/visibility';
import { readFlags } from '../src/flags';
import { buildParentReport, generateDemoFamily } from '../src/parent/report';
import { classifySafety, redactPII, toSafetyAuditEvent } from '../src/safety/classify';
import { askBilimjon } from '../src/tutor/ask';
import { fixtureCatalog, fixtureLesson } from './fixtures';

const nums = (s: string) => new Set((s.match(/\d+/g) ?? []).map(Number));

describe('xavfsizlik filtri', () => {
  it('shaxsiy ma’lumotni tozalaydi (OCR/matn redaksiyasi)', () => {
    const r = redactPII('Ismim Aziz Karimov, telefonim +998 90 123 45 67, 21-maktab, Navoiy ko‘chasi 5');
    expect(r).not.toMatch(/aziz|123|navoiy|21/i);
    expect(r).toMatch(/\[ism\]/);
    expect(r).toMatch(/\[telefon\]/);
  });
  it('audit hodisasida xom matn yo‘q', () => {
    const raw = 'Ismim Aziz';
    const ev = toSafetyAuditEvent(classifySafety(raw), raw.length);
    expect(JSON.stringify(ev)).not.toMatch(/aziz/i);
    expect(ev.category).toBe('pii_shared');
  });
  it('oddiy matematik savol xavfsiz deb topiladi', () => {
    expect(classifySafety("12 ni 3 ga bo'lishni tushuntir").category).toBe('ok');
    expect(classifySafety('bolam kitob o‘qimayapti').category).toBe('ok');
    expect(classifySafety('maktabda bo‘lishni o‘rgatishdi').category).toBe('ok');
  });
});

describe('“Bilimjondan so‘ra” (demo muammolari #1 va #2)', () => {
  const ctx = { catalog: fixtureCatalog(), grade: 2, visibility: { demoContent: true } };
  it('“12 ni 3 ga bo‘lishni tushuntir” — strategiya beradi, javobni (4) AYTMAYDI', () => {
    const r = askBilimjon("12 ni 3 ga bo'lishni tushuntir", ctx);
    expect(r.intent).toBe('math_division');
    expect(nums(r.text).has(4)).toBe(false);
    expect(r.suggestedLessonId).toBe('l-test-div3');
  });
  it.each(['12 : 3', '12÷3', '12/3', '12 ни 3 га бўл', '12 ni 3 ga bo‘l'])('turli yozuvlar: %s', (q) => {
    const r = askBilimjon(q, ctx);
    expect(r.intent).toBe('math_division');
    expect(nums(r.text).has(4)).toBe(false);
  });
  it('“3 x 4” — ko‘paytirish, javob (12) aytilmaydi', () => {
    const r = askBilimjon('3 x 4', ctx);
    expect(r.intent).toBe('math_multiplication');
    expect(nums(r.text).has(12)).toBe(false);
  });
  it('“bola” so‘zi endi matematika javobini chaqirmaydi', () => {
    expect(askBilimjon('bolam kitob o‘qimayapti', ctx).intent).not.toMatch(/^math/);
  });
  it('noma’lum savolda taxmin qilmaydi va kattalarga yo‘naltiradi', () => {
    const r = askBilimjon('Oy nimadan yasalgan?', ctx);
    expect(r.intent).toBe('unknown');
    expect(r.text).toMatch(/ota-onang yoki o‘qituvchingdan/);
  });
  it('qoldiqli bo‘lishni halol tushuntiradi', () => {
    expect(askBilimjon('13 ni 3 ga bo‘l', ctx).text).toMatch(/qoldiq/);
  });
  it('nolga bo‘lish', () => {
    expect(askBilimjon('5 : 0', ctx).text).toMatch(/Nolga bo‘lib bo‘lmaydi/);
  });
  it('har doim demo deb belgilanadi', () => {
    expect(askBilimjon('salom', ctx).isDemo).toBe(true);
  });
});

describe('nashr darvozasi (published-only)', () => {
  it('DRAFT — demo rejimda “namuna”, production’da yashirin', () => {
    expect(visibilityOf('DRAFT', { demoContent: true })).toBe('demo_preview');
    expect(visibilityOf('DRAFT', { demoContent: false })).toBe('hidden');
    expect(visibilityOf('APPROVED', { demoContent: false })).toBe('hidden');
    expect(visibilityOf('PUBLISHED', { demoContent: false })).toBe('official');
    expect(visibilityOf('ARCHIVED', { demoContent: true })).toBe('hidden');
  });
  it('production rejimida tasdiqlanmagan dars topilmaydi', () => {
    const c = fixtureCatalog();
    expect(findVisibleLesson(c, 'l-test-div3', { demoContent: false })).toBeNull();
    expect(childCatalog(c, 2, { demoContent: false })[0]!.terms.every((t) => t.entries.length === 0)).toBe(true);
  });
  it('PUBLISHED uchun inson tasdig‘i majburiy — AI tekshiruvi yetarli emas', () => {
    const ai = { by: 'Claude (AI metodist)' as const, at: '2026-11-03', checklist: { objective_matches_textbook_topic: true, numbers_within_grade_limits: true, answers_verified_by_engine: true, hints_do_not_reveal_answer: true, language_age_appropriate: true, no_textbook_text_copied: true, parent_guide_household_materials_only: true } };
    expect(LessonSchema.safeParse(fixtureLesson({ status: 'PUBLISHED', ai_review: ai })).success).toBe(false);
    const human = { reviewer_id: 'teacher-001', role: 'primary_teacher' as const, decision: 'approved' as const, reviewed_at: '2026-11-10' };
    expect(LessonSchema.safeParse(fixtureLesson({ status: 'PUBLISHED', human_reviews: [human] })).success).toBe(true);
  });
  it('holat o‘tishlari: DRAFT → PUBLISHED to‘g‘ridan-to‘g‘ri mumkin emas', () => {
    expect(canTransition('DRAFT', 'PUBLISHED')).toBe(false);
    expect(canTransition('APPROVED', 'PUBLISHED')).toBe(true);
  });
});

describe('ota-ona paneli (faqat demo ma’lumotlar)', () => {
  const lessons = [fixtureLesson(), fixtureLesson({ id: 'l-test-2', map_id: 'mat-2-3-099', title: 'Sonni 4 ga ko‘paytirish', practice: [{ kind: 'mul_fact', params: { factor: 4 } }], transfer: [{ kind: 'word_groups', params: { factor: 4 } }] })];
  const c = fixtureCatalog(lessons);
  it('deterministik va har doim demo deb belgilangan', () => {
    const a = generateDemoFamily(c);
    expect(a).toEqual(generateDemoFamily(c));
    expect(a.every((ch) => ch.isDemo && ch.alias.startsWith('Demo'))).toBe(true);
  });
  it('hisobot noaniqlikni ochiq ko‘rsatadi va tavsiya beradi', () => {
    const [child] = generateDemoFamily(c);
    const rep = buildParentReport(child!, c);
    expect(rep.isDemo).toBe(true);
    expect(rep.dataNote).toMatch(/NAMUNA/);
    expect(rep.lessons.every((l) => ['low', 'medium'].includes(l.confidence))).toBe(true);
    expect(rep.totals.sessions).toBeGreaterThan(0);
  });
});

describe('funksiya bayroqlari', () => {
  it('standart holatda hammasi o‘chiq; to‘lovlarni bayroq bilan yoqib bo‘lmaydi', () => {
    expect(readFlags({})).toEqual({ demoContent: false, consentFlow: false, voiceInput: false, payments: false });
    expect(readFlags({ EXPO_PUBLIC_FEATURE_PAYMENTS: 'true' } as Record<string, string>).payments).toBe(false);
  });
});
