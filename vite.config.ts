import { defineConfig } from "vite";

export default defineConfig({
    optimizeDeps: {
        include: ["path-browserify", "@volar/vue-language-service"],
    },
    resolve: {
        alias: {
            path: "path-browserify"
        },
    },
    worker: {
        format: "es",
    },
    build: {
        target: "esnext",
        minify: false,
        lib: {
            entry: "./src/index.ts",
            formats: ['es']
        },
        sourcemap: true,

        rollupOptions: {
            input: {
                "index": "./src/index.ts",
                "vue.worker": "./src/vue.worker.ts",
            },
            output: {
                format: "es",
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
            },
            external: ["monaco-editor-core", "onigasm"],
        },
    },
});
