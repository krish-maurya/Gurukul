# GURUKUL — Full System Audit & Bug Report

**Audited:** current `main` (commit `2e0252f`), fresh clone, production build + runtime testing of every page and API route.
**Verdict:** the system builds and demos well, but it is **not production-ready**. Several subsystems are disconnected from each other (mock UI vs real DB), deployment is broken out-of-the-box, and there is no real security layer.

Legend: 🔴 P0 = breaks deployment/data · 🟠 P1 = broken feature/user-visible · 🟡 P2 = quality/robustness · ⚪ P3 = hardening/roadmap

---

## 🔴 P0 — Deployment blockers

### 1. Broken Prisma migration history — fresh deploys FAIL
`prisma/migrations/` contains only `20260814180000_add_timetable_proxy_assignment`, which ALTERs/references tables (`Staff`, `TimetableSlot`…) that no migration ever creates. On any fresh database:
```
npx prisma migrate deploy  →  Error: no such table: Staff  (P3009)
```
The base schema only ever existed via `prisma db push` on the dev machine. **Any production deploy fails.**
**FIXED:** migrations squashed into a single `0_init` baseline generated from the schema; `migrate deploy` verified working on a clean DB. (Existing dev DBs: run `npx prisma migrate resolve --applied 0_init` once, or recreate.)

### 2. No `.env` / no `.env.example` / no setup docs
`DATABASE_URL` is required but undocumented. Fresh clone → every DB route 500s. There is no README with setup steps at all.
**FIXED:** added `.env.example` + `README.md` with quickstart.

### 3. `prisma db seed` is broken
`package.json` → `"prisma": { "seed": "ts-node prisma/seed.ts" }` but `ts-node` is not a dependency (the project uses `tsx`). `npx prisma db seed` always fails.
**FIXED:** changed to `tsx prisma/seed.ts`.

### 4. `/api/timetable/teachers` is statically baked at build time
The route has no dynamic marker, so `next build` pre-renders it (**○ Static** in build output). In production it serves the teacher list **frozen at build time** — new/edited teachers never appear.
**FIXED:** `export const dynamic = "force-dynamic"`.

---

## 🟠 P1 — Broken / disconnected features

### 5. Students page shows HARDCODED data, not the database
`app/students/page.tsx` renders `SAMPLE_STUDENTS` (Liam Sterling, Sophia Chen…). The real `/api/students` endpoint exists and works, but the page never calls it. Consequences:
- Students created via OCR-approve or API **never appear** in the registry.
- Clicking a sample student navigates to `/students/std-101` → **404 page** (detail page reads the real DB).
- The "Add Student" button does nothing (no handler).

### 6. Staff page shows HARDCODED data, not the database
Same problem: `SAMPLE_STAFF` list; `/staff/[id]` reads the DB → list→detail navigation 404s. Seeded teachers (Ada Lovelace etc.) that the timetable actually uses are not shown.

### 7. Documents page: "Approve & Create Student Record" creates NOTHING
`app/documents/page.tsx` has **zero fetch calls**:
- The queue is `INITIAL_QUEUE` mock data; the seeded documents in the DB (`/api/documents` works) are never loaded.
- Approving only mutates client state — **no student record and no document row is ever persisted**. Refresh = everything lost. The button's label is a lie.

### 8. `POST /api/students` — contract mismatch + no validation
- Expects `body.studentName`, but GET returns `name` — inconsistent contract; a natural `{name: ...}` POST → Prisma throws → 500.
- Zero input validation: missing required fields → unhandled Prisma error → generic 500.
- Error swallowed with no logging (see #12).
- Every student gets `rollNumber = 1` (schema `@default(1)`) — duplicate roll numbers forever; attendance sorts by rollNumber so ordering is meaningless.
**FIXED:** accepts `name` or `studentName`; validates required fields (400 with field list); auto-assigns next rollNumber per grade; logs errors.

### 9. Authentication is cosmetic (client-side mock)
- Login page: the password field is decorative (`useState("••••••••")`) — any click logs in; session is a `localStorage` flag.
- **Every API route except copilot is completely unauthenticated** — anyone can POST/modify students, attendance, timetable.
- Copilot trusts the client-supplied `x-gurukul-user-id` header — trivially spoofable.
- Route guard is client-side only (`app-shell` checks pathname) — all data pages render server-side without any session check.
**FIXED (feature/postgres-auth-timetable):** native credentials auth — bcrypt password hashes, signed HTTP-only JWT session cookies, `middleware.ts` protecting every page/API, admin-only invitation links for teacher onboarding, copilot identity derived from the server session (spoofable header removed), mock role-switcher removed.

---

## 🟡 P2 — Robustness / quality bugs

### 10. Tests are not isolated — they run against the live dev DB
`verification.test.ts` reads/mutates `dev.db`. After I exercised `/api/timetable/absences` once, the suite FAILED ("Expected Ada and Grace in proxy recommendations") until the DB was re-seeded. Tests must seed their own throwaway DB (e.g. `DATABASE_URL=file:./test.db` setup/teardown) or they'll be flaky in CI.

### 11. `/api/timetable/absences` has no GET (405) but the UI may poll it
Only POST is exported. Method-not-allowed responses are empty — fine, but document the contract or add a GET returning absences for a date (the proxy panel needs it after reload).

### 12. Errors swallowed silently across API routes
14 `catch` blocks in `app/api/**`, only 2 `console.error`. Real failure causes (validation, FK violations, disk full) are invisible — you cannot debug production.
**FIXED (partially):** added `console.error` to students/documents/attendance routes.

### 13. SQLite in production
Fine for demo; not for a multi-user school system (single-writer lock, no concurrent transactions at scale, file lives on ephemeral disk on Vercel — **data loss on redeploy**). Move `provider` to PostgreSQL before real users; the schema is already portable (String dates, Int money).

### 14. `attendance` POST: delete-and-rewrite without entry validation
Re-submitting deletes all entries then recreates from client payload with no shape validation — a malformed client wipes a period's attendance. Add zod (or manual) validation of `entries[]`.

### 15. Dashboard (`app/page.tsx`) and `admin/roles` are fully static mock UIs
KPIs/charts are hardcoded; roles page manages nothing. Fine for demo — must be wired or removed for production.

---

## ⚪ P3 — Hardening / roadmap (deferred, in priority order)

1. **Wire the three mock pages to the real APIs** (students list, staff list, documents queue) — the DB and endpoints already exist; this is mostly replacing constants with `fetch` + loading states.
2. **Persist the OCR approve flow**: POST the document to `/api/documents` after scan; on approve, POST `/api/students` (contract now accepts the extracted field names) and PATCH document status.
3. **Real auth**: Auth.js with credentials/Google, server-side session in `middleware.ts`, role checks in every route handler, derive copilot identity from the session — delete the spoofable header.
4. **Postgres + connection pooling** (Neon/Supabase/RDS), `prisma migrate deploy` in CI.
5. **Test isolation + CI**: separate test DB, run `optimizer.test.ts` + `verification.test.ts` + `tsc --noEmit` on every push (GitHub Actions).
6. **Input validation layer** (zod) shared by all routes; consistent error envelope `{error, details}`.
7. **Observability**: structured logs, health endpoint, Sentry.
8. PDF support in the OCR dropzone (currently accepted but unsupported by tesseract.js) — render page 1 via `pdfjs-dist` or remove from `accept`.

---

## Verified-working ✅ (for the record)

- Production build compiles clean; `tsc --noEmit` zero errors.
- All 9 pages return 200; students/staff **detail** pages correctly server-render from the DB (incl. 404 for missing IDs).
- `/api/students` GET, `/api/search`, `/api/attendance` GET+POST (idempotent re-submit), `/api/documents` GET+POST, `/api/timetable` + conflicts + absences POST + proxy select — all functional against the seeded DB.
- Timetable optimizer test suite: PASS. Proxy verification suite: PASS (on a clean DB — see #10).
- OCR pipeline (v2.1) present and correct in `lib/document/*`.
- Copilot engine correctly 401s without identity and answers with it (mock identity model noted in #9).
