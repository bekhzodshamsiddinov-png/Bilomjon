# v0.1 demodagi muammolar va ularning yechimi

v0.1 demo (`legacy/v0.2-starter/app/index.html`, ilovada `/demo/v0.1.html`) o'zgartirilmasdan tarix sifatida saqlangan.
Quyidagi har bir muammo yangi ilovada hal qilingan va **avtomatik test** bilan himoyalangan.

| # | Muammo (v0.1) | Yechim (v0.3) | Qayerda | Test |
|---|---|---|---|---|
| 1 | Chat “12 ni 3 ga bo‘l” savoliga darhol **“4 ta!”** deb javobni aytardi — pedagogika shartnomasini buzadi | Bilimjon hech qachon natijani aytmaydi: strategiya + ishora zinapoyasi (3 daraja) + mos darsni taklif qiladi. “Javobni ayt” so‘roviga rad javobi va ishora | `packages/core/src/tutor/ask.ts`, `machine.ts` | `safety-ask-parent.test.ts` “javobni (4) AYTMAYDI”; `tutor.test.ts` “javobni ayt”; e2e |
| 2 | `/12\|bo‘l\|bol\|…/` regexi “**bola**” so‘zida ham ishlardi — “bolam kitob o‘qimayapti” → matematika javobi | Niyatlar aniq shablonlar bilan aniqlanadi (`12 ni 3 ga bo'l`, `12 : 3`, `12÷3`, `12/3`, `3 x 4` …); noma’lum savolda taxmin qilinmaydi | `tutor/ask.ts` | “bola so‘zi endi matematika javobini chaqirmaydi” |
| 3 | Faqat `‘` apostrof tanilardi; `o'`, `oʻ`, `o’`, `` o` `` va **kirill** yozuv ishlamasdi | Barcha matn `normalizeForMatch` dan o‘tadi: 7 xil apostrof → bitta, kirill → lotin. Javoblar raqam yoki so‘z bilan: `4`, `4 ta`, `to‘rtta`, `тўрт`, `o‘n ikki` | `core/src/text/normalize.ts`, `numbers.ts` | `text.test.ts` (20+ holat) |
| 4 | “Endi 15 ÷ 3 ni sinab ko‘r” deb aytardi, lekin **tekshirmasdi** — asosiy ko‘rsatkich (yangi masalani mustaqil yechish) o‘lchanmasdi | Har darsda 2 ta **transfer** masala (boshqa kontekst/tur). O‘zlashtirish faqat ularni ishorasiz, birinchi urinishda yechish bilan | `tutor/machine.ts` `computeMastery` | `tutor.test.ts` “transferda ishora ishlatilsa — mastered emas” |
| 5 | `uz-UZ` ovoz yo‘q bo‘lsa brauzer **jim ravishda boshqa tildagi** ovoz bilan o‘qirdi; `alert()` bolaga noqulay | Qurilmada haqiqiy o‘zbekcha ovoz bo‘lsagina “Eshitish” tugmasi; bo‘lmasa aniq izoh. `alert()` yo‘q. Mikrofon bayroq ortida o‘chiq (ASR sinovi va ota-ona ruxsatigacha) | `apps/bilimjon/src/components/speak.tsx` | qo‘lda + ADR-0006 |
| 6 | Accessibility: `aria-pressed` yo‘q, tablar `role=tab` emas, emoji o‘qiladi, inline `onclick` CSP’ni to‘sadi | Radio/tab rollari, `aria-checked/selected`, progressbar qiymatlari, 56px bosish maydoni, ko‘rinadigan fokus, rasmlar uchun matnli tavsif; inline skript yo‘q → qattiq CSP | ilova ekranlari, `scripts/vercel-build.mjs` | e2e: axe (WCAG 2 A/AA) — jiddiy buzilish 0 |
| 7 | Ota-ona paneliga bola bir bosishda kirardi | “Parental gate” (kattalar uchun misol) — App Store/Google Play bolalar toifasi talabi; panel “NAMUNA MA’LUMOT” muhri bilan | `components/parent-gate.tsx` | e2e “ota-ona bo‘limi darvoza ortida” |
| + | 12 ÷ 3 misolida ÷ belgisi | O‘zbekiston darsliklaridagi kabi `:` belgisi ishlatiladi | generatorlar | — |
| + | Javob variantlari tasodifiy edi (3, 4, 6) | Variantlar **tipik xatolardan** yasaladi (12−3=9, 12×3=36, ±1) — xato tanlansa, aynan o‘sha xatoga mos izoh beriladi | `math/generators.ts` | `math.test.ts` |
