# ADR-0007: Maxfiylik arxitekturasi va ma'lumotlarni O'zbekistonda saqlash
**Holat:** dizayn (amalga oshirilmagan) · 2026-11-03

**Hozir:** hech qanday shaxsiy ma'lumot yig'ilmaydi; holat faqat xotirada; analytics, reklama, to'lov yo'q.
**Kelajak (yurist tasdig'idan keyin):** `db/design/0100_identity_DRAFT.sql` — ota-ona yagona hisob egasi (telefon xeshi + OTP), bola taxallus bilan (ism, tug'ilgan sana, maktab, rasm yo'q), versiyalangan rozilik, ta'lim hodisalari psevdonim ID bilan alohida sxemada, bola matni saqlanmaydi, o'chirish/eksport.
**Lokalizatsiya:** O'zbekiston “Shaxsga doir ma'lumotlar to'g'risida”gi qonuniga 2021-yil o'zgartirishlar fuqarolar ma'lumotini O'zbekistondagi serverlarda saqlashni talab qiladi → identity bazasi O'zbekistonda; kontent va statik ilova (Vercel) — shaxsiy ma'lumotsiz.
