import type * as mode from "./vueMode";
import { Emitter, type IEvent, languages } from "monaco-editor";
import { debounce, normalizePath } from "./utils";
import * as path from "typesafe-path";

export interface ModeConfiguration {
  hovers?: boolean;
}

export interface LanguageServiceDefaults {
  readonly languageId: string;
  readonly onDidChange: IEvent<LanguageServiceDefaults>;
  readonly onExtraLibChange: IEvent<LanguageServiceDefaults>;
  readonly modeConfiguration: ModeConfiguration;
  addExtraLib(uri: path.OsPath | path.PosixPath, content: string): void;
  getExtraLibs(): Record<path.PosixPath, string>;
}

class LanguageServiceDefaultsImpl implements LanguageServiceDefaults {
  private _onDidChange = new Emitter<LanguageServiceDefaults>();
  private _onExtraLibChange = new Emitter<LanguageServiceDefaults>();
  private _modeConfiguration!: ModeConfiguration;
  private _languageId: string;

  private _extraLibs: Record<path.PosixPath, string> = {};

  constructor(languageId: string, modeConfiguration: ModeConfiguration) {
    this._languageId = languageId;
    this.setModeConfiguration(modeConfiguration);
  }

  get onDidChange(): IEvent<LanguageServiceDefaults> {
    return this._onDidChange.event;
  }

  get onExtraLibChange(): IEvent<LanguageServiceDefaults> {
    return this._onExtraLibChange.event;
  }

  get languageId(): string {
    return this._languageId;
  }

  get modeConfiguration(): ModeConfiguration {
    return this._modeConfiguration;
  }

  setModeConfiguration(modeConfiguration: ModeConfiguration): void {
    this._modeConfiguration = modeConfiguration || Object.create(null);
    this._onDidChange.fire(this);
  }

  addExtraLib(uri: path.OsPath | path.PosixPath, content: string) {
    const normalizedUri = normalizePath(uri);
    this._extraLibs[normalizedUri] = content;
    this.fireExtraLibChangeSoon();
  }

  getExtraLibs() {
    return this._extraLibs;
  }

  private fireExtraLibChangeSoon = debounce(() => {
    this._onExtraLibChange.fire(this);
  }, 300);
}

const modeConfigurationDefault: Required<ModeConfiguration> = {
  hovers: true,
};

export const vueDefaults: LanguageServiceDefaults =
  new LanguageServiceDefaultsImpl("vue", modeConfigurationDefault);

declare module "monaco-editor" {
  export namespace languages {
    export let vue: { vueDefaults: LanguageServiceDefaults };
  }
}

languages.vue = { vueDefaults };

function getMode(): Promise<typeof mode> {
  return import("./vueMode");
}

languages.register({
  id: "vue",
  extensions: [".vue"],
  aliases: ["VUE", "vue"],
});

languages.onLanguage("vue", () => {
  getMode().then((mode) => mode.setupMode(vueDefaults));
});
