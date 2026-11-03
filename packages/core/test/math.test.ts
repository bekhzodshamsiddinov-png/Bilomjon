import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkAnswer, validateSpecForGrade } from '../src/math/check';
import { generateExercise, toPublicExercise } from '../src/math/generators';
import type { GeneratorKind, GeneratorSpec } from '../src/math/types';

const KINDS: GeneratorKind[] = ['mul_fact', 'div_fact', 'missing_factor', 'word_groups', 'word_share', 'times_more', 'times_less', 'mul_div_link', 'table_mixed'];

describe('deterministik matematika dvigateli', () => {
  it('bir xil seed → bir xil masala (qayta tiklanadigan)', () => {
    const spec: GeneratorSpec = { kind: 'div_fact', params: { divisor: 3, quotient: [1, 10] } };
    expect(generateExercise('l', spec, 7)).toEqual(generateExercise('l', spec, 7));
  });

  it('bo‘lish har doim qoldiqsiz va javob butun son (property test)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 9 }), fc.integer({ min: 1, max: 10 }), fc.integer({ min: 1, max: 10 }), fc.nat(), (d, lo, span, seed) => {
        const hi = Math.min(10, lo + span);
        const ex = generateExercise('p', { kind: 'div_fact', params: { divisor: d, quotient: [lo, hi] } }, seed);
        const { a, b } = ex.operands as { a: number; b: number };
        expect(a % b).toBe(0);
        expect(ex.answer).toEqual({ type: 'number', value: a / b });
        expect(a / b).toBeGreaterThanOrEqual(lo);
        expect(a / b).toBeLessThanOrEqual(hi);
      }),
      { numRuns: 300 },
    );
  });

  it.each(KINDS)('%s: to‘g‘ri javob variantlar orasida va dvigatel uni qabul qiladi', (kind) => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateExercise('k', { kind, params: {} }, seed);
      const ans = String(ex.answer.value);
      expect(ex.choices).toContain(ans);
      expect(checkAnswer(ex, ans).status).toBe('correct');
      expect(checkAnswer(ex, `${ans} ta`).status).toBe('correct');
    }
  });

  it('“12 : 3” — xato javobni tanib, xato turini aniqlaydi', () => {
    let ex = generateExercise('x', { kind: 'div_fact', params: { divisor: 3, quotient: [4, 4] } }, 1);
    expect(ex.prompt).toBe('12 : 3 = ?');
    expect(checkAnswer(ex, '4').status).toBe('correct');
    expect(checkAnswer(ex, "to'rt").status).toBe('correct');
    expect(checkAnswer(ex, '9')).toMatchObject({ status: 'incorrect', misconception: 'SUB_INSTEAD_OF_DIV' });
    expect(checkAnswer(ex, '36')).toMatchObject({ status: 'incorrect', misconception: 'MUL_INSTEAD_OF_DIV' });
    expect(checkAnswer(ex, 'bilmayman').status).toBe('unparseable');
    ex = generateExercise('x', { kind: 'mul_fact', params: { factor: 4, other: [3, 3] } }, 1);
    expect(checkAnswer(ex, '7')).toMatchObject({ status: 'incorrect', misconception: 'ADD_INSTEAD_OF_MUL' });
  });

  it('ha/yo‘q savollari', () => {
    const ex = generateExercise('d', { kind: 'divisor_check', params: { divisor: 3, number: [12, 12] } }, 1);
    expect(ex.answer.value).toBe('ha');
    expect(checkAnswer(ex, 'Ha').status).toBe('correct');
    expect(checkAnswer(ex, "yo'q").status).toBe('incorrect');
    expect(checkAnswer(ex, 'balki').status).toBe('unparseable');
  });

  it('mijozga yuboriladigan masalada javob, yechim va xato qiymatlari YO‘Q', () => {
    const ex = generateExercise('x', { kind: 'word_share', params: {} }, 3);
    const pub = toPublicExercise(ex);
    expect(pub).not.toHaveProperty('answer');
    expect(pub).not.toHaveProperty('solution');
    expect(pub).not.toHaveProperty('misconceptions');
  });

  it('ishoralar hech qachon javobni “= javob” ko‘rinishida aytmaydi', () => {
    for (const kind of KINDS)
      for (let s = 0; s < 50; s++) {
        const ex = generateExercise('h', { kind, params: {} }, s);
        for (const h of ex.hints) expect(h).not.toMatch(new RegExp(`=\\s*${ex.answer.value}(?!\\d)`));
      }
  });

  it('kirish uzunligi cheklangan (DoS himoyasi)', () => {
    const ex = generateExercise('x', { kind: 'mul_fact', params: {} }, 1);
    expect(checkAnswer(ex, '1'.repeat(500)).status).toBe('unparseable');
  });
});

describe('sinf darajasi tekshiruvi', () => {
  it('1-sinfda ko‘paytirish ruxsat etilmaydi', () => {
    expect(validateSpecForGrade({ kind: 'mul_fact', params: { factor: 2 } }, 1).length).toBeGreaterThan(0);
  });
  it('2-sinf jadvali 100 dan oshmasligi kerak', () => {
    expect(validateSpecForGrade({ kind: 'mul_fact', params: { factor: 9, other: [1, 10] } }, 2)).toEqual([]);
    expect(validateSpecForGrade({ kind: 'mul_fact', params: { factor: 12, other: [1, 10] } }, 2).length).toBeGreaterThan(0);
  });
});
