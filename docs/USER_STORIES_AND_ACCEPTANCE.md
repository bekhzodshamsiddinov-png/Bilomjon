# MVP user stories and acceptance criteria

## Child
C1 Choose grade 1–4: tiles and year/language constraints are correct; missing lessons say unavailable, not fake.
C2 Choose subject -> quarter -> approved topic; no blank page or fabricated topics.
C3 Ask Bilimjon by text; respond in manageable Uzbek, with linked lesson objective, guided hint and explicit demo label until connected to reviewed content.
C4 Ask by voice after guardian permission: show recording state, confirm transcript, allow correction; typing alternative always works.
C5 Finish lesson: 1 guided and 1 new independent exercise, deterministic grading, explanation and retry.
C6 Accessibility: keyboard focus, readable buttons, supports zoom, alt text and touch targets; early-reader interface has audio option.

## Guardian
P1 First signup is parent-mediated; no child self-registration, consent/version recorded before storing data.
P2 Link profiles without collecting excess identifiers; guardians can revoke mic and delete child data.
P3 Open matching lesson's 'teach me' and 'teach my child' guides; language plain and household-friendly.
P4 View mastery estimates and uncertainty; sample metrics must be marked demo until generated from actual approved exercises.
P5 Understand subscription and free features before payment; billing controlled by adult only.

## Educator / admin
E1 Review curriculum source, rights, objectives and questions; publish only after approval.
E2 Roll back defective content by version and notify affected sessions where needed.
E3 See redacted safety/correctness review cases, never unrestricted PII logs.

## Definition of done for real MVP
- Automated tests on maths grading, grade filtering, permission control and safety gates.
- Approved content provenance for every published lesson.
- Explicit distinction between scripted demo and AI-backed production.
- No live credentials or client-side model API keys.
- Signed privacy/consent process and independent security review before any real child use.
