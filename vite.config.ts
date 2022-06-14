import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: ["path-browserify", "@volar/vue-language-service"],
  },
  resolve: {
    alias: {
      path: "path-browserify",
    },
  },
  worker: {
    format: "es",
  },
  build: {
    target: "esnext",
    minify: false,

    rollupOptions: {
      input: {
        index: "./src/index.ts",
        "vue.worker": "./src/vue.worker.ts",
      },
      output: {
        format: "esm",
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
      },
      external: ["monaco-editor-core"],
    },
  },
});
