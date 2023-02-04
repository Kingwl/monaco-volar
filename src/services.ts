import type { worker } from "monaco-editor";
import * as ts from "typescript/lib/tsserverlibrary";
import {
  createLanguageService,
  type VueLanguageServiceHost,
  type ConfigurationHost,
} from "@volar/vue-language-service";
import path from "typesafe-path";
import { URI } from "vscode-uri";

interface LsAndDs {
  ls: ReturnType<typeof createLanguageService>;
}

export function getLanguageServiceAndDocumentsService(
  getModels: () => worker.IMirrorModel[],
  getExtraLibs: () => Record<path.PosixPath, string>
): LsAndDs {
  const scriptSnapshots = new Map<string, ts.IScriptSnapshot>();

  const findInModels = (fileName: path.PosixPath) => {
    return getModels().find((x) => {
      return (
        x.uri.toString() === fileName ||
        normalizePath(x.uri.fsPath as path.OsPath) === fileName
      );
    });
  };

  const findInExtraLibs = (fileName: path.PosixPath): string | undefined => {
    return getExtraLibs()[fileName];
  };

  const host: VueLanguageServiceHost = {
    readFile(fileName: string) {
      const model = findInModels(fileName as path.PosixPath);
      if (model) {
        return model.getValue();
      }

      const extraLibs = findInExtraLibs(fileName as path.PosixPath);
      return extraLibs;
    },
    fileExists(fileName: string) {
      return !!(
        findInModels(fileName as path.PosixPath) ||
        findInExtraLibs(fileName as path.PosixPath)
      );
    },
    getCompilationSettings(): ts.CompilerOptions {
      return {
        ...ts.getDefaultCompilerOptions(),
        allowJs: true,
        jsx: ts.JsxEmit.Preserve,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
      };
    },
    getVueCompilationSettings() {
      return {};
    },
    getScriptFileNames(): string[] {
      const modelNames = getModels().map((x) =>
        normalizePath(x.uri.fsPath as path.OsPath)
      );
      const extraLibNames = keysOf(getExtraLibs());
      const fileNames = [...modelNames, ...extraLibNames];
      return fileNames;
    },
    getScriptVersion(fileName: string): string {
      const model = findInModels(fileName as path.PosixPath);
      if (model) {
        return `${model.version}`;
      }

      const extraLibs = findInExtraLibs(fileName as path.PosixPath);
      if (extraLibs) {
        return "1";
      }

      return "unknown version";
    },
    getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined {
      let scriptSnapshot = scriptSnapshots.get(fileName);
      if (
        !scriptSnapshot ||
        scriptSnapshot.getText(0, scriptSnapshot.getLength()) !==
          this.readFile(fileName)
      ) {
        const fileContent = this.readFile(fileName);
        if (fileContent !== undefined) {
          scriptSnapshot = ts.ScriptSnapshot.fromString(fileContent);
          scriptSnapshots.set(fileName, scriptSnapshot);
        }
      }
      return scriptSnapshot;
    },
    getCurrentDirectory(): string {
      return "/";
    },
    getDefaultLibFileName(options: ts.CompilerOptions): string {
      return ts.getDefaultLibFileName(options);
    },
    getTypeScriptModule() {
      return ts;
    },
  };
  const sys: ts.System = {
    args: [],
    newLine: "\n",
    useCaseSensitiveFileNames: false,
    readFile: host.readFile,
    fileExists: host.fileExists,
    write(s: string): void {
      throw new Error("Function not implemented.");
    },
    writeFile(path: string, data: string, writeByteOrderMark?: boolean): void {
      throw new Error("Function not implemented.");
    },
    resolvePath(path: string): string {
      throw new Error("Function not implemented.");
    },
    directoryExists(path: string): boolean {
      throw new Error("Function not implemented.");
    },
    createDirectory(path: string): void {
      throw new Error("Function not implemented.");
    },
    getExecutingFilePath(): string {
      throw new Error("Function not implemented.");
    },
    getCurrentDirectory(): string {
      throw new Error("Function not implemented.");
    },
    getDirectories(path: string): string[] {
      throw new Error("Function not implemented.");
    },
    readDirectory(
      path: string,
      extensions?: readonly string[],
      exclude?: readonly string[],
      include?: readonly string[],
      depth?: number
    ): string[] {
      throw new Error("Function not implemented.");
    },
    exit(exitCode?: number): void {
      throw new Error("Function not implemented.");
    },
  };
  // @ts-expect-error
  ts.setSys(sys);

  const configurationHost: ConfigurationHost = {
    getConfiguration<T>(seation: string): T {
      // disabled because it these required for doExecuteCommand implementation
      if (
        seation === "volar.codeLens.pugTools" ||
        seation === "volar.codeLens.scriptSetupTools"
      ) {
        return false as any;
      }
      return undefined as any;
    },
    onDidChangeConfiguration() {},
  };
  const ls = createLanguageService(host, {
    rootUri: URI.file("/"),
    configurationHost,
  });

  return {
    ls,
  };
}

function keysOf<T extends Object>(arr: T) {
  return Object.keys(arr) as Array<keyof T>;
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/") as path.PosixPath;
}
