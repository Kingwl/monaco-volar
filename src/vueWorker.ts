import type { worker } from "monaco-editor";
import { getLanguageServiceAndDocumentsService } from "./services";
import * as vscode from "vscode-languageserver-protocol";

export interface ICreateData {
  languageId: string;
  extraLibs?: Record<string, string>;
}

type LSType = ReturnType<typeof getLanguageServiceAndDocumentsService>;

type Args<T extends (...args: any[]) => void> = T extends (
  ...args: infer A
) => void
  ? A
  : never;

export class VueWorker {
  private _languageId: string;
  private _ctx: worker.IWorkerContext;

  private _ls: LSType;
  private _extraLibs: Record<string, string>;

  constructor(ctx: worker.IWorkerContext, createData: ICreateData) {
    this._ctx = ctx;
    this._languageId = createData.languageId;
    this._extraLibs = createData.extraLibs ?? {};

    this._ls = getLanguageServiceAndDocumentsService(
      () => this._ctx.getMirrorModels(),
      () => this._extraLibs
    );
  }

  updateExtraLibs(extraLibs: Record<string, string>) {
    this._extraLibs = extraLibs;
  }

  async doDSAutoInsert(...args: Args<LSType["doAutoInsert"]>) {
    return await this._ls.doAutoInsert(...args);
  }

  async doLSAutoInsert(...args: Args<LSType["doAutoInsert"]>) {
    return await this._ls.doAutoInsert(...args);
  }

  async getFoldingRanges(...args: Args<LSType["getFoldingRanges"]>) {
    return await this._ls.getFoldingRanges(...args);
  }

  async getColorPresentations(...args: Args<LSType["getColorPresentations"]>) {
    return await this._ls.getColorPresentations(...args);
  }

  async getSelectionRanges(...args: Args<LSType["getSelectionRanges"]>) {
    return await this._ls.getSelectionRanges(...args);
  }

  async findDocumentColors(...args: Args<LSType["findDocumentColors"]>) {
    return await this._ls.findDocumentColors(...args);
  }

  async findDocumentSymbols(...args: Args<LSType["findDocumentSymbols"]>) {
    return await this._ls.findDocumentSymbols(...args);
  }

  async findLinkedEditingRanges(
    ...args: Args<LSType["findLinkedEditingRanges"]>
  ) {
    return await this._ls.findLinkedEditingRanges(...args);
  }

  async format(...args: Args<LSType["format"]>) {
    return await this._ls.format(...args);
  }

  async doCodeActions(...args: Args<LSType["doCodeActions"]>) {
    return await this._ls.doCodeActions(...args);
  }

  async doCodeActionResolve(...args: Args<LSType["doCodeActionResolve"]>) {
    return await this._ls.doCodeActionResolve(...args);
  }

  async doCodeLens(...args: Args<LSType["doCodeLens"]>) {
    return await this._ls.doCodeLens(...args);
  }

  async doCodeLensResolve(...args: Args<LSType["doCodeLensResolve"]>) {
    return await this._ls.doCodeLensResolve(...args);
  }

  async doComplete(...args: Args<LSType["doComplete"]>) {
    return await this._ls.doComplete(...args);
  }

  async doCompletionResolve(...args: Args<LSType["doCompletionResolve"]>) {
    return await this._ls.doCompletionResolve(...args);
  }

  async doHover(...args: Args<LSType["doHover"]>) {
    return await this._ls.doHover(...args);
  }

  async doRename(...args: Args<LSType["doRename"]>) {
    return await this._ls.doRename(...args);
  }

  async doValidation(...args: Args<LSType["doValidation"]>) {
    return await this._ls.doValidation(...args);
  }

  async findDefinition(...args: Args<LSType["findDefinition"]>) {
    return await this._ls.findDefinition(...args);
  }

  async findDocumentHighlights(
    ...args: Args<LSType["findDocumentHighlights"]>
  ) {
    return await this._ls.findDocumentHighlights(...args);
  }

  async findDocumentLinks(...args: Args<LSType["findDocumentLinks"]>) {
    return await this._ls.findDocumentLinks(...args);
  }

  async findFileReferences(...args: Args<LSType["findFileReferences"]>) {
    return await this._ls.findFileReferences(...args);
  }

  async findImplementations(...args: Args<LSType["findImplementations"]>) {
    return await this._ls.findImplementations(...args);
  }

  async findReferences(...args: Args<LSType["findReferences"]>) {
    return await this._ls.findReferences(...args);
  }

  async findTypeDefinition(...args: Args<LSType["findTypeDefinition"]>) {
    return await this._ls.findTypeDefinition(...args);
  }

  async findWorkspaceSymbols(...args: Args<LSType["findWorkspaceSymbols"]>) {
    return await this._ls.findWorkspaceSymbols(...args);
  }

  async getEditsForFileRename(...args: Args<LSType["getEditsForFileRename"]>) {
    return await this._ls.getEditsForFileRename(...args);
  }

  async getInlayHints(...args: Args<LSType["getInlayHints"]>) {
    return await this._ls.getInlayHints(...args);
  }

  async getSemanticTokens(...args: Args<LSType["getSemanticTokens"]>) {
    return await this._ls.getSemanticTokens(...args);
  }

  async getSignatureHelp(...args: Args<LSType["getSignatureHelp"]>) {
    return await this._ls.getSignatureHelp(...args);
  }

  async prepareRename(...args: Args<LSType["prepareRename"]>) {
    return await this._ls.prepareRename(...args);
  }
}
