import type { Uri, languages } from "monaco-editor";

export interface WorkerAccessor<T> {
  (...more: Uri[]): Promise<T>;
}

export interface IVueAdaptor
  extends languages.HoverProvider,
    languages.DocumentSymbolProvider,
    languages.DocumentHighlightProvider,
    languages.LinkedEditingRangeProvider,
    languages.DefinitionProvider,
    languages.ImplementationProvider,
    languages.TypeDefinitionProvider,
    languages.CodeLensProvider,
    languages.CodeActionProvider,
    Omit<languages.DocumentFormattingEditProvider, "displayName">,
    Omit<languages.DocumentRangeFormattingEditProvider, "displayName">,
    languages.OnTypeFormattingEditProvider,
    languages.LinkProvider,
    languages.CompletionItemProvider,
    languages.DocumentColorProvider,
    languages.FoldingRangeProvider,
    languages.DeclarationProvider,
    languages.SignatureHelpProvider,
    languages.RenameProvider,
    languages.ReferenceProvider,
    languages.SelectionRangeProvider,
    languages.InlayHintsProvider {}
