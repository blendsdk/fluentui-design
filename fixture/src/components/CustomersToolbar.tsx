import {
  Button,
  Dropdown,
  Field,
  Option,
  SearchBox,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { CUSTOMER_OWNERS, STATUS_LABELS, isCustomerStatus } from "../data/customers";
import type { Customer } from "../data/customers";

/**
 * The filter bar for the list page.
 *
 * Filters are fully controlled: the page owns the query state, and this
 * component only reports changes. That keeps filtering logic in one place and
 * keeps the controls presentational.
 */
const useStyles = makeStyles({
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  search: {
    minWidth: "240px",
    flexGrow: 1,
  },
  clear: {
    marginBottom: "2px",
  },
});

/** The selectable status filter values, including the "all" sentinel. */
export type StatusFilter = "all" | Customer["status"];

/** Props for {@link CustomersToolbar}. */
export interface CustomersToolbarProps {
  search: string;
  status: StatusFilter;
  owner: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onOwnerChange: (value: string) => void;
  onClear: () => void;
}

/** Render search and filter controls for the customer list. */
export function CustomersToolbar(props: CustomersToolbarProps) {
  const styles = useStyles();
  const { search, status, owner, onSearchChange, onStatusChange, onOwnerChange, onClear } = props;

  return (
    <div className={styles.toolbar} role="group" aria-label="Customer filters">
      <div className={styles.search}>
        <SearchBox
          aria-label="Search customers"
          placeholder="Search customers"
          value={search}
          onChange={(_event, data) => onSearchChange(data.value)}
        />
      </div>

      <Field label="Status">
        <Dropdown
          selectedOptions={[status]}
          value={status === "all" ? "All statuses" : STATUS_LABELS[status]}
          onOptionSelect={(_event, data) =>
            onStatusChange(isCustomerStatus(data.optionValue) ? data.optionValue : "all")
          }
        >
          <Option value="all">All statuses</Option>
          {(Object.keys(STATUS_LABELS) as Array<Customer["status"]>).map((value) => (
            <Option key={value} value={value}>
              {STATUS_LABELS[value]}
            </Option>
          ))}
        </Dropdown>
      </Field>

      <Field label="Owner">
        <Dropdown
          selectedOptions={[owner]}
          value={owner === "all" ? "All owners" : owner}
          onOptionSelect={(_event, data) => onOwnerChange(data.optionValue ?? "all")}
        >
          <Option value="all">All owners</Option>
          {CUSTOMER_OWNERS.map((name) => (
            <Option key={name} value={name}>
              {name}
            </Option>
          ))}
        </Dropdown>
      </Field>

      <Button className={styles.clear} appearance="secondary" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}
