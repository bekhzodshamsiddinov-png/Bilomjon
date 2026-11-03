# Loyihani professional darajaga olib chiqish — qo'llangan va navbatdagi yechimlar

## A. Shu bosqichda qo'llangan

1. **Bitta kod — uch platforma.** Expo (React Native) + Expo Router: web (Vercel), iOS va Android (EAS Build). Ekranlar, dvigatel va kontent bir xil (ADR-0002).
2. **Umumiy dvigatel (`@bilim/core`).** Matematika, Bilimjon, xavfsizlik — bitta TypeScript paketi; ilova oflayn ishlatadi, server xuddi shuni ishlatadi. Kod takrorlanmaydi, xatti-harakat farq qilmaydi (ADR-0003).
3. **Kontent = kod.** Darslar YAML fayllarda, har birida manba, huquq, holat, AI va inson tekshiruvi. Git tarixi — audit izi; metodist o'zgarishni PR orqali ko'radi (ADR-0004).
4. **Kontent kompilyatori.** Har bir mashq turi 60 ta tasodifiy seed bilan generatsiya qilinib, **mustaqil orakul** bilan tekshiriladi; sinf chegaralari, ishorada javob sizishi, ishlangan misol javobi. Xato bo'lsa — build to'xtaydi.
5. **Uch qatlamli nashr darvozasi:** Zod sxemasi → API `visibilityOf` → PostgreSQL trigger. AI tekshiruvi hech qachon nashrga yetarli emas (ADR-0005).
6. **Shifrlangan tutor sessiyasi.** Serverda holat AES-GCM token ichida — mijoz to'g'ri javobni ko'ra olmaydi va soxtalashtira olmaydi.
7. **Pedagogik dizayn:** diagnostika → misol → birga → mustaqil → transfer → xulosa; tipik xatolarga mos izoh; 3 xatodan keyin “birga yechamiz” va **yangi** masala; o'zlashtirish faqat transfer bo'yicha.
8. **Ota-ona juft qo'llanmasi:** har bir darsda “Avval o'zingiz tushunib oling” + “Farzandingiz bilan 10 daqiqa” (uydagi buyumlar bilan) + “E'tibor bering”.
9. **Maxfiylik dizayni:** hech narsa saqlanmaydi; kelajakdagi sxema — taxallus, psevdonim ID, versiyalangan rozilik, O'zbekistonda saqlash (ADR-0007).
10. **Sifat darvozasi (CI):** tiplar, 100+ unit/API/DB test, kontent validatsiyasi, e2e + axe, sirlar skaneri.
11. **Xavfsizlik sarlavhalari:** qattiq CSP, mikrofon/kamera/geolokatsiya o'chiq, `X-Frame-Options: DENY`; Android'da `RECORD_AUDIO`, `CAMERA`, `LOCATION` ruxsatlari bloklangan.

## B. Keyingi bosqichlar uchun takliflar (tartib bilan)

1. **Inson metodist tasdig'i (eng muhim).** 21 ta dars uchun 1 nafar boshlang'ich sinf o'qituvchisi ~3–4 soat (`docs/METHODIST_REVIEW_GUIDE.md`). Shundan keyin `PUBLISHED` qilib, `EXPO_PUBLIC_DEMO_CONTENT=false` bilan haqiqiy versiya chiqadi.
2. **Taqvim-mavzu rejasi bilan solishtirish.** Respublika ta'lim markazining 2026–2027 TMR fayllari bilan “qism = chorak” taxminini tasdiqlash; 2-sinf 74–97 va 4-sinf 70–71 bo'shliqlarini to'ldirish.
3. **Diktor ovozi.** 1–2-sinf uchun barcha ko'rsatma va masala shablonlarini professional diktor yozadi (TTS'dan arzon va ishonchli). Fayl tuzilmasi: `content/audio/<shablon-id>.m4a`.
4. **Qolgan choraklar.** Generator turlarini kengaytirish: qo'shish/ayirish (1–2-sinf), uzunlik/massa/vaqt, ko'p xonali sonlar, kasrlar (4-sinf). Har bir yangi tur — orakul + property test bilan.
5. **Ona tili va o'qish savodxonligi** — matematika bilan bir xil quvur: xarita → dars → tekshiruv. O'qish uchun audio majburiy.
6. **Pilot tayyorgarligi:** yurist bilan rozilik matni, ota-ona hisobi (telefon + OTP), O'zbekistondagi xosting (identity bazasi), audit, ma'lumotni o'chirish/eksport.
7. **Cheklangan AI (LLM) — faqat pilot natijalaridan keyin:** server tomonida, faqat tasdiqlangan dars matni bilan (retrieval), tuzilgan JSON javob, deterministik tekshirgich hal qiladi, xavfsizlik filtri kirish va chiqishda.
8. **O'lchash:** pre/post test, 2–4 haftadan keyingi saqlanish, “yangi masalani ishorasiz yechish” ulushi — North Star.
9. **Mobil do'konlar:** App Store “Kids” toifasi talablari (uchinchi tomon analitikasi va reklama yo'q, parental gate) — arxitektura bunga tayyor.
10. **Xalqaro kengayish:** `school_language` va `academic_year` allaqachon sxemada; rus tili va boshqa mamlakat dasturlari — yangi manba + xarita fayllari.
