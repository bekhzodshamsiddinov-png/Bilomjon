# ADR-0008: Vercel — Build Output API
**Holat:** qabul qilingan · 2026-11-03

**Qaror:** `scripts/vercel-build.mjs` → `.vercel/output`: statik web + bitta `api` funksiyasi (esbuild bilan to'plangan) + xavfsizlik sarlavhalari va CSP.
**Sabab:** workspace paketlari TS manbada; standart `/api` aniqlash ularni kompilyatsiya qilmaydi. Build Output API to'liq nazorat beradi.
**Eslatma:** Vercel — faqat demo/kontent uchun. Shaxsiy ma'lumotli servis O'zbekistonda (ADR-0007).
