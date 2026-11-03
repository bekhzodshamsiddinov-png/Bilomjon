-- BILIM AI — kontent sxemasi (PostgreSQL 15+). Faqat o'quv kontenti: SHAXSIY MA'LUMOT YO'Q.
-- Shaxsiy ma'lumotlar (ota-ona, bola, rozilik) alohida `identity` sxemasida — db/design/ (hali qo'llanilmaydi).

CREATE TYPE review_status AS ENUM ('DRAFT','SOURCE_VERIFIED','EDUCATOR_REVIEWED','APPROVED','PUBLISHED','ARCHIVED');
CREATE TYPE rights_status AS ENUM ('UNKNOWN','TOPIC_TITLES_ONLY','LICENSED','ORIGINAL');

CREATE TABLE curriculum_sources (
  id              TEXT PRIMARY KEY,
  academic_year   TEXT NOT NULL,
  school_language TEXT NOT NULL,
  grade           SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 4),
  part            SMALLINT NOT NULL CHECK (part BETWEEN 1 AND 4),
  title           TEXT NOT NULL,
  author          TEXT NOT NULL,
  publisher       TEXT NOT NULL,
  isbn            TEXT,
  url             TEXT NOT NULL,
  content_sha256  TEXT,
  term_mapping    TEXT NOT NULL CHECK (term_mapping IN ('ASSUMED_PART_EQUALS_TERM','VERIFIED_WITH_TMR')),
  rights_status   rights_status NOT NULL DEFAULT 'UNKNOWN',
  retrieved_at    DATE NOT NULL
);

CREATE TABLE subjects (
  code            TEXT NOT NULL,
  academic_year   TEXT NOT NULL,
  school_language TEXT NOT NULL,
  grade           SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 4),
  title           TEXT NOT NULL,
  status          review_status NOT NULL DEFAULT 'DRAFT',
  PRIMARY KEY (code, academic_year, school_language, grade)
);

CREATE TABLE curriculum_map_entries (
  id            TEXT PRIMARY KEY,
  academic_year TEXT NOT NULL,
  school_language TEXT NOT NULL,
  grade         SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 4),
  subject_code  TEXT NOT NULL,
  term          SMALLINT NOT NULL CHECK (term BETWEEN 1 AND 4),
  seq           INTEGER NOT NULL,
  textbook_no   TEXT,
  title         TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('lesson','review','assessment','practice','game','gap')),
  source_id     TEXT NOT NULL REFERENCES curriculum_sources(id),
  status        review_status NOT NULL DEFAULT 'DRAFT',
  FOREIGN KEY (subject_code, academic_year, school_language, grade) REFERENCES subjects(code, academic_year, school_language, grade),
  UNIQUE (academic_year, school_language, grade, subject_code, term, seq)
);

-- Dars versiyalanadi: o'zgarish = yangi versiya; eski versiya ARCHIVED bo'ladi.
CREATE TABLE lessons (
  id            TEXT NOT NULL,
  version       INTEGER NOT NULL CHECK (version > 0),
  map_entry_id  TEXT NOT NULL REFERENCES curriculum_map_entries(id),
  title         TEXT NOT NULL,
  objective     TEXT NOT NULL,
  body          JSONB NOT NULL,          -- tushuntirish, ishlangan misol, xatolar, mezonlar
  generators    JSONB NOT NULL,          -- diagnostic/practice/transfer spetsifikatsiyalari
  review_status review_status NOT NULL DEFAULT 'DRAFT',
  source_id     TEXT NOT NULL REFERENCES curriculum_sources(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, version)
);
-- Bitta dars uchun bir vaqtda faqat bitta PUBLISHED versiya.
CREATE UNIQUE INDEX one_published_version ON lessons (id) WHERE review_status = 'PUBLISHED';

-- Ota-ona qo'llanmasi — birinchi darajali obyekt, dars bilan bir xil maqsadga bog'langan.
CREATE TABLE parent_guides (
  lesson_id      TEXT NOT NULL,
  lesson_version INTEGER NOT NULL,
  teach_me       JSONB NOT NULL,
  teach_child    JSONB NOT NULL,
  materials      JSONB NOT NULL,
  watch_for      JSONB NOT NULL,
  PRIMARY KEY (lesson_id, lesson_version),
  FOREIGN KEY (lesson_id, lesson_version) REFERENCES lessons(id, version) ON DELETE CASCADE
);

-- Tekshiruvlar: AI va inson alohida. Nashrga faqat INSON tasdig'i hisoblanadi.
CREATE TABLE lesson_reviews (
  id             BIGSERIAL PRIMARY KEY,
  lesson_id      TEXT NOT NULL,
  lesson_version INTEGER NOT NULL,
  reviewer_kind  TEXT NOT NULL CHECK (reviewer_kind IN ('human','ai')),
  reviewer_ref   TEXT NOT NULL,          -- ichki ID, ism emas
  reviewer_role  TEXT CHECK (reviewer_role IN ('primary_teacher','methodist','subject_expert')),
  decision       TEXT NOT NULL CHECK (decision IN ('approved','changes_requested')),
  notes          TEXT,
  reviewed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (reviewer_kind = 'ai' OR reviewer_role IS NOT NULL),
  FOREIGN KEY (lesson_id, lesson_version) REFERENCES lessons(id, version) ON DELETE CASCADE
);

-- Audit: har bir holat o'zgarishi o'chirilmaydigan jurnalga yoziladi.
CREATE TABLE review_events (
  id             BIGSERIAL PRIMARY KEY,
  lesson_id      TEXT NOT NULL,
  lesson_version INTEGER NOT NULL,
  from_status    review_status,
  to_status      review_status NOT NULL,
  actor_ref      TEXT NOT NULL DEFAULT current_user,
  at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE FUNCTION review_transition_allowed(f review_status, t review_status) RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE f
    WHEN 'DRAFT'             THEN t IN ('SOURCE_VERIFIED','ARCHIVED')
    WHEN 'SOURCE_VERIFIED'   THEN t IN ('EDUCATOR_REVIEWED','DRAFT','ARCHIVED')
    WHEN 'EDUCATOR_REVIEWED' THEN t IN ('APPROVED','DRAFT','ARCHIVED')
    WHEN 'APPROVED'          THEN t IN ('PUBLISHED','DRAFT','ARCHIVED')
    WHEN 'PUBLISHED'         THEN t IN ('ARCHIVED','DRAFT')
    WHEN 'ARCHIVED'          THEN t IN ('DRAFT')
  END
$$;

CREATE FUNCTION enforce_lesson_gate() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  human_ok BOOLEAN;
  rights   rights_status;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.review_status <> 'DRAFT' THEN
    RAISE EXCEPTION 'Yangi dars faqat DRAFT holatida yaratiladi';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.review_status IS DISTINCT FROM OLD.review_status THEN
    IF NOT review_transition_allowed(OLD.review_status, NEW.review_status) THEN
      RAISE EXCEPTION 'Ruxsat etilmagan o''tish: % -> %', OLD.review_status, NEW.review_status;
    END IF;
    IF NEW.review_status IN ('EDUCATOR_REVIEWED','APPROVED','PUBLISHED') THEN
      SELECT EXISTS (SELECT 1 FROM lesson_reviews r WHERE r.lesson_id = NEW.id AND r.lesson_version = NEW.version
                     AND r.reviewer_kind = 'human' AND r.decision = 'approved') INTO human_ok;
      IF NOT human_ok THEN
        RAISE EXCEPTION '% uchun inson (o''qituvchi/metodist) tasdig''i kerak — AI tekshiruvi hisobga olinmaydi', NEW.review_status;
      END IF;
    END IF;
    IF NEW.review_status = 'PUBLISHED' THEN
      SELECT s.rights_status INTO rights FROM curriculum_sources s WHERE s.id = NEW.source_id;
      IF rights = 'UNKNOWN' THEN
        RAISE EXCEPTION 'Manba huquq holati noma''lum — nashr qilib bo''lmaydi';
      END IF;
    END IF;
    INSERT INTO review_events (lesson_id, lesson_version, from_status, to_status) VALUES (NEW.id, NEW.version, OLD.review_status, NEW.review_status);
  END IF;
  -- Nashr qilingan kontent o'zgartirilmaydi — yangi versiya yaratiladi.
  IF TG_OP = 'UPDATE' AND OLD.review_status = 'PUBLISHED' AND NEW.review_status = 'PUBLISHED'
     AND (NEW.body IS DISTINCT FROM OLD.body OR NEW.generators IS DISTINCT FROM OLD.generators OR NEW.title IS DISTINCT FROM OLD.title) THEN
    RAISE EXCEPTION 'PUBLISHED darsni tahrirlab bo''lmaydi — yangi versiya yarating';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER lessons_gate BEFORE INSERT OR UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION enforce_lesson_gate();

CREATE FUNCTION forbid_audit_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'review_events jurnali o''zgartirilmaydi'; END $$;
CREATE TRIGGER review_events_append_only BEFORE UPDATE OR DELETE ON review_events FOR EACH ROW EXECUTE FUNCTION forbid_audit_change();

-- Bola rejimi uchun yagona ko'rinish: faqat PUBLISHED.
CREATE VIEW published_lessons AS
  SELECT l.* FROM lessons l
  JOIN curriculum_map_entries m ON m.id = l.map_entry_id
  WHERE l.review_status = 'PUBLISHED' AND m.status <> 'ARCHIVED';
