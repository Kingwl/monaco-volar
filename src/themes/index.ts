import { theme, lightTheme } from './converted'

export async function loadTheme(editor: typeof import('monaco-editor-core').editor, dark = true) {
    const themeName = 'vs-code-theme-converted';
    editor.defineTheme(themeName, dark ? theme : lightTheme);
    return themeName;
}
