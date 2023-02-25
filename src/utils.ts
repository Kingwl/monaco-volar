import { Uri, editor, IDisposable } from "monaco-editor-core";

export function debounce(fn: Function, n = 100) {
  let handle: any;
  return (...args: any[]) => {
    if (handle) clearTimeout(handle);
    handle = setTimeout(() => {
      fn(...args);
    }, n);
  };
}

export function getOrCreateModel(
  uri: Uri,
  lang: string | undefined,
  value: string
) {
  const model = editor.getModel(uri);
  if (model) {
    model.setValue(value);
    return model;
  }
  return editor.createModel(value, lang, uri);
}

export function asDisposable(disposables: IDisposable[]): IDisposable {
  return { dispose: () => disposeAll(disposables) };
}

export function disposeAll(disposables: IDisposable[]) {
  while (disposables.length) {
    disposables.pop()!.dispose();
  }
}

export function createDisposable(cb: () => void): IDisposable {
  return {
    dispose: cb,
  };
}

export function normalizePath(path: string) {
  return path.replace(/\\/g, "/");
}
