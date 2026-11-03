import type { Lesson } from '../content/schema';
import { checkAnswer } from '../math/check';
import { generateExercise, toPublicExercise } from '../math/generators';
import type { Exercise, GeneratorSpec, MisconceptionCode, PublicExercise } from '../math/types';
import { createRng } from '../random';
import { classifySafety, type SafetyCategory } from '../safety/classify';
import { normalizeForMatch } from '../text/normalize';
import { MISCONCEPTION_FEEDBACK, pickCorrect, SAFETY_REPLY, T } from './templates';

/**
 * Bilimjon v1 — pedagogik nazorat qilinadigan holat mashinasi (LLM EMAS).
 *
 * DIAGNOSTIKA → MISOL → YO'NALTIRILGAN MASHQ → MUSTAQIL MASHQ → TRANSFER → XULOSA
 *
 * Asosiy qoidalar:
 *  - To'g'ri/noto'g'ri qarorini faqat deterministik `checkAnswer` qiladi.
 *  - Javob hech qachon avtomatik aytilmaydi; ishoralar zinapoyasi.
 *  - 3 marta xato → "birga yechamiz" (bitta ishlangan misol), so'ng YANGI masala.
 *  - O'zlashtirish faqat yangi (transfer) masalalarni ishorasiz yechish orqali.
 *  - Bola matni saqlanmaydi; log faqat to'g'ri/noto'g'ri, ishoralar soni, xato kodi.
 */
export type Phase = 'diagnostic' | 'example' | 'guided' | 'independent' | 'transfer' | 'summary';

export const PHASE_PLAN = { diagnostic: 1, guided: 2, independent: 2, transfer: 2 } as const;
const MAX_ATTEMPTS = 3;
const MAX_REPLACEMENTS_PER_PHASE = 1;

export interface AttemptRecord {
  phase: Exclude<Phase, 'example' | 'summary'>;
  kind: string;
  correct: boolean;
  firstTry: boolean;
  hintsUsed: number;
  attempts: number;
  misconception?: MisconceptionCode;
}

export type Mastery = 'mastered' | 'developing' | 'needs_practice';

export interface TutorState {
  v: 1;
  lessonId: string;
  lessonVersion: number;
  seed: string;
  phase: Phase;
  /** Fazadagi hisoblanadigan masala raqami. */
  index: number;
  replacements: number;
  serial: number;
  current: Exercise | null;
  attempts: number;
  hintLevel: number;
  hintsUsed: number;
  records: AttemptRecord[];
  mastery: Mastery | null;
}

export type TutorInput =
  | { type: 'start' }
  | { type: 'next' }
  | { type: 'hint' }
  | { type: 'answer'; value: string }
  | { type: 'text'; text: string };

export type TutorMessage =
  | { kind: 'say'; text: string; tone?: 'neutral' | 'positive' | 'gentle' }
  | { kind: 'exercise'; exercise: PublicExercise; phase: Phase; index: number; total: number }
  | { kind: 'example'; prompt: string; steps: string[]; intro: string; explanationSteps: string[]; visual: Lesson['explanation']['visual'] }
  | { kind: 'hint'; text: string; level: number; of: number }
  | { kind: 'solution'; steps: string[] }
  | { kind: 'safety'; category: Exclude<SafetyCategory, 'ok'>; text: string }
  | { kind: 'summary'; mastery: Mastery; text: string; transferCorrect: number; transferTotal: number; parentNote: string };

export interface TutorResult {
  state: TutorState;
  messages: TutorMessage[];
  /** Ota-ona hisobotiga yuboriladigan hodisa (shaxsiy ma'lumotsiz). */
  event?: AttemptRecord;
}

function specsFor(lesson: Lesson, phase: Phase): readonly GeneratorSpec[] {
  if (phase === 'diagnostic') return [lesson.diagnostic as GeneratorSpec];
  if (phase === 'transfer') return lesson.transfer as GeneratorSpec[];
  return lesson.practice as GeneratorSpec[];
}

function pickSpec(specs: readonly GeneratorSpec[], seed: string): GeneratorSpec {
  const rng = createRng(seed);
  const total = specs.reduce((s, x) => s + (x.weight ?? 1), 0);
  let r = rng.next() * total;
  for (const s of specs) {
    r -= s.weight ?? 1;
    if (r <= 0) return s;
  }
  return specs[specs.length - 1]!;
}

function newItem(lesson: Lesson, state: TutorState): Exercise {
  const serial = state.serial;
  const seed = `${state.seed}:${state.phase}:${state.index}:${serial}`;
  const spec = pickSpec(specsFor(lesson, state.phase), seed);
  return generateExercise(lesson.id, spec, seed);
}

function totalFor(phase: Phase): number {
  return phase === 'diagnostic' || phase === 'guided' || phase === 'independent' || phase === 'transfer' ? PHASE_PLAN[phase] : 0;
}

function present(lesson: Lesson, state: TutorState): { state: TutorState; msg: TutorMessage } {
  const s: TutorState = { ...state, serial: state.serial + 1, attempts: 0, hintLevel: 0, hintsUsed: 0 };
  s.current = newItem(lesson, state);
  return { state: s, msg: { kind: 'exercise', exercise: toPublicExercise(s.current), phase: s.phase, index: s.index, total: totalFor(s.phase) } };
}

const NEXT_PHASE: Record<Phase, Phase> = {
  diagnostic: 'example',
  example: 'guided',
  guided: 'independent',
  independent: 'transfer',
  transfer: 'summary',
  summary: 'summary',
};

const PHASE_INTRO: Partial<Record<Phase, string>> = {
  guided: T.guidedPhase,
  independent: T.independentPhase,
  transfer: T.transferPhase,
};

function exampleMessage(lesson: Lesson): TutorMessage {
  return {
    kind: 'example',
    intro: lesson.explanation.intro,
    explanationSteps: lesson.explanation.steps,
    visual: lesson.explanation.visual,
    prompt: lesson.worked_example.prompt,
    steps: lesson.worked_example.steps,
  };
}

export function computeMastery(records: readonly AttemptRecord[]): { mastery: Mastery; correct: number; total: number } {
  const tr = records.filter((r) => r.phase === 'transfer');
  const clean = tr.filter((r) => r.correct && r.firstTry && r.hintsUsed === 0).length;
  const anyCorrect = tr.filter((r) => r.correct).length;
  const total = PHASE_PLAN.transfer;
  const mastery: Mastery = clean >= total ? 'mastered' : anyCorrect >= 1 ? 'developing' : 'needs_practice';
  return { mastery, correct: anyCorrect, total };
}

function advance(lesson: Lesson, state: TutorState, messages: TutorMessage[]): TutorResult {
  let s = { ...state, current: null as Exercise | null };
  const planned = totalFor(s.phase);
  if (s.index + 1 < planned) {
    s.index += 1;
    const p = present(lesson, s);
    messages.push(p.msg);
    return { state: p.state, messages };
  }
  const next = NEXT_PHASE[s.phase];
  s = { ...s, phase: next, index: 0, replacements: 0 };
  if (next === 'example') {
    messages.push({ kind: 'say', text: T.examplePhase }, exampleMessage(lesson));
    return { state: s, messages };
  }
  if (next === 'summary') {
    const m = computeMastery(s.records);
    s.mastery = m.mastery;
    const text = m.mastery === 'mastered' ? T.summaryMastered : m.mastery === 'developing' ? T.summaryDeveloping : T.summaryNeedsPractice;
    messages.push({
      kind: 'summary',
      mastery: m.mastery,
      text: `${text} ${T.summaryAdult}`,
      transferCorrect: m.correct,
      transferTotal: m.total,
      parentNote: lesson.parent_guide.teach_me[0] ?? '',
    });
    return { state: s, messages };
  }
  const intro = PHASE_INTRO[next];
  if (intro) messages.push({ kind: 'say', text: intro });
  const p = present(lesson, s);
  messages.push(p.msg);
  return { state: p.state, messages };
}

export function startSession(lesson: Lesson, seed: string): TutorResult {
  const base: TutorState = {
    v: 1,
    lessonId: lesson.id,
    lessonVersion: lesson.version,
    seed,
    phase: 'diagnostic',
    index: 0,
    replacements: 0,
    serial: 0,
    current: null,
    attempts: 0,
    hintLevel: 0,
    hintsUsed: 0,
    records: [],
    mastery: null,
  };
  const p = present(lesson, base);
  return {
    state: p.state,
    messages: [{ kind: 'say', text: T.greet(lesson.title) }, { kind: 'say', text: T.diagnosticNote, tone: 'gentle' }, p.msg],
  };
}

const ANSWER_REQUEST = ['javobni ayt', 'javobini ayt', 'javobi nechi', 'javobi qancha', 'yechib ber', 'javob ber', "o'zing yech", 'ayt javob', 'javobni bilmoqchiman'];
const CONFUSED = ['tushunmadim', 'bilmayman', 'qiyin', 'yordam', 'tushuntir', 'nima qilay', 'qanday'];

function giveHint(state: TutorState, messages: TutorMessage[]): TutorState {
  const ex = state.current!;
  if (state.hintLevel >= ex.hints.length) {
    messages.push({ kind: 'say', text: T.noMoreHints, tone: 'gentle' });
    return state;
  }
  const level = state.hintLevel + 1;
  messages.push({ kind: 'hint', text: ex.hints[level - 1]!, level, of: ex.hints.length });
  return { ...state, hintLevel: level, hintsUsed: state.hintsUsed + 1 };
}

function handleAnswer(lesson: Lesson, state: TutorState, raw: string): TutorResult {
  const messages: TutorMessage[] = [];
  const ex = state.current!;
  const res = checkAnswer(ex, raw);
  if (res.status === 'unparseable') {
    messages.push({ kind: 'say', text: ex.answer.type === 'choice' ? T.unparseableChoice : T.unparseable, tone: 'gentle' });
    return { state, messages };
  }
  const phase = state.phase as AttemptRecord['phase'];
  const attempts = state.attempts + 1;

  if (res.status === 'correct') {
    const rec: AttemptRecord = { phase, kind: ex.kind, correct: true, firstTry: attempts === 1, hintsUsed: state.hintsUsed, attempts };
    const rng = createRng(`${state.seed}:ok:${state.serial}`);
    if (phase === 'diagnostic') messages.push({ kind: 'say', text: T.diagnosticCorrect, tone: 'positive' });
    else {
      messages.push({ kind: 'say', text: attempts === 1 ? pickCorrect(rng) : T.correctAfterTries, tone: 'positive' });
      const why = ex.solution[ex.solution.length - 1];
      if (why) messages.push({ kind: 'say', text: why });
    }
    const s = { ...state, attempts, records: [...state.records, rec] };
    const out = advance(lesson, s, messages);
    return { ...out, event: rec };
  }

  // Noto'g'ri
  const misText = res.misconception ? MISCONCEPTION_FEEDBACK[res.misconception] : null;
  if (phase === 'diagnostic') {
    const rec: AttemptRecord = { phase, kind: ex.kind, correct: false, firstTry: false, hintsUsed: 0, attempts, ...(res.misconception ? { misconception: res.misconception } : {}) };
    messages.push({ kind: 'say', text: T.diagnosticIncorrect, tone: 'gentle' });
    const out = advance(lesson, { ...state, attempts, records: [...state.records, rec] }, messages);
    return { ...out, event: rec };
  }

  if (attempts >= MAX_ATTEMPTS) {
    const rec: AttemptRecord = { phase, kind: ex.kind, correct: false, firstTry: false, hintsUsed: state.hintsUsed, attempts, ...(res.misconception ? { misconception: res.misconception } : {}) };
    messages.push({ kind: 'say', text: T.workTogether, tone: 'gentle' }, { kind: 'solution', steps: ex.solution });
    let s: TutorState = { ...state, attempts, records: [...state.records, rec] };
    if (s.replacements < MAX_REPLACEMENTS_PER_PHASE) {
      // Ko'chirib qo'yishga yo'l qo'ymaslik: o'sha masalani emas, YANGI masalani beramiz.
      messages.push({ kind: 'say', text: T.afterSolution });
      s = { ...s, replacements: s.replacements + 1 };
      const p = present(lesson, s);
      messages.push(p.msg);
      return { state: p.state, messages, event: rec };
    }
    const out = advance(lesson, s, messages);
    return { ...out, event: rec };
  }

  let s: TutorState = { ...state, attempts };
  if (misText) messages.push({ kind: 'say', text: misText, tone: 'gentle' });
  else messages.push({ kind: 'say', text: T.tryAgain, tone: 'gentle' });
  // Yo'naltirilgan mashqda har xatodan keyin avtomatik ishora; mustaqil/transferda — 2-xatodan keyin.
  if (phase === 'guided' || attempts >= 2) s = giveHint(s, messages);
  return { state: s, messages };
}

export function respond(lesson: Lesson, state: TutorState, input: TutorInput): TutorResult {
  if (state.lessonId !== lesson.id || state.lessonVersion !== lesson.version) {
    throw new Error('Sessiya boshqa dars yoki versiyaga tegishli');
  }
  if (input.type === 'start') return startSession(lesson, state.seed);
  if (state.phase === 'summary') return { state, messages: [] };

  if (state.phase === 'example') {
    if (input.type === 'next' || input.type === 'answer') return advance(lesson, state, []);
    if (input.type === 'text') {
      const safety = classifySafety(input.text);
      if (safety.category !== 'ok') return { state, messages: [{ kind: 'safety', category: safety.category, text: SAFETY_REPLY[safety.category] }] };
    }
    return { state, messages: [exampleMessage(lesson)] };
  }

  if (!state.current) throw new Error('Joriy masala yo‘q');

  switch (input.type) {
    case 'next':
      return { state, messages: [{ kind: 'say', text: T.backToTask }, { kind: 'exercise', exercise: toPublicExercise(state.current), phase: state.phase, index: state.index, total: totalFor(state.phase) }] };
    case 'hint': {
      if (state.phase === 'diagnostic') return { state, messages: [{ kind: 'say', text: T.diagnosticNoHints, tone: 'gentle' }] };
      const messages: TutorMessage[] = [];
      return { state: giveHint(state, messages), messages };
    }
    case 'answer':
      return handleAnswer(lesson, state, input.value);
    case 'text': {
      if (input.text.length > 500) return { state, messages: [{ kind: 'say', text: T.unparseable }] };
      const safety = classifySafety(input.text);
      if (safety.category !== 'ok') return { state, messages: [{ kind: 'safety', category: safety.category, text: SAFETY_REPLY[safety.category] }] };
      const s = normalizeForMatch(input.text);
      if (ANSWER_REQUEST.some((k) => s.includes(k))) {
        const messages: TutorMessage[] = [{ kind: 'say', text: T.answerRequest, tone: 'gentle' }];
        if (state.phase === 'diagnostic') return { state, messages: [{ kind: 'say', text: T.diagnosticNoHints, tone: 'gentle' }] };
        return { state: giveHint(state, messages), messages };
      }
      if (/\d/.test(s) || ['ha', "yo'q", 'yoq'].includes(s) || /^(nol|bir|ikki|uch|to'rt|besh|olti|yetti|sakkiz|to'qqiz|o'n|yigirma|o'ttiz|qirq|ellik)/.test(s)) {
        return handleAnswer(lesson, state, input.text);
      }
      if (CONFUSED.some((k) => s.includes(k))) {
        if (state.phase === 'diagnostic') return { state, messages: [{ kind: 'say', text: T.diagnosticNoHints, tone: 'gentle' }] };
        const messages: TutorMessage[] = [{ kind: 'say', text: T.confused, tone: 'gentle' }];
        return { state: giveHint(state, messages), messages };
      }
      return {
        state,
        messages: [{ kind: 'say', text: T.backToTask }, { kind: 'exercise', exercise: toPublicExercise(state.current), phase: state.phase, index: state.index, total: totalFor(state.phase) }],
      };
    }
  }
}
