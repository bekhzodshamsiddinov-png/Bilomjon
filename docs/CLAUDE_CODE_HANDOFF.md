# CLAUDE CODE — exact execution brief

## Read first
README.md; docs/PRD.md; docs/PRODUCT_STRATEGY.md; docs/CURRICULUM_VERIFICATION.md; docs/PEDAGOGY_AND_SAFETY.md; docs/USER_STORIES_AND_ACCEPTANCE.md; docs/RESEARCH_AND_PILOT.md; docs/BACKLOG.md; spec/schema.sql; spec/api.openapi.yaml; tests/test_curriculum_sample.py; app/index.html.

## Existing code and truth
The only frontend is app/index.html, a dependency-free static demo with scripted examples. There is no authenticated backend, saved real progress, actual AI model, verified curriculum, production voice, payment or real analytics. Do not present sample values as real child records. **Do not process real children data yet.**

## Requested phase 1 implementation (safe simulated data)
1. Create a maintainable repo (`frontend/` Next.js or lightweight React/TS; `backend/` FastAPI + SQLAlchemy/Alembic + Postgres, or justify alternatives) with developer setup and reproducible tests. Preserve demo as `/demo`.
2. Implement academic-year, school-language, grade, subjects, terms, objectives and exercises with review/status metadata; published-only catalog API; seed only sample, clearly UNVERIFIED.
3. Implement deterministic math task engine (division, grouping, grade-level validation) and a bounded *scripted* tutor (not live LLM). Teach with hints and new transfer question; test answer validation.
4. Parent dashboard with generated demo data only. Add privacy architecture design and guardian consent flows behind disabled demo feature flags until reviewed.
5. Add accessibility, graceful voice fallbacks, `npm test`/`pytest`, lint, seed and startup scripts, `.env.example` (never real keys), CI basic checks.
6. Write ADRs for choices and maintain `docs/IMPLEMENTATION_STATUS.md` listing done/blocked. Commit in small auditable steps.

## Later stages — ONLY after prerequisites
- Approved curriculum and textbook rights; educator workflow and audit.
- Guardian consent and data governance reviewed by qualified counsel, tested permissions.
- Restricted AI API using server secrets, vetted curriculum retrieval and structured validation.
- Real Uzbek children's voice ASR/TTS benchmarks with lawfully obtained consent; no raw audio retention by default.
- Pilot and unit economics; only then payment deployment.

## Required quality gate
All endpoints enforce published-only rules; maths never trusts model output; negative tests for PII/prompt injection; no child sign-up; no exposure of billing to child; no misleading official content claims. Do not invent statistics or teacher sign-offs.

## Copy-paste Claude prompt
"Continue BILIM AI from this repository. Read docs/CLAUDE_CODE_HANDOFF.md and the files it lists. First provide an implementation plan and inventory. Then implement only safe phase-1 with sample data and automated tests. Preserve child safety, curriculum approval gates, and all existing demo functionality. Never claim the prototype has live AI or verified school syllabi. Provide exact commands to run tests and demo."
