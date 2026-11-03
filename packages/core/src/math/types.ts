export type ItemKey = 'olma' | 'qalam' | 'daftar' | 'konfet' | 'kitob' | 'shar' | 'gul' | 'yongoq' | 'non' | 'tuxum';
export type ContainerKey = 'savat' | 'quti' | 'likopcha' | 'xalta' | 'tokcha';
export type RecipientKey = 'bola' | 'savat' | 'quti' | 'likopcha' | 'xalta';

export type Visual =
  | { type: 'groups'; groups: number; perGroup: number; item: ItemKey }
  | { type: 'array'; rows: number; cols: number; item: ItemKey }
  | { type: 'share'; total: number; parts: number; item: ItemKey }
  | { type: 'times'; base: number; times: number; item: ItemKey; direction: 'more' | 'less' };

export type Answer = { type: 'number'; value: number } | { type: 'choice'; value: string };

export type GeneratorKind =
  | 'mul_fact'
  | 'div_fact'
  | 'missing_factor'
  | 'word_groups'
  | 'word_share'
  | 'times_more'
  | 'times_less'
  | 'mul_div_link'
  | 'table_mixed'
  | 'divisor_check';

export type Range = readonly [number, number];
export type NumOrList = number | readonly number[];

export interface GeneratorSpec {
  kind: GeneratorKind;
  /** Generator parametrlari: factor/divisor/k ro'yxati, other/quotient/base oraliqlari. */
  params: {
    factor?: NumOrList;
    divisor?: NumOrList;
    other?: Range;
    quotient?: Range;
    k?: NumOrList;
    base?: Range;
    factors?: readonly number[];
    number?: Range;
  };
  weight?: number;
}

export interface Exercise {
  id: string;
  lessonId: string;
  kind: GeneratorKind;
  prompt: string;
  visual?: Visual;
  /** Ko'p tanlovli javob variantlari (bolaga tugmalar). */
  choices: string[];
  /** FAQAT dvigatel/server ichida. Mijozga `toPublicExercise` orqali yuboriladi. */
  answer: Answer;
  operands: Record<string, number>;
  /** Ishoralar zinapoyasi — hech qachon yakuniy javobni o'z ichiga olmaydi. */
  hints: string[];
  /** Bosqichma-bosqich yechim — faqat 3 marta xato qilinganda yoki xulosada. */
  solution: string[];
  /** Tipik xato qiymatlari → xato kodi (maqsadli izoh uchun). */
  misconceptions: { value: string; code: MisconceptionCode }[];
}

export type PublicExercise = Omit<Exercise, 'answer' | 'solution' | 'misconceptions'>;

export type MisconceptionCode =
  | 'ADD_INSTEAD_OF_MUL'
  | 'SUB_INSTEAD_OF_DIV'
  | 'MUL_INSTEAD_OF_DIV'
  | 'GROUP_COUNT_OFF'
  | 'COUNTING_SLIP'
  | 'ADD_INSTEAD_OF_TIMES'
  | 'SUB_INSTEAD_OF_TIMES'
  | 'WRONG_DIRECTION'
  | 'GAVE_PRODUCT'
  | 'DIVISIBILITY_GUESS';

export type CheckStatus = 'correct' | 'incorrect' | 'unparseable';

export interface CheckResult {
  status: CheckStatus;
  /** Bolaning javobi qanday tushunildi (normallashtirilgan). */
  understood: string | null;
  misconception?: MisconceptionCode;
}
