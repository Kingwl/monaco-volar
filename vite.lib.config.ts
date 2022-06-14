import { defineConfig } from "vite";

export default defineConfig({
    optimizeDeps: {
        exclude: ["monaco-editor-core", "onigasm"]
    },
    build: {
        minify: false,
        lib: {
            entry: "./src/index.ts",
            formats: ['es'],
            name: 'index.js'
        },
        outDir: "./dist/lib",
        sourcemap: true,
        rollupOptions: {
            output: {
                format: "es",
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
            }
        },
    },
});
