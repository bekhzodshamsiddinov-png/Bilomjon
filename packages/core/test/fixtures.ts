import type { Catalog, Lesson } from '../src/content/schema';

export function fixtureLesson(over: Partial<Lesson> = {}): Lesson {
  return {
    id: 'l-test-div3',
    map_id: 'mat-2-3-098',
    version: 1,
    grade: 2,
    subject: 'matematika',
    term: 3,
    title: 'Sonni 3 ga bo‘lish',
    objective: 'test',
    success_criteria: ['test'],
    prior_knowledge: [],
    vocabulary: [],
    minutes: 10,
    explanation: { intro: 'Bo‘lish — teng qismlarga ajratish.', steps: ['a'], visual: { type: 'share', a: 12, b: 3, item: 'olma' } },
    worked_example: { prompt: '12 : 3', steps: ['12 : 3 = 4'], answer: 4 },
    misconceptions: [],
    diagnostic: { kind: 'mul_fact', params: { factor: 3, other: [2, 6] } },
    practice: [{ kind: 'div_fact', params: { divisor: 3, quotient: [2, 10] } }],
    transfer: [{ kind: 'word_share', params: { divisor: 3, quotient: [2, 10] } }],
    parent_guide: {
      teach_me: ['Bo‘lish — teng tarqatish.'],
      teach_child: [
        { minutes: '1–2', action: 'a' },
        { minutes: '3–5', action: 'b' },
        { minutes: '6–10', action: 'c' },
      ],
      materials: [],
      watch_for: [],
    },
    status: 'DRAFT',
    source_id: 'src',
    ai_review: null,
    human_reviews: [],
    ...over,
  };
}

export function fixtureCatalog(lessons: Lesson[] = [fixtureLesson()]): Catalog {
  return {
    schema_version: 1,
    academic_year: '2026-2027',
    school_language: 'uz-Latn',
    generated_at: '2026-11-03',
    disclaimer: 'test',
    sources: [],
    subjects: [{ code: 'matematika', title: 'Matematika', emoji: '➗', grades: [1, 2, 3, 4], content_state: 'lessons_draft', status: 'DRAFT' }],
    map: lessons.map((l, i) => ({
      id: l.map_id,
      grade: l.grade,
      subject: 'matematika',
      term: l.term,
      seq: i + 1,
      textbook_no: '98',
      title: l.title,
      title_quality: 'verbatim',
      kind: 'lesson',
      source_id: 'src',
      status: l.status,
      detailed_lesson_id: l.id,
    })),
    lessons,
  };
}

/** Javob qiymatini olish (test uchun "aqlli o'quvchi"). */
export const rightAnswer = (ex: { answer: { type: string; value: number | string } }) => String(ex.answer.value);
