import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite configuration for the fixture application.
 *
 * The project root is `fixture/`, so `vite build` writes `fixture/dist` and
 * `vite preview` serves that directory. The browser tests run against the
 * preview server, which means they exercise the production bundle.
 */
export default defineConfig({
  root: "fixture",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
