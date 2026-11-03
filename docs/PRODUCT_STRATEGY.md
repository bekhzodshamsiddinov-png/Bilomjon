# BILIM AI — Product strategy v0.2 (2026-10-29)

## Thesis
Two-sided learning support for Uzbekistan grades 1–4: child learns independently with bounded Bilimjon tutor; parent learns how to support the child without having to know the subject. The outcome is **independently transferable learning**, not app usage or engagement.

## Differentiation (hypotheses, unvalidated)
1. Uzbekistan school-language + academic-year + grade + approved topic alignment; versioned so curriculum updates cannot silently change lessons.
2. Child + parent paired pedagogy: child lesson and matching 10-minute parent coaching guide share the same objective.
3. Uzbek-first voice, benchmarked for children's accents and pronunciation before enabling.
4. Safe constrained tutoring, educator-reviewed scaffolds, independent post-task, with explicit uncertainty / adult escalation.
5. Low-bandwidth, affordable Android-friendly access and limited cached lessons.

## Personas and needs
- Grade 1 pre-fluent reader: icons, short spoken directions, no unrestricted text chatbot.
- Grade 2–4 learner: asks to clarify maths, reading, language and school topics, gets hints instead of solutions.
- Caregiver with little pedagogical knowledge: needs a simple explanation, concrete household demonstrations and actionable weekly summary.
- Teacher/content reviewer: needs source/rights and approval workflow, correction and regression review.

## North star and guardrails
- North star: % of children solving a *new* aligned independent problem after a guided lesson (without hints).
- Secondary: parent confidence/change in homework friction, knowledge retention at 2–4 weeks, usefulness of sessions.
- Guardrails: material error rate, inappropriate replies, speech ASR confusion, minutes of unnecessary screen time, data incidents, AI cost per effective lesson.

## P0 choices
- Single responsive Uzbek web demo first; Android app after validated pilot. No unverified claims of official alignment.
- 4 grades in data model, limited *illustrative* seed topics. Actual released topic requires educational review and source licensing.
- Parent-mediated onboarding and supervised child sessions; child accounts not self-created.
- AI service selected only after safety, voice and cost benchmarks; no hard-coded vendor dependency.

## Business assumptions to test
- Free essential learning and foundational hints; paid optional family extras (multiple child profiles, voice allotment, caregiver insights) only if they create measurable value.
- Zero child-targeted advertising, reward-for-payment, manipulative streaks, pay-to-win curriculum access.
- Test parent willingness to pay with price discovery research; do not treat 39,000 UZS as validated.
- Future institutional license requires procurement, legal and educator partnerships.

## Decision gates
- Gate A: 20+ guardian interviews, 8+ educators, evidence of recurring homework difficulty; revise problem if absent.
- Gate B: educator approves every trial lesson; no actual child PII, real AI or microphone storage in unsigned demo.
- Gate C: supervised pilot with guardian consent, baseline/post and transfer tasks, cost and safety thresholds determined before start.
- Gate D: paid pilot only if usefulness and costs warrant it; no automatic full rollout.
