import { Text, makeStyles, tokens } from "@fluentui/react-components";
import type { ReactNode } from "react";

/**
 * The application shell: page chrome owned by the application, not by a
 * component library pattern. It provides the brand header, primary navigation,
 * and the main landmark that wraps the routed page.
 */
const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalL,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: tokens.colorNeutralStroke2,
  },
  brand: {
    color: tokens.colorNeutralForeground1,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalL,
  },
  main: {
    flexGrow: 1,
    width: "100%",
    maxWidth: "1200px",
    marginLeft: "auto",
    marginRight: "auto",
    padding: tokens.spacingVerticalXL,
    boxSizing: "border-box",
  },
});

/** Wrap page content in the application chrome. */
export function AppShell({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text weight="semibold" size={400} className={styles.brand}>
          Fluent UI Design Fixture
        </Text>
        <nav aria-label="Primary" className={styles.nav}>
          <Text>Customers</Text>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
