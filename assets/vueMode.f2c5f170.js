var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { e as editor, d as __export, _ as __commonJS, f as __toCommonJS, h as __esm, l as languages, U as Uri, M as MarkerTag, i as MarkerSeverity2, j as asDisposable, k as createDisposable, n as disposeAll } from "./index.bb885a71.js";
const STOP_WHEN_IDLE_FOR = 2 * 60 * 1e3;
class WorkerManager {
  constructor(defaults) {
    this._defaults = defaults;
    this._worker = null;
    this._client = null;
    this._idleCheckInterval = window.setInterval(() => this._checkIfIdle(), 30 * 1e3);
    this._lastUsedTime = 0;
    this._configChangeListener = this._defaults.onDidChange(() => this._stopWorker());
    this._extraLibChangeListener = this._defaults.onExtraLibChange(() => this._updateExtraLib());
  }
  _updateExtraLib() {
    this._getClient().then((client) => {
      client.updateExtraLibs(this._defaults.getExtraLibs());
    });
  }
  _stopWorker() {
    if (this._worker) {
      this._worker.dispose();
      this._worker = null;
    }
    this._client = null;
  }
  dispose() {
    clearInterval(this._idleCheckInterval);
    this._configChangeListener.dispose();
    this._extraLibChangeListener.dispose();
    this._stopWorker();
  }
  _checkIfIdle() {
    if (!this._worker) {
      return;
    }
    let timePassedSinceLastUsed = Date.now() - this._lastUsedTime;
    if (timePassedSinceLastUsed > STOP_WHEN_IDLE_FOR) {
      this._stopWorker();
    }
  }
  _getClient() {
    this._lastUsedTime = Date.now();
    if (!this._client) {
      this._worker = editor.createWebWorker({
        moduleId: "vs/language/vue/vueWorker",
        label: this._defaults.languageId,
        createData: {
          languageId: this._defaults.languageId,
          extraLibs: this._defaults.getExtraLibs()
        }
      });
      this._client = this._worker.getProxy();
    }
    return this._client;
  }
  getLanguageServiceWorker(...resources) {
    let _client;
    return this._getClient().then((client) => {
      _client = client;
    }).then((_) => {
      if (this._worker) {
        return this._worker.withSyncedResources(resources);
      }
    }).then((_) => _client);
  }
}
var require_ral = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/ral.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var _ral;
    function RAL() {
      if (_ral === void 0) {
        throw new Error(`No runtime abstraction layer installed`);
      }
      return _ral;
    }
    (function(RAL2) {
      function install(ral) {
        if (ral === void 0) {
          throw new Error(`No runtime abstraction layer provided`);
        }
        _ral = ral;
      }
      RAL2.install = install;
    })(RAL || (RAL = {}));
    exports.default = RAL;
  }
});
var require_disposable = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/disposable.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Disposable = void 0;
    (function(Disposable2) {
      function create(func) {
        return {
          dispose: func
        };
      }
      Disposable2.create = create;
    })(exports.Disposable || (exports.Disposable = {}));
  }
});
var require_events = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/events.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Emitter = exports.Event = void 0;
    var ral_1 = require_ral();
    (function(Event2) {
      const _disposable = { dispose() {
      } };
      Event2.None = function() {
        return _disposable;
      };
    })(exports.Event || (exports.Event = {}));
    var CallbackList = class {
      add(callback, context = null, bucket) {
        if (!this._callbacks) {
          this._callbacks = [];
          this._contexts = [];
        }
        this._callbacks.push(callback);
        this._contexts.push(context);
        if (Array.isArray(bucket)) {
          bucket.push({ dispose: () => this.remove(callback, context) });
        }
      }
      remove(callback, context = null) {
        if (!this._callbacks) {
          return;
        }
        let foundCallbackWithDifferentContext = false;
        for (let i = 0, len = this._callbacks.length; i < len; i++) {
          if (this._callbacks[i] === callback) {
            if (this._contexts[i] === context) {
              this._callbacks.splice(i, 1);
              this._contexts.splice(i, 1);
              return;
            } else {
              foundCallbackWithDifferentContext = true;
            }
          }
        }
        if (foundCallbackWithDifferentContext) {
          throw new Error("When adding a listener with a context, you should remove it with the same context");
        }
      }
      invoke(...args) {
        if (!this._callbacks) {
          return [];
        }
        const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
        for (let i = 0, len = callbacks.length; i < len; i++) {
          try {
            ret.push(callbacks[i].apply(contexts[i], args));
          } catch (e) {
            (0, ral_1.default)().console.error(e);
          }
        }
        return ret;
      }
      isEmpty() {
        return !this._callbacks || this._callbacks.length === 0;
      }
      dispose() {
        this._callbacks = void 0;
        this._contexts = void 0;
      }
    };
    var Emitter = class {
      constructor(_options) {
        this._options = _options;
      }
      get event() {
        if (!this._event) {
          this._event = (listener, thisArgs, disposables) => {
            if (!this._callbacks) {
              this._callbacks = new CallbackList();
            }
            if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
              this._options.onFirstListenerAdd(this);
            }
            this._callbacks.add(listener, thisArgs);
            const result = {
              dispose: () => {
                if (!this._callbacks) {
                  return;
                }
                this._callbacks.remove(listener, thisArgs);
                result.dispose = Emitter._noop;
                if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                  this._options.onLastListenerRemove(this);
                }
              }
            };
            if (Array.isArray(disposables)) {
              disposables.push(result);
            }
            return result;
          };
        }
        return this._event;
      }
      fire(event) {
        if (this._callbacks) {
          this._callbacks.invoke.call(this._callbacks, event);
        }
      }
      dispose() {
        if (this._callbacks) {
          this._callbacks.dispose();
          this._callbacks = void 0;
        }
      }
    };
    exports.Emitter = Emitter;
    Emitter._noop = function() {
    };
  }
});
var require_messageBuffer = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/messageBuffer.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractMessageBuffer = void 0;
    var CR = 13;
    var LF = 10;
    var CRLF = "\r\n";
    var AbstractMessageBuffer = class {
      constructor(encoding = "utf-8") {
        this._encoding = encoding;
        this._chunks = [];
        this._totalLength = 0;
      }
      get encoding() {
        return this._encoding;
      }
      append(chunk) {
        const toAppend = typeof chunk === "string" ? this.fromString(chunk, this._encoding) : chunk;
        this._chunks.push(toAppend);
        this._totalLength += toAppend.byteLength;
      }
      tryReadHeaders() {
        if (this._chunks.length === 0) {
          return void 0;
        }
        let state = 0;
        let chunkIndex = 0;
        let offset = 0;
        let chunkBytesRead = 0;
        row:
          while (chunkIndex < this._chunks.length) {
            const chunk = this._chunks[chunkIndex];
            offset = 0;
            while (offset < chunk.length) {
              const value = chunk[offset];
              switch (value) {
                case CR:
                  switch (state) {
                    case 0:
                      state = 1;
                      break;
                    case 2:
                      state = 3;
                      break;
                    default:
                      state = 0;
                  }
                  break;
                case LF:
                  switch (state) {
                    case 1:
                      state = 2;
                      break;
                    case 3:
                      state = 4;
                      offset++;
                      break row;
                    default:
                      state = 0;
                  }
                  break;
                default:
                  state = 0;
              }
              offset++;
            }
            chunkBytesRead += chunk.byteLength;
            chunkIndex++;
          }
        if (state !== 4) {
          return void 0;
        }
        const buffer = this._read(chunkBytesRead + offset);
        const result = /* @__PURE__ */ new Map();
        const headers = this.toString(buffer, "ascii").split(CRLF);
        if (headers.length < 2) {
          return result;
        }
        for (let i = 0; i < headers.length - 2; i++) {
          const header = headers[i];
          const index = header.indexOf(":");
          if (index === -1) {
            throw new Error("Message header must separate key and value using :");
          }
          const key = header.substr(0, index);
          const value = header.substr(index + 1).trim();
          result.set(key, value);
        }
        return result;
      }
      tryReadBody(length) {
        if (this._totalLength < length) {
          return void 0;
        }
        return this._read(length);
      }
      get numberOfBytes() {
        return this._totalLength;
      }
      _read(byteCount) {
        if (byteCount === 0) {
          return this.emptyBuffer();
        }
        if (byteCount > this._totalLength) {
          throw new Error(`Cannot read so many bytes!`);
        }
        if (this._chunks[0].byteLength === byteCount) {
          const chunk = this._chunks[0];
          this._chunks.shift();
          this._totalLength -= byteCount;
          return this.asNative(chunk);
        }
        if (this._chunks[0].byteLength > byteCount) {
          const chunk = this._chunks[0];
          const result2 = this.asNative(chunk, byteCount);
          this._chunks[0] = chunk.slice(byteCount);
          this._totalLength -= byteCount;
          return result2;
        }
        const result = this.allocNative(byteCount);
        let resultOffset = 0;
        let chunkIndex = 0;
        while (byteCount > 0) {
          const chunk = this._chunks[chunkIndex];
          if (chunk.byteLength > byteCount) {
            const chunkPart = chunk.slice(0, byteCount);
            result.set(chunkPart, resultOffset);
            resultOffset += byteCount;
            this._chunks[chunkIndex] = chunk.slice(byteCount);
            this._totalLength -= byteCount;
            byteCount -= byteCount;
          } else {
            result.set(chunk, resultOffset);
            resultOffset += chunk.byteLength;
            this._chunks.shift();
            this._totalLength -= chunk.byteLength;
            byteCount -= chunk.byteLength;
          }
        }
        return result;
      }
    };
    exports.AbstractMessageBuffer = AbstractMessageBuffer;
  }
});
var require_ril = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/browser/ril.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ral_1 = require_ral();
    var disposable_1 = require_disposable();
    var events_1 = require_events();
    var messageBuffer_1 = require_messageBuffer();
    var MessageBuffer = class extends messageBuffer_1.AbstractMessageBuffer {
      constructor(encoding = "utf-8") {
        super(encoding);
        this.asciiDecoder = new TextDecoder("ascii");
      }
      emptyBuffer() {
        return MessageBuffer.emptyBuffer;
      }
      fromString(value, _encoding) {
        return new TextEncoder().encode(value);
      }
      toString(value, encoding) {
        if (encoding === "ascii") {
          return this.asciiDecoder.decode(value);
        } else {
          return new TextDecoder(encoding).decode(value);
        }
      }
      asNative(buffer, length) {
        if (length === void 0) {
          return buffer;
        } else {
          return buffer.slice(0, length);
        }
      }
      allocNative(length) {
        return new Uint8Array(length);
      }
    };
    MessageBuffer.emptyBuffer = new Uint8Array(0);
    var ReadableStreamWrapper = class {
      constructor(socket) {
        this.socket = socket;
        this._onData = new events_1.Emitter();
        this._messageListener = (event) => {
          const blob = event.data;
          blob.arrayBuffer().then((buffer) => {
            this._onData.fire(new Uint8Array(buffer));
          }, () => {
            (0, ral_1.default)().console.error(`Converting blob to array buffer failed.`);
          });
        };
        this.socket.addEventListener("message", this._messageListener);
      }
      onClose(listener) {
        this.socket.addEventListener("close", listener);
        return disposable_1.Disposable.create(() => this.socket.removeEventListener("close", listener));
      }
      onError(listener) {
        this.socket.addEventListener("error", listener);
        return disposable_1.Disposable.create(() => this.socket.removeEventListener("error", listener));
      }
      onEnd(listener) {
        this.socket.addEventListener("end", listener);
        return disposable_1.Disposable.create(() => this.socket.removeEventListener("end", listener));
      }
      onData(listener) {
        return this._onData.event(listener);
      }
    };
    var WritableStreamWrapper = class {
      constructor(socket) {
        this.socket = socket;
      }
      onClose(listener) {
        this.socket.addEventListener("close", listener);
        return disposable_1.Disposable.create(() => this.socket.removeEventListener("close", listener));
      }
      onError(listener) {
        this.socket.addEventListener("error", listener);
        return disposable_1.Disposable.create(() => this.socket.removeEventListener("error", listener));
      }
      onEnd(listener) {
        this.socket.addEventListener("end", listener);
        return disposable_1.Disposable.create(() => this.socket.removeEventListener("end", listener));
      }
      write(data, encoding) {
        if (typeof data === "string") {
          if (encoding !== void 0 && encoding !== "utf-8") {
            throw new Error(`In a Browser environments only utf-8 text encoding is supported. But got encoding: ${encoding}`);
          }
          this.socket.send(data);
        } else {
          this.socket.send(data);
        }
        return Promise.resolve();
      }
      end() {
        this.socket.close();
      }
    };
    var _textEncoder = new TextEncoder();
    var _ril = Object.freeze({
      messageBuffer: Object.freeze({
        create: (encoding) => new MessageBuffer(encoding)
      }),
      applicationJson: Object.freeze({
        encoder: Object.freeze({
          name: "application/json",
          encode: (msg, options) => {
            if (options.charset !== "utf-8") {
              throw new Error(`In a Browser environments only utf-8 text encoding is supported. But got encoding: ${options.charset}`);
            }
            return Promise.resolve(_textEncoder.encode(JSON.stringify(msg, void 0, 0)));
          }
        }),
        decoder: Object.freeze({
          name: "application/json",
          decode: (buffer, options) => {
            if (!(buffer instanceof Uint8Array)) {
              throw new Error(`In a Browser environments only Uint8Arrays are supported.`);
            }
            return Promise.resolve(JSON.parse(new TextDecoder(options.charset).decode(buffer)));
          }
        })
      }),
      stream: Object.freeze({
        asReadableStream: (socket) => new ReadableStreamWrapper(socket),
        asWritableStream: (socket) => new WritableStreamWrapper(socket)
      }),
      console,
      timer: Object.freeze({
        setTimeout(callback, ms, ...args) {
          const handle = setTimeout(callback, ms, ...args);
          return { dispose: () => clearTimeout(handle) };
        },
        setImmediate(callback, ...args) {
          const handle = setTimeout(callback, 0, ...args);
          return { dispose: () => clearTimeout(handle) };
        },
        setInterval(callback, ms, ...args) {
          const handle = setInterval(callback, ms, ...args);
          return { dispose: () => clearInterval(handle) };
        }
      })
    });
    function RIL() {
      return _ril;
    }
    (function(RIL2) {
      function install() {
        ral_1.default.install(_ril);
      }
      RIL2.install = install;
    })(RIL || (RIL = {}));
    exports.default = RIL;
  }
});
var require_is = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/is.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stringArray = exports.array = exports.func = exports.error = exports.number = exports.string = exports.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports.stringArray = stringArray;
  }
});
var require_messages = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/messages.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Message = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType = exports.RequestType0 = exports.AbstractMessageSignature = exports.ParameterStructures = exports.ResponseError = exports.ErrorCodes = void 0;
    var is = require_is();
    var ErrorCodes;
    (function(ErrorCodes2) {
      ErrorCodes2.ParseError = -32700;
      ErrorCodes2.InvalidRequest = -32600;
      ErrorCodes2.MethodNotFound = -32601;
      ErrorCodes2.InvalidParams = -32602;
      ErrorCodes2.InternalError = -32603;
      ErrorCodes2.jsonrpcReservedErrorRangeStart = -32099;
      ErrorCodes2.serverErrorStart = -32099;
      ErrorCodes2.MessageWriteError = -32099;
      ErrorCodes2.MessageReadError = -32098;
      ErrorCodes2.PendingResponseRejected = -32097;
      ErrorCodes2.ConnectionInactive = -32096;
      ErrorCodes2.ServerNotInitialized = -32002;
      ErrorCodes2.UnknownErrorCode = -32001;
      ErrorCodes2.jsonrpcReservedErrorRangeEnd = -32e3;
      ErrorCodes2.serverErrorEnd = -32e3;
    })(ErrorCodes = exports.ErrorCodes || (exports.ErrorCodes = {}));
    var ResponseError = class extends Error {
      constructor(code, message, data) {
        super(message);
        this.code = is.number(code) ? code : ErrorCodes.UnknownErrorCode;
        this.data = data;
        Object.setPrototypeOf(this, ResponseError.prototype);
      }
      toJson() {
        const result = {
          code: this.code,
          message: this.message
        };
        if (this.data !== void 0) {
          result.data = this.data;
        }
        return result;
      }
    };
    exports.ResponseError = ResponseError;
    var ParameterStructures = class {
      constructor(kind) {
        this.kind = kind;
      }
      static is(value) {
        return value === ParameterStructures.auto || value === ParameterStructures.byName || value === ParameterStructures.byPosition;
      }
      toString() {
        return this.kind;
      }
    };
    exports.ParameterStructures = ParameterStructures;
    ParameterStructures.auto = new ParameterStructures("auto");
    ParameterStructures.byPosition = new ParameterStructures("byPosition");
    ParameterStructures.byName = new ParameterStructures("byName");
    var AbstractMessageSignature = class {
      constructor(method, numberOfParams) {
        this.method = method;
        this.numberOfParams = numberOfParams;
      }
      get parameterStructures() {
        return ParameterStructures.auto;
      }
    };
    exports.AbstractMessageSignature = AbstractMessageSignature;
    var RequestType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports.RequestType0 = RequestType0;
    var RequestType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.RequestType = RequestType;
    var RequestType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.RequestType1 = RequestType1;
    var RequestType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports.RequestType2 = RequestType2;
    var RequestType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports.RequestType3 = RequestType3;
    var RequestType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports.RequestType4 = RequestType4;
    var RequestType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports.RequestType5 = RequestType5;
    var RequestType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports.RequestType6 = RequestType6;
    var RequestType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports.RequestType7 = RequestType7;
    var RequestType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports.RequestType8 = RequestType8;
    var RequestType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports.RequestType9 = RequestType9;
    var NotificationType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.NotificationType = NotificationType;
    var NotificationType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports.NotificationType0 = NotificationType0;
    var NotificationType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.NotificationType1 = NotificationType1;
    var NotificationType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports.NotificationType2 = NotificationType2;
    var NotificationType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports.NotificationType3 = NotificationType3;
    var NotificationType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports.NotificationType4 = NotificationType4;
    var NotificationType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports.NotificationType5 = NotificationType5;
    var NotificationType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports.NotificationType6 = NotificationType6;
    var NotificationType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports.NotificationType7 = NotificationType7;
    var NotificationType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports.NotificationType8 = NotificationType8;
    var NotificationType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports.NotificationType9 = NotificationType9;
    (function(Message2) {
      function isRequest(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && (is.string(candidate.id) || is.number(candidate.id));
      }
      Message2.isRequest = isRequest;
      function isNotification(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && message.id === void 0;
      }
      Message2.isNotification = isNotification;
      function isResponse(message) {
        const candidate = message;
        return candidate && (candidate.result !== void 0 || !!candidate.error) && (is.string(candidate.id) || is.number(candidate.id) || candidate.id === null);
      }
      Message2.isResponse = isResponse;
    })(exports.Message || (exports.Message = {}));
  }
});
var require_linkedMap = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/linkedMap.js"(exports) {
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LRUCache = exports.LinkedMap = exports.Touch = void 0;
    var Touch;
    (function(Touch2) {
      Touch2.None = 0;
      Touch2.First = 1;
      Touch2.AsOld = Touch2.First;
      Touch2.Last = 2;
      Touch2.AsNew = Touch2.Last;
    })(Touch = exports.Touch || (exports.Touch = {}));
    var LinkedMap = class {
      constructor() {
        this[_a] = "LinkedMap";
        this._map = /* @__PURE__ */ new Map();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state = 0;
      }
      clear() {
        this._map.clear();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state++;
      }
      isEmpty() {
        return !this._head && !this._tail;
      }
      get size() {
        return this._size;
      }
      get first() {
        var _a2;
        return (_a2 = this._head) == null ? void 0 : _a2.value;
      }
      get last() {
        var _a2;
        return (_a2 = this._tail) == null ? void 0 : _a2.value;
      }
      has(key) {
        return this._map.has(key);
      }
      get(key, touch = Touch.None) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        if (touch !== Touch.None) {
          this.touch(item, touch);
        }
        return item.value;
      }
      set(key, value, touch = Touch.None) {
        let item = this._map.get(key);
        if (item) {
          item.value = value;
          if (touch !== Touch.None) {
            this.touch(item, touch);
          }
        } else {
          item = { key, value, next: void 0, previous: void 0 };
          switch (touch) {
            case Touch.None:
              this.addItemLast(item);
              break;
            case Touch.First:
              this.addItemFirst(item);
              break;
            case Touch.Last:
              this.addItemLast(item);
              break;
            default:
              this.addItemLast(item);
              break;
          }
          this._map.set(key, item);
          this._size++;
        }
        return this;
      }
      delete(key) {
        return !!this.remove(key);
      }
      remove(key) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        this._map.delete(key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      shift() {
        if (!this._head && !this._tail) {
          return void 0;
        }
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        const item = this._head;
        this._map.delete(item.key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      forEach(callbackfn, thisArg) {
        const state = this._state;
        let current = this._head;
        while (current) {
          if (thisArg) {
            callbackfn.bind(thisArg)(current.value, current.key, this);
          } else {
            callbackfn(current.value, current.key, this);
          }
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          current = current.next;
        }
      }
      keys() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.key, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      values() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.value, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      entries() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: [current.key, current.value], done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      [(_a = Symbol.toStringTag, Symbol.iterator)]() {
        return this.entries();
      }
      trimOld(newSize) {
        if (newSize >= this.size) {
          return;
        }
        if (newSize === 0) {
          this.clear();
          return;
        }
        let current = this._head;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
          this._map.delete(current.key);
          current = current.next;
          currentSize--;
        }
        this._head = current;
        this._size = currentSize;
        if (current) {
          current.previous = void 0;
        }
        this._state++;
      }
      addItemFirst(item) {
        if (!this._head && !this._tail) {
          this._tail = item;
        } else if (!this._head) {
          throw new Error("Invalid list");
        } else {
          item.next = this._head;
          this._head.previous = item;
        }
        this._head = item;
        this._state++;
      }
      addItemLast(item) {
        if (!this._head && !this._tail) {
          this._head = item;
        } else if (!this._tail) {
          throw new Error("Invalid list");
        } else {
          item.previous = this._tail;
          this._tail.next = item;
        }
        this._tail = item;
        this._state++;
      }
      removeItem(item) {
        if (item === this._head && item === this._tail) {
          this._head = void 0;
          this._tail = void 0;
        } else if (item === this._head) {
          if (!item.next) {
            throw new Error("Invalid list");
          }
          item.next.previous = void 0;
          this._head = item.next;
        } else if (item === this._tail) {
          if (!item.previous) {
            throw new Error("Invalid list");
          }
          item.previous.next = void 0;
          this._tail = item.previous;
        } else {
          const next = item.next;
          const previous = item.previous;
          if (!next || !previous) {
            throw new Error("Invalid list");
          }
          next.previous = previous;
          previous.next = next;
        }
        item.next = void 0;
        item.previous = void 0;
        this._state++;
      }
      touch(item, touch) {
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        if (touch !== Touch.First && touch !== Touch.Last) {
          return;
        }
        if (touch === Touch.First) {
          if (item === this._head) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._tail) {
            previous.next = void 0;
            this._tail = previous;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.previous = void 0;
          item.next = this._head;
          this._head.previous = item;
          this._head = item;
          this._state++;
        } else if (touch === Touch.Last) {
          if (item === this._tail) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._head) {
            next.previous = void 0;
            this._head = next;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.next = void 0;
          item.previous = this._tail;
          this._tail.next = item;
          this._tail = item;
          this._state++;
        }
      }
      toJSON() {
        const data = [];
        this.forEach((value, key) => {
          data.push([key, value]);
        });
        return data;
      }
      fromJSON(data) {
        this.clear();
        for (const [key, value] of data) {
          this.set(key, value);
        }
      }
    };
    exports.LinkedMap = LinkedMap;
    var LRUCache = class extends LinkedMap {
      constructor(limit, ratio = 1) {
        super();
        this._limit = limit;
        this._ratio = Math.min(Math.max(0, ratio), 1);
      }
      get limit() {
        return this._limit;
      }
      set limit(limit) {
        this._limit = limit;
        this.checkTrim();
      }
      get ratio() {
        return this._ratio;
      }
      set ratio(ratio) {
        this._ratio = Math.min(Math.max(0, ratio), 1);
        this.checkTrim();
      }
      get(key, touch = Touch.AsNew) {
        return super.get(key, touch);
      }
      peek(key) {
        return super.get(key, Touch.None);
      }
      set(key, value) {
        super.set(key, value, Touch.Last);
        this.checkTrim();
        return this;
      }
      checkTrim() {
        if (this.size > this._limit) {
          this.trimOld(Math.round(this._limit * this._ratio));
        }
      }
    };
    exports.LRUCache = LRUCache;
  }
});
var require_cancellation = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/cancellation.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CancellationTokenSource = exports.CancellationToken = void 0;
    var ral_1 = require_ral();
    var Is2 = require_is();
    var events_1 = require_events();
    var CancellationToken;
    (function(CancellationToken2) {
      CancellationToken2.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: events_1.Event.None
      });
      CancellationToken2.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: events_1.Event.None
      });
      function is(value) {
        const candidate = value;
        return candidate && (candidate === CancellationToken2.None || candidate === CancellationToken2.Cancelled || Is2.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested);
      }
      CancellationToken2.is = is;
    })(CancellationToken = exports.CancellationToken || (exports.CancellationToken = {}));
    var shortcutEvent = Object.freeze(function(callback, context) {
      const handle = (0, ral_1.default)().timer.setTimeout(callback.bind(context), 0);
      return { dispose() {
        handle.dispose();
      } };
    });
    var MutableToken = class {
      constructor() {
        this._isCancelled = false;
      }
      cancel() {
        if (!this._isCancelled) {
          this._isCancelled = true;
          if (this._emitter) {
            this._emitter.fire(void 0);
            this.dispose();
          }
        }
      }
      get isCancellationRequested() {
        return this._isCancelled;
      }
      get onCancellationRequested() {
        if (this._isCancelled) {
          return shortcutEvent;
        }
        if (!this._emitter) {
          this._emitter = new events_1.Emitter();
        }
        return this._emitter.event;
      }
      dispose() {
        if (this._emitter) {
          this._emitter.dispose();
          this._emitter = void 0;
        }
      }
    };
    var CancellationTokenSource = class {
      get token() {
        if (!this._token) {
          this._token = new MutableToken();
        }
        return this._token;
      }
      cancel() {
        if (!this._token) {
          this._token = CancellationToken.Cancelled;
        } else {
          this._token.cancel();
        }
      }
      dispose() {
        if (!this._token) {
          this._token = CancellationToken.None;
        } else if (this._token instanceof MutableToken) {
          this._token.dispose();
        }
      }
    };
    exports.CancellationTokenSource = CancellationTokenSource;
  }
});
var require_messageReader = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/messageReader.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = void 0;
    var ral_1 = require_ral();
    var Is2 = require_is();
    var events_1 = require_events();
    (function(MessageReader2) {
      function is(value) {
        let candidate = value;
        return candidate && Is2.func(candidate.listen) && Is2.func(candidate.dispose) && Is2.func(candidate.onError) && Is2.func(candidate.onClose) && Is2.func(candidate.onPartialMessage);
      }
      MessageReader2.is = is;
    })(exports.MessageReader || (exports.MessageReader = {}));
    var AbstractMessageReader = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
        this.partialMessageEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error) {
        this.errorEmitter.fire(this.asError(error));
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      get onPartialMessage() {
        return this.partialMessageEmitter.event;
      }
      firePartialMessage(info) {
        this.partialMessageEmitter.fire(info);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Reader received error. Reason: ${Is2.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports.AbstractMessageReader = AbstractMessageReader;
    var ResolvedMessageReaderOptions;
    (function(ResolvedMessageReaderOptions2) {
      function fromOptions(options) {
        var _a;
        let charset;
        let contentDecoder;
        const contentDecoders = /* @__PURE__ */ new Map();
        let contentTypeDecoder;
        const contentTypeDecoders = /* @__PURE__ */ new Map();
        if (options === void 0 || typeof options === "string") {
          charset = options != null ? options : "utf-8";
        } else {
          charset = (_a = options.charset) != null ? _a : "utf-8";
          if (options.contentDecoder !== void 0) {
            contentDecoder = options.contentDecoder;
            contentDecoders.set(contentDecoder.name, contentDecoder);
          }
          if (options.contentDecoders !== void 0) {
            for (const decoder of options.contentDecoders) {
              contentDecoders.set(decoder.name, decoder);
            }
          }
          if (options.contentTypeDecoder !== void 0) {
            contentTypeDecoder = options.contentTypeDecoder;
            contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
          }
          if (options.contentTypeDecoders !== void 0) {
            for (const decoder of options.contentTypeDecoders) {
              contentTypeDecoders.set(decoder.name, decoder);
            }
          }
        }
        if (contentTypeDecoder === void 0) {
          contentTypeDecoder = (0, ral_1.default)().applicationJson.decoder;
          contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
        }
        return { charset, contentDecoder, contentDecoders, contentTypeDecoder, contentTypeDecoders };
      }
      ResolvedMessageReaderOptions2.fromOptions = fromOptions;
    })(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));
    var ReadableStreamMessageReader = class extends AbstractMessageReader {
      constructor(readable, options) {
        super();
        this.readable = readable;
        this.options = ResolvedMessageReaderOptions.fromOptions(options);
        this.buffer = (0, ral_1.default)().messageBuffer.create(this.options.charset);
        this._partialMessageTimeout = 1e4;
        this.nextMessageLength = -1;
        this.messageToken = 0;
      }
      set partialMessageTimeout(timeout) {
        this._partialMessageTimeout = timeout;
      }
      get partialMessageTimeout() {
        return this._partialMessageTimeout;
      }
      listen(callback) {
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.partialMessageTimer = void 0;
        this.callback = callback;
        const result = this.readable.onData((data) => {
          this.onData(data);
        });
        this.readable.onError((error) => this.fireError(error));
        this.readable.onClose(() => this.fireClose());
        return result;
      }
      onData(data) {
        this.buffer.append(data);
        while (true) {
          if (this.nextMessageLength === -1) {
            const headers = this.buffer.tryReadHeaders();
            if (!headers) {
              return;
            }
            const contentLength = headers.get("Content-Length");
            if (!contentLength) {
              throw new Error("Header must provide a Content-Length property.");
            }
            const length = parseInt(contentLength);
            if (isNaN(length)) {
              throw new Error("Content-Length value must be a number.");
            }
            this.nextMessageLength = length;
          }
          const body = this.buffer.tryReadBody(this.nextMessageLength);
          if (body === void 0) {
            this.setPartialMessageTimer();
            return;
          }
          this.clearPartialMessageTimer();
          this.nextMessageLength = -1;
          let p;
          if (this.options.contentDecoder !== void 0) {
            p = this.options.contentDecoder.decode(body);
          } else {
            p = Promise.resolve(body);
          }
          p.then((value) => {
            this.options.contentTypeDecoder.decode(value, this.options).then((msg) => {
              this.callback(msg);
            }, (error) => {
              this.fireError(error);
            });
          }, (error) => {
            this.fireError(error);
          });
        }
      }
      clearPartialMessageTimer() {
        if (this.partialMessageTimer) {
          this.partialMessageTimer.dispose();
          this.partialMessageTimer = void 0;
        }
      }
      setPartialMessageTimer() {
        this.clearPartialMessageTimer();
        if (this._partialMessageTimeout <= 0) {
          return;
        }
        this.partialMessageTimer = (0, ral_1.default)().timer.setTimeout((token, timeout) => {
          this.partialMessageTimer = void 0;
          if (token === this.messageToken) {
            this.firePartialMessage({ messageToken: token, waitingTime: timeout });
            this.setPartialMessageTimer();
          }
        }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
      }
    };
    exports.ReadableStreamMessageReader = ReadableStreamMessageReader;
  }
});
var require_semaphore = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/semaphore.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Semaphore = void 0;
    var ral_1 = require_ral();
    var Semaphore = class {
      constructor(capacity = 1) {
        if (capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }
        this._capacity = capacity;
        this._active = 0;
        this._waiting = [];
      }
      lock(thunk) {
        return new Promise((resolve, reject) => {
          this._waiting.push({ thunk, resolve, reject });
          this.runNext();
        });
      }
      get active() {
        return this._active;
      }
      runNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        (0, ral_1.default)().timer.setImmediate(() => this.doRunNext());
      }
      doRunNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        const next = this._waiting.shift();
        this._active++;
        if (this._active > this._capacity) {
          throw new Error(`To many thunks active`);
        }
        try {
          const result = next.thunk();
          if (result instanceof Promise) {
            result.then((value) => {
              this._active--;
              next.resolve(value);
              this.runNext();
            }, (err) => {
              this._active--;
              next.reject(err);
              this.runNext();
            });
          } else {
            this._active--;
            next.resolve(result);
            this.runNext();
          }
        } catch (err) {
          this._active--;
          next.reject(err);
          this.runNext();
        }
      }
    };
    exports.Semaphore = Semaphore;
  }
});
var require_messageWriter = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/messageWriter.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = void 0;
    var ral_1 = require_ral();
    var Is2 = require_is();
    var semaphore_1 = require_semaphore();
    var events_1 = require_events();
    var ContentLength = "Content-Length: ";
    var CRLF = "\r\n";
    (function(MessageWriter2) {
      function is(value) {
        let candidate = value;
        return candidate && Is2.func(candidate.dispose) && Is2.func(candidate.onClose) && Is2.func(candidate.onError) && Is2.func(candidate.write);
      }
      MessageWriter2.is = is;
    })(exports.MessageWriter || (exports.MessageWriter = {}));
    var AbstractMessageWriter = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error, message, count) {
        this.errorEmitter.fire([this.asError(error), message, count]);
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Writer received error. Reason: ${Is2.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports.AbstractMessageWriter = AbstractMessageWriter;
    var ResolvedMessageWriterOptions;
    (function(ResolvedMessageWriterOptions2) {
      function fromOptions(options) {
        var _a, _b;
        if (options === void 0 || typeof options === "string") {
          return { charset: options != null ? options : "utf-8", contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder };
        } else {
          return { charset: (_a = options.charset) != null ? _a : "utf-8", contentEncoder: options.contentEncoder, contentTypeEncoder: (_b = options.contentTypeEncoder) != null ? _b : (0, ral_1.default)().applicationJson.encoder };
        }
      }
      ResolvedMessageWriterOptions2.fromOptions = fromOptions;
    })(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));
    var WriteableStreamMessageWriter = class extends AbstractMessageWriter {
      constructor(writable, options) {
        super();
        this.writable = writable;
        this.options = ResolvedMessageWriterOptions.fromOptions(options);
        this.errorCount = 0;
        this.writeSemaphore = new semaphore_1.Semaphore(1);
        this.writable.onError((error) => this.fireError(error));
        this.writable.onClose(() => this.fireClose());
      }
      async write(msg) {
        return this.writeSemaphore.lock(async () => {
          const payload = this.options.contentTypeEncoder.encode(msg, this.options).then((buffer) => {
            if (this.options.contentEncoder !== void 0) {
              return this.options.contentEncoder.encode(buffer);
            } else {
              return buffer;
            }
          });
          return payload.then((buffer) => {
            const headers = [];
            headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
            headers.push(CRLF);
            return this.doWrite(msg, headers, buffer);
          }, (error) => {
            this.fireError(error);
            throw error;
          });
        });
      }
      async doWrite(msg, headers, data) {
        try {
          await this.writable.write(headers.join(""), "ascii");
          return this.writable.write(data);
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
        this.writable.end();
      }
    };
    exports.WriteableStreamMessageWriter = WriteableStreamMessageWriter;
  }
});
var require_connection = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/connection.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMessageConnection = exports.ConnectionOptions = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.ConnectionStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.Trace = exports.NullLogger = exports.ProgressType = exports.ProgressToken = void 0;
    var ral_1 = require_ral();
    var Is2 = require_is();
    var messages_1 = require_messages();
    var linkedMap_1 = require_linkedMap();
    var events_1 = require_events();
    var cancellation_1 = require_cancellation();
    var CancelNotification;
    (function(CancelNotification2) {
      CancelNotification2.type = new messages_1.NotificationType("$/cancelRequest");
    })(CancelNotification || (CancelNotification = {}));
    var ProgressToken;
    (function(ProgressToken2) {
      function is(value) {
        return typeof value === "string" || typeof value === "number";
      }
      ProgressToken2.is = is;
    })(ProgressToken = exports.ProgressToken || (exports.ProgressToken = {}));
    var ProgressNotification;
    (function(ProgressNotification2) {
      ProgressNotification2.type = new messages_1.NotificationType("$/progress");
    })(ProgressNotification || (ProgressNotification = {}));
    var ProgressType = class {
      constructor() {
      }
    };
    exports.ProgressType = ProgressType;
    var StarRequestHandler;
    (function(StarRequestHandler2) {
      function is(value) {
        return Is2.func(value);
      }
      StarRequestHandler2.is = is;
    })(StarRequestHandler || (StarRequestHandler = {}));
    exports.NullLogger = Object.freeze({
      error: () => {
      },
      warn: () => {
      },
      info: () => {
      },
      log: () => {
      }
    });
    var Trace;
    (function(Trace2) {
      Trace2[Trace2["Off"] = 0] = "Off";
      Trace2[Trace2["Messages"] = 1] = "Messages";
      Trace2[Trace2["Compact"] = 2] = "Compact";
      Trace2[Trace2["Verbose"] = 3] = "Verbose";
    })(Trace = exports.Trace || (exports.Trace = {}));
    (function(TraceValues2) {
      TraceValues2.Off = "off";
      TraceValues2.Messages = "messages";
      TraceValues2.Compact = "compact";
      TraceValues2.Verbose = "verbose";
    })(exports.TraceValues || (exports.TraceValues = {}));
    (function(Trace2) {
      function fromString(value) {
        if (!Is2.string(value)) {
          return Trace2.Off;
        }
        value = value.toLowerCase();
        switch (value) {
          case "off":
            return Trace2.Off;
          case "messages":
            return Trace2.Messages;
          case "compact":
            return Trace2.Compact;
          case "verbose":
            return Trace2.Verbose;
          default:
            return Trace2.Off;
        }
      }
      Trace2.fromString = fromString;
      function toString(value) {
        switch (value) {
          case Trace2.Off:
            return "off";
          case Trace2.Messages:
            return "messages";
          case Trace2.Compact:
            return "compact";
          case Trace2.Verbose:
            return "verbose";
          default:
            return "off";
        }
      }
      Trace2.toString = toString;
    })(Trace = exports.Trace || (exports.Trace = {}));
    var TraceFormat;
    (function(TraceFormat2) {
      TraceFormat2["Text"] = "text";
      TraceFormat2["JSON"] = "json";
    })(TraceFormat = exports.TraceFormat || (exports.TraceFormat = {}));
    (function(TraceFormat2) {
      function fromString(value) {
        if (!Is2.string(value)) {
          return TraceFormat2.Text;
        }
        value = value.toLowerCase();
        if (value === "json") {
          return TraceFormat2.JSON;
        } else {
          return TraceFormat2.Text;
        }
      }
      TraceFormat2.fromString = fromString;
    })(TraceFormat = exports.TraceFormat || (exports.TraceFormat = {}));
    var SetTraceNotification;
    (function(SetTraceNotification2) {
      SetTraceNotification2.type = new messages_1.NotificationType("$/setTrace");
    })(SetTraceNotification = exports.SetTraceNotification || (exports.SetTraceNotification = {}));
    var LogTraceNotification;
    (function(LogTraceNotification2) {
      LogTraceNotification2.type = new messages_1.NotificationType("$/logTrace");
    })(LogTraceNotification = exports.LogTraceNotification || (exports.LogTraceNotification = {}));
    var ConnectionErrors;
    (function(ConnectionErrors2) {
      ConnectionErrors2[ConnectionErrors2["Closed"] = 1] = "Closed";
      ConnectionErrors2[ConnectionErrors2["Disposed"] = 2] = "Disposed";
      ConnectionErrors2[ConnectionErrors2["AlreadyListening"] = 3] = "AlreadyListening";
    })(ConnectionErrors = exports.ConnectionErrors || (exports.ConnectionErrors = {}));
    var ConnectionError = class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, ConnectionError.prototype);
      }
    };
    exports.ConnectionError = ConnectionError;
    var ConnectionStrategy;
    (function(ConnectionStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is2.func(candidate.cancelUndispatched);
      }
      ConnectionStrategy2.is = is;
    })(ConnectionStrategy = exports.ConnectionStrategy || (exports.ConnectionStrategy = {}));
    var CancellationReceiverStrategy;
    (function(CancellationReceiverStrategy2) {
      CancellationReceiverStrategy2.Message = Object.freeze({
        createCancellationTokenSource(_) {
          return new cancellation_1.CancellationTokenSource();
        }
      });
      function is(value) {
        const candidate = value;
        return candidate && Is2.func(candidate.createCancellationTokenSource);
      }
      CancellationReceiverStrategy2.is = is;
    })(CancellationReceiverStrategy = exports.CancellationReceiverStrategy || (exports.CancellationReceiverStrategy = {}));
    var CancellationSenderStrategy;
    (function(CancellationSenderStrategy2) {
      CancellationSenderStrategy2.Message = Object.freeze({
        sendCancellation(conn, id) {
          return conn.sendNotification(CancelNotification.type, { id });
        },
        cleanup(_) {
        }
      });
      function is(value) {
        const candidate = value;
        return candidate && Is2.func(candidate.sendCancellation) && Is2.func(candidate.cleanup);
      }
      CancellationSenderStrategy2.is = is;
    })(CancellationSenderStrategy = exports.CancellationSenderStrategy || (exports.CancellationSenderStrategy = {}));
    var CancellationStrategy;
    (function(CancellationStrategy2) {
      CancellationStrategy2.Message = Object.freeze({
        receiver: CancellationReceiverStrategy.Message,
        sender: CancellationSenderStrategy.Message
      });
      function is(value) {
        const candidate = value;
        return candidate && CancellationReceiverStrategy.is(candidate.receiver) && CancellationSenderStrategy.is(candidate.sender);
      }
      CancellationStrategy2.is = is;
    })(CancellationStrategy = exports.CancellationStrategy || (exports.CancellationStrategy = {}));
    (function(ConnectionOptions2) {
      function is(value) {
        const candidate = value;
        return candidate && (CancellationStrategy.is(candidate.cancellationStrategy) || ConnectionStrategy.is(candidate.connectionStrategy));
      }
      ConnectionOptions2.is = is;
    })(exports.ConnectionOptions || (exports.ConnectionOptions = {}));
    var ConnectionState;
    (function(ConnectionState2) {
      ConnectionState2[ConnectionState2["New"] = 1] = "New";
      ConnectionState2[ConnectionState2["Listening"] = 2] = "Listening";
      ConnectionState2[ConnectionState2["Closed"] = 3] = "Closed";
      ConnectionState2[ConnectionState2["Disposed"] = 4] = "Disposed";
    })(ConnectionState || (ConnectionState = {}));
    function createMessageConnection(messageReader, messageWriter, _logger, options) {
      const logger = _logger !== void 0 ? _logger : exports.NullLogger;
      let sequenceNumber = 0;
      let notificationSequenceNumber = 0;
      let unknownResponseSequenceNumber = 0;
      const version = "2.0";
      let starRequestHandler = void 0;
      const requestHandlers = /* @__PURE__ */ new Map();
      let starNotificationHandler = void 0;
      const notificationHandlers = /* @__PURE__ */ new Map();
      const progressHandlers = /* @__PURE__ */ new Map();
      let timer;
      let messageQueue = new linkedMap_1.LinkedMap();
      let responsePromises = /* @__PURE__ */ new Map();
      let knownCanceledRequests = /* @__PURE__ */ new Set();
      let requestTokens = /* @__PURE__ */ new Map();
      let trace = Trace.Off;
      let traceFormat = TraceFormat.Text;
      let tracer;
      let state = ConnectionState.New;
      const errorEmitter = new events_1.Emitter();
      const closeEmitter = new events_1.Emitter();
      const unhandledNotificationEmitter = new events_1.Emitter();
      const unhandledProgressEmitter = new events_1.Emitter();
      const disposeEmitter = new events_1.Emitter();
      const cancellationStrategy = options && options.cancellationStrategy ? options.cancellationStrategy : CancellationStrategy.Message;
      function createRequestQueueKey(id) {
        if (id === null) {
          throw new Error(`Can't send requests with id null since the response can't be correlated.`);
        }
        return "req-" + id.toString();
      }
      function createResponseQueueKey(id) {
        if (id === null) {
          return "res-unknown-" + (++unknownResponseSequenceNumber).toString();
        } else {
          return "res-" + id.toString();
        }
      }
      function createNotificationQueueKey() {
        return "not-" + (++notificationSequenceNumber).toString();
      }
      function addMessageToQueue(queue, message) {
        if (messages_1.Message.isRequest(message)) {
          queue.set(createRequestQueueKey(message.id), message);
        } else if (messages_1.Message.isResponse(message)) {
          queue.set(createResponseQueueKey(message.id), message);
        } else {
          queue.set(createNotificationQueueKey(), message);
        }
      }
      function cancelUndispatched(_message) {
        return void 0;
      }
      function isListening() {
        return state === ConnectionState.Listening;
      }
      function isClosed() {
        return state === ConnectionState.Closed;
      }
      function isDisposed() {
        return state === ConnectionState.Disposed;
      }
      function closeHandler() {
        if (state === ConnectionState.New || state === ConnectionState.Listening) {
          state = ConnectionState.Closed;
          closeEmitter.fire(void 0);
        }
      }
      function readErrorHandler(error) {
        errorEmitter.fire([error, void 0, void 0]);
      }
      function writeErrorHandler(data) {
        errorEmitter.fire(data);
      }
      messageReader.onClose(closeHandler);
      messageReader.onError(readErrorHandler);
      messageWriter.onClose(closeHandler);
      messageWriter.onError(writeErrorHandler);
      function triggerMessageQueue() {
        if (timer || messageQueue.size === 0) {
          return;
        }
        timer = (0, ral_1.default)().timer.setImmediate(() => {
          timer = void 0;
          processMessageQueue();
        });
      }
      function processMessageQueue() {
        if (messageQueue.size === 0) {
          return;
        }
        const message = messageQueue.shift();
        try {
          if (messages_1.Message.isRequest(message)) {
            handleRequest(message);
          } else if (messages_1.Message.isNotification(message)) {
            handleNotification(message);
          } else if (messages_1.Message.isResponse(message)) {
            handleResponse(message);
          } else {
            handleInvalidMessage(message);
          }
        } finally {
          triggerMessageQueue();
        }
      }
      const callback = (message) => {
        try {
          if (messages_1.Message.isNotification(message) && message.method === CancelNotification.type.method) {
            const cancelId = message.params.id;
            const key = createRequestQueueKey(cancelId);
            const toCancel = messageQueue.get(key);
            if (messages_1.Message.isRequest(toCancel)) {
              const strategy = options == null ? void 0 : options.connectionStrategy;
              const response = strategy && strategy.cancelUndispatched ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
              if (response && (response.error !== void 0 || response.result !== void 0)) {
                messageQueue.delete(key);
                requestTokens.delete(cancelId);
                response.id = toCancel.id;
                traceSendingResponse(response, message.method, Date.now());
                messageWriter.write(response).catch(() => logger.error(`Sending response for canceled message failed.`));
                return;
              }
            }
            const cancellationToken = requestTokens.get(cancelId);
            if (cancellationToken !== void 0) {
              cancellationToken.cancel();
              traceReceivedNotification(message);
              return;
            } else {
              knownCanceledRequests.add(cancelId);
            }
          }
          addMessageToQueue(messageQueue, message);
        } finally {
          triggerMessageQueue();
        }
      };
      function handleRequest(requestMessage) {
        var _a;
        if (isDisposed()) {
          return;
        }
        function reply(resultOrError, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id
          };
          if (resultOrError instanceof messages_1.ResponseError) {
            message.error = resultOrError.toJson();
          } else {
            message.result = resultOrError === void 0 ? null : resultOrError;
          }
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replyError(error, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            error: error.toJson()
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replySuccess(result, method, startTime2) {
          if (result === void 0) {
            result = null;
          }
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            result
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        traceReceivedRequest(requestMessage);
        const element = requestHandlers.get(requestMessage.method);
        let type;
        let requestHandler;
        if (element) {
          type = element.type;
          requestHandler = element.handler;
        }
        const startTime = Date.now();
        if (requestHandler || starRequestHandler) {
          const tokenKey = (_a = requestMessage.id) != null ? _a : String(Date.now());
          const cancellationSource = cancellationStrategy.receiver.createCancellationTokenSource(tokenKey);
          if (requestMessage.id !== null && knownCanceledRequests.has(requestMessage.id)) {
            cancellationSource.cancel();
          }
          if (requestMessage.id !== null) {
            requestTokens.set(tokenKey, cancellationSource);
          }
          try {
            let handlerResult;
            if (requestHandler) {
              if (requestMessage.params === void 0) {
                if (type !== void 0 && type.numberOfParams !== 0) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines ${type.numberOfParams} params but received none.`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(cancellationSource.token);
              } else if (Array.isArray(requestMessage.params)) {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byName) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by name but received parameters by position`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(...requestMessage.params, cancellationSource.token);
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by position but received parameters by name`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(requestMessage.params, cancellationSource.token);
              }
            } else if (starRequestHandler) {
              handlerResult = starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
            }
            const promise = handlerResult;
            if (!handlerResult) {
              requestTokens.delete(tokenKey);
              replySuccess(handlerResult, requestMessage.method, startTime);
            } else if (promise.then) {
              promise.then((resultOrError) => {
                requestTokens.delete(tokenKey);
                reply(resultOrError, requestMessage.method, startTime);
              }, (error) => {
                requestTokens.delete(tokenKey);
                if (error instanceof messages_1.ResponseError) {
                  replyError(error, requestMessage.method, startTime);
                } else if (error && Is2.string(error.message)) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
                } else {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
                }
              });
            } else {
              requestTokens.delete(tokenKey);
              reply(handlerResult, requestMessage.method, startTime);
            }
          } catch (error) {
            requestTokens.delete(tokenKey);
            if (error instanceof messages_1.ResponseError) {
              reply(error, requestMessage.method, startTime);
            } else if (error && Is2.string(error.message)) {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
            } else {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
            }
          }
        } else {
          replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
        }
      }
      function handleResponse(responseMessage) {
        if (isDisposed()) {
          return;
        }
        if (responseMessage.id === null) {
          if (responseMessage.error) {
            logger.error(`Received response message without id: Error is: 
${JSON.stringify(responseMessage.error, void 0, 4)}`);
          } else {
            logger.error(`Received response message without id. No further error information provided.`);
          }
        } else {
          const key = responseMessage.id;
          const responsePromise = responsePromises.get(key);
          traceReceivedResponse(responseMessage, responsePromise);
          if (responsePromise !== void 0) {
            responsePromises.delete(key);
            try {
              if (responseMessage.error) {
                const error = responseMessage.error;
                responsePromise.reject(new messages_1.ResponseError(error.code, error.message, error.data));
              } else if (responseMessage.result !== void 0) {
                responsePromise.resolve(responseMessage.result);
              } else {
                throw new Error("Should never happen.");
              }
            } catch (error) {
              if (error.message) {
                logger.error(`Response handler '${responsePromise.method}' failed with message: ${error.message}`);
              } else {
                logger.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
              }
            }
          }
        }
      }
      function handleNotification(message) {
        if (isDisposed()) {
          return;
        }
        let type = void 0;
        let notificationHandler;
        if (message.method === CancelNotification.type.method) {
          const cancelId = message.params.id;
          knownCanceledRequests.delete(cancelId);
          traceReceivedNotification(message);
          return;
        } else {
          const element = notificationHandlers.get(message.method);
          if (element) {
            notificationHandler = element.handler;
            type = element.type;
          }
        }
        if (notificationHandler || starNotificationHandler) {
          try {
            traceReceivedNotification(message);
            if (notificationHandler) {
              if (message.params === void 0) {
                if (type !== void 0) {
                  if (type.numberOfParams !== 0 && type.parameterStructures !== messages_1.ParameterStructures.byName) {
                    logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received none.`);
                  }
                }
                notificationHandler();
              } else if (Array.isArray(message.params)) {
                const params = message.params;
                if (message.method === ProgressNotification.type.method && params.length === 2 && ProgressToken.is(params[0])) {
                  notificationHandler({ token: params[0], value: params[1] });
                } else {
                  if (type !== void 0) {
                    if (type.parameterStructures === messages_1.ParameterStructures.byName) {
                      logger.error(`Notification ${message.method} defines parameters by name but received parameters by position`);
                    }
                    if (type.numberOfParams !== message.params.length) {
                      logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received ${params.length} arguments`);
                    }
                  }
                  notificationHandler(...params);
                }
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  logger.error(`Notification ${message.method} defines parameters by position but received parameters by name`);
                }
                notificationHandler(message.params);
              }
            } else if (starNotificationHandler) {
              starNotificationHandler(message.method, message.params);
            }
          } catch (error) {
            if (error.message) {
              logger.error(`Notification handler '${message.method}' failed with message: ${error.message}`);
            } else {
              logger.error(`Notification handler '${message.method}' failed unexpectedly.`);
            }
          }
        } else {
          unhandledNotificationEmitter.fire(message);
        }
      }
      function handleInvalidMessage(message) {
        if (!message) {
          logger.error("Received empty message.");
          return;
        }
        logger.error(`Received message which is neither a response nor a notification message:
${JSON.stringify(message, null, 4)}`);
        const responseMessage = message;
        if (Is2.string(responseMessage.id) || Is2.number(responseMessage.id)) {
          const key = responseMessage.id;
          const responseHandler = responsePromises.get(key);
          if (responseHandler) {
            responseHandler.reject(new Error("The received response has neither a result nor an error property."));
          }
        }
      }
      function stringifyTrace(params) {
        if (params === void 0 || params === null) {
          return void 0;
        }
        switch (trace) {
          case Trace.Verbose:
            return JSON.stringify(params, null, 4);
          case Trace.Compact:
            return JSON.stringify(params);
          default:
            return void 0;
        }
      }
      function traceSendingRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("send-request", message);
        }
      }
      function traceSendingNotification(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Sending notification '${message.method}'.`, data);
        } else {
          logLSPMessage("send-notification", message);
        }
      }
      function traceSendingResponse(message, method, startTime) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
        } else {
          logLSPMessage("send-response", message);
        }
      }
      function traceReceivedRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("receive-request", message);
        }
      }
      function traceReceivedNotification(message) {
        if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Received notification '${message.method}'.`, data);
        } else {
          logLSPMessage("receive-notification", message);
        }
      }
      function traceReceivedResponse(message, responsePromise) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          if (responsePromise) {
            const error = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : "";
            tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error}`, data);
          } else {
            tracer.log(`Received response ${message.id} without active response promise.`, data);
          }
        } else {
          logLSPMessage("receive-response", message);
        }
      }
      function logLSPMessage(type, message) {
        if (!tracer || trace === Trace.Off) {
          return;
        }
        const lspMessage = {
          isLSPMessage: true,
          type,
          message,
          timestamp: Date.now()
        };
        tracer.log(lspMessage);
      }
      function throwIfClosedOrDisposed() {
        if (isClosed()) {
          throw new ConnectionError(ConnectionErrors.Closed, "Connection is closed.");
        }
        if (isDisposed()) {
          throw new ConnectionError(ConnectionErrors.Disposed, "Connection is disposed.");
        }
      }
      function throwIfListening() {
        if (isListening()) {
          throw new ConnectionError(ConnectionErrors.AlreadyListening, "Connection is already listening");
        }
      }
      function throwIfNotListening() {
        if (!isListening()) {
          throw new Error("Call listen() first.");
        }
      }
      function undefinedToNull(param) {
        if (param === void 0) {
          return null;
        } else {
          return param;
        }
      }
      function nullToUndefined(param) {
        if (param === null) {
          return void 0;
        } else {
          return param;
        }
      }
      function isNamedParam(param) {
        return param !== void 0 && param !== null && !Array.isArray(param) && typeof param === "object";
      }
      function computeSingleParam(parameterStructures, param) {
        switch (parameterStructures) {
          case messages_1.ParameterStructures.auto:
            if (isNamedParam(param)) {
              return nullToUndefined(param);
            } else {
              return [undefinedToNull(param)];
            }
          case messages_1.ParameterStructures.byName:
            if (!isNamedParam(param)) {
              throw new Error(`Received parameters by name but param is not an object literal.`);
            }
            return nullToUndefined(param);
          case messages_1.ParameterStructures.byPosition:
            return [undefinedToNull(param)];
          default:
            throw new Error(`Unknown parameter structure ${parameterStructures.toString()}`);
        }
      }
      function computeMessageParams(type, params) {
        let result;
        const numberOfParams = type.numberOfParams;
        switch (numberOfParams) {
          case 0:
            result = void 0;
            break;
          case 1:
            result = computeSingleParam(type.parameterStructures, params[0]);
            break;
          default:
            result = [];
            for (let i = 0; i < params.length && i < numberOfParams; i++) {
              result.push(undefinedToNull(params[i]));
            }
            if (params.length < numberOfParams) {
              for (let i = params.length; i < numberOfParams; i++) {
                result.push(null);
              }
            }
            break;
        }
        return result;
      }
      const connection = {
        sendNotification: (type, ...args) => {
          throwIfClosedOrDisposed();
          let method;
          let messageParams;
          if (Is2.string(type)) {
            method = type;
            const first = args[0];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' notification parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
          }
          const notificationMessage = {
            jsonrpc: version,
            method,
            params: messageParams
          };
          traceSendingNotification(notificationMessage);
          return messageWriter.write(notificationMessage).catch(() => logger.error(`Sending notification failed.`));
        },
        onNotification: (type, handler) => {
          throwIfClosedOrDisposed();
          let method;
          if (Is2.func(type)) {
            starNotificationHandler = type;
          } else if (handler) {
            if (Is2.string(type)) {
              method = type;
              notificationHandlers.set(type, { type: void 0, handler });
            } else {
              method = type.method;
              notificationHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method !== void 0) {
                notificationHandlers.delete(method);
              } else {
                starNotificationHandler = void 0;
              }
            }
          };
        },
        onProgress: (_type, token, handler) => {
          if (progressHandlers.has(token)) {
            throw new Error(`Progress handler for token ${token} already registered`);
          }
          progressHandlers.set(token, handler);
          return {
            dispose: () => {
              progressHandlers.delete(token);
            }
          };
        },
        sendProgress: (_type, token, value) => {
          return connection.sendNotification(ProgressNotification.type, { token, value });
        },
        onUnhandledProgress: unhandledProgressEmitter.event,
        sendRequest: (type, ...args) => {
          throwIfClosedOrDisposed();
          throwIfNotListening();
          let method;
          let messageParams;
          let token = void 0;
          if (Is2.string(type)) {
            method = type;
            const first = args[0];
            const last = args[args.length - 1];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            if (cancellation_1.CancellationToken.is(last)) {
              paramEnd = paramEnd - 1;
              token = last;
            }
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' request parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
            const numberOfParams = type.numberOfParams;
            token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : void 0;
          }
          const id = sequenceNumber++;
          let disposable;
          if (token) {
            disposable = token.onCancellationRequested(() => {
              const p = cancellationStrategy.sender.sendCancellation(connection, id);
              if (p === void 0) {
                logger.log(`Received no promise from cancellation strategy when cancelling id ${id}`);
                return Promise.resolve();
              } else {
                return p.catch(() => {
                  logger.log(`Sending cancellation messages for id ${id} failed`);
                });
              }
            });
          }
          const result = new Promise((resolve, reject) => {
            const requestMessage = {
              jsonrpc: version,
              id,
              method,
              params: messageParams
            };
            const resolveWithCleanup = (r) => {
              resolve(r);
              cancellationStrategy.sender.cleanup(id);
              disposable == null ? void 0 : disposable.dispose();
            };
            const rejectWithCleanup = (r) => {
              reject(r);
              cancellationStrategy.sender.cleanup(id);
              disposable == null ? void 0 : disposable.dispose();
            };
            let responsePromise = { method, timerStart: Date.now(), resolve: resolveWithCleanup, reject: rejectWithCleanup };
            traceSendingRequest(requestMessage);
            try {
              messageWriter.write(requestMessage).catch(() => logger.error(`Sending request failed.`));
            } catch (e) {
              responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, e.message ? e.message : "Unknown reason"));
              responsePromise = null;
            }
            if (responsePromise) {
              responsePromises.set(id, responsePromise);
            }
          });
          return result;
        },
        onRequest: (type, handler) => {
          throwIfClosedOrDisposed();
          let method = null;
          if (StarRequestHandler.is(type)) {
            method = void 0;
            starRequestHandler = type;
          } else if (Is2.string(type)) {
            method = null;
            if (handler !== void 0) {
              method = type;
              requestHandlers.set(type, { handler, type: void 0 });
            }
          } else {
            if (handler !== void 0) {
              method = type.method;
              requestHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method === null) {
                return;
              }
              if (method !== void 0) {
                requestHandlers.delete(method);
              } else {
                starRequestHandler = void 0;
              }
            }
          };
        },
        hasPendingResponse: () => {
          return responsePromises.size > 0;
        },
        trace: async (_value, _tracer, sendNotificationOrTraceOptions) => {
          let _sendNotification = false;
          let _traceFormat = TraceFormat.Text;
          if (sendNotificationOrTraceOptions !== void 0) {
            if (Is2.boolean(sendNotificationOrTraceOptions)) {
              _sendNotification = sendNotificationOrTraceOptions;
            } else {
              _sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
              _traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
            }
          }
          trace = _value;
          traceFormat = _traceFormat;
          if (trace === Trace.Off) {
            tracer = void 0;
          } else {
            tracer = _tracer;
          }
          if (_sendNotification && !isClosed() && !isDisposed()) {
            await connection.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
          }
        },
        onError: errorEmitter.event,
        onClose: closeEmitter.event,
        onUnhandledNotification: unhandledNotificationEmitter.event,
        onDispose: disposeEmitter.event,
        end: () => {
          messageWriter.end();
        },
        dispose: () => {
          if (isDisposed()) {
            return;
          }
          state = ConnectionState.Disposed;
          disposeEmitter.fire(void 0);
          const error = new messages_1.ResponseError(messages_1.ErrorCodes.PendingResponseRejected, "Pending response rejected since connection got disposed");
          for (const promise of responsePromises.values()) {
            promise.reject(error);
          }
          responsePromises = /* @__PURE__ */ new Map();
          requestTokens = /* @__PURE__ */ new Map();
          knownCanceledRequests = /* @__PURE__ */ new Set();
          messageQueue = new linkedMap_1.LinkedMap();
          if (Is2.func(messageWriter.dispose)) {
            messageWriter.dispose();
          }
          if (Is2.func(messageReader.dispose)) {
            messageReader.dispose();
          }
        },
        listen: () => {
          throwIfClosedOrDisposed();
          throwIfListening();
          state = ConnectionState.Listening;
          messageReader.listen(callback);
        },
        inspect: () => {
          (0, ral_1.default)().console.log("inspect");
        }
      };
      connection.onNotification(LogTraceNotification.type, (params) => {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        const verbose = trace === Trace.Verbose || trace === Trace.Compact;
        tracer.log(params.message, verbose ? params.verbose : void 0);
      });
      connection.onNotification(ProgressNotification.type, (params) => {
        const handler = progressHandlers.get(params.token);
        if (handler) {
          handler(params.value);
        } else {
          unhandledProgressEmitter.fire(params);
        }
      });
      return connection;
    }
    exports.createMessageConnection = createMessageConnection;
  }
});
var require_api = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/common/api.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TraceFormat = exports.TraceValues = exports.Trace = exports.ProgressType = exports.ProgressToken = exports.createMessageConnection = exports.NullLogger = exports.ConnectionOptions = exports.ConnectionStrategy = exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = exports.CancellationToken = exports.CancellationTokenSource = exports.Emitter = exports.Event = exports.Disposable = exports.LRUCache = exports.Touch = exports.LinkedMap = exports.ParameterStructures = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.ErrorCodes = exports.ResponseError = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType0 = exports.RequestType = exports.Message = exports.RAL = void 0;
    exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports, "Message", { enumerable: true, get: function() {
      return messages_1.Message;
    } });
    Object.defineProperty(exports, "RequestType", { enumerable: true, get: function() {
      return messages_1.RequestType;
    } });
    Object.defineProperty(exports, "RequestType0", { enumerable: true, get: function() {
      return messages_1.RequestType0;
    } });
    Object.defineProperty(exports, "RequestType1", { enumerable: true, get: function() {
      return messages_1.RequestType1;
    } });
    Object.defineProperty(exports, "RequestType2", { enumerable: true, get: function() {
      return messages_1.RequestType2;
    } });
    Object.defineProperty(exports, "RequestType3", { enumerable: true, get: function() {
      return messages_1.RequestType3;
    } });
    Object.defineProperty(exports, "RequestType4", { enumerable: true, get: function() {
      return messages_1.RequestType4;
    } });
    Object.defineProperty(exports, "RequestType5", { enumerable: true, get: function() {
      return messages_1.RequestType5;
    } });
    Object.defineProperty(exports, "RequestType6", { enumerable: true, get: function() {
      return messages_1.RequestType6;
    } });
    Object.defineProperty(exports, "RequestType7", { enumerable: true, get: function() {
      return messages_1.RequestType7;
    } });
    Object.defineProperty(exports, "RequestType8", { enumerable: true, get: function() {
      return messages_1.RequestType8;
    } });
    Object.defineProperty(exports, "RequestType9", { enumerable: true, get: function() {
      return messages_1.RequestType9;
    } });
    Object.defineProperty(exports, "ResponseError", { enumerable: true, get: function() {
      return messages_1.ResponseError;
    } });
    Object.defineProperty(exports, "ErrorCodes", { enumerable: true, get: function() {
      return messages_1.ErrorCodes;
    } });
    Object.defineProperty(exports, "NotificationType", { enumerable: true, get: function() {
      return messages_1.NotificationType;
    } });
    Object.defineProperty(exports, "NotificationType0", { enumerable: true, get: function() {
      return messages_1.NotificationType0;
    } });
    Object.defineProperty(exports, "NotificationType1", { enumerable: true, get: function() {
      return messages_1.NotificationType1;
    } });
    Object.defineProperty(exports, "NotificationType2", { enumerable: true, get: function() {
      return messages_1.NotificationType2;
    } });
    Object.defineProperty(exports, "NotificationType3", { enumerable: true, get: function() {
      return messages_1.NotificationType3;
    } });
    Object.defineProperty(exports, "NotificationType4", { enumerable: true, get: function() {
      return messages_1.NotificationType4;
    } });
    Object.defineProperty(exports, "NotificationType5", { enumerable: true, get: function() {
      return messages_1.NotificationType5;
    } });
    Object.defineProperty(exports, "NotificationType6", { enumerable: true, get: function() {
      return messages_1.NotificationType6;
    } });
    Object.defineProperty(exports, "NotificationType7", { enumerable: true, get: function() {
      return messages_1.NotificationType7;
    } });
    Object.defineProperty(exports, "NotificationType8", { enumerable: true, get: function() {
      return messages_1.NotificationType8;
    } });
    Object.defineProperty(exports, "NotificationType9", { enumerable: true, get: function() {
      return messages_1.NotificationType9;
    } });
    Object.defineProperty(exports, "ParameterStructures", { enumerable: true, get: function() {
      return messages_1.ParameterStructures;
    } });
    var linkedMap_1 = require_linkedMap();
    Object.defineProperty(exports, "LinkedMap", { enumerable: true, get: function() {
      return linkedMap_1.LinkedMap;
    } });
    Object.defineProperty(exports, "LRUCache", { enumerable: true, get: function() {
      return linkedMap_1.LRUCache;
    } });
    Object.defineProperty(exports, "Touch", { enumerable: true, get: function() {
      return linkedMap_1.Touch;
    } });
    var disposable_1 = require_disposable();
    Object.defineProperty(exports, "Disposable", { enumerable: true, get: function() {
      return disposable_1.Disposable;
    } });
    var events_1 = require_events();
    Object.defineProperty(exports, "Event", { enumerable: true, get: function() {
      return events_1.Event;
    } });
    Object.defineProperty(exports, "Emitter", { enumerable: true, get: function() {
      return events_1.Emitter;
    } });
    var cancellation_1 = require_cancellation();
    Object.defineProperty(exports, "CancellationTokenSource", { enumerable: true, get: function() {
      return cancellation_1.CancellationTokenSource;
    } });
    Object.defineProperty(exports, "CancellationToken", { enumerable: true, get: function() {
      return cancellation_1.CancellationToken;
    } });
    var messageReader_1 = require_messageReader();
    Object.defineProperty(exports, "MessageReader", { enumerable: true, get: function() {
      return messageReader_1.MessageReader;
    } });
    Object.defineProperty(exports, "AbstractMessageReader", { enumerable: true, get: function() {
      return messageReader_1.AbstractMessageReader;
    } });
    Object.defineProperty(exports, "ReadableStreamMessageReader", { enumerable: true, get: function() {
      return messageReader_1.ReadableStreamMessageReader;
    } });
    var messageWriter_1 = require_messageWriter();
    Object.defineProperty(exports, "MessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.MessageWriter;
    } });
    Object.defineProperty(exports, "AbstractMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.AbstractMessageWriter;
    } });
    Object.defineProperty(exports, "WriteableStreamMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.WriteableStreamMessageWriter;
    } });
    var connection_1 = require_connection();
    Object.defineProperty(exports, "ConnectionStrategy", { enumerable: true, get: function() {
      return connection_1.ConnectionStrategy;
    } });
    Object.defineProperty(exports, "ConnectionOptions", { enumerable: true, get: function() {
      return connection_1.ConnectionOptions;
    } });
    Object.defineProperty(exports, "NullLogger", { enumerable: true, get: function() {
      return connection_1.NullLogger;
    } });
    Object.defineProperty(exports, "createMessageConnection", { enumerable: true, get: function() {
      return connection_1.createMessageConnection;
    } });
    Object.defineProperty(exports, "ProgressToken", { enumerable: true, get: function() {
      return connection_1.ProgressToken;
    } });
    Object.defineProperty(exports, "ProgressType", { enumerable: true, get: function() {
      return connection_1.ProgressType;
    } });
    Object.defineProperty(exports, "Trace", { enumerable: true, get: function() {
      return connection_1.Trace;
    } });
    Object.defineProperty(exports, "TraceValues", { enumerable: true, get: function() {
      return connection_1.TraceValues;
    } });
    Object.defineProperty(exports, "TraceFormat", { enumerable: true, get: function() {
      return connection_1.TraceFormat;
    } });
    Object.defineProperty(exports, "SetTraceNotification", { enumerable: true, get: function() {
      return connection_1.SetTraceNotification;
    } });
    Object.defineProperty(exports, "LogTraceNotification", { enumerable: true, get: function() {
      return connection_1.LogTraceNotification;
    } });
    Object.defineProperty(exports, "ConnectionErrors", { enumerable: true, get: function() {
      return connection_1.ConnectionErrors;
    } });
    Object.defineProperty(exports, "ConnectionError", { enumerable: true, get: function() {
      return connection_1.ConnectionError;
    } });
    Object.defineProperty(exports, "CancellationReceiverStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationReceiverStrategy;
    } });
    Object.defineProperty(exports, "CancellationSenderStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationSenderStrategy;
    } });
    Object.defineProperty(exports, "CancellationStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationStrategy;
    } });
    var ral_1 = require_ral();
    exports.RAL = ral_1.default;
  }
});
var require_main = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/lib/browser/main.js"(exports) {
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMessageConnection = exports.BrowserMessageWriter = exports.BrowserMessageReader = void 0;
    var ril_1 = require_ril();
    ril_1.default.install();
    var api_1 = require_api();
    __exportStar(require_api(), exports);
    var BrowserMessageReader = class extends api_1.AbstractMessageReader {
      constructor(context) {
        super();
        this._onData = new api_1.Emitter();
        this._messageListener = (event) => {
          this._onData.fire(event.data);
        };
        context.addEventListener("error", (event) => this.fireError(event));
        context.onmessage = this._messageListener;
      }
      listen(callback) {
        return this._onData.event(callback);
      }
    };
    exports.BrowserMessageReader = BrowserMessageReader;
    var BrowserMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(context) {
        super();
        this.context = context;
        this.errorCount = 0;
        context.addEventListener("error", (event) => this.fireError(event));
      }
      write(msg) {
        try {
          this.context.postMessage(msg);
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports.BrowserMessageWriter = BrowserMessageWriter;
    function createMessageConnection(reader, writer, logger, options) {
      if (logger === void 0) {
        logger = api_1.NullLogger;
      }
      if (api_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
      }
      return (0, api_1.createMessageConnection)(reader, writer, logger, options);
    }
    exports.createMessageConnection = createMessageConnection;
  }
});
var require_browser = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.0.2/node_modules/vscode-jsonrpc/browser.js"(exports, module) {
    module.exports = require_main();
  }
});
var main_exports = {};
__export(main_exports, {
  AnnotatedTextEdit: () => AnnotatedTextEdit,
  ChangeAnnotation: () => ChangeAnnotation,
  ChangeAnnotationIdentifier: () => ChangeAnnotationIdentifier,
  CodeAction: () => CodeAction,
  CodeActionContext: () => CodeActionContext,
  CodeActionKind: () => CodeActionKind,
  CodeActionTriggerKind: () => CodeActionTriggerKind,
  CodeDescription: () => CodeDescription,
  CodeLens: () => CodeLens,
  Color: () => Color,
  ColorInformation: () => ColorInformation,
  ColorPresentation: () => ColorPresentation,
  Command: () => Command,
  CompletionItem: () => CompletionItem,
  CompletionItemKind: () => CompletionItemKind,
  CompletionItemLabelDetails: () => CompletionItemLabelDetails,
  CompletionItemTag: () => CompletionItemTag,
  CompletionList: () => CompletionList,
  CreateFile: () => CreateFile,
  DeleteFile: () => DeleteFile,
  Diagnostic: () => Diagnostic,
  DiagnosticRelatedInformation: () => DiagnosticRelatedInformation,
  DiagnosticSeverity: () => DiagnosticSeverity,
  DiagnosticTag: () => DiagnosticTag,
  DocumentHighlight: () => DocumentHighlight,
  DocumentHighlightKind: () => DocumentHighlightKind,
  DocumentLink: () => DocumentLink,
  DocumentSymbol: () => DocumentSymbol,
  DocumentUri: () => DocumentUri,
  EOL: () => EOL,
  FoldingRange: () => FoldingRange,
  FoldingRangeKind: () => FoldingRangeKind,
  FormattingOptions: () => FormattingOptions,
  Hover: () => Hover,
  InlayHint: () => InlayHint,
  InlayHintKind: () => InlayHintKind,
  InlayHintLabelPart: () => InlayHintLabelPart,
  InlineValueContext: () => InlineValueContext,
  InlineValueEvaluatableExpression: () => InlineValueEvaluatableExpression,
  InlineValueText: () => InlineValueText,
  InlineValueVariableLookup: () => InlineValueVariableLookup,
  InsertReplaceEdit: () => InsertReplaceEdit,
  InsertTextFormat: () => InsertTextFormat,
  InsertTextMode: () => InsertTextMode,
  Location: () => Location,
  LocationLink: () => LocationLink,
  MarkedString: () => MarkedString,
  MarkupContent: () => MarkupContent,
  MarkupKind: () => MarkupKind,
  OptionalVersionedTextDocumentIdentifier: () => OptionalVersionedTextDocumentIdentifier,
  ParameterInformation: () => ParameterInformation,
  Position: () => Position,
  Range: () => Range,
  RenameFile: () => RenameFile,
  SelectionRange: () => SelectionRange,
  SemanticTokenModifiers: () => SemanticTokenModifiers,
  SemanticTokenTypes: () => SemanticTokenTypes,
  SemanticTokens: () => SemanticTokens,
  SignatureInformation: () => SignatureInformation,
  SymbolInformation: () => SymbolInformation,
  SymbolKind: () => SymbolKind,
  SymbolTag: () => SymbolTag,
  TextDocument: () => TextDocument,
  TextDocumentEdit: () => TextDocumentEdit,
  TextDocumentIdentifier: () => TextDocumentIdentifier,
  TextDocumentItem: () => TextDocumentItem,
  TextEdit: () => TextEdit,
  URI: () => URI,
  VersionedTextDocumentIdentifier: () => VersionedTextDocumentIdentifier,
  WorkspaceChange: () => WorkspaceChange,
  WorkspaceEdit: () => WorkspaceEdit,
  WorkspaceFolder: () => WorkspaceFolder,
  WorkspaceSymbol: () => WorkspaceSymbol,
  integer: () => integer,
  uinteger: () => uinteger
});
var DocumentUri, URI, integer, uinteger, Position, Range, Location, LocationLink, Color, ColorInformation, ColorPresentation, FoldingRangeKind, FoldingRange, DiagnosticRelatedInformation, DiagnosticSeverity, DiagnosticTag, CodeDescription, Diagnostic, Command, TextEdit, ChangeAnnotation, ChangeAnnotationIdentifier, AnnotatedTextEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile, WorkspaceEdit, TextEditChangeImpl, ChangeAnnotations, WorkspaceChange, TextDocumentIdentifier, VersionedTextDocumentIdentifier, OptionalVersionedTextDocumentIdentifier, TextDocumentItem, MarkupKind, MarkupContent, CompletionItemKind, InsertTextFormat, CompletionItemTag, InsertReplaceEdit, InsertTextMode, CompletionItemLabelDetails, CompletionItem, CompletionList, MarkedString, Hover, ParameterInformation, SignatureInformation, DocumentHighlightKind, DocumentHighlight, SymbolKind, SymbolTag, SymbolInformation, WorkspaceSymbol, DocumentSymbol, CodeActionKind, CodeActionTriggerKind, CodeActionContext, CodeAction, CodeLens, FormattingOptions, DocumentLink, SelectionRange, SemanticTokenTypes, SemanticTokenModifiers, SemanticTokens, InlineValueText, InlineValueVariableLookup, InlineValueEvaluatableExpression, InlineValueContext, InlayHintKind, InlayHintLabelPart, InlayHint, WorkspaceFolder, EOL, TextDocument, FullTextDocument, Is;
var init_main = __esm({
  "node_modules/.pnpm/vscode-languageserver-types@3.17.2/node_modules/vscode-languageserver-types/lib/esm/main.js"() {
    (function(DocumentUri2) {
      function is(value) {
        return typeof value === "string";
      }
      DocumentUri2.is = is;
    })(DocumentUri || (DocumentUri = {}));
    (function(URI2) {
      function is(value) {
        return typeof value === "string";
      }
      URI2.is = is;
    })(URI || (URI = {}));
    (function(integer2) {
      integer2.MIN_VALUE = -2147483648;
      integer2.MAX_VALUE = 2147483647;
      function is(value) {
        return typeof value === "number" && integer2.MIN_VALUE <= value && value <= integer2.MAX_VALUE;
      }
      integer2.is = is;
    })(integer || (integer = {}));
    (function(uinteger2) {
      uinteger2.MIN_VALUE = 0;
      uinteger2.MAX_VALUE = 2147483647;
      function is(value) {
        return typeof value === "number" && uinteger2.MIN_VALUE <= value && value <= uinteger2.MAX_VALUE;
      }
      uinteger2.is = is;
    })(uinteger || (uinteger = {}));
    (function(Position2) {
      function create(line, character) {
        if (line === Number.MAX_VALUE) {
          line = uinteger.MAX_VALUE;
        }
        if (character === Number.MAX_VALUE) {
          character = uinteger.MAX_VALUE;
        }
        return { line, character };
      }
      Position2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.uinteger(candidate.line) && Is.uinteger(candidate.character);
      }
      Position2.is = is;
    })(Position || (Position = {}));
    (function(Range2) {
      function create(one, two, three, four) {
        if (Is.uinteger(one) && Is.uinteger(two) && Is.uinteger(three) && Is.uinteger(four)) {
          return { start: Position.create(one, two), end: Position.create(three, four) };
        } else if (Position.is(one) && Position.is(two)) {
          return { start: one, end: two };
        } else {
          throw new Error("Range#create called with invalid arguments[".concat(one, ", ").concat(two, ", ").concat(three, ", ").concat(four, "]"));
        }
      }
      Range2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
      }
      Range2.is = is;
    })(Range || (Range = {}));
    (function(Location2) {
      function create(uri, range) {
        return { uri, range };
      }
      Location2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
      }
      Location2.is = is;
    })(Location || (Location = {}));
    (function(LocationLink2) {
      function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
        return { targetUri, targetRange, targetSelectionRange, originSelectionRange };
      }
      LocationLink2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.targetRange) && Is.string(candidate.targetUri) && Range.is(candidate.targetSelectionRange) && (Range.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
      }
      LocationLink2.is = is;
    })(LocationLink || (LocationLink = {}));
    (function(Color2) {
      function create(red, green, blue, alpha) {
        return {
          red,
          green,
          blue,
          alpha
        };
      }
      Color2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.numberRange(candidate.red, 0, 1) && Is.numberRange(candidate.green, 0, 1) && Is.numberRange(candidate.blue, 0, 1) && Is.numberRange(candidate.alpha, 0, 1);
      }
      Color2.is = is;
    })(Color || (Color = {}));
    (function(ColorInformation2) {
      function create(range, color) {
        return {
          range,
          color
        };
      }
      ColorInformation2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.range) && Color.is(candidate.color);
      }
      ColorInformation2.is = is;
    })(ColorInformation || (ColorInformation = {}));
    (function(ColorPresentation2) {
      function create(label, textEdit, additionalTextEdits) {
        return {
          label,
          textEdit,
          additionalTextEdits
        };
      }
      ColorPresentation2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate)) && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
      }
      ColorPresentation2.is = is;
    })(ColorPresentation || (ColorPresentation = {}));
    (function(FoldingRangeKind2) {
      FoldingRangeKind2.Comment = "comment";
      FoldingRangeKind2.Imports = "imports";
      FoldingRangeKind2.Region = "region";
    })(FoldingRangeKind || (FoldingRangeKind = {}));
    (function(FoldingRange2) {
      function create(startLine, endLine, startCharacter, endCharacter, kind, collapsedText) {
        var result = {
          startLine,
          endLine
        };
        if (Is.defined(startCharacter)) {
          result.startCharacter = startCharacter;
        }
        if (Is.defined(endCharacter)) {
          result.endCharacter = endCharacter;
        }
        if (Is.defined(kind)) {
          result.kind = kind;
        }
        if (Is.defined(collapsedText)) {
          result.collapsedText = collapsedText;
        }
        return result;
      }
      FoldingRange2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.uinteger(candidate.startLine) && Is.uinteger(candidate.startLine) && (Is.undefined(candidate.startCharacter) || Is.uinteger(candidate.startCharacter)) && (Is.undefined(candidate.endCharacter) || Is.uinteger(candidate.endCharacter)) && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
      }
      FoldingRange2.is = is;
    })(FoldingRange || (FoldingRange = {}));
    (function(DiagnosticRelatedInformation2) {
      function create(location, message) {
        return {
          location,
          message
        };
      }
      DiagnosticRelatedInformation2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Location.is(candidate.location) && Is.string(candidate.message);
      }
      DiagnosticRelatedInformation2.is = is;
    })(DiagnosticRelatedInformation || (DiagnosticRelatedInformation = {}));
    (function(DiagnosticSeverity2) {
      DiagnosticSeverity2.Error = 1;
      DiagnosticSeverity2.Warning = 2;
      DiagnosticSeverity2.Information = 3;
      DiagnosticSeverity2.Hint = 4;
    })(DiagnosticSeverity || (DiagnosticSeverity = {}));
    (function(DiagnosticTag2) {
      DiagnosticTag2.Unnecessary = 1;
      DiagnosticTag2.Deprecated = 2;
    })(DiagnosticTag || (DiagnosticTag = {}));
    (function(CodeDescription2) {
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.href);
      }
      CodeDescription2.is = is;
    })(CodeDescription || (CodeDescription = {}));
    (function(Diagnostic2) {
      function create(range, message, severity, code, source, relatedInformation) {
        var result = { range, message };
        if (Is.defined(severity)) {
          result.severity = severity;
        }
        if (Is.defined(code)) {
          result.code = code;
        }
        if (Is.defined(source)) {
          result.source = source;
        }
        if (Is.defined(relatedInformation)) {
          result.relatedInformation = relatedInformation;
        }
        return result;
      }
      Diagnostic2.create = create;
      function is(value) {
        var _a;
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && Is.string(candidate.message) && (Is.number(candidate.severity) || Is.undefined(candidate.severity)) && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code)) && (Is.undefined(candidate.codeDescription) || Is.string((_a = candidate.codeDescription) === null || _a === void 0 ? void 0 : _a.href)) && (Is.string(candidate.source) || Is.undefined(candidate.source)) && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
      }
      Diagnostic2.is = is;
    })(Diagnostic || (Diagnostic = {}));
    (function(Command2) {
      function create(title, command) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          args[_i - 2] = arguments[_i];
        }
        var result = { title, command };
        if (Is.defined(args) && args.length > 0) {
          result.arguments = args;
        }
        return result;
      }
      Command2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
      }
      Command2.is = is;
    })(Command || (Command = {}));
    (function(TextEdit2) {
      function replace(range, newText) {
        return { range, newText };
      }
      TextEdit2.replace = replace;
      function insert(position, newText) {
        return { range: { start: position, end: position }, newText };
      }
      TextEdit2.insert = insert;
      function del(range) {
        return { range, newText: "" };
      }
      TextEdit2.del = del;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.newText) && Range.is(candidate.range);
      }
      TextEdit2.is = is;
    })(TextEdit || (TextEdit = {}));
    (function(ChangeAnnotation2) {
      function create(label, needsConfirmation, description) {
        var result = { label };
        if (needsConfirmation !== void 0) {
          result.needsConfirmation = needsConfirmation;
        }
        if (description !== void 0) {
          result.description = description;
        }
        return result;
      }
      ChangeAnnotation2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.boolean(candidate.needsConfirmation) || candidate.needsConfirmation === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
      }
      ChangeAnnotation2.is = is;
    })(ChangeAnnotation || (ChangeAnnotation = {}));
    (function(ChangeAnnotationIdentifier2) {
      function is(value) {
        var candidate = value;
        return Is.string(candidate);
      }
      ChangeAnnotationIdentifier2.is = is;
    })(ChangeAnnotationIdentifier || (ChangeAnnotationIdentifier = {}));
    (function(AnnotatedTextEdit2) {
      function replace(range, newText, annotation) {
        return { range, newText, annotationId: annotation };
      }
      AnnotatedTextEdit2.replace = replace;
      function insert(position, newText, annotation) {
        return { range: { start: position, end: position }, newText, annotationId: annotation };
      }
      AnnotatedTextEdit2.insert = insert;
      function del(range, annotation) {
        return { range, newText: "", annotationId: annotation };
      }
      AnnotatedTextEdit2.del = del;
      function is(value) {
        var candidate = value;
        return TextEdit.is(candidate) && (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      AnnotatedTextEdit2.is = is;
    })(AnnotatedTextEdit || (AnnotatedTextEdit = {}));
    (function(TextDocumentEdit2) {
      function create(textDocument, edits) {
        return { textDocument, edits };
      }
      TextDocumentEdit2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument) && Array.isArray(candidate.edits);
      }
      TextDocumentEdit2.is = is;
    })(TextDocumentEdit || (TextDocumentEdit = {}));
    (function(CreateFile2) {
      function create(uri, options, annotation) {
        var result = {
          kind: "create",
          uri
        };
        if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
          result.options = options;
        }
        if (annotation !== void 0) {
          result.annotationId = annotation;
        }
        return result;
      }
      CreateFile2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && candidate.kind === "create" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      CreateFile2.is = is;
    })(CreateFile || (CreateFile = {}));
    (function(RenameFile2) {
      function create(oldUri, newUri, options, annotation) {
        var result = {
          kind: "rename",
          oldUri,
          newUri
        };
        if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
          result.options = options;
        }
        if (annotation !== void 0) {
          result.annotationId = annotation;
        }
        return result;
      }
      RenameFile2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && candidate.kind === "rename" && Is.string(candidate.oldUri) && Is.string(candidate.newUri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      RenameFile2.is = is;
    })(RenameFile || (RenameFile = {}));
    (function(DeleteFile2) {
      function create(uri, options, annotation) {
        var result = {
          kind: "delete",
          uri
        };
        if (options !== void 0 && (options.recursive !== void 0 || options.ignoreIfNotExists !== void 0)) {
          result.options = options;
        }
        if (annotation !== void 0) {
          result.annotationId = annotation;
        }
        return result;
      }
      DeleteFile2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && candidate.kind === "delete" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.recursive === void 0 || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === void 0 || Is.boolean(candidate.options.ignoreIfNotExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      DeleteFile2.is = is;
    })(DeleteFile || (DeleteFile = {}));
    (function(WorkspaceEdit2) {
      function is(value) {
        var candidate = value;
        return candidate && (candidate.changes !== void 0 || candidate.documentChanges !== void 0) && (candidate.documentChanges === void 0 || candidate.documentChanges.every(function(change) {
          if (Is.string(change.kind)) {
            return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
          } else {
            return TextDocumentEdit.is(change);
          }
        }));
      }
      WorkspaceEdit2.is = is;
    })(WorkspaceEdit || (WorkspaceEdit = {}));
    TextEditChangeImpl = function() {
      function TextEditChangeImpl2(edits, changeAnnotations) {
        this.edits = edits;
        this.changeAnnotations = changeAnnotations;
      }
      TextEditChangeImpl2.prototype.insert = function(position, newText, annotation) {
        var edit;
        var id;
        if (annotation === void 0) {
          edit = TextEdit.insert(position, newText);
        } else if (ChangeAnnotationIdentifier.is(annotation)) {
          id = annotation;
          edit = AnnotatedTextEdit.insert(position, newText, annotation);
        } else {
          this.assertChangeAnnotations(this.changeAnnotations);
          id = this.changeAnnotations.manage(annotation);
          edit = AnnotatedTextEdit.insert(position, newText, id);
        }
        this.edits.push(edit);
        if (id !== void 0) {
          return id;
        }
      };
      TextEditChangeImpl2.prototype.replace = function(range, newText, annotation) {
        var edit;
        var id;
        if (annotation === void 0) {
          edit = TextEdit.replace(range, newText);
        } else if (ChangeAnnotationIdentifier.is(annotation)) {
          id = annotation;
          edit = AnnotatedTextEdit.replace(range, newText, annotation);
        } else {
          this.assertChangeAnnotations(this.changeAnnotations);
          id = this.changeAnnotations.manage(annotation);
          edit = AnnotatedTextEdit.replace(range, newText, id);
        }
        this.edits.push(edit);
        if (id !== void 0) {
          return id;
        }
      };
      TextEditChangeImpl2.prototype.delete = function(range, annotation) {
        var edit;
        var id;
        if (annotation === void 0) {
          edit = TextEdit.del(range);
        } else if (ChangeAnnotationIdentifier.is(annotation)) {
          id = annotation;
          edit = AnnotatedTextEdit.del(range, annotation);
        } else {
          this.assertChangeAnnotations(this.changeAnnotations);
          id = this.changeAnnotations.manage(annotation);
          edit = AnnotatedTextEdit.del(range, id);
        }
        this.edits.push(edit);
        if (id !== void 0) {
          return id;
        }
      };
      TextEditChangeImpl2.prototype.add = function(edit) {
        this.edits.push(edit);
      };
      TextEditChangeImpl2.prototype.all = function() {
        return this.edits;
      };
      TextEditChangeImpl2.prototype.clear = function() {
        this.edits.splice(0, this.edits.length);
      };
      TextEditChangeImpl2.prototype.assertChangeAnnotations = function(value) {
        if (value === void 0) {
          throw new Error("Text edit change is not configured to manage change annotations.");
        }
      };
      return TextEditChangeImpl2;
    }();
    ChangeAnnotations = function() {
      function ChangeAnnotations2(annotations) {
        this._annotations = annotations === void 0 ? /* @__PURE__ */ Object.create(null) : annotations;
        this._counter = 0;
        this._size = 0;
      }
      ChangeAnnotations2.prototype.all = function() {
        return this._annotations;
      };
      Object.defineProperty(ChangeAnnotations2.prototype, "size", {
        get: function() {
          return this._size;
        },
        enumerable: false,
        configurable: true
      });
      ChangeAnnotations2.prototype.manage = function(idOrAnnotation, annotation) {
        var id;
        if (ChangeAnnotationIdentifier.is(idOrAnnotation)) {
          id = idOrAnnotation;
        } else {
          id = this.nextId();
          annotation = idOrAnnotation;
        }
        if (this._annotations[id] !== void 0) {
          throw new Error("Id ".concat(id, " is already in use."));
        }
        if (annotation === void 0) {
          throw new Error("No annotation provided for id ".concat(id));
        }
        this._annotations[id] = annotation;
        this._size++;
        return id;
      };
      ChangeAnnotations2.prototype.nextId = function() {
        this._counter++;
        return this._counter.toString();
      };
      return ChangeAnnotations2;
    }();
    WorkspaceChange = function() {
      function WorkspaceChange2(workspaceEdit) {
        var _this = this;
        this._textEditChanges = /* @__PURE__ */ Object.create(null);
        if (workspaceEdit !== void 0) {
          this._workspaceEdit = workspaceEdit;
          if (workspaceEdit.documentChanges) {
            this._changeAnnotations = new ChangeAnnotations(workspaceEdit.changeAnnotations);
            workspaceEdit.changeAnnotations = this._changeAnnotations.all();
            workspaceEdit.documentChanges.forEach(function(change) {
              if (TextDocumentEdit.is(change)) {
                var textEditChange = new TextEditChangeImpl(change.edits, _this._changeAnnotations);
                _this._textEditChanges[change.textDocument.uri] = textEditChange;
              }
            });
          } else if (workspaceEdit.changes) {
            Object.keys(workspaceEdit.changes).forEach(function(key) {
              var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
              _this._textEditChanges[key] = textEditChange;
            });
          }
        } else {
          this._workspaceEdit = {};
        }
      }
      Object.defineProperty(WorkspaceChange2.prototype, "edit", {
        get: function() {
          this.initDocumentChanges();
          if (this._changeAnnotations !== void 0) {
            if (this._changeAnnotations.size === 0) {
              this._workspaceEdit.changeAnnotations = void 0;
            } else {
              this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
            }
          }
          return this._workspaceEdit;
        },
        enumerable: false,
        configurable: true
      });
      WorkspaceChange2.prototype.getTextEditChange = function(key) {
        if (OptionalVersionedTextDocumentIdentifier.is(key)) {
          this.initDocumentChanges();
          if (this._workspaceEdit.documentChanges === void 0) {
            throw new Error("Workspace edit is not configured for document changes.");
          }
          var textDocument = { uri: key.uri, version: key.version };
          var result = this._textEditChanges[textDocument.uri];
          if (!result) {
            var edits = [];
            var textDocumentEdit = {
              textDocument,
              edits
            };
            this._workspaceEdit.documentChanges.push(textDocumentEdit);
            result = new TextEditChangeImpl(edits, this._changeAnnotations);
            this._textEditChanges[textDocument.uri] = result;
          }
          return result;
        } else {
          this.initChanges();
          if (this._workspaceEdit.changes === void 0) {
            throw new Error("Workspace edit is not configured for normal text edit changes.");
          }
          var result = this._textEditChanges[key];
          if (!result) {
            var edits = [];
            this._workspaceEdit.changes[key] = edits;
            result = new TextEditChangeImpl(edits);
            this._textEditChanges[key] = result;
          }
          return result;
        }
      };
      WorkspaceChange2.prototype.initDocumentChanges = function() {
        if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
          this._changeAnnotations = new ChangeAnnotations();
          this._workspaceEdit.documentChanges = [];
          this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
        }
      };
      WorkspaceChange2.prototype.initChanges = function() {
        if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
          this._workspaceEdit.changes = /* @__PURE__ */ Object.create(null);
        }
      };
      WorkspaceChange2.prototype.createFile = function(uri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === void 0) {
          throw new Error("Workspace edit is not configured for document changes.");
        }
        var annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
          annotation = optionsOrAnnotation;
        } else {
          options = optionsOrAnnotation;
        }
        var operation;
        var id;
        if (annotation === void 0) {
          operation = CreateFile.create(uri, options);
        } else {
          id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
          operation = CreateFile.create(uri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== void 0) {
          return id;
        }
      };
      WorkspaceChange2.prototype.renameFile = function(oldUri, newUri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === void 0) {
          throw new Error("Workspace edit is not configured for document changes.");
        }
        var annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
          annotation = optionsOrAnnotation;
        } else {
          options = optionsOrAnnotation;
        }
        var operation;
        var id;
        if (annotation === void 0) {
          operation = RenameFile.create(oldUri, newUri, options);
        } else {
          id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
          operation = RenameFile.create(oldUri, newUri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== void 0) {
          return id;
        }
      };
      WorkspaceChange2.prototype.deleteFile = function(uri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === void 0) {
          throw new Error("Workspace edit is not configured for document changes.");
        }
        var annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
          annotation = optionsOrAnnotation;
        } else {
          options = optionsOrAnnotation;
        }
        var operation;
        var id;
        if (annotation === void 0) {
          operation = DeleteFile.create(uri, options);
        } else {
          id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
          operation = DeleteFile.create(uri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== void 0) {
          return id;
        }
      };
      return WorkspaceChange2;
    }();
    (function(TextDocumentIdentifier2) {
      function create(uri) {
        return { uri };
      }
      TextDocumentIdentifier2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri);
      }
      TextDocumentIdentifier2.is = is;
    })(TextDocumentIdentifier || (TextDocumentIdentifier = {}));
    (function(VersionedTextDocumentIdentifier2) {
      function create(uri, version) {
        return { uri, version };
      }
      VersionedTextDocumentIdentifier2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && Is.integer(candidate.version);
      }
      VersionedTextDocumentIdentifier2.is = is;
    })(VersionedTextDocumentIdentifier || (VersionedTextDocumentIdentifier = {}));
    (function(OptionalVersionedTextDocumentIdentifier2) {
      function create(uri, version) {
        return { uri, version };
      }
      OptionalVersionedTextDocumentIdentifier2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.integer(candidate.version));
      }
      OptionalVersionedTextDocumentIdentifier2.is = is;
    })(OptionalVersionedTextDocumentIdentifier || (OptionalVersionedTextDocumentIdentifier = {}));
    (function(TextDocumentItem2) {
      function create(uri, languageId, version, text) {
        return { uri, languageId, version, text };
      }
      TextDocumentItem2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.integer(candidate.version) && Is.string(candidate.text);
      }
      TextDocumentItem2.is = is;
    })(TextDocumentItem || (TextDocumentItem = {}));
    (function(MarkupKind2) {
      MarkupKind2.PlainText = "plaintext";
      MarkupKind2.Markdown = "markdown";
      function is(value) {
        var candidate = value;
        return candidate === MarkupKind2.PlainText || candidate === MarkupKind2.Markdown;
      }
      MarkupKind2.is = is;
    })(MarkupKind || (MarkupKind = {}));
    (function(MarkupContent2) {
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(value) && MarkupKind.is(candidate.kind) && Is.string(candidate.value);
      }
      MarkupContent2.is = is;
    })(MarkupContent || (MarkupContent = {}));
    (function(CompletionItemKind2) {
      CompletionItemKind2.Text = 1;
      CompletionItemKind2.Method = 2;
      CompletionItemKind2.Function = 3;
      CompletionItemKind2.Constructor = 4;
      CompletionItemKind2.Field = 5;
      CompletionItemKind2.Variable = 6;
      CompletionItemKind2.Class = 7;
      CompletionItemKind2.Interface = 8;
      CompletionItemKind2.Module = 9;
      CompletionItemKind2.Property = 10;
      CompletionItemKind2.Unit = 11;
      CompletionItemKind2.Value = 12;
      CompletionItemKind2.Enum = 13;
      CompletionItemKind2.Keyword = 14;
      CompletionItemKind2.Snippet = 15;
      CompletionItemKind2.Color = 16;
      CompletionItemKind2.File = 17;
      CompletionItemKind2.Reference = 18;
      CompletionItemKind2.Folder = 19;
      CompletionItemKind2.EnumMember = 20;
      CompletionItemKind2.Constant = 21;
      CompletionItemKind2.Struct = 22;
      CompletionItemKind2.Event = 23;
      CompletionItemKind2.Operator = 24;
      CompletionItemKind2.TypeParameter = 25;
    })(CompletionItemKind || (CompletionItemKind = {}));
    (function(InsertTextFormat2) {
      InsertTextFormat2.PlainText = 1;
      InsertTextFormat2.Snippet = 2;
    })(InsertTextFormat || (InsertTextFormat = {}));
    (function(CompletionItemTag2) {
      CompletionItemTag2.Deprecated = 1;
    })(CompletionItemTag || (CompletionItemTag = {}));
    (function(InsertReplaceEdit2) {
      function create(newText, insert, replace) {
        return { newText, insert, replace };
      }
      InsertReplaceEdit2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && Is.string(candidate.newText) && Range.is(candidate.insert) && Range.is(candidate.replace);
      }
      InsertReplaceEdit2.is = is;
    })(InsertReplaceEdit || (InsertReplaceEdit = {}));
    (function(InsertTextMode2) {
      InsertTextMode2.asIs = 1;
      InsertTextMode2.adjustIndentation = 2;
    })(InsertTextMode || (InsertTextMode = {}));
    (function(CompletionItemLabelDetails2) {
      function is(value) {
        var candidate = value;
        return candidate && (Is.string(candidate.detail) || candidate.detail === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
      }
      CompletionItemLabelDetails2.is = is;
    })(CompletionItemLabelDetails || (CompletionItemLabelDetails = {}));
    (function(CompletionItem2) {
      function create(label) {
        return { label };
      }
      CompletionItem2.create = create;
    })(CompletionItem || (CompletionItem = {}));
    (function(CompletionList2) {
      function create(items, isIncomplete) {
        return { items: items ? items : [], isIncomplete: !!isIncomplete };
      }
      CompletionList2.create = create;
    })(CompletionList || (CompletionList = {}));
    (function(MarkedString2) {
      function fromPlainText(plainText) {
        return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
      }
      MarkedString2.fromPlainText = fromPlainText;
      function is(value) {
        var candidate = value;
        return Is.string(candidate) || Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value);
      }
      MarkedString2.is = is;
    })(MarkedString || (MarkedString = {}));
    (function(Hover2) {
      function is(value) {
        var candidate = value;
        return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) || MarkedString.is(candidate.contents) || Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === void 0 || Range.is(value.range));
      }
      Hover2.is = is;
    })(Hover || (Hover = {}));
    (function(ParameterInformation2) {
      function create(label, documentation) {
        return documentation ? { label, documentation } : { label };
      }
      ParameterInformation2.create = create;
    })(ParameterInformation || (ParameterInformation = {}));
    (function(SignatureInformation2) {
      function create(label, documentation) {
        var parameters = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          parameters[_i - 2] = arguments[_i];
        }
        var result = { label };
        if (Is.defined(documentation)) {
          result.documentation = documentation;
        }
        if (Is.defined(parameters)) {
          result.parameters = parameters;
        } else {
          result.parameters = [];
        }
        return result;
      }
      SignatureInformation2.create = create;
    })(SignatureInformation || (SignatureInformation = {}));
    (function(DocumentHighlightKind2) {
      DocumentHighlightKind2.Text = 1;
      DocumentHighlightKind2.Read = 2;
      DocumentHighlightKind2.Write = 3;
    })(DocumentHighlightKind || (DocumentHighlightKind = {}));
    (function(DocumentHighlight2) {
      function create(range, kind) {
        var result = { range };
        if (Is.number(kind)) {
          result.kind = kind;
        }
        return result;
      }
      DocumentHighlight2.create = create;
    })(DocumentHighlight || (DocumentHighlight = {}));
    (function(SymbolKind2) {
      SymbolKind2.File = 1;
      SymbolKind2.Module = 2;
      SymbolKind2.Namespace = 3;
      SymbolKind2.Package = 4;
      SymbolKind2.Class = 5;
      SymbolKind2.Method = 6;
      SymbolKind2.Property = 7;
      SymbolKind2.Field = 8;
      SymbolKind2.Constructor = 9;
      SymbolKind2.Enum = 10;
      SymbolKind2.Interface = 11;
      SymbolKind2.Function = 12;
      SymbolKind2.Variable = 13;
      SymbolKind2.Constant = 14;
      SymbolKind2.String = 15;
      SymbolKind2.Number = 16;
      SymbolKind2.Boolean = 17;
      SymbolKind2.Array = 18;
      SymbolKind2.Object = 19;
      SymbolKind2.Key = 20;
      SymbolKind2.Null = 21;
      SymbolKind2.EnumMember = 22;
      SymbolKind2.Struct = 23;
      SymbolKind2.Event = 24;
      SymbolKind2.Operator = 25;
      SymbolKind2.TypeParameter = 26;
    })(SymbolKind || (SymbolKind = {}));
    (function(SymbolTag2) {
      SymbolTag2.Deprecated = 1;
    })(SymbolTag || (SymbolTag = {}));
    (function(SymbolInformation2) {
      function create(name, kind, range, uri, containerName) {
        var result = {
          name,
          kind,
          location: { uri, range }
        };
        if (containerName) {
          result.containerName = containerName;
        }
        return result;
      }
      SymbolInformation2.create = create;
    })(SymbolInformation || (SymbolInformation = {}));
    (function(WorkspaceSymbol2) {
      function create(name, kind, uri, range) {
        return range !== void 0 ? { name, kind, location: { uri, range } } : { name, kind, location: { uri } };
      }
      WorkspaceSymbol2.create = create;
    })(WorkspaceSymbol || (WorkspaceSymbol = {}));
    (function(DocumentSymbol2) {
      function create(name, detail, kind, range, selectionRange, children) {
        var result = {
          name,
          detail,
          kind,
          range,
          selectionRange
        };
        if (children !== void 0) {
          result.children = children;
        }
        return result;
      }
      DocumentSymbol2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && Is.string(candidate.name) && Is.number(candidate.kind) && Range.is(candidate.range) && Range.is(candidate.selectionRange) && (candidate.detail === void 0 || Is.string(candidate.detail)) && (candidate.deprecated === void 0 || Is.boolean(candidate.deprecated)) && (candidate.children === void 0 || Array.isArray(candidate.children)) && (candidate.tags === void 0 || Array.isArray(candidate.tags));
      }
      DocumentSymbol2.is = is;
    })(DocumentSymbol || (DocumentSymbol = {}));
    (function(CodeActionKind2) {
      CodeActionKind2.Empty = "";
      CodeActionKind2.QuickFix = "quickfix";
      CodeActionKind2.Refactor = "refactor";
      CodeActionKind2.RefactorExtract = "refactor.extract";
      CodeActionKind2.RefactorInline = "refactor.inline";
      CodeActionKind2.RefactorRewrite = "refactor.rewrite";
      CodeActionKind2.Source = "source";
      CodeActionKind2.SourceOrganizeImports = "source.organizeImports";
      CodeActionKind2.SourceFixAll = "source.fixAll";
    })(CodeActionKind || (CodeActionKind = {}));
    (function(CodeActionTriggerKind2) {
      CodeActionTriggerKind2.Invoked = 1;
      CodeActionTriggerKind2.Automatic = 2;
    })(CodeActionTriggerKind || (CodeActionTriggerKind = {}));
    (function(CodeActionContext2) {
      function create(diagnostics, only, triggerKind) {
        var result = { diagnostics };
        if (only !== void 0 && only !== null) {
          result.only = only;
        }
        if (triggerKind !== void 0 && triggerKind !== null) {
          result.triggerKind = triggerKind;
        }
        return result;
      }
      CodeActionContext2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is) && (candidate.only === void 0 || Is.typedArray(candidate.only, Is.string)) && (candidate.triggerKind === void 0 || candidate.triggerKind === CodeActionTriggerKind.Invoked || candidate.triggerKind === CodeActionTriggerKind.Automatic);
      }
      CodeActionContext2.is = is;
    })(CodeActionContext || (CodeActionContext = {}));
    (function(CodeAction2) {
      function create(title, kindOrCommandOrEdit, kind) {
        var result = { title };
        var checkKind = true;
        if (typeof kindOrCommandOrEdit === "string") {
          checkKind = false;
          result.kind = kindOrCommandOrEdit;
        } else if (Command.is(kindOrCommandOrEdit)) {
          result.command = kindOrCommandOrEdit;
        } else {
          result.edit = kindOrCommandOrEdit;
        }
        if (checkKind && kind !== void 0) {
          result.kind = kind;
        }
        return result;
      }
      CodeAction2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && Is.string(candidate.title) && (candidate.diagnostics === void 0 || Is.typedArray(candidate.diagnostics, Diagnostic.is)) && (candidate.kind === void 0 || Is.string(candidate.kind)) && (candidate.edit !== void 0 || candidate.command !== void 0) && (candidate.command === void 0 || Command.is(candidate.command)) && (candidate.isPreferred === void 0 || Is.boolean(candidate.isPreferred)) && (candidate.edit === void 0 || WorkspaceEdit.is(candidate.edit));
      }
      CodeAction2.is = is;
    })(CodeAction || (CodeAction = {}));
    (function(CodeLens2) {
      function create(range, data) {
        var result = { range };
        if (Is.defined(data)) {
          result.data = data;
        }
        return result;
      }
      CodeLens2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
      }
      CodeLens2.is = is;
    })(CodeLens || (CodeLens = {}));
    (function(FormattingOptions2) {
      function create(tabSize, insertSpaces) {
        return { tabSize, insertSpaces };
      }
      FormattingOptions2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.uinteger(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
      }
      FormattingOptions2.is = is;
    })(FormattingOptions || (FormattingOptions = {}));
    (function(DocumentLink2) {
      function create(range, target, data) {
        return { range, target, data };
      }
      DocumentLink2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
      }
      DocumentLink2.is = is;
    })(DocumentLink || (DocumentLink = {}));
    (function(SelectionRange2) {
      function create(range, parent) {
        return { range, parent };
      }
      SelectionRange2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.range) && (candidate.parent === void 0 || SelectionRange2.is(candidate.parent));
      }
      SelectionRange2.is = is;
    })(SelectionRange || (SelectionRange = {}));
    (function(SemanticTokenTypes2) {
      SemanticTokenTypes2["namespace"] = "namespace";
      SemanticTokenTypes2["type"] = "type";
      SemanticTokenTypes2["class"] = "class";
      SemanticTokenTypes2["enum"] = "enum";
      SemanticTokenTypes2["interface"] = "interface";
      SemanticTokenTypes2["struct"] = "struct";
      SemanticTokenTypes2["typeParameter"] = "typeParameter";
      SemanticTokenTypes2["parameter"] = "parameter";
      SemanticTokenTypes2["variable"] = "variable";
      SemanticTokenTypes2["property"] = "property";
      SemanticTokenTypes2["enumMember"] = "enumMember";
      SemanticTokenTypes2["event"] = "event";
      SemanticTokenTypes2["function"] = "function";
      SemanticTokenTypes2["method"] = "method";
      SemanticTokenTypes2["macro"] = "macro";
      SemanticTokenTypes2["keyword"] = "keyword";
      SemanticTokenTypes2["modifier"] = "modifier";
      SemanticTokenTypes2["comment"] = "comment";
      SemanticTokenTypes2["string"] = "string";
      SemanticTokenTypes2["number"] = "number";
      SemanticTokenTypes2["regexp"] = "regexp";
      SemanticTokenTypes2["operator"] = "operator";
      SemanticTokenTypes2["decorator"] = "decorator";
    })(SemanticTokenTypes || (SemanticTokenTypes = {}));
    (function(SemanticTokenModifiers2) {
      SemanticTokenModifiers2["declaration"] = "declaration";
      SemanticTokenModifiers2["definition"] = "definition";
      SemanticTokenModifiers2["readonly"] = "readonly";
      SemanticTokenModifiers2["static"] = "static";
      SemanticTokenModifiers2["deprecated"] = "deprecated";
      SemanticTokenModifiers2["abstract"] = "abstract";
      SemanticTokenModifiers2["async"] = "async";
      SemanticTokenModifiers2["modification"] = "modification";
      SemanticTokenModifiers2["documentation"] = "documentation";
      SemanticTokenModifiers2["defaultLibrary"] = "defaultLibrary";
    })(SemanticTokenModifiers || (SemanticTokenModifiers = {}));
    (function(SemanticTokens2) {
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && (candidate.resultId === void 0 || typeof candidate.resultId === "string") && Array.isArray(candidate.data) && (candidate.data.length === 0 || typeof candidate.data[0] === "number");
      }
      SemanticTokens2.is = is;
    })(SemanticTokens || (SemanticTokens = {}));
    (function(InlineValueText2) {
      function create(range, text) {
        return { range, text };
      }
      InlineValueText2.create = create;
      function is(value) {
        var candidate = value;
        return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && Is.string(candidate.text);
      }
      InlineValueText2.is = is;
    })(InlineValueText || (InlineValueText = {}));
    (function(InlineValueVariableLookup2) {
      function create(range, variableName, caseSensitiveLookup) {
        return { range, variableName, caseSensitiveLookup };
      }
      InlineValueVariableLookup2.create = create;
      function is(value) {
        var candidate = value;
        return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && Is.boolean(candidate.caseSensitiveLookup) && (Is.string(candidate.variableName) || candidate.variableName === void 0);
      }
      InlineValueVariableLookup2.is = is;
    })(InlineValueVariableLookup || (InlineValueVariableLookup = {}));
    (function(InlineValueEvaluatableExpression2) {
      function create(range, expression) {
        return { range, expression };
      }
      InlineValueEvaluatableExpression2.create = create;
      function is(value) {
        var candidate = value;
        return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && (Is.string(candidate.expression) || candidate.expression === void 0);
      }
      InlineValueEvaluatableExpression2.is = is;
    })(InlineValueEvaluatableExpression || (InlineValueEvaluatableExpression = {}));
    (function(InlineValueContext2) {
      function create(frameId, stoppedLocation) {
        return { frameId, stoppedLocation };
      }
      InlineValueContext2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Range.is(value.stoppedLocation);
      }
      InlineValueContext2.is = is;
    })(InlineValueContext || (InlineValueContext = {}));
    (function(InlayHintKind2) {
      InlayHintKind2.Type = 1;
      InlayHintKind2.Parameter = 2;
      function is(value) {
        return value === 1 || value === 2;
      }
      InlayHintKind2.is = is;
    })(InlayHintKind || (InlayHintKind = {}));
    (function(InlayHintLabelPart2) {
      function create(value) {
        return { value };
      }
      InlayHintLabelPart2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && (candidate.tooltip === void 0 || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.location === void 0 || Location.is(candidate.location)) && (candidate.command === void 0 || Command.is(candidate.command));
      }
      InlayHintLabelPart2.is = is;
    })(InlayHintLabelPart || (InlayHintLabelPart = {}));
    (function(InlayHint2) {
      function create(position, label, kind) {
        var result = { position, label };
        if (kind !== void 0) {
          result.kind = kind;
        }
        return result;
      }
      InlayHint2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Position.is(candidate.position) && (Is.string(candidate.label) || Is.typedArray(candidate.label, InlayHintLabelPart.is)) && (candidate.kind === void 0 || InlayHintKind.is(candidate.kind)) && candidate.textEdits === void 0 || Is.typedArray(candidate.textEdits, TextEdit.is) && (candidate.tooltip === void 0 || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.paddingLeft === void 0 || Is.boolean(candidate.paddingLeft)) && (candidate.paddingRight === void 0 || Is.boolean(candidate.paddingRight));
      }
      InlayHint2.is = is;
    })(InlayHint || (InlayHint = {}));
    (function(WorkspaceFolder2) {
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && URI.is(candidate.uri) && Is.string(candidate.name);
      }
      WorkspaceFolder2.is = is;
    })(WorkspaceFolder || (WorkspaceFolder = {}));
    EOL = ["\n", "\r\n", "\r"];
    (function(TextDocument2) {
      function create(uri, languageId, version, content) {
        return new FullTextDocument(uri, languageId, version, content);
      }
      TextDocument2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.uinteger(candidate.lineCount) && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
      }
      TextDocument2.is = is;
      function applyEdits(document, edits) {
        var text = document.getText();
        var sortedEdits = mergeSort(edits, function(a, b) {
          var diff = a.range.start.line - b.range.start.line;
          if (diff === 0) {
            return a.range.start.character - b.range.start.character;
          }
          return diff;
        });
        var lastModifiedOffset = text.length;
        for (var i = sortedEdits.length - 1; i >= 0; i--) {
          var e = sortedEdits[i];
          var startOffset = document.offsetAt(e.range.start);
          var endOffset = document.offsetAt(e.range.end);
          if (endOffset <= lastModifiedOffset) {
            text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
          } else {
            throw new Error("Overlapping edit");
          }
          lastModifiedOffset = startOffset;
        }
        return text;
      }
      TextDocument2.applyEdits = applyEdits;
      function mergeSort(data, compare) {
        if (data.length <= 1) {
          return data;
        }
        var p = data.length / 2 | 0;
        var left = data.slice(0, p);
        var right = data.slice(p);
        mergeSort(left, compare);
        mergeSort(right, compare);
        var leftIdx = 0;
        var rightIdx = 0;
        var i = 0;
        while (leftIdx < left.length && rightIdx < right.length) {
          var ret = compare(left[leftIdx], right[rightIdx]);
          if (ret <= 0) {
            data[i++] = left[leftIdx++];
          } else {
            data[i++] = right[rightIdx++];
          }
        }
        while (leftIdx < left.length) {
          data[i++] = left[leftIdx++];
        }
        while (rightIdx < right.length) {
          data[i++] = right[rightIdx++];
        }
        return data;
      }
    })(TextDocument || (TextDocument = {}));
    FullTextDocument = function() {
      function FullTextDocument2(uri, languageId, version, content) {
        this._uri = uri;
        this._languageId = languageId;
        this._version = version;
        this._content = content;
        this._lineOffsets = void 0;
      }
      Object.defineProperty(FullTextDocument2.prototype, "uri", {
        get: function() {
          return this._uri;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(FullTextDocument2.prototype, "languageId", {
        get: function() {
          return this._languageId;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(FullTextDocument2.prototype, "version", {
        get: function() {
          return this._version;
        },
        enumerable: false,
        configurable: true
      });
      FullTextDocument2.prototype.getText = function(range) {
        if (range) {
          var start = this.offsetAt(range.start);
          var end = this.offsetAt(range.end);
          return this._content.substring(start, end);
        }
        return this._content;
      };
      FullTextDocument2.prototype.update = function(event, version) {
        this._content = event.text;
        this._version = version;
        this._lineOffsets = void 0;
      };
      FullTextDocument2.prototype.getLineOffsets = function() {
        if (this._lineOffsets === void 0) {
          var lineOffsets = [];
          var text = this._content;
          var isLineStart = true;
          for (var i = 0; i < text.length; i++) {
            if (isLineStart) {
              lineOffsets.push(i);
              isLineStart = false;
            }
            var ch = text.charAt(i);
            isLineStart = ch === "\r" || ch === "\n";
            if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
              i++;
            }
          }
          if (isLineStart && text.length > 0) {
            lineOffsets.push(text.length);
          }
          this._lineOffsets = lineOffsets;
        }
        return this._lineOffsets;
      };
      FullTextDocument2.prototype.positionAt = function(offset) {
        offset = Math.max(Math.min(offset, this._content.length), 0);
        var lineOffsets = this.getLineOffsets();
        var low = 0, high = lineOffsets.length;
        if (high === 0) {
          return Position.create(0, offset);
        }
        while (low < high) {
          var mid = Math.floor((low + high) / 2);
          if (lineOffsets[mid] > offset) {
            high = mid;
          } else {
            low = mid + 1;
          }
        }
        var line = low - 1;
        return Position.create(line, offset - lineOffsets[line]);
      };
      FullTextDocument2.prototype.offsetAt = function(position) {
        var lineOffsets = this.getLineOffsets();
        if (position.line >= lineOffsets.length) {
          return this._content.length;
        } else if (position.line < 0) {
          return 0;
        }
        var lineOffset = lineOffsets[position.line];
        var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
        return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
      };
      Object.defineProperty(FullTextDocument2.prototype, "lineCount", {
        get: function() {
          return this.getLineOffsets().length;
        },
        enumerable: false,
        configurable: true
      });
      return FullTextDocument2;
    }();
    (function(Is2) {
      var toString = Object.prototype.toString;
      function defined(value) {
        return typeof value !== "undefined";
      }
      Is2.defined = defined;
      function undefined2(value) {
        return typeof value === "undefined";
      }
      Is2.undefined = undefined2;
      function boolean(value) {
        return value === true || value === false;
      }
      Is2.boolean = boolean;
      function string(value) {
        return toString.call(value) === "[object String]";
      }
      Is2.string = string;
      function number(value) {
        return toString.call(value) === "[object Number]";
      }
      Is2.number = number;
      function numberRange(value, min, max) {
        return toString.call(value) === "[object Number]" && min <= value && value <= max;
      }
      Is2.numberRange = numberRange;
      function integer2(value) {
        return toString.call(value) === "[object Number]" && -2147483648 <= value && value <= 2147483647;
      }
      Is2.integer = integer2;
      function uinteger2(value) {
        return toString.call(value) === "[object Number]" && 0 <= value && value <= 2147483647;
      }
      Is2.uinteger = uinteger2;
      function func(value) {
        return toString.call(value) === "[object Function]";
      }
      Is2.func = func;
      function objectLiteral(value) {
        return value !== null && typeof value === "object";
      }
      Is2.objectLiteral = objectLiteral;
      function typedArray(value, check) {
        return Array.isArray(value) && value.every(check);
      }
      Is2.typedArray = typedArray;
    })(Is || (Is = {}));
  }
});
var require_messages2 = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/messages.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProtocolNotificationType = exports.ProtocolNotificationType0 = exports.ProtocolRequestType = exports.ProtocolRequestType0 = exports.RegistrationType = exports.MessageDirection = void 0;
    var vscode_jsonrpc_1 = require_main();
    (function(MessageDirection2) {
      MessageDirection2["clientToServer"] = "clientToServer";
      MessageDirection2["serverToClient"] = "serverToClient";
      MessageDirection2["both"] = "both";
    })(exports.MessageDirection || (exports.MessageDirection = {}));
    var RegistrationType = class {
      constructor(method) {
        this.method = method;
      }
    };
    exports.RegistrationType = RegistrationType;
    var ProtocolRequestType0 = class extends vscode_jsonrpc_1.RequestType0 {
      constructor(method) {
        super(method);
      }
    };
    exports.ProtocolRequestType0 = ProtocolRequestType0;
    var ProtocolRequestType = class extends vscode_jsonrpc_1.RequestType {
      constructor(method) {
        super(method, vscode_jsonrpc_1.ParameterStructures.byName);
      }
    };
    exports.ProtocolRequestType = ProtocolRequestType;
    var ProtocolNotificationType0 = class extends vscode_jsonrpc_1.NotificationType0 {
      constructor(method) {
        super(method);
      }
    };
    exports.ProtocolNotificationType0 = ProtocolNotificationType0;
    var ProtocolNotificationType = class extends vscode_jsonrpc_1.NotificationType {
      constructor(method) {
        super(method, vscode_jsonrpc_1.ParameterStructures.byName);
      }
    };
    exports.ProtocolNotificationType = ProtocolNotificationType;
  }
});
var require_is2 = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/utils/is.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.objectLiteral = exports.typedArray = exports.stringArray = exports.array = exports.func = exports.error = exports.number = exports.string = exports.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports.stringArray = stringArray;
    function typedArray(value, check) {
      return Array.isArray(value) && value.every(check);
    }
    exports.typedArray = typedArray;
    function objectLiteral(value) {
      return value !== null && typeof value === "object";
    }
    exports.objectLiteral = objectLiteral;
  }
});
var require_protocol_implementation = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.implementation.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImplementationRequest = void 0;
    var messages_1 = require_messages2();
    (function(ImplementationRequest2) {
      ImplementationRequest2.method = "textDocument/implementation";
      ImplementationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ImplementationRequest2.type = new messages_1.ProtocolRequestType(ImplementationRequest2.method);
    })(exports.ImplementationRequest || (exports.ImplementationRequest = {}));
  }
});
var require_protocol_typeDefinition = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.typeDefinition.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeDefinitionRequest = void 0;
    var messages_1 = require_messages2();
    (function(TypeDefinitionRequest2) {
      TypeDefinitionRequest2.method = "textDocument/typeDefinition";
      TypeDefinitionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeDefinitionRequest2.type = new messages_1.ProtocolRequestType(TypeDefinitionRequest2.method);
    })(exports.TypeDefinitionRequest || (exports.TypeDefinitionRequest = {}));
  }
});
var require_protocol_workspaceFolder = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.workspaceFolder.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DidChangeWorkspaceFoldersNotification = exports.WorkspaceFoldersRequest = void 0;
    var messages_1 = require_messages2();
    (function(WorkspaceFoldersRequest2) {
      WorkspaceFoldersRequest2.method = "workspace/workspaceFolders";
      WorkspaceFoldersRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      WorkspaceFoldersRequest2.type = new messages_1.ProtocolRequestType0(WorkspaceFoldersRequest2.method);
    })(exports.WorkspaceFoldersRequest || (exports.WorkspaceFoldersRequest = {}));
    (function(DidChangeWorkspaceFoldersNotification2) {
      DidChangeWorkspaceFoldersNotification2.method = "workspace/didChangeWorkspaceFolders";
      DidChangeWorkspaceFoldersNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeWorkspaceFoldersNotification2.type = new messages_1.ProtocolNotificationType(DidChangeWorkspaceFoldersNotification2.method);
    })(exports.DidChangeWorkspaceFoldersNotification || (exports.DidChangeWorkspaceFoldersNotification = {}));
  }
});
var require_protocol_configuration = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.configuration.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigurationRequest = void 0;
    var messages_1 = require_messages2();
    (function(ConfigurationRequest2) {
      ConfigurationRequest2.method = "workspace/configuration";
      ConfigurationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ConfigurationRequest2.type = new messages_1.ProtocolRequestType(ConfigurationRequest2.method);
    })(exports.ConfigurationRequest || (exports.ConfigurationRequest = {}));
  }
});
var require_protocol_colorProvider = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.colorProvider.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorPresentationRequest = exports.DocumentColorRequest = void 0;
    var messages_1 = require_messages2();
    (function(DocumentColorRequest2) {
      DocumentColorRequest2.method = "textDocument/documentColor";
      DocumentColorRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentColorRequest2.type = new messages_1.ProtocolRequestType(DocumentColorRequest2.method);
    })(exports.DocumentColorRequest || (exports.DocumentColorRequest = {}));
    (function(ColorPresentationRequest2) {
      ColorPresentationRequest2.method = "textDocument/colorPresentation";
      ColorPresentationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ColorPresentationRequest2.type = new messages_1.ProtocolRequestType(ColorPresentationRequest2.method);
    })(exports.ColorPresentationRequest || (exports.ColorPresentationRequest = {}));
  }
});
var require_protocol_foldingRange = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.foldingRange.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FoldingRangeRequest = void 0;
    var messages_1 = require_messages2();
    (function(FoldingRangeRequest2) {
      FoldingRangeRequest2.method = "textDocument/foldingRange";
      FoldingRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      FoldingRangeRequest2.type = new messages_1.ProtocolRequestType(FoldingRangeRequest2.method);
    })(exports.FoldingRangeRequest || (exports.FoldingRangeRequest = {}));
  }
});
var require_protocol_declaration = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.declaration.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DeclarationRequest = void 0;
    var messages_1 = require_messages2();
    (function(DeclarationRequest2) {
      DeclarationRequest2.method = "textDocument/declaration";
      DeclarationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DeclarationRequest2.type = new messages_1.ProtocolRequestType(DeclarationRequest2.method);
    })(exports.DeclarationRequest || (exports.DeclarationRequest = {}));
  }
});
var require_protocol_selectionRange = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.selectionRange.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectionRangeRequest = void 0;
    var messages_1 = require_messages2();
    (function(SelectionRangeRequest2) {
      SelectionRangeRequest2.method = "textDocument/selectionRange";
      SelectionRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SelectionRangeRequest2.type = new messages_1.ProtocolRequestType(SelectionRangeRequest2.method);
    })(exports.SelectionRangeRequest || (exports.SelectionRangeRequest = {}));
  }
});
var require_protocol_progress = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.progress.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkDoneProgressCancelNotification = exports.WorkDoneProgressCreateRequest = exports.WorkDoneProgress = void 0;
    var vscode_jsonrpc_1 = require_main();
    var messages_1 = require_messages2();
    (function(WorkDoneProgress2) {
      WorkDoneProgress2.type = new vscode_jsonrpc_1.ProgressType();
      function is(value) {
        return value === WorkDoneProgress2.type;
      }
      WorkDoneProgress2.is = is;
    })(exports.WorkDoneProgress || (exports.WorkDoneProgress = {}));
    (function(WorkDoneProgressCreateRequest2) {
      WorkDoneProgressCreateRequest2.method = "window/workDoneProgress/create";
      WorkDoneProgressCreateRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      WorkDoneProgressCreateRequest2.type = new messages_1.ProtocolRequestType(WorkDoneProgressCreateRequest2.method);
    })(exports.WorkDoneProgressCreateRequest || (exports.WorkDoneProgressCreateRequest = {}));
    (function(WorkDoneProgressCancelNotification2) {
      WorkDoneProgressCancelNotification2.method = "window/workDoneProgress/cancel";
      WorkDoneProgressCancelNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkDoneProgressCancelNotification2.type = new messages_1.ProtocolNotificationType(WorkDoneProgressCancelNotification2.method);
    })(exports.WorkDoneProgressCancelNotification || (exports.WorkDoneProgressCancelNotification = {}));
  }
});
var require_protocol_callHierarchy = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.callHierarchy.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallHierarchyOutgoingCallsRequest = exports.CallHierarchyIncomingCallsRequest = exports.CallHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    (function(CallHierarchyPrepareRequest2) {
      CallHierarchyPrepareRequest2.method = "textDocument/prepareCallHierarchy";
      CallHierarchyPrepareRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyPrepareRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyPrepareRequest2.method);
    })(exports.CallHierarchyPrepareRequest || (exports.CallHierarchyPrepareRequest = {}));
    (function(CallHierarchyIncomingCallsRequest2) {
      CallHierarchyIncomingCallsRequest2.method = "callHierarchy/incomingCalls";
      CallHierarchyIncomingCallsRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyIncomingCallsRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyIncomingCallsRequest2.method);
    })(exports.CallHierarchyIncomingCallsRequest || (exports.CallHierarchyIncomingCallsRequest = {}));
    (function(CallHierarchyOutgoingCallsRequest2) {
      CallHierarchyOutgoingCallsRequest2.method = "callHierarchy/outgoingCalls";
      CallHierarchyOutgoingCallsRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyOutgoingCallsRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyOutgoingCallsRequest2.method);
    })(exports.CallHierarchyOutgoingCallsRequest || (exports.CallHierarchyOutgoingCallsRequest = {}));
  }
});
var require_protocol_semanticTokens = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.semanticTokens.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SemanticTokensRefreshRequest = exports.SemanticTokensRangeRequest = exports.SemanticTokensDeltaRequest = exports.SemanticTokensRequest = exports.SemanticTokensRegistrationType = exports.TokenFormat = void 0;
    var messages_1 = require_messages2();
    (function(TokenFormat2) {
      TokenFormat2.Relative = "relative";
    })(exports.TokenFormat || (exports.TokenFormat = {}));
    var SemanticTokensRegistrationType;
    (function(SemanticTokensRegistrationType2) {
      SemanticTokensRegistrationType2.method = "textDocument/semanticTokens";
      SemanticTokensRegistrationType2.type = new messages_1.RegistrationType(SemanticTokensRegistrationType2.method);
    })(SemanticTokensRegistrationType = exports.SemanticTokensRegistrationType || (exports.SemanticTokensRegistrationType = {}));
    (function(SemanticTokensRequest2) {
      SemanticTokensRequest2.method = "textDocument/semanticTokens/full";
      SemanticTokensRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensRequest2.method);
      SemanticTokensRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(exports.SemanticTokensRequest || (exports.SemanticTokensRequest = {}));
    (function(SemanticTokensDeltaRequest2) {
      SemanticTokensDeltaRequest2.method = "textDocument/semanticTokens/full/delta";
      SemanticTokensDeltaRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensDeltaRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensDeltaRequest2.method);
      SemanticTokensDeltaRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(exports.SemanticTokensDeltaRequest || (exports.SemanticTokensDeltaRequest = {}));
    (function(SemanticTokensRangeRequest2) {
      SemanticTokensRangeRequest2.method = "textDocument/semanticTokens/range";
      SemanticTokensRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensRangeRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensRangeRequest2.method);
      SemanticTokensRangeRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(exports.SemanticTokensRangeRequest || (exports.SemanticTokensRangeRequest = {}));
    (function(SemanticTokensRefreshRequest2) {
      SemanticTokensRefreshRequest2.method = `workspace/semanticTokens/refresh`;
      SemanticTokensRefreshRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensRefreshRequest2.type = new messages_1.ProtocolRequestType0(SemanticTokensRefreshRequest2.method);
    })(exports.SemanticTokensRefreshRequest || (exports.SemanticTokensRefreshRequest = {}));
  }
});
var require_protocol_showDocument = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.showDocument.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowDocumentRequest = void 0;
    var messages_1 = require_messages2();
    (function(ShowDocumentRequest2) {
      ShowDocumentRequest2.method = "window/showDocument";
      ShowDocumentRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowDocumentRequest2.type = new messages_1.ProtocolRequestType(ShowDocumentRequest2.method);
    })(exports.ShowDocumentRequest || (exports.ShowDocumentRequest = {}));
  }
});
var require_protocol_linkedEditingRange = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.linkedEditingRange.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinkedEditingRangeRequest = void 0;
    var messages_1 = require_messages2();
    (function(LinkedEditingRangeRequest2) {
      LinkedEditingRangeRequest2.method = "textDocument/linkedEditingRange";
      LinkedEditingRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      LinkedEditingRangeRequest2.type = new messages_1.ProtocolRequestType(LinkedEditingRangeRequest2.method);
    })(exports.LinkedEditingRangeRequest || (exports.LinkedEditingRangeRequest = {}));
  }
});
var require_protocol_fileOperations = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.fileOperations.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WillDeleteFilesRequest = exports.DidDeleteFilesNotification = exports.DidRenameFilesNotification = exports.WillRenameFilesRequest = exports.DidCreateFilesNotification = exports.WillCreateFilesRequest = exports.FileOperationPatternKind = void 0;
    var messages_1 = require_messages2();
    (function(FileOperationPatternKind2) {
      FileOperationPatternKind2.file = "file";
      FileOperationPatternKind2.folder = "folder";
    })(exports.FileOperationPatternKind || (exports.FileOperationPatternKind = {}));
    (function(WillCreateFilesRequest2) {
      WillCreateFilesRequest2.method = "workspace/willCreateFiles";
      WillCreateFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillCreateFilesRequest2.type = new messages_1.ProtocolRequestType(WillCreateFilesRequest2.method);
    })(exports.WillCreateFilesRequest || (exports.WillCreateFilesRequest = {}));
    (function(DidCreateFilesNotification2) {
      DidCreateFilesNotification2.method = "workspace/didCreateFiles";
      DidCreateFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCreateFilesNotification2.type = new messages_1.ProtocolNotificationType(DidCreateFilesNotification2.method);
    })(exports.DidCreateFilesNotification || (exports.DidCreateFilesNotification = {}));
    (function(WillRenameFilesRequest2) {
      WillRenameFilesRequest2.method = "workspace/willRenameFiles";
      WillRenameFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillRenameFilesRequest2.type = new messages_1.ProtocolRequestType(WillRenameFilesRequest2.method);
    })(exports.WillRenameFilesRequest || (exports.WillRenameFilesRequest = {}));
    (function(DidRenameFilesNotification2) {
      DidRenameFilesNotification2.method = "workspace/didRenameFiles";
      DidRenameFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidRenameFilesNotification2.type = new messages_1.ProtocolNotificationType(DidRenameFilesNotification2.method);
    })(exports.DidRenameFilesNotification || (exports.DidRenameFilesNotification = {}));
    (function(DidDeleteFilesNotification2) {
      DidDeleteFilesNotification2.method = "workspace/didDeleteFiles";
      DidDeleteFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidDeleteFilesNotification2.type = new messages_1.ProtocolNotificationType(DidDeleteFilesNotification2.method);
    })(exports.DidDeleteFilesNotification || (exports.DidDeleteFilesNotification = {}));
    (function(WillDeleteFilesRequest2) {
      WillDeleteFilesRequest2.method = "workspace/willDeleteFiles";
      WillDeleteFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillDeleteFilesRequest2.type = new messages_1.ProtocolRequestType(WillDeleteFilesRequest2.method);
    })(exports.WillDeleteFilesRequest || (exports.WillDeleteFilesRequest = {}));
  }
});
var require_protocol_moniker = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.moniker.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MonikerRequest = exports.MonikerKind = exports.UniquenessLevel = void 0;
    var messages_1 = require_messages2();
    (function(UniquenessLevel2) {
      UniquenessLevel2.document = "document";
      UniquenessLevel2.project = "project";
      UniquenessLevel2.group = "group";
      UniquenessLevel2.scheme = "scheme";
      UniquenessLevel2.global = "global";
    })(exports.UniquenessLevel || (exports.UniquenessLevel = {}));
    (function(MonikerKind2) {
      MonikerKind2.$import = "import";
      MonikerKind2.$export = "export";
      MonikerKind2.local = "local";
    })(exports.MonikerKind || (exports.MonikerKind = {}));
    (function(MonikerRequest2) {
      MonikerRequest2.method = "textDocument/moniker";
      MonikerRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      MonikerRequest2.type = new messages_1.ProtocolRequestType(MonikerRequest2.method);
    })(exports.MonikerRequest || (exports.MonikerRequest = {}));
  }
});
var require_protocol_typeHierarchy = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.typeHierarchy.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeHierarchySubtypesRequest = exports.TypeHierarchySupertypesRequest = exports.TypeHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    (function(TypeHierarchyPrepareRequest2) {
      TypeHierarchyPrepareRequest2.method = "textDocument/prepareTypeHierarchy";
      TypeHierarchyPrepareRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchyPrepareRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchyPrepareRequest2.method);
    })(exports.TypeHierarchyPrepareRequest || (exports.TypeHierarchyPrepareRequest = {}));
    (function(TypeHierarchySupertypesRequest2) {
      TypeHierarchySupertypesRequest2.method = "typeHierarchy/supertypes";
      TypeHierarchySupertypesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchySupertypesRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchySupertypesRequest2.method);
    })(exports.TypeHierarchySupertypesRequest || (exports.TypeHierarchySupertypesRequest = {}));
    (function(TypeHierarchySubtypesRequest2) {
      TypeHierarchySubtypesRequest2.method = "typeHierarchy/subtypes";
      TypeHierarchySubtypesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchySubtypesRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchySubtypesRequest2.method);
    })(exports.TypeHierarchySubtypesRequest || (exports.TypeHierarchySubtypesRequest = {}));
  }
});
var require_protocol_inlineValue = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineValue.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineValueRefreshRequest = exports.InlineValueRequest = void 0;
    var messages_1 = require_messages2();
    (function(InlineValueRequest2) {
      InlineValueRequest2.method = "textDocument/inlineValue";
      InlineValueRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlineValueRequest2.type = new messages_1.ProtocolRequestType(InlineValueRequest2.method);
    })(exports.InlineValueRequest || (exports.InlineValueRequest = {}));
    (function(InlineValueRefreshRequest2) {
      InlineValueRefreshRequest2.method = `workspace/inlineValue/refresh`;
      InlineValueRefreshRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlineValueRefreshRequest2.type = new messages_1.ProtocolRequestType0(InlineValueRefreshRequest2.method);
    })(exports.InlineValueRefreshRequest || (exports.InlineValueRefreshRequest = {}));
  }
});
var require_protocol_inlayHint = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlayHint.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlayHintRefreshRequest = exports.InlayHintResolveRequest = exports.InlayHintRequest = void 0;
    var messages_1 = require_messages2();
    (function(InlayHintRequest2) {
      InlayHintRequest2.method = "textDocument/inlayHint";
      InlayHintRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlayHintRequest2.type = new messages_1.ProtocolRequestType(InlayHintRequest2.method);
    })(exports.InlayHintRequest || (exports.InlayHintRequest = {}));
    (function(InlayHintResolveRequest2) {
      InlayHintResolveRequest2.method = "inlayHint/resolve";
      InlayHintResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlayHintResolveRequest2.type = new messages_1.ProtocolRequestType(InlayHintResolveRequest2.method);
    })(exports.InlayHintResolveRequest || (exports.InlayHintResolveRequest = {}));
    (function(InlayHintRefreshRequest2) {
      InlayHintRefreshRequest2.method = `workspace/inlayHint/refresh`;
      InlayHintRefreshRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlayHintRefreshRequest2.type = new messages_1.ProtocolRequestType0(InlayHintRefreshRequest2.method);
    })(exports.InlayHintRefreshRequest || (exports.InlayHintRefreshRequest = {}));
  }
});
var require_protocol_diagnostic = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.diagnostic.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiagnosticRefreshRequest = exports.WorkspaceDiagnosticRequest = exports.DocumentDiagnosticRequest = exports.DocumentDiagnosticReportKind = exports.DiagnosticServerCancellationData = void 0;
    var vscode_jsonrpc_1 = require_main();
    var Is2 = require_is2();
    var messages_1 = require_messages2();
    (function(DiagnosticServerCancellationData2) {
      function is(value) {
        const candidate = value;
        return candidate && Is2.boolean(candidate.retriggerRequest);
      }
      DiagnosticServerCancellationData2.is = is;
    })(exports.DiagnosticServerCancellationData || (exports.DiagnosticServerCancellationData = {}));
    (function(DocumentDiagnosticReportKind2) {
      DocumentDiagnosticReportKind2.Full = "full";
      DocumentDiagnosticReportKind2.Unchanged = "unchanged";
    })(exports.DocumentDiagnosticReportKind || (exports.DocumentDiagnosticReportKind = {}));
    (function(DocumentDiagnosticRequest2) {
      DocumentDiagnosticRequest2.method = "textDocument/diagnostic";
      DocumentDiagnosticRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentDiagnosticRequest2.type = new messages_1.ProtocolRequestType(DocumentDiagnosticRequest2.method);
      DocumentDiagnosticRequest2.partialResult = new vscode_jsonrpc_1.ProgressType();
    })(exports.DocumentDiagnosticRequest || (exports.DocumentDiagnosticRequest = {}));
    (function(WorkspaceDiagnosticRequest2) {
      WorkspaceDiagnosticRequest2.method = "workspace/diagnostic";
      WorkspaceDiagnosticRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceDiagnosticRequest2.type = new messages_1.ProtocolRequestType(WorkspaceDiagnosticRequest2.method);
      WorkspaceDiagnosticRequest2.partialResult = new vscode_jsonrpc_1.ProgressType();
    })(exports.WorkspaceDiagnosticRequest || (exports.WorkspaceDiagnosticRequest = {}));
    (function(DiagnosticRefreshRequest2) {
      DiagnosticRefreshRequest2.method = `workspace/diagnostic/refresh`;
      DiagnosticRefreshRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DiagnosticRefreshRequest2.type = new messages_1.ProtocolRequestType0(DiagnosticRefreshRequest2.method);
    })(exports.DiagnosticRefreshRequest || (exports.DiagnosticRefreshRequest = {}));
  }
});
var require_protocol_notebook = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.notebook.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DidCloseNotebookDocumentNotification = exports.DidSaveNotebookDocumentNotification = exports.DidChangeNotebookDocumentNotification = exports.NotebookCellArrayChange = exports.DidOpenNotebookDocumentNotification = exports.NotebookDocumentSyncRegistrationType = exports.NotebookDocument = exports.NotebookCell = exports.ExecutionSummary = exports.NotebookCellKind = void 0;
    var vscode_languageserver_types_1 = (init_main(), __toCommonJS(main_exports));
    var Is2 = require_is2();
    var messages_1 = require_messages2();
    var NotebookCellKind;
    (function(NotebookCellKind2) {
      NotebookCellKind2.Markup = 1;
      NotebookCellKind2.Code = 2;
      function is(value) {
        return value === 1 || value === 2;
      }
      NotebookCellKind2.is = is;
    })(NotebookCellKind = exports.NotebookCellKind || (exports.NotebookCellKind = {}));
    var ExecutionSummary;
    (function(ExecutionSummary2) {
      function create(executionOrder, success) {
        const result = { executionOrder };
        if (success === true || success === false) {
          result.success = success;
        }
        return result;
      }
      ExecutionSummary2.create = create;
      function is(value) {
        const candidate = value;
        return Is2.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.executionOrder) && (candidate.success === void 0 || Is2.boolean(candidate.success));
      }
      ExecutionSummary2.is = is;
      function equals(one, other) {
        if (one === other) {
          return true;
        }
        if (one === null || one === void 0 || other === null || other === void 0) {
          return false;
        }
        return one.executionOrder === other.executionOrder && one.success === other.success;
      }
      ExecutionSummary2.equals = equals;
    })(ExecutionSummary = exports.ExecutionSummary || (exports.ExecutionSummary = {}));
    var NotebookCell;
    (function(NotebookCell2) {
      function create(kind, document) {
        return { kind, document };
      }
      NotebookCell2.create = create;
      function is(value) {
        const candidate = value;
        return Is2.objectLiteral(candidate) && NotebookCellKind.is(candidate.kind) && vscode_languageserver_types_1.DocumentUri.is(candidate.document) && (candidate.metadata === void 0 || Is2.objectLiteral(candidate.metadata));
      }
      NotebookCell2.is = is;
      function diff(one, two) {
        const result = /* @__PURE__ */ new Set();
        if (one.document !== two.document) {
          result.add("document");
        }
        if (one.kind !== two.kind) {
          result.add("kind");
        }
        if (one.executionSummary !== two.executionSummary) {
          result.add("executionSummary");
        }
        if ((one.metadata !== void 0 || two.metadata !== void 0) && !equalsMetadata(one.metadata, two.metadata)) {
          result.add("metadata");
        }
        if ((one.executionSummary !== void 0 || two.executionSummary !== void 0) && !ExecutionSummary.equals(one.executionSummary, two.executionSummary)) {
          result.add("executionSummary");
        }
        return result;
      }
      NotebookCell2.diff = diff;
      function equalsMetadata(one, other) {
        if (one === other) {
          return true;
        }
        if (one === null || one === void 0 || other === null || other === void 0) {
          return false;
        }
        if (typeof one !== typeof other) {
          return false;
        }
        if (typeof one !== "object") {
          return false;
        }
        const oneArray = Array.isArray(one);
        const otherArray = Array.isArray(other);
        if (oneArray !== otherArray) {
          return false;
        }
        if (oneArray && otherArray) {
          if (one.length !== other.length) {
            return false;
          }
          for (let i = 0; i < one.length; i++) {
            if (!equalsMetadata(one[i], other[i])) {
              return false;
            }
          }
        }
        if (Is2.objectLiteral(one) && Is2.objectLiteral(other)) {
          const oneKeys = Object.keys(one);
          const otherKeys = Object.keys(other);
          if (oneKeys.length !== otherKeys.length) {
            return false;
          }
          oneKeys.sort();
          otherKeys.sort();
          if (!equalsMetadata(oneKeys, otherKeys)) {
            return false;
          }
          for (let i = 0; i < oneKeys.length; i++) {
            const prop = oneKeys[i];
            if (!equalsMetadata(one[prop], other[prop])) {
              return false;
            }
          }
        }
        return true;
      }
    })(NotebookCell = exports.NotebookCell || (exports.NotebookCell = {}));
    (function(NotebookDocument2) {
      function create(uri, notebookType, version, cells) {
        return { uri, notebookType, version, cells };
      }
      NotebookDocument2.create = create;
      function is(value) {
        const candidate = value;
        return Is2.objectLiteral(candidate) && Is2.string(candidate.uri) && vscode_languageserver_types_1.integer.is(candidate.version) && Is2.typedArray(candidate.cells, NotebookCell.is);
      }
      NotebookDocument2.is = is;
    })(exports.NotebookDocument || (exports.NotebookDocument = {}));
    var NotebookDocumentSyncRegistrationType;
    (function(NotebookDocumentSyncRegistrationType2) {
      NotebookDocumentSyncRegistrationType2.method = "notebookDocument/sync";
      NotebookDocumentSyncRegistrationType2.messageDirection = messages_1.MessageDirection.clientToServer;
      NotebookDocumentSyncRegistrationType2.type = new messages_1.RegistrationType(NotebookDocumentSyncRegistrationType2.method);
    })(NotebookDocumentSyncRegistrationType = exports.NotebookDocumentSyncRegistrationType || (exports.NotebookDocumentSyncRegistrationType = {}));
    (function(DidOpenNotebookDocumentNotification2) {
      DidOpenNotebookDocumentNotification2.method = "notebookDocument/didOpen";
      DidOpenNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidOpenNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidOpenNotebookDocumentNotification2.method);
      DidOpenNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(exports.DidOpenNotebookDocumentNotification || (exports.DidOpenNotebookDocumentNotification = {}));
    (function(NotebookCellArrayChange2) {
      function is(value) {
        const candidate = value;
        return Is2.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.start) && vscode_languageserver_types_1.uinteger.is(candidate.deleteCount) && (candidate.cells === void 0 || Is2.typedArray(candidate.cells, NotebookCell.is));
      }
      NotebookCellArrayChange2.is = is;
      function create(start, deleteCount, cells) {
        const result = { start, deleteCount };
        if (cells !== void 0) {
          result.cells = cells;
        }
        return result;
      }
      NotebookCellArrayChange2.create = create;
    })(exports.NotebookCellArrayChange || (exports.NotebookCellArrayChange = {}));
    (function(DidChangeNotebookDocumentNotification2) {
      DidChangeNotebookDocumentNotification2.method = "notebookDocument/didChange";
      DidChangeNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidChangeNotebookDocumentNotification2.method);
      DidChangeNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(exports.DidChangeNotebookDocumentNotification || (exports.DidChangeNotebookDocumentNotification = {}));
    (function(DidSaveNotebookDocumentNotification2) {
      DidSaveNotebookDocumentNotification2.method = "notebookDocument/didSave";
      DidSaveNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidSaveNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidSaveNotebookDocumentNotification2.method);
      DidSaveNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(exports.DidSaveNotebookDocumentNotification || (exports.DidSaveNotebookDocumentNotification = {}));
    (function(DidCloseNotebookDocumentNotification2) {
      DidCloseNotebookDocumentNotification2.method = "notebookDocument/didClose";
      DidCloseNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCloseNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidCloseNotebookDocumentNotification2.method);
      DidCloseNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(exports.DidCloseNotebookDocumentNotification || (exports.DidCloseNotebookDocumentNotification = {}));
  }
});
var require_protocol = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/protocol.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceSymbolRequest = exports.CodeActionResolveRequest = exports.CodeActionRequest = exports.DocumentSymbolRequest = exports.DocumentHighlightRequest = exports.ReferencesRequest = exports.DefinitionRequest = exports.SignatureHelpRequest = exports.SignatureHelpTriggerKind = exports.HoverRequest = exports.CompletionResolveRequest = exports.CompletionRequest = exports.CompletionTriggerKind = exports.PublishDiagnosticsNotification = exports.WatchKind = exports.RelativePattern = exports.FileChangeType = exports.DidChangeWatchedFilesNotification = exports.WillSaveTextDocumentWaitUntilRequest = exports.WillSaveTextDocumentNotification = exports.TextDocumentSaveReason = exports.DidSaveTextDocumentNotification = exports.DidCloseTextDocumentNotification = exports.DidChangeTextDocumentNotification = exports.TextDocumentContentChangeEvent = exports.DidOpenTextDocumentNotification = exports.TextDocumentSyncKind = exports.TelemetryEventNotification = exports.LogMessageNotification = exports.ShowMessageRequest = exports.ShowMessageNotification = exports.MessageType = exports.DidChangeConfigurationNotification = exports.ExitNotification = exports.ShutdownRequest = exports.InitializedNotification = exports.InitializeErrorCodes = exports.InitializeRequest = exports.WorkDoneProgressOptions = exports.TextDocumentRegistrationOptions = exports.StaticRegistrationOptions = exports.PositionEncodingKind = exports.FailureHandlingKind = exports.ResourceOperationKind = exports.UnregistrationRequest = exports.RegistrationRequest = exports.DocumentSelector = exports.NotebookCellTextDocumentFilter = exports.NotebookDocumentFilter = exports.TextDocumentFilter = void 0;
    exports.TypeHierarchySubtypesRequest = exports.TypeHierarchyPrepareRequest = exports.MonikerRequest = exports.MonikerKind = exports.UniquenessLevel = exports.WillDeleteFilesRequest = exports.DidDeleteFilesNotification = exports.WillRenameFilesRequest = exports.DidRenameFilesNotification = exports.WillCreateFilesRequest = exports.DidCreateFilesNotification = exports.FileOperationPatternKind = exports.LinkedEditingRangeRequest = exports.ShowDocumentRequest = exports.SemanticTokensRegistrationType = exports.SemanticTokensRefreshRequest = exports.SemanticTokensRangeRequest = exports.SemanticTokensDeltaRequest = exports.SemanticTokensRequest = exports.TokenFormat = exports.CallHierarchyPrepareRequest = exports.CallHierarchyOutgoingCallsRequest = exports.CallHierarchyIncomingCallsRequest = exports.WorkDoneProgressCancelNotification = exports.WorkDoneProgressCreateRequest = exports.WorkDoneProgress = exports.SelectionRangeRequest = exports.DeclarationRequest = exports.FoldingRangeRequest = exports.ColorPresentationRequest = exports.DocumentColorRequest = exports.ConfigurationRequest = exports.DidChangeWorkspaceFoldersNotification = exports.WorkspaceFoldersRequest = exports.TypeDefinitionRequest = exports.ImplementationRequest = exports.ApplyWorkspaceEditRequest = exports.ExecuteCommandRequest = exports.PrepareRenameRequest = exports.RenameRequest = exports.PrepareSupportDefaultBehavior = exports.DocumentOnTypeFormattingRequest = exports.DocumentRangeFormattingRequest = exports.DocumentFormattingRequest = exports.DocumentLinkResolveRequest = exports.DocumentLinkRequest = exports.CodeLensRefreshRequest = exports.CodeLensResolveRequest = exports.CodeLensRequest = exports.WorkspaceSymbolResolveRequest = void 0;
    exports.DidCloseNotebookDocumentNotification = exports.DidSaveNotebookDocumentNotification = exports.DidChangeNotebookDocumentNotification = exports.NotebookCellArrayChange = exports.DidOpenNotebookDocumentNotification = exports.NotebookDocumentSyncRegistrationType = exports.NotebookDocument = exports.NotebookCell = exports.ExecutionSummary = exports.NotebookCellKind = exports.DiagnosticRefreshRequest = exports.WorkspaceDiagnosticRequest = exports.DocumentDiagnosticRequest = exports.DocumentDiagnosticReportKind = exports.DiagnosticServerCancellationData = exports.InlayHintRefreshRequest = exports.InlayHintResolveRequest = exports.InlayHintRequest = exports.InlineValueRefreshRequest = exports.InlineValueRequest = exports.TypeHierarchySupertypesRequest = void 0;
    var messages_1 = require_messages2();
    var vscode_languageserver_types_1 = (init_main(), __toCommonJS(main_exports));
    var Is2 = require_is2();
    var protocol_implementation_1 = require_protocol_implementation();
    Object.defineProperty(exports, "ImplementationRequest", { enumerable: true, get: function() {
      return protocol_implementation_1.ImplementationRequest;
    } });
    var protocol_typeDefinition_1 = require_protocol_typeDefinition();
    Object.defineProperty(exports, "TypeDefinitionRequest", { enumerable: true, get: function() {
      return protocol_typeDefinition_1.TypeDefinitionRequest;
    } });
    var protocol_workspaceFolder_1 = require_protocol_workspaceFolder();
    Object.defineProperty(exports, "WorkspaceFoldersRequest", { enumerable: true, get: function() {
      return protocol_workspaceFolder_1.WorkspaceFoldersRequest;
    } });
    Object.defineProperty(exports, "DidChangeWorkspaceFoldersNotification", { enumerable: true, get: function() {
      return protocol_workspaceFolder_1.DidChangeWorkspaceFoldersNotification;
    } });
    var protocol_configuration_1 = require_protocol_configuration();
    Object.defineProperty(exports, "ConfigurationRequest", { enumerable: true, get: function() {
      return protocol_configuration_1.ConfigurationRequest;
    } });
    var protocol_colorProvider_1 = require_protocol_colorProvider();
    Object.defineProperty(exports, "DocumentColorRequest", { enumerable: true, get: function() {
      return protocol_colorProvider_1.DocumentColorRequest;
    } });
    Object.defineProperty(exports, "ColorPresentationRequest", { enumerable: true, get: function() {
      return protocol_colorProvider_1.ColorPresentationRequest;
    } });
    var protocol_foldingRange_1 = require_protocol_foldingRange();
    Object.defineProperty(exports, "FoldingRangeRequest", { enumerable: true, get: function() {
      return protocol_foldingRange_1.FoldingRangeRequest;
    } });
    var protocol_declaration_1 = require_protocol_declaration();
    Object.defineProperty(exports, "DeclarationRequest", { enumerable: true, get: function() {
      return protocol_declaration_1.DeclarationRequest;
    } });
    var protocol_selectionRange_1 = require_protocol_selectionRange();
    Object.defineProperty(exports, "SelectionRangeRequest", { enumerable: true, get: function() {
      return protocol_selectionRange_1.SelectionRangeRequest;
    } });
    var protocol_progress_1 = require_protocol_progress();
    Object.defineProperty(exports, "WorkDoneProgress", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgress;
    } });
    Object.defineProperty(exports, "WorkDoneProgressCreateRequest", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgressCreateRequest;
    } });
    Object.defineProperty(exports, "WorkDoneProgressCancelNotification", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgressCancelNotification;
    } });
    var protocol_callHierarchy_1 = require_protocol_callHierarchy();
    Object.defineProperty(exports, "CallHierarchyIncomingCallsRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyIncomingCallsRequest;
    } });
    Object.defineProperty(exports, "CallHierarchyOutgoingCallsRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyOutgoingCallsRequest;
    } });
    Object.defineProperty(exports, "CallHierarchyPrepareRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyPrepareRequest;
    } });
    var protocol_semanticTokens_1 = require_protocol_semanticTokens();
    Object.defineProperty(exports, "TokenFormat", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.TokenFormat;
    } });
    Object.defineProperty(exports, "SemanticTokensRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRequest;
    } });
    Object.defineProperty(exports, "SemanticTokensDeltaRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensDeltaRequest;
    } });
    Object.defineProperty(exports, "SemanticTokensRangeRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRangeRequest;
    } });
    Object.defineProperty(exports, "SemanticTokensRefreshRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRefreshRequest;
    } });
    Object.defineProperty(exports, "SemanticTokensRegistrationType", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRegistrationType;
    } });
    var protocol_showDocument_1 = require_protocol_showDocument();
    Object.defineProperty(exports, "ShowDocumentRequest", { enumerable: true, get: function() {
      return protocol_showDocument_1.ShowDocumentRequest;
    } });
    var protocol_linkedEditingRange_1 = require_protocol_linkedEditingRange();
    Object.defineProperty(exports, "LinkedEditingRangeRequest", { enumerable: true, get: function() {
      return protocol_linkedEditingRange_1.LinkedEditingRangeRequest;
    } });
    var protocol_fileOperations_1 = require_protocol_fileOperations();
    Object.defineProperty(exports, "FileOperationPatternKind", { enumerable: true, get: function() {
      return protocol_fileOperations_1.FileOperationPatternKind;
    } });
    Object.defineProperty(exports, "DidCreateFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidCreateFilesNotification;
    } });
    Object.defineProperty(exports, "WillCreateFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillCreateFilesRequest;
    } });
    Object.defineProperty(exports, "DidRenameFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidRenameFilesNotification;
    } });
    Object.defineProperty(exports, "WillRenameFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillRenameFilesRequest;
    } });
    Object.defineProperty(exports, "DidDeleteFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidDeleteFilesNotification;
    } });
    Object.defineProperty(exports, "WillDeleteFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillDeleteFilesRequest;
    } });
    var protocol_moniker_1 = require_protocol_moniker();
    Object.defineProperty(exports, "UniquenessLevel", { enumerable: true, get: function() {
      return protocol_moniker_1.UniquenessLevel;
    } });
    Object.defineProperty(exports, "MonikerKind", { enumerable: true, get: function() {
      return protocol_moniker_1.MonikerKind;
    } });
    Object.defineProperty(exports, "MonikerRequest", { enumerable: true, get: function() {
      return protocol_moniker_1.MonikerRequest;
    } });
    var protocol_typeHierarchy_1 = require_protocol_typeHierarchy();
    Object.defineProperty(exports, "TypeHierarchyPrepareRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchyPrepareRequest;
    } });
    Object.defineProperty(exports, "TypeHierarchySubtypesRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchySubtypesRequest;
    } });
    Object.defineProperty(exports, "TypeHierarchySupertypesRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchySupertypesRequest;
    } });
    var protocol_inlineValue_1 = require_protocol_inlineValue();
    Object.defineProperty(exports, "InlineValueRequest", { enumerable: true, get: function() {
      return protocol_inlineValue_1.InlineValueRequest;
    } });
    Object.defineProperty(exports, "InlineValueRefreshRequest", { enumerable: true, get: function() {
      return protocol_inlineValue_1.InlineValueRefreshRequest;
    } });
    var protocol_inlayHint_1 = require_protocol_inlayHint();
    Object.defineProperty(exports, "InlayHintRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintRequest;
    } });
    Object.defineProperty(exports, "InlayHintResolveRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintResolveRequest;
    } });
    Object.defineProperty(exports, "InlayHintRefreshRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintRefreshRequest;
    } });
    var protocol_diagnostic_1 = require_protocol_diagnostic();
    Object.defineProperty(exports, "DiagnosticServerCancellationData", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DiagnosticServerCancellationData;
    } });
    Object.defineProperty(exports, "DocumentDiagnosticReportKind", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DocumentDiagnosticReportKind;
    } });
    Object.defineProperty(exports, "DocumentDiagnosticRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DocumentDiagnosticRequest;
    } });
    Object.defineProperty(exports, "WorkspaceDiagnosticRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.WorkspaceDiagnosticRequest;
    } });
    Object.defineProperty(exports, "DiagnosticRefreshRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DiagnosticRefreshRequest;
    } });
    var protocol_notebook_1 = require_protocol_notebook();
    Object.defineProperty(exports, "NotebookCellKind", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCellKind;
    } });
    Object.defineProperty(exports, "ExecutionSummary", { enumerable: true, get: function() {
      return protocol_notebook_1.ExecutionSummary;
    } });
    Object.defineProperty(exports, "NotebookCell", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCell;
    } });
    Object.defineProperty(exports, "NotebookDocument", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookDocument;
    } });
    Object.defineProperty(exports, "NotebookDocumentSyncRegistrationType", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookDocumentSyncRegistrationType;
    } });
    Object.defineProperty(exports, "DidOpenNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidOpenNotebookDocumentNotification;
    } });
    Object.defineProperty(exports, "NotebookCellArrayChange", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCellArrayChange;
    } });
    Object.defineProperty(exports, "DidChangeNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidChangeNotebookDocumentNotification;
    } });
    Object.defineProperty(exports, "DidSaveNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidSaveNotebookDocumentNotification;
    } });
    Object.defineProperty(exports, "DidCloseNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidCloseNotebookDocumentNotification;
    } });
    var TextDocumentFilter;
    (function(TextDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is2.string(candidate.language) || Is2.string(candidate.scheme) || Is2.string(candidate.pattern);
      }
      TextDocumentFilter2.is = is;
    })(TextDocumentFilter = exports.TextDocumentFilter || (exports.TextDocumentFilter = {}));
    var NotebookDocumentFilter;
    (function(NotebookDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is2.objectLiteral(candidate) && (Is2.string(candidate.notebookType) || Is2.string(candidate.scheme) || Is2.string(candidate.pattern));
      }
      NotebookDocumentFilter2.is = is;
    })(NotebookDocumentFilter = exports.NotebookDocumentFilter || (exports.NotebookDocumentFilter = {}));
    var NotebookCellTextDocumentFilter;
    (function(NotebookCellTextDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is2.objectLiteral(candidate) && (Is2.string(candidate.notebook) || NotebookDocumentFilter.is(candidate.notebook)) && (candidate.language === void 0 || Is2.string(candidate.language));
      }
      NotebookCellTextDocumentFilter2.is = is;
    })(NotebookCellTextDocumentFilter = exports.NotebookCellTextDocumentFilter || (exports.NotebookCellTextDocumentFilter = {}));
    var DocumentSelector;
    (function(DocumentSelector2) {
      function is(value) {
        if (!Array.isArray(value)) {
          return false;
        }
        for (let elem of value) {
          if (!Is2.string(elem) && !TextDocumentFilter.is(elem) && !NotebookCellTextDocumentFilter.is(elem)) {
            return false;
          }
        }
        return true;
      }
      DocumentSelector2.is = is;
    })(DocumentSelector = exports.DocumentSelector || (exports.DocumentSelector = {}));
    (function(RegistrationRequest2) {
      RegistrationRequest2.method = "client/registerCapability";
      RegistrationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      RegistrationRequest2.type = new messages_1.ProtocolRequestType(RegistrationRequest2.method);
    })(exports.RegistrationRequest || (exports.RegistrationRequest = {}));
    (function(UnregistrationRequest2) {
      UnregistrationRequest2.method = "client/unregisterCapability";
      UnregistrationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      UnregistrationRequest2.type = new messages_1.ProtocolRequestType(UnregistrationRequest2.method);
    })(exports.UnregistrationRequest || (exports.UnregistrationRequest = {}));
    (function(ResourceOperationKind2) {
      ResourceOperationKind2.Create = "create";
      ResourceOperationKind2.Rename = "rename";
      ResourceOperationKind2.Delete = "delete";
    })(exports.ResourceOperationKind || (exports.ResourceOperationKind = {}));
    (function(FailureHandlingKind2) {
      FailureHandlingKind2.Abort = "abort";
      FailureHandlingKind2.Transactional = "transactional";
      FailureHandlingKind2.TextOnlyTransactional = "textOnlyTransactional";
      FailureHandlingKind2.Undo = "undo";
    })(exports.FailureHandlingKind || (exports.FailureHandlingKind = {}));
    (function(PositionEncodingKind2) {
      PositionEncodingKind2.UTF8 = "utf-8";
      PositionEncodingKind2.UTF16 = "utf-16";
      PositionEncodingKind2.UTF32 = "utf-32";
    })(exports.PositionEncodingKind || (exports.PositionEncodingKind = {}));
    (function(StaticRegistrationOptions2) {
      function hasId(value) {
        const candidate = value;
        return candidate && Is2.string(candidate.id) && candidate.id.length > 0;
      }
      StaticRegistrationOptions2.hasId = hasId;
    })(exports.StaticRegistrationOptions || (exports.StaticRegistrationOptions = {}));
    (function(TextDocumentRegistrationOptions2) {
      function is(value) {
        const candidate = value;
        return candidate && (candidate.documentSelector === null || DocumentSelector.is(candidate.documentSelector));
      }
      TextDocumentRegistrationOptions2.is = is;
    })(exports.TextDocumentRegistrationOptions || (exports.TextDocumentRegistrationOptions = {}));
    (function(WorkDoneProgressOptions2) {
      function is(value) {
        const candidate = value;
        return Is2.objectLiteral(candidate) && (candidate.workDoneProgress === void 0 || Is2.boolean(candidate.workDoneProgress));
      }
      WorkDoneProgressOptions2.is = is;
      function hasWorkDoneProgress(value) {
        const candidate = value;
        return candidate && Is2.boolean(candidate.workDoneProgress);
      }
      WorkDoneProgressOptions2.hasWorkDoneProgress = hasWorkDoneProgress;
    })(exports.WorkDoneProgressOptions || (exports.WorkDoneProgressOptions = {}));
    (function(InitializeRequest2) {
      InitializeRequest2.method = "initialize";
      InitializeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InitializeRequest2.type = new messages_1.ProtocolRequestType(InitializeRequest2.method);
    })(exports.InitializeRequest || (exports.InitializeRequest = {}));
    (function(InitializeErrorCodes2) {
      InitializeErrorCodes2.unknownProtocolVersion = 1;
    })(exports.InitializeErrorCodes || (exports.InitializeErrorCodes = {}));
    (function(InitializedNotification2) {
      InitializedNotification2.method = "initialized";
      InitializedNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      InitializedNotification2.type = new messages_1.ProtocolNotificationType(InitializedNotification2.method);
    })(exports.InitializedNotification || (exports.InitializedNotification = {}));
    (function(ShutdownRequest2) {
      ShutdownRequest2.method = "shutdown";
      ShutdownRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ShutdownRequest2.type = new messages_1.ProtocolRequestType0(ShutdownRequest2.method);
    })(exports.ShutdownRequest || (exports.ShutdownRequest = {}));
    (function(ExitNotification2) {
      ExitNotification2.method = "exit";
      ExitNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      ExitNotification2.type = new messages_1.ProtocolNotificationType0(ExitNotification2.method);
    })(exports.ExitNotification || (exports.ExitNotification = {}));
    (function(DidChangeConfigurationNotification2) {
      DidChangeConfigurationNotification2.method = "workspace/didChangeConfiguration";
      DidChangeConfigurationNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeConfigurationNotification2.type = new messages_1.ProtocolNotificationType(DidChangeConfigurationNotification2.method);
    })(exports.DidChangeConfigurationNotification || (exports.DidChangeConfigurationNotification = {}));
    (function(MessageType2) {
      MessageType2.Error = 1;
      MessageType2.Warning = 2;
      MessageType2.Info = 3;
      MessageType2.Log = 4;
    })(exports.MessageType || (exports.MessageType = {}));
    (function(ShowMessageNotification2) {
      ShowMessageNotification2.method = "window/showMessage";
      ShowMessageNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowMessageNotification2.type = new messages_1.ProtocolNotificationType(ShowMessageNotification2.method);
    })(exports.ShowMessageNotification || (exports.ShowMessageNotification = {}));
    (function(ShowMessageRequest2) {
      ShowMessageRequest2.method = "window/showMessageRequest";
      ShowMessageRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowMessageRequest2.type = new messages_1.ProtocolRequestType(ShowMessageRequest2.method);
    })(exports.ShowMessageRequest || (exports.ShowMessageRequest = {}));
    (function(LogMessageNotification2) {
      LogMessageNotification2.method = "window/logMessage";
      LogMessageNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      LogMessageNotification2.type = new messages_1.ProtocolNotificationType(LogMessageNotification2.method);
    })(exports.LogMessageNotification || (exports.LogMessageNotification = {}));
    (function(TelemetryEventNotification2) {
      TelemetryEventNotification2.method = "telemetry/event";
      TelemetryEventNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      TelemetryEventNotification2.type = new messages_1.ProtocolNotificationType(TelemetryEventNotification2.method);
    })(exports.TelemetryEventNotification || (exports.TelemetryEventNotification = {}));
    (function(TextDocumentSyncKind2) {
      TextDocumentSyncKind2.None = 0;
      TextDocumentSyncKind2.Full = 1;
      TextDocumentSyncKind2.Incremental = 2;
    })(exports.TextDocumentSyncKind || (exports.TextDocumentSyncKind = {}));
    (function(DidOpenTextDocumentNotification2) {
      DidOpenTextDocumentNotification2.method = "textDocument/didOpen";
      DidOpenTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidOpenTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidOpenTextDocumentNotification2.method);
    })(exports.DidOpenTextDocumentNotification || (exports.DidOpenTextDocumentNotification = {}));
    (function(TextDocumentContentChangeEvent2) {
      function isIncremental(event) {
        let candidate = event;
        return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range !== void 0 && (candidate.rangeLength === void 0 || typeof candidate.rangeLength === "number");
      }
      TextDocumentContentChangeEvent2.isIncremental = isIncremental;
      function isFull(event) {
        let candidate = event;
        return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range === void 0 && candidate.rangeLength === void 0;
      }
      TextDocumentContentChangeEvent2.isFull = isFull;
    })(exports.TextDocumentContentChangeEvent || (exports.TextDocumentContentChangeEvent = {}));
    (function(DidChangeTextDocumentNotification2) {
      DidChangeTextDocumentNotification2.method = "textDocument/didChange";
      DidChangeTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidChangeTextDocumentNotification2.method);
    })(exports.DidChangeTextDocumentNotification || (exports.DidChangeTextDocumentNotification = {}));
    (function(DidCloseTextDocumentNotification2) {
      DidCloseTextDocumentNotification2.method = "textDocument/didClose";
      DidCloseTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCloseTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidCloseTextDocumentNotification2.method);
    })(exports.DidCloseTextDocumentNotification || (exports.DidCloseTextDocumentNotification = {}));
    (function(DidSaveTextDocumentNotification2) {
      DidSaveTextDocumentNotification2.method = "textDocument/didSave";
      DidSaveTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidSaveTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidSaveTextDocumentNotification2.method);
    })(exports.DidSaveTextDocumentNotification || (exports.DidSaveTextDocumentNotification = {}));
    (function(TextDocumentSaveReason2) {
      TextDocumentSaveReason2.Manual = 1;
      TextDocumentSaveReason2.AfterDelay = 2;
      TextDocumentSaveReason2.FocusOut = 3;
    })(exports.TextDocumentSaveReason || (exports.TextDocumentSaveReason = {}));
    (function(WillSaveTextDocumentNotification2) {
      WillSaveTextDocumentNotification2.method = "textDocument/willSave";
      WillSaveTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillSaveTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(WillSaveTextDocumentNotification2.method);
    })(exports.WillSaveTextDocumentNotification || (exports.WillSaveTextDocumentNotification = {}));
    (function(WillSaveTextDocumentWaitUntilRequest2) {
      WillSaveTextDocumentWaitUntilRequest2.method = "textDocument/willSaveWaitUntil";
      WillSaveTextDocumentWaitUntilRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillSaveTextDocumentWaitUntilRequest2.type = new messages_1.ProtocolRequestType(WillSaveTextDocumentWaitUntilRequest2.method);
    })(exports.WillSaveTextDocumentWaitUntilRequest || (exports.WillSaveTextDocumentWaitUntilRequest = {}));
    (function(DidChangeWatchedFilesNotification2) {
      DidChangeWatchedFilesNotification2.method = "workspace/didChangeWatchedFiles";
      DidChangeWatchedFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeWatchedFilesNotification2.type = new messages_1.ProtocolNotificationType(DidChangeWatchedFilesNotification2.method);
    })(exports.DidChangeWatchedFilesNotification || (exports.DidChangeWatchedFilesNotification = {}));
    (function(FileChangeType2) {
      FileChangeType2.Created = 1;
      FileChangeType2.Changed = 2;
      FileChangeType2.Deleted = 3;
    })(exports.FileChangeType || (exports.FileChangeType = {}));
    (function(RelativePattern2) {
      function is(value) {
        const candidate = value;
        return Is2.objectLiteral(candidate) && (vscode_languageserver_types_1.URI.is(candidate.baseUri) || vscode_languageserver_types_1.WorkspaceFolder.is(candidate.baseUri)) && Is2.string(candidate.pattern);
      }
      RelativePattern2.is = is;
    })(exports.RelativePattern || (exports.RelativePattern = {}));
    (function(WatchKind2) {
      WatchKind2.Create = 1;
      WatchKind2.Change = 2;
      WatchKind2.Delete = 4;
    })(exports.WatchKind || (exports.WatchKind = {}));
    (function(PublishDiagnosticsNotification2) {
      PublishDiagnosticsNotification2.method = "textDocument/publishDiagnostics";
      PublishDiagnosticsNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      PublishDiagnosticsNotification2.type = new messages_1.ProtocolNotificationType(PublishDiagnosticsNotification2.method);
    })(exports.PublishDiagnosticsNotification || (exports.PublishDiagnosticsNotification = {}));
    (function(CompletionTriggerKind2) {
      CompletionTriggerKind2.Invoked = 1;
      CompletionTriggerKind2.TriggerCharacter = 2;
      CompletionTriggerKind2.TriggerForIncompleteCompletions = 3;
    })(exports.CompletionTriggerKind || (exports.CompletionTriggerKind = {}));
    (function(CompletionRequest2) {
      CompletionRequest2.method = "textDocument/completion";
      CompletionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CompletionRequest2.type = new messages_1.ProtocolRequestType(CompletionRequest2.method);
    })(exports.CompletionRequest || (exports.CompletionRequest = {}));
    (function(CompletionResolveRequest2) {
      CompletionResolveRequest2.method = "completionItem/resolve";
      CompletionResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CompletionResolveRequest2.type = new messages_1.ProtocolRequestType(CompletionResolveRequest2.method);
    })(exports.CompletionResolveRequest || (exports.CompletionResolveRequest = {}));
    (function(HoverRequest2) {
      HoverRequest2.method = "textDocument/hover";
      HoverRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      HoverRequest2.type = new messages_1.ProtocolRequestType(HoverRequest2.method);
    })(exports.HoverRequest || (exports.HoverRequest = {}));
    (function(SignatureHelpTriggerKind2) {
      SignatureHelpTriggerKind2.Invoked = 1;
      SignatureHelpTriggerKind2.TriggerCharacter = 2;
      SignatureHelpTriggerKind2.ContentChange = 3;
    })(exports.SignatureHelpTriggerKind || (exports.SignatureHelpTriggerKind = {}));
    (function(SignatureHelpRequest2) {
      SignatureHelpRequest2.method = "textDocument/signatureHelp";
      SignatureHelpRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SignatureHelpRequest2.type = new messages_1.ProtocolRequestType(SignatureHelpRequest2.method);
    })(exports.SignatureHelpRequest || (exports.SignatureHelpRequest = {}));
    (function(DefinitionRequest2) {
      DefinitionRequest2.method = "textDocument/definition";
      DefinitionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DefinitionRequest2.type = new messages_1.ProtocolRequestType(DefinitionRequest2.method);
    })(exports.DefinitionRequest || (exports.DefinitionRequest = {}));
    (function(ReferencesRequest2) {
      ReferencesRequest2.method = "textDocument/references";
      ReferencesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ReferencesRequest2.type = new messages_1.ProtocolRequestType(ReferencesRequest2.method);
    })(exports.ReferencesRequest || (exports.ReferencesRequest = {}));
    (function(DocumentHighlightRequest2) {
      DocumentHighlightRequest2.method = "textDocument/documentHighlight";
      DocumentHighlightRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentHighlightRequest2.type = new messages_1.ProtocolRequestType(DocumentHighlightRequest2.method);
    })(exports.DocumentHighlightRequest || (exports.DocumentHighlightRequest = {}));
    (function(DocumentSymbolRequest2) {
      DocumentSymbolRequest2.method = "textDocument/documentSymbol";
      DocumentSymbolRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentSymbolRequest2.type = new messages_1.ProtocolRequestType(DocumentSymbolRequest2.method);
    })(exports.DocumentSymbolRequest || (exports.DocumentSymbolRequest = {}));
    (function(CodeActionRequest2) {
      CodeActionRequest2.method = "textDocument/codeAction";
      CodeActionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeActionRequest2.type = new messages_1.ProtocolRequestType(CodeActionRequest2.method);
    })(exports.CodeActionRequest || (exports.CodeActionRequest = {}));
    (function(CodeActionResolveRequest2) {
      CodeActionResolveRequest2.method = "codeAction/resolve";
      CodeActionResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeActionResolveRequest2.type = new messages_1.ProtocolRequestType(CodeActionResolveRequest2.method);
    })(exports.CodeActionResolveRequest || (exports.CodeActionResolveRequest = {}));
    (function(WorkspaceSymbolRequest2) {
      WorkspaceSymbolRequest2.method = "workspace/symbol";
      WorkspaceSymbolRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceSymbolRequest2.type = new messages_1.ProtocolRequestType(WorkspaceSymbolRequest2.method);
    })(exports.WorkspaceSymbolRequest || (exports.WorkspaceSymbolRequest = {}));
    (function(WorkspaceSymbolResolveRequest2) {
      WorkspaceSymbolResolveRequest2.method = "workspaceSymbol/resolve";
      WorkspaceSymbolResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceSymbolResolveRequest2.type = new messages_1.ProtocolRequestType(WorkspaceSymbolResolveRequest2.method);
    })(exports.WorkspaceSymbolResolveRequest || (exports.WorkspaceSymbolResolveRequest = {}));
    (function(CodeLensRequest2) {
      CodeLensRequest2.method = "textDocument/codeLens";
      CodeLensRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeLensRequest2.type = new messages_1.ProtocolRequestType(CodeLensRequest2.method);
    })(exports.CodeLensRequest || (exports.CodeLensRequest = {}));
    (function(CodeLensResolveRequest2) {
      CodeLensResolveRequest2.method = "codeLens/resolve";
      CodeLensResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeLensResolveRequest2.type = new messages_1.ProtocolRequestType(CodeLensResolveRequest2.method);
    })(exports.CodeLensResolveRequest || (exports.CodeLensResolveRequest = {}));
    (function(CodeLensRefreshRequest2) {
      CodeLensRefreshRequest2.method = `workspace/codeLens/refresh`;
      CodeLensRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      CodeLensRefreshRequest2.type = new messages_1.ProtocolRequestType0(CodeLensRefreshRequest2.method);
    })(exports.CodeLensRefreshRequest || (exports.CodeLensRefreshRequest = {}));
    (function(DocumentLinkRequest2) {
      DocumentLinkRequest2.method = "textDocument/documentLink";
      DocumentLinkRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentLinkRequest2.type = new messages_1.ProtocolRequestType(DocumentLinkRequest2.method);
    })(exports.DocumentLinkRequest || (exports.DocumentLinkRequest = {}));
    (function(DocumentLinkResolveRequest2) {
      DocumentLinkResolveRequest2.method = "documentLink/resolve";
      DocumentLinkResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentLinkResolveRequest2.type = new messages_1.ProtocolRequestType(DocumentLinkResolveRequest2.method);
    })(exports.DocumentLinkResolveRequest || (exports.DocumentLinkResolveRequest = {}));
    (function(DocumentFormattingRequest2) {
      DocumentFormattingRequest2.method = "textDocument/formatting";
      DocumentFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentFormattingRequest2.method);
    })(exports.DocumentFormattingRequest || (exports.DocumentFormattingRequest = {}));
    (function(DocumentRangeFormattingRequest2) {
      DocumentRangeFormattingRequest2.method = "textDocument/rangeFormatting";
      DocumentRangeFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentRangeFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentRangeFormattingRequest2.method);
    })(exports.DocumentRangeFormattingRequest || (exports.DocumentRangeFormattingRequest = {}));
    (function(DocumentOnTypeFormattingRequest2) {
      DocumentOnTypeFormattingRequest2.method = "textDocument/onTypeFormatting";
      DocumentOnTypeFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentOnTypeFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentOnTypeFormattingRequest2.method);
    })(exports.DocumentOnTypeFormattingRequest || (exports.DocumentOnTypeFormattingRequest = {}));
    (function(PrepareSupportDefaultBehavior2) {
      PrepareSupportDefaultBehavior2.Identifier = 1;
    })(exports.PrepareSupportDefaultBehavior || (exports.PrepareSupportDefaultBehavior = {}));
    (function(RenameRequest2) {
      RenameRequest2.method = "textDocument/rename";
      RenameRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      RenameRequest2.type = new messages_1.ProtocolRequestType(RenameRequest2.method);
    })(exports.RenameRequest || (exports.RenameRequest = {}));
    (function(PrepareRenameRequest2) {
      PrepareRenameRequest2.method = "textDocument/prepareRename";
      PrepareRenameRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      PrepareRenameRequest2.type = new messages_1.ProtocolRequestType(PrepareRenameRequest2.method);
    })(exports.PrepareRenameRequest || (exports.PrepareRenameRequest = {}));
    (function(ExecuteCommandRequest2) {
      ExecuteCommandRequest2.method = "workspace/executeCommand";
      ExecuteCommandRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ExecuteCommandRequest2.type = new messages_1.ProtocolRequestType(ExecuteCommandRequest2.method);
    })(exports.ExecuteCommandRequest || (exports.ExecuteCommandRequest = {}));
    (function(ApplyWorkspaceEditRequest2) {
      ApplyWorkspaceEditRequest2.method = "workspace/applyEdit";
      ApplyWorkspaceEditRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ApplyWorkspaceEditRequest2.type = new messages_1.ProtocolRequestType("workspace/applyEdit");
    })(exports.ApplyWorkspaceEditRequest || (exports.ApplyWorkspaceEditRequest = {}));
  }
});
var require_connection2 = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/connection.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createProtocolConnection = void 0;
    var vscode_jsonrpc_1 = require_main();
    function createProtocolConnection(input, output, logger, options) {
      if (vscode_jsonrpc_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
      }
      return (0, vscode_jsonrpc_1.createMessageConnection)(input, output, logger, options);
    }
    exports.createProtocolConnection = createProtocolConnection;
  }
});
var require_api2 = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/common/api.js"(exports) {
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LSPErrorCodes = exports.createProtocolConnection = void 0;
    __exportStar(require_main(), exports);
    __exportStar((init_main(), __toCommonJS(main_exports)), exports);
    __exportStar(require_messages2(), exports);
    __exportStar(require_protocol(), exports);
    var connection_1 = require_connection2();
    Object.defineProperty(exports, "createProtocolConnection", { enumerable: true, get: function() {
      return connection_1.createProtocolConnection;
    } });
    (function(LSPErrorCodes2) {
      LSPErrorCodes2.lspReservedErrorRangeStart = -32899;
      LSPErrorCodes2.RequestFailed = -32803;
      LSPErrorCodes2.ServerCancelled = -32802;
      LSPErrorCodes2.ContentModified = -32801;
      LSPErrorCodes2.RequestCancelled = -32800;
      LSPErrorCodes2.lspReservedErrorRangeEnd = -32800;
    })(exports.LSPErrorCodes || (exports.LSPErrorCodes = {}));
  }
});
var require_main2 = __commonJS({
  "node_modules/.pnpm/vscode-languageserver-protocol@3.17.2/node_modules/vscode-languageserver-protocol/lib/browser/main.js"(exports) {
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createProtocolConnection = void 0;
    var browser_1 = require_browser();
    __exportStar(require_browser(), exports);
    __exportStar(require_api2(), exports);
    function createProtocolConnection(reader, writer, logger, options) {
      return (0, browser_1.createMessageConnection)(reader, writer, logger, options);
    }
    exports.createProtocolConnection = createProtocolConnection;
  }
});
var vscode_languageserver_protocol_default = require_main2();
const vscode$1 = vscode_languageserver_protocol_default;
function asCompletionList(list) {
  return {
    incomplete: list.isIncomplete,
    suggestions: list.items.map(asCompletionItem)
  };
}
function asCompletionItemKind(kind) {
  switch (kind) {
    case vscode$1.CompletionItemKind.Method:
      return languages.CompletionItemKind.Method;
    case vscode$1.CompletionItemKind.Function:
      return languages.CompletionItemKind.Function;
    case vscode$1.CompletionItemKind.Constructor:
      return languages.CompletionItemKind.Constructor;
    case vscode$1.CompletionItemKind.Field:
      return languages.CompletionItemKind.Field;
    case vscode$1.CompletionItemKind.Variable:
      return languages.CompletionItemKind.Variable;
    case vscode$1.CompletionItemKind.Class:
      return languages.CompletionItemKind.Class;
    case vscode$1.CompletionItemKind.Interface:
      return languages.CompletionItemKind.Interface;
    case vscode$1.CompletionItemKind.Module:
      return languages.CompletionItemKind.Module;
    case vscode$1.CompletionItemKind.Property:
      return languages.CompletionItemKind.Property;
    case vscode$1.CompletionItemKind.Unit:
      return languages.CompletionItemKind.Unit;
    case vscode$1.CompletionItemKind.Value:
      return languages.CompletionItemKind.Value;
    case vscode$1.CompletionItemKind.Enum:
      return languages.CompletionItemKind.Enum;
    case vscode$1.CompletionItemKind.Keyword:
      return languages.CompletionItemKind.Keyword;
    case vscode$1.CompletionItemKind.Snippet:
      return languages.CompletionItemKind.Snippet;
    case vscode$1.CompletionItemKind.Text:
      return languages.CompletionItemKind.Text;
    case vscode$1.CompletionItemKind.Color:
      return languages.CompletionItemKind.Color;
    case vscode$1.CompletionItemKind.File:
      return languages.CompletionItemKind.File;
    case vscode$1.CompletionItemKind.Reference:
      return languages.CompletionItemKind.Reference;
    case vscode$1.CompletionItemKind.Folder:
      return languages.CompletionItemKind.Folder;
    case vscode$1.CompletionItemKind.EnumMember:
      return languages.CompletionItemKind.EnumMember;
    case vscode$1.CompletionItemKind.Constant:
      return languages.CompletionItemKind.Constant;
    case vscode$1.CompletionItemKind.Struct:
      return languages.CompletionItemKind.Struct;
    case vscode$1.CompletionItemKind.Event:
      return languages.CompletionItemKind.Event;
    case vscode$1.CompletionItemKind.Operator:
      return languages.CompletionItemKind.Operator;
    case vscode$1.CompletionItemKind.TypeParameter:
      return languages.CompletionItemKind.TypeParameter;
    default:
      return languages.CompletionItemKind.Text;
  }
}
function asCompletionItem(item) {
  var _a, _b, _c, _d;
  return {
    label: item.label,
    kind: asCompletionItemKind(item.kind),
    tags: item.tags,
    detail: item.detail,
    documentation: item.documentation,
    sortText: item.sortText,
    filterText: item.filterText,
    preselect: item.preselect,
    insertText: (_c = (_b = (_a = item.textEdit) == null ? void 0 : _a.newText) != null ? _b : item.insertText) != null ? _c : item.label,
    range: asCompletionItemRange(item.textEdit),
    commitCharacters: item.commitCharacters,
    additionalTextEdits: (_d = item.additionalTextEdits) == null ? void 0 : _d.map(asTextEdit),
    command: item.command ? asCommand(item.command) : void 0
  };
}
function asCommand(command) {
  return {
    id: command.command,
    title: command.title,
    arguments: command.arguments
  };
}
function asTextEdit(edit) {
  return {
    range: asRange$1(edit.range),
    text: edit.newText
  };
}
function asCompletionItemRange(textEdit) {
  if (textEdit) {
    if (vscode$1.InsertReplaceEdit.is(textEdit)) {
      const result = {
        insert: asRange$1(textEdit.insert),
        replace: asRange$1(textEdit.replace)
      };
      return result;
    }
    return asRange$1(textEdit.range);
  }
  return void 0;
}
function asRange$1(range) {
  return {
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1
  };
}
function asHover(hover) {
  return {
    contents: asMarkdownString(hover.contents),
    range: hover.range ? asRange$1(hover.range) : void 0
  };
}
function asMarkdownString(markdownString) {
  if (typeof markdownString === "string") {
    return [{ value: markdownString }];
  } else if (Array.isArray(markdownString)) {
    return markdownString.map(asMarkdownString).flat();
  } else {
    return [markdownString];
  }
}
function asLocation(definition) {
  if (vscode$1.LocationLink.is(definition)) {
    return {
      uri: asUri(definition.targetUri),
      range: asRange$1(definition.targetSelectionRange)
    };
  } else {
    return {
      uri: asUri(definition.uri),
      range: asRange$1(definition.range)
    };
  }
}
function asUri(uri) {
  return Uri.parse(uri);
}
function asSignatureHelp(signatureHelp) {
  var _a, _b;
  return {
    signatures: signatureHelp.signatures.map(asSignatureInformation),
    activeSignature: (_a = signatureHelp.activeSignature) != null ? _a : 0,
    activeParameter: (_b = signatureHelp.activeParameter) != null ? _b : 0
  };
}
function asSignatureInformation(signatureInformation) {
  return {
    label: signatureInformation.label,
    documentation: signatureInformation.documentation,
    parameters: signatureInformation.parameters ? signatureInformation.parameters.map(asParameterInformation) : [],
    activeParameter: signatureInformation.activeParameter
  };
}
function asParameterInformation(parameterInformation) {
  return {
    label: parameterInformation.label,
    documentation: parameterInformation.documentation
  };
}
function asMarkerData(diagnostic) {
  var _a, _b, _c;
  return __spreadProps(__spreadValues({
    code: (_a = diagnostic.code) == null ? void 0 : _a.toString(),
    severity: asMarkerSeverity(diagnostic.severity),
    message: diagnostic.message,
    source: diagnostic.source
  }, asRange$1(diagnostic.range)), {
    relatedInformation: (_b = diagnostic.relatedInformation) == null ? void 0 : _b.map(asRelatedInformation),
    tags: (_c = diagnostic.tags) == null ? void 0 : _c.map(asMarkerTag)
  });
}
function asMarkerTag(tag) {
  switch (tag) {
    case vscode$1.DiagnosticTag.Unnecessary:
      return MarkerTag.Unnecessary;
    case vscode$1.DiagnosticTag.Deprecated:
      return MarkerTag.Deprecated;
  }
}
function asRelatedInformation(relatedInformation) {
  return __spreadValues({
    resource: asUri(relatedInformation.location.uri),
    message: relatedInformation.message
  }, asRange$1(relatedInformation.location.range));
}
function asMarkerSeverity(severity) {
  switch (severity) {
    case vscode$1.DiagnosticSeverity.Error:
      return MarkerSeverity2.Error;
    case vscode$1.DiagnosticSeverity.Warning:
      return MarkerSeverity2.Warning;
    case vscode$1.DiagnosticSeverity.Information:
      return MarkerSeverity2.Info;
    case vscode$1.DiagnosticSeverity.Hint:
      return MarkerSeverity2.Hint;
    default:
      return MarkerSeverity2.Info;
  }
}
function asWorkspaceEdit(workspaceEdit) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const result = {
    edits: []
  };
  if (workspaceEdit.changes) {
    for (const uri in workspaceEdit.changes) {
      const edits = workspaceEdit.changes[uri];
      for (const edit of edits) {
        result.edits.push({
          resource: asUri(uri),
          edit: asTextEdit(edit)
        });
      }
    }
  }
  if (workspaceEdit.documentChanges) {
    for (const documentChange of workspaceEdit.documentChanges) {
      if (vscode$1.TextDocumentEdit.is(documentChange)) {
        for (const edit of documentChange.edits) {
          result.edits.push({
            resource: asUri(documentChange.textDocument.uri),
            edit: asTextEdit(edit)
          });
        }
      } else if (vscode$1.CreateFile.is(documentChange)) {
        result.edits.push({
          newUri: asUri(documentChange.uri),
          options: {
            overwrite: (_b = (_a = documentChange.options) == null ? void 0 : _a.overwrite) != null ? _b : false,
            ignoreIfExists: (_d = (_c = documentChange.options) == null ? void 0 : _c.ignoreIfExists) != null ? _d : false
          }
        });
      } else if (vscode$1.RenameFile.is(documentChange)) {
        result.edits.push({
          oldUri: asUri(documentChange.oldUri),
          newUri: asUri(documentChange.newUri),
          options: {
            overwrite: (_f = (_e = documentChange.options) == null ? void 0 : _e.overwrite) != null ? _f : false,
            ignoreIfExists: (_h = (_g = documentChange.options) == null ? void 0 : _g.ignoreIfExists) != null ? _h : false
          }
        });
      } else if (vscode$1.DeleteFile.is(documentChange)) {
        result.edits.push({
          oldUri: asUri(documentChange.uri),
          options: {
            recursive: (_j = (_i = documentChange.options) == null ? void 0 : _i.recursive) != null ? _j : false,
            ignoreIfNotExists: (_l = (_k = documentChange.options) == null ? void 0 : _k.ignoreIfNotExists) != null ? _l : false
          }
        });
      }
    }
  }
  return result;
}
function asDocumentSymbol(symbol) {
  var _a, _b;
  return {
    name: symbol.name,
    detail: "",
    kind: asSymbolKind(symbol.kind),
    tags: (_b = (_a = symbol.tags) == null ? void 0 : _a.map(asSymbolTag)) != null ? _b : [],
    containerName: symbol.containerName,
    range: asRange$1(symbol.location.range),
    selectionRange: asRange$1(symbol.location.range),
    children: []
  };
}
function asSymbolTag(tag) {
  switch (tag) {
    case vscode$1.SymbolTag.Deprecated:
      return languages.SymbolTag.Deprecated;
  }
}
function asSymbolKind(kind) {
  switch (kind) {
    case vscode$1.SymbolKind.File:
      return languages.SymbolKind.File;
    case vscode$1.SymbolKind.Module:
      return languages.SymbolKind.Module;
    case vscode$1.SymbolKind.Namespace:
      return languages.SymbolKind.Namespace;
    case vscode$1.SymbolKind.Package:
      return languages.SymbolKind.Package;
    case vscode$1.SymbolKind.Class:
      return languages.SymbolKind.Class;
    case vscode$1.SymbolKind.Method:
      return languages.SymbolKind.Method;
    case vscode$1.SymbolKind.Property:
      return languages.SymbolKind.Property;
    case vscode$1.SymbolKind.Field:
      return languages.SymbolKind.Field;
    case vscode$1.SymbolKind.Constructor:
      return languages.SymbolKind.Constructor;
    case vscode$1.SymbolKind.Enum:
      return languages.SymbolKind.Enum;
    case vscode$1.SymbolKind.Interface:
      return languages.SymbolKind.Interface;
    case vscode$1.SymbolKind.Function:
      return languages.SymbolKind.Function;
    case vscode$1.SymbolKind.Variable:
      return languages.SymbolKind.Variable;
    case vscode$1.SymbolKind.Constant:
      return languages.SymbolKind.Constant;
    case vscode$1.SymbolKind.String:
      return languages.SymbolKind.String;
    case vscode$1.SymbolKind.Number:
      return languages.SymbolKind.Number;
    case vscode$1.SymbolKind.Boolean:
      return languages.SymbolKind.Boolean;
    case vscode$1.SymbolKind.Array:
      return languages.SymbolKind.Array;
    case vscode$1.SymbolKind.Object:
      return languages.SymbolKind.Object;
    case vscode$1.SymbolKind.Key:
      return languages.SymbolKind.Key;
    case vscode$1.SymbolKind.Null:
      return languages.SymbolKind.Null;
    case vscode$1.SymbolKind.EnumMember:
      return languages.SymbolKind.EnumMember;
    case vscode$1.SymbolKind.Struct:
      return languages.SymbolKind.Struct;
    case vscode$1.SymbolKind.Event:
      return languages.SymbolKind.Event;
    case vscode$1.SymbolKind.Operator:
      return languages.SymbolKind.Operator;
    case vscode$1.SymbolKind.TypeParameter:
      return languages.SymbolKind.TypeParameter;
    default:
      return languages.SymbolKind.File;
  }
}
function asDocumentHighlight(highlight) {
  return {
    range: asRange$1(highlight.range),
    kind: asDocumentHighlightKind(highlight.kind)
  };
}
function asDocumentHighlightKind(kind) {
  switch (kind) {
    case vscode$1.DocumentHighlightKind.Text:
      return languages.DocumentHighlightKind.Text;
    case vscode$1.DocumentHighlightKind.Read:
      return languages.DocumentHighlightKind.Read;
    case vscode$1.DocumentHighlightKind.Write:
      return languages.DocumentHighlightKind.Write;
    default:
      return languages.DocumentHighlightKind.Text;
  }
}
function asCodeLens(item) {
  return {
    range: asRange$1(item.range),
    command: item.command ? asCommand(item.command) : void 0
  };
}
function asCodeAction(item) {
  var _a;
  return {
    title: item.title,
    command: item.command ? asCommand(item.command) : void 0,
    edit: item.edit ? asWorkspaceEdit(item.edit) : void 0,
    diagnostics: item.diagnostics ? item.diagnostics.map(asMarkerData) : void 0,
    kind: item.kind,
    isPreferred: item.isPreferred,
    disabled: (_a = item.disabled) == null ? void 0 : _a.reason
  };
}
function asLink(item) {
  return {
    range: asRange$1(item.range),
    url: item.target,
    tooltip: item.tooltip
  };
}
function asColorInformation(item) {
  return {
    range: asRange$1(item.range),
    color: item.color
  };
}
function asColorPresentation(item) {
  return {
    label: item.label,
    textEdit: item.textEdit ? asTextEdit(item.textEdit) : void 0,
    additionalTextEdits: item.additionalTextEdits ? item.additionalTextEdits.map(asTextEdit) : void 0
  };
}
function asFoldingRange(item) {
  var _a;
  return {
    start: item.startLine + 1,
    end: item.endLine + 1,
    kind: {
      value: (_a = item.kind) != null ? _a : ""
    }
  };
}
function asSelectionRange(item) {
  return {
    range: asRange$1(item.range)
  };
}
function asInlayHint(item) {
  return {
    label: asInlayHintLabel(item.label),
    tooltip: item.tooltip,
    command: void 0,
    position: asPosition$1(item.position),
    kind: item.kind ? asInlayHintKind(item.kind) : void 0,
    paddingLeft: item.paddingLeft,
    paddingRight: item.paddingRight
  };
}
function asInlayHintKind(kind) {
  switch (kind) {
    case vscode$1.InlayHintKind.Parameter:
      return languages.InlayHintKind.Parameter;
    case vscode$1.InlayHintKind.Type:
      return languages.InlayHintKind.Type;
  }
}
function asInlayHintLabel(label) {
  if (typeof label === "string") {
    return label;
  } else {
    return label.map(asInlayHintLabelPart);
  }
}
function asInlayHintLabelPart(part) {
  return {
    label: part.value,
    tooltip: part.tooltip,
    command: part.command ? asCommand(part.command) : void 0,
    location: part.location ? asLocation(part.location) : void 0
  };
}
function asPosition$1(position) {
  return {
    lineNumber: position.line + 1,
    column: position.character + 1
  };
}
const vscode = vscode_languageserver_protocol_default;
function asPosition(position) {
  return vscode.Position.create(position.lineNumber - 1, position.column - 1);
}
function asRange(range) {
  return vscode.Range.create(range.startLineNumber - 1, range.startColumn - 1, range.endLineNumber - 1, range.endColumn - 1);
}
function asCompletionContext(context) {
  return {
    triggerKind: asTriggerKind(context.triggerKind),
    triggerCharacter: context.triggerCharacter
  };
}
function asTriggerKind(kind) {
  switch (kind) {
    case languages.CompletionTriggerKind.Invoke:
      return vscode.CompletionTriggerKind.Invoked;
    case languages.CompletionTriggerKind.TriggerCharacter:
      return vscode.CompletionTriggerKind.TriggerCharacter;
    case languages.CompletionTriggerKind.TriggerForIncompleteCompletions:
      return vscode.CompletionTriggerKind.TriggerForIncompleteCompletions;
  }
}
function asFormattingOptions(options) {
  return {
    tabSize: options.tabSize,
    insertSpaces: options.insertSpaces
  };
}
const createDiagnosticsAdapter = (_defaults, _selector, _worker, _getDiagnostic) => {
  const disposables = [];
  const listener = /* @__PURE__ */ new Map();
  const toMarkers = (errors) => {
    return errors.map((error) => {
      const marker = asMarkerData(error);
      _getDiagnostic().set(marker, error);
      return marker;
    });
  };
  const doValidation = async (model) => {
    if (model.isDisposed()) {
      return;
    }
    const worker = await _worker(model.uri);
    const attachToEditor = (diags) => {
      if (model.isDisposed()) {
        return;
      }
      editor.setModelMarkers(model, _selector, toMarkers(diags));
    };
    const diagnostics = await worker.doValidation(model.uri.toString());
    attachToEditor(diagnostics);
  };
  const onModelAdd = (model) => {
    if (model.getLanguageId() !== _selector) {
      return;
    }
    const maybeValidation = () => {
      if (model.isAttachedToEditor()) {
        doValidation(model);
      }
    };
    let timer;
    const changeSubscription = model.onDidChangeContent(() => {
      clearTimeout(timer);
      timer = window.setTimeout(maybeValidation, 500);
    });
    const visibleSubscription = model.onDidChangeAttached(() => {
      if (model.isAttachedToEditor()) {
        maybeValidation();
      } else {
        editor.setModelMarkers(model, _selector, []);
      }
    });
    listener.set(model.uri.toString(), createDisposable(() => {
      changeSubscription.dispose();
      visibleSubscription.dispose();
      clearTimeout(timer);
    }));
    maybeValidation();
  };
  const onModelRemoved = (model) => {
    var _a;
    editor.setModelMarkers(model, _selector, []);
    const key = model.uri.toString();
    if (listener.has(key)) {
      (_a = listener.get(key)) == null ? void 0 : _a.dispose();
      listener.delete(key);
    }
  };
  disposables.push(editor.onDidCreateModel((model) => onModelAdd(model)));
  disposables.push(editor.onWillDisposeModel(onModelRemoved));
  disposables.push(editor.onDidChangeModelLanguage((event) => {
    onModelRemoved(event.model);
    onModelAdd(event.model);
  }));
  disposables.push(createDisposable(() => {
    for (const model of editor.getModels()) {
      onModelRemoved(model);
    }
  }));
  const recompute = () => {
    for (const model of editor.getModels()) {
      onModelRemoved(model);
      onModelAdd(model);
    }
  };
  disposables.push(_defaults.onDidChange(recompute));
  disposables.push(_defaults.onExtraLibChange(recompute));
  editor.getModels().forEach((model) => onModelAdd(model));
  return asDisposable(disposables);
};
class WorkerAdapter {
  constructor(_worker, _diagnostics) {
    this._worker = _worker;
    this._diagnostics = _diagnostics;
    this._completionItems = /* @__PURE__ */ new WeakMap();
    this._codeLens = /* @__PURE__ */ new WeakMap();
    this._codeActions = /* @__PURE__ */ new WeakMap();
    this._colorInformations = /* @__PURE__ */ new WeakMap();
    this.provideDocumentSymbols = async (model, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.findDocumentSymbols(model.uri.toString());
      if (codeResult) {
        return codeResult.map(asDocumentSymbol);
      }
    };
    this.provideDocumentHighlights = async (model, position, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.findDocumentHighlights(model.uri.toString(), asPosition(position));
      if (codeResult) {
        return codeResult.map(asDocumentHighlight);
      }
    };
    this.provideLinkedEditingRanges = async (model, position, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.findLinkedEditingRanges(model.uri.toString(), asPosition(position));
      if (codeResult) {
        return {
          ranges: codeResult.ranges.map(asRange$1),
          wordPattern: codeResult.wordPattern ? new RegExp(codeResult.wordPattern) : void 0
        };
      }
    };
    this.provideDefinition = async (model, position, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.findDefinition(model.uri.toString(), asPosition(position));
      if (codeResult) {
        return codeResult.map(asLocation);
      }
    };
    this.provideImplementation = async (model, position, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.findImplementations(model.uri.toString(), asPosition(position));
      if (codeResult) {
        return codeResult.map(asLocation);
      }
    };
    this.provideTypeDefinition = async (model, position, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.findTypeDefinition(model.uri.toString(), asPosition(position));
      if (codeResult) {
        return codeResult.map(asLocation);
      }
    };
    this.provideCodeLenses = async (model, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.doCodeLens(model.uri.toString());
      if (codeResult) {
        const monacoResult = codeResult.map(asCodeLens);
        for (let i = 0; i < monacoResult.length; i++) {
          this._codeLens.set(monacoResult[i], codeResult[i]);
        }
        return {
          lenses: monacoResult,
          dispose: () => {
          }
        };
      }
    };
    this.resolveCodeLens = async (model, moncaoResult) => {
      let codeResult = this._codeLens.get(moncaoResult);
      if (codeResult) {
        const worker = await this._worker(model.uri);
        codeResult = await worker.doCodeLensResolve(codeResult);
        if (codeResult) {
          moncaoResult = asCodeLens(codeResult);
          this._codeLens.set(moncaoResult, codeResult);
        }
      }
      return moncaoResult;
    };
    this.provideCodeActions = async (model, range, context, token) => {
      const diagnostics = [];
      for (const marker of context.markers) {
        const diagnostic = this._diagnostics.get(marker);
        if (diagnostic) {
          diagnostics.push(diagnostic);
        }
      }
      const worker = await this._worker(model.uri);
      const codeResult = await worker.doCodeActions(model.uri.toString(), asRange(range), {
        diagnostics,
        only: context.only ? [context.only] : void 0
      });
      if (codeResult) {
        const monacoResult = codeResult.map(asCodeAction);
        for (let i = 0; i < monacoResult.length; i++) {
          this._codeActions.set(monacoResult[i], codeResult[i]);
        }
        return {
          actions: monacoResult,
          dispose: () => {
          }
        };
      }
    };
    this.resolveCodeAction = async (moncaoResult) => {
      let codeResult = this._codeActions.get(moncaoResult);
      if (codeResult) {
        const worker = await this._worker();
        codeResult = await worker.doCodeActionResolve(codeResult);
        if (codeResult) {
          moncaoResult = asCodeAction(codeResult);
          this._codeActions.set(moncaoResult, codeResult);
        }
      }
      return moncaoResult;
    };
    this.autoFormatTriggerCharacters = ["}", ";", "\n"];
    this.provideDocumentFormattingEdits = async (model, options, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.format(model.uri.toString(), asFormattingOptions(options));
      if (codeResult) {
        return codeResult.map(asTextEdit);
      }
    };
    this.provideDocumentRangeFormattingEdits = async (model, range, options, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.format(model.uri.toString(), asFormattingOptions(options), asRange(range));
      if (codeResult) {
        return codeResult.map(asTextEdit);
      }
    };
    this.provideOnTypeFormattingEdits = async (model, position, ch, options, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.format(model.uri.toString(), asFormattingOptions(options), void 0, {
        ch,
        position: asPosition(position)
      });
      if (codeResult) {
        return codeResult.map(asTextEdit);
      }
    };
    this.provideLinks = async (model, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.findDocumentLinks(model.uri.toString());
      if (codeResult) {
        return {
          links: codeResult.map(asLink)
        };
      }
    };
    this.triggerCharacters = "!@#$%^&*()_+-=`~{}|[]:\";'<>?,./ ".split("");
    this.provideCompletionItems = async (model, position, context, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.doComplete(model.uri.toString(), asPosition(position), asCompletionContext(context));
      const monacoResult = asCompletionList(codeResult);
      for (let i = 0; i < codeResult.items.length; i++) {
        this._completionItems.set(monacoResult.suggestions[i], codeResult.items[i]);
      }
      return monacoResult;
    };
    this.resolveCompletionItem = async (monacoItem, token) => {
      let codeItem = this._completionItems.get(monacoItem);
      if (codeItem) {
        const worker = await this._worker();
        codeItem = await worker.doCompletionResolve(codeItem);
        monacoItem = asCompletionItem(codeItem);
        this._completionItems.set(monacoItem, codeItem);
      }
      return monacoItem;
    };
    this.provideDocumentColors = async (model, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.findDocumentColors(model.uri.toString());
      if (codeResult) {
        return codeResult.map(asColorInformation);
      }
    };
    this.provideColorPresentations = async (model, monacoResult) => {
      const worker = await this._worker(model.uri);
      const codeResult = this._colorInformations.get(monacoResult);
      if (codeResult) {
        const codeColors = await worker.getColorPresentations(model.uri.toString(), codeResult.color, {
          start: asPosition(model.getPositionAt(0)),
          end: asPosition(model.getPositionAt(model.getValueLength()))
        });
        if (codeColors) {
          return codeColors.map(asColorPresentation);
        }
      }
    };
    this.provideFoldingRanges = async (model, context, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.getFoldingRanges(model.uri.toString());
      if (codeResult) {
        return codeResult.map(asFoldingRange);
      }
    };
    this.provideDeclaration = async (model, position, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.findDefinition(model.uri.toString(), asPosition(position));
      if (codeResult) {
        return codeResult.map(asLocation);
      }
    };
    this.provideSelectionRanges = async (model, positions, token) => {
      const worker = await this._worker(model.uri);
      const codeResults = await Promise.all(positions.map((position) => worker.getSelectionRanges(model.uri.toString(), [
        asPosition(position)
      ])));
      return codeResults.map((codeResult) => {
        var _a;
        return (_a = codeResult == null ? void 0 : codeResult.map(asSelectionRange)) != null ? _a : [];
      });
    };
    this.signatureHelpTriggerCharacters = ["(", ","];
    this.provideSignatureHelp = async (model, position, token, context) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.getSignatureHelp(model.uri.toString(), asPosition(position));
      if (codeResult) {
        return {
          value: asSignatureHelp(codeResult),
          dispose: () => {
          }
        };
      }
    };
    this.provideRenameEdits = async (model, position, newName, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.doRename(model.uri.toString(), asPosition(position), newName);
      if (codeResult) {
        return asWorkspaceEdit(codeResult);
      }
    };
    this.provideReferences = async (model, position, context, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.findReferences(model.uri.toString(), asPosition(position));
      if (codeResult) {
        return codeResult.map(asLocation);
      }
    };
    this.provideInlayHints = async (model, range, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.getInlayHints(model.uri.toString(), asRange(range));
      if (codeResult) {
        return {
          hints: codeResult.map(asInlayHint),
          dispose: () => {
          }
        };
      }
    };
    this.provideHover = async (model, position, token) => {
      const worker = await this._worker(model.uri);
      const codeResult = await worker.doHover(model.uri.toString(), asPosition(position));
      if (codeResult) {
        return asHover(codeResult);
      }
    };
  }
}
function setupMode(defaults) {
  const disposables = [];
  const providers = [];
  const client = new WorkerManager(defaults);
  disposables.push(client);
  const worker = (...uris) => {
    return client.getLanguageServiceWorker(...uris);
  };
  const diagnostic = /* @__PURE__ */ new WeakMap();
  const adapter = new WorkerAdapter(worker, diagnostic);
  function registerProviders() {
    const { languageId } = defaults;
    disposeAll(providers);
    providers.push(languages.registerHoverProvider(languageId, adapter), languages.registerReferenceProvider(languageId, adapter), languages.registerRenameProvider(languageId, adapter), languages.registerSignatureHelpProvider(languageId, adapter), languages.registerDocumentSymbolProvider(languageId, adapter), languages.registerDocumentHighlightProvider(languageId, adapter), languages.registerLinkedEditingRangeProvider(languageId, adapter), languages.registerDefinitionProvider(languageId, adapter), languages.registerImplementationProvider(languageId, adapter), languages.registerTypeDefinitionProvider(languageId, adapter), languages.registerCodeLensProvider(languageId, adapter), languages.registerCodeActionProvider(languageId, adapter), languages.registerDocumentFormattingEditProvider(languageId, adapter), languages.registerDocumentRangeFormattingEditProvider(languageId, adapter), languages.registerOnTypeFormattingEditProvider(languageId, adapter), languages.registerLinkProvider(languageId, adapter), languages.registerCompletionItemProvider(languageId, adapter), languages.registerColorProvider(languageId, adapter), languages.registerFoldingRangeProvider(languageId, adapter), languages.registerDeclarationProvider(languageId, adapter), languages.registerSelectionRangeProvider(languageId, adapter), languages.registerInlayHintsProvider(languageId, adapter), createDiagnosticsAdapter(defaults, languageId, worker, () => diagnostic));
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
export { setupMode };
