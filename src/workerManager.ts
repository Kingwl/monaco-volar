import { LanguageServiceDefaults } from "./monaco.contribution";
import type { ICreateData, VueWorker } from "./vueWorker";
import { type IDisposable, Uri, editor } from "monaco-editor";

const STOP_WHEN_IDLE_FOR = 2 * 60 * 1000; // 2min

export class WorkerManager {
  private _defaults: LanguageServiceDefaults;
  private _idleCheckInterval: number;
  private _lastUsedTime: number;
  private _configChangeListener: IDisposable;
  private _extraLibChangeListener: IDisposable;

  private _worker: editor.MonacoWebWorker<VueWorker> | null;
  private _client: Promise<VueWorker> | null;

  constructor(defaults: LanguageServiceDefaults) {
    this._defaults = defaults;
    this._worker = null;
    this._client = null;
    this._idleCheckInterval = window.setInterval(
      () => this._checkIfIdle(),
      30 * 1000
    );
    this._lastUsedTime = 0;
    this._configChangeListener = this._defaults.onDidChange(() =>
      this._stopWorker()
    );
    this._extraLibChangeListener = this._defaults.onExtraLibChange(() =>
      this._updateExtraLib()
    );
  }

  private _updateExtraLib() {
    this._getClient().then((client) => {
      client.updateExtraLibs(this._defaults.getExtraLibs());
    });
  }

  private _stopWorker(): void {
    if (this._worker) {
      this._worker.dispose();
      this._worker = null;
    }
    this._client = null;
  }

  dispose(): void {
    clearInterval(this._idleCheckInterval);
    this._configChangeListener.dispose();
    this._extraLibChangeListener.dispose();
    this._stopWorker();
  }

  private _checkIfIdle(): void {
    if (!this._worker) {
      return;
    }
    let timePassedSinceLastUsed = Date.now() - this._lastUsedTime;
    if (timePassedSinceLastUsed > STOP_WHEN_IDLE_FOR) {
      this._stopWorker();
    }
  }

  private _getClient(): Promise<VueWorker> {
    this._lastUsedTime = Date.now();

    if (!this._client) {
      this._worker = editor.createWebWorker<VueWorker>({
        moduleId: "vs/language/vue/vueWorker",

        label: this._defaults.languageId,

        // passed in to the create() method
        createData: {
          languageId: this._defaults.languageId,
          extraLibs: this._defaults.getExtraLibs(),
        } as ICreateData,
      });

      this._client = <Promise<VueWorker>>(<any>this._worker.getProxy());
    }

    return this._client;
  }

  getLanguageServiceWorker(...resources: Uri[]): Promise<VueWorker> {
    let _client: VueWorker;
    return this._getClient()
      .then((client) => {
        _client = client;
      })
      .then((_) => {
        if (this._worker) {
          return this._worker.withSyncedResources(resources);
        }
      })
      .then((_) => _client);
  }
}
