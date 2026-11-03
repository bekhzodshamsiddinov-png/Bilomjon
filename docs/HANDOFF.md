# HANDOFF — Read this in a new ChatGPT / Claude / coding agent conversation

You are continuing the BILIM AI startup. Source of truth is this repository, especially docs/PRD.md and docs/BACKLOG.md. Do not claim unverified Uzbek curriculum taxonomy is official. Preserve child safety and parental supervision as hard requirements.

## Product summary
BILIM AI serves Uzbekistan grades 1–4, with a curriculum-aligned text/voice robot tutor called Bilimjon and a parent co-teaching dashboard. All subjects should be supported in the data model, but only validated topics may be published. Focus on actual learning gains, not retention mechanics.

## Current deliverables
- docs/PRD.md: goals and acceptance requirements.
- docs/BACKLOG.md: prioritized implementation roadmap.
- app/index.html: interactive single-file dependency-free responsive concept prototype.
- app/README.md: running instructions and limitations.

## Current limitations
This is a scripted UI demonstration, not a live AI system. No accounts, back-end, persisted user data, actual paid subscriptions or verified curriculum corpus. Voice input may not work in some browsers and is not necessarily suitable for children. No actual child speech or real child personal data should be used in tests without verified parent consent and privacy controls.

## Next task for assistant
1. Audit prototype for accessibility and correctness; keep script-based learning examples until curriculum review.
2. Design normalized curriculum schema: academic_year, school_language, grade, subject, term, unit, lesson, objective, exercise, review_status, source_url, rights.
3. Define API contracts and safety policies for bounded tutoring. Implement server-side test cases for maths validation and response safeguards.
4. Set up production-grade frontend/backend only after agreeing architecture; never embed AI keys client-side.
5. Prepare curriculum verification checklist with authoritative source references; seek educator review.

## Suggested first message after upload
"Continue BILIM AI from the attached ZIP. First inspect docs/PRD.md, docs/BACKLOG.md, docs/HANDOFF.md and app/index.html. Summarize implemented versus planned functions and implement the next highest-priority safe step without treating example topics as official curriculum."

## Portability
Upload ZIP to another ChatGPT account, extract and place in GitHub, or open with Claude Code. Conversations do not need to migrate for the code and documents to remain usable.

## Latest handoff
For Claude Code use `docs/CLAUDE_CODE_HANDOFF.md`. The v0.2 package contains a conceptual SQL schema, API proposal, acceptance criteria and static tests; no backend is implemented.
