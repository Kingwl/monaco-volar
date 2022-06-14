import editorWorker from "monaco-editor-core/esm/vs/editor/editor.worker?worker";
import vueWorker from "../src/vue.worker?worker";
import { loadWASM } from "onigasm";
import onigasm from "onigasm/lib/onigasm.wasm?url";

export function loadMonacoEnv() {
  (self as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      if (label === "vue") {
        return new vueWorker();
      }
      return new editorWorker();
    },
  };
}

export function loadOnigasm() {
  return loadWASM(onigasm);
}
