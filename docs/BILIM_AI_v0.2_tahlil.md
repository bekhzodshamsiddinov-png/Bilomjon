# BILIM AI v0.2 — texnik tahlil va 1-bosqich rejasi
Muallif: Claude (Lead Software Engineer / AI Architect roli) · 2026-10-29 · Holat: taklif, tasdiqlash kutilmoqda

## 1. Paketda aslida nima bor (inventar)

| Qism | Holat | Baho |
|---|---|---|
| `app/index.html` (10 KB) | Ishlaydigan oflayn demo: sinf tanlash, 10 fan plitkasi, 1 ta matematika mashqi, skriptli chat, ovoz (brauzerga bog'liq), ota-ona paneli (statik raqamlar) | Konsepsiya uchun yaxshi; kod sifatida qayta ishlatib bo'lmaydi |
| `docs/*` (9 ta hujjat) | PRD, strategiya, pedagogika/xavfsizlik shartnomasi, o'quv dasturini tekshirish protokoli, user story, tadqiqot rejasi, backlog | Juda kuchli — xavfsizlik va halollik tamoyillari to'g'ri qo'yilgan |
| `spec/schema.sql` | 4 jadval, migratsiya yo'q | Yo'nalish to'g'ri, lekin bo'shliqlar bor (3-bo'lim) |
| `spec/api.openapi.yaml` | 5 ta endpoint, faqat kontrakt | Juda tor; ota-ona va mavzular ro'yxati yo'q |
| `spec/sample_content.json` | 1 ta mashq (12÷3, 15÷3) | DRAFT deb to'g'ri belgilangan |
| `tests/` | 3 ta statik test (fayllarda matn borligini tekshiradi) | Hammasi o'tadi; lekin xatti-harakatni sinamaydi |

Backend, ma'lumotlar bazasi, autentifikatsiya, haqiqiy AI, to'lov — **yo'q** (hujjatlarda ham halol aytilgan).

## 2. Demodagi aniq muammolar (saqlab, `/demo` sifatida qoldiramiz, lekin bilib turamiz)

1. **Pedagogika shartnomasini buzadi:** chat "12 ni 3 ga bo'l" savoliga darhol "4 ta!" deb javobni aytib qo'yadi. `PEDAGOGY_AND_SAFETY.md` esa javobni yashirib, bosqichma-bosqich ishora berishni talab qiladi.
2. **Noto'g'ri niyat aniqlash:** `/12|bo‘l|bol|.../` regexi "bola" so'zida ham ishlaydi — "bolam kitob o'qimayapti" degan gapga ham matematika javobi chiqadi.
3. **O'zbek apostrofi muammosi:** kod faqat `‘` belgisini kutadi. Bolalar va ota-onalar `o'`, `o`'`, `oʻ`, `o’` yozadi, ko'pchilik hali kirillda yozadi. Javob tekshirgich va matn moslash uchun **normalizatsiya qatlami majburiy** (lotin/kirill, barcha apostrof variantlari).
4. **Transfer topshiriq yo'q:** "Endi 15÷3 ni sinab ko'r" deydi, lekin uni tekshirish imkoni yo'q — asosiy north-star metrika (yangi masalani mustaqil yechish) demoda o'lchanmaydi.
5. **Ovoz:** `uz-UZ` nutqni tanish ko'p brauzerlarda yo'q; o'zbek TTS ovozi topilmasa, brauzer jim ravishda boshqa tildagi ovoz bilan o'qiydi. `alert()` bolalar uchun yomon UX.
6. **Accessibility:** tugmalarda `aria-pressed` yo'q, tablar `role="tab"` emas, emoji ekran o'quvchida o'qiladi, inline `onclick` qattiq CSP qo'yishga to'sqinlik qiladi.
7. Ota-ona paneliga bola bir bosishda kiradi — demoda mayli, mahsulotda "ota-ona darvozasi" kerak.

## 3. Sxema va API dagi bo'shliqlar

- **Ota-ona qo'llanmasi uchun jadval yo'q** — holbuki strategiyadagi asosiy farqlovchi xususiyat "bola darsi + o'sha maqsadga bog'langan ota-ona qo'llanmasi". Bu `parent_guides` sifatida birinchi darajali obyekt bo'lishi kerak.
- `exercises` da `review_status` yo'q → nashr qilingan dars ichiga tekshirilmagan mashq tushib qolishi mumkin. Har bir kontent birligi o'z holatiga ega bo'lishi kerak.
- Chorak/bo'lim/maqsad alohida jadval emas (`unit_key TEXT`, darsda bitta `objective`). Bir dars bir nechta maqsadga, bir maqsad bir nechta darsga bog'lanishi kerak.
- Tasdiqlash tarixi (kim, qachon, qaysi holatdan qaysiga) yo'q — faqat oxirgi `reviewer_ref`. Audit uchun `review_events` jadvali kerak.
- Ishoralar zinapoyasi, tipik xatolar (misconceptions) uchun joy yo'q — Bilimjonning asosiy "aqli" aynan shu yerda.
- Holat mashinasi faqat `PUBLISHED` uchun tekshiriladi; noto'g'ri o'tishlar (DRAFT → PUBLISHED) bazada to'xtatilmaydi.
- API: mavzular/darslar ro'yxati, tutor sessiyasi va ota-ona endpointlari yo'q; tutor `state` erkin matn — mijozdan kelgan holatga ishonib bo'lmaydi, server tomonida saqlanishi kerak.

## 4. Taklif etilayotgan arxitektura (asoslangan qarorlar — ADR sifatida yoziladi)

**ADR-001 Monorepo:** `frontend/`, `backend/`, `content/`, `demo/`, `docs/adr/`. Bitta GitHub repo, kichik auditlanadigan commitlar.

**ADR-002 Frontend — Vite + React + TypeScript (Next.js emas).** Sabab: bola ilovasiga SSR/SEO kerak emas; statik SPA arzon xostingda ishlaydi, PWA/oflayn keshga oson o'tadi, arzon Android telefonlarda yengil. Marketing sayti kerak bo'lganda alohida qilinadi.

**ADR-003 Backend — FastAPI + SQLAlchemy 2 + Alembic + PostgreSQL** (handoff tavsiyasi bilan bir xil). Python keyingi AI/nutq ishlari uchun ham qulay. Testlar uchun Postgres (docker), SQLite emas — CHECK/trigger qoidalari aynan Postgresda sinalishi kerak.

**ADR-004 Kontent = kod (1-bosqich uchun).** Dars, mashq, ishora va ota-ona qo'llanmalari `content/` papkasida YAML fayllarda, har birida `status`, `source`, `rights`, `reviewer` maydonlari. Seed skripti ularni bazaga yuklaydi va validatsiya qiladi (masalan: PUBLISHED holatida manba, huquq va tasdiqlovchi bo'lmasa — seed yiqiladi). Afzalligi: CMS qurmasdan turib git tarixi tayyor audit izi bo'ladi; metodist PR orqali ko'rib chiqadi. Admin panel keyin.

**ADR-005 Nashr darvozasi uch qatlamda:** (1) bazada CHECK + holat o'tishlari triggeri, (2) repository qatlamida faqat `PUBLISHED` so'rovlar, (3) negativ testlar. Hozir hech narsa PUBLISHED emas, shuning uchun bola rejimi katalogi **bo'sh** chiqadi — bu to'g'ri xatti-harakat. Namuna darslar faqat `DEMO_CONTENT=true` bayrog'i bilan, har bir ekranda "Tasdiqlanmagan namuna" yorlig'i bilan ko'rsatiladi.

**ADR-006 Deterministik matematika dvigateli.** Masalalar shablon + parametr cheklovlari bilan yaratiladi (masalan, teng bo'lish: `a = b × c`, b va c sinf diapazonida, qoldiqsiz). Diapazonlar o'zi ham kontent — metodist tasdiqlaydi, kodga qattiq yozilmaydi. Javob tekshirish: matn normalizatsiyasi → son ajratish (raqam va so'z: "to'rt", "четыре") → aniq taqqoslash. AI hech qachon to'g'ri/noto'g'ri qaror qilmaydi.

**ADR-007 Bilimjon v1 = server tomonidagi holat mashinasi, LLM emas.**
`DIAGNOSTIKA → MISOL → YO'NALTIRILGAN MASHQ → MUSTAQIL MASHQ → TRANSFER → XULOSA`
- Har bir noto'g'ri javobda ishora zinapoyasi: 1) savolni qayta o'qish, 2) aniq buyum bilan tasavvur, 3) qisman yechim; javob hech qachon avtomatik aytilmaydi.
- Barcha matnlar oldindan tasdiqlangan shablonlardan; erkin kiritilgan savol faqat ruxsat ro'yxatidagi niyatlarga moslanadi, aks holda "Buni bilmayman, kattalardan so'ra" javobi.
- Shaxsiy ma'lumot so'rovlari, xavfli mavzular, prompt-injection uchun qoida asosidagi filtr va negativ testlar.
- O'zlashtirish qoidasi: ishora ishlatmasdan, yangi parametrli 2 ta transfer masalani to'g'ri yechish (qiymat konfiguratsiyada, metodist bilan kelishiladi).
- Interfeys LLM ulash uchun tayyor bo'ladi (`TutorPolicy` interfeysi), lekin 2-bosqichgacha ulanmaydi.

**ADR-008 Ovoz:** 1-sinf uchun TTS o'rniga **odam ovozida oldindan yozilgan audio** (metodist/diktor) — o'zbek bolalari uchun TTS sifati isbotlanmagan, yozilgan audio esa arzon va ishonchli. Mikrofon kirishi faqat bayroq ortida, har doim yozish alternativasi bilan, audio saqlanmaydi.

**ADR-009 Maxfiylik arxitekturasi (dizayn, faqat demo rejimida):**
- Bolaning ismi o'rniga taxallus/avatar; tug'ilgan sana o'rniga faqat sinf; maktab nomi so'ralmaydi.
- Shaxsiy ma'lumot (ota-ona hisobi) va ta'lim hodisalari alohida sxemalarda; hodisalarda faqat psevdonim ID.
- Rozilik versiyalanadi (`consent_records`), o'chirish va eksport oqimlari loyihalanadi; hammasi `CONSENT_FLOW_ENABLED=false` ortida.
- **Ma'lumotlarni lokalizatsiya qilish:** O'zbekiston "Shaxsga doir ma'lumotlar to'g'risida"gi qonuniga 2021-yildagi o'zgartirishlar fuqarolar shaxsiy ma'lumotlarini O'zbekiston hududidagi serverlarda saqlashni talab qiladi. Demak real bolalar/ota-onalar ma'lumotlari bilan ishlaydigan production bazasi O'zbekistonda xostlanishi kerak (aniq talablarni yurist tasdiqlaydi). Kontent va demo esa istalgan joyda tura oladi. Bu hozirdan arxitekturaga kiritiladi: shaxsiy ma'lumot bazasi alohida, ko'chiriladigan qilib.

**ADR-010 Ota-ona paneli:** deterministik generator bilan yaratilgan DEMO profillar ("Demo bola A"), har bir raqam yonida "namuna" belgisi va noaniqlik ("hali kam ma'lumot"). Ko'rsatkichlar: o'zlashtirilgan/mashq kerak bo'lgan maqsadlar, transfer natijasi, haftalik 10 daqiqalik tavsiya, "Avval menga tushuntir" va "Bolamga o'rgat" qo'llanmalari. Transkriptlar ko'rsatilmaydi.

## 5. 1-bosqich ish rejasi (kichik commitlar)

1. Repo skeleti, `/demo` ni o'zgarishsiz ko'chirish, eski 3 ta testni saqlash, `docs/IMPLEMENTATION_STATUS.md`, ADR-lar.
2. Backend: modellar + Alembic migratsiyasi (o'quv yili, ta'lim tili, sinf, fan, chorak, bo'lim, maqsad, dars, mashq, ishora, ota-ona qo'llanmasi, review_events), holat mashinasi triggeri.
3. `content/` YAML + validator + seed (faqat UNVERIFIED namunalar: 2-sinf teng bo'lish, 1-sinf sanash, 3-sinf ko'paytirish jadvali — hammasi DRAFT/DEMO).
4. Katalog API (published-only) + negativ testlar.
5. Matematika dvigateli + o'zbekcha normalizatsiya + property-based testlar (Hypothesis).
6. Bilimjon holat mashinasi + xavfsizlik filtrlari + negativ testlar (PII, injection, mavzudan tashqari).
7. Frontend: bola rejimi (katta plitkalar, audio tugmasi, klaviatura), dars oqimi, ota-ona paneli (demo), WCAG tekshiruvlari (axe).
8. `.env.example`, `make dev/test/seed`, GitHub Actions CI (lint, pytest, vitest, e2e Playwright).

Taxminiy hajm: 1-bosqich uchun bir necha ish sessiyasi; har bosqich oxirida testlar va holat hujjati yangilanadi.

## 6. Mahsulot bo'yicha takliflar

- **Gate A ni texnik ish bilan parallel boshlash.** 20 ota-ona, 8 o'qituvchi intervyusi kodni kutmasligi kerak — aynan ular qaysi fan/mavzudan boshlashni hal qiladi. Intervyu ssenariysi tayyor (`RESEARCH_AND_PILOT.md`).
- **Bitta fan, bitta sinf, bitta chorak bilan chuqur boshlash** (taklif: 2-sinf matematika, bitta chorak). 10 fan × 4 sinfni sayoz qamragandan ko'ra, 1 ta chorakni metodist tasdiqlagan, o'lchanadigan holatda qilish ancha qimmatli.
- **Metodist — kritik yo'l.** Tasdiqlangan kontentsiz mahsulot bolalarga chiqmaydi. Kamida 1 ta boshlang'ich sinf metodistini hozirdan jalb qilish kerak.
- **Darslik huquqlari:** darslik matnini ko'chirish o'rniga o'z mashqlarimizni rasmiy o'quv maqsadlariga bog'lash — huquqiy xavfni keskin kamaytiradi.
- **Til va yozuv:** birinchi versiya — o'zbek (lotin) ta'lim tili; ota-ona interfeysida kirill ko'rinishi qo'shimcha sifatida (ko'p ota-onalar kirillda o'qiydi). Rus tili keyin.

## 7. Qaror kutilayotgan savollar
1. Frontend: Vite+React (tavsiya) yoki Next.js?
2. Birinchi chuqur kesim: 2-sinf matematika, 1-chorak — rozimisiz?
3. GitHub repo: siz yaratasizmi yoki men tayyorlab beraymi?
4. Metodist/o'qituvchi bormi, yoki qidirish kerakmi?

Manbalar: [Mondaq — Uzbekistan Personal Data Law amended (2021)](https://mondaq.com/data-protection/1197754/the-law-on-personal-data-has-been-amended), [Kun.uz — data localization (2025)](https://ad.kun.uz/en/news/2025/07/22/experts-urge-uzbekistan-to-revise-data-localization-rules-to-support-innovation)
