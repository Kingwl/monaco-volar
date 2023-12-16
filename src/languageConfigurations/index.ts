export async function loadLanguageConfigurations(languages: typeof import('monaco-editor-core').languages) {
  languages.setLanguageConfiguration('vue', await import('../languageConfigurations/vue.json') as any);
  languages.setLanguageConfiguration('javascript', await import('../languageConfigurations/javascript.json') as any);
  languages.setLanguageConfiguration('typescript', await import('../languageConfigurations/typescript.json') as any);
  languages.setLanguageConfiguration('css', await import('../languageConfigurations/css.json') as any);
  languages.setLanguageConfiguration('html', await import('../languageConfigurations/html.json') as any);
}
