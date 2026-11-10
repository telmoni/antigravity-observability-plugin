var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/version.js
var VERSION;
var init_version = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/version.js"() {
    "use strict";
    VERSION = "1.9.1";
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/internal/semver.js
function _makeCompatibilityCheck(ownVersion) {
  const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
  const rejectedVersions = /* @__PURE__ */ new Set();
  const myVersionMatch = ownVersion.match(re);
  if (!myVersionMatch) {
    return () => false;
  }
  const ownVersionParsed = {
    major: +myVersionMatch[1],
    minor: +myVersionMatch[2],
    patch: +myVersionMatch[3],
    prerelease: myVersionMatch[4]
  };
  if (ownVersionParsed.prerelease != null) {
    return function isExactmatch(globalVersion) {
      return globalVersion === ownVersion;
    };
  }
  function _reject(v) {
    rejectedVersions.add(v);
    return false;
  }
  function _accept(v) {
    acceptedVersions.add(v);
    return true;
  }
  return function isCompatible2(globalVersion) {
    if (acceptedVersions.has(globalVersion)) {
      return true;
    }
    if (rejectedVersions.has(globalVersion)) {
      return false;
    }
    const globalVersionMatch = globalVersion.match(re);
    if (!globalVersionMatch) {
      return _reject(globalVersion);
    }
    const globalVersionParsed = {
      major: +globalVersionMatch[1],
      minor: +globalVersionMatch[2],
      patch: +globalVersionMatch[3],
      prerelease: globalVersionMatch[4]
    };
    if (globalVersionParsed.prerelease != null) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major !== globalVersionParsed.major) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major === 0) {
      if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    }
    if (ownVersionParsed.minor <= globalVersionParsed.minor) {
      return _accept(globalVersion);
    }
    return _reject(globalVersion);
  };
}
var re, isCompatible;
var init_semver = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/internal/semver.js"() {
    "use strict";
    init_version();
    re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
    isCompatible = _makeCompatibilityCheck(VERSION);
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/internal/global-utils.js
function registerGlobal(type, instance, diag2, allowOverride = false) {
  var _a;
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a !== void 0 ? _a : {
    version: VERSION
  };
  if (!allowOverride && api[type]) {
    const err = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
    diag2.error(err.stack || err.message);
    return false;
  }
  if (api.version !== VERSION) {
    const err = new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${VERSION}`);
    diag2.error(err.stack || err.message);
    return false;
  }
  api[type] = instance;
  diag2.debug(`@opentelemetry/api: Registered a global for ${type} v${VERSION}.`);
  return true;
}
function getGlobal(type) {
  var _a, _b;
  const globalVersion = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a === void 0 ? void 0 : _a.version;
  if (!globalVersion || !isCompatible(globalVersion)) {
    return;
  }
  return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}
function unregisterGlobal(type, diag2) {
  diag2.debug(`@opentelemetry/api: Unregistering a global for ${type} v${VERSION}.`);
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api) {
    delete api[type];
  }
}
var major, GLOBAL_OPENTELEMETRY_API_KEY, _global;
var init_global_utils = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/internal/global-utils.js"() {
    "use strict";
    init_version();
    init_semver();
    major = VERSION.split(".")[0];
    GLOBAL_OPENTELEMETRY_API_KEY = /* @__PURE__ */ Symbol.for(`opentelemetry.js.api.${major}`);
    _global = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js
function logProxy(funcName, namespace, args) {
  const logger = getGlobal("diag");
  if (!logger) {
    return;
  }
  return logger[funcName](namespace, ...args);
}
var DiagComponentLogger;
var init_ComponentLogger = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js"() {
    "use strict";
    init_global_utils();
    DiagComponentLogger = class {
      constructor(props) {
        this._namespace = props.namespace || "DiagComponentLogger";
      }
      debug(...args) {
        return logProxy("debug", this._namespace, args);
      }
      error(...args) {
        return logProxy("error", this._namespace, args);
      }
      info(...args) {
        return logProxy("info", this._namespace, args);
      }
      warn(...args) {
        return logProxy("warn", this._namespace, args);
      }
      verbose(...args) {
        return logProxy("verbose", this._namespace, args);
      }
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/diag/types.js
var DiagLogLevel;
var init_types = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/diag/types.js"() {
    "use strict";
    (function(DiagLogLevel2) {
      DiagLogLevel2[DiagLogLevel2["NONE"] = 0] = "NONE";
      DiagLogLevel2[DiagLogLevel2["ERROR"] = 30] = "ERROR";
      DiagLogLevel2[DiagLogLevel2["WARN"] = 50] = "WARN";
      DiagLogLevel2[DiagLogLevel2["INFO"] = 60] = "INFO";
      DiagLogLevel2[DiagLogLevel2["DEBUG"] = 70] = "DEBUG";
      DiagLogLevel2[DiagLogLevel2["VERBOSE"] = 80] = "VERBOSE";
      DiagLogLevel2[DiagLogLevel2["ALL"] = 9999] = "ALL";
    })(DiagLogLevel || (DiagLogLevel = {}));
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js
function createLogLevelDiagLogger(maxLevel, logger) {
  if (maxLevel < DiagLogLevel.NONE) {
    maxLevel = DiagLogLevel.NONE;
  } else if (maxLevel > DiagLogLevel.ALL) {
    maxLevel = DiagLogLevel.ALL;
  }
  logger = logger || {};
  function _filterFunc(funcName, theLevel) {
    const theFunc = logger[funcName];
    if (typeof theFunc === "function" && maxLevel >= theLevel) {
      return theFunc.bind(logger);
    }
    return function() {
    };
  }
  return {
    error: _filterFunc("error", DiagLogLevel.ERROR),
    warn: _filterFunc("warn", DiagLogLevel.WARN),
    info: _filterFunc("info", DiagLogLevel.INFO),
    debug: _filterFunc("debug", DiagLogLevel.DEBUG),
    verbose: _filterFunc("verbose", DiagLogLevel.VERBOSE)
  };
}
var init_logLevelLogger = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js"() {
    "use strict";
    init_types();
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/api/diag.js
var API_NAME, DiagAPI;
var init_diag = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/api/diag.js"() {
    "use strict";
    init_ComponentLogger();
    init_logLevelLogger();
    init_types();
    init_global_utils();
    API_NAME = "diag";
    DiagAPI = class _DiagAPI {
      /** Get the singleton instance of the DiagAPI API */
      static instance() {
        if (!this._instance) {
          this._instance = new _DiagAPI();
        }
        return this._instance;
      }
      /**
       * Private internal constructor
       * @private
       */
      constructor() {
        function _logProxy(funcName) {
          return function(...args) {
            const logger = getGlobal("diag");
            if (!logger)
              return;
            return logger[funcName](...args);
          };
        }
        const self2 = this;
        const setLogger = (logger, optionsOrLogLevel = { logLevel: DiagLogLevel.INFO }) => {
          var _a, _b, _c;
          if (logger === self2) {
            const err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
            self2.error((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
            return false;
          }
          if (typeof optionsOrLogLevel === "number") {
            optionsOrLogLevel = {
              logLevel: optionsOrLogLevel
            };
          }
          const oldLogger = getGlobal("diag");
          const newLogger = createLogLevelDiagLogger((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : DiagLogLevel.INFO, logger);
          if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
            const stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
            oldLogger.warn(`Current logger will be overwritten from ${stack}`);
            newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
          }
          return registerGlobal("diag", newLogger, self2, true);
        };
        self2.setLogger = setLogger;
        self2.disable = () => {
          unregisterGlobal(API_NAME, self2);
        };
        self2.createComponentLogger = (options) => {
          return new DiagComponentLogger(options);
        };
        self2.verbose = _logProxy("verbose");
        self2.debug = _logProxy("debug");
        self2.info = _logProxy("info");
        self2.warn = _logProxy("warn");
        self2.error = _logProxy("error");
      }
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/context/context.js
function createContextKey(description) {
  return Symbol.for(description);
}
var BaseContext, ROOT_CONTEXT;
var init_context = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/context/context.js"() {
    "use strict";
    BaseContext = class _BaseContext {
      /**
       * Construct a new context which inherits values from an optional parent context.
       *
       * @param parentContext a context from which to inherit values
       */
      constructor(parentContext) {
        const self2 = this;
        self2._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
        self2.getValue = (key) => self2._currentContext.get(key);
        self2.setValue = (key, value) => {
          const context2 = new _BaseContext(self2._currentContext);
          context2._currentContext.set(key, value);
          return context2;
        };
        self2.deleteValue = (key) => {
          const context2 = new _BaseContext(self2._currentContext);
          context2._currentContext.delete(key);
          return context2;
        };
      }
    };
    ROOT_CONTEXT = new BaseContext();
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/metrics/NoopMeter.js
function createNoopMeter() {
  return NOOP_METER;
}
var NoopMeter, NoopMetric, NoopCounterMetric, NoopUpDownCounterMetric, NoopGaugeMetric, NoopHistogramMetric, NoopObservableMetric, NoopObservableCounterMetric, NoopObservableGaugeMetric, NoopObservableUpDownCounterMetric, NOOP_METER, NOOP_COUNTER_METRIC, NOOP_GAUGE_METRIC, NOOP_HISTOGRAM_METRIC, NOOP_UP_DOWN_COUNTER_METRIC, NOOP_OBSERVABLE_COUNTER_METRIC, NOOP_OBSERVABLE_GAUGE_METRIC, NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
var init_NoopMeter = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/metrics/NoopMeter.js"() {
    "use strict";
    NoopMeter = class {
      constructor() {
      }
      /**
       * @see {@link Meter.createGauge}
       */
      createGauge(_name, _options) {
        return NOOP_GAUGE_METRIC;
      }
      /**
       * @see {@link Meter.createHistogram}
       */
      createHistogram(_name, _options) {
        return NOOP_HISTOGRAM_METRIC;
      }
      /**
       * @see {@link Meter.createCounter}
       */
      createCounter(_name, _options) {
        return NOOP_COUNTER_METRIC;
      }
      /**
       * @see {@link Meter.createUpDownCounter}
       */
      createUpDownCounter(_name, _options) {
        return NOOP_UP_DOWN_COUNTER_METRIC;
      }
      /**
       * @see {@link Meter.createObservableGauge}
       */
      createObservableGauge(_name, _options) {
        return NOOP_OBSERVABLE_GAUGE_METRIC;
      }
      /**
       * @see {@link Meter.createObservableCounter}
       */
      createObservableCounter(_name, _options) {
        return NOOP_OBSERVABLE_COUNTER_METRIC;
      }
      /**
       * @see {@link Meter.createObservableUpDownCounter}
       */
      createObservableUpDownCounter(_name, _options) {
        return NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
      }
      /**
       * @see {@link Meter.addBatchObservableCallback}
       */
      addBatchObservableCallback(_callback, _observables) {
      }
      /**
       * @see {@link Meter.removeBatchObservableCallback}
       */
      removeBatchObservableCallback(_callback) {
      }
    };
    NoopMetric = class {
    };
    NoopCounterMetric = class extends NoopMetric {
      add(_value, _attributes) {
      }
    };
    NoopUpDownCounterMetric = class extends NoopMetric {
      add(_value, _attributes) {
      }
    };
    NoopGaugeMetric = class extends NoopMetric {
      record(_value, _attributes) {
      }
    };
    NoopHistogramMetric = class extends NoopMetric {
      record(_value, _attributes) {
      }
    };
    NoopObservableMetric = class {
      addCallback(_callback) {
      }
      removeCallback(_callback) {
      }
    };
    NoopObservableCounterMetric = class extends NoopObservableMetric {
    };
    NoopObservableGaugeMetric = class extends NoopObservableMetric {
    };
    NoopObservableUpDownCounterMetric = class extends NoopObservableMetric {
    };
    NOOP_METER = new NoopMeter();
    NOOP_COUNTER_METRIC = new NoopCounterMetric();
    NOOP_GAUGE_METRIC = new NoopGaugeMetric();
    NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
    NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
    NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
    NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
    NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js
var NoopContextManager;
var init_NoopContextManager = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js"() {
    "use strict";
    init_context();
    NoopContextManager = class {
      active() {
        return ROOT_CONTEXT;
      }
      with(_context, fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      bind(_context, target) {
        return target;
      }
      enable() {
        return this;
      }
      disable() {
        return this;
      }
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/api/context.js
var API_NAME2, NOOP_CONTEXT_MANAGER, ContextAPI;
var init_context2 = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/api/context.js"() {
    "use strict";
    init_NoopContextManager();
    init_global_utils();
    init_diag();
    API_NAME2 = "context";
    NOOP_CONTEXT_MANAGER = new NoopContextManager();
    ContextAPI = class _ContextAPI {
      /** Empty private constructor prevents end users from constructing a new instance of the API */
      constructor() {
      }
      /** Get the singleton instance of the Context API */
      static getInstance() {
        if (!this._instance) {
          this._instance = new _ContextAPI();
        }
        return this._instance;
      }
      /**
       * Set the current context manager.
       *
       * @returns true if the context manager was successfully registered, else false
       */
      setGlobalContextManager(contextManager) {
        return registerGlobal(API_NAME2, contextManager, DiagAPI.instance());
      }
      /**
       * Get the currently active context
       */
      active() {
        return this._getContextManager().active();
      }
      /**
       * Execute a function with an active context
       *
       * @param context context to be active during function execution
       * @param fn function to execute in a context
       * @param thisArg optional receiver to be used for calling fn
       * @param args optional arguments forwarded to fn
       */
      with(context2, fn, thisArg, ...args) {
        return this._getContextManager().with(context2, fn, thisArg, ...args);
      }
      /**
       * Bind a context to a target function or event emitter
       *
       * @param context context to bind to the event emitter or function. Defaults to the currently active context
       * @param target function or event emitter to bind
       */
      bind(context2, target) {
        return this._getContextManager().bind(context2, target);
      }
      _getContextManager() {
        return getGlobal(API_NAME2) || NOOP_CONTEXT_MANAGER;
      }
      /** Disable and remove the global context manager */
      disable() {
        this._getContextManager().disable();
        unregisterGlobal(API_NAME2, DiagAPI.instance());
      }
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js
var TraceFlags;
var init_trace_flags = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js"() {
    "use strict";
    (function(TraceFlags2) {
      TraceFlags2[TraceFlags2["NONE"] = 0] = "NONE";
      TraceFlags2[TraceFlags2["SAMPLED"] = 1] = "SAMPLED";
    })(TraceFlags || (TraceFlags = {}));
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/invalid-span-constants.js
var INVALID_SPANID, INVALID_TRACEID, INVALID_SPAN_CONTEXT;
var init_invalid_span_constants = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/invalid-span-constants.js"() {
    "use strict";
    init_trace_flags();
    INVALID_SPANID = "0000000000000000";
    INVALID_TRACEID = "00000000000000000000000000000000";
    INVALID_SPAN_CONTEXT = {
      traceId: INVALID_TRACEID,
      spanId: INVALID_SPANID,
      traceFlags: TraceFlags.NONE
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js
var NonRecordingSpan;
var init_NonRecordingSpan = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js"() {
    "use strict";
    init_invalid_span_constants();
    NonRecordingSpan = class {
      constructor(spanContext = INVALID_SPAN_CONTEXT) {
        this._spanContext = spanContext;
      }
      // Returns a SpanContext.
      spanContext() {
        return this._spanContext;
      }
      // By default does nothing
      setAttribute(_key, _value) {
        return this;
      }
      // By default does nothing
      setAttributes(_attributes) {
        return this;
      }
      // By default does nothing
      addEvent(_name, _attributes) {
        return this;
      }
      addLink(_link) {
        return this;
      }
      addLinks(_links) {
        return this;
      }
      // By default does nothing
      setStatus(_status) {
        return this;
      }
      // By default does nothing
      updateName(_name) {
        return this;
      }
      // By default does nothing
      end(_endTime) {
      }
      // isRecording always returns false for NonRecordingSpan.
      isRecording() {
        return false;
      }
      // By default does nothing
      recordException(_exception, _time) {
      }
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/context-utils.js
function getSpan(context2) {
  return context2.getValue(SPAN_KEY) || void 0;
}
function getActiveSpan() {
  return getSpan(ContextAPI.getInstance().active());
}
function setSpan(context2, span) {
  return context2.setValue(SPAN_KEY, span);
}
function deleteSpan(context2) {
  return context2.deleteValue(SPAN_KEY);
}
function setSpanContext(context2, spanContext) {
  return setSpan(context2, new NonRecordingSpan(spanContext));
}
function getSpanContext(context2) {
  var _a;
  return (_a = getSpan(context2)) === null || _a === void 0 ? void 0 : _a.spanContext();
}
var SPAN_KEY;
var init_context_utils = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/context-utils.js"() {
    "use strict";
    init_context();
    init_NonRecordingSpan();
    init_context2();
    SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js
function isValidHex(id, length) {
  if (typeof id !== "string" || id.length !== length)
    return false;
  let r = 0;
  for (let i = 0; i < id.length; i += 4) {
    r += (isHex[id.charCodeAt(i)] | 0) + (isHex[id.charCodeAt(i + 1)] | 0) + (isHex[id.charCodeAt(i + 2)] | 0) + (isHex[id.charCodeAt(i + 3)] | 0);
  }
  return r === length;
}
function isValidTraceId(traceId) {
  return isValidHex(traceId, 32) && traceId !== INVALID_TRACEID;
}
function isValidSpanId(spanId) {
  return isValidHex(spanId, 16) && spanId !== INVALID_SPANID;
}
function isSpanContextValid(spanContext) {
  return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
}
function wrapSpanContext(spanContext) {
  return new NonRecordingSpan(spanContext);
}
var isHex;
var init_spancontext_utils = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js"() {
    "use strict";
    init_invalid_span_constants();
    init_NonRecordingSpan();
    isHex = new Uint8Array([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1
    ]);
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js
function isSpanContext(spanContext) {
  return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
}
var contextApi, NoopTracer;
var init_NoopTracer = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js"() {
    "use strict";
    init_context2();
    init_context_utils();
    init_NonRecordingSpan();
    init_spancontext_utils();
    contextApi = ContextAPI.getInstance();
    NoopTracer = class {
      // startSpan starts a noop span.
      startSpan(name, options, context2 = contextApi.active()) {
        const root = Boolean(options === null || options === void 0 ? void 0 : options.root);
        if (root) {
          return new NonRecordingSpan();
        }
        const parentFromContext = context2 && getSpanContext(context2);
        if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) {
          return new NonRecordingSpan(parentFromContext);
        } else {
          return new NonRecordingSpan();
        }
      }
      startActiveSpan(name, arg2, arg3, arg4) {
        let opts;
        let ctx;
        let fn;
        if (arguments.length < 2) {
          return;
        } else if (arguments.length === 2) {
          fn = arg2;
        } else if (arguments.length === 3) {
          opts = arg2;
          fn = arg3;
        } else {
          opts = arg2;
          ctx = arg3;
          fn = arg4;
        }
        const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
        const span = this.startSpan(name, opts, parentContext);
        const contextWithSpanSet = setSpan(parentContext, span);
        return contextApi.with(contextWithSpanSet, fn, void 0, span);
      }
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js
var NOOP_TRACER, ProxyTracer;
var init_ProxyTracer = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js"() {
    "use strict";
    init_NoopTracer();
    NOOP_TRACER = new NoopTracer();
    ProxyTracer = class {
      constructor(provider, name, version, options) {
        this._provider = provider;
        this.name = name;
        this.version = version;
        this.options = options;
      }
      startSpan(name, options, context2) {
        return this._getTracer().startSpan(name, options, context2);
      }
      startActiveSpan(_name, _options, _context, _fn) {
        const tracer = this._getTracer();
        return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
      }
      /**
       * Try to get a tracer from the proxy tracer provider.
       * If the proxy tracer provider has no delegate, return a noop tracer.
       */
      _getTracer() {
        if (this._delegate) {
          return this._delegate;
        }
        const tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
        if (!tracer) {
          return NOOP_TRACER;
        }
        this._delegate = tracer;
        return this._delegate;
      }
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js
var NoopTracerProvider;
var init_NoopTracerProvider = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js"() {
    "use strict";
    init_NoopTracer();
    NoopTracerProvider = class {
      getTracer(_name, _version, _options) {
        return new NoopTracer();
      }
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js
var NOOP_TRACER_PROVIDER, ProxyTracerProvider;
var init_ProxyTracerProvider = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js"() {
    "use strict";
    init_ProxyTracer();
    init_NoopTracerProvider();
    NOOP_TRACER_PROVIDER = new NoopTracerProvider();
    ProxyTracerProvider = class {
      /**
       * Get a {@link ProxyTracer}
       */
      getTracer(name, version, options) {
        var _a;
        return (_a = this.getDelegateTracer(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyTracer(this, name, version, options);
      }
      getDelegate() {
        var _a;
        return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_TRACER_PROVIDER;
      }
      /**
       * Set the delegate tracer provider
       */
      setDelegate(delegate) {
        this._delegate = delegate;
      }
      getDelegateTracer(name, version, options) {
        var _a;
        return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getTracer(name, version, options);
      }
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/SamplingResult.js
var SamplingDecision;
var init_SamplingResult = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/SamplingResult.js"() {
    "use strict";
    (function(SamplingDecision3) {
      SamplingDecision3[SamplingDecision3["NOT_RECORD"] = 0] = "NOT_RECORD";
      SamplingDecision3[SamplingDecision3["RECORD"] = 1] = "RECORD";
      SamplingDecision3[SamplingDecision3["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
    })(SamplingDecision || (SamplingDecision = {}));
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/span_kind.js
var SpanKind;
var init_span_kind = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/span_kind.js"() {
    "use strict";
    (function(SpanKind2) {
      SpanKind2[SpanKind2["INTERNAL"] = 0] = "INTERNAL";
      SpanKind2[SpanKind2["SERVER"] = 1] = "SERVER";
      SpanKind2[SpanKind2["CLIENT"] = 2] = "CLIENT";
      SpanKind2[SpanKind2["PRODUCER"] = 3] = "PRODUCER";
      SpanKind2[SpanKind2["CONSUMER"] = 4] = "CONSUMER";
    })(SpanKind || (SpanKind = {}));
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/status.js
var SpanStatusCode;
var init_status = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace/status.js"() {
    "use strict";
    (function(SpanStatusCode2) {
      SpanStatusCode2[SpanStatusCode2["UNSET"] = 0] = "UNSET";
      SpanStatusCode2[SpanStatusCode2["OK"] = 1] = "OK";
      SpanStatusCode2[SpanStatusCode2["ERROR"] = 2] = "ERROR";
    })(SpanStatusCode || (SpanStatusCode = {}));
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/context-api.js
var context;
var init_context_api = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/context-api.js"() {
    "use strict";
    init_context2();
    context = ContextAPI.getInstance();
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/diag-api.js
var diag;
var init_diag_api = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/diag-api.js"() {
    "use strict";
    init_diag();
    diag = DiagAPI.instance();
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/api/trace.js
var API_NAME3, TraceAPI;
var init_trace = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/api/trace.js"() {
    "use strict";
    init_global_utils();
    init_ProxyTracerProvider();
    init_spancontext_utils();
    init_context_utils();
    init_diag();
    API_NAME3 = "trace";
    TraceAPI = class _TraceAPI {
      /** Empty private constructor prevents end users from constructing a new instance of the API */
      constructor() {
        this._proxyTracerProvider = new ProxyTracerProvider();
        this.wrapSpanContext = wrapSpanContext;
        this.isSpanContextValid = isSpanContextValid;
        this.deleteSpan = deleteSpan;
        this.getSpan = getSpan;
        this.getActiveSpan = getActiveSpan;
        this.getSpanContext = getSpanContext;
        this.setSpan = setSpan;
        this.setSpanContext = setSpanContext;
      }
      /** Get the singleton instance of the Trace API */
      static getInstance() {
        if (!this._instance) {
          this._instance = new _TraceAPI();
        }
        return this._instance;
      }
      /**
       * Set the current global tracer.
       *
       * @returns true if the tracer provider was successfully registered, else false
       */
      setGlobalTracerProvider(provider) {
        const success = registerGlobal(API_NAME3, this._proxyTracerProvider, DiagAPI.instance());
        if (success) {
          this._proxyTracerProvider.setDelegate(provider);
        }
        return success;
      }
      /**
       * Returns the global tracer provider.
       */
      getTracerProvider() {
        return getGlobal(API_NAME3) || this._proxyTracerProvider;
      }
      /**
       * Returns a tracer from the global tracer provider.
       */
      getTracer(name, version) {
        return this.getTracerProvider().getTracer(name, version);
      }
      /** Remove the global tracer provider */
      disable() {
        unregisterGlobal(API_NAME3, DiagAPI.instance());
        this._proxyTracerProvider = new ProxyTracerProvider();
      }
    };
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace-api.js
var trace;
var init_trace_api = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/trace-api.js"() {
    "use strict";
    init_trace();
    trace = TraceAPI.getInstance();
  }
});

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/index.js
var init_esm = __esm({
  "../telmoni/sdk/typescript/node_modules/@opentelemetry/api/build/esm/index.js"() {
    "use strict";
    init_context();
    init_NoopMeter();
    init_SamplingResult();
    init_span_kind();
    init_status();
    init_trace_flags();
    init_spancontext_utils();
    init_invalid_span_constants();
    init_context_api();
    init_diag_api();
    init_trace_api();
  }
});

// src/cli/worker.ts
import { readFileSync as readFileSync5 } from "fs";

// src/payload.ts
import { isAbsolute } from "path";

// src/shared/state.ts
import { randomUUID } from "crypto";
import {
  chmodSync,
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync
} from "fs";
import { join } from "path";
import { setTimeout as sleep } from "timers/promises";
var FILE_ID = /^[A-Za-z0-9_-]{1,128}$/;
function isFileId(value) {
  return typeof value === "string" && FILE_ID.test(value);
}
function ensurePrivateDir(dir, options) {
  mkdirSync(dir, { recursive: true, mode: 448 });
  if (options?.tighten === true && process.platform !== "win32") chmodSync(dir, 448);
}
function writeFileAtomic(path, text3) {
  const temporary = `${path}.${process.pid}.tmp`;
  const fd = openSync(temporary, "w", 384);
  try {
    writeFileSync(fd, text3);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  renameSync(temporary, path);
}
function readStateFile(dir, name) {
  let text3;
  try {
    text3 = readFileSync(join(dir, `${name}.json`), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return void 0;
    throw error;
  }
  const value = JSON.parse(text3);
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError("state is not an object");
  return value;
}
function writeStateFile(dir, name, value) {
  ensurePrivateDir(dir);
  writeFileAtomic(join(dir, `${name}.json`), JSON.stringify(value));
}
function markedIds(dir, suffix, except) {
  let names2 = [];
  try {
    names2 = readdirSync(dir);
  } catch {
  }
  const waited = (name) => {
    try {
      return statSync(join(dir, name)).mtimeMs;
    } catch {
      return 0;
    }
  };
  return names2.filter(
    (name) => name.endsWith(suffix) && isFileId(name.slice(0, -suffix.length)) && name.slice(0, -suffix.length) !== except
  ).sort((a, b) => waited(a) - waited(b) || a.localeCompare(b)).map((name) => name.slice(0, -suffix.length));
}
var LOCK_STALE_MS = 6e4;
async function withLock(dir, name, waitMs, work2, options) {
  const staleMs = options?.staleMs ?? LOCK_STALE_MS;
  const pollMs = options?.pollMs ?? 200;
  ensurePrivateDir(dir);
  const path = join(dir, `${name}.lock`);
  const token = `${process.pid}:${randomUUID()}`;
  const deadline = Date.now() + waitMs;
  for (; ; ) {
    try {
      writeFileSync(path, token, { flag: "wx", mode: 384 });
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      try {
        if (Date.now() - statSync(path).mtimeMs > staleMs) rmSync(path, { force: true });
      } catch {
      }
      if (Date.now() >= deadline) return false;
      await sleep(pollMs);
    }
  }
  const freshen = setInterval(() => {
    try {
      const now = /* @__PURE__ */ new Date();
      utimesSync(path, now, now);
    } catch {
    }
  }, staleMs / 6);
  freshen.unref();
  try {
    await work2();
  } finally {
    clearInterval(freshen);
    try {
      if (readFileSync(path, "utf8") === token) rmSync(path, { force: true });
    } catch {
    }
  }
  return true;
}

// src/payload.ts
var REASON = /^[A-Z][A-Z0-9_]{0,63}$/;
var MODEL_MAX = 256;
function takeOver(text3) {
  let given;
  try {
    given = JSON.parse(text3);
  } catch {
    return void 0;
  }
  if (given === null || typeof given !== "object" || Array.isArray(given)) return void 0;
  const { at, idle, errored, workspace, reason, size } = given;
  if (typeof at !== "number" || !Number.isFinite(at)) return void 0;
  const stop2 = readStop(
    {
      ...given,
      workspacePaths: [workspace],
      terminationReason: reason,
      error: errored === true ? "error" : "",
      fullyIdle: idle !== false
    },
    at
  );
  if (stop2 !== void 0 && typeof size === "number" && Number.isSafeInteger(size) && size >= 0)
    stop2.size = size;
  return stop2;
}
function readStop(payload, at) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return void 0;
  const given = payload;
  const { conversationId, transcriptPath } = given;
  if (!isFileId(conversationId)) return void 0;
  if (typeof transcriptPath !== "string" || !isAbsolute(transcriptPath) || !transcriptPath.endsWith(".jsonl"))
    return void 0;
  const stop2 = {
    conversationId,
    transcriptPath,
    errored: typeof given.error === "string" && given.error.trim() !== "",
    // `false` alone holds the turn: Antigravity before the field never said, and its stop was the turn's end.
    idle: given.fullyIdle !== false,
    at
  };
  const workspaces = Array.isArray(given.workspacePaths) ? given.workspacePaths : [];
  const workspace = workspaces.find(
    (path) => typeof path === "string" && isAbsolute(path)
  );
  if (workspace !== void 0) stop2.workspace = workspace;
  const model = typeof given.modelName === "string" ? given.modelName.trim() : "";
  if (model !== "" && model.length <= MODEL_MAX) stop2.modelName = model;
  if (typeof given.terminationReason === "string" && REASON.test(given.terminationReason))
    stop2.reason = given.terminationReason;
  return stop2;
}

// src/worker.ts
import { existsSync, rmSync as rmSync2, statSync as statSync3, writeFileSync as writeFileSync2 } from "fs";
import { join as join5 } from "path";
import { setTimeout as sleep2 } from "timers/promises";

// src/paths.ts
import { homedir } from "os";
import { join as join2 } from "path";
function configDir(home = homedir()) {
  return join2(home, ".gemini", "config");
}
function keyFile(home) {
  return join2(configDir(home), "telmoni.json");
}
function stateDir(home) {
  return join2(configDir(home), "telmoni");
}

// src/record.ts
import { createHash } from "crypto";

// src/names.ts
var NOT_TEXT = new RegExp("[\\u0000-\\u001f\\u007f-\\u009f]|\\p{Cs}", "u");
var EFFORT = /^([a-z0-9][a-z0-9._-]*?)-(minimal|low|medium|high|xhigh|max)$/i;
var MODEL_MAX2 = 128;
var TOOL = /^[A-Za-z0-9_.:@+-]+$/;
var TOOL_MAX = 145;
function modelOf(given) {
  if (given === void 0 || given === "" || NOT_TEXT.test(given)) return { model: "unknown" };
  if (/[\\/]/.test(given)) return { model: "unknown" };
  const split2 = EFFORT.exec(given);
  if (split2?.[1] !== void 0 && split2[2] !== void 0)
    return { model: split2[1].slice(0, MODEL_MAX2), effort: split2[2].toLowerCase() };
  return { model: given.slice(0, MODEL_MAX2) };
}
function toolName(given) {
  return given !== void 0 && TOOL.test(given) ? given.slice(0, TOOL_MAX) : "unknown";
}
function errorKind(code) {
  if (code === 429) return "rate_limit";
  if (code !== void 0 && code >= 500 && code <= 599) return "server_error";
  if (code !== void 0 && code >= 400 && code <= 499) return `http_${code}`;
  return "ApiError";
}

// src/transcript.ts
import { closeSync as closeSync2, constants, fstatSync, openSync as openSync2, readFileSync as readFileSync2 } from "fs";
var USER_INPUT = "USER_INPUT";
var MODEL_CALL = "PLANNER_RESPONSE";
var ERROR_MESSAGE = "ERROR_MESSAGE";
var COMPACTION = "CHECKPOINT";
var MAX_TRANSCRIPT_BYTES = 256 * 1024 * 1024;
function readTranscript(path, options) {
  let bytes;
  try {
    const fd = openSync2(path, constants.O_RDONLY | constants.O_NONBLOCK);
    try {
      const stat = fstatSync(fd);
      if (!stat.isFile()) return { problem: "transcript not a file" };
      if (stat.size > MAX_TRANSCRIPT_BYTES) return { problem: "transcript past 256 MiB" };
      bytes = readFileSync2(fd);
    } finally {
      closeSync2(fd);
    }
  } catch (error) {
    const code = error.code;
    return { problem: code === "ENOENT" ? "no transcript yet" : "transcript unreadable" };
  }
  const byIndex = /* @__PURE__ */ new Map();
  for (let start = 0; start < bytes.length; ) {
    const newline = bytes.indexOf(10, start);
    const end = newline === -1 ? bytes.length : newline;
    const line = bytes.toString("utf8", start, end);
    const offset = start;
    start = end + 1;
    if (line.trim() === "") continue;
    let value;
    try {
      value = JSON.parse(line);
    } catch {
      continue;
    }
    const row = readRow(value, offset, options.content);
    if (row === void 0) continue;
    const first = byIndex.get(row.index);
    if (first !== void 0) row.offset = first.offset;
    byIndex.set(row.index, row);
  }
  return { rows: [...byIndex.values()].sort((a, b) => a.index - b.index) };
}
function readRow(value, offset, content) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return void 0;
  const data = value;
  const index = data.step_index;
  if (typeof index !== "number" || !Number.isSafeInteger(index) || index < 0) return void 0;
  if (typeof data.type !== "string" || data.type === "") return void 0;
  const row = {
    index,
    offset,
    type: data.type,
    source: typeof data.source === "string" ? data.source : void 0,
    status: typeof data.status === "string" ? data.status : void 0,
    at: timeOf(data.created_at),
    tools: toolsOf(data.tool_calls, content)
  };
  const usage = usageOf(data);
  if (usage !== void 0) row.usage = usage;
  const exitCode = integer(data.exit_code);
  if (exitCode !== void 0) row.exitCode = exitCode;
  const errorCode = integer(data.error_code);
  if (errorCode !== void 0) row.errorCode = errorCode;
  if (content) {
    const said = typeof data.content === "string" && data.content.trim() !== "" ? data.content : void 0;
    const text3 = said !== void 0 && row.type === USER_INPUT ? typedPrompt(said) : said;
    if (text3 !== void 0 && text3 !== "") row.text = text3;
    if (typeof data.thinking === "string" && data.thinking.trim() !== "")
      row.thinking = data.thinking;
  }
  return row;
}
function timeOf(given) {
  if (typeof given !== "string" || given === "") return void 0;
  const zoned = /(?:Z|[+-]\d\d:?\d\d)$/i.test(given) ? given : `${given}Z`;
  const ms = Date.parse(zoned);
  return Number.isFinite(ms) ? ms : void 0;
}
function count(given) {
  return typeof given === "number" && Number.isSafeInteger(given) && given >= 0 ? given : void 0;
}
function integer(given) {
  if (typeof given === "number" && Number.isSafeInteger(given)) return given;
  if (typeof given === "string" && /^-?\d{1,9}$/.test(given)) return Number(given);
  return void 0;
}
function usageOf(data) {
  const usage = {};
  const input = count(data.input_tokens);
  const output = count(data.output_tokens);
  const cacheRead = count(data.cache_read_tokens);
  if (input !== void 0) usage.input = input;
  if (output !== void 0) usage.output = output;
  if (cacheRead !== void 0) usage.cacheRead = cacheRead;
  return Object.keys(usage).length > 0 ? usage : void 0;
}
function toolsOf(given, content) {
  if (!Array.isArray(given)) return [];
  return given.map((call) => {
    const data = call !== null && typeof call === "object" && !Array.isArray(call) ? call : {};
    const tool = { name: typeof data.name === "string" ? data.name : void 0 };
    if (content && data.args !== void 0) tool.args = data.args;
    return tool;
  });
}
function typedPrompt(content) {
  const request = /<USER_REQUEST>\n?([\s\S]*?)\n?<\/USER_REQUEST>/.exec(content);
  if (request !== null) return request[1]?.trim() || void 0;
  const own2 = content.search(/<[A-Z][A-Z_]+>/);
  const typed = (own2 === -1 ? content : content.slice(0, own2)).trim();
  return typed === "" ? void 0 : typed;
}

// src/record.ts
var AGENT = "antigravity";
var PROVIDER = "gcp.vertex_ai";
var NAMESPACE_URL = "6ba7b8119dad11d180b400c04fd430c8";
function uuid5(name, namespace) {
  const digest = createHash("sha1").update(Buffer.from(namespace, "hex")).update(name).digest();
  digest[6] = (digest[6] ?? 0) & 15 | 80;
  digest[8] = (digest[8] ?? 0) & 63 | 128;
  return digest.subarray(0, 16).toString("hex");
}
var NAMESPACE = uuid5("https://telmoni.com/antigravity-observability-plugin", NAMESPACE_URL);
function traceIdOf(conversationId, prompt) {
  return uuid5(`${conversationId}:${prompt}`, NAMESPACE);
}
function isResult(row) {
  return row.source === "MODEL" && row.type !== MODEL_CALL && row.type !== ERROR_MESSAGE;
}
function text(role, content) {
  return content === void 0 ? void 0 : [{ role, parts: [{ type: "text", content }] }];
}
function recordTurn(turn, options) {
  const { rows } = turn;
  const known = rows.map((row) => row.at).filter((at) => at !== void 0);
  const start = turn.open.at ?? known[0] ?? options.ending?.at;
  if (start === void 0) return void 0;
  const end = Math.max(start, ...known, options.ending?.at ?? start);
  const until = (i) => {
    const from = rows[i]?.at ?? start;
    const next = rows.slice(i + 1).find((row) => row.at !== void 0)?.at ?? end;
    return Math.max(from, next);
  };
  const { model, effort } = modelOf(options.modelName);
  const modelCall = (row, i) => {
    const call = {
      type: "model_call",
      model,
      provider: PROVIDER,
      start: row.at ?? start,
      end: until(i)
    };
    if (effort !== void 0) call.reasoningEffort = effort;
    const usage = row.usage;
    if (usage !== void 0) {
      call.usage = {};
      if (usage.input !== void 0) call.usage.inputTokens = usage.input + (usage.cacheRead ?? 0);
      if (usage.output !== void 0) call.usage.outputTokens = usage.output;
      if (usage.cacheRead !== void 0) call.usage.cacheReadInputTokens = usage.cacheRead;
    }
    return call;
  };
  const inside = [];
  let lastReply;
  let lastError;
  let sinceCall = [];
  let calls = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.type === MODEL_CALL) {
      const call = modelCall(row, i);
      if (options.content) {
        const given = calls === 0 ? text("user", turn.open.text) : toolMessages(sinceCall);
        if (given !== void 0) call.inputMessages = given;
        const said = replyParts(row);
        if (said.length > 0) call.outputMessages = [{ role: "assistant", parts: said }];
      }
      inside.push(call);
      calls += 1;
      sinceCall = [];
      lastReply = row;
      lastError = void 0;
      const results = [];
      for (let j = i + 1; j < rows.length && rows[j]?.type !== MODEL_CALL; j++) {
        if (isResult(rows[j])) results.push(j);
      }
      const answered2 = results.at(row.tools.length - 1) ?? results.at(-1);
      const movedOn = answered2 === void 0 ? call.end : until(answered2);
      row.tools.forEach((tool, k) => {
        const at = results[k];
        const result = at === void 0 ? void 0 : rows[at];
        const record2 = at === void 0 || result === void 0 ? (
          // Never answered: refused, or the turn stopped first.
          {
            type: "tool_call",
            name: toolName(tool.name),
            start: movedOn,
            end: movedOn,
            cancelled: true
          }
        ) : {
          type: "tool_call",
          name: toolName(tool.name),
          start: result.at ?? call.end,
          end: until(at),
          ...failure(result)
        };
        if (options.content) {
          if (tool.args !== void 0) record2.arguments = tool.args;
          if (result?.text !== void 0) record2.result = result.text;
        }
        inside.push(record2);
      });
    } else if (row.type === ERROR_MESSAGE) {
      inside.push({ ...modelCall(row, i), errorType: errorKind(row.errorCode) });
      lastError = row;
    } else if (row.type === COMPACTION) {
      const step = {
        type: "step",
        name: "compaction",
        start: row.at ?? start,
        end: until(i)
      };
      if (row.usage !== void 0) step.calls = [modelCall(row, i)];
      if (options.content && row.text !== void 0)
        step.outputMessages = text("assistant", row.text);
      inside.push(step);
    } else if (isResult(row)) {
      sinceCall.push(row);
    }
  }
  if (inside.length === 0) return void 0;
  const record = {
    traceId: traceIdOf(options.conversationId, turn.open.index),
    agent: AGENT,
    sessionId: options.conversationId,
    start,
    end,
    // Ordered by start, the agent's own times holding every call.
    inside: inside.sort((a, b) => Number(a.start) - Number(b.start)),
    ...outcome(rows, options.ending, lastError)
  };
  if (options.content) {
    const input = text("user", turn.open.text);
    if (input !== void 0) record.inputMessages = input;
    const output = text("assistant", lastReply?.text);
    if (output !== void 0) record.outputMessages = output;
  }
  return record;
}
function failure(result) {
  if (result.status === "ERROR") return { errorType: "ToolError" };
  if (result.exitCode !== void 0 && result.exitCode !== 0) return { errorType: "ToolError" };
  return {};
}
function outcome(rows, ending, lastError) {
  const reason = ending?.reason;
  if (reason === "USER_CANCELED") return { cancelled: true };
  if (reason === "ERROR" || ending?.errored === true) {
    const error = rows.findLast((row) => row.type === ERROR_MESSAGE);
    return { errorType: error === void 0 ? "AgentError" : errorKind(error.errorCode) };
  }
  if (reason?.startsWith("MAX_") === true) return { errorType: reason.toLowerCase() };
  if (reason === void 0 && lastError !== void 0)
    return { errorType: errorKind(lastError.errorCode) };
  return {};
}
function replyParts(row) {
  const parts = [];
  if (row.thinking !== void 0) parts.push({ type: "reasoning", content: row.thinking });
  if (row.text !== void 0) parts.push({ type: "text", content: row.text });
  for (const tool of row.tools) {
    const call = { type: "tool_call", name: toolName(tool.name) };
    if (tool.args !== void 0) call.arguments = tool.args;
    parts.push(call);
  }
  return parts;
}
function toolMessages(results) {
  const parts = results.filter((row) => row.text !== void 0).map((row) => ({ type: "tool_call_response", response: row.text }));
  return parts.length > 0 ? [{ role: "tool", parts }] : void 0;
}

// src/shared/log.ts
import { appendFileSync, renameSync as renameSync2, statSync as statSync2 } from "fs";
import { join as join3 } from "path";
var LOG_MAX_BYTES = 1024 * 1024;
function writeLog(dir, line, options) {
  if (dir === void 0) return;
  try {
    ensurePrivateDir(dir);
    const path = join3(dir, options?.file ?? "hook.log");
    try {
      if (statSync2(path).size > LOG_MAX_BYTES) renameSync2(path, `${path}.1`);
    } catch {
    }
    appendFileSync(path, `${(/* @__PURE__ */ new Date()).toISOString()} ${line}
`, { mode: 384 });
  } catch {
  }
}
function kindOf(error) {
  if (error instanceof Error) {
    const code = error.code;
    return typeof code === "string" ? `${error.name}:${code}` : error.name;
  }
  return typeof error;
}
function shortId(id, length = 8) {
  return id.slice(0, length);
}

// ../telmoni/sdk/typescript/dist/index.mjs
init_esm();
import { BlockList, isIPv4, isIPv6 } from "net";

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/resources/build/esm/ResourceImpl.js
init_esm();

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js
init_esm();
var SUPPRESS_TRACING_KEY = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
function isTracingSuppressed(context2) {
  return context2.getValue(SUPPRESS_TRACING_KEY) === true;
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/common/attributes.js
init_esm();
function sanitizeAttributes(attributes) {
  const out = {};
  if (typeof attributes !== "object" || attributes == null) {
    return out;
  }
  for (const key in attributes) {
    if (!Object.prototype.hasOwnProperty.call(attributes, key)) {
      continue;
    }
    if (!isAttributeKey(key)) {
      diag.warn(`Invalid attribute key: ${key}`);
      continue;
    }
    const val = attributes[key];
    if (!isAttributeValue(val)) {
      diag.warn(`Invalid attribute value set for key: ${key}`);
      continue;
    }
    if (Array.isArray(val)) {
      out[key] = val.slice();
    } else {
      out[key] = val;
    }
  }
  return out;
}
function isAttributeKey(key) {
  return typeof key === "string" && key !== "";
}
function isAttributeValue(val) {
  if (val == null) {
    return true;
  }
  if (Array.isArray(val)) {
    return isHomogeneousAttributeValueArray(val);
  }
  return isValidPrimitiveAttributeValueType(typeof val);
}
function isHomogeneousAttributeValueArray(arr) {
  let type;
  for (const element of arr) {
    if (element == null)
      continue;
    const elementType = typeof element;
    if (elementType === type) {
      continue;
    }
    if (!type) {
      if (isValidPrimitiveAttributeValueType(elementType)) {
        type = elementType;
        continue;
      }
      return false;
    }
    return false;
  }
  return true;
}
function isValidPrimitiveAttributeValueType(valType) {
  switch (valType) {
    case "number":
    case "boolean":
    case "string":
      return true;
  }
  return false;
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/common/logging-error-handler.js
init_esm();
function loggingErrorHandler() {
  return (ex) => {
    diag.error(stringifyException(ex));
  };
}
function stringifyException(ex) {
  if (typeof ex === "string") {
    return ex;
  } else {
    return JSON.stringify(flattenException(ex));
  }
}
function flattenException(ex) {
  const result = {};
  let current = ex;
  while (current !== null) {
    Object.getOwnPropertyNames(current).forEach((propertyName) => {
      if (result[propertyName])
        return;
      const value = current[propertyName];
      if (value) {
        result[propertyName] = String(value);
      }
    });
    current = Object.getPrototypeOf(current);
  }
  return result;
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/common/global-error-handler.js
var delegateHandler = loggingErrorHandler();
function globalErrorHandler(ex) {
  try {
    delegateHandler(ex);
  } catch {
  }
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/platform/node/environment.js
init_esm();
import { inspect } from "util";
function getNumberFromEnv(key) {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") {
    return void 0;
  }
  const value = Number(raw);
  if (isNaN(value)) {
    diag.warn(`Unknown value ${inspect(raw)} for ${key}, expected a number, using defaults`);
    return void 0;
  }
  return value;
}
function getStringFromEnv(key) {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") {
    return void 0;
  }
  return raw;
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/version.js
var VERSION2 = "2.12.0";

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/semantic-conventions/build/esm/stable_attributes.js
var ATTR_EXCEPTION_MESSAGE = "exception.message";
var ATTR_EXCEPTION_STACKTRACE = "exception.stacktrace";
var ATTR_EXCEPTION_TYPE = "exception.type";
var ATTR_SERVICE_NAME = "service.name";
var ATTR_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
var TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = "nodejs";
var ATTR_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
var ATTR_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/semconv.js
var ATTR_PROCESS_RUNTIME_NAME = "process.runtime.name";

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/platform/node/sdk-info.js
var SDK_INFO = {
  [ATTR_TELEMETRY_SDK_NAME]: "opentelemetry",
  [ATTR_PROCESS_RUNTIME_NAME]: "node",
  [ATTR_TELEMETRY_SDK_LANGUAGE]: TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS,
  [ATTR_TELEMETRY_SDK_VERSION]: VERSION2
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/platform/node/index.js
var otperformance = performance;

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/common/time.js
var NANOSECOND_DIGITS = 9;
var NANOSECOND_DIGITS_IN_MILLIS = 6;
var MILLISECONDS_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS);
var SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
function millisToHrTime(epochMillis) {
  const epochSeconds = epochMillis / 1e3;
  const seconds = Math.trunc(epochSeconds);
  const nanos2 = Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS);
  return [seconds, nanos2];
}
function hrTime(performanceNow) {
  const timeOrigin = millisToHrTime(otperformance.timeOrigin);
  const now = millisToHrTime(typeof performanceNow === "number" ? performanceNow : otperformance.now());
  return addHrTimes(timeOrigin, now);
}
function hrTimeDuration(startTime, endTime) {
  let seconds = endTime[0] - startTime[0];
  let nanos2 = endTime[1] - startTime[1];
  if (nanos2 < 0) {
    seconds -= 1;
    nanos2 += SECOND_TO_NANOSECONDS;
  }
  return [seconds, nanos2];
}
function isTimeInputHrTime(value) {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}
function isTimeInput(value) {
  return isTimeInputHrTime(value) || typeof value === "number" || value instanceof Date;
}
function addHrTimes(time1, time2) {
  const out = [time1[0] + time2[0], time1[1] + time2[1]];
  if (out[1] >= SECOND_TO_NANOSECONDS) {
    out[1] -= SECOND_TO_NANOSECONDS;
    out[0] += 1;
  }
  return out;
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/utils/lodash.merge.js
var objectTag = "[object Object]";
var nullTag = "[object Null]";
var undefinedTag = "[object Undefined]";
var funcProto = Function.prototype;
var funcToString = funcProto.toString;
var objectCtorString = funcToString.call(Object);
var getPrototypeOf = Object.getPrototypeOf;
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
var nativeObjectToString = objectProto.toString;
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) !== objectTag) {
    return false;
  }
  const proto = getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  const Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
function getRawTag(value) {
  const isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
  let unmasked = false;
  try {
    value[symToStringTag] = void 0;
    unmasked = true;
  } catch {
  }
  const result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
function objectToString(value) {
  return nativeObjectToString.call(value);
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/core/build/esm/utils/merge.js
var MAX_LEVEL = 20;
function merge(...args) {
  let result = args.shift();
  const objects = /* @__PURE__ */ new WeakMap();
  while (args.length > 0) {
    result = mergeTwoObjects(result, args.shift(), 0, objects);
  }
  return result;
}
function takeValue(value) {
  if (isArray(value)) {
    return value.slice();
  }
  return value;
}
function mergeTwoObjects(one, two, level = 0, objects) {
  let result;
  if (level > MAX_LEVEL) {
    return void 0;
  }
  level++;
  if (isPrimitive(one) || isPrimitive(two) || isFunction(two)) {
    result = takeValue(two);
  } else if (isArray(one)) {
    result = one.slice();
    if (isArray(two)) {
      for (let i = 0, j = two.length; i < j; i++) {
        result.push(takeValue(two[i]));
      }
    } else if (isObject(two)) {
      const keys = Object.keys(two);
      for (let i = 0, j = keys.length; i < j; i++) {
        const key = keys[i];
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          continue;
        }
        result[key] = takeValue(two[key]);
      }
    }
  } else if (isObject(one)) {
    if (isObject(two)) {
      if (!shouldMerge(one, two)) {
        return two;
      }
      result = Object.assign({}, one);
      const keys = Object.keys(two);
      for (let i = 0, j = keys.length; i < j; i++) {
        const key = keys[i];
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          continue;
        }
        const twoValue = two[key];
        if (isPrimitive(twoValue)) {
          if (typeof twoValue === "undefined") {
            delete result[key];
          } else {
            result[key] = twoValue;
          }
        } else {
          const obj1 = result[key];
          const obj2 = twoValue;
          if (wasObjectReferenced(one, key, objects) || wasObjectReferenced(two, key, objects)) {
            delete result[key];
          } else {
            if (isObject(obj1) && isObject(obj2)) {
              const arr1 = objects.get(obj1) || [];
              const arr2 = objects.get(obj2) || [];
              arr1.push({ obj: one, key });
              arr2.push({ obj: two, key });
              objects.set(obj1, arr1);
              objects.set(obj2, arr2);
            }
            result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
          }
        }
      }
    } else {
      result = two;
    }
  }
  return result;
}
function wasObjectReferenced(obj, key, objects) {
  const arr = objects.get(obj[key]) || [];
  for (let i = 0, j = arr.length; i < j; i++) {
    const info = arr[i];
    if (info.key === key && info.obj === obj) {
      return true;
    }
  }
  return false;
}
function isArray(value) {
  return Array.isArray(value);
}
function isFunction(value) {
  return typeof value === "function";
}
function isObject(value) {
  return !isPrimitive(value) && !isArray(value) && !isFunction(value) && typeof value === "object";
}
function isPrimitive(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "undefined" || value instanceof Date || value instanceof RegExp || value === null;
}
function shouldMerge(one, two) {
  if (!isPlainObject(one) || !isPlainObject(two)) {
    return false;
  }
  return true;
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/resources/build/esm/default-service-name.js
var serviceName;
function defaultServiceName() {
  if (serviceName === void 0) {
    try {
      const argv0 = globalThis.process.argv0;
      serviceName = argv0 ? `unknown_service:${argv0}` : "unknown_service";
    } catch {
      serviceName = "unknown_service";
    }
  }
  return serviceName;
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/resources/build/esm/utils.js
var isPromiseLike = (val) => {
  return val !== null && typeof val === "object" && typeof val.then === "function";
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/resources/build/esm/ResourceImpl.js
var ResourceImpl = class _ResourceImpl {
  _rawAttributes;
  _asyncAttributesPending = false;
  _schemaUrl;
  _memoizedAttributes;
  static FromAttributeList(attributes, options) {
    const res = new _ResourceImpl({}, options);
    res._rawAttributes = guardedRawAttributes(attributes);
    res._asyncAttributesPending = attributes.filter(([_, val]) => isPromiseLike(val)).length > 0;
    return res;
  }
  constructor(resource, options) {
    const attributes = resource.attributes ?? {};
    this._rawAttributes = Object.entries(attributes).map(([k, v]) => {
      if (isPromiseLike(v)) {
        this._asyncAttributesPending = true;
      }
      return [k, v];
    });
    this._rawAttributes = guardedRawAttributes(this._rawAttributes);
    this._schemaUrl = validateSchemaUrl(options?.schemaUrl);
  }
  get asyncAttributesPending() {
    return this._asyncAttributesPending;
  }
  async waitForAsyncAttributes() {
    if (!this.asyncAttributesPending) {
      return;
    }
    for (let i = 0; i < this._rawAttributes.length; i++) {
      const [k, v] = this._rawAttributes[i];
      this._rawAttributes[i] = [k, isPromiseLike(v) ? await v : v];
    }
    this._asyncAttributesPending = false;
  }
  get attributes() {
    if (this.asyncAttributesPending) {
      diag.error("Accessing resource attributes before async attributes settled");
    }
    if (this._memoizedAttributes) {
      return this._memoizedAttributes;
    }
    const attrs = {};
    for (const [k, v] of this._rawAttributes) {
      if (isPromiseLike(v)) {
        diag.debug(`Unsettled resource attribute ${k} skipped`);
        continue;
      }
      if (v != null) {
        attrs[k] ??= v;
      }
    }
    if (!this._asyncAttributesPending) {
      this._memoizedAttributes = attrs;
    }
    return attrs;
  }
  getRawAttributes() {
    return this._rawAttributes;
  }
  get schemaUrl() {
    return this._schemaUrl;
  }
  merge(resource) {
    if (resource == null)
      return this;
    const mergedSchemaUrl = mergeSchemaUrl(this, resource);
    const mergedOptions = mergedSchemaUrl ? { schemaUrl: mergedSchemaUrl } : void 0;
    return _ResourceImpl.FromAttributeList([...resource.getRawAttributes(), ...this.getRawAttributes()], mergedOptions);
  }
};
function resourceFromAttributes(attributes, options) {
  return ResourceImpl.FromAttributeList(Object.entries(attributes), options);
}
function defaultResource() {
  return resourceFromAttributes({
    [ATTR_SERVICE_NAME]: defaultServiceName(),
    [ATTR_TELEMETRY_SDK_LANGUAGE]: SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE],
    [ATTR_TELEMETRY_SDK_NAME]: SDK_INFO[ATTR_TELEMETRY_SDK_NAME],
    [ATTR_TELEMETRY_SDK_VERSION]: SDK_INFO[ATTR_TELEMETRY_SDK_VERSION]
  });
}
function guardedRawAttributes(attributes) {
  return attributes.map(([k, v]) => {
    if (isPromiseLike(v)) {
      return [
        k,
        v.catch((err) => {
          diag.debug("promise rejection for resource attribute: %s - %s", k, err);
          return void 0;
        })
      ];
    }
    return [k, v];
  });
}
function validateSchemaUrl(schemaUrl) {
  if (typeof schemaUrl === "string" || schemaUrl === void 0) {
    return schemaUrl;
  }
  diag.warn("Schema URL must be string or undefined, got %s. Schema URL will be ignored.", schemaUrl);
  return void 0;
}
function mergeSchemaUrl(old, updating) {
  const oldSchemaUrl = old?.schemaUrl;
  const updatingSchemaUrl = updating?.schemaUrl;
  const isOldEmpty = oldSchemaUrl === void 0 || oldSchemaUrl === "";
  const isUpdatingEmpty = updatingSchemaUrl === void 0 || updatingSchemaUrl === "";
  if (isOldEmpty) {
    return updatingSchemaUrl;
  }
  if (isUpdatingEmpty) {
    return oldSchemaUrl;
  }
  if (oldSchemaUrl === updatingSchemaUrl) {
    return oldSchemaUrl;
  }
  diag.warn('Schema URL merge conflict: old resource has "%s", updating resource has "%s". Resulting resource will have undefined Schema URL.', oldSchemaUrl, updatingSchemaUrl);
  return void 0;
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace-base/build/esm/config.js
init_esm();

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/TracerProvider.js
init_esm();

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/Tracer.js
init_esm();

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/Span.js
init_esm();

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/enums.js
var ExceptionEventName = "exception";

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/inspect.js
var inspectCustom = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
function settledResourceAttributes(resource) {
  const attrs = {};
  for (const [k, v] of resource.getRawAttributes()) {
    if (typeof v?.then === "function") {
      continue;
    }
    if (v != null) {
      attrs[k] ??= v;
    }
  }
  return attrs;
}
function formatInspect(className, payload, depth, options, inspect2) {
  if (typeof depth === "number" && depth < 0) {
    const tag = `[${className}]`;
    return options?.stylize ? options.stylize(tag, "special") : tag;
  }
  if (typeof inspect2 !== "function" || !options) {
    return payload;
  }
  const childOptions = {
    ...options,
    depth: options.depth == null ? options.depth : options.depth - 1
  };
  return `${className} ${inspect2(payload, childOptions)}`;
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/Span.js
var SpanImpl = class {
  // Below properties are included to implement ReadableSpan for export
  // purposes but are not intended to be written-to directly.
  _spanContext;
  kind;
  parentSpanContext;
  attributes = {};
  links = [];
  events = [];
  startTime;
  resource;
  instrumentationScope;
  _droppedAttributesCount = 0;
  _droppedEventsCount = 0;
  _droppedLinksCount = 0;
  _attributesCount = 0;
  name;
  status = {
    code: SpanStatusCode.UNSET
  };
  endTime = [0, 0];
  _ended = false;
  _duration = [-1, -1];
  _spanProcessor;
  _spanLimits;
  _attributeValueLengthLimit;
  _recordEndMetrics;
  _performanceStartTime;
  _performanceOffset;
  _startTimeProvided;
  /**
   * Constructs a new SpanImpl instance.
   */
  constructor(opts) {
    const now = Date.now();
    this._spanContext = opts.spanContext;
    this._performanceStartTime = otperformance.now();
    this._performanceOffset = now - (this._performanceStartTime + otperformance.timeOrigin);
    this._startTimeProvided = opts.startTime != null;
    this._spanLimits = opts.spanLimits;
    this._attributeValueLengthLimit = this._spanLimits.attributeValueLengthLimit ?? 0;
    this._spanProcessor = opts.spanProcessor;
    this.name = opts.name;
    this.parentSpanContext = opts.parentSpanContext;
    this.kind = opts.kind;
    if (opts.links) {
      for (const link of opts.links) {
        this.addLink(link);
      }
    }
    this.startTime = this._getTime(opts.startTime ?? now);
    this.resource = opts.resource;
    this.instrumentationScope = opts.scope;
    this._recordEndMetrics = opts.recordEndMetrics;
    if (opts.attributes != null) {
      this.setAttributes(opts.attributes);
    }
    this._spanProcessor.onStart(this, opts.context);
  }
  spanContext() {
    return this._spanContext;
  }
  setAttribute(key, value) {
    if (value == null || this._isSpanEnded())
      return this;
    if (key.length === 0) {
      diag.warn(`Invalid attribute key: ${key}`);
      return this;
    }
    if (!isAttributeValue(value)) {
      diag.warn(`Invalid attribute value set for key: ${key}`);
      return this;
    }
    const { attributeCountLimit } = this._spanLimits;
    const isNewKey = !Object.prototype.hasOwnProperty.call(this.attributes, key);
    if (attributeCountLimit !== void 0 && this._attributesCount >= attributeCountLimit && isNewKey) {
      this._droppedAttributesCount++;
      return this;
    }
    this.attributes[key] = this._truncateToSize(value);
    if (isNewKey) {
      this._attributesCount++;
    }
    return this;
  }
  setAttributes(attributes) {
    for (const key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        this.setAttribute(key, attributes[key]);
      }
    }
    return this;
  }
  /**
   *
   * @param name Span Name
   * @param [attributesOrStartTime] Span attributes or start time
   *     if type is {@type TimeInput} and 3rd param is undefined
   * @param [timeStamp] Specified time stamp for the event
   */
  addEvent(name, attributesOrStartTime, timeStamp) {
    if (this._isSpanEnded())
      return this;
    const { eventCountLimit } = this._spanLimits;
    if (eventCountLimit === 0) {
      diag.warn("No events allowed.");
      this._droppedEventsCount++;
      return this;
    }
    if (eventCountLimit !== void 0 && this.events.length >= eventCountLimit) {
      if (this._droppedEventsCount === 0) {
        diag.debug("Dropping extra events.");
      }
      this.events.shift();
      this._droppedEventsCount++;
    }
    if (isTimeInput(attributesOrStartTime)) {
      if (!isTimeInput(timeStamp)) {
        timeStamp = attributesOrStartTime;
      }
      attributesOrStartTime = void 0;
    }
    const sanitized = sanitizeAttributes(attributesOrStartTime);
    const { attributePerEventCountLimit } = this._spanLimits;
    const attributes = {};
    let droppedAttributesCount = 0;
    let eventAttributesCount = 0;
    for (const attr in sanitized) {
      if (!Object.prototype.hasOwnProperty.call(sanitized, attr)) {
        continue;
      }
      const attrVal = sanitized[attr];
      if (attributePerEventCountLimit !== void 0 && eventAttributesCount >= attributePerEventCountLimit) {
        droppedAttributesCount++;
        continue;
      }
      attributes[attr] = this._truncateToSize(attrVal);
      eventAttributesCount++;
    }
    this.events.push({
      name,
      attributes,
      time: this._getTime(timeStamp),
      droppedAttributesCount
    });
    return this;
  }
  addLink(link) {
    if (this._isSpanEnded())
      return this;
    const { linkCountLimit } = this._spanLimits;
    if (linkCountLimit === 0) {
      this._droppedLinksCount++;
      return this;
    }
    if (linkCountLimit !== void 0 && this.links.length >= linkCountLimit) {
      if (this._droppedLinksCount === 0) {
        diag.debug("Dropping extra links.");
      }
      this.links.shift();
      this._droppedLinksCount++;
    }
    const { attributePerLinkCountLimit } = this._spanLimits;
    const sanitized = sanitizeAttributes(link.attributes);
    const attributes = {};
    let droppedAttributesCount = 0;
    let linkAttributesCount = 0;
    for (const attr in sanitized) {
      if (!Object.prototype.hasOwnProperty.call(sanitized, attr)) {
        continue;
      }
      const attrVal = sanitized[attr];
      if (attributePerLinkCountLimit !== void 0 && linkAttributesCount >= attributePerLinkCountLimit) {
        droppedAttributesCount++;
        continue;
      }
      attributes[attr] = this._truncateToSize(attrVal);
      linkAttributesCount++;
    }
    const processedLink = { context: link.context };
    if (linkAttributesCount > 0) {
      processedLink.attributes = attributes;
    }
    if (droppedAttributesCount > 0) {
      processedLink.droppedAttributesCount = droppedAttributesCount;
    }
    this.links.push(processedLink);
    return this;
  }
  addLinks(links) {
    for (const link of links) {
      this.addLink(link);
    }
    return this;
  }
  setStatus(status) {
    if (this._isSpanEnded())
      return this;
    if (status.code === SpanStatusCode.UNSET)
      return this;
    if (this.status.code === SpanStatusCode.OK)
      return this;
    const newStatus = { code: status.code };
    if (status.code === SpanStatusCode.ERROR) {
      if (typeof status.message === "string") {
        newStatus.message = status.message;
      } else if (status.message != null) {
        diag.warn(`Dropping invalid status.message of type '${typeof status.message}', expected 'string'`);
      }
    }
    this.status = newStatus;
    return this;
  }
  updateName(name) {
    if (this._isSpanEnded())
      return this;
    this.name = name;
    return this;
  }
  end(endTime) {
    if (this._isSpanEnded()) {
      diag.error(`${this.name} ${this._spanContext.traceId}-${this._spanContext.spanId} - You can only call end() on a span once.`);
      return;
    }
    this.endTime = this._getTime(endTime);
    this._duration = hrTimeDuration(this.startTime, this.endTime);
    if (this._duration[0] < 0) {
      diag.warn("Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.", this.startTime, this.endTime);
      this.endTime = this.startTime.slice();
      this._duration = [0, 0];
    }
    if (this._droppedEventsCount > 0) {
      diag.warn(`Dropped ${this._droppedEventsCount} events because eventCountLimit reached`);
    }
    if (this._droppedLinksCount > 0) {
      diag.warn(`Dropped ${this._droppedLinksCount} links because linkCountLimit reached`);
    }
    if (this._spanProcessor.onEnding) {
      this._spanProcessor.onEnding(this);
    }
    this._recordEndMetrics?.();
    this._ended = true;
    this._spanProcessor.onEnd(this);
  }
  _getTime(inp) {
    if (typeof inp === "number" && inp <= otperformance.now()) {
      return hrTime(inp + this._performanceOffset);
    }
    if (typeof inp === "number") {
      return millisToHrTime(inp);
    }
    if (inp instanceof Date) {
      return millisToHrTime(inp.getTime());
    }
    if (isTimeInputHrTime(inp)) {
      return inp;
    }
    if (this._startTimeProvided) {
      return millisToHrTime(Date.now());
    }
    const msDuration = otperformance.now() - this._performanceStartTime;
    return addHrTimes(this.startTime, millisToHrTime(msDuration));
  }
  isRecording() {
    return this._ended === false;
  }
  recordException(exception, time) {
    const attributes = {};
    if (typeof exception === "string") {
      attributes[ATTR_EXCEPTION_MESSAGE] = exception;
    } else if (exception) {
      if (exception.code) {
        attributes[ATTR_EXCEPTION_TYPE] = exception.code.toString();
      } else if (exception.name) {
        attributes[ATTR_EXCEPTION_TYPE] = exception.name;
      }
      if (exception.message) {
        attributes[ATTR_EXCEPTION_MESSAGE] = exception.message;
      }
      if (exception.stack) {
        attributes[ATTR_EXCEPTION_STACKTRACE] = exception.stack;
      }
    }
    if (attributes[ATTR_EXCEPTION_TYPE] || attributes[ATTR_EXCEPTION_MESSAGE]) {
      this.addEvent(ExceptionEventName, attributes, time);
    } else {
      diag.warn(`Failed to record an exception ${exception}`);
    }
  }
  get duration() {
    return this._duration;
  }
  get ended() {
    return this._ended;
  }
  get droppedAttributesCount() {
    return this._droppedAttributesCount;
  }
  get droppedEventsCount() {
    return this._droppedEventsCount;
  }
  get droppedLinksCount() {
    return this._droppedLinksCount;
  }
  _isSpanEnded() {
    if (this._ended) {
      const error = new Error(`Operation attempted on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`);
      diag.warn(`Cannot execute the operation on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`, error);
    }
    return this._ended;
  }
  // Utility function to truncate given value within size
  // for value type of string, will truncate to given limit
  // for type of non-string, will return same value
  _truncateToLimitUtil(value, limit) {
    if (value.length <= limit) {
      return value;
    }
    return value.substring(0, limit);
  }
  /**
   * If the given attribute value is of type string and has more characters than given {@code attributeValueLengthLimit} then
   * return string with truncated to {@code attributeValueLengthLimit} characters
   *
   * If the given attribute value is array of strings then
   * return new array of strings with each element truncated to {@code attributeValueLengthLimit} characters
   *
   * Otherwise return same Attribute {@code value}
   *
   * @param value Attribute value
   * @returns truncated attribute value if required, otherwise same value
   */
  _truncateToSize(value) {
    const limit = this._attributeValueLengthLimit;
    if (limit <= 0) {
      diag.warn(`Attribute value limit must be positive, got ${limit}`);
      return value;
    }
    if (typeof value === "string") {
      return this._truncateToLimitUtil(value, limit);
    }
    if (Array.isArray(value)) {
      return value.map((val) => typeof val === "string" ? this._truncateToLimitUtil(val, limit) : val);
    }
    return value;
  }
  [inspectCustom](depth, options, inspect2) {
    const payload = {
      name: this.name,
      kind: this.kind,
      spanContext: this._spanContext,
      parentSpanContext: this.parentSpanContext,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this._duration,
      ended: this._ended,
      attributes: this.attributes,
      events: this.events,
      links: this.links,
      droppedAttributesCount: this._droppedAttributesCount,
      droppedEventsCount: this._droppedEventsCount,
      droppedLinksCount: this._droppedLinksCount,
      instrumentationScope: this.instrumentationScope,
      resource: { attributes: settledResourceAttributes(this.resource) }
    };
    return formatInspect("SpanImpl", payload, depth, options, inspect2);
  }
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/Sampler.js
var SamplingDecision2;
(function(SamplingDecision3) {
  SamplingDecision3[SamplingDecision3["NOT_RECORD"] = 0] = "NOT_RECORD";
  SamplingDecision3[SamplingDecision3["RECORD"] = 1] = "RECORD";
  SamplingDecision3[SamplingDecision3["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
})(SamplingDecision2 || (SamplingDecision2 = {}));

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/semconv.js
var ATTR_OTEL_SPAN_PARENT_ORIGIN = "otel.span.parent.origin";
var ATTR_OTEL_SPAN_SAMPLING_RESULT = "otel.span.sampling_result";
var METRIC_OTEL_SDK_SPAN_LIVE = "otel.sdk.span.live";
var METRIC_OTEL_SDK_SPAN_STARTED = "otel.sdk.span.started";

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/TracerMetrics.js
var TracerMetrics = class {
  startedSpans;
  liveSpans;
  constructor(meter) {
    this.startedSpans = meter.createCounter(METRIC_OTEL_SDK_SPAN_STARTED, {
      unit: "{span}",
      description: "The number of created spans."
    });
    this.liveSpans = meter.createUpDownCounter(METRIC_OTEL_SDK_SPAN_LIVE, {
      unit: "{span}",
      description: "The number of currently live spans."
    });
  }
  startSpan(parentSpanCtx, samplingDecision) {
    const samplingDecisionStr = samplingDecisionToString(samplingDecision);
    this.startedSpans.add(1, {
      [ATTR_OTEL_SPAN_PARENT_ORIGIN]: parentOrigin(parentSpanCtx),
      [ATTR_OTEL_SPAN_SAMPLING_RESULT]: samplingDecisionStr
    });
    if (samplingDecision === SamplingDecision2.NOT_RECORD) {
      return () => {
      };
    }
    const liveSpanAttributes = {
      [ATTR_OTEL_SPAN_SAMPLING_RESULT]: samplingDecisionStr
    };
    this.liveSpans.add(1, liveSpanAttributes);
    return () => {
      this.liveSpans.add(-1, liveSpanAttributes);
    };
  }
};
function parentOrigin(parentSpanContext) {
  if (!parentSpanContext) {
    return "none";
  }
  if (parentSpanContext.isRemote) {
    return "remote";
  }
  return "local";
}
function samplingDecisionToString(decision) {
  switch (decision) {
    case SamplingDecision2.RECORD_AND_SAMPLED:
      return "RECORD_AND_SAMPLE";
    case SamplingDecision2.RECORD:
      return "RECORD_ONLY";
    case SamplingDecision2.NOT_RECORD:
      return "DROP";
  }
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/version.js
var VERSION3 = "2.12.0";

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/Tracer.js
var Tracer = class {
  _sampler;
  _spanLimits;
  _idGenerator;
  instrumentationScope;
  _resource;
  _spanProcessor;
  _tracerMetrics;
  /**
   * Constructs a new Tracer instance.
   */
  constructor(instrumentationScope, options) {
    this.instrumentationScope = instrumentationScope;
    this._sampler = options.sampler;
    this._spanLimits = options.spanLimits;
    this._resource = options.resource;
    this._idGenerator = options.idGenerator;
    this._spanProcessor = options.spanProcessor;
    const meter = options.meterProvider.getMeter("@opentelemetry/sdk-trace", VERSION3);
    this._tracerMetrics = new TracerMetrics(meter);
  }
  /**
   * Starts a new Span or returns the default NoopSpan based on the sampling
   * decision.
   */
  startSpan(name, options = {}, context2 = context.active()) {
    if (options.root) {
      context2 = trace.deleteSpan(context2);
    }
    const parentSpan = trace.getSpan(context2);
    if (isTracingSuppressed(context2)) {
      diag.debug("Instrumentation suppressed, returning Noop Span");
      const nonRecordingSpan = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
      return nonRecordingSpan;
    }
    const parentSpanContext = parentSpan?.spanContext();
    const spanId = this._idGenerator.generateSpanId();
    let validParentSpanContext;
    let traceId;
    let traceState;
    if (!parentSpanContext || !trace.isSpanContextValid(parentSpanContext)) {
      traceId = this._idGenerator.generateTraceId();
    } else {
      traceId = parentSpanContext.traceId;
      traceState = parentSpanContext.traceState;
      validParentSpanContext = parentSpanContext;
    }
    const spanKind = options.kind ?? SpanKind.INTERNAL;
    const links = (options.links ?? []).map((link) => {
      return {
        context: link.context,
        attributes: sanitizeAttributes(link.attributes)
      };
    });
    const attributes = sanitizeAttributes(options.attributes);
    const samplingResult = this._sampler.shouldSample(context2, traceId, name, spanKind, attributes, links);
    const recordEndMetrics = this._tracerMetrics.startSpan(parentSpanContext, samplingResult.decision);
    traceState = samplingResult.traceState ?? traceState;
    const traceFlags = samplingResult.decision === SamplingDecision.RECORD_AND_SAMPLED ? TraceFlags.SAMPLED : TraceFlags.NONE;
    const spanContext = { traceId, spanId, traceFlags, traceState };
    if (samplingResult.decision === SamplingDecision.NOT_RECORD) {
      diag.debug("Recording is off, propagating context in a non-recording span");
      const nonRecordingSpan = trace.wrapSpanContext(spanContext);
      return nonRecordingSpan;
    }
    const initAttributes = sanitizeAttributes(Object.assign(attributes, samplingResult.attributes));
    const span = new SpanImpl({
      resource: this._resource,
      scope: this.instrumentationScope,
      context: context2,
      spanContext,
      name,
      kind: spanKind,
      links,
      parentSpanContext: validParentSpanContext,
      attributes: initAttributes,
      startTime: options.startTime,
      spanProcessor: this._spanProcessor,
      spanLimits: this._spanLimits,
      recordEndMetrics
    });
    return span;
  }
  startActiveSpan(name, arg2, arg3, arg4) {
    let opts;
    let ctx;
    let fn;
    if (arguments.length < 2) {
      return;
    } else if (arguments.length === 2) {
      fn = arg2;
    } else if (arguments.length === 3) {
      opts = arg2;
      fn = arg3;
    } else {
      opts = arg2;
      ctx = arg3;
      fn = arg4;
    }
    const parentContext = ctx ?? context.active();
    const span = this.startSpan(name, opts, parentContext);
    const contextWithSpanSet = trace.setSpan(parentContext, span);
    return context.with(contextWithSpanSet, fn, void 0, span);
  }
  [inspectCustom](depth, options, inspect2) {
    const payload = {
      instrumentationScope: this.instrumentationScope,
      resource: { attributes: settledResourceAttributes(this._resource) },
      spanLimits: this._spanLimits
    };
    return formatInspect("Tracer", payload, depth, options, inspect2);
  }
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/MultiSpanProcessor.js
var MultiSpanProcessor = class {
  _spanProcessors;
  constructor(spanProcessors) {
    this._spanProcessors = spanProcessors;
  }
  forceFlush() {
    const promises = [];
    for (const spanProcessor of this._spanProcessors) {
      promises.push(spanProcessor.forceFlush());
    }
    return new Promise((resolve3) => {
      Promise.all(promises).then(() => {
        resolve3();
      }).catch((error) => {
        globalErrorHandler(error || new Error("MultiSpanProcessor: forceFlush failed"));
        resolve3();
      });
    });
  }
  onStart(span, context2) {
    for (const spanProcessor of this._spanProcessors) {
      spanProcessor.onStart(span, context2);
    }
  }
  onEnding(span) {
    for (const spanProcessor of this._spanProcessors) {
      if (spanProcessor.onEnding) {
        spanProcessor.onEnding(span);
      }
    }
  }
  onEnd(span) {
    for (const spanProcessor of this._spanProcessors) {
      spanProcessor.onEnd(span);
    }
  }
  shutdown() {
    const promises = [];
    for (const spanProcessor of this._spanProcessors) {
      promises.push(spanProcessor.shutdown());
    }
    return new Promise((resolve3, reject) => {
      Promise.all(promises).then(() => {
        resolve3();
      }, reject);
    });
  }
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/sampler/ParentBasedSampler.js
init_esm();

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/sampler/AlwaysOffSampler.js
var AlwaysOffSampler = class {
  shouldSample() {
    return {
      decision: SamplingDecision2.NOT_RECORD
    };
  }
  toString() {
    return "AlwaysOffSampler";
  }
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/sampler/AlwaysOnSampler.js
var AlwaysOnSampler = class {
  shouldSample() {
    return {
      decision: SamplingDecision2.RECORD_AND_SAMPLED
    };
  }
  toString() {
    return "AlwaysOnSampler";
  }
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/sampler/ParentBasedSampler.js
var ParentBasedSampler = class {
  _root;
  _remoteParentSampled;
  _remoteParentNotSampled;
  _localParentSampled;
  _localParentNotSampled;
  constructor(config) {
    this._root = config.root;
    if (!this._root) {
      globalErrorHandler(new Error("ParentBasedSampler must have a root sampler configured"));
      this._root = new AlwaysOnSampler();
    }
    this._remoteParentSampled = config.remoteParentSampled ?? new AlwaysOnSampler();
    this._remoteParentNotSampled = config.remoteParentNotSampled ?? new AlwaysOffSampler();
    this._localParentSampled = config.localParentSampled ?? new AlwaysOnSampler();
    this._localParentNotSampled = config.localParentNotSampled ?? new AlwaysOffSampler();
  }
  shouldSample(context2, traceId, spanName, spanKind, attributes, links) {
    const parentContext = trace.getSpanContext(context2);
    if (!parentContext || !isSpanContextValid(parentContext)) {
      return this._root.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
    }
    if (parentContext.isRemote) {
      if (parentContext.traceFlags & TraceFlags.SAMPLED) {
        return this._remoteParentSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
      }
      return this._remoteParentNotSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
    }
    if (parentContext.traceFlags & TraceFlags.SAMPLED) {
      return this._localParentSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
    }
    return this._localParentNotSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
  }
  toString() {
    return `ParentBased{root=${this._root.toString()}, remoteParentSampled=${this._remoteParentSampled.toString()}, remoteParentNotSampled=${this._remoteParentNotSampled.toString()}, localParentSampled=${this._localParentSampled.toString()}, localParentNotSampled=${this._localParentNotSampled.toString()}}`;
  }
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/platform/node/RandomIdGenerator.js
var SPAN_ID_BYTES = 8;
var TRACE_ID_BYTES = 16;
var RandomIdGenerator = class {
  /**
   * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
   * characters corresponding to 128 bits.
   */
  generateTraceId = getIdGenerator(TRACE_ID_BYTES);
  /**
   * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
   * characters corresponding to 64 bits.
   */
  generateSpanId = getIdGenerator(SPAN_ID_BYTES);
};
var SHARED_BUFFER = Buffer.allocUnsafe(TRACE_ID_BYTES);
function getIdGenerator(bytes) {
  return function generateId() {
    for (let i = 0; i < bytes / 4; i++) {
      SHARED_BUFFER.writeUInt32BE(Math.random() * 2 ** 32 >>> 0, i * 4);
    }
    for (let i = 0; i < bytes; i++) {
      if (SHARED_BUFFER[i] > 0) {
        break;
      } else if (i === bytes - 1) {
        SHARED_BUFFER[bytes - 1] = 1;
      }
    }
    return SHARED_BUFFER.toString("hex", 0, bytes);
  };
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/TracerProvider.js
var ForceFlushState;
(function(ForceFlushState2) {
  ForceFlushState2[ForceFlushState2["resolved"] = 0] = "resolved";
  ForceFlushState2[ForceFlushState2["timeout"] = 1] = "timeout";
  ForceFlushState2[ForceFlushState2["error"] = 2] = "error";
  ForceFlushState2[ForceFlushState2["unresolved"] = 3] = "unresolved";
})(ForceFlushState || (ForceFlushState = {}));
var TracerProvider = class {
  _resource;
  _activeSpanProcessor;
  _forceFlushTimeoutMillis;
  _tracerOptions;
  _tracers = /* @__PURE__ */ new Map();
  constructor(options = {}) {
    this._forceFlushTimeoutMillis = options.forceFlushTimeoutMillis ?? 3e4;
    this._resource = options.resource ?? defaultResource();
    const spanProcessors = options.spanProcessors ?? [];
    this._activeSpanProcessor = new MultiSpanProcessor(spanProcessors);
    this._tracerOptions = {
      resource: this._resource,
      sampler: options.sampler ?? new ParentBasedSampler({
        root: new AlwaysOnSampler()
      }),
      spanLimits: {
        attributeCountLimit: options.spanLimits?.attributeCountLimit ?? 128,
        attributeValueLengthLimit: options.spanLimits?.attributeValueLengthLimit ?? Infinity,
        eventCountLimit: options.spanLimits?.eventCountLimit ?? 128,
        linkCountLimit: options.spanLimits?.linkCountLimit ?? 128,
        attributePerEventCountLimit: options.spanLimits?.attributePerEventCountLimit ?? 128,
        attributePerLinkCountLimit: options.spanLimits?.attributePerLinkCountLimit ?? 128
      },
      idGenerator: options.idGenerator || new RandomIdGenerator(),
      spanProcessor: this._activeSpanProcessor,
      meterProvider: options.meterProvider ?? {
        getMeter() {
          return createNoopMeter();
        }
      }
    };
  }
  getTracer(name, version, options) {
    const key = `${name}@${version || ""}:${options?.schemaUrl || ""}`;
    if (!this._tracers.has(key)) {
      this._tracers.set(key, new Tracer({ name, version, schemaUrl: options?.schemaUrl }, this._tracerOptions));
    }
    return this._tracers.get(key);
  }
  forceFlush(options) {
    const timeout = options?.timeoutMillis ?? this._forceFlushTimeoutMillis;
    const promises = this._activeSpanProcessor["_spanProcessors"].map((spanProcessor) => {
      return new Promise((resolve3) => {
        let state;
        const timeoutInterval = setTimeout(() => {
          resolve3(new Error(`Span processor did not completed within timeout period of ${timeout} ms`));
          state = ForceFlushState.timeout;
        }, timeout);
        spanProcessor.forceFlush().then(() => {
          clearTimeout(timeoutInterval);
          if (state !== ForceFlushState.timeout) {
            state = ForceFlushState.resolved;
            resolve3(state);
          }
        }).catch((error) => {
          clearTimeout(timeoutInterval);
          state = ForceFlushState.error;
          resolve3(error);
        });
      });
    });
    return new Promise((resolve3, reject) => {
      Promise.all(promises).then((results) => {
        const errors = results.filter((result) => result !== ForceFlushState.resolved);
        if (errors.length > 0) {
          reject(errors);
        } else {
          resolve3();
        }
      }).catch((error) => reject([error]));
    });
  }
  shutdown() {
    return this._activeSpanProcessor.shutdown();
  }
  [inspectCustom](depth, options, inspect2) {
    const processors = this._activeSpanProcessor["_spanProcessors"];
    const payload = {
      resource: { attributes: settledResourceAttributes(this._resource) },
      tracers: Array.from(this._tracers.keys()),
      spanProcessors: processors.map((p) => p.constructor?.name ?? "SpanProcessor")
    };
    return formatInspect("TracerProvider", payload, depth, options, inspect2);
  }
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace/build/esm/sampler/TraceIdRatioBasedSampler.js
init_esm();
var TraceIdRatioBasedSampler = class {
  _ratio;
  _upperBound;
  constructor(ratio = 0) {
    this._ratio = this._normalize(ratio);
    this._upperBound = this._ratio === 1 ? 4294967296 : Math.floor(this._ratio * 4294967295);
  }
  shouldSample(context2, traceId) {
    return {
      decision: isValidTraceId(traceId) && this._accumulate(traceId) < this._upperBound ? SamplingDecision2.RECORD_AND_SAMPLED : SamplingDecision2.NOT_RECORD
    };
  }
  toString() {
    return `TraceIdRatioBased{${this._ratio}}`;
  }
  _normalize(ratio) {
    if (typeof ratio !== "number" || isNaN(ratio))
      return 0;
    return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
  }
  _accumulate(traceId) {
    let accumulation = 0;
    for (let i = 0; i < 32; i += 8) {
      let part = 0;
      for (let j = 0; j < 8; j++) {
        const c = traceId.charCodeAt(i + j);
        const v = c < 58 ? c - 48 : c < 71 ? c - 55 : c - 87;
        part = part << 4 | v;
      }
      accumulation = (accumulation ^ part) >>> 0;
    }
    return accumulation;
  }
};

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace-base/build/esm/config.js
var TracesSamplerValues;
(function(TracesSamplerValues2) {
  TracesSamplerValues2["AlwaysOff"] = "always_off";
  TracesSamplerValues2["AlwaysOn"] = "always_on";
  TracesSamplerValues2["ParentBasedAlwaysOff"] = "parentbased_always_off";
  TracesSamplerValues2["ParentBasedAlwaysOn"] = "parentbased_always_on";
  TracesSamplerValues2["ParentBasedTraceIdRatio"] = "parentbased_traceidratio";
  TracesSamplerValues2["TraceIdRatio"] = "traceidratio";
})(TracesSamplerValues || (TracesSamplerValues = {}));
var DEFAULT_RATIO = 1;
function loadDefaultConfig() {
  return {
    sampler: buildSamplerFromEnv(),
    forceFlushTimeoutMillis: 3e4,
    generalLimits: {
      attributeValueLengthLimit: getNumberFromEnv("OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? Infinity,
      attributeCountLimit: getNumberFromEnv("OTEL_ATTRIBUTE_COUNT_LIMIT") ?? 128
    },
    spanLimits: {
      attributeValueLengthLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? Infinity,
      attributeCountLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT") ?? 128,
      linkCountLimit: getNumberFromEnv("OTEL_SPAN_LINK_COUNT_LIMIT") ?? 128,
      eventCountLimit: getNumberFromEnv("OTEL_SPAN_EVENT_COUNT_LIMIT") ?? 128,
      attributePerEventCountLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT") ?? 128,
      attributePerLinkCountLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT") ?? 128
    }
  };
}
function buildSamplerFromEnv() {
  const sampler = getStringFromEnv("OTEL_TRACES_SAMPLER") ?? TracesSamplerValues.ParentBasedAlwaysOn;
  switch (sampler) {
    case TracesSamplerValues.AlwaysOn:
      return new AlwaysOnSampler();
    case TracesSamplerValues.AlwaysOff:
      return new AlwaysOffSampler();
    case TracesSamplerValues.ParentBasedAlwaysOn:
      return new ParentBasedSampler({
        root: new AlwaysOnSampler()
      });
    case TracesSamplerValues.ParentBasedAlwaysOff:
      return new ParentBasedSampler({
        root: new AlwaysOffSampler()
      });
    case TracesSamplerValues.TraceIdRatio:
      return new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv());
    case TracesSamplerValues.ParentBasedTraceIdRatio:
      return new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv())
      });
    default:
      diag.error(`OTEL_TRACES_SAMPLER value "${sampler}" invalid, defaulting to "${TracesSamplerValues.ParentBasedAlwaysOn}".`);
      return new ParentBasedSampler({
        root: new AlwaysOnSampler()
      });
  }
}
function getSamplerProbabilityFromEnv() {
  const probability = getNumberFromEnv("OTEL_TRACES_SAMPLER_ARG");
  if (probability == null) {
    diag.error(`OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`);
    return DEFAULT_RATIO;
  }
  if (probability < 0 || probability > 1) {
    diag.error(`OTEL_TRACES_SAMPLER_ARG=${probability} was given, but it is out of range ([0..1]), defaulting to ${DEFAULT_RATIO}.`);
    return DEFAULT_RATIO;
  }
  return probability;
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace-base/build/esm/utility.js
var DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
var DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;
function reconfigureLimits(userConfig) {
  const spanLimits = Object.assign({}, userConfig.spanLimits);
  spanLimits.attributeCountLimit = userConfig.spanLimits?.attributeCountLimit ?? userConfig.generalLimits?.attributeCountLimit ?? getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT") ?? getNumberFromEnv("OTEL_ATTRIBUTE_COUNT_LIMIT") ?? DEFAULT_ATTRIBUTE_COUNT_LIMIT;
  spanLimits.attributeValueLengthLimit = userConfig.spanLimits?.attributeValueLengthLimit ?? userConfig.generalLimits?.attributeValueLengthLimit ?? getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? getNumberFromEnv("OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT;
  return Object.assign({}, userConfig, { spanLimits });
}

// ../telmoni/sdk/typescript/node_modules/@opentelemetry/sdk-trace-base/build/esm/BasicTracerProvider-shim.js
var BasicTracerProvider = class extends TracerProvider {
  constructor(config = {}) {
    const mergedConfig = merge({}, loadDefaultConfig(), reconfigureLimits(config));
    delete mergedConfig.generalLimits;
    super(mergedConfig);
  }
};

// ../telmoni/sdk/typescript/dist/index.mjs
init_esm();
import { createHash as createHash2 } from "crypto";
import { Agent as HttpAgent, ClientRequest } from "http";
import { Agent as HttpsAgent } from "https";
import { urlToHttpOptions } from "url";
import { createHash as createHash22 } from "crypto";
init_esm();
init_esm();
init_esm();
import { randomUUID as randomUUID2 } from "crypto";
var SCOPE = "telmoni";
var TRACE_START = "telmoni.trace.start";
var DISTRO_NAME = "telemetry.distro.name";
var DISTRO = "telmoni";
var AGENT2 = "telmoni.agent";
var USER_ID = "user.id";
var TAG_PREFIX = "telmoni.tag.";
var TAGS_MAX = 32;
var TAG_KEY_MAX = 64;
var TAG_VALUE_MAX = 256;
var NAME_MAX = 145;
var AGENT_MAX = 128;
var ERROR_TYPE_MAX = 128;
var MODEL_MAX3 = 128;
var PROVIDER_MAX = 128;
var USER_ID_MAX = 128;
var SESSION_ID_MAX = 200;
var BATCH_MAX_BYTES = 1 << 20;
var BATCH_SPANS_MAX = 1e3;
var ATTRIBUTE_KEY_MAX = 128;
var ATTRIBUTE_VALUE_MAX = 1024;
var CANCELLED = "telmoni.cancelled";
var RETRIEVAL_RETURNED = "telmoni.retrieval.returned";
var ENVIRONMENT = "deployment.environment.name";
var RELEASE = "service.version";
var ENVIRONMENT_MAX = 128;
var RELEASE_MAX = 128;
var TRACEPARENT = "traceparent";
var BAGGAGE = "baggage";
var OPERATION = "gen_ai.operation.name";
var AGENT_NAME = "gen_ai.agent.name";
var TOOL_NAME = "gen_ai.tool.name";
var ERROR_TYPE = "error.type";
var RESPONSE_MODEL = "gen_ai.response.model";
var REQUEST_MODEL = "gen_ai.request.model";
var PROVIDER2 = "gen_ai.provider.name";
var REQUEST_REASONING_LEVEL = "gen_ai.request.reasoning.level";
var PROMPT_NAME = "gen_ai.prompt.name";
var PROMPT_VERSION = "gen_ai.prompt.version";
var TIME_TO_FIRST_CHUNK = "gen_ai.response.time_to_first_chunk";
var INPUT_TOKENS = "gen_ai.usage.input_tokens";
var OUTPUT_TOKENS = "gen_ai.usage.output_tokens";
var REASONING_OUTPUT_TOKENS = "gen_ai.usage.reasoning.output_tokens";
var CACHE_READ_INPUT_TOKENS = "gen_ai.usage.cache_read.input_tokens";
var CACHE_CREATION_INPUT_TOKENS = "gen_ai.usage.cache_creation.input_tokens";
var COST = "gen_ai.usage.cost";
var SESSION_ID = "gen_ai.conversation.id";
var DATA_SOURCE_ID = "gen_ai.data_source.id";
var MEMORY_STORE_ID = "gen_ai.memory.store.id";
var RETRIEVAL_TOP_K = "gen_ai.retrieval.top_k";
var MEMORY_RECORD_COUNT = "gen_ai.memory.record.count";
var INPUT_MESSAGES = "gen_ai.input.messages";
var OUTPUT_MESSAGES = "gen_ai.output.messages";
var SYSTEM_INSTRUCTIONS = "gen_ai.system_instructions";
var TOOL_CALL_ARGUMENTS = "gen_ai.tool.call.arguments";
var TOOL_CALL_RESULT = "gen_ai.tool.call.result";
var RETRIEVAL_QUERY_TEXT = "gen_ai.retrieval.query.text";
var RETRIEVAL_DOCUMENTS = "gen_ai.retrieval.documents";
var MEMORY_QUERY_TEXT = "gen_ai.memory.query.text";
var MEMORY_RECORDS = "gen_ai.memory.records";
var CONTENT_CUT = "telmoni.content_cut";
var SCRUBBED = "telmoni.scrubbed";
var STATUS_DESCRIPTION = "otel.status_description";
var EXCEPTION_EVENT = "exception";
var EXCEPTION_TYPE = "exception.type";
var EXCEPTION_MESSAGE = "exception.message";
var EXCEPTION_STACKTRACE = "exception.stacktrace";
var CONTENT = /* @__PURE__ */ new Set([
  INPUT_MESSAGES,
  OUTPUT_MESSAGES,
  SYSTEM_INSTRUCTIONS,
  "gen_ai.tool.definitions",
  TOOL_CALL_ARGUMENTS,
  TOOL_CALL_RESULT,
  RETRIEVAL_QUERY_TEXT,
  RETRIEVAL_DOCUMENTS,
  MEMORY_QUERY_TEXT,
  MEMORY_RECORDS,
  "gen_ai.prompt.variable",
  "user.email",
  "user.full_name",
  "user.name",
  CONTENT_CUT,
  EXCEPTION_TYPE,
  EXCEPTION_MESSAGE,
  EXCEPTION_STACKTRACE,
  STATUS_DESCRIPTION,
  "telmoni.events"
]);
var MODEL_OPERATIONS = /* @__PURE__ */ new Set([
  "chat",
  "generate_content",
  "text_completion",
  "embeddings"
]);
var DEFAULT_MODEL_OPERATION = "chat";
var TOOL_OPERATION = "execute_tool";
var AGENT_OPERATION = "invoke_agent";
var RETRIEVAL_OPERATION = "retrieval";
var SEARCH_MEMORY = "search_memory";
var MEDIA_FIELDS = [INPUT_MESSAGES, OUTPUT_MESSAGES, SYSTEM_INSTRUCTIONS];
var MEDIA_PATH = "/v1/media/";
var FILE_ID_PREFIX = "telmoni:";
var MEDIA_MAX_BYTES = 5 * 1024 * 1024;
var MEDIA_DEFAULT_TYPE = "application/octet-stream";
var EVALUATION_EVENT = "gen_ai.evaluation.result";
var EVALUATION_NAME = "gen_ai.evaluation.name";
var EVALUATION_VALUE = "gen_ai.evaluation.score.value";
var EVALUATION_LABEL = "gen_ai.evaluation.score.label";
var SCORE_TYPE = "telmoni.score.type";
var SCORE_RANGE_MIN = "telmoni.score.range_min";
var SCORE_RANGE_MAX = "telmoni.score.range_max";
var SCORE_VERSION = "telmoni.score.version";
var SCORES_PATH = "/v1/scores";
var SCORE_SPAN = "telmoni.score";
var SCORE_SENT = "telmoni.score.sent";
var SCORE_NAME_MAX = 64;
var SCORE_CATEGORY_MAX = 64;
var SCORE_VERSION_MAX = 64;
var SCORES_PER_SPAN = 16;
var SCORES_SENT_MAX = 100;
var CAPTURE_CONTENT_ENV = "TELMONI_CAPTURE_CONTENT";
var SCRUB_SECRETS_ENV = "TELMONI_SCRUB_SECRETS";
var SCRUB_PII_ENV = "TELMONI_SCRUB_PII";
var CONTENT_MODE_HEADER = "Telmoni-Content-Mode";
var SENT_AT_HEADER = "Telmoni-Sent-At";
function names(error) {
  if (error === null || error === void 0) return { ctor: "", name: "" };
  const named = error;
  const ctor = typeof named.constructor?.name === "string" ? named.constructor.name : "";
  const name = typeof named.name === "string" ? named.name : "";
  return { ctor, name };
}
function errorType(error) {
  const { ctor, name } = names(error);
  if (ctor === "DOMException") return name || ctor;
  return ctor || name || "Error";
}
function errorName(error) {
  const { ctor, name } = names(error);
  return name || ctor || "Error";
}
var QueueFullError = class extends Error {
  constructor(spans, queue) {
    const advice = spans <= queue ? "flush or wait, then record it again" : `the queue holds ${queue}, so raise its size to record it`;
    super(`the export queue has no room for the record's ${spans} spans; ${advice}`);
    this.name = "QueueFullError";
  }
};
var ShutdownError = class extends Error {
  constructor() {
    super("the client is shut down; the record was not sent");
    this.name = "ShutdownError";
  }
};
var CapExceededError = class extends Error {
  cap;
  limit;
  used;
  constructor(cap, limit, used) {
    super(
      cap === "steps" ? `the trace reached its step cap of ${plain(limit)}` : `the trace reached its spend cap of $${plain(limit)}, having spent $${plain(used)}`
    );
    this.name = "CapExceededError";
    this.cap = cap;
    this.limit = limit;
    this.used = used;
  }
};
function plain(amount) {
  const [digits = "", exponent] = String(amount).split("e");
  if (exponent === void 0) return digits;
  const sign = digits.startsWith("-") ? "-" : "";
  const [whole2 = "", fraction = ""] = digits.slice(sign.length).split(".");
  const all = whole2 + fraction;
  const point = whole2.length + Number(exponent);
  if (point <= 0) return `${sign}0.${"0".repeat(-point)}${all}`;
  if (point >= all.length) return `${sign}${all}${"0".repeat(point - all.length)}`;
  return `${sign}${all.slice(0, point)}.${all.slice(point)}`;
}
function isAbort(error) {
  return typeof error === "object" && error !== null && error.name === "AbortError";
}
function digitAt(text3, i) {
  const c = text3.charCodeAt(i);
  return c >= 48 && c <= 57;
}
function upperAt(text3, i) {
  const c = text3.charCodeAt(i);
  return c >= 65 && c <= 90;
}
function letterAt(text3, i) {
  const c = text3.charCodeAt(i);
  return c >= 65 && c <= 90 || c >= 97 && c <= 122;
}
function alnumAt(text3, i) {
  return digitAt(text3, i) || letterAt(text3, i);
}
function wordAt(text3, i) {
  return alnumAt(text3, i) || text3.charAt(i) === "_";
}
function keyAt(text3, i) {
  return wordAt(text3, i) || text3.charAt(i) === "-";
}
function hexAt(text3, i) {
  const c = text3.charCodeAt(i);
  return digitAt(text3, i) || c >= 65 && c <= 70 || c >= 97 && c <= 102;
}
function digitsAt(text3, i, count2) {
  for (let n = 0; n < count2; n++) if (!digitAt(text3, i + n)) return false;
  return true;
}
function bounded(text3, start, end) {
  return !wordAt(text3, start - 1) && !wordAt(text3, end);
}
function each(find) {
  return (text3) => (from) => find(text3, from);
}
function matching(pattern, boundary) {
  return (text3) => (from) => {
    for (let at = from; at <= text3.length; ) {
      pattern.lastIndex = at;
      const match = pattern.exec(text3);
      if (match === null) return void 0;
      const end = match.index + match[0].length;
      if (!boundary || bounded(text3, match.index, end)) return [match.index, end];
      at = match.index + 1;
    }
    return void 0;
  };
}
function keyed(prefix, runOf) {
  return (text3) => (from) => {
    for (prefix.lastIndex = from; ; ) {
      const found = prefix.exec(text3);
      if (found === null) return void 0;
      const start = found.index;
      if (wordAt(text3, start - 1)) {
        prefix.lastIndex = start + 1;
        continue;
      }
      const [inRun, least] = runOf(found[0]);
      const run = start + found[0].length;
      let end = run;
      while (inRun(text3, end)) end++;
      if (end - run >= least && !wordAt(text3, end)) return [start, end];
      prefix.lastIndex = end;
    }
  };
}
var BEGIN = /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/g;
var END = /-----END [A-Z0-9 ]*PRIVATE KEY-----/g;
function unescapedQuote(text3, i) {
  for (let at = text3.indexOf('"', i); at >= 0; at = text3.indexOf('"', at + 1)) {
    let slashes = 0;
    while (text3.charAt(at - 1 - slashes) === "\\") slashes++;
    if (slashes % 2 === 0) return at;
  }
  return -1;
}
function privateKeys(text3) {
  let end;
  let quote;
  return (from) => {
    BEGIN.lastIndex = from;
    const begin = BEGIN.exec(text3);
    if (begin === null) return void 0;
    const after2 = begin.index + begin[0].length;
    if (end === void 0 || end !== null && end.index < after2) {
      END.lastIndex = after2;
      end = END.exec(text3);
    }
    if (quote === void 0 || quote >= 0 && quote < after2) quote = unescapedQuote(text3, after2);
    const stop2 = quote < 0 ? text3.length : quote;
    if (end !== null && end.index + end[0].length <= stop2) return [begin.index, end.index + end[0].length];
    return [begin.index, stop2];
  };
}
function schemeAt(text3, i) {
  const c = text3.charAt(i);
  return alnumAt(text3, i) || c === "+" || c === "." || c === "-";
}
var CREDENTIALS = /[^ \t\n\v\f\r"'\\\/@:]+:[^ \t\n\v\f\r"'\\\/@]+@[^ \t\n\v\f\r"'\\]+/y;
function findConnection(text3, from) {
  for (let at = text3.indexOf("://", from); at >= 0; at = text3.indexOf("://", at + 1)) {
    let start = at;
    while (start > from && start > at - 21 && schemeAt(text3, start - 1)) start--;
    while (start < at - 1 && !letterAt(text3, start)) start++;
    if (start > at - 2) continue;
    CREDENTIALS.lastIndex = at + 3;
    const credentials = CREDENTIALS.exec(text3);
    if (credentials !== null) return [start, at + 3 + credentials[0].length];
  }
  return void 0;
}
function keyRunEnd(text3, i) {
  while (keyAt(text3, i)) i++;
  return i;
}
function jwtTail(text3, at) {
  if (text3.charAt(at) !== "." || !text3.startsWith("eyJ", at + 1)) return void 0;
  const second = keyRunEnd(text3, at + 4);
  if (second - (at + 4) < 8 || text3.charAt(second) !== ".") return void 0;
  const third = keyRunEnd(text3, second + 1);
  return third - (second + 1) >= 8 ? third : void 0;
}
function findJwt(text3, from) {
  for (let start = text3.indexOf("eyJ", from); start >= 0; ) {
    if (wordAt(text3, start - 1)) {
      start = text3.indexOf("eyJ", start + 1);
      continue;
    }
    const first = keyRunEnd(text3, start + 3);
    const end = first - (start + 3) >= 8 ? jwtTail(text3, first) : void 0;
    if (end !== void 0) return [start, end];
    start = text3.indexOf("eyJ", first);
  }
  return void 0;
}
var KEYWORDS = [
  "sharedaccesskey",
  "client_secret",
  "accountkey",
  "access_key",
  "access-key",
  "password",
  "api_key",
  "api-key",
  "apikey",
  "passwd",
  "secret",
  "token",
  "pwd"
];
var KEYWORD = new RegExp(KEYWORDS.join("|"), "gi");
var PASSWORDS = /* @__PURE__ */ new Set(["password", "passwd", "pwd"]);
var SEPARATORS = new Set(` 	"'\\`);
var VALUE_STOPS = new Set(` 	
\v\f\r"'\\,;&{}()<>[]`);
function separated(text3, i) {
  for (let n = 0; n < 4 && SEPARATORS.has(text3.charAt(i)); n++) i++;
  return i;
}
function holds(text3, start, end, count2) {
  let held = 0;
  for (let i = start; i < end && held < count2; i += text3.codePointAt(i) > 65535 ? 2 : 1) held++;
  return held >= count2;
}
function keywords(text3) {
  let runFrom = -1;
  let runEnd = -1;
  let lastLetter = -1;
  let lastDigit = -1;
  return (from) => {
    for (KEYWORD.lastIndex = from; ; ) {
      const match = KEYWORD.exec(text3);
      if (match === null) return void 0;
      const i = match.index;
      KEYWORD.lastIndex = i + 1;
      if (wordAt(text3, i - 1)) continue;
      const keyword = match[0].toLowerCase();
      let start = separated(text3, i + keyword.length);
      if (text3.charAt(start) !== ":" && text3.charAt(start) !== "=") continue;
      start = separated(text3, start + 1);
      if (start < runFrom || start > runEnd) {
        runFrom = start;
        lastLetter = lastDigit = -1;
        for (runEnd = start; runEnd < text3.length && !VALUE_STOPS.has(text3.charAt(runEnd)); runEnd++) {
          if (letterAt(text3, runEnd)) lastLetter = runEnd;
          else if (digitAt(text3, runEnd)) lastDigit = runEnd;
        }
      }
      const kind = PASSWORDS.has(keyword) ? "password" : "token";
      const held = kind === "password" ? holds(text3, start, runEnd, 8) : holds(text3, start, runEnd, 16) && lastLetter >= start && lastDigit >= start;
      if (held) return [start, runEnd, kind];
    }
  };
}
var SECRETS = [
  ["private_key", privateKeys],
  ["connection_string", each(findConnection)],
  ["jwt", each(findJwt)],
  ["anthropic_key", keyed(/sk-ant-/g, () => [keyAt, 20])],
  ["openai_key", keyed(/sk-/g, () => [keyAt, 20])],
  ["stripe_key", keyed(/(?:sk|rk)_(?:live|test)_|whsec_/g, () => [alnumAt, 16])],
  ["github_token", keyed(/gh[pousr]_|github_pat_/g, (prefix) => prefix.length === 4 ? [alnumAt, 36] : [wordAt, 22])],
  ["slack_token", keyed(/xox[abposr]-/g, () => [(text3, i) => alnumAt(text3, i) || text3.charAt(i) === "-", 10])],
  ["aws_key", matching(/(?:AKIA|ASIA)[0-9A-Z]{16}/g, true)],
  ["gcp_key", matching(/AIza[0-9A-Za-z_-]{35}/g, true)],
  ["telmoni_key", keyed(/tm_/g, () => [keyAt, 20])],
  ["token", keywords]
];
var LOCAL_MARKS = new Set("._%+-");
var DOMAIN = /[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/y;
function findEmail(text3, from) {
  for (let at = text3.indexOf("@", from); at >= 0; at = text3.indexOf("@", at + 1)) {
    let start = at;
    while (start > from && (alnumAt(text3, start - 1) || LOCAL_MARKS.has(text3.charAt(start - 1)))) start--;
    if (start === at) continue;
    DOMAIN.lastIndex = at + 1;
    const domain = DOMAIN.exec(text3);
    if (domain !== null) return [start, at + 1 + domain[0].length];
  }
  return void 0;
}
function ibanCharsAt(text3, i, count2) {
  for (let n = 0; n < count2; n++) if (!upperAt(text3, i + n) && !digitAt(text3, i + n)) return false;
  return true;
}
function ibanGrouped(text3, i) {
  let end = i + 4;
  for (let held = 4; text3.charAt(end) === " " && ibanCharsAt(text3, end + 1, 4); held += 4) {
    if (held + 4 > 34) return void 0;
    end += 5;
  }
  if (end === i + 4) return void 0;
  let tail = end + 1;
  if (text3.charAt(end) === " ") while (tail - (end + 1) < 3 && ibanCharsAt(text3, tail, 1)) tail++;
  return tail > end + 1 ? tail : end;
}
function ibanCompact(text3, i) {
  let end = i + 4;
  while (end - (i + 4) < 30 && ibanCharsAt(text3, end, 1)) end++;
  return end - (i + 4) >= 11 ? end : void 0;
}
function ibanValid(candidate) {
  const compact = candidate.replaceAll(" ", "");
  if (compact.length < 15 || compact.length > 34) return false;
  let rest = 0;
  for (const c of compact.slice(4) + compact.slice(0, 4)) {
    const value = c >= "A" ? c.charCodeAt(0) - 55 : c.charCodeAt(0) - 48;
    rest = (rest * (value > 9 ? 100 : 10) + value) % 97;
  }
  return rest === 1;
}
var IBAN_FORMS = [ibanGrouped, ibanCompact];
function findIban(text3, from) {
  for (let i = from; i < text3.length; i++) {
    if (!upperAt(text3, i) || !upperAt(text3, i + 1) || !digitAt(text3, i + 2) || !digitAt(text3, i + 3)) continue;
    for (const form of IBAN_FORMS) {
      const end = form(text3, i);
      if (end !== void 0 && bounded(text3, i, end) && ibanValid(text3.slice(i, end))) return [i, end];
    }
  }
  return void 0;
}
function findCard(text3, from) {
  for (let i = from; i < text3.length; i++) {
    const first = text3.charCodeAt(i);
    if (first < 50 || first > 54 || alnumAt(text3, i - 1)) continue;
    let evens = 0;
    let odds = 0;
    let longest;
    for (let j = i, count2 = 1; ; count2++) {
      const digit = text3.charCodeAt(j) - 48;
      const twice = digit > 4 ? 2 * digit - 9 : 2 * digit;
      evens += count2 % 2 === 1 ? twice : digit;
      odds += count2 % 2 === 1 ? digit : twice;
      j += 1;
      if (count2 > 12 && (count2 % 2 === 0 ? evens : odds) % 10 === 0 && !alnumAt(text3, j)) longest = j;
      if (count2 === 19) break;
      if (digitAt(text3, j)) continue;
      if (text3.charAt(j) !== " " && text3.charAt(j) !== "-" || !digitAt(text3, j + 1)) break;
      j += 1;
    }
    if (longest !== void 0) return [i, longest];
  }
  return void 0;
}
var SSN = /[0-9]{3}-[0-9]{2}-[0-9]{4}/g;
function findSsn(text3, from) {
  for (let i = from; ; i++) {
    SSN.lastIndex = i;
    const match = SSN.exec(text3);
    if (match === null) return void 0;
    i = match.index;
    if (alnumAt(text3, i - 1) || alnumAt(text3, i + 11)) continue;
    const area = text3.slice(i, i + 3);
    if (area === "000" || area === "666" || area.startsWith("9")) continue;
    if (text3.slice(i + 4, i + 6) === "00" || text3.slice(i + 7, i + 11) === "0000") continue;
    return [i, i + 11];
  }
}
var PHONE_SEPARATORS = new Set(" .-");
var PHONE_MARKS = /[ .\-()]/;
function findPhone(text3, from) {
  for (let i = from; i < text3.length; i++) {
    const c = text3.charAt(i);
    if (c !== "+" && c !== "(" && !digitAt(text3, i) || alnumAt(text3, i - 1) || text3.charAt(i - 1) === "+") continue;
    let j = i;
    let country = false;
    if (c === "+") {
      let k = j + 1;
      while (k - (j + 1) < 3 && digitAt(text3, k)) k++;
      if (k === j + 1) continue;
      j = k;
      country = true;
      if (PHONE_SEPARATORS.has(text3.charAt(j))) j++;
    }
    if (text3.charAt(j) === "(") {
      if (!digitsAt(text3, j + 1, 3) || text3.charAt(j + 4) !== ")") continue;
      j += 5;
    } else if (digitsAt(text3, j, 3)) {
      j += 3;
    } else {
      continue;
    }
    if (PHONE_SEPARATORS.has(text3.charAt(j))) j++;
    if (!digitsAt(text3, j, 3)) continue;
    j += 3;
    if (PHONE_SEPARATORS.has(text3.charAt(j))) j++;
    if (!digitsAt(text3, j, 4)) continue;
    j += 4;
    if (alnumAt(text3, j)) continue;
    if (country || PHONE_MARKS.test(text3.slice(i, j))) return [i, j];
  }
  return void 0;
}
function ipv4At(text3, i) {
  let j = i;
  for (let part = 0; part < 4; part++) {
    let k = j;
    let octet = 0;
    for (; k - j < 3 && digitAt(text3, k); k++) octet = octet * 10 + text3.charCodeAt(k) - 48;
    if (k === j || octet > 255) return void 0;
    j = k;
    if (part < 3) {
      if (text3.charAt(j) !== ".") return void 0;
      j++;
    }
  }
  return alnumAt(text3, j) || text3.charAt(j) === "." ? void 0 : j;
}
function ipv6Valid(candidate) {
  const halves = candidate.split("::");
  if (halves.length > 2) return false;
  const groups = halves.length === 2 ? halves.flatMap((half) => half ? half.split(":") : []) : candidate.split(":");
  if (halves.length === 2 ? groups.length > 7 : groups.length !== 8) return false;
  return groups.every((group) => /^[0-9A-Fa-f]{1,4}$/.test(group));
}
function findIp(text3, from) {
  for (let i = from; i < text3.length; i++) {
    if (!hexAt(text3, i) && text3.charAt(i) !== ":") continue;
    if (digitAt(text3, i) && !alnumAt(text3, i - 1) && text3.charAt(i - 1) !== ".") {
      const end2 = ipv4At(text3, i);
      if (end2 !== void 0) return [i, end2];
    }
    if (hexAt(text3, i - 1) || text3.charAt(i - 1) === ":" || letterAt(text3, i - 1)) continue;
    let end = i;
    let colons = 0;
    for (; hexAt(text3, end) || text3.charAt(end) === ":"; end++) if (text3.charAt(end) === ":") colons++;
    if (colons < 2 || letterAt(text3, end)) continue;
    const candidate = text3.slice(i, end);
    if ((candidate.includes("::") || colons === 7) && ipv6Valid(candidate)) return [i, end];
  }
  return void 0;
}
var HOME = /(?:\/home\/|\/Users\/|[A-Za-z]:(?:\\{1,2}|\/)Users(?:\\{1,2}|\/))[A-Za-z0-9._-]+/g;
var PII = [
  ["email", each(findEmail)],
  ["iban", each(findIban)],
  ["card", each(findCard)],
  ["ssn", each(findSsn)],
  ["phone", each(findPhone)],
  ["ip", each(findIp)],
  ["home_path", matching(HOME, false)]
];
function replaced(text3, family, [kind, reading], counts) {
  const find = reading(text3);
  let out = "";
  let at = 0;
  for (let found = find(at); found !== void 0; found = find(at)) {
    const [start, end, named = kind] = found;
    out += `${text3.slice(at, start)}[${family}: ${named}]`;
    counts.set(`${family}:${named}`, (counts.get(`${family}:${named}`) ?? 0) + 1);
    at = end;
  }
  return out + text3.slice(at);
}
function scrub(text3, secrets, pii) {
  const counts = /* @__PURE__ */ new Map();
  if (secrets) for (const rule of SECRETS) text3 = replaced(text3, "secret", rule, counts);
  if (pii) for (const rule of PII) text3 = replaced(text3, "pii", rule, counts);
  return [text3, counts];
}
function scrubbedOf(counts) {
  return JSON.stringify(Object.fromEntries([...counts].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)));
}
var scrubber = { scrub };
var VERSION4 = "0.2.0";
var WHITE_SPACE = new Set("	\n\v\f\r \x85\xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000");
function trimEnds(value) {
  let start = 0;
  while (start < value.length && WHITE_SPACE.has(value.charAt(start))) start++;
  let end = value.length;
  while (end > start && WHITE_SPACE.has(value.charAt(end - 1))) end--;
  return value.slice(start, end);
}
function isBlank(value) {
  return trimEnds(value) === "";
}
var ATTEMPTS = 3;
var MASK_FAILED = /* @__PURE__ */ Symbol("mask failed");
var RETRIED = /* @__PURE__ */ new Set([429, 502, 503, 504]);
var REQUEST_TIMEOUT_MS = 1e4;
var ANSWER_MAX = 1 << 20;
var RETRY_AFTER_MAX_S = 60;
var WARNED_MAX = 1024;
var UPLOADED_MAX = 4096;
var CONTENT_DOCS = "https://telmoni.com/docs/api/ingest#what-is-dropped-at-the-door";
var LONE_SURROGATE = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g;
var DROPPED = /^span (\S+) dropped (\S+): (\w+)(?:; (.*))?$/;
var REFUSED = /^span (\S+) refused: (.*)$/;
var SECONDS = /^[ \t]*([+-]?)([0-9]+)[ \t]*$/;
var BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;
var HEADER_SAFE = /^ *[\x21-\x7e][\x20-\x7e]*$/;
var KINDS = {
  [SpanKind.INTERNAL]: 1,
  [SpanKind.SERVER]: 2,
  [SpanKind.CLIENT]: 3,
  [SpanKind.PRODUCER]: 4,
  [SpanKind.CONSUMER]: 5
};
var DOUBLES = /* @__PURE__ */ new Set([
  COST,
  TIME_TO_FIRST_CHUNK,
  EVALUATION_VALUE,
  SCORE_RANGE_MIN,
  SCORE_RANGE_MAX
]);
var SCORE_KEYS = /* @__PURE__ */ new Set([
  EVALUATION_NAME,
  EVALUATION_VALUE,
  EVALUATION_LABEL,
  SCORE_TYPE,
  SCORE_RANGE_MIN,
  SCORE_RANGE_MAX,
  SCORE_VERSION
]);
var INTEGERS = /* @__PURE__ */ new Set([
  INPUT_TOKENS,
  OUTPUT_TOKENS,
  REASONING_OUTPUT_TOKENS,
  CACHE_READ_INPUT_TOKENS,
  CACHE_CREATION_INPUT_TOKENS,
  RETRIEVAL_TOP_K
]);
var fetchTransport = async (url, init) => {
  const response = await fetch(url, { ...init, redirect: "manual", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  return { status: response.status, headers: response.headers, text: () => textOf(response.body) };
};
var directTransport = (url, init) => new Promise((resolve22, reject) => {
  const body = typeof init.body === "string" ? Buffer.from(init.body) : init.body;
  const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const request = new ClientRequest(
    {
      ...urlToHttpOptions(new URL(url)),
      method: init.method,
      headers: { ...init.headers, "Content-Length": String(body.byteLength) },
      agent: /^https:/i.test(url) ? new HttpsAgent() : new HttpAgent(),
      signal
    },
    (response) => {
      response.on("error", () => {
      });
      const headers = {
        get: (name) => {
          const value = response.headers[name.toLowerCase()];
          return value === void 0 ? null : Array.isArray(value) ? value.join(", ") : value;
        }
      };
      resolve22({ status: response.statusCode ?? 0, headers, text: () => messageText(response) });
    }
  );
  request.on("error", (error) => reject(signal.aborted ? signal.reason : error));
  request.on("close", () => reject(new Error("the connection closed before an answer")));
  request.end(body);
});
var Capped = class {
  #decoder = new TextDecoder();
  #text = "";
  #left = ANSWER_MAX;
  /** Takes what fits of `chunk`; false once the cap is reached. */
  take(chunk) {
    const part = chunk.subarray(0, this.#left);
    this.#text += this.#decoder.decode(part, { stream: true });
    this.#left -= part.byteLength;
    return this.#left > 0;
  }
  end() {
    return this.#text + this.#decoder.decode();
  }
};
async function messageText(response) {
  const capped = new Capped();
  try {
    for await (const chunk of response) {
      if (!capped.take(chunk)) break;
    }
  } catch {
  }
  return capped.end();
}
async function textOf(body) {
  if (body === null) return "";
  const reader = body.getReader();
  const capped = new Capped();
  try {
    for (let more = true; more; ) {
      const { done, value } = await reader.read();
      more = !done && capped.take(value);
    }
    await reader.cancel();
  } catch {
  }
  return capped.end();
}
var realSleep = (seconds, signal) => new Promise((resolve22) => {
  const done = () => {
    clearTimeout(timer);
    signal.removeEventListener("abort", done);
    resolve22();
  };
  const timer = setTimeout(done, seconds * 1e3);
  if (signal.aborted) done();
  else signal.addEventListener("abort", done, { once: true });
});
function sdkVersion() {
  const version = defaultResource().attributes["telemetry.sdk.version"];
  return typeof version === "string" ? version : "unknown";
}
var Exporter = class {
  #config;
  #transport;
  #sleep;
  #warn;
  #url;
  #mediaUrl;
  #scoresUrl;
  #uploaded = /* @__PURE__ */ new Set();
  #warned = /* @__PURE__ */ new Set();
  #resource;
  #givenUp = new AbortController();
  #contentMode;
  constructor(config, hooks) {
    this.#config = config;
    this.#transport = hooks.transport;
    this.#sleep = hooks.sleep;
    this.#warn = hooks.warn;
    this.#url = `${config.endpoint}/otlp/v1/traces`;
    this.#mediaUrl = `${config.endpoint}${MEDIA_PATH}`;
    this.#scoresUrl = `${config.endpoint}${SCORES_PATH}`;
    this.#resource = [
      attribute(DISTRO_NAME, DISTRO),
      attribute("telemetry.distro.version", VERSION4),
      attribute("telemetry.sdk.language", "nodejs"),
      attribute("telemetry.sdk.name", "opentelemetry"),
      attribute("telemetry.sdk.version", sdkVersion())
    ];
    const deployment = [
      [ENVIRONMENT, config.environment, ENVIRONMENT_MAX, "environment"],
      [RELEASE, config.release, RELEASE_MAX, "release"]
    ];
    for (const [key, value, most, what] of deployment) {
      if (value === void 0) continue;
      if ([...value].length > most) {
        this.warnOnce(`long:${key}`, `telmoni: the ${what} must be up to ${most} characters; it is not sent`, {
          kind: "input"
        });
        continue;
      }
      this.#resource.push(attribute(key, value));
    }
  }
  /** The project's mode, as the last answer named it; undefined while unheard. */
  get contentMode() {
    return this.#contentMode;
  }
  /**
   * Gives up what is left: the wait before a retry ends now, and no attempt
   * follows it. A shutdown past its deadline calls it, so a process that
   * ends without `process.exit()` is not held for the retries.
   */
  giveUp() {
    this.#givenUp.abort();
  }
  /**
   * Sends the spans, halved past ingest's caps; false once they failed for a
   * reason not their own, which the rest of a batch they are part of would meet.
   */
  async export(spans) {
    if (spans.length === 0) return true;
    const scores = spans.filter(carriesScore);
    if (scores.length > 0) {
      await this.#sendScores(scores.map((span) => span.attributes[SCORE_SENT]));
      spans = spans.filter((span) => !carriesScore(span));
      if (spans.length === 0) return true;
    }
    if (this.#config.captureContent && this.#contentMode === void 0 && spans.some(holdsContent)) {
      await this.#ask();
    }
    const keep = this.#keepsContent();
    if (keep) spans = this.#mask(spans);
    let lifted = keep ? await this.#lift(spans) : /* @__PURE__ */ new Map();
    if (keep && (this.#config.scrubSecrets || this.#config.scrubPii)) {
      spans = this.#scrub(spans, lifted);
      lifted = /* @__PURE__ */ new Map();
    }
    return this.#export(spans, lifted, keep);
  }
  async #export(spans, lifted, keep) {
    if (spans.length > BATCH_SPANS_MAX) return this.#halve(spans, lifted, keep);
    let body = this.#body(spans, lifted, keep);
    if (Buffer.byteLength(body) > BATCH_MAX_BYTES) {
      if (spans.length > 1) return this.#halve(spans, lifted, keep);
      const cut22 = this.#cut(spans[0], lifted, keep);
      if (cut22 !== void 0) {
        this.warnOnce(
          "content-cut",
          "telmoni: a span past the 1 MiB an export may hold was sent without its longest content, named in telmoni.content_cut",
          { kind: "trimmed" }
        );
        return this.#send(cut22);
      }
      body = this.#body(spans, lifted, keep, true);
      if (Buffer.byteLength(body) > BATCH_MAX_BYTES) {
        this.warnOnce("too-large", "telmoni: a span past the 1 MiB an export may hold was dropped", {
          kind: "too_large"
        });
        return true;
      }
      this.warnOnce(
        "trimmed",
        "telmoni: a span past the 1 MiB an export may hold was sent without the attributes ingest drops for their length",
        { kind: "trimmed" }
      );
    }
    return this.#send(body);
  }
  /** Exports each half of the spans, the second only where the first went. */
  async #halve(spans, lifted, keep) {
    const half = Math.floor(spans.length / 2);
    return await this.#export(spans.slice(0, half), lifted, keep) && this.#export(spans.slice(half), lifted, keep);
  }
  /** The spans with every field the mask is handed as it answers it, before a part it takes out could be put. */
  #mask(spans) {
    if (this.#config.mask === void 0) return spans;
    return spans.map((span) => fieldsAs(span, span.attributes, (key, value) => this.#masked(key, value)));
  }
  /** One field as the mask answers it, handed as a string, any other value as its JSON; undefined to send the span without it. An answer unchanged keeps the value as it was. */
  #masked(key, value) {
    const given = typeof value === "string" ? value : JSON.stringify(value);
    let answer;
    try {
      answer = this.#config.mask(key, given);
    } catch {
      answer = MASK_FAILED;
    }
    if (answer === void 0 || answer === null) return void 0;
    if (typeof answer !== "string") {
      this.warnOnce(`mask:${key}`, `telmoni: the mask failed on ${key}; the span was sent without it`, {
        kind: "mask_failed"
      });
      return void 0;
    }
    return answer === given ? value : answer;
  }
  /**
   * The spans with every field the mask is handed as the scrubbers leave it, each as it is sent, `lifted`'s in place
   * of their own; a span they changed counts what in `telmoni.scrubbed`.
   */
  #scrub(spans, lifted) {
    return spans.map((span) => {
      const counts = /* @__PURE__ */ new Map();
      const scrubbed = fieldsAs(span, attributesOf(span, lifted), (key, value) => this.#scrubbed(key, value, counts));
      if (counts.size > 0) scrubbed.attributes[SCRUBBED] = scrubbedOf(counts);
      return scrubbed;
    });
  }
  /** One field as the scrubbers switched on leave it, handed as the mask is, what they replaced counted; undefined where one fails, counted as dropped. */
  #scrubbed(key, value, counts) {
    const given = typeof value === "string" ? value : JSON.stringify(value);
    try {
      const [text3, found] = scrubber.scrub(given, this.#config.scrubSecrets, this.#config.scrubPii);
      for (const [kind, count2] of found) counts.set(kind, (counts.get(kind) ?? 0) + count2);
      return text3 === given ? value : text3;
    } catch {
      counts.set(`dropped:${key}`, (counts.get(`dropped:${key}`) ?? 0) + 1);
      return void 0;
    }
  }
  /** Each span's messages with every `blob` part lifted out: a blob repeated in every span would bloat each, past 1 MiB maybe. */
  async #lift(spans) {
    const lifted = /* @__PURE__ */ new Map();
    for (const span of spans) {
      for (const key of MEDIA_FIELDS) {
        const value = span.attributes[key];
        if (typeof value !== "string") continue;
        const decoded = parseJson(value);
        if (!Array.isArray(decoded) || !await this.#liftParts(decoded)) continue;
        try {
          lifted.set(span, { ...lifted.get(span), [key]: JSON.stringify(decoded) });
        } catch {
        }
      }
    }
    return lifted;
  }
  /** Replaces each `blob` part in place, a message's parts too; whether any was. */
  async #liftParts(parts) {
    let lifted = false;
    for (const [at, part] of parts.entries()) {
      if (isRecord(part) && Array.isArray(part["parts"])) {
        lifted = await this.#liftParts(part["parts"]) || lifted;
        continue;
      }
      const file = await this.#filePart(part);
      if (file !== void 0) {
        parts[at] = file;
        lifted = true;
      }
    }
    return lifted;
  }
  /** The `file` part naming a `blob` part's bytes, put first unless past the platform's cap or put already. */
  async #filePart(part) {
    if (!isRecord(part) || part["type"] !== "blob") return void 0;
    const content = part["content"];
    if (typeof content !== "string" || content.length % 4 !== 0 || !BASE64.test(content)) return void 0;
    const data = Buffer.from(content, "base64");
    const sha256 = createHash2("sha256").update(data).digest("hex");
    if (data.byteLength <= MEDIA_MAX_BYTES && !this.#uploaded.has(sha256)) {
      await this.#upload(sha256, data, part["mime_type"]);
    }
    const file = { type: "file" };
    for (const name of ["modality", "mime_type"]) {
      if (name in part) file[name] = part[name];
    }
    file["file_id"] = `${FILE_ID_PREFIX}${sha256}`;
    return file;
  }
  /** Puts one file, once: a failure is warned of, never the export's. */
  async #upload(sha256, data, mimeType) {
    if (this.#givenUp.signal.aborted) return;
    const headers = this.#headers(
      typeof mimeType === "string" && HEADER_SAFE.test(mimeType) ? mimeType : MEDIA_DEFAULT_TYPE
    );
    let failure2;
    let warning = { kind: "upload_failed" };
    try {
      const answer = await this.#transport(`${this.#mediaUrl}${sha256}`, { method: "PUT", headers, body: data });
      await bodyOf(answer);
      if (answer.status >= 200 && answer.status < 300) {
        if (this.#uploaded.size >= UPLOADED_MAX) this.#uploaded.clear();
        this.#uploaded.add(sha256);
        return;
      }
      failure2 = String(answer.status);
      warning = { kind: "upload_failed", status: answer.status };
    } catch (error) {
      failure2 = errorName(error);
    }
    this.warnOnce(
      `upload:${failure2}`,
      `telmoni: an image or file in a message could not be uploaded (${failure2}); its part was sent naming it, which the platform may not hold`,
      warning
    );
  }
  /**
   * The span's body without its longest content, as few fields as fit it in an export: a content field, or any
   * past ingest's caps, which on a project that keeps content is content too; undefined where it sends no
   * content, or fits without all of it.
   */
  #cut(span, lifted, keep) {
    if (!keep) return void 0;
    const content = Object.entries(attributesOf(span, lifted)).filter(
      ([key, value]) => value !== void 0 && key !== CONTENT_CUT && (CONTENT.has(key) || pastCaps(key, value))
    ).map(([key, value]) => [key, Array.from(asIngestWrites(value)).length]).sort((a, b) => b[1] - a[1]);
    const cut22 = [];
    for (const [key] of content) {
      cut22.push(key);
      const body = this.#body([span], lifted, keep, false, cut22);
      if (Buffer.byteLength(body) <= BATCH_MAX_BYTES) return body;
    }
    return void 0;
  }
  #keepsContent() {
    return this.#config.captureContent && this.#contentMode === "on";
  }
  #body(spans, lifted, keep, trimmed22 = false, cut22 = []) {
    return JSON.stringify(
      this.encode(spans, lifted, keep, trimmed22, cut22),
      (_key, value) => typeof value === "string" ? value.replace(LONE_SURROGATE, "\uFFFD") : value
    );
  }
  #headers(contentType = "application/json") {
    const headers = {
      "Content-Type": contentType,
      "User-Agent": `telmoni-typescript/${VERSION4}`
    };
    if (this.#config.apiKey !== void 0) {
      headers["Authorization"] = `Bearer ${this.#config.apiKey}`;
    }
    return headers;
  }
  /**
   * Asks the project's content mode with an export of no spans, which ingest
   * answers as the mode is now: once and silently, since the export after it
   * retries and warns of what it meets, its content held back meanwhile.
   */
  async #ask() {
    if (this.#givenUp.signal.aborted) return;
    try {
      const answer = await this.#transport(this.#url, {
        method: "POST",
        headers: { ...this.#headers(), [SENT_AT_HEADER]: sentAtNow() },
        body: ASK
      });
      if (answer.status >= 200 && answer.status < 300) await this.#read(answer);
    } catch {
    }
  }
  async #send(body) {
    const headers = this.#headers();
    const posted = await this.#post(this.#url, body, () => ({ ...headers, [SENT_AT_HEADER]: sentAtNow() }));
    switch (posted.kind) {
      case "answered":
        await this.#read(posted.answer);
        return true;
      case "refused":
        this.warnOnce(
          `status:${posted.status}`,
          `telmoni: export refused with ${nameOf(posted.status, posted.named)}; the batch was dropped`,
          answered("refused", posted.status, posted.named)
        );
        return posted.status === 400 || posted.status === 413;
      case "failed":
        this.warnOnce(
          `failed:${posted.failure}`,
          `telmoni: export failed after ${ATTEMPTS} attempts (${posted.failure}); the batch was dropped`,
          posted.warning
        );
        return false;
      case "given_up":
        return false;
    }
  }
  /** Posts the scores' items, in order, `SCORES_SENT_MAX` a body; a failure is warned of, never the spans'. */
  async #sendScores(items) {
    const headers = this.#headers();
    for (let at = 0; at < items.length; at += SCORES_SENT_MAX) {
      const body = `{"scores":[${items.slice(at, at + SCORES_SENT_MAX).join(",")}]}`;
      const posted = await this.#post(this.#scoresUrl, body, () => headers);
      if (posted.kind === "given_up") return;
      if (posted.kind === "answered") {
        await bodyOf(posted.answer);
      } else if (posted.kind === "refused") {
        this.warnOnce(
          `scores:status:${posted.status}`,
          `telmoni: scores refused with ${nameOf(posted.status, posted.named)}; they were dropped`,
          answered("refused", posted.status, posted.named)
        );
      } else {
        this.warnOnce(
          `scores:failed:${posted.failure}`,
          `telmoni: scores failed after ${ATTEMPTS} attempts (${posted.failure}); they were dropped`,
          posted.warning
        );
      }
    }
  }
  /** Posts `body`, sent again on no answer or a retried status, `ATTEMPTS` in all, as long as nothing gave it up. */
  async #post(url, body, headers) {
    let failure2 = "";
    let met = { kind: "failed" };
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
      if (this.#givenUp.signal.aborted) return { kind: "given_up" };
      let answer;
      try {
        answer = await this.#transport(url, { method: "POST", headers: headers(), body });
      } catch (error) {
        failure2 = errorName(error);
        met = { kind: "failed" };
        await this.#wait(null, attempt);
        continue;
      }
      if (answer.status >= 200 && answer.status < 300) return { kind: "answered", answer };
      const named = problemType(await bodyOf(answer));
      if (RETRIED.has(answer.status)) {
        failure2 = nameOf(answer.status, named);
        met = answered("failed", answer.status, named);
        await this.#wait(answer.headers.get("Retry-After"), attempt);
        continue;
      }
      return { kind: "refused", status: answer.status, named };
    }
    return { kind: "failed", failure: failure2, warning: met };
  }
  /**
   * OTLP's `ExportTraceServiceRequest`, in its JSON encoding, `lifted`'s fields in place of the spans' own; `keep`,
   * with their content; `trimmed`, without the attributes ingest drops for their length; `cut`, without those
   * content fields, named in `telmoni.content_cut`.
   */
  encode(spans, lifted, keep, trimmed22 = false, cut22 = []) {
    return {
      resourceSpans: [
        {
          resource: { attributes: this.#resource },
          scopeSpans: [
            {
              scope: { name: SCOPE, version: VERSION4 },
              spans: spans.map((span) => this.#span(span, lifted, keep, trimmed22, cut22))
            }
          ]
        }
      ]
    };
  }
  #span(span, lifted, keepContent, trimmed22 = false, cut22 = []) {
    const attributes = [];
    for (const [key, value] of Object.entries(attributesOf(span, lifted))) {
      if (value === void 0) continue;
      if (!keepContent && CONTENT.has(key)) continue;
      if (cut22.includes(key) || cut22.length > 0 && key === CONTENT_CUT) continue;
      if (trimmed22 && pastCaps(key, value)) continue;
      attributes.push(attribute(key, value));
    }
    if (cut22.length > 0) attributes.push(attribute(CONTENT_CUT, [...cut22]));
    const spanContext = span.spanContext();
    const parent = span.parentSpanContext;
    const start = span.startTime;
    const end = isUnset(span.endTime) ? start : span.endTime;
    const encoded = {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      ...parent !== void 0 && isSpanContextValid(parent) ? { parentSpanId: parent.spanId } : {},
      name: span.name,
      kind: KINDS[span.kind],
      startTimeUnixNano: nanos(start),
      endTimeUnixNano: nanos(end),
      attributes
    };
    if (span.links.length > 0) {
      encoded.links = span.links.map((link) => ({ traceId: link.context.traceId, spanId: link.context.spanId }));
    }
    const events = keepContent && !trimmed22;
    const sent = span.events.filter((event) => events || event.name === EVALUATION_EVENT);
    if (sent.length > 0) {
      encoded.events = sent.map((event) => ({
        timeUnixNano: nanos(event.time),
        name: event.name,
        attributes: Object.entries(event.attributes ?? {}).filter((entry) => entry[1] !== void 0 && (events || SCORE_KEYS.has(entry[0]))).map(([key, value]) => attribute(key, value))
      }));
    }
    if (span.status.code === SpanStatusCode.ERROR) {
      encoded.status = { code: 2 };
      if (events && span.status.message) encoded.status.message = span.status.message;
    }
    return encoded;
  }
  async #read(answer) {
    const mode = trimEnds(answer.headers.get(CONTENT_MODE_HEADER) ?? "");
    if (mode) this.#contentMode = mode === "off" || mode === "on" ? mode : void 0;
    const decoded = parseJson(await bodyOf(answer));
    const partial = isRecord(decoded) ? decoded["partialSuccess"] : void 0;
    if (!isRecord(partial)) return;
    const message = partial["errorMessage"];
    if (typeof message === "string" && message !== "") this.#note(message);
  }
  #note(message) {
    for (const line of message.split(/\r?\n/)) {
      const dropped = DROPPED.exec(line);
      if (dropped !== null) {
        const [, , attributeName = "", reason = "", rest] = dropped;
        let text3 = `telmoni: the server dropped ${attributeName} (${reason}`;
        if (rest) text3 += `; ${rest}`;
        text3 += `); ${remedy(attributeName, reason)}`;
        this.warnOnce(`dropped:${attributeName}:${reason}`, text3, { kind: "dropped" });
        continue;
      }
      const refused = REFUSED.exec(line);
      if (refused !== null) {
        const why = refused[2] ?? "";
        this.warnOnce(`refused:${why}`, `telmoni: the server refused a span: ${why}`, { kind: "span_refused" });
        continue;
      }
      if (line.startsWith("and ") || line === "") continue;
      this.warnOnce(`line:${line}`, `telmoni: the server said: ${line}`, { kind: "said" });
    }
  }
  /** Before the next attempt; nothing after the last. */
  async #wait(retryAfter, attempt) {
    if (attempt + 1 >= ATTEMPTS) return;
    const seconds = retrySeconds(retryAfter) ?? 2 ** attempt;
    await this.#sleep(Math.min(seconds, RETRY_AFTER_MAX_S), this.#givenUp.signal);
  }
  /** Warns `text` once per client under `key`, as every warning is. */
  warnOnce(key, text3, warning) {
    if (this.#warned.has(key)) return;
    if (this.#warned.size >= WARNED_MAX) this.#warned.clear();
    this.#warned.add(key);
    this.warn(text3, warning);
  }
  /** Warns `text` through the hook, which may throw: never into the worker or the agent's own call. */
  warn(text3, warning) {
    try {
      this.#warn(text3, warning);
    } catch {
    }
  }
};
function asIngestWrites(value) {
  return Array.isArray(value) ? JSON.stringify(value.filter((item) => item !== null && item !== void 0)) : String(value);
}
function pastCaps(key, value) {
  if (Array.from(key).length > ATTRIBUTE_KEY_MAX) return true;
  return Array.from(asIngestWrites(value)).length > ATTRIBUTE_VALUE_MAX;
}
function remedy(attributeName, reason) {
  if (reason === "content") return `the project's content mode decides whether content is kept: ${CONTENT_DOCS}`;
  if (reason === "unlisted") return `send it as the tag ${TAG_PREFIX}${attributeName} to keep it`;
  if (reason === "over_cap") return "shorten it to keep it";
  if (reason === "cardinality") return "keep tags to a few keys of a few values each: an id goes as the user or the session";
  return "see the server's answer";
}
function answered(kind, status, type) {
  return type === "" ? { kind, status } : { kind, status, problemType: type };
}
function carriesScore(span) {
  return span.name === SCORE_SPAN && span.parentSpanContext === void 0 && typeof span.attributes[SCORE_SENT] === "string";
}
var ASK = '{"resourceSpans":[]}';
function holdsContent(span) {
  return Object.keys(span.attributes).some((key) => CONTENT.has(key)) || span.events.some(
    (event) => event.name !== EVALUATION_EVENT || Object.keys(event.attributes ?? {}).some((key) => !SCORE_KEYS.has(key))
  ) || Boolean(span.status.message);
}
function sentAtNow() {
  return (BigInt(Math.trunc(Date.now())) * 1000000n).toString();
}
function nameOf(status, problem) {
  return problem === "" ? String(status) : `${status} ${problem}`;
}
function problemType(body) {
  const decoded = parseJson(body);
  const message = isRecord(decoded) ? decoded["message"] : void 0;
  if (typeof message !== "string" || !message.startsWith("/errors/")) return "";
  return message.split(":", 1)[0] ?? "";
}
function retrySeconds(header) {
  const given = SECONDS.exec(header ?? "");
  if (given === null) return void 0;
  const whole2 = (given[2] ?? "").replace(/^0+/, "");
  if (given[1] === "-") return 0;
  return whole2.length > 2 ? RETRY_AFTER_MAX_S : Number(whole2);
}
async function bodyOf(answer) {
  try {
    return await answer.text();
  } catch {
    return "";
  }
}
function parseJson(text3) {
  try {
    return JSON.parse(text3 === "" ? "{}" : text3);
  } catch {
    return void 0;
  }
}
function fieldsAs(span, attributes, answer) {
  const kept = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (value === void 0) continue;
    const given = CONTENT.has(key) && key !== CONTENT_CUT ? answer(key, value) : value;
    if (given !== void 0) kept[key] = given;
  }
  const events = span.events.map((event) => {
    const eventKept = {};
    for (const [key, value] of Object.entries(event.attributes ?? {})) {
      const score = event.name === EVALUATION_EVENT && SCORE_KEYS.has(key);
      const given = value === void 0 || score ? value : answer(key, value);
      if (given !== void 0) eventKept[key] = given;
    }
    return { ...event, attributes: eventKept };
  });
  let status = span.status;
  if (status.message) {
    const message = answer(STATUS_DESCRIPTION, status.message);
    status = message === void 0 ? { code: status.code } : { ...status, message };
  }
  return maskedSpan(span, kept, events, status);
}
function maskedSpan(span, attributes, events, status) {
  return {
    name: span.name,
    kind: span.kind,
    spanContext: () => span.spanContext(),
    ...span.parentSpanContext === void 0 ? {} : { parentSpanContext: span.parentSpanContext },
    startTime: span.startTime,
    endTime: span.endTime,
    status,
    attributes,
    links: span.links,
    events,
    duration: span.duration,
    ended: span.ended,
    resource: span.resource,
    instrumentationScope: span.instrumentationScope,
    droppedAttributesCount: span.droppedAttributesCount,
    droppedEventsCount: span.droppedEventsCount,
    droppedLinksCount: span.droppedLinksCount
  };
}
function attributesOf(span, lifted) {
  const fields = lifted.get(span);
  return fields === void 0 ? span.attributes : { ...span.attributes, ...fields };
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isUnset(time) {
  return time[0] === 0 && time[1] === 0;
}
function nanos(time) {
  const count2 = BigInt(Math.trunc(time[0])) * 1000000000n + BigInt(Math.trunc(time[1]));
  return count2 >= 0n && count2 < 2n ** 64n ? count2.toString() : "0";
}
function attribute(key, value) {
  return { key, value: anyValue(key, value) };
}
function anyValue(key, value) {
  if (typeof value === "boolean") return { boolValue: value };
  if (typeof value === "number") {
    if (DOUBLES.has(key)) return { doubleValue: value };
    const whole2 = Math.trunc(value);
    if ((INTEGERS.has(key) || Number.isSafeInteger(value)) && whole2 >= -(2 ** 63) && whole2 < 2 ** 63) {
      return { intValue: String(whole2) };
    }
    return { doubleValue: value };
  }
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) {
    const values = [];
    for (const item of value) {
      if (item !== null && item !== void 0) values.push(anyValue("", item));
    }
    return { arrayValue: { values } };
  }
  return { stringValue: String(value) };
}
var model_prices_default = {
  source: {
    repository: "https://github.com/BerriAI/litellm",
    path: "model_prices_and_context_window.json",
    commit: "de5dc5b238b6e972869d7dedc6ba3c4fb8d931fe",
    sha256: "12ea25ddb6f2427bf7be2550b5a160d8659136d8747cfddf62327701591d2226",
    license: [
      "MIT License",
      "",
      "Copyright (c) 2023 Berri AI",
      "",
      "Permission is hereby granted, free of charge, to any person obtaining a copy",
      'of this software and associated documentation files (the "Software"), to deal',
      "in the Software without restriction, including without limitation the rights",
      "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell",
      "copies of the Software, and to permit persons to whom the Software is",
      "furnished to do so, subject to the following conditions:",
      "",
      "The above copyright notice and this permission notice shall be included in all",
      "copies or substantial portions of the Software.",
      "",
      'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
      "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,",
      "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE",
      "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER",
      "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,",
      "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE",
      "SOFTWARE."
    ]
  },
  prices: [
    { provider: "anthropic", model: "claude-fable-5", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "anthropic", model: "claude-fable-5-1", input: 1e-5, output: 5e-5, cache_read: 25e-8, cache_write: 125e-7 },
    { provider: "anthropic", model: "claude-haiku-4-5", input: 1e-6, output: 5e-6, cache_read: 1e-7, cache_write: 125e-8 },
    { provider: "anthropic", model: "claude-haiku-4-5-20251001", input: 1e-6, output: 5e-6, cache_read: 1e-7, cache_write: 125e-8 },
    { provider: "anthropic", model: "claude-haiku-5-5", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "anthropic", model: "claude-mythos-5", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "anthropic", model: "claude-mythos-5-1", input: 1e-5, output: 5e-5, cache_read: 25e-8, cache_write: 125e-7 },
    { provider: "anthropic", model: "claude-mythos-preview", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "anthropic", model: "claude-opus-4-5", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "anthropic", model: "claude-opus-4-5-20251101", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "anthropic", model: "claude-opus-4-6", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "anthropic", model: "claude-opus-4-6-20260205", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "anthropic", model: "claude-opus-4-7", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "anthropic", model: "claude-opus-4-7-20260416", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "anthropic", model: "claude-opus-4-8", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "anthropic", model: "claude-opus-5", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "anthropic", model: "claude-opus-5-5", input: 4e-6, output: 2e-5, cache_read: 2e-7, cache_write: 5e-6 },
    { provider: "anthropic", model: "claude-sonnet-4-5", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "anthropic", model: "claude-sonnet-4-5-20250929", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "anthropic", model: "claude-sonnet-4-6", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "anthropic", model: "claude-sonnet-5", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "anthropic", model: "claude-sonnet-5-5", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "ai21.j2-mid-v1", input: 125e-7, output: 125e-7, cache_read: 125e-7, cache_write: 125e-7 },
    { provider: "aws.bedrock", model: "ai21.j2-ultra-v1", input: 188e-7, output: 188e-7, cache_read: 188e-7, cache_write: 188e-7 },
    { provider: "aws.bedrock", model: "ai21.jamba-1-5-large-v1:0", input: 2e-6, output: 8e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "aws.bedrock", model: "ai21.jamba-1-5-mini-v1:0", input: 2e-7, output: 4e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "aws.bedrock", model: "ai21.jamba-instruct-v1:0", input: 5e-7, output: 7e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "aws.bedrock", model: "amazon.nova-2-lite-v1:0", input: 3e-7, output: 25e-7, cache_read: 75e-9, cache_write: 3e-7 },
    { provider: "aws.bedrock", model: "amazon.nova-2-multimodal-embeddings-v1:0", input: 135e-9, output: 0, cache_read: 135e-9, cache_write: 135e-9 },
    { provider: "aws.bedrock", model: "amazon.nova-2-pro-preview-20251202-v1:0", input: 125e-8, output: 1e-5, cache_read: 3125e-10, cache_write: 125e-8 },
    { provider: "aws.bedrock", model: "amazon.nova-lite-v1:0", input: 6e-8, output: 24e-8, cache_read: 15e-9, cache_write: 6e-8 },
    { provider: "aws.bedrock", model: "amazon.nova-micro-v1:0", input: 35e-9, output: 14e-8, cache_read: 875e-11, cache_write: 35e-9 },
    { provider: "aws.bedrock", model: "amazon.nova-premier-v1:0", input: 25e-7, output: 125e-7, cache_read: 625e-9, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "amazon.nova-pro-v1:0", input: 8e-7, output: 32e-7, cache_read: 2e-7, cache_write: 8e-7 },
    { provider: "aws.bedrock", model: "amazon.titan-embed-g1-text-02", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "aws.bedrock", model: "amazon.titan-embed-image-v1", input: 8e-7, output: 0, cache_read: 8e-7, cache_write: 8e-7 },
    { provider: "aws.bedrock", model: "amazon.titan-embed-text-v1", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "aws.bedrock", model: "amazon.titan-embed-text-v2:0", input: 2e-8, output: 0, cache_read: 2e-8, cache_write: 2e-8 },
    { provider: "aws.bedrock", model: "amazon.titan-text-express-v1", input: 2e-7, output: 6e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "aws.bedrock", model: "amazon.titan-text-lite-v1", input: 15e-8, output: 2e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "amazon.titan-text-premier-v1:0", input: 5e-7, output: 15e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "aws.bedrock", model: "anthropic.claude-3-5-haiku-20241022-v1:0", input: 8e-7, output: 4e-6, cache_read: 8e-8, cache_write: 1e-6 },
    { provider: "aws.bedrock", model: "anthropic.claude-3-5-sonnet-20240620-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-3-5-sonnet-20241022-v2:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-3-7-sonnet-20240620-v1:0", input: 36e-7, output: 18e-6, cache_read: 36e-8, cache_write: 45e-7 },
    { provider: "aws.bedrock", model: "anthropic.claude-3-7-sonnet-20250219-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-3-opus-20240229-v1:0", input: 15e-6, output: 75e-6, cache_read: 15e-7, cache_write: 1875e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-fable-5", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "aws.bedrock", model: "anthropic.claude-fable-5-1", input: 1e-5, output: 5e-5, cache_read: 25e-8, cache_write: 125e-7 },
    { provider: "aws.bedrock", model: "anthropic.claude-haiku-4-5-20251001-v1:0", input: 1e-6, output: 5e-6, cache_read: 1e-7, cache_write: 125e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-haiku-4-5@20251001", input: 1e-6, output: 5e-6, cache_read: 1e-7, cache_write: 125e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-haiku-5-5", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "aws.bedrock", model: "anthropic.claude-instant-v1", input: 8e-7, output: 24e-7, cache_read: 8e-7, cache_write: 8e-7 },
    { provider: "aws.bedrock", model: "anthropic.claude-mythos-5-1", input: 1e-5, output: 5e-5, cache_read: 25e-8, cache_write: 125e-7 },
    { provider: "aws.bedrock", model: "anthropic.claude-mythos-preview", input: 275e-7, output: 1375e-7, cache_read: 275e-8, cache_write: 34375e-9 },
    { provider: "aws.bedrock", model: "anthropic.claude-opus-4-1-20250805-v1:0", input: 15e-6, output: 75e-6, cache_read: 15e-7, cache_write: 1875e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-opus-4-20250514-v1:0", input: 15e-6, output: 75e-6, cache_read: 15e-7, cache_write: 1875e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-opus-4-5-20251101-v1:0", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-opus-4-6-v1", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-opus-4-7", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-opus-4-8", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-opus-5", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-opus-5-5", input: 4e-6, output: 2e-5, cache_read: 2e-7, cache_write: 5e-6 },
    { provider: "aws.bedrock", model: "anthropic.claude-sonnet-4-20250514-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-sonnet-4-5-20250929-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-sonnet-4-6", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "anthropic.claude-sonnet-5", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "anthropic.claude-sonnet-5-5", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "anthropic.claude-v1", input: 8e-6, output: 24e-6, cache_read: 8e-6, cache_write: 8e-6 },
    { provider: "aws.bedrock", model: "anthropic.claude-v2:1", input: 8e-6, output: 24e-6, cache_read: 8e-6, cache_write: 8e-6 },
    { provider: "aws.bedrock", model: "apac.amazon.nova-2-lite-v1:0", input: 396e-9, output: 3311e-9, cache_read: 99e-9, cache_write: 396e-9 },
    { provider: "aws.bedrock", model: "apac.amazon.nova-2-pro-preview-20251202-v1:0", input: 1375e-9, output: 11e-6, cache_read: 34375e-11, cache_write: 1375e-9 },
    { provider: "aws.bedrock", model: "apac.amazon.nova-lite-v1:0", input: 63e-9, output: 252e-9, cache_read: 1575e-11, cache_write: 63e-9 },
    { provider: "aws.bedrock", model: "apac.amazon.nova-micro-v1:0", input: 37e-9, output: 148e-9, cache_read: 925e-11, cache_write: 37e-9 },
    { provider: "aws.bedrock", model: "apac.amazon.nova-pro-v1:0", input: 84e-8, output: 336e-8, cache_read: 21e-8, cache_write: 84e-8 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-fable-5", input: 11e-6, output: 55e-6, cache_read: 11e-7, cache_write: 1375e-8 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-haiku-4-5-20251001-v1:0", input: 11e-7, output: 55e-7, cache_read: 11e-8, cache_write: 1375e-9 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-haiku-5-5", input: 11e-8, output: 55e-8, cache_read: 11e-9, cache_write: 1375e-10 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-mythos-preview", input: 275e-7, output: 1375e-7, cache_read: 275e-8, cache_write: 34375e-9 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-opus-4-7", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-opus-4-8", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-opus-5", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-opus-5-5", input: 44e-7, output: 22e-6, cache_read: 22e-8, cache_write: 55e-7 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-sonnet-4-20250514-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-sonnet-4-6", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-sonnet-5", input: 22e-7, output: 11e-6, cache_read: 22e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "apac.anthropic.claude-sonnet-5-5", input: 22e-7, output: 11e-6, cache_read: 11e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-fable-5", input: 11e-6, output: 55e-6, cache_read: 11e-7, cache_write: 1375e-8 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-haiku-4-5-20251001-v1:0", input: 11e-7, output: 55e-7, cache_read: 11e-8, cache_write: 1375e-9 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-haiku-5-5", input: 11e-8, output: 55e-8, cache_read: 11e-9, cache_write: 1375e-10 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-mythos-preview", input: 275e-7, output: 1375e-7, cache_read: 275e-8, cache_write: 34375e-9 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-opus-4-6-v1", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-opus-4-7", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-opus-4-8", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-opus-5", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-opus-5-5", input: 44e-7, output: 22e-6, cache_read: 22e-8, cache_write: 55e-7 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-sonnet-4-5-20250929-v1:0", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-sonnet-4-6", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-sonnet-5", input: 22e-7, output: 11e-6, cache_read: 22e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "au.anthropic.claude-sonnet-5-5", input: 22e-7, output: 11e-6, cache_read: 11e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "claude-sonnet-4-5-20250929-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "cohere.command-light-text-v14", input: 3e-7, output: 6e-7, cache_read: 3e-7, cache_write: 3e-7 },
    { provider: "aws.bedrock", model: "cohere.command-text-v14", input: 1e-6, output: 2e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "aws.bedrock", model: "cohere.embed-english-v3", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "aws.bedrock", model: "cohere.embed-multilingual-v3", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "aws.bedrock", model: "cohere.embed-v4:0", input: 12e-8, output: 0, cache_read: 12e-8, cache_write: 12e-8 },
    { provider: "aws.bedrock", model: "deepseek.r1-v1:0", input: 135e-8, output: 54e-7, cache_read: 135e-8, cache_write: 135e-8 },
    { provider: "aws.bedrock", model: "deepseek.v3-v1:0", input: 58e-8, output: 168e-8, cache_read: 58e-8, cache_write: 58e-8 },
    { provider: "aws.bedrock", model: "deepseek.v3.2", input: 62e-8, output: 185e-8, cache_read: 62e-8, cache_write: 62e-8 },
    { provider: "aws.bedrock", model: "eu.amazon.nova-2-lite-v1:0", input: 429e-9, output: 3597e-9, cache_read: 10725e-11, cache_write: 429e-9 },
    { provider: "aws.bedrock", model: "eu.amazon.nova-2-pro-preview-20251202-v1:0", input: 1375e-9, output: 11e-6, cache_read: 34375e-11, cache_write: 1375e-9 },
    { provider: "aws.bedrock", model: "eu.amazon.nova-lite-v1:0", input: 78e-9, output: 312e-9, cache_read: 195e-10, cache_write: 78e-9 },
    { provider: "aws.bedrock", model: "eu.amazon.nova-micro-v1:0", input: 46e-9, output: 184e-9, cache_read: 115e-10, cache_write: 46e-9 },
    { provider: "aws.bedrock", model: "eu.amazon.nova-pro-v1:0", input: 105e-8, output: 42e-7, cache_read: 2625e-10, cache_write: 105e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-3-5-haiku-20241022-v1:0", input: 8e-7, output: 4e-6, cache_read: 8e-8, cache_write: 1e-6 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-3-5-sonnet-20240620-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-3-5-sonnet-20241022-v2:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-3-7-sonnet-20250219-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-3-opus-20240229-v1:0", input: 15e-6, output: 75e-6, cache_read: 15e-7, cache_write: 1875e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-fable-5", input: 11e-6, output: 55e-6, cache_read: 11e-7, cache_write: 1375e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-fable-5-1", input: 11e-6, output: 55e-6, cache_read: 275e-9, cache_write: 1375e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-haiku-4-5-20251001-v1:0", input: 11e-7, output: 55e-7, cache_read: 11e-8, cache_write: 1375e-9 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-haiku-5-5", input: 11e-8, output: 55e-8, cache_read: 11e-9, cache_write: 1375e-10 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-opus-4-1-20250805-v1:0", input: 15e-6, output: 75e-6, cache_read: 15e-7, cache_write: 1875e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-opus-4-20250514-v1:0", input: 15e-6, output: 75e-6, cache_read: 15e-7, cache_write: 1875e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-opus-4-5-20251101-v1:0", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-opus-4-6-v1", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-opus-4-7", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-opus-4-8", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-opus-5", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-opus-5-5", input: 44e-7, output: 22e-6, cache_read: 22e-8, cache_write: 55e-7 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-sonnet-4-20250514-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-sonnet-4-5-20250929-v1:0", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-sonnet-4-6", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-sonnet-5", input: 22e-7, output: 11e-6, cache_read: 22e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "eu.anthropic.claude-sonnet-5-5", input: 22e-7, output: 11e-6, cache_read: 11e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "eu.deepseek.v3.2", input: 74e-8, output: 222e-8, cache_read: 74e-8, cache_write: 74e-8 },
    { provider: "aws.bedrock", model: "eu.meta.llama3-2-1b-instruct-v1:0", input: 13e-8, output: 13e-8, cache_read: 13e-8, cache_write: 13e-8 },
    { provider: "aws.bedrock", model: "eu.meta.llama3-2-3b-instruct-v1:0", input: 19e-8, output: 19e-8, cache_read: 19e-8, cache_write: 19e-8 },
    { provider: "aws.bedrock", model: "eu.mistral.pixtral-large-2502-v1:0", input: 2e-6, output: 6e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "aws.bedrock", model: "global.amazon.nova-2-lite-v1:0", input: 3e-7, output: 25e-7, cache_read: 75e-9, cache_write: 3e-7 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-fable-5", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-fable-5-1", input: 1e-5, output: 5e-5, cache_read: 25e-8, cache_write: 125e-7 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-haiku-4-5-20251001-v1:0", input: 1e-6, output: 5e-6, cache_read: 1e-7, cache_write: 125e-8 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-haiku-5-5", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-mythos-5-1", input: 1e-5, output: 5e-5, cache_read: 25e-8, cache_write: 125e-7 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-opus-4-5-20251101-v1:0", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-opus-4-6-v1", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-opus-4-7", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-opus-4-8", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-opus-5", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-opus-5-5", input: 4e-6, output: 2e-5, cache_read: 2e-7, cache_write: 5e-6 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-sonnet-4-20250514-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-sonnet-4-5-20250929-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-sonnet-4-6", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-sonnet-5", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "global.anthropic.claude-sonnet-5-5", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "global.cohere.embed-v4:0", input: 12e-8, output: 0, cache_read: 12e-8, cache_write: 12e-8 },
    { provider: "aws.bedrock", model: "global.moonshotai.kimi-k3", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "global.openai.gpt-5.4", input: 25e-7, output: 15e-6, cache_read: 25e-8, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "global.openai.gpt-5.5", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "aws.bedrock", model: "global.openai.gpt-5.6-luna", input: 2e-7, output: 12e-7, cache_read: 2e-8, cache_write: 25e-8 },
    { provider: "aws.bedrock", model: "global.openai.gpt-5.6-sol", input: 4e-6, output: 2e-5, cache_read: 4e-7, cache_write: 5e-6 },
    { provider: "aws.bedrock", model: "global.openai.gpt-5.6-terra", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "global.openai.gpt-6-astra", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "aws.bedrock", model: "global.openai.gpt-6-luna", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "aws.bedrock", model: "global.openai.gpt-6-sol", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "global.openai.gpt-6.1-sol", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "global.xai.grok-4.6", input: 2e-6, output: 6e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "aws.bedrock", model: "global.xai.grok-4.7", input: 2e-6, output: 6e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "aws.bedrock", model: "global.zai.glm-5.3", input: 168e-8, output: 528e-8, cache_read: 312e-9, cache_write: 21e-7 },
    { provider: "aws.bedrock", model: "google.gemma-3-12b-it", input: 9e-8, output: 29e-8, cache_read: 9e-8, cache_write: 9e-8 },
    { provider: "aws.bedrock", model: "google.gemma-3-27b-it", input: 23e-8, output: 38e-8, cache_read: 23e-8, cache_write: 23e-8 },
    { provider: "aws.bedrock", model: "google.gemma-3-4b-it", input: 4e-8, output: 8e-8, cache_read: 4e-8, cache_write: 4e-8 },
    { provider: "aws.bedrock", model: "in.moonshotai.kimi-k3", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "jp.amazon.nova-2-lite-v1:0", input: 396e-9, output: 3311e-9, cache_read: 99e-9, cache_write: 396e-9 },
    { provider: "aws.bedrock", model: "jp.anthropic.claude-haiku-4-5-20251001-v1:0", input: 11e-7, output: 55e-7, cache_read: 11e-8, cache_write: 1375e-9 },
    { provider: "aws.bedrock", model: "jp.anthropic.claude-haiku-5-5", input: 11e-8, output: 55e-8, cache_read: 11e-9, cache_write: 1375e-10 },
    { provider: "aws.bedrock", model: "jp.anthropic.claude-opus-4-7", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "jp.anthropic.claude-opus-4-8", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "jp.anthropic.claude-opus-5", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "jp.anthropic.claude-opus-5-5", input: 44e-7, output: 22e-6, cache_read: 22e-8, cache_write: 55e-7 },
    { provider: "aws.bedrock", model: "jp.anthropic.claude-sonnet-4-5-20250929-v1:0", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "jp.anthropic.claude-sonnet-4-6", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "jp.anthropic.claude-sonnet-5", input: 22e-7, output: 11e-6, cache_read: 22e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "jp.anthropic.claude-sonnet-5-5", input: 22e-7, output: 11e-6, cache_read: 11e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "meta.llama2-13b-chat-v1", input: 75e-8, output: 1e-6, cache_read: 75e-8, cache_write: 75e-8 },
    { provider: "aws.bedrock", model: "meta.llama2-70b-chat-v1", input: 195e-8, output: 256e-8, cache_read: 195e-8, cache_write: 195e-8 },
    { provider: "aws.bedrock", model: "meta.llama3-1-405b-instruct-v1:0", input: 24e-7, output: 24e-7, cache_read: 24e-7, cache_write: 24e-7 },
    { provider: "aws.bedrock", model: "meta.llama3-1-70b-instruct-v1:0", input: 72e-8, output: 72e-8, cache_read: 72e-8, cache_write: 72e-8 },
    { provider: "aws.bedrock", model: "meta.llama3-1-8b-instruct-v1:0", input: 22e-8, output: 22e-8, cache_read: 22e-8, cache_write: 22e-8 },
    { provider: "aws.bedrock", model: "meta.llama3-2-11b-instruct-v1:0", input: 16e-8, output: 16e-8, cache_read: 16e-8, cache_write: 16e-8 },
    { provider: "aws.bedrock", model: "meta.llama3-2-1b-instruct-v1:0", input: 1e-7, output: 1e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "aws.bedrock", model: "meta.llama3-2-3b-instruct-v1:0", input: 15e-8, output: 15e-8, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "meta.llama3-2-90b-instruct-v1:0", input: 72e-8, output: 72e-8, cache_read: 72e-8, cache_write: 72e-8 },
    { provider: "aws.bedrock", model: "meta.llama3-3-70b-instruct-v1:0", input: 72e-8, output: 72e-8, cache_read: 72e-8, cache_write: 72e-8 },
    { provider: "aws.bedrock", model: "meta.llama3-70b-instruct-v1:0", input: 265e-8, output: 35e-7, cache_read: 265e-8, cache_write: 265e-8 },
    { provider: "aws.bedrock", model: "meta.llama3-8b-instruct-v1:0", input: 3e-7, output: 6e-7, cache_read: 3e-7, cache_write: 3e-7 },
    { provider: "aws.bedrock", model: "meta.llama4-maverick-17b-instruct-v1:0", input: 24e-8, output: 97e-8, cache_read: 24e-8, cache_write: 24e-8 },
    { provider: "aws.bedrock", model: "meta.llama4-scout-17b-instruct-v1:0", input: 17e-8, output: 66e-8, cache_read: 17e-8, cache_write: 17e-8 },
    { provider: "aws.bedrock", model: "minimax.minimax-m2", input: 3e-7, output: 12e-7, cache_read: 3e-7, cache_write: 3e-7 },
    { provider: "aws.bedrock", model: "minimax.minimax-m2.1", input: 3e-7, output: 12e-7, cache_read: 3e-7, cache_write: 3e-7 },
    { provider: "aws.bedrock", model: "minimax.minimax-m2.5", input: 3e-7, output: 12e-7, cache_read: 3e-7, cache_write: 3e-7 },
    { provider: "aws.bedrock", model: "mistral.devstral-2-123b", input: 4e-7, output: 2e-6, cache_read: 4e-7, cache_write: 4e-7 },
    { provider: "aws.bedrock", model: "mistral.magistral-small-2509", input: 5e-7, output: 15e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "aws.bedrock", model: "mistral.ministral-3-14b-instruct", input: 2e-7, output: 2e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "aws.bedrock", model: "mistral.ministral-3-3b-instruct", input: 1e-7, output: 1e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "aws.bedrock", model: "mistral.ministral-3-8b-instruct", input: 15e-8, output: 15e-8, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "mistral.mistral-7b-instruct-v0:2", input: 15e-8, output: 2e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "mistral.mistral-large-2402-v1:0", input: 4e-6, output: 12e-6, cache_read: 4e-6, cache_write: 4e-6 },
    { provider: "aws.bedrock", model: "mistral.mistral-large-2407-v1:0", input: 2e-6, output: 6e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "aws.bedrock", model: "mistral.mistral-large-3-675b-instruct", input: 5e-7, output: 15e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "aws.bedrock", model: "mistral.mistral-small-2402-v1:0", input: 1e-6, output: 3e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "aws.bedrock", model: "mistral.mixtral-8x7b-instruct-v0:1", input: 45e-8, output: 7e-7, cache_read: 45e-8, cache_write: 45e-8 },
    { provider: "aws.bedrock", model: "mistral.pixtral-large-2502-v1:0", input: 2e-6, output: 6e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "aws.bedrock", model: "mistral.voxtral-mini-3b-2507", input: 4e-8, output: 4e-8, cache_read: 4e-8, cache_write: 4e-8 },
    { provider: "aws.bedrock", model: "mistral.voxtral-small-24b-2507", input: 1e-7, output: 3e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "aws.bedrock", model: "moonshot.kimi-k2-thinking", input: 6e-7, output: 25e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "aws.bedrock", model: "moonshotai.kimi-k2-thinking", input: 6e-7, output: 25e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "aws.bedrock", model: "moonshotai.kimi-k2.5", input: 6e-7, output: 3e-6, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "aws.bedrock", model: "moonshotai.kimi-k3", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "nvidia.nemotron-nano-12b-v2", input: 2e-7, output: 6e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "aws.bedrock", model: "nvidia.nemotron-nano-3-30b", input: 6e-8, output: 24e-8, cache_read: 6e-8, cache_write: 6e-8 },
    { provider: "aws.bedrock", model: "nvidia.nemotron-nano-9b-v2", input: 6e-8, output: 23e-8, cache_read: 6e-8, cache_write: 6e-8 },
    { provider: "aws.bedrock", model: "nvidia.nemotron-super-3-120b", input: 15e-8, output: 65e-8, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "openai.gpt-6-luna", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "aws.bedrock", model: "openai.gpt-6-sol", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "openai.gpt-oss-120b-1:0", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "openai.gpt-oss-20b-1:0", input: 7e-8, output: 3e-7, cache_read: 7e-8, cache_write: 7e-8 },
    { provider: "aws.bedrock", model: "openai.gpt-oss-safeguard-120b", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "openai.gpt-oss-safeguard-20b", input: 7e-8, output: 2e-7, cache_read: 7e-8, cache_write: 7e-8 },
    { provider: "aws.bedrock", model: "qwen.qwen3-235b-a22b-2507-v1:0", input: 22e-8, output: 88e-8, cache_read: 22e-8, cache_write: 22e-8 },
    { provider: "aws.bedrock", model: "qwen.qwen3-32b-v1:0", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "qwen.qwen3-coder-30b-a3b-v1:0", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "qwen.qwen3-coder-480b-a35b-v1:0", input: 45e-8, output: 18e-7, cache_read: 45e-8, cache_write: 45e-8 },
    { provider: "aws.bedrock", model: "qwen.qwen3-coder-next", input: 5e-7, output: 12e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "aws.bedrock", model: "qwen.qwen3-next-80b-a3b", input: 15e-8, output: 12e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "qwen.qwen3-vl-235b-a22b", input: 53e-8, output: 266e-8, cache_read: 53e-8, cache_write: 53e-8 },
    { provider: "aws.bedrock", model: "us-gov.anthropic.claude-fable-5-1", input: 12e-6, output: 6e-5, cache_read: 3e-7, cache_write: 15e-6 },
    { provider: "aws.bedrock", model: "us-gov.anthropic.claude-haiku-5-5", input: 12e-8, output: 6e-7, cache_read: 12e-9, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "us-gov.anthropic.claude-opus-4-8", input: 6e-6, output: 3e-5, cache_read: 6e-7, cache_write: 75e-7 },
    { provider: "aws.bedrock", model: "us-gov.anthropic.claude-opus-5", input: 6e-6, output: 3e-5, cache_read: 6e-7, cache_write: 75e-7 },
    { provider: "aws.bedrock", model: "us-gov.anthropic.claude-opus-5-5", input: 48e-7, output: 24e-6, cache_read: 24e-8, cache_write: 6e-6 },
    { provider: "aws.bedrock", model: "us-gov.anthropic.claude-sonnet-4-5-20250929-v1:0", input: 36e-7, output: 18e-6, cache_read: 36e-8, cache_write: 45e-7 },
    { provider: "aws.bedrock", model: "us-gov.anthropic.claude-sonnet-5", input: 24e-7, output: 12e-6, cache_read: 24e-8, cache_write: 3e-6 },
    { provider: "aws.bedrock", model: "us-gov.anthropic.claude-sonnet-5-5", input: 24e-7, output: 12e-6, cache_read: 12e-8, cache_write: 3e-6 },
    { provider: "aws.bedrock", model: "us-gov.nvidia.nemotron-nano-12b-v2", input: 24e-8, output: 72e-8, cache_read: 24e-8, cache_write: 24e-8 },
    { provider: "aws.bedrock", model: "us-gov.nvidia.nemotron-nano-3-30b", input: 72e-9, output: 288e-9, cache_read: 72e-9, cache_write: 72e-9 },
    { provider: "aws.bedrock", model: "us-gov.nvidia.nemotron-nano-9b-v2", input: 72e-9, output: 276e-9, cache_read: 72e-9, cache_write: 72e-9 },
    { provider: "aws.bedrock", model: "us-gov.nvidia.nemotron-super-3-120b", input: 18e-8, output: 78e-8, cache_read: 18e-8, cache_write: 18e-8 },
    { provider: "aws.bedrock", model: "us-gov.openai.gpt-oss-120b-1:0", input: 18e-8, output: 72e-8, cache_read: 18e-8, cache_write: 18e-8 },
    { provider: "aws.bedrock", model: "us-gov.openai.gpt-oss-20b-1:0", input: 84e-9, output: 36e-8, cache_read: 84e-9, cache_write: 84e-9 },
    { provider: "aws.bedrock", model: "us-gov.xai.grok-4.6", input: 264e-8, output: 792e-8, cache_read: 66e-8, cache_write: 264e-8 },
    { provider: "aws.bedrock", model: "us.amazon.nova-2-lite-v1:0", input: 33e-8, output: 275e-8, cache_read: 825e-10, cache_write: 33e-8 },
    { provider: "aws.bedrock", model: "us.amazon.nova-2-pro-preview-20251202-v1:0", input: 1375e-9, output: 11e-6, cache_read: 34375e-11, cache_write: 1375e-9 },
    { provider: "aws.bedrock", model: "us.amazon.nova-lite-v1:0", input: 6e-8, output: 24e-8, cache_read: 15e-9, cache_write: 6e-8 },
    { provider: "aws.bedrock", model: "us.amazon.nova-micro-v1:0", input: 35e-9, output: 14e-8, cache_read: 875e-11, cache_write: 35e-9 },
    { provider: "aws.bedrock", model: "us.amazon.nova-pro-v1:0", input: 8e-7, output: 32e-7, cache_read: 2e-7, cache_write: 8e-7 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-3-5-haiku-20241022-v1:0", input: 8e-7, output: 4e-6, cache_read: 8e-8, cache_write: 1e-6 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-3-5-sonnet-20240620-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-3-5-sonnet-20241022-v2:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-3-7-sonnet-20250219-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-3-opus-20240229-v1:0", input: 15e-6, output: 75e-6, cache_read: 15e-7, cache_write: 1875e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-fable-5", input: 11e-6, output: 55e-6, cache_read: 11e-7, cache_write: 1375e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-fable-5-1", input: 11e-6, output: 55e-6, cache_read: 275e-9, cache_write: 1375e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-haiku-4-5-20251001-v1:0", input: 11e-7, output: 55e-7, cache_read: 11e-8, cache_write: 1375e-9 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-haiku-5-5", input: 11e-8, output: 55e-8, cache_read: 11e-9, cache_write: 1375e-10 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-mythos-5", input: 11e-6, output: 55e-6, cache_read: 11e-7, cache_write: 1375e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-mythos-5-1", input: 11e-6, output: 55e-6, cache_read: 275e-9, cache_write: 1375e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-mythos-preview", input: 275e-7, output: 1375e-7, cache_read: 275e-8, cache_write: 34375e-9 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-opus-4-1-20250805-v1:0", input: 15e-6, output: 75e-6, cache_read: 15e-7, cache_write: 1875e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-opus-4-20250514-v1:0", input: 15e-6, output: 75e-6, cache_read: 15e-7, cache_write: 1875e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-opus-4-5-20251101-v1:0", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-opus-4-6-v1", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-opus-4-7", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-opus-4-8", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-opus-5", input: 55e-7, output: 275e-7, cache_read: 55e-8, cache_write: 6875e-9 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-opus-5-5", input: 44e-7, output: 22e-6, cache_read: 22e-8, cache_write: 55e-7 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-sonnet-4-20250514-v1:0", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-sonnet-4-5-20250929-v1:0", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-sonnet-4-6", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-sonnet-5", input: 22e-7, output: 11e-6, cache_read: 22e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "us.anthropic.claude-sonnet-5-5", input: 22e-7, output: 11e-6, cache_read: 11e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "us.cohere.embed-v4:0", input: 12e-8, output: 0, cache_read: 12e-8, cache_write: 12e-8 },
    { provider: "aws.bedrock", model: "us.deepseek.r1-v1:0", input: 135e-8, output: 54e-7, cache_read: 135e-8, cache_write: 135e-8 },
    { provider: "aws.bedrock", model: "us.deepseek.v3.2", input: 62e-8, output: 185e-8, cache_read: 62e-8, cache_write: 62e-8 },
    { provider: "aws.bedrock", model: "us.meta.llama3-1-405b-instruct-v1:0", input: 24e-7, output: 24e-7, cache_read: 24e-7, cache_write: 24e-7 },
    { provider: "aws.bedrock", model: "us.meta.llama3-1-70b-instruct-v1:0", input: 72e-8, output: 72e-8, cache_read: 72e-8, cache_write: 72e-8 },
    { provider: "aws.bedrock", model: "us.meta.llama3-1-8b-instruct-v1:0", input: 22e-8, output: 22e-8, cache_read: 22e-8, cache_write: 22e-8 },
    { provider: "aws.bedrock", model: "us.meta.llama3-2-11b-instruct-v1:0", input: 16e-8, output: 16e-8, cache_read: 16e-8, cache_write: 16e-8 },
    { provider: "aws.bedrock", model: "us.meta.llama3-2-1b-instruct-v1:0", input: 1e-7, output: 1e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "aws.bedrock", model: "us.meta.llama3-2-3b-instruct-v1:0", input: 15e-8, output: 15e-8, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "us.meta.llama3-2-90b-instruct-v1:0", input: 72e-8, output: 72e-8, cache_read: 72e-8, cache_write: 72e-8 },
    { provider: "aws.bedrock", model: "us.meta.llama3-3-70b-instruct-v1:0", input: 72e-8, output: 72e-8, cache_read: 72e-8, cache_write: 72e-8 },
    { provider: "aws.bedrock", model: "us.meta.llama4-maverick-17b-instruct-v1:0", input: 24e-8, output: 97e-8, cache_read: 24e-8, cache_write: 24e-8 },
    { provider: "aws.bedrock", model: "us.meta.llama4-scout-17b-instruct-v1:0", input: 17e-8, output: 66e-8, cache_read: 17e-8, cache_write: 17e-8 },
    { provider: "aws.bedrock", model: "us.mistral.pixtral-large-2502-v1:0", input: 2e-6, output: 6e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "aws.bedrock", model: "us.moonshotai.kimi-k3", input: 33e-7, output: 165e-7, cache_read: 33e-8, cache_write: 4125e-9 },
    { provider: "aws.bedrock", model: "us.openai.gpt-5.4", input: 275e-8, output: 165e-7, cache_read: 275e-9, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "us.openai.gpt-5.5", input: 55e-7, output: 33e-6, cache_read: 55e-8, cache_write: 55e-7 },
    { provider: "aws.bedrock", model: "us.openai.gpt-5.6-luna", input: 22e-8, output: 132e-8, cache_read: 22e-9, cache_write: 275e-9 },
    { provider: "aws.bedrock", model: "us.openai.gpt-5.6-sol", input: 44e-7, output: 22e-6, cache_read: 44e-8, cache_write: 55e-7 },
    { provider: "aws.bedrock", model: "us.openai.gpt-5.6-terra", input: 22e-7, output: 132e-7, cache_read: 22e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "us.openai.gpt-6-astra", input: 11e-6, output: 55e-6, cache_read: 11e-7, cache_write: 1375e-8 },
    { provider: "aws.bedrock", model: "us.openai.gpt-6-luna", input: 11e-8, output: 55e-8, cache_read: 11e-9, cache_write: 1375e-10 },
    { provider: "aws.bedrock", model: "us.openai.gpt-6-sol", input: 22e-7, output: 11e-6, cache_read: 22e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "us.openai.gpt-6.1-sol", input: 22e-7, output: 11e-6, cache_read: 11e-8, cache_write: 275e-8 },
    { provider: "aws.bedrock", model: "us.writer.palmyra-x4-v1:0", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "us.writer.palmyra-x5-v1:0", input: 6e-7, output: 6e-6, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "aws.bedrock", model: "us.xai.grok-4.6", input: 22e-7, output: 66e-7, cache_read: 55e-8, cache_write: 22e-7 },
    { provider: "aws.bedrock", model: "us.xai.grok-4.7", input: 22e-7, output: 66e-7, cache_read: 55e-8, cache_write: 22e-7 },
    { provider: "aws.bedrock", model: "us.zai.glm-5.3", input: 1848e-9, output: 5808e-9, cache_read: 3432e-10, cache_write: 231e-8 },
    { provider: "aws.bedrock", model: "writer.palmyra-vision-7b", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "aws.bedrock", model: "writer.palmyra-x4-v1:0", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "aws.bedrock", model: "writer.palmyra-x5-v1:0", input: 6e-7, output: 6e-6, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "aws.bedrock", model: "zai.glm-4.7", input: 6e-7, output: 22e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "aws.bedrock", model: "zai.glm-4.7-flash", input: 7e-8, output: 4e-7, cache_read: 7e-8, cache_write: 7e-8 },
    { provider: "aws.bedrock", model: "zai.glm-5", input: 1e-6, output: 32e-7, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "azure.ai.inference", model: "Codestral-2501", input: 3e-7, output: 9e-7, cache_read: 3e-7, cache_write: 3e-7 },
    { provider: "azure.ai.inference", model: "Cohere-Embed-V5-Fast", input: 8e-8, output: 0, cache_read: 8e-8, cache_write: 8e-8 },
    { provider: "azure.ai.inference", model: "Cohere-Embed-V5-Pro", input: 12e-8, output: 0, cache_read: 12e-8, cache_write: 12e-8 },
    { provider: "azure.ai.inference", model: "Cohere-command-a-plus-05-2026", input: 8e-7, output: 32e-7, cache_read: 8e-7, cache_write: 8e-7 },
    { provider: "azure.ai.inference", model: "Cohere-embed-v3-english", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "azure.ai.inference", model: "Cohere-embed-v3-multilingual", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "azure.ai.inference", model: "DeepSeek-V4-Flash-0731", input: 44e-8, output: 132e-8, cache_read: 14e-9, cache_write: 44e-8 },
    { provider: "azure.ai.inference", model: "FW-DeepSeek-V3.2", input: 62e-8, output: 185e-8, cache_read: 31e-8, cache_write: 62e-8 },
    { provider: "azure.ai.inference", model: "FW-DeepSeek-V4-Flash", input: 15e-8, output: 31e-8, cache_read: 3e-8, cache_write: 15e-8 },
    { provider: "azure.ai.inference", model: "FW-DeepSeek-V4-Pro", input: 1925e-9, output: 3828e-9, cache_read: 165e-9, cache_write: 1925e-9 },
    { provider: "azure.ai.inference", model: "FW-DeepSeek-V4.1-Flash", input: 375e-9, output: 15e-7, cache_read: 8e-9, cache_write: 375e-9 },
    { provider: "azure.ai.inference", model: "FW-GLM-5", input: 11e-7, output: 352e-8, cache_read: 22e-8, cache_write: 11e-7 },
    { provider: "azure.ai.inference", model: "FW-GLM-5.1", input: 154e-8, output: 484e-8, cache_read: 286e-9, cache_write: 154e-8 },
    { provider: "azure.ai.inference", model: "FW-GLM-5.2", input: 154e-8, output: 484e-8, cache_read: 15e-8, cache_write: 154e-8 },
    { provider: "azure.ai.inference", model: "FW-GLM-5.2-Fast", input: 231e-8, output: 726e-8, cache_read: 231e-9, cache_write: 231e-8 },
    { provider: "azure.ai.inference", model: "FW-GLM-5.3", input: 175e-8, output: 55e-7, cache_read: 325e-9, cache_write: 175e-8 },
    { provider: "azure.ai.inference", model: "FW-GLM-5.3-Flash", input: 188e-9, output: 625e-9, cache_read: 38e-9, cache_write: 188e-9 },
    { provider: "azure.ai.inference", model: "FW-GPT-OSS-120B", input: 165e-9, output: 66e-8, cache_read: 82e-9, cache_write: 165e-9 },
    { provider: "azure.ai.inference", model: "FW-Inkling", input: 11e-7, output: 446e-8, cache_read: 19e-8, cache_write: 11e-7 },
    { provider: "azure.ai.inference", model: "FW-Kimi-K2.5", input: 66e-8, output: 33e-7, cache_read: 11e-8, cache_write: 66e-8 },
    { provider: "azure.ai.inference", model: "FW-Kimi-K2.6", input: 1045e-9, output: 44e-7, cache_read: 176e-9, cache_write: 1045e-9 },
    { provider: "azure.ai.inference", model: "FW-Kimi-K2.7-Code", input: 105e-8, output: 44e-7, cache_read: 21e-8, cache_write: 105e-8 },
    { provider: "azure.ai.inference", model: "FW-Kimi-K3", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 3e-6 },
    { provider: "azure.ai.inference", model: "FW-MiniMax-M2.5", input: 33e-8, output: 132e-8, cache_read: 33e-9, cache_write: 33e-8 },
    { provider: "azure.ai.inference", model: "FW-MiniMax-M3", input: 33e-8, output: 132e-8, cache_read: 66e-9, cache_write: 33e-8 },
    { provider: "azure.ai.inference", model: "FW-Nemotron-3-Ultra-NVFP4", input: 66e-8, output: 264e-8, cache_read: 13e-8, cache_write: 66e-8 },
    { provider: "azure.ai.inference", model: "FW-Nemotron-Lightning-3.5-30B-A3B", input: 6e-8, output: 22e-8, cache_read: 1e-8, cache_write: 6e-8 },
    { provider: "azure.ai.inference", model: "Llama-3.3-70B-Instruct", input: 71e-8, output: 71e-8, cache_read: 71e-8, cache_write: 71e-8 },
    { provider: "azure.ai.inference", model: "Llama-4-Maverick-17B-128E-Instruct-FP8", input: 25e-8, output: 1e-6, cache_read: 25e-8, cache_write: 25e-8 },
    { provider: "azure.ai.inference", model: "Llama-4-Scout-17B-16E-Instruct", input: 2e-7, output: 78e-8, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "azure.ai.inference", model: "MAI-Code-1.1-Flash", input: 2e-7, output: 12e-7, cache_read: 2e-8, cache_write: 2e-7 },
    { provider: "azure.ai.inference", model: "MAI-Cyber-1-Flash", input: 6e-7, output: 35e-7, cache_read: 6e-8, cache_write: 6e-7 },
    { provider: "azure.ai.inference", model: "MAI-DS-R1", input: 135e-8, output: 54e-7, cache_read: 135e-8, cache_write: 135e-8 },
    { provider: "azure.ai.inference", model: "MAI-Thinking-1", input: 2e-6, output: 8e-6, cache_read: 2e-7, cache_write: 2e-6 },
    { provider: "azure.ai.inference", model: "Meta-Llama-3-70B-Instruct", input: 11e-7, output: 37e-8, cache_read: 11e-7, cache_write: 11e-7 },
    { provider: "azure.ai.inference", model: "Meta-Llama-3.1-70B-Instruct", input: 268e-8, output: 354e-8, cache_read: 268e-8, cache_write: 268e-8 },
    { provider: "azure.ai.inference", model: "Phi-3-medium-128k-instruct", input: 17e-8, output: 68e-8, cache_read: 17e-8, cache_write: 17e-8 },
    { provider: "azure.ai.inference", model: "Phi-3-medium-4k-instruct", input: 17e-8, output: 68e-8, cache_read: 17e-8, cache_write: 17e-8 },
    { provider: "azure.ai.inference", model: "Phi-3-mini-128k-instruct", input: 13e-8, output: 52e-8, cache_read: 13e-8, cache_write: 13e-8 },
    { provider: "azure.ai.inference", model: "Phi-3-mini-4k-instruct", input: 13e-8, output: 52e-8, cache_read: 13e-8, cache_write: 13e-8 },
    { provider: "azure.ai.inference", model: "Phi-3-small-128k-instruct", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "azure.ai.inference", model: "Phi-3-small-8k-instruct", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "azure.ai.inference", model: "Phi-3.5-MoE-instruct", input: 16e-8, output: 64e-8, cache_read: 16e-8, cache_write: 16e-8 },
    { provider: "azure.ai.inference", model: "Phi-3.5-mini-instruct", input: 13e-8, output: 52e-8, cache_read: 13e-8, cache_write: 13e-8 },
    { provider: "azure.ai.inference", model: "Phi-3.5-vision-instruct", input: 13e-8, output: 52e-8, cache_read: 13e-8, cache_write: 13e-8 },
    { provider: "azure.ai.inference", model: "Phi-4", input: 125e-9, output: 5e-7, cache_read: 125e-9, cache_write: 125e-9 },
    { provider: "azure.ai.inference", model: "Phi-4-mini-instruct", input: 75e-9, output: 3e-7, cache_read: 75e-9, cache_write: 75e-9 },
    { provider: "azure.ai.inference", model: "Phi-4-mini-reasoning", input: 75e-9, output: 3e-7, cache_read: 75e-9, cache_write: 75e-9 },
    { provider: "azure.ai.inference", model: "Phi-4-multimodal-instruct", input: 8e-8, output: 32e-8, cache_read: 8e-8, cache_write: 8e-8 },
    { provider: "azure.ai.inference", model: "Phi-4-reasoning", input: 125e-9, output: 5e-7, cache_read: 125e-9, cache_write: 125e-9 },
    { provider: "azure.ai.inference", model: "claude-fable-5", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "azure.ai.inference", model: "claude-fable-5-1", input: 1e-5, output: 5e-5, cache_read: 25e-8, cache_write: 125e-7 },
    { provider: "azure.ai.inference", model: "claude-haiku-4-5", input: 1e-6, output: 5e-6, cache_read: 1e-7, cache_write: 125e-8 },
    { provider: "azure.ai.inference", model: "claude-haiku-5-5", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "azure.ai.inference", model: "claude-opus-4-5", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "azure.ai.inference", model: "claude-opus-4-6", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "azure.ai.inference", model: "claude-opus-4-7", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "azure.ai.inference", model: "claude-opus-4-8", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "azure.ai.inference", model: "claude-opus-5", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "azure.ai.inference", model: "claude-opus-5-5", input: 4e-6, output: 2e-5, cache_read: 2e-7, cache_write: 5e-6 },
    { provider: "azure.ai.inference", model: "claude-opus-5-5-fast", input: 8e-6, output: 4e-5, cache_read: 4e-7, cache_write: 1e-5 },
    { provider: "azure.ai.inference", model: "claude-sonnet-4-5", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "azure.ai.inference", model: "claude-sonnet-4-6", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "azure.ai.inference", model: "claude-sonnet-5", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "azure.ai.inference", model: "claude-sonnet-5-5", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "azure.ai.inference", model: "codex-mini", input: 15e-7, output: 6e-6, cache_read: 375e-9, cache_write: 15e-7 },
    { provider: "azure.ai.inference", model: "cohere-command-a", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "azure.ai.inference", model: "deepseek-r1", input: 135e-8, output: 54e-7, cache_read: 135e-8, cache_write: 135e-8 },
    { provider: "azure.ai.inference", model: "deepseek-v3", input: 114e-8, output: 456e-8, cache_read: 114e-8, cache_write: 114e-8 },
    { provider: "azure.ai.inference", model: "deepseek-v3-0324", input: 114e-8, output: 456e-8, cache_read: 114e-8, cache_write: 114e-8 },
    { provider: "azure.ai.inference", model: "deepseek-v3.1", input: 123e-8, output: 494e-8, cache_read: 123e-8, cache_write: 123e-8 },
    { provider: "azure.ai.inference", model: "deepseek-v3.2", input: 58e-8, output: 168e-8, cache_read: 58e-8, cache_write: 58e-8 },
    { provider: "azure.ai.inference", model: "deepseek-v3.2-speciale", input: 58e-8, output: 168e-8, cache_read: 58e-8, cache_write: 58e-8 },
    { provider: "azure.ai.inference", model: "deepseek-v4-flash", input: 19e-8, output: 51e-8, cache_read: 28e-9, cache_write: 19e-8 },
    { provider: "azure.ai.inference", model: "deepseek-v4-pro", input: 174e-8, output: 348e-8, cache_read: 145e-9, cache_write: 174e-8 },
    { provider: "azure.ai.inference", model: "deepseek-v4.1-flash", input: 3e-7, output: 12e-7, cache_read: 6e-9, cache_write: 3e-7 },
    { provider: "azure.ai.inference", model: "embed-v-4-0", input: 12e-8, output: 0, cache_read: 12e-8, cache_write: 12e-8 },
    { provider: "azure.ai.inference", model: "gpt-5.4", input: 25e-7, output: 15e-6, cache_read: 25e-8, cache_write: 25e-7 },
    { provider: "azure.ai.inference", model: "gpt-5.4-2026-03-05", input: 25e-7, output: 15e-6, cache_read: 25e-8, cache_write: 25e-7 },
    { provider: "azure.ai.inference", model: "gpt-5.4-mini", input: 75e-8, output: 45e-7, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "azure.ai.inference", model: "gpt-5.4-mini-2026-03-17", input: 75e-8, output: 45e-7, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "azure.ai.inference", model: "gpt-5.4-nano", input: 2e-7, output: 125e-8, cache_read: 2e-8, cache_write: 2e-7 },
    { provider: "azure.ai.inference", model: "gpt-5.4-nano-2026-03-17", input: 2e-7, output: 125e-8, cache_read: 2e-8, cache_write: 2e-7 },
    { provider: "azure.ai.inference", model: "gpt-5.4-pro", input: 3e-5, output: 18e-5, cache_read: 3e-6, cache_write: 3e-5 },
    { provider: "azure.ai.inference", model: "gpt-5.4-pro-2026-03-05", input: 3e-5, output: 18e-5, cache_read: 3e-6, cache_write: 3e-5 },
    { provider: "azure.ai.inference", model: "gpt-5.5", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "azure.ai.inference", model: "gpt-5.5-2026-04-23", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "azure.ai.inference", model: "gpt-5.5-2026-04-24", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "azure.ai.inference", model: "gpt-6-astra", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "azure.ai.inference", model: "gpt-6-luna", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "azure.ai.inference", model: "gpt-6-sol", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "azure.ai.inference", model: "gpt-6.1-sol", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 25e-7 },
    { provider: "azure.ai.inference", model: "gpt-chat-latest", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "azure.ai.inference", model: "gpt-oss-120b", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "azure.ai.inference", model: "grok-3", input: 3e-6, output: 15e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "azure.ai.inference", model: "grok-3-mini", input: 25e-8, output: 127e-8, cache_read: 25e-8, cache_write: 25e-8 },
    { provider: "azure.ai.inference", model: "grok-4", input: 3e-6, output: 15e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "azure.ai.inference", model: "grok-4-1-fast-non-reasoning", input: 2e-7, output: 5e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "azure.ai.inference", model: "grok-4-1-fast-reasoning", input: 2e-7, output: 5e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "azure.ai.inference", model: "grok-4-20-non-reasoning", input: 125e-8, output: 25e-7, cache_read: 125e-8, cache_write: 125e-8 },
    { provider: "azure.ai.inference", model: "grok-4-20-reasoning", input: 125e-8, output: 25e-7, cache_read: 125e-8, cache_write: 125e-8 },
    { provider: "azure.ai.inference", model: "grok-4-fast-non-reasoning", input: 2e-7, output: 5e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "azure.ai.inference", model: "grok-4-fast-reasoning", input: 2e-7, output: 5e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "azure.ai.inference", model: "grok-4.3", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "azure.ai.inference", model: "grok-4.6", input: 2e-6, output: 6e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "azure.ai.inference", model: "grok-4.7", input: 2e-6, output: 6e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "azure.ai.inference", model: "grok-code-fast-1", input: 2e-7, output: 15e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "azure.ai.inference", model: "jamba-instruct", input: 5e-7, output: 7e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "azure.ai.inference", model: "kimi-k2-thinking", input: 6e-7, output: 25e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "azure.ai.inference", model: "kimi-k2.5", input: 6e-7, output: 3e-6, cache_read: 1e-7, cache_write: 6e-7 },
    { provider: "azure.ai.inference", model: "kimi-k2.6", input: 95e-8, output: 4e-6, cache_read: 16e-8, cache_write: 95e-8 },
    { provider: "azure.ai.inference", model: "kimi-k2.7-code", input: 95e-8, output: 4e-6, cache_read: 19e-8, cache_write: 95e-8 },
    { provider: "azure.ai.inference", model: "ministral-3b", input: 4e-8, output: 4e-8, cache_read: 4e-8, cache_write: 4e-8 },
    { provider: "azure.ai.inference", model: "mistral-large", input: 4e-6, output: 12e-6, cache_read: 4e-6, cache_write: 4e-6 },
    { provider: "azure.ai.inference", model: "mistral-large-2407", input: 2e-6, output: 6e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "azure.ai.inference", model: "mistral-large-3", input: 5e-7, output: 15e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "azure.ai.inference", model: "mistral-large-latest", input: 2e-6, output: 6e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "azure.ai.inference", model: "mistral-medium-2505", input: 4e-7, output: 2e-6, cache_read: 4e-7, cache_write: 4e-7 },
    { provider: "azure.ai.inference", model: "mistral-medium-3-5", input: 15e-7, output: 75e-7, cache_read: 15e-7, cache_write: 15e-7 },
    { provider: "azure.ai.inference", model: "mistral-nemo", input: 15e-8, output: 15e-8, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "azure.ai.inference", model: "mistral-small", input: 1e-6, output: 3e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "azure.ai.inference", model: "mistral-small-2503", input: 1e-7, output: 3e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "azure.ai.inference", model: "model-router", input: 14e-8, output: 0, cache_read: 14e-8, cache_write: 14e-8 },
    { provider: "azure.ai.inference", model: "model_router", input: 14e-8, output: 0, cache_read: 14e-8, cache_write: 14e-8 },
    { provider: "azure.ai.openai", model: "ada", input: 11e-8, output: 0, cache_read: 11e-8, cache_write: 11e-8 },
    { provider: "azure.ai.openai", model: "chat-latest", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "azure.ai.openai", model: "codex-mini", input: 15e-7, output: 6e-6, cache_read: 375e-9, cache_write: 15e-7 },
    { provider: "azure.ai.openai", model: "command-r-plus", input: 3e-6, output: 15e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "azure.ai.openai", model: "computer-use-preview", input: 3e-6, output: 12e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "azure.ai.openai", model: "gpt-3.5-turbo", input: 5e-7, output: 15e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "azure.ai.openai", model: "gpt-3.5-turbo-instruct-0914", input: 165e-8, output: 22e-7, cache_read: 165e-8, cache_write: 165e-8 },
    { provider: "azure.ai.openai", model: "gpt-35-turbo", input: 5e-7, output: 15e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "azure.ai.openai", model: "gpt-35-turbo-16k", input: 3e-6, output: 4e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "azure.ai.openai", model: "gpt-35-turbo-16k-0613", input: 3e-6, output: 4e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "azure.ai.openai", model: "gpt-35-turbo-instruct", input: 165e-8, output: 22e-7, cache_read: 165e-8, cache_write: 165e-8 },
    { provider: "azure.ai.openai", model: "gpt-35-turbo-instruct-0914", input: 165e-8, output: 22e-7, cache_read: 165e-8, cache_write: 165e-8 },
    { provider: "azure.ai.openai", model: "gpt-4", input: 3e-5, output: 6e-5, cache_read: 3e-5, cache_write: 3e-5 },
    { provider: "azure.ai.openai", model: "gpt-4-0125-preview", input: 1e-5, output: 3e-5, cache_read: 1e-5, cache_write: 1e-5 },
    { provider: "azure.ai.openai", model: "gpt-4-0613", input: 3e-5, output: 6e-5, cache_read: 3e-5, cache_write: 3e-5 },
    { provider: "azure.ai.openai", model: "gpt-4-1106-preview", input: 1e-5, output: 3e-5, cache_read: 1e-5, cache_write: 1e-5 },
    { provider: "azure.ai.openai", model: "gpt-4-32k", input: 6e-5, output: 12e-5, cache_read: 6e-5, cache_write: 6e-5 },
    { provider: "azure.ai.openai", model: "gpt-4-32k-0613", input: 6e-5, output: 12e-5, cache_read: 6e-5, cache_write: 6e-5 },
    { provider: "azure.ai.openai", model: "gpt-4-turbo", input: 11e-6, output: 33e-6, cache_read: 11e-6, cache_write: 11e-6 },
    { provider: "azure.ai.openai", model: "gpt-4-turbo-2024-04-09", input: 11e-6, output: 33e-6, cache_read: 11e-6, cache_write: 11e-6 },
    { provider: "azure.ai.openai", model: "gpt-4-turbo-vision-preview", input: 11e-6, output: 33e-6, cache_read: 11e-6, cache_write: 11e-6 },
    { provider: "azure.ai.openai", model: "gpt-4.1", input: 2e-6, output: 8e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "azure.ai.openai", model: "gpt-4.1-2025-04-14", input: 2e-6, output: 8e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "azure.ai.openai", model: "gpt-4.1-mini", input: 4e-7, output: 16e-7, cache_read: 1e-7, cache_write: 4e-7 },
    { provider: "azure.ai.openai", model: "gpt-4.1-mini-2025-04-14", input: 4e-7, output: 16e-7, cache_read: 1e-7, cache_write: 4e-7 },
    { provider: "azure.ai.openai", model: "gpt-4.1-nano", input: 1e-7, output: 4e-7, cache_read: 25e-9, cache_write: 1e-7 },
    { provider: "azure.ai.openai", model: "gpt-4.1-nano-2025-04-14", input: 1e-7, output: 4e-7, cache_read: 25e-9, cache_write: 1e-7 },
    { provider: "azure.ai.openai", model: "gpt-4.5-preview", input: 75e-6, output: 15e-5, cache_read: 375e-7, cache_write: 75e-6 },
    { provider: "azure.ai.openai", model: "gpt-4o", input: 25e-7, output: 1e-5, cache_read: 125e-8, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-4o-2024-05-13", input: 5e-6, output: 15e-6, cache_read: 5e-6, cache_write: 5e-6 },
    { provider: "azure.ai.openai", model: "gpt-4o-2024-08-06", input: 25e-7, output: 1e-5, cache_read: 125e-8, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-4o-2024-11-20", input: 25e-7, output: 1e-5, cache_read: 125e-8, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-4o-audio-preview-2024-12-17", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-4o-mini", input: 15e-8, output: 6e-7, cache_read: 75e-9, cache_write: 15e-8 },
    { provider: "azure.ai.openai", model: "gpt-4o-mini-2024-07-18", input: 15e-8, output: 6e-7, cache_read: 75e-9, cache_write: 15e-8 },
    { provider: "azure.ai.openai", model: "gpt-4o-mini-audio-preview-2024-12-17", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "azure.ai.openai", model: "gpt-5", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "azure.ai.openai", model: "gpt-5-2025-08-07", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "azure.ai.openai", model: "gpt-5-chat", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "azure.ai.openai", model: "gpt-5-codex", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "azure.ai.openai", model: "gpt-5-mini", input: 25e-8, output: 2e-6, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "azure.ai.openai", model: "gpt-5-mini-2025-08-07", input: 25e-8, output: 2e-6, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "azure.ai.openai", model: "gpt-5-nano", input: 5e-8, output: 4e-7, cache_read: 5e-9, cache_write: 5e-8 },
    { provider: "azure.ai.openai", model: "gpt-5-nano-2025-08-07", input: 5e-8, output: 4e-7, cache_read: 5e-9, cache_write: 5e-8 },
    { provider: "azure.ai.openai", model: "gpt-5-pro", input: 15e-6, output: 12e-5, cache_read: 15e-6, cache_write: 15e-6 },
    { provider: "azure.ai.openai", model: "gpt-5.1", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.1-2025-11-13", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.1-chat", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.1-codex", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.1-codex-2025-11-13", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.1-codex-max", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.1-codex-mini", input: 25e-8, output: 2e-6, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.1-codex-mini-2025-11-13", input: 25e-8, output: 2e-6, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.2", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.2-2025-12-11", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.2-chat", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.2-codex", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.2-pro", input: 21e-6, output: 168e-6, cache_read: 21e-6, cache_write: 21e-6 },
    { provider: "azure.ai.openai", model: "gpt-5.2-pro-2025-12-11", input: 21e-6, output: 168e-6, cache_read: 21e-6, cache_write: 21e-6 },
    { provider: "azure.ai.openai", model: "gpt-5.3-chat", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.3-codex", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.4", input: 25e-7, output: 15e-6, cache_read: 25e-8, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-5.4-2026-03-05", input: 25e-7, output: 15e-6, cache_read: 25e-8, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-5.4-mini", input: 75e-8, output: 45e-7, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.4-mini-2026-03-17", input: 75e-8, output: 45e-7, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.4-nano", input: 2e-7, output: 125e-8, cache_read: 2e-8, cache_write: 2e-7 },
    { provider: "azure.ai.openai", model: "gpt-5.4-nano-2026-03-17", input: 2e-7, output: 125e-8, cache_read: 2e-8, cache_write: 2e-7 },
    { provider: "azure.ai.openai", model: "gpt-5.4-pro", input: 3e-5, output: 18e-5, cache_read: 3e-6, cache_write: 3e-5 },
    { provider: "azure.ai.openai", model: "gpt-5.4-pro-2026-03-05", input: 3e-5, output: 18e-5, cache_read: 3e-6, cache_write: 3e-5 },
    { provider: "azure.ai.openai", model: "gpt-5.5", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "azure.ai.openai", model: "gpt-5.5-2026-04-23", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "azure.ai.openai", model: "gpt-5.5-2026-04-24", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "azure.ai.openai", model: "gpt-5.5-pro", input: 3e-5, output: 18e-5, cache_read: 3e-6, cache_write: 3e-5 },
    { provider: "azure.ai.openai", model: "gpt-5.5-pro-2026-04-23", input: 3e-5, output: 18e-5, cache_read: 3e-6, cache_write: 3e-5 },
    { provider: "azure.ai.openai", model: "gpt-5.6", input: 4e-6, output: 2e-5, cache_read: 4e-7, cache_write: 5e-6 },
    { provider: "azure.ai.openai", model: "gpt-5.6-luna", input: 2e-7, output: 12e-7, cache_read: 2e-8, cache_write: 25e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.6-luna-2026-07-09", input: 2e-7, output: 12e-7, cache_read: 2e-8, cache_write: 25e-8 },
    { provider: "azure.ai.openai", model: "gpt-5.6-sol", input: 4e-6, output: 2e-5, cache_read: 4e-7, cache_write: 5e-6 },
    { provider: "azure.ai.openai", model: "gpt-5.6-sol-2026-07-09", input: 4e-6, output: 2e-5, cache_read: 4e-7, cache_write: 5e-6 },
    { provider: "azure.ai.openai", model: "gpt-5.6-terra", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-5.6-terra-2026-07-09", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-6-astra", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "azure.ai.openai", model: "gpt-6-astra-2026-09-03", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "azure.ai.openai", model: "gpt-6-luna", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "azure.ai.openai", model: "gpt-6-luna-2026-09-22", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "azure.ai.openai", model: "gpt-6-sol", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-6-sol-2026-09-22", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-6.1-sol", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-6.1-sol-2026-09-29", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-audio", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-audio-1.5", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-audio-1.5-2026-02-23", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-audio-2025-08-28", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "azure.ai.openai", model: "gpt-audio-mini", input: 6e-7, output: 24e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "azure.ai.openai", model: "gpt-audio-mini-2025-10-06", input: 6e-7, output: 24e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "azure.ai.openai", model: "gpt-chat-latest", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "azure.ai.openai", model: "mistral-large-2402", input: 8e-6, output: 24e-6, cache_read: 8e-6, cache_write: 8e-6 },
    { provider: "azure.ai.openai", model: "mistral-large-latest", input: 8e-6, output: 24e-6, cache_read: 8e-6, cache_write: 8e-6 },
    { provider: "azure.ai.openai", model: "model-router", input: 14e-8, output: 0, cache_read: 14e-8, cache_write: 14e-8 },
    { provider: "azure.ai.openai", model: "o1", input: 15e-6, output: 6e-5, cache_read: 75e-7, cache_write: 15e-6 },
    { provider: "azure.ai.openai", model: "o1-2024-12-17", input: 15e-6, output: 6e-5, cache_read: 75e-7, cache_write: 15e-6 },
    { provider: "azure.ai.openai", model: "o1-mini", input: 11e-7, output: 44e-7, cache_read: 55e-8, cache_write: 11e-7 },
    { provider: "azure.ai.openai", model: "o1-mini-2024-09-12", input: 11e-7, output: 44e-7, cache_read: 55e-8, cache_write: 11e-7 },
    { provider: "azure.ai.openai", model: "o3", input: 2e-6, output: 8e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "azure.ai.openai", model: "o3-2025-04-16", input: 2e-6, output: 8e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "azure.ai.openai", model: "o3-deep-research", input: 1e-5, output: 4e-5, cache_read: 25e-7, cache_write: 1e-5 },
    { provider: "azure.ai.openai", model: "o3-mini", input: 11e-7, output: 44e-7, cache_read: 55e-8, cache_write: 11e-7 },
    { provider: "azure.ai.openai", model: "o3-mini-2025-01-31", input: 11e-7, output: 44e-7, cache_read: 55e-8, cache_write: 11e-7 },
    { provider: "azure.ai.openai", model: "o3-pro", input: 2e-5, output: 8e-5, cache_read: 2e-5, cache_write: 2e-5 },
    { provider: "azure.ai.openai", model: "o3-pro-2025-06-10", input: 2e-5, output: 8e-5, cache_read: 2e-5, cache_write: 2e-5 },
    { provider: "azure.ai.openai", model: "o4-mini", input: 11e-7, output: 44e-7, cache_read: 275e-9, cache_write: 11e-7 },
    { provider: "azure.ai.openai", model: "o4-mini-2025-04-16", input: 11e-7, output: 44e-7, cache_read: 275e-9, cache_write: 11e-7 },
    { provider: "azure.ai.openai", model: "text-embedding-3-large", input: 143e-9, output: 0, cache_read: 143e-9, cache_write: 143e-9 },
    { provider: "azure.ai.openai", model: "text-embedding-3-small", input: 22e-9, output: 0, cache_read: 22e-9, cache_write: 22e-9 },
    { provider: "azure.ai.openai", model: "text-embedding-ada-002", input: 11e-8, output: 0, cache_read: 11e-8, cache_write: 11e-8 },
    { provider: "cohere", model: "c4ai-aya-expanse-32b", input: 5e-7, output: 15e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "cohere", model: "command-a-03-2025", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "cohere", model: "command-nightly", input: 1e-6, output: 2e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "cohere", model: "command-r-08-2024", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "cohere", model: "command-r-plus-08-2024", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "cohere", model: "command-r7b-12-2024", input: 375e-10, output: 15e-8, cache_read: 375e-10, cache_write: 375e-10 },
    { provider: "cohere", model: "embed-english-light-v3.0", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "cohere", model: "embed-english-v3.0", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "cohere", model: "embed-multilingual-v3.0", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "cohere", model: "embed-v4.0", input: 12e-8, output: 0, cache_read: 12e-8, cache_write: 12e-8 },
    { provider: "cohere", model: "embed-v5.0-fast", input: 8e-8, output: 0, cache_read: 8e-8, cache_write: 8e-8 },
    { provider: "cohere", model: "embed-v5.0-pro", input: 12e-8, output: 0, cache_read: 12e-8, cache_write: 12e-8 },
    { provider: "deepseek", model: "deepseek-chat", input: 28e-8, output: 42e-8, cache_read: 28e-9, cache_write: 0 },
    { provider: "deepseek", model: "deepseek-coder", input: 14e-8, output: 28e-8, cache_read: 14e-9, cache_write: 14e-8 },
    { provider: "deepseek", model: "deepseek-flash", input: 3e-7, output: 12e-7, cache_read: 6e-9, cache_write: 0 },
    { provider: "deepseek", model: "deepseek-r1", input: 55e-8, output: 219e-8, cache_read: 14e-8, cache_write: 55e-8 },
    { provider: "deepseek", model: "deepseek-reasoner", input: 28e-8, output: 42e-8, cache_read: 28e-9, cache_write: 28e-8 },
    { provider: "deepseek", model: "deepseek-v3", input: 27e-8, output: 11e-7, cache_read: 7e-8, cache_write: 0 },
    { provider: "deepseek", model: "deepseek-v3.2", input: 28e-8, output: 4e-7, cache_read: 28e-9, cache_write: 28e-8 },
    { provider: "deepseek", model: "deepseek-v4-flash", input: 3e-7, output: 12e-7, cache_read: 6e-9, cache_write: 0 },
    { provider: "deepseek", model: "deepseek-v4-flash-vision-exp", input: 3e-7, output: 12e-7, cache_read: 6e-9, cache_write: 0 },
    { provider: "deepseek", model: "deepseek-v4-pro", input: 132e-8, output: 396e-8, cache_read: 44e-9, cache_write: 0 },
    { provider: "gcp.gemini", model: "deep-research-max-preview-04-2026", input: 2e-6, output: 12e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "gcp.gemini", model: "deep-research-preview-04-2026", input: 2e-6, output: 12e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "gcp.gemini", model: "deep-research-pro-preview-12-2025", input: 2e-6, output: 12e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "gcp.gemini", model: "gemini-2.5-computer-use-preview-10-2025", input: 125e-8, output: 1e-5, cache_read: 125e-8, cache_write: 125e-8 },
    { provider: "gcp.gemini", model: "gemini-2.5-flash", input: 3e-7, output: 25e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "gcp.gemini", model: "gemini-2.5-flash-lite", input: 1e-7, output: 4e-7, cache_read: 1e-8, cache_write: 1e-7 },
    { provider: "gcp.gemini", model: "gemini-2.5-pro", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "gcp.gemini", model: "gemini-2.5-pro-preview-tts", input: 1e-6, output: 2e-5, cache_read: 125e-9, cache_write: 1e-6 },
    { provider: "gcp.gemini", model: "gemini-3-flash-preview", input: 5e-7, output: 3e-6, cache_read: 5e-8, cache_write: 5e-7 },
    { provider: "gcp.gemini", model: "gemini-3.1-flash-lite", input: 25e-8, output: 15e-7, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "gcp.gemini", model: "gemini-3.1-flash-lite-preview", input: 25e-8, output: 15e-7, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "gcp.gemini", model: "gemini-3.1-pro-preview", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 2e-6 },
    { provider: "gcp.gemini", model: "gemini-3.1-pro-preview-customtools", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 2e-6 },
    { provider: "gcp.gemini", model: "gemini-3.5-flash", input: 15e-7, output: 9e-6, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "gcp.gemini", model: "gemini-3.5-flash-lite", input: 3e-7, output: 25e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "gcp.gemini", model: "gemini-3.6-flash", input: 75e-8, output: 375e-8, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "gcp.gemini", model: "gemini-3.7-flash", input: 75e-8, output: 375e-8, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "gcp.gemini", model: "gemini-3.8-flash", input: 75e-8, output: 375e-8, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "gcp.gemini", model: "gemini-4-argon", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 2e-6 },
    { provider: "gcp.gemini", model: "gemini-embedding-001", input: 15e-8, output: 0, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "gcp.gemini", model: "gemini-embedding-2", input: 2e-7, output: 0, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "gcp.gemini", model: "gemini-embedding-2-preview", input: 2e-7, output: 0, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "gcp.gemini", model: "gemini-exp-1206", input: 3e-7, output: 25e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "gcp.gemini", model: "gemini-flash-latest", input: 75e-8, output: 375e-8, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "gcp.gemini", model: "gemini-flash-lite-latest", input: 3e-7, output: 25e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "gcp.gemini", model: "gemini-gemma-2-27b-it", input: 35e-8, output: 105e-8, cache_read: 35e-8, cache_write: 35e-8 },
    { provider: "gcp.gemini", model: "gemini-gemma-2-9b-it", input: 35e-8, output: 105e-8, cache_read: 35e-8, cache_write: 35e-8 },
    { provider: "gcp.gemini", model: "gemini-omni-1.1-flash", input: 15e-7, output: 9e-6, cache_read: 15e-7, cache_write: 15e-7 },
    { provider: "gcp.gemini", model: "gemini-omni-flash-preview", input: 15e-7, output: 9e-6, cache_read: 15e-7, cache_write: 15e-7 },
    { provider: "gcp.gemini", model: "gemini-pro-latest", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 2e-6 },
    { provider: "gcp.gemini", model: "gemini-robotics-er-2-preview", input: 1e-6, output: 5e-6, cache_read: 1e-7, cache_write: 1e-6 },
    { provider: "gcp.gemini", model: "gemini-robotics-er-2-streaming-preview", input: 1e-6, output: 5e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "gcp.vertex_ai", model: "claude-3-5-haiku", input: 1e-6, output: 5e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "gcp.vertex_ai", model: "claude-3-5-haiku@20241022", input: 1e-6, output: 5e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "gcp.vertex_ai", model: "claude-3-5-sonnet", input: 3e-6, output: 15e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "gcp.vertex_ai", model: "claude-3-5-sonnet@20240620", input: 3e-6, output: 15e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "gcp.vertex_ai", model: "claude-3-haiku", input: 25e-8, output: 125e-8, cache_read: 25e-8, cache_write: 25e-8 },
    { provider: "gcp.vertex_ai", model: "claude-3-haiku@20240307", input: 25e-8, output: 125e-8, cache_read: 25e-8, cache_write: 25e-8 },
    { provider: "gcp.vertex_ai", model: "claude-3-opus", input: 15e-6, output: 75e-6, cache_read: 15e-6, cache_write: 15e-6 },
    { provider: "gcp.vertex_ai", model: "claude-3-opus@20240229", input: 15e-6, output: 75e-6, cache_read: 15e-6, cache_write: 15e-6 },
    { provider: "gcp.vertex_ai", model: "claude-3-sonnet", input: 3e-6, output: 15e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "gcp.vertex_ai", model: "claude-3-sonnet@20240229", input: 3e-6, output: 15e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "gcp.vertex_ai", model: "claude-fable-5", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "gcp.vertex_ai", model: "claude-fable-5-1", input: 1e-5, output: 5e-5, cache_read: 25e-8, cache_write: 125e-7 },
    { provider: "gcp.vertex_ai", model: "claude-fable-5-1@default", input: 1e-5, output: 5e-5, cache_read: 25e-8, cache_write: 125e-7 },
    { provider: "gcp.vertex_ai", model: "claude-fable-5@default", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "gcp.vertex_ai", model: "claude-haiku-4-5", input: 1e-6, output: 5e-6, cache_read: 1e-7, cache_write: 125e-8 },
    { provider: "gcp.vertex_ai", model: "claude-haiku-4-5@20251001", input: 1e-6, output: 5e-6, cache_read: 1e-7, cache_write: 125e-8 },
    { provider: "gcp.vertex_ai", model: "claude-haiku-5-5", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "gcp.vertex_ai", model: "claude-haiku-5-5@default", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "gcp.vertex_ai", model: "claude-opus-4-5", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "gcp.vertex_ai", model: "claude-opus-4-5@20251101", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "gcp.vertex_ai", model: "claude-opus-4-6", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "gcp.vertex_ai", model: "claude-opus-4-6@default", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "gcp.vertex_ai", model: "claude-opus-4-7", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "gcp.vertex_ai", model: "claude-opus-4-7@default", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "gcp.vertex_ai", model: "claude-opus-4-8", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "gcp.vertex_ai", model: "claude-opus-4-8@default", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "gcp.vertex_ai", model: "claude-opus-5", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "gcp.vertex_ai", model: "claude-opus-5-5", input: 4e-6, output: 2e-5, cache_read: 2e-7, cache_write: 5e-6 },
    { provider: "gcp.vertex_ai", model: "claude-opus-5-5@default", input: 4e-6, output: 2e-5, cache_read: 2e-7, cache_write: 5e-6 },
    { provider: "gcp.vertex_ai", model: "claude-opus-5@default", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 625e-8 },
    { provider: "gcp.vertex_ai", model: "claude-sonnet-4-5", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "gcp.vertex_ai", model: "claude-sonnet-4-5@20250929", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "gcp.vertex_ai", model: "claude-sonnet-4-6", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "gcp.vertex_ai", model: "claude-sonnet-4-6@default", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 375e-8 },
    { provider: "gcp.vertex_ai", model: "claude-sonnet-5", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "gcp.vertex_ai", model: "claude-sonnet-5-5", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 25e-7 },
    { provider: "gcp.vertex_ai", model: "claude-sonnet-5-5@default", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 25e-7 },
    { provider: "gcp.vertex_ai", model: "claude-sonnet-5@default", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "gcp.vertex_ai", model: "codestral-2", input: 3e-7, output: 9e-7, cache_read: 3e-7, cache_write: 3e-7 },
    { provider: "gcp.vertex_ai", model: "codestral-2501", input: 2e-7, output: 6e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "gcp.vertex_ai", model: "codestral-2@001", input: 3e-7, output: 9e-7, cache_read: 3e-7, cache_write: 3e-7 },
    { provider: "gcp.vertex_ai", model: "codestral@2405", input: 2e-7, output: 6e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "gcp.vertex_ai", model: "codestral@latest", input: 2e-7, output: 6e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "gcp.vertex_ai", model: "deep-research-pro-preview-12-2025", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "deepseek-ai/deepseek-r1-0528-maas", input: 135e-8, output: 54e-7, cache_read: 135e-8, cache_write: 135e-8 },
    { provider: "gcp.vertex_ai", model: "deepseek-ai/deepseek-v3.1-maas", input: 6e-7, output: 17e-7, cache_read: 6e-8, cache_write: 6e-7 },
    { provider: "gcp.vertex_ai", model: "deepseek-ai/deepseek-v3.2-maas", input: 56e-8, output: 168e-8, cache_read: 56e-9, cache_write: 56e-8 },
    { provider: "gcp.vertex_ai", model: "deepseek-ai/deepseek-v4.1-flash-maas", input: 3e-7, output: 12e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-2.0-flash", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "gcp.vertex_ai", model: "gemini-2.0-flash-lite", input: 75e-9, output: 3e-7, cache_read: 75e-9, cache_write: 75e-9 },
    { provider: "gcp.vertex_ai", model: "gemini-2.5-computer-use-preview-10-2025", input: 125e-8, output: 1e-5, cache_read: 125e-8, cache_write: 125e-8 },
    { provider: "gcp.vertex_ai", model: "gemini-2.5-flash", input: 3e-7, output: 25e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-2.5-flash-lite", input: 1e-7, output: 4e-7, cache_read: 1e-8, cache_write: 1e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-2.5-flash-lite-preview-09-2025", input: 1e-7, output: 4e-7, cache_read: 1e-8, cache_write: 1e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-2.5-flash-preview-09-2025", input: 3e-7, output: 25e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-2.5-pro", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "gcp.vertex_ai", model: "gemini-2.5-pro-preview-tts", input: 1e-6, output: 2e-5, cache_read: 125e-9, cache_write: 1e-6 },
    { provider: "gcp.vertex_ai", model: "gemini-3-flash-preview", input: 5e-7, output: 3e-6, cache_read: 5e-8, cache_write: 5e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-3-pro-preview", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "gemini-3.1-flash-lite", input: 25e-8, output: 15e-7, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "gcp.vertex_ai", model: "gemini-3.1-flash-lite-preview", input: 25e-8, output: 15e-7, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "gcp.vertex_ai", model: "gemini-3.1-pro-preview", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "gemini-3.1-pro-preview-customtools", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "gemini-3.5-flash", input: 15e-7, output: 9e-6, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-3.5-flash-lite", input: 3e-7, output: 25e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-3.6-flash", input: 75e-8, output: 375e-8, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "gcp.vertex_ai", model: "gemini-3.7-flash", input: 75e-8, output: 375e-8, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "gcp.vertex_ai", model: "gemini-3.8-flash", input: 75e-8, output: 375e-8, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "gcp.vertex_ai", model: "gemini-3.8-flash-cyber", input: 15e-7, output: 75e-7, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-4-argon", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "gemini-4-argon-cyber-permissive", input: 4e-6, output: 2e-5, cache_read: 2e-7, cache_write: 4e-6 },
    { provider: "gcp.vertex_ai", model: "gemini-embedding-001", input: 15e-8, output: 0, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "gcp.vertex_ai", model: "gemini-embedding-2", input: 2e-7, output: 0, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-embedding-2-preview", input: 2e-7, output: 0, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-omni-1.1-flash", input: 15e-7, output: 9e-6, cache_read: 15e-7, cache_write: 15e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-omni-1.1-flash-preview", input: 15e-7, output: 9e-6, cache_read: 15e-7, cache_write: 15e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-omni-flash-preview", input: 15e-7, output: 9e-6, cache_read: 15e-7, cache_write: 15e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-robotics-er-1.5-preview", input: 3e-7, output: 25e-7, cache_read: 0, cache_write: 3e-7 },
    { provider: "gcp.vertex_ai", model: "gemini-robotics-er-2-preview", input: 1e-6, output: 5e-6, cache_read: 1e-7, cache_write: 1e-6 },
    { provider: "gcp.vertex_ai", model: "gemma-4-26b-a4b-it", input: 15e-8, output: 6e-7, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "gcp.vertex_ai", model: "google/gemma-4-26b-a4b-it-maas", input: 15e-8, output: 6e-7, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "gcp.vertex_ai", model: "jamba-1.5", input: 2e-7, output: 4e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "gcp.vertex_ai", model: "jamba-1.5-large", input: 2e-6, output: 8e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "jamba-1.5-large@001", input: 2e-6, output: 8e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "jamba-1.5-mini", input: 2e-7, output: 4e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "gcp.vertex_ai", model: "jamba-1.5-mini@001", input: 2e-7, output: 4e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "gcp.vertex_ai", model: "meta/llama-3.1-405b-instruct-maas", input: 5e-6, output: 16e-6, cache_read: 5e-6, cache_write: 5e-6 },
    { provider: "gcp.vertex_ai", model: "meta/llama-3.3-70b-instruct-maas", input: 72e-8, output: 72e-8, cache_read: 72e-8, cache_write: 72e-8 },
    { provider: "gcp.vertex_ai", model: "meta/llama-4-maverick-17b-128e-instruct-maas", input: 35e-8, output: 115e-8, cache_read: 35e-8, cache_write: 35e-8 },
    { provider: "gcp.vertex_ai", model: "meta/llama-4-maverick-17b-16e-instruct-maas", input: 35e-8, output: 115e-8, cache_read: 35e-8, cache_write: 35e-8 },
    { provider: "gcp.vertex_ai", model: "meta/llama-4-scout-17b-128e-instruct-maas", input: 25e-8, output: 7e-7, cache_read: 25e-8, cache_write: 25e-8 },
    { provider: "gcp.vertex_ai", model: "meta/llama-4-scout-17b-16e-instruct-maas", input: 25e-8, output: 7e-7, cache_read: 25e-8, cache_write: 25e-8 },
    { provider: "gcp.vertex_ai", model: "minimaxai/minimax-m2-maas", input: 3e-7, output: 12e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "gcp.vertex_ai", model: "mistral-large-2411", input: 2e-6, output: 6e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "mistral-large@2407", input: 2e-6, output: 6e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "mistral-large@2411-001", input: 2e-6, output: 6e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "mistral-large@latest", input: 2e-6, output: 6e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "mistral-medium-3", input: 4e-7, output: 2e-6, cache_read: 4e-7, cache_write: 4e-7 },
    { provider: "gcp.vertex_ai", model: "mistral-medium-3@001", input: 4e-7, output: 2e-6, cache_read: 4e-7, cache_write: 4e-7 },
    { provider: "gcp.vertex_ai", model: "mistral-nemo@2407", input: 3e-6, output: 3e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "gcp.vertex_ai", model: "mistral-nemo@latest", input: 15e-8, output: 15e-8, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "gcp.vertex_ai", model: "mistral-small-2503", input: 1e-7, output: 3e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "gcp.vertex_ai", model: "mistral-small-2503@001", input: 1e-7, output: 3e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "gcp.vertex_ai", model: "mistralai/codestral-2", input: 3e-7, output: 9e-7, cache_read: 3e-7, cache_write: 3e-7 },
    { provider: "gcp.vertex_ai", model: "mistralai/codestral-2@001", input: 3e-7, output: 9e-7, cache_read: 3e-7, cache_write: 3e-7 },
    { provider: "gcp.vertex_ai", model: "mistralai/mistral-medium-3", input: 4e-7, output: 2e-6, cache_read: 4e-7, cache_write: 4e-7 },
    { provider: "gcp.vertex_ai", model: "mistralai/mistral-medium-3@001", input: 4e-7, output: 2e-6, cache_read: 4e-7, cache_write: 4e-7 },
    { provider: "gcp.vertex_ai", model: "moonshotai/kimi-k2-thinking-maas", input: 6e-7, output: 25e-7, cache_read: 6e-8, cache_write: 6e-7 },
    { provider: "gcp.vertex_ai", model: "multimodalembedding", input: 8e-7, output: 0, cache_read: 8e-7, cache_write: 8e-7 },
    { provider: "gcp.vertex_ai", model: "multimodalembedding@001", input: 8e-7, output: 0, cache_read: 8e-7, cache_write: 8e-7 },
    { provider: "gcp.vertex_ai", model: "openai/gpt-oss-120b-maas", input: 9e-8, output: 36e-8, cache_read: 9e-8, cache_write: 9e-8 },
    { provider: "gcp.vertex_ai", model: "openai/gpt-oss-20b-maas", input: 7e-8, output: 25e-8, cache_read: 7e-9, cache_write: 7e-8 },
    { provider: "gcp.vertex_ai", model: "qwen/qwen3-235b-a22b-instruct-2507-maas", input: 22e-8, output: 88e-8, cache_read: 22e-8, cache_write: 22e-8 },
    { provider: "gcp.vertex_ai", model: "qwen/qwen3-coder-480b-a35b-instruct-maas", input: 22e-8, output: 18e-7, cache_read: 22e-9, cache_write: 22e-8 },
    { provider: "gcp.vertex_ai", model: "qwen/qwen3-next-80b-a3b-instruct-maas", input: 15e-8, output: 12e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "gcp.vertex_ai", model: "qwen/qwen3-next-80b-a3b-thinking-maas", input: 15e-8, output: 12e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "gcp.vertex_ai", model: "text-embedding-004", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "gcp.vertex_ai", model: "text-embedding-005", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "gcp.vertex_ai", model: "text-embedding-large-exp-03-07", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "gcp.vertex_ai", model: "text-embedding-preview-0409", input: 625e-11, output: 0, cache_read: 625e-11, cache_write: 625e-11 },
    { provider: "gcp.vertex_ai", model: "text-multilingual-embedding-002", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "gcp.vertex_ai", model: "text-unicorn", input: 1e-5, output: 28e-6, cache_read: 1e-5, cache_write: 1e-5 },
    { provider: "gcp.vertex_ai", model: "text-unicorn@001", input: 1e-5, output: 28e-6, cache_read: 1e-5, cache_write: 1e-5 },
    { provider: "gcp.vertex_ai", model: "xai/grok-4.1-fast-non-reasoning", input: 2e-7, output: 5e-7, cache_read: 5e-8, cache_write: 2e-7 },
    { provider: "gcp.vertex_ai", model: "xai/grok-4.1-fast-reasoning", input: 2e-7, output: 5e-7, cache_read: 5e-8, cache_write: 2e-7 },
    { provider: "gcp.vertex_ai", model: "xai/grok-4.20-non-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "gcp.vertex_ai", model: "xai/grok-4.20-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "gcp.vertex_ai", model: "xai/grok-4.3", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "gcp.vertex_ai", model: "xai/grok-4.6", input: 2e-6, output: 6e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "xai/grok-4.7", input: 2e-6, output: 6e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "gcp.vertex_ai", model: "zai-org/glm-4.7-maas", input: 6e-7, output: 22e-7, cache_read: 6e-8, cache_write: 6e-7 },
    { provider: "gcp.vertex_ai", model: "zai-org/glm-5-maas", input: 1e-6, output: 32e-7, cache_read: 1e-7, cache_write: 1e-6 },
    { provider: "gcp.vertex_ai", model: "zai-org/glm-5.2-maas", input: 14e-7, output: 44e-7, cache_read: 14e-8, cache_write: 14e-7 },
    { provider: "groq", model: "llama-guard-3-8b", input: 2e-7, output: 2e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "groq", model: "meta-llama/llama-prompt-guard-2-22m", input: 3e-8, output: 3e-8, cache_read: 3e-8, cache_write: 3e-8 },
    { provider: "groq", model: "meta-llama/llama-prompt-guard-2-86m", input: 4e-8, output: 4e-8, cache_read: 4e-8, cache_write: 4e-8 },
    { provider: "groq", model: "openai/gpt-oss-120b", input: 15e-8, output: 6e-7, cache_read: 75e-9, cache_write: 15e-8 },
    { provider: "groq", model: "openai/gpt-oss-20b", input: 75e-9, output: 3e-7, cache_read: 375e-10, cache_write: 75e-9 },
    { provider: "groq", model: "openai/gpt-oss-safeguard-20b", input: 75e-9, output: 3e-7, cache_read: 37e-9, cache_write: 75e-9 },
    { provider: "groq", model: "qwen/qwen3.8-27b", input: 8e-7, output: 4e-6, cache_read: 8e-7, cache_write: 8e-7 },
    { provider: "ibm.watsonx.ai", model: "bigscience/mt0-xxl", input: 1908e-9, output: 1908e-9, cache_read: 1908e-9, cache_write: 1908e-9 },
    { provider: "ibm.watsonx.ai", model: "bigscience/mt0-xxl-13b", input: 1908e-9, output: 1908e-9, cache_read: 1908e-9, cache_write: 1908e-9 },
    { provider: "ibm.watsonx.ai", model: "google/flan-t5-xl-3b", input: 6e-7, output: 6e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-13b-chat-v2", input: 6e-7, output: 6e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-13b-instruct-v2", input: 6e-7, output: 6e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-3-3-8b-instruct", input: 2e-7, output: 2e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-3-8b-instruct", input: 2e-7, output: 2e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-4-h-small", input: 636e-10, output: 265e-9, cache_read: 636e-10, cache_write: 636e-10 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-guardian-3-2-2b", input: 1e-7, output: 1e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-guardian-3-3-8b", input: 2e-7, output: 2e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-ttm-1024-96-r2", input: 38e-8, output: 38e-8, cache_read: 38e-8, cache_write: 38e-8 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-ttm-1536-96-r2", input: 38e-8, output: 38e-8, cache_read: 38e-8, cache_write: 38e-8 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-ttm-512-96-r2", input: 38e-8, output: 38e-8, cache_read: 38e-8, cache_write: 38e-8 },
    { provider: "ibm.watsonx.ai", model: "ibm/granite-vision-3-2-2b", input: 1e-7, output: 1e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "ibm.watsonx.ai", model: "meta-llama/llama-3-2-11b-vision-instruct", input: 35e-8, output: 35e-8, cache_read: 35e-8, cache_write: 35e-8 },
    { provider: "ibm.watsonx.ai", model: "meta-llama/llama-3-2-1b-instruct", input: 1e-7, output: 1e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "ibm.watsonx.ai", model: "meta-llama/llama-3-2-3b-instruct", input: 15e-8, output: 15e-8, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "ibm.watsonx.ai", model: "meta-llama/llama-3-2-90b-vision-instruct", input: 2e-6, output: 2e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "ibm.watsonx.ai", model: "meta-llama/llama-3-3-70b-instruct", input: 7526e-10, output: 7526e-10, cache_read: 7526e-10, cache_write: 7526e-10 },
    { provider: "ibm.watsonx.ai", model: "meta-llama/llama-4-maverick-17b", input: 371e-9, output: 1484e-9, cache_read: 371e-9, cache_write: 371e-9 },
    { provider: "ibm.watsonx.ai", model: "meta-llama/llama-4-maverick-17b-128e-instruct-fp8", input: 371e-9, output: 1484e-9, cache_read: 371e-9, cache_write: 371e-9 },
    { provider: "ibm.watsonx.ai", model: "meta-llama/llama-guard-3-11b-vision", input: 35e-8, output: 35e-8, cache_read: 35e-8, cache_write: 35e-8 },
    { provider: "ibm.watsonx.ai", model: "mistralai/mistral-large", input: 3e-6, output: 1e-5, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "ibm.watsonx.ai", model: "mistralai/mistral-medium-2505", input: 3e-6, output: 1e-5, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "ibm.watsonx.ai", model: "mistralai/mistral-small-2503", input: 1e-7, output: 3e-7, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "ibm.watsonx.ai", model: "mistralai/mistral-small-3-1-24b-instruct-2503", input: 106e-9, output: 318e-9, cache_read: 106e-9, cache_write: 106e-9 },
    { provider: "ibm.watsonx.ai", model: "mistralai/pixtral-12b-2409", input: 35e-8, output: 35e-8, cache_read: 35e-8, cache_write: 35e-8 },
    { provider: "ibm.watsonx.ai", model: "openai/gpt-oss-120b", input: 159e-9, output: 636e-9, cache_read: 159e-9, cache_write: 159e-9 },
    { provider: "ibm.watsonx.ai", model: "sdaia/allam-1-13b-instruct", input: 18e-7, output: 18e-7, cache_read: 18e-7, cache_write: 18e-7 },
    { provider: "mistral_ai", model: "codestral-2508", input: 3e-7, output: 9e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "mistral_ai", model: "codestral-embed", input: 15e-8, output: 0, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "mistral_ai", model: "codestral-embed-2505", input: 15e-8, output: 0, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "mistral_ai", model: "codestral-latest", input: 3e-7, output: 9e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "mistral_ai", model: "codestral-mamba-latest", input: 25e-8, output: 25e-8, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "mistral_ai", model: "devstral-latest", input: 4e-7, output: 2e-6, cache_read: 4e-8, cache_write: 4e-7 },
    { provider: "mistral_ai", model: "devstral-medium-latest", input: 4e-7, output: 2e-6, cache_read: 4e-8, cache_write: 4e-7 },
    { provider: "mistral_ai", model: "devstral-small-latest", input: 1e-7, output: 3e-7, cache_read: 1e-8, cache_write: 1e-7 },
    { provider: "mistral_ai", model: "glm-5-2", input: 14e-7, output: 44e-7, cache_read: 14e-8, cache_write: 14e-7 },
    { provider: "mistral_ai", model: "magistral-medium-latest", input: 15e-7, output: 75e-7, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "mistral_ai", model: "magistral-small-latest", input: 15e-8, output: 6e-7, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "mistral_ai", model: "ministral-14b-2512", input: 2e-7, output: 2e-7, cache_read: 2e-8, cache_write: 2e-7 },
    { provider: "mistral_ai", model: "ministral-14b-latest", input: 2e-7, output: 2e-7, cache_read: 2e-8, cache_write: 2e-7 },
    { provider: "mistral_ai", model: "ministral-3-14b-2512", input: 2e-7, output: 2e-7, cache_read: 2e-8, cache_write: 2e-7 },
    { provider: "mistral_ai", model: "ministral-3-3b-2512", input: 1e-7, output: 1e-7, cache_read: 1e-8, cache_write: 1e-7 },
    { provider: "mistral_ai", model: "ministral-3-8b-2512", input: 15e-8, output: 15e-8, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "mistral_ai", model: "ministral-3b-2512", input: 1e-7, output: 1e-7, cache_read: 1e-8, cache_write: 1e-7 },
    { provider: "mistral_ai", model: "ministral-3b-latest", input: 1e-7, output: 1e-7, cache_read: 1e-8, cache_write: 1e-7 },
    { provider: "mistral_ai", model: "ministral-8b-2512", input: 15e-8, output: 15e-8, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "mistral_ai", model: "ministral-8b-latest", input: 15e-8, output: 15e-8, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "mistral_ai", model: "mistral-code-agent-latest", input: 4e-7, output: 2e-6, cache_read: 4e-8, cache_write: 4e-7 },
    { provider: "mistral_ai", model: "mistral-code-fim-latest", input: 3e-7, output: 9e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "mistral_ai", model: "mistral-code-latest", input: 3e-7, output: 9e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "mistral_ai", model: "mistral-embed", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "mistral_ai", model: "mistral-embed-2312", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "mistral_ai", model: "mistral-large-2512", input: 5e-7, output: 15e-7, cache_read: 5e-8, cache_write: 5e-7 },
    { provider: "mistral_ai", model: "mistral-large-3", input: 5e-7, output: 15e-7, cache_read: 5e-8, cache_write: 5e-7 },
    { provider: "mistral_ai", model: "mistral-large-4", input: 68e-8, output: 209e-8, cache_read: 68e-9, cache_write: 68e-8 },
    { provider: "mistral_ai", model: "mistral-large-4-0", input: 68e-8, output: 209e-8, cache_read: 68e-9, cache_write: 68e-8 },
    { provider: "mistral_ai", model: "mistral-large-latest", input: 5e-7, output: 15e-7, cache_read: 5e-8, cache_write: 5e-7 },
    { provider: "mistral_ai", model: "mistral-medium", input: 15e-7, output: 75e-7, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "mistral_ai", model: "mistral-medium-2604", input: 15e-7, output: 75e-7, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "mistral_ai", model: "mistral-medium-3", input: 15e-7, output: 75e-7, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "mistral_ai", model: "mistral-medium-3-5", input: 15e-7, output: 75e-7, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "mistral_ai", model: "mistral-medium-3.5", input: 15e-7, output: 75e-7, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "mistral_ai", model: "mistral-medium-latest", input: 15e-7, output: 75e-7, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "mistral_ai", model: "mistral-small", input: 1e-7, output: 3e-7, cache_read: 1e-8, cache_write: 1e-7 },
    { provider: "mistral_ai", model: "mistral-small-2603", input: 15e-8, output: 6e-7, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "mistral_ai", model: "mistral-small-latest", input: 15e-8, output: 6e-7, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "mistral_ai", model: "mistral-tiny", input: 25e-8, output: 25e-8, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "mistral_ai", model: "mistral-vibe-cli-fast", input: 15e-8, output: 6e-7, cache_read: 15e-9, cache_write: 15e-8 },
    { provider: "mistral_ai", model: "mistral-vibe-cli-latest", input: 15e-7, output: 75e-7, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "mistral_ai", model: "mistral-vibe-cli-with-tools", input: 15e-7, output: 75e-7, cache_read: 15e-8, cache_write: 15e-7 },
    { provider: "mistral_ai", model: "open-mistral-nemo", input: 3e-7, output: 3e-7, cache_read: 3e-8, cache_write: 3e-7 },
    { provider: "mistral_ai", model: "pixtral-large-latest", input: 2e-6, output: 6e-6, cache_read: 2e-7, cache_write: 2e-6 },
    { provider: "mistral_ai", model: "voxtral-small-2507", input: 1e-7, output: 4e-7, cache_read: 1e-8, cache_write: 1e-7 },
    { provider: "mistral_ai", model: "voxtral-small-latest", input: 1e-7, output: 4e-7, cache_read: 1e-8, cache_write: 1e-7 },
    { provider: "mistral_ai", model: "zai-glm-5", input: 14e-7, output: 44e-7, cache_read: 14e-8, cache_write: 14e-7 },
    { provider: "mistral_ai", model: "zai-glm-5-2", input: 14e-7, output: 44e-7, cache_read: 14e-8, cache_write: 14e-7 },
    { provider: "mistral_ai", model: "zai-glm-5-3", input: 14e-7, output: 44e-7, cache_read: 14e-8, cache_write: 14e-7 },
    { provider: "mistral_ai", model: "zai-glm-5-3-flash", input: 15e-8, output: 5e-7, cache_read: 3e-8, cache_write: 15e-8 },
    { provider: "mistral_ai", model: "zai-glm-latest", input: 14e-7, output: 44e-7, cache_read: 14e-8, cache_write: 14e-7 },
    { provider: "moonshot_ai", model: "kimi-k2.5", input: 6e-7, output: 3e-6, cache_read: 1e-7, cache_write: 6e-7 },
    { provider: "moonshot_ai", model: "kimi-k2.6", input: 95e-8, output: 4e-6, cache_read: 16e-8, cache_write: 95e-8 },
    { provider: "moonshot_ai", model: "kimi-k2.7-code", input: 95e-8, output: 4e-6, cache_read: 19e-8, cache_write: 95e-8 },
    { provider: "moonshot_ai", model: "kimi-k3", input: 3e-6, output: 15e-6, cache_read: 3e-7, cache_write: 3e-6 },
    { provider: "moonshot_ai", model: "moonshot-v1-128k", input: 2e-6, output: 5e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "moonshot_ai", model: "moonshot-v1-128k-vision-preview", input: 2e-6, output: 5e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "moonshot_ai", model: "moonshot-v1-32k", input: 1e-6, output: 3e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "moonshot_ai", model: "moonshot-v1-32k-vision-preview", input: 1e-6, output: 3e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "moonshot_ai", model: "moonshot-v1-8k", input: 2e-7, output: 2e-6, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "moonshot_ai", model: "moonshot-v1-8k-vision-preview", input: 2e-7, output: 2e-6, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "moonshot_ai", model: "moonshot-v1-auto", input: 2e-6, output: 5e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "openai", model: "babbage-002", input: 4e-7, output: 4e-7, cache_read: 4e-7, cache_write: 4e-7 },
    { provider: "openai", model: "chat-latest", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "openai", model: "computer-use-preview", input: 3e-6, output: 12e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "openai", model: "computer-use-preview-2025-03-11", input: 3e-6, output: 12e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "openai", model: "davinci-002", input: 2e-6, output: 2e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "openai", model: "daybreak-blue-latest", input: 4e-6, output: 2e-5, cache_read: 4e-7, cache_write: 5e-6 },
    { provider: "openai", model: "daybreak-red-latest", input: 125e-7, output: 75e-6, cache_read: 125e-8, cache_write: 15625e-9 },
    { provider: "openai", model: "gpt-3.5-turbo", input: 5e-7, output: 15e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "openai", model: "gpt-3.5-turbo-0125", input: 5e-7, output: 15e-7, cache_read: 5e-7, cache_write: 5e-7 },
    { provider: "openai", model: "gpt-3.5-turbo-1106", input: 1e-6, output: 2e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "openai", model: "gpt-3.5-turbo-16k", input: 3e-6, output: 4e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "openai", model: "gpt-3.5-turbo-instruct", input: 15e-7, output: 2e-6, cache_read: 15e-7, cache_write: 15e-7 },
    { provider: "openai", model: "gpt-3.5-turbo-instruct-0914", input: 15e-7, output: 2e-6, cache_read: 15e-7, cache_write: 15e-7 },
    { provider: "openai", model: "gpt-4", input: 3e-5, output: 6e-5, cache_read: 3e-5, cache_write: 3e-5 },
    { provider: "openai", model: "gpt-4-0613", input: 3e-5, output: 6e-5, cache_read: 3e-5, cache_write: 3e-5 },
    { provider: "openai", model: "gpt-4-1106-preview", input: 1e-5, output: 3e-5, cache_read: 1e-5, cache_write: 1e-5 },
    { provider: "openai", model: "gpt-4-turbo", input: 1e-5, output: 3e-5, cache_read: 1e-5, cache_write: 1e-5 },
    { provider: "openai", model: "gpt-4-turbo-2024-04-09", input: 1e-5, output: 3e-5, cache_read: 1e-5, cache_write: 1e-5 },
    { provider: "openai", model: "gpt-4.1", input: 2e-6, output: 8e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "openai", model: "gpt-4.1-2025-04-14", input: 2e-6, output: 8e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "openai", model: "gpt-4.1-mini", input: 4e-7, output: 16e-7, cache_read: 1e-7, cache_write: 4e-7 },
    { provider: "openai", model: "gpt-4.1-mini-2025-04-14", input: 4e-7, output: 16e-7, cache_read: 1e-7, cache_write: 4e-7 },
    { provider: "openai", model: "gpt-4.1-nano", input: 1e-7, output: 4e-7, cache_read: 25e-9, cache_write: 1e-7 },
    { provider: "openai", model: "gpt-4.1-nano-2025-04-14", input: 1e-7, output: 4e-7, cache_read: 25e-9, cache_write: 1e-7 },
    { provider: "openai", model: "gpt-4o", input: 25e-7, output: 1e-5, cache_read: 125e-8, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-4o-2024-05-13", input: 5e-6, output: 15e-6, cache_read: 5e-6, cache_write: 5e-6 },
    { provider: "openai", model: "gpt-4o-2024-08-06", input: 25e-7, output: 1e-5, cache_read: 125e-8, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-4o-2024-11-20", input: 25e-7, output: 1e-5, cache_read: 125e-8, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-4o-audio-preview-2024-12-17", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-4o-audio-preview-2025-06-03", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-4o-mini", input: 15e-8, output: 6e-7, cache_read: 75e-9, cache_write: 15e-8 },
    { provider: "openai", model: "gpt-4o-mini-2024-07-18", input: 15e-8, output: 6e-7, cache_read: 75e-9, cache_write: 15e-8 },
    { provider: "openai", model: "gpt-4o-mini-audio-preview-2024-12-17", input: 15e-8, output: 6e-7, cache_read: 15e-8, cache_write: 15e-8 },
    { provider: "openai", model: "gpt-4o-mini-search-preview", input: 15e-8, output: 6e-7, cache_read: 75e-9, cache_write: 15e-8 },
    { provider: "openai", model: "gpt-4o-mini-search-preview-2025-03-11", input: 15e-8, output: 6e-7, cache_read: 75e-9, cache_write: 15e-8 },
    { provider: "openai", model: "gpt-4o-search-preview", input: 25e-7, output: 1e-5, cache_read: 125e-8, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-4o-search-preview-2025-03-11", input: 25e-7, output: 1e-5, cache_read: 125e-8, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-5", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5-2025-08-07", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5-chat", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5-chat-latest", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5-codex", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5-mini", input: 25e-8, output: 2e-6, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "openai", model: "gpt-5-mini-2025-08-07", input: 25e-8, output: 2e-6, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "openai", model: "gpt-5-nano", input: 5e-8, output: 4e-7, cache_read: 5e-9, cache_write: 5e-8 },
    { provider: "openai", model: "gpt-5-nano-2025-08-07", input: 5e-8, output: 4e-7, cache_read: 5e-9, cache_write: 5e-8 },
    { provider: "openai", model: "gpt-5-pro", input: 15e-6, output: 12e-5, cache_read: 15e-6, cache_write: 15e-6 },
    { provider: "openai", model: "gpt-5-pro-2025-10-06", input: 15e-6, output: 12e-5, cache_read: 15e-6, cache_write: 15e-6 },
    { provider: "openai", model: "gpt-5-search-api", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5-search-api-2025-10-14", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5.1", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5.1-2025-11-13", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5.1-chat-latest", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5.1-codex", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5.1-codex-max", input: 125e-8, output: 1e-5, cache_read: 125e-9, cache_write: 125e-8 },
    { provider: "openai", model: "gpt-5.1-codex-mini", input: 25e-8, output: 2e-6, cache_read: 25e-9, cache_write: 25e-8 },
    { provider: "openai", model: "gpt-5.2", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "openai", model: "gpt-5.2-2025-12-11", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "openai", model: "gpt-5.2-chat-latest", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "openai", model: "gpt-5.2-codex", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "openai", model: "gpt-5.2-pro", input: 21e-6, output: 168e-6, cache_read: 21e-6, cache_write: 21e-6 },
    { provider: "openai", model: "gpt-5.2-pro-2025-12-11", input: 21e-6, output: 168e-6, cache_read: 21e-6, cache_write: 21e-6 },
    { provider: "openai", model: "gpt-5.3-chat-latest", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "openai", model: "gpt-5.3-codex", input: 175e-8, output: 14e-6, cache_read: 175e-9, cache_write: 175e-8 },
    { provider: "openai", model: "gpt-5.4", input: 25e-7, output: 15e-6, cache_read: 25e-8, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-5.4-2026-03-05", input: 25e-7, output: 15e-6, cache_read: 25e-8, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-5.4-mini", input: 75e-8, output: 45e-7, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "openai", model: "gpt-5.4-mini-2026-03-17", input: 75e-8, output: 45e-7, cache_read: 75e-9, cache_write: 75e-8 },
    { provider: "openai", model: "gpt-5.4-nano", input: 2e-7, output: 125e-8, cache_read: 2e-8, cache_write: 2e-7 },
    { provider: "openai", model: "gpt-5.4-nano-2026-03-17", input: 2e-7, output: 125e-8, cache_read: 2e-8, cache_write: 2e-7 },
    { provider: "openai", model: "gpt-5.4-pro", input: 3e-5, output: 18e-5, cache_read: 3e-5, cache_write: 3e-5 },
    { provider: "openai", model: "gpt-5.4-pro-2026-03-05", input: 3e-5, output: 18e-5, cache_read: 3e-5, cache_write: 3e-5 },
    { provider: "openai", model: "gpt-5.5", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "openai", model: "gpt-5.5-2026-04-23", input: 5e-6, output: 3e-5, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "openai", model: "gpt-5.5-cyber", input: 125e-7, output: 75e-6, cache_read: 125e-8, cache_write: 125e-7 },
    { provider: "openai", model: "gpt-5.5-cyber-preview", input: 125e-7, output: 75e-6, cache_read: 125e-8, cache_write: 125e-7 },
    { provider: "openai", model: "gpt-5.5-pro", input: 3e-5, output: 18e-5, cache_read: 3e-5, cache_write: 3e-5 },
    { provider: "openai", model: "gpt-5.5-pro-2026-04-23", input: 3e-5, output: 18e-5, cache_read: 3e-5, cache_write: 3e-5 },
    { provider: "openai", model: "gpt-5.6", input: 4e-6, output: 2e-5, cache_read: 4e-7, cache_write: 5e-6 },
    { provider: "openai", model: "gpt-5.6-cyber", input: 125e-7, output: 75e-6, cache_read: 125e-8, cache_write: 15625e-9 },
    { provider: "openai", model: "gpt-5.6-luna", input: 2e-7, output: 12e-7, cache_read: 2e-8, cache_write: 25e-8 },
    { provider: "openai", model: "gpt-5.6-sol", input: 4e-6, output: 2e-5, cache_read: 4e-7, cache_write: 5e-6 },
    { provider: "openai", model: "gpt-5.6-terra", input: 2e-6, output: 12e-6, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-6-astra", input: 1e-5, output: 5e-5, cache_read: 1e-6, cache_write: 125e-7 },
    { provider: "openai", model: "gpt-6-luna", input: 1e-7, output: 5e-7, cache_read: 1e-8, cache_write: 125e-9 },
    { provider: "openai", model: "gpt-6-sol", input: 2e-6, output: 1e-5, cache_read: 2e-7, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-6.1-sol", input: 2e-6, output: 1e-5, cache_read: 1e-7, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-audio", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-audio-1.5", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-audio-2025-08-28", input: 25e-7, output: 1e-5, cache_read: 25e-7, cache_write: 25e-7 },
    { provider: "openai", model: "gpt-audio-mini", input: 6e-7, output: 24e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "openai", model: "gpt-audio-mini-2025-10-06", input: 6e-7, output: 24e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "openai", model: "gpt-audio-mini-2025-12-15", input: 6e-7, output: 24e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "openai", model: "gpt-daybreak-blue-latest", input: 4e-6, output: 2e-5, cache_read: 4e-7, cache_write: 5e-6 },
    { provider: "openai", model: "gpt-daybreak-red-latest", input: 125e-7, output: 75e-6, cache_read: 125e-8, cache_write: 15625e-9 },
    { provider: "openai", model: "gpt-rosalind-discovery", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "openai", model: "gpt-rosalind-research", input: 5e-6, output: 25e-6, cache_read: 5e-7, cache_write: 5e-6 },
    { provider: "openai", model: "o1", input: 15e-6, output: 6e-5, cache_read: 75e-7, cache_write: 15e-6 },
    { provider: "openai", model: "o1-2024-12-17", input: 15e-6, output: 6e-5, cache_read: 75e-7, cache_write: 15e-6 },
    { provider: "openai", model: "o1-pro", input: 15e-5, output: 6e-4, cache_read: 15e-5, cache_write: 15e-5 },
    { provider: "openai", model: "o1-pro-2025-03-19", input: 15e-5, output: 6e-4, cache_read: 15e-5, cache_write: 15e-5 },
    { provider: "openai", model: "o3", input: 2e-6, output: 8e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "openai", model: "o3-2025-04-16", input: 2e-6, output: 8e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "openai", model: "o3-deep-research", input: 1e-5, output: 4e-5, cache_read: 25e-7, cache_write: 1e-5 },
    { provider: "openai", model: "o3-deep-research-2025-06-26", input: 1e-5, output: 4e-5, cache_read: 25e-7, cache_write: 1e-5 },
    { provider: "openai", model: "o3-mini", input: 11e-7, output: 44e-7, cache_read: 55e-8, cache_write: 11e-7 },
    { provider: "openai", model: "o3-mini-2025-01-31", input: 11e-7, output: 44e-7, cache_read: 55e-8, cache_write: 11e-7 },
    { provider: "openai", model: "o3-pro", input: 2e-5, output: 8e-5, cache_read: 2e-5, cache_write: 2e-5 },
    { provider: "openai", model: "o3-pro-2025-06-10", input: 2e-5, output: 8e-5, cache_read: 2e-5, cache_write: 2e-5 },
    { provider: "openai", model: "o4-mini", input: 11e-7, output: 44e-7, cache_read: 275e-9, cache_write: 11e-7 },
    { provider: "openai", model: "o4-mini-2025-04-16", input: 11e-7, output: 44e-7, cache_read: 275e-9, cache_write: 11e-7 },
    { provider: "openai", model: "o4-mini-deep-research", input: 2e-6, output: 8e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "openai", model: "o4-mini-deep-research-2025-06-26", input: 2e-6, output: 8e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "openai", model: "text-embedding-3-large", input: 13e-8, output: 0, cache_read: 13e-8, cache_write: 13e-8 },
    { provider: "openai", model: "text-embedding-3-small", input: 2e-8, output: 0, cache_read: 2e-8, cache_write: 2e-8 },
    { provider: "openai", model: "text-embedding-ada-002", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "openai", model: "text-embedding-ada-002-v2", input: 1e-7, output: 0, cache_read: 1e-7, cache_write: 1e-7 },
    { provider: "perplexity", model: "codellama-34b-instruct", input: 35e-8, output: 14e-7, cache_read: 35e-8, cache_write: 35e-8 },
    { provider: "perplexity", model: "codellama-70b-instruct", input: 7e-7, output: 28e-7, cache_read: 7e-7, cache_write: 7e-7 },
    { provider: "perplexity", model: "llama-2-70b-chat", input: 7e-7, output: 28e-7, cache_read: 7e-7, cache_write: 7e-7 },
    { provider: "perplexity", model: "llama-3.1-70b-instruct", input: 1e-6, output: 1e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "perplexity", model: "llama-3.1-8b-instruct", input: 2e-7, output: 2e-7, cache_read: 2e-7, cache_write: 2e-7 },
    { provider: "perplexity", model: "mistral-7b-instruct", input: 7e-8, output: 28e-8, cache_read: 7e-8, cache_write: 7e-8 },
    { provider: "perplexity", model: "mixtral-8x7b-instruct", input: 7e-8, output: 28e-8, cache_read: 7e-8, cache_write: 7e-8 },
    { provider: "perplexity", model: "pplx-70b-chat", input: 7e-7, output: 28e-7, cache_read: 7e-7, cache_write: 7e-7 },
    { provider: "perplexity", model: "pplx-70b-online", input: 0, output: 28e-7, cache_read: 0, cache_write: 0 },
    { provider: "perplexity", model: "pplx-7b-chat", input: 7e-8, output: 28e-8, cache_read: 7e-8, cache_write: 7e-8 },
    { provider: "perplexity", model: "pplx-7b-online", input: 0, output: 28e-8, cache_read: 0, cache_write: 0 },
    { provider: "perplexity", model: "pplx-embed-context-v1-0.6b", input: 8e-9, output: 0, cache_read: 8e-9, cache_write: 8e-9 },
    { provider: "perplexity", model: "pplx-embed-context-v1-4b", input: 5e-8, output: 0, cache_read: 5e-8, cache_write: 5e-8 },
    { provider: "perplexity", model: "pplx-embed-v1-0.6b", input: 4e-9, output: 0, cache_read: 4e-9, cache_write: 4e-9 },
    { provider: "perplexity", model: "pplx-embed-v1-4b", input: 3e-8, output: 0, cache_read: 3e-8, cache_write: 3e-8 },
    { provider: "perplexity", model: "sonar", input: 1e-6, output: 1e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "perplexity", model: "sonar-deep-research", input: 2e-6, output: 8e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "perplexity", model: "sonar-medium-chat", input: 6e-7, output: 18e-7, cache_read: 6e-7, cache_write: 6e-7 },
    { provider: "perplexity", model: "sonar-medium-online", input: 0, output: 18e-7, cache_read: 0, cache_write: 0 },
    { provider: "perplexity", model: "sonar-pro", input: 3e-6, output: 15e-6, cache_read: 3e-6, cache_write: 3e-6 },
    { provider: "perplexity", model: "sonar-reasoning", input: 1e-6, output: 5e-6, cache_read: 1e-6, cache_write: 1e-6 },
    { provider: "perplexity", model: "sonar-reasoning-pro", input: 2e-6, output: 8e-6, cache_read: 2e-6, cache_write: 2e-6 },
    { provider: "perplexity", model: "sonar-small-chat", input: 7e-8, output: 28e-8, cache_read: 7e-8, cache_write: 7e-8 },
    { provider: "perplexity", model: "sonar-small-online", input: 0, output: 28e-8, cache_read: 0, cache_write: 0 },
    { provider: "x_ai", model: "grok-4.20", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-0309", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-0309-non-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-0309-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-beta", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-beta-0309", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-beta-0309-non-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-beta-0309-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-beta-latest", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-beta-latest-non-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-beta-latest-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-beta-non-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-beta-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-experimental-beta-0304", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-experimental-beta-0304-non-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-experimental-beta-0304-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-experimental-beta-latest", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-experimental-beta-non-reasoning-latest", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-experimental-beta-reasoning-latest", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-multi-agent", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-multi-agent-0309", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-multi-agent-beta-0309", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-multi-agent-beta-latest", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-multi-agent-experimental-beta-0304", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-multi-agent-experimental-beta-latest", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-multi-agent-latest", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-non-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-non-reasoning-gv2", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-non-reasoning-latest", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-reasoning", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-reasoning-gv2", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.20-reasoning-latest", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.3", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.3-latest", input: 125e-8, output: 25e-7, cache_read: 2e-7, cache_write: 125e-8 },
    { provider: "x_ai", model: "grok-4.5", input: 2e-6, output: 6e-6, cache_read: 3e-7, cache_write: 2e-6 },
    { provider: "x_ai", model: "grok-4.5-latest", input: 2e-6, output: 6e-6, cache_read: 3e-7, cache_write: 2e-6 },
    { provider: "x_ai", model: "grok-4.6", input: 2e-6, output: 6e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "x_ai", model: "grok-4.7", input: 2e-6, output: 6e-6, cache_read: 5e-7, cache_write: 2e-6 },
    { provider: "x_ai", model: "grok-build-0.1", input: 1e-6, output: 2e-6, cache_read: 2e-7, cache_write: 1e-6 },
    { provider: "x_ai", model: "grok-build-latest", input: 2e-6, output: 6e-6, cache_read: 3e-7, cache_write: 2e-6 },
    { provider: "x_ai", model: "grok-code-fast", input: 1e-6, output: 2e-6, cache_read: 2e-7, cache_write: 1e-6 },
    { provider: "x_ai", model: "grok-code-fast-1", input: 1e-6, output: 2e-6, cache_read: 2e-7, cache_write: 1e-6 },
    { provider: "x_ai", model: "grok-code-fast-1-0825", input: 1e-6, output: 2e-6, cache_read: 2e-7, cache_write: 1e-6 }
  ]
};
function costOf(rate, tokens) {
  const uncached = Math.max(tokens.input - tokens.cacheRead - tokens.cacheWrite, 0);
  return uncached * rate.input + tokens.cacheRead * rate.cacheRead + tokens.cacheWrite * rate.cacheWrite + tokens.output * rate.output;
}
function byName(rows) {
  const rates = /* @__PURE__ */ new Map();
  for (const { provider, model, ...rate } of rows) {
    let models = rates.get(provider);
    if (models === void 0) rates.set(provider, models = /* @__PURE__ */ new Map());
    models.set(model, rate);
  }
  return rates;
}
var table;
function tableRates() {
  if (table === void 0) {
    const rows = model_prices_default.prices;
    table = byName(
      rows.map((row) => ({
        provider: row.provider,
        model: row.model,
        input: row.input,
        output: row.output,
        cacheRead: row.cache_read,
        cacheWrite: row.cache_write
      }))
    );
  }
  return table;
}
function ownRates(prices) {
  return byName(
    prices.map((price) => ({
      provider: price.provider,
      model: price.model,
      input: price.input,
      output: price.output,
      cacheRead: price.cacheRead ?? price.input,
      cacheWrite: price.cacheWrite ?? price.input
    }))
  );
}
function priced(own2, provider, model, tokens) {
  const rate = own2.get(provider)?.get(model) ?? tableRates().get(provider)?.get(model);
  return rate === void 0 ? void 0 : costOf(rate, tokens);
}
function checkedPrice(given) {
  const price = given;
  if (typeof price !== "object" || price === null || typeof price.provider !== "string" || price.provider === "" || typeof price.model !== "string" || price.model === "") {
    throw new TypeError("a price names its provider and its model");
  }
  const amounts = [price.input, price.output, price.cacheRead ?? 0, price.cacheWrite ?? 0];
  if (!amounts.every((amount) => typeof amount === "number" && Number.isFinite(amount) && amount >= 0)) {
    throw new RangeError("a price is a finite number of US dollars a token, from 0");
  }
  return Object.freeze({ ...price });
}
var Guard = class _Guard {
  #maxSteps;
  #maxSpend;
  #steps = 0;
  #spent = 0;
  constructor(maxSteps, maxSpend) {
    this.#maxSteps = maxSteps;
    this.#maxSpend = maxSpend;
  }
  /** The trace's options' caps, or why they are none: whole steps above 0, and a spend above 0. */
  static of(options) {
    const steps = options.maxSteps ?? void 0;
    if (steps !== void 0 && !(typeof steps === "number" && Number.isInteger(steps) && steps >= 1)) {
      throw new RangeError("maxSteps must be a whole number above 0");
    }
    const spend = options.maxSpend ?? void 0;
    if (spend !== void 0 && !(typeof spend === "number" && Number.isFinite(spend) && spend > 0)) {
      throw new RangeError("maxSpend must be a finite number of US dollars above 0");
    }
    return new _Guard(steps, spend);
  }
  get spent() {
    return this.#spent;
  }
  /** Whether the trace has a spend cap, which a call priced at nothing never reaches. */
  get capped() {
    return this.#maxSpend !== void 0;
  }
  /** Counts a step opening, or throws where the trace reached a cap: its spend for whatever opens, its steps for a step. */
  opens(step) {
    if (this.#maxSpend !== void 0 && this.#spent >= this.#maxSpend) {
      throw new CapExceededError("spend", this.#maxSpend, this.#spent);
    }
    if (step) {
      if (this.#maxSteps !== void 0 && this.#steps >= this.#maxSteps) {
        throw new CapExceededError("steps", this.#maxSteps, this.#steps);
      }
      this.#steps += 1;
    }
  }
  /** A call's cost counted again: `now` in place of `before`. */
  counts(before, now) {
    this.#spent += now - before;
  }
};
var Ids = class {
  #random = new RandomIdGenerator();
  #given;
  generateTraceId() {
    return this.#given?.traceId ?? this.#random.generateTraceId();
  }
  generateSpanId() {
    return this.#given?.spanId ?? this.#random.generateSpanId();
  }
  /**
   * `open`, with the span it opens taking these ids. It runs synchronously,
   * so no other span can open in between and take them.
   */
  given(traceId, spanId, open) {
    this.#given = { traceId, spanId };
    try {
      return open();
    } finally {
      this.#given = void 0;
    }
  }
};
function spanIdAt(traceHex, place) {
  const digest = createHash22("sha1").update(Buffer.from(traceHex, "hex")).update(String(place)).digest();
  digest[6] = (digest[6] ?? 0) & 15 | 80;
  return digest.subarray(0, 8).toString("hex");
}
var MAX_QUEUE_SIZE = 2048;
var MAX_BATCH_SIZE = 512;
var SCHEDULE_DELAY_S = 5;
var SHUTDOWN_TIMEOUT_S = 30;
var live = /* @__PURE__ */ new Set();
var hooked = false;
function beforeExit() {
  for (const held of live) {
    const processor = held.deref();
    if (processor === void 0) live.delete(held);
    else processor.drainBeforeExit();
  }
}
var Processor = class {
  #held = new WeakRef(this);
  #exporter;
  #maxQueueSize;
  #maxBatchSize;
  #delayMs;
  #queue = [];
  /**
   * The queue's first span is the `#taken`th ever queued; a batch stops at
   * each fence, a record's first span and one past its last.
   */
  #taken = 0;
  #fences = [];
  /** The record being built: its trace, its spans as they end, and its room. */
  #stage;
  #reserved = 0;
  #dropped = 0;
  /** A trace's opening queued, which goes without waiting for the delay. */
  #opening = false;
  #flushers = [];
  #timer;
  #inFlight;
  #down = false;
  /** Set once a shutdown's deadline has passed: nothing more is started. */
  #givenUp = false;
  constructor(exporter, options = {}) {
    this.#exporter = exporter;
    this.#maxQueueSize = bound(options.maxQueueSize ?? MAX_QUEUE_SIZE, "maxQueueSize");
    this.#maxBatchSize = bound(options.maxBatchSize ?? MAX_BATCH_SIZE, "maxBatchSize");
    const delay = options.scheduleDelaySeconds ?? SCHEDULE_DELAY_S;
    if (typeof delay !== "number" || !(delay >= 0 && delay * 1e3 <= 2 ** 31 - 1)) {
      throw new RangeError("scheduleDelaySeconds must be a number of seconds from 0, under 25 days");
    }
    this.#delayMs = delay * 1e3;
    live.add(this.#held);
    if (!hooked) {
      hooked = true;
      process.on("beforeExit", beforeExit);
    }
  }
  /**
   * Runs `build`, staging the spans of trace `traceId` as they end, then
   * queues them whole, to travel in exports of their own: so the same record
   * sent again is the same bytes, whatever else ends meanwhile. Throws
   * `ShutdownError` once shut down, and `QueueFullError` when the queue has no
   * room for the record's `need` spans, running nothing; the room is kept for
   * them meanwhile. A `build` that throws queues nothing. Of the application's,
   * it runs the root sampler and the reads of the caller's record alone, a
   * record's warnings given before it.
   */
  record(traceId, need, build) {
    if (this.#down) throw new ShutdownError();
    if (this.#queue.length + need > this.#maxQueueSize) throw new QueueFullError(need, this.#maxQueueSize);
    const stage = { traceId, spans: [] };
    this.#stage = stage;
    this.#reserved = need;
    try {
      build();
    } finally {
      this.#stage = void 0;
      this.#reserved = 0;
    }
    if (this.#down || stage.spans.length === 0) return;
    const first = this.#taken + this.#queue.length;
    if (first > this.#taken) this.#fences.push(first);
    this.#fences.push(first + stage.spans.length);
    for (const span of stage.spans) this.#queue.push(span);
    this.#wake(0);
  }
  onStart(_span, _parentContext) {
  }
  onEnd(span) {
    if (this.#down) return;
    if (this.#stage !== void 0 && span.spanContext().traceId === this.#stage.traceId) {
      this.#stage.spans.push(span);
      return;
    }
    if (this.#queue.length + this.#reserved >= this.#maxQueueSize) {
      this.#dropped += 1;
      return;
    }
    this.#queue.push(span);
    if (span.name === TRACE_START && span.parentSpanContext !== void 0) this.#opening = true;
    this.#wake(this.#due() ? 0 : this.#delayMs);
  }
  /** Resolves once the queue is empty and the export in flight has settled. */
  forceFlush() {
    if (this.#idle() || this.#givenUp) return Promise.resolve();
    return new Promise((resolve22) => {
      this.#flushers.push(resolve22);
      this.#wake(0);
    });
  }
  /** Spans still queued as Node's loop empties: sent within a shutdown's 30 s, the export holding the loop. */
  drainBeforeExit() {
    if (!this.#down && !this.#idle()) void this.shutdown();
  }
  /**
   * Drains, then takes nothing more. Past the timeout what is left is given
   * up: the wait for a retry ends there and no batch or attempt follows, so
   * nothing of the SDK's but a request already in flight, which its own
   * timeout bounds, holds the process the caller is ending, as the other
   * SDKs' workers hold none.
   */
  async shutdown() {
    live.delete(this.#held);
    if (this.#down) return;
    this.#down = true;
    const deadline = Date.now() + SHUTDOWN_TIMEOUT_S * 1e3;
    while (!this.#idle()) {
      if (this.#inFlight === void 0) this.#tick();
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        this.#givenUp = true;
        this.#exporter.giveUp();
        for (const resolve22 of this.#flushers.splice(0)) resolve22();
        break;
      }
      await Promise.race([this.#inFlight, pause(remaining)]);
    }
    if (this.#timer !== void 0) {
      clearTimeout(this.#timer);
      this.#timer = void 0;
    }
  }
  #idle() {
    return this.#queue.length === 0 && this.#inFlight === void 0;
  }
  /** Whether the worker should export without waiting; a record queued, or a trace's opening, goes at once. */
  #due() {
    return this.#down || this.#flushers.length > 0 || this.#opening || this.#fences.length > 0 || this.#queue.length >= this.#maxBatchSize;
  }
  // The worker is a timer, never referenced: an idle SDK never keeps the
  // process alive, and a pending one fires no later than the delay.
  #wake(ms) {
    if (this.#givenUp) return;
    if (this.#timer !== void 0) {
      if (ms > 0) return;
      clearTimeout(this.#timer);
    }
    const timer = setTimeout(() => {
      this.#timer = void 0;
      this.#tick();
    }, ms);
    timer.unref();
    this.#timer = timer;
  }
  /** One batch, one at a time; the export's end looks again. */
  #tick() {
    if (this.#inFlight !== void 0 || this.#givenUp) return;
    const fence = this.#fences[0];
    const batch = this.#queue.splice(0, Math.min(this.#maxBatchSize, (fence ?? Infinity) - this.#taken));
    this.#opening &&= this.#queue.length > 0;
    this.#taken += batch.length;
    while ((this.#fences[0] ?? Infinity) <= this.#taken) this.#fences.shift();
    const dropped = this.#dropped;
    this.#dropped = 0;
    if (dropped > 0) {
      this.#exporter.warn(`telmoni: the export queue was full; ${dropped} spans were dropped`, { kind: "queue_full" });
    }
    if (batch.length === 0) {
      this.#settle();
      return;
    }
    this.#inFlight = this.#send(batch).then(() => {
      this.#inFlight = void 0;
      this.#settle();
    });
  }
  async #send(batch) {
    try {
      await this.#exporter.export(batch);
    } catch (error) {
      this.#exporter.warn(`telmoni: an export failed (${errorName(error)}); the batch was dropped`, {
        kind: "export_error"
      });
    }
  }
  #settle() {
    if (this.#queue.length > 0) {
      this.#wake(this.#due() ? 0 : this.#delayMs);
      return;
    }
    const flushers = this.#flushers;
    this.#flushers = [];
    for (const resolve22 of flushers) resolve22();
  }
};
function bound(given, name) {
  if (typeof given === "number" && (given === Number.POSITIVE_INFINITY || Number.isInteger(given) && given >= 1)) {
    return given;
  }
  throw new RangeError(`${name} must be a whole number from 1, or Infinity`);
}
function pause(ms) {
  return new Promise((resolve22) => {
    const timer = setTimeout(resolve22, ms);
    timer.unref();
  });
}
var HEX = /^[0-9a-f]+$/;
function writeHeaders(headers, span, agent) {
  const sampled = (span.traceFlags & TraceFlags.SAMPLED) !== 0 ? "01" : "00";
  setHeader(headers, TRACEPARENT, `00-${span.traceId}-${span.spanId}-${sampled}`);
  const members = (getHeader(headers, BAGGAGE) ?? "").split(",").map((member) => member.trim()).filter((member) => member !== "" && !isOurs(member));
  members.push(`${AGENT2}=${encodeBaggageValue(agent)}`);
  setHeader(headers, BAGGAGE, members.join(","));
}
function readHeaders(headers) {
  const traceparent = getHeader(headers, TRACEPARENT);
  if (traceparent === void 0) return void 0;
  const spanContext = parseTraceparent(traceparent);
  if (spanContext === void 0) return void 0;
  const agent = baggageMembers(getHeader(headers, BAGGAGE) ?? "").get(AGENT2);
  if (agent === void 0 || agent === "") return void 0;
  return { spanContext, agent };
}
function parseTraceparent(header) {
  const parts = header.trim().split("-");
  if (parts.length < 4) return void 0;
  const [version, traceId, spanId, flags] = parts;
  if (!isHex2(version, 2) || version === "ff") return void 0;
  if (version === "00" && parts.length !== 4) return void 0;
  if (!isHex2(traceId, 32) || !/[1-9a-f]/.test(traceId)) return void 0;
  if (!isHex2(spanId, 16) || !/[1-9a-f]/.test(spanId)) return void 0;
  if (!isHex2(flags, 2)) return void 0;
  return { traceId, spanId, traceFlags: Number.parseInt(flags, 16) & TraceFlags.SAMPLED, isRemote: true };
}
function baggageMembers(header) {
  const members = /* @__PURE__ */ new Map();
  for (const member of header.split(",")) {
    const equals = member.indexOf("=");
    if (equals < 0) continue;
    const key = member.slice(0, equals).trim();
    const value = member.slice(equals + 1).split(";", 1)[0].trim();
    if (key !== "") members.set(key, decodeBaggageValue(value));
  }
  return members;
}
function isOurs(member) {
  return member.split("=", 1)[0].trim() === AGENT2;
}
function isHex2(text3, length) {
  return text3.length === length && HEX.test(text3);
}
function encodeBaggageValue(value) {
  let out = "";
  for (const byte of new TextEncoder().encode(value)) {
    out += allowedInBaggage(byte) ? String.fromCharCode(byte) : `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
  }
  return out;
}
function decodeBaggageValue(value) {
  const bytes = [];
  const encoder = new TextEncoder();
  for (let i = 0; i < value.length; ) {
    const pair = value.slice(i + 1, i + 3);
    if (value[i] === "%" && pair.length === 2 && HEX.test(pair.toLowerCase())) {
      bytes.push(Number.parseInt(pair, 16));
      i += 3;
      continue;
    }
    const char = String.fromCodePoint(value.codePointAt(i));
    for (const byte of encoder.encode(char)) bytes.push(byte);
    i += char.length;
  }
  return new TextDecoder("utf-8", { ignoreBOM: true }).decode(Uint8Array.from(bytes));
}
function allowedInBaggage(byte) {
  return byte === 33 || byte >= 35 && byte <= 43 && byte !== 37 || byte >= 45 && byte <= 58 || byte >= 60 && byte <= 91 || byte >= 93 && byte <= 126;
}
function hasGet(headers) {
  return typeof headers.get === "function";
}
function getHeader(headers, name) {
  if (hasGet(headers)) {
    const value = headers.get(name);
    return typeof value === "string" ? value : void 0;
  }
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== name) continue;
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.join(",");
  }
  return void 0;
}
function setHeader(headers, name, value) {
  if (hasGet(headers)) {
    headers.set(name, value);
    return;
  }
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === name) delete headers[key];
  }
  headers[name] = value;
}
var WHY = {
  name: `its name is 1 to ${SCORE_NAME_MAX} characters`,
  number: "a number score is a finite number within its range",
  category: `its category is 1 to ${SCORE_CATEGORY_MAX} characters`,
  version: `its version is up to ${SCORE_VERSION_MAX} characters`,
  range: "a range is a number score's alone",
  value: "its value is a number, a yes or no, or a category",
  target: `it names a trace by 32 hex digits, a trace and one of its spans by 16, or a session of up to ${SESSION_ID_MAX} characters`,
  ended: "its span had ended; send it with the client's score, naming the span",
  full: `its span holds ${SCORES_PER_SPAN} scores already`
};
function refuse(warnOnce, why) {
  warnOnce(`score:${why}`, `telmoni: a score was not sent: ${why}`, { kind: "input" });
}
function trimmed(text3, most) {
  if (typeof text3 !== "string") return void 0;
  const kept = trimEnds(text3);
  return [...kept].length <= most ? kept : void 0;
}
function judge(name, value, options) {
  const named = trimmed(name, SCORE_NAME_MAX);
  if (!named) return WHY.name;
  const given = options?.version;
  const version = given === void 0 || given === null ? "" : trimmed(given, SCORE_VERSION_MAX);
  if (version === void 0) return WHY.version;
  const range = options?.range;
  const ranged = range !== void 0 && range !== null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return WHY.number;
    if (!ranged) return { name: named, version, type: "number", value, range: void 0 };
    const [min, max] = Array.isArray(range) && range.length === 2 ? range : [];
    if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max)) {
      return WHY.number;
    }
    if (!(min < max && min <= value && value <= max)) return WHY.number;
    return { name: named, version, type: "number", value, range: [min, max] };
  }
  if (typeof value !== "boolean" && typeof value !== "string") return WHY.value;
  if (ranged) return WHY.range;
  if (typeof value === "boolean") return { name: named, version, type: "boolean", value };
  const label = trimmed(value, SCORE_CATEGORY_MAX);
  if (!label) return WHY.category;
  return { name: named, version, type: "category", label };
}
function eventOf(score) {
  const attributes = { [EVALUATION_NAME]: score.name };
  if (score.type === "number") {
    attributes[EVALUATION_VALUE] = score.value;
    if (score.range !== void 0) {
      attributes[SCORE_RANGE_MIN] = score.range[0];
      attributes[SCORE_RANGE_MAX] = score.range[1];
    }
  } else if (score.type === "boolean") {
    attributes[EVALUATION_VALUE] = score.value ? 1 : 0;
    attributes[SCORE_TYPE] = "boolean";
  } else {
    attributes[EVALUATION_LABEL] = score.label;
  }
  if (score.version !== "") attributes[SCORE_VERSION] = score.version;
  return attributes;
}
var TRACE = /^[0-9a-f]{32}$/i;
var SPAN = /^[0-9a-f]{16}$/i;
function traceHexOf(id) {
  if (typeof id !== "string" || !TRACE.test(id) || /^0+$/.test(id)) return void 0;
  return id.toLowerCase();
}
function targetOf(target) {
  const set = (value) => value !== void 0 && value !== null;
  const { traceId, spanId, sessionId } = target;
  if (set(sessionId)) {
    if (set(traceId) || set(spanId)) return void 0;
    const session = trimmed(sessionId, SESSION_ID_MAX);
    return session ? { session_id: session } : void 0;
  }
  const hex = traceHexOf(traceId);
  if (hex === void 0) return void 0;
  const ids = { trace_id: hex };
  if (!set(spanId)) return ids;
  if (typeof spanId !== "string" || !SPAN.test(spanId)) return void 0;
  ids["span_id"] = spanId.toLowerCase();
  return ids;
}
function lateItem(target, score) {
  const ids = targetOf(target);
  if (ids === void 0) return void 0;
  const item = { id: randomUUID2(), ...ids, name: score.name, data_type: score.type };
  if (score.type === "number") {
    item["value"] = score.value;
    if (score.range !== void 0) [item["range_min"], item["range_max"]] = score.range;
  } else if (score.type === "boolean") {
    item["value"] = score.value ? 1 : 0;
  } else {
    item["categories"] = [score.label];
  }
  if (score.version !== "") item["version"] = score.version;
  return JSON.stringify(
    item,
    (_key, value) => typeof value === "string" ? value.replace(LONE_SURROGATE, "\uFFFD") : value
  );
}
var TRACE_KEY = createContextKey("telmoni.trace");
var END2 = /* @__PURE__ */ Symbol("telmoni.end");
var GUARD = /* @__PURE__ */ Symbol("telmoni.guard");
function currentTrace(ctx = context.active()) {
  const found = ctx.getValue(TRACE_KEY);
  return found instanceof Trace ? found : void 0;
}
var Handle = class {
  /**
   * The OpenTelemetry context with this span current: for an application
   * without a context manager to nest its own spans under ours explicitly.
   */
  context;
  span;
  #warnOnce;
  #ended = false;
  #scores = 0;
  constructor(span, parent, owner, warnOnce) {
    this.span = span;
    this.#warnOnce = warnOnce;
    this.context = trace.setSpan(parent, span).setValue(TRACE_KEY, owner ?? this);
  }
  /**
   * Mark it failed by an error's class, a class's name or a type as text; an `Error`'s message and stack are
   * content, kept on the span for the exporter's lock.
   */
  fail(error) {
    let text3 = error ? typeOfError(error, this.#warnOnce) : "";
    if (text3 !== "") {
      text3 = cut(text3, ERROR_TYPE_MAX, "span's error type", this.#warnOnce);
      this.span.setAttribute(ERROR_TYPE, text3);
    }
    if (!(error instanceof Error)) {
      this.span.setStatus({ code: SpanStatusCode.ERROR });
      return;
    }
    const message = textOf2(error.message);
    const attributes = { [EXCEPTION_MESSAGE]: message };
    if (text3 !== "") attributes[EXCEPTION_TYPE] = text3;
    if (typeof error.stack === "string") attributes[EXCEPTION_STACKTRACE] = error.stack;
    this.span.addEvent(EXCEPTION_EVENT, attributes);
    this.span.setStatus({ code: SpanStatusCode.ERROR, message });
  }
  /** Mark it cancelled by the agent, which is neither ok nor an error. */
  cancel() {
    this.span.setAttribute(CANCELLED, true);
  }
  /** Its span's id, 16 lowercase hex digits: what the client's `score` names once it has ended. */
  get spanId() {
    return this.span.spanContext().spanId;
  }
  /**
   * Score it, timed now: a number, within `range` where given, a yes or no, or
   * a category's label. One refused, or given once it has ended, is not sent, with one warning.
   */
  score(name, value, options) {
    if (this.#ended) return refuse(this.#warnOnce, WHY.ended);
    const score = judge(name, value, options);
    if (typeof score === "string") return refuse(this.#warnOnce, score);
    if (this.#scores >= SCORES_PER_SPAN) return refuse(this.#warnOnce, WHY.full);
    this.#scores += 1;
    this.span.addEvent(EVALUATION_EVENT, eventOf(score));
  }
  /** Whether its span has ended. */
  get ended() {
    return this.#ended;
  }
  [END2](outcome2) {
    if (this.#ended) return;
    this.#ended = true;
    if (outcome2.failed) {
      if (isAbort(outcome2.error)) this.cancel();
      else this.fail(outcome2.error instanceof Error ? outcome2.error : errorType(outcome2.error));
    }
    this.span.end();
  }
};
var Parent = class extends Handle {
  #opener;
  constructor(opener, span, parent, owner) {
    super(span, parent, owner, opener.warnOnce);
    this.#opener = opener;
  }
  step(name, fn) {
    return within(this.#opener.step(this.owner, this.context, name), fn);
  }
  modelCall(model, a, b) {
    const [options, fn] = split(a, b);
    return within(this.#opener.modelCall(this.owner, this.context, model, options ?? {}), fn);
  }
  toolCall(name, a, b) {
    const [options, fn] = split(a, b);
    return within(this.#opener.toolCall(this.owner, this.context, name, options ?? {}), fn);
  }
  retrieval(source, a, b) {
    const [options, fn] = split(a, b);
    return within(this.#opener.retrieval(this.owner, this.context, source, options ?? {}), fn);
  }
};
var Trace = class extends Parent {
  /** Its trace's id, 32 lowercase hex digits: what the client's `score` names once it has ended. */
  traceId;
  agent;
  #inherited;
  #warnOnce;
  [GUARD];
  constructor(opener, span, parent, agent, inherited, guard = new Guard()) {
    super(opener, span, parent, void 0);
    this.traceId = span.spanContext().traceId;
    this.agent = agent;
    this.#inherited = { ...inherited };
    this.#warnOnce = opener.warnOnce;
    this[GUARD] = guard;
  }
  get owner() {
    return this;
  }
  /** What the agent answered: its messages. An answer given after the trace ended is not sent. */
  answered(answer) {
    if (this.ended) {
      this.#warnOnce("trace:late", "telmoni: a trace must be answered before it ends; an answer given after is not sent", {
        kind: "input"
      });
      return;
    }
    if (answer.outputMessages !== void 0) {
      this.span.setAttribute(OUTPUT_MESSAGES, asJson(answer.outputMessages));
    }
  }
  /** What every span inside the trace carries. */
  get inherited() {
    return { ...this.#inherited };
  }
  /** What the trace's model calls have cost so far in US dollars, counted as its spend cap counts them, in this process. */
  get spent() {
    return this[GUARD].spent;
  }
};
var Step = class extends Parent {
  #trace;
  constructor(opener, span, parent, owner) {
    super(opener, span, parent, owner);
    this.#trace = owner;
  }
  get owner() {
    return this.#trace;
  }
};
var ModelCall = class extends Handle {
  #warnOnce;
  #trace;
  #provider;
  #prices;
  #model;
  /** Its usage as its span holds it, each attribute as last sent. */
  #held = {};
  #counted = 0;
  constructor(span, parent, owner, warnOnce, by) {
    super(span, parent, owner, warnOnce);
    this.#warnOnce = warnOnce;
    this.#trace = owner;
    this.#provider = by.provider;
    this.#model = by.model;
    this.#prices = by.prices;
  }
  /**
   * What the model answered: its name, its tokens, and its messages. An answer
   * given after the call ended is not sent, and counts nothing.
   */
  answered(answer) {
    const named = filled(answer.responseModel, "response model", this.#warnOnce);
    const model = named === void 0 ? void 0 : cut(named, MODEL_MAX3, "response model", this.#warnOnce);
    const sent = usageOf2(answer.usage, this.#warnOnce);
    const firstToken = finiteFromZero(answer.timeToFirstToken);
    if (isSet(answer.timeToFirstToken) && firstToken === void 0) {
      this.#warnOnce(
        `call:${TIME_TO_FIRST_CHUNK}`,
        `telmoni: ${TIME_TO_FIRST_CHUNK} must be a finite number of seconds from 0; the call is sent without it`,
        { kind: "input" }
      );
    }
    if (this.ended) {
      this.#warnOnce(
        "call:late",
        "telmoni: a model call must be answered before it ends; an answer given after is not sent and counts nothing toward the trace's spend",
        { kind: "input" }
      );
      return;
    }
    if (model !== void 0) {
      this.#model = model;
      this.span.setAttribute(RESPONSE_MODEL, model);
    }
    this.span.setAttributes(sent);
    this.#held = { ...this.#held, ...sent };
    if (firstToken !== void 0) this.span.setAttribute(TIME_TO_FIRST_CHUNK, firstToken);
    if (answer.outputMessages !== void 0) {
      this.span.setAttribute(OUTPUT_MESSAGES, asJson(answer.outputMessages));
    }
    this.#count();
  }
  /** Its cost to its trace's spend, in place of what it counted before: reported, else priced, else nothing. */
  #count() {
    const held = this.#held;
    const count2 = (key) => {
      const value = held[key];
      return typeof value === "number" ? value : 0;
    };
    const tokens = {
      input: count2(INPUT_TOKENS),
      output: count2(OUTPUT_TOKENS),
      cacheRead: count2(CACHE_READ_INPUT_TOKENS),
      cacheWrite: count2(CACHE_CREATION_INPUT_TOKENS)
    };
    const reported = held[COST];
    let cost = typeof reported === "number" ? reported : priced(this.#prices, this.#provider, this.#model, tokens);
    const guard = this.#trace[GUARD];
    if (cost === void 0) {
      cost = 0;
      if (guard.capped && Object.values(tokens).some((n) => n > 0)) {
        this.#warnOnce(
          `unpriced:${this.#provider}:${this.#model}`,
          `telmoni: no price for ${this.#model || "a call with no model"} (${this.#provider || "no provider"}), which reported no cost; it counts nothing toward the trace's spend cap`,
          { kind: "input" }
        );
      }
    }
    guard.counts(this.#counted, cost);
    this.#counted = cost;
  }
};
var ToolCall = class extends Handle {
  /** What the tool returned: content, sent only when asked and allowed. */
  returned(result) {
    this.span.setAttribute(TOOL_CALL_RESULT, asJson(result));
  }
};
var Retrieval = class extends Handle {
  #warnOnce;
  /** Whether it searched a memory, whose names its finds go under. */
  #memory;
  constructor(span, parent, owner, warnOnce, memory) {
    super(span, parent, owner, warnOnce);
    this.#warnOnce = warnOnce;
    this.#memory = memory;
  }
  /** What the search found, a list: content, sent only when asked and allowed, and how many it holds, sent in every mode. */
  returned(documents) {
    if (!Array.isArray(documents)) {
      this.#warnOnce("retrieval:documents", "telmoni: a retrieval's documents must be a list; they are neither sent nor counted", {
        kind: "input"
      });
      return;
    }
    const [found, count2] = this.#memory ? [MEMORY_RECORDS, MEMORY_RECORD_COUNT] : [RETRIEVAL_DOCUMENTS, RETRIEVAL_RETURNED];
    this.span.setAttributes({ [found]: asJson(documents), [count2]: documents.length });
  }
};
function within(handle, fn) {
  let result;
  try {
    result = context.with(handle.context, fn, void 0, handle);
  } catch (error) {
    handle[END2]({ failed: true, error });
    throw error;
  }
  if (isPromiseLike2(result)) {
    return result.then(
      (value) => {
        handle[END2]({ failed: false });
        return value;
      },
      (error) => {
        handle[END2]({ failed: true, error });
        throw error;
      }
    );
  }
  handle[END2]({ failed: false });
  return result;
}
function split(a, b) {
  if (typeof a === "function") return [void 0, a];
  if (b === void 0) throw new TypeError("a callback is needed");
  return [a, b];
}
var Opener = class {
  #tracer;
  #processor;
  #ids;
  #warnOnce;
  /** The project's own prices, which the guard counts a call by first. */
  #prices;
  constructor(tracer, processor, config, ids, warnOnce) {
    this.#tracer = tracer;
    this.#processor = processor;
    this.#ids = ids;
    this.#warnOnce = warnOnce;
    this.#prices = ownRates(config.prices);
  }
  /** The client's warning, once per key, which every handle gives. */
  get warnOnce() {
    return this.#warnOnce;
  }
  trace(given, options) {
    const named = given;
    if (!isSet(named) || isBlank(textOf2(named))) {
      throw new TypeError("a trace needs its agent's name");
    }
    const agent = cut(asText(named, "trace's agent", this.#warnOnce), AGENT_MAX, "trace's agent", this.#warnOnce);
    const guard = Guard.of(options);
    const user = filled(options.userId, "user id", this.#warnOnce);
    const session = filled(options.sessionId, "session id", this.#warnOnce);
    const inherited = inheritedOf(
      agent,
      user !== void 0 && fits(user, USER_ID_MAX, "user id", "trace", this.#warnOnce) ? user : void 0,
      session !== void 0 && fits(session, SESSION_ID_MAX, "session id", "trace", this.#warnOnce) ? session : void 0
    );
    const attributes = agentAttributes(agent, inherited, tagsOf(Object.entries(options.tags ?? {}), this.#warnOnce));
    if (isSet(options.inputMessages)) {
      attributes[INPUT_MESSAGES] = asJson(options.inputMessages);
    }
    const application = context.active();
    const linked = trace.getSpanContext(application);
    const links = linked !== void 0 && isSpanContextValid(linked) ? [{ context: linked }] : [];
    const span = this.#tracer.startSpan(agentSpanName(agent), { kind: SpanKind.INTERNAL, attributes, links }, ROOT_CONTEXT);
    const openedAt = span.startTime;
    if (openedAt !== void 0) {
      const options2 = { kind: SpanKind.INTERNAL, attributes: inherited, startTime: openedAt };
      this.#tracer.startSpan(TRACE_START, options2, trace.setSpan(application, span)).end(openedAt);
    }
    return new Trace(this, span, application, agent, inherited, guard);
  }
  /**
   * A trace another service opened, continued here under the span the headers
   * named: a trace whose own span is the caller's, non-recording here, so its
   * steps and calls nest under it and carry the agent, and nothing of it is
   * sent or ended from this side.
   */
  continued(remote, given) {
    const agent = cut(given, AGENT_MAX, "trace's agent", this.#warnOnce);
    return new Trace(this, trace.wrapSpanContext(remote), context.active(), agent, inheritedOf(agent));
  }
  step(owner, parent, given) {
    owner[GUARD].opens(true);
    let name = asText(given, "step's name", this.#warnOnce);
    if (name === "") {
      this.#warnOnce("step:name", "telmoni: a step needs its name; one without is sent named step", { kind: "input" });
      name = "step";
    }
    const span = this.#start(cut(name, NAME_MAX, "step's name", this.#warnOnce), parent, owner.inherited, SpanKind.INTERNAL);
    return new Step(this, span, parent, owner);
  }
  modelCall(owner, parent, given, options) {
    owner[GUARD].opens(false);
    const asked = asText(given, "model", this.#warnOnce);
    const model = asked === "" ? "" : cut(asked, MODEL_MAX3, "model", this.#warnOnce);
    if (model === "") {
      this.#warnOnce(
        "call:model",
        "telmoni: a model call needs its model; one without is sent named by its operation alone",
        { kind: "input" }
      );
    }
    const named = filled(options.provider, "provider", this.#warnOnce);
    const provider = named === void 0 ? "" : cut(named, PROVIDER_MAX, "provider", this.#warnOnce);
    const operation = operationOf(options.operation, this.#warnOnce);
    const [prompt, promptVersion] = promptOf(options, this.#warnOnce);
    const [name, attributes] = modelCallOpening(owner.inherited, model, operation, provider, prompt, promptVersion);
    if (isSet(options.inputMessages)) {
      attributes[INPUT_MESSAGES] = asJson(options.inputMessages);
    }
    if (isSet(options.systemInstructions)) {
      attributes[SYSTEM_INSTRUCTIONS] = asJson(options.systemInstructions);
    }
    const span = this.#start(name, parent, attributes, SpanKind.CLIENT);
    return new ModelCall(span, parent, owner, this.#warnOnce, { provider, model, prices: this.#prices });
  }
  toolCall(owner, parent, given, options) {
    owner[GUARD].opens(false);
    const name = cut(asText(given, "tool's name", this.#warnOnce), NAME_MAX, "tool's name", this.#warnOnce);
    const attributes = toolAttributes(owner.inherited, name);
    if (isSet(options.arguments)) {
      attributes[TOOL_CALL_ARGUMENTS] = asJson(options.arguments);
    }
    const span = this.#start(toolSpanName(name), parent, attributes, SpanKind.INTERNAL);
    return new ToolCall(span, parent, owner, this.#warnOnce);
  }
  retrieval(owner, parent, given, options) {
    owner[GUARD].opens(false);
    const memory = Boolean(options.memory);
    const [operation, sourceKey, queryKey] = memory ? [SEARCH_MEMORY, MEMORY_STORE_ID, MEMORY_QUERY_TEXT] : [RETRIEVAL_OPERATION, DATA_SOURCE_ID, RETRIEVAL_QUERY_TEXT];
    const attributes = { ...owner.inherited, [OPERATION]: operation };
    const named = asText(given, "retrieval's source", this.#warnOnce);
    const source = isBlank(named) ? "" : cut(named, NAME_MAX, "retrieval's source", this.#warnOnce);
    if (source === "") {
      this.#warnOnce(
        "retrieval:source",
        "telmoni: a retrieval needs its source; one without is sent named by its operation alone",
        { kind: "input" }
      );
    } else {
      attributes[sourceKey] = source;
    }
    const name = memory || source === "" ? operation : `${operation} ${source}`;
    if (isSet(options.topK)) {
      const topK = whole(options.topK, 0, 2 ** 63);
      if (topK === void 0) {
        this.#warnOnce(
          `retrieval:${RETRIEVAL_TOP_K}`,
          `telmoni: ${RETRIEVAL_TOP_K} must be a whole number from 0 within 64 bits; the retrieval is sent without it`,
          { kind: "input" }
        );
      } else {
        attributes[RETRIEVAL_TOP_K] = topK;
      }
    }
    if (isSet(options.query)) attributes[queryKey] = asJson(options.query);
    const span = this.#start(name, parent, attributes, SpanKind.CLIENT);
    return new Retrieval(span, parent, owner, this.#warnOnce, memory);
  }
  /**
   * A trace that has ended, sent as the live calls would have sent it.
   *
   * It goes under the trace id the record gives, whatever context is active;
   * each span's id is derived from that id and the span's place in the record.
   * Its spans are queued whole once built, the agent's own last, and travel in
   * exports of their own, so the same record sent again is the same bytes,
   * whatever else is sent meanwhile. Throws `QueueFullError`, queuing nothing,
   * when the export queue has no room for the whole record, and
   * `ShutdownError` once the client is shut down.
   */
  record(record) {
    const agent = record.agent;
    if (typeof agent !== "string" || isBlank(agent)) {
      throw new TypeError("a trace needs its agent's name");
    }
    if ([...agent].length > AGENT_MAX) {
      throw new RangeError(`a recorded trace's agent must be up to ${AGENT_MAX} characters`);
    }
    const traceHex = traceHexOf(record.traceId);
    if (traceHex === void 0) throw new TypeError("a recorded trace's id must be 32 hex digits, not all zeros");
    check(record, "trace");
    const tags = record.tags ?? {};
    const tagged = isObject2(tags) ? Object.entries(tags) : void 0;
    if (tagged === void 0 || tagged.some(([, value]) => typeof value !== "string")) {
      throw new TypeError("a recorded trace's tags must be an object of strings");
    }
    const messages = [
      [INPUT_MESSAGES, record.inputMessages],
      [OUTPUT_MESSAGES, record.outputMessages]
    ];
    const items = read(record);
    const every = [...walk(items)];
    for (const each2 of [record, ...every]) {
      const [start, end] = [hrTimeOf(each2.start), hrTimeOf(each2.end)];
      if (!readable(start) || !readable(end)) {
        throw new RangeError("a recorded time must fall after the Unix epoch and less than 2^64 nanoseconds after it");
      }
      if (later(start, end)) throw new RangeError("a recorded span cannot end before it starts");
    }
    const inherited = inheritedOf(record.agent, record.userId, record.sessionId);
    const attributes = agentAttributes(record.agent, inherited, tagsOf(tagged, this.#warnOnce));
    for (const [key, value] of messages) {
      if (isSet(value)) attributes[key] = asJson(value);
    }
    const usages = /* @__PURE__ */ new Map();
    const operations = /* @__PURE__ */ new Map();
    const contents = /* @__PURE__ */ new Map();
    const scored = /* @__PURE__ */ new Map([[record, scoresOf(record, this.#warnOnce)]]);
    for (const each2 of every) {
      contents.set(each2, contentOf(each2));
      scored.set(each2, scoresOf(each2, this.#warnOnce));
      if (each2.type !== "model_call") continue;
      usages.set(each2, usageOf2(each2.usage, this.#warnOnce));
      operations.set(each2, operationOf(each2.operation, this.#warnOnce));
    }
    let place = 0;
    const open = (name, parent, spanAttributes, kind, at) => this.#ids.given(
      traceHex,
      spanIdAt(traceHex, place++),
      () => this.#tracer.startSpan(name, { kind, attributes: spanAttributes, startTime: hrTimeOf(at) }, parent)
    );
    const call = (item, parent) => {
      if (item.type === "model_call") {
        const operation = operations.get(item) ?? DEFAULT_MODEL_OPERATION;
        const [name, callAttributes] = modelCallOpening(inherited, item.model, operation, item.provider ?? "");
        const effort = item.reasoningEffort;
        if (effort) callAttributes[REQUEST_REASONING_LEVEL] = effort;
        Object.assign(callAttributes, usages.get(item), contents.get(item));
        close(open(name, parent, callAttributes, SpanKind.CLIENT, item.start), item, scored.get(item));
      } else {
        const callAttributes = { ...toolAttributes(inherited, item.name), ...contents.get(item) };
        close(open(toolSpanName(item.name), parent, callAttributes, SpanKind.INTERNAL, item.start), item, scored.get(item));
      }
    };
    const build = (held, parent) => {
      for (const [item, inside] of held) {
        if (item.type !== "step") {
          call(item, parent);
          continue;
        }
        const step = open(item.name, parent, { ...inherited, ...contents.get(item) }, SpanKind.INTERNAL, item.start);
        build(inside, trace.setSpan(parent, step));
        close(step, item, scored.get(item));
      }
    };
    this.#processor.record(traceHex, 1 + every.length, () => {
      const span = open(agentSpanName(record.agent), ROOT_CONTEXT, attributes, SpanKind.INTERNAL, record.start);
      build(items, trace.setSpan(ROOT_CONTEXT, span));
      close(span, record, scored.get(record));
    });
  }
  /**
   * A score of what has ended, sent to `/v1/scores`: a span of its own trace,
   * never sent as one, carries it through the export queue, so a flush or a
   * shutdown holds it as it holds spans.
   */
  score(name, value, options) {
    const score = judge(name, value, options);
    if (typeof score === "string") return refuse(this.#warnOnce, score);
    const sent = lateItem(options, score);
    if (sent === void 0) return refuse(this.#warnOnce, WHY.target);
    this.#tracer.startSpan(SCORE_SPAN, { attributes: { [SCORE_SENT]: sent } }, ROOT_CONTEXT).end();
  }
  #start(name, parent, attributes, kind) {
    return this.#tracer.startSpan(name, { kind, attributes }, parent);
  }
};
function hrTimeOf(time) {
  const ms = time instanceof Date ? time.getTime() : time;
  if (typeof ms !== "number" || !Number.isFinite(ms)) {
    throw new TypeError("a recorded time must be a Date or milliseconds since the Unix epoch");
  }
  const seconds = Math.floor(ms / 1e3);
  const nanos2 = Math.round((ms - seconds * 1e3) * 1e6);
  return nanos2 >= 1e9 ? [seconds + 1, nanos2 - 1e9] : [seconds, nanos2];
}
function later(a, b) {
  return a[0] > b[0] || a[0] === b[0] && a[1] > b[1];
}
var STEP_DEPTH_MAX = 16;
function read(record) {
  const inside = record.inside ?? [];
  if (!Array.isArray(inside)) {
    throw new TypeError("a recorded trace's inside must be an array, in the order it ran");
  }
  return readItems(inside, 1);
}
function readItems(given, depth) {
  const items = [];
  for (const item of given) {
    if (item?.type === "model_call" || item?.type === "tool_call") {
      check(item, item.type);
      items.push([item, []]);
      continue;
    }
    if (item?.type !== "step") {
      throw new TypeError("a recorded item's type must be 'step', 'model_call' or 'tool_call'");
    }
    if (depth > STEP_DEPTH_MAX) {
      throw new RangeError(`a recorded step must be nested at most ${STEP_DEPTH_MAX} deep`);
    }
    check(item, "step");
    const calls = item.calls ?? [];
    if (!Array.isArray(calls)) {
      throw new TypeError("a recorded step's calls must be an array, in the order they ran");
    }
    items.push([item, readItems(calls, depth + 1)]);
  }
  return items;
}
function* walk(items) {
  for (const [item, inside] of items) {
    yield item;
    yield* walk(inside);
  }
}
var FIELDS = {
  trace: [
    ["userId", "string", true],
    ["sessionId", "string", true]
  ],
  step: [["name", "string", false]],
  model_call: [
    ["model", "string", false],
    ["provider", "string", true],
    ["operation", "string", true],
    ["reasoningEffort", "string", true],
    ["usage", "object", true]
  ],
  tool_call: [["name", "string", false]]
};
var OUTCOME = [
  ["errorType", "string", true],
  ["cancelled", "boolean", true]
];
var CAPS = {
  trace: { userId: USER_ID_MAX, sessionId: SESSION_ID_MAX },
  step: { name: NAME_MAX },
  model_call: { model: MODEL_MAX3, provider: PROVIDER_MAX, reasoningEffort: ATTRIBUTE_VALUE_MAX },
  tool_call: { name: NAME_MAX }
};
function check(item, kind) {
  const what = kind.replace("_", " ");
  const caps = { ...CAPS[kind], errorType: ERROR_TYPE_MAX };
  const read22 = {};
  for (const [field, type, optional] of [...FIELDS[kind], ...OUTCOME]) {
    const value = Reflect.get(item, field);
    read22[field] = value;
    if (optional && (value === void 0 || value === null)) continue;
    if (!(type === "object" ? isObject2(value) : typeof value === type)) {
      const article = type === "object" ? "an" : "a";
      throw new TypeError(`a recorded ${what}'s ${field} must be ${article} ${type}`);
    }
    if (value === "" && (kind === "step" && field === "name" || field === "model")) {
      throw new TypeError(`a recorded ${what}'s ${field} cannot be empty`);
    }
    const most = caps[field];
    if (most !== void 0 && typeof value === "string" && [...value].length > most) {
      throw new RangeError(`a recorded ${what}'s ${field} must be up to ${most} characters`);
    }
  }
  const scores = Reflect.get(item, "scores");
  if (scores !== void 0 && scores !== null && !Array.isArray(scores)) {
    throw new TypeError(`a recorded ${what}'s scores must be an array`);
  }
}
function scoresOf(outcome2, warnOnce) {
  const given = outcome2.scores;
  const events = [];
  for (const each2 of Array.isArray(given) ? given : []) {
    const score = isObject2(each2) ? judge(Reflect.get(each2, "name"), Reflect.get(each2, "value"), each2) : WHY.value;
    if (typeof score === "string") refuse(warnOnce, score);
    else if (events.length >= SCORES_PER_SPAN) refuse(warnOnce, WHY.full);
    else events.push(eventOf(score));
  }
  return events;
}
function isObject2(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
function contentOf(item) {
  const fields = item.type === "model_call" ? [
    [INPUT_MESSAGES, item.inputMessages],
    [OUTPUT_MESSAGES, item.outputMessages]
  ] : item.type === "tool_call" ? [
    [TOOL_CALL_ARGUMENTS, item.arguments],
    [TOOL_CALL_RESULT, item.result]
  ] : [
    [INPUT_MESSAGES, item.inputMessages],
    [OUTPUT_MESSAGES, item.outputMessages]
  ];
  const out = {};
  for (const [key, value] of fields) {
    if (isSet(value)) out[key] = asJson(value);
  }
  return out;
}
function close(span, outcome2, scores = []) {
  for (const score of scores) span.addEvent(EVALUATION_EVENT, score, hrTimeOf(outcome2.end));
  if (outcome2.errorType) {
    span.setAttribute(ERROR_TYPE, outcome2.errorType);
    span.setStatus({ code: SpanStatusCode.ERROR });
  }
  if (outcome2.cancelled) span.setAttribute(CANCELLED, true);
  span.end(hrTimeOf(outcome2.end));
}
var USAGE_KEYS = [
  "inputTokens",
  "outputTokens",
  "cacheReadInputTokens",
  "cacheWriteInputTokens",
  "reasoningOutputTokens",
  "cost"
];
function usageOf2(usage, warnOnce) {
  const out = {};
  if (!isSet(usage)) return out;
  const given = Object(usage);
  if (!USAGE_KEYS.some((key) => key in given)) {
    warnOnce(
      "usage:foreign",
      "telmoni: a usage must be telmoni's Usage, the provider's counts copied into it; the call is sent without it",
      { kind: "input" }
    );
    return out;
  }
  for (const [key, value] of [
    [INPUT_TOKENS, usage.inputTokens],
    [OUTPUT_TOKENS, usage.outputTokens],
    [CACHE_READ_INPUT_TOKENS, usage.cacheReadInputTokens],
    [CACHE_CREATION_INPUT_TOKENS, usage.cacheWriteInputTokens],
    [REASONING_OUTPUT_TOKENS, usage.reasoningOutputTokens]
  ]) {
    if (!isSet(value)) continue;
    const count2 = whole(value, 0, 2 ** 63);
    if (count2 === void 0) {
      warnOnce(
        `usage:${key}`,
        `telmoni: ${key} must be a whole number from 0 within 64 bits; the call is sent without it`,
        { kind: "input" }
      );
    } else {
      out[key] = count2;
    }
  }
  if (isSet(usage.cost)) {
    const cost = finiteFromZero(usage.cost);
    if (cost !== void 0) {
      out[COST] = cost;
    } else {
      warnOnce(
        `usage:${COST}`,
        `telmoni: ${COST} must be a finite number of US dollars from 0; the call is sent without it`,
        { kind: "input" }
      );
    }
  }
  return out;
}
function finiteFromZero(given) {
  const number = typeof given === "bigint" || given instanceof Number ? Number(given) : given;
  return typeof number === "number" && Number.isFinite(number) && number >= 0 ? number : void 0;
}
function whole(value, least, end) {
  const number = Math.trunc(numberOf(value));
  return Number.isFinite(number) && number >= least && number < end ? number : void 0;
}
var DECIMAL = /^\s*[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?\s*$/i;
function numberOf(value) {
  if (typeof value === "number") return value;
  if (typeof value === "bigint" || value instanceof Number) return Number(value);
  return typeof value === "string" && DECIMAL.test(value) ? Number(value) : Number.NaN;
}
function inheritedOf(agent, user, session) {
  const inherited = { [AGENT2]: agent };
  if (user) inherited[USER_ID] = user;
  if (session) inherited[SESSION_ID] = session;
  return inherited;
}
function agentAttributes(agent, inherited, tags) {
  return {
    [OPERATION]: AGENT_OPERATION,
    [AGENT_NAME]: agent,
    ...inherited,
    ...tags
  };
}
function modelCallOpening(inherited, model, operation, provider, prompt = "", promptVersion = "") {
  const attributes = { ...inherited, [OPERATION]: operation };
  if (model !== "") attributes[REQUEST_MODEL] = model;
  if (provider !== "") attributes[PROVIDER2] = provider;
  if (prompt !== "") {
    attributes[PROMPT_NAME] = prompt;
    if (promptVersion !== "") attributes[PROMPT_VERSION] = promptVersion;
  }
  return [model === "" ? operation : `${operation} ${model}`, attributes];
}
function promptOf(options, warnOnce) {
  const kept = (value, what) => {
    const text3 = isSet(value) ? asText(value, what, warnOnce) : "";
    return isBlank(text3) || !fits(text3, ATTRIBUTE_VALUE_MAX, what, "call", warnOnce) ? "" : text3;
  };
  const name = kept(options.prompt, "prompt's name");
  const version = kept(options.promptVersion, "prompt's version");
  if (version === "" || name !== "") return [name, version];
  warnOnce("call:prompt_version", "telmoni: a prompt's version needs its prompt's name; the call is sent without it", {
    kind: "input"
  });
  return ["", ""];
}
function toolAttributes(inherited, name) {
  return { ...inherited, [OPERATION]: TOOL_OPERATION, [TOOL_NAME]: name };
}
function agentSpanName(agent) {
  return `${AGENT_OPERATION} ${agent}`;
}
function toolSpanName(name) {
  return `${TOOL_OPERATION} ${name}`;
}
function operationOf(given, warnOnce) {
  if (typeof given !== "string" || isBlank(given)) return DEFAULT_MODEL_OPERATION;
  if (MODEL_OPERATIONS.has(given)) return given;
  warnOnce(
    "call:operation",
    "telmoni: a model call's operation must be chat, generate_content, text_completion or embeddings, which ingest reads as a model call; it is sent as chat",
    { kind: "input" }
  );
  return DEFAULT_MODEL_OPERATION;
}
function tagsOf(given, warnOnce) {
  const kept = {};
  let count2 = 0;
  for (const [key, value] of given) {
    if (!isSet(value)) continue;
    const sent = tagValue(value);
    const length = [...key].length;
    if (length === 0 || length > TAG_KEY_MAX || shown(sent) > TAG_VALUE_MAX) {
      warnOnce(
        "trace:tag",
        "telmoni: a tag's key must be 1 to 64 characters and its value up to 256; the tag is not sent",
        { kind: "input" }
      );
    } else if (count2 === TAGS_MAX) {
      warnOnce("trace:tags", "telmoni: a trace carries up to 32 tags, the most ingest keeps; the rest are not sent", {
        kind: "input"
      });
    } else {
      kept[`${TAG_PREFIX}${key}`] = typeof sent === "string" ? asText(value, "tag", warnOnce) : sent;
      count2 += 1;
    }
  }
  return kept;
}
function tagValue(value) {
  if (typeof value === "boolean" || typeof value === "number" && Number.isFinite(value)) return value;
  return textOf2(value);
}
function shown(value) {
  if (typeof value !== "number") return [...String(value)].length;
  const [mantissa, exponent] = Math.abs(value).toExponential().split("e");
  const digits = mantissa.replace(".", "").length;
  const point = Number(exponent) + 1;
  const length = point >= digits ? point : point > 0 ? digits + 1 : 2 - point + digits;
  return length + (value < 0 ? 1 : 0);
}
function asText(value, what, warnOnce) {
  if (typeof value === "string") return value;
  warnOnce(`text:${what}`, `telmoni: a ${what} that is no string is sent as its text`, { kind: "input" });
  return textOf2(value);
}
function typeOfError(value, warnOnce) {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) return errorType(value);
  if (typeof value === "function" && value.name !== "") return value.name;
  return asText(value, "span's error type", warnOnce);
}
function cut(value, most, what, warnOnce) {
  if (value.length <= most) return value;
  const characters = [...value];
  if (characters.length <= most) return value;
  warnOnce(`cut:${what}`, `telmoni: a ${what} must be up to ${most} characters; it is sent cut to its first ${most}`, {
    kind: "input"
  });
  return characters.slice(0, most).join("");
}
function fits(value, most, what, span, warnOnce) {
  if (value.length <= most || [...value].length <= most) return true;
  warnOnce(`long:${what}`, `telmoni: a ${what} must be up to ${most} characters; the ${span} is sent without it`, {
    kind: "input"
  });
  return false;
}
function textOf2(value) {
  try {
    return String(value);
  } catch {
    return typeof value;
  }
}
function filled(value, what, warnOnce) {
  const text3 = isSet(value) ? asText(value, what, warnOnce) : "";
  return text3 === "" ? void 0 : text3;
}
function readable([seconds, nanos2]) {
  const after2 = seconds > 0 || seconds === 0 && nanos2 > 0;
  const within2 = seconds < 18446744073 || seconds === 18446744073 && nanos2 < 709551616;
  return after2 && within2;
}
function asJson(value) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, (_key, item) => typeof item === "bigint" ? String(item) : item) ?? textOf2(value);
  } catch {
    return textOf2(value);
  }
}
function isSet(value) {
  return value !== null && value !== void 0;
}
function isPromiseLike2(value) {
  return typeof value === "object" && value !== null && typeof value.then === "function";
}
var RecordingSampler = class {
  #root;
  // The api gives no way to read the application's provider's sampler, as
  // Python's does; without one given, a trace samples, as an application's
  // default ParentBased(AlwaysOn) would.
  constructor(root) {
    this.#root = root ?? new AlwaysOnSampler();
  }
  shouldSample(context3, traceId, spanName, spanKind, attributes, links) {
    const parent = trace.getSpanContext(context3);
    if (parent !== void 0 && isSpanContextValid(parent)) {
      const sampled = (parent.traceFlags & TraceFlags.SAMPLED) !== 0;
      const result2 = { decision: recording(sampled) };
      if (parent.traceState !== void 0) result2.traceState = parent.traceState;
      return result2;
    }
    const decision = this.#root.shouldSample(context3, traceId, spanName, spanKind, attributes, links);
    const result = {
      decision: recording(decision.decision === SamplingDecision2.RECORD_AND_SAMPLED)
    };
    if (decision.traceState !== void 0) result.traceState = decision.traceState;
    return result;
  }
  toString() {
    return "TelmoniRecordingSampler";
  }
};
function recording(sampled) {
  return sampled ? SamplingDecision2.RECORD_AND_SAMPLED : SamplingDecision2.RECORD;
}
var DEFAULT_ENDPOINT = "https://api.telmoni.com";
var FLUSH_MAX_MS = 2 ** 31 - 1;
function trimTail(value) {
  let end = value.length;
  while (end > 0 && (value.charAt(end - 1) === "/" || WHITE_SPACE.has(value.charAt(end - 1)))) end--;
  return value.slice(0, end);
}
function unsetIfBlank(value) {
  const trimmed22 = value === void 0 ? void 0 : trimEnds(value);
  return trimmed22 ? trimmed22 : void 0;
}
function environment() {
  return typeof process !== "undefined" ? process.env : void 0;
}
var PRINTABLE = /^[\x21-\x7e]*$/;
var NAME = /^[A-Za-z0-9._-]+$/;
var PATH = /^[A-Za-z0-9\-._~!$&'()*+,;=:@/]*$/;
var IPV6 = /^[0-9A-Fa-f:.]+$/;
var PORT = /^(:\d{0,5})?$/;
var LOOPBACK = new BlockList();
LOOPBACK.addSubnet("127.0.0.0", 8, "ipv4");
LOOPBACK.addAddress("::1", "ipv6");
function hostOf(endpoint) {
  const scheme = endpoint.indexOf("://");
  if (!PRINTABLE.test(endpoint) || scheme < 0 || !/^https?$/i.test(endpoint.slice(0, scheme))) return void 0;
  const rest = endpoint.slice(scheme + 3);
  const slash = rest.indexOf("/");
  const authority = slash < 0 ? rest : rest.slice(0, slash);
  const path = slash < 0 ? "" : rest.slice(slash + 1);
  if (!PATH.test(path) || path.split("/").some((segment) => segment === "." || segment === "..")) return void 0;
  let host;
  let port;
  if (authority.startsWith("[")) {
    const end = authority.indexOf("]") + 1;
    host = authority.slice(0, end);
    port = authority.slice(end);
    const inner = host.slice(1, -1);
    if (end === 0 || !IPV6.test(inner) || !isIPv6(inner)) return void 0;
  } else {
    const colon = authority.indexOf(":");
    host = colon < 0 ? authority : authority.slice(0, colon);
    port = colon < 0 ? "" : authority.slice(colon);
    const labels = host.replace(/\.$/, "").split(".");
    if (!NAME.test(host) || !labels.every(labelOk) || numbered(host) && !isIPv4(host)) return void 0;
  }
  return portOk(port) ? host : void 0;
}
function labelOk(label) {
  return label.length > 0 && label.length <= 63 && !label.startsWith("-") && !label.endsWith("-");
}
function portOk(port) {
  if (!PORT.test(port)) return false;
  if (port.length <= 1) return true;
  const number = Number(port.slice(1));
  return number > 0 && number <= 65535;
}
function numbered(host) {
  const last = host.replace(/\.$/, "").split(".").pop() ?? "";
  return /^\d+$/.test(last) || /^0x[0-9a-f]*$/i.test(last);
}
function isThisMachine(host) {
  if (host.startsWith("[")) return LOOPBACK.check(host.slice(1, -1), "ipv6");
  if (isIPv4(host)) return LOOPBACK.check(host, "ipv4");
  const name = host.toLowerCase();
  return name === "localhost" || name.endsWith(".localhost");
}
function bypassesProxy(endpoint) {
  const host = hostOf(endpoint);
  return host !== void 0 && isThisMachine(host);
}
function endpointOf(given) {
  const text3 = trimEnds(given ?? "");
  const scheme = text3.indexOf("://");
  if (scheme >= 0) return text3.slice(0, scheme + 3) + trimTail(text3.slice(scheme + 3));
  const endpoint = trimTail(text3);
  if (endpoint === "") return DEFAULT_ENDPOINT;
  if (/^https?$/i.test(endpoint.split(/[:/]/, 1)[0] ?? "")) return endpoint;
  const host = hostOf(`http://${endpoint}`);
  const local = host !== void 0 && isThisMachine(host);
  return `${local ? "http" : "https"}://${endpoint}`;
}
function checkEndpoint(endpoint) {
  const host = hostOf(endpoint);
  if (host === void 0) throw new TypeError("the endpoint must be an http:// or https:// URL");
  if (endpoint.slice(0, 7).toLowerCase() === "http://" && !isThisMachine(host)) {
    throw new TypeError(`refusing to send the API key over unencrypted HTTP to '${host}'; use HTTPS`);
  }
}
function resolve(config) {
  const endpoint = endpointOf(config?.endpoint);
  checkEndpoint(endpoint);
  const prices = config?.prices ?? [];
  if (!Array.isArray(prices)) throw new TypeError("prices must be an array of prices");
  const captureContent = config?.captureContent ?? false;
  if (typeof captureContent !== "boolean") throw new TypeError("captureContent must be a boolean");
  const mask = config?.mask;
  if (mask !== void 0 && typeof mask !== "function") throw new TypeError("mask must be a function");
  const env = environment();
  const scrubSecrets = config?.scrubSecrets ?? unsetIfBlank(env?.[SCRUB_SECRETS_ENV]) !== "0";
  if (typeof scrubSecrets !== "boolean") throw new TypeError("scrubSecrets must be a boolean");
  const scrubPii = config?.scrubPii ?? unsetIfBlank(env?.[SCRUB_PII_ENV]) === "1";
  if (typeof scrubPii !== "boolean") throw new TypeError("scrubPii must be a boolean");
  const resolved = {
    endpoint,
    apiKey: unsetIfBlank(config?.apiKey),
    organizationId: unsetIfBlank(config?.organizationId),
    captureContent,
    mask: config?.mask,
    scrubSecrets,
    scrubPii,
    sampler: config?.sampler,
    environment: unsetIfBlank(config?.environment),
    release: unsetIfBlank(config?.release),
    prices: Object.freeze(prices.map(checkedPrice))
  };
  Object.defineProperty(resolved, "apiKey", { enumerable: false });
  return Object.freeze(resolved);
}
var Telmoni = class _Telmoni {
  config;
  #exporter;
  #processor;
  #provider;
  #opener;
  constructor(config, hooks) {
    this.config = resolve(config);
    this.#exporter = new Exporter(this.config, {
      transport: hooks?.transport ?? (bypassesProxy(this.config.endpoint) ? directTransport : fetchTransport),
      sleep: hooks?.sleep ?? realSleep,
      warn: hooks?.warn ?? ((message) => console.warn(message))
    });
    this.#processor = new Processor(this.#exporter, hooks?.processor);
    const ids = new Ids();
    this.#provider = new BasicTracerProvider({
      resource: resourceFromAttributes({
        [DISTRO_NAME]: DISTRO,
        "telemetry.distro.version": VERSION4
      }),
      sampler: new RecordingSampler(this.config.sampler),
      spanLimits: {
        attributeCountLimit: 128,
        attributeValueLengthLimit: Infinity,
        eventCountLimit: 32,
        // One: the application's span a trace opened beside.
        linkCountLimit: 1,
        attributePerEventCountLimit: 32,
        attributePerLinkCountLimit: 0
      },
      generalLimits: { attributeCountLimit: 128, attributeValueLengthLimit: Infinity },
      idGenerator: ids,
      spanProcessors: [this.#processor]
    });
    this.#opener = new Opener(
      this.#provider.getTracer(SCOPE, VERSION4),
      this.#processor,
      this.config,
      ids,
      (key, text3, warning) => this.#exporter.warnOnce(key, text3, warning)
    );
  }
  /**
   * Initializes a Telmoni client automatically from environment variables:
   * - `TELMONI_ENDPOINT`
   * - `TELMONI_API_KEY`
   * - `TELMONI_ORG`
   * - `TELMONI_ENVIRONMENT` and `TELMONI_RELEASE`, the deployment it names
   * - `TELMONI_CAPTURE_CONTENT`, whose `1` alone sets `captureContent`
   * - `TELMONI_SCRUB_SECRETS` and `TELMONI_SCRUB_PII`, as every client whose
   *   code leaves `scrubSecrets` and `scrubPii` unset reads them
   *
   * A blank value is unset, as the CLI reads them. No `OTEL_*` variable is
   * read: the SDK's tracer provider is built part by part.
   */
  static fromEnv(hooks) {
    const env = environment();
    return new _Telmoni(
      {
        endpoint: env?.["TELMONI_ENDPOINT"],
        apiKey: env?.["TELMONI_API_KEY"],
        organizationId: env?.["TELMONI_ORG"],
        // Only 1: a 'false' or a 'no' must never let content out.
        captureContent: unsetIfBlank(env?.[CAPTURE_CONTENT_ENV]) === "1",
        environment: env?.["TELMONI_ENVIRONMENT"],
        release: env?.["TELMONI_RELEASE"]
      },
      hooks
    );
  }
  /** The project's content mode, as the last answer named it. */
  get contentMode() {
    return this.#exporter.contentMode;
  }
  trace(agent, a, b) {
    const [options, fn] = split(a, b);
    return within(this.#opener.trace(agent, options ?? {}), fn);
  }
  wrap(agent, a, b) {
    const [options, fn] = split(a, b);
    const wrapped = (...args) => this.trace(agent, options ?? {}, (opened) => fn(...args, opened));
    Object.defineProperty(wrapped, "name", { value: fn.name, configurable: true });
    return wrapped;
  }
  /**
   * Send a trace that has already ended, as the live calls would have; a record
   * ingest would refuse, or the queue has no room for, throws, sending nothing.
   */
  recordTrace(record) {
    this.#opener.record(record);
  }
  /**
   * Score what has ended — a trace, by `traceId`; one of its spans, by
   * `traceId` and the handle's `spanId`; or a session, by `sessionId` — sent
   * to `/v1/scores` with the next export. One refused is not sent, with one warning.
   */
  score(name, value, options) {
    this.#opener.score(name, value, options ?? {});
  }
  /**
   * Writes what the next service continues the trace from: the W3C `traceparent`
   * of `from`'s span, or the active context's, and the agent as a `baggage`
   * member beside the headers' own. Outside a trace it writes nothing.
   */
  inject(headers, from) {
    const ctx = from?.context ?? context.active();
    const current = currentTrace(ctx);
    if (current === void 0) return;
    const span = trace.getSpanContext(ctx);
    if (span === void 0 || !isSpanContextValid(span)) return;
    writeHeaders(headers, span, current.agent);
  }
  /**
   * The trace `headers` name, continued here: its steps and calls take the
   * caller's span as their parent and carry the caller's agent, so the trace
   * shows the work where it was asked for. Nothing ends a continued trace
   * here; the caller's own span does. Undefined for headers that name no
   * trace.
   */
  extract(headers) {
    const read22 = readHeaders(headers);
    if (read22 === void 0) return void 0;
    return this.#opener.continued(read22.spanContext, read22.agent);
  }
  /**
   * Waits for everything queued to be sent or given up: true once nothing is left to send, kept or
   * not, and at once after a shutdown; false past the timeout. A batch refused or dropped is warned of.
   */
  async flush(timeoutSeconds = 30) {
    let timer;
    const ms = timeoutSeconds > 0 ? Math.min(timeoutSeconds * 1e3, FLUSH_MAX_MS) : 0;
    const expired = new Promise((resolve22) => {
      timer = setTimeout(() => resolve22(false), ms);
    });
    try {
      return await Promise.race([this.#processor.forceFlush().then(() => true), expired]);
    } finally {
      clearTimeout(timer);
    }
  }
  /** Flush, then stop the exporter; call it before the process exits. */
  shutdown() {
    return this.#provider.shutdown();
  }
};

// src/shared/send.ts
function isDone(verdict) {
  return verdict.outcome !== "kept";
}
var FINAL_STATUSES = /* @__PURE__ */ new Set([400, 402, 413, 500]);
var FINAL_WITH_KEY = /* @__PURE__ */ new Set([...FINAL_STATUSES, 401, 403]);
var DATABASE_FAILED = "/errors/internal/database";
function undelivered(warning, final = FINAL_STATUSES) {
  const { kind, status, problemType: problemType2 } = warning;
  if (kind === "failed" || kind === "export_error" || kind === "queue_full") return true;
  return kind === "refused" && (status === void 0 || !final.has(status) || status === 500 && problemType2 === DATABASE_FAILED);
}
function judge2(heard, flushed, final = FINAL_STATUSES) {
  const warnings = heard.map(({ message }) => message);
  const lost = heard.filter(({ warning }) => undelivered(warning, final)).map(({ message }) => message);
  if (!flushed || lost.length > 0)
    return { outcome: "kept", warnings, undelivered: lost, timedOut: !flushed };
  if (heard.some(({ warning }) => warning.kind === "refused"))
    return { outcome: "refused", warnings };
  return warnings.length > 0 ? { outcome: "partial", warnings } : { outcome: "sent" };
}
function verdictLine(verdict) {
  switch (verdict.outcome) {
    case "sent":
      return void 0;
    case "partial":
      return `taken in part: ${verdict.warnings.join("; ")}`;
    case "refused":
      return `refused, not sent again: ${verdict.warnings.join("; ")}`;
    case "invalid":
      return `turn refused by the SDK: ${verdict.error}`;
    case "kept":
      return verdict.timedOut ? "not sent: the export did not finish in time" : `not sent: ${verdict.undelivered.join("; ")}`;
  }
}
var Sender = class {
  #destination;
  #final;
  #hooks;
  #first;
  constructor(destination, options) {
    this.#destination = destination;
    this.#final = options?.keyReadOnce === true ? FINAL_WITH_KEY : FINAL_STATUSES;
    this.#hooks = options?.hooks;
    this.#first = this.#client(void 0);
  }
  #client(release) {
    const heard = [];
    const { endpoint, apiKey, captureContent, scrubSecrets, scrubPii } = this.#destination;
    const telmoni = new Telmoni(
      {
        endpoint,
        apiKey,
        captureContent,
        scrubSecrets,
        scrubPii,
        ...release === void 0 ? {} : { release }
      },
      {
        ...this.#hooks,
        warn: (message, warning) => void heard.push({ message, warning }),
        // Unbounded: the SDK queues a record whole, and a turn past its own 2,048 spans would be refused on every try.
        processor: { maxQueueSize: Number.POSITIVE_INFINITY }
      }
    );
    return { telmoni, heard };
  }
  /** Sends one turn from a client of its own, `release` naming the host's version, and says what became of it. */
  async send(record, options) {
    const release = options?.release;
    const first = this.#first;
    this.#first = void 0;
    if (first !== void 0 && release !== void 0) await first.telmoni.shutdown();
    const { telmoni, heard } = first !== void 0 && release === void 0 ? first : this.#client(release);
    try {
      try {
        telmoni.recordTrace(record);
      } catch (error) {
        return { outcome: "invalid", error: error instanceof Error ? error.name : typeof error };
      }
      const flushed = await telmoni.flush(Number.POSITIVE_INFINITY);
      return judge2(heard, flushed, this.#final);
    } finally {
      await telmoni.shutdown();
    }
  }
  async close() {
    const first = this.#first;
    this.#first = void 0;
    await first?.telmoni.shutdown();
  }
};

// src/shared/settings.ts
import { createHmac } from "crypto";
import { closeSync as closeSync3, constants as constants2, fstatSync as fstatSync2, openSync as openSync3, readFileSync as readFileSync3 } from "fs";
import { isAbsolute as isAbsolute2 } from "path";
var MAX_KEY_FILE_BYTES = 64 * 1024;
var SPACE = "[\\t\\n\\v\\f\\r \\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]";
var ENDS = new RegExp(`^${SPACE}+|${SPACE}+$`, "g");
function contentSwitchOn(given) {
  return (given ?? "").replace(ENDS, "") === "1";
}
function scrubSwitchOn(given) {
  return (given ?? "").replace(ENDS, "") !== "0";
}
function trimmed2(given) {
  return typeof given === "string" && given.trim() !== "" ? given.trim() : void 0;
}
function readKeyFile(path) {
  let fd;
  try {
    fd = openSync3(path, constants2.O_RDONLY | constants2.O_NONBLOCK);
  } catch (error) {
    const code = error.code;
    if (code === "ENOENT" || code === "ENOTDIR") return void 0;
    if (code === "EISDIR") return { problem: "not a file" };
    return { problem: `unreadable (${kindOf(error)})` };
  }
  let parsed;
  try {
    const stat = fstatSync2(fd);
    if (!stat.isFile()) return { problem: "not a file" };
    if (process.platform !== "win32") {
      const uid = process.getuid?.();
      if (uid !== void 0 && stat.uid !== uid) return { problem: "owned by another user" };
      if ((stat.mode & 63) !== 0) return { problem: "open to other users; chmod 600 it" };
    }
    if (stat.size > MAX_KEY_FILE_BYTES) return { problem: "too large" };
    parsed = JSON.parse(readFileSync3(fd, "utf8"));
  } catch (error) {
    return { problem: error instanceof SyntaxError ? "not JSON" : `unreadable (${kindOf(error)})` };
  } finally {
    closeSync3(fd);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
    return { problem: "not a JSON object" };
  const fields = parsed;
  const file = {};
  for (const field of ["apiKey", "endpoint"]) {
    if (fields[field] === void 0) continue;
    const value = trimmed2(fields[field]);
    if (value === void 0) return { problem: `${field} empty or not a string` };
    file[field] = value;
  }
  for (const field of ["captureContent", "scrubSecrets", "scrubPii"]) {
    const given = fields[field];
    if (given === void 0) continue;
    if (typeof given !== "boolean") return { problem: `${field} not true or false` };
    file[field] = given;
  }
  return file;
}
function resolveSettings(options) {
  const { env } = options;
  for (const { prefix = "", switches = "sdk" } of options.envSources ?? [{}]) {
    const apiKey = trimmed2(env[`${prefix}TELMONI_API_KEY`]);
    if (apiKey === void 0) continue;
    const capture = env[`${prefix}TELMONI_CAPTURE_CONTENT`];
    const secrets = env[`${prefix}TELMONI_SCRUB_SECRETS`];
    const pii = env[`${prefix}TELMONI_SCRUB_PII`];
    const sdk = switches === "sdk";
    return {
      apiKey,
      endpoint: trimmed2(env[`${prefix}TELMONI_ENDPOINT`]),
      captureContent: sdk ? contentSwitchOn(capture) : capture === "true",
      scrubSecrets: sdk ? scrubSwitchOn(secrets) : secrets !== "false",
      scrubPii: sdk ? scrubSwitchOn(pii) : pii !== "false",
      source: { kind: "env", prefix }
    };
  }
  const settings = {
    apiKey: void 0,
    endpoint: void 0,
    captureContent: false,
    scrubSecrets: true,
    scrubPii: true,
    source: { kind: "none" }
  };
  for (const path of options.keyFiles ?? []) {
    const file = readKeyFile(path);
    if (file === void 0) continue;
    if (file.problem !== void 0)
      return { ...settings, source: { kind: "file", path }, keyFileProblem: file.problem };
    return {
      apiKey: file.apiKey,
      endpoint: file.endpoint,
      captureContent: file.captureContent === true,
      scrubSecrets: file.scrubSecrets !== false,
      scrubPii: file.scrubPii !== false,
      source: { kind: "file", path }
    };
  }
  return settings;
}
function destinationOf(settings) {
  return createHmac("sha256", settings.apiKey ?? "").update(settings.endpoint ?? "").digest("hex").slice(0, 16);
}

// src/shared/tags.ts
import {
  closeSync as closeSync4,
  constants as constants3,
  fstatSync as fstatSync3,
  lstatSync,
  openSync as openSync4,
  readFileSync as readFileSync4
} from "fs";
import { dirname, isAbsolute as isAbsolute3, join as join4, resolve as resolve2 } from "path";
var TAGS_FILE = ".telmoni-tags.json";
var MAX_BYTES = 64 * 1024;
var TAGS_MAX2 = 32;
var VALUE_MAX = 256;
var KEY = /^[A-Za-z0-9_.-]{1,64}$/;
var NOT_TEXT2 = new RegExp("[\\u0000-\\u001f\\u007f-\\u009f]|\\p{Cs}", "u");
var NOT_PLAIN = "tags file not read: not a plain file";
var TOO_LARGE = "tags file not read: past 64 KiB";
var NOT_OBJECT = "tags file not read: not a JSON object";
var UNREADABLE = "tags file not read: unreadable";
var BAD_KEY = "tag dropped: its key is not 1 to 64 letters, digits, _ . or -";
var RESERVED = "tag dropped: skills is reserved";
var BAD_VALUE = "tag dropped: its value is not text of at most 256 characters";
var TOO_MANY = "tags past 32 dropped";
var NONE = { tags: {}, problems: [] };
function notRead(problem) {
  return { tags: {}, problems: [problem] };
}
function tagsAt(folder) {
  if (!isAbsolute3(folder)) return NONE;
  for (let place = resolve2(folder); ; place = dirname(place)) {
    const path = join4(place, TAGS_FILE);
    let entry;
    try {
      entry = lstatSync(path);
    } catch (error) {
      const code = error.code;
      if (code !== "ENOENT" && code !== "ENOTDIR") return notRead(UNREADABLE);
      if (dirname(place) === place) return NONE;
      continue;
    }
    return entry.isFile() ? read2(path) : notRead(NOT_PLAIN);
  }
}
function read2(path) {
  let bytes;
  try {
    const fd = openSync4(path, constants3.O_RDONLY | constants3.O_NOFOLLOW | constants3.O_NONBLOCK);
    try {
      const stat = fstatSync3(fd);
      if (!stat.isFile()) return notRead(NOT_PLAIN);
      if (stat.size > MAX_BYTES) return notRead(TOO_LARGE);
      bytes = readFileSync4(fd);
    } finally {
      closeSync4(fd);
    }
  } catch {
    return notRead(UNREADABLE);
  }
  if (bytes.length > MAX_BYTES) return notRead(TOO_LARGE);
  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    parsed = void 0;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
    return notRead(NOT_OBJECT);
  const kept = [];
  const problems = [];
  for (const [key, value] of Object.entries(parsed)) {
    const problem = tagProblem(key, value);
    if (problem !== void 0) problems.push(problem);
    else if (kept.length === TAGS_MAX2) problems.push(TOO_MANY);
    else kept.push([key, value]);
  }
  return { tags: Object.fromEntries(kept), problems };
}
function tagProblem(key, value) {
  if (!KEY.test(key)) return BAD_KEY;
  if (key === "skills") return RESERVED;
  if (typeof value !== "string" || [...value].length > VALUE_MAX || NOT_TEXT2.test(value))
    return BAD_VALUE;
  return void 0;
}
function tagTrace(record, folder, warned, log) {
  if (folder === void 0) return;
  const { tags, problems } = tagsAt(folder);
  for (const problem of problems) {
    if (warned.has(problem)) continue;
    warned.add(problem);
    log(problem);
  }
  if (Object.keys(tags).length > 0) record.tags = tags;
}

// src/turns.ts
function cut2(rows) {
  const turns = [];
  for (const row of rows) {
    if (row.type === USER_INPUT) {
      const before = turns.at(-1);
      if (before !== void 0) before.followed = true;
      turns.push({ open: row, rows: [], followed: false });
    } else {
      turns.at(-1)?.rows.push(row);
    }
  }
  return turns;
}
function endedBy(turns, stop2) {
  const { size } = stop2;
  if (size !== void 0) return turns.findLast((turn) => turn.open.offset < size);
  return turns.findLast((turn) => turn.open.at === void 0 || turn.open.at <= stop2.at);
}
function isComplete(turn, ended, stop2) {
  return turn.followed || turn === ended && stop2.idle;
}
function after(turn) {
  return (turn.rows.at(-1) ?? turn.open).index + 1;
}

// src/worker.ts
var SENT_MAX = 500;
var PENDING_MAX = 200;
var NO_KEY = "no key: set TELMONI_API_KEY, or write ~/.gemini/config/telmoni.json";
async function work(stop2, options) {
  const dir = stateDir(options.home);
  const log = (line) => writeLog(dir, `${shortId(stop2.conversationId)} ${line}`);
  try {
    ensurePrivateDir(dir, { tighten: true });
    const settings = resolveSettings({ env: options.env, keyFiles: [keyFile(options.home)] });
    let destination;
    const took = await withLock(
      dir,
      stop2.conversationId,
      options.lockWaitMs ?? 6e4,
      async () => {
        const state = load(dir, stop2.conversationId, log);
        if (state === void 0) return;
        try {
          destination = await own(stop2, state, settings, options, dir, log);
        } finally {
          save(dir, stop2.conversationId, state);
        }
      }
    );
    if (!took) log("another hook holds the conversation: its turns wait for the next");
    if (destination !== void 0)
      await leftovers(dir, stop2.conversationId, destination, settings, options);
  } catch (error) {
    log(`fault: ${kindOf(error)}`);
  }
}
async function own(stop2, state, settings, options, dir, log) {
  const warned = new Set(state.warned);
  const once = (line) => {
    if (!warned.has(line)) log(line);
    warned.add(line);
  };
  try {
    if (settings.keyFileProblem !== void 0)
      return void once(`key file not read: ${settings.keyFileProblem}; nothing is sent`);
    if (settings.apiKey === void 0) return void once(NO_KEY);
    const destination = destinationOf(settings);
    if (state.destination !== void 0 && state.destination !== destination && state.pending.length > 0) {
      log(`${state.pending.length} kept turns dropped: the key or the endpoint changed`);
      state.pending = [];
    }
    state.destination = destination;
    await settle(stop2.transcriptPath, options.settleMs ?? 500, options.settleMaxMs ?? 3e3);
    const read3 = readTranscript(stop2.transcriptPath, { content: settings.captureContent });
    if ("problem" in read3) return void log(read3.problem);
    const turns = cut2(read3.rows);
    const ended = endedBy(turns, stop2);
    if (ended !== void 0) state.ends[String(ended.open.index)] = endingOf(stop2);
    const cursor = state.cursor ?? ended?.open.index;
    if (cursor === void 0) return void 0;
    state.cursor = cursor;
    let sender;
    try {
      sender = new Sender(sendingTo(settings), { hooks: options.hooks });
    } catch (error) {
      if (error instanceof TypeError) return void once(`endpoint refused: ${error.message}`);
      throw error;
    }
    try {
      await sendKept(state, sender, dir, stop2.conversationId, log);
      for (const turn of turns) {
        if (turn.open.index < (state.cursor ?? cursor)) continue;
        const traceId = traceIdOf(stop2.conversationId, turn.open.index);
        if (!isComplete(turn, ended, stop2)) {
          log(`held ${shortId(traceId)}: its turn is not over yet`);
          break;
        }
        state.cursor = after(turn);
        const ending = state.ends[String(turn.open.index)];
        if (state.sent.includes(traceId)) continue;
        const record = recordTurn(turn, {
          conversationId: stop2.conversationId,
          modelName: stop2.modelName,
          ending,
          content: settings.captureContent
        });
        if (record === void 0) continue;
        tagTrace(record, stop2.workspace, warned, log);
        if (state.pending.length > 0 || !await deliver(sender, record, log))
          state.pending.push(record);
        else remember(state, record.traceId);
        save(dir, stop2.conversationId, state);
      }
    } finally {
      await sender.close();
    }
    for (const key of Object.keys(state.ends)) {
      if (Number(key) < (state.cursor ?? cursor)) delete state.ends[key];
    }
    if (state.pending.length > PENDING_MAX) {
      const dropped = state.pending.length - PENDING_MAX;
      state.pending.splice(0, dropped);
      log(`${dropped} kept turns dropped, the oldest: past ${PENDING_MAX} waiting`);
    }
    return state.pending.length === 0 ? destination : void 0;
  } finally {
    state.warned = [...warned];
  }
}
function sendingTo(settings) {
  return {
    endpoint: settings.endpoint,
    apiKey: settings.apiKey ?? "",
    captureContent: settings.captureContent,
    scrubSecrets: settings.scrubSecrets,
    scrubPii: settings.scrubPii
  };
}
function endingOf(stop2) {
  const ending = { at: stop2.at };
  if (stop2.reason !== void 0) ending.reason = stop2.reason;
  if (stop2.errored) ending.errored = true;
  return ending;
}
async function deliver(sender, record, log) {
  const verdict = await sender.send(record);
  const line = verdictLine(verdict);
  const trace2 = shortId(record.traceId);
  if (!isDone(verdict)) {
    log(`kept ${trace2}, ${line ?? "not sent"}`);
    return false;
  }
  log(line === void 0 ? `sent ${trace2}` : `${trace2} ${line}`);
  return true;
}
function remember(state, traceId) {
  state.sent.push(traceId);
  if (state.sent.length > SENT_MAX) state.sent.splice(0, state.sent.length - SENT_MAX);
}
async function sendKept(state, sender, dir, id, log) {
  for (let record = state.pending[0]; record !== void 0; record = state.pending[0]) {
    if (!await deliver(sender, record, log)) return false;
    state.pending.shift();
    remember(state, record.traceId);
    save(dir, id, state);
  }
  return true;
}
async function leftovers(dir, own2, destination, settings, options) {
  for (const id of markedIds(dir, ".pending", own2)) {
    const log = (line) => writeLog(dir, `${shortId(id)} ${line}`);
    let blocked = false;
    await withLock(dir, id, 0, async () => {
      const state = load(dir, id, log);
      if (state === void 0 || state.destination !== destination) return;
      const sender = new Sender(sendingTo(settings), { hooks: options.hooks });
      try {
        blocked = !await sendKept(state, sender, dir, id, log);
      } finally {
        await sender.close();
        save(dir, id, state);
      }
    });
    if (blocked) return;
  }
}
async function settle(path, stillMs, maxMs) {
  const signature = () => {
    try {
      const { size, mtimeMs } = statSync3(path);
      return `${size}:${mtimeMs}`;
    } catch {
      return "none";
    }
  };
  const deadline = Date.now() + maxMs;
  let seen = signature();
  let since = Date.now();
  while (Date.now() < deadline) {
    await sleep2(Math.min(100, stillMs));
    const now = signature();
    if (now !== seen) {
      seen = now;
      since = Date.now();
    } else if (Date.now() - since >= stillMs) {
      return;
    }
  }
}
function load(dir, id, log) {
  let raw;
  try {
    raw = readStateFile(dir, id);
  } catch (error) {
    log(`state unreadable (${kindOf(error)}): nothing is sent until it is fixed or moved aside`);
    return void 0;
  }
  const state = parseState(raw);
  const kept = Array.isArray(raw?.pending) ? raw.pending.length : 0;
  if (kept > state.pending.length)
    log(`dropped ${kept - state.pending.length} kept in a shape no longer sent`);
  return state;
}
function isRecord2(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function parseState(raw) {
  const state = { sent: [], pending: [], ends: {}, warned: [] };
  if (raw === void 0) return state;
  if (typeof raw.cursor === "number" && Number.isSafeInteger(raw.cursor) && raw.cursor >= 0)
    state.cursor = raw.cursor;
  if (Array.isArray(raw.sent))
    state.sent = raw.sent.filter((id) => typeof id === "string").slice(-SENT_MAX);
  if (Array.isArray(raw.pending))
    state.pending = raw.pending.filter(
      (kept) => isRecord2(kept) && typeof kept.traceId === "string"
    );
  if (isRecord2(raw.ends)) {
    for (const [key, value] of Object.entries(raw.ends)) {
      if (!/^\d{1,9}$/.test(key) || !isRecord2(value) || typeof value.at !== "number") continue;
      const ending = { at: value.at };
      if (typeof value.reason === "string") ending.reason = value.reason;
      if (value.errored === true) ending.errored = true;
      state.ends[key] = ending;
    }
  }
  if (Array.isArray(raw.warned))
    state.warned = raw.warned.filter((line) => typeof line === "string");
  if (typeof raw.destination === "string") state.destination = raw.destination;
  return state;
}
function save(dir, id, state) {
  writeStateFile(dir, id, state);
  const marker = join5(dir, `${id}.pending`);
  if (state.pending.length === 0) rmSync2(marker, { force: true });
  else if (!existsSync(marker)) writeFileSync2(marker, "", { mode: 384 });
}

// src/cli/worker.ts
var text2 = "";
try {
  text2 = readFileSync5(0, "utf8");
} catch {
}
var stop = takeOver(text2);
if (stop !== void 0) await work(stop, { env: process.env });
process.exit(0);
