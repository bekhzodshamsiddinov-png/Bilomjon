import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';
import {
  askBilimjon,
  buildParentReport,
  childCatalog,
  findVisibleLesson,
  generateDemoFamily,
  respond,
  startSession,
  type Catalog,
  type TutorInput,
  type TutorState,
} from '@bilim/core';
import { openSession, sealSession } from './session';

export interface ApiConfig {
  catalog: Catalog;
  /** Tasdiqlanmagan qoralamalarni namuna sifatida qaytarish. Production'da false. */
  demoContent: boolean;
  sessionKey: CryptoKey | Promise<CryptoKey>;
}

/**
 * BILIM AI API v1.
 * Xavfsizlik qoidalari:
 *  - Har bir endpoint `visibilityOf` orqali faqat PUBLISHED (yoki demo rejimda belgilangan namuna) qaytaradi.
 *  - Bola matni hech qachon logga yozilmaydi.
 *  - Tutor holati serverda shifrlangan token ichida (AES-GCM) — mijoz javobni ko'ra olmaydi va o'zgartira olmaydi.
 *  - Bola ro'yxatdan o'tish, to'lov, shaxsiy ma'lumot endpointlari YO'Q.
 */
export function createApp(cfg: ApiConfig) {
  const app = new Hono().basePath('/api');
  const vis = { demoContent: cfg.demoContent };

  app.use('*', secureHeaders());
  app.use('*', bodyLimit({ maxSize: 16 * 1024, onError: (c) => c.json({ error: 'payload_too_large' }, 413) }));
  app.use('*', async (c, next) => {
    const t = Date.now();
    await next();
    // Faqat metama'lumot. Body, query matni va IP yozilmaydi.
    if (process.env.NODE_ENV !== 'test') console.log(JSON.stringify({ m: c.req.method, p: c.req.routePath, s: c.res.status, ms: Date.now() - t }));
  });

  app.get('/health', (c) => c.json({ ok: true, demo: cfg.demoContent, liveAI: false, version: '0.3.0' }));

  app.get('/v1/catalog/grades/:grade/subjects', (c) => {
    const grade = Number(c.req.param('grade'));
    if (!Number.isInteger(grade) || grade < 1 || grade > 4) return c.json({ error: 'invalid_grade' }, 400);
    const year = c.req.query('academic_year') ?? cfg.catalog.academic_year;
    const lang = c.req.query('school_language') ?? cfg.catalog.school_language;
    if (year !== cfg.catalog.academic_year || lang !== cfg.catalog.school_language) return c.json({ subjects: [], note: 'unsupported_year_or_language' });
    return c.json({ demo: cfg.demoContent, disclaimer: cfg.catalog.disclaimer, subjects: childCatalog(cfg.catalog, grade, vis) });
  });

  app.get('/v1/lessons/:id', (c) => {
    const found = findVisibleLesson(cfg.catalog, c.req.param('id'), vis);
    if (!found) return c.json({ error: 'not_found_or_not_approved' }, 404);
    const { lesson, visibility } = found;
    // Generator spetsifikatsiyalari va ota-ona qo'llanmasi bola endpointidan qaytarilmaydi.
    const { diagnostic: _d, practice: _p, transfer: _t, ai_review: _a, human_reviews: _h, ...pub } = lesson;
    return c.json({ visibility, lesson: pub });
  });

  app.get('/v1/lessons/:id/parent-guide', (c) => {
    const found = findVisibleLesson(cfg.catalog, c.req.param('id'), vis);
    if (!found) return c.json({ error: 'not_found_or_not_approved' }, 404);
    return c.json({ visibility: found.visibility, title: found.lesson.title, objective: found.lesson.objective, guide: found.lesson.parent_guide });
  });

  app.post('/v1/tutor/start', async (c) => {
    const body = await c.req.json().catch(() => null);
    const lessonId = typeof body?.lessonId === 'string' ? body.lessonId : '';
    const found = findVisibleLesson(cfg.catalog, lessonId, vis);
    if (!found) return c.json({ error: 'not_found_or_not_approved' }, 404);
    const seed = crypto.randomUUID();
    const r = startSession(found.lesson, seed);
    return c.json({ visibility: found.visibility, session: await sealSession(await cfg.sessionKey, r.state), messages: r.messages });
  });

  app.post('/v1/tutor/respond', async (c) => {
    const body = await c.req.json().catch(() => null);
    const input = parseInput(body?.input);
    if (!input || typeof body?.session !== 'string') return c.json({ error: 'invalid_request' }, 400);
    const state = await openSession<TutorState>(await cfg.sessionKey, body.session);
    if (!state) return c.json({ error: 'invalid_session' }, 400);
    // Dars sessiya davomida nashrdan olingan bo'lsa — davom ettirilmaydi.
    const found = findVisibleLesson(cfg.catalog, state.lessonId, vis);
    if (!found || found.lesson.version !== state.lessonVersion) return c.json({ error: 'lesson_changed_or_unpublished' }, 409);
    const r = respond(found.lesson, state, input);
    return c.json({ session: await sealSession(await cfg.sessionKey, r.state), messages: r.messages, phase: r.state.phase, mastery: r.state.mastery });
  });

  app.post('/v1/ask', async (c) => {
    const body = await c.req.json().catch(() => null);
    const text = typeof body?.text === 'string' ? body.text : '';
    const grade = Number(body?.grade ?? 2);
    if (!text || text.length > 500 || !Number.isInteger(grade) || grade < 1 || grade > 4) return c.json({ error: 'invalid_request' }, 400);
    return c.json(askBilimjon(text, { catalog: cfg.catalog, grade, visibility: vis }));
  });

  // Faqat demo: generatsiya qilingan namuna oila. Haqiqiy bola ma'lumotlari uchun endpoint YO'Q.
  app.get('/v1/demo/parent-report', (c) => {
    if (!cfg.demoContent) return c.json({ error: 'demo_disabled' }, 404);
    const family = generateDemoFamily(cfg.catalog);
    return c.json({ isDemo: true, children: family.map((ch) => ({ id: ch.id, alias: ch.alias, avatar: ch.avatar, grade: ch.grade, report: buildParentReport(ch, cfg.catalog) })) });
  });

  app.notFound((c) => c.json({ error: 'not_found' }, 404));
  app.onError((err, c) => {
    console.error(JSON.stringify({ error: err.name, p: c.req.routePath }));
    return c.json({ error: 'internal_error' }, 500);
  });
  return app;
}

function parseInput(v: unknown): TutorInput | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  switch (o.type) {
    case 'next':
    case 'hint':
    case 'start':
      return { type: o.type };
    case 'answer':
      return typeof o.value === 'string' && o.value.length <= 200 ? { type: 'answer', value: o.value } : null;
    case 'text':
      return typeof o.text === 'string' && o.text.length <= 500 ? { type: 'text', text: o.text } : null;
    default:
      return null;
  }
}
