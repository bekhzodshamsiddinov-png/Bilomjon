# ADR-0005: Nashr darvozasi va AI metodist roli
**Holat:** qabul qilingan · 2026-11-03

**Qaror:** `DRAFT → SOURCE_VERIFIED → EDUCATOR_REVIEWED → APPROVED → PUBLISHED`. `EDUCATOR_REVIEWED` va undan yuqori holatlar uchun **inson** tasdig'i majburiy. Uch qatlam: Zod sxemasi, API (`visibilityOf`), PostgreSQL trigger. Bola rejimi: rasmiy = faqat `PUBLISHED`; `EXPO_PUBLIC_DEMO_CONTENT=true` bo'lsa qoralamalar har ekranda “Sinov versiyasi” yorlig'i bilan.
**AI metodist:** Claude darslarni yozadi va `ai_review` tekshiruv ro'yxatini to'ldiradi, lekin bu tasdiq hisoblanmaydi. Sabab: handoff talabi (“o'qituvchi tasdig'ini to'qib chiqarmang”), bolalar xavfsizligi, darslik muvofiqligiga mas'uliyat.
