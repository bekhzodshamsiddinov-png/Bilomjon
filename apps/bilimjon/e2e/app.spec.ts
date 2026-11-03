import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Masala matnidan javobni hisoblaydigan test "o'quvchisi" (UI orqali to'liq oqimni sinash uchun). */
function solve(prompt: string): string {
  const n = (prompt.match(/\d+/g) ?? []).map(Number);
  if (/qoldiqsiz bo‘linadimi/.test(prompt)) return n[0]! % n[1]! === 0 ? 'ha' : 'yo‘q';
  if (/Unda \d+ : \d+ = \?/.test(prompt)) return String(n[3]! / n[4]!);
  if (/^\? × \d+ = \d+$/.test(prompt) || /^\d+ × \? = \d+$/.test(prompt)) return String(n[1]! / n[0]!);
  if (/^\d+ × \d+ = \?$/.test(prompt)) return String(n[0]! * n[1]!);
  if (/^\d+ : \d+ = \?$/.test(prompt)) return String(n[0]! / n[1]!);
  if (/marta ko‘p/.test(prompt)) return String(n[0]! * n[1]!);
  if (/marta kam/.test(prompt)) return String(n[0]! / n[1]!);
  if (/har birida/.test(prompt)) return String(n[0]! * n[1]!);
  return String(n[0]! / n[1]!); // teng bo'lish
}

async function seriousViolations(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return r.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious').map((v) => `${v.id}: ${v.help} ${v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' ' + (n.any[0]?.message ?? '')).join(' | ')}`);
}

test('bosh sahifa: demo yorlig‘i, sinf va 2-sinf 3-chorak darslari', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('demo-banner')).toContainText('haqiqiy AI emas');
  await page.getByTestId('grade-2').click();
  await page.getByTestId('term-3').click();
  await expect(page.getByTestId('lesson-l-mat-2-3-098')).toBeVisible();
  await page.getByTestId('grade-1').click();
  await expect(page.getByTestId('topic-list')).toContainText('Narsalarning xossalari');
  expect(await seriousViolations(page)).toEqual([]);
});

test('to‘liq dars: to‘g‘ri javoblar bilan xulosaga yetadi', async ({ page }) => {
  await page.goto('/lesson/l-mat-2-3-098');
  for (let i = 0; i < 20; i++) {
    if (await page.getByTestId('summary-card').isVisible()) break;
    if (await page.getByTestId('continue').isVisible()) {
      await page.getByTestId('continue').click();
      continue;
    }
    const prompt = await page.getByTestId('exercise-prompt').innerText();
    await page.getByTestId('answer-input').fill(solve(prompt));
    await page.getByTestId('send').click();
  }
  await expect(page.getByTestId('summary-card')).toContainText('o‘zlashtirildi');
  expect(await seriousViolations(page)).toEqual([]);
});

test('xato javob → ishora; javob oshkor qilinmaydi', async ({ page }) => {
  await page.goto('/lesson/l-mat-2-3-100');
  const diag = await page.getByTestId('exercise-prompt').innerText();
  await page.getByTestId('answer-input').fill(solve(diag));
  await page.getByTestId('send').click();
  await page.getByTestId('continue').click();
  const prompt = await page.getByTestId('exercise-prompt').innerText();
  await page.getByTestId('answer-input').fill('999');
  await page.getByTestId('send').click();
  await expect(page.getByTestId('hint-card').last()).toBeVisible();
  await expect(page.getByTestId('hint-card').last()).not.toContainText(`= ${solve(prompt)}`);
});

test('Bilimjondan so‘ra: javobni aytmaydi, shaxsiy savolni rad etadi', async ({ page }) => {
  await page.goto('/ask');
  await page.getByTestId('ask-input').fill("12 ni 3 ga bo'lishni tushuntir");
  await page.getByTestId('ask-send').click();
  const reply = page.getByTestId('ask-reply-math_division');
  await expect(reply).toBeVisible();
  expect(await reply.innerText()).not.toMatch(/\b4\b/);
  await page.getByTestId('ask-input').fill('mening maktabim qayerda');
  await page.getByTestId('ask-send').click();
  await expect(page.getByTestId('ask-reply-safety')).toContainText('ota-onangdan');
});

test('ota-ona bo‘limi darvoza ortida va NAMUNA deb belgilangan', async ({ page }) => {
  await page.goto('/parent');
  await expect(page.getByTestId('parent-gate')).toBeVisible();
  await page.getByTestId('gate-input').fill('1');
  await page.getByTestId('gate-submit').click();
  await expect(page.getByTestId('parent-gate')).toBeVisible();
  const q = await page.getByTestId('gate-question').innerText();
  const [a, b] = (q.match(/\d+/g) ?? []).map(Number);
  await page.getByTestId('gate-input').fill(String(a! * b!));
  await page.getByTestId('gate-submit').click();
  await expect(page.getByTestId('parent-demo-note')).toContainText('NAMUNA');
  expect(await seriousViolations(page)).toEqual([]);
});

test('eski v0.1 demo saqlangan', async ({ page }) => {
  await page.goto('/demo/v0.1.html');
  await expect(page.locator('body')).toContainText('haqiqiy AI emas');
});
