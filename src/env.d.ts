/// <reference types="vite/client" />

declare module "monaco-editor/esm/vs/editor/editor.worker" {
  export function initialize(
    callback: (ctx: any, createData: any) => any
  ): void;
}
