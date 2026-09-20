import { Button, DrawerBody, DrawerHeader, DrawerHeaderTitle, OverlayDrawer } from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import type { ReactNode } from "react";

/** Props for {@link CustomerDrawer}. */
export interface CustomerDrawerProps {
  open: boolean;
  title: string;
  /** Called when the drawer asks to close, for example on Escape. */
  onClose: () => void;
  children: ReactNode;
}

/**
 * A contextual editor drawer.
 *
 * The drawer restores focus to the element that opened it when it closes, which
 * the fixture's focus tests assert.
 */
export function CustomerDrawer(props: CustomerDrawerProps) {
  const { open, title, onClose, children } = props;

  return (
    <OverlayDrawer
      open={open}
      position="end"
      onOpenChange={(_event, data) => {
        if (!data.open) {
          onClose();
        }
      }}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<Dismiss24Regular />}
              onClick={onClose}
            />
          }
        >
          {title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>{children}</DrawerBody>
    </OverlayDrawer>
  );
}
