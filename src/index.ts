export const loadTheme = async (
  editor: typeof import("monaco-editor-core").editor
) => {
  const themes = await import("./themes");
  return themes.loadTheme(editor);
};

export const loadGrammars = async (
  monaco: typeof import("monaco-editor-core"),
  editor: import("monaco-editor-core").editor.IStandaloneCodeEditor
) => {
  const grammars = await import("./grammars");
  return grammars.loadGrammars(monaco, editor);
};
