import { defineConfig } from "vite";

export default defineConfig({
    optimizeDeps: {
        exclude: ["monaco-editor-core", "onigasm"]
    },
    build: {
        minify: false,
        lib: {
            entry: "./src/vue.worker.ts",
            formats: ['es'],
            name: 'vue.worker.js'
        },
        sourcemap: true,
        outDir: "./dist/worker",
        rollupOptions: {
            output: {
                format: "es",
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
            }
        }
    },
});
