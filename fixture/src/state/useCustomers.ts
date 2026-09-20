import { useCallback, useState } from "react";
import { CUSTOMER_OWNERS, CUSTOMERS } from "../data/customers";
import type { Customer } from "../data/customers";
import { recordSaveCall } from "../test-support/sideEffect";

/**
 * The data status the page can render. `ready` means data is present and the
 * active filters may still reduce it to no matches, which the page shows as
 * `noResults`; the seeded `noResults` value lets a test open that state directly.
 */
export type DataStatus = "loading" | "empty" | "noResults" | "error" | "ready";

/** The editable fields of a customer record. */
export interface CustomerDraft {
  name: string;
  email: string;
  status: Customer["status"];
  owner: string;
  notes: string;
}

/** The outcome of a save attempt. */
export type SaveResult = { ok: true } | { ok: false; reason: "duplicate-email" };

/** The simulated network latency, long enough to observe the pending state. */
export const SAVE_DELAY_MS = 600;

/** Wait for `ms` milliseconds. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Build the next stable customer id from the existing records. */
function nextCustomerId(existing: readonly Customer[]): string {
  const highest = existing.reduce((max, customer) => {
    const value = Number.parseInt(customer.id.replace("CUS-", ""), 10);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);
  return `CUS-${String(highest + 1).padStart(3, "0")}`;
}

/** A blank draft for creating a new customer. */
export function emptyDraft(): CustomerDraft {
  return { name: "", email: "", status: "active", owner: CUSTOMER_OWNERS[0], notes: "" };
}

/** Copy an existing customer into a draft. */
export function draftFromCustomer(customer: Customer): CustomerDraft {
  return {
    name: customer.name,
    email: customer.email,
    status: customer.status,
    owner: customer.owner,
    notes: customer.notes,
  };
}

/** The in-memory customer store. */
export interface CustomersStore {
  /** The current data status. */
  status: DataStatus;
  /** The loaded records. */
  customers: Customer[];
  /** Whether the current viewer may edit records. */
  canEdit: boolean;
  /** Persist a draft, returning a conflict result for a duplicate email. */
  save: (draft: CustomerDraft, currentId?: string) => Promise<SaveResult>;
  /** Recover from the failure state by reloading the seeded data. */
  retry: () => void;
  /** Leave a non-ready status (empty, no-results, or error) once data is shown. */
  resetStatus: () => void;
}

/**
 * Provide the fixture's customer data and simulated operations.
 *
 * All data is in memory. The initial status is supplied by the page so that a
 * runtime state can be opened directly from a query parameter, which keeps
 * tests independent of timing. `canEdit` models a permission flag; it is a
 * presentation switch, not a security control.
 *
 * @param initialStatus - The status to open with.
 * @param canEdit - Whether editing is allowed. Defaults to `true`.
 */
export function useCustomers(initialStatus: DataStatus, canEdit = true): CustomersStore {
  const [status, setStatus] = useState<DataStatus>(initialStatus);
  const [customers, setCustomers] = useState<Customer[]>(
    initialStatus === "empty" ? [] : [...CUSTOMERS],
  );

  const save = useCallback(
    async (draft: CustomerDraft, currentId?: string): Promise<SaveResult> => {
      recordSaveCall();
      await delay(SAVE_DELAY_MS);

      const email = draft.email.trim().toLowerCase();
      const duplicate = customers.some(
        (customer) => customer.id !== currentId && customer.email.toLowerCase() === email,
      );
      if (duplicate) {
        return { ok: false, reason: "duplicate-email" };
      }

      setCustomers((previous) => {
        if (currentId !== undefined) {
          return previous.map((customer) =>
            customer.id === currentId
              ? { ...customer, ...draft, updatedAt: new Date().toISOString().slice(0, 10) }
              : customer,
          );
        }
        return [
          ...previous,
          {
            id: nextCustomerId(previous),
            ...draft,
            email: draft.email.trim(),
            updatedAt: new Date().toISOString().slice(0, 10),
          },
        ];
      });
      setStatus("ready");
      return { ok: true };
    },
    [customers],
  );

  const retry = useCallback(() => {
    setCustomers((previous) => (previous.length === 0 ? [...CUSTOMERS] : previous));
    setStatus("ready");
  }, []);

  const resetStatus = useCallback(() => {
    setStatus("ready");
  }, []);

  return { status, customers, canEdit, save, retry, resetStatus };
}
