import { z } from 'zod';

/** Nashr holat mashinasi (docs/CURRICULUM_VERIFICATION.md). Faqat PUBLISHED bola rejimida rasmiy ko'rinadi. */
export const REVIEW_STATUSES = ['DRAFT', 'SOURCE_VERIFIED', 'EDUCATOR_REVIEWED', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const;
export const ReviewStatus = z.enum(REVIEW_STATUSES);
export type ReviewStatus = z.infer<typeof ReviewStatus>;

/** Ruxsat etilgan o'tishlar. Orqaga qaytish (qayta ko'rib chiqish) har doim DRAFT ga. */
export const ALLOWED_TRANSITIONS: Record<ReviewStatus, readonly ReviewStatus[]> = {
  DRAFT: ['SOURCE_VERIFIED', 'ARCHIVED'],
  SOURCE_VERIFIED: ['EDUCATOR_REVIEWED', 'DRAFT', 'ARCHIVED'],
  EDUCATOR_REVIEWED: ['APPROVED', 'DRAFT', 'ARCHIVED'],
  APPROVED: ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED', 'DRAFT'],
  ARCHIVED: ['DRAFT'],
};

export function canTransition(from: ReviewStatus, to: ReviewStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export const RightsStatus = z.enum(['UNKNOWN', 'TOPIC_TITLES_ONLY', 'LICENSED', 'ORIGINAL']);

export const SourceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  author: z.string(),
  publisher: z.string(),
  year: z.number().int(),
  isbn: z.string().nullable(),
  grade: z.number().int().min(1).max(4),
  part: z.number().int().min(1).max(4),
  url: z.string().url(),
  retrieved_at: z.string(),
  /** Qism → chorak moslashuvi taxmin qilinganmi yoki rasmiy taqvim-mavzu rejasi bilan tekshirilganmi. */
  term_mapping: z.enum(['ASSUMED_PART_EQUALS_TERM', 'VERIFIED_WITH_TMR']),
  rights_status: RightsStatus,
  notes: z.string().optional(),
});
export type Source = z.infer<typeof SourceSchema>;

/** AI metodist tekshiruvi. MUHIM: bu inson tasdig'i O'RNINI BOSMAYDI va hech qachon nashrga yetarli emas. */
export const AiReviewSchema = z.object({
  by: z.literal('Claude (AI metodist)'),
  at: z.string(),
  checklist: z.object({
    objective_matches_textbook_topic: z.boolean(),
    numbers_within_grade_limits: z.boolean(),
    answers_verified_by_engine: z.boolean(),
    hints_do_not_reveal_answer: z.boolean(),
    language_age_appropriate: z.boolean(),
    no_textbook_text_copied: z.boolean(),
    parent_guide_household_materials_only: z.boolean(),
  }),
  notes: z.string().optional(),
});

export const HumanReviewSchema = z.object({
  reviewer_id: z.string().min(3),
  role: z.enum(['primary_teacher', 'methodist', 'subject_expert']),
  decision: z.enum(['approved', 'changes_requested']),
  reviewed_at: z.string(),
  notes: z.string().optional(),
});

export const GeneratorSpecSchema = z.object({
  kind: z.enum([
    'mul_fact', 'div_fact', 'missing_factor', 'word_groups', 'word_share', 'times_more', 'times_less', 'mul_div_link', 'table_mixed', 'divisor_check',
  ]),
  params: z
    .object({
      factor: z.union([z.number().int(), z.array(z.number().int())]).optional(),
      divisor: z.union([z.number().int(), z.array(z.number().int())]).optional(),
      k: z.union([z.number().int(), z.array(z.number().int())]).optional(),
      other: z.tuple([z.number().int(), z.number().int()]).optional(),
      quotient: z.tuple([z.number().int(), z.number().int()]).optional(),
      base: z.tuple([z.number().int(), z.number().int()]).optional(),
      number: z.tuple([z.number().int(), z.number().int()]).optional(),
      factors: z.array(z.number().int()).optional(),
    })
    .strict(),
  weight: z.number().positive().optional(),
});

export const SubjectSchema = z.object({
  code: z.string(),
  title: z.string(),
  emoji: z.string(),
  grades: z.array(z.number().int().min(1).max(4)),
  /** Ushbu fan uchun kontent tayyorlanganmi. */
  content_state: z.enum(['planned', 'map_only', 'lessons_draft']),
  status: ReviewStatus,
  note: z.string().optional(),
});

export const MapEntrySchema = z.object({
  id: z.string(),
  grade: z.number().int().min(1).max(4),
  subject: z.string(),
  term: z.number().int().min(1).max(4),
  seq: z.number().int(),
  /** Darslikdagi dars raqami (mavjud bo'lsa). */
  textbook_no: z.string().nullable(),
  title: z.string(),
  title_quality: z.enum(['verbatim', 'paraphrased']),
  kind: z.enum(['lesson', 'review', 'assessment', 'practice', 'game', 'gap']),
  source_id: z.string(),
  status: ReviewStatus,
  detailed_lesson_id: z.string().nullable(),
});

const MisconceptionSchema = z.object({ code: z.string(), description: z.string(), remedy: z.string() });

export const LessonSchema = z
  .object({
    id: z.string(),
    map_id: z.string(),
    version: z.number().int().positive(),
    grade: z.number().int().min(1).max(4),
    subject: z.string(),
    term: z.number().int().min(1).max(4),
    title: z.string(),
    objective: z.string(),
    success_criteria: z.array(z.string()).min(1),
    prior_knowledge: z.array(z.string()),
    vocabulary: z.array(z.string()),
    minutes: z.number().int().min(5).max(20),
    explanation: z.object({
      intro: z.string(),
      steps: z.array(z.string()).min(1),
      visual: z.object({ type: z.enum(['groups', 'array', 'share', 'times']), a: z.number().int(), b: z.number().int(), item: z.string() }),
    }),
    worked_example: z.object({ prompt: z.string(), steps: z.array(z.string()).min(1), answer: z.number().int() }),
    misconceptions: z.array(MisconceptionSchema),
    diagnostic: GeneratorSpecSchema,
    practice: z.array(GeneratorSpecSchema).min(1),
    transfer: z.array(GeneratorSpecSchema).min(1),
    parent_guide: z.object({
      teach_me: z.array(z.string()).min(1),
      teach_child: z.array(z.object({ minutes: z.string(), action: z.string() })).min(3),
      materials: z.array(z.string()),
      watch_for: z.array(z.string()),
    }),
    status: ReviewStatus,
    source_id: z.string(),
    ai_review: AiReviewSchema.nullable(),
    human_reviews: z.array(HumanReviewSchema),
  })
  .superRefine((l, ctx) => {
    // NASHR DARVOZASI: PUBLISHED/APPROVED uchun inson tasdig'i majburiy. AI tekshiruvi hisobga olinmaydi.
    if (l.status === 'APPROVED' || l.status === 'PUBLISHED') {
      const ok = l.human_reviews.some((r) => r.decision === 'approved');
      if (!ok) ctx.addIssue({ code: 'custom', message: `${l.id}: ${l.status} uchun inson (o'qituvchi/metodist) tasdig'i kerak` });
    }
    if (l.status === 'EDUCATOR_REVIEWED' && l.human_reviews.length === 0)
      ctx.addIssue({ code: 'custom', message: `${l.id}: EDUCATOR_REVIEWED uchun kamida bitta inson tekshiruvi kerak` });
  });

export type Subject = z.infer<typeof SubjectSchema>;
export type MapEntry = z.infer<typeof MapEntrySchema>;
export type Lesson = z.infer<typeof LessonSchema>;

export const CatalogSchema = z.object({
  schema_version: z.literal(1),
  academic_year: z.string(),
  school_language: z.literal('uz-Latn'),
  generated_at: z.string(),
  disclaimer: z.string(),
  sources: z.array(SourceSchema),
  subjects: z.array(SubjectSchema),
  map: z.array(MapEntrySchema),
  lessons: z.array(LessonSchema),
});
export type Catalog = z.infer<typeof CatalogSchema>;
