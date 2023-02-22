import { editor } from 'monaco-editor'
import { theme } from './converted'

export async function loadTheme() {
    const themeName = 'vs-code-theme-converted';
    editor.defineTheme(themeName, theme);
    return themeName;
}
