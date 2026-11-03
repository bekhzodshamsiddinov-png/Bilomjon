# ADR-0003: Oflayn ishlaydigan umumiy dvigatel, server bilan bir xil
**Holat:** qabul qilingan · 2026-11-03

**Qaror:** `@bilim/core` sof TypeScript (UI va tarmoqqa bog'liq emas). Ilova 1-bosqichda uni qurilmada ishlatadi (internet shart emas). `apps/api` xuddi shu paketni ishlatadi.
**Sabab:** O'zbekiston hududlarida beqaror internet va arzon telefonlar; bir xil mantiq ikki joyda ikki xil yozilmaydi. Handoff FastAPI tavsiya qilgan edi — Python'da yozilsa, dvigatel ikki tilda takrorlanardi. Python keyinchalik nutq/AI mikroservislari uchun qo'shilishi mumkin.
**Xavf:** oflayn rejimda to'g'ri javob qurilmada bo'ladi — bu mashq uchun maqbul (imtihon emas). Real hisoblar va hisobotlar paydo bo'lganda natijalar serverda (`/api/v1/tutor/*`, shifrlangan sessiya) tekshiriladi.
