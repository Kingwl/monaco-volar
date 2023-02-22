import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import vueWorker from "../src/vue.worker?worker";
import * as onigasm from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";

export function loadOnigasm() {
  return onigasm.loadWASM(onigasmWasm);
}

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
