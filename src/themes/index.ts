import { theme, lightTheme } from './converted'

export async function loadTheme(
  editor: typeof import('monaco-editor-core').editor,
  dark = true) {
    const themeNameDark = 'vs-code-theme-converted-dark';
    editor.defineTheme(themeNameDark, theme);
    const themeNameLight = 'vs-code-theme-converted-light';
    editor.defineTheme(themeNameLight, lightTheme);
    return dark ? themeNameDark : themeNameLight;
}
