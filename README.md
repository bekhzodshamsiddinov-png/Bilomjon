# BILIM AI — Bilimjon

O'zbekiston 1–4-sinf o'quvchilari uchun pedagogik nazorat qilinadigan o'quv yordamchisi **Bilimjon** va ota-onalar uchun “qanday tushuntiraman” paneli.
Bitta kod bazasi: **web + iOS + Android**.

> ⚠️ **Sinov versiyasi (v0.3).** Darslar AI metodist tomonidan yozilgan va o'qituvchi tomonidan hali tasdiqlanmagan. Bilimjon — haqiqiy AI emas, oldindan yozilgan qoidalar bilan ishlaydi. Shaxsiy ma'lumot yig'ilmaydi.

## Tez boshlash

```bash
corepack enable && pnpm install
pnpm web              # ilovani brauzerda ochish
pnpm test             # unit + API + DB + kontent + eski paket testlari
pnpm build:web && pnpm e2e   # brauzerda e2e + accessibility (axe)
pnpm api:dev          # API: http://localhost:8787/api/health
pnpm content:build    # YAML kontentni tekshirib, katalogni qayta yaratish
```

## Tuzilma

| Papka | Vazifa |
|---|---|
| `apps/bilimjon` | Expo ilova (web/iOS/Android): sinf → fan → chorak → dars, Bilimjon, ota-ona paneli |
| `apps/api` | Hono API: published-only katalog, shifrlangan tutor sessiyasi, demo hisobot |
| `packages/core` | Dvigatel: o'zbek matni, matematika generatorlari va tekshirgich, Bilimjon, xavfsizlik |
| `packages/content` | O'quv dasturi xaritasi va darslar (YAML) + kompilyator/validator |
| `db` | PostgreSQL sxemasi (nashr triggeri, audit) + maxfiylik dizayni qoralamasi |
| `legacy/v0.2-starter` | ChatGPT bilan tayyorlangan v0.2 paket (o'zgarishsiz) |
| `docs` | PRD, strategiya, xavfsizlik, ADR, holat, metodist yo'riqnomasi |

## Asosiy hujjatlar
- [Amalga oshirish holati](docs/IMPLEMENTATION_STATUS.md)
- [Demo muammolari va yechimlari](docs/DEMO_FIXES.md)
- [Professional reja](docs/PROFESSIONAL_PLAN.md)
- [O'quv dasturi xaritasi (1–4-sinf matematika)](docs/CURRICULUM_MAP.md)
- [Metodist uchun tekshiruv yo'riqnomasi](docs/METHODIST_REVIEW_GUIDE.md)
- [Arxitektura qarorlari (ADR)](docs/adr/)

## Deploy
Vercel: `vercel.json` → `pnpm vercel-build` (Build Output API: statik web + `/api` funksiyasi). Mobil: `apps/bilimjon/eas.json`.
