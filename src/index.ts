import { editor } from "monaco-editor";
import "./monaco.contribution";

export const loadTheme = async () => {
  const themes = await import("./themes");
  return themes.loadTheme();
};

export const loadGrammars = async (editor: editor.IStandaloneCodeEditor) => {
  const grammars = await import("./grammars");
  return grammars.loadGrammars(editor);
};

export const prepareVirtualFiles = async () => {
  const prepare = await import("./prepare");
  return prepare.prepareVirtualFiles();
};
