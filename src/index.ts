import { editor } from "monaco-editor-core";

export const loadTheme = async () => {
  const themes = await import("./themes");
  return themes.loadTheme();
};

export const loadGrammars = async (editor: editor.IStandaloneCodeEditor) => {
  const grammars = await import("./grammars");
  return grammars.loadGrammars(editor);
};
