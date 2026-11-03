# ADR-0006: Ovoz — avval diktor audiosi, TTS faqat haqiqiy o'zbek ovozi bo'lsa, mikrofon o'chiq
**Holat:** qabul qilingan · 2026-11-03

**Qaror:** `expo-speech` faqat qurilmada `uz` ovozi topilsa ishlatiladi; bo'lmasa — aniq izoh. Mikrofon (`FEATURE_VOICE_INPUT`) o'chiq; Android'da `RECORD_AUDIO` bloklangan. Keyingi qadam — 1–2-sinf uchun diktor yozgan audio.
**Sabab:** o'zbek bolalari nutqini tanish (ASR) sifati benchmark qilinmagan; xom audio — sezgir ma'lumot; ota-ona ruxsati va yurist tekshiruvi kerak.
