var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { c as commonjsGlobal, p as pathBrowserify, l as lib, _ as __vitePreload } from "./index-4f7a7b6c.js";
var dist = {};
var main$1 = {};
var registry = {};
var grammar = {};
var utils = {};
Object.defineProperty(utils, "__esModule", { value: true });
function clone(something) {
  return doClone(something);
}
utils.clone = clone;
function doClone(something) {
  if (Array.isArray(something)) {
    return cloneArray(something);
  }
  if (typeof something === "object") {
    return cloneObj(something);
  }
  return something;
}
function cloneArray(arr) {
  var r = [];
  for (var i = 0, len = arr.length; i < len; i++) {
    r[i] = doClone(arr[i]);
  }
  return r;
}
function cloneObj(obj) {
  var r = {};
  for (var key in obj) {
    r[key] = doClone(obj[key]);
  }
  return r;
}
function mergeObjects(target) {
  var sources = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    sources[_i - 1] = arguments[_i];
  }
  sources.forEach(function(source) {
    for (var key in source) {
      target[key] = source[key];
    }
  });
  return target;
}
utils.mergeObjects = mergeObjects;
var CAPTURING_REGEX_SOURCE = /\$(\d+)|\${(\d+):\/(downcase|upcase)}/;
var RegexSource = (
  /** @class */
  function() {
    function RegexSource2() {
    }
    RegexSource2.hasCaptures = function(regexSource) {
      return CAPTURING_REGEX_SOURCE.test(regexSource);
    };
    RegexSource2.replaceCaptures = function(regexSource, captureSource, captureIndices) {
      return regexSource.replace(CAPTURING_REGEX_SOURCE, function(match, index, commandIndex, command) {
        var capture = captureIndices[parseInt(index || commandIndex, 10)];
        if (capture) {
          var result = captureSource.substring(capture.start, capture.end);
          while (result[0] === ".") {
            result = result.substring(1);
          }
          switch (command) {
            case "downcase":
              return result.toLowerCase();
            case "upcase":
              return result.toUpperCase();
            default:
              return result;
          }
        } else {
          return match;
        }
      });
    };
    return RegexSource2;
  }()
);
utils.RegexSource = RegexSource;
var rule = {};
var __extends = commonjsGlobal && commonjsGlobal.__extends || function() {
  var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
    d.__proto__ = b;
  } || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
  };
  return function(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
Object.defineProperty(rule, "__esModule", { value: true });
var path = pathBrowserify;
var utils_1$1 = utils;
var onigasm_1 = lib;
var HAS_BACK_REFERENCES = /\\(\d+)/;
var BACK_REFERENCING_END = /\\(\d+)/g;
var Rule = (
  /** @class */
  function() {
    function Rule2($location, id, name, contentName) {
      this.$location = $location;
      this.id = id;
      this._name = name || null;
      this._nameIsCapturing = utils_1$1.RegexSource.hasCaptures(this._name);
      this._contentName = contentName || null;
      this._contentNameIsCapturing = utils_1$1.RegexSource.hasCaptures(this._contentName);
    }
    Object.defineProperty(Rule2.prototype, "debugName", {
      get: function() {
        return this.constructor.name + "#" + this.id + " @ " + path.basename(this.$location.filename) + ":" + this.$location.line;
      },
      enumerable: true,
      configurable: true
    });
    Rule2.prototype.getName = function(lineText, captureIndices) {
      if (!this._nameIsCapturing) {
        return this._name;
      }
      return utils_1$1.RegexSource.replaceCaptures(this._name, lineText, captureIndices);
    };
    Rule2.prototype.getContentName = function(lineText, captureIndices) {
      if (!this._contentNameIsCapturing) {
        return this._contentName;
      }
      return utils_1$1.RegexSource.replaceCaptures(this._contentName, lineText, captureIndices);
    };
    Rule2.prototype.collectPatternsRecursive = function(grammar2, out, isFirst) {
      throw new Error("Implement me!");
    };
    Rule2.prototype.compile = function(grammar2, endRegexSource, allowA, allowG) {
      throw new Error("Implement me!");
    };
    return Rule2;
  }()
);
rule.Rule = Rule;
var CaptureRule = (
  /** @class */
  function(_super) {
    __extends(CaptureRule2, _super);
    function CaptureRule2($location, id, name, contentName, retokenizeCapturedWithRuleId) {
      var _this = _super.call(this, $location, id, name, contentName) || this;
      _this.retokenizeCapturedWithRuleId = retokenizeCapturedWithRuleId;
      return _this;
    }
    return CaptureRule2;
  }(Rule)
);
rule.CaptureRule = CaptureRule;
var RegExpSource = (
  /** @class */
  function() {
    function RegExpSource2(regExpSource, ruleId, handleAnchors) {
      if (handleAnchors === void 0) {
        handleAnchors = true;
      }
      if (handleAnchors) {
        this._handleAnchors(regExpSource);
      } else {
        this.source = regExpSource;
        this.hasAnchor = false;
      }
      if (this.hasAnchor) {
        this._anchorCache = this._buildAnchorCache();
      }
      this.ruleId = ruleId;
      this.hasBackReferences = HAS_BACK_REFERENCES.test(this.source);
    }
    RegExpSource2.prototype.clone = function() {
      return new RegExpSource2(this.source, this.ruleId, true);
    };
    RegExpSource2.prototype.setSource = function(newSource) {
      if (this.source === newSource) {
        return;
      }
      this.source = newSource;
      if (this.hasAnchor) {
        this._anchorCache = this._buildAnchorCache();
      }
    };
    RegExpSource2.prototype._handleAnchors = function(regExpSource) {
      if (regExpSource) {
        var pos = void 0, len = void 0, ch = void 0, nextCh = void 0, lastPushedPos = 0, output = [];
        var hasAnchor = false;
        for (pos = 0, len = regExpSource.length; pos < len; pos++) {
          ch = regExpSource.charAt(pos);
          if (ch === "\\") {
            if (pos + 1 < len) {
              nextCh = regExpSource.charAt(pos + 1);
              if (nextCh === "z") {
                output.push(regExpSource.substring(lastPushedPos, pos));
                output.push("$(?!\\n)(?<!\\n)");
                lastPushedPos = pos + 2;
              } else if (nextCh === "A" || nextCh === "G") {
                hasAnchor = true;
              }
              pos++;
            }
          }
        }
        this.hasAnchor = hasAnchor;
        if (lastPushedPos === 0) {
          this.source = regExpSource;
        } else {
          output.push(regExpSource.substring(lastPushedPos, len));
          this.source = output.join("");
        }
      } else {
        this.hasAnchor = false;
        this.source = regExpSource;
      }
    };
    RegExpSource2.prototype.resolveBackReferences = function(lineText, captureIndices) {
      var capturedValues = captureIndices.map(function(capture) {
        return lineText.substring(capture.start, capture.end);
      });
      BACK_REFERENCING_END.lastIndex = 0;
      return this.source.replace(BACK_REFERENCING_END, function(match, g1) {
        return escapeRegExpCharacters(capturedValues[parseInt(g1, 10)] || "");
      });
    };
    RegExpSource2.prototype._buildAnchorCache = function() {
      var A0_G0_result = [];
      var A0_G1_result = [];
      var A1_G0_result = [];
      var A1_G1_result = [];
      var pos, len, ch, nextCh;
      for (pos = 0, len = this.source.length; pos < len; pos++) {
        ch = this.source.charAt(pos);
        A0_G0_result[pos] = ch;
        A0_G1_result[pos] = ch;
        A1_G0_result[pos] = ch;
        A1_G1_result[pos] = ch;
        if (ch === "\\") {
          if (pos + 1 < len) {
            nextCh = this.source.charAt(pos + 1);
            if (nextCh === "A") {
              A0_G0_result[pos + 1] = "￿";
              A0_G1_result[pos + 1] = "￿";
              A1_G0_result[pos + 1] = "A";
              A1_G1_result[pos + 1] = "A";
            } else if (nextCh === "G") {
              A0_G0_result[pos + 1] = "￿";
              A0_G1_result[pos + 1] = "G";
              A1_G0_result[pos + 1] = "￿";
              A1_G1_result[pos + 1] = "G";
            } else {
              A0_G0_result[pos + 1] = nextCh;
              A0_G1_result[pos + 1] = nextCh;
              A1_G0_result[pos + 1] = nextCh;
              A1_G1_result[pos + 1] = nextCh;
            }
            pos++;
          }
        }
      }
      return {
        A0_G0: A0_G0_result.join(""),
        A0_G1: A0_G1_result.join(""),
        A1_G0: A1_G0_result.join(""),
        A1_G1: A1_G1_result.join("")
      };
    };
    RegExpSource2.prototype.resolveAnchors = function(allowA, allowG) {
      if (!this.hasAnchor) {
        return this.source;
      }
      if (allowA) {
        if (allowG) {
          return this._anchorCache.A1_G1;
        } else {
          return this._anchorCache.A1_G0;
        }
      } else {
        if (allowG) {
          return this._anchorCache.A0_G1;
        } else {
          return this._anchorCache.A0_G0;
        }
      }
    };
    return RegExpSource2;
  }()
);
rule.RegExpSource = RegExpSource;
function createOnigScanner(sources) {
  return new onigasm_1.OnigScanner(sources);
}
function createOnigString(sources) {
  var r = new onigasm_1.OnigString(sources);
  r.$str = sources;
  return r;
}
rule.createOnigString = createOnigString;
function getString(str) {
  return str.$str;
}
rule.getString = getString;
var RegExpSourceList = (
  /** @class */
  function() {
    function RegExpSourceList2() {
      this._items = [];
      this._hasAnchors = false;
      this._cached = null;
      this._cachedSources = null;
      this._anchorCache = {
        A0_G0: null,
        A0_G1: null,
        A1_G0: null,
        A1_G1: null
      };
    }
    RegExpSourceList2.prototype.push = function(item) {
      this._items.push(item);
      this._hasAnchors = this._hasAnchors || item.hasAnchor;
    };
    RegExpSourceList2.prototype.unshift = function(item) {
      this._items.unshift(item);
      this._hasAnchors = this._hasAnchors || item.hasAnchor;
    };
    RegExpSourceList2.prototype.length = function() {
      return this._items.length;
    };
    RegExpSourceList2.prototype.setSource = function(index, newSource) {
      if (this._items[index].source !== newSource) {
        this._cached = null;
        this._anchorCache.A0_G0 = null;
        this._anchorCache.A0_G1 = null;
        this._anchorCache.A1_G0 = null;
        this._anchorCache.A1_G1 = null;
        this._items[index].setSource(newSource);
      }
    };
    RegExpSourceList2.prototype.compile = function(grammar2, allowA, allowG) {
      if (!this._hasAnchors) {
        if (!this._cached) {
          var regExps = this._items.map(function(e) {
            return e.source;
          });
          this._cached = {
            scanner: createOnigScanner(regExps),
            rules: this._items.map(function(e) {
              return e.ruleId;
            }),
            debugRegExps: regExps
          };
        }
        return this._cached;
      } else {
        this._anchorCache = {
          A0_G0: this._anchorCache.A0_G0 || (allowA === false && allowG === false ? this._resolveAnchors(allowA, allowG) : null),
          A0_G1: this._anchorCache.A0_G1 || (allowA === false && allowG === true ? this._resolveAnchors(allowA, allowG) : null),
          A1_G0: this._anchorCache.A1_G0 || (allowA === true && allowG === false ? this._resolveAnchors(allowA, allowG) : null),
          A1_G1: this._anchorCache.A1_G1 || (allowA === true && allowG === true ? this._resolveAnchors(allowA, allowG) : null)
        };
        if (allowA) {
          if (allowG) {
            return this._anchorCache.A1_G1;
          } else {
            return this._anchorCache.A1_G0;
          }
        } else {
          if (allowG) {
            return this._anchorCache.A0_G1;
          } else {
            return this._anchorCache.A0_G0;
          }
        }
      }
    };
    RegExpSourceList2.prototype._resolveAnchors = function(allowA, allowG) {
      var regExps = this._items.map(function(e) {
        return e.resolveAnchors(allowA, allowG);
      });
      return {
        scanner: createOnigScanner(regExps),
        rules: this._items.map(function(e) {
          return e.ruleId;
        }),
        debugRegExps: regExps
      };
    };
    return RegExpSourceList2;
  }()
);
rule.RegExpSourceList = RegExpSourceList;
var MatchRule = (
  /** @class */
  function(_super) {
    __extends(MatchRule2, _super);
    function MatchRule2($location, id, name, match, captures) {
      var _this = _super.call(this, $location, id, name, null) || this;
      _this._match = new RegExpSource(match, _this.id);
      _this.captures = captures;
      _this._cachedCompiledPatterns = null;
      return _this;
    }
    Object.defineProperty(MatchRule2.prototype, "debugMatchRegExp", {
      get: function() {
        return "" + this._match.source;
      },
      enumerable: true,
      configurable: true
    });
    MatchRule2.prototype.collectPatternsRecursive = function(grammar2, out, isFirst) {
      out.push(this._match);
    };
    MatchRule2.prototype.compile = function(grammar2, endRegexSource, allowA, allowG) {
      if (!this._cachedCompiledPatterns) {
        this._cachedCompiledPatterns = new RegExpSourceList();
        this.collectPatternsRecursive(grammar2, this._cachedCompiledPatterns, true);
      }
      return this._cachedCompiledPatterns.compile(grammar2, allowA, allowG);
    };
    return MatchRule2;
  }(Rule)
);
rule.MatchRule = MatchRule;
var IncludeOnlyRule = (
  /** @class */
  function(_super) {
    __extends(IncludeOnlyRule2, _super);
    function IncludeOnlyRule2($location, id, name, contentName, patterns) {
      var _this = _super.call(this, $location, id, name, contentName) || this;
      _this.patterns = patterns.patterns;
      _this.hasMissingPatterns = patterns.hasMissingPatterns;
      _this._cachedCompiledPatterns = null;
      return _this;
    }
    IncludeOnlyRule2.prototype.collectPatternsRecursive = function(grammar2, out, isFirst) {
      var i, len, rule2;
      for (i = 0, len = this.patterns.length; i < len; i++) {
        rule2 = grammar2.getRule(this.patterns[i]);
        rule2.collectPatternsRecursive(grammar2, out, false);
      }
    };
    IncludeOnlyRule2.prototype.compile = function(grammar2, endRegexSource, allowA, allowG) {
      if (!this._cachedCompiledPatterns) {
        this._cachedCompiledPatterns = new RegExpSourceList();
        this.collectPatternsRecursive(grammar2, this._cachedCompiledPatterns, true);
      }
      return this._cachedCompiledPatterns.compile(grammar2, allowA, allowG);
    };
    return IncludeOnlyRule2;
  }(Rule)
);
rule.IncludeOnlyRule = IncludeOnlyRule;
function escapeRegExpCharacters(value) {
  return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&");
}
var BeginEndRule = (
  /** @class */
  function(_super) {
    __extends(BeginEndRule2, _super);
    function BeginEndRule2($location, id, name, contentName, begin, beginCaptures, end, endCaptures, applyEndPatternLast, patterns) {
      var _this = _super.call(this, $location, id, name, contentName) || this;
      _this._begin = new RegExpSource(begin, _this.id);
      _this.beginCaptures = beginCaptures;
      _this._end = new RegExpSource(end, -1);
      _this.endHasBackReferences = _this._end.hasBackReferences;
      _this.endCaptures = endCaptures;
      _this.applyEndPatternLast = applyEndPatternLast || false;
      _this.patterns = patterns.patterns;
      _this.hasMissingPatterns = patterns.hasMissingPatterns;
      _this._cachedCompiledPatterns = null;
      return _this;
    }
    Object.defineProperty(BeginEndRule2.prototype, "debugBeginRegExp", {
      get: function() {
        return "" + this._begin.source;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(BeginEndRule2.prototype, "debugEndRegExp", {
      get: function() {
        return "" + this._end.source;
      },
      enumerable: true,
      configurable: true
    });
    BeginEndRule2.prototype.getEndWithResolvedBackReferences = function(lineText, captureIndices) {
      return this._end.resolveBackReferences(lineText, captureIndices);
    };
    BeginEndRule2.prototype.collectPatternsRecursive = function(grammar2, out, isFirst) {
      if (isFirst) {
        var i = void 0, len = void 0, rule2 = void 0;
        for (i = 0, len = this.patterns.length; i < len; i++) {
          rule2 = grammar2.getRule(this.patterns[i]);
          rule2.collectPatternsRecursive(grammar2, out, false);
        }
      } else {
        out.push(this._begin);
      }
    };
    BeginEndRule2.prototype.compile = function(grammar2, endRegexSource, allowA, allowG) {
      var precompiled = this._precompile(grammar2);
      if (this._end.hasBackReferences) {
        if (this.applyEndPatternLast) {
          precompiled.setSource(precompiled.length() - 1, endRegexSource);
        } else {
          precompiled.setSource(0, endRegexSource);
        }
      }
      return this._cachedCompiledPatterns.compile(grammar2, allowA, allowG);
    };
    BeginEndRule2.prototype._precompile = function(grammar2) {
      if (!this._cachedCompiledPatterns) {
        this._cachedCompiledPatterns = new RegExpSourceList();
        this.collectPatternsRecursive(grammar2, this._cachedCompiledPatterns, true);
        if (this.applyEndPatternLast) {
          this._cachedCompiledPatterns.push(this._end.hasBackReferences ? this._end.clone() : this._end);
        } else {
          this._cachedCompiledPatterns.unshift(this._end.hasBackReferences ? this._end.clone() : this._end);
        }
      }
      return this._cachedCompiledPatterns;
    };
    return BeginEndRule2;
  }(Rule)
);
rule.BeginEndRule = BeginEndRule;
var BeginWhileRule = (
  /** @class */
  function(_super) {
    __extends(BeginWhileRule2, _super);
    function BeginWhileRule2($location, id, name, contentName, begin, beginCaptures, _while, whileCaptures, patterns) {
      var _this = _super.call(this, $location, id, name, contentName) || this;
      _this._begin = new RegExpSource(begin, _this.id);
      _this.beginCaptures = beginCaptures;
      _this.whileCaptures = whileCaptures;
      _this._while = new RegExpSource(_while, -2);
      _this.whileHasBackReferences = _this._while.hasBackReferences;
      _this.patterns = patterns.patterns;
      _this.hasMissingPatterns = patterns.hasMissingPatterns;
      _this._cachedCompiledPatterns = null;
      _this._cachedCompiledWhilePatterns = null;
      return _this;
    }
    BeginWhileRule2.prototype.getWhileWithResolvedBackReferences = function(lineText, captureIndices) {
      return this._while.resolveBackReferences(lineText, captureIndices);
    };
    BeginWhileRule2.prototype.collectPatternsRecursive = function(grammar2, out, isFirst) {
      if (isFirst) {
        var i = void 0, len = void 0, rule2 = void 0;
        for (i = 0, len = this.patterns.length; i < len; i++) {
          rule2 = grammar2.getRule(this.patterns[i]);
          rule2.collectPatternsRecursive(grammar2, out, false);
        }
      } else {
        out.push(this._begin);
      }
    };
    BeginWhileRule2.prototype.compile = function(grammar2, endRegexSource, allowA, allowG) {
      this._precompile(grammar2);
      return this._cachedCompiledPatterns.compile(grammar2, allowA, allowG);
    };
    BeginWhileRule2.prototype._precompile = function(grammar2) {
      if (!this._cachedCompiledPatterns) {
        this._cachedCompiledPatterns = new RegExpSourceList();
        this.collectPatternsRecursive(grammar2, this._cachedCompiledPatterns, true);
      }
    };
    BeginWhileRule2.prototype.compileWhile = function(grammar2, endRegexSource, allowA, allowG) {
      this._precompileWhile(grammar2);
      if (this._while.hasBackReferences) {
        this._cachedCompiledWhilePatterns.setSource(0, endRegexSource);
      }
      return this._cachedCompiledWhilePatterns.compile(grammar2, allowA, allowG);
    };
    BeginWhileRule2.prototype._precompileWhile = function(grammar2) {
      if (!this._cachedCompiledWhilePatterns) {
        this._cachedCompiledWhilePatterns = new RegExpSourceList();
        this._cachedCompiledWhilePatterns.push(this._while.hasBackReferences ? this._while.clone() : this._while);
      }
    };
    return BeginWhileRule2;
  }(Rule)
);
rule.BeginWhileRule = BeginWhileRule;
var RuleFactory = (
  /** @class */
  function() {
    function RuleFactory2() {
    }
    RuleFactory2.createCaptureRule = function(helper, $location, name, contentName, retokenizeCapturedWithRuleId) {
      return helper.registerRule(function(id) {
        return new CaptureRule($location, id, name, contentName, retokenizeCapturedWithRuleId);
      });
    };
    RuleFactory2.getCompiledRuleId = function(desc, helper, repository) {
      if (!desc.id) {
        helper.registerRule(function(id) {
          desc.id = id;
          if (desc.match) {
            return new MatchRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.match, RuleFactory2._compileCaptures(desc.captures, helper, repository));
          }
          if (!desc.begin) {
            if (desc.repository) {
              repository = utils_1$1.mergeObjects({}, repository, desc.repository);
            }
            return new IncludeOnlyRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, RuleFactory2._compilePatterns(desc.patterns, helper, repository));
          }
          if (desc.while) {
            return new BeginWhileRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, desc.begin, RuleFactory2._compileCaptures(desc.beginCaptures || desc.captures, helper, repository), desc.while, RuleFactory2._compileCaptures(desc.whileCaptures || desc.captures, helper, repository), RuleFactory2._compilePatterns(desc.patterns, helper, repository));
          }
          return new BeginEndRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, desc.begin, RuleFactory2._compileCaptures(desc.beginCaptures || desc.captures, helper, repository), desc.end, RuleFactory2._compileCaptures(desc.endCaptures || desc.captures, helper, repository), desc.applyEndPatternLast, RuleFactory2._compilePatterns(desc.patterns, helper, repository));
        });
      }
      return desc.id;
    };
    RuleFactory2._compileCaptures = function(captures, helper, repository) {
      var r = [], numericCaptureId, maximumCaptureId, i, captureId;
      if (captures) {
        maximumCaptureId = 0;
        for (captureId in captures) {
          if (captureId === "$vscodeTextmateLocation") {
            continue;
          }
          numericCaptureId = parseInt(captureId, 10);
          if (numericCaptureId > maximumCaptureId) {
            maximumCaptureId = numericCaptureId;
          }
        }
        for (i = 0; i <= maximumCaptureId; i++) {
          r[i] = null;
        }
        for (captureId in captures) {
          if (captureId === "$vscodeTextmateLocation") {
            continue;
          }
          numericCaptureId = parseInt(captureId, 10);
          var retokenizeCapturedWithRuleId = 0;
          if (captures[captureId].patterns) {
            retokenizeCapturedWithRuleId = RuleFactory2.getCompiledRuleId(captures[captureId], helper, repository);
          }
          r[numericCaptureId] = RuleFactory2.createCaptureRule(helper, captures[captureId].$vscodeTextmateLocation, captures[captureId].name, captures[captureId].contentName, retokenizeCapturedWithRuleId);
        }
      }
      return r;
    };
    RuleFactory2._compilePatterns = function(patterns, helper, repository) {
      var r = [], pattern, i, len, patternId, externalGrammar, rule2, skipRule;
      if (patterns) {
        for (i = 0, len = patterns.length; i < len; i++) {
          pattern = patterns[i];
          patternId = -1;
          if (pattern.include) {
            if (pattern.include.charAt(0) === "#") {
              var localIncludedRule = repository[pattern.include.substr(1)];
              if (localIncludedRule) {
                patternId = RuleFactory2.getCompiledRuleId(localIncludedRule, helper, repository);
              }
            } else if (pattern.include === "$base" || pattern.include === "$self") {
              patternId = RuleFactory2.getCompiledRuleId(repository[pattern.include], helper, repository);
            } else {
              var externalGrammarName = null, externalGrammarInclude = null, sharpIndex = pattern.include.indexOf("#");
              if (sharpIndex >= 0) {
                externalGrammarName = pattern.include.substring(0, sharpIndex);
                externalGrammarInclude = pattern.include.substring(sharpIndex + 1);
              } else {
                externalGrammarName = pattern.include;
              }
              externalGrammar = helper.getExternalGrammar(externalGrammarName, repository);
              if (externalGrammar) {
                if (externalGrammarInclude) {
                  var externalIncludedRule = externalGrammar.repository[externalGrammarInclude];
                  if (externalIncludedRule) {
                    patternId = RuleFactory2.getCompiledRuleId(externalIncludedRule, helper, externalGrammar.repository);
                  }
                } else {
                  patternId = RuleFactory2.getCompiledRuleId(externalGrammar.repository.$self, helper, externalGrammar.repository);
                }
              }
            }
          } else {
            patternId = RuleFactory2.getCompiledRuleId(pattern, helper, repository);
          }
          if (patternId !== -1) {
            rule2 = helper.getRule(patternId);
            skipRule = false;
            if (rule2 instanceof IncludeOnlyRule || rule2 instanceof BeginEndRule || rule2 instanceof BeginWhileRule) {
              if (rule2.hasMissingPatterns && rule2.patterns.length === 0) {
                skipRule = true;
              }
            }
            if (skipRule) {
              continue;
            }
            r.push(patternId);
          }
        }
      }
      return {
        patterns: r,
        hasMissingPatterns: (patterns ? patterns.length : 0) !== r.length
      };
    };
    return RuleFactory2;
  }()
);
rule.RuleFactory = RuleFactory;
var matcher = {};
Object.defineProperty(matcher, "__esModule", { value: true });
function createMatchers(selector, matchesName) {
  var results = [];
  var tokenizer = newTokenizer(selector);
  var token = tokenizer.next();
  while (token !== null) {
    var priority = 0;
    if (token.length === 2 && token.charAt(1) === ":") {
      switch (token.charAt(0)) {
        case "R":
          priority = 1;
          break;
        case "L":
          priority = -1;
          break;
        default:
          console.log("Unknown priority " + token + " in scope selector");
      }
      token = tokenizer.next();
    }
    var matcher2 = parseConjunction();
    if (matcher2) {
      results.push({ matcher: matcher2, priority });
    }
    if (token !== ",") {
      break;
    }
    token = tokenizer.next();
  }
  return results;
  function parseOperand() {
    if (token === "-") {
      token = tokenizer.next();
      var expressionToNegate = parseOperand();
      return function(matcherInput) {
        return expressionToNegate && !expressionToNegate(matcherInput);
      };
    }
    if (token === "(") {
      token = tokenizer.next();
      var expressionInParents = parseInnerExpression();
      if (token === ")") {
        token = tokenizer.next();
      }
      return expressionInParents;
    }
    if (isIdentifier(token)) {
      var identifiers = [];
      do {
        identifiers.push(token);
        token = tokenizer.next();
      } while (isIdentifier(token));
      return function(matcherInput) {
        return matchesName(identifiers, matcherInput);
      };
    }
    return null;
  }
  function parseConjunction() {
    var matchers = [];
    var matcher3 = parseOperand();
    while (matcher3) {
      matchers.push(matcher3);
      matcher3 = parseOperand();
    }
    return function(matcherInput) {
      return matchers.every(function(matcher4) {
        return matcher4(matcherInput);
      });
    };
  }
  function parseInnerExpression() {
    var matchers = [];
    var matcher3 = parseConjunction();
    while (matcher3) {
      matchers.push(matcher3);
      if (token === "|" || token === ",") {
        do {
          token = tokenizer.next();
        } while (token === "|" || token === ",");
      } else {
        break;
      }
      matcher3 = parseConjunction();
    }
    return function(matcherInput) {
      return matchers.some(function(matcher4) {
        return matcher4(matcherInput);
      });
    };
  }
}
matcher.createMatchers = createMatchers;
function isIdentifier(token) {
  return token && token.match(/[\w\.:]+/);
}
function newTokenizer(input) {
  var regex = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g;
  var match = regex.exec(input);
  return {
    next: function() {
      if (!match) {
        return null;
      }
      var res = match[0];
      match = regex.exec(input);
      return res;
    }
  };
}
var debug = {};
Object.defineProperty(debug, "__esModule", { value: true });
debug.CAPTURE_METADATA = typeof process === "undefined" ? false : !!process.env["VSCODE_TEXTMATE_DEBUG"];
debug.IN_DEBUG_MODE = typeof process === "undefined" ? false : !!process.env["VSCODE_TEXTMATE_DEBUG"];
Object.defineProperty(grammar, "__esModule", { value: true });
var utils_1 = utils;
var rule_1 = rule;
var matcher_1 = matcher;
var debug_1$1 = debug;
function createGrammar(grammar2, initialLanguage, embeddedLanguages, tokenTypes, grammarRepository) {
  return new Grammar(grammar2, initialLanguage, embeddedLanguages, tokenTypes, grammarRepository);
}
grammar.createGrammar = createGrammar;
function _extractIncludedScopesInPatterns(result, patterns) {
  for (var i = 0, len = patterns.length; i < len; i++) {
    if (Array.isArray(patterns[i].patterns)) {
      _extractIncludedScopesInPatterns(result, patterns[i].patterns);
    }
    var include = patterns[i].include;
    if (!include) {
      continue;
    }
    if (include === "$base" || include === "$self") {
      continue;
    }
    if (include.charAt(0) === "#") {
      continue;
    }
    var sharpIndex = include.indexOf("#");
    if (sharpIndex >= 0) {
      result[include.substring(0, sharpIndex)] = true;
    } else {
      result[include] = true;
    }
  }
}
function _extractIncludedScopesInRepository(result, repository) {
  for (var name in repository) {
    var rule2 = repository[name];
    if (rule2.patterns && Array.isArray(rule2.patterns)) {
      _extractIncludedScopesInPatterns(result, rule2.patterns);
    }
    if (rule2.repository) {
      _extractIncludedScopesInRepository(result, rule2.repository);
    }
  }
}
function collectIncludedScopes(result, grammar2) {
  if (grammar2.patterns && Array.isArray(grammar2.patterns)) {
    _extractIncludedScopesInPatterns(result, grammar2.patterns);
  }
  if (grammar2.repository) {
    _extractIncludedScopesInRepository(result, grammar2.repository);
  }
  delete result[grammar2.scopeName];
}
grammar.collectIncludedScopes = collectIncludedScopes;
function scopesAreMatching(thisScopeName, scopeName) {
  if (!thisScopeName) {
    return false;
  }
  if (thisScopeName === scopeName) {
    return true;
  }
  var len = scopeName.length;
  return thisScopeName.length > len && thisScopeName.substr(0, len) === scopeName && thisScopeName[len] === ".";
}
function nameMatcher(identifers, scopes) {
  if (scopes.length < identifers.length) {
    return false;
  }
  var lastIndex = 0;
  return identifers.every(function(identifier) {
    for (var i = lastIndex; i < scopes.length; i++) {
      if (scopesAreMatching(scopes[i], identifier)) {
        lastIndex = i + 1;
        return true;
      }
    }
    return false;
  });
}
function collectInjections(result, selector, rule2, ruleFactoryHelper, grammar2) {
  var matchers = matcher_1.createMatchers(selector, nameMatcher);
  var ruleId = rule_1.RuleFactory.getCompiledRuleId(rule2, ruleFactoryHelper, grammar2.repository);
  for (var _i = 0, matchers_1 = matchers; _i < matchers_1.length; _i++) {
    var matcher2 = matchers_1[_i];
    result.push({
      matcher: matcher2.matcher,
      ruleId,
      grammar: grammar2,
      priority: matcher2.priority
    });
  }
}
var ScopeMetadata = (
  /** @class */
  function() {
    function ScopeMetadata2(scopeName, languageId, tokenType, themeData) {
      this.scopeName = scopeName;
      this.languageId = languageId;
      this.tokenType = tokenType;
      this.themeData = themeData;
    }
    return ScopeMetadata2;
  }()
);
grammar.ScopeMetadata = ScopeMetadata;
var ScopeMetadataProvider = (
  /** @class */
  function() {
    function ScopeMetadataProvider2(initialLanguage, themeProvider, embeddedLanguages) {
      this._initialLanguage = initialLanguage;
      this._themeProvider = themeProvider;
      this.onDidChangeTheme();
      this._embeddedLanguages = /* @__PURE__ */ Object.create(null);
      if (embeddedLanguages) {
        var scopes = Object.keys(embeddedLanguages);
        for (var i = 0, len = scopes.length; i < len; i++) {
          var scope = scopes[i];
          var language = embeddedLanguages[scope];
          if (typeof language !== "number" || language === 0) {
            console.warn("Invalid embedded language found at scope " + scope + ": <<" + language + ">>");
            continue;
          }
          this._embeddedLanguages[scope] = language;
        }
      }
      var escapedScopes = Object.keys(this._embeddedLanguages).map(function(scopeName) {
        return ScopeMetadataProvider2._escapeRegExpCharacters(scopeName);
      });
      if (escapedScopes.length === 0) {
        this._embeddedLanguagesRegex = null;
      } else {
        escapedScopes.sort();
        escapedScopes.reverse();
        this._embeddedLanguagesRegex = new RegExp("^((" + escapedScopes.join(")|(") + "))($|\\.)", "");
      }
    }
    ScopeMetadataProvider2.prototype.onDidChangeTheme = function() {
      this._cache = /* @__PURE__ */ Object.create(null);
      this._defaultMetaData = new ScopeMetadata("", this._initialLanguage, 0, [this._themeProvider.getDefaults()]);
    };
    ScopeMetadataProvider2.prototype.getDefaultMetadata = function() {
      return this._defaultMetaData;
    };
    ScopeMetadataProvider2._escapeRegExpCharacters = function(value) {
      return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&");
    };
    ScopeMetadataProvider2.prototype.getMetadataForScope = function(scopeName) {
      if (scopeName === null) {
        return ScopeMetadataProvider2._NULL_SCOPE_METADATA;
      }
      var value = this._cache[scopeName];
      if (value) {
        return value;
      }
      value = this._doGetMetadataForScope(scopeName);
      this._cache[scopeName] = value;
      return value;
    };
    ScopeMetadataProvider2.prototype._doGetMetadataForScope = function(scopeName) {
      var languageId = this._scopeToLanguage(scopeName);
      var standardTokenType = this._toStandardTokenType(scopeName);
      var themeData = this._themeProvider.themeMatch(scopeName);
      return new ScopeMetadata(scopeName, languageId, standardTokenType, themeData);
    };
    ScopeMetadataProvider2.prototype._scopeToLanguage = function(scope) {
      if (!scope) {
        return 0;
      }
      if (!this._embeddedLanguagesRegex) {
        return 0;
      }
      var m = scope.match(this._embeddedLanguagesRegex);
      if (!m) {
        return 0;
      }
      var language = this._embeddedLanguages[m[1]] || 0;
      if (!language) {
        return 0;
      }
      return language;
    };
    ScopeMetadataProvider2.prototype._toStandardTokenType = function(tokenType) {
      var m = tokenType.match(ScopeMetadataProvider2.STANDARD_TOKEN_TYPE_REGEXP);
      if (!m) {
        return 0;
      }
      switch (m[1]) {
        case "comment":
          return 1;
        case "string":
          return 2;
        case "regex":
          return 4;
        case "meta.embedded":
          return 8;
      }
      throw new Error("Unexpected match for standard token type!");
    };
    ScopeMetadataProvider2._NULL_SCOPE_METADATA = new ScopeMetadata("", 0, 0, null);
    ScopeMetadataProvider2.STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|meta\.embedded)\b/;
    return ScopeMetadataProvider2;
  }()
);
var Grammar = (
  /** @class */
  function() {
    function Grammar2(grammar2, initialLanguage, embeddedLanguages, tokenTypes, grammarRepository) {
      this._scopeMetadataProvider = new ScopeMetadataProvider(initialLanguage, grammarRepository, embeddedLanguages);
      this._rootId = -1;
      this._lastRuleId = 0;
      this._ruleId2desc = [];
      this._includedGrammars = {};
      this._grammarRepository = grammarRepository;
      this._grammar = initGrammar(grammar2, null);
      this._tokenTypeMatchers = [];
      if (tokenTypes) {
        for (var _i = 0, _a = Object.keys(tokenTypes); _i < _a.length; _i++) {
          var selector = _a[_i];
          var matchers = matcher_1.createMatchers(selector, nameMatcher);
          for (var _b = 0, matchers_2 = matchers; _b < matchers_2.length; _b++) {
            var matcher2 = matchers_2[_b];
            this._tokenTypeMatchers.push({
              matcher: matcher2.matcher,
              type: tokenTypes[selector]
            });
          }
        }
      }
    }
    Grammar2.prototype.onDidChangeTheme = function() {
      this._scopeMetadataProvider.onDidChangeTheme();
    };
    Grammar2.prototype.getMetadataForScope = function(scope) {
      return this._scopeMetadataProvider.getMetadataForScope(scope);
    };
    Grammar2.prototype.getInjections = function() {
      var _this = this;
      if (!this._injections) {
        this._injections = [];
        var rawInjections = this._grammar.injections;
        if (rawInjections) {
          for (var expression in rawInjections) {
            collectInjections(this._injections, expression, rawInjections[expression], this, this._grammar);
          }
        }
        if (this._grammarRepository) {
          var injectionScopeNames = this._grammarRepository.injections(this._grammar.scopeName);
          if (injectionScopeNames) {
            injectionScopeNames.forEach(function(injectionScopeName) {
              var injectionGrammar = _this.getExternalGrammar(injectionScopeName);
              if (injectionGrammar) {
                var selector = injectionGrammar.injectionSelector;
                if (selector) {
                  collectInjections(_this._injections, selector, injectionGrammar, _this, injectionGrammar);
                }
              }
            });
          }
        }
        this._injections.sort(function(i1, i2) {
          return i1.priority - i2.priority;
        });
      }
      if (this._injections.length === 0) {
        return this._injections;
      }
      return this._injections;
    };
    Grammar2.prototype.registerRule = function(factory) {
      var id = ++this._lastRuleId;
      var result = factory(id);
      this._ruleId2desc[id] = result;
      return result;
    };
    Grammar2.prototype.getRule = function(patternId) {
      return this._ruleId2desc[patternId];
    };
    Grammar2.prototype.getExternalGrammar = function(scopeName, repository) {
      if (this._includedGrammars[scopeName]) {
        return this._includedGrammars[scopeName];
      } else if (this._grammarRepository) {
        var rawIncludedGrammar = this._grammarRepository.lookup(scopeName);
        if (rawIncludedGrammar) {
          this._includedGrammars[scopeName] = initGrammar(rawIncludedGrammar, repository && repository.$base);
          return this._includedGrammars[scopeName];
        }
      }
    };
    Grammar2.prototype.tokenizeLine = function(lineText, prevState) {
      var r = this._tokenize(lineText, prevState, false);
      return {
        tokens: r.lineTokens.getResult(r.ruleStack, r.lineLength),
        ruleStack: r.ruleStack
      };
    };
    Grammar2.prototype.tokenizeLine2 = function(lineText, prevState) {
      var r = this._tokenize(lineText, prevState, true);
      return {
        tokens: r.lineTokens.getBinaryResult(r.ruleStack, r.lineLength),
        ruleStack: r.ruleStack
      };
    };
    Grammar2.prototype._tokenize = function(lineText, prevState, emitBinaryTokens) {
      if (this._rootId === -1) {
        this._rootId = rule_1.RuleFactory.getCompiledRuleId(this._grammar.repository.$self, this, this._grammar.repository);
      }
      var isFirstLine;
      if (!prevState || prevState === StackElement.NULL) {
        isFirstLine = true;
        var rawDefaultMetadata = this._scopeMetadataProvider.getDefaultMetadata();
        var defaultTheme = rawDefaultMetadata.themeData[0];
        var defaultMetadata = StackElementMetadata.set(0, rawDefaultMetadata.languageId, rawDefaultMetadata.tokenType, defaultTheme.fontStyle, defaultTheme.foreground, defaultTheme.background);
        var rootScopeName = this.getRule(this._rootId).getName(null, null);
        var rawRootMetadata = this._scopeMetadataProvider.getMetadataForScope(rootScopeName);
        var rootMetadata = ScopeListElement.mergeMetadata(defaultMetadata, null, rawRootMetadata);
        var scopeList = new ScopeListElement(null, rootScopeName, rootMetadata);
        prevState = new StackElement(null, this._rootId, -1, null, scopeList, scopeList);
      } else {
        isFirstLine = false;
        prevState.reset();
      }
      lineText = lineText + "\n";
      var onigLineText = rule_1.createOnigString(lineText);
      var lineLength = rule_1.getString(onigLineText).length;
      var lineTokens = new LineTokens(emitBinaryTokens, lineText, this._tokenTypeMatchers);
      var nextState = _tokenizeString(this, onigLineText, isFirstLine, 0, prevState, lineTokens);
      return {
        lineLength,
        lineTokens,
        ruleStack: nextState
      };
    };
    return Grammar2;
  }()
);
grammar.Grammar = Grammar;
function initGrammar(grammar2, base) {
  grammar2 = utils_1.clone(grammar2);
  grammar2.repository = grammar2.repository || {};
  grammar2.repository.$self = {
    $vscodeTextmateLocation: grammar2.$vscodeTextmateLocation,
    patterns: grammar2.patterns,
    name: grammar2.scopeName
  };
  grammar2.repository.$base = base || grammar2.repository.$self;
  return grammar2;
}
function handleCaptures(grammar2, lineText, isFirstLine, stack, lineTokens, captures, captureIndices) {
  if (captures.length === 0) {
    return;
  }
  var len = Math.min(captures.length, captureIndices.length);
  var localStack = [];
  var maxEnd = captureIndices[0].end;
  for (var i = 0; i < len; i++) {
    var captureRule = captures[i];
    if (captureRule === null) {
      continue;
    }
    var captureIndex = captureIndices[i];
    if (captureIndex.length === 0) {
      continue;
    }
    if (captureIndex.start > maxEnd) {
      break;
    }
    while (localStack.length > 0 && localStack[localStack.length - 1].endPos <= captureIndex.start) {
      lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
      localStack.pop();
    }
    if (localStack.length > 0) {
      lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, captureIndex.start);
    } else {
      lineTokens.produce(stack, captureIndex.start);
    }
    if (captureRule.retokenizeCapturedWithRuleId) {
      var scopeName = captureRule.getName(rule_1.getString(lineText), captureIndices);
      var nameScopesList = stack.contentNameScopesList.push(grammar2, scopeName);
      var contentName = captureRule.getContentName(rule_1.getString(lineText), captureIndices);
      var contentNameScopesList = nameScopesList.push(grammar2, contentName);
      var stackClone = stack.push(captureRule.retokenizeCapturedWithRuleId, captureIndex.start, null, nameScopesList, contentNameScopesList);
      _tokenizeString(grammar2, rule_1.createOnigString(rule_1.getString(lineText).substring(0, captureIndex.end)), isFirstLine && captureIndex.start === 0, captureIndex.start, stackClone, lineTokens);
      continue;
    }
    var captureRuleScopeName = captureRule.getName(rule_1.getString(lineText), captureIndices);
    if (captureRuleScopeName !== null) {
      var base = localStack.length > 0 ? localStack[localStack.length - 1].scopes : stack.contentNameScopesList;
      var captureRuleScopesList = base.push(grammar2, captureRuleScopeName);
      localStack.push(new LocalStackElement(captureRuleScopesList, captureIndex.end));
    }
  }
  while (localStack.length > 0) {
    lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
    localStack.pop();
  }
}
function debugCompiledRuleToString(ruleScanner) {
  var r = [];
  for (var i = 0, len = ruleScanner.rules.length; i < len; i++) {
    r.push("   - " + ruleScanner.rules[i] + ": " + ruleScanner.debugRegExps[i]);
  }
  return r.join("\n");
}
function matchInjections(injections, grammar2, lineText, isFirstLine, linePos, stack, anchorPosition) {
  var bestMatchRating = Number.MAX_VALUE;
  var bestMatchCaptureIndices = null;
  var bestMatchRuleId;
  var bestMatchResultPriority = 0;
  var scopes = stack.contentNameScopesList.generateScopes();
  for (var i = 0, len = injections.length; i < len; i++) {
    var injection = injections[i];
    if (!injection.matcher(scopes)) {
      continue;
    }
    var ruleScanner = grammar2.getRule(injection.ruleId).compile(grammar2, null, isFirstLine, linePos === anchorPosition);
    var matchResult = ruleScanner.scanner.findNextMatchSync(lineText, linePos);
    if (debug_1$1.IN_DEBUG_MODE) {
      console.log("  scanning for injections");
      console.log(debugCompiledRuleToString(ruleScanner));
    }
    if (!matchResult) {
      continue;
    }
    var matchRating = matchResult.captureIndices[0].start;
    if (matchRating >= bestMatchRating) {
      continue;
    }
    bestMatchRating = matchRating;
    bestMatchCaptureIndices = matchResult.captureIndices;
    bestMatchRuleId = ruleScanner.rules[matchResult.index];
    bestMatchResultPriority = injection.priority;
    if (bestMatchRating === linePos) {
      break;
    }
  }
  if (bestMatchCaptureIndices) {
    return {
      priorityMatch: bestMatchResultPriority === -1,
      captureIndices: bestMatchCaptureIndices,
      matchedRuleId: bestMatchRuleId
    };
  }
  return null;
}
function matchRule(grammar2, lineText, isFirstLine, linePos, stack, anchorPosition) {
  var rule2 = stack.getRule(grammar2);
  var ruleScanner = rule2.compile(grammar2, stack.endRule, isFirstLine, linePos === anchorPosition);
  var r = ruleScanner.scanner.findNextMatchSync(lineText, linePos);
  if (debug_1$1.IN_DEBUG_MODE) {
    console.log("  scanning for");
    console.log(debugCompiledRuleToString(ruleScanner));
  }
  if (r) {
    return {
      captureIndices: r.captureIndices,
      matchedRuleId: ruleScanner.rules[r.index]
    };
  }
  return null;
}
function matchRuleOrInjections(grammar2, lineText, isFirstLine, linePos, stack, anchorPosition) {
  var matchResult = matchRule(grammar2, lineText, isFirstLine, linePos, stack, anchorPosition);
  var injections = grammar2.getInjections();
  if (injections.length === 0) {
    return matchResult;
  }
  var injectionResult = matchInjections(injections, grammar2, lineText, isFirstLine, linePos, stack, anchorPosition);
  if (!injectionResult) {
    return matchResult;
  }
  if (!matchResult) {
    return injectionResult;
  }
  var matchResultScore = matchResult.captureIndices[0].start;
  var injectionResultScore = injectionResult.captureIndices[0].start;
  if (injectionResultScore < matchResultScore || injectionResult.priorityMatch && injectionResultScore === matchResultScore) {
    return injectionResult;
  }
  return matchResult;
}
function _checkWhileConditions(grammar2, lineText, isFirstLine, linePos, stack, lineTokens) {
  var anchorPosition = -1;
  var whileRules = [];
  for (var node = stack; node; node = node.pop()) {
    var nodeRule = node.getRule(grammar2);
    if (nodeRule instanceof rule_1.BeginWhileRule) {
      whileRules.push({
        rule: nodeRule,
        stack: node
      });
    }
  }
  for (var whileRule = whileRules.pop(); whileRule; whileRule = whileRules.pop()) {
    var ruleScanner = whileRule.rule.compileWhile(grammar2, whileRule.stack.endRule, isFirstLine, anchorPosition === linePos);
    var r = ruleScanner.scanner.findNextMatchSync(lineText, linePos);
    if (debug_1$1.IN_DEBUG_MODE) {
      console.log("  scanning for while rule");
      console.log(debugCompiledRuleToString(ruleScanner));
    }
    if (r) {
      var matchedRuleId = ruleScanner.rules[r.index];
      if (matchedRuleId !== -2) {
        stack = whileRule.stack.pop();
        break;
      }
      if (r.captureIndices && r.captureIndices.length) {
        lineTokens.produce(whileRule.stack, r.captureIndices[0].start);
        handleCaptures(grammar2, lineText, isFirstLine, whileRule.stack, lineTokens, whileRule.rule.whileCaptures, r.captureIndices);
        lineTokens.produce(whileRule.stack, r.captureIndices[0].end);
        anchorPosition = r.captureIndices[0].end;
        if (r.captureIndices[0].end > linePos) {
          linePos = r.captureIndices[0].end;
          isFirstLine = false;
        }
      }
    } else {
      stack = whileRule.stack.pop();
      break;
    }
  }
  return { stack, linePos, anchorPosition, isFirstLine };
}
function _tokenizeString(grammar2, lineText, isFirstLine, linePos, stack, lineTokens) {
  var lineLength = rule_1.getString(lineText).length;
  var STOP = false;
  var whileCheckResult = _checkWhileConditions(grammar2, lineText, isFirstLine, linePos, stack, lineTokens);
  stack = whileCheckResult.stack;
  linePos = whileCheckResult.linePos;
  isFirstLine = whileCheckResult.isFirstLine;
  var anchorPosition = whileCheckResult.anchorPosition;
  while (!STOP) {
    scanNext();
  }
  function scanNext() {
    if (debug_1$1.IN_DEBUG_MODE) {
      console.log("");
      console.log("@@scanNext: |" + rule_1.getString(lineText).replace(/\n$/, "\\n").substr(linePos) + "|");
    }
    var r = matchRuleOrInjections(grammar2, lineText, isFirstLine, linePos, stack, anchorPosition);
    if (!r) {
      if (debug_1$1.IN_DEBUG_MODE) {
        console.log("  no more matches.");
      }
      lineTokens.produce(stack, lineLength);
      STOP = true;
      return;
    }
    var captureIndices = r.captureIndices;
    var matchedRuleId = r.matchedRuleId;
    var hasAdvanced = captureIndices && captureIndices.length > 0 ? captureIndices[0].end > linePos : false;
    if (matchedRuleId === -1) {
      var poppedRule = stack.getRule(grammar2);
      if (debug_1$1.IN_DEBUG_MODE) {
        console.log("  popping " + poppedRule.debugName + " - " + poppedRule.debugEndRegExp);
      }
      lineTokens.produce(stack, captureIndices[0].start);
      stack = stack.setContentNameScopesList(stack.nameScopesList);
      handleCaptures(grammar2, lineText, isFirstLine, stack, lineTokens, poppedRule.endCaptures, captureIndices);
      lineTokens.produce(stack, captureIndices[0].end);
      var popped = stack;
      stack = stack.pop();
      if (!hasAdvanced && popped.getEnterPos() === linePos) {
        console.error("[1] - Grammar is in an endless loop - Grammar pushed & popped a rule without advancing");
        stack = popped;
        lineTokens.produce(stack, lineLength);
        STOP = true;
        return;
      }
    } else {
      var _rule = grammar2.getRule(matchedRuleId);
      lineTokens.produce(stack, captureIndices[0].start);
      var beforePush = stack;
      var scopeName = _rule.getName(rule_1.getString(lineText), captureIndices);
      var nameScopesList = stack.contentNameScopesList.push(grammar2, scopeName);
      stack = stack.push(matchedRuleId, linePos, null, nameScopesList, nameScopesList);
      if (_rule instanceof rule_1.BeginEndRule) {
        var pushedRule = _rule;
        if (debug_1$1.IN_DEBUG_MODE) {
          console.log("  pushing " + pushedRule.debugName + " - " + pushedRule.debugBeginRegExp);
        }
        handleCaptures(grammar2, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
        lineTokens.produce(stack, captureIndices[0].end);
        anchorPosition = captureIndices[0].end;
        var contentName = pushedRule.getContentName(rule_1.getString(lineText), captureIndices);
        var contentNameScopesList = nameScopesList.push(grammar2, contentName);
        stack = stack.setContentNameScopesList(contentNameScopesList);
        if (pushedRule.endHasBackReferences) {
          stack = stack.setEndRule(pushedRule.getEndWithResolvedBackReferences(rule_1.getString(lineText), captureIndices));
        }
        if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
          console.error("[2] - Grammar is in an endless loop - Grammar pushed the same rule without advancing");
          stack = stack.pop();
          lineTokens.produce(stack, lineLength);
          STOP = true;
          return;
        }
      } else if (_rule instanceof rule_1.BeginWhileRule) {
        var pushedRule = _rule;
        if (debug_1$1.IN_DEBUG_MODE) {
          console.log("  pushing " + pushedRule.debugName);
        }
        handleCaptures(grammar2, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
        lineTokens.produce(stack, captureIndices[0].end);
        anchorPosition = captureIndices[0].end;
        var contentName = pushedRule.getContentName(rule_1.getString(lineText), captureIndices);
        var contentNameScopesList = nameScopesList.push(grammar2, contentName);
        stack = stack.setContentNameScopesList(contentNameScopesList);
        if (pushedRule.whileHasBackReferences) {
          stack = stack.setEndRule(pushedRule.getWhileWithResolvedBackReferences(rule_1.getString(lineText), captureIndices));
        }
        if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
          console.error("[3] - Grammar is in an endless loop - Grammar pushed the same rule without advancing");
          stack = stack.pop();
          lineTokens.produce(stack, lineLength);
          STOP = true;
          return;
        }
      } else {
        var matchingRule = _rule;
        if (debug_1$1.IN_DEBUG_MODE) {
          console.log("  matched " + matchingRule.debugName + " - " + matchingRule.debugMatchRegExp);
        }
        handleCaptures(grammar2, lineText, isFirstLine, stack, lineTokens, matchingRule.captures, captureIndices);
        lineTokens.produce(stack, captureIndices[0].end);
        stack = stack.pop();
        if (!hasAdvanced) {
          console.error("[4] - Grammar is in an endless loop - Grammar is not advancing, nor is it pushing/popping");
          stack = stack.safePop();
          lineTokens.produce(stack, lineLength);
          STOP = true;
          return;
        }
      }
    }
    if (captureIndices[0].end > linePos) {
      linePos = captureIndices[0].end;
      isFirstLine = false;
    }
  }
  return stack;
}
var StackElementMetadata = (
  /** @class */
  function() {
    function StackElementMetadata2() {
    }
    StackElementMetadata2.toBinaryStr = function(metadata) {
      var r = metadata.toString(2);
      while (r.length < 32) {
        r = "0" + r;
      }
      return r;
    };
    StackElementMetadata2.printMetadata = function(metadata) {
      var languageId = StackElementMetadata2.getLanguageId(metadata);
      var tokenType = StackElementMetadata2.getTokenType(metadata);
      var fontStyle = StackElementMetadata2.getFontStyle(metadata);
      var foreground = StackElementMetadata2.getForeground(metadata);
      var background = StackElementMetadata2.getBackground(metadata);
      console.log({
        languageId,
        tokenType,
        fontStyle,
        foreground,
        background
      });
    };
    StackElementMetadata2.getLanguageId = function(metadata) {
      return (metadata & 255) >>> 0;
    };
    StackElementMetadata2.getTokenType = function(metadata) {
      return (metadata & 1792) >>> 8;
    };
    StackElementMetadata2.getFontStyle = function(metadata) {
      return (metadata & 14336) >>> 11;
    };
    StackElementMetadata2.getForeground = function(metadata) {
      return (metadata & 8372224) >>> 14;
    };
    StackElementMetadata2.getBackground = function(metadata) {
      return (metadata & 4286578688) >>> 23;
    };
    StackElementMetadata2.set = function(metadata, languageId, tokenType, fontStyle, foreground, background) {
      var _languageId = StackElementMetadata2.getLanguageId(metadata);
      var _tokenType = StackElementMetadata2.getTokenType(metadata);
      var _fontStyle = StackElementMetadata2.getFontStyle(metadata);
      var _foreground = StackElementMetadata2.getForeground(metadata);
      var _background = StackElementMetadata2.getBackground(metadata);
      if (languageId !== 0) {
        _languageId = languageId;
      }
      if (tokenType !== 0) {
        _tokenType = tokenType === 8 ? 0 : tokenType;
      }
      if (fontStyle !== -1) {
        _fontStyle = fontStyle;
      }
      if (foreground !== 0) {
        _foreground = foreground;
      }
      if (background !== 0) {
        _background = background;
      }
      return (_languageId << 0 | _tokenType << 8 | _fontStyle << 11 | _foreground << 14 | _background << 23) >>> 0;
    };
    return StackElementMetadata2;
  }()
);
grammar.StackElementMetadata = StackElementMetadata;
var ScopeListElement = (
  /** @class */
  function() {
    function ScopeListElement2(parent, scope, metadata) {
      this.parent = parent;
      this.scope = scope;
      this.metadata = metadata;
    }
    ScopeListElement2._equals = function(a, b) {
      do {
        if (a === b) {
          return true;
        }
        if (a.scope !== b.scope || a.metadata !== b.metadata) {
          return false;
        }
        a = a.parent;
        b = b.parent;
        if (!a && !b) {
          return true;
        }
        if (!a || !b) {
          return false;
        }
      } while (true);
    };
    ScopeListElement2.prototype.equals = function(other) {
      return ScopeListElement2._equals(this, other);
    };
    ScopeListElement2._matchesScope = function(scope, selector, selectorWithDot) {
      return selector === scope || scope.substring(0, selectorWithDot.length) === selectorWithDot;
    };
    ScopeListElement2._matches = function(target, parentScopes) {
      if (parentScopes === null) {
        return true;
      }
      var len = parentScopes.length;
      var index = 0;
      var selector = parentScopes[index];
      var selectorWithDot = selector + ".";
      while (target) {
        if (this._matchesScope(target.scope, selector, selectorWithDot)) {
          index++;
          if (index === len) {
            return true;
          }
          selector = parentScopes[index];
          selectorWithDot = selector + ".";
        }
        target = target.parent;
      }
      return false;
    };
    ScopeListElement2.mergeMetadata = function(metadata, scopesList, source) {
      if (source === null) {
        return metadata;
      }
      var fontStyle = -1;
      var foreground = 0;
      var background = 0;
      if (source.themeData !== null) {
        for (var i = 0, len = source.themeData.length; i < len; i++) {
          var themeData = source.themeData[i];
          if (this._matches(scopesList, themeData.parentScopes)) {
            fontStyle = themeData.fontStyle;
            foreground = themeData.foreground;
            background = themeData.background;
            break;
          }
        }
      }
      return StackElementMetadata.set(metadata, source.languageId, source.tokenType, fontStyle, foreground, background);
    };
    ScopeListElement2._push = function(target, grammar2, scopes) {
      for (var i = 0, len = scopes.length; i < len; i++) {
        var scope = scopes[i];
        var rawMetadata = grammar2.getMetadataForScope(scope);
        var metadata = ScopeListElement2.mergeMetadata(target.metadata, target, rawMetadata);
        target = new ScopeListElement2(target, scope, metadata);
      }
      return target;
    };
    ScopeListElement2.prototype.push = function(grammar2, scope) {
      if (scope === null) {
        return this;
      }
      if (scope.indexOf(" ") >= 0) {
        return ScopeListElement2._push(this, grammar2, scope.split(/ /g));
      }
      return ScopeListElement2._push(this, grammar2, [scope]);
    };
    ScopeListElement2._generateScopes = function(scopesList) {
      var result = [], resultLen = 0;
      while (scopesList) {
        result[resultLen++] = scopesList.scope;
        scopesList = scopesList.parent;
      }
      result.reverse();
      return result;
    };
    ScopeListElement2.prototype.generateScopes = function() {
      return ScopeListElement2._generateScopes(this);
    };
    return ScopeListElement2;
  }()
);
grammar.ScopeListElement = ScopeListElement;
var StackElement = (
  /** @class */
  function() {
    function StackElement2(parent, ruleId, enterPos, endRule, nameScopesList, contentNameScopesList) {
      this.parent = parent;
      this.depth = this.parent ? this.parent.depth + 1 : 1;
      this.ruleId = ruleId;
      this._enterPos = enterPos;
      this.endRule = endRule;
      this.nameScopesList = nameScopesList;
      this.contentNameScopesList = contentNameScopesList;
    }
    StackElement2._structuralEquals = function(a, b) {
      do {
        if (a === b) {
          return true;
        }
        if (a.depth !== b.depth || a.ruleId !== b.ruleId || a.endRule !== b.endRule) {
          return false;
        }
        a = a.parent;
        b = b.parent;
        if (!a && !b) {
          return true;
        }
        if (!a || !b) {
          return false;
        }
      } while (true);
    };
    StackElement2._equals = function(a, b) {
      if (a === b) {
        return true;
      }
      if (!this._structuralEquals(a, b)) {
        return false;
      }
      return a.contentNameScopesList.equals(b.contentNameScopesList);
    };
    StackElement2.prototype.clone = function() {
      return this;
    };
    StackElement2.prototype.equals = function(other) {
      if (other === null) {
        return false;
      }
      return StackElement2._equals(this, other);
    };
    StackElement2._reset = function(el) {
      while (el) {
        el._enterPos = -1;
        el = el.parent;
      }
    };
    StackElement2.prototype.reset = function() {
      StackElement2._reset(this);
    };
    StackElement2.prototype.pop = function() {
      return this.parent;
    };
    StackElement2.prototype.safePop = function() {
      if (this.parent) {
        return this.parent;
      }
      return this;
    };
    StackElement2.prototype.push = function(ruleId, enterPos, endRule, nameScopesList, contentNameScopesList) {
      return new StackElement2(this, ruleId, enterPos, endRule, nameScopesList, contentNameScopesList);
    };
    StackElement2.prototype.getEnterPos = function() {
      return this._enterPos;
    };
    StackElement2.prototype.getRule = function(grammar2) {
      return grammar2.getRule(this.ruleId);
    };
    StackElement2.prototype._writeString = function(res, outIndex) {
      if (this.parent) {
        outIndex = this.parent._writeString(res, outIndex);
      }
      res[outIndex++] = "(" + this.ruleId + ", TODO-" + this.nameScopesList + ", TODO-" + this.contentNameScopesList + ")";
      return outIndex;
    };
    StackElement2.prototype.toString = function() {
      var r = [];
      this._writeString(r, 0);
      return "[" + r.join(",") + "]";
    };
    StackElement2.prototype.setContentNameScopesList = function(contentNameScopesList) {
      if (this.contentNameScopesList === contentNameScopesList) {
        return this;
      }
      return this.parent.push(this.ruleId, this._enterPos, this.endRule, this.nameScopesList, contentNameScopesList);
    };
    StackElement2.prototype.setEndRule = function(endRule) {
      if (this.endRule === endRule) {
        return this;
      }
      return new StackElement2(this.parent, this.ruleId, this._enterPos, endRule, this.nameScopesList, this.contentNameScopesList);
    };
    StackElement2.prototype.hasSameRuleAs = function(other) {
      return this.ruleId === other.ruleId;
    };
    StackElement2.NULL = new StackElement2(null, 0, 0, null, null, null);
    return StackElement2;
  }()
);
grammar.StackElement = StackElement;
var LocalStackElement = (
  /** @class */
  function() {
    function LocalStackElement2(scopes, endPos) {
      this.scopes = scopes;
      this.endPos = endPos;
    }
    return LocalStackElement2;
  }()
);
grammar.LocalStackElement = LocalStackElement;
var LineTokens = (
  /** @class */
  function() {
    function LineTokens2(emitBinaryTokens, lineText, tokenTypeOverrides) {
      this._emitBinaryTokens = emitBinaryTokens;
      this._tokenTypeOverrides = tokenTypeOverrides;
      if (debug_1$1.IN_DEBUG_MODE) {
        this._lineText = lineText;
      }
      if (this._emitBinaryTokens) {
        this._binaryTokens = [];
      } else {
        this._tokens = [];
      }
      this._lastTokenEndIndex = 0;
    }
    LineTokens2.prototype.produce = function(stack, endIndex) {
      this.produceFromScopes(stack.contentNameScopesList, endIndex);
    };
    LineTokens2.prototype.produceFromScopes = function(scopesList, endIndex) {
      if (this._lastTokenEndIndex >= endIndex) {
        return;
      }
      if (this._emitBinaryTokens) {
        var metadata = scopesList.metadata;
        for (var _i = 0, _a = this._tokenTypeOverrides; _i < _a.length; _i++) {
          var tokenType = _a[_i];
          if (tokenType.matcher(scopesList.generateScopes())) {
            metadata = StackElementMetadata.set(metadata, 0, toTemporaryType(tokenType.type), -1, 0, 0);
          }
        }
        if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 1] === metadata) {
          this._lastTokenEndIndex = endIndex;
          return;
        }
        this._binaryTokens.push(this._lastTokenEndIndex);
        this._binaryTokens.push(metadata);
        this._lastTokenEndIndex = endIndex;
        return;
      }
      var scopes = scopesList.generateScopes();
      if (debug_1$1.IN_DEBUG_MODE) {
        console.log("  token: |" + this._lineText.substring(this._lastTokenEndIndex, endIndex).replace(/\n$/, "\\n") + "|");
        for (var k = 0; k < scopes.length; k++) {
          console.log("      * " + scopes[k]);
        }
      }
      this._tokens.push({
        startIndex: this._lastTokenEndIndex,
        endIndex,
        // value: lineText.substring(lastTokenEndIndex, endIndex),
        scopes
      });
      this._lastTokenEndIndex = endIndex;
    };
    LineTokens2.prototype.getResult = function(stack, lineLength) {
      if (this._tokens.length > 0 && this._tokens[this._tokens.length - 1].startIndex === lineLength - 1) {
        this._tokens.pop();
      }
      if (this._tokens.length === 0) {
        this._lastTokenEndIndex = -1;
        this.produce(stack, lineLength);
        this._tokens[this._tokens.length - 1].startIndex = 0;
      }
      return this._tokens;
    };
    LineTokens2.prototype.getBinaryResult = function(stack, lineLength) {
      if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === lineLength - 1) {
        this._binaryTokens.pop();
        this._binaryTokens.pop();
      }
      if (this._binaryTokens.length === 0) {
        this._lastTokenEndIndex = -1;
        this.produce(stack, lineLength);
        this._binaryTokens[this._binaryTokens.length - 2] = 0;
      }
      var result = new Uint32Array(this._binaryTokens.length);
      for (var i = 0, len = this._binaryTokens.length; i < len; i++) {
        result[i] = this._binaryTokens[i];
      }
      return result;
    };
    return LineTokens2;
  }()
);
function toTemporaryType(standardType) {
  switch (standardType) {
    case 4:
      return 4;
    case 2:
      return 2;
    case 1:
      return 1;
    case 0:
    default:
      return 8;
  }
}
Object.defineProperty(registry, "__esModule", { value: true });
var grammar_1$1 = grammar;
var SyncRegistry = (
  /** @class */
  function() {
    function SyncRegistry2(theme2) {
      this._theme = theme2;
      this._grammars = {};
      this._rawGrammars = {};
      this._injectionGrammars = {};
    }
    SyncRegistry2.prototype.setTheme = function(theme2) {
      var _this = this;
      this._theme = theme2;
      Object.keys(this._grammars).forEach(function(scopeName) {
        var grammar2 = _this._grammars[scopeName];
        grammar2.onDidChangeTheme();
      });
    };
    SyncRegistry2.prototype.getColorMap = function() {
      return this._theme.getColorMap();
    };
    SyncRegistry2.prototype.addGrammar = function(grammar2, injectionScopeNames) {
      this._rawGrammars[grammar2.scopeName] = grammar2;
      var includedScopes = {};
      grammar_1$1.collectIncludedScopes(includedScopes, grammar2);
      if (injectionScopeNames) {
        this._injectionGrammars[grammar2.scopeName] = injectionScopeNames;
        injectionScopeNames.forEach(function(scopeName) {
          includedScopes[scopeName] = true;
        });
      }
      return Object.keys(includedScopes);
    };
    SyncRegistry2.prototype.lookup = function(scopeName) {
      return this._rawGrammars[scopeName];
    };
    SyncRegistry2.prototype.injections = function(targetScope) {
      return this._injectionGrammars[targetScope];
    };
    SyncRegistry2.prototype.getDefaults = function() {
      return this._theme.getDefaults();
    };
    SyncRegistry2.prototype.themeMatch = function(scopeName) {
      return this._theme.match(scopeName);
    };
    SyncRegistry2.prototype.grammarForScopeName = function(scopeName, initialLanguage, embeddedLanguages, tokenTypes) {
      if (!this._grammars[scopeName]) {
        var rawGrammar = this._rawGrammars[scopeName];
        if (!rawGrammar) {
          return null;
        }
        this._grammars[scopeName] = grammar_1$1.createGrammar(rawGrammar, initialLanguage, embeddedLanguages, tokenTypes, this);
      }
      return this._grammars[scopeName];
    };
    return SyncRegistry2;
  }()
);
registry.SyncRegistry = SyncRegistry;
var grammarReader = {};
var main = {};
main.__esModule = true;
main.parse = main.parseWithLocation = void 0;
function parseWithLocation(content, filename, locationKeyName) {
  return _parse(content, filename, locationKeyName);
}
main.parseWithLocation = parseWithLocation;
function parse$1(content) {
  return _parse(content, null, null);
}
main.parse = parse$1;
function _parse(content, filename, locationKeyName) {
  var len = content.length;
  var pos = 0;
  var line = 1;
  var char = 0;
  if (len > 0 && content.charCodeAt(0) === 65279) {
    pos = 1;
  }
  function advancePosBy(by) {
    if (locationKeyName === null) {
      pos = pos + by;
    } else {
      while (by > 0) {
        var chCode2 = content.charCodeAt(pos);
        if (chCode2 === 10) {
          pos++;
          line++;
          char = 0;
        } else {
          pos++;
          char++;
        }
        by--;
      }
    }
  }
  function advancePosTo(to) {
    if (locationKeyName === null) {
      pos = to;
    } else {
      advancePosBy(to - pos);
    }
  }
  function skipWhitespace() {
    while (pos < len) {
      var chCode2 = content.charCodeAt(pos);
      if (chCode2 !== 32 && chCode2 !== 9 && chCode2 !== 13 && chCode2 !== 10) {
        break;
      }
      advancePosBy(1);
    }
  }
  function advanceIfStartsWith(str) {
    if (content.substr(pos, str.length) === str) {
      advancePosBy(str.length);
      return true;
    }
    return false;
  }
  function advanceUntil(str) {
    var nextOccurence = content.indexOf(str, pos);
    if (nextOccurence !== -1) {
      advancePosTo(nextOccurence + str.length);
    } else {
      advancePosTo(len);
    }
  }
  function captureUntil(str) {
    var nextOccurence = content.indexOf(str, pos);
    if (nextOccurence !== -1) {
      var r = content.substring(pos, nextOccurence);
      advancePosTo(nextOccurence + str.length);
      return r;
    } else {
      var r = content.substr(pos);
      advancePosTo(len);
      return r;
    }
  }
  var state = 0;
  var cur = null;
  var stateStack = [];
  var objStack = [];
  var curKey = null;
  function pushState(newState, newCur) {
    stateStack.push(state);
    objStack.push(cur);
    state = newState;
    cur = newCur;
  }
  function popState() {
    if (stateStack.length === 0) {
      return fail("illegal state stack");
    }
    state = stateStack.pop();
    cur = objStack.pop();
  }
  function fail(msg) {
    throw new Error("Near offset " + pos + ": " + msg + " ~~~" + content.substr(pos, 50) + "~~~");
  }
  var dictState = {
    enterDict: function() {
      if (curKey === null) {
        return fail("missing <key>");
      }
      var newDict = {};
      if (locationKeyName !== null) {
        newDict[locationKeyName] = {
          filename,
          line,
          char
        };
      }
      cur[curKey] = newDict;
      curKey = null;
      pushState(1, newDict);
    },
    enterArray: function() {
      if (curKey === null) {
        return fail("missing <key>");
      }
      var newArr = [];
      cur[curKey] = newArr;
      curKey = null;
      pushState(2, newArr);
    }
  };
  var arrState = {
    enterDict: function() {
      var newDict = {};
      if (locationKeyName !== null) {
        newDict[locationKeyName] = {
          filename,
          line,
          char
        };
      }
      cur.push(newDict);
      pushState(1, newDict);
    },
    enterArray: function() {
      var newArr = [];
      cur.push(newArr);
      pushState(2, newArr);
    }
  };
  function enterDict() {
    if (state === 1) {
      dictState.enterDict();
    } else if (state === 2) {
      arrState.enterDict();
    } else {
      cur = {};
      if (locationKeyName !== null) {
        cur[locationKeyName] = {
          filename,
          line,
          char
        };
      }
      pushState(1, cur);
    }
  }
  function leaveDict() {
    if (state === 1) {
      popState();
    } else if (state === 2) {
      return fail("unexpected </dict>");
    } else {
      return fail("unexpected </dict>");
    }
  }
  function enterArray() {
    if (state === 1) {
      dictState.enterArray();
    } else if (state === 2) {
      arrState.enterArray();
    } else {
      cur = [];
      pushState(2, cur);
    }
  }
  function leaveArray() {
    if (state === 1) {
      return fail("unexpected </array>");
    } else if (state === 2) {
      popState();
    } else {
      return fail("unexpected </array>");
    }
  }
  function acceptKey(val) {
    if (state === 1) {
      if (curKey !== null) {
        return fail("too many <key>");
      }
      curKey = val;
    } else if (state === 2) {
      return fail("unexpected <key>");
    } else {
      return fail("unexpected <key>");
    }
  }
  function acceptString(val) {
    if (state === 1) {
      if (curKey === null) {
        return fail("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function acceptReal(val) {
    if (isNaN(val)) {
      return fail("cannot parse float");
    }
    if (state === 1) {
      if (curKey === null) {
        return fail("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function acceptInteger(val) {
    if (isNaN(val)) {
      return fail("cannot parse integer");
    }
    if (state === 1) {
      if (curKey === null) {
        return fail("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function acceptDate(val) {
    if (state === 1) {
      if (curKey === null) {
        return fail("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function acceptData(val) {
    if (state === 1) {
      if (curKey === null) {
        return fail("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function acceptBool(val) {
    if (state === 1) {
      if (curKey === null) {
        return fail("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function escapeVal(str) {
    return str.replace(/&#([0-9]+);/g, function(_, m0) {
      return String.fromCodePoint(parseInt(m0, 10));
    }).replace(/&#x([0-9a-f]+);/g, function(_, m0) {
      return String.fromCodePoint(parseInt(m0, 16));
    }).replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, function(_) {
      switch (_) {
        case "&amp;":
          return "&";
        case "&lt;":
          return "<";
        case "&gt;":
          return ">";
        case "&quot;":
          return '"';
        case "&apos;":
          return "'";
      }
      return _;
    });
  }
  function parseOpenTag() {
    var r = captureUntil(">");
    var isClosed = false;
    if (r.charCodeAt(r.length - 1) === 47) {
      isClosed = true;
      r = r.substring(0, r.length - 1);
    }
    return {
      name: r.trim(),
      isClosed
    };
  }
  function parseTagValue(tag2) {
    if (tag2.isClosed) {
      return "";
    }
    var val = captureUntil("</");
    advanceUntil(">");
    return escapeVal(val);
  }
  while (pos < len) {
    skipWhitespace();
    if (pos >= len) {
      break;
    }
    var chCode = content.charCodeAt(pos);
    advancePosBy(1);
    if (chCode !== 60) {
      return fail("expected <");
    }
    if (pos >= len) {
      return fail("unexpected end of input");
    }
    var peekChCode = content.charCodeAt(pos);
    if (peekChCode === 63) {
      advancePosBy(1);
      advanceUntil("?>");
      continue;
    }
    if (peekChCode === 33) {
      advancePosBy(1);
      if (advanceIfStartsWith("--")) {
        advanceUntil("-->");
        continue;
      }
      advanceUntil(">");
      continue;
    }
    if (peekChCode === 47) {
      advancePosBy(1);
      skipWhitespace();
      if (advanceIfStartsWith("plist")) {
        advanceUntil(">");
        continue;
      }
      if (advanceIfStartsWith("dict")) {
        advanceUntil(">");
        leaveDict();
        continue;
      }
      if (advanceIfStartsWith("array")) {
        advanceUntil(">");
        leaveArray();
        continue;
      }
      return fail("unexpected closed tag");
    }
    var tag = parseOpenTag();
    switch (tag.name) {
      case "dict":
        enterDict();
        if (tag.isClosed) {
          leaveDict();
        }
        continue;
      case "array":
        enterArray();
        if (tag.isClosed) {
          leaveArray();
        }
        continue;
      case "key":
        acceptKey(parseTagValue(tag));
        continue;
      case "string":
        acceptString(parseTagValue(tag));
        continue;
      case "real":
        acceptReal(parseFloat(parseTagValue(tag)));
        continue;
      case "integer":
        acceptInteger(parseInt(parseTagValue(tag), 10));
        continue;
      case "date":
        acceptDate(new Date(parseTagValue(tag)));
        continue;
      case "data":
        acceptData(parseTagValue(tag));
        continue;
      case "true":
        parseTagValue(tag);
        acceptBool(true);
        continue;
      case "false":
        parseTagValue(tag);
        acceptBool(false);
        continue;
    }
    if (/^plist/.test(tag.name)) {
      continue;
    }
    return fail("unexpected opened tag " + tag.name);
  }
  return cur;
}
var json = {};
Object.defineProperty(json, "__esModule", { value: true });
function doFail(streamState, msg) {
  throw new Error("Near offset " + streamState.pos + ": " + msg + " ~~~" + streamState.source.substr(streamState.pos, 50) + "~~~");
}
function parse(source, filename, withMetadata) {
  var streamState = new JSONStreamState(source);
  var token = new JSONToken();
  var state = 0;
  var cur = null;
  var stateStack = [];
  var objStack = [];
  function pushState() {
    stateStack.push(state);
    objStack.push(cur);
  }
  function popState() {
    state = stateStack.pop();
    cur = objStack.pop();
  }
  function fail(msg) {
    doFail(streamState, msg);
  }
  while (nextJSONToken(streamState, token)) {
    if (state === 0) {
      if (cur !== null) {
        fail("too many constructs in root");
      }
      if (token.type === 3) {
        cur = {};
        if (withMetadata) {
          cur.$vscodeTextmateLocation = token.toLocation(filename);
        }
        pushState();
        state = 1;
        continue;
      }
      if (token.type === 2) {
        cur = [];
        pushState();
        state = 4;
        continue;
      }
      fail("unexpected token in root");
    }
    if (state === 2) {
      if (token.type === 5) {
        popState();
        continue;
      }
      if (token.type === 7) {
        state = 3;
        continue;
      }
      fail("expected , or }");
    }
    if (state === 1 || state === 3) {
      if (state === 1 && token.type === 5) {
        popState();
        continue;
      }
      if (token.type === 1) {
        var keyValue = token.value;
        if (!nextJSONToken(streamState, token) || token.type !== 6) {
          fail("expected colon");
        }
        if (!nextJSONToken(streamState, token)) {
          fail("expected value");
        }
        state = 2;
        if (token.type === 1) {
          cur[keyValue] = token.value;
          continue;
        }
        if (token.type === 8) {
          cur[keyValue] = null;
          continue;
        }
        if (token.type === 9) {
          cur[keyValue] = true;
          continue;
        }
        if (token.type === 10) {
          cur[keyValue] = false;
          continue;
        }
        if (token.type === 11) {
          cur[keyValue] = parseFloat(token.value);
          continue;
        }
        if (token.type === 2) {
          var newArr = [];
          cur[keyValue] = newArr;
          pushState();
          state = 4;
          cur = newArr;
          continue;
        }
        if (token.type === 3) {
          var newDict = {};
          if (withMetadata) {
            newDict.$vscodeTextmateLocation = token.toLocation(filename);
          }
          cur[keyValue] = newDict;
          pushState();
          state = 1;
          cur = newDict;
          continue;
        }
      }
      fail("unexpected token in dict");
    }
    if (state === 5) {
      if (token.type === 4) {
        popState();
        continue;
      }
      if (token.type === 7) {
        state = 6;
        continue;
      }
      fail("expected , or ]");
    }
    if (state === 4 || state === 6) {
      if (state === 4 && token.type === 4) {
        popState();
        continue;
      }
      state = 5;
      if (token.type === 1) {
        cur.push(token.value);
        continue;
      }
      if (token.type === 8) {
        cur.push(null);
        continue;
      }
      if (token.type === 9) {
        cur.push(true);
        continue;
      }
      if (token.type === 10) {
        cur.push(false);
        continue;
      }
      if (token.type === 11) {
        cur.push(parseFloat(token.value));
        continue;
      }
      if (token.type === 2) {
        var newArr = [];
        cur.push(newArr);
        pushState();
        state = 4;
        cur = newArr;
        continue;
      }
      if (token.type === 3) {
        var newDict = {};
        if (withMetadata) {
          newDict.$vscodeTextmateLocation = token.toLocation(filename);
        }
        cur.push(newDict);
        pushState();
        state = 1;
        cur = newDict;
        continue;
      }
      fail("unexpected token in array");
    }
    fail("unknown state");
  }
  if (objStack.length !== 0) {
    fail("unclosed constructs");
  }
  return cur;
}
json.parse = parse;
var JSONStreamState = (
  /** @class */
  function() {
    function JSONStreamState2(source) {
      this.source = source;
      this.pos = 0;
      this.len = source.length;
      this.line = 1;
      this.char = 0;
    }
    return JSONStreamState2;
  }()
);
var JSONToken = (
  /** @class */
  function() {
    function JSONToken2() {
      this.value = null;
      this.offset = -1;
      this.len = -1;
      this.line = -1;
      this.char = -1;
    }
    JSONToken2.prototype.toLocation = function(filename) {
      return {
        filename,
        line: this.line,
        char: this.char
      };
    };
    return JSONToken2;
  }()
);
function nextJSONToken(_state, _out) {
  _out.value = null;
  _out.type = 0;
  _out.offset = -1;
  _out.len = -1;
  _out.line = -1;
  _out.char = -1;
  var source = _state.source;
  var pos = _state.pos;
  var len = _state.len;
  var line = _state.line;
  var char = _state.char;
  var chCode;
  do {
    if (pos >= len) {
      return false;
    }
    chCode = source.charCodeAt(pos);
    if (chCode === 32 || chCode === 9 || chCode === 13) {
      pos++;
      char++;
      continue;
    }
    if (chCode === 10) {
      pos++;
      line++;
      char = 0;
      continue;
    }
    break;
  } while (true);
  _out.offset = pos;
  _out.line = line;
  _out.char = char;
  if (chCode === 34) {
    _out.type = 1;
    pos++;
    char++;
    do {
      if (pos >= len) {
        return false;
      }
      chCode = source.charCodeAt(pos);
      pos++;
      char++;
      if (chCode === 92) {
        pos++;
        char++;
        continue;
      }
      if (chCode === 34) {
        break;
      }
    } while (true);
    _out.value = source.substring(_out.offset + 1, pos - 1).replace(/\\u([0-9A-Fa-f]{4})/g, function(_, m0) {
      return String.fromCodePoint(parseInt(m0, 16));
    }).replace(/\\(.)/g, function(_, m0) {
      switch (m0) {
        case '"':
          return '"';
        case "\\":
          return "\\";
        case "/":
          return "/";
        case "b":
          return "\b";
        case "f":
          return "\f";
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "	";
        default:
          doFail(_state, "invalid escape sequence");
      }
    });
  } else if (chCode === 91) {
    _out.type = 2;
    pos++;
    char++;
  } else if (chCode === 123) {
    _out.type = 3;
    pos++;
    char++;
  } else if (chCode === 93) {
    _out.type = 4;
    pos++;
    char++;
  } else if (chCode === 125) {
    _out.type = 5;
    pos++;
    char++;
  } else if (chCode === 58) {
    _out.type = 6;
    pos++;
    char++;
  } else if (chCode === 44) {
    _out.type = 7;
    pos++;
    char++;
  } else if (chCode === 110) {
    _out.type = 8;
    pos++;
    char++;
    chCode = source.charCodeAt(pos);
    if (chCode !== 117) {
      return false;
    }
    pos++;
    char++;
    chCode = source.charCodeAt(pos);
    if (chCode !== 108) {
      return false;
    }
    pos++;
    char++;
    chCode = source.charCodeAt(pos);
    if (chCode !== 108) {
      return false;
    }
    pos++;
    char++;
  } else if (chCode === 116) {
    _out.type = 9;
    pos++;
    char++;
    chCode = source.charCodeAt(pos);
    if (chCode !== 114) {
      return false;
    }
    pos++;
    char++;
    chCode = source.charCodeAt(pos);
    if (chCode !== 117) {
      return false;
    }
    pos++;
    char++;
    chCode = source.charCodeAt(pos);
    if (chCode !== 101) {
      return false;
    }
    pos++;
    char++;
  } else if (chCode === 102) {
    _out.type = 10;
    pos++;
    char++;
    chCode = source.charCodeAt(pos);
    if (chCode !== 97) {
      return false;
    }
    pos++;
    char++;
    chCode = source.charCodeAt(pos);
    if (chCode !== 108) {
      return false;
    }
    pos++;
    char++;
    chCode = source.charCodeAt(pos);
    if (chCode !== 115) {
      return false;
    }
    pos++;
    char++;
    chCode = source.charCodeAt(pos);
    if (chCode !== 101) {
      return false;
    }
    pos++;
    char++;
  } else {
    _out.type = 11;
    do {
      if (pos >= len) {
        return false;
      }
      chCode = source.charCodeAt(pos);
      if (chCode === 46 || chCode >= 48 && chCode <= 57 || (chCode === 101 || chCode === 69) || (chCode === 45 || chCode === 43)) {
        pos++;
        char++;
        continue;
      }
      break;
    } while (true);
  }
  _out.len = pos - _out.offset;
  if (_out.value === null) {
    _out.value = source.substr(_out.offset, _out.len);
  }
  _state.pos = pos;
  _state.line = line;
  _state.char = char;
  return true;
}
Object.defineProperty(grammarReader, "__esModule", { value: true });
var plist = main;
var debug_1 = debug;
var json_1 = json;
function parseJSONGrammar(contents, filename) {
  if (debug_1.CAPTURE_METADATA) {
    return json_1.parse(contents, filename, true);
  }
  return JSON.parse(contents);
}
grammarReader.parseJSONGrammar = parseJSONGrammar;
function parsePLISTGrammar(contents, filename) {
  if (debug_1.CAPTURE_METADATA) {
    return plist.parseWithLocation(contents, filename, "$vscodeTextmateLocation");
  }
  return plist.parse(contents);
}
grammarReader.parsePLISTGrammar = parsePLISTGrammar;
var theme = {};
Object.defineProperty(theme, "__esModule", { value: true });
var ParsedThemeRule = (
  /** @class */
  function() {
    function ParsedThemeRule2(scope, parentScopes, index, fontStyle, foreground, background) {
      this.scope = scope;
      this.parentScopes = parentScopes;
      this.index = index;
      this.fontStyle = fontStyle;
      this.foreground = foreground;
      this.background = background;
    }
    return ParsedThemeRule2;
  }()
);
theme.ParsedThemeRule = ParsedThemeRule;
function isValidHexColor(hex) {
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return true;
  }
  if (/^#[0-9a-f]{8}$/i.test(hex)) {
    return true;
  }
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    return true;
  }
  if (/^#[0-9a-f]{4}$/i.test(hex)) {
    return true;
  }
  return false;
}
function parseTheme(source) {
  if (!source) {
    return [];
  }
  if (!source.settings || !Array.isArray(source.settings)) {
    return [];
  }
  var settings = source.settings;
  var result = [], resultLen = 0;
  for (var i = 0, len = settings.length; i < len; i++) {
    var entry = settings[i];
    if (!entry.settings) {
      continue;
    }
    var scopes = void 0;
    if (typeof entry.scope === "string") {
      var _scope = entry.scope;
      _scope = _scope.replace(/^[,]+/, "");
      _scope = _scope.replace(/[,]+$/, "");
      scopes = _scope.split(",");
    } else if (Array.isArray(entry.scope)) {
      scopes = entry.scope;
    } else {
      scopes = [""];
    }
    var fontStyle = -1;
    if (typeof entry.settings.fontStyle === "string") {
      fontStyle = 0;
      var segments = entry.settings.fontStyle.split(" ");
      for (var j = 0, lenJ = segments.length; j < lenJ; j++) {
        var segment = segments[j];
        switch (segment) {
          case "italic":
            fontStyle = fontStyle | 1;
            break;
          case "bold":
            fontStyle = fontStyle | 2;
            break;
          case "underline":
            fontStyle = fontStyle | 4;
            break;
        }
      }
    }
    var foreground = null;
    if (typeof entry.settings.foreground === "string" && isValidHexColor(entry.settings.foreground)) {
      foreground = entry.settings.foreground;
    }
    var background = null;
    if (typeof entry.settings.background === "string" && isValidHexColor(entry.settings.background)) {
      background = entry.settings.background;
    }
    for (var j = 0, lenJ = scopes.length; j < lenJ; j++) {
      var _scope = scopes[j].trim();
      var segments = _scope.split(" ");
      var scope = segments[segments.length - 1];
      var parentScopes = null;
      if (segments.length > 1) {
        parentScopes = segments.slice(0, segments.length - 1);
        parentScopes.reverse();
      }
      result[resultLen++] = new ParsedThemeRule(scope, parentScopes, i, fontStyle, foreground, background);
    }
  }
  return result;
}
theme.parseTheme = parseTheme;
function resolveParsedThemeRules(parsedThemeRules) {
  parsedThemeRules.sort(function(a, b) {
    var r = strcmp(a.scope, b.scope);
    if (r !== 0) {
      return r;
    }
    r = strArrCmp(a.parentScopes, b.parentScopes);
    if (r !== 0) {
      return r;
    }
    return a.index - b.index;
  });
  var defaultFontStyle = 0;
  var defaultForeground = "#000000";
  var defaultBackground = "#ffffff";
  while (parsedThemeRules.length >= 1 && parsedThemeRules[0].scope === "") {
    var incomingDefaults = parsedThemeRules.shift();
    if (incomingDefaults.fontStyle !== -1) {
      defaultFontStyle = incomingDefaults.fontStyle;
    }
    if (incomingDefaults.foreground !== null) {
      defaultForeground = incomingDefaults.foreground;
    }
    if (incomingDefaults.background !== null) {
      defaultBackground = incomingDefaults.background;
    }
  }
  var colorMap = new ColorMap();
  var defaults = new ThemeTrieElementRule(0, null, defaultFontStyle, colorMap.getId(defaultForeground), colorMap.getId(defaultBackground));
  var root = new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1, 0, 0), []);
  for (var i = 0, len = parsedThemeRules.length; i < len; i++) {
    var rule2 = parsedThemeRules[i];
    root.insert(0, rule2.scope, rule2.parentScopes, rule2.fontStyle, colorMap.getId(rule2.foreground), colorMap.getId(rule2.background));
  }
  return new Theme(colorMap, defaults, root);
}
var ColorMap = (
  /** @class */
  function() {
    function ColorMap2() {
      this._lastColorId = 0;
      this._id2color = [];
      this._color2id = /* @__PURE__ */ Object.create(null);
    }
    ColorMap2.prototype.getId = function(color) {
      if (color === null) {
        return 0;
      }
      color = color.toUpperCase();
      var value = this._color2id[color];
      if (value) {
        return value;
      }
      value = ++this._lastColorId;
      this._color2id[color] = value;
      this._id2color[value] = color;
      return value;
    };
    ColorMap2.prototype.getColorMap = function() {
      return this._id2color.slice(0);
    };
    return ColorMap2;
  }()
);
theme.ColorMap = ColorMap;
var Theme = (
  /** @class */
  function() {
    function Theme2(colorMap, defaults, root) {
      this._colorMap = colorMap;
      this._root = root;
      this._defaults = defaults;
      this._cache = {};
    }
    Theme2.createFromRawTheme = function(source) {
      return this.createFromParsedTheme(parseTheme(source));
    };
    Theme2.createFromParsedTheme = function(source) {
      return resolveParsedThemeRules(source);
    };
    Theme2.prototype.getColorMap = function() {
      return this._colorMap.getColorMap();
    };
    Theme2.prototype.getDefaults = function() {
      return this._defaults;
    };
    Theme2.prototype.match = function(scopeName) {
      if (!this._cache.hasOwnProperty(scopeName)) {
        this._cache[scopeName] = this._root.match(scopeName);
      }
      return this._cache[scopeName];
    };
    return Theme2;
  }()
);
theme.Theme = Theme;
function strcmp(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}
theme.strcmp = strcmp;
function strArrCmp(a, b) {
  if (a === null && b === null) {
    return 0;
  }
  if (!a) {
    return -1;
  }
  if (!b) {
    return 1;
  }
  var len1 = a.length;
  var len2 = b.length;
  if (len1 === len2) {
    for (var i = 0; i < len1; i++) {
      var res = strcmp(a[i], b[i]);
      if (res !== 0) {
        return res;
      }
    }
    return 0;
  }
  return len1 - len2;
}
theme.strArrCmp = strArrCmp;
var ThemeTrieElementRule = (
  /** @class */
  function() {
    function ThemeTrieElementRule2(scopeDepth, parentScopes, fontStyle, foreground, background) {
      this.scopeDepth = scopeDepth;
      this.parentScopes = parentScopes;
      this.fontStyle = fontStyle;
      this.foreground = foreground;
      this.background = background;
    }
    ThemeTrieElementRule2.prototype.clone = function() {
      return new ThemeTrieElementRule2(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background);
    };
    ThemeTrieElementRule2.cloneArr = function(arr) {
      var r = [];
      for (var i = 0, len = arr.length; i < len; i++) {
        r[i] = arr[i].clone();
      }
      return r;
    };
    ThemeTrieElementRule2.prototype.acceptOverwrite = function(scopeDepth, fontStyle, foreground, background) {
      if (this.scopeDepth > scopeDepth) {
        console.log("how did this happen?");
      } else {
        this.scopeDepth = scopeDepth;
      }
      if (fontStyle !== -1) {
        this.fontStyle = fontStyle;
      }
      if (foreground !== 0) {
        this.foreground = foreground;
      }
      if (background !== 0) {
        this.background = background;
      }
    };
    return ThemeTrieElementRule2;
  }()
);
theme.ThemeTrieElementRule = ThemeTrieElementRule;
var ThemeTrieElement = (
  /** @class */
  function() {
    function ThemeTrieElement2(mainRule, rulesWithParentScopes, children) {
      if (rulesWithParentScopes === void 0) {
        rulesWithParentScopes = [];
      }
      if (children === void 0) {
        children = {};
      }
      this._mainRule = mainRule;
      this._rulesWithParentScopes = rulesWithParentScopes;
      this._children = children;
    }
    ThemeTrieElement2._sortBySpecificity = function(arr) {
      if (arr.length === 1) {
        return arr;
      }
      arr.sort(this._cmpBySpecificity);
      return arr;
    };
    ThemeTrieElement2._cmpBySpecificity = function(a, b) {
      if (a.scopeDepth === b.scopeDepth) {
        var aParentScopes = a.parentScopes;
        var bParentScopes = b.parentScopes;
        var aParentScopesLen = aParentScopes === null ? 0 : aParentScopes.length;
        var bParentScopesLen = bParentScopes === null ? 0 : bParentScopes.length;
        if (aParentScopesLen === bParentScopesLen) {
          for (var i = 0; i < aParentScopesLen; i++) {
            var aLen = aParentScopes[i].length;
            var bLen = bParentScopes[i].length;
            if (aLen !== bLen) {
              return bLen - aLen;
            }
          }
        }
        return bParentScopesLen - aParentScopesLen;
      }
      return b.scopeDepth - a.scopeDepth;
    };
    ThemeTrieElement2.prototype.match = function(scope) {
      if (scope === "") {
        return ThemeTrieElement2._sortBySpecificity([].concat(this._mainRule).concat(this._rulesWithParentScopes));
      }
      var dotIndex = scope.indexOf(".");
      var head;
      var tail;
      if (dotIndex === -1) {
        head = scope;
        tail = "";
      } else {
        head = scope.substring(0, dotIndex);
        tail = scope.substring(dotIndex + 1);
      }
      if (this._children.hasOwnProperty(head)) {
        return this._children[head].match(tail);
      }
      return ThemeTrieElement2._sortBySpecificity([].concat(this._mainRule).concat(this._rulesWithParentScopes));
    };
    ThemeTrieElement2.prototype.insert = function(scopeDepth, scope, parentScopes, fontStyle, foreground, background) {
      if (scope === "") {
        this._doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background);
        return;
      }
      var dotIndex = scope.indexOf(".");
      var head;
      var tail;
      if (dotIndex === -1) {
        head = scope;
        tail = "";
      } else {
        head = scope.substring(0, dotIndex);
        tail = scope.substring(dotIndex + 1);
      }
      var child;
      if (this._children.hasOwnProperty(head)) {
        child = this._children[head];
      } else {
        child = new ThemeTrieElement2(this._mainRule.clone(), ThemeTrieElementRule.cloneArr(this._rulesWithParentScopes));
        this._children[head] = child;
      }
      child.insert(scopeDepth + 1, tail, parentScopes, fontStyle, foreground, background);
    };
    ThemeTrieElement2.prototype._doInsertHere = function(scopeDepth, parentScopes, fontStyle, foreground, background) {
      if (parentScopes === null) {
        this._mainRule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
        return;
      }
      for (var i = 0, len = this._rulesWithParentScopes.length; i < len; i++) {
        var rule2 = this._rulesWithParentScopes[i];
        if (strArrCmp(rule2.parentScopes, parentScopes) === 0) {
          rule2.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
          return;
        }
      }
      if (fontStyle === -1) {
        fontStyle = this._mainRule.fontStyle;
      }
      if (foreground === 0) {
        foreground = this._mainRule.foreground;
      }
      if (background === 0) {
        background = this._mainRule.background;
      }
      this._rulesWithParentScopes.push(new ThemeTrieElementRule(scopeDepth, parentScopes, fontStyle, foreground, background));
    };
    return ThemeTrieElement2;
  }()
);
theme.ThemeTrieElement = ThemeTrieElement;
var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : new P(function(resolve2) {
        resolve2(result.value);
      }).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = commonjsGlobal && commonjsGlobal.__generator || function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(main$1, "__esModule", { value: true });
var registry_1 = registry;
var grammarReader_1 = grammarReader;
var theme_1 = theme;
var grammar_1 = grammar;
var DEFAULT_OPTIONS = {
  getGrammarDefinition: function(scopeName) {
    return null;
  },
  getInjections: function(scopeName) {
    return null;
  }
};
var Registry = (
  /** @class */
  function() {
    function Registry2(locator) {
      if (locator === void 0) {
        locator = DEFAULT_OPTIONS;
      }
      this._locator = locator;
      this._syncRegistry = new registry_1.SyncRegistry(theme_1.Theme.createFromRawTheme(locator.theme));
      this.installationQueue = /* @__PURE__ */ new Map();
    }
    Registry2.prototype.setTheme = function(theme2) {
      this._syncRegistry.setTheme(theme_1.Theme.createFromRawTheme(theme2));
    };
    Registry2.prototype.getColorMap = function() {
      return this._syncRegistry.getColorMap();
    };
    Registry2.prototype.loadGrammarWithEmbeddedLanguages = function(initialScopeName, initialLanguage, embeddedLanguages) {
      return this.loadGrammarWithConfiguration(initialScopeName, initialLanguage, { embeddedLanguages });
    };
    Registry2.prototype.loadGrammarWithConfiguration = function(initialScopeName, initialLanguage, configuration) {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              return [4, this._loadGrammar(initialScopeName)];
            case 1:
              _a.sent();
              return [2, this.grammarForScopeName(initialScopeName, initialLanguage, configuration.embeddedLanguages, configuration.tokenTypes)];
          }
        });
      });
    };
    Registry2.prototype.loadGrammar = function(initialScopeName) {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          return [2, this._loadGrammar(initialScopeName)];
        });
      });
    };
    Registry2.prototype._loadGrammar = function(initialScopeName, dependentScope) {
      if (dependentScope === void 0) {
        dependentScope = null;
      }
      return __awaiter(this, void 0, void 0, function() {
        var prom;
        var _this = this;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              if (this._syncRegistry.lookup(initialScopeName)) {
                return [2, this.grammarForScopeName(initialScopeName)];
              }
              if (this.installationQueue.has(initialScopeName)) {
                return [2, this.installationQueue.get(initialScopeName)];
              }
              prom = new Promise(function(resolve, reject) {
                return __awaiter(_this, void 0, void 0, function() {
                  var grammarDefinition, rawGrammar, injections, deps;
                  var _this2 = this;
                  return __generator(this, function(_a2) {
                    switch (_a2.label) {
                      case 0:
                        return [4, this._locator.getGrammarDefinition(initialScopeName, dependentScope)];
                      case 1:
                        grammarDefinition = _a2.sent();
                        if (!grammarDefinition) {
                          throw new Error("A tmGrammar load was requested but registry host failed to provide grammar definition");
                        }
                        if (grammarDefinition.format !== "json" && grammarDefinition.format !== "plist" || grammarDefinition.format === "json" && typeof grammarDefinition.content !== "object" && typeof grammarDefinition.content !== "string" || grammarDefinition.format === "plist" && typeof grammarDefinition.content !== "string") {
                          throw new TypeError('Grammar definition must be an object, either `{ content: string | object, format: "json" }` OR `{ content: string, format: "plist" }`)');
                        }
                        rawGrammar = grammarDefinition.format === "json" ? typeof grammarDefinition.content === "string" ? grammarReader_1.parseJSONGrammar(grammarDefinition.content, "c://fakepath/grammar.json") : grammarDefinition.content : grammarReader_1.parsePLISTGrammar(grammarDefinition.content, "c://fakepath/grammar.plist");
                        injections = typeof this._locator.getInjections === "function" && this._locator.getInjections(initialScopeName);
                        rawGrammar.scopeName = initialScopeName;
                        deps = this._syncRegistry.addGrammar(rawGrammar, injections);
                        return [4, Promise.all(deps.map(function(scopeNameD) {
                          return __awaiter(_this2, void 0, void 0, function() {
                            return __generator(this, function(_a3) {
                              try {
                                return [2, this._loadGrammar(scopeNameD, initialScopeName)];
                              } catch (error) {
                                throw new Error("While trying to load tmGrammar with scopeId: '" + initialScopeName + "', it's dependency (scopeId: " + scopeNameD + ") loading errored: " + error.message);
                              }
                              return [
                                2
                                /*return*/
                              ];
                            });
                          });
                        }))];
                      case 2:
                        _a2.sent();
                        resolve(this.grammarForScopeName(initialScopeName));
                        return [
                          2
                          /*return*/
                        ];
                    }
                  });
                });
              });
              this.installationQueue.set(initialScopeName, prom);
              return [4, prom];
            case 1:
              _a.sent();
              this.installationQueue.delete(initialScopeName);
              return [2, prom];
          }
        });
      });
    };
    Registry2.prototype.grammarForScopeName = function(scopeName, initialLanguage, embeddedLanguages, tokenTypes) {
      if (initialLanguage === void 0) {
        initialLanguage = 0;
      }
      if (embeddedLanguages === void 0) {
        embeddedLanguages = null;
      }
      if (tokenTypes === void 0) {
        tokenTypes = null;
      }
      return this._syncRegistry.grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes);
    };
    return Registry2;
  }()
);
var Registry_1 = main$1.Registry = Registry;
main$1.INITIAL = grammar_1.StackElement.NULL;
var tmToMonacoToken = {};
Object.defineProperty(tmToMonacoToken, "__esModule", { value: true });
tmToMonacoToken.TMToMonacoToken = void 0;
const TMToMonacoToken = (editor, scopes) => {
  let scopeName = "";
  for (let i = scopes[0].length - 1; i >= 0; i -= 1) {
    const char = scopes[0][i];
    if (char === ".") {
      break;
    }
    scopeName = char + scopeName;
  }
  for (let i = scopes.length - 1; i >= 0; i -= 1) {
    const scope = scopes[i];
    for (let i2 = scope.length - 1; i2 >= 0; i2 -= 1) {
      const char = scope[i2];
      if (char === ".") {
        const token = scope.slice(0, i2);
        if (editor["_themeService"]._theme._tokenTheme._match(token + "." + scopeName)._foreground > 1) {
          return token + "." + scopeName;
        }
        if (editor["_themeService"]._theme._tokenTheme._match(token)._foreground > 1) {
          return token;
        }
      }
    }
  }
  return "";
};
tmToMonacoToken.TMToMonacoToken = TMToMonacoToken;
Object.defineProperty(dist, "__esModule", { value: true });
var wireTmGrammars_1 = dist.wireTmGrammars = void 0;
const monaco_textmate_1 = main$1;
const tm_to_monaco_token_1 = tmToMonacoToken;
class TokenizerState {
  constructor(_ruleStack) {
    __publicField(this, "_ruleStack");
    this._ruleStack = _ruleStack;
  }
  get ruleStack() {
    return this._ruleStack;
  }
  clone() {
    return new TokenizerState(this._ruleStack);
  }
  equals(other) {
    if (!other || !(other instanceof TokenizerState) || other !== this || other._ruleStack !== this._ruleStack) {
      return false;
    }
    return true;
  }
}
function wireTmGrammars(monaco, registry2, languages, editor) {
  return Promise.all(Array.from(languages.keys()).map(async (languageId) => {
    const grammar2 = await registry2.loadGrammar(languages.get(languageId));
    monaco.languages.setTokensProvider(languageId, {
      getInitialState: () => new TokenizerState(monaco_textmate_1.INITIAL),
      tokenize: (line, state) => {
        const res = grammar2.tokenizeLine(line, state.ruleStack);
        return {
          endState: new TokenizerState(res.ruleStack),
          tokens: res.tokens.map((token) => ({
            ...token,
            // TODO: At the moment, monaco-editor doesn't seem to accept array of scopes
            scopes: editor ? (0, tm_to_monaco_token_1.TMToMonacoToken)(editor, token.scopes) : token.scopes[token.scopes.length - 1]
          }))
        };
      }
    });
  }));
}
wireTmGrammars_1 = dist.wireTmGrammars = wireTmGrammars;
async function dispatchGrammars(scopeName) {
  switch (scopeName) {
    case "source.vue":
      return {
        format: "json",
        content: await __vitePreload(() => import("./vue.tmLanguage-db3e7bef.js"), true ? [] : void 0)
      };
    case "source.ts":
      return {
        format: "json",
        content: await __vitePreload(() => import("./typescript.tmLanguage-dd366d35.js"), true ? [] : void 0)
      };
    case "source.js":
      return {
        format: "json",
        content: await __vitePreload(() => import("./javascript.tmLanguage-c9074c03.js"), true ? [] : void 0)
      };
    case "text.html.basic":
      return {
        format: "json",
        content: await __vitePreload(() => import("./html.tmLanguage-c0981371.js"), true ? [] : void 0)
      };
    case "source.css":
      return {
        format: "json",
        content: await __vitePreload(() => import("./css.tmLanguage-4d22e579.js"), true ? [] : void 0)
      };
    default:
      return {
        format: "json",
        content: {
          scopeName: "source",
          patterns: []
        }
      };
  }
}
async function loadGrammars(monaco, editor) {
  const registry2 = new Registry_1({
    getGrammarDefinition: async (scopeName) => {
      const dispatch = await dispatchGrammars(scopeName);
      return JSON.parse(JSON.stringify(dispatch));
    }
  });
  const grammars = /* @__PURE__ */ new Map();
  grammars.set("vue", "source.vue");
  grammars.set("javascript", "source.js");
  grammars.set("typescript", "source.ts");
  grammars.set("css", "source.css");
  grammars.set("html", "text.html.basic");
  for (const lang of grammars.keys()) {
    monaco.languages.register({
      id: lang
    });
  }
  await wireTmGrammars_1(monaco, registry2, grammars, editor);
}
export {
  loadGrammars
};
