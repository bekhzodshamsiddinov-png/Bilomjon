# ADR-0002: Expo (React Native) — web + iOS + Android bitta koddan
**Holat:** qabul qilingan · 2026-11-03

**Kontekst:** Talab — web sayt, iOS va Android. Handoff Next.js yoki React taklif qilgan edi; avvalgi tahlilda Vite+React taklif qilingan.
**Qaror:** Expo SDK 58 + Expo Router. Web uchun statik eksport (SPA), mobil uchun EAS Build.
**Sabab:** bitta UI kod bazasi uch platformada; native ovoz (expo-speech), kelajakda oflayn saqlash va push; Next.js faqat webni yopardi, ikkinchi (mobil) kod bazasi kerak bo'lardi. Bola ilovasiga SEO/SSR kerak emas.
**Muqobillar:** Next.js + alohida React Native (ikki UI kod bazasi — rad etildi); Flutter (TypeScript dvigatelni bo'lisha olmaydi — rad etildi).
**Oqibat:** marketing sayti kerak bo'lsa — alohida, SEO'ga mos texnologiyada.
