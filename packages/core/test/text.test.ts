import { describe, expect, it } from 'vitest';
import { cyrillicToLatin, normalizeForMatch, toDisplayUz } from '../src/text/normalize';
import { numberToUzWords, parseAnswerNumber } from '../src/text/numbers';

describe("o'zbek matnini normallashtirish (demo muammosi #3)", () => {
  it.each(["bo'l", 'bo‘l', 'boʻl', 'bo’l', 'bo`l', 'boʼl'])('barcha apostrof variantlari bir xil: %s', (v) => {
    expect(normalizeForMatch(v)).toBe("bo'l");
  });
  it('kirillni lotinga o‘giradi', () => {
    expect(cyrillicToLatin('тўрт')).toBe("to'rt");
    expect(cyrillicToLatin('Ғалаба')).toBe("G'alaba");
    expect(normalizeForMatch('ЕЛЬКА')).toBe('yelka');
    expect(normalizeForMatch('12 ни 3 га бўл')).toBe("12 ni 3 ga bo'l");
  });
  it("ko'rsatish uchun o‘ shaklini qaytaradi", () => {
    expect(toDisplayUz("o'n to'rt")).toBe('o‘n to‘rt');
  });
});

describe('bolaning javobidan sonni ajratish', () => {
  it.each([
    ['4', 4],
    ['4 ta', 4],
    ['4ta', 4],
    [' 4. ', 4],
    ["to'rt", 4],
    ['to‘rtta', 4],
    ['tort', 4],
    ['тўрт', 4],
    ['beshtadan', 5],
    ["o'n ikki", 12],
    ['yigirma besh', 25],
    ['yuz', 100],
    ['ikki yuz o‘ttiz', 230],
    ['javob 7', 7],
  ])('%s → %d', (raw, n) => {
    expect(parseAnswerNumber(raw)).toBe(n);
  });
  it.each(['', 'bilmayman', '12 ni 3 ga', '3 yoki 4'])('taxmin qilmaydi: "%s" → null', (raw) => {
    expect(parseAnswerNumber(raw)).toBeNull();
  });
  it("sonni so'z bilan yozadi", () => {
    expect(numberToUzWords(4)).toBe('to‘rt');
    expect(numberToUzWords(56)).toBe('ellik olti');
    expect(numberToUzWords(1999)).toBe('ming to‘qqiz yuz to‘qson to‘qqiz');
  });
});
