import type { MisconceptionCode } from '../math/types';
import type { SafetyCategory } from '../safety/classify';
import type { Rng } from '../random';

/**
 * Bilimjonning BARCHA gaplari shu yerda — oldindan yozilgan, tekshiriladigan shablonlar.
 * Qoidalar (docs/PEDAGOGY_AND_SAFETY.md): rag'batlantiruvchi, lekin xushomadsiz; uyaltirmaydi;
 * bir vaqtda bitta tushuntirish va bitta savol; javobni oldindan aytmaydi.
 */
export const T = {
  greet: (title: string) => `Salom! Bugun “${title}” mavzusini o‘rganamiz. Avval bitta kichik savol.`,
  diagnosticNote: 'Bu kichik tekshiruv — bilganingcha javob ber, xato qilsang ham hechqisi yo‘q.',
  diagnosticNoHints: 'Bu boshlang‘ich savol, bunda ishora bermayman. O‘zing urinib ko‘r — keyin birga o‘rganamiz.',
  diagnosticCorrect: 'To‘g‘ri! Demak, asosini bilasan. Endi chuqurroq o‘rganamiz.',
  diagnosticIncorrect: 'Yaxshi urinish. Keling, buni birga, qadamma-qadam o‘rganamiz.',
  examplePhase: 'Keling, avval bitta misolni birga ko‘ramiz.',
  guidedPhase: 'Endi birga mashq qilamiz. Qiyin bo‘lsa, “Ishora” tugmasini bos.',
  independentPhase: 'Zo‘r! Endi o‘zing yechib ko‘r.',
  transferPhase: 'Endi boshqacha, yangi masala. Bilganlaringni qo‘llab ko‘r.',
  correct: ['To‘g‘ri!', 'To‘g‘ri, yaxshi o‘ylading.', 'Ha, to‘g‘ri.', 'To‘g‘ri! Qanday hisoblaganingni ham ayta olasanmi?'],
  correctAfterTries: 'To‘g‘ri! Qayta urinib, o‘zing topding — bu juda muhim.',
  tryAgain: 'Hali emas. Yana bir bor o‘ylab ko‘r.',
  unparseable: 'Javobingni tushunmadim. Javobni son bilan yoz yoki tugmalardan birini tanla.',
  unparseableChoice: 'Javobingni tushunmadim. “Ha” yoki “Yo‘q” deb javob ber.',
  noMoreHints: 'Barcha ishoralarni ko‘rding. Ularni qaytadan o‘qib, sekin hisoblab ko‘r.',
  workTogether: 'Keling, buni birga yechamiz:',
  afterSolution: 'Endi o‘xshash, lekin yangi masalani o‘zing yechib ko‘r.',
  answerRequest: 'Javobni o‘zim aytsam, sen o‘rganmay qolasan. Mana senga yordam:',
  confused: 'Hechqisi yo‘q, tushunmaslik — o‘rganishning bir qismi. Mana ishora:',
  backToTask: 'Keling, masalamizga qaytamiz:',
  summaryMastered: 'Ajoyib! Yangi masalalarni ishorasiz yechding. Bu mavzuni yaxshi tushunding.',
  summaryDeveloping: 'Yaxshi ish! Ko‘p narsani tushunding. Yana ozgina mashq qilsak, yanada mustahkam bo‘ladi.',
  summaryNeedsPractice: 'Bugun ko‘p mehnat qilding. Bu mavzuni yana bir marta birga takrorlaymiz — har safar osonroq bo‘ladi.',
  summaryAdult: 'Ota-onang bilan ham shu mavzuda 10 daqiqa mashq qilib ko‘ringlar.',
} as const;

export const MISCONCEPTION_FEEDBACK: Record<MisconceptionCode, string> = {
  ADD_INSTEAD_OF_MUL: 'Sen sonlarni qo‘shding. Bu yerda esa bir xil guruhlar bir necha marta takrorlanadi — bu ko‘paytirish.',
  SUB_INSTEAD_OF_DIV: 'Sen ayirding. Bu yerda esa hammasini teng guruhlarga bo‘lish kerak.',
  MUL_INSTEAD_OF_DIV: 'Sen ko‘paytirding. Bo‘lganda son kichrayadi — teng qismlarga ajratamiz.',
  GROUP_COUNT_OFF: 'Juda yaqin! Guruhlar sonini yana bir sanab chiq — bittasi ortiqcha yoki kam bo‘lib qolgan.',
  COUNTING_SLIP: 'Juda yaqin! Sanashda kichik xato bo‘lgan. Sekin, bittalab qayta sanab ko‘r.',
  ADD_INSTEAD_OF_TIMES: '“Marta ko‘p” — bu “ta ko‘p” emas. Son necha marta takrorlanishini o‘ylab ko‘r.',
  SUB_INSTEAD_OF_TIMES: '“Marta kam” — bu “ta kam” emas. Teng qismlarga bo‘lib, bittasini olamiz.',
  WRONG_DIRECTION: 'Ko‘paytirish va bo‘lishni almashtirib yubording. “Ko‘p” bo‘lsa — kattalashadi, “kam” bo‘lsa — kichrayadi.',
  GAVE_PRODUCT: 'Bu son allaqachon berilgan. Biz noma’lum ko‘paytuvchini qidiryapmiz.',
  DIVISIBILITY_GUESS: 'Tekshirib ko‘raylik: teng guruhlarga ajratganda ortib qolgan buyum bormi?',
};

/**
 * Xavfsizlik javoblari. DIQQAT: favqulodda holat matnlari va ishonch telefonlari
 * mahalliy mutaxassis tomonidan tasdiqlanmaguncha qo'shilmaydi (docs/SAFETY_MODEL.md).
 */
export const SAFETY_REPLY: Record<Exclude<SafetyCategory, 'ok'>, string> = {
  distress:
    'Buni menga aytganing yaxshi. Bu juda muhim gap. Iltimos, hozir ishonchli kattalardan biriga — ota-onangga, o‘qituvchingga yoki yaqiningga ayt. Ular senga yordam bera oladi. Sen yolg‘iz emassan.',
  pii_shared:
    'Ismingni, manzilingni, maktabingni yoki telefon raqamingni menga yozish shart emas — men ularni eslab qolmayman. Keling, darsga qaytamiz.',
  pii_request:
    'Men manzil, maktab yoki telefon kabi shaxsiy ma’lumotlarni bilmayman va so‘ramayman. Bunday savollarni ota-onangdan so‘ra.',
  injection: 'Men faqat dars bo‘yicha yordam beraman. Keling, masalaga qaytamiz.',
  unsafe_topic: 'Bu mavzu haqida men gaplasha olmayman. Bunday savollarni ishonchli kattalardan — ota-onang yoki o‘qituvchingdan so‘ra.',
  companion:
    'Men o‘quv yordamchisiman — darslarda yordam beraman. Sirlarni kattalardan yashirish kerak emas: muhim narsalarni ota-onangga ayt. Keling, o‘rganishni davom ettiramiz.',
};

export function pickCorrect(rng: Rng): string {
  return rng.pick(T.correct);
}
