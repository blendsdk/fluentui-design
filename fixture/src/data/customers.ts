/**
 * Synthetic customer data for the fixture application.
 *
 * Every value is invented; there is no real personal data. The set is fixed and
 * deterministic so that tests can assert exact result counts. Two deliberate
 * oddities exist for the test suite: one very long name for long-label layout,
 * and one email address that appears on two records to drive the editor's
 * simulated server-error path.
 */

/** A synthetic customer record. */
export interface Customer {
  /** Stable identifier, used as the grid row id. */
  id: string;
  /** Display name. Never empty in the seeded data. */
  name: string;
  /** Contact email. `CUS-009` deliberately duplicates `CUS-002`. */
  email: string;
  /** Lifecycle status. */
  status: "active" | "inactive" | "pending";
  /** Account owner, one of {@link CUSTOMER_OWNERS}. */
  owner: string;
  /** Last update date as `YYYY-MM-DD`. */
  updatedAt: string;
  /** Free-form notes kept short. */
  notes: string;
}

/** The owners assigned across the seeded records. */
export const CUSTOMER_OWNERS = ["Ava Thompson", "Ben Carter", "Chloe Adams", "Dan Brooks"] as const;

/** Status labels shown in the UI. */
export const STATUS_LABELS: Readonly<Record<Customer["status"], string>> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
};

/** Narrow an arbitrary value to a customer status. */
export function isCustomerStatus(value: unknown): value is Customer["status"] {
  return value === "active" || value === "inactive" || value === "pending";
}

/** The 24 seeded records. */
export const CUSTOMERS: readonly Customer[] = [
  { id: "CUS-001", name: "Alice Johnson", email: "alice.johnson@example.com", status: "active", owner: "Ava Thompson", updatedAt: "2026-08-01", notes: "Renewal due soon." },
  { id: "CUS-002", name: "Alberto Ruiz", email: "alberto.ruiz@example.com", status: "active", owner: "Ben Carter", updatedAt: "2026-08-03", notes: "Prefers email." },
  { id: "CUS-003", name: "Alexandria Catherine Montgomery-Smythe", email: "alexandria.montgomery@example.com", status: "pending", owner: "Ava Thompson", updatedAt: "2026-08-04", notes: "Long display name." },
  { id: "CUS-004", name: "Barbara Chen", email: "barbara.chen@example.com", status: "active", owner: "Chloe Adams", updatedAt: "2026-08-05", notes: "" },
  { id: "CUS-005", name: "Benjamin Carter", email: "benjamin.carter@example.com", status: "inactive", owner: "Dan Brooks", updatedAt: "2026-08-06", notes: "Paused account." },
  { id: "CUS-006", name: "Carla Mendes", email: "carla.mendes@example.com", status: "active", owner: "Ava Thompson", updatedAt: "2026-08-07", notes: "" },
  { id: "CUS-007", name: "Daniel Okafor", email: "daniel.okafor@example.com", status: "pending", owner: "Ben Carter", updatedAt: "2026-08-08", notes: "Awaiting documents." },
  { id: "CUS-008", name: "Deepa Raman", email: "deepa.raman@example.com", status: "active", owner: "Chloe Adams", updatedAt: "2026-08-09", notes: "" },
  { id: "CUS-009", name: "Edward Fitzgerald", email: "alberto.ruiz@example.com", status: "inactive", owner: "Dan Brooks", updatedAt: "2026-08-10", notes: "Duplicate email on purpose." },
  { id: "CUS-010", name: "Fatima Nasser", email: "fatima.nasser@example.com", status: "active", owner: "Ava Thompson", updatedAt: "2026-08-11", notes: "" },
  { id: "CUS-011", name: "Gabriel Silva", email: "gabriel.silva@example.com", status: "pending", owner: "Ben Carter", updatedAt: "2026-08-12", notes: "" },
  { id: "CUS-012", name: "Hannah Weber", email: "hannah.weber@example.com", status: "active", owner: "Chloe Adams", updatedAt: "2026-08-13", notes: "" },
  { id: "CUS-013", name: "Ivan Petrov", email: "ivan.petrov@example.com", status: "inactive", owner: "Dan Brooks", updatedAt: "2026-08-14", notes: "" },
  { id: "CUS-014", name: "Julia Nakamura", email: "julia.nakamura@example.com", status: "active", owner: "Ava Thompson", updatedAt: "2026-08-15", notes: "" },
  { id: "CUS-015", name: "Kevin OBrien", email: "kevin.obrien@example.com", status: "pending", owner: "Ben Carter", updatedAt: "2026-08-16", notes: "" },
  { id: "CUS-016", name: "Laura Kim", email: "laura.kim@example.com", status: "active", owner: "Chloe Adams", updatedAt: "2026-08-17", notes: "" },
  { id: "CUS-017", name: "Malik Johnson", email: "malik.johnson@example.com", status: "inactive", owner: "Dan Brooks", updatedAt: "2026-08-18", notes: "" },
  { id: "CUS-018", name: "Nadia Haddad", email: "nadia.haddad@example.com", status: "active", owner: "Ava Thompson", updatedAt: "2026-08-19", notes: "" },
  { id: "CUS-019", name: "Oscar Lindqvist", email: "oscar.lindqvist@example.com", status: "pending", owner: "Ben Carter", updatedAt: "2026-08-20", notes: "" },
  { id: "CUS-020", name: "Priya Sharma", email: "priya.sharma@example.com", status: "active", owner: "Chloe Adams", updatedAt: "2026-08-21", notes: "" },
  { id: "CUS-021", name: "Quentin Adler", email: "quentin.adler@example.com", status: "inactive", owner: "Dan Brooks", updatedAt: "2026-08-22", notes: "" },
  { id: "CUS-022", name: "Rosa Garcia", email: "rosa.garcia@example.com", status: "active", owner: "Ava Thompson", updatedAt: "2026-08-23", notes: "" },
  { id: "CUS-023", name: "Samuel Wright", email: "samuel.wright@example.com", status: "pending", owner: "Ben Carter", updatedAt: "2026-08-24", notes: "" },
  { id: "CUS-024", name: "Tanya Volkova", email: "tanya.volkova@example.com", status: "active", owner: "Chloe Adams", updatedAt: "2026-08-25", notes: "" },
];
