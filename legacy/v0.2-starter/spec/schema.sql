-- BILIM AI conceptual PostgreSQL v0.2 (design only; no migrations or live DB yet)
CREATE TABLE curriculum_sources (
 id UUID PRIMARY KEY, academic_year TEXT NOT NULL, school_language TEXT NOT NULL,
 title TEXT NOT NULL, official_url TEXT, content_sha256 TEXT, rights_status TEXT NOT NULL,
 verified_at TIMESTAMPTZ, reviewer_ref TEXT, UNIQUE(academic_year,school_language,title)
);
CREATE TABLE subjects (
 id UUID PRIMARY KEY, code TEXT NOT NULL, title TEXT NOT NULL,
 academic_year TEXT NOT NULL, school_language TEXT NOT NULL, grade SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 4),
 source_id UUID REFERENCES curriculum_sources(id), status TEXT NOT NULL DEFAULT 'DRAFT',
 UNIQUE(code,academic_year,school_language,grade)
);
CREATE TABLE lessons (
 id UUID PRIMARY KEY, subject_id UUID NOT NULL REFERENCES subjects(id), term SMALLINT NOT NULL CHECK(term BETWEEN 1 AND 4),
 unit_key TEXT NOT NULL, title TEXT NOT NULL, objective TEXT NOT NULL,
 review_status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (review_status IN ('DRAFT','SOURCE_VERIFIED','EDUCATOR_REVIEWED','APPROVED','PUBLISHED','ARCHIVED')),
 source_id UUID REFERENCES curriculum_sources(id), rights_verified BOOLEAN NOT NULL DEFAULT FALSE,
 reviewer_ref TEXT, reviewed_at TIMESTAMPTZ, version INTEGER NOT NULL DEFAULT 1,
 CHECK (review_status <> 'PUBLISHED' OR (source_id IS NOT NULL AND rights_verified AND reviewer_ref IS NOT NULL AND reviewed_at IS NOT NULL)),
 UNIQUE(subject_id,unit_key,version)
);
CREATE TABLE exercises (
 id UUID PRIMARY KEY, lesson_id UUID NOT NULL REFERENCES lessons(id), kind TEXT NOT NULL,
 prompt_json JSONB NOT NULL, checker_json JSONB NOT NULL,
 pedagogical_notes TEXT, is_transfer BOOLEAN NOT NULL DEFAULT FALSE, version INTEGER NOT NULL DEFAULT 1
);
-- Children, consent, progress and billing deliberately omitted until privacy design + counsel approval.
-- API must filter both lessons.review_status='PUBLISHED' and subjects.status='PUBLISHED'.
