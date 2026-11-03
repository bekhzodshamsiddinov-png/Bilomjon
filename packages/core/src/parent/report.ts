import type { Catalog, Lesson } from '../content/schema';
import { createRng } from '../random';
import type { MisconceptionCode } from '../math/types';
import { respond, startSession, type AttemptRecord, type Mastery, type TutorResult } from '../tutor/machine';

/**
 * Ota-ona paneli.
 * DIQQAT: hozircha faqat DEMO ma'lumotlar — `generateDemoFamily` haqiqiy dvigatelni
 * simulyatsiya qilingan "o'quvchi" bilan ishga tushirib yaratadi. Haqiqiy bola ma'lumoti YO'Q.
 */
export interface SessionSummary {
  lessonId: string;
  lessonVersion: number;
  completedAt: string;
  minutes: number;
  mastery: Mastery;
  records: AttemptRecord[];
}

export interface DemoChild {
  id: string;
  /** Hech qachon haqiqiy ism emas. */
  alias: string;
  avatar: string;
  grade: 1 | 2 | 3 | 4;
  sessions: SessionSummary[];
  isDemo: true;
}

export const PARENT_MISCONCEPTION_TEXT: Record<MisconceptionCode, string> = {
  ADD_INSTEAD_OF_MUL: 'Ko‘paytirish o‘rniga qo‘shib yubormoqda — “guruh” tushunchasini buyumlar bilan ko‘rsating.',
  SUB_INSTEAD_OF_DIV: 'Bo‘lish o‘rniga ayirmoqda — buyumlarni teng tarqatish o‘yinini o‘ynang.',
  MUL_INSTEAD_OF_DIV: 'Bo‘lish va ko‘paytirishni adashtirmoqda — “bo‘lganda kamayadi” qoidasini misolda ko‘rsating.',
  GROUP_COUNT_OFF: 'Guruhlarni sanashda bittaga adashmoqda — sanashda barmoq bilan ko‘rsatishni so‘rang.',
  COUNTING_SLIP: 'Kichik sanash xatolari — shoshilmasdan, ovoz chiqarib sanashga o‘rgating.',
  ADD_INSTEAD_OF_TIMES: '“Marta ko‘p” va “ta ko‘p”ni adashtirmoqda — ikkalasini yonma-yon misolda solishtiring.',
  SUB_INSTEAD_OF_TIMES: '“Marta kam” va “ta kam”ni adashtirmoqda — teng qismlarga bo‘lishni ko‘rsating.',
  WRONG_DIRECTION: 'Qachon ko‘paytirish, qachon bo‘lish kerakligini adashtirmoqda.',
  GAVE_PRODUCT: 'Noma’lum sonni topish o‘rniga berilgan sonni yozmoqda — savolni birga qayta o‘qing.',
  DIVISIBILITY_GUESS: 'Bo‘linishni tekshirmasdan taxmin qilmoqda — buyumlar bilan tekshirib ko‘ring.',
};

/** Simulyatsiya: berilgan "ko'nikma" ehtimoli bilan to'g'ri/xato javob beradigan sun'iy o'quvchi. */
function simulateSession(lesson: Lesson, seed: string, skill: number): SessionSummary & { ok: boolean } {
  const rng = createRng(`sim:${seed}`);
  let r: TutorResult = startSession(lesson, seed);
  let guard = 0;
  while (r.state.phase !== 'summary' && guard++ < 80) {
    if (r.state.phase === 'example') {
      r = respond(lesson, r.state, { type: 'next' });
      continue;
    }
    const ex = r.state.current!;
    if (rng.next() < 0.15 && r.state.phase !== 'diagnostic') {
      r = respond(lesson, r.state, { type: 'hint' });
      continue;
    }
    const correct = rng.next() < skill;
    const value = correct
      ? ex.answer.type === 'number'
        ? String(ex.answer.value)
        : ex.answer.value
      : (ex.misconceptions[0]?.value ?? (ex.answer.type === 'number' ? String(ex.answer.value + 1) : 'ha'));
    r = respond(lesson, r.state, { type: 'answer', value });
  }
  return {
    lessonId: lesson.id,
    lessonVersion: lesson.version,
    completedAt: '',
    minutes: 8 + Math.floor(rng.next() * 8),
    mastery: r.state.mastery ?? 'needs_practice',
    records: r.state.records,
    ok: r.state.phase === 'summary',
  };
}

export function generateDemoFamily(catalog: Catalog, now: Date = new Date('2026-11-03T12:00:00Z')): DemoChild[] {
  const g2 = catalog.lessons.filter((l) => l.grade === 2).sort((a, b) => a.map_id.localeCompare(b.map_id, 'en', { numeric: true }));
  const day = 86_400_000;
  const mk = (id: string, alias: string, avatar: string, profile: { lessons: number; skill: (i: number) => number }): DemoChild => ({
    id,
    alias,
    avatar,
    grade: 2,
    isDemo: true,
    sessions: g2.slice(0, profile.lessons).map((lesson, i) => {
      const s = simulateSession(lesson, `${id}:${i}`, profile.skill(i));
      const { ok: _ok, ...rest } = s;
      return { ...rest, completedAt: new Date(now.getTime() - (profile.lessons - i) * day).toISOString() };
    }),
  });
  return [
    // Ko'paytirishda kuchli, bo'lishda qiynaladigan profil
    mk('demo-a', 'Demo o‘quvchi A', '🦊', { lessons: 7, skill: (i) => (i % 2 === 0 ? 0.6 : 0.95) }),
    // Endi boshlagan profil — kam ma'lumot holatini ko'rsatadi
    mk('demo-b', 'Demo o‘quvchi B', '🐢', { lessons: 2, skill: () => 0.7 }),
  ];
}

export interface ParentReport {
  childAlias: string;
  isDemo: true;
  totals: { sessions: number; minutesLast7Days: number };
  lessons: { lessonId: string; title: string; mastery: Mastery; confidence: 'low' | 'medium'; lastAt: string }[];
  misconceptions: { code: MisconceptionCode; count: number; advice: string }[];
  recommendation: { lessonId: string; title: string; why: string; plan: Lesson['parent_guide']['teach_child'] } | null;
  dataNote: string;
}

const MASTERY_RANK: Record<Mastery, number> = { needs_practice: 0, developing: 1, mastered: 2 };

export function buildParentReport(child: DemoChild, catalog: Catalog, now: Date = new Date('2026-11-03T12:00:00Z')): ParentReport {
  const byId = new Map(catalog.lessons.map((l) => [l.id, l]));
  const latest = new Map<string, SessionSummary[]>();
  for (const s of child.sessions) latest.set(s.lessonId, [...(latest.get(s.lessonId) ?? []), s]);

  const lessons = [...latest.entries()].map(([lessonId, ss]) => {
    const last = ss[ss.length - 1]!;
    return {
      lessonId,
      title: byId.get(lessonId)?.title ?? lessonId,
      mastery: last.mastery,
      // Bitta sessiya (2 ta transfer masala) — xulosa uchun kam. Shuni ochiq aytamiz.
      confidence: ss.length >= 2 ? ('medium' as const) : ('low' as const),
      lastAt: last.completedAt,
    };
  });

  const counts = new Map<MisconceptionCode, number>();
  for (const s of child.sessions) for (const r of s.records) if (r.misconception) counts.set(r.misconception, (counts.get(r.misconception) ?? 0) + 1);
  const misconceptions = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([code, count]) => ({ code, count, advice: PARENT_MISCONCEPTION_TEXT[code] }));

  const weakest = [...lessons].sort((a, b) => MASTERY_RANK[a.mastery] - MASTERY_RANK[b.mastery])[0];
  const wl = weakest ? byId.get(weakest.lessonId) : undefined;
  const recommendation =
    weakest && wl && weakest.mastery !== 'mastered'
      ? {
          lessonId: wl.id,
          title: wl.title,
          why: weakest.mastery === 'needs_practice' ? 'Bu mavzuda yangi masalalarni hali mustaqil yecha olmadi.' : 'Bu mavzuda ko‘p narsani tushundi, lekin hali mustahkam emas.',
          plan: wl.parent_guide.teach_child,
        }
      : null;

  const weekAgo = now.getTime() - 7 * 86_400_000;
  return {
    childAlias: child.alias,
    isDemo: true,
    totals: {
      sessions: child.sessions.length,
      minutesLast7Days: child.sessions.filter((s) => new Date(s.completedAt).getTime() >= weekAgo).reduce((a, s) => a + s.minutes, 0),
    },
    lessons,
    misconceptions,
    recommendation,
    dataNote: 'Bu NAMUNA (demo) ma’lumotlar — haqiqiy bola natijalari emas. Xulosalar faqat bir necha masalaga asoslangan, shuning uchun taxminiy.',
  };
}

