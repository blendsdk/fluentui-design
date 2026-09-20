import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from "@fluentui/react-components";

/** Props for {@link ConfirmDialog}. */
export interface ConfirmDialogProps {
  open: boolean;
  /** Keep the current draft and return to the editor. */
  onKeepEditing: () => void;
  /** Discard the draft and close the editor. */
  onDiscard: () => void;
}

/**
 * Confirm discarding unsaved changes.
 *
 * Dismissing the dialog any way other than Discard keeps the draft, so a stray
 * Escape or backdrop click can never lose work.
 */
export function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, onKeepEditing, onDiscard } = props;
  return (
    <Dialog
      open={open}
      onOpenChange={(_event, data) => {
        if (!data.open) {
          onKeepEditing();
        }
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Discard changes?</DialogTitle>
          <DialogContent>Your unsaved changes will be lost.</DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onKeepEditing}>
              Keep editing
            </Button>
            <Button appearance="primary" onClick={onDiscard}>
              Discard
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
