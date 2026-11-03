-- ⚠️ DIZAYN QORALAMASI — QO'LLANILMAYDI. Yurist (O'zbekiston "Shaxsga doir ma'lumotlar to'g'risida"gi qonun,
-- shu jumladan ma'lumotlarni O'zbekiston hududida saqlash talabi) va xavfsizlik tekshiruvidan keyingina migratsiyaga aylanadi.
-- Tamoyillar: minimal ma'lumot; bola — taxallus; ota-ona — yagona hisob egasi; rozilik versiyalanadi;
-- ta'lim hodisalari shaxsiy ma'lumotdan ajratilgan (psevdonim ID); o'chirish va eksport.

CREATE SCHEMA identity;   -- O'zbekistondagi alohida, shifrlangan baza (lokalizatsiya)

CREATE TABLE identity.guardians (
  id              UUID PRIMARY KEY,
  phone_e164_hash TEXT NOT NULL UNIQUE,   -- telefon raqami xeshlangan; ochiq shakli faqat OTP uchun KMS ostida
  locale          TEXT NOT NULL DEFAULT 'uz-Latn',
  adult_confirmed_at TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE identity.consent_records (
  id             BIGSERIAL PRIMARY KEY,
  guardian_id    UUID NOT NULL REFERENCES identity.guardians(id),
  consent_doc    TEXT NOT NULL,           -- masalan 'privacy-uz-v1'
  scope          TEXT NOT NULL CHECK (scope IN ('child_profile','learning_events','voice_input','reports')),
  granted        BOOLEAN NOT NULL,
  at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity.children (
  id            UUID PRIMARY KEY,
  guardian_id   UUID NOT NULL REFERENCES identity.guardians(id) ON DELETE CASCADE,
  alias         TEXT NOT NULL CHECK (length(alias) <= 20),   -- taxallus; haqiqiy ism so'ralmaydi
  avatar        TEXT NOT NULL,
  grade         SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 4),
  school_language TEXT NOT NULL,
  -- Tug'ilgan sana, maktab, manzil, rasm — ATAYLAB YO'Q.
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ta'lim hodisalari: alohida sxema, faqat psevdonim ID, bola matni yo'q.
CREATE SCHEMA learning;
CREATE TABLE learning.attempt_events (
  id            BIGSERIAL PRIMARY KEY,
  learner_pseudo_id UUID NOT NULL,        -- identity.children.id dan HMAC orqali olingan, teskari tiklanmaydi
  lesson_id     TEXT NOT NULL,
  lesson_version INTEGER NOT NULL,
  phase         TEXT NOT NULL,
  correct       BOOLEAN NOT NULL,
  first_try     BOOLEAN NOT NULL,
  hints_used    SMALLINT NOT NULL,
  misconception TEXT,
  at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Saqlash muddati: 12 oy (yurist bilan kelishiladi), keyin agregatlanadi va o'chiriladi.
