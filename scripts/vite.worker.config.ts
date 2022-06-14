import { defineConfig } from "vite";
import * as path from "path";
import { externalCjsToEsmPlugin } from "./plugin";

export default defineConfig({
  optimizeDeps: {
    exclude: ["monaco-editor-core", "path"],
    esbuildOptions: {
      plugins: [externalCjsToEsmPlugin(["monaco-editor-core", "path"])],
    },
  },
  build: {
    minify: false,
    lib: {
      entry: path.resolve(__dirname, "../src/vue.worker.ts"),
      formats: ["es"],
      name: "vue.worker.js",
    },
    sourcemap: true,
    outDir: path.resolve(__dirname, "../dist/worker"),
    rollupOptions: {
      output: {
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
      },
      external: ["monaco-editor-core", "path"],
    },
  },
});
