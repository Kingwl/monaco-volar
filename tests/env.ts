import editorWorker from "monaco-editor-core/esm/vs/editor/editor.worker?worker";
import vueWorker from "../src/vue.worker?worker";
import * as onigasm from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";

import { LanguageService } from "@volar/vue-language-service";
import { editor, languages } from "monaco-editor-core";
import * as volar from "@volar/monaco";
import { MyWorkerContextHost } from "../src/host";

export function loadOnigasm() {
  return onigasm.loadWASM(onigasmWasm);
}

export function setupMonacoEnv(takeoverMode = false) {

  let initialized = false;

  languages.register({ id: "vue", extensions: [".vue"] });
  languages.onLanguage("vue", setup);

  if (takeoverMode) {
    languages.onLanguage("javascript", setup);
    languages.onLanguage("typescript", setup);
    languages.onLanguage("javascriptreact", setup);
    languages.onLanguage("typescriptreact", setup);
    languages.onLanguage("json", setup);
  }

  async function setup() {
    if (initialized) {
      return;
    }
    initialized = true;

    (self as any).MonacoEnvironment ??= {};
    (self as any).MonacoEnvironment.getWorker ??= () => new editorWorker();

    const getWorker = (self as any).MonacoEnvironment.getWorker;

    (self as any).MonacoEnvironment.getWorker = (_: any, label: string) => {
      if (label === "vue") {
        return new vueWorker();
      }
      return getWorker();
    };

    const worker = editor.createWebWorker<LanguageService>({
      moduleId: "vs/language/vue/vueWorker",
      label: "vue",
      createData: {},
      host: new MyWorkerContextHost(),
    });
    const languageId = takeoverMode
      ? ["vue", "javascript", "typescript", "javascriptreact", "typescriptreact", "json"]
      : ["vue"];
    volar.editor.activateMarkers(worker, languageId, 'vue', editor);
    await volar.languages.registerProvides(worker, languageId, languages)
  }
}
