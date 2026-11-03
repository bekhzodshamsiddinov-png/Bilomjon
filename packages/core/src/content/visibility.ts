import type { Catalog, Lesson, MapEntry, ReviewStatus } from './schema';

export interface VisibilityOptions {
  /** true bo'lsa — tasdiqlanmagan qoralamalar "Sinov namunasi" yorlig'i bilan ko'rsatiladi. Production'da false. */
  demoContent: boolean;
}

export type Visibility = 'official' | 'demo_preview' | 'hidden';

/** Yagona qoida: rasmiy = faqat PUBLISHED. Qolgani yo yashirin, yo aniq belgilangan namuna. */
export function visibilityOf(status: ReviewStatus, opts: VisibilityOptions): Visibility {
  if (status === 'PUBLISHED') return 'official';
  if (status === 'ARCHIVED') return 'hidden';
  return opts.demoContent ? 'demo_preview' : 'hidden';
}

export interface ChildCatalogEntry {
  entry: MapEntry;
  visibility: Exclude<Visibility, 'hidden'>;
  lessonId: string | null;
}

export interface ChildCatalogTerm {
  term: number;
  entries: ChildCatalogEntry[];
}

export interface ChildCatalogSubject {
  code: string;
  title: string;
  emoji: string;
  contentState: Catalog['subjects'][number]['content_state'];
  terms: ChildCatalogTerm[];
}

/** Bola rejimidagi katalog: faqat ko'rinadigan elementlar; bo'sh fan "tez orada" deb ko'rsatiladi (soxta mavzu emas). */
export function childCatalog(catalog: Catalog, grade: number, opts: VisibilityOptions): ChildCatalogSubject[] {
  const lessonById = new Map(catalog.lessons.map((l) => [l.id, l]));
  return catalog.subjects
    .filter((s) => s.grades.includes(grade))
    .map((s) => {
      const terms: ChildCatalogTerm[] = [1, 2, 3, 4].map((term) => ({
        term,
        entries: catalog.map
          .filter((m) => m.grade === grade && m.subject === s.code && m.term === term && m.kind !== 'gap')
          .sort((a, b) => a.seq - b.seq)
          .flatMap((m): ChildCatalogEntry[] => {
            const v = visibilityOf(m.status, opts);
            if (v === 'hidden') return [];
            const lesson = m.detailed_lesson_id ? lessonById.get(m.detailed_lesson_id) : undefined;
            const lessonVisible = lesson ? visibilityOf(lesson.status, opts) !== 'hidden' : false;
            return [{ entry: m, visibility: v, lessonId: lesson && lessonVisible ? lesson.id : null }];
          }),
      }));
      return { code: s.code, title: s.title, emoji: s.emoji, contentState: s.content_state, terms };
    });
}

export function findVisibleLesson(catalog: Catalog, lessonId: string, opts: VisibilityOptions): { lesson: Lesson; visibility: Exclude<Visibility, 'hidden'> } | null {
  const lesson = catalog.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  const v = visibilityOf(lesson.status, opts);
  return v === 'hidden' ? null : { lesson, visibility: v };
}
