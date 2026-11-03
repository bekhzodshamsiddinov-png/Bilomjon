# Amalga oshirish holati

_Oxirgi yangilanish: 2026-11-03 (v0.3.0, 1-bosqich)_

## ✅ Bajarildi

| Talab (CLAUDE_CODE_HANDOFF.md) | Natija |
|---|---|
| 1. Maintainable repo, `/demo` saqlansin | pnpm monorepo; Expo ilova (web+iOS+Android), Hono API, PostgreSQL sxemasi; v0.1 demo `/demo/v0.1.html` va `legacy/` da o'zgarishsiz |
| 2. O'quv yili, ta'lim tili, sinf, fan, chorak, maqsad, mashq + holat metama'lumoti; published-only katalog; faqat UNVERIFIED namunalar | 1–4-sinf matematika xaritasi (16 darslik qismi, 570 element); 2-sinf 3-chorak — 21 ta to'liq dars (DRAFT); `visibilityOf` + API + DB trigger |
| 3. Deterministik matematika dvigateli va skriptli tutor | 10 mashq turi, xato turlarini aniqlash, sinf chegaralari; Bilimjon holat mashinasi (6 bosqich, ishora zinapoyasi, transfer) |
| 4. Demo ota-ona paneli; maxfiylik dizayni va rozilik oqimlari o'chiq bayroq ortida | Simulyatsiya qilingan demo oila (haqiqiy dvigatel orqali), noaniqlik ko'rsatkichi, 10 daqiqalik reja; `FEATURE_CONSENT_FLOW=false`; `db/design/0100_identity_DRAFT.sql` |
| 5. Accessibility, ovoz fallback, testlar, lint, seed/start skriptlari, `.env.example`, CI | axe (WCAG A/AA) e2e; o'zbek ovozi bo'lmasa aniq izoh; vitest/pytest/playwright; `pnpm content:build`; GitHub Actions |
| 6. ADR va holat hujjati, kichik commitlar | `docs/adr/0001–0008`, shu fayl |
| Sifat darvozasi | published-only (API + DB testlari); matematika modelga ishonmaydi (LLM yo'q, orakul); PII/prompt-injection negativ testlari; bola ro'yxatdan o'tishi yo'q; bolaga billing yo'q; rasmiy kontent da'vosi yo'q |

**Testlar:** core 83 · API 13 · DB 7 · kontent kompilyatori (21 dars × spec × 60 seed) · eski paket 3 · e2e 6 (axe bilan).

## ⏳ Bloklangan (tashqi shart kerak)

| Ish | Nima kerak |
|---|---|
| Darslarni `PUBLISHED` qilish | Boshlang'ich sinf o'qituvchisi/metodist tasdig'i (`docs/METHODIST_REVIEW_GUIDE.md`) |
| “Qism = chorak” ni tasdiqlash, 2-sinf 74–97 va 4-sinf 70–71 bo'shliqlari | Respublika ta'lim markazi taqvim-mavzu rejalari (TMR) fayllari |
| Ota-ona hisobi, rozilik, real progress | Yurist xulosasi (shaxsga doir ma'lumotlar, lokalizatsiya), O'zbekistonda xosting |
| Mikrofon / bolalar nutqi | ASR benchmark, ota-ona roziligi |
| Live AI | Pilot natijalari, server tomonida cheklangan integratsiya |
| To'lovlar | Pilot + unit-iqtisodiyot (kodda bloklangan) |
| iOS/Android do'konga chiqarish | Apple Developer va Google Play hisoblari, EAS hisobi |

## Keyingi qadamlar
`docs/PROFESSIONAL_PLAN.md` B-bo'limiga qarang.
