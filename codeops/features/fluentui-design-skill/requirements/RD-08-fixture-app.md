# RD-08: Runnable Fixture App

> **Document**: RD-08-fixture-app.md
> **Status**: Draft
> **Created**: 2026-09-20
> **Project**: fluentui-design
> **Depends On**: RD-01, RD-05
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

This requirement defines a small runnable TypeScript application that proves the skill's patterns
and examples actually work. It is a **validation artifact, not a production backend**: in-memory
sample data, no authentication, no persistence. Its value is that every claim in the skill can be
exercised — filters, selection, contextual actions, editing with error states and unsaved-change
handling, a drawer, and a confirmation dialog with correct focus behavior — across loading, empty,
no-results, failure, success, long-label, narrow, RTL, and themed conditions.

**Complexity**: L

---

## Functional Requirements

### Must Have
- [ ] The app lives at `fixture/` and builds with Vite + React 18 + TypeScript, pinned by an npm lockfile.
- [ ] It uses only verified `@fluentui/react-components` exports and wraps the tree in `FluentProvider` with a supported theme.
- [ ] It styles with semantic tokens and the supported styling approach for the pinned v9 version; it does not override internal DOM or class names.
- [ ] It uses semantic HTML where no Fluent component is needed.
- [ ] It implements: (a) a responsive list/grid page with filters, selection, and contextual actions; (b) a record editor with client and simulated server error states and unsaved-changes handling; (c) a contextual drawer and a confirmation dialog with keyboard focus handling.
- [ ] It renders runtime states: loading, empty data, no search results, failure, success, long labels, and narrow layouts.
- [ ] A permission/read-only demonstration uses an in-memory flag (AR #18).
- [ ] It produces no console errors or React warnings during the tested flows.
- [ ] The app documents which patterns are original project synthesis.

### Should Have
- [ ] It demonstrates light and dark themes and an RTL layout (`dir='rtl'`).
- [ ] It demonstrates reduced-motion and forced-colors responsiveness where the components allow.
- [ ] Playwright tests cover the list/filter/select/action, editor save/cancel with unsaved changes, drawer open/close, and dialog open/Escape/return-focus flows; axe-core runs on representative pages.

### Won't Have (Out of Scope)
- A backend, database, authentication, or persistence (AR #11, #14).
- Full server-side validation implementation — the skill documents it; the fixture simulates the server error path.
- A form/routing/data-fetching library mandate; keep dependencies minimal and pinned (AR #2).

---

## Technical Requirements

### Stack

| Concern | Choice |
|---------|--------|
| Build | Vite, TypeScript |
| Runtime | React 18 |
| UI | `@fluentui/react-components` (pinned), `@fluentui/react-icons` |
| Styling | `makeStyles` + `tokens` (+ `shorthands`) |
| Test | Vitest for logic; Playwright + axe-core for browser/a11y |
| Data | In-memory fixtures, no network |

### State ownership

- Page-level state (filters, selection, view mode) lives in the page component.
- Editor state lives in a single draft object created on open and discarded on close; the form body is a reusable component mounted in either the dialog or the drawer.
- Unsaved-changes handling tracks dirty state and confirms before discarding.
- Submission simulates pending and duplicate-submission prevention.

### Error and empty states

Each data region branches across loading (Skeleton), empty, no-results, error (MessageBar with retry), and ready, so no region can render blank on failure.

### Focus behavior

Dialog and drawer trap focus, close on Escape, and restore focus to the trigger; the fixture test asserts focus return.

---

## Integration Points

### With RD-05 (Patterns)
- The fixture implements representative patterns (list page, editor, drawer, dialog, shell) and is their runtime proof.

### With RD-07 (Verification Tooling)
- The fixture's lockfile pins the package the example gate compiles against; the fixture's own tests run under `verify`.

### With RD-09 (Evaluation)
- Evaluation tasks reference fixture flows and record observed defects and viewport sizes.

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| Stack | Vite / Next / CRA | Vite + React 18 + TS | Smallest mainstream runnable stack | AR #2, #19 |
| Data | in-memory / mock server / backend | in-memory | No backend is authorized | AR #11 |
| Security posture | implement auth / client demo | client validation demo; server validation documented | The fixture is not a product | AR #14 |
| Permissions | omit / in-memory flag | in-memory flag | Demonstrates read-only patterns safely | AR #18 |

---

## Security Considerations

- **Data sensitivity**: Uses synthetic sample data only; no PII or real records.
- **Input validation**: Client-side validation is demonstrated and clearly labeled advisory; the skill states server-side validation is mandatory.
- **Authentication & authorization**: Not implemented; read-only/permission presentation is demonstrated with an in-memory flag and must not imply real security.
- **Injection risks**: No `dangerouslySetInnerHTML`; all rendered text is escaped by React.
- **Encryption needs**: N/A — no data leaves the browser.
- **Rate limiting**: Duplicate-submission prevention is demonstrated for the editor; no rate-limited endpoints exist.
- **Infrastructure**: Static local build only; no deployment.

---

## Acceptance Criteria

1. [ ] `fixture/` builds and type-checks with the pinned lockfile; the build exits 0.
2. [ ] The list page supports filtering, selection, and a contextual action, and renders loading, empty, no-results, error, and ready states (each reachable in tests).
3. [ ] The editor reports a client error for an empty required field, simulates a server error on one path, and prevents duplicate submission while pending.
4. [ ] Closing the editor with unsaved changes prompts before discarding; cancelling preserves the draft and confirms to close discards it.
5. [ ] The confirmation dialog and drawer trap focus, close on Escape, and return focus to their trigger (asserted by a Playwright test).
6. [ ] axe-core reports zero critical/serious violations on the list and editor pages in light and dark themes at a desktop and a narrow (≈375 px) viewport.
7. [ ] No console errors or React warnings occur during the tested flows.
8. [ ] Security requirements verified (no real data, no `dangerouslySetInnerHTML`, server validation documented as mandatory, permission demo labeled non-security).
