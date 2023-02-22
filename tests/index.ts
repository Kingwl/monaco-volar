import { loadMonacoEnv, loadOnigasm } from "./env";
import { editor, Uri } from "monaco-editor";
import { loadGrammars, loadTheme, prepareVirtualFiles } from "../src/index";
import { getOrCreateModel } from "../src/utils";
import data from "./Test.vue?raw";

const afterReady = (theme: string) => {
  const element = document.getElementById("app")!;

  prepareVirtualFiles();

  const model = getOrCreateModel(Uri.parse("file:///demo.vue"), "vue", data);

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

Promise.all([loadMonacoEnv(), loadOnigasm(), loadTheme()]).then(
  ([, , theme]) => {
    afterReady(theme);
  }
);
