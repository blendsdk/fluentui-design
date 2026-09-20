import {
  Button,
  Dropdown,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Option,
  Spinner,
  Textarea,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import type { Customer } from "../data/customers";
import { CUSTOMER_OWNERS, STATUS_LABELS, isCustomerStatus } from "../data/customers";
import type { CustomerDraft } from "../state/useCustomers";

/** Field-level validation messages shown under the controls. */
export interface CustomerEditorErrors {
  name?: string;
  email?: string;
}

/** Props for {@link CustomerEditor}. */
export interface CustomerEditorProps {
  draft: CustomerDraft;
  errors: CustomerEditorErrors;
  /** True after the simulated server rejected the last submit. */
  serverError: boolean;
  /** True while a save is in flight; disables the save command. */
  pending: boolean;
  /** False renders the form read-only and hides the save command. */
  canEdit: boolean;
  onChange: (patch: Partial<CustomerDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const useStyles = makeStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalM,
  },
  readOnlyNote: {
    marginBottom: tokens.spacingVerticalM,
  },
});

/**
 * The reusable customer form.
 *
 * The page owns the draft, dirty flag, and submit lifecycle so that the same
 * form body can render inside the dialog and the drawer while a single close
 * path guards unsaved changes. This component is presentational.
 */
export function CustomerEditor(props: CustomerEditorProps) {
  const styles = useStyles();
  const { draft, errors, serverError, pending, canEdit, onChange, onSave, onCancel } = props;

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      {!canEdit && (
        <MessageBar className={styles.readOnlyNote} intent="info">
          <MessageBarBody>
            You have read-only access. Ask an owner to make changes.
          </MessageBarBody>
        </MessageBar>
      )}

      {serverError && (
        <MessageBar intent="error">
          <MessageBarBody>A customer with this email already exists.</MessageBarBody>
        </MessageBar>
      )}

      <Field label="Name" required validationMessage={errors.name} validationState={errors.name ? "error" : "none"}>
        <Input
          value={draft.name}
          readOnly={!canEdit}
          onChange={(_event, data) => onChange({ name: data.value })}
        />
      </Field>

      <Field
        label="Email"
        required
        validationMessage={errors.email}
        validationState={errors.email ? "error" : "none"}
      >
        <Input
          type="email"
          value={draft.email}
          readOnly={!canEdit}
          onChange={(_event, data) => onChange({ email: data.value })}
        />
      </Field>

      <Field label="Status">
        <Dropdown
          disabled={!canEdit}
          selectedOptions={[draft.status]}
          value={STATUS_LABELS[draft.status]}
          onOptionSelect={(_event, data) => {
            if (isCustomerStatus(data.optionValue)) {
              onChange({ status: data.optionValue });
            }
          }}
        >
          {(Object.keys(STATUS_LABELS) as Array<Customer["status"]>).map((value) => (
            <Option key={value} value={value}>
              {STATUS_LABELS[value]}
            </Option>
          ))}
        </Dropdown>
      </Field>

      <Field label="Owner">
        <Dropdown
          disabled={!canEdit}
          selectedOptions={[draft.owner]}
          value={draft.owner}
          onOptionSelect={(_event, data) => onChange({ owner: data.optionValue ?? draft.owner })}
        >
          {CUSTOMER_OWNERS.map((name) => (
            <Option key={name} value={name}>
              {name}
            </Option>
          ))}
        </Dropdown>
      </Field>

      <Field label="Notes">
        <Textarea
          value={draft.notes}
          readOnly={!canEdit}
          resize="vertical"
          onChange={(_event, data) => onChange({ notes: data.value })}
        />
      </Field>

      <div className={styles.actions}>
        <Button appearance="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        {canEdit && (
          <Button
            appearance="primary"
            type="submit"
            disabled={pending}
            icon={pending ? <Spinner size="tiny" /> : undefined}
          >
            Save
          </Button>
        )}
      </div>
    </form>
  );
}
