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
      "@vue/compiler-dom": "@vue/compiler-dom/dist/compiler-dom.cjs.js",
      "@vue/compiler-core": "@vue/compiler-core/dist/compiler-core.cjs.js",
    },
  },
  build: {
    minify: false,
    outDir: path.resolve(__dirname, "./out"),
  },
});
