import { setupMonacoEnv, loadOnigasm } from "./env";
import * as monaco from "monaco-editor-core";
import { loadGrammars, loadTheme } from "../src/index";
import { getOrCreateModel } from "../src/utils";
import data from "./Test.vue?raw";

const afterReady = (theme: string) => {
  const model = getOrCreateModel(monaco.Uri.parse("file:///demo.vue"), "vue", data);
  const element = document.getElementById("app")!;
  const editorInstance = monaco.editor.create(element, {
    theme,
    model,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false,
    },
    inlineSuggest: {
      enabled: false,
    },
  });

  loadGrammars(monaco, editorInstance);
};

Promise.all([setupMonacoEnv(), loadOnigasm(), loadTheme(monaco.editor)]).then(
  ([, , theme]) => {
    afterReady(theme);
  }
);
