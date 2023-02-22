import { WorkerManager } from "./workerManager";
import { VueWorker } from "./vueWorker";
import { LanguageServiceDefaults } from "./monaco.contribution";
import * as code2monaco from "./code2monaco";
import * as monaco2code from "./monaco2code";
import * as vscode from "vscode-languageserver-protocol";

import {
  Uri,
  editor,
  Position,
  CancellationToken,
  languages,
  Range,
  type IDisposable,
} from "monaco-editor";
import { createDiagnosticsAdapter } from "./diagnostics";
import { asDisposable, disposeAll } from "./utils";
import { IVueAdaptor, WorkerAccessor } from "./types";
class WorkerAdapter<T extends VueWorker> implements IVueAdaptor {
  private _completionItems = new WeakMap<
    languages.CompletionItem,
    vscode.CompletionItem
  >();
  private _codeLens = new WeakMap<languages.CodeLens, vscode.CodeLens>();
  private _codeActions = new WeakMap<languages.CodeAction, vscode.CodeAction>();
  private _colorInformations = new WeakMap<
    languages.IColorInformation,
    vscode.ColorInformation
  >();

  constructor(
    private readonly _worker: WorkerAccessor<T>,
    private _diagnostics: WeakMap<editor.IMarkerData, vscode.Diagnostic>
  ) {}

  provideDocumentSymbols = async (
    model: editor.ITextModel,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.findDocumentSymbols(model.uri.toString());
    if (codeResult) {
      return codeResult.map(code2monaco.asDocumentSymbol);
    }
  };

  provideDocumentHighlights = async (
    model: editor.ITextModel,
    position: Position,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.findDocumentHighlights(
      model.uri.toString(),
      monaco2code.asPosition(position)
    );
    if (codeResult) {
      return codeResult.map(code2monaco.asDocumentHighlight);
    }
  };

  provideLinkedEditingRanges = async (
    model: editor.ITextModel,
    position: Position,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.findLinkedEditingRanges(
      model.uri.toString(),
      monaco2code.asPosition(position)
    );
    if (codeResult) {
      return {
        ranges: codeResult.ranges.map(code2monaco.asRange),
        wordPattern: codeResult.wordPattern
          ? new RegExp(codeResult.wordPattern)
          : undefined,
      };
    }
  };

  provideDefinition = async (
    model: editor.ITextModel,
    position: Position,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.findDefinition(
      model.uri.toString(),
      monaco2code.asPosition(position)
    );
    // TODO: can't show if only one result from libs
    if (codeResult) {
      return codeResult.map(code2monaco.asLocation);
    }
  };

  provideImplementation = async (
    model: editor.ITextModel,
    position: Position,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.findImplementations(
      model.uri.toString(),
      monaco2code.asPosition(position)
    );
    if (codeResult) {
      return codeResult.map(code2monaco.asLocation);
    }
  };

  provideTypeDefinition = async (
    model: editor.ITextModel,
    position: Position,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.findTypeDefinition(
      model.uri.toString(),
      monaco2code.asPosition(position)
    );
    if (codeResult) {
      return codeResult.map(code2monaco.asLocation);
    }
  };

  provideCodeLenses = async (
    model: editor.ITextModel,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.doCodeLens(model.uri.toString());
    if (codeResult) {
      const monacoResult = codeResult.map(code2monaco.asCodeLens);
      for (let i = 0; i < monacoResult.length; i++) {
        this._codeLens.set(monacoResult[i], codeResult[i]);
      }
      return {
        lenses: monacoResult,
        dispose: () => {},
      };
    }
  };

  resolveCodeLens = async (
    model: editor.ITextModel,
    moncaoResult: languages.CodeLens
  ) => {
    let codeResult = this._codeLens.get(moncaoResult);
    if (codeResult) {
      const worker = await this._worker(model.uri);
      codeResult = await worker.doCodeLensResolve(codeResult);
      if (codeResult) {
        moncaoResult = code2monaco.asCodeLens(codeResult);
        this._codeLens.set(moncaoResult, codeResult);
      }
    }
    return moncaoResult;
  };

  provideCodeActions = async (
    model: editor.ITextModel,
    range: Range,
    context: languages.CodeActionContext,
    token: CancellationToken
  ) => {
    const diagnostics: vscode.Diagnostic[] = [];
    for (const marker of context.markers) {
      const diagnostic = this._diagnostics.get(marker);
      if (diagnostic) {
        diagnostics.push(diagnostic);
      }
    }

    const worker = await this._worker(model.uri);
    const codeResult = await worker.doCodeActions(
      model.uri.toString(),
      monaco2code.asRange(range),
      {
        diagnostics: diagnostics,
        only: context.only ? [context.only] : undefined,
      }
    );
    if (codeResult) {
      const monacoResult = codeResult.map(code2monaco.asCodeAction);
      for (let i = 0; i < monacoResult.length; i++) {
        this._codeActions.set(monacoResult[i], codeResult[i]);
      }
      return {
        actions: monacoResult,
        dispose: () => {},
      };
    }
  };

  resolveCodeAction = async (moncaoResult: languages.CodeAction) => {
    let codeResult = this._codeActions.get(moncaoResult);
    if (codeResult) {
      const worker = await this._worker();
      codeResult = await worker.doCodeActionResolve(codeResult);
      if (codeResult) {
        moncaoResult = code2monaco.asCodeAction(codeResult);
        this._codeActions.set(moncaoResult, codeResult);
      }
    }
    return moncaoResult;
  };

  autoFormatTriggerCharacters = ["}", ";", "\n"];
  provideDocumentFormattingEdits = async (
    model: editor.ITextModel,
    options: languages.FormattingOptions,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.format(
      model.uri.toString(),
      monaco2code.asFormattingOptions(options)
    );
    if (codeResult) {
      return codeResult.map(code2monaco.asTextEdit);
    }
  };

  provideDocumentRangeFormattingEdits = async (
    model: editor.ITextModel,
    range: Range,
    options: languages.FormattingOptions,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.format(
      model.uri.toString(),
      monaco2code.asFormattingOptions(options),
      monaco2code.asRange(range)
    );
    if (codeResult) {
      return codeResult.map(code2monaco.asTextEdit);
    }
  };

  provideOnTypeFormattingEdits = async (
    model: editor.ITextModel,
    position: Position,
    ch: string,
    options: languages.FormattingOptions,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.format(
      model.uri.toString(),
      monaco2code.asFormattingOptions(options),
      undefined,
      {
        ch: ch,
        position: monaco2code.asPosition(position),
      }
    );
    if (codeResult) {
      return codeResult.map(code2monaco.asTextEdit);
    }
  };

  provideLinks = async (model: editor.ITextModel, token: CancellationToken) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.findDocumentLinks(model.uri.toString());
    if (codeResult) {
      return {
        links: codeResult.map(code2monaco.asLink),
      };
    }
  };

  triggerCharacters = "!@#$%^&*()_+-=`~{}|[]:\";'<>?,./ ".split("");
  provideCompletionItems = async (
    model: editor.ITextModel,
    position: Position,
    context: languages.CompletionContext,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.doComplete(
      model.uri.toString(),
      monaco2code.asPosition(position),
      monaco2code.asCompletionContext(context)
    );
    const monacoResult = code2monaco.asCompletionList(codeResult);
    for (let i = 0; i < codeResult.items.length; i++) {
      this._completionItems.set(
        monacoResult.suggestions[i],
        codeResult.items[i]
      );
    }
    return monacoResult;
  };

  resolveCompletionItem = async (
    monacoItem: languages.CompletionItem,
    token: CancellationToken
  ) => {
    let codeItem = this._completionItems.get(monacoItem);
    if (codeItem) {
      const worker = await this._worker();
      codeItem = await worker.doCompletionResolve(codeItem);
      monacoItem = code2monaco.asCompletionItem(codeItem);
      this._completionItems.set(monacoItem, codeItem);
    }
    return monacoItem;
  };

  provideDocumentColors = async (
    model: editor.ITextModel,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.findDocumentColors(model.uri.toString());
    if (codeResult) {
      return codeResult.map(code2monaco.asColorInformation);
    }
  };

  provideColorPresentations = async (
    model: editor.ITextModel,
    monacoResult: languages.IColorInformation
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = this._colorInformations.get(monacoResult);
    if (codeResult) {
      const codeColors = await worker.getColorPresentations(
        model.uri.toString(),
        codeResult.color,
        {
          start: monaco2code.asPosition(model.getPositionAt(0)),
          end: monaco2code.asPosition(
            model.getPositionAt(model.getValueLength())
          ),
        }
      );
      if (codeColors) {
        return codeColors.map(code2monaco.asColorPresentation);
      }
    }
  };

  provideFoldingRanges = async (
    model: editor.ITextModel,
    context: languages.FoldingContext,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.getFoldingRanges(model.uri.toString());
    if (codeResult) {
      return codeResult.map(code2monaco.asFoldingRange);
    }
  };

  provideDeclaration = async (
    model: editor.ITextModel,
    position: Position,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.findDefinition(
      model.uri.toString(),
      monaco2code.asPosition(position)
    );
    if (codeResult) {
      return codeResult.map(code2monaco.asLocation);
    }
  };

  provideSelectionRanges = async (
    model: editor.ITextModel,
    positions: Position[],
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResults = await Promise.all(
      positions.map((position) =>
        worker.getSelectionRanges(model.uri.toString(), [
          monaco2code.asPosition(position),
        ])
      )
    );
    return codeResults.map(
      (codeResult) => codeResult?.map(code2monaco.asSelectionRange) ?? []
    );
  };

  signatureHelpTriggerCharacters = ["(", ","];
  provideSignatureHelp = async (
    model: editor.ITextModel,
    position: Position,
    token: CancellationToken,
    context: languages.SignatureHelpContext
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.getSignatureHelp(
      model.uri.toString(),
      monaco2code.asPosition(position)
    );
    if (codeResult) {
      return {
        value: code2monaco.asSignatureHelp(codeResult),
        dispose: () => {},
      };
    }
  };

  provideRenameEdits = async (
    model: editor.ITextModel,
    position: Position,
    newName: string,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.doRename(
      model.uri.toString(),
      monaco2code.asPosition(position),
      newName
    );
    if (codeResult) {
      return code2monaco.asWorkspaceEdit(codeResult);
    }
  };

  provideReferences = async (
    model: editor.ITextModel,
    position: Position,
    context: languages.ReferenceContext,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.findReferences(
      model.uri.toString(),
      monaco2code.asPosition(position)
    );
    // TODO: can't show if only one result from libs
    if (codeResult) {
      return codeResult.map(code2monaco.asLocation);
    }
  };

  provideInlayHints = async (
    model: editor.ITextModel,
    range: Range,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.getInlayHints(
      model.uri.toString(),
      monaco2code.asRange(range)
    );
    if (codeResult) {
      return {
        hints: codeResult.map(code2monaco.asInlayHint),
        dispose: () => {},
      };
    }
  };

  provideHover = async (
    model: editor.ITextModel,
    position: Position,
    token: CancellationToken
  ) => {
    const worker = await this._worker(model.uri);
    const codeResult = await worker.doHover(
      model.uri.toString(),
      monaco2code.asPosition(position)
    );
    if (codeResult) {
      return code2monaco.asHover(codeResult);
    }
  };
}

export function setupMode(defaults: LanguageServiceDefaults): IDisposable {
  const disposables: IDisposable[] = [];
  const providers: IDisposable[] = [];

  const client = new WorkerManager(defaults);
  disposables.push(client);

  const worker: WorkerAccessor<VueWorker> = (
    ...uris: Uri[]
  ): Promise<VueWorker> => {
    return client.getLanguageServiceWorker(...uris);
  };

  const diagnostic = new WeakMap<editor.IMarkerData, vscode.Diagnostic>();
  const adapter = new WorkerAdapter(worker, diagnostic);

  function registerProviders(): void {
    const { languageId } = defaults;

    disposeAll(providers);

    providers.push(
      languages.registerHoverProvider(languageId, adapter),
      languages.registerReferenceProvider(languageId, adapter),
      languages.registerRenameProvider(languageId, adapter),
      languages.registerSignatureHelpProvider(languageId, adapter),
      languages.registerDocumentSymbolProvider(languageId, adapter),
      languages.registerDocumentHighlightProvider(languageId, adapter),
      languages.registerLinkedEditingRangeProvider(languageId, adapter),
      languages.registerDefinitionProvider(languageId, adapter),
      languages.registerImplementationProvider(languageId, adapter),
      languages.registerTypeDefinitionProvider(languageId, adapter),
      languages.registerCodeLensProvider(languageId, adapter),
      languages.registerCodeActionProvider(languageId, adapter),
      languages.registerDocumentFormattingEditProvider(languageId, adapter),
      languages.registerDocumentRangeFormattingEditProvider(
        languageId,
        adapter
      ),
      languages.registerOnTypeFormattingEditProvider(languageId, adapter),
      languages.registerLinkProvider(languageId, adapter),
      languages.registerCompletionItemProvider(languageId, adapter),
      languages.registerColorProvider(languageId, adapter),
      languages.registerFoldingRangeProvider(languageId, adapter),
      languages.registerDeclarationProvider(languageId, adapter),
      languages.registerSelectionRangeProvider(languageId, adapter),
      languages.registerInlayHintsProvider(languageId, adapter),

      createDiagnosticsAdapter(defaults, languageId, worker, () => diagnostic)
    );
  }

  registerProviders();

  let modeConfiguration = defaults.modeConfiguration;
  defaults.onDidChange((newDefaults) => {
    if (newDefaults.modeConfiguration !== modeConfiguration) {
      modeConfiguration = newDefaults.modeConfiguration;
      registerProviders();
    }
  });

  disposables.push(asDisposable(providers));

  return asDisposable(disposables);
}
