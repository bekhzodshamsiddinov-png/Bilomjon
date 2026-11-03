# ADR-0001: pnpm monorepo
**Holat:** qabul qilingan · 2026-11-03

**Qaror:** Bitta repozitoriy: `apps/bilimjon` (ilova), `apps/api` (server), `packages/core` (dvigatel), `packages/content` (kontent), `db` (sxema), `legacy` (v0.2 paket).
**Sabab:** dvigatel va kontent ilova, server va testlar o'rtasida bo'lishiladi; bitta CI; o'zgarishlar bitta commitda auditlanadi.
**Oqibat:** pnpm `node-linker=hoisted` (React Native/Metro bilan mos).
