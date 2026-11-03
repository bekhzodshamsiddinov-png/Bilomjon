# Metodist / o'qituvchi uchun tekshiruv yo'riqnomasi

Barcha darslar hozir `DRAFT`. Ularni **Claude (AI metodist)** yozgan va avtomatik tekshirgan, lekin bolalarga rasmiy ko'rsatish uchun
**boshlang'ich sinf o'qituvchisi yoki metodistning tasdig'i majburiy** (tizim AI tekshiruvini nashr uchun qabul qilmaydi).

## Nimani tekshirish kerak (har bir dars, ~10 daqiqa)

Darsni ilovada oching (`/lesson/<id>`) va YAML faylini (`packages/content/curriculum/lessons/g2-t3/<id>.yaml`) ko'ring.

1. **Maqsad** darslikdagi shu mavzuga mos keladimi? Darslikdagi tartib to'g'rimi?
2. **Sonlar** sinf darajasiga mosmi (2-sinf jadvali: ko'paytma ≤ 100)?
3. **Tushuntirish** va **ishlangan misol** to'g'ri, qisqa, bolaga tushunarlimi? Atamalar (bo'linuvchi, bo'luvchi, bo'linma …) darslikdagidek ishlatilganmi?
4. **Tipik xatolar** ro'yxati to'liqmi? Sizning tajribangizda yana qanday xato uchraydi?
5. **Ishoralar** javobni aytib qo'ymaydimi, lekin yordam beradimi?
6. **Masala matnlari** — o'zbek tili grammatikasi, kundalik va madaniy jihatdan mos buyumlar.
7. **Ota-ona qo'llanmasi** — uydagi buyumlar bilan bajariladimi, 10 daqiqaga sig'adimi, tili sodda va hurmatlimi?
8. **O'zlashtirish qoidasi** (2 ta yangi masalani ishorasiz yechish) adolatlimi?

## Tasdiqlash qanday yoziladi

Dars faylida `human_reviews` ro'yxatiga yozuv qo'shiladi (ism emas — ichki ID):

```yaml
human_reviews:
  - reviewer_id: teacher-001        # ism-familiya alohida, maxfiy ro'yxatda saqlanadi
    role: primary_teacher            # primary_teacher | methodist | subject_expert
    decision: approved               # yoki changes_requested
    reviewed_at: '2026-11-15'
    notes: "Ishlangan misolda 'teng tarqatamiz' iborasini qo'shish kerak"
```

Keyin holat bosqichma-bosqich o'zgaradi: `DRAFT → SOURCE_VERIFIED → EDUCATOR_REVIEWED → APPROVED → PUBLISHED`.
`pnpm content:build` tasdiqsiz `APPROVED/PUBLISHED` ni rad etadi. Matematik yechimlar uchun ikkinchi tekshiruvchi tavsiya etiladi.

## O'zgartirish so'rash

`decision: changes_requested` va `notes` yozing — dasturchi/AI metodist tuzatadi, `version` oshiriladi, qayta tekshiruv.
