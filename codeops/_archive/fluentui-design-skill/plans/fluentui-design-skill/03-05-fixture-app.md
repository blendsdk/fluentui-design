# Fixture App: fluentui-design-skill

> **Document**: 03-05-fixture-app.md
> **Parent**: [Index](00-index.md)
> **Implements**: RD-08

## Overview

A small Vite + React 18 + TypeScript application that proves the skill's patterns and examples run.
It is a validation artifact: synthetic in-memory data, no backend, no auth, no persistence. It
exercises the list/grid page, the record editor (client/server errors, unsaved changes), the
contextual drawer, and the confirmation dialog with correct keyboard focus, across every runtime
state and at desktop and narrow widths.

## Implementation Details

### File tree

```
fixture/
  index.html
  src/
    main.tsx                 # mounts App in StrictMode; reads query params for state/theme/dir
    App.tsx                  # FluentProvider wrapper; AppShell; CustomersPage
    theme.ts                 # webLightTheme / webDarkTheme selection
    data/customers.ts        # ~24 synthetic Customer rows (deterministic)
    state/useCustomers.ts    # in-memory store: load, save, retry, permission flag
    components/
      AppShell.tsx           # navigation + page heading + commands (application-owned)
      CustomersToolbar.tsx   # filters: search text, status filter, owner filter, clear
      CustomerGrid.tsx       # DataGrid: columns, selection, sort, contextual actions
      CustomerEditor.tsx     # grouped form; client validation; submit lifecycle (reused in drawer)
      CustomerDrawer.tsx     # contextual edit in a Drawer
      ConfirmDialog.tsx      # unsaved-changes / destructive confirmation
      states.tsx             # LoadingState, EmptyState, NoResults, ErrorState
    test-support/sideEffect.ts # side-effect probe used to prove the example gate never runs code
  e2e/
    list.spec.ts
    editor.spec.ts
    overlay-focus.spec.ts
    a11y.spec.ts
```

### Data model and state ownership

```ts
/** A synthetic customer record. No PII; all values are invented. */
export interface Customer {
  id: string;
  name: string;                 // includes one very long value for long-label tests
  email: string;                // one value duplicates another to drive the server-error path
  status: 'active' | 'inactive' | 'pending';
  owner: string;
  updatedAt: string;            // ISO date
  notes: string;
}
```

- `CustomersPage` owns filters, selection, sort, view mode, and the data status
  (`loading | empty | noResults | error | ready`).
- `CustomerEditor` owns a single draft object created when opened and discarded on close; it tracks
  `dirty`, `pending`, and `serverError`. The same component renders inside the drawer and the dialog.
- `useCustomers` exposes `canEdit` (in-memory permission flag, plan AR #9; RD-08 AR #18) and the
  simulated async operations.

### Runtime states

All states are reachable deterministically from a query parameter so tests do not depend on timing:
`?state=loading|empty|no-results|error|ready`. The default (`ready`) drives states through the normal
flow. Long labels are always present; narrow layout is a viewport concern, not a state.

- **loading** — `Skeleton` rows.
- **empty** — `EmptyState` with a primary action.
- **no-results** — distinct from empty, with a "clear filters" action.
- **error** — `MessageBar` (intent `error`) with a retry action.
- **success** — a `Toast`/`MessageBar` confirmation after a save.

### Editor lifecycle

1. Open from a row action (drawer) or the page command (dialog).
2. Client validation on submit: required `name` and a valid `email`; errors appear under the field.
3. Simulated server error: submitting an email that already exists sets `serverError` and a
   `MessageBar` explains the conflict without exposing internals.
4. Pending: submit is disabled and shows a spinner; rapid clicks cannot double-submit.
5. Unsaved changes: closing while `dirty` opens `ConfirmDialog`; Cancel keeps the draft, Confirm
   discards it.
6. `canEdit === false`: fields are read-only and the save command is hidden with an explanatory note.

### Focus and overlays

Drawer and dialog trap focus, close on `Escape`, and return focus to the element that opened them.
`overlay-focus.spec.ts` asserts the return-focus behavior (RD-08 AC 5).

### Theming, direction, and viewport

`App.tsx` reads `?theme=light|dark` and `?dir=ltr|rtl` and applies `FluentProvider` + `dir`.
Accessibility checks run at 1280×800 and 375×812 in both themes (`a11y.spec.ts`). No layout uses a
fixed pixel width that would break at 375 px.

### Styling

`makeStyles` + `tokens` (+ `shorthands`). No overrides of internal DOM or generated class names; no
`dangerouslySetInnerHTML`.

## Error Handling

| Error Case | Handling Strategy | Ref |
| ---------- | ----------------- | --- |
| Data load fails | `ErrorState` + retry; no blank region | RD-08 |
| Empty vs no-results confusion | Two distinct states with different copy/actions | RD-08 |
| Duplicate submit | Disable while pending; test asserts one save call | RD-08 |
| Unsaved changes lost silently | Confirm before discard; test asserts both branches | RD-08 |
| Server error leaks internals | Generic conflict message; no stack trace | RD-08 security |

## Testing Requirements

- E2E specification tests for list/filter/select/action, editor save/cancel and dirty handling,
  overlay focus, and axe at both viewports and themes (`ST-35`..`ST-44`).
- A test asserts no `console.error` or React warning during the tested flows.
- An assertion that the editor's submitted payload is never rendered with unsanitized HTML.
