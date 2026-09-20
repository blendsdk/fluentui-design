import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Skeleton,
  SkeletonItem,
  Subtitle1,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

/**
 * The fixture's non-ready states.
 *
 * Each state occupies the same grid region so the page never renders a blank
 * area: loading shows skeletons, empty and no-results use distinct copy and
 * actions, and failure offers a retry.
 */
const useStyles = makeStyles({
  state: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXXL,
    textAlign: "center",
  },
  skeletonList: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    width: "100%",
    maxWidth: "720px",
  },
});

/** Skeleton rows shown while data resolves. */
export function LoadingState() {
  const styles = useStyles();
  return (
    <div className={styles.state} role="status" aria-label="Loading customers" aria-busy="true">
      <div className={styles.skeletonList}>
        <Skeleton>
          <SkeletonItem size={32} />
          <SkeletonItem size={32} />
          <SkeletonItem size={32} />
          <SkeletonItem size={32} />
          <SkeletonItem size={32} />
        </Skeleton>
      </div>
    </div>
  );
}

/** Shown when the collection has no records at all. */
export function EmptyState({ onCreate, canEdit }: { onCreate: () => void; canEdit: boolean }) {
  const styles = useStyles();
  return (
    <div className={styles.state}>
      <Subtitle1>No customers yet</Subtitle1>
      <Text>Add the first customer to get started.</Text>
      <Button appearance="primary" onClick={onCreate} disabled={!canEdit}>
        Add customer
      </Button>
    </div>
  );
}

/** Shown when records exist but the active filters match none of them. */
export function NoResults({ onClear }: { onClear: () => void }) {
  const styles = useStyles();
  return (
    <div className={styles.state}>
      <Subtitle1>No customers match your filters</Subtitle1>
      <Text>Try a different search term or clear the filters.</Text>
      <Button appearance="secondary" onClick={onClear}>
        Clear all filters
      </Button>
    </div>
  );
}

/** Shown when loading the collection fails. */
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const styles = useStyles();
  return (
    <div className={styles.state}>
      <MessageBar intent="error">
        <MessageBarBody>We couldn&apos;t load customers.</MessageBarBody>
        <MessageBarActions>
          <Button appearance="secondary" onClick={onRetry}>
            Retry
          </Button>
        </MessageBarActions>
      </MessageBar>
    </div>
  );
}
