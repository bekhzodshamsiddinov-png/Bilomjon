# Curriculum verification protocol (mandatory before claiming official alignment)

**NOT VERIFIED:** No authoritative 2026–2027 Uzbekistan grade-by-grade, schooling-language-specific subject and lesson corpus has been imported into this package. Sample topics are placeholders. Do not expose them as officially approved material.

## Collect and record per school language and year
1. Ministry-approved base study plan for that academic year; document title, approval date/number, official URL, publication date and a copy/hash.
2. For each grade and language of instruction: exact subject names, weekly hours, quarters/terms and applicable exceptional schedules.
3. Approved curriculum and learning outcomes / quarter-by-quarter calendar sequence; track version.
4. Relevant state-approved textbooks: edition, publisher, year, rights holder and permission scope for digitization/adaptation.
5. Source page range/section for each objective and interactive example; no unlicensed copying of pages.
6. Reviewer (qualified primary educator), second approval for maths solutions and voice pronunciation; dated approval.

## Publication gate
status = DRAFT -> SOURCE_VERIFIED -> EDUCATOR_REVIEWED -> APPROVED -> PUBLISHED -> ARCHIVED. Only PUBLISHED material may be used in actual child mode. A curriculum change invalidates dependent topic mappings pending reapproval.

## Output CSV template columns
academic_year,school_language,grade,subject_code,official_subject_name,term,unit_id,lesson_id,lesson_title,learning_objective,source_title,source_url,source_version,rights_status,reviewer_id,reviewed_at,publication_status

## Seed catalog warning
The demo list is a broad placeholder. Grade 1 literacy sequencing and grade 4 IT are *not* certified without checking the relevant year's signed plan. Do not infer every listed subject exists in every grade.
