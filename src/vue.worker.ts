import * as worker from "monaco-editor-core/esm/vs/editor/editor.worker";
import type * as monaco from "monaco-editor-core";
import * as ts from "typescript";
import { resolveConfig } from "@vue/language-service";
import {
  createLanguageHost,
  createLanguageService,
  createServiceEnvironment,
} from "@volar/monaco/worker";
import {
  createJsDelivrFs,
  createJsDelivrUriResolver,
  decorateServiceEnvironment,
} from "@volar/cdn";

self.onmessage = () => {
  worker.initialize((ctx: monaco.worker.IWorkerContext) => {
    const compilerOptions: ts.CompilerOptions = {
      ...ts.getDefaultCompilerOptions(),
      allowJs: true,
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    };
    const env = createServiceEnvironment();

    decorateServiceEnvironment(
      env,
      createJsDelivrUriResolver("/node_modules"),
      createJsDelivrFs()
    );

    return createLanguageService(
      { typescript: ts as any },
      env,
      resolveConfig({}, compilerOptions, {}, ts as any),
      createLanguageHost(ctx.getMirrorModels, env, "/", compilerOptions)
    );
  });
};
