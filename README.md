# monaco-volar

**[Try it!](https://kingwl.github.io/monaco-volar/)**

## Install

`Monaco-volar` has external dependency Onigasm (to highlight code).

```console
pnpm add monaco-volar monaco-editor onigasm

# or

yarn add monaco-volar monaco-editor onigasm

```

## Setup

### Import

Import `monaco-volar` when you are using monaco. It will register vue as a language automatic.

```ts
import 'monaco-editor'
import 'monaco-volar'
```

### Setup highlight

#### Init Onigasm

VSCode are using Onigasm to highlight codes. And we have adapted the Onigasm and monaco. And some pre-defined grammars.

Onigasm needs a wasm module before using. We have to load it first.

```ts
import * as onigasm from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";

function loadOnigasm() {
  return onigasm.loadWASM(onigasmWasm);
}

loadOnigasm()

```

#### Apply grammars
Now we can apply grammars into monaco editor instance.

```ts
import { editor } from "monaco-editor";
import { loadGrammars, loadTheme } from "monaco-volar";

const theme = loadTheme()

const editorInstance = editor.create(element, {
    theme,
    /* other options*/
})

loadGrammars(editorInstance);
```

### Setup language service

### Provide web worker

We need to let monaco know where and how to load out worker when using Vue.

```ts
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import vueWorker from "monaco-volar/vue.worker?worker";

function loadMonacoEnv() {
  (self as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      if (label === "vue") {
        return new vueWorker();
      }
      return new editorWorker();
    },
  };
}

loadMonacoEnv()

```

#### Prepare virtual files

We have some pre-defined type declaration files to provide type check and more language features. 

```ts
import { prepareVirtualFiles } from "monaco-volar";

prepareVirtualFiles();
```

### Create vue model

Now we can just create a model using vue language.

```ts
const model = editor.createModel(code, 'vue', uri);
```


## API

## Add extra lib

```ts
monaco.languages.vue.vueDefaults.addExtraLib(uri, code);
```
