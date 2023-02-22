import { editor, IDisposable } from "monaco-editor";
import type { LanguageServiceDefaults } from "./monaco.contribution";
import { WorkerAccessor } from "./types";
import type { VueWorker } from "./vueWorker";
import * as code2monaco from "./code2monaco";
import { Diagnostic, Disposable } from "vscode-languageserver-protocol";
import { asDisposable, createDisposable } from "./utils";

interface IInternalEditorModel extends editor.IModel {
  onDidChangeAttached(listener: () => void): IDisposable;
  isAttachedToEditor(): boolean;
}

export const createDiagnosticsAdapter = (
  _defaults: LanguageServiceDefaults,
  _selector: string,
  _worker: WorkerAccessor<VueWorker>,
  _getDiagnostic: () => WeakMap<editor.IMarkerData, Diagnostic>
): Disposable => {
  const disposables: IDisposable[] = [];
  const listener = new Map<string, IDisposable>();

  const toMarkers = (errors: Diagnostic[]) => {
    return errors.map((error) => {
      const marker = code2monaco.asMarkerData(error);
      _getDiagnostic().set(marker, error);
      return marker;
    });
  };

  const doValidation = async (model: editor.ITextModel) => {
    if (model.isDisposed()) {
      return;
    }

    const worker = await _worker(model.uri);

    const attachToEditor = (diags: Diagnostic[]) => {
      if (model.isDisposed()) {
        return;
      }

      editor.setModelMarkers(model, _selector, toMarkers(diags));
    };

    const diagnostics = await worker.doValidation(model.uri.toString());

    attachToEditor(diagnostics);
  };

  const onModelAdd = (model: IInternalEditorModel): void => {
    if (model.getLanguageId() !== _selector) {
      return;
    }

    const maybeValidation = () => {
      if (model.isAttachedToEditor()) {
        doValidation(model);
      }
    };

    let timer: number;
    const changeSubscription = model.onDidChangeContent(() => {
      clearTimeout(timer);
      timer = window.setTimeout(maybeValidation, 500);
    });

    const visibleSubscription = model.onDidChangeAttached(() => {
      if (model.isAttachedToEditor()) {
        maybeValidation();
      } else {
        editor.setModelMarkers(model, _selector, []);
      }
    });

    listener.set(
      model.uri.toString(),
      createDisposable(() => {
        changeSubscription.dispose();
        visibleSubscription.dispose();
        clearTimeout(timer);
      })
    );

    maybeValidation();
  };

  const onModelRemoved = (model: editor.IModel): void => {
    editor.setModelMarkers(model, _selector, []);
    const key = model.uri.toString();
    if (listener.has(key)) {
      listener.get(key)?.dispose();
      listener.delete(key);
    }
  };

  disposables.push(
    editor.onDidCreateModel((model) => onModelAdd(<IInternalEditorModel>model))
  );
  disposables.push(editor.onWillDisposeModel(onModelRemoved));
  disposables.push(
    editor.onDidChangeModelLanguage((event) => {
      onModelRemoved(event.model);
      onModelAdd(<IInternalEditorModel>event.model);
    })
  );

  disposables.push(
    createDisposable(() => {
      for (const model of editor.getModels()) {
        onModelRemoved(model);
      }
    })
  );

  const recompute = () => {
    for (const model of editor.getModels()) {
      onModelRemoved(model);
      onModelAdd(<IInternalEditorModel>model);
    }
  };
  disposables.push(_defaults.onDidChange(recompute));
  disposables.push(_defaults.onExtraLibChange(recompute));

  editor
    .getModels()
    .forEach((model) => onModelAdd(<IInternalEditorModel>model));

  return asDisposable(disposables);
};
