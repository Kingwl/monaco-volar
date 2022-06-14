import * as worker from "monaco-editor-core/esm/vs/editor/editor.worker";
import { VueWorker } from "./vueWorker";

self.onmessage = () => {
  // ignore the first message
  worker.initialize((ctx: any, createData: any) => {
    return new VueWorker(ctx, createData);
  });
};
