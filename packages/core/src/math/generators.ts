import { createRng, type Rng } from '../random';
import type {
  ContainerKey,
  Exercise,
  GeneratorKind,
  GeneratorSpec,
  ItemKey,
  MisconceptionCode,
  NumOrList,
  Range,
  RecipientKey,
} from './types';

/** Buyumlar: nomi, emoji. Hammasi kundalik, madaniy jihatdan neytral narsalar. */
export const ITEMS: Record<ItemKey, { name: string; emoji: string }> = {
  olma: { name: 'olma', emoji: '🍎' },
  qalam: { name: 'qalam', emoji: '✏️' },
  daftar: { name: 'daftar', emoji: '📒' },
  konfet: { name: 'konfet', emoji: '🍬' },
  kitob: { name: 'kitob', emoji: '📘' },
  shar: { name: 'shar', emoji: '🎈' },
  gul: { name: 'gul', emoji: '🌷' },
  yongoq: { name: 'yong‘oq', emoji: '🌰' },
  non: { name: 'non', emoji: '🫓' },
  tuxum: { name: 'tuxum', emoji: '🥚' },
};
// O'zbek kelishik qo'shimchalari qo'lda yozilgan (avtomatik morfologiya xato berishi mumkin).
const CONTAINERS: Record<ContainerKey, { loc: string; nom: string }> = {
  savat: { nom: 'savat', loc: 'savatda' },
  quti: { nom: 'quti', loc: 'qutida' },
  likopcha: { nom: 'likopcha', loc: 'likopchada' },
  xalta: { nom: 'xalta', loc: 'xaltada' },
  tokcha: { nom: 'tokcha', loc: 'tokchada' },
};
const RECIPIENTS: Record<RecipientKey, { dat: string; plural: string; each: string; verb: string; got: string; give: string }> = {
  bola: { dat: 'bolaga', plural: 'bola', each: 'har bir bolaga', verb: 'teng bo‘lib berishdi', got: 'tegdi', give: 'bittadan berib chiq' },
  savat: { dat: 'savatga', plural: 'savat', each: 'har bir savatga', verb: 'teng qilib joylashtirishdi', got: 'tushdi', give: 'bittadan solib chiq' },
  quti: { dat: 'qutiga', plural: 'quti', each: 'har bir qutiga', verb: 'teng qilib joylashtirishdi', got: 'tushdi', give: 'bittadan solib chiq' },
  likopcha: { dat: 'likopchaga', plural: 'likopcha', each: 'har bir likopchaga', verb: 'teng qilib qo‘yishdi', got: 'tushdi', give: 'bittadan solib chiq' },
  xalta: { dat: 'xaltaga', plural: 'xalta', each: 'har bir xaltaga', verb: 'teng qilib solishdi', got: 'tushdi', give: 'bittadan solib chiq' },
};

const ITEM_KEYS = Object.keys(ITEMS) as ItemKey[];
const CONTAINER_KEYS = Object.keys(CONTAINERS) as ContainerKey[];
const RECIPIENT_KEYS = Object.keys(RECIPIENTS) as RecipientKey[];

function listOf(v: NumOrList | undefined, fallback: readonly number[]): readonly number[] {
  if (v === undefined) return fallback;
  return typeof v === 'number' ? [v] : v;
}
function rangeOf(v: Range | undefined, fallback: Range): Range {
  return v ?? fallback;
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Draft = Omit<Exercise, 'id' | 'lessonId' | 'kind' | 'choices'> & { choicePool?: number[] };

function mis(pairs: [number, MisconceptionCode][], answer: number): Exercise['misconceptions'] {
  const seen = new Set<number>([answer]);
  const out: Exercise['misconceptions'] = [];
  for (const [v, code] of pairs) {
    if (v >= 0 && Number.isInteger(v) && !seen.has(v)) {
      seen.add(v);
      out.push({ value: String(v), code });
    }
  }
  return out;
}

const generators: Record<GeneratorKind, (rng: Rng, p: GeneratorSpec['params']) => Draft> = {
  mul_fact(rng, p) {
    const b = rng.pick(listOf(p.factor, [2, 3, 4, 5]));
    const [lo, hi] = rangeOf(p.other, [1, 10]);
    const a = rng.int(lo, hi);
    const prod = a * b;
    const item = rng.pick(ITEM_KEYS);
    return {
      prompt: `${a} × ${b} = ?`,
      visual: { type: 'array', rows: a, cols: b, item },
      answer: { type: 'number', value: prod },
      operands: { a, b },
      hints: [
        `${a} × ${b} — bu ${b} ni ${a} marta qo‘shish degani.`,
        `Qo‘shib chiq: ${Array.from({ length: Math.min(a, 10) }, () => b).join(' + ')}.`,
        a > 1
          ? `${b} tadan sanab bor: ${Array.from({ length: Math.min(a - 1, 3) }, (_, i) => b * (i + 1)).join(', ')}, … — jami ${a} ta qadam qil.`
          : `Bitta guruh bor, unda ${b} ta buyum. Nechta bo‘ladi?`,
      ],
      solution: [
        `${a} × ${b} — ${a} ta guruh, har birida ${b} tadan.`,
        `${Array.from({ length: a }, () => b).join(' + ')} = ${prod}.`,
        `Demak, ${a} × ${b} = ${prod}.`,
      ],
      misconceptions: mis(
        [
          [a + b, 'ADD_INSTEAD_OF_MUL'],
          [prod - b, 'GROUP_COUNT_OFF'],
          [prod + b, 'GROUP_COUNT_OFF'],
          [prod + 1, 'COUNTING_SLIP'],
          [prod - 1, 'COUNTING_SLIP'],
        ],
        prod,
      ),
    };
  },

  div_fact(rng, p) {
    const b = rng.pick(listOf(p.divisor, [2, 3, 4, 5]));
    const [lo, hi] = rangeOf(p.quotient, [1, 10]);
    const q = rng.int(lo, hi);
    const a = q * b;
    const item = rng.pick(ITEM_KEYS);
    return {
      prompt: `${a} : ${b} = ?`,
      visual: { type: 'share', total: a, parts: b, item },
      answer: { type: 'number', value: q },
      operands: { a, b },
      hints: [
        `${a} ta buyumni ${b} ta teng guruhga ajratayapmiz, deb tasavvur qil.`,
        `Har bir guruhga bittadan qo‘yib chiq, ${a} ta tugaguncha davom et. Bitta guruhda nechta bo‘ldi?`,
        `Ko‘paytirishni esla: ? × ${b} = ${a}. Qaysi son mos keladi?`,
      ],
      solution: [
        `${a} ta buyumni ${b} guruhga bittadan tarqatamiz.`,
        `Har bir guruhda ${q} tadan bo‘ldi.`,
        `Tekshiramiz: ${q} × ${b} = ${a}. Demak, ${a} : ${b} = ${q}.`,
      ],
      misconceptions: mis(
        [
          [a - b, 'SUB_INSTEAD_OF_DIV'],
          [a * b, 'MUL_INSTEAD_OF_DIV'],
          [q + 1, 'COUNTING_SLIP'],
          [q - 1, 'COUNTING_SLIP'],
        ],
        q,
      ),
    };
  },

  missing_factor(rng, p) {
    const b = rng.pick(listOf(p.factor, [2, 3, 4, 5]));
    const [lo, hi] = rangeOf(p.other, [1, 10]);
    const x = rng.int(lo, hi);
    const prod = x * b;
    const left = rng.next() < 0.5;
    return {
      prompt: left ? `? × ${b} = ${prod}` : `${b} × ? = ${prod}`,
      answer: { type: 'number', value: x },
      operands: { b, prod },
      hints: [
        `Qaysi sonni ${b} ga ko‘paytirsak ${prod} chiqadi?`,
        `${b} tadan sanab bor, ${prod} ga yetguncha. Nechta qadam qilding?`,
        `Bo‘lish yordam beradi: ${prod} : ${b} = ?`,
      ],
      solution: [`${prod} : ${b} = ${x}.`, `Tekshiramiz: ${x} × ${b} = ${prod}.`],
      misconceptions: mis(
        [
          [prod, 'GAVE_PRODUCT'],
          [prod - b, 'SUB_INSTEAD_OF_DIV'],
          [x + 1, 'COUNTING_SLIP'],
          [x - 1, 'COUNTING_SLIP'],
        ],
        x,
      ),
    };
  },

  word_groups(rng, p) {
    const per = rng.pick(listOf(p.factor, [2, 3, 4, 5]));
    const [lo, hi] = rangeOf(p.other, [2, 9]);
    const groups = rng.int(lo, hi);
    const total = groups * per;
    const itemKey = rng.pick(ITEM_KEYS);
    const item = ITEMS[itemKey];
    const c = CONTAINERS[rng.pick(CONTAINER_KEYS)];
    return {
      prompt: `${groups} ta ${c.nom}ning har birida ${per} tadan ${item.name} bor. Hammasi bo‘lib nechta ${item.name} bor?`,
      visual: { type: 'groups', groups, perGroup: per, item: itemKey },
      answer: { type: 'number', value: total },
      operands: { groups, per },
      hints: [
        `Nechta ${c.nom} bor? Har birida nechtadan ${item.name}?`,
        `Bir xil sonlarni qo‘shamiz: ${Array.from({ length: Math.min(groups, 10) }, () => per).join(' + ')}.`,
        `Buni ko‘paytirish bilan yozish mumkin: ${groups} × ${per}.`,
      ],
      solution: [
        `${groups} ta ${c.nom}, har birida ${per} tadan.`,
        `${groups} × ${per} = ${total}.`,
        `Javob: ${total} ta ${item.name}.`,
      ],
      misconceptions: mis(
        [
          [groups + per, 'ADD_INSTEAD_OF_MUL'],
          [total - per, 'GROUP_COUNT_OFF'],
          [total + per, 'GROUP_COUNT_OFF'],
        ],
        total,
      ),
    };
  },

  word_share(rng, p) {
    const parts = rng.pick(listOf(p.divisor, [2, 3, 4, 5]));
    const [lo, hi] = rangeOf(p.quotient, [2, 9]);
    const q = rng.int(lo, hi);
    const total = q * parts;
    const itemKey = rng.pick(ITEM_KEYS);
    const item = ITEMS[itemKey];
    const r = RECIPIENTS[rng.pick(RECIPIENT_KEYS)];
    return {
      prompt: `${total} ta ${item.name}ni ${parts} ta ${r.dat} ${r.verb}. ${cap(r.each)} nechta ${item.name} ${r.got}?`,
      visual: { type: 'share', total, parts, item: itemKey },
      answer: { type: 'number', value: q },
      operands: { total, parts },
      hints: [
        `Hammasi nechta ${item.name}? Nechta ${r.plural}ga bo‘linyapti?`,
        `${parts} ta ${r.dat} ${r.give}. ${total} ta tugaguncha davom et.`,
        `Bu bo‘lish masalasi: ${total} : ${parts}. Ko‘paytirishni esla: ? × ${parts} = ${total}.`,
      ],
      solution: [
        `${total} ta ${item.name}ni ${parts} ta teng qismga bo‘lamiz: ${total} : ${parts}.`,
        `${total} : ${parts} = ${q}, chunki ${q} × ${parts} = ${total}.`,
        `Javob: ${r.each} ${q} tadan ${item.name}.`,
      ],
      misconceptions: mis(
        [
          [total - parts, 'SUB_INSTEAD_OF_DIV'],
          [total * parts, 'MUL_INSTEAD_OF_DIV'],
          [q + 1, 'COUNTING_SLIP'],
          [q - 1, 'COUNTING_SLIP'],
        ],
        q,
      ),
    };
  },

  times_more(rng, p) {
    const k = rng.pick(listOf(p.k, [2, 3, 4, 5]));
    const [lo, hi] = rangeOf(p.base, [2, 9]);
    const base = rng.int(lo, hi);
    const res = base * k;
    const itemKey = rng.pick(ITEM_KEYS);
    const item = ITEMS[itemKey];
    const [c1, c2] = rng.shuffle(CONTAINER_KEYS).map((key) => CONTAINERS[key]);
    return {
      prompt: `${cap(c1!.loc)} ${base} ta ${item.name} bor. ${cap(c2!.loc)} undan ${k} marta ko‘p ${item.name} bor. ${cap(c2!.loc)} nechta ${item.name} bor?`,
      visual: { type: 'times', base, times: k, item: itemKey, direction: 'more' },
      answer: { type: 'number', value: res },
      operands: { base, k },
      hints: [
        `“${k} marta ko‘p” — bu ${base} ta ${item.name} ${k} marta takrorlanadi degani.`,
        `${Array.from({ length: k }, () => base).join(' + ')} ni hisobla.`,
        `“Marta ko‘p” bo‘lsa — ko‘paytiramiz: ${base} × ${k}.`,
      ],
      solution: [`${k} marta ko‘p — ko‘paytirish: ${base} × ${k} = ${res}.`, `Javob: ${res} ta ${item.name}.`],
      misconceptions: mis(
        [
          [base + k, 'ADD_INSTEAD_OF_TIMES'],
          [Number.isInteger(base / k) ? base / k : -1, 'WRONG_DIRECTION'],
        ],
        res,
      ),
    };
  },

  times_less(rng, p) {
    const k = rng.pick(listOf(p.k, [2, 3, 4, 5]));
    const [lo, hi] = rangeOf(p.base, [2, 9]);
    const res = rng.int(lo, hi);
    const big = res * k;
    const itemKey = rng.pick(ITEM_KEYS);
    const item = ITEMS[itemKey];
    const [c1, c2] = rng.shuffle(CONTAINER_KEYS).map((key) => CONTAINERS[key]);
    return {
      prompt: `${cap(c1!.loc)} ${big} ta ${item.name} bor. ${cap(c2!.loc)} undan ${k} marta kam ${item.name} bor. ${cap(c2!.loc)} nechta ${item.name} bor?`,
      visual: { type: 'times', base: big, times: k, item: itemKey, direction: 'less' },
      answer: { type: 'number', value: res },
      operands: { big, k },
      hints: [
        `“${k} marta kam” — ${big} ta ${item.name}ni ${k} ta teng qismga bo‘lib, bitta qismini olamiz.`,
        `? × ${k} = ${big}. Qaysi son mos keladi?`,
        `“Marta kam” bo‘lsa — bo‘lamiz: ${big} : ${k}.`,
      ],
      solution: [`${k} marta kam — bo‘lish: ${big} : ${k} = ${res}.`, `Javob: ${res} ta ${item.name}.`],
      misconceptions: mis(
        [
          [big - k, 'SUB_INSTEAD_OF_TIMES'],
          [big * k, 'WRONG_DIRECTION'],
        ],
        res,
      ),
    };
  },

  mul_div_link(rng, p) {
    const b = rng.pick(listOf(p.factor, [2, 3, 4, 5, 6, 7, 8, 9]));
    const [lo, hi] = rangeOf(p.other, [2, 9]);
    const a = rng.int(lo, hi);
    const prod = a * b;
    const askA = rng.next() < 0.5;
    const divisor = askA ? b : a;
    const ans = askA ? a : b;
    return {
      prompt: `${a} × ${b} = ${prod}. Unda ${prod} : ${divisor} = ?`,
      answer: { type: 'number', value: ans },
      operands: { a, b, prod },
      hints: [
        `Ko‘paytirish va bo‘lish — bir-biriga teskari amallar.`,
        `${prod} — bu ko‘paytma. Uni ko‘paytuvchilardan biriga bo‘lsak, ikkinchisi chiqadi.`,
        `${a} × ${b} = ${prod} tengligiga qara: ${divisor} dan boshqa ko‘paytuvchi qaysi?`,
      ],
      solution: [`${a} × ${b} = ${prod}, demak ${prod} : ${divisor} = ${ans}.`],
      misconceptions: mis(
        [
          [prod, 'GAVE_PRODUCT'],
          [divisor, 'COUNTING_SLIP'],
          [prod - divisor, 'SUB_INSTEAD_OF_DIV'],
        ],
        ans,
      ),
    };
  },

  table_mixed(rng, p) {
    const factors = p.factors ?? [2, 3, 4, 5, 6, 7, 8, 9];
    const sub = rng.next() < 0.5 ? 'mul_fact' : 'div_fact';
    const other = rangeOf(p.other, [1, 10]);
    return sub === 'mul_fact'
      ? generators.mul_fact(rng, { factor: factors, other })
      : generators.div_fact(rng, { divisor: factors, quotient: other });
  },

  divisor_check(rng, p) {
    const d = rng.pick(listOf(p.divisor, [2, 3, 4, 5]));
    const [lo, hi] = rangeOf(p.number, [6, 40]);
    // Taxminan yarmi bo'linadigan bo'lishi uchun
    let n = rng.int(lo, hi);
    if (rng.next() < 0.5) {
      const q = Math.max(1, Math.round(n / d));
      if (q * d >= lo && q * d <= hi) n = q * d;
    }
    const yes = n % d === 0;
    const q = Math.floor(n / d);
    return {
      prompt: `${n} soni ${d} ga qoldiqsiz bo‘linadimi?`,
      answer: { type: 'choice', value: yes ? 'ha' : 'yo‘q' },
      operands: { n, d },
      hints: [
        `${n} ta buyumni ${d} ta teng guruhga ajratib ko‘r. Ortib qolgani bormi?`,
        `${d} tadan sanab bor: ${d}, ${d * 2}, ${d * 3}, … ${n} soni shu qatorda uchraydimi?`,
        `${d} × ${q} = ${d * q} va ${d} × ${q + 1} = ${d * (q + 1)}. ${n} shu sonlardan biriga tengmi?`,
      ],
      solution: yes
        ? [`${d} × ${q} = ${n}, demak ${n} soni ${d} ga qoldiqsiz bo‘linadi. Javob: ha.`]
        : [`${d} × ${q} = ${d * q}, ${n} − ${d * q} = ${n - d * q} ortib qoladi. Javob: yo‘q.`],
      misconceptions: [{ value: yes ? 'yo‘q' : 'ha', code: 'DIVISIBILITY_GUESS' }],
    };
  },
};

export function generateExercise(lessonId: string, spec: GeneratorSpec, seed: string | number): Exercise {
  const rng = createRng(`${lessonId}|${spec.kind}|${seed}`);
  const gen = generators[spec.kind];
  if (!gen) throw new Error(`Noma'lum mashq turi: ${spec.kind}`);
  const d = gen(rng, spec.params);
  const choices = buildChoices(d, rng);
  return {
    id: `${lessonId}:${spec.kind}:${seed}`,
    lessonId,
    kind: spec.kind,
    prompt: d.prompt,
    ...(d.visual ? { visual: d.visual } : {}),
    choices,
    answer: d.answer,
    operands: d.operands,
    hints: d.hints,
    solution: d.solution,
    misconceptions: d.misconceptions,
  };
}

function buildChoices(d: Draft, rng: Rng): string[] {
  if (d.answer.type === 'choice') return ['ha', 'yo‘q'];
  const ans = d.answer.value;
  const pool = new Set<number>([ans]);
  for (const m of d.misconceptions) {
    if (pool.size >= 4) break;
    pool.add(Number(m.value));
  }
  let delta = 1;
  while (pool.size < 4 && delta < 20) {
    if (ans + delta >= 0) pool.add(ans + delta);
    if (pool.size < 4 && ans - delta >= 0) pool.add(ans - delta);
    delta++;
  }
  return rng.shuffle([...pool].slice(0, 4)).map(String);
}

/** Mijozga yuboriladigan shakl: to'g'ri javob, yechim va xato qiymatlari olib tashlanadi. */
export function toPublicExercise(ex: Exercise): Omit<Exercise, 'answer' | 'solution' | 'misconceptions'> {
  const { answer: _a, solution: _s, misconceptions: _m, ...pub } = ex;
  return pub;
}

/** Spetsifikatsiyaning eng katta mumkin bo'lgan sonini hisoblaydi (sinf chegarasini tekshirish uchun). */
export function maxNumberOfSpec(spec: GeneratorSpec): number {
  const p = spec.params;
  const mx = (v: NumOrList | undefined, f: number[]) => Math.max(...listOf(v, f));
  const hi = (r: Range | undefined, f: Range) => rangeOf(r, f)[1];
  switch (spec.kind) {
    case 'mul_fact':
    case 'missing_factor':
      return mx(p.factor, [2, 3, 4, 5]) * hi(p.other, [1, 10]);
    case 'word_groups':
      return mx(p.factor, [2, 3, 4, 5]) * hi(p.other, [2, 9]);
    case 'mul_div_link':
      return mx(p.factor, [2, 3, 4, 5, 6, 7, 8, 9]) * hi(p.other, [2, 9]);
    case 'div_fact':
      return mx(p.divisor, [2, 3, 4, 5]) * hi(p.quotient, [1, 10]);
    case 'word_share':
      return mx(p.divisor, [2, 3, 4, 5]) * hi(p.quotient, [2, 9]);
    case 'times_more':
    case 'times_less':
      return mx(p.k, [2, 3, 4, 5]) * hi(p.base, [2, 9]);
    case 'table_mixed':
      return Math.max(...(p.factors ?? [9])) * hi(p.other, [1, 10]);
    case 'divisor_check':
      return hi(p.number, [6, 40]);
  }
}
