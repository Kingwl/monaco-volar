import { defineConfig } from "vite";

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
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      name: "index.js",
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
      },
    },
  },
});
