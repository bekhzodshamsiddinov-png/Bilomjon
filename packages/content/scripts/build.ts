/**
 * Kontent quruvchi va validator.
 *   pnpm --filter @bilim/content build   → generated/catalog.json + docs/CURRICULUM_MAP.md
 *   pnpm --filter @bilim/content check   → fayllar yangilanganini va barcha qoidalar bajarilganini tekshiradi (CI)
 *
 * Har bir mashq spetsifikatsiyasi 60 ta seed bilan generatsiya qilinadi va MUSTAQIL hisoblangan
 * javob bilan solishtiriladi; ishoralar javobni oshkor qilmasligi tekshiriladi.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  CatalogSchema,
  generateExercise,
  validateSpecForGrade,
  type Catalog,
  type Exercise,
  type GeneratorSpec,
  type MapEntry,
} from '@bilim/core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CUR = join(ROOT, 'curriculum');
const OUT = join(ROOT, 'generated', 'catalog.json');
const DOC = join(ROOT, '..', '..', 'docs', 'CURRICULUM_MAP.md');
const SAMPLES = 60;

const readYaml = (p: string) => parse(readFileSync(p, 'utf8'), { merge: true });

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : d.name.endsWith('.yaml') ? [join(dir, d.name)] : [],
  );
}

function inferKind(title: string): MapEntry['kind'] {
  const t = title.toLowerCase();
  if (t.startsWith('[')) return 'gap';
  if (t.includes('nazorat ishi')) return 'assessment';
  if (t.includes('yakuniy dars')) return 'assessment';
  if (t.includes('takrorlash')) return 'review';
  if (t.includes('o‘yin-dars')) return 'game';
  if (t.includes('amaliy topshiriq') || t.includes('masalalar yechish') || t.includes('mantiqiy')) return 'practice';
  return 'lesson';
}

interface MapFile {
  grade: number;
  subject: string;
  terms: { term: number; source: string; title_quality: 'verbatim' | 'paraphrased'; lessons: string[] }[];
}

function expandMap(file: MapFile): MapEntry[] {
  const out: MapEntry[] = [];
  const used = new Set<string>();
  for (const t of file.terms) {
    let prev: string | null = null;
    let suffixN = 0;
    t.lessons.forEach((line, i) => {
      const m = line.match(/^(\d+)(?:\s*[–-]\s*(\d+))?\.\s+(.*)$/);
      let no: string | null = null;
      let title = line;
      let key: string;
      if (m) {
        no = m[2] ? `${m[1]}–${m[2]}` : m[1]!;
        title = m[3]!;
        key = m[1]!.padStart(3, '0');
        prev = key;
        suffixN = 0;
      } else if (prev) {
        suffixN++;
        key = `${prev}y${suffixN > 1 ? suffixN : ''}`;
      } else {
        key = `s${String(i + 1).padStart(2, '0')}`;
      }
      let id = `mat-${file.grade}-${t.term}-${key}`;
      while (used.has(id)) id += 'b';
      used.add(id);
      out.push({
        id,
        grade: file.grade,
        subject: file.subject,
        term: t.term,
        seq: i + 1,
        textbook_no: no,
        title: title.replace(/^\[|\]$/g, ''),
        title_quality: t.title_quality,
        kind: inferKind(title),
        source_id: t.source,
        status: 'DRAFT',
        detailed_lesson_id: null,
      });
    });
  }
  return out;
}

/** Mustaqil "orakul": javobni operandlardan qayta hisoblaydi (generator kodidan foydalanmasdan). */
function oracle(ex: Exercise): number | string {
  const o = ex.operands;
  switch (ex.kind) {
    case 'mul_fact':
      return o.a! * o.b!;
    case 'div_fact':
      return o.a! / o.b!;
    case 'missing_factor':
      return o.prod! / o.b!;
    case 'word_groups':
      return o.groups! * o.per!;
    case 'word_share':
      return o.total! / o.parts!;
    case 'times_more':
      return o.base! * o.k!;
    case 'times_less':
      return o.big! / o.k!;
    case 'mul_div_link': {
      const m = ex.prompt.match(/: (\d+) = \?$/);
      return o.prod! / Number(m![1]);
    }
    case 'table_mixed':
      return 'a' in o && ex.prompt.includes('×') ? o.a! * o.b! : o.a! / o.b!;
    case 'divisor_check':
      return o.n! % o.d! === 0 ? 'ha' : 'yo‘q';
  }
}

const nums = (s: string) => new Set((s.match(/\d+/g) ?? []).map(Number));

function verifySpec(lessonId: string, grade: 1 | 2 | 3 | 4, spec: GeneratorSpec, where: string, errors: string[]) {
  for (const e of validateSpecForGrade(spec, grade)) errors.push(`${lessonId} ${where}: ${e}`);
  for (let i = 0; i < SAMPLES; i++) {
    const ex = generateExercise(lessonId, spec, `verify-${i}`);
    const expected = oracle(ex);
    const actual = ex.answer.value;
    if (expected !== actual) errors.push(`${lessonId} ${where}#${i}: javob ${actual} ≠ orakul ${expected} (${ex.prompt})`);
    if (typeof expected === 'number' && (!Number.isInteger(expected) || expected < 0))
      errors.push(`${lessonId} ${where}#${i}: javob butun musbat son emas (${expected})`);
    if (!ex.choices.includes(String(actual))) errors.push(`${lessonId} ${where}#${i}: variantlar orasida to'g'ri javob yo'q`);
    if (new Set(ex.choices).size !== ex.choices.length) errors.push(`${lessonId} ${where}#${i}: takrorlangan variantlar`);
    if (typeof actual === 'number') {
      const promptNums = nums(ex.prompt);
      ex.hints.forEach((h, hi) => {
        if (nums(h).has(actual) && !promptNums.has(actual))
          errors.push(`${lessonId} ${where}#${i}: ${hi + 1}-ishora javobni (${actual}) oshkor qiladi: "${h}"`);
        if (new RegExp(`=\\s*${actual}(?!\\d)`).test(h) && !promptNums.has(actual))
          errors.push(`${lessonId} ${where}#${i}: ishorada "= ${actual}"`);
      });
      if (!ex.solution.join(' ').includes(String(actual))) errors.push(`${lessonId} ${where}#${i}: yechimda javob yo'q`);
    }
  }
}

export function buildCatalog(): { catalog: Catalog; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sources = readYaml(join(CUR, 'sources.yaml')).sources;
  const subjects = readYaml(join(CUR, 'subjects.yaml')).subjects;
  const map = walk(join(CUR, 'map'))
    .sort()
    .flatMap((f) => expandMap(readYaml(f) as MapFile));
  const lessons = walk(join(CUR, 'lessons'))
    .sort()
    .map((f) => readYaml(f));

  const mapById = new Map(map.map((m) => [m.id, m]));
  for (const l of lessons) {
    const m = mapById.get(l.map_id);
    if (!m) {
      errors.push(`${l.id}: map_id "${l.map_id}" xaritada topilmadi`);
      continue;
    }
    if (m.grade !== l.grade || m.term !== l.term || m.subject !== l.subject) errors.push(`${l.id}: sinf/chorak/fan xarita bilan mos emas`);
    if (m.source_id !== l.source_id) errors.push(`${l.id}: manba xarita bilan mos emas`);
    if (m.detailed_lesson_id) errors.push(`${l.map_id}: ikki marta bog'langan`);
    m.detailed_lesson_id = l.id;
  }

  const ver = Math.max(...lessons.map((l) => Date.parse(l.ai_review?.at ?? '2026-01-01')));
  const candidate = {
    schema_version: 1,
    academic_year: '2026-2027',
    school_language: 'uz-Latn',
    generated_at: new Date(ver).toISOString().slice(0, 10),
    disclaimer:
      'TASDIQLANMAGAN QORALAMA. Mavzular darslik mundarijasidan olingan (faqat nomlar); darslar AI metodist tomonidan yozilgan va o‘qituvchi tomonidan hali tasdiqlanmagan. Rasmiy o‘quv materiali emas.',
    sources,
    subjects,
    map,
    lessons,
  };

  const parsed = CatalogSchema.safeParse(candidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors.push(`schema ${issue.path.join('.')}: ${issue.message}`);
    return { catalog: candidate as unknown as Catalog, errors, warnings };
  }
  const catalog = parsed.data;
  const sourceIds = new Set(catalog.sources.map((s) => s.id));
  for (const m of catalog.map) if (!sourceIds.has(m.source_id)) errors.push(`${m.id}: noma'lum manba ${m.source_id}`);
  for (const s of catalog.sources)
    if (s.rights_status === 'UNKNOWN') warnings.push(`${s.id}: huquq holati noma'lum`);

  for (const l of catalog.lessons) {
    const g = l.grade as 1 | 2 | 3 | 4;
    verifySpec(l.id, g, l.diagnostic as GeneratorSpec, 'diagnostic', errors);
    l.practice.forEach((s, i) => verifySpec(l.id, g, s as GeneratorSpec, `practice[${i}]`, errors));
    l.transfer.forEach((s, i) => verifySpec(l.id, g, s as GeneratorSpec, `transfer[${i}]`, errors));
    const lastStep = l.worked_example.steps[l.worked_example.steps.length - 1] ?? '';
    if (!nums(lastStep).has(l.worked_example.answer)) errors.push(`${l.id}: ishlangan misolning oxirgi qadamida javob (${l.worked_example.answer}) yo'q`);
    if (l.ai_review && Object.values(l.ai_review.checklist).some((v) => !v)) warnings.push(`${l.id}: AI tekshiruv ro'yxatida bajarilmagan band bor`);
    if (l.status === 'DRAFT' && l.human_reviews.length === 0) {
      /* kutilgan holat — o'qituvchi tekshiruvi kutilmoqda */
    }
  }
  return { catalog, errors, warnings };
}

function renderMapDoc(c: Catalog): string {
  const lines: string[] = [
    '# O‘quv dasturi xaritasi — matematika, 1–4-sinf',
    '',
    '> Avtomatik yaratiladi: `pnpm content:build`. Qo‘lda tahrirlamang — `packages/content/curriculum/` dagi YAML fayllarni tahrirlang.',
    '',
    `**Holat:** barcha elementlar \`DRAFT\` — o‘qituvchi tasdiqlamagan. ${c.disclaimer}`,
    '',
    '**Manba:** I.V. Repyova, «Novda Edutainment», Matematika 1–4-sinf (har biri 4 qism). Faqat mavzu nomlari va ketma-ketligi olingan. “Qism = chorak” — taxmin, taqvim-mavzu rejasi bilan tekshirilishi kerak.',
    '',
    '| Belgi | Ma’nosi |',
    '|---|---|',
    '| 📗 | To‘liq dars tayyor (AI metodist qoralamasi) |',
    '| ▫️ | Faqat mavzu (dars hali yozilmagan) |',
    '| ⚠️ | Mundarijada ko‘rinmagan bo‘shliq |',
    '',
  ];
  const lessons = c.lessons.length;
  const total = c.map.filter((m) => m.kind !== 'gap').length;
  lines.push(`Jami: **${total}** mavzu, shundan **${lessons}** tasi uchun to‘liq dars tayyor.`, '');
  for (const g of [1, 2, 3, 4]) {
    lines.push(`## ${g}-sinf`, '');
    for (const t of [1, 2, 3, 4]) {
      const entries = c.map.filter((m) => m.grade === g && m.term === t);
      if (!entries.length) continue;
      const src = c.sources.find((s) => s.id === entries[0]!.source_id);
      lines.push(`### ${t}-chorak — ${src?.title ?? ''} (${entries[0]!.title_quality === 'verbatim' ? 'nomlar mundarija bo‘yicha' : 'nomlar mazmunan tiklangan'})`, '');
      lines.push('| № | Darslikda | Mavzu | Turi | Holat |', '|---|---|---|---|---|');
      for (const m of entries) {
        const icon = m.kind === 'gap' ? '⚠️' : m.detailed_lesson_id ? '📗' : '▫️';
        lines.push(`| ${m.seq} | ${m.textbook_no ?? '—'} | ${m.title} | ${m.kind} | ${icon} ${m.status} |`);
      }
      lines.push('');
    }
  }
  return lines.join('\n') + '\n';
}

const mode = process.argv[2] ?? 'build';
const { catalog, errors, warnings } = buildCatalog();
for (const w of warnings) console.warn(`⚠️  ${w}`);
if (errors.length) {
  for (const e of errors.slice(0, 50)) console.error(`❌ ${e}`);
  console.error(`\n${errors.length} ta xato. Kontent rad etildi.`);
  process.exit(1);
}
const json = JSON.stringify(catalog, null, 1) + '\n';
const doc = renderMapDoc(catalog);
if (mode === 'check') {
  const stale = !existsSync(OUT) || readFileSync(OUT, 'utf8') !== json || !existsSync(DOC) || readFileSync(DOC, 'utf8') !== doc;
  if (stale) {
    console.error('❌ generated/catalog.json yoki docs/CURRICULUM_MAP.md eskirgan. `pnpm content:build` ni ishga tushiring.');
    process.exit(1);
  }
  console.log(`✅ Kontent to'g'ri: ${catalog.map.length} xarita elementi, ${catalog.lessons.length} dars.`);
} else {
  writeFileSync(OUT, json);
  writeFileSync(DOC, doc);
  console.log(`✅ Yozildi: ${catalog.map.length} xarita elementi, ${catalog.lessons.length} dars → generated/catalog.json, docs/CURRICULUM_MAP.md`);
}
