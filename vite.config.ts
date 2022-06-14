import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig({
  optimizeDeps: {
    include: [
      "path-browserify",
      "@volar/vue-language-service",
      "monaco-editor-core",
    ],
  },
  resolve: {
    alias: {
      path: "path-browserify",
    },
  },
  build: {
    minify: false,
    outDir: path.resolve(__dirname, "./out"),
  },
});
