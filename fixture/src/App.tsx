import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  FluentProvider,
  MessageBar,
  MessageBarBody,
  Text,
  makeStyles,
  tokens,
  useRestoreFocusSource,
  useRestoreFocusTarget,
} from "@fluentui/react-components";
import type { TableRowId } from "@fluentui/react-components";
import { AppShell } from "./components/AppShell";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CustomerDrawer } from "./components/CustomerDrawer";
import { CustomerEditor } from "./components/CustomerEditor";
import type { CustomerEditorErrors } from "./components/CustomerEditor";
import { CustomerGrid } from "./components/CustomerGrid";
import { CustomersToolbar } from "./components/CustomersToolbar";
import type { StatusFilter } from "./components/CustomersToolbar";
import { EmptyState, ErrorState, LoadingState, NoResults } from "./components/states";
import type { Customer } from "./data/customers";
import { draftFromCustomer, emptyDraft, useCustomers } from "./state/useCustomers";
import type { CustomerDraft, DataStatus } from "./state/useCustomers";
import { resolveTheme } from "./theme";
import type { Direction, ThemeName } from "./theme";

/** Props for {@link App}. */
export interface AppProps {
  /** The data status the page opens with. */
  initialState: DataStatus;
  themeName: ThemeName;
  direction: Direction;
  /** A query-param shortcut that opens the editor, used by accessibility tests. */
  openEditor?: "new" | "edit";
  /** Whether the viewer may edit records. */
  canEdit: boolean;
}

/**
 * The fixture application root.
 *
 * It selects the theme and text direction from its props and provides the
 * Fluent provider for the whole tree.
 */
export function App(props: AppProps) {
  const { initialState, themeName, direction, openEditor, canEdit } = props;
  return (
    <FluentProvider theme={resolveTheme(themeName)} dir={direction}>
      <AppShell>
        <CustomersPage initialState={initialState} openEditor={openEditor} canEdit={canEdit} />
      </AppShell>
    </FluentProvider>
  );
}

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  contextBar: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
  },
  saveMessage: {
    marginBottom: tokens.spacingVerticalM,
  },
  count: {
    marginBottom: tokens.spacingVerticalS,
  },
});

/** The list page: filters, selection, the contextual action, and the editor. */
function CustomersPage(props: {
  initialState: DataStatus;
  openEditor?: "new" | "edit";
  canEdit: boolean;
}) {
  const { initialState, openEditor, canEdit } = props;
  const styles = useStyles();
  const store = useCustomers(initialState, canEdit);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<Set<TableRowId>>(() => new Set());

  const [editorMode, setEditorMode] = useState<"new" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState<CustomerDraft>(emptyDraft);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [clientErrors, setClientErrors] = useState<CustomerEditorErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<"new" | "edit" | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | undefined>(undefined);
  const pendingRef = useRef(false);
  const restoreFocusTarget = useRestoreFocusTarget();
  const restoreFocusSource = useRestoreFocusSource();

  const hasFilters = search.trim() !== "" || statusFilter !== "all" || ownerFilter !== "all";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return store.customers
      .filter((customer) => term === "" || customer.name.toLowerCase().includes(term))
      .filter((customer) => statusFilter === "all" || customer.status === statusFilter)
      .filter((customer) => ownerFilter === "all" || customer.owner === ownerFilter);
  }, [store.customers, search, statusFilter, ownerFilter]);

  const viewState =
    store.status === "ready"
      ? store.customers.length === 0
        ? "empty"
        : filtered.length === 0
          ? hasFilters
            ? "noResults"
            : "empty"
          : "ready"
      : store.status;

  const resetEditorState = () => {
    setDirty(false);
    setPending(false);
    setServerError(false);
    setClientErrors({});
  };

  const beginNew = () => {
    setDraft(emptyDraft());
    setEditingId(undefined);
    resetEditorState();
    setEditorMode("new");
  };

  const beginEdit = (customer: Customer) => {
    setDraft(draftFromCustomer(customer));
    setEditingId(customer.id);
    resetEditorState();
    setEditorMode("edit");
  };

  const closeEditor = () => {
    setEditorMode(null);
    setPendingMode(null);
    setConfirmOpen(false);
    resetEditorState();
  };

  const requestClose = () => {
    if (dirty) {
      // Close the editor overlay first, then ask. Keeping two modals open at
      // once leaves the lower one inert, so the confirmation stands alone.
      setPendingMode(editorMode);
      setEditorMode(null);
      setConfirmOpen(true);
    } else {
      closeEditor();
    }
  };

  const keepEditing = () => {
    setConfirmOpen(false);
    setEditorMode(pendingMode);
    setPendingMode(null);
  };

  useEffect(() => {
    if (openEditor === "new") {
      beginNew();
    } else if (openEditor === "edit" && store.customers[0] !== undefined) {
      beginEdit(store.customers[0]);
    }
  }, []);

  const handleChange = (patch: Partial<CustomerDraft>) => {
    setDraft((previous) => ({ ...previous, ...patch }));
    setDirty(true);
  };

  const validate = (value: CustomerDraft): CustomerEditorErrors => {
    const errors: CustomerEditorErrors = {};
    if (value.name.trim() === "") {
      errors.name = "Name is required";
    }
    const email = value.email.trim();
    if (email === "") {
      errors.email = "Email is required";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }
    return errors;
  };

  const handleSave = async () => {
    if (pendingRef.current) {
      return;
    }
    const errors = validate(draft);
    setClientErrors(errors);
    setServerError(false);
    if (Object.keys(errors).length > 0) {
      return;
    }

    pendingRef.current = true;
    setPending(true);
    const result = await store.save(draft, editingId);
    pendingRef.current = false;
    setPending(false);

    if (!result.ok) {
      setServerError(true);
      return;
    }
    setSaveMessage(editingId === undefined ? "Customer saved." : "Customer updated.");
    closeEditor();
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setOwnerFilter("all");
    if (store.status === "noResults") {
      store.resetStatus();
    }
  };

  const editSelected = () => {
    const first = selectedItems.values().next().value;
    const customer = store.customers.find((candidate) => candidate.id === first);
    if (customer !== undefined) {
      beginEdit(customer);
    }
  };

  const renderEditor = () => (
    <CustomerEditor
      draft={draft}
      errors={clientErrors}
      serverError={serverError}
      pending={pending}
      canEdit={canEdit}
      onChange={handleChange}
      onSave={handleSave}
      onCancel={requestClose}
    />
  );

  return (
    <>
      <div className={styles.header}>
        <Text as="h1" size={700} weight="semibold">
          Customers
        </Text>
        <Button appearance="primary" {...restoreFocusTarget} onClick={beginNew} disabled={!canEdit}>
          New customer
        </Button>
      </div>

      <CustomersToolbar
        search={search}
        status={statusFilter}
        owner={ownerFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onOwnerChange={setOwnerFilter}
        onClear={clearFilters}
      />

      {saveMessage !== undefined && (
        <MessageBar intent="success" className={styles.saveMessage}>
          <MessageBarBody>{saveMessage}</MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.contextBar}>
        <Text>{`${selectedItems.size} selected`}</Text>
        <Button
          appearance="secondary"
          onClick={editSelected}
          disabled={selectedItems.size === 0 || !canEdit}
        >
          Edit selected
        </Button>
      </div>

      {viewState === "loading" && <LoadingState />}
      {viewState === "error" && <ErrorState onRetry={store.retry} />}
      {viewState === "empty" && <EmptyState onCreate={beginNew} canEdit={canEdit} />}
      {viewState === "noResults" && <NoResults onClear={clearFilters} />}
      {viewState === "ready" && (
        <>
          <Text className={styles.count} block>{`Showing ${filtered.length} of ${store.customers.length} customers`}</Text>
          <CustomerGrid
            customers={filtered}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onEdit={beginEdit}
            canEdit={canEdit}
          />
        </>
      )}

      <Dialog
        open={editorMode === "new"}
        onOpenChange={(_event, data) => {
          if (!data.open) {
            requestClose();
          }
        }}
      >
        <DialogSurface {...restoreFocusSource}>
          <DialogBody>
            <DialogTitle>New customer</DialogTitle>
            <DialogContent>{renderEditor()}</DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <CustomerDrawer
        open={editorMode === "edit"}
        title="Edit customer"
        onClose={requestClose}
      >
        {renderEditor()}
      </CustomerDrawer>

      <ConfirmDialog
        open={confirmOpen}
        onKeepEditing={keepEditing}
        onDiscard={closeEditor}
      />
    </>
  );
}
