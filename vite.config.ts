import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig({
  base: "/monaco-volar/",
  optimizeDeps: {
    include: ["path-browserify", "@vue/language-service", "monaco-editor-core"],
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
