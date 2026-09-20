import {
  Badge,
  Button,
  Checkbox,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  TableCellActions,
  TableCellLayout,
  createTableColumn,
  useRestoreFocusTarget,
} from "@fluentui/react-components";
import type { TableColumnDefinition, TableRowId } from "@fluentui/react-components";
import type { Customer } from "../data/customers";
import { STATUS_LABELS } from "../data/customers";

/**
 * A row action button that remembers it opened the drawer.
 *
 * The restore-focus target attribute is applied per instance so focus returns
 * to the exact row button that opened the contextual editor.
 */
function RowEditButton(props: {
  customer: Customer;
  disabled: boolean;
  onClick: (customer: Customer) => void;
}) {
  const restoreFocusTarget = useRestoreFocusTarget();
  const { customer, disabled, onClick } = props;
  return (
    <Button
      {...restoreFocusTarget}
      appearance="subtle"
      disabled={disabled}
      onClick={() => onClick(customer)}
    >
      Edit
    </Button>
  );
}

/** The badge colour for each lifecycle status. */
const STATUS_COLORS: Readonly<Record<Customer["status"], "success" | "informative" | "warning">> = {
  active: "success",
  inactive: "informative",
  pending: "warning",
};

/** Props for {@link CustomerGrid}. */
export interface CustomerGridProps {
  customers: Customer[];
  /** The selected row ids, controlled by the page. */
  selectedItems: Set<TableRowId>;
  /** Report a selection change to the page. */
  onSelectionChange: (items: Set<TableRowId>) => void;
  /** Open the editor for one record. */
  onEdit: (customer: Customer) => void;
  /** Whether the viewer may edit records. */
  canEdit: boolean;
}

/**
 * The customer grid.
 *
 * Selection and sorting are handled by the DataGrid; the page owns the selected
 * ids so it can drive the contextual action. Columns are defined once with a
 * `compare` for the sortable fields.
 */
export function CustomerGrid(props: CustomerGridProps) {
  const { customers, selectedItems, onSelectionChange, onEdit, canEdit } = props;

  const columns: TableColumnDefinition<Customer>[] = [
    createTableColumn<Customer>({
      columnId: "selection",
      renderHeaderCell: () => {
        const allSelected = customers.length > 0 && customers.every((c) => selectedItems.has(c.id));
        const someSelected = customers.some((c) => selectedItems.has(c.id));
        return (
          <Checkbox
            aria-label="Select all customers"
            checked={allSelected ? true : someSelected ? "mixed" : false}
            onChange={(_event, data) => {
              const next = new Set(selectedItems);
              for (const customer of customers) {
                if (data.checked) {
                  next.add(customer.id);
                } else {
                  next.delete(customer.id);
                }
              }
              onSelectionChange(next);
            }}
          />
        );
      },
      renderCell: (item) => (
        <Checkbox
          aria-label={`Select ${item.name}`}
          checked={selectedItems.has(item.id)}
          onChange={(_event, data) => {
            const next = new Set(selectedItems);
            if (data.checked) {
              next.add(item.id);
            } else {
              next.delete(item.id);
            }
            onSelectionChange(next);
          }}
        />
      ),
    }),
    createTableColumn<Customer>({
      columnId: "name",
      compare: (a, b) => a.name.localeCompare(b.name),
      renderHeaderCell: () => "Name",
      renderCell: (item) => <TableCellLayout>{item.name}</TableCellLayout>,
    }),
    createTableColumn<Customer>({
      columnId: "email",
      compare: (a, b) => a.email.localeCompare(b.email),
      renderHeaderCell: () => "Email",
      renderCell: (item) => <TableCellLayout>{item.email}</TableCellLayout>,
    }),
    createTableColumn<Customer>({
      columnId: "status",
      compare: (a, b) => a.status.localeCompare(b.status),
      renderHeaderCell: () => "Status",
      renderCell: (item) => (
        <TableCellLayout>
          <Badge appearance="filled" color={STATUS_COLORS[item.status]}>
            {STATUS_LABELS[item.status]}
          </Badge>
        </TableCellLayout>
      ),
    }),
    createTableColumn<Customer>({
      columnId: "owner",
      compare: (a, b) => a.owner.localeCompare(b.owner),
      renderHeaderCell: () => "Owner",
      renderCell: (item) => <TableCellLayout>{item.owner}</TableCellLayout>,
    }),
    createTableColumn<Customer>({
      columnId: "updatedAt",
      compare: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      renderHeaderCell: () => "Updated",
      renderCell: (item) => <TableCellLayout>{item.updatedAt}</TableCellLayout>,
    }),
    createTableColumn<Customer>({
      columnId: "actions",
      renderHeaderCell: () => "Actions",
      renderCell: (item) => (
        <TableCellActions>
          <RowEditButton customer={item} disabled={!canEdit} onClick={onEdit} />
        </TableCellActions>
      ),
    }),
  ];

  return (
    <DataGrid
      aria-label="Customers"
      items={customers}
      columns={columns}
      getRowId={(item) => item.id}
      focusMode="composite"
      defaultSortState={{ sortColumn: "name", sortDirection: "ascending" }}
    >
      <DataGridHeader>
        <DataGridRow>
          {({ renderHeaderCell }) => (
            <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
          )}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody<Customer>>
        {({ item, rowId }) => (
          <DataGridRow<Customer> key={rowId}>
            {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
}
