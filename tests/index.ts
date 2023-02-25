import { setupMonacoEnv, loadOnigasm } from "./env";
import { editor, Uri } from "monaco-editor-core";
import { loadGrammars, loadTheme } from "../src/index";
import { getOrCreateModel } from "../src/utils";
import data from "./Test.vue?raw";

const afterReady = (theme: string) => {

  const model = getOrCreateModel(Uri.parse("file:///demo.vue"), "vue", data);
  const element = document.getElementById("app")!;
  const editorInstance = editor.create(element, {
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

  loadGrammars(editorInstance);
};

Promise.all([setupMonacoEnv(), loadOnigasm(), loadTheme()]).then(
  ([, , theme]) => {
    afterReady(theme);
  }
);
