# BILIM AI — agentlar uchun qoidalar

- Avval `docs/IMPLEMENTATION_STATUS.md`, `docs/PEDAGOGY_AND_SAFETY.md`, `docs/adr/` ni o'qing.
- Bolalar xavfsizligi qat'iy: haqiqiy bola ma'lumotini yig'mang, to'lov qo'shmang, tasdiqlanmagan darsni rasmiy deb ko'rsatmang.
- AI tekshiruvi hech qachon `EDUCATOR_REVIEWED/APPROVED/PUBLISHED` uchun yetarli emas; inson tasdig'ini to'qib chiqarmang.
- Matematik to'g'rilikni faqat `@bilim/core` `checkAnswer` hal qiladi. Ishoralar javobni oshkor qilmasin.
- Darslik matni/mashqlarini ko'chirmang — faqat mavzu nomlari.
- Kontentni o'zgartirgandan keyin: `pnpm content:build`. Har o'zgarishdan keyin: `pnpm typecheck && pnpm test`; UI o'zgarsa `pnpm build:web && pnpm e2e`.
- Commitlar kichik va tushunarli; holat hujjatini yangilang.
