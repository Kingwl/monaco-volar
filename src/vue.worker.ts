import * as worker from "monaco-editor-core/esm/vs/editor/editor.worker";
import type * as monaco from "monaco-editor-core";
import * as ts from "typescript";
import { resolveConfig } from "@volar/vue-language-service";
import * as volarWorker from "@volar/monaco/worker";

self.onmessage = () => {
  worker.initialize(
    (ctx: monaco.worker.IWorkerContext) => {
      const compilerOptions: ts.CompilerOptions = {
        ...ts.getDefaultCompilerOptions(),
        allowJs: true,
        jsx: ts.JsxEmit.Preserve,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
      };

      return volarWorker.createLanguageService({
        workerContext: ctx,
        config: resolveConfig(
          {
            plugins: {
              /* volar.config.js plugins */
            },
          },
          ts as any,
          compilerOptions,
          {
            plugins: [
              /* tsconfig vueCompilerOptions plugins */
            ],
          }
        ),
        typescript: {
          module: ts as any,
          compilerOptions,
        },
        dtsHost: volarWorker.createDtsHost("https://unpkg.com/"),
      });
    }
  );
};
