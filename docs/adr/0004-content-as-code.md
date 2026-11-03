# ADR-0004: Kontent = kod (YAML + kompilyator)
**Holat:** qabul qilingan · 2026-11-03

**Qaror:** O'quv dasturi xaritasi va darslar `packages/content/curriculum/*.yaml`; `scripts/build.ts` ularni validatsiya qilib `generated/catalog.json` va `docs/CURRICULUM_MAP.md` yaratadi. CI fayllar yangilanganini tekshiradi.
**Sabab:** CMS qurmasdan audit izi (git), PR orqali ko'rib chiqish, avtomatik sifat tekshiruvlari (orakul, sinf chegaralari, ishora sizishi).
**Manba huquqlari:** darsliklardan FAQAT mavzu nomlari va tartibi (`TOPIC_TITLES_ONLY`). Matn, rasm, mashqlar ko'chirilmaydi — mashqlar o'zimizning generatorlarimiz.
**Keyin:** kontent hajmi o'sganda — metodistlar uchun admin panel, lekin manba baribir versiyalangan bo'ladi (`db/migrations/0001_content.sql`).
