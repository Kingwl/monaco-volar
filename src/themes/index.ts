import { theme } from './converted'

export async function loadTheme(editor: typeof import('monaco-editor-core').editor) {
    const themeName = 'vs-code-theme-converted';
    editor.defineTheme(themeName, theme);
    return themeName;
}
