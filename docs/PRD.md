# BILIM AI — Product Requirements Document
Version: 0.1 | 2026-10-29 | Status: initial working prototype, NOT production-ready

## Vision
Every child in Uzbekistan's grades 1–4 has access to patient, curriculum-aligned learning support, and every parent has a practical co-teacher to help their child learn independently.

## Users and jobs-to-be-done
- Child (roughly primary school age): Understand difficult topics, ask via text/voice, get age-appropriate guided explanations, practise independently, see progress.
- Parent/guardian: Understand what child is learning, learn how to explain concepts, choose or start 10–15 minute guided lessons, track patterns of strengths and gaps, control use.
- Educator/content reviewer: Approve learning objectives, exercises, correct answers, scaffolded explanations, reading level and grade assignments.

## Scope
Product architecture supports grades 1, 2, 3, 4 and Uzbekistan's active curriculum subjects. Exact subject allocations and annual topics MUST be verified with authoritative 2026–2027 approved curricula before publication. This starter's examples are illustrative, not official curriculum content. All published lessons require source/version/license metadata and educator signoff.

### Initial subject taxonomy (unverified placeholders)
Mathematics, native language, reading literacy, foreign language, natural sciences, upbringing, technology, art, music, PE; introductory literacy in grade 1 and IT for grades where approved. School language, year, textbook edition and term are configurable.

## Learner flows
1. Parent creates family account, verifies adult status and consents to child profile. No child direct signup.
2. Parent selects child's grade, schooling language, optional learning goals; no unnecessary personal data.
3. Child sees large subject tiles and 'Ask Bilimjon' option.
4. Guided lesson: baseline question → concise explanation with concrete visual → supported practice → independent transfer exercise → comprehension check → parent-friendly summary.
5. For failed attempts, hints scaffold understanding; do not reveal answers by default.
6. If the bot is uncertain about a question, it says so and offers to request adult/teacher help.

## Parent flows
- Parent dashboard (by child): lesson completion, topics understood/need practice, time spent, recommendations.
- 'Teach me first' explains material to parent in simple adult language.
- 'Teach my child' initiates short bot-led sequence, with clear parental oversight.
- Multiple child profiles with segregated history and per-child controls (future implementation).

## AI tutor functional requirements
- Text chat. Voice input and spoken output are planned; starter includes only browser-dependent experimental input and local speech synthesis, without a live AI backend.
- Retrieval of educator-reviewed topic units only; prompt isolation and structured tool calls.
- Age-appropriate Uzbek default; Russian and other languages after validation.
- Arithmetic validated with a deterministic math evaluator.
- Follow a bounded learning dialog, not unrestricted companion chat.
- Voice transcripts and image uploads require explicit parental settings, retention policy and legal review.
- Reject requests for personal information and unsafe topics; redirect to trusted adults when appropriate.

## Minimum viable product (MVP)
- Responsive web demo accessible from phone and desktop.
- Grade selector 1–4, topic catalog, maths and reading example lessons.
- Scripted Bilimjon guide with clear demo label; child text Q&A and lightweight voice I/O fallback.
- Parent dashboard showing illustrative data, parent tutoring guide.
- No payment, authentication, actual stored child data, public deployment, analytics or real LLM calls in starter.

## Non-functional and compliance requirements
- Target WCAG 2.2 AA, readable fonts, keyboard access, simple visuals, no dark patterns.
- Data minimization, parent-mediated child participation, explicit consent, encryption, access controls, deletion and export, audit logs, child privacy and local law review before launch.
- No child-targeted advertising, manipulative streaks, loot boxes, or pay-to-win educational outcomes.
- Content copyright licensing and permission are required before importing textbook contents.
- Low-bandwidth/offline-first text lessons desirable.

## Commercial hypotheses (not validated)
- Free core lessons and basic guidance.
- Optional paid family subscription for expanded voice, multiple profiles, detailed reports, richer content.
- School licenses with institution privacy contracts at a later phase.
- Pricing must cover ASR/TTS/LLM, moderation, infra, pedagogy, support and taxes; test willingness to pay before setting prices.

## Metrics
- Primary outcome: independently solved novel transfer exercises after instruction (not simple chat length).
- Learning: pre/post score; control/comparison group if feasible, retention after 2–4 weeks.
- Parent outcome: reduced difficulty helping with homework, self-reported confidence, actual use.
- Product: completion, weekly useful sessions, error/correction rate, parental satisfaction, AI cost per successfully completed lesson.
- Safety: incident rate, inappropriate responses, incorrect pedagogy, speech-recognition errors by age/accent.

## Risks/open questions
- Need curriculum document verification by grade/subject/quarter and language.
- Uzbek children's speech ASR and clear TTS quality need real-world benchmark.
- Pediatric/child privacy and payment-law review before collecting data.
- AI math hallucinations, answer leakage, prompt injection and schoolwork cheating.
- Dependence on low-cost devices/unstable internet.

## Release milestones
P0 discovery & curriculum map → P1 functional safe web MVP with reviewed lessons → P2 pilot 30–50 consenting families and educators → P3 measured learning outcomes & voice benchmarks → P4 full grades/subjects expansion → P5 payment and distribution (only if value demonstrated).
