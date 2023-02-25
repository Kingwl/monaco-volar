import { Uri } from "monaco-editor-core";
import { getOrCreateModel } from "./utils";

export class MyWorkerContextHost {
    syncAutoTypesFetchFiles(files: Record<string, string>) {
        for (const [fileName, text] of Object.entries(files)) {
            if (fileName.endsWith('.json')) {
                getOrCreateModel(Uri.file(fileName), "json", text);
            }
            else {
                getOrCreateModel(Uri.file(fileName), "typescript", text);
            }
        }
    }
}
