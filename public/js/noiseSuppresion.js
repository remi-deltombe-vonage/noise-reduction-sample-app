let createWasmMonoInstance;
{
  var Module = (() => {
    var _scriptDir = location.href;

    return function (Module) {
      Module = Module || {};

      var Module = typeof Module != 'undefined' ? Module : {};
      var readyPromiseResolve, readyPromiseReject;
      Module['ready'] = new Promise(function (resolve, reject) {
        readyPromiseResolve = resolve;
        readyPromiseReject = reject;
      });
      var moduleOverrides = Object.assign({}, Module);
      var arguments_ = [];
      var thisProgram = './this.program';
      var quit_ = (status, toThrow) => {
        throw toThrow;
      };
      var ENVIRONMENT_IS_WEB = typeof window == 'object';
      var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
      var ENVIRONMENT_IS_NODE =
        typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
      var scriptDirectory = '';
      function locateFile(path) {
        if (Module['locateFile']) {
          return Module['locateFile'](path, scriptDirectory);
        }
        return scriptDirectory + path;
      }
      var read_, readAsync, readBinary, setWindowTitle;
      if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        if (ENVIRONMENT_IS_WORKER) {
          scriptDirectory = self.location.href;
        } else if (typeof document != 'undefined' && document.currentScript) {
          scriptDirectory = document.currentScript.src;
        }
        if (_scriptDir) {
          scriptDirectory = _scriptDir;
        }
        if (scriptDirectory.indexOf('blob:') !== 0) {
          scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1);
        } else {
          scriptDirectory = '';
        }
        {
          read_ = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send(null);
            return xhr.responseText;
          };
          if (ENVIRONMENT_IS_WORKER) {
            readBinary = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              xhr.responseType = 'arraybuffer';
              xhr.send(null);
              return new Uint8Array(xhr.response);
            };
          }
          readAsync = (url, onload, onerror) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
              if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                onload(xhr.response);
                return;
              }
              onerror();
            };
            xhr.onerror = onerror;
            xhr.send(null);
          };
        }
        setWindowTitle = (title) => (document.title = title);
      } else {
      }
      var out = Module['print'] || console.log.bind(console);
      var err = Module['printErr'] || console.warn.bind(console);
      Object.assign(Module, moduleOverrides);
      moduleOverrides = null;
      if (Module['arguments']) arguments_ = Module['arguments'];
      if (Module['thisProgram']) thisProgram = Module['thisProgram'];
      if (Module['quit']) quit_ = Module['quit'];
      var tempRet0 = 0;
      var setTempRet0 = (value) => {
        tempRet0 = value;
      };
      var getTempRet0 = () => tempRet0;
      var wasmBinary;
      if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
      var noExitRuntime = Module['noExitRuntime'] || false;
      if (typeof WebAssembly != 'object') {
        abort('no native wasm support detected');
      }
      var wasmMemory;
      var ABORT = false;
      var EXITSTATUS;
      function assert(condition, text) {
        if (!condition) {
          abort(text);
        }
      }
      var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
      function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
          return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
        } else {
          var str = '';
          while (idx < endPtr) {
            var u0 = heapOrArray[idx++];
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode(((u0 & 31) << 6) | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            } else {
              u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
            }
          }
        }
        return str;
      }
      function UTF8ToString(ptr, maxBytesToRead) {
        return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
      }
      function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
        if (!(maxBytesToWrite > 0)) return 0;
        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite - 1;
        for (var i = 0; i < str.length; ++i) {
          var u = str.charCodeAt(i);
          if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
          }
          if (u <= 127) {
            if (outIdx >= endIdx) break;
            heap[outIdx++] = u;
          } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            heap[outIdx++] = 192 | (u >> 6);
            heap[outIdx++] = 128 | (u & 63);
          } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            heap[outIdx++] = 224 | (u >> 12);
            heap[outIdx++] = 128 | ((u >> 6) & 63);
            heap[outIdx++] = 128 | (u & 63);
          } else {
            if (outIdx + 3 >= endIdx) break;
            heap[outIdx++] = 240 | (u >> 18);
            heap[outIdx++] = 128 | ((u >> 12) & 63);
            heap[outIdx++] = 128 | ((u >> 6) & 63);
            heap[outIdx++] = 128 | (u & 63);
          }
        }
        heap[outIdx] = 0;
        return outIdx - startIdx;
      }
      function stringToUTF8(str, outPtr, maxBytesToWrite) {
        return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
      }
      function lengthBytesUTF8(str) {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var u = str.charCodeAt(i);
          if (u >= 55296 && u <= 57343) u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
          if (u <= 127) ++len;
          else if (u <= 2047) len += 2;
          else if (u <= 65535) len += 3;
          else len += 4;
        }
        return len;
      }
      var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;
      function UTF16ToString(ptr, maxBytesToRead) {
        var endPtr = ptr;
        var idx = endPtr >> 1;
        var maxIdx = idx + maxBytesToRead / 2;
        while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
        endPtr = idx << 1;
        if (endPtr - ptr > 32 && UTF16Decoder) {
          return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
        } else {
          var str = '';
          for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
            var codeUnit = HEAP16[(ptr + i * 2) >> 1];
            if (codeUnit == 0) break;
            str += String.fromCharCode(codeUnit);
          }
          return str;
        }
      }
      function stringToUTF16(str, outPtr, maxBytesToWrite) {
        if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 2) return 0;
        maxBytesToWrite -= 2;
        var startPtr = outPtr;
        var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
        for (var i = 0; i < numCharsToWrite; ++i) {
          var codeUnit = str.charCodeAt(i);
          HEAP16[outPtr >> 1] = codeUnit;
          outPtr += 2;
        }
        HEAP16[outPtr >> 1] = 0;
        return outPtr - startPtr;
      }
      function lengthBytesUTF16(str) {
        return str.length * 2;
      }
      function UTF32ToString(ptr, maxBytesToRead) {
        var i = 0;
        var str = '';
        while (!(i >= maxBytesToRead / 4)) {
          var utf32 = HEAP32[(ptr + i * 4) >> 2];
          if (utf32 == 0) break;
          ++i;
          if (utf32 >= 65536) {
            var ch = utf32 - 65536;
            str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
          } else {
            str += String.fromCharCode(utf32);
          }
        }
        return str;
      }
      function stringToUTF32(str, outPtr, maxBytesToWrite) {
        if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 4) return 0;
        var startPtr = outPtr;
        var endPtr = startPtr + maxBytesToWrite - 4;
        for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) {
            var trailSurrogate = str.charCodeAt(++i);
            codeUnit = (65536 + ((codeUnit & 1023) << 10)) | (trailSurrogate & 1023);
          }
          HEAP32[outPtr >> 2] = codeUnit;
          outPtr += 4;
          if (outPtr + 4 > endPtr) break;
        }
        HEAP32[outPtr >> 2] = 0;
        return outPtr - startPtr;
      }
      function lengthBytesUTF32(str) {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
          len += 4;
        }
        return len;
      }
      function writeArrayToMemory(array, buffer) {
        HEAP8.set(array, buffer);
      }
      function writeAsciiToMemory(str, buffer, dontAddNull) {
        for (var i = 0; i < str.length; ++i) {
          HEAP8[buffer++ >> 0] = str.charCodeAt(i);
        }
        if (!dontAddNull) HEAP8[buffer >> 0] = 0;
      }
      var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
      function updateGlobalBufferAndViews(buf) {
        buffer = buf;
        Module['HEAP8'] = HEAP8 = new Int8Array(buf);
        Module['HEAP16'] = HEAP16 = new Int16Array(buf);
        Module['HEAP32'] = HEAP32 = new Int32Array(buf);
        Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
        Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
        Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
        Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
        Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
      }
      var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;
      var wasmTable;
      var __ATPRERUN__ = [];
      var __ATINIT__ = [];
      var __ATEXIT__ = [];
      var __ATPOSTRUN__ = [];
      var runtimeInitialized = false;
      var runtimeExited = false;
      var runtimeKeepaliveCounter = 0;
      function keepRuntimeAlive() {
        return noExitRuntime || runtimeKeepaliveCounter > 0;
      }
      function preRun() {
        if (Module['preRun']) {
          if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
          while (Module['preRun'].length) {
            addOnPreRun(Module['preRun'].shift());
          }
        }
        callRuntimeCallbacks(__ATPRERUN__);
      }
      function initRuntime() {
        runtimeInitialized = true;
        if (!Module['noFSInit'] && !FS.init.initialized) FS.init();
        FS.ignorePermissions = false;
        TTY.init();
        callRuntimeCallbacks(__ATINIT__);
      }
      function exitRuntime() {
        ___funcs_on_exit();
        callRuntimeCallbacks(__ATEXIT__);
        FS.quit();
        TTY.shutdown();
        runtimeExited = true;
      }
      function postRun() {
        if (Module['postRun']) {
          if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
          while (Module['postRun'].length) {
            addOnPostRun(Module['postRun'].shift());
          }
        }
        callRuntimeCallbacks(__ATPOSTRUN__);
      }
      function addOnPreRun(cb) {
        __ATPRERUN__.unshift(cb);
      }
      function addOnInit(cb) {
        __ATINIT__.unshift(cb);
      }
      function addOnPostRun(cb) {
        __ATPOSTRUN__.unshift(cb);
      }
      var runDependencies = 0;
      var runDependencyWatcher = null;
      var dependenciesFulfilled = null;
      function getUniqueRunDependency(id) {
        return id;
      }
      function addRunDependency(id) {
        runDependencies++;
        if (Module['monitorRunDependencies']) {
          Module['monitorRunDependencies'](runDependencies);
        }
      }
      function removeRunDependency(id) {
        runDependencies--;
        if (Module['monitorRunDependencies']) {
          Module['monitorRunDependencies'](runDependencies);
        }
        if (runDependencies == 0) {
          if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null;
          }
          if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
          }
        }
      }
      function abort(what) {
        {
          if (Module['onAbort']) {
            Module['onAbort'](what);
          }
        }
        what = 'Aborted(' + what + ')';
        err(what);
        ABORT = true;
        EXITSTATUS = 1;
        what += '. Build with -sASSERTIONS for more info.';
        var e = new WebAssembly.RuntimeError(what);
        readyPromiseReject(e);
        throw e;
      }
      var dataURIPrefix = 'data:application/octet-stream;base64,';
      function isDataURI(filename) {
        return filename.startsWith(dataURIPrefix);
      }
      var wasmBinaryFile;
      if (Module['locateFile']) {
        wasmBinaryFile = 'main-bin-mono.wasm';
        if (!isDataURI(wasmBinaryFile)) {
          wasmBinaryFile = locateFile(wasmBinaryFile);
        }
      } else {
        wasmBinaryFile = new URL('main-bin-mono.wasm', location.href).toString();
      }
      function getBinary(file) {
        try {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) {
            return readBinary(file);
          } else {
            throw 'both async and sync fetching of the wasm failed';
          }
        } catch (err) {
          abort(err);
        }
      }
      function getBinaryPromise() {
        if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
          if (typeof fetch == 'function') {
            return fetch(wasmBinaryFile, { credentials: 'same-origin' })
              .then(function (response) {
                if (!response['ok']) {
                  throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
                }
                return response['arrayBuffer']();
              })
              .catch(function () {
                return getBinary(wasmBinaryFile);
              });
          }
        }
        return Promise.resolve().then(function () {
          return getBinary(wasmBinaryFile);
        });
      }
      function createWasm() {
        var info = { a: asmLibraryArg };
        function receiveInstance(instance, module) {
          var exports = instance.exports;
          Module['asm'] = exports;
          wasmMemory = Module['asm']['Na'];
          updateGlobalBufferAndViews(wasmMemory.buffer);
          wasmTable = Module['asm']['Pa'];
          addOnInit(Module['asm']['Oa']);
          removeRunDependency('wasm-instantiate');
        }
        addRunDependency('wasm-instantiate');
        function receiveInstantiationResult(result) {
          receiveInstance(result['instance']);
        }
        function instantiateArrayBuffer(receiver) {
          return getBinaryPromise()
            .then(function (binary) {
              return WebAssembly.instantiate(binary, info);
            })
            .then(function (instance) {
              return instance;
            })
            .then(receiver, function (reason) {
              err('failed to asynchronously prepare wasm: ' + reason);
              abort(reason);
            });
        }
        function instantiateAsync() {
          if (
            !wasmBinary &&
            typeof WebAssembly.instantiateStreaming == 'function' &&
            !isDataURI(wasmBinaryFile) &&
            typeof fetch == 'function'
          ) {
            return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
              var result = WebAssembly.instantiateStreaming(response, info);
              return result.then(receiveInstantiationResult, function (reason) {
                err('wasm streaming compile failed: ' + reason);
                err('falling back to ArrayBuffer instantiation');
                return instantiateArrayBuffer(receiveInstantiationResult);
              });
            });
          } else {
            return instantiateArrayBuffer(receiveInstantiationResult);
          }
        }
        if (Module['instantiateWasm']) {
          try {
            var exports = Module['instantiateWasm'](info, receiveInstance);
            return exports;
          } catch (e) {
            err('Module.instantiateWasm callback failed with error: ' + e);
            return false;
          }
        }
        instantiateAsync().catch(readyPromiseReject);
        return {};
      }
      var tempDouble;
      var tempI64;
      function callRuntimeCallbacks(callbacks) {
        while (callbacks.length > 0) {
          var callback = callbacks.shift();
          if (typeof callback == 'function') {
            callback(Module);
            continue;
          }
          var func = callback.func;
          if (typeof func == 'number') {
            if (callback.arg === undefined) {
              getWasmTableEntry(func)();
            } else {
              getWasmTableEntry(func)(callback.arg);
            }
          } else {
            func(callback.arg === undefined ? null : callback.arg);
          }
        }
      }
      var wasmTableMirror = [];
      function getWasmTableEntry(funcPtr) {
        var func = wasmTableMirror[funcPtr];
        if (!func) {
          if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
          wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
        }
        return func;
      }
      function ___assert_fail(condition, filename, line, func) {
        abort(
          'Assertion failed: ' +
            UTF8ToString(condition) +
            ', at: ' +
            [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']
        );
      }
      function ___cxa_allocate_exception(size) {
        return _malloc(size + 24) + 24;
      }
      var exceptionCaught = [];
      function exception_addRef(info) {
        info.add_ref();
      }
      var uncaughtExceptionCount = 0;
      function ___cxa_begin_catch(ptr) {
        var info = new ExceptionInfo(ptr);
        if (!info.get_caught()) {
          info.set_caught(true);
          uncaughtExceptionCount--;
        }
        info.set_rethrown(false);
        exceptionCaught.push(info);
        exception_addRef(info);
        return info.get_exception_ptr();
      }
      function ___cxa_current_primary_exception() {
        if (!exceptionCaught.length) {
          return 0;
        }
        var info = exceptionCaught[exceptionCaught.length - 1];
        exception_addRef(info);
        return info.excPtr;
      }
      function ExceptionInfo(excPtr) {
        this.excPtr = excPtr;
        this.ptr = excPtr - 24;
        this.set_type = function (type) {
          HEAPU32[(this.ptr + 4) >> 2] = type;
        };
        this.get_type = function () {
          return HEAPU32[(this.ptr + 4) >> 2];
        };
        this.set_destructor = function (destructor) {
          HEAPU32[(this.ptr + 8) >> 2] = destructor;
        };
        this.get_destructor = function () {
          return HEAPU32[(this.ptr + 8) >> 2];
        };
        this.set_refcount = function (refcount) {
          HEAP32[this.ptr >> 2] = refcount;
        };
        this.set_caught = function (caught) {
          caught = caught ? 1 : 0;
          HEAP8[(this.ptr + 12) >> 0] = caught;
        };
        this.get_caught = function () {
          return HEAP8[(this.ptr + 12) >> 0] != 0;
        };
        this.set_rethrown = function (rethrown) {
          rethrown = rethrown ? 1 : 0;
          HEAP8[(this.ptr + 13) >> 0] = rethrown;
        };
        this.get_rethrown = function () {
          return HEAP8[(this.ptr + 13) >> 0] != 0;
        };
        this.init = function (type, destructor) {
          this.set_adjusted_ptr(0);
          this.set_type(type);
          this.set_destructor(destructor);
          this.set_refcount(0);
          this.set_caught(false);
          this.set_rethrown(false);
        };
        this.add_ref = function () {
          var value = HEAP32[this.ptr >> 2];
          HEAP32[this.ptr >> 2] = value + 1;
        };
        this.release_ref = function () {
          var prev = HEAP32[this.ptr >> 2];
          HEAP32[this.ptr >> 2] = prev - 1;
          return prev === 1;
        };
        this.set_adjusted_ptr = function (adjustedPtr) {
          HEAPU32[(this.ptr + 16) >> 2] = adjustedPtr;
        };
        this.get_adjusted_ptr = function () {
          return HEAPU32[(this.ptr + 16) >> 2];
        };
        this.get_exception_ptr = function () {
          var isPointer = ___cxa_is_pointer_type(this.get_type());
          if (isPointer) {
            return HEAPU32[this.excPtr >> 2];
          }
          var adjusted = this.get_adjusted_ptr();
          if (adjusted !== 0) return adjusted;
          return this.excPtr;
        };
      }
      function ___cxa_free_exception(ptr) {
        return _free(new ExceptionInfo(ptr).ptr);
      }
      function exception_decRef(info) {
        if (info.release_ref() && !info.get_rethrown()) {
          var destructor = info.get_destructor();
          if (destructor) {
            getWasmTableEntry(destructor)(info.excPtr);
          }
          ___cxa_free_exception(info.excPtr);
        }
      }
      function ___cxa_decrement_exception_refcount(ptr) {
        if (!ptr) return;
        exception_decRef(new ExceptionInfo(ptr));
      }
      var exceptionLast = 0;
      function ___cxa_end_catch() {
        _setThrew(0);
        var info = exceptionCaught.pop();
        exception_decRef(info);
        exceptionLast = 0;
      }
      function ___resumeException(ptr) {
        if (!exceptionLast) {
          exceptionLast = ptr;
        }
        throw ptr;
      }
      function ___cxa_find_matching_catch_2() {
        var thrown = exceptionLast;
        if (!thrown) {
          setTempRet0(0);
          return 0;
        }
        var info = new ExceptionInfo(thrown);
        info.set_adjusted_ptr(thrown);
        var thrownType = info.get_type();
        if (!thrownType) {
          setTempRet0(0);
          return thrown;
        }
        var typeArray = Array.prototype.slice.call(arguments);
        for (var i = 0; i < typeArray.length; i++) {
          var caughtType = typeArray[i];
          if (caughtType === 0 || caughtType === thrownType) {
            break;
          }
          var adjusted_ptr_addr = info.ptr + 16;
          if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
            setTempRet0(caughtType);
            return thrown;
          }
        }
        setTempRet0(thrownType);
        return thrown;
      }
      function ___cxa_find_matching_catch_3() {
        var thrown = exceptionLast;
        if (!thrown) {
          setTempRet0(0);
          return 0;
        }
        var info = new ExceptionInfo(thrown);
        info.set_adjusted_ptr(thrown);
        var thrownType = info.get_type();
        if (!thrownType) {
          setTempRet0(0);
          return thrown;
        }
        var typeArray = Array.prototype.slice.call(arguments);
        for (var i = 0; i < typeArray.length; i++) {
          var caughtType = typeArray[i];
          if (caughtType === 0 || caughtType === thrownType) {
            break;
          }
          var adjusted_ptr_addr = info.ptr + 16;
          if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
            setTempRet0(caughtType);
            return thrown;
          }
        }
        setTempRet0(thrownType);
        return thrown;
      }
      function ___cxa_increment_exception_refcount(ptr) {
        if (!ptr) return;
        exception_addRef(new ExceptionInfo(ptr));
      }
      function ___cxa_rethrow() {
        var info = exceptionCaught.pop();
        if (!info) {
          abort('no exception to throw');
        }
        var ptr = info.excPtr;
        if (!info.get_rethrown()) {
          exceptionCaught.push(info);
          info.set_rethrown(true);
          info.set_caught(false);
          uncaughtExceptionCount++;
        }
        exceptionLast = ptr;
        throw ptr;
      }
      function ___cxa_rethrow_primary_exception(ptr) {
        if (!ptr) return;
        var info = new ExceptionInfo(ptr);
        exceptionCaught.push(info);
        info.set_rethrown(true);
        ___cxa_rethrow();
      }
      function ___cxa_throw(ptr, type, destructor) {
        var info = new ExceptionInfo(ptr);
        info.init(type, destructor);
        exceptionLast = ptr;
        uncaughtExceptionCount++;
        throw ptr;
      }
      function ___cxa_uncaught_exceptions() {
        return uncaughtExceptionCount;
      }
      var PATH = {
        isAbs: (path) => path.charAt(0) === '/',
        splitPath: (filename) => {
          var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
          return splitPathRe.exec(filename).slice(1);
        },
        normalizeArray: (parts, allowAboveRoot) => {
          var up = 0;
          for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === '.') {
              parts.splice(i, 1);
            } else if (last === '..') {
              parts.splice(i, 1);
              up++;
            } else if (up) {
              parts.splice(i, 1);
              up--;
            }
          }
          if (allowAboveRoot) {
            for (; up; up--) {
              parts.unshift('..');
            }
          }
          return parts;
        },
        normalize: (path) => {
          var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === '/';
          path = PATH.normalizeArray(
            path.split('/').filter((p) => !!p),
            !isAbsolute
          ).join('/');
          if (!path && !isAbsolute) {
            path = '.';
          }
          if (path && trailingSlash) {
            path += '/';
          }
          return (isAbsolute ? '/' : '') + path;
        },
        dirname: (path) => {
          var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
          if (!root && !dir) {
            return '.';
          }
          if (dir) {
            dir = dir.substr(0, dir.length - 1);
          }
          return root + dir;
        },
        basename: (path) => {
          if (path === '/') return '/';
          path = PATH.normalize(path);
          path = path.replace(/\/$/, '');
          var lastSlash = path.lastIndexOf('/');
          if (lastSlash === -1) return path;
          return path.substr(lastSlash + 1);
        },
        join: function () {
          var paths = Array.prototype.slice.call(arguments, 0);
          return PATH.normalize(paths.join('/'));
        },
        join2: (l, r) => {
          return PATH.normalize(l + '/' + r);
        },
      };
      function getRandomDevice() {
        if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
          var randomBuffer = new Uint8Array(1);
          return function () {
            crypto.getRandomValues(randomBuffer);
            return randomBuffer[0];
          };
        } else
          return function () {
            abort('randomDevice');
          };
      }
      var PATH_FS = {
        resolve: function () {
          var resolvedPath = '',
            resolvedAbsolute = false;
          for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path != 'string') {
              throw new TypeError('Arguments to path.resolve must be strings');
            } else if (!path) {
              return '';
            }
            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = PATH.isAbs(path);
          }
          resolvedPath = PATH.normalizeArray(
            resolvedPath.split('/').filter((p) => !!p),
            !resolvedAbsolute
          ).join('/');
          return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
        },
        relative: (from, to) => {
          from = PATH_FS.resolve(from).substr(1);
          to = PATH_FS.resolve(to).substr(1);
          function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
              if (arr[start] !== '') break;
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
              if (arr[end] !== '') break;
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1);
          }
          var fromParts = trim(from.split('/'));
          var toParts = trim(to.split('/'));
          var length = Math.min(fromParts.length, toParts.length);
          var samePartsLength = length;
          for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
              samePartsLength = i;
              break;
            }
          }
          var outputParts = [];
          for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push('..');
          }
          outputParts = outputParts.concat(toParts.slice(samePartsLength));
          return outputParts.join('/');
        },
      };
      var TTY = {
        ttys: [],
        init: function () {},
        shutdown: function () {},
        register: function (dev, ops) {
          TTY.ttys[dev] = { input: [], output: [], ops: ops };
          FS.registerDevice(dev, TTY.stream_ops);
        },
        stream_ops: {
          open: function (stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
              throw new FS.ErrnoError(43);
            }
            stream.tty = tty;
            stream.seekable = false;
          },
          close: function (stream) {
            stream.tty.ops.flush(stream.tty);
          },
          flush: function (stream) {
            stream.tty.ops.flush(stream.tty);
          },
          read: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
              throw new FS.ErrnoError(60);
            }
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = stream.tty.ops.get_char(stream.tty);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset + i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
              throw new FS.ErrnoError(60);
            }
            try {
              for (var i = 0; i < length; i++) {
                stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
              }
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          },
        },
        default_tty_ops: {
          get_char: function (tty) {
            if (!tty.input.length) {
              var result = null;
              if (typeof window != 'undefined' && typeof window.prompt == 'function') {
                result = window.prompt('Input: ');
                if (result !== null) {
                  result += '\n';
                }
              } else if (typeof readline == 'function') {
                result = readline();
                if (result !== null) {
                  result += '\n';
                }
              }
              if (!result) {
                return null;
              }
              tty.input = intArrayFromString(result, true);
            }
            return tty.input.shift();
          },
          put_char: function (tty, val) {
            if (val === null || val === 10) {
              out(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },
          flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
              out(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          },
        },
        default_tty1_ops: {
          put_char: function (tty, val) {
            if (val === null || val === 10) {
              err(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },
          flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
              err(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          },
        },
      };
      function zeroMemory(address, size) {
        HEAPU8.fill(0, address, address + size);
      }
      function alignMemory(size, alignment) {
        return Math.ceil(size / alignment) * alignment;
      }
      function mmapAlloc(size) {
        size = alignMemory(size, 65536);
        var ptr = _emscripten_builtin_memalign(65536, size);
        if (!ptr) return 0;
        zeroMemory(ptr, size);
        return ptr;
      }
      var MEMFS = {
        ops_table: null,
        mount: function (mount) {
          return MEMFS.createNode(null, '/', 16384 | 511, 0);
        },
        createNode: function (parent, name, mode, dev) {
          if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(63);
          }
          if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
              dir: {
                node: {
                  getattr: MEMFS.node_ops.getattr,
                  setattr: MEMFS.node_ops.setattr,
                  lookup: MEMFS.node_ops.lookup,
                  mknod: MEMFS.node_ops.mknod,
                  rename: MEMFS.node_ops.rename,
                  unlink: MEMFS.node_ops.unlink,
                  rmdir: MEMFS.node_ops.rmdir,
                  readdir: MEMFS.node_ops.readdir,
                  symlink: MEMFS.node_ops.symlink,
                },
                stream: { llseek: MEMFS.stream_ops.llseek },
              },
              file: {
                node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
                stream: {
                  llseek: MEMFS.stream_ops.llseek,
                  read: MEMFS.stream_ops.read,
                  write: MEMFS.stream_ops.write,
                  allocate: MEMFS.stream_ops.allocate,
                  mmap: MEMFS.stream_ops.mmap,
                  msync: MEMFS.stream_ops.msync,
                },
              },
              link: {
                node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink },
                stream: {},
              },
              chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops },
            };
          }
          var node = FS.createNode(parent, name, mode, dev);
          if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {};
          } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null;
          } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream;
          } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream;
          }
          node.timestamp = Date.now();
          if (parent) {
            parent.contents[name] = node;
            parent.timestamp = node.timestamp;
          }
          return node;
        },
        getFileDataAsTypedArray: function (node) {
          if (!node.contents) return new Uint8Array(0);
          if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
          return new Uint8Array(node.contents);
        },
        expandFileStorage: function (node, newCapacity) {
          var prevCapacity = node.contents ? node.contents.length : 0;
          if (prevCapacity >= newCapacity) return;
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity);
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
        },
        resizeFileStorage: function (node, newSize) {
          if (node.usedBytes == newSize) return;
          if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0;
          } else {
            var oldContents = node.contents;
            node.contents = new Uint8Array(newSize);
            if (oldContents) {
              node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
            }
            node.usedBytes = newSize;
          }
        },
        node_ops: {
          getattr: function (node) {
            var attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
              attr.size = 4096;
            } else if (FS.isFile(node.mode)) {
              attr.size = node.usedBytes;
            } else if (FS.isLink(node.mode)) {
              attr.size = node.link.length;
            } else {
              attr.size = 0;
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr;
          },
          setattr: function (node, attr) {
            if (attr.mode !== undefined) {
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              node.timestamp = attr.timestamp;
            }
            if (attr.size !== undefined) {
              MEMFS.resizeFileStorage(node, attr.size);
            }
          },
          lookup: function (parent, name) {
            throw FS.genericErrors[44];
          },
          mknod: function (parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev);
          },
          rename: function (old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
              var new_node;
              try {
                new_node = FS.lookupNode(new_dir, new_name);
              } catch (e) {}
              if (new_node) {
                for (var i in new_node.contents) {
                  throw new FS.ErrnoError(55);
                }
              }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.parent.timestamp = Date.now();
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            new_dir.timestamp = old_node.parent.timestamp;
            old_node.parent = new_dir;
          },
          unlink: function (parent, name) {
            delete parent.contents[name];
            parent.timestamp = Date.now();
          },
          rmdir: function (parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
              throw new FS.ErrnoError(55);
            }
            delete parent.contents[name];
            parent.timestamp = Date.now();
          },
          readdir: function (node) {
            var entries = ['.', '..'];
            for (var key in node.contents) {
              if (!node.contents.hasOwnProperty(key)) {
                continue;
              }
              entries.push(key);
            }
            return entries;
          },
          symlink: function (parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node;
          },
          readlink: function (node) {
            if (!FS.isLink(node.mode)) {
              throw new FS.ErrnoError(28);
            }
            return node.link;
          },
        },
        stream_ops: {
          read: function (stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= stream.node.usedBytes) return 0;
            var size = Math.min(stream.node.usedBytes - position, length);
            if (size > 8 && contents.subarray) {
              buffer.set(contents.subarray(position, position + size), offset);
            } else {
              for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
            }
            return size;
          },
          write: function (stream, buffer, offset, length, position, canOwn) {
            if (buffer.buffer === HEAP8.buffer) {
              canOwn = false;
            }
            if (!length) return 0;
            var node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
              if (canOwn) {
                node.contents = buffer.subarray(offset, offset + length);
                node.usedBytes = length;
                return length;
              } else if (node.usedBytes === 0 && position === 0) {
                node.contents = buffer.slice(offset, offset + length);
                node.usedBytes = length;
                return length;
              } else if (position + length <= node.usedBytes) {
                node.contents.set(buffer.subarray(offset, offset + length), position);
                return length;
              }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray) {
              node.contents.set(buffer.subarray(offset, offset + length), position);
            } else {
              for (var i = 0; i < length; i++) {
                node.contents[position + i] = buffer[offset + i];
              }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length;
          },
          llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
              position += stream.position;
            } else if (whence === 2) {
              if (FS.isFile(stream.node.mode)) {
                position += stream.node.usedBytes;
              }
            }
            if (position < 0) {
              throw new FS.ErrnoError(28);
            }
            return position;
          },
          allocate: function (stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
          },
          mmap: function (stream, address, length, position, prot, flags) {
            if (address !== 0) {
              throw new FS.ErrnoError(28);
            }
            if (!FS.isFile(stream.node.mode)) {
              throw new FS.ErrnoError(43);
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && contents.buffer === buffer) {
              allocated = false;
              ptr = contents.byteOffset;
            } else {
              if (position > 0 || position + length < contents.length) {
                if (contents.subarray) {
                  contents = contents.subarray(position, position + length);
                } else {
                  contents = Array.prototype.slice.call(contents, position, position + length);
                }
              }
              allocated = true;
              ptr = mmapAlloc(length);
              if (!ptr) {
                throw new FS.ErrnoError(48);
              }
              HEAP8.set(contents, ptr);
            }
            return { ptr: ptr, allocated: allocated };
          },
          msync: function (stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
              throw new FS.ErrnoError(43);
            }
            if (mmapFlags & 2) {
              return 0;
            }
            var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0;
          },
        },
      };
      function asyncLoad(url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
        readAsync(
          url,
          function (arrayBuffer) {
            assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
            onload(new Uint8Array(arrayBuffer));
            if (dep) removeRunDependency(dep);
          },
          function (event) {
            if (onerror) {
              onerror();
            } else {
              throw 'Loading data file "' + url + '" failed.';
            }
          }
        );
        if (dep) addRunDependency(dep);
      }
      var FS = {
        root: null,
        mounts: [],
        devices: {},
        streams: [],
        nextInode: 1,
        nameTable: null,
        currentPath: '/',
        initialized: false,
        ignorePermissions: true,
        ErrnoError: null,
        genericErrors: {},
        filesystems: null,
        syncFSRequests: 0,
        lookupPath: (path, opts = {}) => {
          path = PATH_FS.resolve(FS.cwd(), path);
          if (!path) return { path: '', node: null };
          var defaults = { follow_mount: true, recurse_count: 0 };
          opts = Object.assign(defaults, opts);
          if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32);
          }
          var parts = PATH.normalizeArray(
            path.split('/').filter((p) => !!p),
            false
          );
          var current = FS.root;
          var current_path = '/';
          for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
              break;
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
              if (!islast || (islast && opts.follow_mount)) {
                current = current.mounted.root;
              }
            }
            if (!islast || opts.follow) {
              var count = 0;
              while (FS.isLink(current.mode)) {
                var link = FS.readlink(current_path);
                current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
                current = lookup.node;
                if (count++ > 40) {
                  throw new FS.ErrnoError(32);
                }
              }
            }
          }
          return { path: current_path, node: current };
        },
        getPath: (node) => {
          var path;
          while (true) {
            if (FS.isRoot(node)) {
              var mount = node.mount.mountpoint;
              if (!path) return mount;
              return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path;
            }
            path = path ? node.name + '/' + path : node.name;
            node = node.parent;
          }
        },
        hashName: (parentid, name) => {
          var hash = 0;
          for (var i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
          }
          return ((parentid + hash) >>> 0) % FS.nameTable.length;
        },
        hashAddNode: (node) => {
          var hash = FS.hashName(node.parent.id, node.name);
          node.name_next = FS.nameTable[hash];
          FS.nameTable[hash] = node;
        },
        hashRemoveNode: (node) => {
          var hash = FS.hashName(node.parent.id, node.name);
          if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next;
          } else {
            var current = FS.nameTable[hash];
            while (current) {
              if (current.name_next === node) {
                current.name_next = node.name_next;
                break;
              }
              current = current.name_next;
            }
          }
        },
        lookupNode: (parent, name) => {
          var errCode = FS.mayLookup(parent);
          if (errCode) {
            throw new FS.ErrnoError(errCode, parent);
          }
          var hash = FS.hashName(parent.id, name);
          for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
              return node;
            }
          }
          return FS.lookup(parent, name);
        },
        createNode: (parent, name, mode, rdev) => {
          var node = new FS.FSNode(parent, name, mode, rdev);
          FS.hashAddNode(node);
          return node;
        },
        destroyNode: (node) => {
          FS.hashRemoveNode(node);
        },
        isRoot: (node) => {
          return node === node.parent;
        },
        isMountpoint: (node) => {
          return !!node.mounted;
        },
        isFile: (mode) => {
          return (mode & 61440) === 32768;
        },
        isDir: (mode) => {
          return (mode & 61440) === 16384;
        },
        isLink: (mode) => {
          return (mode & 61440) === 40960;
        },
        isChrdev: (mode) => {
          return (mode & 61440) === 8192;
        },
        isBlkdev: (mode) => {
          return (mode & 61440) === 24576;
        },
        isFIFO: (mode) => {
          return (mode & 61440) === 4096;
        },
        isSocket: (mode) => {
          return (mode & 49152) === 49152;
        },
        flagModes: { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 },
        modeStringToFlags: (str) => {
          var flags = FS.flagModes[str];
          if (typeof flags == 'undefined') {
            throw new Error('Unknown file open mode: ' + str);
          }
          return flags;
        },
        flagsToPermissionString: (flag) => {
          var perms = ['r', 'w', 'rw'][flag & 3];
          if (flag & 512) {
            perms += 'w';
          }
          return perms;
        },
        nodePermissions: (node, perms) => {
          if (FS.ignorePermissions) {
            return 0;
          }
          if (perms.includes('r') && !(node.mode & 292)) {
            return 2;
          } else if (perms.includes('w') && !(node.mode & 146)) {
            return 2;
          } else if (perms.includes('x') && !(node.mode & 73)) {
            return 2;
          }
          return 0;
        },
        mayLookup: (dir) => {
          var errCode = FS.nodePermissions(dir, 'x');
          if (errCode) return errCode;
          if (!dir.node_ops.lookup) return 2;
          return 0;
        },
        mayCreate: (dir, name) => {
          try {
            var node = FS.lookupNode(dir, name);
            return 20;
          } catch (e) {}
          return FS.nodePermissions(dir, 'wx');
        },
        mayDelete: (dir, name, isdir) => {
          var node;
          try {
            node = FS.lookupNode(dir, name);
          } catch (e) {
            return e.errno;
          }
          var errCode = FS.nodePermissions(dir, 'wx');
          if (errCode) {
            return errCode;
          }
          if (isdir) {
            if (!FS.isDir(node.mode)) {
              return 54;
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
              return 10;
            }
          } else {
            if (FS.isDir(node.mode)) {
              return 31;
            }
          }
          return 0;
        },
        mayOpen: (node, flags) => {
          if (!node) {
            return 44;
          }
          if (FS.isLink(node.mode)) {
            return 32;
          } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
              return 31;
            }
          }
          return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
        },
        MAX_OPEN_FDS: 4096,
        nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
          for (var fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
              return fd;
            }
          }
          throw new FS.ErrnoError(33);
        },
        getStream: (fd) => FS.streams[fd],
        createStream: (stream, fd_start, fd_end) => {
          if (!FS.FSStream) {
            FS.FSStream = function () {
              this.shared = {};
            };
            FS.FSStream.prototype = {
              object: {
                get: function () {
                  return this.node;
                },
                set: function (val) {
                  this.node = val;
                },
              },
              isRead: {
                get: function () {
                  return (this.flags & 2097155) !== 1;
                },
              },
              isWrite: {
                get: function () {
                  return (this.flags & 2097155) !== 0;
                },
              },
              isAppend: {
                get: function () {
                  return this.flags & 1024;
                },
              },
              flags: {
                get: function () {
                  return this.shared.flags;
                },
                set: function (val) {
                  this.shared.flags = val;
                },
              },
              position: {
                get function() {
                  return this.shared.position;
                },
                set: function (val) {
                  this.shared.position = val;
                },
              },
            };
          }
          stream = Object.assign(new FS.FSStream(), stream);
          var fd = FS.nextfd(fd_start, fd_end);
          stream.fd = fd;
          FS.streams[fd] = stream;
          return stream;
        },
        closeStream: (fd) => {
          FS.streams[fd] = null;
        },
        chrdev_stream_ops: {
          open: (stream) => {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
              stream.stream_ops.open(stream);
            }
          },
          llseek: () => {
            throw new FS.ErrnoError(70);
          },
        },
        major: (dev) => dev >> 8,
        minor: (dev) => dev & 255,
        makedev: (ma, mi) => (ma << 8) | mi,
        registerDevice: (dev, ops) => {
          FS.devices[dev] = { stream_ops: ops };
        },
        getDevice: (dev) => FS.devices[dev],
        getMounts: (mount) => {
          var mounts = [];
          var check = [mount];
          while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts);
          }
          return mounts;
        },
        syncfs: (populate, callback) => {
          if (typeof populate == 'function') {
            callback = populate;
            populate = false;
          }
          FS.syncFSRequests++;
          if (FS.syncFSRequests > 1) {
            err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
          }
          var mounts = FS.getMounts(FS.root.mount);
          var completed = 0;
          function doCallback(errCode) {
            FS.syncFSRequests--;
            return callback(errCode);
          }
          function done(errCode) {
            if (errCode) {
              if (!done.errored) {
                done.errored = true;
                return doCallback(errCode);
              }
              return;
            }
            if (++completed >= mounts.length) {
              doCallback(null);
            }
          }
          mounts.forEach((mount) => {
            if (!mount.type.syncfs) {
              return done(null);
            }
            mount.type.syncfs(mount, populate, done);
          });
        },
        mount: (type, opts, mountpoint) => {
          var root = mountpoint === '/';
          var pseudo = !mountpoint;
          var node;
          if (root && FS.root) {
            throw new FS.ErrnoError(10);
          } else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
              throw new FS.ErrnoError(10);
            }
            if (!FS.isDir(node.mode)) {
              throw new FS.ErrnoError(54);
            }
          }
          var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] };
          var mountRoot = type.mount(mount);
          mountRoot.mount = mount;
          mount.root = mountRoot;
          if (root) {
            FS.root = mountRoot;
          } else if (node) {
            node.mounted = mount;
            if (node.mount) {
              node.mount.mounts.push(mount);
            }
          }
          return mountRoot;
        },
        unmount: (mountpoint) => {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
          if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(28);
          }
          var node = lookup.node;
          var mount = node.mounted;
          var mounts = FS.getMounts(mount);
          Object.keys(FS.nameTable).forEach((hash) => {
            var current = FS.nameTable[hash];
            while (current) {
              var next = current.name_next;
              if (mounts.includes(current.mount)) {
                FS.destroyNode(current);
              }
              current = next;
            }
          });
          node.mounted = null;
          var idx = node.mount.mounts.indexOf(mount);
          node.mount.mounts.splice(idx, 1);
        },
        lookup: (parent, name) => {
          return parent.node_ops.lookup(parent, name);
        },
        mknod: (path, mode, dev) => {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          var name = PATH.basename(path);
          if (!name || name === '.' || name === '..') {
            throw new FS.ErrnoError(28);
          }
          var errCode = FS.mayCreate(parent, name);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(63);
          }
          return parent.node_ops.mknod(parent, name, mode, dev);
        },
        create: (path, mode) => {
          mode = mode !== undefined ? mode : 438;
          mode &= 4095;
          mode |= 32768;
          return FS.mknod(path, mode, 0);
        },
        mkdir: (path, mode) => {
          mode = mode !== undefined ? mode : 511;
          mode &= 511 | 512;
          mode |= 16384;
          return FS.mknod(path, mode, 0);
        },
        mkdirTree: (path, mode) => {
          var dirs = path.split('/');
          var d = '';
          for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) continue;
            d += '/' + dirs[i];
            try {
              FS.mkdir(d, mode);
            } catch (e) {
              if (e.errno != 20) throw e;
            }
          }
        },
        mkdev: (path, mode, dev) => {
          if (typeof dev == 'undefined') {
            dev = mode;
            mode = 438;
          }
          mode |= 8192;
          return FS.mknod(path, mode, dev);
        },
        symlink: (oldpath, newpath) => {
          if (!PATH_FS.resolve(oldpath)) {
            throw new FS.ErrnoError(44);
          }
          var lookup = FS.lookupPath(newpath, { parent: true });
          var parent = lookup.node;
          if (!parent) {
            throw new FS.ErrnoError(44);
          }
          var newname = PATH.basename(newpath);
          var errCode = FS.mayCreate(parent, newname);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(63);
          }
          return parent.node_ops.symlink(parent, newname, oldpath);
        },
        rename: (old_path, new_path) => {
          var old_dirname = PATH.dirname(old_path);
          var new_dirname = PATH.dirname(new_path);
          var old_name = PATH.basename(old_path);
          var new_name = PATH.basename(new_path);
          var lookup, old_dir, new_dir;
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
          if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
          if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(75);
          }
          var old_node = FS.lookupNode(old_dir, old_name);
          var relative = PATH_FS.relative(old_path, new_dirname);
          if (relative.charAt(0) !== '.') {
            throw new FS.ErrnoError(28);
          }
          relative = PATH_FS.relative(new_path, old_dirname);
          if (relative.charAt(0) !== '.') {
            throw new FS.ErrnoError(55);
          }
          var new_node;
          try {
            new_node = FS.lookupNode(new_dir, new_name);
          } catch (e) {}
          if (old_node === new_node) {
            return;
          }
          var isdir = FS.isDir(old_node.mode);
          var errCode = FS.mayDelete(old_dir, old_name, isdir);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
            throw new FS.ErrnoError(10);
          }
          if (new_dir !== old_dir) {
            errCode = FS.nodePermissions(old_dir, 'w');
            if (errCode) {
              throw new FS.ErrnoError(errCode);
            }
          }
          FS.hashRemoveNode(old_node);
          try {
            old_dir.node_ops.rename(old_node, new_dir, new_name);
          } catch (e) {
            throw e;
          } finally {
            FS.hashAddNode(old_node);
          }
        },
        rmdir: (path) => {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          var name = PATH.basename(path);
          var node = FS.lookupNode(parent, name);
          var errCode = FS.mayDelete(parent, name, true);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
          parent.node_ops.rmdir(parent, name);
          FS.destroyNode(node);
        },
        readdir: (path) => {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54);
          }
          return node.node_ops.readdir(node);
        },
        unlink: (path) => {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          if (!parent) {
            throw new FS.ErrnoError(44);
          }
          var name = PATH.basename(path);
          var node = FS.lookupNode(parent, name);
          var errCode = FS.mayDelete(parent, name, false);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
          parent.node_ops.unlink(parent, name);
          FS.destroyNode(node);
        },
        readlink: (path) => {
          var lookup = FS.lookupPath(path);
          var link = lookup.node;
          if (!link) {
            throw new FS.ErrnoError(44);
          }
          if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(28);
          }
          return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
        },
        stat: (path, dontFollow) => {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          var node = lookup.node;
          if (!node) {
            throw new FS.ErrnoError(44);
          }
          if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(63);
          }
          return node.node_ops.getattr(node);
        },
        lstat: (path) => {
          return FS.stat(path, true);
        },
        chmod: (path, mode, dontFollow) => {
          var node;
          if (typeof path == 'string') {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
          }
          node.node_ops.setattr(node, { mode: (mode & 4095) | (node.mode & ~4095), timestamp: Date.now() });
        },
        lchmod: (path, mode) => {
          FS.chmod(path, mode, true);
        },
        fchmod: (fd, mode) => {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          FS.chmod(stream.node, mode);
        },
        chown: (path, uid, gid, dontFollow) => {
          var node;
          if (typeof path == 'string') {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
          }
          node.node_ops.setattr(node, { timestamp: Date.now() });
        },
        lchown: (path, uid, gid) => {
          FS.chown(path, uid, gid, true);
        },
        fchown: (fd, uid, gid) => {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          FS.chown(stream.node, uid, gid);
        },
        truncate: (path, len) => {
          if (len < 0) {
            throw new FS.ErrnoError(28);
          }
          var node;
          if (typeof path == 'string') {
            var lookup = FS.lookupPath(path, { follow: true });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(31);
          }
          if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          var errCode = FS.nodePermissions(node, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
        },
        ftruncate: (fd, len) => {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28);
          }
          FS.truncate(stream.node, len);
        },
        utime: (path, atime, mtime) => {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
        },
        open: (path, flags, mode) => {
          if (path === '') {
            throw new FS.ErrnoError(44);
          }
          flags = typeof flags == 'string' ? FS.modeStringToFlags(flags) : flags;
          mode = typeof mode == 'undefined' ? 438 : mode;
          if (flags & 64) {
            mode = (mode & 4095) | 32768;
          } else {
            mode = 0;
          }
          var node;
          if (typeof path == 'object') {
            node = path;
          } else {
            path = PATH.normalize(path);
            try {
              var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
              node = lookup.node;
            } catch (e) {}
          }
          var created = false;
          if (flags & 64) {
            if (node) {
              if (flags & 128) {
                throw new FS.ErrnoError(20);
              }
            } else {
              node = FS.mknod(path, mode, 0);
              created = true;
            }
          }
          if (!node) {
            throw new FS.ErrnoError(44);
          }
          if (FS.isChrdev(node.mode)) {
            flags &= ~512;
          }
          if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
          if (!created) {
            var errCode = FS.mayOpen(node, flags);
            if (errCode) {
              throw new FS.ErrnoError(errCode);
            }
          }
          if (flags & 512 && !created) {
            FS.truncate(node, 0);
          }
          flags &= ~(128 | 512 | 131072);
          var stream = FS.createStream({
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: false,
          });
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
          if (Module['logReadFiles'] && !(flags & 1)) {
            if (!FS.readFiles) FS.readFiles = {};
            if (!(path in FS.readFiles)) {
              FS.readFiles[path] = 1;
            }
          }
          return stream;
        },
        close: (stream) => {
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if (stream.getdents) stream.getdents = null;
          try {
            if (stream.stream_ops.close) {
              stream.stream_ops.close(stream);
            }
          } catch (e) {
            throw e;
          } finally {
            FS.closeStream(stream.fd);
          }
          stream.fd = null;
        },
        isClosed: (stream) => {
          return stream.fd === null;
        },
        llseek: (stream, offset, whence) => {
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(70);
          }
          if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(28);
          }
          stream.position = stream.stream_ops.llseek(stream, offset, whence);
          stream.ungotten = [];
          return stream.position;
        },
        read: (stream, buffer, offset, length, position) => {
          if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
          }
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(8);
          }
          if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
          }
          if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(28);
          }
          var seeking = typeof position != 'undefined';
          if (!seeking) {
            position = stream.position;
          } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
          }
          var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
          if (!seeking) stream.position += bytesRead;
          return bytesRead;
        },
        write: (stream, buffer, offset, length, position, canOwn) => {
          if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
          }
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
          }
          if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
          }
          if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(28);
          }
          if (stream.seekable && stream.flags & 1024) {
            FS.llseek(stream, 0, 2);
          }
          var seeking = typeof position != 'undefined';
          if (!seeking) {
            position = stream.position;
          } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
          }
          var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
          if (!seeking) stream.position += bytesWritten;
          return bytesWritten;
        },
        allocate: (stream, offset, length) => {
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(28);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
          }
          if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(138);
          }
          stream.stream_ops.allocate(stream, offset, length);
        },
        mmap: (stream, address, length, position, prot, flags) => {
          if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(2);
          }
          if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2);
          }
          if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43);
          }
          return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
        },
        msync: (stream, buffer, offset, length, mmapFlags) => {
          if (!stream || !stream.stream_ops.msync) {
            return 0;
          }
          return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
        },
        munmap: (stream) => 0,
        ioctl: (stream, cmd, arg) => {
          if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59);
          }
          return stream.stream_ops.ioctl(stream, cmd, arg);
        },
        readFile: (path, opts = {}) => {
          opts.flags = opts.flags || 0;
          opts.encoding = opts.encoding || 'binary';
          if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
            throw new Error('Invalid encoding type "' + opts.encoding + '"');
          }
          var ret;
          var stream = FS.open(path, opts.flags);
          var stat = FS.stat(path);
          var length = stat.size;
          var buf = new Uint8Array(length);
          FS.read(stream, buf, 0, length, 0);
          if (opts.encoding === 'utf8') {
            ret = UTF8ArrayToString(buf, 0);
          } else if (opts.encoding === 'binary') {
            ret = buf;
          }
          FS.close(stream);
          return ret;
        },
        writeFile: (path, data, opts = {}) => {
          opts.flags = opts.flags || 577;
          var stream = FS.open(path, opts.flags, opts.mode);
          if (typeof data == 'string') {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
          } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
          } else {
            throw new Error('Unsupported data type');
          }
          FS.close(stream);
        },
        cwd: () => FS.currentPath,
        chdir: (path) => {
          var lookup = FS.lookupPath(path, { follow: true });
          if (lookup.node === null) {
            throw new FS.ErrnoError(44);
          }
          if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(54);
          }
          var errCode = FS.nodePermissions(lookup.node, 'x');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          FS.currentPath = lookup.path;
        },
        createDefaultDirectories: () => {
          FS.mkdir('/tmp');
          FS.mkdir('/home');
          FS.mkdir('/home/web_user');
        },
        createDefaultDevices: () => {
          FS.mkdir('/dev');
          FS.registerDevice(FS.makedev(1, 3), { read: () => 0, write: (stream, buffer, offset, length, pos) => length });
          FS.mkdev('/dev/null', FS.makedev(1, 3));
          TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
          TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
          FS.mkdev('/dev/tty', FS.makedev(5, 0));
          FS.mkdev('/dev/tty1', FS.makedev(6, 0));
          var random_device = getRandomDevice();
          FS.createDevice('/dev', 'random', random_device);
          FS.createDevice('/dev', 'urandom', random_device);
          FS.mkdir('/dev/shm');
          FS.mkdir('/dev/shm/tmp');
        },
        createSpecialDirectories: () => {
          FS.mkdir('/proc');
          var proc_self = FS.mkdir('/proc/self');
          FS.mkdir('/proc/self/fd');
          FS.mount(
            {
              mount: () => {
                var node = FS.createNode(proc_self, 'fd', 16384 | 511, 73);
                node.node_ops = {
                  lookup: (parent, name) => {
                    var fd = +name;
                    var stream = FS.getStream(fd);
                    if (!stream) throw new FS.ErrnoError(8);
                    var ret = { parent: null, mount: { mountpoint: 'fake' }, node_ops: { readlink: () => stream.path } };
                    ret.parent = ret;
                    return ret;
                  },
                };
                return node;
              },
            },
            {},
            '/proc/self/fd'
          );
        },
        createStandardStreams: () => {
          if (Module['stdin']) {
            FS.createDevice('/dev', 'stdin', Module['stdin']);
          } else {
            FS.symlink('/dev/tty', '/dev/stdin');
          }
          if (Module['stdout']) {
            FS.createDevice('/dev', 'stdout', null, Module['stdout']);
          } else {
            FS.symlink('/dev/tty', '/dev/stdout');
          }
          if (Module['stderr']) {
            FS.createDevice('/dev', 'stderr', null, Module['stderr']);
          } else {
            FS.symlink('/dev/tty1', '/dev/stderr');
          }
          var stdin = FS.open('/dev/stdin', 0);
          var stdout = FS.open('/dev/stdout', 1);
          var stderr = FS.open('/dev/stderr', 1);
        },
        ensureErrnoError: () => {
          if (FS.ErrnoError) return;
          FS.ErrnoError = function ErrnoError(errno, node) {
            this.node = node;
            this.setErrno = function (errno) {
              this.errno = errno;
            };
            this.setErrno(errno);
            this.message = 'FS error';
          };
          FS.ErrnoError.prototype = new Error();
          FS.ErrnoError.prototype.constructor = FS.ErrnoError;
          [44].forEach((code) => {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = '<generic error, no stack>';
          });
        },
        staticInit: () => {
          FS.ensureErrnoError();
          FS.nameTable = new Array(4096);
          FS.mount(MEMFS, {}, '/');
          FS.createDefaultDirectories();
          FS.createDefaultDevices();
          FS.createSpecialDirectories();
          FS.filesystems = { MEMFS: MEMFS };
        },
        init: (input, output, error) => {
          FS.init.initialized = true;
          FS.ensureErrnoError();
          Module['stdin'] = input || Module['stdin'];
          Module['stdout'] = output || Module['stdout'];
          Module['stderr'] = error || Module['stderr'];
          FS.createStandardStreams();
        },
        quit: () => {
          FS.init.initialized = false;
          ___stdio_exit();
          for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
              continue;
            }
            FS.close(stream);
          }
        },
        getMode: (canRead, canWrite) => {
          var mode = 0;
          if (canRead) mode |= 292 | 73;
          if (canWrite) mode |= 146;
          return mode;
        },
        findObject: (path, dontResolveLastLink) => {
          var ret = FS.analyzePath(path, dontResolveLastLink);
          if (ret.exists) {
            return ret.object;
          } else {
            return null;
          }
        },
        analyzePath: (path, dontResolveLastLink) => {
          try {
            var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            path = lookup.path;
          } catch (e) {}
          var ret = {
            isRoot: false,
            exists: false,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: false,
            parentPath: null,
            parentObject: null,
          };
          try {
            var lookup = FS.lookupPath(path, { parent: true });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === '/';
          } catch (e) {
            ret.error = e.errno;
          }
          return ret;
        },
        createPath: (parent, path, canRead, canWrite) => {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          var parts = path.split('/').reverse();
          while (parts.length) {
            var part = parts.pop();
            if (!part) continue;
            var current = PATH.join2(parent, part);
            try {
              FS.mkdir(current);
            } catch (e) {}
            parent = current;
          }
          return current;
        },
        createFile: (parent, name, properties, canRead, canWrite) => {
          var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(canRead, canWrite);
          return FS.create(path, mode);
        },
        createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
          var path = name;
          if (parent) {
            parent = typeof parent == 'string' ? parent : FS.getPath(parent);
            path = name ? PATH.join2(parent, name) : parent;
          }
          var mode = FS.getMode(canRead, canWrite);
          var node = FS.create(path, mode);
          if (data) {
            if (typeof data == 'string') {
              var arr = new Array(data.length);
              for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
              data = arr;
            }
            FS.chmod(node, mode | 146);
            var stream = FS.open(node, 577);
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode);
          }
          return node;
        },
        createDevice: (parent, name, input, output) => {
          var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(!!input, !!output);
          if (!FS.createDevice.major) FS.createDevice.major = 64;
          var dev = FS.makedev(FS.createDevice.major++, 0);
          FS.registerDevice(dev, {
            open: (stream) => {
              stream.seekable = false;
            },
            close: (stream) => {
              if (output && output.buffer && output.buffer.length) {
                output(10);
              }
            },
            read: (stream, buffer, offset, length, pos) => {
              var bytesRead = 0;
              for (var i = 0; i < length; i++) {
                var result;
                try {
                  result = input();
                } catch (e) {
                  throw new FS.ErrnoError(29);
                }
                if (result === undefined && bytesRead === 0) {
                  throw new FS.ErrnoError(6);
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset + i] = result;
              }
              if (bytesRead) {
                stream.node.timestamp = Date.now();
              }
              return bytesRead;
            },
            write: (stream, buffer, offset, length, pos) => {
              for (var i = 0; i < length; i++) {
                try {
                  output(buffer[offset + i]);
                } catch (e) {
                  throw new FS.ErrnoError(29);
                }
              }
              if (length) {
                stream.node.timestamp = Date.now();
              }
              return i;
            },
          });
          return FS.mkdev(path, mode, dev);
        },
        forceLoadFile: (obj) => {
          if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
          if (typeof XMLHttpRequest != 'undefined') {
            throw new Error(
              'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
            );
          } else if (read_) {
            try {
              obj.contents = intArrayFromString(read_(obj.url), true);
              obj.usedBytes = obj.contents.length;
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
          } else {
            throw new Error('Cannot load without read() or XMLHttpRequest.');
          }
        },
        createLazyFile: (parent, name, url, canRead, canWrite) => {
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = [];
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length - 1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = (idx / this.chunkSize) | 0;
            return this.getter(chunkNum)[chunkOffset];
          };
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          };
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
              throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
            var datalength = Number(xhr.getResponseHeader('Content-length'));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes';
            var usesGzip = (header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip';
            var chunkSize = 1024 * 1024;
            if (!hasByteServing) chunkSize = datalength;
            var doXHR = (from, to) => {
              if (from > to) throw new Error('invalid range (' + from + ', ' + to + ') or no bytes requested!');
              if (to > datalength - 1) throw new Error('only ' + datalength + ' bytes available! programmer error!');
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to);
              xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
              xhr.send(null);
              if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
                throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            };
            var lazyArray = this;
            lazyArray.setDataGetter((chunkNum) => {
              var start = chunkNum * chunkSize;
              var end = (chunkNum + 1) * chunkSize - 1;
              end = Math.min(end, datalength - 1);
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
              return lazyArray.chunks[chunkNum];
            });
            if (usesGzip || !datalength) {
              chunkSize = datalength = 1;
              datalength = this.getter(0).length;
              chunkSize = datalength;
              out('LazyFiles on gzip forces download of the whole file when length is accessed');
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
          };
          if (typeof XMLHttpRequest != 'undefined') {
            if (!ENVIRONMENT_IS_WORKER)
              throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
            var lazyArray = new LazyUint8Array();
            Object.defineProperties(lazyArray, {
              length: {
                get: function () {
                  if (!this.lengthKnown) {
                    this.cacheLength();
                  }
                  return this._length;
                },
              },
              chunkSize: {
                get: function () {
                  if (!this.lengthKnown) {
                    this.cacheLength();
                  }
                  return this._chunkSize;
                },
              },
            });
            var properties = { isDevice: false, contents: lazyArray };
          } else {
            var properties = { isDevice: false, url: url };
          }
          var node = FS.createFile(parent, name, properties, canRead, canWrite);
          if (properties.contents) {
            node.contents = properties.contents;
          } else if (properties.url) {
            node.contents = null;
            node.url = properties.url;
          }
          Object.defineProperties(node, {
            usedBytes: {
              get: function () {
                return this.contents.length;
              },
            },
          });
          var stream_ops = {};
          var keys = Object.keys(node.stream_ops);
          keys.forEach((key) => {
            var fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
              FS.forceLoadFile(node);
              return fn.apply(null, arguments);
            };
          });
          stream_ops.read = (stream, buffer, offset, length, position) => {
            FS.forceLoadFile(node);
            var contents = stream.node.contents;
            if (position >= contents.length) return 0;
            var size = Math.min(contents.length - position, length);
            if (contents.slice) {
              for (var i = 0; i < size; i++) {
                buffer[offset + i] = contents[position + i];
              }
            } else {
              for (var i = 0; i < size; i++) {
                buffer[offset + i] = contents.get(position + i);
              }
            }
            return size;
          };
          node.stream_ops = stream_ops;
          return node;
        },
        createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
          var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
          var dep = getUniqueRunDependency('cp ' + fullname);
          function processData(byteArray) {
            function finish(byteArray) {
              if (preFinish) preFinish();
              if (!dontCreateFile) {
                FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
              }
              if (onload) onload();
              removeRunDependency(dep);
            }
            if (
              Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
                if (onerror) onerror();
                removeRunDependency(dep);
              })
            ) {
              return;
            }
            finish(byteArray);
          }
          addRunDependency(dep);
          if (typeof url == 'string') {
            asyncLoad(url, (byteArray) => processData(byteArray), onerror);
          } else {
            processData(url);
          }
        },
        indexedDB: () => {
          return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        },
        DB_NAME: () => {
          return 'EM_FS_' + window.location.pathname;
        },
        DB_VERSION: 20,
        DB_STORE_NAME: 'FILE_DATA',
        saveFilesToDB: (paths, onload, onerror) => {
          onload = onload || (() => {});
          onerror = onerror || (() => {});
          var indexedDB = FS.indexedDB();
          try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
          } catch (e) {
            return onerror(e);
          }
          openRequest.onupgradeneeded = () => {
            out('creating db');
            var db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME);
          };
          openRequest.onsuccess = () => {
            var db = openRequest.result;
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
              fail = 0,
              total = paths.length;
            function finish() {
              if (fail == 0) onload();
              else onerror();
            }
            paths.forEach((path) => {
              var putRequest = files.put(FS.analyzePath(path).object.contents, path);
              putRequest.onsuccess = () => {
                ok++;
                if (ok + fail == total) finish();
              };
              putRequest.onerror = () => {
                fail++;
                if (ok + fail == total) finish();
              };
            });
            transaction.onerror = onerror;
          };
          openRequest.onerror = onerror;
        },
        loadFilesFromDB: (paths, onload, onerror) => {
          onload = onload || (() => {});
          onerror = onerror || (() => {});
          var indexedDB = FS.indexedDB();
          try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
          } catch (e) {
            return onerror(e);
          }
          openRequest.onupgradeneeded = onerror;
          openRequest.onsuccess = () => {
            var db = openRequest.result;
            try {
              var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
            } catch (e) {
              onerror(e);
              return;
            }
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
              fail = 0,
              total = paths.length;
            function finish() {
              if (fail == 0) onload();
              else onerror();
            }
            paths.forEach((path) => {
              var getRequest = files.get(path);
              getRequest.onsuccess = () => {
                if (FS.analyzePath(path).exists) {
                  FS.unlink(path);
                }
                FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                ok++;
                if (ok + fail == total) finish();
              };
              getRequest.onerror = () => {
                fail++;
                if (ok + fail == total) finish();
              };
            });
            transaction.onerror = onerror;
          };
          openRequest.onerror = onerror;
        },
      };
      var SYSCALLS = {
        DEFAULT_POLLMASK: 5,
        calculateAt: function (dirfd, path, allowEmpty) {
          if (PATH.isAbs(path)) {
            return path;
          }
          var dir;
          if (dirfd === -100) {
            dir = FS.cwd();
          } else {
            var dirstream = FS.getStream(dirfd);
            if (!dirstream) throw new FS.ErrnoError(8);
            dir = dirstream.path;
          }
          if (path.length == 0) {
            if (!allowEmpty) {
              throw new FS.ErrnoError(44);
            }
            return dir;
          }
          return PATH.join2(dir, path);
        },
        doStat: function (func, path, buf) {
          try {
            var stat = func(path);
          } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
              return -54;
            }
            throw e;
          }
          HEAP32[buf >> 2] = stat.dev;
          HEAP32[(buf + 4) >> 2] = 0;
          HEAP32[(buf + 8) >> 2] = stat.ino;
          HEAP32[(buf + 12) >> 2] = stat.mode;
          HEAP32[(buf + 16) >> 2] = stat.nlink;
          HEAP32[(buf + 20) >> 2] = stat.uid;
          HEAP32[(buf + 24) >> 2] = stat.gid;
          HEAP32[(buf + 28) >> 2] = stat.rdev;
          HEAP32[(buf + 32) >> 2] = 0;
          (tempI64 = [
            stat.size >>> 0,
            ((tempDouble = stat.size),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 40) >> 2] = tempI64[0]),
            (HEAP32[(buf + 44) >> 2] = tempI64[1]);
          HEAP32[(buf + 48) >> 2] = 4096;
          HEAP32[(buf + 52) >> 2] = stat.blocks;
          HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0;
          HEAP32[(buf + 60) >> 2] = 0;
          HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
          HEAP32[(buf + 68) >> 2] = 0;
          HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
          HEAP32[(buf + 76) >> 2] = 0;
          (tempI64 = [
            stat.ino >>> 0,
            ((tempDouble = stat.ino),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 80) >> 2] = tempI64[0]),
            (HEAP32[(buf + 84) >> 2] = tempI64[1]);
          return 0;
        },
        doMsync: function (addr, stream, len, flags, offset) {
          var buffer = HEAPU8.slice(addr, addr + len);
          FS.msync(stream, buffer, offset, len, flags);
        },
        varargs: undefined,
        get: function () {
          SYSCALLS.varargs += 4;
          var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
          return ret;
        },
        getStr: function (ptr) {
          var ret = UTF8ToString(ptr);
          return ret;
        },
        getStreamFromFD: function (fd) {
          var stream = FS.getStream(fd);
          if (!stream) throw new FS.ErrnoError(8);
          return stream;
        },
      };
      function ___syscall_fstat64(fd, buf) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          return SYSCALLS.doStat(FS.stat, stream.path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_ftruncate64(fd, length_low, length_high) {
        try {
          var length = length_high * 4294967296 + (length_low >>> 0);
          FS.ftruncate(fd, length);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_lstat64(path, buf) {
        try {
          path = SYSCALLS.getStr(path);
          return SYSCALLS.doStat(FS.lstat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_newfstatat(dirfd, path, buf, flags) {
        try {
          path = SYSCALLS.getStr(path);
          var nofollow = flags & 256;
          var allowEmpty = flags & 4096;
          flags = flags & ~4352;
          path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
          return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_openat(dirfd, path, flags, varargs) {
        SYSCALLS.varargs = varargs;
        try {
          path = SYSCALLS.getStr(path);
          path = SYSCALLS.calculateAt(dirfd, path);
          var mode = varargs ? SYSCALLS.get() : 0;
          return FS.open(path, flags, mode).fd;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
        try {
          oldpath = SYSCALLS.getStr(oldpath);
          newpath = SYSCALLS.getStr(newpath);
          oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
          newpath = SYSCALLS.calculateAt(newdirfd, newpath);
          FS.rename(oldpath, newpath);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_stat64(path, buf) {
        try {
          path = SYSCALLS.getStr(path);
          return SYSCALLS.doStat(FS.stat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_unlinkat(dirfd, path, flags) {
        try {
          path = SYSCALLS.getStr(path);
          path = SYSCALLS.calculateAt(dirfd, path);
          if (flags === 0) {
            FS.unlink(path);
          } else if (flags === 512) {
            FS.rmdir(path);
          } else {
            abort('Invalid flags passed to unlinkat');
          }
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function __dlinit(main_dso_handle) {}
      var dlopenMissingError =
        'To use dlopen, you need enable dynamic linking, see https://github.com/emscripten-core/emscripten/wiki/Linking';
      function __dlopen_js(filename, flag) {
        abort(dlopenMissingError);
      }
      function __dlsym_js(handle, symbol) {
        abort(dlopenMissingError);
      }
      function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {}
      function getShiftFromSize(size) {
        switch (size) {
          case 1:
            return 0;
          case 2:
            return 1;
          case 4:
            return 2;
          case 8:
            return 3;
          default:
            throw new TypeError('Unknown type size: ' + size);
        }
      }
      function embind_init_charCodes() {
        var codes = new Array(256);
        for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
        }
        embind_charCodes = codes;
      }
      var embind_charCodes = undefined;
      function readLatin1String(ptr) {
        var ret = '';
        var c = ptr;
        while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
        }
        return ret;
      }
      var awaitingDependencies = {};
      var registeredTypes = {};
      var typeDependencies = {};
      var char_0 = 48;
      var char_9 = 57;
      function makeLegalFunctionName(name) {
        if (undefined === name) {
          return '_unknown';
        }
        name = name.replace(/[^a-zA-Z0-9_]/g, '$');
        var f = name.charCodeAt(0);
        if (f >= char_0 && f <= char_9) {
          return '_' + name;
        }
        return name;
      }
      function createNamedFunction(name, body) {
        name = makeLegalFunctionName(name);
        return new Function(
          'body',
          'return function ' + name + '() {\n' + '    "use strict";' + '    return body.apply(this, arguments);\n' + '};\n'
        )(body);
      }
      function extendError(baseErrorType, errorName) {
        var errorClass = createNamedFunction(errorName, function (message) {
          this.name = errorName;
          this.message = message;
          var stack = new Error(message).stack;
          if (stack !== undefined) {
            this.stack = this.toString() + '\n' + stack.replace(/^Error(:[^\n]*)?\n/, '');
          }
        });
        errorClass.prototype = Object.create(baseErrorType.prototype);
        errorClass.prototype.constructor = errorClass;
        errorClass.prototype.toString = function () {
          if (this.message === undefined) {
            return this.name;
          } else {
            return this.name + ': ' + this.message;
          }
        };
        return errorClass;
      }
      var BindingError = undefined;
      function throwBindingError(message) {
        throw new BindingError(message);
      }
      var InternalError = undefined;
      function throwInternalError(message) {
        throw new InternalError(message);
      }
      function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
        myTypes.forEach(function (type) {
          typeDependencies[type] = dependentTypes;
        });
        function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
            throwInternalError('Mismatched type converter count');
          }
          for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i]);
          }
        }
        var typeConverters = new Array(dependentTypes.length);
        var unregisteredTypes = [];
        var registered = 0;
        dependentTypes.forEach((dt, i) => {
          if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
          } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
              awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(() => {
              typeConverters[i] = registeredTypes[dt];
              ++registered;
              if (registered === unregisteredTypes.length) {
                onComplete(typeConverters);
              }
            });
          }
        });
        if (0 === unregisteredTypes.length) {
          onComplete(typeConverters);
        }
      }
      function registerType(rawType, registeredInstance, options = {}) {
        if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance');
        }
        var name = registeredInstance.name;
        if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
        }
        if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
            return;
          } else {
            throwBindingError("Cannot register type '" + name + "' twice");
          }
        }
        registeredTypes[rawType] = registeredInstance;
        delete typeDependencies[rawType];
        if (awaitingDependencies.hasOwnProperty(rawType)) {
          var callbacks = awaitingDependencies[rawType];
          delete awaitingDependencies[rawType];
          callbacks.forEach((cb) => cb());
        }
      }
      function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (wt) {
            return !!wt;
          },
          toWireType: function (destructors, o) {
            return o ? trueValue : falseValue;
          },
          argPackAdvance: 8,
          readValueFromPointer: function (pointer) {
            var heap;
            if (size === 1) {
              heap = HEAP8;
            } else if (size === 2) {
              heap = HEAP16;
            } else if (size === 4) {
              heap = HEAP32;
            } else {
              throw new TypeError('Unknown boolean type size: ' + name);
            }
            return this['fromWireType'](heap[pointer >> shift]);
          },
          destructorFunction: null,
        });
      }
      function ClassHandle_isAliasOf(other) {
        if (!(this instanceof ClassHandle)) {
          return false;
        }
        if (!(other instanceof ClassHandle)) {
          return false;
        }
        var leftClass = this.$$.ptrType.registeredClass;
        var left = this.$$.ptr;
        var rightClass = other.$$.ptrType.registeredClass;
        var right = other.$$.ptr;
        while (leftClass.baseClass) {
          left = leftClass.upcast(left);
          leftClass = leftClass.baseClass;
        }
        while (rightClass.baseClass) {
          right = rightClass.upcast(right);
          rightClass = rightClass.baseClass;
        }
        return leftClass === rightClass && left === right;
      }
      function shallowCopyInternalPointer(o) {
        return {
          count: o.count,
          deleteScheduled: o.deleteScheduled,
          preservePointerOnDelete: o.preservePointerOnDelete,
          ptr: o.ptr,
          ptrType: o.ptrType,
          smartPtr: o.smartPtr,
          smartPtrType: o.smartPtrType,
        };
      }
      function throwInstanceAlreadyDeleted(obj) {
        function getInstanceTypeName(handle) {
          return handle.$$.ptrType.registeredClass.name;
        }
        throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
      }
      var finalizationRegistry = false;
      function detachFinalizer(handle) {}
      function runDestructor($$) {
        if ($$.smartPtr) {
          $$.smartPtrType.rawDestructor($$.smartPtr);
        } else {
          $$.ptrType.registeredClass.rawDestructor($$.ptr);
        }
      }
      function releaseClassHandle($$) {
        $$.count.value -= 1;
        var toDelete = 0 === $$.count.value;
        if (toDelete) {
          runDestructor($$);
        }
      }
      function downcastPointer(ptr, ptrClass, desiredClass) {
        if (ptrClass === desiredClass) {
          return ptr;
        }
        if (undefined === desiredClass.baseClass) {
          return null;
        }
        var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
        if (rv === null) {
          return null;
        }
        return desiredClass.downcast(rv);
      }
      var registeredPointers = {};
      function getInheritedInstanceCount() {
        return Object.keys(registeredInstances).length;
      }
      function getLiveInheritedInstances() {
        var rv = [];
        for (var k in registeredInstances) {
          if (registeredInstances.hasOwnProperty(k)) {
            rv.push(registeredInstances[k]);
          }
        }
        return rv;
      }
      var deletionQueue = [];
      function flushPendingDeletes() {
        while (deletionQueue.length) {
          var obj = deletionQueue.pop();
          obj.$$.deleteScheduled = false;
          obj['delete']();
        }
      }
      var delayFunction = undefined;
      function setDelayFunction(fn) {
        delayFunction = fn;
        if (deletionQueue.length && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
      }
      function init_embind() {
        Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
        Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
        Module['flushPendingDeletes'] = flushPendingDeletes;
        Module['setDelayFunction'] = setDelayFunction;
      }
      var registeredInstances = {};
      function getBasestPointer(class_, ptr) {
        if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
        }
        while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
        }
        return ptr;
      }
      function getInheritedInstance(class_, ptr) {
        ptr = getBasestPointer(class_, ptr);
        return registeredInstances[ptr];
      }
      function makeClassHandle(prototype, record) {
        if (!record.ptrType || !record.ptr) {
          throwInternalError('makeClassHandle requires ptr and ptrType');
        }
        var hasSmartPtrType = !!record.smartPtrType;
        var hasSmartPtr = !!record.smartPtr;
        if (hasSmartPtrType !== hasSmartPtr) {
          throwInternalError('Both smartPtrType and smartPtr must be specified');
        }
        record.count = { value: 1 };
        return attachFinalizer(Object.create(prototype, { $$: { value: record } }));
      }
      function RegisteredPointer_fromWireType(ptr) {
        var rawPointer = this.getPointee(ptr);
        if (!rawPointer) {
          this.destructor(ptr);
          return null;
        }
        var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
        if (undefined !== registeredInstance) {
          if (0 === registeredInstance.$$.count.value) {
            registeredInstance.$$.ptr = rawPointer;
            registeredInstance.$$.smartPtr = ptr;
            return registeredInstance['clone']();
          } else {
            var rv = registeredInstance['clone']();
            this.destructor(ptr);
            return rv;
          }
        }
        function makeDefaultHandle() {
          if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {
              ptrType: this.pointeeType,
              ptr: rawPointer,
              smartPtrType: this,
              smartPtr: ptr,
            });
          } else {
            return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr: ptr });
          }
        }
        var actualType = this.registeredClass.getActualType(rawPointer);
        var registeredPointerRecord = registeredPointers[actualType];
        if (!registeredPointerRecord) {
          return makeDefaultHandle.call(this);
        }
        var toType;
        if (this.isConst) {
          toType = registeredPointerRecord.constPointerType;
        } else {
          toType = registeredPointerRecord.pointerType;
        }
        var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
        if (dp === null) {
          return makeDefaultHandle.call(this);
        }
        if (this.isSmartPointer) {
          return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr });
        } else {
          return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
        }
      }
      function attachFinalizer(handle) {
        if ('undefined' === typeof FinalizationRegistry) {
          attachFinalizer = (handle) => handle;
          return handle;
        }
        finalizationRegistry = new FinalizationRegistry((info) => {
          releaseClassHandle(info.$$);
        });
        attachFinalizer = (handle) => {
          var $$ = handle.$$;
          var hasSmartPtr = !!$$.smartPtr;
          if (hasSmartPtr) {
            var info = { $$: $$ };
            finalizationRegistry.register(handle, info, handle);
          }
          return handle;
        };
        detachFinalizer = (handle) => finalizationRegistry.unregister(handle);
        return attachFinalizer(handle);
      }
      function ClassHandle_clone() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.preservePointerOnDelete) {
          this.$$.count.value += 1;
          return this;
        } else {
          var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } }));
          clone.$$.count.value += 1;
          clone.$$.deleteScheduled = false;
          return clone;
        }
      }
      function ClassHandle_delete() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError('Object already scheduled for deletion');
        }
        detachFinalizer(this);
        releaseClassHandle(this.$$);
        if (!this.$$.preservePointerOnDelete) {
          this.$$.smartPtr = undefined;
          this.$$.ptr = undefined;
        }
      }
      function ClassHandle_isDeleted() {
        return !this.$$.ptr;
      }
      function ClassHandle_deleteLater() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError('Object already scheduled for deletion');
        }
        deletionQueue.push(this);
        if (deletionQueue.length === 1 && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
        this.$$.deleteScheduled = true;
        return this;
      }
      function init_ClassHandle() {
        ClassHandle.prototype['isAliasOf'] = ClassHandle_isAliasOf;
        ClassHandle.prototype['clone'] = ClassHandle_clone;
        ClassHandle.prototype['delete'] = ClassHandle_delete;
        ClassHandle.prototype['isDeleted'] = ClassHandle_isDeleted;
        ClassHandle.prototype['deleteLater'] = ClassHandle_deleteLater;
      }
      function ClassHandle() {}
      function ensureOverloadTable(proto, methodName, humanName) {
        if (undefined === proto[methodName].overloadTable) {
          var prevFunc = proto[methodName];
          proto[methodName] = function () {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
              throwBindingError(
                "Function '" +
                  humanName +
                  "' called with an invalid number of arguments (" +
                  arguments.length +
                  ') - expects one of (' +
                  proto[methodName].overloadTable +
                  ')!'
              );
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
          };
          proto[methodName].overloadTable = [];
          proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
        }
      }
      function exposePublicSymbol(name, value, numArguments) {
        if (Module.hasOwnProperty(name)) {
          if (
            undefined === numArguments ||
            (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])
          ) {
            throwBindingError("Cannot register public name '" + name + "' twice");
          }
          ensureOverloadTable(Module, name, name);
          if (Module.hasOwnProperty(numArguments)) {
            throwBindingError('Cannot register multiple overloads of a function with the same number of arguments (' + numArguments + ')!');
          }
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          if (undefined !== numArguments) {
            Module[name].numArguments = numArguments;
          }
        }
      }
      function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
        this.name = name;
        this.constructor = constructor;
        this.instancePrototype = instancePrototype;
        this.rawDestructor = rawDestructor;
        this.baseClass = baseClass;
        this.getActualType = getActualType;
        this.upcast = upcast;
        this.downcast = downcast;
        this.pureVirtualFunctions = [];
      }
      function upcastPointer(ptr, ptrClass, desiredClass) {
        while (ptrClass !== desiredClass) {
          if (!ptrClass.upcast) {
            throwBindingError('Expected null or instance of ' + desiredClass.name + ', got an instance of ' + ptrClass.name);
          }
          ptr = ptrClass.upcast(ptr);
          ptrClass = ptrClass.baseClass;
        }
        return ptr;
      }
      function constNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function genericPointerToWireType(destructors, handle) {
        var ptr;
        if (handle === null) {
          if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
          }
          if (this.isSmartPointer) {
            ptr = this.rawConstructor();
            if (destructors !== null) {
              destructors.push(this.rawDestructor, ptr);
            }
            return ptr;
          } else {
            return 0;
          }
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
        }
        if (!this.isConst && handle.$$.ptrType.isConst) {
          throwBindingError(
            'Cannot convert argument of type ' +
              (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) +
              ' to parameter type ' +
              this.name
          );
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        if (this.isSmartPointer) {
          if (undefined === handle.$$.smartPtr) {
            throwBindingError('Passing raw pointer to smart pointer is illegal');
          }
          switch (this.sharingPolicy) {
            case 0:
              if (handle.$$.smartPtrType === this) {
                ptr = handle.$$.smartPtr;
              } else {
                throwBindingError(
                  'Cannot convert argument of type ' +
                    (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) +
                    ' to parameter type ' +
                    this.name
                );
              }
              break;
            case 1:
              ptr = handle.$$.smartPtr;
              break;
            case 2:
              if (handle.$$.smartPtrType === this) {
                ptr = handle.$$.smartPtr;
              } else {
                var clonedHandle = handle['clone']();
                ptr = this.rawShare(
                  ptr,
                  Emval.toHandle(function () {
                    clonedHandle['delete']();
                  })
                );
                if (destructors !== null) {
                  destructors.push(this.rawDestructor, ptr);
                }
              }
              break;
            default:
              throwBindingError('Unsupporting sharing policy');
          }
        }
        return ptr;
      }
      function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
        }
        if (handle.$$.ptrType.isConst) {
          throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function simpleReadValueFromPointer(pointer) {
        return this['fromWireType'](HEAPU32[pointer >> 2]);
      }
      function RegisteredPointer_getPointee(ptr) {
        if (this.rawGetPointee) {
          ptr = this.rawGetPointee(ptr);
        }
        return ptr;
      }
      function RegisteredPointer_destructor(ptr) {
        if (this.rawDestructor) {
          this.rawDestructor(ptr);
        }
      }
      function RegisteredPointer_deleteObject(handle) {
        if (handle !== null) {
          handle['delete']();
        }
      }
      function init_RegisteredPointer() {
        RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
        RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
        RegisteredPointer.prototype['argPackAdvance'] = 8;
        RegisteredPointer.prototype['readValueFromPointer'] = simpleReadValueFromPointer;
        RegisteredPointer.prototype['deleteObject'] = RegisteredPointer_deleteObject;
        RegisteredPointer.prototype['fromWireType'] = RegisteredPointer_fromWireType;
      }
      function RegisteredPointer(
        name,
        registeredClass,
        isReference,
        isConst,
        isSmartPointer,
        pointeeType,
        sharingPolicy,
        rawGetPointee,
        rawConstructor,
        rawShare,
        rawDestructor
      ) {
        this.name = name;
        this.registeredClass = registeredClass;
        this.isReference = isReference;
        this.isConst = isConst;
        this.isSmartPointer = isSmartPointer;
        this.pointeeType = pointeeType;
        this.sharingPolicy = sharingPolicy;
        this.rawGetPointee = rawGetPointee;
        this.rawConstructor = rawConstructor;
        this.rawShare = rawShare;
        this.rawDestructor = rawDestructor;
        if (!isSmartPointer && registeredClass.baseClass === undefined) {
          if (isConst) {
            this['toWireType'] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
          } else {
            this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
          }
        } else {
          this['toWireType'] = genericPointerToWireType;
        }
      }
      function replacePublicSymbol(name, value, numArguments) {
        if (!Module.hasOwnProperty(name)) {
          throwInternalError('Replacing nonexistant public symbol');
        }
        if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          Module[name].argCount = numArguments;
        }
      }
      function dynCallLegacy(sig, ptr, args) {
        var f = Module['dynCall_' + sig];
        return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
      }
      function dynCall(sig, ptr, args) {
        if (sig.includes('j')) {
          return dynCallLegacy(sig, ptr, args);
        }
        return getWasmTableEntry(ptr).apply(null, args);
      }
      function getDynCaller(sig, ptr) {
        var argCache = [];
        return function () {
          argCache.length = 0;
          Object.assign(argCache, arguments);
          return dynCall(sig, ptr, argCache);
        };
      }
      function embind__requireFunction(signature, rawFunction) {
        signature = readLatin1String(signature);
        function makeDynCaller() {
          if (signature.includes('j')) {
            return getDynCaller(signature, rawFunction);
          }
          return getWasmTableEntry(rawFunction);
        }
        var fp = makeDynCaller();
        if (typeof fp != 'function') {
          throwBindingError('unknown function pointer with signature ' + signature + ': ' + rawFunction);
        }
        return fp;
      }
      var UnboundTypeError = undefined;
      function getTypeName(type) {
        var ptr = ___getTypeName(type);
        var rv = readLatin1String(ptr);
        _free(ptr);
        return rv;
      }
      function throwUnboundTypeError(message, types) {
        var unboundTypes = [];
        var seen = {};
        function visit(type) {
          if (seen[type]) {
            return;
          }
          if (registeredTypes[type]) {
            return;
          }
          if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return;
          }
          unboundTypes.push(type);
          seen[type] = true;
        }
        types.forEach(visit);
        throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
      }
      function __embind_register_class(
        rawType,
        rawPointerType,
        rawConstPointerType,
        baseClassRawType,
        getActualTypeSignature,
        getActualType,
        upcastSignature,
        upcast,
        downcastSignature,
        downcast,
        name,
        destructorSignature,
        rawDestructor
      ) {
        name = readLatin1String(name);
        getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
        if (upcast) {
          upcast = embind__requireFunction(upcastSignature, upcast);
        }
        if (downcast) {
          downcast = embind__requireFunction(downcastSignature, downcast);
        }
        rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
        var legalFunctionName = makeLegalFunctionName(name);
        exposePublicSymbol(legalFunctionName, function () {
          throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
        });
        whenDependentTypesAreResolved(
          [rawType, rawPointerType, rawConstPointerType],
          baseClassRawType ? [baseClassRawType] : [],
          function (base) {
            base = base[0];
            var baseClass;
            var basePrototype;
            if (baseClassRawType) {
              baseClass = base.registeredClass;
              basePrototype = baseClass.instancePrototype;
            } else {
              basePrototype = ClassHandle.prototype;
            }
            var constructor = createNamedFunction(legalFunctionName, function () {
              if (Object.getPrototypeOf(this) !== instancePrototype) {
                throw new BindingError("Use 'new' to construct " + name);
              }
              if (undefined === registeredClass.constructor_body) {
                throw new BindingError(name + ' has no accessible constructor');
              }
              var body = registeredClass.constructor_body[arguments.length];
              if (undefined === body) {
                throw new BindingError(
                  'Tried to invoke ctor of ' +
                    name +
                    ' with invalid number of parameters (' +
                    arguments.length +
                    ') - expected (' +
                    Object.keys(registeredClass.constructor_body).toString() +
                    ') parameters instead!'
                );
              }
              return body.apply(this, arguments);
            });
            var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } });
            constructor.prototype = instancePrototype;
            var registeredClass = new RegisteredClass(
              name,
              constructor,
              instancePrototype,
              rawDestructor,
              baseClass,
              getActualType,
              upcast,
              downcast
            );
            var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
            var pointerConverter = new RegisteredPointer(name + '*', registeredClass, false, false, false);
            var constPointerConverter = new RegisteredPointer(name + ' const*', registeredClass, false, true, false);
            registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
            replacePublicSymbol(legalFunctionName, constructor);
            return [referenceConverter, pointerConverter, constPointerConverter];
          }
        );
      }
      function heap32VectorToArray(count, firstElement) {
        var array = [];
        for (var i = 0; i < count; i++) {
          array.push(HEAP32[(firstElement >> 2) + i]);
        }
        return array;
      }
      function runDestructors(destructors) {
        while (destructors.length) {
          var ptr = destructors.pop();
          var del = destructors.pop();
          del(ptr);
        }
      }
      function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
        assert(argCount > 0);
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        invoker = embind__requireFunction(invokerSignature, invoker);
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
          classType = classType[0];
          var humanName = 'constructor ' + classType.name;
          if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
          }
          if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError(
              'Cannot register multiple constructors with identical number of parameters (' +
                (argCount - 1) +
                ") for class '" +
                classType.name +
                "'! Overload resolution is currently only performed using the parameter count, not actual type info!"
            );
          }
          classType.registeredClass.constructor_body[argCount - 1] = () => {
            throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
          };
          whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            argTypes.splice(1, 0, null);
            classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(
              humanName,
              argTypes,
              null,
              invoker,
              rawConstructor
            );
            return [];
          });
          return [];
        });
      }
      function new_(constructor, argumentList) {
        if (!(constructor instanceof Function)) {
          throw new TypeError('new_ called with constructor type ' + typeof constructor + ' which is not a function');
        }
        var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function () {});
        dummy.prototype = constructor.prototype;
        var obj = new dummy();
        var r = constructor.apply(obj, argumentList);
        return r instanceof Object ? r : obj;
      }
      function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
        var argCount = argTypes.length;
        if (argCount < 2) {
          throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
        }
        var isClassMethodFunc = argTypes[1] !== null && classType !== null;
        var needsDestructorStack = false;
        for (var i = 1; i < argTypes.length; ++i) {
          if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
            needsDestructorStack = true;
            break;
          }
        }
        var returns = argTypes[0].name !== 'void';
        var argsList = '';
        var argsListWired = '';
        for (var i = 0; i < argCount - 2; ++i) {
          argsList += (i !== 0 ? ', ' : '') + 'arg' + i;
          argsListWired += (i !== 0 ? ', ' : '') + 'arg' + i + 'Wired';
        }
        var invokerFnBody =
          'return function ' +
          makeLegalFunctionName(humanName) +
          '(' +
          argsList +
          ') {\n' +
          'if (arguments.length !== ' +
          (argCount - 2) +
          ') {\n' +
          "throwBindingError('function " +
          humanName +
          " called with ' + arguments.length + ' arguments, expected " +
          (argCount - 2) +
          " args!');\n" +
          '}\n';
        if (needsDestructorStack) {
          invokerFnBody += 'var destructors = [];\n';
        }
        var dtorStack = needsDestructorStack ? 'destructors' : 'null';
        var args1 = ['throwBindingError', 'invoker', 'fn', 'runDestructors', 'retType', 'classParam'];
        var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
        if (isClassMethodFunc) {
          invokerFnBody += 'var thisWired = classParam.toWireType(' + dtorStack + ', this);\n';
        }
        for (var i = 0; i < argCount - 2; ++i) {
          invokerFnBody +=
            'var arg' + i + 'Wired = argType' + i + '.toWireType(' + dtorStack + ', arg' + i + '); // ' + argTypes[i + 2].name + '\n';
          args1.push('argType' + i);
          args2.push(argTypes[i + 2]);
        }
        if (isClassMethodFunc) {
          argsListWired = 'thisWired' + (argsListWired.length > 0 ? ', ' : '') + argsListWired;
        }
        invokerFnBody += (returns ? 'var rv = ' : '') + 'invoker(fn' + (argsListWired.length > 0 ? ', ' : '') + argsListWired + ');\n';
        if (needsDestructorStack) {
          invokerFnBody += 'runDestructors(destructors);\n';
        } else {
          for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            var paramName = i === 1 ? 'thisWired' : 'arg' + (i - 2) + 'Wired';
            if (argTypes[i].destructorFunction !== null) {
              invokerFnBody += paramName + '_dtor(' + paramName + '); // ' + argTypes[i].name + '\n';
              args1.push(paramName + '_dtor');
              args2.push(argTypes[i].destructorFunction);
            }
          }
        }
        if (returns) {
          invokerFnBody += 'var ret = retType.fromWireType(rv);\n' + 'return ret;\n';
        } else {
        }
        invokerFnBody += '}\n';
        args1.push(invokerFnBody);
        var invokerFunction = new_(Function, args1).apply(null, args2);
        return invokerFunction;
      }
      function __embind_register_class_function(
        rawClassType,
        methodName,
        argCount,
        rawArgTypesAddr,
        invokerSignature,
        rawInvoker,
        context,
        isPureVirtual
      ) {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        methodName = readLatin1String(methodName);
        rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
          classType = classType[0];
          var humanName = classType.name + '.' + methodName;
          if (methodName.startsWith('@@')) {
            methodName = Symbol[methodName.substring(2)];
          }
          if (isPureVirtual) {
            classType.registeredClass.pureVirtualFunctions.push(methodName);
          }
          function unboundTypesHandler() {
            throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
          }
          var proto = classType.registeredClass.instancePrototype;
          var method = proto[methodName];
          if (
            undefined === method ||
            (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)
          ) {
            unboundTypesHandler.argCount = argCount - 2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler;
          } else {
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
          }
          whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
            if (undefined === proto[methodName].overloadTable) {
              memberFunction.argCount = argCount - 2;
              proto[methodName] = memberFunction;
            } else {
              proto[methodName].overloadTable[argCount - 2] = memberFunction;
            }
            return [];
          });
          return [];
        });
      }
      var emval_free_list = [];
      var emval_handle_array = [{}, { value: undefined }, { value: null }, { value: true }, { value: false }];
      function __emval_decref(handle) {
        if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
          emval_handle_array[handle] = undefined;
          emval_free_list.push(handle);
        }
      }
      function count_emval_handles() {
        var count = 0;
        for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
            ++count;
          }
        }
        return count;
      }
      function get_first_emval() {
        for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
            return emval_handle_array[i];
          }
        }
        return null;
      }
      function init_emval() {
        Module['count_emval_handles'] = count_emval_handles;
        Module['get_first_emval'] = get_first_emval;
      }
      var Emval = {
        toValue: (handle) => {
          if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle);
          }
          return emval_handle_array[handle].value;
        },
        toHandle: (value) => {
          switch (value) {
            case undefined:
              return 1;
            case null:
              return 2;
            case true:
              return 3;
            case false:
              return 4;
            default: {
              var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
              emval_handle_array[handle] = { refcount: 1, value: value };
              return handle;
            }
          }
        },
      };
      function __embind_register_emval(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (handle) {
            var rv = Emval.toValue(handle);
            __emval_decref(handle);
            return rv;
          },
          toWireType: function (destructors, value) {
            return Emval.toHandle(value);
          },
          argPackAdvance: 8,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: null,
        });
      }
      function _embind_repr(v) {
        if (v === null) {
          return 'null';
        }
        var t = typeof v;
        if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
        } else {
          return '' + v;
        }
      }
      function floatReadValueFromPointer(name, shift) {
        switch (shift) {
          case 2:
            return function (pointer) {
              return this['fromWireType'](HEAPF32[pointer >> 2]);
            };
          case 3:
            return function (pointer) {
              return this['fromWireType'](HEAPF64[pointer >> 3]);
            };
          default:
            throw new TypeError('Unknown float type: ' + name);
        }
      }
      function __embind_register_float(rawType, name, size) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (value) {
            return value;
          },
          toWireType: function (destructors, value) {
            return value;
          },
          argPackAdvance: 8,
          readValueFromPointer: floatReadValueFromPointer(name, shift),
          destructorFunction: null,
        });
      }
      function integerReadValueFromPointer(name, shift, signed) {
        switch (shift) {
          case 0:
            return signed
              ? function readS8FromPointer(pointer) {
                  return HEAP8[pointer];
                }
              : function readU8FromPointer(pointer) {
                  return HEAPU8[pointer];
                };
          case 1:
            return signed
              ? function readS16FromPointer(pointer) {
                  return HEAP16[pointer >> 1];
                }
              : function readU16FromPointer(pointer) {
                  return HEAPU16[pointer >> 1];
                };
          case 2:
            return signed
              ? function readS32FromPointer(pointer) {
                  return HEAP32[pointer >> 2];
                }
              : function readU32FromPointer(pointer) {
                  return HEAPU32[pointer >> 2];
                };
          default:
            throw new TypeError('Unknown integer type: ' + name);
        }
      }
      function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
        name = readLatin1String(name);
        if (maxRange === -1) {
          maxRange = 4294967295;
        }
        var shift = getShiftFromSize(size);
        var fromWireType = (value) => value;
        if (minRange === 0) {
          var bitshift = 32 - 8 * size;
          fromWireType = (value) => (value << bitshift) >>> bitshift;
        }
        var isUnsignedType = name.includes('unsigned');
        var checkAssertions = (value, toTypeName) => {};
        var toWireType;
        if (isUnsignedType) {
          toWireType = function (destructors, value) {
            checkAssertions(value, this.name);
            return value >>> 0;
          };
        } else {
          toWireType = function (destructors, value) {
            checkAssertions(value, this.name);
            return value;
          };
        }
        registerType(primitiveType, {
          name: name,
          fromWireType: fromWireType,
          toWireType: toWireType,
          argPackAdvance: 8,
          readValueFromPointer: integerReadValueFromPointer(name, shift, minRange !== 0),
          destructorFunction: null,
        });
      }
      function __embind_register_memory_view(rawType, dataTypeIndex, name) {
        var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
        var TA = typeMapping[dataTypeIndex];
        function decodeMemoryView(handle) {
          handle = handle >> 2;
          var heap = HEAPU32;
          var size = heap[handle];
          var data = heap[handle + 1];
          return new TA(buffer, data, size);
        }
        name = readLatin1String(name);
        registerType(
          rawType,
          { name: name, fromWireType: decodeMemoryView, argPackAdvance: 8, readValueFromPointer: decodeMemoryView },
          { ignoreDuplicateRegistrations: true }
        );
      }
      function __embind_register_std_string(rawType, name) {
        name = readLatin1String(name);
        var stdStringIsUTF8 = name === 'std::string';
        registerType(rawType, {
          name: name,
          fromWireType: function (value) {
            var length = HEAPU32[value >> 2];
            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = value + 4;
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = value + 4 + i;
                if (i == length || HEAPU8[currentBytePtr] == 0) {
                  var maxRead = currentBytePtr - decodeStartPtr;
                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                  if (str === undefined) {
                    str = stringSegment;
                  } else {
                    str += String.fromCharCode(0);
                    str += stringSegment;
                  }
                  decodeStartPtr = currentBytePtr + 1;
                }
              }
            } else {
              var a = new Array(length);
              for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
              }
              str = a.join('');
            }
            _free(value);
            return str;
          },
          toWireType: function (destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }
            var getLength;
            var valueIsOfTypeString = typeof value == 'string';
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError('Cannot pass non-string to std::string');
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              getLength = () => lengthBytesUTF8(value);
            } else {
              getLength = () => value.length;
            }
            var length = getLength();
            var ptr = _malloc(4 + length + 1);
            HEAPU32[ptr >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr + 4, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                  }
                  HEAPU8[ptr + 4 + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  HEAPU8[ptr + 4 + i] = value[i];
                }
              }
            }
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          },
          argPackAdvance: 8,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: function (ptr) {
            _free(ptr);
          },
        });
      }
      function __embind_register_std_wstring(rawType, charSize, name) {
        name = readLatin1String(name);
        var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
        if (charSize === 2) {
          decodeString = UTF16ToString;
          encodeString = stringToUTF16;
          lengthBytesUTF = lengthBytesUTF16;
          getHeap = () => HEAPU16;
          shift = 1;
        } else if (charSize === 4) {
          decodeString = UTF32ToString;
          encodeString = stringToUTF32;
          lengthBytesUTF = lengthBytesUTF32;
          getHeap = () => HEAPU32;
          shift = 2;
        }
        registerType(rawType, {
          name: name,
          fromWireType: function (value) {
            var length = HEAPU32[value >> 2];
            var HEAP = getHeap();
            var str;
            var decodeStartPtr = value + 4;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = value + 4 + i * charSize;
              if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                var maxReadBytes = currentBytePtr - decodeStartPtr;
                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + charSize;
              }
            }
            _free(value);
            return str;
          },
          toWireType: function (destructors, value) {
            if (!(typeof value == 'string')) {
              throwBindingError('Cannot pass non-string to C++ string type ' + name);
            }
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            HEAPU32[ptr >> 2] = length >> shift;
            encodeString(value, ptr + 4, length + charSize);
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          },
          argPackAdvance: 8,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: function (ptr) {
            _free(ptr);
          },
        });
      }
      function __embind_register_void(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, {
          isVoid: true,
          name: name,
          argPackAdvance: 0,
          fromWireType: function () {
            return undefined;
          },
          toWireType: function (destructors, o) {
            return undefined;
          },
        });
      }
      function __emscripten_date_now() {
        return Date.now();
      }
      var nowIsMonotonic = true;
      function __emscripten_get_now_is_monotonic() {
        return nowIsMonotonic;
      }
      function __emval_incref(handle) {
        if (handle > 4) {
          emval_handle_array[handle].refcount += 1;
        }
      }
      function requireRegisteredType(rawType, humanName) {
        var impl = registeredTypes[rawType];
        if (undefined === impl) {
          throwBindingError(humanName + ' has unknown type ' + getTypeName(rawType));
        }
        return impl;
      }
      function __emval_take_value(type, argv) {
        type = requireRegisteredType(type, '_emval_take_value');
        var v = type['readValueFromPointer'](argv);
        return Emval.toHandle(v);
      }
      function __mmap_js(addr, len, prot, flags, fd, off, allocated, builtin) {
        try {
          var info = FS.getStream(fd);
          if (!info) return -8;
          var res = FS.mmap(info, addr, len, off, prot, flags);
          var ptr = res.ptr;
          HEAP32[allocated >> 2] = res.allocated;
          return ptr;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function __munmap_js(addr, len, prot, flags, fd, offset) {
        try {
          var stream = FS.getStream(fd);
          if (stream) {
            if (prot & 2) {
              SYSCALLS.doMsync(addr, stream, len, flags, offset);
            }
            FS.munmap(stream);
          }
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function _abort() {
        abort('');
      }
      function _emscripten_get_heap_max() {
        return 2147483648;
      }
      var _emscripten_get_now;
      _emscripten_get_now = () => performance.now();
      function _emscripten_memcpy_big(dest, src, num) {
        HEAPU8.copyWithin(dest, src, src + num);
      }
      function emscripten_realloc_buffer(size) {
        try {
          wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
          updateGlobalBufferAndViews(wasmMemory.buffer);
          return 1;
        } catch (e) {}
      }
      function _emscripten_resize_heap(requestedSize) {
        var oldSize = HEAPU8.length;
        requestedSize = requestedSize >>> 0;
        var maxHeapSize = _emscripten_get_heap_max();
        if (requestedSize > maxHeapSize) {
          return false;
        }
        let alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
        for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
          var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
          overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
          var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
          var replacement = emscripten_realloc_buffer(newSize);
          if (replacement) {
            return true;
          }
        }
        return false;
      }
      var ENV = {};
      function getExecutableName() {
        return thisProgram || './this.program';
      }
      function getEnvStrings() {
        if (!getEnvStrings.strings) {
          var lang = ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
          var env = {
            USER: 'web_user',
            LOGNAME: 'web_user',
            PATH: '/',
            PWD: '/',
            HOME: '/home/web_user',
            LANG: lang,
            _: getExecutableName(),
          };
          for (var x in ENV) {
            if (ENV[x] === undefined) delete env[x];
            else env[x] = ENV[x];
          }
          var strings = [];
          for (var x in env) {
            strings.push(x + '=' + env[x]);
          }
          getEnvStrings.strings = strings;
        }
        return getEnvStrings.strings;
      }
      function _environ_get(__environ, environ_buf) {
        var bufSize = 0;
        getEnvStrings().forEach(function (string, i) {
          var ptr = environ_buf + bufSize;
          HEAP32[(__environ + i * 4) >> 2] = ptr;
          writeAsciiToMemory(string, ptr);
          bufSize += string.length + 1;
        });
        return 0;
      }
      function _environ_sizes_get(penviron_count, penviron_buf_size) {
        var strings = getEnvStrings();
        HEAP32[penviron_count >> 2] = strings.length;
        var bufSize = 0;
        strings.forEach(function (string) {
          bufSize += string.length + 1;
        });
        HEAP32[penviron_buf_size >> 2] = bufSize;
        return 0;
      }
      function _exit(status) {
        exit(status);
      }
      function _fd_close(fd) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          FS.close(stream);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function doReadv(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[(iov + 4) >> 2];
          iov += 8;
          var curr = FS.read(stream, HEAP8, ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break;
        }
        return ret;
      }
      function _fd_read(fd, iov, iovcnt, pnum) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doReadv(stream, iov, iovcnt);
          HEAP32[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var HIGH_OFFSET = 4294967296;
          var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
          var DOUBLE_LIMIT = 9007199254740992;
          if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
            return 61;
          }
          FS.llseek(stream, offset, whence);
          (tempI64 = [
            stream.position >>> 0,
            ((tempDouble = stream.position),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[newOffset >> 2] = tempI64[0]),
            (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
          if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function _fd_sync(fd) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          if (stream.stream_ops && stream.stream_ops.fsync) {
            return -stream.stream_ops.fsync(stream);
          }
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function doWritev(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[(iov + 4) >> 2];
          iov += 8;
          var curr = FS.write(stream, HEAP8, ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
        }
        return ret;
      }
      function _fd_write(fd, iov, iovcnt, pnum) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doWritev(stream, iov, iovcnt);
          HEAP32[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function _getTempRet0() {
        return getTempRet0();
      }
      function _getentropy(buffer, size) {
        if (!_getentropy.randomDevice) {
          _getentropy.randomDevice = getRandomDevice();
        }
        for (var i = 0; i < size; i++) {
          HEAP8[(buffer + i) >> 0] = _getentropy.randomDevice();
        }
        return 0;
      }
      function _setTempRet0(val) {
        setTempRet0(val);
      }
      function __isLeapYear(year) {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      }
      function __arraySum(array, index) {
        var sum = 0;
        for (var i = 0; i <= index; sum += array[i++]) {}
        return sum;
      }
      var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      function __addDays(date, days) {
        var newDate = new Date(date.getTime());
        while (days > 0) {
          var leap = __isLeapYear(newDate.getFullYear());
          var currentMonth = newDate.getMonth();
          var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
          if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
              newDate.setMonth(currentMonth + 1);
            } else {
              newDate.setMonth(0);
              newDate.setFullYear(newDate.getFullYear() + 1);
            }
          } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate;
          }
        }
        return newDate;
      }
      function _strftime(s, maxsize, format, tm) {
        var tm_zone = HEAP32[(tm + 40) >> 2];
        var date = {
          tm_sec: HEAP32[tm >> 2],
          tm_min: HEAP32[(tm + 4) >> 2],
          tm_hour: HEAP32[(tm + 8) >> 2],
          tm_mday: HEAP32[(tm + 12) >> 2],
          tm_mon: HEAP32[(tm + 16) >> 2],
          tm_year: HEAP32[(tm + 20) >> 2],
          tm_wday: HEAP32[(tm + 24) >> 2],
          tm_yday: HEAP32[(tm + 28) >> 2],
          tm_isdst: HEAP32[(tm + 32) >> 2],
          tm_gmtoff: HEAP32[(tm + 36) >> 2],
          tm_zone: tm_zone ? UTF8ToString(tm_zone) : '',
        };
        var pattern = UTF8ToString(format);
        var EXPANSION_RULES_1 = {
          '%c': '%a %b %d %H:%M:%S %Y',
          '%D': '%m/%d/%y',
          '%F': '%Y-%m-%d',
          '%h': '%b',
          '%r': '%I:%M:%S %p',
          '%R': '%H:%M',
          '%T': '%H:%M:%S',
          '%x': '%m/%d/%y',
          '%X': '%H:%M:%S',
          '%Ec': '%c',
          '%EC': '%C',
          '%Ex': '%m/%d/%y',
          '%EX': '%H:%M:%S',
          '%Ey': '%y',
          '%EY': '%Y',
          '%Od': '%d',
          '%Oe': '%e',
          '%OH': '%H',
          '%OI': '%I',
          '%Om': '%m',
          '%OM': '%M',
          '%OS': '%S',
          '%Ou': '%u',
          '%OU': '%U',
          '%OV': '%V',
          '%Ow': '%w',
          '%OW': '%W',
          '%Oy': '%y',
        };
        for (var rule in EXPANSION_RULES_1) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
        }
        var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var MONTHS = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        function leadingSomething(value, digits, character) {
          var str = typeof value == 'number' ? value.toString() : value || '';
          while (str.length < digits) {
            str = character[0] + str;
          }
          return str;
        }
        function leadingNulls(value, digits) {
          return leadingSomething(value, digits, '0');
        }
        function compareByDay(date1, date2) {
          function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0;
          }
          var compare;
          if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
              compare = sgn(date1.getDate() - date2.getDate());
            }
          }
          return compare;
        }
        function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0:
              return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
              return janFourth;
            case 2:
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
              return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
              return new Date(janFourth.getFullYear() - 1, 11, 30);
          }
        }
        function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear() + 1;
            } else {
              return thisDate.getFullYear();
            }
          } else {
            return thisDate.getFullYear() - 1;
          }
        }
        var EXPANSION_RULES_2 = {
          '%a': function (date) {
            return WEEKDAYS[date.tm_wday].substring(0, 3);
          },
          '%A': function (date) {
            return WEEKDAYS[date.tm_wday];
          },
          '%b': function (date) {
            return MONTHS[date.tm_mon].substring(0, 3);
          },
          '%B': function (date) {
            return MONTHS[date.tm_mon];
          },
          '%C': function (date) {
            var year = date.tm_year + 1900;
            return leadingNulls((year / 100) | 0, 2);
          },
          '%d': function (date) {
            return leadingNulls(date.tm_mday, 2);
          },
          '%e': function (date) {
            return leadingSomething(date.tm_mday, 2, ' ');
          },
          '%g': function (date) {
            return getWeekBasedYear(date).toString().substring(2);
          },
          '%G': function (date) {
            return getWeekBasedYear(date);
          },
          '%H': function (date) {
            return leadingNulls(date.tm_hour, 2);
          },
          '%I': function (date) {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0) twelveHour = 12;
            else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2);
          },
          '%j': function (date) {
            return leadingNulls(
              date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1),
              3
            );
          },
          '%m': function (date) {
            return leadingNulls(date.tm_mon + 1, 2);
          },
          '%M': function (date) {
            return leadingNulls(date.tm_min, 2);
          },
          '%n': function () {
            return '\n';
          },
          '%p': function (date) {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
              return 'AM';
            } else {
              return 'PM';
            }
          },
          '%S': function (date) {
            return leadingNulls(date.tm_sec, 2);
          },
          '%t': function () {
            return '\t';
          },
          '%u': function (date) {
            return date.tm_wday || 7;
          },
          '%U': function (date) {
            var days = date.tm_yday + 7 - date.tm_wday;
            return leadingNulls(Math.floor(days / 7), 2);
          },
          '%V': function (date) {
            var val = Math.floor((date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7);
            if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
              val++;
            }
            if (!val) {
              val = 52;
              var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
              if (dec31 == 4 || (dec31 == 5 && __isLeapYear((date.tm_year % 400) - 1))) {
                val++;
              }
            } else if (val == 53) {
              var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
              if (jan1 != 4 && (jan1 != 3 || !__isLeapYear(date.tm_year))) val = 1;
            }
            return leadingNulls(val, 2);
          },
          '%w': function (date) {
            return date.tm_wday;
          },
          '%W': function (date) {
            var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
            return leadingNulls(Math.floor(days / 7), 2);
          },
          '%y': function (date) {
            return (date.tm_year + 1900).toString().substring(2);
          },
          '%Y': function (date) {
            return date.tm_year + 1900;
          },
          '%z': function (date) {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = (off / 60) * 100 + (off % 60);
            return (ahead ? '+' : '-') + String('0000' + off).slice(-4);
          },
          '%Z': function (date) {
            return date.tm_zone;
          },
          '%%': function () {
            return '%';
          },
        };
        pattern = pattern.replace(/%%/g, '\0\0');
        for (var rule in EXPANSION_RULES_2) {
          if (pattern.includes(rule)) {
            pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
          }
        }
        pattern = pattern.replace(/\0\0/g, '%');
        var bytes = intArrayFromString(pattern, false);
        if (bytes.length > maxsize) {
          return 0;
        }
        writeArrayToMemory(bytes, s);
        return bytes.length - 1;
      }
      function _strftime_l(s, maxsize, format, tm) {
        return _strftime(s, maxsize, format, tm);
      }
      var FSNode = function (parent, name, mode, rdev) {
        if (!parent) {
          parent = this;
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.mounted = null;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.node_ops = {};
        this.stream_ops = {};
        this.rdev = rdev;
      };
      var readMode = 292 | 73;
      var writeMode = 146;
      Object.defineProperties(FSNode.prototype, {
        read: {
          get: function () {
            return (this.mode & readMode) === readMode;
          },
          set: function (val) {
            val ? (this.mode |= readMode) : (this.mode &= ~readMode);
          },
        },
        write: {
          get: function () {
            return (this.mode & writeMode) === writeMode;
          },
          set: function (val) {
            val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
          },
        },
        isFolder: {
          get: function () {
            return FS.isDir(this.mode);
          },
        },
        isDevice: {
          get: function () {
            return FS.isChrdev(this.mode);
          },
        },
      });
      FS.FSNode = FSNode;
      FS.staticInit();
      embind_init_charCodes();
      BindingError = Module['BindingError'] = extendError(Error, 'BindingError');
      InternalError = Module['InternalError'] = extendError(Error, 'InternalError');
      init_ClassHandle();
      init_embind();
      init_RegisteredPointer();
      UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');
      init_emval();
      function intArrayFromString(stringy, dontAddNull, length) {
        var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
        var u8array = new Array(len);
        var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
        if (dontAddNull) u8array.length = numBytesWritten;
        return u8array;
      }
      var asmLibraryArg = {
        a: ___assert_fail,
        k: ___cxa_allocate_exception,
        t: ___cxa_begin_catch,
        ia: ___cxa_current_primary_exception,
        R: ___cxa_decrement_exception_refcount,
        v: ___cxa_end_catch,
        d: ___cxa_find_matching_catch_2,
        i: ___cxa_find_matching_catch_3,
        r: ___cxa_free_exception,
        Q: ___cxa_increment_exception_refcount,
        X: ___cxa_rethrow,
        ha: ___cxa_rethrow_primary_exception,
        p: ___cxa_throw,
        ja: ___cxa_uncaught_exceptions,
        g: ___resumeException,
        wa: ___syscall_fstat64,
        ca: ___syscall_ftruncate64,
        ta: ___syscall_lstat64,
        ua: ___syscall_newfstatat,
        xa: ___syscall_openat,
        na: ___syscall_renameat,
        va: ___syscall_stat64,
        la: ___syscall_unlinkat,
        Aa: __dlinit,
        Ca: __dlopen_js,
        Ba: __dlsym_js,
        da: __embind_register_bigint,
        Ea: __embind_register_bool,
        Ma: __embind_register_class,
        La: __embind_register_class_constructor,
        w: __embind_register_class_function,
        Da: __embind_register_emval,
        W: __embind_register_float,
        y: __embind_register_integer,
        s: __embind_register_memory_view,
        V: __embind_register_std_string,
        L: __embind_register_std_wstring,
        Fa: __embind_register_void,
        T: __emscripten_date_now,
        ya: __emscripten_get_now_is_monotonic,
        Ka: __emval_decref,
        ba: __emval_incref,
        G: __emval_take_value,
        oa: __mmap_js,
        pa: __munmap_js,
        b: _abort,
        ma: _emscripten_get_heap_max,
        K: _emscripten_get_now,
        za: _emscripten_memcpy_big,
        ka: _emscripten_resize_heap,
        qa: _environ_get,
        ra: _environ_sizes_get,
        Ga: _exit,
        U: _fd_close,
        S: _fd_read,
        aa: _fd_seek,
        sa: _fd_sync,
        J: _fd_write,
        c: _getTempRet0,
        ea: _getentropy,
        N: invoke_diii,
        Ja: invoke_fi,
        O: invoke_fiii,
        q: invoke_i,
        f: invoke_ii,
        Ha: invoke_iidii,
        e: invoke_iii,
        l: invoke_iiii,
        m: invoke_iiiii,
        ga: invoke_iiiiid,
        C: invoke_iiiiii,
        x: invoke_iiiiiii,
        P: invoke_iiiiiiii,
        F: invoke_iiiiiiiiiiii,
        $: invoke_j,
        _: invoke_jiiii,
        n: invoke_v,
        j: invoke_vi,
        h: invoke_vii,
        A: invoke_viid,
        M: invoke_viidi,
        o: invoke_viii,
        Ia: invoke_viiidiii,
        H: invoke_viiii,
        Y: invoke_viiiidi,
        Z: invoke_viiiii,
        u: invoke_viiiiiii,
        D: invoke_viiiiiiidi,
        I: invoke_viiiiiiii,
        B: invoke_viiiiiiiiii,
        E: invoke_viiiiiiiiiiiiiii,
        z: _setTempRet0,
        fa: _strftime_l,
      };
      var asm = createWasm();
      var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
        return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['Oa']).apply(null, arguments);
      });
      var _malloc = (Module['_malloc'] = function () {
        return (_malloc = Module['_malloc'] = Module['asm']['Qa']).apply(null, arguments);
      });
      var _free = (Module['_free'] = function () {
        return (_free = Module['_free'] = Module['asm']['Ra']).apply(null, arguments);
      });
      var ___getTypeName = (Module['___getTypeName'] = function () {
        return (___getTypeName = Module['___getTypeName'] = Module['asm']['Sa']).apply(null, arguments);
      });
      var ___embind_register_native_and_builtin_types = (Module['___embind_register_native_and_builtin_types'] = function () {
        return (___embind_register_native_and_builtin_types = Module['___embind_register_native_and_builtin_types'] =
          Module['asm']['Ta']).apply(null, arguments);
      });
      var ___stdio_exit = (Module['___stdio_exit'] = function () {
        return (___stdio_exit = Module['___stdio_exit'] = Module['asm']['Ua']).apply(null, arguments);
      });
      var ___funcs_on_exit = (Module['___funcs_on_exit'] = function () {
        return (___funcs_on_exit = Module['___funcs_on_exit'] = Module['asm']['Va']).apply(null, arguments);
      });
      var _emscripten_builtin_memalign = (Module['_emscripten_builtin_memalign'] = function () {
        return (_emscripten_builtin_memalign = Module['_emscripten_builtin_memalign'] = Module['asm']['Wa']).apply(null, arguments);
      });
      var _setThrew = (Module['_setThrew'] = function () {
        return (_setThrew = Module['_setThrew'] = Module['asm']['Xa']).apply(null, arguments);
      });
      var stackSave = (Module['stackSave'] = function () {
        return (stackSave = Module['stackSave'] = Module['asm']['Ya']).apply(null, arguments);
      });
      var stackRestore = (Module['stackRestore'] = function () {
        return (stackRestore = Module['stackRestore'] = Module['asm']['Za']).apply(null, arguments);
      });
      var ___cxa_can_catch = (Module['___cxa_can_catch'] = function () {
        return (___cxa_can_catch = Module['___cxa_can_catch'] = Module['asm']['_a']).apply(null, arguments);
      });
      var ___cxa_is_pointer_type = (Module['___cxa_is_pointer_type'] = function () {
        return (___cxa_is_pointer_type = Module['___cxa_is_pointer_type'] = Module['asm']['$a']).apply(null, arguments);
      });
      var dynCall_iiiij = (Module['dynCall_iiiij'] = function () {
        return (dynCall_iiiij = Module['dynCall_iiiij'] = Module['asm']['ab']).apply(null, arguments);
      });
      var dynCall_jii = (Module['dynCall_jii'] = function () {
        return (dynCall_jii = Module['dynCall_jii'] = Module['asm']['bb']).apply(null, arguments);
      });
      var dynCall_jjj = (Module['dynCall_jjj'] = function () {
        return (dynCall_jjj = Module['dynCall_jjj'] = Module['asm']['cb']).apply(null, arguments);
      });
      var dynCall_jji = (Module['dynCall_jji'] = function () {
        return (dynCall_jji = Module['dynCall_jji'] = Module['asm']['db']).apply(null, arguments);
      });
      var dynCall_jiii = (Module['dynCall_jiii'] = function () {
        return (dynCall_jiii = Module['dynCall_jiii'] = Module['asm']['eb']).apply(null, arguments);
      });
      var dynCall_iiiijj = (Module['dynCall_iiiijj'] = function () {
        return (dynCall_iiiijj = Module['dynCall_iiiijj'] = Module['asm']['fb']).apply(null, arguments);
      });
      var dynCall_viijj = (Module['dynCall_viijj'] = function () {
        return (dynCall_viijj = Module['dynCall_viijj'] = Module['asm']['gb']).apply(null, arguments);
      });
      var dynCall_viiijjjj = (Module['dynCall_viiijjjj'] = function () {
        return (dynCall_viiijjjj = Module['dynCall_viiijjjj'] = Module['asm']['hb']).apply(null, arguments);
      });
      var dynCall_iijjiiii = (Module['dynCall_iijjiiii'] = function () {
        return (dynCall_iijjiiii = Module['dynCall_iijjiiii'] = Module['asm']['ib']).apply(null, arguments);
      });
      var dynCall_jiji = (Module['dynCall_jiji'] = function () {
        return (dynCall_jiji = Module['dynCall_jiji'] = Module['asm']['jb']).apply(null, arguments);
      });
      var dynCall_j = (Module['dynCall_j'] = function () {
        return (dynCall_j = Module['dynCall_j'] = Module['asm']['kb']).apply(null, arguments);
      });
      var dynCall_viijii = (Module['dynCall_viijii'] = function () {
        return (dynCall_viijii = Module['dynCall_viijii'] = Module['asm']['lb']).apply(null, arguments);
      });
      var dynCall_jiiii = (Module['dynCall_jiiii'] = function () {
        return (dynCall_jiiii = Module['dynCall_jiiii'] = Module['asm']['mb']).apply(null, arguments);
      });
      var dynCall_iiiiij = (Module['dynCall_iiiiij'] = function () {
        return (dynCall_iiiiij = Module['dynCall_iiiiij'] = Module['asm']['nb']).apply(null, arguments);
      });
      var dynCall_iiiiijj = (Module['dynCall_iiiiijj'] = function () {
        return (dynCall_iiiiijj = Module['dynCall_iiiiijj'] = Module['asm']['ob']).apply(null, arguments);
      });
      var dynCall_iiiiiijj = (Module['dynCall_iiiiiijj'] = function () {
        return (dynCall_iiiiiijj = Module['dynCall_iiiiiijj'] = Module['asm']['pb']).apply(null, arguments);
      });
      function invoke_ii(index, a1) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iii(index, a1, a2) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_vi(index, a1) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_vii(index, a1, a2) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_i(index) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)();
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_fi(index, a1) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiii(index, a1, a2, a3, a4, a5) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_v(index) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)();
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiidi(index, a1, a2, a3, a4, a5, a6) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiidiii(index, a1, a2, a3, a4, a5, a6, a7) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viid(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viidi(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iidii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_fiii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_diii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_j(index) {
        var sp = stackSave();
        try {
          return dynCall_j(index);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_jiiii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          return dynCall_jiiii(index, a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      var calledRun;
      function ExitStatus(status) {
        this.name = 'ExitStatus';
        this.message = 'Program terminated with exit(' + status + ')';
        this.status = status;
      }
      dependenciesFulfilled = function runCaller() {
        if (!calledRun) run();
        if (!calledRun) dependenciesFulfilled = runCaller;
      };
      function run(args) {
        args = args || arguments_;
        if (runDependencies > 0) {
          return;
        }
        preRun();
        if (runDependencies > 0) {
          return;
        }
        function doRun() {
          if (calledRun) return;
          calledRun = true;
          Module['calledRun'] = true;
          if (ABORT) return;
          initRuntime();
          readyPromiseResolve(Module);
          if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
          postRun();
        }
        if (Module['setStatus']) {
          Module['setStatus']('Running...');
          setTimeout(function () {
            setTimeout(function () {
              Module['setStatus']('');
            }, 1);
            doRun();
          }, 1);
        } else {
          doRun();
        }
      }
      Module['run'] = run;
      function exit(status, implicit) {
        EXITSTATUS = status;
        if (!keepRuntimeAlive()) {
          exitRuntime();
        }
        procExit(status);
      }
      function procExit(code) {
        EXITSTATUS = code;
        if (!keepRuntimeAlive()) {
          if (Module['onExit']) Module['onExit'](code);
          ABORT = true;
        }
        quit_(code, new ExitStatus(code));
      }
      if (Module['preInit']) {
        if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
        while (Module['preInit'].length > 0) {
          Module['preInit'].pop()();
        }
      }
      run();

      return Module.ready;
    };
  })();
  createWasmMonoInstance = Module;
}

let createWasmMultiInstance;
{
  var Module = (() => {
    var _scriptDir = location.href;

    return function (Module) {
      Module = Module || {};

      function GROWABLE_HEAP_I8() {
        if (wasmMemory.buffer != buffer) {
          updateGlobalBufferAndViews(wasmMemory.buffer);
        }
        return HEAP8;
      }
      function GROWABLE_HEAP_U8() {
        if (wasmMemory.buffer != buffer) {
          updateGlobalBufferAndViews(wasmMemory.buffer);
        }
        return HEAPU8;
      }
      function GROWABLE_HEAP_I16() {
        if (wasmMemory.buffer != buffer) {
          updateGlobalBufferAndViews(wasmMemory.buffer);
        }
        return HEAP16;
      }
      function GROWABLE_HEAP_U16() {
        if (wasmMemory.buffer != buffer) {
          updateGlobalBufferAndViews(wasmMemory.buffer);
        }
        return HEAPU16;
      }
      function GROWABLE_HEAP_I32() {
        if (wasmMemory.buffer != buffer) {
          updateGlobalBufferAndViews(wasmMemory.buffer);
        }
        return HEAP32;
      }
      function GROWABLE_HEAP_U32() {
        if (wasmMemory.buffer != buffer) {
          updateGlobalBufferAndViews(wasmMemory.buffer);
        }
        return HEAPU32;
      }
      function GROWABLE_HEAP_F32() {
        if (wasmMemory.buffer != buffer) {
          updateGlobalBufferAndViews(wasmMemory.buffer);
        }
        return HEAPF32;
      }
      function GROWABLE_HEAP_F64() {
        if (wasmMemory.buffer != buffer) {
          updateGlobalBufferAndViews(wasmMemory.buffer);
        }
        return HEAPF64;
      }
      var Module = typeof Module != 'undefined' ? Module : {};
      var readyPromiseResolve, readyPromiseReject;
      Module['ready'] = new Promise(function (resolve, reject) {
        readyPromiseResolve = resolve;
        readyPromiseReject = reject;
      });
      var moduleOverrides = Object.assign({}, Module);
      var arguments_ = [];
      var thisProgram = './this.program';
      var quit_ = (status, toThrow) => {
        throw toThrow;
      };
      var ENVIRONMENT_IS_WEB = typeof window == 'object';
      var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
      var ENVIRONMENT_IS_NODE =
        typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
      var ENVIRONMENT_IS_PTHREAD = Module['ENVIRONMENT_IS_PTHREAD'] || false;
      var scriptDirectory = '';
      function locateFile(path) {
        if (Module['locateFile']) {
          return Module['locateFile'](path, scriptDirectory);
        }
        return scriptDirectory + path;
      }
      var read_, readAsync, readBinary, setWindowTitle;
      if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        if (ENVIRONMENT_IS_WORKER) {
          scriptDirectory = self.location.href;
        } else if (typeof document != 'undefined' && document.currentScript) {
          scriptDirectory = document.currentScript.src;
        }
        if (_scriptDir) {
          scriptDirectory = _scriptDir;
        }
        if (scriptDirectory.indexOf('blob:') !== 0) {
          scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1);
        } else {
          scriptDirectory = '';
        }
        {
          read_ = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send(null);
            return xhr.responseText;
          };
          if (ENVIRONMENT_IS_WORKER) {
            readBinary = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              xhr.responseType = 'arraybuffer';
              xhr.send(null);
              return new Uint8Array(xhr.response);
            };
          }
          readAsync = (url, onload, onerror) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
              if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                onload(xhr.response);
                return;
              }
              onerror();
            };
            xhr.onerror = onerror;
            xhr.send(null);
          };
        }
        setWindowTitle = (title) => (document.title = title);
      } else {
      }
      var out = Module['print'] || console.log.bind(console);
      var err = Module['printErr'] || console.warn.bind(console);
      Object.assign(Module, moduleOverrides);
      moduleOverrides = null;
      if (Module['arguments']) arguments_ = Module['arguments'];
      if (Module['thisProgram']) thisProgram = Module['thisProgram'];
      if (Module['quit']) quit_ = Module['quit'];
      function warnOnce(text) {
        if (!warnOnce.shown) warnOnce.shown = {};
        if (!warnOnce.shown[text]) {
          warnOnce.shown[text] = 1;
          err(text);
        }
      }
      var tempRet0 = 0;
      var setTempRet0 = (value) => {
        tempRet0 = value;
      };
      var getTempRet0 = () => tempRet0;
      var Atomics_load = Atomics.load;
      var Atomics_store = Atomics.store;
      var Atomics_compareExchange = Atomics.compareExchange;
      var wasmBinary;
      if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
      var noExitRuntime = Module['noExitRuntime'] || false;
      if (typeof WebAssembly != 'object') {
        abort('no native wasm support detected');
      }
      var wasmMemory;
      var wasmModule;
      var ABORT = false;
      var EXITSTATUS;
      function assert(condition, text) {
        if (!condition) {
          abort(text);
        }
      }
      var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
      function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
          return UTF8Decoder.decode(
            heapOrArray.buffer instanceof SharedArrayBuffer ? heapOrArray.slice(idx, endPtr) : heapOrArray.subarray(idx, endPtr)
          );
        } else {
          var str = '';
          while (idx < endPtr) {
            var u0 = heapOrArray[idx++];
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode(((u0 & 31) << 6) | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            } else {
              u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
            }
          }
        }
        return str;
      }
      function UTF8ToString(ptr, maxBytesToRead) {
        return ptr ? UTF8ArrayToString(GROWABLE_HEAP_U8(), ptr, maxBytesToRead) : '';
      }
      function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
        if (!(maxBytesToWrite > 0)) return 0;
        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite - 1;
        for (var i = 0; i < str.length; ++i) {
          var u = str.charCodeAt(i);
          if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
          }
          if (u <= 127) {
            if (outIdx >= endIdx) break;
            heap[outIdx++] = u;
          } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            heap[outIdx++] = 192 | (u >> 6);
            heap[outIdx++] = 128 | (u & 63);
          } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            heap[outIdx++] = 224 | (u >> 12);
            heap[outIdx++] = 128 | ((u >> 6) & 63);
            heap[outIdx++] = 128 | (u & 63);
          } else {
            if (outIdx + 3 >= endIdx) break;
            heap[outIdx++] = 240 | (u >> 18);
            heap[outIdx++] = 128 | ((u >> 12) & 63);
            heap[outIdx++] = 128 | ((u >> 6) & 63);
            heap[outIdx++] = 128 | (u & 63);
          }
        }
        heap[outIdx] = 0;
        return outIdx - startIdx;
      }
      function stringToUTF8(str, outPtr, maxBytesToWrite) {
        return stringToUTF8Array(str, GROWABLE_HEAP_U8(), outPtr, maxBytesToWrite);
      }
      function lengthBytesUTF8(str) {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var u = str.charCodeAt(i);
          if (u >= 55296 && u <= 57343) u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
          if (u <= 127) ++len;
          else if (u <= 2047) len += 2;
          else if (u <= 65535) len += 3;
          else len += 4;
        }
        return len;
      }
      var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;
      function UTF16ToString(ptr, maxBytesToRead) {
        var endPtr = ptr;
        var idx = endPtr >> 1;
        var maxIdx = idx + maxBytesToRead / 2;
        while (!(idx >= maxIdx) && GROWABLE_HEAP_U16()[idx]) ++idx;
        endPtr = idx << 1;
        if (endPtr - ptr > 32 && UTF16Decoder) {
          return UTF16Decoder.decode(GROWABLE_HEAP_U8().slice(ptr, endPtr));
        } else {
          var str = '';
          for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
            var codeUnit = GROWABLE_HEAP_I16()[(ptr + i * 2) >> 1];
            if (codeUnit == 0) break;
            str += String.fromCharCode(codeUnit);
          }
          return str;
        }
      }
      function stringToUTF16(str, outPtr, maxBytesToWrite) {
        if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 2) return 0;
        maxBytesToWrite -= 2;
        var startPtr = outPtr;
        var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
        for (var i = 0; i < numCharsToWrite; ++i) {
          var codeUnit = str.charCodeAt(i);
          GROWABLE_HEAP_I16()[outPtr >> 1] = codeUnit;
          outPtr += 2;
        }
        GROWABLE_HEAP_I16()[outPtr >> 1] = 0;
        return outPtr - startPtr;
      }
      function lengthBytesUTF16(str) {
        return str.length * 2;
      }
      function UTF32ToString(ptr, maxBytesToRead) {
        var i = 0;
        var str = '';
        while (!(i >= maxBytesToRead / 4)) {
          var utf32 = GROWABLE_HEAP_I32()[(ptr + i * 4) >> 2];
          if (utf32 == 0) break;
          ++i;
          if (utf32 >= 65536) {
            var ch = utf32 - 65536;
            str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
          } else {
            str += String.fromCharCode(utf32);
          }
        }
        return str;
      }
      function stringToUTF32(str, outPtr, maxBytesToWrite) {
        if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 4) return 0;
        var startPtr = outPtr;
        var endPtr = startPtr + maxBytesToWrite - 4;
        for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) {
            var trailSurrogate = str.charCodeAt(++i);
            codeUnit = (65536 + ((codeUnit & 1023) << 10)) | (trailSurrogate & 1023);
          }
          GROWABLE_HEAP_I32()[outPtr >> 2] = codeUnit;
          outPtr += 4;
          if (outPtr + 4 > endPtr) break;
        }
        GROWABLE_HEAP_I32()[outPtr >> 2] = 0;
        return outPtr - startPtr;
      }
      function lengthBytesUTF32(str) {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
          len += 4;
        }
        return len;
      }
      function writeArrayToMemory(array, buffer) {
        GROWABLE_HEAP_I8().set(array, buffer);
      }
      function writeAsciiToMemory(str, buffer, dontAddNull) {
        for (var i = 0; i < str.length; ++i) {
          GROWABLE_HEAP_I8()[buffer++ >> 0] = str.charCodeAt(i);
        }
        if (!dontAddNull) GROWABLE_HEAP_I8()[buffer >> 0] = 0;
      }
      var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
      if (ENVIRONMENT_IS_PTHREAD) {
        buffer = Module['buffer'];
      }
      function updateGlobalBufferAndViews(buf) {
        buffer = buf;
        Module['HEAP8'] = HEAP8 = new Int8Array(buf);
        Module['HEAP16'] = HEAP16 = new Int16Array(buf);
        Module['HEAP32'] = HEAP32 = new Int32Array(buf);
        Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
        Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
        Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
        Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
        Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
      }
      var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;
      if (ENVIRONMENT_IS_PTHREAD) {
        wasmMemory = Module['wasmMemory'];
        buffer = Module['buffer'];
      } else {
        if (Module['wasmMemory']) {
          wasmMemory = Module['wasmMemory'];
        } else {
          wasmMemory = new WebAssembly.Memory({ initial: INITIAL_MEMORY / 65536, maximum: 2147483648 / 65536, shared: true });
          if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
            err(
              'requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag'
            );
            if (ENVIRONMENT_IS_NODE) {
              console.log(
                '(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and also use a recent version)'
              );
            }
            throw Error('bad memory');
          }
        }
      }
      if (wasmMemory) {
        buffer = wasmMemory.buffer;
      }
      INITIAL_MEMORY = buffer.byteLength;
      updateGlobalBufferAndViews(buffer);
      var wasmTable;
      var __ATPRERUN__ = [];
      var __ATINIT__ = [];
      var __ATEXIT__ = [];
      var __ATPOSTRUN__ = [];
      var runtimeInitialized = false;
      var runtimeExited = false;
      var runtimeKeepaliveCounter = 0;
      function keepRuntimeAlive() {
        return noExitRuntime || runtimeKeepaliveCounter > 0;
      }
      function preRun() {
        if (Module['preRun']) {
          if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
          while (Module['preRun'].length) {
            addOnPreRun(Module['preRun'].shift());
          }
        }
        callRuntimeCallbacks(__ATPRERUN__);
      }
      function initRuntime() {
        runtimeInitialized = true;
        if (ENVIRONMENT_IS_PTHREAD) return;
        if (!Module['noFSInit'] && !FS.init.initialized) FS.init();
        FS.ignorePermissions = false;
        TTY.init();
        callRuntimeCallbacks(__ATINIT__);
      }
      function exitRuntime() {
        if (ENVIRONMENT_IS_PTHREAD) return;
        ___funcs_on_exit();
        callRuntimeCallbacks(__ATEXIT__);
        FS.quit();
        TTY.shutdown();
        PThread.terminateAllThreads();
        runtimeExited = true;
      }
      function postRun() {
        if (ENVIRONMENT_IS_PTHREAD) return;
        if (Module['postRun']) {
          if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
          while (Module['postRun'].length) {
            addOnPostRun(Module['postRun'].shift());
          }
        }
        callRuntimeCallbacks(__ATPOSTRUN__);
      }
      function addOnPreRun(cb) {
        __ATPRERUN__.unshift(cb);
      }
      function addOnInit(cb) {
        __ATINIT__.unshift(cb);
      }
      function addOnPostRun(cb) {
        __ATPOSTRUN__.unshift(cb);
      }
      var runDependencies = 0;
      var runDependencyWatcher = null;
      var dependenciesFulfilled = null;
      function getUniqueRunDependency(id) {
        return id;
      }
      function addRunDependency(id) {
        runDependencies++;
        if (Module['monitorRunDependencies']) {
          Module['monitorRunDependencies'](runDependencies);
        }
      }
      function removeRunDependency(id) {
        runDependencies--;
        if (Module['monitorRunDependencies']) {
          Module['monitorRunDependencies'](runDependencies);
        }
        if (runDependencies == 0) {
          if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null;
          }
          if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
          }
        }
      }
      function abort(what) {
        if (ENVIRONMENT_IS_PTHREAD) {
          postMessage({ cmd: 'onAbort', arg: what });
        } else {
          if (Module['onAbort']) {
            Module['onAbort'](what);
          }
        }
        what = 'Aborted(' + what + ')';
        err(what);
        ABORT = true;
        EXITSTATUS = 1;
        what += '. Build with -sASSERTIONS for more info.';
        var e = new WebAssembly.RuntimeError(what);
        readyPromiseReject(e);
        throw e;
      }
      var dataURIPrefix = 'data:application/octet-stream;base64,';
      function isDataURI(filename) {
        return filename.startsWith(dataURIPrefix);
      }
      var wasmBinaryFile;
      if (Module['locateFile']) {
        wasmBinaryFile = 'main-bin-multi.wasm';
        if (!isDataURI(wasmBinaryFile)) {
          wasmBinaryFile = locateFile(wasmBinaryFile);
        }
      } else {
        wasmBinaryFile = new URL('main-bin-multi.wasm', location.href).toString();
      }
      function getBinary(file) {
        try {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) {
            return readBinary(file);
          } else {
            throw 'both async and sync fetching of the wasm failed';
          }
        } catch (err) {
          abort(err);
        }
      }
      function getBinaryPromise() {
        if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
          if (typeof fetch == 'function') {
            return fetch(wasmBinaryFile, { credentials: 'same-origin' })
              .then(function (response) {
                if (!response['ok']) {
                  throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
                }
                return response['arrayBuffer']();
              })
              .catch(function () {
                return getBinary(wasmBinaryFile);
              });
          }
        }
        return Promise.resolve().then(function () {
          return getBinary(wasmBinaryFile);
        });
      }
      function createWasm() {
        var info = { a: asmLibraryArg };
        function receiveInstance(instance, module) {
          var exports = instance.exports;
          Module['asm'] = exports;
          registerTlsInit(Module['asm']['cb']);
          wasmTable = Module['asm']['Za'];
          addOnInit(Module['asm']['Ya']);
          wasmModule = module;
          if (!ENVIRONMENT_IS_PTHREAD) {
            var numWorkersToLoad = PThread.unusedWorkers.length;
            PThread.unusedWorkers.forEach(function (w) {
              PThread.loadWasmModuleToWorker(w, function () {
                if (!--numWorkersToLoad) removeRunDependency('wasm-instantiate');
              });
            });
          }
        }
        if (!ENVIRONMENT_IS_PTHREAD) {
          addRunDependency('wasm-instantiate');
        }
        function receiveInstantiationResult(result) {
          receiveInstance(result['instance'], result['module']);
        }
        function instantiateArrayBuffer(receiver) {
          return getBinaryPromise()
            .then(function (binary) {
              return WebAssembly.instantiate(binary, info);
            })
            .then(function (instance) {
              return instance;
            })
            .then(receiver, function (reason) {
              err('failed to asynchronously prepare wasm: ' + reason);
              abort(reason);
            });
        }
        function instantiateAsync() {
          if (
            !wasmBinary &&
            typeof WebAssembly.instantiateStreaming == 'function' &&
            !isDataURI(wasmBinaryFile) &&
            typeof fetch == 'function'
          ) {
            return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
              var result = WebAssembly.instantiateStreaming(response, info);
              return result.then(receiveInstantiationResult, function (reason) {
                err('wasm streaming compile failed: ' + reason);
                err('falling back to ArrayBuffer instantiation');
                return instantiateArrayBuffer(receiveInstantiationResult);
              });
            });
          } else {
            return instantiateArrayBuffer(receiveInstantiationResult);
          }
        }
        if (Module['instantiateWasm']) {
          try {
            var exports = Module['instantiateWasm'](info, receiveInstance);
            return exports;
          } catch (e) {
            err('Module.instantiateWasm callback failed with error: ' + e);
            return false;
          }
        }
        instantiateAsync().catch(readyPromiseReject);
        return {};
      }
      var tempDouble;
      var tempI64;
      var ASM_CONSTS = {};
      function killThread(pthread_ptr) {
        GROWABLE_HEAP_I32()[pthread_ptr >> 2] = 0;
        var pthread = PThread.pthreads[pthread_ptr];
        delete PThread.pthreads[pthread_ptr];
        pthread.worker.terminate();
        __emscripten_thread_free_data(pthread_ptr);
        PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(pthread.worker), 1);
        pthread.worker.pthread = undefined;
      }
      function cancelThread(pthread_ptr) {
        var pthread = PThread.pthreads[pthread_ptr];
        pthread.worker.postMessage({ cmd: 'cancel' });
      }
      function cleanupThread(pthread_ptr) {
        var pthread = PThread.pthreads[pthread_ptr];
        if (pthread) {
          GROWABLE_HEAP_I32()[pthread_ptr >> 2] = 0;
          var worker = pthread.worker;
          PThread.returnWorkerToPool(worker);
        }
      }
      function zeroMemory(address, size) {
        GROWABLE_HEAP_U8().fill(0, address, address + size);
      }
      function spawnThread(threadParams) {
        var worker = PThread.getNewWorker();
        if (!worker) {
          return 6;
        }
        PThread.runningWorkers.push(worker);
        var pthread = (PThread.pthreads[threadParams.pthread_ptr] = { worker: worker, threadInfoStruct: threadParams.pthread_ptr });
        worker.pthread = pthread;
        var msg = {
          cmd: 'run',
          start_routine: threadParams.startRoutine,
          arg: threadParams.arg,
          threadInfoStruct: threadParams.pthread_ptr,
        };
        worker.runPthread = () => {
          msg.time = performance.now();
          worker.postMessage(msg, threadParams.transferList);
        };
        if (worker.loaded) {
          worker.runPthread();
          delete worker.runPthread;
        }
        return 0;
      }
      function _exit(status) {
        exit(status);
      }
      function handleException(e) {
        if (e instanceof ExitStatus || e == 'unwind') {
          return EXITSTATUS;
        }
        quit_(1, e);
      }
      var PThread = {
        unusedWorkers: [],
        runningWorkers: [],
        tlsInitFunctions: [],
        init: function () {
          if (ENVIRONMENT_IS_PTHREAD) {
            PThread.initWorker();
          } else {
            PThread.initMainThread();
          }
        },
        initMainThread: function () {
          var pthreadPoolSize = 6;
          for (var i = 0; i < pthreadPoolSize; ++i) {
            PThread.allocateUnusedWorker();
          }
        },
        initWorker: function () {
          noExitRuntime = false;
        },
        pthreads: {},
        setExitStatus: function (status) {
          EXITSTATUS = status;
        },
        terminateAllThreads: function () {
          for (var t in PThread.pthreads) {
            var pthread = PThread.pthreads[t];
            if (pthread && pthread.worker) {
              PThread.returnWorkerToPool(pthread.worker);
            }
          }
          for (var i = 0; i < PThread.unusedWorkers.length; ++i) {
            var worker = PThread.unusedWorkers[i];
            worker.terminate();
          }
          PThread.unusedWorkers = [];
        },
        returnWorkerToPool: function (worker) {
          PThread.runWithoutMainThreadQueuedCalls(function () {
            delete PThread.pthreads[worker.pthread.threadInfoStruct];
            PThread.unusedWorkers.push(worker);
            PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
            __emscripten_thread_free_data(worker.pthread.threadInfoStruct);
            worker.pthread = undefined;
          });
        },
        runWithoutMainThreadQueuedCalls: function (func) {
          GROWABLE_HEAP_I32()[__emscripten_allow_main_runtime_queued_calls >> 2] = 0;
          try {
            func();
          } finally {
            GROWABLE_HEAP_I32()[__emscripten_allow_main_runtime_queued_calls >> 2] = 1;
          }
        },
        receiveObjectTransfer: function (data) {},
        threadInit: function () {
          for (var i in PThread.tlsInitFunctions) {
            if (PThread.tlsInitFunctions.hasOwnProperty(i)) PThread.tlsInitFunctions[i]();
          }
        },
        loadWasmModuleToWorker: function (worker, onFinishedLoading) {
          worker.onmessage = (e) => {
            var d = e['data'];
            var cmd = d['cmd'];
            if (worker.pthread) PThread.currentProxiedOperationCallerThread = worker.pthread.threadInfoStruct;
            if (d['targetThread'] && d['targetThread'] != _pthread_self()) {
              var thread = PThread.pthreads[d.targetThread];
              if (thread) {
                thread.worker.postMessage(d, d['transferList']);
              } else {
                err(
                  'Internal error! Worker sent a message "' +
                    cmd +
                    '" to target pthread ' +
                    d['targetThread'] +
                    ', but that thread no longer exists!'
                );
              }
              PThread.currentProxiedOperationCallerThread = undefined;
              return;
            }
            if (cmd === 'processProxyingQueue') {
              executeNotifiedProxyingQueue(d['queue']);
            } else if (cmd === 'spawnThread') {
              spawnThread(d);
            } else if (cmd === 'cleanupThread') {
              cleanupThread(d['thread']);
            } else if (cmd === 'killThread') {
              killThread(d['thread']);
            } else if (cmd === 'cancelThread') {
              cancelThread(d['thread']);
            } else if (cmd === 'loaded') {
              worker.loaded = true;
              if (onFinishedLoading) onFinishedLoading(worker);
              if (worker.runPthread) {
                worker.runPthread();
                delete worker.runPthread;
              }
            } else if (cmd === 'print') {
              out('Thread ' + d['threadId'] + ': ' + d['text']);
            } else if (cmd === 'printErr') {
              err('Thread ' + d['threadId'] + ': ' + d['text']);
            } else if (cmd === 'alert') {
              alert('Thread ' + d['threadId'] + ': ' + d['text']);
            } else if (d.target === 'setimmediate') {
              worker.postMessage(d);
            } else if (cmd === 'onAbort') {
              if (Module['onAbort']) {
                Module['onAbort'](d['arg']);
              }
            } else if (cmd) {
              err('worker sent an unknown command ' + cmd);
            }
            PThread.currentProxiedOperationCallerThread = undefined;
          };
          worker.onerror = (e) => {
            var message = 'worker sent an error!';
            err(message + ' ' + e.filename + ':' + e.lineno + ': ' + e.message);
            throw e;
          };
          worker.postMessage({ cmd: 'load', urlOrBlob: Module['mainScriptUrlOrBlob'], wasmMemory: wasmMemory, wasmModule: wasmModule });
        },
        allocateUnusedWorker: function () {
          if (!Module['locateFile']) {
            PThread.unusedWorkers.push(new Worker(new URL('main-bin-multi.worker.js', location.href)));
            return;
          }
          var pthreadMainJs = locateFile('main-bin-multi.worker.js');
          PThread.unusedWorkers.push(new Worker(pthreadMainJs, { type: 'module' }));
        },
        getNewWorker: function () {
          if (PThread.unusedWorkers.length == 0) {
            PThread.allocateUnusedWorker();
            PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
          }
          return PThread.unusedWorkers.pop();
        },
      };
      Module['PThread'] = PThread;
      function callRuntimeCallbacks(callbacks) {
        while (callbacks.length > 0) {
          var callback = callbacks.shift();
          if (typeof callback == 'function') {
            callback(Module);
            continue;
          }
          var func = callback.func;
          if (typeof func == 'number') {
            if (callback.arg === undefined) {
              getWasmTableEntry(func)();
            } else {
              getWasmTableEntry(func)(callback.arg);
            }
          } else {
            func(callback.arg === undefined ? null : callback.arg);
          }
        }
      }
      function withStackSave(f) {
        var stack = stackSave();
        var ret = f();
        stackRestore(stack);
        return ret;
      }
      function establishStackSpace() {
        var pthread_ptr = _pthread_self();
        var stackTop = GROWABLE_HEAP_I32()[(pthread_ptr + 44) >> 2];
        var stackSize = GROWABLE_HEAP_I32()[(pthread_ptr + 48) >> 2];
        var stackMax = stackTop - stackSize;
        _emscripten_stack_set_limits(stackTop, stackMax);
        stackRestore(stackTop);
      }
      Module['establishStackSpace'] = establishStackSpace;
      function exitOnMainThread(returnCode) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(1, 0, returnCode);
        try {
          _exit(returnCode);
        } catch (e) {
          handleException(e);
        }
      }
      var wasmTableMirror = [];
      function getWasmTableEntry(funcPtr) {
        var func = wasmTableMirror[funcPtr];
        if (!func) {
          if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
          wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
        }
        return func;
      }
      function invokeEntryPoint(ptr, arg) {
        return getWasmTableEntry(ptr)(arg);
      }
      Module['invokeEntryPoint'] = invokeEntryPoint;
      function registerTlsInit(tlsInitFunc) {
        PThread.tlsInitFunctions.push(tlsInitFunc);
      }
      function ___assert_fail(condition, filename, line, func) {
        abort(
          'Assertion failed: ' +
            UTF8ToString(condition) +
            ', at: ' +
            [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']
        );
      }
      function ___cxa_allocate_exception(size) {
        return _malloc(size + 24) + 24;
      }
      var exceptionCaught = [];
      function exception_addRef(info) {
        info.add_ref();
      }
      var uncaughtExceptionCount = 0;
      function ___cxa_begin_catch(ptr) {
        var info = new ExceptionInfo(ptr);
        if (!info.get_caught()) {
          info.set_caught(true);
          uncaughtExceptionCount--;
        }
        info.set_rethrown(false);
        exceptionCaught.push(info);
        exception_addRef(info);
        return info.get_exception_ptr();
      }
      function ___cxa_current_primary_exception() {
        if (!exceptionCaught.length) {
          return 0;
        }
        var info = exceptionCaught[exceptionCaught.length - 1];
        exception_addRef(info);
        return info.excPtr;
      }
      function ExceptionInfo(excPtr) {
        this.excPtr = excPtr;
        this.ptr = excPtr - 24;
        this.set_type = function (type) {
          GROWABLE_HEAP_U32()[(this.ptr + 4) >> 2] = type;
        };
        this.get_type = function () {
          return GROWABLE_HEAP_U32()[(this.ptr + 4) >> 2];
        };
        this.set_destructor = function (destructor) {
          GROWABLE_HEAP_U32()[(this.ptr + 8) >> 2] = destructor;
        };
        this.get_destructor = function () {
          return GROWABLE_HEAP_U32()[(this.ptr + 8) >> 2];
        };
        this.set_refcount = function (refcount) {
          GROWABLE_HEAP_I32()[this.ptr >> 2] = refcount;
        };
        this.set_caught = function (caught) {
          caught = caught ? 1 : 0;
          GROWABLE_HEAP_I8()[(this.ptr + 12) >> 0] = caught;
        };
        this.get_caught = function () {
          return GROWABLE_HEAP_I8()[(this.ptr + 12) >> 0] != 0;
        };
        this.set_rethrown = function (rethrown) {
          rethrown = rethrown ? 1 : 0;
          GROWABLE_HEAP_I8()[(this.ptr + 13) >> 0] = rethrown;
        };
        this.get_rethrown = function () {
          return GROWABLE_HEAP_I8()[(this.ptr + 13) >> 0] != 0;
        };
        this.init = function (type, destructor) {
          this.set_adjusted_ptr(0);
          this.set_type(type);
          this.set_destructor(destructor);
          this.set_refcount(0);
          this.set_caught(false);
          this.set_rethrown(false);
        };
        this.add_ref = function () {
          Atomics.add(GROWABLE_HEAP_I32(), (this.ptr + 0) >> 2, 1);
        };
        this.release_ref = function () {
          var prev = Atomics.sub(GROWABLE_HEAP_I32(), (this.ptr + 0) >> 2, 1);
          return prev === 1;
        };
        this.set_adjusted_ptr = function (adjustedPtr) {
          GROWABLE_HEAP_U32()[(this.ptr + 16) >> 2] = adjustedPtr;
        };
        this.get_adjusted_ptr = function () {
          return GROWABLE_HEAP_U32()[(this.ptr + 16) >> 2];
        };
        this.get_exception_ptr = function () {
          var isPointer = ___cxa_is_pointer_type(this.get_type());
          if (isPointer) {
            return GROWABLE_HEAP_U32()[this.excPtr >> 2];
          }
          var adjusted = this.get_adjusted_ptr();
          if (adjusted !== 0) return adjusted;
          return this.excPtr;
        };
      }
      function ___cxa_free_exception(ptr) {
        return _free(new ExceptionInfo(ptr).ptr);
      }
      function exception_decRef(info) {
        if (info.release_ref() && !info.get_rethrown()) {
          var destructor = info.get_destructor();
          if (destructor) {
            getWasmTableEntry(destructor)(info.excPtr);
          }
          ___cxa_free_exception(info.excPtr);
        }
      }
      function ___cxa_decrement_exception_refcount(ptr) {
        if (!ptr) return;
        exception_decRef(new ExceptionInfo(ptr));
      }
      var exceptionLast = 0;
      function ___cxa_end_catch() {
        _setThrew(0);
        var info = exceptionCaught.pop();
        exception_decRef(info);
        exceptionLast = 0;
      }
      function ___resumeException(ptr) {
        if (!exceptionLast) {
          exceptionLast = ptr;
        }
        throw ptr;
      }
      function ___cxa_find_matching_catch_2() {
        var thrown = exceptionLast;
        if (!thrown) {
          setTempRet0(0);
          return 0;
        }
        var info = new ExceptionInfo(thrown);
        info.set_adjusted_ptr(thrown);
        var thrownType = info.get_type();
        if (!thrownType) {
          setTempRet0(0);
          return thrown;
        }
        var typeArray = Array.prototype.slice.call(arguments);
        for (var i = 0; i < typeArray.length; i++) {
          var caughtType = typeArray[i];
          if (caughtType === 0 || caughtType === thrownType) {
            break;
          }
          var adjusted_ptr_addr = info.ptr + 16;
          if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
            setTempRet0(caughtType);
            return thrown;
          }
        }
        setTempRet0(thrownType);
        return thrown;
      }
      function ___cxa_find_matching_catch_3() {
        var thrown = exceptionLast;
        if (!thrown) {
          setTempRet0(0);
          return 0;
        }
        var info = new ExceptionInfo(thrown);
        info.set_adjusted_ptr(thrown);
        var thrownType = info.get_type();
        if (!thrownType) {
          setTempRet0(0);
          return thrown;
        }
        var typeArray = Array.prototype.slice.call(arguments);
        for (var i = 0; i < typeArray.length; i++) {
          var caughtType = typeArray[i];
          if (caughtType === 0 || caughtType === thrownType) {
            break;
          }
          var adjusted_ptr_addr = info.ptr + 16;
          if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
            setTempRet0(caughtType);
            return thrown;
          }
        }
        setTempRet0(thrownType);
        return thrown;
      }
      function ___cxa_increment_exception_refcount(ptr) {
        if (!ptr) return;
        exception_addRef(new ExceptionInfo(ptr));
      }
      function ___cxa_rethrow() {
        var info = exceptionCaught.pop();
        if (!info) {
          abort('no exception to throw');
        }
        var ptr = info.excPtr;
        if (!info.get_rethrown()) {
          exceptionCaught.push(info);
          info.set_rethrown(true);
          info.set_caught(false);
          uncaughtExceptionCount++;
        }
        exceptionLast = ptr;
        throw ptr;
      }
      function ___cxa_rethrow_primary_exception(ptr) {
        if (!ptr) return;
        var info = new ExceptionInfo(ptr);
        exceptionCaught.push(info);
        info.set_rethrown(true);
        ___cxa_rethrow();
      }
      function ___cxa_throw(ptr, type, destructor) {
        var info = new ExceptionInfo(ptr);
        info.init(type, destructor);
        exceptionLast = ptr;
        uncaughtExceptionCount++;
        throw ptr;
      }
      function ___cxa_uncaught_exceptions() {
        return uncaughtExceptionCount;
      }
      function ___emscripten_init_main_thread_js(tb) {
        __emscripten_thread_init(tb, !ENVIRONMENT_IS_WORKER, 1, !ENVIRONMENT_IS_WEB);
        PThread.threadInit();
      }
      function ___emscripten_thread_cleanup(thread) {
        if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
        else postMessage({ cmd: 'cleanupThread', thread: thread });
      }
      function pthreadCreateProxied(pthread_ptr, attr, start_routine, arg) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(2, 1, pthread_ptr, attr, start_routine, arg);
        return ___pthread_create_js(pthread_ptr, attr, start_routine, arg);
      }
      function ___pthread_create_js(pthread_ptr, attr, start_routine, arg) {
        if (typeof SharedArrayBuffer == 'undefined') {
          err('Current environment does not support SharedArrayBuffer, pthreads are not available!');
          return 6;
        }
        var transferList = [];
        var error = 0;
        if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
          return pthreadCreateProxied(pthread_ptr, attr, start_routine, arg);
        }
        if (error) return error;
        var threadParams = { startRoutine: start_routine, pthread_ptr: pthread_ptr, arg: arg, transferList: transferList };
        if (ENVIRONMENT_IS_PTHREAD) {
          threadParams.cmd = 'spawnThread';
          postMessage(threadParams, transferList);
          return 0;
        }
        return spawnThread(threadParams);
      }
      function setErrNo(value) {
        GROWABLE_HEAP_I32()[___errno_location() >> 2] = value;
        return value;
      }
      var PATH = {
        isAbs: (path) => path.charAt(0) === '/',
        splitPath: (filename) => {
          var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
          return splitPathRe.exec(filename).slice(1);
        },
        normalizeArray: (parts, allowAboveRoot) => {
          var up = 0;
          for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === '.') {
              parts.splice(i, 1);
            } else if (last === '..') {
              parts.splice(i, 1);
              up++;
            } else if (up) {
              parts.splice(i, 1);
              up--;
            }
          }
          if (allowAboveRoot) {
            for (; up; up--) {
              parts.unshift('..');
            }
          }
          return parts;
        },
        normalize: (path) => {
          var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === '/';
          path = PATH.normalizeArray(
            path.split('/').filter((p) => !!p),
            !isAbsolute
          ).join('/');
          if (!path && !isAbsolute) {
            path = '.';
          }
          if (path && trailingSlash) {
            path += '/';
          }
          return (isAbsolute ? '/' : '') + path;
        },
        dirname: (path) => {
          var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
          if (!root && !dir) {
            return '.';
          }
          if (dir) {
            dir = dir.substr(0, dir.length - 1);
          }
          return root + dir;
        },
        basename: (path) => {
          if (path === '/') return '/';
          path = PATH.normalize(path);
          path = path.replace(/\/$/, '');
          var lastSlash = path.lastIndexOf('/');
          if (lastSlash === -1) return path;
          return path.substr(lastSlash + 1);
        },
        join: function () {
          var paths = Array.prototype.slice.call(arguments, 0);
          return PATH.normalize(paths.join('/'));
        },
        join2: (l, r) => {
          return PATH.normalize(l + '/' + r);
        },
      };
      function getRandomDevice() {
        if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
          var randomBuffer = new Uint8Array(1);
          return function () {
            crypto.getRandomValues(randomBuffer);
            return randomBuffer[0];
          };
        } else
          return function () {
            abort('randomDevice');
          };
      }
      var PATH_FS = {
        resolve: function () {
          var resolvedPath = '',
            resolvedAbsolute = false;
          for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path != 'string') {
              throw new TypeError('Arguments to path.resolve must be strings');
            } else if (!path) {
              return '';
            }
            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = PATH.isAbs(path);
          }
          resolvedPath = PATH.normalizeArray(
            resolvedPath.split('/').filter((p) => !!p),
            !resolvedAbsolute
          ).join('/');
          return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
        },
        relative: (from, to) => {
          from = PATH_FS.resolve(from).substr(1);
          to = PATH_FS.resolve(to).substr(1);
          function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
              if (arr[start] !== '') break;
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
              if (arr[end] !== '') break;
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1);
          }
          var fromParts = trim(from.split('/'));
          var toParts = trim(to.split('/'));
          var length = Math.min(fromParts.length, toParts.length);
          var samePartsLength = length;
          for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
              samePartsLength = i;
              break;
            }
          }
          var outputParts = [];
          for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push('..');
          }
          outputParts = outputParts.concat(toParts.slice(samePartsLength));
          return outputParts.join('/');
        },
      };
      var TTY = {
        ttys: [],
        init: function () {},
        shutdown: function () {},
        register: function (dev, ops) {
          TTY.ttys[dev] = { input: [], output: [], ops: ops };
          FS.registerDevice(dev, TTY.stream_ops);
        },
        stream_ops: {
          open: function (stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
              throw new FS.ErrnoError(43);
            }
            stream.tty = tty;
            stream.seekable = false;
          },
          close: function (stream) {
            stream.tty.ops.flush(stream.tty);
          },
          flush: function (stream) {
            stream.tty.ops.flush(stream.tty);
          },
          read: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
              throw new FS.ErrnoError(60);
            }
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = stream.tty.ops.get_char(stream.tty);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset + i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
              throw new FS.ErrnoError(60);
            }
            try {
              for (var i = 0; i < length; i++) {
                stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
              }
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          },
        },
        default_tty_ops: {
          get_char: function (tty) {
            if (!tty.input.length) {
              var result = null;
              if (typeof window != 'undefined' && typeof window.prompt == 'function') {
                result = window.prompt('Input: ');
                if (result !== null) {
                  result += '\n';
                }
              } else if (typeof readline == 'function') {
                result = readline();
                if (result !== null) {
                  result += '\n';
                }
              }
              if (!result) {
                return null;
              }
              tty.input = intArrayFromString(result, true);
            }
            return tty.input.shift();
          },
          put_char: function (tty, val) {
            if (val === null || val === 10) {
              out(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },
          flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
              out(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          },
        },
        default_tty1_ops: {
          put_char: function (tty, val) {
            if (val === null || val === 10) {
              err(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },
          flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
              err(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          },
        },
      };
      function alignMemory(size, alignment) {
        return Math.ceil(size / alignment) * alignment;
      }
      function mmapAlloc(size) {
        size = alignMemory(size, 65536);
        var ptr = _emscripten_builtin_memalign(65536, size);
        if (!ptr) return 0;
        zeroMemory(ptr, size);
        return ptr;
      }
      var MEMFS = {
        ops_table: null,
        mount: function (mount) {
          return MEMFS.createNode(null, '/', 16384 | 511, 0);
        },
        createNode: function (parent, name, mode, dev) {
          if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(63);
          }
          if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
              dir: {
                node: {
                  getattr: MEMFS.node_ops.getattr,
                  setattr: MEMFS.node_ops.setattr,
                  lookup: MEMFS.node_ops.lookup,
                  mknod: MEMFS.node_ops.mknod,
                  rename: MEMFS.node_ops.rename,
                  unlink: MEMFS.node_ops.unlink,
                  rmdir: MEMFS.node_ops.rmdir,
                  readdir: MEMFS.node_ops.readdir,
                  symlink: MEMFS.node_ops.symlink,
                },
                stream: { llseek: MEMFS.stream_ops.llseek },
              },
              file: {
                node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
                stream: {
                  llseek: MEMFS.stream_ops.llseek,
                  read: MEMFS.stream_ops.read,
                  write: MEMFS.stream_ops.write,
                  allocate: MEMFS.stream_ops.allocate,
                  mmap: MEMFS.stream_ops.mmap,
                  msync: MEMFS.stream_ops.msync,
                },
              },
              link: {
                node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink },
                stream: {},
              },
              chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops },
            };
          }
          var node = FS.createNode(parent, name, mode, dev);
          if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {};
          } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null;
          } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream;
          } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream;
          }
          node.timestamp = Date.now();
          if (parent) {
            parent.contents[name] = node;
            parent.timestamp = node.timestamp;
          }
          return node;
        },
        getFileDataAsTypedArray: function (node) {
          if (!node.contents) return new Uint8Array(0);
          if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
          return new Uint8Array(node.contents);
        },
        expandFileStorage: function (node, newCapacity) {
          var prevCapacity = node.contents ? node.contents.length : 0;
          if (prevCapacity >= newCapacity) return;
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity);
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
        },
        resizeFileStorage: function (node, newSize) {
          if (node.usedBytes == newSize) return;
          if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0;
          } else {
            var oldContents = node.contents;
            node.contents = new Uint8Array(newSize);
            if (oldContents) {
              node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
            }
            node.usedBytes = newSize;
          }
        },
        node_ops: {
          getattr: function (node) {
            var attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
              attr.size = 4096;
            } else if (FS.isFile(node.mode)) {
              attr.size = node.usedBytes;
            } else if (FS.isLink(node.mode)) {
              attr.size = node.link.length;
            } else {
              attr.size = 0;
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr;
          },
          setattr: function (node, attr) {
            if (attr.mode !== undefined) {
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              node.timestamp = attr.timestamp;
            }
            if (attr.size !== undefined) {
              MEMFS.resizeFileStorage(node, attr.size);
            }
          },
          lookup: function (parent, name) {
            throw FS.genericErrors[44];
          },
          mknod: function (parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev);
          },
          rename: function (old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
              var new_node;
              try {
                new_node = FS.lookupNode(new_dir, new_name);
              } catch (e) {}
              if (new_node) {
                for (var i in new_node.contents) {
                  throw new FS.ErrnoError(55);
                }
              }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.parent.timestamp = Date.now();
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            new_dir.timestamp = old_node.parent.timestamp;
            old_node.parent = new_dir;
          },
          unlink: function (parent, name) {
            delete parent.contents[name];
            parent.timestamp = Date.now();
          },
          rmdir: function (parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
              throw new FS.ErrnoError(55);
            }
            delete parent.contents[name];
            parent.timestamp = Date.now();
          },
          readdir: function (node) {
            var entries = ['.', '..'];
            for (var key in node.contents) {
              if (!node.contents.hasOwnProperty(key)) {
                continue;
              }
              entries.push(key);
            }
            return entries;
          },
          symlink: function (parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node;
          },
          readlink: function (node) {
            if (!FS.isLink(node.mode)) {
              throw new FS.ErrnoError(28);
            }
            return node.link;
          },
        },
        stream_ops: {
          read: function (stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= stream.node.usedBytes) return 0;
            var size = Math.min(stream.node.usedBytes - position, length);
            if (size > 8 && contents.subarray) {
              buffer.set(contents.subarray(position, position + size), offset);
            } else {
              for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
            }
            return size;
          },
          write: function (stream, buffer, offset, length, position, canOwn) {
            if (buffer.buffer === GROWABLE_HEAP_I8().buffer) {
              canOwn = false;
            }
            if (!length) return 0;
            var node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
              if (canOwn) {
                node.contents = buffer.subarray(offset, offset + length);
                node.usedBytes = length;
                return length;
              } else if (node.usedBytes === 0 && position === 0) {
                node.contents = buffer.slice(offset, offset + length);
                node.usedBytes = length;
                return length;
              } else if (position + length <= node.usedBytes) {
                node.contents.set(buffer.subarray(offset, offset + length), position);
                return length;
              }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray) {
              node.contents.set(buffer.subarray(offset, offset + length), position);
            } else {
              for (var i = 0; i < length; i++) {
                node.contents[position + i] = buffer[offset + i];
              }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length;
          },
          llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
              position += stream.position;
            } else if (whence === 2) {
              if (FS.isFile(stream.node.mode)) {
                position += stream.node.usedBytes;
              }
            }
            if (position < 0) {
              throw new FS.ErrnoError(28);
            }
            return position;
          },
          allocate: function (stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
          },
          mmap: function (stream, address, length, position, prot, flags) {
            if (address !== 0) {
              throw new FS.ErrnoError(28);
            }
            if (!FS.isFile(stream.node.mode)) {
              throw new FS.ErrnoError(43);
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && contents.buffer === buffer) {
              allocated = false;
              ptr = contents.byteOffset;
            } else {
              if (position > 0 || position + length < contents.length) {
                if (contents.subarray) {
                  contents = contents.subarray(position, position + length);
                } else {
                  contents = Array.prototype.slice.call(contents, position, position + length);
                }
              }
              allocated = true;
              ptr = mmapAlloc(length);
              if (!ptr) {
                throw new FS.ErrnoError(48);
              }
              GROWABLE_HEAP_I8().set(contents, ptr);
            }
            return { ptr: ptr, allocated: allocated };
          },
          msync: function (stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
              throw new FS.ErrnoError(43);
            }
            if (mmapFlags & 2) {
              return 0;
            }
            var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0;
          },
        },
      };
      function asyncLoad(url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
        readAsync(
          url,
          function (arrayBuffer) {
            assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
            onload(new Uint8Array(arrayBuffer));
            if (dep) removeRunDependency(dep);
          },
          function (event) {
            if (onerror) {
              onerror();
            } else {
              throw 'Loading data file "' + url + '" failed.';
            }
          }
        );
        if (dep) addRunDependency(dep);
      }
      var FS = {
        root: null,
        mounts: [],
        devices: {},
        streams: [],
        nextInode: 1,
        nameTable: null,
        currentPath: '/',
        initialized: false,
        ignorePermissions: true,
        ErrnoError: null,
        genericErrors: {},
        filesystems: null,
        syncFSRequests: 0,
        lookupPath: (path, opts = {}) => {
          path = PATH_FS.resolve(FS.cwd(), path);
          if (!path) return { path: '', node: null };
          var defaults = { follow_mount: true, recurse_count: 0 };
          opts = Object.assign(defaults, opts);
          if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32);
          }
          var parts = PATH.normalizeArray(
            path.split('/').filter((p) => !!p),
            false
          );
          var current = FS.root;
          var current_path = '/';
          for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
              break;
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
              if (!islast || (islast && opts.follow_mount)) {
                current = current.mounted.root;
              }
            }
            if (!islast || opts.follow) {
              var count = 0;
              while (FS.isLink(current.mode)) {
                var link = FS.readlink(current_path);
                current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
                current = lookup.node;
                if (count++ > 40) {
                  throw new FS.ErrnoError(32);
                }
              }
            }
          }
          return { path: current_path, node: current };
        },
        getPath: (node) => {
          var path;
          while (true) {
            if (FS.isRoot(node)) {
              var mount = node.mount.mountpoint;
              if (!path) return mount;
              return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path;
            }
            path = path ? node.name + '/' + path : node.name;
            node = node.parent;
          }
        },
        hashName: (parentid, name) => {
          var hash = 0;
          for (var i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
          }
          return ((parentid + hash) >>> 0) % FS.nameTable.length;
        },
        hashAddNode: (node) => {
          var hash = FS.hashName(node.parent.id, node.name);
          node.name_next = FS.nameTable[hash];
          FS.nameTable[hash] = node;
        },
        hashRemoveNode: (node) => {
          var hash = FS.hashName(node.parent.id, node.name);
          if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next;
          } else {
            var current = FS.nameTable[hash];
            while (current) {
              if (current.name_next === node) {
                current.name_next = node.name_next;
                break;
              }
              current = current.name_next;
            }
          }
        },
        lookupNode: (parent, name) => {
          var errCode = FS.mayLookup(parent);
          if (errCode) {
            throw new FS.ErrnoError(errCode, parent);
          }
          var hash = FS.hashName(parent.id, name);
          for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
              return node;
            }
          }
          return FS.lookup(parent, name);
        },
        createNode: (parent, name, mode, rdev) => {
          var node = new FS.FSNode(parent, name, mode, rdev);
          FS.hashAddNode(node);
          return node;
        },
        destroyNode: (node) => {
          FS.hashRemoveNode(node);
        },
        isRoot: (node) => {
          return node === node.parent;
        },
        isMountpoint: (node) => {
          return !!node.mounted;
        },
        isFile: (mode) => {
          return (mode & 61440) === 32768;
        },
        isDir: (mode) => {
          return (mode & 61440) === 16384;
        },
        isLink: (mode) => {
          return (mode & 61440) === 40960;
        },
        isChrdev: (mode) => {
          return (mode & 61440) === 8192;
        },
        isBlkdev: (mode) => {
          return (mode & 61440) === 24576;
        },
        isFIFO: (mode) => {
          return (mode & 61440) === 4096;
        },
        isSocket: (mode) => {
          return (mode & 49152) === 49152;
        },
        flagModes: { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 },
        modeStringToFlags: (str) => {
          var flags = FS.flagModes[str];
          if (typeof flags == 'undefined') {
            throw new Error('Unknown file open mode: ' + str);
          }
          return flags;
        },
        flagsToPermissionString: (flag) => {
          var perms = ['r', 'w', 'rw'][flag & 3];
          if (flag & 512) {
            perms += 'w';
          }
          return perms;
        },
        nodePermissions: (node, perms) => {
          if (FS.ignorePermissions) {
            return 0;
          }
          if (perms.includes('r') && !(node.mode & 292)) {
            return 2;
          } else if (perms.includes('w') && !(node.mode & 146)) {
            return 2;
          } else if (perms.includes('x') && !(node.mode & 73)) {
            return 2;
          }
          return 0;
        },
        mayLookup: (dir) => {
          var errCode = FS.nodePermissions(dir, 'x');
          if (errCode) return errCode;
          if (!dir.node_ops.lookup) return 2;
          return 0;
        },
        mayCreate: (dir, name) => {
          try {
            var node = FS.lookupNode(dir, name);
            return 20;
          } catch (e) {}
          return FS.nodePermissions(dir, 'wx');
        },
        mayDelete: (dir, name, isdir) => {
          var node;
          try {
            node = FS.lookupNode(dir, name);
          } catch (e) {
            return e.errno;
          }
          var errCode = FS.nodePermissions(dir, 'wx');
          if (errCode) {
            return errCode;
          }
          if (isdir) {
            if (!FS.isDir(node.mode)) {
              return 54;
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
              return 10;
            }
          } else {
            if (FS.isDir(node.mode)) {
              return 31;
            }
          }
          return 0;
        },
        mayOpen: (node, flags) => {
          if (!node) {
            return 44;
          }
          if (FS.isLink(node.mode)) {
            return 32;
          } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
              return 31;
            }
          }
          return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
        },
        MAX_OPEN_FDS: 4096,
        nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
          for (var fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
              return fd;
            }
          }
          throw new FS.ErrnoError(33);
        },
        getStream: (fd) => FS.streams[fd],
        createStream: (stream, fd_start, fd_end) => {
          if (!FS.FSStream) {
            FS.FSStream = function () {
              this.shared = {};
            };
            FS.FSStream.prototype = {
              object: {
                get: function () {
                  return this.node;
                },
                set: function (val) {
                  this.node = val;
                },
              },
              isRead: {
                get: function () {
                  return (this.flags & 2097155) !== 1;
                },
              },
              isWrite: {
                get: function () {
                  return (this.flags & 2097155) !== 0;
                },
              },
              isAppend: {
                get: function () {
                  return this.flags & 1024;
                },
              },
              flags: {
                get: function () {
                  return this.shared.flags;
                },
                set: function (val) {
                  this.shared.flags = val;
                },
              },
              position: {
                get function() {
                  return this.shared.position;
                },
                set: function (val) {
                  this.shared.position = val;
                },
              },
            };
          }
          stream = Object.assign(new FS.FSStream(), stream);
          var fd = FS.nextfd(fd_start, fd_end);
          stream.fd = fd;
          FS.streams[fd] = stream;
          return stream;
        },
        closeStream: (fd) => {
          FS.streams[fd] = null;
        },
        chrdev_stream_ops: {
          open: (stream) => {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
              stream.stream_ops.open(stream);
            }
          },
          llseek: () => {
            throw new FS.ErrnoError(70);
          },
        },
        major: (dev) => dev >> 8,
        minor: (dev) => dev & 255,
        makedev: (ma, mi) => (ma << 8) | mi,
        registerDevice: (dev, ops) => {
          FS.devices[dev] = { stream_ops: ops };
        },
        getDevice: (dev) => FS.devices[dev],
        getMounts: (mount) => {
          var mounts = [];
          var check = [mount];
          while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts);
          }
          return mounts;
        },
        syncfs: (populate, callback) => {
          if (typeof populate == 'function') {
            callback = populate;
            populate = false;
          }
          FS.syncFSRequests++;
          if (FS.syncFSRequests > 1) {
            err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
          }
          var mounts = FS.getMounts(FS.root.mount);
          var completed = 0;
          function doCallback(errCode) {
            FS.syncFSRequests--;
            return callback(errCode);
          }
          function done(errCode) {
            if (errCode) {
              if (!done.errored) {
                done.errored = true;
                return doCallback(errCode);
              }
              return;
            }
            if (++completed >= mounts.length) {
              doCallback(null);
            }
          }
          mounts.forEach((mount) => {
            if (!mount.type.syncfs) {
              return done(null);
            }
            mount.type.syncfs(mount, populate, done);
          });
        },
        mount: (type, opts, mountpoint) => {
          var root = mountpoint === '/';
          var pseudo = !mountpoint;
          var node;
          if (root && FS.root) {
            throw new FS.ErrnoError(10);
          } else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
              throw new FS.ErrnoError(10);
            }
            if (!FS.isDir(node.mode)) {
              throw new FS.ErrnoError(54);
            }
          }
          var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] };
          var mountRoot = type.mount(mount);
          mountRoot.mount = mount;
          mount.root = mountRoot;
          if (root) {
            FS.root = mountRoot;
          } else if (node) {
            node.mounted = mount;
            if (node.mount) {
              node.mount.mounts.push(mount);
            }
          }
          return mountRoot;
        },
        unmount: (mountpoint) => {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
          if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(28);
          }
          var node = lookup.node;
          var mount = node.mounted;
          var mounts = FS.getMounts(mount);
          Object.keys(FS.nameTable).forEach((hash) => {
            var current = FS.nameTable[hash];
            while (current) {
              var next = current.name_next;
              if (mounts.includes(current.mount)) {
                FS.destroyNode(current);
              }
              current = next;
            }
          });
          node.mounted = null;
          var idx = node.mount.mounts.indexOf(mount);
          node.mount.mounts.splice(idx, 1);
        },
        lookup: (parent, name) => {
          return parent.node_ops.lookup(parent, name);
        },
        mknod: (path, mode, dev) => {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          var name = PATH.basename(path);
          if (!name || name === '.' || name === '..') {
            throw new FS.ErrnoError(28);
          }
          var errCode = FS.mayCreate(parent, name);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(63);
          }
          return parent.node_ops.mknod(parent, name, mode, dev);
        },
        create: (path, mode) => {
          mode = mode !== undefined ? mode : 438;
          mode &= 4095;
          mode |= 32768;
          return FS.mknod(path, mode, 0);
        },
        mkdir: (path, mode) => {
          mode = mode !== undefined ? mode : 511;
          mode &= 511 | 512;
          mode |= 16384;
          return FS.mknod(path, mode, 0);
        },
        mkdirTree: (path, mode) => {
          var dirs = path.split('/');
          var d = '';
          for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) continue;
            d += '/' + dirs[i];
            try {
              FS.mkdir(d, mode);
            } catch (e) {
              if (e.errno != 20) throw e;
            }
          }
        },
        mkdev: (path, mode, dev) => {
          if (typeof dev == 'undefined') {
            dev = mode;
            mode = 438;
          }
          mode |= 8192;
          return FS.mknod(path, mode, dev);
        },
        symlink: (oldpath, newpath) => {
          if (!PATH_FS.resolve(oldpath)) {
            throw new FS.ErrnoError(44);
          }
          var lookup = FS.lookupPath(newpath, { parent: true });
          var parent = lookup.node;
          if (!parent) {
            throw new FS.ErrnoError(44);
          }
          var newname = PATH.basename(newpath);
          var errCode = FS.mayCreate(parent, newname);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(63);
          }
          return parent.node_ops.symlink(parent, newname, oldpath);
        },
        rename: (old_path, new_path) => {
          var old_dirname = PATH.dirname(old_path);
          var new_dirname = PATH.dirname(new_path);
          var old_name = PATH.basename(old_path);
          var new_name = PATH.basename(new_path);
          var lookup, old_dir, new_dir;
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
          if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
          if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(75);
          }
          var old_node = FS.lookupNode(old_dir, old_name);
          var relative = PATH_FS.relative(old_path, new_dirname);
          if (relative.charAt(0) !== '.') {
            throw new FS.ErrnoError(28);
          }
          relative = PATH_FS.relative(new_path, old_dirname);
          if (relative.charAt(0) !== '.') {
            throw new FS.ErrnoError(55);
          }
          var new_node;
          try {
            new_node = FS.lookupNode(new_dir, new_name);
          } catch (e) {}
          if (old_node === new_node) {
            return;
          }
          var isdir = FS.isDir(old_node.mode);
          var errCode = FS.mayDelete(old_dir, old_name, isdir);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
            throw new FS.ErrnoError(10);
          }
          if (new_dir !== old_dir) {
            errCode = FS.nodePermissions(old_dir, 'w');
            if (errCode) {
              throw new FS.ErrnoError(errCode);
            }
          }
          FS.hashRemoveNode(old_node);
          try {
            old_dir.node_ops.rename(old_node, new_dir, new_name);
          } catch (e) {
            throw e;
          } finally {
            FS.hashAddNode(old_node);
          }
        },
        rmdir: (path) => {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          var name = PATH.basename(path);
          var node = FS.lookupNode(parent, name);
          var errCode = FS.mayDelete(parent, name, true);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
          parent.node_ops.rmdir(parent, name);
          FS.destroyNode(node);
        },
        readdir: (path) => {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54);
          }
          return node.node_ops.readdir(node);
        },
        unlink: (path) => {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          if (!parent) {
            throw new FS.ErrnoError(44);
          }
          var name = PATH.basename(path);
          var node = FS.lookupNode(parent, name);
          var errCode = FS.mayDelete(parent, name, false);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
          parent.node_ops.unlink(parent, name);
          FS.destroyNode(node);
        },
        readlink: (path) => {
          var lookup = FS.lookupPath(path);
          var link = lookup.node;
          if (!link) {
            throw new FS.ErrnoError(44);
          }
          if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(28);
          }
          return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
        },
        stat: (path, dontFollow) => {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          var node = lookup.node;
          if (!node) {
            throw new FS.ErrnoError(44);
          }
          if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(63);
          }
          return node.node_ops.getattr(node);
        },
        lstat: (path) => {
          return FS.stat(path, true);
        },
        chmod: (path, mode, dontFollow) => {
          var node;
          if (typeof path == 'string') {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
          }
          node.node_ops.setattr(node, { mode: (mode & 4095) | (node.mode & ~4095), timestamp: Date.now() });
        },
        lchmod: (path, mode) => {
          FS.chmod(path, mode, true);
        },
        fchmod: (fd, mode) => {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          FS.chmod(stream.node, mode);
        },
        chown: (path, uid, gid, dontFollow) => {
          var node;
          if (typeof path == 'string') {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
          }
          node.node_ops.setattr(node, { timestamp: Date.now() });
        },
        lchown: (path, uid, gid) => {
          FS.chown(path, uid, gid, true);
        },
        fchown: (fd, uid, gid) => {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          FS.chown(stream.node, uid, gid);
        },
        truncate: (path, len) => {
          if (len < 0) {
            throw new FS.ErrnoError(28);
          }
          var node;
          if (typeof path == 'string') {
            var lookup = FS.lookupPath(path, { follow: true });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(31);
          }
          if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          var errCode = FS.nodePermissions(node, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
        },
        ftruncate: (fd, len) => {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28);
          }
          FS.truncate(stream.node, len);
        },
        utime: (path, atime, mtime) => {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
        },
        open: (path, flags, mode) => {
          if (path === '') {
            throw new FS.ErrnoError(44);
          }
          flags = typeof flags == 'string' ? FS.modeStringToFlags(flags) : flags;
          mode = typeof mode == 'undefined' ? 438 : mode;
          if (flags & 64) {
            mode = (mode & 4095) | 32768;
          } else {
            mode = 0;
          }
          var node;
          if (typeof path == 'object') {
            node = path;
          } else {
            path = PATH.normalize(path);
            try {
              var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
              node = lookup.node;
            } catch (e) {}
          }
          var created = false;
          if (flags & 64) {
            if (node) {
              if (flags & 128) {
                throw new FS.ErrnoError(20);
              }
            } else {
              node = FS.mknod(path, mode, 0);
              created = true;
            }
          }
          if (!node) {
            throw new FS.ErrnoError(44);
          }
          if (FS.isChrdev(node.mode)) {
            flags &= ~512;
          }
          if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
          if (!created) {
            var errCode = FS.mayOpen(node, flags);
            if (errCode) {
              throw new FS.ErrnoError(errCode);
            }
          }
          if (flags & 512 && !created) {
            FS.truncate(node, 0);
          }
          flags &= ~(128 | 512 | 131072);
          var stream = FS.createStream({
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: false,
          });
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
          if (Module['logReadFiles'] && !(flags & 1)) {
            if (!FS.readFiles) FS.readFiles = {};
            if (!(path in FS.readFiles)) {
              FS.readFiles[path] = 1;
            }
          }
          return stream;
        },
        close: (stream) => {
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if (stream.getdents) stream.getdents = null;
          try {
            if (stream.stream_ops.close) {
              stream.stream_ops.close(stream);
            }
          } catch (e) {
            throw e;
          } finally {
            FS.closeStream(stream.fd);
          }
          stream.fd = null;
        },
        isClosed: (stream) => {
          return stream.fd === null;
        },
        llseek: (stream, offset, whence) => {
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(70);
          }
          if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(28);
          }
          stream.position = stream.stream_ops.llseek(stream, offset, whence);
          stream.ungotten = [];
          return stream.position;
        },
        read: (stream, buffer, offset, length, position) => {
          if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
          }
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(8);
          }
          if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
          }
          if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(28);
          }
          var seeking = typeof position != 'undefined';
          if (!seeking) {
            position = stream.position;
          } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
          }
          var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
          if (!seeking) stream.position += bytesRead;
          return bytesRead;
        },
        write: (stream, buffer, offset, length, position, canOwn) => {
          if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
          }
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
          }
          if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
          }
          if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(28);
          }
          if (stream.seekable && stream.flags & 1024) {
            FS.llseek(stream, 0, 2);
          }
          var seeking = typeof position != 'undefined';
          if (!seeking) {
            position = stream.position;
          } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
          }
          var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
          if (!seeking) stream.position += bytesWritten;
          return bytesWritten;
        },
        allocate: (stream, offset, length) => {
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(28);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
          }
          if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(138);
          }
          stream.stream_ops.allocate(stream, offset, length);
        },
        mmap: (stream, address, length, position, prot, flags) => {
          if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(2);
          }
          if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2);
          }
          if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43);
          }
          return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
        },
        msync: (stream, buffer, offset, length, mmapFlags) => {
          if (!stream || !stream.stream_ops.msync) {
            return 0;
          }
          return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
        },
        munmap: (stream) => 0,
        ioctl: (stream, cmd, arg) => {
          if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59);
          }
          return stream.stream_ops.ioctl(stream, cmd, arg);
        },
        readFile: (path, opts = {}) => {
          opts.flags = opts.flags || 0;
          opts.encoding = opts.encoding || 'binary';
          if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
            throw new Error('Invalid encoding type "' + opts.encoding + '"');
          }
          var ret;
          var stream = FS.open(path, opts.flags);
          var stat = FS.stat(path);
          var length = stat.size;
          var buf = new Uint8Array(length);
          FS.read(stream, buf, 0, length, 0);
          if (opts.encoding === 'utf8') {
            ret = UTF8ArrayToString(buf, 0);
          } else if (opts.encoding === 'binary') {
            ret = buf;
          }
          FS.close(stream);
          return ret;
        },
        writeFile: (path, data, opts = {}) => {
          opts.flags = opts.flags || 577;
          var stream = FS.open(path, opts.flags, opts.mode);
          if (typeof data == 'string') {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
          } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
          } else {
            throw new Error('Unsupported data type');
          }
          FS.close(stream);
        },
        cwd: () => FS.currentPath,
        chdir: (path) => {
          var lookup = FS.lookupPath(path, { follow: true });
          if (lookup.node === null) {
            throw new FS.ErrnoError(44);
          }
          if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(54);
          }
          var errCode = FS.nodePermissions(lookup.node, 'x');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          FS.currentPath = lookup.path;
        },
        createDefaultDirectories: () => {
          FS.mkdir('/tmp');
          FS.mkdir('/home');
          FS.mkdir('/home/web_user');
        },
        createDefaultDevices: () => {
          FS.mkdir('/dev');
          FS.registerDevice(FS.makedev(1, 3), { read: () => 0, write: (stream, buffer, offset, length, pos) => length });
          FS.mkdev('/dev/null', FS.makedev(1, 3));
          TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
          TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
          FS.mkdev('/dev/tty', FS.makedev(5, 0));
          FS.mkdev('/dev/tty1', FS.makedev(6, 0));
          var random_device = getRandomDevice();
          FS.createDevice('/dev', 'random', random_device);
          FS.createDevice('/dev', 'urandom', random_device);
          FS.mkdir('/dev/shm');
          FS.mkdir('/dev/shm/tmp');
        },
        createSpecialDirectories: () => {
          FS.mkdir('/proc');
          var proc_self = FS.mkdir('/proc/self');
          FS.mkdir('/proc/self/fd');
          FS.mount(
            {
              mount: () => {
                var node = FS.createNode(proc_self, 'fd', 16384 | 511, 73);
                node.node_ops = {
                  lookup: (parent, name) => {
                    var fd = +name;
                    var stream = FS.getStream(fd);
                    if (!stream) throw new FS.ErrnoError(8);
                    var ret = { parent: null, mount: { mountpoint: 'fake' }, node_ops: { readlink: () => stream.path } };
                    ret.parent = ret;
                    return ret;
                  },
                };
                return node;
              },
            },
            {},
            '/proc/self/fd'
          );
        },
        createStandardStreams: () => {
          if (Module['stdin']) {
            FS.createDevice('/dev', 'stdin', Module['stdin']);
          } else {
            FS.symlink('/dev/tty', '/dev/stdin');
          }
          if (Module['stdout']) {
            FS.createDevice('/dev', 'stdout', null, Module['stdout']);
          } else {
            FS.symlink('/dev/tty', '/dev/stdout');
          }
          if (Module['stderr']) {
            FS.createDevice('/dev', 'stderr', null, Module['stderr']);
          } else {
            FS.symlink('/dev/tty1', '/dev/stderr');
          }
          var stdin = FS.open('/dev/stdin', 0);
          var stdout = FS.open('/dev/stdout', 1);
          var stderr = FS.open('/dev/stderr', 1);
        },
        ensureErrnoError: () => {
          if (FS.ErrnoError) return;
          FS.ErrnoError = function ErrnoError(errno, node) {
            this.node = node;
            this.setErrno = function (errno) {
              this.errno = errno;
            };
            this.setErrno(errno);
            this.message = 'FS error';
          };
          FS.ErrnoError.prototype = new Error();
          FS.ErrnoError.prototype.constructor = FS.ErrnoError;
          [44].forEach((code) => {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = '<generic error, no stack>';
          });
        },
        staticInit: () => {
          FS.ensureErrnoError();
          FS.nameTable = new Array(4096);
          FS.mount(MEMFS, {}, '/');
          FS.createDefaultDirectories();
          FS.createDefaultDevices();
          FS.createSpecialDirectories();
          FS.filesystems = { MEMFS: MEMFS };
        },
        init: (input, output, error) => {
          FS.init.initialized = true;
          FS.ensureErrnoError();
          Module['stdin'] = input || Module['stdin'];
          Module['stdout'] = output || Module['stdout'];
          Module['stderr'] = error || Module['stderr'];
          FS.createStandardStreams();
        },
        quit: () => {
          FS.init.initialized = false;
          ___stdio_exit();
          for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
              continue;
            }
            FS.close(stream);
          }
        },
        getMode: (canRead, canWrite) => {
          var mode = 0;
          if (canRead) mode |= 292 | 73;
          if (canWrite) mode |= 146;
          return mode;
        },
        findObject: (path, dontResolveLastLink) => {
          var ret = FS.analyzePath(path, dontResolveLastLink);
          if (ret.exists) {
            return ret.object;
          } else {
            return null;
          }
        },
        analyzePath: (path, dontResolveLastLink) => {
          try {
            var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            path = lookup.path;
          } catch (e) {}
          var ret = {
            isRoot: false,
            exists: false,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: false,
            parentPath: null,
            parentObject: null,
          };
          try {
            var lookup = FS.lookupPath(path, { parent: true });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === '/';
          } catch (e) {
            ret.error = e.errno;
          }
          return ret;
        },
        createPath: (parent, path, canRead, canWrite) => {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          var parts = path.split('/').reverse();
          while (parts.length) {
            var part = parts.pop();
            if (!part) continue;
            var current = PATH.join2(parent, part);
            try {
              FS.mkdir(current);
            } catch (e) {}
            parent = current;
          }
          return current;
        },
        createFile: (parent, name, properties, canRead, canWrite) => {
          var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(canRead, canWrite);
          return FS.create(path, mode);
        },
        createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
          var path = name;
          if (parent) {
            parent = typeof parent == 'string' ? parent : FS.getPath(parent);
            path = name ? PATH.join2(parent, name) : parent;
          }
          var mode = FS.getMode(canRead, canWrite);
          var node = FS.create(path, mode);
          if (data) {
            if (typeof data == 'string') {
              var arr = new Array(data.length);
              for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
              data = arr;
            }
            FS.chmod(node, mode | 146);
            var stream = FS.open(node, 577);
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode);
          }
          return node;
        },
        createDevice: (parent, name, input, output) => {
          var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(!!input, !!output);
          if (!FS.createDevice.major) FS.createDevice.major = 64;
          var dev = FS.makedev(FS.createDevice.major++, 0);
          FS.registerDevice(dev, {
            open: (stream) => {
              stream.seekable = false;
            },
            close: (stream) => {
              if (output && output.buffer && output.buffer.length) {
                output(10);
              }
            },
            read: (stream, buffer, offset, length, pos) => {
              var bytesRead = 0;
              for (var i = 0; i < length; i++) {
                var result;
                try {
                  result = input();
                } catch (e) {
                  throw new FS.ErrnoError(29);
                }
                if (result === undefined && bytesRead === 0) {
                  throw new FS.ErrnoError(6);
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset + i] = result;
              }
              if (bytesRead) {
                stream.node.timestamp = Date.now();
              }
              return bytesRead;
            },
            write: (stream, buffer, offset, length, pos) => {
              for (var i = 0; i < length; i++) {
                try {
                  output(buffer[offset + i]);
                } catch (e) {
                  throw new FS.ErrnoError(29);
                }
              }
              if (length) {
                stream.node.timestamp = Date.now();
              }
              return i;
            },
          });
          return FS.mkdev(path, mode, dev);
        },
        forceLoadFile: (obj) => {
          if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
          if (typeof XMLHttpRequest != 'undefined') {
            throw new Error(
              'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
            );
          } else if (read_) {
            try {
              obj.contents = intArrayFromString(read_(obj.url), true);
              obj.usedBytes = obj.contents.length;
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
          } else {
            throw new Error('Cannot load without read() or XMLHttpRequest.');
          }
        },
        createLazyFile: (parent, name, url, canRead, canWrite) => {
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = [];
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length - 1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = (idx / this.chunkSize) | 0;
            return this.getter(chunkNum)[chunkOffset];
          };
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          };
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
              throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
            var datalength = Number(xhr.getResponseHeader('Content-length'));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes';
            var usesGzip = (header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip';
            var chunkSize = 1024 * 1024;
            if (!hasByteServing) chunkSize = datalength;
            var doXHR = (from, to) => {
              if (from > to) throw new Error('invalid range (' + from + ', ' + to + ') or no bytes requested!');
              if (to > datalength - 1) throw new Error('only ' + datalength + ' bytes available! programmer error!');
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to);
              xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
              xhr.send(null);
              if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
                throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            };
            var lazyArray = this;
            lazyArray.setDataGetter((chunkNum) => {
              var start = chunkNum * chunkSize;
              var end = (chunkNum + 1) * chunkSize - 1;
              end = Math.min(end, datalength - 1);
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
              return lazyArray.chunks[chunkNum];
            });
            if (usesGzip || !datalength) {
              chunkSize = datalength = 1;
              datalength = this.getter(0).length;
              chunkSize = datalength;
              out('LazyFiles on gzip forces download of the whole file when length is accessed');
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
          };
          if (typeof XMLHttpRequest != 'undefined') {
            if (!ENVIRONMENT_IS_WORKER)
              throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
            var lazyArray = new LazyUint8Array();
            Object.defineProperties(lazyArray, {
              length: {
                get: function () {
                  if (!this.lengthKnown) {
                    this.cacheLength();
                  }
                  return this._length;
                },
              },
              chunkSize: {
                get: function () {
                  if (!this.lengthKnown) {
                    this.cacheLength();
                  }
                  return this._chunkSize;
                },
              },
            });
            var properties = { isDevice: false, contents: lazyArray };
          } else {
            var properties = { isDevice: false, url: url };
          }
          var node = FS.createFile(parent, name, properties, canRead, canWrite);
          if (properties.contents) {
            node.contents = properties.contents;
          } else if (properties.url) {
            node.contents = null;
            node.url = properties.url;
          }
          Object.defineProperties(node, {
            usedBytes: {
              get: function () {
                return this.contents.length;
              },
            },
          });
          var stream_ops = {};
          var keys = Object.keys(node.stream_ops);
          keys.forEach((key) => {
            var fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
              FS.forceLoadFile(node);
              return fn.apply(null, arguments);
            };
          });
          stream_ops.read = (stream, buffer, offset, length, position) => {
            FS.forceLoadFile(node);
            var contents = stream.node.contents;
            if (position >= contents.length) return 0;
            var size = Math.min(contents.length - position, length);
            if (contents.slice) {
              for (var i = 0; i < size; i++) {
                buffer[offset + i] = contents[position + i];
              }
            } else {
              for (var i = 0; i < size; i++) {
                buffer[offset + i] = contents.get(position + i);
              }
            }
            return size;
          };
          node.stream_ops = stream_ops;
          return node;
        },
        createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
          var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
          var dep = getUniqueRunDependency('cp ' + fullname);
          function processData(byteArray) {
            function finish(byteArray) {
              if (preFinish) preFinish();
              if (!dontCreateFile) {
                FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
              }
              if (onload) onload();
              removeRunDependency(dep);
            }
            if (
              Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
                if (onerror) onerror();
                removeRunDependency(dep);
              })
            ) {
              return;
            }
            finish(byteArray);
          }
          addRunDependency(dep);
          if (typeof url == 'string') {
            asyncLoad(url, (byteArray) => processData(byteArray), onerror);
          } else {
            processData(url);
          }
        },
        indexedDB: () => {
          return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        },
        DB_NAME: () => {
          return 'EM_FS_' + window.location.pathname;
        },
        DB_VERSION: 20,
        DB_STORE_NAME: 'FILE_DATA',
        saveFilesToDB: (paths, onload, onerror) => {
          onload = onload || (() => {});
          onerror = onerror || (() => {});
          var indexedDB = FS.indexedDB();
          try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
          } catch (e) {
            return onerror(e);
          }
          openRequest.onupgradeneeded = () => {
            out('creating db');
            var db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME);
          };
          openRequest.onsuccess = () => {
            var db = openRequest.result;
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
              fail = 0,
              total = paths.length;
            function finish() {
              if (fail == 0) onload();
              else onerror();
            }
            paths.forEach((path) => {
              var putRequest = files.put(FS.analyzePath(path).object.contents, path);
              putRequest.onsuccess = () => {
                ok++;
                if (ok + fail == total) finish();
              };
              putRequest.onerror = () => {
                fail++;
                if (ok + fail == total) finish();
              };
            });
            transaction.onerror = onerror;
          };
          openRequest.onerror = onerror;
        },
        loadFilesFromDB: (paths, onload, onerror) => {
          onload = onload || (() => {});
          onerror = onerror || (() => {});
          var indexedDB = FS.indexedDB();
          try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
          } catch (e) {
            return onerror(e);
          }
          openRequest.onupgradeneeded = onerror;
          openRequest.onsuccess = () => {
            var db = openRequest.result;
            try {
              var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
            } catch (e) {
              onerror(e);
              return;
            }
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
              fail = 0,
              total = paths.length;
            function finish() {
              if (fail == 0) onload();
              else onerror();
            }
            paths.forEach((path) => {
              var getRequest = files.get(path);
              getRequest.onsuccess = () => {
                if (FS.analyzePath(path).exists) {
                  FS.unlink(path);
                }
                FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                ok++;
                if (ok + fail == total) finish();
              };
              getRequest.onerror = () => {
                fail++;
                if (ok + fail == total) finish();
              };
            });
            transaction.onerror = onerror;
          };
          openRequest.onerror = onerror;
        },
      };
      var SYSCALLS = {
        DEFAULT_POLLMASK: 5,
        calculateAt: function (dirfd, path, allowEmpty) {
          if (PATH.isAbs(path)) {
            return path;
          }
          var dir;
          if (dirfd === -100) {
            dir = FS.cwd();
          } else {
            var dirstream = FS.getStream(dirfd);
            if (!dirstream) throw new FS.ErrnoError(8);
            dir = dirstream.path;
          }
          if (path.length == 0) {
            if (!allowEmpty) {
              throw new FS.ErrnoError(44);
            }
            return dir;
          }
          return PATH.join2(dir, path);
        },
        doStat: function (func, path, buf) {
          try {
            var stat = func(path);
          } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
              return -54;
            }
            throw e;
          }
          GROWABLE_HEAP_I32()[buf >> 2] = stat.dev;
          GROWABLE_HEAP_I32()[(buf + 4) >> 2] = 0;
          GROWABLE_HEAP_I32()[(buf + 8) >> 2] = stat.ino;
          GROWABLE_HEAP_I32()[(buf + 12) >> 2] = stat.mode;
          GROWABLE_HEAP_I32()[(buf + 16) >> 2] = stat.nlink;
          GROWABLE_HEAP_I32()[(buf + 20) >> 2] = stat.uid;
          GROWABLE_HEAP_I32()[(buf + 24) >> 2] = stat.gid;
          GROWABLE_HEAP_I32()[(buf + 28) >> 2] = stat.rdev;
          GROWABLE_HEAP_I32()[(buf + 32) >> 2] = 0;
          (tempI64 = [
            stat.size >>> 0,
            ((tempDouble = stat.size),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (GROWABLE_HEAP_I32()[(buf + 40) >> 2] = tempI64[0]),
            (GROWABLE_HEAP_I32()[(buf + 44) >> 2] = tempI64[1]);
          GROWABLE_HEAP_I32()[(buf + 48) >> 2] = 4096;
          GROWABLE_HEAP_I32()[(buf + 52) >> 2] = stat.blocks;
          GROWABLE_HEAP_I32()[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0;
          GROWABLE_HEAP_I32()[(buf + 60) >> 2] = 0;
          GROWABLE_HEAP_I32()[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
          GROWABLE_HEAP_I32()[(buf + 68) >> 2] = 0;
          GROWABLE_HEAP_I32()[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
          GROWABLE_HEAP_I32()[(buf + 76) >> 2] = 0;
          (tempI64 = [
            stat.ino >>> 0,
            ((tempDouble = stat.ino),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (GROWABLE_HEAP_I32()[(buf + 80) >> 2] = tempI64[0]),
            (GROWABLE_HEAP_I32()[(buf + 84) >> 2] = tempI64[1]);
          return 0;
        },
        doMsync: function (addr, stream, len, flags, offset) {
          var buffer = GROWABLE_HEAP_U8().slice(addr, addr + len);
          FS.msync(stream, buffer, offset, len, flags);
        },
        varargs: undefined,
        get: function () {
          SYSCALLS.varargs += 4;
          var ret = GROWABLE_HEAP_I32()[(SYSCALLS.varargs - 4) >> 2];
          return ret;
        },
        getStr: function (ptr) {
          var ret = UTF8ToString(ptr);
          return ret;
        },
        getStreamFromFD: function (fd) {
          var stream = FS.getStream(fd);
          if (!stream) throw new FS.ErrnoError(8);
          return stream;
        },
      };
      function ___syscall_fcntl64(fd, cmd, varargs) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(3, 1, fd, cmd, varargs);
        SYSCALLS.varargs = varargs;
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          switch (cmd) {
            case 0: {
              var arg = SYSCALLS.get();
              if (arg < 0) {
                return -28;
              }
              var newStream;
              newStream = FS.createStream(stream, arg);
              return newStream.fd;
            }
            case 1:
            case 2:
              return 0;
            case 3:
              return stream.flags;
            case 4: {
              var arg = SYSCALLS.get();
              stream.flags |= arg;
              return 0;
            }
            case 5: {
              var arg = SYSCALLS.get();
              var offset = 0;
              GROWABLE_HEAP_I16()[(arg + offset) >> 1] = 2;
              return 0;
            }
            case 6:
            case 7:
              return 0;
            case 16:
            case 8:
              return -28;
            case 9:
              setErrNo(28);
              return -1;
            default: {
              return -28;
            }
          }
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_fstat64(fd, buf) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(4, 1, fd, buf);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          return SYSCALLS.doStat(FS.stat, stream.path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_ftruncate64(fd, length_low, length_high) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(5, 1, fd, length_low, length_high);
        try {
          var length = length_high * 4294967296 + (length_low >>> 0);
          FS.ftruncate(fd, length);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_ioctl(fd, op, varargs) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(6, 1, fd, op, varargs);
        SYSCALLS.varargs = varargs;
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          switch (op) {
            case 21509:
            case 21505: {
              if (!stream.tty) return -59;
              return 0;
            }
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508: {
              if (!stream.tty) return -59;
              return 0;
            }
            case 21519: {
              if (!stream.tty) return -59;
              var argp = SYSCALLS.get();
              GROWABLE_HEAP_I32()[argp >> 2] = 0;
              return 0;
            }
            case 21520: {
              if (!stream.tty) return -59;
              return -28;
            }
            case 21531: {
              var argp = SYSCALLS.get();
              return FS.ioctl(stream, op, argp);
            }
            case 21523: {
              if (!stream.tty) return -59;
              return 0;
            }
            case 21524: {
              if (!stream.tty) return -59;
              return 0;
            }
            default:
              abort('bad ioctl syscall ' + op);
          }
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_lstat64(path, buf) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(7, 1, path, buf);
        try {
          path = SYSCALLS.getStr(path);
          return SYSCALLS.doStat(FS.lstat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_newfstatat(dirfd, path, buf, flags) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(8, 1, dirfd, path, buf, flags);
        try {
          path = SYSCALLS.getStr(path);
          var nofollow = flags & 256;
          var allowEmpty = flags & 4096;
          flags = flags & ~4352;
          path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
          return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_openat(dirfd, path, flags, varargs) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(9, 1, dirfd, path, flags, varargs);
        SYSCALLS.varargs = varargs;
        try {
          path = SYSCALLS.getStr(path);
          path = SYSCALLS.calculateAt(dirfd, path);
          var mode = varargs ? SYSCALLS.get() : 0;
          return FS.open(path, flags, mode).fd;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(10, 1, olddirfd, oldpath, newdirfd, newpath);
        try {
          oldpath = SYSCALLS.getStr(oldpath);
          newpath = SYSCALLS.getStr(newpath);
          oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
          newpath = SYSCALLS.calculateAt(newdirfd, newpath);
          FS.rename(oldpath, newpath);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_stat64(path, buf) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(11, 1, path, buf);
        try {
          path = SYSCALLS.getStr(path);
          return SYSCALLS.doStat(FS.stat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_unlinkat(dirfd, path, flags) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(12, 1, dirfd, path, flags);
        try {
          path = SYSCALLS.getStr(path);
          path = SYSCALLS.calculateAt(dirfd, path);
          if (flags === 0) {
            FS.unlink(path);
          } else if (flags === 512) {
            FS.rmdir(path);
          } else {
            abort('Invalid flags passed to unlinkat');
          }
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function __dlinit(main_dso_handle) {}
      var dlopenMissingError =
        'To use dlopen, you need enable dynamic linking, see https://github.com/emscripten-core/emscripten/wiki/Linking';
      function __dlopen_js(filename, flag) {
        abort(dlopenMissingError);
      }
      function __dlsym_js(handle, symbol) {
        abort(dlopenMissingError);
      }
      function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {}
      function getShiftFromSize(size) {
        switch (size) {
          case 1:
            return 0;
          case 2:
            return 1;
          case 4:
            return 2;
          case 8:
            return 3;
          default:
            throw new TypeError('Unknown type size: ' + size);
        }
      }
      function embind_init_charCodes() {
        var codes = new Array(256);
        for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
        }
        embind_charCodes = codes;
      }
      var embind_charCodes = undefined;
      function readLatin1String(ptr) {
        var ret = '';
        var c = ptr;
        while (GROWABLE_HEAP_U8()[c]) {
          ret += embind_charCodes[GROWABLE_HEAP_U8()[c++]];
        }
        return ret;
      }
      var awaitingDependencies = {};
      var registeredTypes = {};
      var typeDependencies = {};
      var char_0 = 48;
      var char_9 = 57;
      function makeLegalFunctionName(name) {
        if (undefined === name) {
          return '_unknown';
        }
        name = name.replace(/[^a-zA-Z0-9_]/g, '$');
        var f = name.charCodeAt(0);
        if (f >= char_0 && f <= char_9) {
          return '_' + name;
        }
        return name;
      }
      function createNamedFunction(name, body) {
        name = makeLegalFunctionName(name);
        return new Function(
          'body',
          'return function ' + name + '() {\n' + '    "use strict";' + '    return body.apply(this, arguments);\n' + '};\n'
        )(body);
      }
      function extendError(baseErrorType, errorName) {
        var errorClass = createNamedFunction(errorName, function (message) {
          this.name = errorName;
          this.message = message;
          var stack = new Error(message).stack;
          if (stack !== undefined) {
            this.stack = this.toString() + '\n' + stack.replace(/^Error(:[^\n]*)?\n/, '');
          }
        });
        errorClass.prototype = Object.create(baseErrorType.prototype);
        errorClass.prototype.constructor = errorClass;
        errorClass.prototype.toString = function () {
          if (this.message === undefined) {
            return this.name;
          } else {
            return this.name + ': ' + this.message;
          }
        };
        return errorClass;
      }
      var BindingError = undefined;
      function throwBindingError(message) {
        throw new BindingError(message);
      }
      var InternalError = undefined;
      function throwInternalError(message) {
        throw new InternalError(message);
      }
      function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
        myTypes.forEach(function (type) {
          typeDependencies[type] = dependentTypes;
        });
        function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
            throwInternalError('Mismatched type converter count');
          }
          for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i]);
          }
        }
        var typeConverters = new Array(dependentTypes.length);
        var unregisteredTypes = [];
        var registered = 0;
        dependentTypes.forEach((dt, i) => {
          if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
          } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
              awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(() => {
              typeConverters[i] = registeredTypes[dt];
              ++registered;
              if (registered === unregisteredTypes.length) {
                onComplete(typeConverters);
              }
            });
          }
        });
        if (0 === unregisteredTypes.length) {
          onComplete(typeConverters);
        }
      }
      function registerType(rawType, registeredInstance, options = {}) {
        if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance');
        }
        var name = registeredInstance.name;
        if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
        }
        if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
            return;
          } else {
            throwBindingError("Cannot register type '" + name + "' twice");
          }
        }
        registeredTypes[rawType] = registeredInstance;
        delete typeDependencies[rawType];
        if (awaitingDependencies.hasOwnProperty(rawType)) {
          var callbacks = awaitingDependencies[rawType];
          delete awaitingDependencies[rawType];
          callbacks.forEach((cb) => cb());
        }
      }
      function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (wt) {
            return !!wt;
          },
          toWireType: function (destructors, o) {
            return o ? trueValue : falseValue;
          },
          argPackAdvance: 8,
          readValueFromPointer: function (pointer) {
            var heap;
            if (size === 1) {
              heap = GROWABLE_HEAP_I8();
            } else if (size === 2) {
              heap = GROWABLE_HEAP_I16();
            } else if (size === 4) {
              heap = GROWABLE_HEAP_I32();
            } else {
              throw new TypeError('Unknown boolean type size: ' + name);
            }
            return this['fromWireType'](heap[pointer >> shift]);
          },
          destructorFunction: null,
        });
      }
      function ClassHandle_isAliasOf(other) {
        if (!(this instanceof ClassHandle)) {
          return false;
        }
        if (!(other instanceof ClassHandle)) {
          return false;
        }
        var leftClass = this.$$.ptrType.registeredClass;
        var left = this.$$.ptr;
        var rightClass = other.$$.ptrType.registeredClass;
        var right = other.$$.ptr;
        while (leftClass.baseClass) {
          left = leftClass.upcast(left);
          leftClass = leftClass.baseClass;
        }
        while (rightClass.baseClass) {
          right = rightClass.upcast(right);
          rightClass = rightClass.baseClass;
        }
        return leftClass === rightClass && left === right;
      }
      function shallowCopyInternalPointer(o) {
        return {
          count: o.count,
          deleteScheduled: o.deleteScheduled,
          preservePointerOnDelete: o.preservePointerOnDelete,
          ptr: o.ptr,
          ptrType: o.ptrType,
          smartPtr: o.smartPtr,
          smartPtrType: o.smartPtrType,
        };
      }
      function throwInstanceAlreadyDeleted(obj) {
        function getInstanceTypeName(handle) {
          return handle.$$.ptrType.registeredClass.name;
        }
        throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
      }
      var finalizationRegistry = false;
      function detachFinalizer(handle) {}
      function runDestructor($$) {
        if ($$.smartPtr) {
          $$.smartPtrType.rawDestructor($$.smartPtr);
        } else {
          $$.ptrType.registeredClass.rawDestructor($$.ptr);
        }
      }
      function releaseClassHandle($$) {
        $$.count.value -= 1;
        var toDelete = 0 === $$.count.value;
        if (toDelete) {
          runDestructor($$);
        }
      }
      function downcastPointer(ptr, ptrClass, desiredClass) {
        if (ptrClass === desiredClass) {
          return ptr;
        }
        if (undefined === desiredClass.baseClass) {
          return null;
        }
        var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
        if (rv === null) {
          return null;
        }
        return desiredClass.downcast(rv);
      }
      var registeredPointers = {};
      function getInheritedInstanceCount() {
        return Object.keys(registeredInstances).length;
      }
      function getLiveInheritedInstances() {
        var rv = [];
        for (var k in registeredInstances) {
          if (registeredInstances.hasOwnProperty(k)) {
            rv.push(registeredInstances[k]);
          }
        }
        return rv;
      }
      var deletionQueue = [];
      function flushPendingDeletes() {
        while (deletionQueue.length) {
          var obj = deletionQueue.pop();
          obj.$$.deleteScheduled = false;
          obj['delete']();
        }
      }
      var delayFunction = undefined;
      function setDelayFunction(fn) {
        delayFunction = fn;
        if (deletionQueue.length && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
      }
      function init_embind() {
        Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
        Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
        Module['flushPendingDeletes'] = flushPendingDeletes;
        Module['setDelayFunction'] = setDelayFunction;
      }
      var registeredInstances = {};
      function getBasestPointer(class_, ptr) {
        if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
        }
        while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
        }
        return ptr;
      }
      function getInheritedInstance(class_, ptr) {
        ptr = getBasestPointer(class_, ptr);
        return registeredInstances[ptr];
      }
      function makeClassHandle(prototype, record) {
        if (!record.ptrType || !record.ptr) {
          throwInternalError('makeClassHandle requires ptr and ptrType');
        }
        var hasSmartPtrType = !!record.smartPtrType;
        var hasSmartPtr = !!record.smartPtr;
        if (hasSmartPtrType !== hasSmartPtr) {
          throwInternalError('Both smartPtrType and smartPtr must be specified');
        }
        record.count = { value: 1 };
        return attachFinalizer(Object.create(prototype, { $$: { value: record } }));
      }
      function RegisteredPointer_fromWireType(ptr) {
        var rawPointer = this.getPointee(ptr);
        if (!rawPointer) {
          this.destructor(ptr);
          return null;
        }
        var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
        if (undefined !== registeredInstance) {
          if (0 === registeredInstance.$$.count.value) {
            registeredInstance.$$.ptr = rawPointer;
            registeredInstance.$$.smartPtr = ptr;
            return registeredInstance['clone']();
          } else {
            var rv = registeredInstance['clone']();
            this.destructor(ptr);
            return rv;
          }
        }
        function makeDefaultHandle() {
          if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {
              ptrType: this.pointeeType,
              ptr: rawPointer,
              smartPtrType: this,
              smartPtr: ptr,
            });
          } else {
            return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr: ptr });
          }
        }
        var actualType = this.registeredClass.getActualType(rawPointer);
        var registeredPointerRecord = registeredPointers[actualType];
        if (!registeredPointerRecord) {
          return makeDefaultHandle.call(this);
        }
        var toType;
        if (this.isConst) {
          toType = registeredPointerRecord.constPointerType;
        } else {
          toType = registeredPointerRecord.pointerType;
        }
        var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
        if (dp === null) {
          return makeDefaultHandle.call(this);
        }
        if (this.isSmartPointer) {
          return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr });
        } else {
          return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
        }
      }
      function attachFinalizer(handle) {
        if ('undefined' === typeof FinalizationRegistry) {
          attachFinalizer = (handle) => handle;
          return handle;
        }
        finalizationRegistry = new FinalizationRegistry((info) => {
          releaseClassHandle(info.$$);
        });
        attachFinalizer = (handle) => {
          var $$ = handle.$$;
          var hasSmartPtr = !!$$.smartPtr;
          if (hasSmartPtr) {
            var info = { $$: $$ };
            finalizationRegistry.register(handle, info, handle);
          }
          return handle;
        };
        detachFinalizer = (handle) => finalizationRegistry.unregister(handle);
        return attachFinalizer(handle);
      }
      function ClassHandle_clone() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.preservePointerOnDelete) {
          this.$$.count.value += 1;
          return this;
        } else {
          var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } }));
          clone.$$.count.value += 1;
          clone.$$.deleteScheduled = false;
          return clone;
        }
      }
      function ClassHandle_delete() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError('Object already scheduled for deletion');
        }
        detachFinalizer(this);
        releaseClassHandle(this.$$);
        if (!this.$$.preservePointerOnDelete) {
          this.$$.smartPtr = undefined;
          this.$$.ptr = undefined;
        }
      }
      function ClassHandle_isDeleted() {
        return !this.$$.ptr;
      }
      function ClassHandle_deleteLater() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError('Object already scheduled for deletion');
        }
        deletionQueue.push(this);
        if (deletionQueue.length === 1 && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
        this.$$.deleteScheduled = true;
        return this;
      }
      function init_ClassHandle() {
        ClassHandle.prototype['isAliasOf'] = ClassHandle_isAliasOf;
        ClassHandle.prototype['clone'] = ClassHandle_clone;
        ClassHandle.prototype['delete'] = ClassHandle_delete;
        ClassHandle.prototype['isDeleted'] = ClassHandle_isDeleted;
        ClassHandle.prototype['deleteLater'] = ClassHandle_deleteLater;
      }
      function ClassHandle() {}
      function ensureOverloadTable(proto, methodName, humanName) {
        if (undefined === proto[methodName].overloadTable) {
          var prevFunc = proto[methodName];
          proto[methodName] = function () {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
              throwBindingError(
                "Function '" +
                  humanName +
                  "' called with an invalid number of arguments (" +
                  arguments.length +
                  ') - expects one of (' +
                  proto[methodName].overloadTable +
                  ')!'
              );
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
          };
          proto[methodName].overloadTable = [];
          proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
        }
      }
      function exposePublicSymbol(name, value, numArguments) {
        if (Module.hasOwnProperty(name)) {
          if (
            undefined === numArguments ||
            (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])
          ) {
            throwBindingError("Cannot register public name '" + name + "' twice");
          }
          ensureOverloadTable(Module, name, name);
          if (Module.hasOwnProperty(numArguments)) {
            throwBindingError('Cannot register multiple overloads of a function with the same number of arguments (' + numArguments + ')!');
          }
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          if (undefined !== numArguments) {
            Module[name].numArguments = numArguments;
          }
        }
      }
      function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
        this.name = name;
        this.constructor = constructor;
        this.instancePrototype = instancePrototype;
        this.rawDestructor = rawDestructor;
        this.baseClass = baseClass;
        this.getActualType = getActualType;
        this.upcast = upcast;
        this.downcast = downcast;
        this.pureVirtualFunctions = [];
      }
      function upcastPointer(ptr, ptrClass, desiredClass) {
        while (ptrClass !== desiredClass) {
          if (!ptrClass.upcast) {
            throwBindingError('Expected null or instance of ' + desiredClass.name + ', got an instance of ' + ptrClass.name);
          }
          ptr = ptrClass.upcast(ptr);
          ptrClass = ptrClass.baseClass;
        }
        return ptr;
      }
      function constNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function genericPointerToWireType(destructors, handle) {
        var ptr;
        if (handle === null) {
          if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
          }
          if (this.isSmartPointer) {
            ptr = this.rawConstructor();
            if (destructors !== null) {
              destructors.push(this.rawDestructor, ptr);
            }
            return ptr;
          } else {
            return 0;
          }
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
        }
        if (!this.isConst && handle.$$.ptrType.isConst) {
          throwBindingError(
            'Cannot convert argument of type ' +
              (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) +
              ' to parameter type ' +
              this.name
          );
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        if (this.isSmartPointer) {
          if (undefined === handle.$$.smartPtr) {
            throwBindingError('Passing raw pointer to smart pointer is illegal');
          }
          switch (this.sharingPolicy) {
            case 0:
              if (handle.$$.smartPtrType === this) {
                ptr = handle.$$.smartPtr;
              } else {
                throwBindingError(
                  'Cannot convert argument of type ' +
                    (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) +
                    ' to parameter type ' +
                    this.name
                );
              }
              break;
            case 1:
              ptr = handle.$$.smartPtr;
              break;
            case 2:
              if (handle.$$.smartPtrType === this) {
                ptr = handle.$$.smartPtr;
              } else {
                var clonedHandle = handle['clone']();
                ptr = this.rawShare(
                  ptr,
                  Emval.toHandle(function () {
                    clonedHandle['delete']();
                  })
                );
                if (destructors !== null) {
                  destructors.push(this.rawDestructor, ptr);
                }
              }
              break;
            default:
              throwBindingError('Unsupporting sharing policy');
          }
        }
        return ptr;
      }
      function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
        }
        if (handle.$$.ptrType.isConst) {
          throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function simpleReadValueFromPointer(pointer) {
        return this['fromWireType'](GROWABLE_HEAP_U32()[pointer >> 2]);
      }
      function RegisteredPointer_getPointee(ptr) {
        if (this.rawGetPointee) {
          ptr = this.rawGetPointee(ptr);
        }
        return ptr;
      }
      function RegisteredPointer_destructor(ptr) {
        if (this.rawDestructor) {
          this.rawDestructor(ptr);
        }
      }
      function RegisteredPointer_deleteObject(handle) {
        if (handle !== null) {
          handle['delete']();
        }
      }
      function init_RegisteredPointer() {
        RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
        RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
        RegisteredPointer.prototype['argPackAdvance'] = 8;
        RegisteredPointer.prototype['readValueFromPointer'] = simpleReadValueFromPointer;
        RegisteredPointer.prototype['deleteObject'] = RegisteredPointer_deleteObject;
        RegisteredPointer.prototype['fromWireType'] = RegisteredPointer_fromWireType;
      }
      function RegisteredPointer(
        name,
        registeredClass,
        isReference,
        isConst,
        isSmartPointer,
        pointeeType,
        sharingPolicy,
        rawGetPointee,
        rawConstructor,
        rawShare,
        rawDestructor
      ) {
        this.name = name;
        this.registeredClass = registeredClass;
        this.isReference = isReference;
        this.isConst = isConst;
        this.isSmartPointer = isSmartPointer;
        this.pointeeType = pointeeType;
        this.sharingPolicy = sharingPolicy;
        this.rawGetPointee = rawGetPointee;
        this.rawConstructor = rawConstructor;
        this.rawShare = rawShare;
        this.rawDestructor = rawDestructor;
        if (!isSmartPointer && registeredClass.baseClass === undefined) {
          if (isConst) {
            this['toWireType'] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
          } else {
            this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
          }
        } else {
          this['toWireType'] = genericPointerToWireType;
        }
      }
      function replacePublicSymbol(name, value, numArguments) {
        if (!Module.hasOwnProperty(name)) {
          throwInternalError('Replacing nonexistant public symbol');
        }
        if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          Module[name].argCount = numArguments;
        }
      }
      function dynCallLegacy(sig, ptr, args) {
        var f = Module['dynCall_' + sig];
        return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
      }
      function dynCall(sig, ptr, args) {
        if (sig.includes('j')) {
          return dynCallLegacy(sig, ptr, args);
        }
        return getWasmTableEntry(ptr).apply(null, args);
      }
      function getDynCaller(sig, ptr) {
        var argCache = [];
        return function () {
          argCache.length = 0;
          Object.assign(argCache, arguments);
          return dynCall(sig, ptr, argCache);
        };
      }
      function embind__requireFunction(signature, rawFunction) {
        signature = readLatin1String(signature);
        function makeDynCaller() {
          if (signature.includes('j')) {
            return getDynCaller(signature, rawFunction);
          }
          return getWasmTableEntry(rawFunction);
        }
        var fp = makeDynCaller();
        if (typeof fp != 'function') {
          throwBindingError('unknown function pointer with signature ' + signature + ': ' + rawFunction);
        }
        return fp;
      }
      var UnboundTypeError = undefined;
      function getTypeName(type) {
        var ptr = ___getTypeName(type);
        var rv = readLatin1String(ptr);
        _free(ptr);
        return rv;
      }
      function throwUnboundTypeError(message, types) {
        var unboundTypes = [];
        var seen = {};
        function visit(type) {
          if (seen[type]) {
            return;
          }
          if (registeredTypes[type]) {
            return;
          }
          if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return;
          }
          unboundTypes.push(type);
          seen[type] = true;
        }
        types.forEach(visit);
        throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
      }
      function __embind_register_class(
        rawType,
        rawPointerType,
        rawConstPointerType,
        baseClassRawType,
        getActualTypeSignature,
        getActualType,
        upcastSignature,
        upcast,
        downcastSignature,
        downcast,
        name,
        destructorSignature,
        rawDestructor
      ) {
        name = readLatin1String(name);
        getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
        if (upcast) {
          upcast = embind__requireFunction(upcastSignature, upcast);
        }
        if (downcast) {
          downcast = embind__requireFunction(downcastSignature, downcast);
        }
        rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
        var legalFunctionName = makeLegalFunctionName(name);
        exposePublicSymbol(legalFunctionName, function () {
          throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
        });
        whenDependentTypesAreResolved(
          [rawType, rawPointerType, rawConstPointerType],
          baseClassRawType ? [baseClassRawType] : [],
          function (base) {
            base = base[0];
            var baseClass;
            var basePrototype;
            if (baseClassRawType) {
              baseClass = base.registeredClass;
              basePrototype = baseClass.instancePrototype;
            } else {
              basePrototype = ClassHandle.prototype;
            }
            var constructor = createNamedFunction(legalFunctionName, function () {
              if (Object.getPrototypeOf(this) !== instancePrototype) {
                throw new BindingError("Use 'new' to construct " + name);
              }
              if (undefined === registeredClass.constructor_body) {
                throw new BindingError(name + ' has no accessible constructor');
              }
              var body = registeredClass.constructor_body[arguments.length];
              if (undefined === body) {
                throw new BindingError(
                  'Tried to invoke ctor of ' +
                    name +
                    ' with invalid number of parameters (' +
                    arguments.length +
                    ') - expected (' +
                    Object.keys(registeredClass.constructor_body).toString() +
                    ') parameters instead!'
                );
              }
              return body.apply(this, arguments);
            });
            var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } });
            constructor.prototype = instancePrototype;
            var registeredClass = new RegisteredClass(
              name,
              constructor,
              instancePrototype,
              rawDestructor,
              baseClass,
              getActualType,
              upcast,
              downcast
            );
            var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
            var pointerConverter = new RegisteredPointer(name + '*', registeredClass, false, false, false);
            var constPointerConverter = new RegisteredPointer(name + ' const*', registeredClass, false, true, false);
            registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
            replacePublicSymbol(legalFunctionName, constructor);
            return [referenceConverter, pointerConverter, constPointerConverter];
          }
        );
      }
      function heap32VectorToArray(count, firstElement) {
        var array = [];
        for (var i = 0; i < count; i++) {
          array.push(GROWABLE_HEAP_I32()[(firstElement >> 2) + i]);
        }
        return array;
      }
      function runDestructors(destructors) {
        while (destructors.length) {
          var ptr = destructors.pop();
          var del = destructors.pop();
          del(ptr);
        }
      }
      function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
        assert(argCount > 0);
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        invoker = embind__requireFunction(invokerSignature, invoker);
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
          classType = classType[0];
          var humanName = 'constructor ' + classType.name;
          if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
          }
          if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError(
              'Cannot register multiple constructors with identical number of parameters (' +
                (argCount - 1) +
                ") for class '" +
                classType.name +
                "'! Overload resolution is currently only performed using the parameter count, not actual type info!"
            );
          }
          classType.registeredClass.constructor_body[argCount - 1] = () => {
            throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
          };
          whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            argTypes.splice(1, 0, null);
            classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(
              humanName,
              argTypes,
              null,
              invoker,
              rawConstructor
            );
            return [];
          });
          return [];
        });
      }
      function new_(constructor, argumentList) {
        if (!(constructor instanceof Function)) {
          throw new TypeError('new_ called with constructor type ' + typeof constructor + ' which is not a function');
        }
        var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function () {});
        dummy.prototype = constructor.prototype;
        var obj = new dummy();
        var r = constructor.apply(obj, argumentList);
        return r instanceof Object ? r : obj;
      }
      function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
        var argCount = argTypes.length;
        if (argCount < 2) {
          throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
        }
        var isClassMethodFunc = argTypes[1] !== null && classType !== null;
        var needsDestructorStack = false;
        for (var i = 1; i < argTypes.length; ++i) {
          if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
            needsDestructorStack = true;
            break;
          }
        }
        var returns = argTypes[0].name !== 'void';
        var argsList = '';
        var argsListWired = '';
        for (var i = 0; i < argCount - 2; ++i) {
          argsList += (i !== 0 ? ', ' : '') + 'arg' + i;
          argsListWired += (i !== 0 ? ', ' : '') + 'arg' + i + 'Wired';
        }
        var invokerFnBody =
          'return function ' +
          makeLegalFunctionName(humanName) +
          '(' +
          argsList +
          ') {\n' +
          'if (arguments.length !== ' +
          (argCount - 2) +
          ') {\n' +
          "throwBindingError('function " +
          humanName +
          " called with ' + arguments.length + ' arguments, expected " +
          (argCount - 2) +
          " args!');\n" +
          '}\n';
        if (needsDestructorStack) {
          invokerFnBody += 'var destructors = [];\n';
        }
        var dtorStack = needsDestructorStack ? 'destructors' : 'null';
        var args1 = ['throwBindingError', 'invoker', 'fn', 'runDestructors', 'retType', 'classParam'];
        var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
        if (isClassMethodFunc) {
          invokerFnBody += 'var thisWired = classParam.toWireType(' + dtorStack + ', this);\n';
        }
        for (var i = 0; i < argCount - 2; ++i) {
          invokerFnBody +=
            'var arg' + i + 'Wired = argType' + i + '.toWireType(' + dtorStack + ', arg' + i + '); // ' + argTypes[i + 2].name + '\n';
          args1.push('argType' + i);
          args2.push(argTypes[i + 2]);
        }
        if (isClassMethodFunc) {
          argsListWired = 'thisWired' + (argsListWired.length > 0 ? ', ' : '') + argsListWired;
        }
        invokerFnBody += (returns ? 'var rv = ' : '') + 'invoker(fn' + (argsListWired.length > 0 ? ', ' : '') + argsListWired + ');\n';
        if (needsDestructorStack) {
          invokerFnBody += 'runDestructors(destructors);\n';
        } else {
          for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            var paramName = i === 1 ? 'thisWired' : 'arg' + (i - 2) + 'Wired';
            if (argTypes[i].destructorFunction !== null) {
              invokerFnBody += paramName + '_dtor(' + paramName + '); // ' + argTypes[i].name + '\n';
              args1.push(paramName + '_dtor');
              args2.push(argTypes[i].destructorFunction);
            }
          }
        }
        if (returns) {
          invokerFnBody += 'var ret = retType.fromWireType(rv);\n' + 'return ret;\n';
        } else {
        }
        invokerFnBody += '}\n';
        args1.push(invokerFnBody);
        var invokerFunction = new_(Function, args1).apply(null, args2);
        return invokerFunction;
      }
      function __embind_register_class_function(
        rawClassType,
        methodName,
        argCount,
        rawArgTypesAddr,
        invokerSignature,
        rawInvoker,
        context,
        isPureVirtual
      ) {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        methodName = readLatin1String(methodName);
        rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
          classType = classType[0];
          var humanName = classType.name + '.' + methodName;
          if (methodName.startsWith('@@')) {
            methodName = Symbol[methodName.substring(2)];
          }
          if (isPureVirtual) {
            classType.registeredClass.pureVirtualFunctions.push(methodName);
          }
          function unboundTypesHandler() {
            throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
          }
          var proto = classType.registeredClass.instancePrototype;
          var method = proto[methodName];
          if (
            undefined === method ||
            (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)
          ) {
            unboundTypesHandler.argCount = argCount - 2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler;
          } else {
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
          }
          whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
            if (undefined === proto[methodName].overloadTable) {
              memberFunction.argCount = argCount - 2;
              proto[methodName] = memberFunction;
            } else {
              proto[methodName].overloadTable[argCount - 2] = memberFunction;
            }
            return [];
          });
          return [];
        });
      }
      var emval_free_list = [];
      var emval_handle_array = [{}, { value: undefined }, { value: null }, { value: true }, { value: false }];
      function __emval_decref(handle) {
        if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
          emval_handle_array[handle] = undefined;
          emval_free_list.push(handle);
        }
      }
      function count_emval_handles() {
        var count = 0;
        for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
            ++count;
          }
        }
        return count;
      }
      function get_first_emval() {
        for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
            return emval_handle_array[i];
          }
        }
        return null;
      }
      function init_emval() {
        Module['count_emval_handles'] = count_emval_handles;
        Module['get_first_emval'] = get_first_emval;
      }
      var Emval = {
        toValue: (handle) => {
          if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle);
          }
          return emval_handle_array[handle].value;
        },
        toHandle: (value) => {
          switch (value) {
            case undefined:
              return 1;
            case null:
              return 2;
            case true:
              return 3;
            case false:
              return 4;
            default: {
              var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
              emval_handle_array[handle] = { refcount: 1, value: value };
              return handle;
            }
          }
        },
      };
      function __embind_register_emval(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (handle) {
            var rv = Emval.toValue(handle);
            __emval_decref(handle);
            return rv;
          },
          toWireType: function (destructors, value) {
            return Emval.toHandle(value);
          },
          argPackAdvance: 8,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: null,
        });
      }
      function _embind_repr(v) {
        if (v === null) {
          return 'null';
        }
        var t = typeof v;
        if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
        } else {
          return '' + v;
        }
      }
      function floatReadValueFromPointer(name, shift) {
        switch (shift) {
          case 2:
            return function (pointer) {
              return this['fromWireType'](GROWABLE_HEAP_F32()[pointer >> 2]);
            };
          case 3:
            return function (pointer) {
              return this['fromWireType'](GROWABLE_HEAP_F64()[pointer >> 3]);
            };
          default:
            throw new TypeError('Unknown float type: ' + name);
        }
      }
      function __embind_register_float(rawType, name, size) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (value) {
            return value;
          },
          toWireType: function (destructors, value) {
            return value;
          },
          argPackAdvance: 8,
          readValueFromPointer: floatReadValueFromPointer(name, shift),
          destructorFunction: null,
        });
      }
      function integerReadValueFromPointer(name, shift, signed) {
        switch (shift) {
          case 0:
            return signed
              ? function readS8FromPointer(pointer) {
                  return GROWABLE_HEAP_I8()[pointer];
                }
              : function readU8FromPointer(pointer) {
                  return GROWABLE_HEAP_U8()[pointer];
                };
          case 1:
            return signed
              ? function readS16FromPointer(pointer) {
                  return GROWABLE_HEAP_I16()[pointer >> 1];
                }
              : function readU16FromPointer(pointer) {
                  return GROWABLE_HEAP_U16()[pointer >> 1];
                };
          case 2:
            return signed
              ? function readS32FromPointer(pointer) {
                  return GROWABLE_HEAP_I32()[pointer >> 2];
                }
              : function readU32FromPointer(pointer) {
                  return GROWABLE_HEAP_U32()[pointer >> 2];
                };
          default:
            throw new TypeError('Unknown integer type: ' + name);
        }
      }
      function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
        name = readLatin1String(name);
        if (maxRange === -1) {
          maxRange = 4294967295;
        }
        var shift = getShiftFromSize(size);
        var fromWireType = (value) => value;
        if (minRange === 0) {
          var bitshift = 32 - 8 * size;
          fromWireType = (value) => (value << bitshift) >>> bitshift;
        }
        var isUnsignedType = name.includes('unsigned');
        var checkAssertions = (value, toTypeName) => {};
        var toWireType;
        if (isUnsignedType) {
          toWireType = function (destructors, value) {
            checkAssertions(value, this.name);
            return value >>> 0;
          };
        } else {
          toWireType = function (destructors, value) {
            checkAssertions(value, this.name);
            return value;
          };
        }
        registerType(primitiveType, {
          name: name,
          fromWireType: fromWireType,
          toWireType: toWireType,
          argPackAdvance: 8,
          readValueFromPointer: integerReadValueFromPointer(name, shift, minRange !== 0),
          destructorFunction: null,
        });
      }
      function __embind_register_memory_view(rawType, dataTypeIndex, name) {
        var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
        var TA = typeMapping[dataTypeIndex];
        function decodeMemoryView(handle) {
          handle = handle >> 2;
          var heap = GROWABLE_HEAP_U32();
          var size = heap[handle];
          var data = heap[handle + 1];
          return new TA(buffer, data, size);
        }
        name = readLatin1String(name);
        registerType(
          rawType,
          { name: name, fromWireType: decodeMemoryView, argPackAdvance: 8, readValueFromPointer: decodeMemoryView },
          { ignoreDuplicateRegistrations: true }
        );
      }
      function __embind_register_std_string(rawType, name) {
        name = readLatin1String(name);
        var stdStringIsUTF8 = name === 'std::string';
        registerType(rawType, {
          name: name,
          fromWireType: function (value) {
            var length = GROWABLE_HEAP_U32()[value >> 2];
            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = value + 4;
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = value + 4 + i;
                if (i == length || GROWABLE_HEAP_U8()[currentBytePtr] == 0) {
                  var maxRead = currentBytePtr - decodeStartPtr;
                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                  if (str === undefined) {
                    str = stringSegment;
                  } else {
                    str += String.fromCharCode(0);
                    str += stringSegment;
                  }
                  decodeStartPtr = currentBytePtr + 1;
                }
              }
            } else {
              var a = new Array(length);
              for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(GROWABLE_HEAP_U8()[value + 4 + i]);
              }
              str = a.join('');
            }
            _free(value);
            return str;
          },
          toWireType: function (destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }
            var getLength;
            var valueIsOfTypeString = typeof value == 'string';
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError('Cannot pass non-string to std::string');
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              getLength = () => lengthBytesUTF8(value);
            } else {
              getLength = () => value.length;
            }
            var length = getLength();
            var ptr = _malloc(4 + length + 1);
            GROWABLE_HEAP_U32()[ptr >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr + 4, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                  }
                  GROWABLE_HEAP_U8()[ptr + 4 + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  GROWABLE_HEAP_U8()[ptr + 4 + i] = value[i];
                }
              }
            }
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          },
          argPackAdvance: 8,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: function (ptr) {
            _free(ptr);
          },
        });
      }
      function __embind_register_std_wstring(rawType, charSize, name) {
        name = readLatin1String(name);
        var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
        if (charSize === 2) {
          decodeString = UTF16ToString;
          encodeString = stringToUTF16;
          lengthBytesUTF = lengthBytesUTF16;
          getHeap = () => GROWABLE_HEAP_U16();
          shift = 1;
        } else if (charSize === 4) {
          decodeString = UTF32ToString;
          encodeString = stringToUTF32;
          lengthBytesUTF = lengthBytesUTF32;
          getHeap = () => GROWABLE_HEAP_U32();
          shift = 2;
        }
        registerType(rawType, {
          name: name,
          fromWireType: function (value) {
            var length = GROWABLE_HEAP_U32()[value >> 2];
            var HEAP = getHeap();
            var str;
            var decodeStartPtr = value + 4;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = value + 4 + i * charSize;
              if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                var maxReadBytes = currentBytePtr - decodeStartPtr;
                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + charSize;
              }
            }
            _free(value);
            return str;
          },
          toWireType: function (destructors, value) {
            if (!(typeof value == 'string')) {
              throwBindingError('Cannot pass non-string to C++ string type ' + name);
            }
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            GROWABLE_HEAP_U32()[ptr >> 2] = length >> shift;
            encodeString(value, ptr + 4, length + charSize);
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          },
          argPackAdvance: 8,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: function (ptr) {
            _free(ptr);
          },
        });
      }
      function __embind_register_void(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, {
          isVoid: true,
          name: name,
          argPackAdvance: 0,
          fromWireType: function () {
            return undefined;
          },
          toWireType: function (destructors, o) {
            return undefined;
          },
        });
      }
      function __emscripten_date_now() {
        return Date.now();
      }
      function __emscripten_default_pthread_stack_size() {
        return 2097152;
      }
      var nowIsMonotonic = true;
      function __emscripten_get_now_is_monotonic() {
        return nowIsMonotonic;
      }
      function executeNotifiedProxyingQueue(queue) {
        Atomics.store(GROWABLE_HEAP_I32(), queue >> 2, 1);
        if (_pthread_self()) {
          __emscripten_proxy_execute_task_queue(queue);
        }
        Atomics.compareExchange(GROWABLE_HEAP_I32(), queue >> 2, 1, 0);
      }
      Module['executeNotifiedProxyingQueue'] = executeNotifiedProxyingQueue;
      function __emscripten_notify_task_queue(targetThreadId, currThreadId, mainThreadId, queue) {
        if (targetThreadId == currThreadId) {
          setTimeout(() => executeNotifiedProxyingQueue(queue));
        } else if (ENVIRONMENT_IS_PTHREAD) {
          postMessage({ targetThread: targetThreadId, cmd: 'processProxyingQueue', queue: queue });
        } else {
          var pthread = PThread.pthreads[targetThreadId];
          var worker = pthread && pthread.worker;
          if (!worker) {
            return;
          }
          worker.postMessage({ cmd: 'processProxyingQueue', queue: queue });
        }
        return 1;
      }
      function __emscripten_set_offscreencanvas_size(target, width, height) {
        return -1;
      }
      function __emval_incref(handle) {
        if (handle > 4) {
          emval_handle_array[handle].refcount += 1;
        }
      }
      function requireRegisteredType(rawType, humanName) {
        var impl = registeredTypes[rawType];
        if (undefined === impl) {
          throwBindingError(humanName + ' has unknown type ' + getTypeName(rawType));
        }
        return impl;
      }
      function __emval_take_value(type, argv) {
        type = requireRegisteredType(type, '_emval_take_value');
        var v = type['readValueFromPointer'](argv);
        return Emval.toHandle(v);
      }
      function __mmap_js(addr, len, prot, flags, fd, off, allocated, builtin) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(13, 1, addr, len, prot, flags, fd, off, allocated, builtin);
        try {
          var info = FS.getStream(fd);
          if (!info) return -8;
          var res = FS.mmap(info, addr, len, off, prot, flags);
          var ptr = res.ptr;
          GROWABLE_HEAP_I32()[allocated >> 2] = res.allocated;
          return ptr;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function __munmap_js(addr, len, prot, flags, fd, offset) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(14, 1, addr, len, prot, flags, fd, offset);
        try {
          var stream = FS.getStream(fd);
          if (stream) {
            if (prot & 2) {
              SYSCALLS.doMsync(addr, stream, len, flags, offset);
            }
            FS.munmap(stream);
          }
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function _abort() {
        abort('');
      }
      function _emscripten_check_blocking_allowed() {
        if (ENVIRONMENT_IS_WORKER) return;
        warnOnce(
          'Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread'
        );
      }
      function _emscripten_get_heap_max() {
        return 2147483648;
      }
      var _emscripten_get_now;
      if (ENVIRONMENT_IS_PTHREAD) {
        _emscripten_get_now = () => performance.now() - Module['__performance_now_clock_drift'];
      } else _emscripten_get_now = () => performance.now();
      function _emscripten_memcpy_big(dest, src, num) {
        GROWABLE_HEAP_U8().copyWithin(dest, src, src + num);
      }
      function _emscripten_num_logical_cores() {
        return navigator['hardwareConcurrency'];
      }
      function _emscripten_proxy_to_main_thread_js(index, sync) {
        var numCallArgs = arguments.length - 2;
        var outerArgs = arguments;
        return withStackSave(function () {
          var serializedNumCallArgs = numCallArgs;
          var args = stackAlloc(serializedNumCallArgs * 8);
          var b = args >> 3;
          for (var i = 0; i < numCallArgs; i++) {
            var arg = outerArgs[2 + i];
            GROWABLE_HEAP_F64()[b + i] = arg;
          }
          return _emscripten_run_in_main_runtime_thread_js(index, serializedNumCallArgs, args, sync);
        });
      }
      var _emscripten_receive_on_main_thread_js_callArgs = [];
      function _emscripten_receive_on_main_thread_js(index, numCallArgs, args) {
        _emscripten_receive_on_main_thread_js_callArgs.length = numCallArgs;
        var b = args >> 3;
        for (var i = 0; i < numCallArgs; i++) {
          _emscripten_receive_on_main_thread_js_callArgs[i] = GROWABLE_HEAP_F64()[b + i];
        }
        var isEmAsmConst = index < 0;
        var func = !isEmAsmConst ? proxiedFunctionTable[index] : ASM_CONSTS[-index - 1];
        return func.apply(null, _emscripten_receive_on_main_thread_js_callArgs);
      }
      function emscripten_realloc_buffer(size) {
        try {
          wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
          updateGlobalBufferAndViews(wasmMemory.buffer);
          return 1;
        } catch (e) {}
      }
      function _emscripten_resize_heap(requestedSize) {
        var oldSize = GROWABLE_HEAP_U8().length;
        requestedSize = requestedSize >>> 0;
        if (requestedSize <= oldSize) {
          return false;
        }
        var maxHeapSize = _emscripten_get_heap_max();
        if (requestedSize > maxHeapSize) {
          return false;
        }
        let alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
        for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
          var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
          overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
          var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
          var replacement = emscripten_realloc_buffer(newSize);
          if (replacement) {
            return true;
          }
        }
        return false;
      }
      function _emscripten_unwind_to_js_event_loop() {
        throw 'unwind';
      }
      var ENV = {};
      function getExecutableName() {
        return thisProgram || './this.program';
      }
      function getEnvStrings() {
        if (!getEnvStrings.strings) {
          var lang = ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
          var env = {
            USER: 'web_user',
            LOGNAME: 'web_user',
            PATH: '/',
            PWD: '/',
            HOME: '/home/web_user',
            LANG: lang,
            _: getExecutableName(),
          };
          for (var x in ENV) {
            if (ENV[x] === undefined) delete env[x];
            else env[x] = ENV[x];
          }
          var strings = [];
          for (var x in env) {
            strings.push(x + '=' + env[x]);
          }
          getEnvStrings.strings = strings;
        }
        return getEnvStrings.strings;
      }
      function _environ_get(__environ, environ_buf) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(15, 1, __environ, environ_buf);
        var bufSize = 0;
        getEnvStrings().forEach(function (string, i) {
          var ptr = environ_buf + bufSize;
          GROWABLE_HEAP_I32()[(__environ + i * 4) >> 2] = ptr;
          writeAsciiToMemory(string, ptr);
          bufSize += string.length + 1;
        });
        return 0;
      }
      function _environ_sizes_get(penviron_count, penviron_buf_size) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(16, 1, penviron_count, penviron_buf_size);
        var strings = getEnvStrings();
        GROWABLE_HEAP_I32()[penviron_count >> 2] = strings.length;
        var bufSize = 0;
        strings.forEach(function (string) {
          bufSize += string.length + 1;
        });
        GROWABLE_HEAP_I32()[penviron_buf_size >> 2] = bufSize;
        return 0;
      }
      function _fd_close(fd) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(17, 1, fd);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          FS.close(stream);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function doReadv(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = GROWABLE_HEAP_U32()[iov >> 2];
          var len = GROWABLE_HEAP_U32()[(iov + 4) >> 2];
          iov += 8;
          var curr = FS.read(stream, GROWABLE_HEAP_I8(), ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break;
        }
        return ret;
      }
      function _fd_read(fd, iov, iovcnt, pnum) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(18, 1, fd, iov, iovcnt, pnum);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doReadv(stream, iov, iovcnt);
          GROWABLE_HEAP_I32()[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(19, 1, fd, offset_low, offset_high, whence, newOffset);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var HIGH_OFFSET = 4294967296;
          var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
          var DOUBLE_LIMIT = 9007199254740992;
          if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
            return 61;
          }
          FS.llseek(stream, offset, whence);
          (tempI64 = [
            stream.position >>> 0,
            ((tempDouble = stream.position),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (GROWABLE_HEAP_I32()[newOffset >> 2] = tempI64[0]),
            (GROWABLE_HEAP_I32()[(newOffset + 4) >> 2] = tempI64[1]);
          if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function _fd_sync(fd) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(20, 1, fd);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          if (stream.stream_ops && stream.stream_ops.fsync) {
            return -stream.stream_ops.fsync(stream);
          }
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function doWritev(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = GROWABLE_HEAP_U32()[iov >> 2];
          var len = GROWABLE_HEAP_U32()[(iov + 4) >> 2];
          iov += 8;
          var curr = FS.write(stream, GROWABLE_HEAP_I8(), ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
        }
        return ret;
      }
      function _fd_write(fd, iov, iovcnt, pnum) {
        if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(21, 1, fd, iov, iovcnt, pnum);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doWritev(stream, iov, iovcnt);
          GROWABLE_HEAP_I32()[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function _getTempRet0() {
        return getTempRet0();
      }
      function _getentropy(buffer, size) {
        if (!_getentropy.randomDevice) {
          _getentropy.randomDevice = getRandomDevice();
        }
        for (var i = 0; i < size; i++) {
          GROWABLE_HEAP_I8()[(buffer + i) >> 0] = _getentropy.randomDevice();
        }
        return 0;
      }
      function _setTempRet0(val) {
        setTempRet0(val);
      }
      function __isLeapYear(year) {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      }
      function __arraySum(array, index) {
        var sum = 0;
        for (var i = 0; i <= index; sum += array[i++]) {}
        return sum;
      }
      var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      function __addDays(date, days) {
        var newDate = new Date(date.getTime());
        while (days > 0) {
          var leap = __isLeapYear(newDate.getFullYear());
          var currentMonth = newDate.getMonth();
          var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
          if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
              newDate.setMonth(currentMonth + 1);
            } else {
              newDate.setMonth(0);
              newDate.setFullYear(newDate.getFullYear() + 1);
            }
          } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate;
          }
        }
        return newDate;
      }
      function _strftime(s, maxsize, format, tm) {
        var tm_zone = GROWABLE_HEAP_I32()[(tm + 40) >> 2];
        var date = {
          tm_sec: GROWABLE_HEAP_I32()[tm >> 2],
          tm_min: GROWABLE_HEAP_I32()[(tm + 4) >> 2],
          tm_hour: GROWABLE_HEAP_I32()[(tm + 8) >> 2],
          tm_mday: GROWABLE_HEAP_I32()[(tm + 12) >> 2],
          tm_mon: GROWABLE_HEAP_I32()[(tm + 16) >> 2],
          tm_year: GROWABLE_HEAP_I32()[(tm + 20) >> 2],
          tm_wday: GROWABLE_HEAP_I32()[(tm + 24) >> 2],
          tm_yday: GROWABLE_HEAP_I32()[(tm + 28) >> 2],
          tm_isdst: GROWABLE_HEAP_I32()[(tm + 32) >> 2],
          tm_gmtoff: GROWABLE_HEAP_I32()[(tm + 36) >> 2],
          tm_zone: tm_zone ? UTF8ToString(tm_zone) : '',
        };
        var pattern = UTF8ToString(format);
        var EXPANSION_RULES_1 = {
          '%c': '%a %b %d %H:%M:%S %Y',
          '%D': '%m/%d/%y',
          '%F': '%Y-%m-%d',
          '%h': '%b',
          '%r': '%I:%M:%S %p',
          '%R': '%H:%M',
          '%T': '%H:%M:%S',
          '%x': '%m/%d/%y',
          '%X': '%H:%M:%S',
          '%Ec': '%c',
          '%EC': '%C',
          '%Ex': '%m/%d/%y',
          '%EX': '%H:%M:%S',
          '%Ey': '%y',
          '%EY': '%Y',
          '%Od': '%d',
          '%Oe': '%e',
          '%OH': '%H',
          '%OI': '%I',
          '%Om': '%m',
          '%OM': '%M',
          '%OS': '%S',
          '%Ou': '%u',
          '%OU': '%U',
          '%OV': '%V',
          '%Ow': '%w',
          '%OW': '%W',
          '%Oy': '%y',
        };
        for (var rule in EXPANSION_RULES_1) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
        }
        var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var MONTHS = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        function leadingSomething(value, digits, character) {
          var str = typeof value == 'number' ? value.toString() : value || '';
          while (str.length < digits) {
            str = character[0] + str;
          }
          return str;
        }
        function leadingNulls(value, digits) {
          return leadingSomething(value, digits, '0');
        }
        function compareByDay(date1, date2) {
          function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0;
          }
          var compare;
          if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
              compare = sgn(date1.getDate() - date2.getDate());
            }
          }
          return compare;
        }
        function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0:
              return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
              return janFourth;
            case 2:
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
              return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
              return new Date(janFourth.getFullYear() - 1, 11, 30);
          }
        }
        function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear() + 1;
            } else {
              return thisDate.getFullYear();
            }
          } else {
            return thisDate.getFullYear() - 1;
          }
        }
        var EXPANSION_RULES_2 = {
          '%a': function (date) {
            return WEEKDAYS[date.tm_wday].substring(0, 3);
          },
          '%A': function (date) {
            return WEEKDAYS[date.tm_wday];
          },
          '%b': function (date) {
            return MONTHS[date.tm_mon].substring(0, 3);
          },
          '%B': function (date) {
            return MONTHS[date.tm_mon];
          },
          '%C': function (date) {
            var year = date.tm_year + 1900;
            return leadingNulls((year / 100) | 0, 2);
          },
          '%d': function (date) {
            return leadingNulls(date.tm_mday, 2);
          },
          '%e': function (date) {
            return leadingSomething(date.tm_mday, 2, ' ');
          },
          '%g': function (date) {
            return getWeekBasedYear(date).toString().substring(2);
          },
          '%G': function (date) {
            return getWeekBasedYear(date);
          },
          '%H': function (date) {
            return leadingNulls(date.tm_hour, 2);
          },
          '%I': function (date) {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0) twelveHour = 12;
            else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2);
          },
          '%j': function (date) {
            return leadingNulls(
              date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1),
              3
            );
          },
          '%m': function (date) {
            return leadingNulls(date.tm_mon + 1, 2);
          },
          '%M': function (date) {
            return leadingNulls(date.tm_min, 2);
          },
          '%n': function () {
            return '\n';
          },
          '%p': function (date) {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
              return 'AM';
            } else {
              return 'PM';
            }
          },
          '%S': function (date) {
            return leadingNulls(date.tm_sec, 2);
          },
          '%t': function () {
            return '\t';
          },
          '%u': function (date) {
            return date.tm_wday || 7;
          },
          '%U': function (date) {
            var days = date.tm_yday + 7 - date.tm_wday;
            return leadingNulls(Math.floor(days / 7), 2);
          },
          '%V': function (date) {
            var val = Math.floor((date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7);
            if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
              val++;
            }
            if (!val) {
              val = 52;
              var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
              if (dec31 == 4 || (dec31 == 5 && __isLeapYear((date.tm_year % 400) - 1))) {
                val++;
              }
            } else if (val == 53) {
              var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
              if (jan1 != 4 && (jan1 != 3 || !__isLeapYear(date.tm_year))) val = 1;
            }
            return leadingNulls(val, 2);
          },
          '%w': function (date) {
            return date.tm_wday;
          },
          '%W': function (date) {
            var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
            return leadingNulls(Math.floor(days / 7), 2);
          },
          '%y': function (date) {
            return (date.tm_year + 1900).toString().substring(2);
          },
          '%Y': function (date) {
            return date.tm_year + 1900;
          },
          '%z': function (date) {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = (off / 60) * 100 + (off % 60);
            return (ahead ? '+' : '-') + String('0000' + off).slice(-4);
          },
          '%Z': function (date) {
            return date.tm_zone;
          },
          '%%': function () {
            return '%';
          },
        };
        pattern = pattern.replace(/%%/g, '\0\0');
        for (var rule in EXPANSION_RULES_2) {
          if (pattern.includes(rule)) {
            pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
          }
        }
        pattern = pattern.replace(/\0\0/g, '%');
        var bytes = intArrayFromString(pattern, false);
        if (bytes.length > maxsize) {
          return 0;
        }
        writeArrayToMemory(bytes, s);
        return bytes.length - 1;
      }
      function _strftime_l(s, maxsize, format, tm) {
        return _strftime(s, maxsize, format, tm);
      }
      PThread.init();
      var FSNode = function (parent, name, mode, rdev) {
        if (!parent) {
          parent = this;
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.mounted = null;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.node_ops = {};
        this.stream_ops = {};
        this.rdev = rdev;
      };
      var readMode = 292 | 73;
      var writeMode = 146;
      Object.defineProperties(FSNode.prototype, {
        read: {
          get: function () {
            return (this.mode & readMode) === readMode;
          },
          set: function (val) {
            val ? (this.mode |= readMode) : (this.mode &= ~readMode);
          },
        },
        write: {
          get: function () {
            return (this.mode & writeMode) === writeMode;
          },
          set: function (val) {
            val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
          },
        },
        isFolder: {
          get: function () {
            return FS.isDir(this.mode);
          },
        },
        isDevice: {
          get: function () {
            return FS.isChrdev(this.mode);
          },
        },
      });
      FS.FSNode = FSNode;
      FS.staticInit();
      embind_init_charCodes();
      BindingError = Module['BindingError'] = extendError(Error, 'BindingError');
      InternalError = Module['InternalError'] = extendError(Error, 'InternalError');
      init_ClassHandle();
      init_embind();
      init_RegisteredPointer();
      UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');
      init_emval();
      var proxiedFunctionTable = [
        null,
        exitOnMainThread,
        pthreadCreateProxied,
        ___syscall_fcntl64,
        ___syscall_fstat64,
        ___syscall_ftruncate64,
        ___syscall_ioctl,
        ___syscall_lstat64,
        ___syscall_newfstatat,
        ___syscall_openat,
        ___syscall_renameat,
        ___syscall_stat64,
        ___syscall_unlinkat,
        __mmap_js,
        __munmap_js,
        _environ_get,
        _environ_sizes_get,
        _fd_close,
        _fd_read,
        _fd_seek,
        _fd_sync,
        _fd_write,
      ];
      function intArrayFromString(stringy, dontAddNull, length) {
        var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
        var u8array = new Array(len);
        var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
        if (dontAddNull) u8array.length = numBytesWritten;
        return u8array;
      }
      var asmLibraryArg = {
        b: ___assert_fail,
        n: ___cxa_allocate_exception,
        u: ___cxa_begin_catch,
        la: ___cxa_current_primary_exception,
        R: ___cxa_decrement_exception_refcount,
        x: ___cxa_end_catch,
        e: ___cxa_find_matching_catch_2,
        j: ___cxa_find_matching_catch_3,
        s: ___cxa_free_exception,
        Q: ___cxa_increment_exception_refcount,
        aa: ___cxa_rethrow,
        ka: ___cxa_rethrow_primary_exception,
        r: ___cxa_throw,
        ma: ___cxa_uncaught_exceptions,
        wa: ___emscripten_init_main_thread_js,
        S: ___emscripten_thread_cleanup,
        ra: ___pthread_create_js,
        f: ___resumeException,
        Fa: ___syscall_fstat64,
        ea: ___syscall_ftruncate64,
        Ca: ___syscall_lstat64,
        Da: ___syscall_newfstatat,
        Ha: ___syscall_openat,
        qa: ___syscall_renameat,
        Ea: ___syscall_stat64,
        oa: ___syscall_unlinkat,
        Ka: __dlinit,
        W: __dlopen_js,
        La: __dlsym_js,
        fa: __embind_register_bigint,
        Na: __embind_register_bool,
        Xa: __embind_register_class,
        Wa: __embind_register_class_constructor,
        y: __embind_register_class_function,
        Ma: __embind_register_emval,
        Z: __embind_register_float,
        A: __embind_register_integer,
        t: __embind_register_memory_view,
        Y: __embind_register_std_string,
        L: __embind_register_std_wstring,
        Oa: __embind_register_void,
        V: __emscripten_date_now,
        sa: __emscripten_default_pthread_stack_size,
        Ja: __emscripten_get_now_is_monotonic,
        ta: __emscripten_notify_task_queue,
        ya: __emscripten_set_offscreencanvas_size,
        Sa: __emval_decref,
        ia: __emval_incref,
        I: __emval_take_value,
        ua: __mmap_js,
        va: __munmap_js,
        d: _abort,
        T: _emscripten_check_blocking_allowed,
        pa: _emscripten_get_heap_max,
        w: _emscripten_get_now,
        Ga: _emscripten_memcpy_big,
        _: _emscripten_num_logical_cores,
        xa: _emscripten_receive_on_main_thread_js,
        na: _emscripten_resize_heap,
        Ia: _emscripten_unwind_to_js_event_loop,
        za: _environ_get,
        Aa: _environ_sizes_get,
        $: _exit,
        X: _fd_close,
        U: _fd_read,
        Va: _fd_seek,
        Ba: _fd_sync,
        K: _fd_write,
        c: _getTempRet0,
        ga: _getentropy,
        N: invoke_diii,
        Ra: invoke_fi,
        O: invoke_fiii,
        q: invoke_i,
        g: invoke_ii,
        Pa: invoke_iidii,
        h: invoke_iii,
        m: invoke_iiii,
        o: invoke_iiiii,
        ja: invoke_iiiiid,
        E: invoke_iiiiii,
        z: invoke_iiiiiii,
        P: invoke_iiiiiiii,
        H: invoke_iiiiiiiiiiii,
        Ua: invoke_j,
        Ta: invoke_jiiii,
        l: invoke_v,
        k: invoke_vi,
        i: invoke_vii,
        C: invoke_viid,
        M: invoke_viidi,
        p: invoke_viii,
        Qa: invoke_viiidiii,
        J: invoke_viiii,
        ca: invoke_viiiidi,
        da: invoke_viiiii,
        v: invoke_viiiiiii,
        F: invoke_viiiiiiidi,
        ba: invoke_viiiiiiii,
        D: invoke_viiiiiiiiii,
        G: invoke_viiiiiiiiiiiiiii,
        a: wasmMemory || Module['wasmMemory'],
        B: _setTempRet0,
        ha: _strftime_l,
      };
      var asm = createWasm();
      var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
        return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['Ya']).apply(null, arguments);
      });
      var _malloc = (Module['_malloc'] = function () {
        return (_malloc = Module['_malloc'] = Module['asm']['_a']).apply(null, arguments);
      });
      var _free = (Module['_free'] = function () {
        return (_free = Module['_free'] = Module['asm']['$a']).apply(null, arguments);
      });
      var ___errno_location = (Module['___errno_location'] = function () {
        return (___errno_location = Module['___errno_location'] = Module['asm']['ab']).apply(null, arguments);
      });
      var _pthread_self = (Module['_pthread_self'] = function () {
        return (_pthread_self = Module['_pthread_self'] = Module['asm']['bb']).apply(null, arguments);
      });
      var _emscripten_tls_init = (Module['_emscripten_tls_init'] = function () {
        return (_emscripten_tls_init = Module['_emscripten_tls_init'] = Module['asm']['cb']).apply(null, arguments);
      });
      var _emscripten_builtin_memalign = (Module['_emscripten_builtin_memalign'] = function () {
        return (_emscripten_builtin_memalign = Module['_emscripten_builtin_memalign'] = Module['asm']['db']).apply(null, arguments);
      });
      var ___getTypeName = (Module['___getTypeName'] = function () {
        return (___getTypeName = Module['___getTypeName'] = Module['asm']['eb']).apply(null, arguments);
      });
      var ___embind_register_native_and_builtin_types = (Module['___embind_register_native_and_builtin_types'] = function () {
        return (___embind_register_native_and_builtin_types = Module['___embind_register_native_and_builtin_types'] =
          Module['asm']['fb']).apply(null, arguments);
      });
      var ___stdio_exit = (Module['___stdio_exit'] = function () {
        return (___stdio_exit = Module['___stdio_exit'] = Module['asm']['gb']).apply(null, arguments);
      });
      var ___funcs_on_exit = (Module['___funcs_on_exit'] = function () {
        return (___funcs_on_exit = Module['___funcs_on_exit'] = Module['asm']['hb']).apply(null, arguments);
      });
      var __emscripten_thread_init = (Module['__emscripten_thread_init'] = function () {
        return (__emscripten_thread_init = Module['__emscripten_thread_init'] = Module['asm']['ib']).apply(null, arguments);
      });
      var __emscripten_thread_crashed = (Module['__emscripten_thread_crashed'] = function () {
        return (__emscripten_thread_crashed = Module['__emscripten_thread_crashed'] = Module['asm']['jb']).apply(null, arguments);
      });
      var _emscripten_run_in_main_runtime_thread_js = (Module['_emscripten_run_in_main_runtime_thread_js'] = function () {
        return (_emscripten_run_in_main_runtime_thread_js = Module['_emscripten_run_in_main_runtime_thread_js'] =
          Module['asm']['kb']).apply(null, arguments);
      });
      var __emscripten_proxy_execute_task_queue = (Module['__emscripten_proxy_execute_task_queue'] = function () {
        return (__emscripten_proxy_execute_task_queue = Module['__emscripten_proxy_execute_task_queue'] = Module['asm']['lb']).apply(
          null,
          arguments
        );
      });
      var __emscripten_thread_free_data = (Module['__emscripten_thread_free_data'] = function () {
        return (__emscripten_thread_free_data = Module['__emscripten_thread_free_data'] = Module['asm']['mb']).apply(null, arguments);
      });
      var __emscripten_thread_exit = (Module['__emscripten_thread_exit'] = function () {
        return (__emscripten_thread_exit = Module['__emscripten_thread_exit'] = Module['asm']['nb']).apply(null, arguments);
      });
      var _setThrew = (Module['_setThrew'] = function () {
        return (_setThrew = Module['_setThrew'] = Module['asm']['ob']).apply(null, arguments);
      });
      var _emscripten_stack_set_limits = (Module['_emscripten_stack_set_limits'] = function () {
        return (_emscripten_stack_set_limits = Module['_emscripten_stack_set_limits'] = Module['asm']['pb']).apply(null, arguments);
      });
      var stackSave = (Module['stackSave'] = function () {
        return (stackSave = Module['stackSave'] = Module['asm']['qb']).apply(null, arguments);
      });
      var stackRestore = (Module['stackRestore'] = function () {
        return (stackRestore = Module['stackRestore'] = Module['asm']['rb']).apply(null, arguments);
      });
      var stackAlloc = (Module['stackAlloc'] = function () {
        return (stackAlloc = Module['stackAlloc'] = Module['asm']['sb']).apply(null, arguments);
      });
      var ___cxa_can_catch = (Module['___cxa_can_catch'] = function () {
        return (___cxa_can_catch = Module['___cxa_can_catch'] = Module['asm']['tb']).apply(null, arguments);
      });
      var ___cxa_is_pointer_type = (Module['___cxa_is_pointer_type'] = function () {
        return (___cxa_is_pointer_type = Module['___cxa_is_pointer_type'] = Module['asm']['ub']).apply(null, arguments);
      });
      var dynCall_iiiij = (Module['dynCall_iiiij'] = function () {
        return (dynCall_iiiij = Module['dynCall_iiiij'] = Module['asm']['vb']).apply(null, arguments);
      });
      var dynCall_jii = (Module['dynCall_jii'] = function () {
        return (dynCall_jii = Module['dynCall_jii'] = Module['asm']['wb']).apply(null, arguments);
      });
      var dynCall_jjj = (Module['dynCall_jjj'] = function () {
        return (dynCall_jjj = Module['dynCall_jjj'] = Module['asm']['xb']).apply(null, arguments);
      });
      var dynCall_jji = (Module['dynCall_jji'] = function () {
        return (dynCall_jji = Module['dynCall_jji'] = Module['asm']['yb']).apply(null, arguments);
      });
      var dynCall_jiii = (Module['dynCall_jiii'] = function () {
        return (dynCall_jiii = Module['dynCall_jiii'] = Module['asm']['zb']).apply(null, arguments);
      });
      var dynCall_iiiijj = (Module['dynCall_iiiijj'] = function () {
        return (dynCall_iiiijj = Module['dynCall_iiiijj'] = Module['asm']['Ab']).apply(null, arguments);
      });
      var dynCall_viijj = (Module['dynCall_viijj'] = function () {
        return (dynCall_viijj = Module['dynCall_viijj'] = Module['asm']['Bb']).apply(null, arguments);
      });
      var dynCall_viiijjjj = (Module['dynCall_viiijjjj'] = function () {
        return (dynCall_viiijjjj = Module['dynCall_viiijjjj'] = Module['asm']['Cb']).apply(null, arguments);
      });
      var dynCall_iijjiiii = (Module['dynCall_iijjiiii'] = function () {
        return (dynCall_iijjiiii = Module['dynCall_iijjiiii'] = Module['asm']['Db']).apply(null, arguments);
      });
      var dynCall_jiji = (Module['dynCall_jiji'] = function () {
        return (dynCall_jiji = Module['dynCall_jiji'] = Module['asm']['Eb']).apply(null, arguments);
      });
      var dynCall_j = (Module['dynCall_j'] = function () {
        return (dynCall_j = Module['dynCall_j'] = Module['asm']['Fb']).apply(null, arguments);
      });
      var dynCall_viijii = (Module['dynCall_viijii'] = function () {
        return (dynCall_viijii = Module['dynCall_viijii'] = Module['asm']['Gb']).apply(null, arguments);
      });
      var dynCall_jiiii = (Module['dynCall_jiiii'] = function () {
        return (dynCall_jiiii = Module['dynCall_jiiii'] = Module['asm']['Hb']).apply(null, arguments);
      });
      var dynCall_iiiiij = (Module['dynCall_iiiiij'] = function () {
        return (dynCall_iiiiij = Module['dynCall_iiiiij'] = Module['asm']['Ib']).apply(null, arguments);
      });
      var dynCall_iiiiijj = (Module['dynCall_iiiiijj'] = function () {
        return (dynCall_iiiiijj = Module['dynCall_iiiiijj'] = Module['asm']['Jb']).apply(null, arguments);
      });
      var dynCall_iiiiiijj = (Module['dynCall_iiiiiijj'] = function () {
        return (dynCall_iiiiiijj = Module['dynCall_iiiiiijj'] = Module['asm']['Kb']).apply(null, arguments);
      });
      var __emscripten_allow_main_runtime_queued_calls = (Module['__emscripten_allow_main_runtime_queued_calls'] = 240356);
      function invoke_ii(index, a1) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iii(index, a1, a2) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_vi(index, a1) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_vii(index, a1, a2) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_i(index) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)();
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_fi(index, a1) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiii(index, a1, a2, a3, a4, a5) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_v(index) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)();
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiidi(index, a1, a2, a3, a4, a5, a6) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiidiii(index, a1, a2, a3, a4, a5, a6, a7) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viid(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viidi(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iidii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_fiii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_diii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_j(index) {
        var sp = stackSave();
        try {
          return dynCall_j(index);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_jiiii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          return dynCall_jiiii(index, a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      Module['keepRuntimeAlive'] = keepRuntimeAlive;
      Module['wasmMemory'] = wasmMemory;
      Module['ExitStatus'] = ExitStatus;
      Module['PThread'] = PThread;
      var calledRun;
      function ExitStatus(status) {
        this.name = 'ExitStatus';
        this.message = 'Program terminated with exit(' + status + ')';
        this.status = status;
      }
      dependenciesFulfilled = function runCaller() {
        if (!calledRun) run();
        if (!calledRun) dependenciesFulfilled = runCaller;
      };
      function run(args) {
        args = args || arguments_;
        if (runDependencies > 0) {
          return;
        }
        if (ENVIRONMENT_IS_PTHREAD) {
          readyPromiseResolve(Module);
          initRuntime();
          postMessage({ cmd: 'loaded' });
          return;
        }
        preRun();
        if (runDependencies > 0) {
          return;
        }
        function doRun() {
          if (calledRun) return;
          calledRun = true;
          Module['calledRun'] = true;
          if (ABORT) return;
          initRuntime();
          readyPromiseResolve(Module);
          if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
          postRun();
        }
        if (Module['setStatus']) {
          Module['setStatus']('Running...');
          setTimeout(function () {
            setTimeout(function () {
              Module['setStatus']('');
            }, 1);
            doRun();
          }, 1);
        } else {
          doRun();
        }
      }
      Module['run'] = run;
      function exit(status, implicit) {
        EXITSTATUS = status;
        if (!implicit) {
          if (ENVIRONMENT_IS_PTHREAD) {
            exitOnMainThread(status);
            throw 'unwind';
          } else {
          }
        }
        if (!keepRuntimeAlive()) {
          exitRuntime();
        }
        procExit(status);
      }
      function procExit(code) {
        EXITSTATUS = code;
        if (!keepRuntimeAlive()) {
          PThread.terminateAllThreads();
          if (Module['onExit']) Module['onExit'](code);
          ABORT = true;
        }
        quit_(code, new ExitStatus(code));
      }
      if (Module['preInit']) {
        if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
        while (Module['preInit'].length > 0) {
          Module['preInit'].pop()();
        }
      }
      run();

      return Module.ready;
    };
  })();
  createWasmMultiInstance = Module;
}

var V = Object.defineProperty;
var Y = (t, e, r) => (e in t ? V(t, e, { enumerable: true, configurable: true, writable: true, value: r }) : (t[e] = r));
var a = (t, e, r) => (Y(t, typeof e != 'symbol' ? e + '' : e, r), r);
class l {}
a(l, 'updates', {
  transformer_new: 'New transformer',
  transformer_null: 'Null transformer',
}),
  a(l, 'errors', {
    transformer_none: 'No transformers provided',
    transformer_start: 'Cannot start transformer',
    transformer_transform: 'Cannot transform frame',
    transformer_flush: 'Cannot flush transformer',
    readable_null: 'Readable is null',
    writable_null: 'Writable is null',
  });
const h = /* @__PURE__ */ new WeakMap(),
  E = /* @__PURE__ */ new WeakMap(),
  y = /* @__PURE__ */ new WeakMap(),
  O = Symbol('anyProducer'),
  U = Promise.resolve(),
  k = Symbol('listenerAdded'),
  A = Symbol('listenerRemoved');
let x = false;
function g(t) {
  if (typeof t != 'string' && typeof t != 'symbol') throw new TypeError('eventName must be a string or a symbol');
}
function T(t) {
  if (typeof t != 'function') throw new TypeError('listener must be a function');
}
function _(t, e) {
  const r = E.get(t);
  return r.has(e) || r.set(e, /* @__PURE__ */ new Set()), r.get(e);
}
function b(t, e) {
  const r = typeof e == 'string' || typeof e == 'symbol' ? e : O,
    s = y.get(t);
  return s.has(r) || s.set(r, /* @__PURE__ */ new Set()), s.get(r);
}
function q(t, e, r) {
  const s = y.get(t);
  if (s.has(e)) for (const o of s.get(e)) o.enqueue(r);
  if (s.has(O)) {
    const o = Promise.all([e, r]);
    for (const i of s.get(O)) i.enqueue(o);
  }
}
function $(t, e) {
  e = Array.isArray(e) ? e : [e];
  let r = false,
    s = () => {},
    o = [];
  const i = {
    enqueue(n) {
      o.push(n), s();
    },
    finish() {
      (r = true), s();
    },
  };
  for (const n of e) b(t, n).add(i);
  return {
    async next() {
      return o
        ? o.length === 0
          ? r
            ? ((o = void 0), this.next())
            : (await new Promise((n) => {
                s = n;
              }),
              this.next())
          : {
              done: false,
              value: await o.shift(),
            }
        : { done: true };
    },
    async return(n) {
      o = void 0;
      for (const c of e) b(t, c).delete(i);
      return s(), arguments.length > 0 ? { done: true, value: await n } : { done: true };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
function H(t) {
  if (t === void 0) return Q;
  if (!Array.isArray(t)) throw new TypeError('`methodNames` must be an array of strings');
  for (const e of t)
    if (!Q.includes(e))
      throw typeof e != 'string' ? new TypeError('`methodNames` element must be a string') : new Error(`${e} is not Emittery method`);
  return t;
}
const I = (t) => t === k || t === A;
class m {
  static mixin(e, r) {
    return (
      (r = H(r)),
      (s) => {
        if (typeof s != 'function') throw new TypeError('`target` must be function');
        for (const n of r) if (s.prototype[n] !== void 0) throw new Error(`The property \`${n}\` already exists on \`target\``);
        function o() {
          return (
            Object.defineProperty(this, e, {
              enumerable: false,
              value: new m(),
            }),
            this[e]
          );
        }
        Object.defineProperty(s.prototype, e, {
          enumerable: false,
          get: o,
        });
        const i = (n) =>
          function (...c) {
            return this[e][n](...c);
          };
        for (const n of r)
          Object.defineProperty(s.prototype, n, {
            enumerable: false,
            value: i(n),
          });
        return s;
      }
    );
  }
  static get isDebugEnabled() {
    if (typeof process != 'object') return x;
    const { env: e } = process || { env: {} };
    return e.DEBUG === 'emittery' || e.DEBUG === '*' || x;
  }
  static set isDebugEnabled(e) {
    x = e;
  }
  constructor(e = {}) {
    h.set(this, /* @__PURE__ */ new Set()),
      E.set(this, /* @__PURE__ */ new Map()),
      y.set(this, /* @__PURE__ */ new Map()),
      (this.debug = e.debug || {}),
      this.debug.enabled === void 0 && (this.debug.enabled = false),
      this.debug.logger ||
        (this.debug.logger = (r, s, o, i) => {
          try {
            i = JSON.stringify(i);
          } catch {
            i = `Object with the following keys failed to stringify: ${Object.keys(i).join(',')}`;
          }
          typeof o == 'symbol' && (o = o.toString());
          const n = /* @__PURE__ */ new Date(),
            c = `${n.getHours()}:${n.getMinutes()}:${n.getSeconds()}.${n.getMilliseconds()}`;
          console.log(`[${c}][emittery:${r}][${s}] Event Name: ${o}
    data: ${i}`);
        });
  }
  logIfDebugEnabled(e, r, s) {
    (m.isDebugEnabled || this.debug.enabled) && this.debug.logger(e, this.debug.name, r, s);
  }
  on(e, r) {
    T(r), (e = Array.isArray(e) ? e : [e]);
    for (const s of e)
      g(s), _(this, s).add(r), this.logIfDebugEnabled('subscribe', s, void 0), I(s) || this.emit(k, { eventName: s, listener: r });
    return this.off.bind(this, e, r);
  }
  off(e, r) {
    T(r), (e = Array.isArray(e) ? e : [e]);
    for (const s of e)
      g(s), _(this, s).delete(r), this.logIfDebugEnabled('unsubscribe', s, void 0), I(s) || this.emit(A, { eventName: s, listener: r });
  }
  once(e) {
    return new Promise((r) => {
      const s = this.on(e, (o) => {
        s(), r(o);
      });
    });
  }
  events(e) {
    e = Array.isArray(e) ? e : [e];
    for (const r of e) g(r);
    return $(this, e);
  }
  async emit(e, r) {
    g(e), this.logIfDebugEnabled('emit', e, r), q(this, e, r);
    const s = _(this, e),
      o = h.get(this),
      i = [...s],
      n = I(e) ? [] : [...o];
    await U,
      await Promise.all([
        ...i.map(async (c) => {
          if (s.has(c)) return c(r);
        }),
        ...n.map(async (c) => {
          if (o.has(c)) return c(e, r);
        }),
      ]);
  }
  async emitSerial(e, r) {
    g(e), this.logIfDebugEnabled('emitSerial', e, r);
    const s = _(this, e),
      o = h.get(this),
      i = [...s],
      n = [...o];
    await U;
    for (const c of i) s.has(c) && (await c(r));
    for (const c of n) o.has(c) && (await c(e, r));
  }
  onAny(e) {
    return (
      T(e),
      this.logIfDebugEnabled('subscribeAny', void 0, void 0),
      h.get(this).add(e),
      this.emit(k, { listener: e }),
      this.offAny.bind(this, e)
    );
  }
  anyEvent() {
    return $(this);
  }
  offAny(e) {
    T(e), this.logIfDebugEnabled('unsubscribeAny', void 0, void 0), this.emit(A, { listener: e }), h.get(this).delete(e);
  }
  clearListeners(e) {
    e = Array.isArray(e) ? e : [e];
    for (const r of e)
      if ((this.logIfDebugEnabled('clear', r, void 0), typeof r == 'string' || typeof r == 'symbol')) {
        _(this, r).clear();
        const s = b(this, r);
        for (const o of s) o.finish();
        s.clear();
      } else {
        h.get(this).clear();
        for (const s of E.get(this).values()) s.clear();
        for (const s of y.get(this).values()) {
          for (const o of s) o.finish();
          s.clear();
        }
      }
  }
  listenerCount(e) {
    e = Array.isArray(e) ? e : [e];
    let r = 0;
    for (const s of e) {
      if (typeof s == 'string') {
        r += h.get(this).size + _(this, s).size + b(this, s).size + b(this).size;
        continue;
      }
      typeof s < 'u' && g(s), (r += h.get(this).size);
      for (const o of E.get(this).values()) r += o.size;
      for (const o of y.get(this).values()) r += o.size;
    }
    return r;
  }
  bindMethods(e, r) {
    if (typeof e != 'object' || e === null) throw new TypeError('`target` must be an object');
    r = H(r);
    for (const s of r) {
      if (e[s] !== void 0) throw new Error(`The property \`${s}\` already exists on \`target\``);
      Object.defineProperty(e, s, {
        enumerable: false,
        value: this[s].bind(this),
      });
    }
  }
}
const Q = Object.getOwnPropertyNames(m.prototype).filter((t) => t !== 'constructor');
Object.defineProperty(m, 'listenerAdded', {
  value: k,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(m, 'listenerRemoved', {
  value: A,
  writable: false,
  enumerable: true,
  configurable: false,
});
var L = m;
function J(t) {
  return typeof t == 'object' && t !== null && 'message' in t && typeof t.message == 'string';
}
function X(t) {
  if (J(t)) return t;
  try {
    return new Error(JSON.stringify(t));
  } catch {
    return new Error(String(t));
  }
}
function v(t) {
  return X(t).message;
}
var Z = Object.defineProperty,
  K = (t, e, r) => (e in t ? Z(t, e, { enumerable: true, configurable: true, writable: true, value: r }) : (t[e] = r)),
  N = (t, e, r) => (K(t, typeof e != 'symbol' ? e + '' : e, r), r);
const re = 'hlg.tokbox.com/prod/logging/vcp_webrtc',
  te = 'https://',
  se = 1e4;
let S;
const oe = new Uint8Array(16);
function ie() {
  if (!S && ((S = typeof crypto < 'u' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)), !S))
    throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
  return S(oe);
}
const f = [];
for (let t = 0; t < 256; ++t) f.push((t + 256).toString(16).slice(1));
function ne(t, e = 0) {
  return (
    f[t[e + 0]] +
    f[t[e + 1]] +
    f[t[e + 2]] +
    f[t[e + 3]] +
    '-' +
    f[t[e + 4]] +
    f[t[e + 5]] +
    '-' +
    f[t[e + 6]] +
    f[t[e + 7]] +
    '-' +
    f[t[e + 8]] +
    f[t[e + 9]] +
    '-' +
    f[t[e + 10]] +
    f[t[e + 11]] +
    f[t[e + 12]] +
    f[t[e + 13]] +
    f[t[e + 14]] +
    f[t[e + 15]]
  ).toLowerCase();
}
const ae = typeof crypto < 'u' && crypto.randomUUID && crypto.randomUUID.bind(crypto),
  z = {
    randomUUID: ae,
  };
function ce(t, e, r) {
  if (z.randomUUID && !e && !t) return z.randomUUID();
  t = t || {};
  const s = t.random || (t.rng || ie)();
  if (((s[6] = (s[6] & 15) | 64), (s[8] = (s[8] & 63) | 128), e)) {
    r = r || 0;
    for (let o = 0; o < 16; ++o) e[r + o] = s[o];
    return e;
  }
  return ne(s);
}
function W(t, e) {
  globalThis.vonage || (globalThis.vonage = {}), globalThis.vonage.workerizer || (globalThis.vonage.workerizer = {});
  let r = globalThis.vonage.workerizer;
  return r[t] || (r[t] = e), r[t];
}
const p = W('globals', {});
var d = /* @__PURE__ */ ((t) => (
  (t.INIT = 'INIT'), (t.FORWARD = 'FORWARD'), (t.TERMINATE = 'TERMINATE'), (t.GLOBALS_SYNC = 'GLOBALS_SYNC'), t
))(d || {});
function j(t) {
  return [ImageBitmap, ReadableStream, WritableStream].some((e) => t instanceof e);
}
let fe = 0;
function le(t, e, r, s, o) {
  const i = fe++;
  return (
    t.postMessage(
      {
        id: i,
        type: e,
        functionName: r,
        args: s,
      },
      s.filter((n) => j(n))
    ),
    new Promise((n) => {
      o == null || o.set(i, n);
    })
  );
}
function w(t, e) {
  const { id: r, type: s } = t,
    o = Array.isArray(e) ? e : [e];
  postMessage(
    {
      id: r,
      type: s,
      result: e,
    },
    o.filter((i) => j(i))
  );
}
const G = W('workerized', {});
function B() {
  return typeof WorkerGlobalScope < 'u' && self instanceof WorkerGlobalScope;
}
async function ue() {
  if (B()) w({ type: d.GLOBALS_SYNC }, p);
  else {
    const t = [];
    for (const e in G) {
      const { worker: r, resolvers: s } = G[e].workerContext;
      r && t.push(le(r, d.GLOBALS_SYNC, '', [p], s));
    }
    await Promise.all(t);
  }
}
function P(t, e) {
  if (Array.isArray(e)) e.splice(0, e.length);
  else if (typeof e == 'object') for (const r in e) delete e[r];
  for (const r in t)
    Array.isArray(t[r]) ? ((e[r] = []), P(t[r], e[r])) : typeof t[r] == 'object' ? ((e[r] = {}), P(t[r], e[r])) : (e[r] = t[r]);
}
async function he(t, e) {
  const { functionName: r, args: s } = t;
  if (!e.instance) throw 'instance not initialized';
  if (!r) throw 'missing function name to call';
  if (!e.instance[r]) throw `undefined function [${r}] in class ${e.instance.constructor.workerId}`;
  w(t, await e.instance[r](...(s != null ? s : [])));
}
const pe = W('registeredWorkers', {});
function de(t, e) {
  if (!t.args) throw 'Missing className while initializing worker';
  const [r, s] = t.args,
    o = pe[r];
  if (o) e.instance = new o(t.args.slice(1));
  else throw `unknown worker class ${r}`;
  P(s, p), w(t, typeof e.instance !== void 0);
}
async function me(t, e) {
  const { args: r } = t;
  if (!e.instance) throw 'instance not initialized';
  let s;
  e.instance.terminate && (s = await e.instance.terminate(...(r != null ? r : []))), w(t, s);
}
function ge(t) {
  if (!t.args) throw 'Missing globals while syncing';
  P(t.args[0], p), w(t, {});
}
function _e() {
  const t = {};
  onmessage = async (e) => {
    const r = e.data;
    switch (r.type) {
      case d.INIT:
        de(r, t);
        break;
      case d.FORWARD:
        he(r, t);
        break;
      case d.TERMINATE:
        me(r, t);
        break;
      case d.GLOBALS_SYNC:
        ge(r);
        break;
    }
  };
}
B() && _e();
function ye(t, e) {
  return (
    p[t] || (p[t] = e),
    [
      () => p[t],
      async (r) => {
        (p[t] = r), await ue();
      },
    ]
  );
}
function be(t, e) {
  return ye(t, e);
}
const [we, Te] = be('metadata');
function C() {
  return we();
}
class D {
  constructor(e) {
    N(this, 'uuid', ce()), (this.config = e);
  }
  async send(e) {
    var r, s, o;
    const { appId: i, sourceType: n } = (r = C()) != null ? r : {};
    if (!i || !n) return 'metadata missing';
    const c = new AbortController(),
      u = setTimeout(() => c.abort(), se);
    return (
      await ((o = (s = this.config) == null ? void 0 : s.fetch) != null ? o : fetch)(this.getUrl(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(this.buildReport(e)),
        signal: c.signal,
      }),
      clearTimeout(u),
      'success'
    );
  }
  getUrl() {
    var e;
    let r = (e = C().proxyUrl) != null ? e : te;
    return (r += (r.at(-1) === '/' ? '' : '/') + re), r;
  }
  getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }
  buildReport(e) {
    const r = C();
    return {
      guid: this.uuid,
      ...e,
      applicationId: r.appId,
      timestamp: Date.now(),
      proxyUrl: r.proxyUrl,
      source: r.sourceType,
    };
  }
}
const R = '2.0.3';
class Se {
  constructor(e) {
    a(this, 'frameTransformedCount', 0);
    a(this, 'frameFromSourceCount', 0);
    a(this, 'startAt', 0);
    a(this, 'reporter');
    (this.config = e), (this.reporter = new D(e));
  }
  async onFrameFromSource() {
    this.frameFromSourceCount++;
  }
  get fps() {
    const { startAt: e, frameFromSourceCount: r } = this,
      o = (Date.now() - e) / 1e3;
    return r / o;
  }
  async onFrameTransformed(e = {}, r = false) {
    this.startAt === 0 && (this.startAt = Date.now()), this.frameTransformedCount++;
    const { startAt: s, frameTransformedCount: o, frameFromSourceCount: i } = this,
      n = Date.now(),
      c = (n - s) / 1e3,
      u = o / c,
      M = i / c;
    return r || this.frameTransformedCount >= this.config.loggingIntervalFrameCount
      ? ((this.frameFromSourceCount = 0),
        (this.frameTransformedCount = 0),
        (this.startAt = n),
        (this.reporter.config = this.config),
        this.reporter.send({
          ...this.config.report,
          variation: 'QoS',
          fps: M,
          transformedFps: u,
          framesTransformed: o,
          ...e,
        }))
      : 'success';
  }
}
var F = /* @__PURE__ */ ((t) => (
  (t.pipeline_ended = 'pipeline_ended'),
  (t.pipeline_ended_with_error = 'pipeline_ended_with_error'),
  (t.pipeline_started = 'pipeline_started'),
  (t.pipeline_started_with_error = 'pipeline_started_with_error'),
  (t.pipeline_restarted = 'pipeline_restarted'),
  (t.pipeline_restarted_with_error = 'pipeline_restarted_with_error'),
  t
))(F || {});
const ke = 500,
  Ae = 0.8;
class Pe extends L {
  constructor(r, s) {
    super();
    a(this, 'reporter_', new D());
    a(
      this,
      'reporterQos_',
      new Se({
        loggingIntervalFrameCount: ke,
        report: {
          version: R,
        },
      })
    );
    a(this, 'transformerType_');
    a(this, 'transformer_');
    a(this, 'shouldStop_');
    a(this, 'isFlashed_');
    a(this, 'mediaTransformerQosReportStartTimestamp_');
    a(this, 'videoHeight_');
    a(this, 'videoWidth_');
    a(this, 'trackExpectedRate_');
    a(this, 'index_');
    a(this, 'controller_');
    (this.index_ = s),
      (this.transformer_ = r),
      (this.shouldStop_ = false),
      (this.isFlashed_ = false),
      (this.mediaTransformerQosReportStartTimestamp_ = 0),
      (this.videoHeight_ = 0),
      (this.videoWidth_ = 0),
      (this.trackExpectedRate_ = -1),
      (this.transformerType_ = 'Custom'),
      'getTransformerType' in r && (this.transformerType_ = r.getTransformerType()),
      this.report({
        variation: 'Create',
      });
  }
  setTrackExpectedRate(r) {
    this.trackExpectedRate_ = r;
  }
  async start(r) {
    if (((this.controller_ = r), this.transformer_ && typeof this.transformer_.start == 'function'))
      try {
        await this.transformer_.start(r);
      } catch (s) {
        this.report({
          message: l.errors.transformer_start,
          variation: 'Error',
          error: v(s),
        });
        const o = { eventMetaData: { transformerIndex: this.index_ }, error: s, function: 'start' };
        this.emit('error', o);
      }
  }
  async transform(r, s) {
    var o, i, n, c;
    if (
      (this.mediaTransformerQosReportStartTimestamp_ === 0 && (this.mediaTransformerQosReportStartTimestamp_ = Date.now()),
      r instanceof VideoFrame &&
        ((this.videoHeight_ = (o = r == null ? void 0 : r.displayHeight) != null ? o : 0),
        (this.videoWidth_ = (i = r == null ? void 0 : r.displayWidth) != null ? i : 0)),
      this.reporterQos_.onFrameFromSource(),
      this.transformer_)
    )
      if (this.shouldStop_) console.warn('[Pipeline] flush from transform'), r.close(), this.flush(s), s.terminate();
      else {
        try {
          await ((c = (n = this.transformer_).transform) == null ? void 0 : c.call(n, r, s)), this.reportQos();
        } catch (u) {
          this.report({
            message: l.errors.transformer_transform,
            variation: 'Error',
            error: v(u),
          });
          const M = { eventMetaData: { transformerIndex: this.index_ }, error: u, function: 'transform' };
          this.emit('error', M);
        }
        if (this.trackExpectedRate_ != -1 && this.trackExpectedRate_ * Ae > this.reporterQos_.fps) {
          const u = {
            eventMetaData: {
              transformerIndex: this.index_,
            },
            warningType: 'fps_drop',
            dropInfo: {
              requested: this.trackExpectedRate_,
              current: this.reporterQos_.fps,
            },
          };
          this.emit('warn', u);
        }
      }
  }
  async flush(r) {
    if (this.transformer_ && typeof this.transformer_.flush == 'function' && !this.isFlashed_) {
      this.isFlashed_ = true;
      try {
        await this.transformer_.flush(r);
      } catch (s) {
        this.report({
          message: l.errors.transformer_flush,
          variation: 'Error',
          error: v(s),
        });
        const o = { eventMetaData: { transformerIndex: this.index_ }, error: s, function: 'flush' };
        this.emit('error', o);
      }
    }
    this.reportQos(true),
      this.report({
        variation: 'Delete',
      });
  }
  stop() {
    console.log('[Pipeline] Stop stream.'),
      this.controller_ && (this.flush(this.controller_), this.controller_.terminate()),
      (this.shouldStop_ = true);
  }
  report(r) {
    this.reporter_.send({
      version: R,
      action: 'MediaTransformer',
      transformerType: this.transformerType_,
      ...r,
    });
  }
  reportQos(r = false) {
    (this.reporterQos_.config = {
      ...this.reporterQos_.config,
    }),
      this.reporterQos_.onFrameTransformed(
        {
          version: R,
          action: 'MediaTransformer',
          transformerType: this.transformerType_,
          videoWidth: this.videoWidth_,
          videoHeight: this.videoHeight_,
        },
        r
      );
  }
}
class Me extends L {
  constructor(r) {
    super();
    a(this, 'transformers_');
    a(this, 'trackExpectedRate_');
    (this.transformers_ = []), (this.trackExpectedRate_ = -1);
    for (let s = 0; s < r.length; s++) {
      let o = new Pe(r[s], s);
      o.on('error', (i) => {
        this.emit('error', i);
      }),
        o.on('warn', (i) => {
          this.emit('warn', i);
        }),
        this.transformers_.push(o);
    }
  }
  setTrackExpectedRate(r) {
    this.trackExpectedRate_ = r;
    for (let s of this.transformers_) s.setTrackExpectedRate(this.trackExpectedRate_);
  }
  async start(r, s) {
    if (!this.transformers_ || this.transformers_.length === 0) {
      console.log('[Pipeline] No transformers.');
      return;
    }
    try {
      let o = r;
      for (let i of this.transformers_) r = r.pipeThrough(new TransformStream(i));
      r.pipeTo(s)
        .then(async () => {
          console.log('[Pipeline] Setup.'), await s.abort(), await o.cancel(), this.emit('pipelineInfo', 'pipeline_ended');
        })
        .catch(async (i) => {
          r
            .cancel()
            .then(() => {
              console.log('[Pipeline] Shutting down streams after abort.');
            })
            .catch((n) => {
              console.error('[Pipeline] Error from stream transform:', n);
            }),
            await s.abort(i),
            await o.cancel(i),
            this.emit('pipelineInfo', 'pipeline_ended_with_error');
        });
    } catch {
      this.emit('pipelineInfo', 'pipeline_started_with_error'), this.destroy();
      return;
    }
    this.emit('pipelineInfo', 'pipeline_started'), console.log('[Pipeline] Pipeline started.');
  }
  async destroy() {
    console.log('[Pipeline] Destroying Pipeline.');
    for (let r of this.transformers_) r.stop();
  }
}
class Oe extends L {
  constructor() {
    super();
    a(this, 'reporter_');
    a(this, 'pipeline_');
    a(this, 'transformers_');
    a(this, 'readable_');
    a(this, 'writable_');
    a(this, 'trackExpectedRate_');
    (this.reporter_ = new D()),
      (this.trackExpectedRate_ = -1),
      this.report({
        variation: 'Create',
      });
  }
  setTrackExpectedRate(r) {
    (this.trackExpectedRate_ = r), this.pipeline_ && this.pipeline_.setTrackExpectedRate(this.trackExpectedRate_);
  }
  transform(r, s) {
    return (this.readable_ = r), (this.writable_ = s), this.transformInternal();
  }
  transformInternal() {
    return new Promise(async (r, s) => {
      if (!this.transformers_ || this.transformers_.length === 0) {
        this.report({
          message: l.errors.transformer_none,
          variation: 'Error',
        }),
          s('[MediaProcessor] Need to set transformers.');
        return;
      }
      if (!this.readable_) {
        this.report({
          variation: 'Error',
          message: l.errors.readable_null,
        }),
          s('[MediaProcessor] Readable is null.');
        return;
      }
      if (!this.writable_) {
        this.report({
          variation: 'Error',
          message: l.errors.writable_null,
        }),
          s('[MediaProcessor] Writable is null.');
        return;
      }
      let o = false;
      this.pipeline_ && ((o = true), this.pipeline_.clearListeners(), this.pipeline_.destroy()),
        (this.pipeline_ = new Me(this.transformers_)),
        this.pipeline_.on('warn', (i) => {
          this.emit('warn', i);
        }),
        this.pipeline_.on('error', (i) => {
          this.emit('error', i);
        }),
        this.pipeline_.on('pipelineInfo', (i) => {
          o &&
            (i === 'pipeline_started'
              ? (i = F.pipeline_restarted)
              : i === 'pipeline_started_with_error' && (i = F.pipeline_restarted_with_error)),
            this.emit('pipelineInfo', i);
        }),
        this.trackExpectedRate_ != -1 && this.pipeline_.setTrackExpectedRate(this.trackExpectedRate_),
        this.pipeline_
          .start(this.readable_, this.writable_)
          .then(() => {
            r();
          })
          .catch((i) => {
            s(i);
          });
    });
  }
  setTransformers(r) {
    return (
      this.report({
        variation: 'Update',
        message: l.updates.transformer_new,
      }),
      (this.transformers_ = r),
      this.readable_ && this.writable_ ? this.transformInternal() : Promise.resolve()
    );
  }
  destroy() {
    return new Promise(async (r) => {
      this.pipeline_ && this.pipeline_.destroy(), this.report({ variation: 'Delete' }), r();
    });
  }
  report(r) {
    this.reporter_.send({
      version: R,
      action: 'MediaProcessor',
      ...r,
    });
  }
}
class xe {
  constructor() {
    a(this, 'processor_');
    a(this, 'generator_');
    (this.processor_ = null), (this.generator_ = null);
  }
  init(e) {
    return new Promise((r, s) => {
      try {
        this.processor_ = new MediaStreamTrackProcessor(e);
      } catch (o) {
        console.log(`[InsertableStreamHelper] MediaStreamTrackProcessor failed: ${o}`), s(o);
      }
      try {
        e.kind === 'audio'
          ? (this.generator_ = new MediaStreamTrackGenerator({ kind: 'audio' }))
          : e.kind === 'video'
          ? (this.generator_ = new MediaStreamTrackGenerator({ kind: 'video' }))
          : s('kind not supported');
      } catch (o) {
        console.log(`[InsertableStreamHelper] MediaStreamTrackGenerator failed: ${o}`), s(o);
      }
      r();
    });
  }
  getReadable() {
    return this.processor_.readable;
  }
  getWriteable() {
    return this.generator_.writable;
  }
  getProccesorTrack() {
    return this.generator_;
  }
}
class Fe {
  constructor(e) {
    a(this, 'insertableStreamHelper_');
    a(this, 'mediaProcessor_');
    (this.insertableStreamHelper_ = new xe()), (this.mediaProcessor_ = e);
  }
  setTrack(e) {
    return new Promise((r, s) => {
      this.insertableStreamHelper_
        .init(e)
        .then(() => {
          this.mediaProcessor_
            .transform(this.insertableStreamHelper_.getReadable(), this.insertableStreamHelper_.getWriteable())
            .then(() => {
              r(this.insertableStreamHelper_.getProccesorTrack());
            })
            .catch((o) => {
              s(o);
            });
        })
        .catch((o) => {
          s(o);
        });
    });
  }
  destroy() {
    return new Promise((e, r) => {
      this.mediaProcessor_
        ? this.mediaProcessor_
            .destroy()
            .then(() => {
              e();
            })
            .catch((s) => {
              r(s);
            })
        : r('no processor');
    });
  }
}
const anyMap$1 = /* @__PURE__ */ new WeakMap();
const eventsMap$1 = /* @__PURE__ */ new WeakMap();
const producersMap$1 = /* @__PURE__ */ new WeakMap();
const anyProducer$1 = Symbol('anyProducer');
const resolvedPromise$1 = Promise.resolve();
const listenerAdded$1 = Symbol('listenerAdded');
const listenerRemoved$1 = Symbol('listenerRemoved');
let canEmitMetaEvents$1 = false;
let isGlobalDebugEnabled$1 = false;
function assertEventName$1(eventName) {
  if (typeof eventName !== 'string' && typeof eventName !== 'symbol' && typeof eventName !== 'number') {
    throw new TypeError('`eventName` must be a string, symbol, or number');
  }
}
function assertListener$1(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }
}
function getListeners$1(instance, eventName) {
  const events = eventsMap$1.get(instance);
  if (!events.has(eventName)) {
    return;
  }
  return events.get(eventName);
}
function getEventProducers$1(instance, eventName) {
  const key = typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number' ? eventName : anyProducer$1;
  const producers = producersMap$1.get(instance);
  if (!producers.has(key)) {
    return;
  }
  return producers.get(key);
}
function enqueueProducers$1(instance, eventName, eventData) {
  const producers = producersMap$1.get(instance);
  if (producers.has(eventName)) {
    for (const producer of producers.get(eventName)) {
      producer.enqueue(eventData);
    }
  }
  if (producers.has(anyProducer$1)) {
    const item = Promise.all([eventName, eventData]);
    for (const producer of producers.get(anyProducer$1)) {
      producer.enqueue(item);
    }
  }
}
function iterator$1(instance, eventNames) {
  eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
  let isFinished = false;
  let flush = () => {};
  let queue = [];
  const producer = {
    enqueue(item) {
      queue.push(item);
      flush();
    },
    finish() {
      isFinished = true;
      flush();
    },
  };
  for (const eventName of eventNames) {
    let set = getEventProducers$1(instance, eventName);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      const producers = producersMap$1.get(instance);
      producers.set(eventName, set);
    }
    set.add(producer);
  }
  return {
    async next() {
      if (!queue) {
        return { done: true };
      }
      if (queue.length === 0) {
        if (isFinished) {
          queue = void 0;
          return this.next();
        }
        await new Promise((resolve) => {
          flush = resolve;
        });
        return this.next();
      }
      return {
        done: false,
        value: await queue.shift(),
      };
    },
    async return(value) {
      queue = void 0;
      for (const eventName of eventNames) {
        const set = getEventProducers$1(instance, eventName);
        if (set) {
          set.delete(producer);
          if (set.size === 0) {
            const producers = producersMap$1.get(instance);
            producers.delete(eventName);
          }
        }
      }
      flush();
      return arguments.length > 0 ? { done: true, value: await value } : { done: true };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
function defaultMethodNamesOrAssert$1(methodNames) {
  if (methodNames === void 0) {
    return allEmitteryMethods$1;
  }
  if (!Array.isArray(methodNames)) {
    throw new TypeError('`methodNames` must be an array of strings');
  }
  for (const methodName of methodNames) {
    if (!allEmitteryMethods$1.includes(methodName)) {
      if (typeof methodName !== 'string') {
        throw new TypeError('`methodNames` element must be a string');
      }
      throw new Error(`${methodName} is not Emittery method`);
    }
  }
  return methodNames;
}
const isMetaEvent$1 = (eventName) => eventName === listenerAdded$1 || eventName === listenerRemoved$1;
function emitMetaEvent$1(emitter, eventName, eventData) {
  if (isMetaEvent$1(eventName)) {
    try {
      canEmitMetaEvents$1 = true;
      emitter.emit(eventName, eventData);
    } finally {
      canEmitMetaEvents$1 = false;
    }
  }
}
let Emittery$1 = class Emittery {
  static mixin(emitteryPropertyName, methodNames) {
    methodNames = defaultMethodNamesOrAssert$1(methodNames);
    return (target) => {
      if (typeof target !== 'function') {
        throw new TypeError('`target` must be function');
      }
      for (const methodName of methodNames) {
        if (target.prototype[methodName] !== void 0) {
          throw new Error(`The property \`${methodName}\` already exists on \`target\``);
        }
      }
      function getEmitteryProperty() {
        Object.defineProperty(this, emitteryPropertyName, {
          enumerable: false,
          value: new Emittery(),
        });
        return this[emitteryPropertyName];
      }
      Object.defineProperty(target.prototype, emitteryPropertyName, {
        enumerable: false,
        get: getEmitteryProperty,
      });
      const emitteryMethodCaller = (methodName) =>
        function (...args) {
          return this[emitteryPropertyName][methodName](...args);
        };
      for (const methodName of methodNames) {
        Object.defineProperty(target.prototype, methodName, {
          enumerable: false,
          value: emitteryMethodCaller(methodName),
        });
      }
      return target;
    };
  }
  static get isDebugEnabled() {
    if (typeof globalThis.process?.env !== 'object') {
      return isGlobalDebugEnabled$1;
    }
    const { env } = globalThis.process ?? { env: {} };
    return env.DEBUG === 'emittery' || env.DEBUG === '*' || isGlobalDebugEnabled$1;
  }
  static set isDebugEnabled(newValue) {
    isGlobalDebugEnabled$1 = newValue;
  }
  constructor(options = {}) {
    anyMap$1.set(this, /* @__PURE__ */ new Set());
    eventsMap$1.set(this, /* @__PURE__ */ new Map());
    producersMap$1.set(this, /* @__PURE__ */ new Map());
    producersMap$1.get(this).set(anyProducer$1, /* @__PURE__ */ new Set());
    this.debug = options.debug ?? {};
    if (this.debug.enabled === void 0) {
      this.debug.enabled = false;
    }
    if (!this.debug.logger) {
      this.debug.logger = (type, debugName, eventName, eventData) => {
        try {
          eventData = JSON.stringify(eventData);
        } catch {
          eventData = `Object with the following keys failed to stringify: ${Object.keys(eventData).join(',')}`;
        }
        if (typeof eventName === 'symbol' || typeof eventName === 'number') {
          eventName = eventName.toString();
        }
        const currentTime = /* @__PURE__ */ new Date();
        const logTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}.${currentTime.getMilliseconds()}`;
        console.log(`[${logTime}][emittery:${type}][${debugName}] Event Name: ${eventName}
    data: ${eventData}`);
      };
    }
  }
  logIfDebugEnabled(type, eventName, eventData) {
    if (Emittery.isDebugEnabled || this.debug.enabled) {
      this.debug.logger(type, this.debug.name, eventName, eventData);
    }
  }
  on(eventNames, listener) {
    assertListener$1(listener);
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName$1(eventName);
      let set = getListeners$1(this, eventName);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        const events = eventsMap$1.get(this);
        events.set(eventName, set);
      }
      set.add(listener);
      this.logIfDebugEnabled('subscribe', eventName, void 0);
      if (!isMetaEvent$1(eventName)) {
        emitMetaEvent$1(this, listenerAdded$1, { eventName, listener });
      }
    }
    return this.off.bind(this, eventNames, listener);
  }
  off(eventNames, listener) {
    assertListener$1(listener);
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName$1(eventName);
      const set = getListeners$1(this, eventName);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          const events = eventsMap$1.get(this);
          events.delete(eventName);
        }
      }
      this.logIfDebugEnabled('unsubscribe', eventName, void 0);
      if (!isMetaEvent$1(eventName)) {
        emitMetaEvent$1(this, listenerRemoved$1, { eventName, listener });
      }
    }
  }
  once(eventNames) {
    let off_;
    const promise = new Promise((resolve) => {
      off_ = this.on(eventNames, (data) => {
        off_();
        resolve(data);
      });
    });
    promise.off = off_;
    return promise;
  }
  events(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName$1(eventName);
    }
    return iterator$1(this, eventNames);
  }
  async emit(eventName, eventData) {
    assertEventName$1(eventName);
    if (isMetaEvent$1(eventName) && !canEmitMetaEvents$1) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
    }
    this.logIfDebugEnabled('emit', eventName, eventData);
    enqueueProducers$1(this, eventName, eventData);
    const listeners = getListeners$1(this, eventName) ?? /* @__PURE__ */ new Set();
    const anyListeners = anyMap$1.get(this);
    const staticListeners = [...listeners];
    const staticAnyListeners = isMetaEvent$1(eventName) ? [] : [...anyListeners];
    await resolvedPromise$1;
    await Promise.all([
      ...staticListeners.map(async (listener) => {
        if (listeners.has(listener)) {
          return listener(eventData);
        }
      }),
      ...staticAnyListeners.map(async (listener) => {
        if (anyListeners.has(listener)) {
          return listener(eventName, eventData);
        }
      }),
    ]);
  }
  async emitSerial(eventName, eventData) {
    assertEventName$1(eventName);
    if (isMetaEvent$1(eventName) && !canEmitMetaEvents$1) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
    }
    this.logIfDebugEnabled('emitSerial', eventName, eventData);
    const listeners = getListeners$1(this, eventName) ?? /* @__PURE__ */ new Set();
    const anyListeners = anyMap$1.get(this);
    const staticListeners = [...listeners];
    const staticAnyListeners = [...anyListeners];
    await resolvedPromise$1;
    for (const listener of staticListeners) {
      if (listeners.has(listener)) {
        await listener(eventData);
      }
    }
    for (const listener of staticAnyListeners) {
      if (anyListeners.has(listener)) {
        await listener(eventName, eventData);
      }
    }
  }
  onAny(listener) {
    assertListener$1(listener);
    this.logIfDebugEnabled('subscribeAny', void 0, void 0);
    anyMap$1.get(this).add(listener);
    emitMetaEvent$1(this, listenerAdded$1, { listener });
    return this.offAny.bind(this, listener);
  }
  anyEvent() {
    return iterator$1(this);
  }
  offAny(listener) {
    assertListener$1(listener);
    this.logIfDebugEnabled('unsubscribeAny', void 0, void 0);
    emitMetaEvent$1(this, listenerRemoved$1, { listener });
    anyMap$1.get(this).delete(listener);
  }
  clearListeners(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      this.logIfDebugEnabled('clear', eventName, void 0);
      if (typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number') {
        const set = getListeners$1(this, eventName);
        if (set) {
          set.clear();
        }
        const producers = getEventProducers$1(this, eventName);
        if (producers) {
          for (const producer of producers) {
            producer.finish();
          }
          producers.clear();
        }
      } else {
        anyMap$1.get(this).clear();
        for (const [eventName2, listeners] of eventsMap$1.get(this).entries()) {
          listeners.clear();
          eventsMap$1.get(this).delete(eventName2);
        }
        for (const [eventName2, producers] of producersMap$1.get(this).entries()) {
          for (const producer of producers) {
            producer.finish();
          }
          producers.clear();
          producersMap$1.get(this).delete(eventName2);
        }
      }
    }
  }
  listenerCount(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    let count = 0;
    for (const eventName of eventNames) {
      if (typeof eventName === 'string') {
        count +=
          anyMap$1.get(this).size +
          (getListeners$1(this, eventName)?.size ?? 0) +
          (getEventProducers$1(this, eventName)?.size ?? 0) +
          (getEventProducers$1(this)?.size ?? 0);
        continue;
      }
      if (typeof eventName !== 'undefined') {
        assertEventName$1(eventName);
      }
      count += anyMap$1.get(this).size;
      for (const value of eventsMap$1.get(this).values()) {
        count += value.size;
      }
      for (const value of producersMap$1.get(this).values()) {
        count += value.size;
      }
    }
    return count;
  }
  bindMethods(target, methodNames) {
    if (typeof target !== 'object' || target === null) {
      throw new TypeError('`target` must be an object');
    }
    methodNames = defaultMethodNamesOrAssert$1(methodNames);
    for (const methodName of methodNames) {
      if (target[methodName] !== void 0) {
        throw new Error(`The property \`${methodName}\` already exists on \`target\``);
      }
      Object.defineProperty(target, methodName, {
        enumerable: false,
        value: this[methodName].bind(this),
      });
    }
  }
};
const allEmitteryMethods$1 = Object.getOwnPropertyNames(Emittery$1.prototype).filter((v2) => v2 !== 'constructor');
Object.defineProperty(Emittery$1, 'listenerAdded', {
  value: listenerAdded$1,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(Emittery$1, 'listenerRemoved', {
  value: listenerRemoved$1,
  writable: false,
  enumerable: true,
  configurable: false,
});
const version = '1.0.0-beta.4';
class Average {
  constructor(size) {
    this.size = size;
    this.values = [];
    this.sum = 0;
  }
  push(value) {
    this.values.push(value);
    this.sum += value;
    while (this.size < this.values.length) {
      this.sum -= this.values.shift() ?? 0;
    }
  }
  value() {
    return this.sum / Math.max(1, this.values.length);
  }
}
const defaultAssetsDirBaseUrl = `https://d3opqjmqzxf057.cloudfront.net/noise-suppression/${version}`;
class NoiseSuppressionTransformer extends Emittery$1 {
  constructor() {
    super();
    this.isEnabled = true;
    this.internalResampleSupported = false;
    this.latency = new Average(100);
    this.transform = this.transformAudioData.bind(this);
  }
  /**
   * Initialize the transformer.
   * It is mandatory to call this function before using the transformer
   * @param options Options used to initialize the transformer
   */
  async init(options = {}) {
    console.log('Noise suppression transformer initialization');
    this.transform = options.debug ? this.transformDebug.bind(this) : this.transformAudioData.bind(this);
    const assetsDirBaseUrl = options.assetsDirBaseUrl ?? defaultAssetsDirBaseUrl;
    const locateFile = (name) => {
      return `${assetsDirBaseUrl}/${name}`;
    };
    let numberOfThreads = 1;
    if (await this.isMonoThread(options)) {
      this.wasmInstance = await createWasmMonoInstance({
        locateFile,
        mainScriptUrlOrBlob: locateFile('main-bin-mono.js'),
      });
    } else {
      this.wasmInstance = await createWasmMultiInstance({
        locateFile,
        mainScriptUrlOrBlob: locateFile('main-bin-multi.js'),
      });
      numberOfThreads = 3;
    }
    this.wasmTransformer = new this.wasmInstance.DtlnTransformer();
    await Promise.all([this.loadModel(`${assetsDirBaseUrl}/model_1.tflite`, 1), this.loadModel(`${assetsDirBaseUrl}/model_2.tflite`, 2)]);
    let result;
    try {
      result = this.wasmTransformer?.init(numberOfThreads);
    } catch (e) {
      if (typeof e == 'number') {
        let msg = '';
        for (let i = 0; i < 500; ++i) {
          msg += String.fromCharCode(this.wasmInstance.HEAP8[e + i]);
        }
        console.error(msg);
      } else {
        console.error(e);
      }
    }
    if (result !== 0) {
      const msg = `Fail to init wasm transformer, error code = ${result}`;
      console.error(msg);
      throw msg;
    }
    this.internalResampleSupported = this.wasmTransformer?.getInternalResampleSupported();
    if (!this.internalResampleSupported) {
      const msg = `Internal resampling not supported`;
      console.error(msg);
      throw msg;
    }
    console.log('Noise suppression transformer ready');
  }
  /**
   * Tell to the transformer what preprocessing are applied before reaching this transformer
   */
  setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter) {
    this.wasmTransformer?.setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter);
  }
  /**
   * Enable the noise reduction
   */
  enable() {
    this.isEnabled = true;
  }
  /**
   * Disable the noise reduction
   */
  disable() {
    this.isEnabled = false;
  }
  /**
   * Return the latency of the transformation
   * The latency will be computed only if the options debug flag is true
   * Otherwise, will return 0;
   * @returns latency
   */
  getLatency() {
    return this.latency.value();
  }
  /**
   * Return the latency of processing within the wasm in nanoseconds.
   * @returns latency
   */
  getWasmLatencyNs() {
    return this.wasmTransformer?.getLatencyNs() ?? 0;
  }
  async transformDebug(data, controller) {
    try {
      const start = performance.now();
      await this.transformAudioData(data, controller);
      this.latency.push(performance.now() - start);
    } catch (e) {
      console.error(e);
    }
  }
  async transformAudioData(data, controller) {
    if (!this.wasmTransformer) {
      this.emit('warning', 'transformer not initialized');
    }
    if (this.isEnabled && this.wasmTransformer) {
      try {
        const dataAsFloat32 = this.getAudioDataAsFloat32(data);
        const dataAsInt16 = this.convertTypedArray(dataAsFloat32, Int16Array, 2 ** 15 - 1);
        this.wasmTransformer.getInputFrame(data.numberOfFrames).set(dataAsInt16);
        let outputSize = 0;
        try {
          outputSize = this.wasmTransformer.runAlgorithm(data.numberOfFrames, data.sampleRate, data.numberOfChannels);
        } catch (e) {
          if (typeof e == 'number') {
            let msg = '';
            for (let i = 0; i < 500; ++i) {
              msg += String.fromCharCode(this.wasmInstance.HEAP8[e + i]);
            }
            console.error(msg);
          } else {
            console.error(e);
          }
        }
        if (outputSize > 0) {
          const output = this.wasmTransformer.getOutputFrame().slice(0, outputSize);
          const outputAsFloat32 = this.convertTypedArray(output, Float32Array, 1 / (2 ** 15 - 1));
          const { timestamp, sampleRate, numberOfChannels } = data;
          data = new AudioData({
            data: outputAsFloat32,
            format: 'f32-planar',
            numberOfChannels,
            numberOfFrames: outputAsFloat32.length,
            sampleRate,
            timestamp,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    controller.enqueue(data);
  }
  async loadModel(url, modelIndex) {
    if (!this.wasmTransformer) return;
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const size = buffer.byteLength;
    const functionName = `getModel${modelIndex}`;
    const wasmBuffer = this.wasmTransformer[functionName](size);
    if (wasmBuffer) {
      const bufferUint8 = new Uint8Array(buffer);
      wasmBuffer.set(bufferUint8);
    }
  }
  getAudioDataAsFloat32(data) {
    return this.audioDataToTypedArray(data, Float32Array, 'f32-planar', 1);
  }
  audioDataToTypedArray(data, typeArrayClass, format, numberOfChannels = data.numberOfChannels) {
    const size = data.numberOfFrames * numberOfChannels;
    const buffer = new typeArrayClass(size);
    for (let i = 0; i < numberOfChannels; ++i) {
      const offset = data.numberOfFrames * i;
      const samples = buffer.subarray(offset, offset + data.numberOfFrames);
      data.copyTo(samples, { planeIndex: i, format });
    }
    return buffer;
  }
  convertTypedArray(data, outputTypeArrayClass, factor) {
    const size = data.length;
    const result = new outputTypeArrayClass(size);
    for (let i = 0; i < size; ++i) {
      result[i] = data[i] * factor;
    }
    return result;
  }
  isMonoThread(options) {
    if (options.disableWasmMultiThread) {
      return true;
    }
    try {
      const buffer = new SharedArrayBuffer(1024);
      if (buffer === void 0) {
        throw new Error('not supported');
      }
    } catch (e) {
      this.emit(
        `warning`,
        `
  Multithread is not available, noise-suppresion is now running on a single thread.
  This is impacting the performance and increase the latency.
  
  To enable multithread, you need to serve the application via https with these http headers :
     - Cross-Origin-Opener-Policy: same-origin
     - Cross-Origin-Embedder-Policy: require-corp.
  More info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
  
  You can disable this warning by enabling disableWasmMultiThread within the noiseSuppression options.
  `
      );
      return true;
    }
    return false;
  }
}
function createGlobalThisVariable(name, defaultValue) {
  if (!globalThis.vonage) {
    globalThis.vonage = {};
  }
  if (!globalThis.vonage.workerizer) {
    globalThis.vonage.workerizer = {};
  }
  let globals2 = globalThis.vonage.workerizer;
  if (!globals2[name]) {
    globals2[name] = defaultValue;
  }
  return globals2[name];
}
const globals = createGlobalThisVariable('globals', {});
var CommandType = /* @__PURE__ */ ((CommandType2) => {
  CommandType2['INIT'] = 'INIT';
  CommandType2['FORWARD'] = 'FORWARD';
  CommandType2['TERMINATE'] = 'TERMINATE';
  CommandType2['GLOBALS_SYNC'] = 'GLOBALS_SYNC';
  CommandType2['EVENT'] = 'EVENT';
  return CommandType2;
})(CommandType || {});
function isTransferable(arg) {
  const transferableTypes = [ImageBitmap, ReadableStream, WritableStream];
  return transferableTypes.some((type) => arg instanceof type);
}
let nextCommandId = 0;
function postCommand$1(worker, type, functionName, args, resolvers) {
  const id = nextCommandId++;
  worker.postMessage(
    {
      id,
      type,
      functionName,
      args,
    },
    args.filter((a2) => isTransferable(a2))
  );
  const promise = new Promise((resolve) => {
    resolvers == null ? void 0 : resolvers.set(id, resolve);
  });
  return promise;
}
function postCommand(command, result) {
  const { id, type } = command;
  const resultAsArray = Array.isArray(result) ? result : [result];
  postMessage(
    {
      id,
      type,
      result,
    },
    resultAsArray.filter((result2) => isTransferable(result2))
  );
}
const workerized = createGlobalThisVariable('workerized', {});
function isWorker() {
  return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
}
async function globalsSync() {
  if (isWorker()) {
    postCommand({ type: CommandType.GLOBALS_SYNC }, globals);
  } else {
    const promises = [];
    for (const i in workerized) {
      const { worker, resolvers } = workerized[i].workerContext;
      if (worker) {
        promises.push(postCommand$1(worker, CommandType.GLOBALS_SYNC, '', [globals], resolvers));
      }
    }
    await Promise.all(promises);
  }
}
function copy(from, to) {
  if (Array.isArray(to)) {
    to.splice(0, to.length);
  } else if (typeof to === 'object') {
    for (const i in to) {
      delete to[i];
    }
  }
  for (const i in from) {
    if (Array.isArray(from[i])) {
      to[i] = [];
      copy(from[i], to[i]);
    } else if (typeof from[i] === 'object') {
      to[i] = {};
      copy(from[i], to[i]);
    } else {
      to[i] = from[i];
    }
  }
}
async function createWorker(workerizedClass, workerClass, resolvers, onEvent) {
  const worker = new workerClass();
  worker.addEventListener('message', async ({ data }) => {
    var _a, _b, _c, _d, _e2, _f, _g;
    switch (data.type) {
      case CommandType.GLOBALS_SYNC:
        if (data.id) {
          (_b = resolvers.get((_a = data.id) != null ? _a : -1)) == null ? void 0 : _b(data.result);
          resolvers.delete((_c = data.id) != null ? _c : -1);
        } else {
          copy((_d = data.result) != null ? _d : {}, globals);
          await globalsSync();
        }
        break;
      case CommandType.EVENT:
        const { result } = data;
        const event = result;
        if ((event == null ? void 0 : event.name) == void 0) {
          throw 'Missing event name';
        }
        onEvent(event.name, event.data);
        break;
      default:
        (_f = resolvers.get((_e2 = data.id) != null ? _e2 : -1)) == null ? void 0 : _f(data.result);
        resolvers.delete((_g = data.id) != null ? _g : -1);
    }
  });
  const initialized = await postCommand$1(worker, CommandType.INIT, '', [workerizedClass.workerId, globals], resolvers);
  if (!initialized) {
    throw 'Failed to instantiate workerized class';
  }
  return worker;
}
const anyMap = /* @__PURE__ */ new WeakMap();
const eventsMap = /* @__PURE__ */ new WeakMap();
const producersMap = /* @__PURE__ */ new WeakMap();
const anyProducer = Symbol('anyProducer');
const resolvedPromise = Promise.resolve();
const listenerAdded = Symbol('listenerAdded');
const listenerRemoved = Symbol('listenerRemoved');
let canEmitMetaEvents = false;
let isGlobalDebugEnabled = false;
function assertEventName(eventName) {
  if (typeof eventName !== 'string' && typeof eventName !== 'symbol' && typeof eventName !== 'number') {
    throw new TypeError('`eventName` must be a string, symbol, or number');
  }
}
function assertListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }
}
function getListeners(instance, eventName) {
  const events = eventsMap.get(instance);
  if (!events.has(eventName)) {
    return;
  }
  return events.get(eventName);
}
function getEventProducers(instance, eventName) {
  const key = typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number' ? eventName : anyProducer;
  const producers = producersMap.get(instance);
  if (!producers.has(key)) {
    return;
  }
  return producers.get(key);
}
function enqueueProducers(instance, eventName, eventData) {
  const producers = producersMap.get(instance);
  if (producers.has(eventName)) {
    for (const producer of producers.get(eventName)) {
      producer.enqueue(eventData);
    }
  }
  if (producers.has(anyProducer)) {
    const item = Promise.all([eventName, eventData]);
    for (const producer of producers.get(anyProducer)) {
      producer.enqueue(item);
    }
  }
}
function iterator(instance, eventNames) {
  eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
  let isFinished = false;
  let flush = () => {};
  let queue = [];
  const producer = {
    enqueue(item) {
      queue.push(item);
      flush();
    },
    finish() {
      isFinished = true;
      flush();
    },
  };
  for (const eventName of eventNames) {
    let set = getEventProducers(instance, eventName);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      const producers = producersMap.get(instance);
      producers.set(eventName, set);
    }
    set.add(producer);
  }
  return {
    async next() {
      if (!queue) {
        return { done: true };
      }
      if (queue.length === 0) {
        if (isFinished) {
          queue = void 0;
          return this.next();
        }
        await new Promise((resolve) => {
          flush = resolve;
        });
        return this.next();
      }
      return {
        done: false,
        value: await queue.shift(),
      };
    },
    async return(value) {
      queue = void 0;
      for (const eventName of eventNames) {
        const set = getEventProducers(instance, eventName);
        if (set) {
          set.delete(producer);
          if (set.size === 0) {
            const producers = producersMap.get(instance);
            producers.delete(eventName);
          }
        }
      }
      flush();
      return arguments.length > 0 ? { done: true, value: await value } : { done: true };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
function defaultMethodNamesOrAssert(methodNames) {
  if (methodNames === void 0) {
    return allEmitteryMethods;
  }
  if (!Array.isArray(methodNames)) {
    throw new TypeError('`methodNames` must be an array of strings');
  }
  for (const methodName of methodNames) {
    if (!allEmitteryMethods.includes(methodName)) {
      if (typeof methodName !== 'string') {
        throw new TypeError('`methodNames` element must be a string');
      }
      throw new Error(`${methodName} is not Emittery method`);
    }
  }
  return methodNames;
}
const isMetaEvent = (eventName) => eventName === listenerAdded || eventName === listenerRemoved;
function emitMetaEvent(emitter, eventName, eventData) {
  if (isMetaEvent(eventName)) {
    try {
      canEmitMetaEvents = true;
      emitter.emit(eventName, eventData);
    } finally {
      canEmitMetaEvents = false;
    }
  }
}
class Emittery2 {
  static mixin(emitteryPropertyName, methodNames) {
    methodNames = defaultMethodNamesOrAssert(methodNames);
    return (target) => {
      if (typeof target !== 'function') {
        throw new TypeError('`target` must be function');
      }
      for (const methodName of methodNames) {
        if (target.prototype[methodName] !== void 0) {
          throw new Error(`The property \`${methodName}\` already exists on \`target\``);
        }
      }
      function getEmitteryProperty() {
        Object.defineProperty(this, emitteryPropertyName, {
          enumerable: false,
          value: new Emittery2(),
        });
        return this[emitteryPropertyName];
      }
      Object.defineProperty(target.prototype, emitteryPropertyName, {
        enumerable: false,
        get: getEmitteryProperty,
      });
      const emitteryMethodCaller = (methodName) =>
        function (...args) {
          return this[emitteryPropertyName][methodName](...args);
        };
      for (const methodName of methodNames) {
        Object.defineProperty(target.prototype, methodName, {
          enumerable: false,
          value: emitteryMethodCaller(methodName),
        });
      }
      return target;
    };
  }
  static get isDebugEnabled() {
    var _a, _b;
    if (typeof ((_a = globalThis.process) == null ? void 0 : _a.env) !== 'object') {
      return isGlobalDebugEnabled;
    }
    const { env } = (_b = globalThis.process) != null ? _b : { env: {} };
    return env.DEBUG === 'emittery' || env.DEBUG === '*' || isGlobalDebugEnabled;
  }
  static set isDebugEnabled(newValue) {
    isGlobalDebugEnabled = newValue;
  }
  constructor(options = {}) {
    var _a;
    anyMap.set(this, /* @__PURE__ */ new Set());
    eventsMap.set(this, /* @__PURE__ */ new Map());
    producersMap.set(this, /* @__PURE__ */ new Map());
    producersMap.get(this).set(anyProducer, /* @__PURE__ */ new Set());
    this.debug = (_a = options.debug) != null ? _a : {};
    if (this.debug.enabled === void 0) {
      this.debug.enabled = false;
    }
    if (!this.debug.logger) {
      this.debug.logger = (type, debugName, eventName, eventData) => {
        try {
          eventData = JSON.stringify(eventData);
        } catch {
          eventData = `Object with the following keys failed to stringify: ${Object.keys(eventData).join(',')}`;
        }
        if (typeof eventName === 'symbol' || typeof eventName === 'number') {
          eventName = eventName.toString();
        }
        const currentTime = /* @__PURE__ */ new Date();
        const logTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}.${currentTime.getMilliseconds()}`;
        console.log(`[${logTime}][emittery:${type}][${debugName}] Event Name: ${eventName}
    data: ${eventData}`);
      };
    }
  }
  logIfDebugEnabled(type, eventName, eventData) {
    if (Emittery2.isDebugEnabled || this.debug.enabled) {
      this.debug.logger(type, this.debug.name, eventName, eventData);
    }
  }
  on(eventNames, listener) {
    assertListener(listener);
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName(eventName);
      let set = getListeners(this, eventName);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        const events = eventsMap.get(this);
        events.set(eventName, set);
      }
      set.add(listener);
      this.logIfDebugEnabled('subscribe', eventName, void 0);
      if (!isMetaEvent(eventName)) {
        emitMetaEvent(this, listenerAdded, { eventName, listener });
      }
    }
    return this.off.bind(this, eventNames, listener);
  }
  off(eventNames, listener) {
    assertListener(listener);
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName(eventName);
      const set = getListeners(this, eventName);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          const events = eventsMap.get(this);
          events.delete(eventName);
        }
      }
      this.logIfDebugEnabled('unsubscribe', eventName, void 0);
      if (!isMetaEvent(eventName)) {
        emitMetaEvent(this, listenerRemoved, { eventName, listener });
      }
    }
  }
  once(eventNames) {
    let off_;
    const promise = new Promise((resolve) => {
      off_ = this.on(eventNames, (data) => {
        off_();
        resolve(data);
      });
    });
    promise.off = off_;
    return promise;
  }
  events(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName(eventName);
    }
    return iterator(this, eventNames);
  }
  async emit(eventName, eventData) {
    var _a;
    assertEventName(eventName);
    if (isMetaEvent(eventName) && !canEmitMetaEvents) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
    }
    this.logIfDebugEnabled('emit', eventName, eventData);
    enqueueProducers(this, eventName, eventData);
    const listeners = (_a = getListeners(this, eventName)) != null ? _a : /* @__PURE__ */ new Set();
    const anyListeners = anyMap.get(this);
    const staticListeners = [...listeners];
    const staticAnyListeners = isMetaEvent(eventName) ? [] : [...anyListeners];
    await resolvedPromise;
    await Promise.all([
      ...staticListeners.map(async (listener) => {
        if (listeners.has(listener)) {
          return listener(eventData);
        }
      }),
      ...staticAnyListeners.map(async (listener) => {
        if (anyListeners.has(listener)) {
          return listener(eventName, eventData);
        }
      }),
    ]);
  }
  async emitSerial(eventName, eventData) {
    var _a;
    assertEventName(eventName);
    if (isMetaEvent(eventName) && !canEmitMetaEvents) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
    }
    this.logIfDebugEnabled('emitSerial', eventName, eventData);
    const listeners = (_a = getListeners(this, eventName)) != null ? _a : /* @__PURE__ */ new Set();
    const anyListeners = anyMap.get(this);
    const staticListeners = [...listeners];
    const staticAnyListeners = [...anyListeners];
    await resolvedPromise;
    for (const listener of staticListeners) {
      if (listeners.has(listener)) {
        await listener(eventData);
      }
    }
    for (const listener of staticAnyListeners) {
      if (anyListeners.has(listener)) {
        await listener(eventName, eventData);
      }
    }
  }
  onAny(listener) {
    assertListener(listener);
    this.logIfDebugEnabled('subscribeAny', void 0, void 0);
    anyMap.get(this).add(listener);
    emitMetaEvent(this, listenerAdded, { listener });
    return this.offAny.bind(this, listener);
  }
  anyEvent() {
    return iterator(this);
  }
  offAny(listener) {
    assertListener(listener);
    this.logIfDebugEnabled('unsubscribeAny', void 0, void 0);
    emitMetaEvent(this, listenerRemoved, { listener });
    anyMap.get(this).delete(listener);
  }
  clearListeners(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      this.logIfDebugEnabled('clear', eventName, void 0);
      if (typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number') {
        const set = getListeners(this, eventName);
        if (set) {
          set.clear();
        }
        const producers = getEventProducers(this, eventName);
        if (producers) {
          for (const producer of producers) {
            producer.finish();
          }
          producers.clear();
        }
      } else {
        anyMap.get(this).clear();
        for (const [eventName2, listeners] of eventsMap.get(this).entries()) {
          listeners.clear();
          eventsMap.get(this).delete(eventName2);
        }
        for (const [eventName2, producers] of producersMap.get(this).entries()) {
          for (const producer of producers) {
            producer.finish();
          }
          producers.clear();
          producersMap.get(this).delete(eventName2);
        }
      }
    }
  }
  listenerCount(eventNames) {
    var _a, _b, _c, _d, _e2, _f;
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    let count = 0;
    for (const eventName of eventNames) {
      if (typeof eventName === 'string') {
        count +=
          anyMap.get(this).size +
          ((_b = (_a = getListeners(this, eventName)) == null ? void 0 : _a.size) != null ? _b : 0) +
          ((_d = (_c = getEventProducers(this, eventName)) == null ? void 0 : _c.size) != null ? _d : 0) +
          ((_f = (_e2 = getEventProducers(this)) == null ? void 0 : _e2.size) != null ? _f : 0);
        continue;
      }
      if (typeof eventName !== 'undefined') {
        assertEventName(eventName);
      }
      count += anyMap.get(this).size;
      for (const value of eventsMap.get(this).values()) {
        count += value.size;
      }
      for (const value of producersMap.get(this).values()) {
        count += value.size;
      }
    }
    return count;
  }
  bindMethods(target, methodNames) {
    if (typeof target !== 'object' || target === null) {
      throw new TypeError('`target` must be an object');
    }
    methodNames = defaultMethodNamesOrAssert(methodNames);
    for (const methodName of methodNames) {
      if (target[methodName] !== void 0) {
        throw new Error(`The property \`${methodName}\` already exists on \`target\``);
      }
      Object.defineProperty(target, methodName, {
        enumerable: false,
        value: this[methodName].bind(this),
      });
    }
  }
}
const allEmitteryMethods = Object.getOwnPropertyNames(Emittery2.prototype).filter((v2) => v2 !== 'constructor');
Object.defineProperty(Emittery2, 'listenerAdded', {
  value: listenerAdded,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(Emittery2, 'listenerRemoved', {
  value: listenerRemoved,
  writable: false,
  enumerable: true,
  configurable: false,
});
function isInstanceOfEmittery(instance) {
  return instance.onAny && instance.emit;
}
function isChildClassOfEmittery(input) {
  return input.prototype.onAny && input.prototype.emit;
}
let nextId = 0;
async function createWorkerized(workerizedClass, worker, resolvers) {
  const isEmittery = isChildClassOfEmittery(workerizedClass);
  const result = isEmittery ? new Emittery2() : {};
  const id = nextId++;
  Object.getOwnPropertyNames(workerizedClass.prototype).forEach((functionName) => {
    result[functionName] = (...args) => postCommand$1(worker, CommandType.FORWARD, functionName, args, resolvers);
  });
  result.terminate = async (...args) => {
    const response = await postCommand$1(worker, CommandType.TERMINATE, '', args, resolvers);
    delete workerized[id];
    worker.terminate();
    result.workerContext.worker = void 0;
    return response;
  };
  result.workerContext = {
    id,
    worker,
    resolvers,
  };
  workerized[id] = result;
  return result;
}
async function workerize(workerizedClass, workerClass) {
  const resolvers = /* @__PURE__ */ new Map();
  let workerized2;
  const worker = await createWorker(workerizedClass, workerClass, resolvers, (name, data) => {
    if (workerized2 == null ? void 0 : workerized2.emit) {
      workerized2 == null ? void 0 : workerized2.emit(name, data);
    }
  });
  workerized2 = await createWorkerized(workerizedClass, worker, resolvers);
  return workerized2;
}
async function handleCommandForward(command, context) {
  const { functionName, args } = command;
  if (!context.instance) {
    throw 'instance not initialized';
  }
  if (!functionName) {
    throw 'missing function name to call';
  }
  if (!context.instance[functionName]) {
    throw `undefined function [${functionName}] in class ${context.instance.constructor.workerId}`;
  }
  postCommand(command, await context.instance[functionName](...(args != null ? args : [])));
}
const registeredWorkers = createGlobalThisVariable('registeredWorkers', {});
function registerWorker(id, registrable) {
  registrable.workerId = id;
  if (isWorker()) {
    registeredWorkers[registrable.workerId] = registrable;
  }
}
function handleCommandInit(command, context) {
  if (!command.args) {
    throw 'Missing className while initializing worker';
  }
  const [className, globalsValues] = command.args;
  const constructor = registeredWorkers[className];
  if (constructor) {
    context.instance = new constructor(command.args.slice(1));
  } else {
    throw `unknown worker class ${className}`;
  }
  copy(globalsValues, globals);
  if (isInstanceOfEmittery(context.instance)) {
    context.instance.onAny((name, data) => {
      postCommand(
        {
          type: CommandType.EVENT,
        },
        { name, data }
      );
    });
  }
  postCommand(command, typeof context.instance !== void 0);
}
async function handleCommandTerminate(command, context) {
  const { args } = command;
  if (!context.instance) {
    throw 'instance not initialized';
  }
  let result;
  if (context.instance.terminate) {
    result = await context.instance.terminate(...(args != null ? args : []));
  }
  postCommand(command, result);
}
function handleCommandGlobalsSync(command) {
  if (!command.args) {
    throw 'Missing globals while syncing';
  }
  copy(command.args[0], globals);
  postCommand(command, {});
}
function initWorker() {
  const context = {};
  onmessage = async (event) => {
    const command = event.data;
    switch (command.type) {
      case CommandType.INIT:
        handleCommandInit(command, context);
        break;
      case CommandType.FORWARD:
        handleCommandForward(command, context);
        break;
      case CommandType.TERMINATE:
        handleCommandTerminate(command, context);
        break;
      case CommandType.GLOBALS_SYNC:
        handleCommandGlobalsSync(command);
        break;
    }
  };
}
if (isWorker()) {
  initWorker();
}
const _ProcessorWorker = class _ProcessorWorker2 extends Emittery$1 {
  constructor() {
    super(...arguments);
    this.processor = new Oe();
  }
  async init(options = {}) {
    this.transformer = new NoiseSuppressionTransformer();
    this.processor.onAny((name, data) => this.emit(name, data));
    this.transformer.onAny((name, data) => this.emit(name, data));
    await this.transformer.init(options);
    await this.processor.setTransformers([this.transformer]);
  }
  transform(readable, writable) {
    this.processor.transform(readable, writable);
  }
  setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter) {
    this.transformer?.setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter);
  }
  enable() {
    this.transformer?.enable();
  }
  disable() {
    this.transformer?.disable();
  }
  async terminate() {
    await this.processor.destroy();
  }
  /**
   * Return the latency of the transformation
   * The latency will be computed only if the options debug flag is true
   * Otherwise, will return 0;
   * @returns latency
   */
  getLatency() {
    return this.transformer?.getLatency() ?? 0;
  }
  /**
   * Return the latency of processing within the wasm in nanoseconds.
   * @returns latency
   */
  getWasmLatencyNs() {
    return this.transformer?.getWasmLatencyNs() ?? 0;
  }
};
registerWorker('ProcessorWorker', _ProcessorWorker);
let ProcessorWorker = _ProcessorWorker;
const encodedJs =
  'bGV0IGNyZWF0ZVdhc21Nb25vSW5zdGFuY2U7IHsKCnZhciBNb2R1bGUgPSAoKCkgPT4gewogIHZhciBfc2NyaXB0RGlyID0gbG9jYXRpb24uaHJlZjsKICAKICByZXR1cm4gKApmdW5jdGlvbihNb2R1bGUpIHsKICBNb2R1bGUgPSBNb2R1bGUgfHwge307Cgp2YXIgTW9kdWxlPXR5cGVvZiBNb2R1bGUhPSJ1bmRlZmluZWQiP01vZHVsZTp7fTt2YXIgcmVhZHlQcm9taXNlUmVzb2x2ZSxyZWFkeVByb21pc2VSZWplY3Q7TW9kdWxlWyJyZWFkeSJdPW5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXtyZWFkeVByb21pc2VSZXNvbHZlPXJlc29sdmU7cmVhZHlQcm9taXNlUmVqZWN0PXJlamVjdH0pO3ZhciBtb2R1bGVPdmVycmlkZXM9T2JqZWN0LmFzc2lnbih7fSxNb2R1bGUpO3ZhciBhcmd1bWVudHNfPVtdO3ZhciB0aGlzUHJvZ3JhbT0iLi90aGlzLnByb2dyYW0iO3ZhciBxdWl0Xz0oc3RhdHVzLHRvVGhyb3cpPT57dGhyb3cgdG9UaHJvd307dmFyIEVOVklST05NRU5UX0lTX1dFQj10eXBlb2Ygd2luZG93PT0ib2JqZWN0Ijt2YXIgRU5WSVJPTk1FTlRfSVNfV09SS0VSPXR5cGVvZiBpbXBvcnRTY3JpcHRzPT0iZnVuY3Rpb24iO3ZhciBFTlZJUk9OTUVOVF9JU19OT0RFPXR5cGVvZiBwcm9jZXNzPT0ib2JqZWN0IiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnM9PSJvYmplY3QiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlPT0ic3RyaW5nIjt2YXIgc2NyaXB0RGlyZWN0b3J5PSIiO2Z1bmN0aW9uIGxvY2F0ZUZpbGUocGF0aCl7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3JldHVybiBNb2R1bGVbImxvY2F0ZUZpbGUiXShwYXRoLHNjcmlwdERpcmVjdG9yeSl9cmV0dXJuIHNjcmlwdERpcmVjdG9yeStwYXRofXZhciByZWFkXyxyZWFkQXN5bmMscmVhZEJpbmFyeSxzZXRXaW5kb3dUaXRsZTtpZihFTlZJUk9OTUVOVF9JU19XRUJ8fEVOVklST05NRU5UX0lTX1dPUktFUil7aWYoRU5WSVJPTk1FTlRfSVNfV09SS0VSKXtzY3JpcHREaXJlY3Rvcnk9c2VsZi5sb2NhdGlvbi5ocmVmfWVsc2UgaWYodHlwZW9mIGRvY3VtZW50IT0idW5kZWZpbmVkIiYmZG9jdW1lbnQuY3VycmVudFNjcmlwdCl7c2NyaXB0RGlyZWN0b3J5PWRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjfWlmKF9zY3JpcHREaXIpe3NjcmlwdERpcmVjdG9yeT1fc2NyaXB0RGlyfWlmKHNjcmlwdERpcmVjdG9yeS5pbmRleE9mKCJibG9iOiIpIT09MCl7c2NyaXB0RGlyZWN0b3J5PXNjcmlwdERpcmVjdG9yeS5zdWJzdHIoMCxzY3JpcHREaXJlY3RvcnkucmVwbGFjZSgvWz8jXS4qLywiIikubGFzdEluZGV4T2YoIi8iKSsxKX1lbHNle3NjcmlwdERpcmVjdG9yeT0iIn17cmVhZF89KHVybD0+e3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCxmYWxzZSk7eGhyLnNlbmQobnVsbCk7cmV0dXJuIHhoci5yZXNwb25zZVRleHR9KTtpZihFTlZJUk9OTUVOVF9JU19XT1JLRVIpe3JlYWRCaW5hcnk9KHVybD0+e3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCxmYWxzZSk7eGhyLnJlc3BvbnNlVHlwZT0iYXJyYXlidWZmZXIiO3hoci5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheSh4aHIucmVzcG9uc2UpfSl9cmVhZEFzeW5jPSgodXJsLG9ubG9hZCxvbmVycm9yKT0+e3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCx0cnVlKTt4aHIucmVzcG9uc2VUeXBlPSJhcnJheWJ1ZmZlciI7eGhyLm9ubG9hZD0oKCk9PntpZih4aHIuc3RhdHVzPT0yMDB8fHhoci5zdGF0dXM9PTAmJnhoci5yZXNwb25zZSl7b25sb2FkKHhoci5yZXNwb25zZSk7cmV0dXJufW9uZXJyb3IoKX0pO3hoci5vbmVycm9yPW9uZXJyb3I7eGhyLnNlbmQobnVsbCl9KX1zZXRXaW5kb3dUaXRsZT0odGl0bGU9PmRvY3VtZW50LnRpdGxlPXRpdGxlKX1lbHNle312YXIgb3V0PU1vZHVsZVsicHJpbnQiXXx8Y29uc29sZS5sb2cuYmluZChjb25zb2xlKTt2YXIgZXJyPU1vZHVsZVsicHJpbnRFcnIiXXx8Y29uc29sZS53YXJuLmJpbmQoY29uc29sZSk7T2JqZWN0LmFzc2lnbihNb2R1bGUsbW9kdWxlT3ZlcnJpZGVzKTttb2R1bGVPdmVycmlkZXM9bnVsbDtpZihNb2R1bGVbImFyZ3VtZW50cyJdKWFyZ3VtZW50c189TW9kdWxlWyJhcmd1bWVudHMiXTtpZihNb2R1bGVbInRoaXNQcm9ncmFtIl0pdGhpc1Byb2dyYW09TW9kdWxlWyJ0aGlzUHJvZ3JhbSJdO2lmKE1vZHVsZVsicXVpdCJdKXF1aXRfPU1vZHVsZVsicXVpdCJdO3ZhciB0ZW1wUmV0MD0wO3ZhciBzZXRUZW1wUmV0MD12YWx1ZT0+e3RlbXBSZXQwPXZhbHVlfTt2YXIgZ2V0VGVtcFJldDA9KCk9PnRlbXBSZXQwO3ZhciB3YXNtQmluYXJ5O2lmKE1vZHVsZVsid2FzbUJpbmFyeSJdKXdhc21CaW5hcnk9TW9kdWxlWyJ3YXNtQmluYXJ5Il07dmFyIG5vRXhpdFJ1bnRpbWU9TW9kdWxlWyJub0V4aXRSdW50aW1lIl18fGZhbHNlO2lmKHR5cGVvZiBXZWJBc3NlbWJseSE9Im9iamVjdCIpe2Fib3J0KCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkIil9dmFyIHdhc21NZW1vcnk7dmFyIEFCT1JUPWZhbHNlO3ZhciBFWElUU1RBVFVTO2Z1bmN0aW9uIGFzc2VydChjb25kaXRpb24sdGV4dCl7aWYoIWNvbmRpdGlvbil7YWJvcnQodGV4dCl9fXZhciBVVEY4RGVjb2Rlcj10eXBlb2YgVGV4dERlY29kZXIhPSJ1bmRlZmluZWQiP25ldyBUZXh0RGVjb2RlcigidXRmOCIpOnVuZGVmaW5lZDtmdW5jdGlvbiBVVEY4QXJyYXlUb1N0cmluZyhoZWFwT3JBcnJheSxpZHgsbWF4Qnl0ZXNUb1JlYWQpe3ZhciBlbmRJZHg9aWR4K21heEJ5dGVzVG9SZWFkO3ZhciBlbmRQdHI9aWR4O3doaWxlKGhlYXBPckFycmF5W2VuZFB0cl0mJiEoZW5kUHRyPj1lbmRJZHgpKSsrZW5kUHRyO2lmKGVuZFB0ci1pZHg+MTYmJmhlYXBPckFycmF5LmJ1ZmZlciYmVVRGOERlY29kZXIpe3JldHVybiBVVEY4RGVjb2Rlci5kZWNvZGUoaGVhcE9yQXJyYXkuc3ViYXJyYXkoaWR4LGVuZFB0cikpfWVsc2V7dmFyIHN0cj0iIjt3aGlsZShpZHg8ZW5kUHRyKXt2YXIgdTA9aGVhcE9yQXJyYXlbaWR4KytdO2lmKCEodTAmMTI4KSl7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHUwKTtjb250aW51ZX12YXIgdTE9aGVhcE9yQXJyYXlbaWR4KytdJjYzO2lmKCh1MCYyMjQpPT0xOTIpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgodTAmMzEpPDw2fHUxKTtjb250aW51ZX12YXIgdTI9aGVhcE9yQXJyYXlbaWR4KytdJjYzO2lmKCh1MCYyNDApPT0yMjQpe3UwPSh1MCYxNSk8PDEyfHUxPDw2fHUyfWVsc2V7dTA9KHUwJjcpPDwxOHx1MTw8MTJ8dTI8PDZ8aGVhcE9yQXJyYXlbaWR4KytdJjYzfWlmKHUwPDY1NTM2KXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodTApfWVsc2V7dmFyIGNoPXUwLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyl9fX1yZXR1cm4gc3RyfWZ1bmN0aW9uIFVURjhUb1N0cmluZyhwdHIsbWF4Qnl0ZXNUb1JlYWQpe3JldHVybiBwdHI/VVRGOEFycmF5VG9TdHJpbmcoSEVBUFU4LHB0cixtYXhCeXRlc1RvUmVhZCk6IiJ9ZnVuY3Rpb24gc3RyaW5nVG9VVEY4QXJyYXkoc3RyLGhlYXAsb3V0SWR4LG1heEJ5dGVzVG9Xcml0ZSl7aWYoIShtYXhCeXRlc1RvV3JpdGU+MCkpcmV0dXJuIDA7dmFyIHN0YXJ0SWR4PW91dElkeDt2YXIgZW5kSWR4PW91dElkeCttYXhCeXRlc1RvV3JpdGUtMTtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgdT1zdHIuY2hhckNvZGVBdChpKTtpZih1Pj01NTI5NiYmdTw9NTczNDMpe3ZhciB1MT1zdHIuY2hhckNvZGVBdCgrK2kpO3U9NjU1MzYrKCh1JjEwMjMpPDwxMCl8dTEmMTAyM31pZih1PD0xMjcpe2lmKG91dElkeD49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPXV9ZWxzZSBpZih1PD0yMDQ3KXtpZihvdXRJZHgrMT49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTE5Mnx1Pj42O2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzfWVsc2UgaWYodTw9NjU1MzUpe2lmKG91dElkeCsyPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MjI0fHU+PjEyO2hlYXBbb3V0SWR4KytdPTEyOHx1Pj42JjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzfWVsc2V7aWYob3V0SWR4KzM+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0yNDB8dT4+MTg7aGVhcFtvdXRJZHgrK109MTI4fHU+PjEyJjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1Pj42JjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzfX1oZWFwW291dElkeF09MDtyZXR1cm4gb3V0SWR4LXN0YXJ0SWR4fWZ1bmN0aW9uIHN0cmluZ1RvVVRGOChzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSl7cmV0dXJuIHN0cmluZ1RvVVRGOEFycmF5KHN0cixIRUFQVTgsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSl9ZnVuY3Rpb24gbGVuZ3RoQnl0ZXNVVEY4KHN0cil7dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciB1PXN0ci5jaGFyQ29kZUF0KGkpO2lmKHU+PTU1Mjk2JiZ1PD01NzM0Myl1PTY1NTM2KygodSYxMDIzKTw8MTApfHN0ci5jaGFyQ29kZUF0KCsraSkmMTAyMztpZih1PD0xMjcpKytsZW47ZWxzZSBpZih1PD0yMDQ3KWxlbis9MjtlbHNlIGlmKHU8PTY1NTM1KWxlbis9MztlbHNlIGxlbis9NH1yZXR1cm4gbGVufXZhciBVVEYxNkRlY29kZXI9dHlwZW9mIFRleHREZWNvZGVyIT0idW5kZWZpbmVkIj9uZXcgVGV4dERlY29kZXIoInV0Zi0xNmxlIik6dW5kZWZpbmVkO2Z1bmN0aW9uIFVURjE2VG9TdHJpbmcocHRyLG1heEJ5dGVzVG9SZWFkKXt2YXIgZW5kUHRyPXB0cjt2YXIgaWR4PWVuZFB0cj4+MTt2YXIgbWF4SWR4PWlkeCttYXhCeXRlc1RvUmVhZC8yO3doaWxlKCEoaWR4Pj1tYXhJZHgpJiZIRUFQVTE2W2lkeF0pKytpZHg7ZW5kUHRyPWlkeDw8MTtpZihlbmRQdHItcHRyPjMyJiZVVEYxNkRlY29kZXIpe3JldHVybiBVVEYxNkRlY29kZXIuZGVjb2RlKEhFQVBVOC5zdWJhcnJheShwdHIsZW5kUHRyKSl9ZWxzZXt2YXIgc3RyPSIiO2Zvcih2YXIgaT0wOyEoaT49bWF4Qnl0ZXNUb1JlYWQvMik7KytpKXt2YXIgY29kZVVuaXQ9SEVBUDE2W3B0citpKjI+PjFdO2lmKGNvZGVVbml0PT0wKWJyZWFrO3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZShjb2RlVW5pdCl9cmV0dXJuIHN0cn19ZnVuY3Rpb24gc3RyaW5nVG9VVEYxNihzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSl7aWYobWF4Qnl0ZXNUb1dyaXRlPT09dW5kZWZpbmVkKXttYXhCeXRlc1RvV3JpdGU9MjE0NzQ4MzY0N31pZihtYXhCeXRlc1RvV3JpdGU8MilyZXR1cm4gMDttYXhCeXRlc1RvV3JpdGUtPTI7dmFyIHN0YXJ0UHRyPW91dFB0cjt2YXIgbnVtQ2hhcnNUb1dyaXRlPW1heEJ5dGVzVG9Xcml0ZTxzdHIubGVuZ3RoKjI/bWF4Qnl0ZXNUb1dyaXRlLzI6c3RyLmxlbmd0aDtmb3IodmFyIGk9MDtpPG51bUNoYXJzVG9Xcml0ZTsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtIRUFQMTZbb3V0UHRyPj4xXT1jb2RlVW5pdDtvdXRQdHIrPTJ9SEVBUDE2W291dFB0cj4+MV09MDtyZXR1cm4gb3V0UHRyLXN0YXJ0UHRyfWZ1bmN0aW9uIGxlbmd0aEJ5dGVzVVRGMTYoc3RyKXtyZXR1cm4gc3RyLmxlbmd0aCoyfWZ1bmN0aW9uIFVURjMyVG9TdHJpbmcocHRyLG1heEJ5dGVzVG9SZWFkKXt2YXIgaT0wO3ZhciBzdHI9IiI7d2hpbGUoIShpPj1tYXhCeXRlc1RvUmVhZC80KSl7dmFyIHV0ZjMyPUhFQVAzMltwdHIraSo0Pj4yXTtpZih1dGYzMj09MClicmVhazsrK2k7aWYodXRmMzI+PTY1NTM2KXt2YXIgY2g9dXRmMzItNjU1MzY7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGNoPj4xMCw1NjMyMHxjaCYxMDIzKX1lbHNle3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1dGYzMil9fXJldHVybiBzdHJ9ZnVuY3Rpb24gc3RyaW5nVG9VVEYzMihzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSl7aWYobWF4Qnl0ZXNUb1dyaXRlPT09dW5kZWZpbmVkKXttYXhCeXRlc1RvV3JpdGU9MjE0NzQ4MzY0N31pZihtYXhCeXRlc1RvV3JpdGU8NClyZXR1cm4gMDt2YXIgc3RhcnRQdHI9b3V0UHRyO3ZhciBlbmRQdHI9c3RhcnRQdHIrbWF4Qnl0ZXNUb1dyaXRlLTQ7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO2lmKGNvZGVVbml0Pj01NTI5NiYmY29kZVVuaXQ8PTU3MzQzKXt2YXIgdHJhaWxTdXJyb2dhdGU9c3RyLmNoYXJDb2RlQXQoKytpKTtjb2RlVW5pdD02NTUzNisoKGNvZGVVbml0JjEwMjMpPDwxMCl8dHJhaWxTdXJyb2dhdGUmMTAyM31IRUFQMzJbb3V0UHRyPj4yXT1jb2RlVW5pdDtvdXRQdHIrPTQ7aWYob3V0UHRyKzQ+ZW5kUHRyKWJyZWFrfUhFQVAzMltvdXRQdHI+PjJdPTA7cmV0dXJuIG91dFB0ci1zdGFydFB0cn1mdW5jdGlvbiBsZW5ndGhCeXRlc1VURjMyKHN0cil7dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtpZihjb2RlVW5pdD49NTUyOTYmJmNvZGVVbml0PD01NzM0MykrK2k7bGVuKz00fXJldHVybiBsZW59ZnVuY3Rpb24gd3JpdGVBcnJheVRvTWVtb3J5KGFycmF5LGJ1ZmZlcil7SEVBUDguc2V0KGFycmF5LGJ1ZmZlcil9ZnVuY3Rpb24gd3JpdGVBc2NpaVRvTWVtb3J5KHN0cixidWZmZXIsZG9udEFkZE51bGwpe2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe0hFQVA4W2J1ZmZlcisrPj4wXT1zdHIuY2hhckNvZGVBdChpKX1pZighZG9udEFkZE51bGwpSEVBUDhbYnVmZmVyPj4wXT0wfXZhciBidWZmZXIsSEVBUDgsSEVBUFU4LEhFQVAxNixIRUFQVTE2LEhFQVAzMixIRUFQVTMyLEhFQVBGMzIsSEVBUEY2NDtmdW5jdGlvbiB1cGRhdGVHbG9iYWxCdWZmZXJBbmRWaWV3cyhidWYpe2J1ZmZlcj1idWY7TW9kdWxlWyJIRUFQOCJdPUhFQVA4PW5ldyBJbnQ4QXJyYXkoYnVmKTtNb2R1bGVbIkhFQVAxNiJdPUhFQVAxNj1uZXcgSW50MTZBcnJheShidWYpO01vZHVsZVsiSEVBUDMyIl09SEVBUDMyPW5ldyBJbnQzMkFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQVTgiXT1IRUFQVTg9bmV3IFVpbnQ4QXJyYXkoYnVmKTtNb2R1bGVbIkhFQVBVMTYiXT1IRUFQVTE2PW5ldyBVaW50MTZBcnJheShidWYpO01vZHVsZVsiSEVBUFUzMiJdPUhFQVBVMzI9bmV3IFVpbnQzMkFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQRjMyIl09SEVBUEYzMj1uZXcgRmxvYXQzMkFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQRjY0Il09SEVBUEY2ND1uZXcgRmxvYXQ2NEFycmF5KGJ1Zil9dmFyIElOSVRJQUxfTUVNT1JZPU1vZHVsZVsiSU5JVElBTF9NRU1PUlkiXXx8MTY3NzcyMTY7dmFyIHdhc21UYWJsZTt2YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FURVhJVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO3ZhciBydW50aW1lSW5pdGlhbGl6ZWQ9ZmFsc2U7dmFyIHJ1bnRpbWVFeGl0ZWQ9ZmFsc2U7dmFyIHJ1bnRpbWVLZWVwYWxpdmVDb3VudGVyPTA7ZnVuY3Rpb24ga2VlcFJ1bnRpbWVBbGl2ZSgpe3JldHVybiBub0V4aXRSdW50aW1lfHxydW50aW1lS2VlcGFsaXZlQ291bnRlcj4wfWZ1bmN0aW9uIHByZVJ1bigpe2lmKE1vZHVsZVsicHJlUnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInByZVJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlUnVuIl09W01vZHVsZVsicHJlUnVuIl1dO3doaWxlKE1vZHVsZVsicHJlUnVuIl0ubGVuZ3RoKXthZGRPblByZVJ1bihNb2R1bGVbInByZVJ1biJdLnNoaWZ0KCkpfX1jYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUUFJFUlVOX18pfWZ1bmN0aW9uIGluaXRSdW50aW1lKCl7cnVudGltZUluaXRpYWxpemVkPXRydWU7aWYoIU1vZHVsZVsibm9GU0luaXQiXSYmIUZTLmluaXQuaW5pdGlhbGl6ZWQpRlMuaW5pdCgpO0ZTLmlnbm9yZVBlcm1pc3Npb25zPWZhbHNlO1RUWS5pbml0KCk7Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVElOSVRfXyl9ZnVuY3Rpb24gZXhpdFJ1bnRpbWUoKXtfX19mdW5jc19vbl9leGl0KCk7Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVEVYSVRfXyk7RlMucXVpdCgpO1RUWS5zaHV0ZG93bigpO3J1bnRpbWVFeGl0ZWQ9dHJ1ZX1mdW5jdGlvbiBwb3N0UnVuKCl7aWYoTW9kdWxlWyJwb3N0UnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInBvc3RSdW4iXT09ImZ1bmN0aW9uIilNb2R1bGVbInBvc3RSdW4iXT1bTW9kdWxlWyJwb3N0UnVuIl1dO3doaWxlKE1vZHVsZVsicG9zdFJ1biJdLmxlbmd0aCl7YWRkT25Qb3N0UnVuKE1vZHVsZVsicG9zdFJ1biJdLnNoaWZ0KCkpfX1jYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUUE9TVFJVTl9fKX1mdW5jdGlvbiBhZGRPblByZVJ1bihjYil7X19BVFBSRVJVTl9fLnVuc2hpZnQoY2IpfWZ1bmN0aW9uIGFkZE9uSW5pdChjYil7X19BVElOSVRfXy51bnNoaWZ0KGNiKX1mdW5jdGlvbiBhZGRPblBvc3RSdW4oY2Ipe19fQVRQT1NUUlVOX18udW5zaGlmdChjYil9dmFyIHJ1bkRlcGVuZGVuY2llcz0wO3ZhciBydW5EZXBlbmRlbmN5V2F0Y2hlcj1udWxsO3ZhciBkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtmdW5jdGlvbiBnZXRVbmlxdWVSdW5EZXBlbmRlbmN5KGlkKXtyZXR1cm4gaWR9ZnVuY3Rpb24gYWRkUnVuRGVwZW5kZW5jeShpZCl7cnVuRGVwZW5kZW5jaWVzKys7aWYoTW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0pe01vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKHJ1bkRlcGVuZGVuY2llcyl9fWZ1bmN0aW9uIHJlbW92ZVJ1bkRlcGVuZGVuY3koaWQpe3J1bkRlcGVuZGVuY2llcy0tO2lmKE1vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKXtNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXShydW5EZXBlbmRlbmNpZXMpfWlmKHJ1bkRlcGVuZGVuY2llcz09MCl7aWYocnVuRGVwZW5kZW5jeVdhdGNoZXIhPT1udWxsKXtjbGVhckludGVydmFsKHJ1bkRlcGVuZGVuY3lXYXRjaGVyKTtydW5EZXBlbmRlbmN5V2F0Y2hlcj1udWxsfWlmKGRlcGVuZGVuY2llc0Z1bGZpbGxlZCl7dmFyIGNhbGxiYWNrPWRlcGVuZGVuY2llc0Z1bGZpbGxlZDtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtjYWxsYmFjaygpfX19ZnVuY3Rpb24gYWJvcnQod2hhdCl7e2lmKE1vZHVsZVsib25BYm9ydCJdKXtNb2R1bGVbIm9uQWJvcnQiXSh3aGF0KX19d2hhdD0iQWJvcnRlZCgiK3doYXQrIikiO2Vycih3aGF0KTtBQk9SVD10cnVlO0VYSVRTVEFUVVM9MTt3aGF0Kz0iLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLiI7dmFyIGU9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcih3aGF0KTtyZWFkeVByb21pc2VSZWplY3QoZSk7dGhyb3cgZX12YXIgZGF0YVVSSVByZWZpeD0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LCI7ZnVuY3Rpb24gaXNEYXRhVVJJKGZpbGVuYW1lKXtyZXR1cm4gZmlsZW5hbWUuc3RhcnRzV2l0aChkYXRhVVJJUHJlZml4KX12YXIgd2FzbUJpbmFyeUZpbGU7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3dhc21CaW5hcnlGaWxlPSJtYWluLWJpbi1tb25vLndhc20iO2lmKCFpc0RhdGFVUkkod2FzbUJpbmFyeUZpbGUpKXt3YXNtQmluYXJ5RmlsZT1sb2NhdGVGaWxlKHdhc21CaW5hcnlGaWxlKX19ZWxzZXt3YXNtQmluYXJ5RmlsZT1uZXcgVVJMKCJtYWluLWJpbi1tb25vLndhc20iLGxvY2F0aW9uLmhyZWYpLnRvU3RyaW5nKCl9ZnVuY3Rpb24gZ2V0QmluYXJ5KGZpbGUpe3RyeXtpZihmaWxlPT13YXNtQmluYXJ5RmlsZSYmd2FzbUJpbmFyeSl7cmV0dXJuIG5ldyBVaW50OEFycmF5KHdhc21CaW5hcnkpfWlmKHJlYWRCaW5hcnkpe3JldHVybiByZWFkQmluYXJ5KGZpbGUpfWVsc2V7dGhyb3ciYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWQifX1jYXRjaChlcnIpe2Fib3J0KGVycil9fWZ1bmN0aW9uIGdldEJpbmFyeVByb21pc2UoKXtpZighd2FzbUJpbmFyeSYmKEVOVklST05NRU5UX0lTX1dFQnx8RU5WSVJPTk1FTlRfSVNfV09SS0VSKSl7aWYodHlwZW9mIGZldGNoPT0iZnVuY3Rpb24iKXtyZXR1cm4gZmV0Y2god2FzbUJpbmFyeUZpbGUse2NyZWRlbnRpYWxzOiJzYW1lLW9yaWdpbiJ9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtpZighcmVzcG9uc2VbIm9rIl0pe3Rocm93ImZhaWxlZCB0byBsb2FkIHdhc20gYmluYXJ5IGZpbGUgYXQgJyIrd2FzbUJpbmFyeUZpbGUrIicifXJldHVybiByZXNwb25zZVsiYXJyYXlCdWZmZXIiXSgpfSkuY2F0Y2goZnVuY3Rpb24oKXtyZXR1cm4gZ2V0QmluYXJ5KHdhc21CaW5hcnlGaWxlKX0pfX1yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbigpe3JldHVybiBnZXRCaW5hcnkod2FzbUJpbmFyeUZpbGUpfSl9ZnVuY3Rpb24gY3JlYXRlV2FzbSgpe3ZhciBpbmZvPXsiYSI6YXNtTGlicmFyeUFyZ307ZnVuY3Rpb24gcmVjZWl2ZUluc3RhbmNlKGluc3RhbmNlLG1vZHVsZSl7dmFyIGV4cG9ydHM9aW5zdGFuY2UuZXhwb3J0cztNb2R1bGVbImFzbSJdPWV4cG9ydHM7d2FzbU1lbW9yeT1Nb2R1bGVbImFzbSJdWyJOYSJdO3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKTt3YXNtVGFibGU9TW9kdWxlWyJhc20iXVsiUGEiXTthZGRPbkluaXQoTW9kdWxlWyJhc20iXVsiT2EiXSk7cmVtb3ZlUnVuRGVwZW5kZW5jeSgid2FzbS1pbnN0YW50aWF0ZSIpfWFkZFJ1bkRlcGVuZGVuY3koIndhc20taW5zdGFudGlhdGUiKTtmdW5jdGlvbiByZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdChyZXN1bHQpe3JlY2VpdmVJbnN0YW5jZShyZXN1bHRbImluc3RhbmNlIl0pfWZ1bmN0aW9uIGluc3RhbnRpYXRlQXJyYXlCdWZmZXIocmVjZWl2ZXIpe3JldHVybiBnZXRCaW5hcnlQcm9taXNlKCkudGhlbihmdW5jdGlvbihiaW5hcnkpe3JldHVybiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZShiaW5hcnksaW5mbyl9KS50aGVuKGZ1bmN0aW9uKGluc3RhbmNlKXtyZXR1cm4gaW5zdGFuY2V9KS50aGVuKHJlY2VpdmVyLGZ1bmN0aW9uKHJlYXNvbil7ZXJyKCJmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAiK3JlYXNvbik7YWJvcnQocmVhc29uKX0pfWZ1bmN0aW9uIGluc3RhbnRpYXRlQXN5bmMoKXtpZighd2FzbUJpbmFyeSYmdHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nPT0iZnVuY3Rpb24iJiYhaXNEYXRhVVJJKHdhc21CaW5hcnlGaWxlKSYmdHlwZW9mIGZldGNoPT0iZnVuY3Rpb24iKXtyZXR1cm4gZmV0Y2god2FzbUJpbmFyeUZpbGUse2NyZWRlbnRpYWxzOiJzYW1lLW9yaWdpbiJ9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXt2YXIgcmVzdWx0PVdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKHJlc3BvbnNlLGluZm8pO3JldHVybiByZXN1bHQudGhlbihyZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdCxmdW5jdGlvbihyZWFzb24pe2Vycigid2FzbSBzdHJlYW1pbmcgY29tcGlsZSBmYWlsZWQ6ICIrcmVhc29uKTtlcnIoImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uIik7cmV0dXJuIGluc3RhbnRpYXRlQXJyYXlCdWZmZXIocmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQpfSl9KX1lbHNle3JldHVybiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KX19aWYoTW9kdWxlWyJpbnN0YW50aWF0ZVdhc20iXSl7dHJ5e3ZhciBleHBvcnRzPU1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0oaW5mbyxyZWNlaXZlSW5zdGFuY2UpO3JldHVybiBleHBvcnRzfWNhdGNoKGUpe2VycigiTW9kdWxlLmluc3RhbnRpYXRlV2FzbSBjYWxsYmFjayBmYWlsZWQgd2l0aCBlcnJvcjogIitlKTtyZXR1cm4gZmFsc2V9fWluc3RhbnRpYXRlQXN5bmMoKS5jYXRjaChyZWFkeVByb21pc2VSZWplY3QpO3JldHVybnt9fXZhciB0ZW1wRG91YmxlO3ZhciB0ZW1wSTY0O2Z1bmN0aW9uIGNhbGxSdW50aW1lQ2FsbGJhY2tzKGNhbGxiYWNrcyl7d2hpbGUoY2FsbGJhY2tzLmxlbmd0aD4wKXt2YXIgY2FsbGJhY2s9Y2FsbGJhY2tzLnNoaWZ0KCk7aWYodHlwZW9mIGNhbGxiYWNrPT0iZnVuY3Rpb24iKXtjYWxsYmFjayhNb2R1bGUpO2NvbnRpbnVlfXZhciBmdW5jPWNhbGxiYWNrLmZ1bmM7aWYodHlwZW9mIGZ1bmM9PSJudW1iZXIiKXtpZihjYWxsYmFjay5hcmc9PT11bmRlZmluZWQpe2dldFdhc21UYWJsZUVudHJ5KGZ1bmMpKCl9ZWxzZXtnZXRXYXNtVGFibGVFbnRyeShmdW5jKShjYWxsYmFjay5hcmcpfX1lbHNle2Z1bmMoY2FsbGJhY2suYXJnPT09dW5kZWZpbmVkP251bGw6Y2FsbGJhY2suYXJnKX19fXZhciB3YXNtVGFibGVNaXJyb3I9W107ZnVuY3Rpb24gZ2V0V2FzbVRhYmxlRW50cnkoZnVuY1B0cil7dmFyIGZ1bmM9d2FzbVRhYmxlTWlycm9yW2Z1bmNQdHJdO2lmKCFmdW5jKXtpZihmdW5jUHRyPj13YXNtVGFibGVNaXJyb3IubGVuZ3RoKXdhc21UYWJsZU1pcnJvci5sZW5ndGg9ZnVuY1B0cisxO3dhc21UYWJsZU1pcnJvcltmdW5jUHRyXT1mdW5jPXdhc21UYWJsZS5nZXQoZnVuY1B0cil9cmV0dXJuIGZ1bmN9ZnVuY3Rpb24gX19fYXNzZXJ0X2ZhaWwoY29uZGl0aW9uLGZpbGVuYW1lLGxpbmUsZnVuYyl7YWJvcnQoIkFzc2VydGlvbiBmYWlsZWQ6ICIrVVRGOFRvU3RyaW5nKGNvbmRpdGlvbikrIiwgYXQ6ICIrW2ZpbGVuYW1lP1VURjhUb1N0cmluZyhmaWxlbmFtZSk6InVua25vd24gZmlsZW5hbWUiLGxpbmUsZnVuYz9VVEY4VG9TdHJpbmcoZnVuYyk6InVua25vd24gZnVuY3Rpb24iXSl9ZnVuY3Rpb24gX19fY3hhX2FsbG9jYXRlX2V4Y2VwdGlvbihzaXplKXtyZXR1cm4gX21hbGxvYyhzaXplKzI0KSsyNH12YXIgZXhjZXB0aW9uQ2F1Z2h0PVtdO2Z1bmN0aW9uIGV4Y2VwdGlvbl9hZGRSZWYoaW5mbyl7aW5mby5hZGRfcmVmKCl9dmFyIHVuY2F1Z2h0RXhjZXB0aW9uQ291bnQ9MDtmdW5jdGlvbiBfX19jeGFfYmVnaW5fY2F0Y2gocHRyKXt2YXIgaW5mbz1uZXcgRXhjZXB0aW9uSW5mbyhwdHIpO2lmKCFpbmZvLmdldF9jYXVnaHQoKSl7aW5mby5zZXRfY2F1Z2h0KHRydWUpO3VuY2F1Z2h0RXhjZXB0aW9uQ291bnQtLX1pbmZvLnNldF9yZXRocm93bihmYWxzZSk7ZXhjZXB0aW9uQ2F1Z2h0LnB1c2goaW5mbyk7ZXhjZXB0aW9uX2FkZFJlZihpbmZvKTtyZXR1cm4gaW5mby5nZXRfZXhjZXB0aW9uX3B0cigpfWZ1bmN0aW9uIF9fX2N4YV9jdXJyZW50X3ByaW1hcnlfZXhjZXB0aW9uKCl7aWYoIWV4Y2VwdGlvbkNhdWdodC5sZW5ndGgpe3JldHVybiAwfXZhciBpbmZvPWV4Y2VwdGlvbkNhdWdodFtleGNlcHRpb25DYXVnaHQubGVuZ3RoLTFdO2V4Y2VwdGlvbl9hZGRSZWYoaW5mbyk7cmV0dXJuIGluZm8uZXhjUHRyfWZ1bmN0aW9uIEV4Y2VwdGlvbkluZm8oZXhjUHRyKXt0aGlzLmV4Y1B0cj1leGNQdHI7dGhpcy5wdHI9ZXhjUHRyLTI0O3RoaXMuc2V0X3R5cGU9ZnVuY3Rpb24odHlwZSl7SEVBUFUzMlt0aGlzLnB0cis0Pj4yXT10eXBlfTt0aGlzLmdldF90eXBlPWZ1bmN0aW9uKCl7cmV0dXJuIEhFQVBVMzJbdGhpcy5wdHIrND4+Ml19O3RoaXMuc2V0X2Rlc3RydWN0b3I9ZnVuY3Rpb24oZGVzdHJ1Y3Rvcil7SEVBUFUzMlt0aGlzLnB0cis4Pj4yXT1kZXN0cnVjdG9yfTt0aGlzLmdldF9kZXN0cnVjdG9yPWZ1bmN0aW9uKCl7cmV0dXJuIEhFQVBVMzJbdGhpcy5wdHIrOD4+Ml19O3RoaXMuc2V0X3JlZmNvdW50PWZ1bmN0aW9uKHJlZmNvdW50KXtIRUFQMzJbdGhpcy5wdHI+PjJdPXJlZmNvdW50fTt0aGlzLnNldF9jYXVnaHQ9ZnVuY3Rpb24oY2F1Z2h0KXtjYXVnaHQ9Y2F1Z2h0PzE6MDtIRUFQOFt0aGlzLnB0cisxMj4+MF09Y2F1Z2h0fTt0aGlzLmdldF9jYXVnaHQ9ZnVuY3Rpb24oKXtyZXR1cm4gSEVBUDhbdGhpcy5wdHIrMTI+PjBdIT0wfTt0aGlzLnNldF9yZXRocm93bj1mdW5jdGlvbihyZXRocm93bil7cmV0aHJvd249cmV0aHJvd24/MTowO0hFQVA4W3RoaXMucHRyKzEzPj4wXT1yZXRocm93bn07dGhpcy5nZXRfcmV0aHJvd249ZnVuY3Rpb24oKXtyZXR1cm4gSEVBUDhbdGhpcy5wdHIrMTM+PjBdIT0wfTt0aGlzLmluaXQ9ZnVuY3Rpb24odHlwZSxkZXN0cnVjdG9yKXt0aGlzLnNldF9hZGp1c3RlZF9wdHIoMCk7dGhpcy5zZXRfdHlwZSh0eXBlKTt0aGlzLnNldF9kZXN0cnVjdG9yKGRlc3RydWN0b3IpO3RoaXMuc2V0X3JlZmNvdW50KDApO3RoaXMuc2V0X2NhdWdodChmYWxzZSk7dGhpcy5zZXRfcmV0aHJvd24oZmFsc2UpfTt0aGlzLmFkZF9yZWY9ZnVuY3Rpb24oKXt2YXIgdmFsdWU9SEVBUDMyW3RoaXMucHRyPj4yXTtIRUFQMzJbdGhpcy5wdHI+PjJdPXZhbHVlKzF9O3RoaXMucmVsZWFzZV9yZWY9ZnVuY3Rpb24oKXt2YXIgcHJldj1IRUFQMzJbdGhpcy5wdHI+PjJdO0hFQVAzMlt0aGlzLnB0cj4+Ml09cHJldi0xO3JldHVybiBwcmV2PT09MX07dGhpcy5zZXRfYWRqdXN0ZWRfcHRyPWZ1bmN0aW9uKGFkanVzdGVkUHRyKXtIRUFQVTMyW3RoaXMucHRyKzE2Pj4yXT1hZGp1c3RlZFB0cn07dGhpcy5nZXRfYWRqdXN0ZWRfcHRyPWZ1bmN0aW9uKCl7cmV0dXJuIEhFQVBVMzJbdGhpcy5wdHIrMTY+PjJdfTt0aGlzLmdldF9leGNlcHRpb25fcHRyPWZ1bmN0aW9uKCl7dmFyIGlzUG9pbnRlcj1fX19jeGFfaXNfcG9pbnRlcl90eXBlKHRoaXMuZ2V0X3R5cGUoKSk7aWYoaXNQb2ludGVyKXtyZXR1cm4gSEVBUFUzMlt0aGlzLmV4Y1B0cj4+Ml19dmFyIGFkanVzdGVkPXRoaXMuZ2V0X2FkanVzdGVkX3B0cigpO2lmKGFkanVzdGVkIT09MClyZXR1cm4gYWRqdXN0ZWQ7cmV0dXJuIHRoaXMuZXhjUHRyfX1mdW5jdGlvbiBfX19jeGFfZnJlZV9leGNlcHRpb24ocHRyKXtyZXR1cm4gX2ZyZWUobmV3IEV4Y2VwdGlvbkluZm8ocHRyKS5wdHIpfWZ1bmN0aW9uIGV4Y2VwdGlvbl9kZWNSZWYoaW5mbyl7aWYoaW5mby5yZWxlYXNlX3JlZigpJiYhaW5mby5nZXRfcmV0aHJvd24oKSl7dmFyIGRlc3RydWN0b3I9aW5mby5nZXRfZGVzdHJ1Y3RvcigpO2lmKGRlc3RydWN0b3Ipe2dldFdhc21UYWJsZUVudHJ5KGRlc3RydWN0b3IpKGluZm8uZXhjUHRyKX1fX19jeGFfZnJlZV9leGNlcHRpb24oaW5mby5leGNQdHIpfX1mdW5jdGlvbiBfX19jeGFfZGVjcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudChwdHIpe2lmKCFwdHIpcmV0dXJuO2V4Y2VwdGlvbl9kZWNSZWYobmV3IEV4Y2VwdGlvbkluZm8ocHRyKSl9dmFyIGV4Y2VwdGlvbkxhc3Q9MDtmdW5jdGlvbiBfX19jeGFfZW5kX2NhdGNoKCl7X3NldFRocmV3KDApO3ZhciBpbmZvPWV4Y2VwdGlvbkNhdWdodC5wb3AoKTtleGNlcHRpb25fZGVjUmVmKGluZm8pO2V4Y2VwdGlvbkxhc3Q9MH1mdW5jdGlvbiBfX19yZXN1bWVFeGNlcHRpb24ocHRyKXtpZighZXhjZXB0aW9uTGFzdCl7ZXhjZXB0aW9uTGFzdD1wdHJ9dGhyb3cgcHRyfWZ1bmN0aW9uIF9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzIoKXt2YXIgdGhyb3duPWV4Y2VwdGlvbkxhc3Q7aWYoIXRocm93bil7c2V0VGVtcFJldDAoMCk7cmV0dXJuIDB9dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8odGhyb3duKTtpbmZvLnNldF9hZGp1c3RlZF9wdHIodGhyb3duKTt2YXIgdGhyb3duVHlwZT1pbmZvLmdldF90eXBlKCk7aWYoIXRocm93blR5cGUpe3NldFRlbXBSZXQwKDApO3JldHVybiB0aHJvd259dmFyIHR5cGVBcnJheT1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO2Zvcih2YXIgaT0wO2k8dHlwZUFycmF5Lmxlbmd0aDtpKyspe3ZhciBjYXVnaHRUeXBlPXR5cGVBcnJheVtpXTtpZihjYXVnaHRUeXBlPT09MHx8Y2F1Z2h0VHlwZT09PXRocm93blR5cGUpe2JyZWFrfXZhciBhZGp1c3RlZF9wdHJfYWRkcj1pbmZvLnB0cisxNjtpZihfX19jeGFfY2FuX2NhdGNoKGNhdWdodFR5cGUsdGhyb3duVHlwZSxhZGp1c3RlZF9wdHJfYWRkcikpe3NldFRlbXBSZXQwKGNhdWdodFR5cGUpO3JldHVybiB0aHJvd259fXNldFRlbXBSZXQwKHRocm93blR5cGUpO3JldHVybiB0aHJvd259ZnVuY3Rpb24gX19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMygpe3ZhciB0aHJvd249ZXhjZXB0aW9uTGFzdDtpZighdGhyb3duKXtzZXRUZW1wUmV0MCgwKTtyZXR1cm4gMH12YXIgaW5mbz1uZXcgRXhjZXB0aW9uSW5mbyh0aHJvd24pO2luZm8uc2V0X2FkanVzdGVkX3B0cih0aHJvd24pO3ZhciB0aHJvd25UeXBlPWluZm8uZ2V0X3R5cGUoKTtpZighdGhyb3duVHlwZSl7c2V0VGVtcFJldDAoMCk7cmV0dXJuIHRocm93bn12YXIgdHlwZUFycmF5PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7Zm9yKHZhciBpPTA7aTx0eXBlQXJyYXkubGVuZ3RoO2krKyl7dmFyIGNhdWdodFR5cGU9dHlwZUFycmF5W2ldO2lmKGNhdWdodFR5cGU9PT0wfHxjYXVnaHRUeXBlPT09dGhyb3duVHlwZSl7YnJlYWt9dmFyIGFkanVzdGVkX3B0cl9hZGRyPWluZm8ucHRyKzE2O2lmKF9fX2N4YV9jYW5fY2F0Y2goY2F1Z2h0VHlwZSx0aHJvd25UeXBlLGFkanVzdGVkX3B0cl9hZGRyKSl7c2V0VGVtcFJldDAoY2F1Z2h0VHlwZSk7cmV0dXJuIHRocm93bn19c2V0VGVtcFJldDAodGhyb3duVHlwZSk7cmV0dXJuIHRocm93bn1mdW5jdGlvbiBfX19jeGFfaW5jcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudChwdHIpe2lmKCFwdHIpcmV0dXJuO2V4Y2VwdGlvbl9hZGRSZWYobmV3IEV4Y2VwdGlvbkluZm8ocHRyKSl9ZnVuY3Rpb24gX19fY3hhX3JldGhyb3coKXt2YXIgaW5mbz1leGNlcHRpb25DYXVnaHQucG9wKCk7aWYoIWluZm8pe2Fib3J0KCJubyBleGNlcHRpb24gdG8gdGhyb3ciKX12YXIgcHRyPWluZm8uZXhjUHRyO2lmKCFpbmZvLmdldF9yZXRocm93bigpKXtleGNlcHRpb25DYXVnaHQucHVzaChpbmZvKTtpbmZvLnNldF9yZXRocm93bih0cnVlKTtpbmZvLnNldF9jYXVnaHQoZmFsc2UpO3VuY2F1Z2h0RXhjZXB0aW9uQ291bnQrK31leGNlcHRpb25MYXN0PXB0cjt0aHJvdyBwdHJ9ZnVuY3Rpb24gX19fY3hhX3JldGhyb3dfcHJpbWFyeV9leGNlcHRpb24ocHRyKXtpZighcHRyKXJldHVybjt2YXIgaW5mbz1uZXcgRXhjZXB0aW9uSW5mbyhwdHIpO2V4Y2VwdGlvbkNhdWdodC5wdXNoKGluZm8pO2luZm8uc2V0X3JldGhyb3duKHRydWUpO19fX2N4YV9yZXRocm93KCl9ZnVuY3Rpb24gX19fY3hhX3Rocm93KHB0cix0eXBlLGRlc3RydWN0b3Ipe3ZhciBpbmZvPW5ldyBFeGNlcHRpb25JbmZvKHB0cik7aW5mby5pbml0KHR5cGUsZGVzdHJ1Y3Rvcik7ZXhjZXB0aW9uTGFzdD1wdHI7dW5jYXVnaHRFeGNlcHRpb25Db3VudCsrO3Rocm93IHB0cn1mdW5jdGlvbiBfX19jeGFfdW5jYXVnaHRfZXhjZXB0aW9ucygpe3JldHVybiB1bmNhdWdodEV4Y2VwdGlvbkNvdW50fXZhciBQQVRIPXtpc0FiczpwYXRoPT5wYXRoLmNoYXJBdCgwKT09PSIvIixzcGxpdFBhdGg6ZmlsZW5hbWU9Pnt2YXIgc3BsaXRQYXRoUmU9L14oXC8/fCkoW1xzXFNdKj8pKCg/OlwuezEsMn18W15cL10rP3wpKFwuW14uXC9dKnwpKSg/OltcL10qKSQvO3JldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKX0sbm9ybWFsaXplQXJyYXk6KHBhcnRzLGFsbG93QWJvdmVSb290KT0+e3ZhciB1cD0wO2Zvcih2YXIgaT1wYXJ0cy5sZW5ndGgtMTtpPj0wO2ktLSl7dmFyIGxhc3Q9cGFydHNbaV07aWYobGFzdD09PSIuIil7cGFydHMuc3BsaWNlKGksMSl9ZWxzZSBpZihsYXN0PT09Ii4uIil7cGFydHMuc3BsaWNlKGksMSk7dXArK31lbHNlIGlmKHVwKXtwYXJ0cy5zcGxpY2UoaSwxKTt1cC0tfX1pZihhbGxvd0Fib3ZlUm9vdCl7Zm9yKDt1cDt1cC0tKXtwYXJ0cy51bnNoaWZ0KCIuLiIpfX1yZXR1cm4gcGFydHN9LG5vcm1hbGl6ZTpwYXRoPT57dmFyIGlzQWJzb2x1dGU9UEFUSC5pc0FicyhwYXRoKSx0cmFpbGluZ1NsYXNoPXBhdGguc3Vic3RyKC0xKT09PSIvIjtwYXRoPVBBVEgubm9ybWFsaXplQXJyYXkocGF0aC5zcGxpdCgiLyIpLmZpbHRlcihwPT4hIXApLCFpc0Fic29sdXRlKS5qb2luKCIvIik7aWYoIXBhdGgmJiFpc0Fic29sdXRlKXtwYXRoPSIuIn1pZihwYXRoJiZ0cmFpbGluZ1NsYXNoKXtwYXRoKz0iLyJ9cmV0dXJuKGlzQWJzb2x1dGU/Ii8iOiIiKStwYXRofSxkaXJuYW1lOnBhdGg9Pnt2YXIgcmVzdWx0PVBBVEguc3BsaXRQYXRoKHBhdGgpLHJvb3Q9cmVzdWx0WzBdLGRpcj1yZXN1bHRbMV07aWYoIXJvb3QmJiFkaXIpe3JldHVybiIuIn1pZihkaXIpe2Rpcj1kaXIuc3Vic3RyKDAsZGlyLmxlbmd0aC0xKX1yZXR1cm4gcm9vdCtkaXJ9LGJhc2VuYW1lOnBhdGg9PntpZihwYXRoPT09Ii8iKXJldHVybiIvIjtwYXRoPVBBVEgubm9ybWFsaXplKHBhdGgpO3BhdGg9cGF0aC5yZXBsYWNlKC9cLyQvLCIiKTt2YXIgbGFzdFNsYXNoPXBhdGgubGFzdEluZGV4T2YoIi8iKTtpZihsYXN0U2xhc2g9PT0tMSlyZXR1cm4gcGF0aDtyZXR1cm4gcGF0aC5zdWJzdHIobGFzdFNsYXNoKzEpfSxqb2luOmZ1bmN0aW9uKCl7dmFyIHBhdGhzPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywwKTtyZXR1cm4gUEFUSC5ub3JtYWxpemUocGF0aHMuam9pbigiLyIpKX0sam9pbjI6KGwscik9PntyZXR1cm4gUEFUSC5ub3JtYWxpemUobCsiLyIrcil9fTtmdW5jdGlvbiBnZXRSYW5kb21EZXZpY2UoKXtpZih0eXBlb2YgY3J5cHRvPT0ib2JqZWN0IiYmdHlwZW9mIGNyeXB0b1siZ2V0UmFuZG9tVmFsdWVzIl09PSJmdW5jdGlvbiIpe3ZhciByYW5kb21CdWZmZXI9bmV3IFVpbnQ4QXJyYXkoMSk7cmV0dXJuIGZ1bmN0aW9uKCl7Y3J5cHRvLmdldFJhbmRvbVZhbHVlcyhyYW5kb21CdWZmZXIpO3JldHVybiByYW5kb21CdWZmZXJbMF19fWVsc2UgcmV0dXJuIGZ1bmN0aW9uKCl7YWJvcnQoInJhbmRvbURldmljZSIpfX12YXIgUEFUSF9GUz17cmVzb2x2ZTpmdW5jdGlvbigpe3ZhciByZXNvbHZlZFBhdGg9IiIscmVzb2x2ZWRBYnNvbHV0ZT1mYWxzZTtmb3IodmFyIGk9YXJndW1lbnRzLmxlbmd0aC0xO2k+PS0xJiYhcmVzb2x2ZWRBYnNvbHV0ZTtpLS0pe3ZhciBwYXRoPWk+PTA/YXJndW1lbnRzW2ldOkZTLmN3ZCgpO2lmKHR5cGVvZiBwYXRoIT0ic3RyaW5nIil7dGhyb3cgbmV3IFR5cGVFcnJvcigiQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MiKX1lbHNlIGlmKCFwYXRoKXtyZXR1cm4iIn1yZXNvbHZlZFBhdGg9cGF0aCsiLyIrcmVzb2x2ZWRQYXRoO3Jlc29sdmVkQWJzb2x1dGU9UEFUSC5pc0FicyhwYXRoKX1yZXNvbHZlZFBhdGg9UEFUSC5ub3JtYWxpemVBcnJheShyZXNvbHZlZFBhdGguc3BsaXQoIi8iKS5maWx0ZXIocD0+ISFwKSwhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbigiLyIpO3JldHVybihyZXNvbHZlZEFic29sdXRlPyIvIjoiIikrcmVzb2x2ZWRQYXRofHwiLiJ9LHJlbGF0aXZlOihmcm9tLHRvKT0+e2Zyb209UEFUSF9GUy5yZXNvbHZlKGZyb20pLnN1YnN0cigxKTt0bz1QQVRIX0ZTLnJlc29sdmUodG8pLnN1YnN0cigxKTtmdW5jdGlvbiB0cmltKGFycil7dmFyIHN0YXJ0PTA7Zm9yKDtzdGFydDxhcnIubGVuZ3RoO3N0YXJ0Kyspe2lmKGFycltzdGFydF0hPT0iIilicmVha312YXIgZW5kPWFyci5sZW5ndGgtMTtmb3IoO2VuZD49MDtlbmQtLSl7aWYoYXJyW2VuZF0hPT0iIilicmVha31pZihzdGFydD5lbmQpcmV0dXJuW107cmV0dXJuIGFyci5zbGljZShzdGFydCxlbmQtc3RhcnQrMSl9dmFyIGZyb21QYXJ0cz10cmltKGZyb20uc3BsaXQoIi8iKSk7dmFyIHRvUGFydHM9dHJpbSh0by5zcGxpdCgiLyIpKTt2YXIgbGVuZ3RoPU1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsdG9QYXJ0cy5sZW5ndGgpO3ZhciBzYW1lUGFydHNMZW5ndGg9bGVuZ3RoO2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7aWYoZnJvbVBhcnRzW2ldIT09dG9QYXJ0c1tpXSl7c2FtZVBhcnRzTGVuZ3RoPWk7YnJlYWt9fXZhciBvdXRwdXRQYXJ0cz1bXTtmb3IodmFyIGk9c2FtZVBhcnRzTGVuZ3RoO2k8ZnJvbVBhcnRzLmxlbmd0aDtpKyspe291dHB1dFBhcnRzLnB1c2goIi4uIil9b3V0cHV0UGFydHM9b3V0cHV0UGFydHMuY29uY2F0KHRvUGFydHMuc2xpY2Uoc2FtZVBhcnRzTGVuZ3RoKSk7cmV0dXJuIG91dHB1dFBhcnRzLmpvaW4oIi8iKX19O3ZhciBUVFk9e3R0eXM6W10saW5pdDpmdW5jdGlvbigpe30sc2h1dGRvd246ZnVuY3Rpb24oKXt9LHJlZ2lzdGVyOmZ1bmN0aW9uKGRldixvcHMpe1RUWS50dHlzW2Rldl09e2lucHV0OltdLG91dHB1dDpbXSxvcHM6b3BzfTtGUy5yZWdpc3RlckRldmljZShkZXYsVFRZLnN0cmVhbV9vcHMpfSxzdHJlYW1fb3BzOntvcGVuOmZ1bmN0aW9uKHN0cmVhbSl7dmFyIHR0eT1UVFkudHR5c1tzdHJlYW0ubm9kZS5yZGV2XTtpZighdHR5KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9c3RyZWFtLnR0eT10dHk7c3RyZWFtLnNlZWthYmxlPWZhbHNlfSxjbG9zZTpmdW5jdGlvbihzdHJlYW0pe3N0cmVhbS50dHkub3BzLmZsdXNoKHN0cmVhbS50dHkpfSxmbHVzaDpmdW5jdGlvbihzdHJlYW0pe3N0cmVhbS50dHkub3BzLmZsdXNoKHN0cmVhbS50dHkpfSxyZWFkOmZ1bmN0aW9uKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3Mpe2lmKCFzdHJlYW0udHR5fHwhc3RyZWFtLnR0eS5vcHMuZ2V0X2NoYXIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYwKX12YXIgYnl0ZXNSZWFkPTA7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXt2YXIgcmVzdWx0O3RyeXtyZXN1bHQ9c3RyZWFtLnR0eS5vcHMuZ2V0X2NoYXIoc3RyZWFtLnR0eSl9Y2F0Y2goZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjkpfWlmKHJlc3VsdD09PXVuZGVmaW5lZCYmYnl0ZXNSZWFkPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNil9aWYocmVzdWx0PT09bnVsbHx8cmVzdWx0PT09dW5kZWZpbmVkKWJyZWFrO2J5dGVzUmVhZCsrO2J1ZmZlcltvZmZzZXQraV09cmVzdWx0fWlmKGJ5dGVzUmVhZCl7c3RyZWFtLm5vZGUudGltZXN0YW1wPURhdGUubm93KCl9cmV0dXJuIGJ5dGVzUmVhZH0sd3JpdGU6ZnVuY3Rpb24oc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyl7aWYoIXN0cmVhbS50dHl8fCFzdHJlYW0udHR5Lm9wcy5wdXRfY2hhcil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjApfXRyeXtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe3N0cmVhbS50dHkub3BzLnB1dF9jaGFyKHN0cmVhbS50dHksYnVmZmVyW29mZnNldCtpXSl9fWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX1pZihsZW5ndGgpe3N0cmVhbS5ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpfXJldHVybiBpfX0sZGVmYXVsdF90dHlfb3BzOntnZXRfY2hhcjpmdW5jdGlvbih0dHkpe2lmKCF0dHkuaW5wdXQubGVuZ3RoKXt2YXIgcmVzdWx0PW51bGw7aWYodHlwZW9mIHdpbmRvdyE9InVuZGVmaW5lZCImJnR5cGVvZiB3aW5kb3cucHJvbXB0PT0iZnVuY3Rpb24iKXtyZXN1bHQ9d2luZG93LnByb21wdCgiSW5wdXQ6ICIpO2lmKHJlc3VsdCE9PW51bGwpe3Jlc3VsdCs9IlxuIn19ZWxzZSBpZih0eXBlb2YgcmVhZGxpbmU9PSJmdW5jdGlvbiIpe3Jlc3VsdD1yZWFkbGluZSgpO2lmKHJlc3VsdCE9PW51bGwpe3Jlc3VsdCs9IlxuIn19aWYoIXJlc3VsdCl7cmV0dXJuIG51bGx9dHR5LmlucHV0PWludEFycmF5RnJvbVN0cmluZyhyZXN1bHQsdHJ1ZSl9cmV0dXJuIHR0eS5pbnB1dC5zaGlmdCgpfSxwdXRfY2hhcjpmdW5jdGlvbih0dHksdmFsKXtpZih2YWw9PT1udWxsfHx2YWw9PT0xMCl7b3V0KFVURjhBcnJheVRvU3RyaW5nKHR0eS5vdXRwdXQsMCkpO3R0eS5vdXRwdXQ9W119ZWxzZXtpZih2YWwhPTApdHR5Lm91dHB1dC5wdXNoKHZhbCl9fSxmbHVzaDpmdW5jdGlvbih0dHkpe2lmKHR0eS5vdXRwdXQmJnR0eS5vdXRwdXQubGVuZ3RoPjApe291dChVVEY4QXJyYXlUb1N0cmluZyh0dHkub3V0cHV0LDApKTt0dHkub3V0cHV0PVtdfX19LGRlZmF1bHRfdHR5MV9vcHM6e3B1dF9jaGFyOmZ1bmN0aW9uKHR0eSx2YWwpe2lmKHZhbD09PW51bGx8fHZhbD09PTEwKXtlcnIoVVRGOEFycmF5VG9TdHJpbmcodHR5Lm91dHB1dCwwKSk7dHR5Lm91dHB1dD1bXX1lbHNle2lmKHZhbCE9MCl0dHkub3V0cHV0LnB1c2godmFsKX19LGZsdXNoOmZ1bmN0aW9uKHR0eSl7aWYodHR5Lm91dHB1dCYmdHR5Lm91dHB1dC5sZW5ndGg+MCl7ZXJyKFVURjhBcnJheVRvU3RyaW5nKHR0eS5vdXRwdXQsMCkpO3R0eS5vdXRwdXQ9W119fX19O2Z1bmN0aW9uIHplcm9NZW1vcnkoYWRkcmVzcyxzaXplKXtIRUFQVTguZmlsbCgwLGFkZHJlc3MsYWRkcmVzcytzaXplKX1mdW5jdGlvbiBhbGlnbk1lbW9yeShzaXplLGFsaWdubWVudCl7cmV0dXJuIE1hdGguY2VpbChzaXplL2FsaWdubWVudCkqYWxpZ25tZW50fWZ1bmN0aW9uIG1tYXBBbGxvYyhzaXplKXtzaXplPWFsaWduTWVtb3J5KHNpemUsNjU1MzYpO3ZhciBwdHI9X2Vtc2NyaXB0ZW5fYnVpbHRpbl9tZW1hbGlnbig2NTUzNixzaXplKTtpZighcHRyKXJldHVybiAwO3plcm9NZW1vcnkocHRyLHNpemUpO3JldHVybiBwdHJ9dmFyIE1FTUZTPXtvcHNfdGFibGU6bnVsbCxtb3VudDpmdW5jdGlvbihtb3VudCl7cmV0dXJuIE1FTUZTLmNyZWF0ZU5vZGUobnVsbCwiLyIsMTYzODR8NTExLDApfSxjcmVhdGVOb2RlOmZ1bmN0aW9uKHBhcmVudCxuYW1lLG1vZGUsZGV2KXtpZihGUy5pc0Jsa2Rldihtb2RlKXx8RlMuaXNGSUZPKG1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoIU1FTUZTLm9wc190YWJsZSl7TUVNRlMub3BzX3RhYmxlPXtkaXI6e25vZGU6e2dldGF0dHI6TUVNRlMubm9kZV9vcHMuZ2V0YXR0cixzZXRhdHRyOk1FTUZTLm5vZGVfb3BzLnNldGF0dHIsbG9va3VwOk1FTUZTLm5vZGVfb3BzLmxvb2t1cCxta25vZDpNRU1GUy5ub2RlX29wcy5ta25vZCxyZW5hbWU6TUVNRlMubm9kZV9vcHMucmVuYW1lLHVubGluazpNRU1GUy5ub2RlX29wcy51bmxpbmsscm1kaXI6TUVNRlMubm9kZV9vcHMucm1kaXIscmVhZGRpcjpNRU1GUy5ub2RlX29wcy5yZWFkZGlyLHN5bWxpbms6TUVNRlMubm9kZV9vcHMuc3ltbGlua30sc3RyZWFtOntsbHNlZWs6TUVNRlMuc3RyZWFtX29wcy5sbHNlZWt9fSxmaWxlOntub2RlOntnZXRhdHRyOk1FTUZTLm5vZGVfb3BzLmdldGF0dHIsc2V0YXR0cjpNRU1GUy5ub2RlX29wcy5zZXRhdHRyfSxzdHJlYW06e2xsc2VlazpNRU1GUy5zdHJlYW1fb3BzLmxsc2VlayxyZWFkOk1FTUZTLnN0cmVhbV9vcHMucmVhZCx3cml0ZTpNRU1GUy5zdHJlYW1fb3BzLndyaXRlLGFsbG9jYXRlOk1FTUZTLnN0cmVhbV9vcHMuYWxsb2NhdGUsbW1hcDpNRU1GUy5zdHJlYW1fb3BzLm1tYXAsbXN5bmM6TUVNRlMuc3RyZWFtX29wcy5tc3luY319LGxpbms6e25vZGU6e2dldGF0dHI6TUVNRlMubm9kZV9vcHMuZ2V0YXR0cixzZXRhdHRyOk1FTUZTLm5vZGVfb3BzLnNldGF0dHIscmVhZGxpbms6TUVNRlMubm9kZV9vcHMucmVhZGxpbmt9LHN0cmVhbTp7fX0sY2hyZGV2Ontub2RlOntnZXRhdHRyOk1FTUZTLm5vZGVfb3BzLmdldGF0dHIsc2V0YXR0cjpNRU1GUy5ub2RlX29wcy5zZXRhdHRyfSxzdHJlYW06RlMuY2hyZGV2X3N0cmVhbV9vcHN9fX12YXIgbm9kZT1GUy5jcmVhdGVOb2RlKHBhcmVudCxuYW1lLG1vZGUsZGV2KTtpZihGUy5pc0Rpcihub2RlLm1vZGUpKXtub2RlLm5vZGVfb3BzPU1FTUZTLm9wc190YWJsZS5kaXIubm9kZTtub2RlLnN0cmVhbV9vcHM9TUVNRlMub3BzX3RhYmxlLmRpci5zdHJlYW07bm9kZS5jb250ZW50cz17fX1lbHNlIGlmKEZTLmlzRmlsZShub2RlLm1vZGUpKXtub2RlLm5vZGVfb3BzPU1FTUZTLm9wc190YWJsZS5maWxlLm5vZGU7bm9kZS5zdHJlYW1fb3BzPU1FTUZTLm9wc190YWJsZS5maWxlLnN0cmVhbTtub2RlLnVzZWRCeXRlcz0wO25vZGUuY29udGVudHM9bnVsbH1lbHNlIGlmKEZTLmlzTGluayhub2RlLm1vZGUpKXtub2RlLm5vZGVfb3BzPU1FTUZTLm9wc190YWJsZS5saW5rLm5vZGU7bm9kZS5zdHJlYW1fb3BzPU1FTUZTLm9wc190YWJsZS5saW5rLnN0cmVhbX1lbHNlIGlmKEZTLmlzQ2hyZGV2KG5vZGUubW9kZSkpe25vZGUubm9kZV9vcHM9TUVNRlMub3BzX3RhYmxlLmNocmRldi5ub2RlO25vZGUuc3RyZWFtX29wcz1NRU1GUy5vcHNfdGFibGUuY2hyZGV2LnN0cmVhbX1ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpO2lmKHBhcmVudCl7cGFyZW50LmNvbnRlbnRzW25hbWVdPW5vZGU7cGFyZW50LnRpbWVzdGFtcD1ub2RlLnRpbWVzdGFtcH1yZXR1cm4gbm9kZX0sZ2V0RmlsZURhdGFBc1R5cGVkQXJyYXk6ZnVuY3Rpb24obm9kZSl7aWYoIW5vZGUuY29udGVudHMpcmV0dXJuIG5ldyBVaW50OEFycmF5KDApO2lmKG5vZGUuY29udGVudHMuc3ViYXJyYXkpcmV0dXJuIG5vZGUuY29udGVudHMuc3ViYXJyYXkoMCxub2RlLnVzZWRCeXRlcyk7cmV0dXJuIG5ldyBVaW50OEFycmF5KG5vZGUuY29udGVudHMpfSxleHBhbmRGaWxlU3RvcmFnZTpmdW5jdGlvbihub2RlLG5ld0NhcGFjaXR5KXt2YXIgcHJldkNhcGFjaXR5PW5vZGUuY29udGVudHM/bm9kZS5jb250ZW50cy5sZW5ndGg6MDtpZihwcmV2Q2FwYWNpdHk+PW5ld0NhcGFjaXR5KXJldHVybjt2YXIgQ0FQQUNJVFlfRE9VQkxJTkdfTUFYPTEwMjQqMTAyNDtuZXdDYXBhY2l0eT1NYXRoLm1heChuZXdDYXBhY2l0eSxwcmV2Q2FwYWNpdHkqKHByZXZDYXBhY2l0eTxDQVBBQ0lUWV9ET1VCTElOR19NQVg/MjoxLjEyNSk+Pj4wKTtpZihwcmV2Q2FwYWNpdHkhPTApbmV3Q2FwYWNpdHk9TWF0aC5tYXgobmV3Q2FwYWNpdHksMjU2KTt2YXIgb2xkQ29udGVudHM9bm9kZS5jb250ZW50cztub2RlLmNvbnRlbnRzPW5ldyBVaW50OEFycmF5KG5ld0NhcGFjaXR5KTtpZihub2RlLnVzZWRCeXRlcz4wKW5vZGUuY29udGVudHMuc2V0KG9sZENvbnRlbnRzLnN1YmFycmF5KDAsbm9kZS51c2VkQnl0ZXMpLDApfSxyZXNpemVGaWxlU3RvcmFnZTpmdW5jdGlvbihub2RlLG5ld1NpemUpe2lmKG5vZGUudXNlZEJ5dGVzPT1uZXdTaXplKXJldHVybjtpZihuZXdTaXplPT0wKXtub2RlLmNvbnRlbnRzPW51bGw7bm9kZS51c2VkQnl0ZXM9MH1lbHNle3ZhciBvbGRDb250ZW50cz1ub2RlLmNvbnRlbnRzO25vZGUuY29udGVudHM9bmV3IFVpbnQ4QXJyYXkobmV3U2l6ZSk7aWYob2xkQ29udGVudHMpe25vZGUuY29udGVudHMuc2V0KG9sZENvbnRlbnRzLnN1YmFycmF5KDAsTWF0aC5taW4obmV3U2l6ZSxub2RlLnVzZWRCeXRlcykpKX1ub2RlLnVzZWRCeXRlcz1uZXdTaXplfX0sbm9kZV9vcHM6e2dldGF0dHI6ZnVuY3Rpb24obm9kZSl7dmFyIGF0dHI9e307YXR0ci5kZXY9RlMuaXNDaHJkZXYobm9kZS5tb2RlKT9ub2RlLmlkOjE7YXR0ci5pbm89bm9kZS5pZDthdHRyLm1vZGU9bm9kZS5tb2RlO2F0dHIubmxpbms9MTthdHRyLnVpZD0wO2F0dHIuZ2lkPTA7YXR0ci5yZGV2PW5vZGUucmRldjtpZihGUy5pc0Rpcihub2RlLm1vZGUpKXthdHRyLnNpemU9NDA5Nn1lbHNlIGlmKEZTLmlzRmlsZShub2RlLm1vZGUpKXthdHRyLnNpemU9bm9kZS51c2VkQnl0ZXN9ZWxzZSBpZihGUy5pc0xpbmsobm9kZS5tb2RlKSl7YXR0ci5zaXplPW5vZGUubGluay5sZW5ndGh9ZWxzZXthdHRyLnNpemU9MH1hdHRyLmF0aW1lPW5ldyBEYXRlKG5vZGUudGltZXN0YW1wKTthdHRyLm10aW1lPW5ldyBEYXRlKG5vZGUudGltZXN0YW1wKTthdHRyLmN0aW1lPW5ldyBEYXRlKG5vZGUudGltZXN0YW1wKTthdHRyLmJsa3NpemU9NDA5NjthdHRyLmJsb2Nrcz1NYXRoLmNlaWwoYXR0ci5zaXplL2F0dHIuYmxrc2l6ZSk7cmV0dXJuIGF0dHJ9LHNldGF0dHI6ZnVuY3Rpb24obm9kZSxhdHRyKXtpZihhdHRyLm1vZGUhPT11bmRlZmluZWQpe25vZGUubW9kZT1hdHRyLm1vZGV9aWYoYXR0ci50aW1lc3RhbXAhPT11bmRlZmluZWQpe25vZGUudGltZXN0YW1wPWF0dHIudGltZXN0YW1wfWlmKGF0dHIuc2l6ZSE9PXVuZGVmaW5lZCl7TUVNRlMucmVzaXplRmlsZVN0b3JhZ2Uobm9kZSxhdHRyLnNpemUpfX0sbG9va3VwOmZ1bmN0aW9uKHBhcmVudCxuYW1lKXt0aHJvdyBGUy5nZW5lcmljRXJyb3JzWzQ0XX0sbWtub2Q6ZnVuY3Rpb24ocGFyZW50LG5hbWUsbW9kZSxkZXYpe3JldHVybiBNRU1GUy5jcmVhdGVOb2RlKHBhcmVudCxuYW1lLG1vZGUsZGV2KX0scmVuYW1lOmZ1bmN0aW9uKG9sZF9ub2RlLG5ld19kaXIsbmV3X25hbWUpe2lmKEZTLmlzRGlyKG9sZF9ub2RlLm1vZGUpKXt2YXIgbmV3X25vZGU7dHJ5e25ld19ub2RlPUZTLmxvb2t1cE5vZGUobmV3X2RpcixuZXdfbmFtZSl9Y2F0Y2goZSl7fWlmKG5ld19ub2RlKXtmb3IodmFyIGkgaW4gbmV3X25vZGUuY29udGVudHMpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU1KX19fWRlbGV0ZSBvbGRfbm9kZS5wYXJlbnQuY29udGVudHNbb2xkX25vZGUubmFtZV07b2xkX25vZGUucGFyZW50LnRpbWVzdGFtcD1EYXRlLm5vdygpO29sZF9ub2RlLm5hbWU9bmV3X25hbWU7bmV3X2Rpci5jb250ZW50c1tuZXdfbmFtZV09b2xkX25vZGU7bmV3X2Rpci50aW1lc3RhbXA9b2xkX25vZGUucGFyZW50LnRpbWVzdGFtcDtvbGRfbm9kZS5wYXJlbnQ9bmV3X2Rpcn0sdW5saW5rOmZ1bmN0aW9uKHBhcmVudCxuYW1lKXtkZWxldGUgcGFyZW50LmNvbnRlbnRzW25hbWVdO3BhcmVudC50aW1lc3RhbXA9RGF0ZS5ub3coKX0scm1kaXI6ZnVuY3Rpb24ocGFyZW50LG5hbWUpe3ZhciBub2RlPUZTLmxvb2t1cE5vZGUocGFyZW50LG5hbWUpO2Zvcih2YXIgaSBpbiBub2RlLmNvbnRlbnRzKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NSl9ZGVsZXRlIHBhcmVudC5jb250ZW50c1tuYW1lXTtwYXJlbnQudGltZXN0YW1wPURhdGUubm93KCl9LHJlYWRkaXI6ZnVuY3Rpb24obm9kZSl7dmFyIGVudHJpZXM9WyIuIiwiLi4iXTtmb3IodmFyIGtleSBpbiBub2RlLmNvbnRlbnRzKXtpZighbm9kZS5jb250ZW50cy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtjb250aW51ZX1lbnRyaWVzLnB1c2goa2V5KX1yZXR1cm4gZW50cmllc30sc3ltbGluazpmdW5jdGlvbihwYXJlbnQsbmV3bmFtZSxvbGRwYXRoKXt2YXIgbm9kZT1NRU1GUy5jcmVhdGVOb2RlKHBhcmVudCxuZXduYW1lLDUxMXw0MDk2MCwwKTtub2RlLmxpbms9b2xkcGF0aDtyZXR1cm4gbm9kZX0scmVhZGxpbms6ZnVuY3Rpb24obm9kZSl7aWYoIUZTLmlzTGluayhub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9cmV0dXJuIG5vZGUubGlua319LHN0cmVhbV9vcHM6e3JlYWQ6ZnVuY3Rpb24oc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uKXt2YXIgY29udGVudHM9c3RyZWFtLm5vZGUuY29udGVudHM7aWYocG9zaXRpb24+PXN0cmVhbS5ub2RlLnVzZWRCeXRlcylyZXR1cm4gMDt2YXIgc2l6ZT1NYXRoLm1pbihzdHJlYW0ubm9kZS51c2VkQnl0ZXMtcG9zaXRpb24sbGVuZ3RoKTtpZihzaXplPjgmJmNvbnRlbnRzLnN1YmFycmF5KXtidWZmZXIuc2V0KGNvbnRlbnRzLnN1YmFycmF5KHBvc2l0aW9uLHBvc2l0aW9uK3NpemUpLG9mZnNldCl9ZWxzZXtmb3IodmFyIGk9MDtpPHNpemU7aSsrKWJ1ZmZlcltvZmZzZXQraV09Y29udGVudHNbcG9zaXRpb24raV19cmV0dXJuIHNpemV9LHdyaXRlOmZ1bmN0aW9uKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbixjYW5Pd24pe2lmKGJ1ZmZlci5idWZmZXI9PT1IRUFQOC5idWZmZXIpe2Nhbk93bj1mYWxzZX1pZighbGVuZ3RoKXJldHVybiAwO3ZhciBub2RlPXN0cmVhbS5ub2RlO25vZGUudGltZXN0YW1wPURhdGUubm93KCk7aWYoYnVmZmVyLnN1YmFycmF5JiYoIW5vZGUuY29udGVudHN8fG5vZGUuY29udGVudHMuc3ViYXJyYXkpKXtpZihjYW5Pd24pe25vZGUuY29udGVudHM9YnVmZmVyLnN1YmFycmF5KG9mZnNldCxvZmZzZXQrbGVuZ3RoKTtub2RlLnVzZWRCeXRlcz1sZW5ndGg7cmV0dXJuIGxlbmd0aH1lbHNlIGlmKG5vZGUudXNlZEJ5dGVzPT09MCYmcG9zaXRpb249PT0wKXtub2RlLmNvbnRlbnRzPWJ1ZmZlci5zbGljZShvZmZzZXQsb2Zmc2V0K2xlbmd0aCk7bm9kZS51c2VkQnl0ZXM9bGVuZ3RoO3JldHVybiBsZW5ndGh9ZWxzZSBpZihwb3NpdGlvbitsZW5ndGg8PW5vZGUudXNlZEJ5dGVzKXtub2RlLmNvbnRlbnRzLnNldChidWZmZXIuc3ViYXJyYXkob2Zmc2V0LG9mZnNldCtsZW5ndGgpLHBvc2l0aW9uKTtyZXR1cm4gbGVuZ3RofX1NRU1GUy5leHBhbmRGaWxlU3RvcmFnZShub2RlLHBvc2l0aW9uK2xlbmd0aCk7aWYobm9kZS5jb250ZW50cy5zdWJhcnJheSYmYnVmZmVyLnN1YmFycmF5KXtub2RlLmNvbnRlbnRzLnNldChidWZmZXIuc3ViYXJyYXkob2Zmc2V0LG9mZnNldCtsZW5ndGgpLHBvc2l0aW9uKX1lbHNle2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7bm9kZS5jb250ZW50c1twb3NpdGlvbitpXT1idWZmZXJbb2Zmc2V0K2ldfX1ub2RlLnVzZWRCeXRlcz1NYXRoLm1heChub2RlLnVzZWRCeXRlcyxwb3NpdGlvbitsZW5ndGgpO3JldHVybiBsZW5ndGh9LGxsc2VlazpmdW5jdGlvbihzdHJlYW0sb2Zmc2V0LHdoZW5jZSl7dmFyIHBvc2l0aW9uPW9mZnNldDtpZih3aGVuY2U9PT0xKXtwb3NpdGlvbis9c3RyZWFtLnBvc2l0aW9ufWVsc2UgaWYod2hlbmNlPT09Mil7aWYoRlMuaXNGaWxlKHN0cmVhbS5ub2RlLm1vZGUpKXtwb3NpdGlvbis9c3RyZWFtLm5vZGUudXNlZEJ5dGVzfX1pZihwb3NpdGlvbjwwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9cmV0dXJuIHBvc2l0aW9ufSxhbGxvY2F0ZTpmdW5jdGlvbihzdHJlYW0sb2Zmc2V0LGxlbmd0aCl7TUVNRlMuZXhwYW5kRmlsZVN0b3JhZ2Uoc3RyZWFtLm5vZGUsb2Zmc2V0K2xlbmd0aCk7c3RyZWFtLm5vZGUudXNlZEJ5dGVzPU1hdGgubWF4KHN0cmVhbS5ub2RlLnVzZWRCeXRlcyxvZmZzZXQrbGVuZ3RoKX0sbW1hcDpmdW5jdGlvbihzdHJlYW0sYWRkcmVzcyxsZW5ndGgscG9zaXRpb24scHJvdCxmbGFncyl7aWYoYWRkcmVzcyE9PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZighRlMuaXNGaWxlKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9dmFyIHB0cjt2YXIgYWxsb2NhdGVkO3ZhciBjb250ZW50cz1zdHJlYW0ubm9kZS5jb250ZW50cztpZighKGZsYWdzJjIpJiZjb250ZW50cy5idWZmZXI9PT1idWZmZXIpe2FsbG9jYXRlZD1mYWxzZTtwdHI9Y29udGVudHMuYnl0ZU9mZnNldH1lbHNle2lmKHBvc2l0aW9uPjB8fHBvc2l0aW9uK2xlbmd0aDxjb250ZW50cy5sZW5ndGgpe2lmKGNvbnRlbnRzLnN1YmFycmF5KXtjb250ZW50cz1jb250ZW50cy5zdWJhcnJheShwb3NpdGlvbixwb3NpdGlvbitsZW5ndGgpfWVsc2V7Y29udGVudHM9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY29udGVudHMscG9zaXRpb24scG9zaXRpb24rbGVuZ3RoKX19YWxsb2NhdGVkPXRydWU7cHRyPW1tYXBBbGxvYyhsZW5ndGgpO2lmKCFwdHIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ4KX1IRUFQOC5zZXQoY29udGVudHMscHRyKX1yZXR1cm57cHRyOnB0cixhbGxvY2F0ZWQ6YWxsb2NhdGVkfX0sbXN5bmM6ZnVuY3Rpb24oc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLG1tYXBGbGFncyl7aWYoIUZTLmlzRmlsZShzdHJlYW0ubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfWlmKG1tYXBGbGFncyYyKXtyZXR1cm4gMH12YXIgYnl0ZXNXcml0dGVuPU1FTUZTLnN0cmVhbV9vcHMud3JpdGUoc3RyZWFtLGJ1ZmZlciwwLGxlbmd0aCxvZmZzZXQsZmFsc2UpO3JldHVybiAwfX19O2Z1bmN0aW9uIGFzeW5jTG9hZCh1cmwsb25sb2FkLG9uZXJyb3Isbm9SdW5EZXApe3ZhciBkZXA9IW5vUnVuRGVwP2dldFVuaXF1ZVJ1bkRlcGVuZGVuY3koImFsICIrdXJsKToiIjtyZWFkQXN5bmModXJsLGZ1bmN0aW9uKGFycmF5QnVmZmVyKXthc3NlcnQoYXJyYXlCdWZmZXIsJ0xvYWRpbmcgZGF0YSBmaWxlICInK3VybCsnIiBmYWlsZWQgKG5vIGFycmF5QnVmZmVyKS4nKTtvbmxvYWQobmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpKTtpZihkZXApcmVtb3ZlUnVuRGVwZW5kZW5jeShkZXApfSxmdW5jdGlvbihldmVudCl7aWYob25lcnJvcil7b25lcnJvcigpfWVsc2V7dGhyb3cnTG9hZGluZyBkYXRhIGZpbGUgIicrdXJsKyciIGZhaWxlZC4nfX0pO2lmKGRlcClhZGRSdW5EZXBlbmRlbmN5KGRlcCl9dmFyIEZTPXtyb290Om51bGwsbW91bnRzOltdLGRldmljZXM6e30sc3RyZWFtczpbXSxuZXh0SW5vZGU6MSxuYW1lVGFibGU6bnVsbCxjdXJyZW50UGF0aDoiLyIsaW5pdGlhbGl6ZWQ6ZmFsc2UsaWdub3JlUGVybWlzc2lvbnM6dHJ1ZSxFcnJub0Vycm9yOm51bGwsZ2VuZXJpY0Vycm9yczp7fSxmaWxlc3lzdGVtczpudWxsLHN5bmNGU1JlcXVlc3RzOjAsbG9va3VwUGF0aDoocGF0aCxvcHRzPXt9KT0+e3BhdGg9UEFUSF9GUy5yZXNvbHZlKEZTLmN3ZCgpLHBhdGgpO2lmKCFwYXRoKXJldHVybntwYXRoOiIiLG5vZGU6bnVsbH07dmFyIGRlZmF1bHRzPXtmb2xsb3dfbW91bnQ6dHJ1ZSxyZWN1cnNlX2NvdW50OjB9O29wdHM9T2JqZWN0LmFzc2lnbihkZWZhdWx0cyxvcHRzKTtpZihvcHRzLnJlY3Vyc2VfY291bnQ+OCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzIpfXZhciBwYXJ0cz1QQVRILm5vcm1hbGl6ZUFycmF5KHBhdGguc3BsaXQoIi8iKS5maWx0ZXIocD0+ISFwKSxmYWxzZSk7dmFyIGN1cnJlbnQ9RlMucm9vdDt2YXIgY3VycmVudF9wYXRoPSIvIjtmb3IodmFyIGk9MDtpPHBhcnRzLmxlbmd0aDtpKyspe3ZhciBpc2xhc3Q9aT09PXBhcnRzLmxlbmd0aC0xO2lmKGlzbGFzdCYmb3B0cy5wYXJlbnQpe2JyZWFrfWN1cnJlbnQ9RlMubG9va3VwTm9kZShjdXJyZW50LHBhcnRzW2ldKTtjdXJyZW50X3BhdGg9UEFUSC5qb2luMihjdXJyZW50X3BhdGgscGFydHNbaV0pO2lmKEZTLmlzTW91bnRwb2ludChjdXJyZW50KSl7aWYoIWlzbGFzdHx8aXNsYXN0JiZvcHRzLmZvbGxvd19tb3VudCl7Y3VycmVudD1jdXJyZW50Lm1vdW50ZWQucm9vdH19aWYoIWlzbGFzdHx8b3B0cy5mb2xsb3cpe3ZhciBjb3VudD0wO3doaWxlKEZTLmlzTGluayhjdXJyZW50Lm1vZGUpKXt2YXIgbGluaz1GUy5yZWFkbGluayhjdXJyZW50X3BhdGgpO2N1cnJlbnRfcGF0aD1QQVRIX0ZTLnJlc29sdmUoUEFUSC5kaXJuYW1lKGN1cnJlbnRfcGF0aCksbGluayk7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKGN1cnJlbnRfcGF0aCx7cmVjdXJzZV9jb3VudDpvcHRzLnJlY3Vyc2VfY291bnQrMX0pO2N1cnJlbnQ9bG9va3VwLm5vZGU7aWYoY291bnQrKz40MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzIpfX19fXJldHVybntwYXRoOmN1cnJlbnRfcGF0aCxub2RlOmN1cnJlbnR9fSxnZXRQYXRoOm5vZGU9Pnt2YXIgcGF0aDt3aGlsZSh0cnVlKXtpZihGUy5pc1Jvb3Qobm9kZSkpe3ZhciBtb3VudD1ub2RlLm1vdW50Lm1vdW50cG9pbnQ7aWYoIXBhdGgpcmV0dXJuIG1vdW50O3JldHVybiBtb3VudFttb3VudC5sZW5ndGgtMV0hPT0iLyI/bW91bnQrIi8iK3BhdGg6bW91bnQrcGF0aH1wYXRoPXBhdGg/bm9kZS5uYW1lKyIvIitwYXRoOm5vZGUubmFtZTtub2RlPW5vZGUucGFyZW50fX0saGFzaE5hbWU6KHBhcmVudGlkLG5hbWUpPT57dmFyIGhhc2g9MDtmb3IodmFyIGk9MDtpPG5hbWUubGVuZ3RoO2krKyl7aGFzaD0oaGFzaDw8NSktaGFzaCtuYW1lLmNoYXJDb2RlQXQoaSl8MH1yZXR1cm4ocGFyZW50aWQraGFzaD4+PjApJUZTLm5hbWVUYWJsZS5sZW5ndGh9LGhhc2hBZGROb2RlOm5vZGU9Pnt2YXIgaGFzaD1GUy5oYXNoTmFtZShub2RlLnBhcmVudC5pZCxub2RlLm5hbWUpO25vZGUubmFtZV9uZXh0PUZTLm5hbWVUYWJsZVtoYXNoXTtGUy5uYW1lVGFibGVbaGFzaF09bm9kZX0saGFzaFJlbW92ZU5vZGU6bm9kZT0+e3ZhciBoYXNoPUZTLmhhc2hOYW1lKG5vZGUucGFyZW50LmlkLG5vZGUubmFtZSk7aWYoRlMubmFtZVRhYmxlW2hhc2hdPT09bm9kZSl7RlMubmFtZVRhYmxlW2hhc2hdPW5vZGUubmFtZV9uZXh0fWVsc2V7dmFyIGN1cnJlbnQ9RlMubmFtZVRhYmxlW2hhc2hdO3doaWxlKGN1cnJlbnQpe2lmKGN1cnJlbnQubmFtZV9uZXh0PT09bm9kZSl7Y3VycmVudC5uYW1lX25leHQ9bm9kZS5uYW1lX25leHQ7YnJlYWt9Y3VycmVudD1jdXJyZW50Lm5hbWVfbmV4dH19fSxsb29rdXBOb2RlOihwYXJlbnQsbmFtZSk9Pnt2YXIgZXJyQ29kZT1GUy5tYXlMb29rdXAocGFyZW50KTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlLHBhcmVudCl9dmFyIGhhc2g9RlMuaGFzaE5hbWUocGFyZW50LmlkLG5hbWUpO2Zvcih2YXIgbm9kZT1GUy5uYW1lVGFibGVbaGFzaF07bm9kZTtub2RlPW5vZGUubmFtZV9uZXh0KXt2YXIgbm9kZU5hbWU9bm9kZS5uYW1lO2lmKG5vZGUucGFyZW50LmlkPT09cGFyZW50LmlkJiZub2RlTmFtZT09PW5hbWUpe3JldHVybiBub2RlfX1yZXR1cm4gRlMubG9va3VwKHBhcmVudCxuYW1lKX0sY3JlYXRlTm9kZToocGFyZW50LG5hbWUsbW9kZSxyZGV2KT0+e3ZhciBub2RlPW5ldyBGUy5GU05vZGUocGFyZW50LG5hbWUsbW9kZSxyZGV2KTtGUy5oYXNoQWRkTm9kZShub2RlKTtyZXR1cm4gbm9kZX0sZGVzdHJveU5vZGU6bm9kZT0+e0ZTLmhhc2hSZW1vdmVOb2RlKG5vZGUpfSxpc1Jvb3Q6bm9kZT0+e3JldHVybiBub2RlPT09bm9kZS5wYXJlbnR9LGlzTW91bnRwb2ludDpub2RlPT57cmV0dXJuISFub2RlLm1vdW50ZWR9LGlzRmlsZTptb2RlPT57cmV0dXJuKG1vZGUmNjE0NDApPT09MzI3Njh9LGlzRGlyOm1vZGU9PntyZXR1cm4obW9kZSY2MTQ0MCk9PT0xNjM4NH0saXNMaW5rOm1vZGU9PntyZXR1cm4obW9kZSY2MTQ0MCk9PT00MDk2MH0saXNDaHJkZXY6bW9kZT0+e3JldHVybihtb2RlJjYxNDQwKT09PTgxOTJ9LGlzQmxrZGV2Om1vZGU9PntyZXR1cm4obW9kZSY2MTQ0MCk9PT0yNDU3Nn0saXNGSUZPOm1vZGU9PntyZXR1cm4obW9kZSY2MTQ0MCk9PT00MDk2fSxpc1NvY2tldDptb2RlPT57cmV0dXJuKG1vZGUmNDkxNTIpPT09NDkxNTJ9LGZsYWdNb2Rlczp7InIiOjAsInIrIjoyLCJ3Ijo1NzcsIncrIjo1NzgsImEiOjEwODksImErIjoxMDkwfSxtb2RlU3RyaW5nVG9GbGFnczpzdHI9Pnt2YXIgZmxhZ3M9RlMuZmxhZ01vZGVzW3N0cl07aWYodHlwZW9mIGZsYWdzPT0idW5kZWZpbmVkIil7dGhyb3cgbmV3IEVycm9yKCJVbmtub3duIGZpbGUgb3BlbiBtb2RlOiAiK3N0cil9cmV0dXJuIGZsYWdzfSxmbGFnc1RvUGVybWlzc2lvblN0cmluZzpmbGFnPT57dmFyIHBlcm1zPVsiciIsInciLCJydyJdW2ZsYWcmM107aWYoZmxhZyY1MTIpe3Blcm1zKz0idyJ9cmV0dXJuIHBlcm1zfSxub2RlUGVybWlzc2lvbnM6KG5vZGUscGVybXMpPT57aWYoRlMuaWdub3JlUGVybWlzc2lvbnMpe3JldHVybiAwfWlmKHBlcm1zLmluY2x1ZGVzKCJyIikmJiEobm9kZS5tb2RlJjI5Mikpe3JldHVybiAyfWVsc2UgaWYocGVybXMuaW5jbHVkZXMoInciKSYmIShub2RlLm1vZGUmMTQ2KSl7cmV0dXJuIDJ9ZWxzZSBpZihwZXJtcy5pbmNsdWRlcygieCIpJiYhKG5vZGUubW9kZSY3Mykpe3JldHVybiAyfXJldHVybiAwfSxtYXlMb29rdXA6ZGlyPT57dmFyIGVyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKGRpciwieCIpO2lmKGVyckNvZGUpcmV0dXJuIGVyckNvZGU7aWYoIWRpci5ub2RlX29wcy5sb29rdXApcmV0dXJuIDI7cmV0dXJuIDB9LG1heUNyZWF0ZTooZGlyLG5hbWUpPT57dHJ5e3ZhciBub2RlPUZTLmxvb2t1cE5vZGUoZGlyLG5hbWUpO3JldHVybiAyMH1jYXRjaChlKXt9cmV0dXJuIEZTLm5vZGVQZXJtaXNzaW9ucyhkaXIsInd4Iil9LG1heURlbGV0ZTooZGlyLG5hbWUsaXNkaXIpPT57dmFyIG5vZGU7dHJ5e25vZGU9RlMubG9va3VwTm9kZShkaXIsbmFtZSl9Y2F0Y2goZSl7cmV0dXJuIGUuZXJybm99dmFyIGVyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKGRpciwid3giKTtpZihlcnJDb2RlKXtyZXR1cm4gZXJyQ29kZX1pZihpc2Rpcil7aWYoIUZTLmlzRGlyKG5vZGUubW9kZSkpe3JldHVybiA1NH1pZihGUy5pc1Jvb3Qobm9kZSl8fEZTLmdldFBhdGgobm9kZSk9PT1GUy5jd2QoKSl7cmV0dXJuIDEwfX1lbHNle2lmKEZTLmlzRGlyKG5vZGUubW9kZSkpe3JldHVybiAzMX19cmV0dXJuIDB9LG1heU9wZW46KG5vZGUsZmxhZ3MpPT57aWYoIW5vZGUpe3JldHVybiA0NH1pZihGUy5pc0xpbmsobm9kZS5tb2RlKSl7cmV0dXJuIDMyfWVsc2UgaWYoRlMuaXNEaXIobm9kZS5tb2RlKSl7aWYoRlMuZmxhZ3NUb1Blcm1pc3Npb25TdHJpbmcoZmxhZ3MpIT09InIifHxmbGFncyY1MTIpe3JldHVybiAzMX19cmV0dXJuIEZTLm5vZGVQZXJtaXNzaW9ucyhub2RlLEZTLmZsYWdzVG9QZXJtaXNzaW9uU3RyaW5nKGZsYWdzKSl9LE1BWF9PUEVOX0ZEUzo0MDk2LG5leHRmZDooZmRfc3RhcnQ9MCxmZF9lbmQ9RlMuTUFYX09QRU5fRkRTKT0+e2Zvcih2YXIgZmQ9ZmRfc3RhcnQ7ZmQ8PWZkX2VuZDtmZCsrKXtpZighRlMuc3RyZWFtc1tmZF0pe3JldHVybiBmZH19dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzMpfSxnZXRTdHJlYW06ZmQ9PkZTLnN0cmVhbXNbZmRdLGNyZWF0ZVN0cmVhbTooc3RyZWFtLGZkX3N0YXJ0LGZkX2VuZCk9PntpZighRlMuRlNTdHJlYW0pe0ZTLkZTU3RyZWFtPWZ1bmN0aW9uKCl7dGhpcy5zaGFyZWQ9e319O0ZTLkZTU3RyZWFtLnByb3RvdHlwZT17b2JqZWN0OntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ub2RlfSxzZXQ6ZnVuY3Rpb24odmFsKXt0aGlzLm5vZGU9dmFsfX0saXNSZWFkOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy5mbGFncyYyMDk3MTU1KSE9PTF9fSxpc1dyaXRlOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy5mbGFncyYyMDk3MTU1KSE9PTB9fSxpc0FwcGVuZDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZmxhZ3MmMTAyNH19LGZsYWdzOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zaGFyZWQuZmxhZ3N9LHNldDpmdW5jdGlvbih2YWwpe3RoaXMuc2hhcmVkLmZsYWdzPXZhbH19LHBvc2l0aW9uOntnZXQgZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zaGFyZWQucG9zaXRpb259LHNldDpmdW5jdGlvbih2YWwpe3RoaXMuc2hhcmVkLnBvc2l0aW9uPXZhbH19fX1zdHJlYW09T2JqZWN0LmFzc2lnbihuZXcgRlMuRlNTdHJlYW0sc3RyZWFtKTt2YXIgZmQ9RlMubmV4dGZkKGZkX3N0YXJ0LGZkX2VuZCk7c3RyZWFtLmZkPWZkO0ZTLnN0cmVhbXNbZmRdPXN0cmVhbTtyZXR1cm4gc3RyZWFtfSxjbG9zZVN0cmVhbTpmZD0+e0ZTLnN0cmVhbXNbZmRdPW51bGx9LGNocmRldl9zdHJlYW1fb3BzOntvcGVuOnN0cmVhbT0+e3ZhciBkZXZpY2U9RlMuZ2V0RGV2aWNlKHN0cmVhbS5ub2RlLnJkZXYpO3N0cmVhbS5zdHJlYW1fb3BzPWRldmljZS5zdHJlYW1fb3BzO2lmKHN0cmVhbS5zdHJlYW1fb3BzLm9wZW4pe3N0cmVhbS5zdHJlYW1fb3BzLm9wZW4oc3RyZWFtKX19LGxsc2VlazooKT0+e3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDcwKX19LG1ham9yOmRldj0+ZGV2Pj44LG1pbm9yOmRldj0+ZGV2JjI1NSxtYWtlZGV2OihtYSxtaSk9Pm1hPDw4fG1pLHJlZ2lzdGVyRGV2aWNlOihkZXYsb3BzKT0+e0ZTLmRldmljZXNbZGV2XT17c3RyZWFtX29wczpvcHN9fSxnZXREZXZpY2U6ZGV2PT5GUy5kZXZpY2VzW2Rldl0sZ2V0TW91bnRzOm1vdW50PT57dmFyIG1vdW50cz1bXTt2YXIgY2hlY2s9W21vdW50XTt3aGlsZShjaGVjay5sZW5ndGgpe3ZhciBtPWNoZWNrLnBvcCgpO21vdW50cy5wdXNoKG0pO2NoZWNrLnB1c2guYXBwbHkoY2hlY2ssbS5tb3VudHMpfXJldHVybiBtb3VudHN9LHN5bmNmczoocG9wdWxhdGUsY2FsbGJhY2spPT57aWYodHlwZW9mIHBvcHVsYXRlPT0iZnVuY3Rpb24iKXtjYWxsYmFjaz1wb3B1bGF0ZTtwb3B1bGF0ZT1mYWxzZX1GUy5zeW5jRlNSZXF1ZXN0cysrO2lmKEZTLnN5bmNGU1JlcXVlc3RzPjEpe2Vycigid2FybmluZzogIitGUy5zeW5jRlNSZXF1ZXN0cysiIEZTLnN5bmNmcyBvcGVyYXRpb25zIGluIGZsaWdodCBhdCBvbmNlLCBwcm9iYWJseSBqdXN0IGRvaW5nIGV4dHJhIHdvcmsiKX12YXIgbW91bnRzPUZTLmdldE1vdW50cyhGUy5yb290Lm1vdW50KTt2YXIgY29tcGxldGVkPTA7ZnVuY3Rpb24gZG9DYWxsYmFjayhlcnJDb2RlKXtGUy5zeW5jRlNSZXF1ZXN0cy0tO3JldHVybiBjYWxsYmFjayhlcnJDb2RlKX1mdW5jdGlvbiBkb25lKGVyckNvZGUpe2lmKGVyckNvZGUpe2lmKCFkb25lLmVycm9yZWQpe2RvbmUuZXJyb3JlZD10cnVlO3JldHVybiBkb0NhbGxiYWNrKGVyckNvZGUpfXJldHVybn1pZigrK2NvbXBsZXRlZD49bW91bnRzLmxlbmd0aCl7ZG9DYWxsYmFjayhudWxsKX19bW91bnRzLmZvckVhY2gobW91bnQ9PntpZighbW91bnQudHlwZS5zeW5jZnMpe3JldHVybiBkb25lKG51bGwpfW1vdW50LnR5cGUuc3luY2ZzKG1vdW50LHBvcHVsYXRlLGRvbmUpfSl9LG1vdW50Oih0eXBlLG9wdHMsbW91bnRwb2ludCk9Pnt2YXIgcm9vdD1tb3VudHBvaW50PT09Ii8iO3ZhciBwc2V1ZG89IW1vdW50cG9pbnQ7dmFyIG5vZGU7aWYocm9vdCYmRlMucm9vdCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTApfWVsc2UgaWYoIXJvb3QmJiFwc2V1ZG8pe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChtb3VudHBvaW50LHtmb2xsb3dfbW91bnQ6ZmFsc2V9KTttb3VudHBvaW50PWxvb2t1cC5wYXRoO25vZGU9bG9va3VwLm5vZGU7aWYoRlMuaXNNb3VudHBvaW50KG5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9aWYoIUZTLmlzRGlyKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU0KX19dmFyIG1vdW50PXt0eXBlOnR5cGUsb3B0czpvcHRzLG1vdW50cG9pbnQ6bW91bnRwb2ludCxtb3VudHM6W119O3ZhciBtb3VudFJvb3Q9dHlwZS5tb3VudChtb3VudCk7bW91bnRSb290Lm1vdW50PW1vdW50O21vdW50LnJvb3Q9bW91bnRSb290O2lmKHJvb3Qpe0ZTLnJvb3Q9bW91bnRSb290fWVsc2UgaWYobm9kZSl7bm9kZS5tb3VudGVkPW1vdW50O2lmKG5vZGUubW91bnQpe25vZGUubW91bnQubW91bnRzLnB1c2gobW91bnQpfX1yZXR1cm4gbW91bnRSb290fSx1bm1vdW50Om1vdW50cG9pbnQ9Pnt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgobW91bnRwb2ludCx7Zm9sbG93X21vdW50OmZhbHNlfSk7aWYoIUZTLmlzTW91bnRwb2ludChsb29rdXAubm9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgbm9kZT1sb29rdXAubm9kZTt2YXIgbW91bnQ9bm9kZS5tb3VudGVkO3ZhciBtb3VudHM9RlMuZ2V0TW91bnRzKG1vdW50KTtPYmplY3Qua2V5cyhGUy5uYW1lVGFibGUpLmZvckVhY2goaGFzaD0+e3ZhciBjdXJyZW50PUZTLm5hbWVUYWJsZVtoYXNoXTt3aGlsZShjdXJyZW50KXt2YXIgbmV4dD1jdXJyZW50Lm5hbWVfbmV4dDtpZihtb3VudHMuaW5jbHVkZXMoY3VycmVudC5tb3VudCkpe0ZTLmRlc3Ryb3lOb2RlKGN1cnJlbnQpfWN1cnJlbnQ9bmV4dH19KTtub2RlLm1vdW50ZWQ9bnVsbDt2YXIgaWR4PW5vZGUubW91bnQubW91bnRzLmluZGV4T2YobW91bnQpO25vZGUubW91bnQubW91bnRzLnNwbGljZShpZHgsMSl9LGxvb2t1cDoocGFyZW50LG5hbWUpPT57cmV0dXJuIHBhcmVudC5ub2RlX29wcy5sb29rdXAocGFyZW50LG5hbWUpfSxta25vZDoocGF0aCxtb2RlLGRldik9Pnt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7cGFyZW50OnRydWV9KTt2YXIgcGFyZW50PWxvb2t1cC5ub2RlO3ZhciBuYW1lPVBBVEguYmFzZW5hbWUocGF0aCk7aWYoIW5hbWV8fG5hbWU9PT0iLiJ8fG5hbWU9PT0iLi4iKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9dmFyIGVyckNvZGU9RlMubWF5Q3JlYXRlKHBhcmVudCxuYW1lKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1pZighcGFyZW50Lm5vZGVfb3BzLm1rbm9kKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9cmV0dXJuIHBhcmVudC5ub2RlX29wcy5ta25vZChwYXJlbnQsbmFtZSxtb2RlLGRldil9LGNyZWF0ZToocGF0aCxtb2RlKT0+e21vZGU9bW9kZSE9PXVuZGVmaW5lZD9tb2RlOjQzODttb2RlJj00MDk1O21vZGV8PTMyNzY4O3JldHVybiBGUy5ta25vZChwYXRoLG1vZGUsMCl9LG1rZGlyOihwYXRoLG1vZGUpPT57bW9kZT1tb2RlIT09dW5kZWZpbmVkP21vZGU6NTExO21vZGUmPTUxMXw1MTI7bW9kZXw9MTYzODQ7cmV0dXJuIEZTLm1rbm9kKHBhdGgsbW9kZSwwKX0sbWtkaXJUcmVlOihwYXRoLG1vZGUpPT57dmFyIGRpcnM9cGF0aC5zcGxpdCgiLyIpO3ZhciBkPSIiO2Zvcih2YXIgaT0wO2k8ZGlycy5sZW5ndGg7KytpKXtpZighZGlyc1tpXSljb250aW51ZTtkKz0iLyIrZGlyc1tpXTt0cnl7RlMubWtkaXIoZCxtb2RlKX1jYXRjaChlKXtpZihlLmVycm5vIT0yMCl0aHJvdyBlfX19LG1rZGV2OihwYXRoLG1vZGUsZGV2KT0+e2lmKHR5cGVvZiBkZXY9PSJ1bmRlZmluZWQiKXtkZXY9bW9kZTttb2RlPTQzOH1tb2RlfD04MTkyO3JldHVybiBGUy5ta25vZChwYXRoLG1vZGUsZGV2KX0sc3ltbGluazoob2xkcGF0aCxuZXdwYXRoKT0+e2lmKCFQQVRIX0ZTLnJlc29sdmUob2xkcGF0aCkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX12YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgobmV3cGF0aCx7cGFyZW50OnRydWV9KTt2YXIgcGFyZW50PWxvb2t1cC5ub2RlO2lmKCFwYXJlbnQpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX12YXIgbmV3bmFtZT1QQVRILmJhc2VuYW1lKG5ld3BhdGgpO3ZhciBlcnJDb2RlPUZTLm1heUNyZWF0ZShwYXJlbnQsbmV3bmFtZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIXBhcmVudC5ub2RlX29wcy5zeW1saW5rKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9cmV0dXJuIHBhcmVudC5ub2RlX29wcy5zeW1saW5rKHBhcmVudCxuZXduYW1lLG9sZHBhdGgpfSxyZW5hbWU6KG9sZF9wYXRoLG5ld19wYXRoKT0+e3ZhciBvbGRfZGlybmFtZT1QQVRILmRpcm5hbWUob2xkX3BhdGgpO3ZhciBuZXdfZGlybmFtZT1QQVRILmRpcm5hbWUobmV3X3BhdGgpO3ZhciBvbGRfbmFtZT1QQVRILmJhc2VuYW1lKG9sZF9wYXRoKTt2YXIgbmV3X25hbWU9UEFUSC5iYXNlbmFtZShuZXdfcGF0aCk7dmFyIGxvb2t1cCxvbGRfZGlyLG5ld19kaXI7bG9va3VwPUZTLmxvb2t1cFBhdGgob2xkX3BhdGgse3BhcmVudDp0cnVlfSk7b2xkX2Rpcj1sb29rdXAubm9kZTtsb29rdXA9RlMubG9va3VwUGF0aChuZXdfcGF0aCx7cGFyZW50OnRydWV9KTtuZXdfZGlyPWxvb2t1cC5ub2RlO2lmKCFvbGRfZGlyfHwhbmV3X2Rpcil0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCk7aWYob2xkX2Rpci5tb3VudCE9PW5ld19kaXIubW91bnQpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDc1KX12YXIgb2xkX25vZGU9RlMubG9va3VwTm9kZShvbGRfZGlyLG9sZF9uYW1lKTt2YXIgcmVsYXRpdmU9UEFUSF9GUy5yZWxhdGl2ZShvbGRfcGF0aCxuZXdfZGlybmFtZSk7aWYocmVsYXRpdmUuY2hhckF0KDApIT09Ii4iKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9cmVsYXRpdmU9UEFUSF9GUy5yZWxhdGl2ZShuZXdfcGF0aCxvbGRfZGlybmFtZSk7aWYocmVsYXRpdmUuY2hhckF0KDApIT09Ii4iKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NSl9dmFyIG5ld19ub2RlO3RyeXtuZXdfbm9kZT1GUy5sb29rdXBOb2RlKG5ld19kaXIsbmV3X25hbWUpfWNhdGNoKGUpe31pZihvbGRfbm9kZT09PW5ld19ub2RlKXtyZXR1cm59dmFyIGlzZGlyPUZTLmlzRGlyKG9sZF9ub2RlLm1vZGUpO3ZhciBlcnJDb2RlPUZTLm1heURlbGV0ZShvbGRfZGlyLG9sZF9uYW1lLGlzZGlyKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1lcnJDb2RlPW5ld19ub2RlP0ZTLm1heURlbGV0ZShuZXdfZGlyLG5ld19uYW1lLGlzZGlyKTpGUy5tYXlDcmVhdGUobmV3X2RpcixuZXdfbmFtZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIW9sZF9kaXIubm9kZV9vcHMucmVuYW1lKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNNb3VudHBvaW50KG9sZF9ub2RlKXx8bmV3X25vZGUmJkZTLmlzTW91bnRwb2ludChuZXdfbm9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDEwKX1pZihuZXdfZGlyIT09b2xkX2Rpcil7ZXJyQ29kZT1GUy5ub2RlUGVybWlzc2lvbnMob2xkX2RpciwidyIpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfX1GUy5oYXNoUmVtb3ZlTm9kZShvbGRfbm9kZSk7dHJ5e29sZF9kaXIubm9kZV9vcHMucmVuYW1lKG9sZF9ub2RlLG5ld19kaXIsbmV3X25hbWUpfWNhdGNoKGUpe3Rocm93IGV9ZmluYWxseXtGUy5oYXNoQWRkTm9kZShvbGRfbm9kZSl9fSxybWRpcjpwYXRoPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTt2YXIgbmFtZT1QQVRILmJhc2VuYW1lKHBhdGgpO3ZhciBub2RlPUZTLmxvb2t1cE5vZGUocGFyZW50LG5hbWUpO3ZhciBlcnJDb2RlPUZTLm1heURlbGV0ZShwYXJlbnQsbmFtZSx0cnVlKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1pZighcGFyZW50Lm5vZGVfb3BzLnJtZGlyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNNb3VudHBvaW50KG5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9cGFyZW50Lm5vZGVfb3BzLnJtZGlyKHBhcmVudCxuYW1lKTtGUy5kZXN0cm95Tm9kZShub2RlKX0scmVhZGRpcjpwYXRoPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzp0cnVlfSk7dmFyIG5vZGU9bG9va3VwLm5vZGU7aWYoIW5vZGUubm9kZV9vcHMucmVhZGRpcil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTQpfXJldHVybiBub2RlLm5vZGVfb3BzLnJlYWRkaXIobm9kZSl9LHVubGluazpwYXRoPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTtpZighcGFyZW50KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9dmFyIG5hbWU9UEFUSC5iYXNlbmFtZShwYXRoKTt2YXIgbm9kZT1GUy5sb29rdXBOb2RlKHBhcmVudCxuYW1lKTt2YXIgZXJyQ29kZT1GUy5tYXlEZWxldGUocGFyZW50LG5hbWUsZmFsc2UpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfWlmKCFwYXJlbnQubm9kZV9vcHMudW5saW5rKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNNb3VudHBvaW50KG5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9cGFyZW50Lm5vZGVfb3BzLnVubGluayhwYXJlbnQsbmFtZSk7RlMuZGVzdHJveU5vZGUobm9kZSl9LHJlYWRsaW5rOnBhdGg9Pnt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCk7dmFyIGxpbms9bG9va3VwLm5vZGU7aWYoIWxpbmspe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1pZighbGluay5ub2RlX29wcy5yZWFkbGluayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXJldHVybiBQQVRIX0ZTLnJlc29sdmUoRlMuZ2V0UGF0aChsaW5rLnBhcmVudCksbGluay5ub2RlX29wcy5yZWFkbGluayhsaW5rKSl9LHN0YXQ6KHBhdGgsZG9udEZvbGxvdyk9Pnt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250Rm9sbG93fSk7dmFyIG5vZGU9bG9va3VwLm5vZGU7aWYoIW5vZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1pZighbm9kZS5ub2RlX29wcy5nZXRhdHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9cmV0dXJuIG5vZGUubm9kZV9vcHMuZ2V0YXR0cihub2RlKX0sbHN0YXQ6cGF0aD0+e3JldHVybiBGUy5zdGF0KHBhdGgsdHJ1ZSl9LGNobW9kOihwYXRoLG1vZGUsZG9udEZvbGxvdyk9Pnt2YXIgbm9kZTtpZih0eXBlb2YgcGF0aD09InN0cmluZyIpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6IWRvbnRGb2xsb3d9KTtub2RlPWxvb2t1cC5ub2RlfWVsc2V7bm9kZT1wYXRofWlmKCFub2RlLm5vZGVfb3BzLnNldGF0dHIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYzKX1ub2RlLm5vZGVfb3BzLnNldGF0dHIobm9kZSx7bW9kZTptb2RlJjQwOTV8bm9kZS5tb2RlJn40MDk1LHRpbWVzdGFtcDpEYXRlLm5vdygpfSl9LGxjaG1vZDoocGF0aCxtb2RlKT0+e0ZTLmNobW9kKHBhdGgsbW9kZSx0cnVlKX0sZmNobW9kOihmZCxtb2RlKT0+e3ZhciBzdHJlYW09RlMuZ2V0U3RyZWFtKGZkKTtpZighc3RyZWFtKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1GUy5jaG1vZChzdHJlYW0ubm9kZSxtb2RlKX0sY2hvd246KHBhdGgsdWlkLGdpZCxkb250Rm9sbG93KT0+e3ZhciBub2RlO2lmKHR5cGVvZiBwYXRoPT0ic3RyaW5nIil7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udEZvbGxvd30pO25vZGU9bG9va3VwLm5vZGV9ZWxzZXtub2RlPXBhdGh9aWYoIW5vZGUubm9kZV9vcHMuc2V0YXR0cil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfW5vZGUubm9kZV9vcHMuc2V0YXR0cihub2RlLHt0aW1lc3RhbXA6RGF0ZS5ub3coKX0pfSxsY2hvd246KHBhdGgsdWlkLGdpZCk9PntGUy5jaG93bihwYXRoLHVpZCxnaWQsdHJ1ZSl9LGZjaG93bjooZmQsdWlkLGdpZCk9Pnt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoIXN0cmVhbSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9RlMuY2hvd24oc3RyZWFtLm5vZGUsdWlkLGdpZCl9LHRydW5jYXRlOihwYXRoLGxlbik9PntpZihsZW48MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXZhciBub2RlO2lmKHR5cGVvZiBwYXRoPT0ic3RyaW5nIil7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzp0cnVlfSk7bm9kZT1sb29rdXAubm9kZX1lbHNle25vZGU9cGF0aH1pZighbm9kZS5ub2RlX29wcy5zZXRhdHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNEaXIobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzEpfWlmKCFGUy5pc0ZpbGUobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhub2RlLCJ3Iik7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9bm9kZS5ub2RlX29wcy5zZXRhdHRyKG5vZGUse3NpemU6bGVuLHRpbWVzdGFtcDpEYXRlLm5vdygpfSl9LGZ0cnVuY2F0ZTooZmQsbGVuKT0+e3ZhciBzdHJlYW09RlMuZ2V0U3RyZWFtKGZkKTtpZighc3RyZWFtKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZigoc3RyZWFtLmZsYWdzJjIwOTcxNTUpPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfUZTLnRydW5jYXRlKHN0cmVhbS5ub2RlLGxlbil9LHV0aW1lOihwYXRoLGF0aW1lLG10aW1lKT0+e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6dHJ1ZX0pO3ZhciBub2RlPWxvb2t1cC5ub2RlO25vZGUubm9kZV9vcHMuc2V0YXR0cihub2RlLHt0aW1lc3RhbXA6TWF0aC5tYXgoYXRpbWUsbXRpbWUpfSl9LG9wZW46KHBhdGgsZmxhZ3MsbW9kZSk9PntpZihwYXRoPT09IiIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1mbGFncz10eXBlb2YgZmxhZ3M9PSJzdHJpbmciP0ZTLm1vZGVTdHJpbmdUb0ZsYWdzKGZsYWdzKTpmbGFnczttb2RlPXR5cGVvZiBtb2RlPT0idW5kZWZpbmVkIj80Mzg6bW9kZTtpZihmbGFncyY2NCl7bW9kZT1tb2RlJjQwOTV8MzI3Njh9ZWxzZXttb2RlPTB9dmFyIG5vZGU7aWYodHlwZW9mIHBhdGg9PSJvYmplY3QiKXtub2RlPXBhdGh9ZWxzZXtwYXRoPVBBVEgubm9ybWFsaXplKHBhdGgpO3RyeXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiEoZmxhZ3MmMTMxMDcyKX0pO25vZGU9bG9va3VwLm5vZGV9Y2F0Y2goZSl7fX12YXIgY3JlYXRlZD1mYWxzZTtpZihmbGFncyY2NCl7aWYobm9kZSl7aWYoZmxhZ3MmMTI4KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyMCl9fWVsc2V7bm9kZT1GUy5ta25vZChwYXRoLG1vZGUsMCk7Y3JlYXRlZD10cnVlfX1pZighbm9kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfWlmKEZTLmlzQ2hyZGV2KG5vZGUubW9kZSkpe2ZsYWdzJj1+NTEyfWlmKGZsYWdzJjY1NTM2JiYhRlMuaXNEaXIobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTQpfWlmKCFjcmVhdGVkKXt2YXIgZXJyQ29kZT1GUy5tYXlPcGVuKG5vZGUsZmxhZ3MpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfX1pZihmbGFncyY1MTImJiFjcmVhdGVkKXtGUy50cnVuY2F0ZShub2RlLDApfWZsYWdzJj1+KDEyOHw1MTJ8MTMxMDcyKTt2YXIgc3RyZWFtPUZTLmNyZWF0ZVN0cmVhbSh7bm9kZTpub2RlLHBhdGg6RlMuZ2V0UGF0aChub2RlKSxmbGFnczpmbGFncyxzZWVrYWJsZTp0cnVlLHBvc2l0aW9uOjAsc3RyZWFtX29wczpub2RlLnN0cmVhbV9vcHMsdW5nb3R0ZW46W10sZXJyb3I6ZmFsc2V9KTtpZihzdHJlYW0uc3RyZWFtX29wcy5vcGVuKXtzdHJlYW0uc3RyZWFtX29wcy5vcGVuKHN0cmVhbSl9aWYoTW9kdWxlWyJsb2dSZWFkRmlsZXMiXSYmIShmbGFncyYxKSl7aWYoIUZTLnJlYWRGaWxlcylGUy5yZWFkRmlsZXM9e307aWYoIShwYXRoIGluIEZTLnJlYWRGaWxlcykpe0ZTLnJlYWRGaWxlc1twYXRoXT0xfX1yZXR1cm4gc3RyZWFtfSxjbG9zZTpzdHJlYW09PntpZihGUy5pc0Nsb3NlZChzdHJlYW0pKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZihzdHJlYW0uZ2V0ZGVudHMpc3RyZWFtLmdldGRlbnRzPW51bGw7dHJ5e2lmKHN0cmVhbS5zdHJlYW1fb3BzLmNsb3NlKXtzdHJlYW0uc3RyZWFtX29wcy5jbG9zZShzdHJlYW0pfX1jYXRjaChlKXt0aHJvdyBlfWZpbmFsbHl7RlMuY2xvc2VTdHJlYW0oc3RyZWFtLmZkKX1zdHJlYW0uZmQ9bnVsbH0saXNDbG9zZWQ6c3RyZWFtPT57cmV0dXJuIHN0cmVhbS5mZD09PW51bGx9LGxsc2Vlazooc3RyZWFtLG9mZnNldCx3aGVuY2UpPT57aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoIXN0cmVhbS5zZWVrYWJsZXx8IXN0cmVhbS5zdHJlYW1fb3BzLmxsc2Vlayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNzApfWlmKHdoZW5jZSE9MCYmd2hlbmNlIT0xJiZ3aGVuY2UhPTIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1zdHJlYW0ucG9zaXRpb249c3RyZWFtLnN0cmVhbV9vcHMubGxzZWVrKHN0cmVhbSxvZmZzZXQsd2hlbmNlKTtzdHJlYW0udW5nb3R0ZW49W107cmV0dXJuIHN0cmVhbS5wb3NpdGlvbn0scmVhZDooc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uKT0+e2lmKGxlbmd0aDwwfHxwb3NpdGlvbjwwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTEpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKEZTLmlzRGlyKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigzMSl9aWYoIXN0cmVhbS5zdHJlYW1fb3BzLnJlYWQpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgc2Vla2luZz10eXBlb2YgcG9zaXRpb24hPSJ1bmRlZmluZWQiO2lmKCFzZWVraW5nKXtwb3NpdGlvbj1zdHJlYW0ucG9zaXRpb259ZWxzZSBpZighc3RyZWFtLnNlZWthYmxlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3MCl9dmFyIGJ5dGVzUmVhZD1zdHJlYW0uc3RyZWFtX29wcy5yZWFkKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbik7aWYoIXNlZWtpbmcpc3RyZWFtLnBvc2l0aW9uKz1ieXRlc1JlYWQ7cmV0dXJuIGJ5dGVzUmVhZH0sd3JpdGU6KHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbixjYW5Pd24pPT57aWYobGVuZ3RoPDB8fHBvc2l0aW9uPDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZihGUy5pc0Nsb3NlZChzdHJlYW0pKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZigoc3RyZWFtLmZsYWdzJjIwOTcxNTUpPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoRlMuaXNEaXIoc3RyZWFtLm5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMxKX1pZighc3RyZWFtLnN0cmVhbV9vcHMud3JpdGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZihzdHJlYW0uc2Vla2FibGUmJnN0cmVhbS5mbGFncyYxMDI0KXtGUy5sbHNlZWsoc3RyZWFtLDAsMil9dmFyIHNlZWtpbmc9dHlwZW9mIHBvc2l0aW9uIT0idW5kZWZpbmVkIjtpZighc2Vla2luZyl7cG9zaXRpb249c3RyZWFtLnBvc2l0aW9ufWVsc2UgaWYoIXN0cmVhbS5zZWVrYWJsZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNzApfXZhciBieXRlc1dyaXR0ZW49c3RyZWFtLnN0cmVhbV9vcHMud3JpdGUoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uLGNhbk93bik7aWYoIXNlZWtpbmcpc3RyZWFtLnBvc2l0aW9uKz1ieXRlc1dyaXR0ZW47cmV0dXJuIGJ5dGVzV3JpdHRlbn0sYWxsb2NhdGU6KHN0cmVhbSxvZmZzZXQsbGVuZ3RoKT0+e2lmKEZTLmlzQ2xvc2VkKHN0cmVhbSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKG9mZnNldDwwfHxsZW5ndGg8PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZigoc3RyZWFtLmZsYWdzJjIwOTcxNTUpPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoIUZTLmlzRmlsZShzdHJlYW0ubm9kZS5tb2RlKSYmIUZTLmlzRGlyKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9aWYoIXN0cmVhbS5zdHJlYW1fb3BzLmFsbG9jYXRlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMzgpfXN0cmVhbS5zdHJlYW1fb3BzLmFsbG9jYXRlKHN0cmVhbSxvZmZzZXQsbGVuZ3RoKX0sbW1hcDooc3RyZWFtLGFkZHJlc3MsbGVuZ3RoLHBvc2l0aW9uLHByb3QsZmxhZ3MpPT57aWYoKHByb3QmMikhPT0wJiYoZmxhZ3MmMik9PT0wJiYoc3RyZWFtLmZsYWdzJjIwOTcxNTUpIT09Mil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMil9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTEpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDIpfWlmKCFzdHJlYW0uc3RyZWFtX29wcy5tbWFwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9cmV0dXJuIHN0cmVhbS5zdHJlYW1fb3BzLm1tYXAoc3RyZWFtLGFkZHJlc3MsbGVuZ3RoLHBvc2l0aW9uLHByb3QsZmxhZ3MpfSxtc3luYzooc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLG1tYXBGbGFncyk9PntpZighc3RyZWFtfHwhc3RyZWFtLnN0cmVhbV9vcHMubXN5bmMpe3JldHVybiAwfXJldHVybiBzdHJlYW0uc3RyZWFtX29wcy5tc3luYyhzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgsbW1hcEZsYWdzKX0sbXVubWFwOnN0cmVhbT0+MCxpb2N0bDooc3RyZWFtLGNtZCxhcmcpPT57aWYoIXN0cmVhbS5zdHJlYW1fb3BzLmlvY3RsKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1OSl9cmV0dXJuIHN0cmVhbS5zdHJlYW1fb3BzLmlvY3RsKHN0cmVhbSxjbWQsYXJnKX0scmVhZEZpbGU6KHBhdGgsb3B0cz17fSk9PntvcHRzLmZsYWdzPW9wdHMuZmxhZ3N8fDA7b3B0cy5lbmNvZGluZz1vcHRzLmVuY29kaW5nfHwiYmluYXJ5IjtpZihvcHRzLmVuY29kaW5nIT09InV0ZjgiJiZvcHRzLmVuY29kaW5nIT09ImJpbmFyeSIpe3Rocm93IG5ldyBFcnJvcignSW52YWxpZCBlbmNvZGluZyB0eXBlICInK29wdHMuZW5jb2RpbmcrJyInKX12YXIgcmV0O3ZhciBzdHJlYW09RlMub3BlbihwYXRoLG9wdHMuZmxhZ3MpO3ZhciBzdGF0PUZTLnN0YXQocGF0aCk7dmFyIGxlbmd0aD1zdGF0LnNpemU7dmFyIGJ1Zj1uZXcgVWludDhBcnJheShsZW5ndGgpO0ZTLnJlYWQoc3RyZWFtLGJ1ZiwwLGxlbmd0aCwwKTtpZihvcHRzLmVuY29kaW5nPT09InV0ZjgiKXtyZXQ9VVRGOEFycmF5VG9TdHJpbmcoYnVmLDApfWVsc2UgaWYob3B0cy5lbmNvZGluZz09PSJiaW5hcnkiKXtyZXQ9YnVmfUZTLmNsb3NlKHN0cmVhbSk7cmV0dXJuIHJldH0sd3JpdGVGaWxlOihwYXRoLGRhdGEsb3B0cz17fSk9PntvcHRzLmZsYWdzPW9wdHMuZmxhZ3N8fDU3Nzt2YXIgc3RyZWFtPUZTLm9wZW4ocGF0aCxvcHRzLmZsYWdzLG9wdHMubW9kZSk7aWYodHlwZW9mIGRhdGE9PSJzdHJpbmciKXt2YXIgYnVmPW5ldyBVaW50OEFycmF5KGxlbmd0aEJ5dGVzVVRGOChkYXRhKSsxKTt2YXIgYWN0dWFsTnVtQnl0ZXM9c3RyaW5nVG9VVEY4QXJyYXkoZGF0YSxidWYsMCxidWYubGVuZ3RoKTtGUy53cml0ZShzdHJlYW0sYnVmLDAsYWN0dWFsTnVtQnl0ZXMsdW5kZWZpbmVkLG9wdHMuY2FuT3duKX1lbHNlIGlmKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSl7RlMud3JpdGUoc3RyZWFtLGRhdGEsMCxkYXRhLmJ5dGVMZW5ndGgsdW5kZWZpbmVkLG9wdHMuY2FuT3duKX1lbHNle3Rocm93IG5ldyBFcnJvcigiVW5zdXBwb3J0ZWQgZGF0YSB0eXBlIil9RlMuY2xvc2Uoc3RyZWFtKX0sY3dkOigpPT5GUy5jdXJyZW50UGF0aCxjaGRpcjpwYXRoPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzp0cnVlfSk7aWYobG9va3VwLm5vZGU9PT1udWxsKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9aWYoIUZTLmlzRGlyKGxvb2t1cC5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NCl9dmFyIGVyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKGxvb2t1cC5ub2RlLCJ4Iik7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9RlMuY3VycmVudFBhdGg9bG9va3VwLnBhdGh9LGNyZWF0ZURlZmF1bHREaXJlY3RvcmllczooKT0+e0ZTLm1rZGlyKCIvdG1wIik7RlMubWtkaXIoIi9ob21lIik7RlMubWtkaXIoIi9ob21lL3dlYl91c2VyIil9LGNyZWF0ZURlZmF1bHREZXZpY2VzOigpPT57RlMubWtkaXIoIi9kZXYiKTtGUy5yZWdpc3RlckRldmljZShGUy5tYWtlZGV2KDEsMykse3JlYWQ6KCk9PjAsd3JpdGU6KHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3MpPT5sZW5ndGh9KTtGUy5ta2RldigiL2Rldi9udWxsIixGUy5tYWtlZGV2KDEsMykpO1RUWS5yZWdpc3RlcihGUy5tYWtlZGV2KDUsMCksVFRZLmRlZmF1bHRfdHR5X29wcyk7VFRZLnJlZ2lzdGVyKEZTLm1ha2VkZXYoNiwwKSxUVFkuZGVmYXVsdF90dHkxX29wcyk7RlMubWtkZXYoIi9kZXYvdHR5IixGUy5tYWtlZGV2KDUsMCkpO0ZTLm1rZGV2KCIvZGV2L3R0eTEiLEZTLm1ha2VkZXYoNiwwKSk7dmFyIHJhbmRvbV9kZXZpY2U9Z2V0UmFuZG9tRGV2aWNlKCk7RlMuY3JlYXRlRGV2aWNlKCIvZGV2IiwicmFuZG9tIixyYW5kb21fZGV2aWNlKTtGUy5jcmVhdGVEZXZpY2UoIi9kZXYiLCJ1cmFuZG9tIixyYW5kb21fZGV2aWNlKTtGUy5ta2RpcigiL2Rldi9zaG0iKTtGUy5ta2RpcigiL2Rldi9zaG0vdG1wIil9LGNyZWF0ZVNwZWNpYWxEaXJlY3RvcmllczooKT0+e0ZTLm1rZGlyKCIvcHJvYyIpO3ZhciBwcm9jX3NlbGY9RlMubWtkaXIoIi9wcm9jL3NlbGYiKTtGUy5ta2RpcigiL3Byb2Mvc2VsZi9mZCIpO0ZTLm1vdW50KHttb3VudDooKT0+e3ZhciBub2RlPUZTLmNyZWF0ZU5vZGUocHJvY19zZWxmLCJmZCIsMTYzODR8NTExLDczKTtub2RlLm5vZGVfb3BzPXtsb29rdXA6KHBhcmVudCxuYW1lKT0+e3ZhciBmZD0rbmFtZTt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoIXN0cmVhbSl0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KTt2YXIgcmV0PXtwYXJlbnQ6bnVsbCxtb3VudDp7bW91bnRwb2ludDoiZmFrZSJ9LG5vZGVfb3BzOntyZWFkbGluazooKT0+c3RyZWFtLnBhdGh9fTtyZXQucGFyZW50PXJldDtyZXR1cm4gcmV0fX07cmV0dXJuIG5vZGV9fSx7fSwiL3Byb2Mvc2VsZi9mZCIpfSxjcmVhdGVTdGFuZGFyZFN0cmVhbXM6KCk9PntpZihNb2R1bGVbInN0ZGluIl0pe0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInN0ZGluIixNb2R1bGVbInN0ZGluIl0pfWVsc2V7RlMuc3ltbGluaygiL2Rldi90dHkiLCIvZGV2L3N0ZGluIil9aWYoTW9kdWxlWyJzdGRvdXQiXSl7RlMuY3JlYXRlRGV2aWNlKCIvZGV2Iiwic3Rkb3V0IixudWxsLE1vZHVsZVsic3Rkb3V0Il0pfWVsc2V7RlMuc3ltbGluaygiL2Rldi90dHkiLCIvZGV2L3N0ZG91dCIpfWlmKE1vZHVsZVsic3RkZXJyIl0pe0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInN0ZGVyciIsbnVsbCxNb2R1bGVbInN0ZGVyciJdKX1lbHNle0ZTLnN5bWxpbmsoIi9kZXYvdHR5MSIsIi9kZXYvc3RkZXJyIil9dmFyIHN0ZGluPUZTLm9wZW4oIi9kZXYvc3RkaW4iLDApO3ZhciBzdGRvdXQ9RlMub3BlbigiL2Rldi9zdGRvdXQiLDEpO3ZhciBzdGRlcnI9RlMub3BlbigiL2Rldi9zdGRlcnIiLDEpfSxlbnN1cmVFcnJub0Vycm9yOigpPT57aWYoRlMuRXJybm9FcnJvcilyZXR1cm47RlMuRXJybm9FcnJvcj1mdW5jdGlvbiBFcnJub0Vycm9yKGVycm5vLG5vZGUpe3RoaXMubm9kZT1ub2RlO3RoaXMuc2V0RXJybm89ZnVuY3Rpb24oZXJybm8pe3RoaXMuZXJybm89ZXJybm99O3RoaXMuc2V0RXJybm8oZXJybm8pO3RoaXMubWVzc2FnZT0iRlMgZXJyb3IifTtGUy5FcnJub0Vycm9yLnByb3RvdHlwZT1uZXcgRXJyb3I7RlMuRXJybm9FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3I9RlMuRXJybm9FcnJvcjtbNDRdLmZvckVhY2goY29kZT0+e0ZTLmdlbmVyaWNFcnJvcnNbY29kZV09bmV3IEZTLkVycm5vRXJyb3IoY29kZSk7RlMuZ2VuZXJpY0Vycm9yc1tjb2RlXS5zdGFjaz0iPGdlbmVyaWMgZXJyb3IsIG5vIHN0YWNrPiJ9KX0sc3RhdGljSW5pdDooKT0+e0ZTLmVuc3VyZUVycm5vRXJyb3IoKTtGUy5uYW1lVGFibGU9bmV3IEFycmF5KDQwOTYpO0ZTLm1vdW50KE1FTUZTLHt9LCIvIik7RlMuY3JlYXRlRGVmYXVsdERpcmVjdG9yaWVzKCk7RlMuY3JlYXRlRGVmYXVsdERldmljZXMoKTtGUy5jcmVhdGVTcGVjaWFsRGlyZWN0b3JpZXMoKTtGUy5maWxlc3lzdGVtcz17Ik1FTUZTIjpNRU1GU319LGluaXQ6KGlucHV0LG91dHB1dCxlcnJvcik9PntGUy5pbml0LmluaXRpYWxpemVkPXRydWU7RlMuZW5zdXJlRXJybm9FcnJvcigpO01vZHVsZVsic3RkaW4iXT1pbnB1dHx8TW9kdWxlWyJzdGRpbiJdO01vZHVsZVsic3Rkb3V0Il09b3V0cHV0fHxNb2R1bGVbInN0ZG91dCJdO01vZHVsZVsic3RkZXJyIl09ZXJyb3J8fE1vZHVsZVsic3RkZXJyIl07RlMuY3JlYXRlU3RhbmRhcmRTdHJlYW1zKCl9LHF1aXQ6KCk9PntGUy5pbml0LmluaXRpYWxpemVkPWZhbHNlO19fX3N0ZGlvX2V4aXQoKTtmb3IodmFyIGk9MDtpPEZTLnN0cmVhbXMubGVuZ3RoO2krKyl7dmFyIHN0cmVhbT1GUy5zdHJlYW1zW2ldO2lmKCFzdHJlYW0pe2NvbnRpbnVlfUZTLmNsb3NlKHN0cmVhbSl9fSxnZXRNb2RlOihjYW5SZWFkLGNhbldyaXRlKT0+e3ZhciBtb2RlPTA7aWYoY2FuUmVhZCltb2RlfD0yOTJ8NzM7aWYoY2FuV3JpdGUpbW9kZXw9MTQ2O3JldHVybiBtb2RlfSxmaW5kT2JqZWN0OihwYXRoLGRvbnRSZXNvbHZlTGFzdExpbmspPT57dmFyIHJldD1GUy5hbmFseXplUGF0aChwYXRoLGRvbnRSZXNvbHZlTGFzdExpbmspO2lmKHJldC5leGlzdHMpe3JldHVybiByZXQub2JqZWN0fWVsc2V7cmV0dXJuIG51bGx9fSxhbmFseXplUGF0aDoocGF0aCxkb250UmVzb2x2ZUxhc3RMaW5rKT0+e3RyeXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250UmVzb2x2ZUxhc3RMaW5rfSk7cGF0aD1sb29rdXAucGF0aH1jYXRjaChlKXt9dmFyIHJldD17aXNSb290OmZhbHNlLGV4aXN0czpmYWxzZSxlcnJvcjowLG5hbWU6bnVsbCxwYXRoOm51bGwsb2JqZWN0Om51bGwscGFyZW50RXhpc3RzOmZhbHNlLHBhcmVudFBhdGg6bnVsbCxwYXJlbnRPYmplY3Q6bnVsbH07dHJ5e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtwYXJlbnQ6dHJ1ZX0pO3JldC5wYXJlbnRFeGlzdHM9dHJ1ZTtyZXQucGFyZW50UGF0aD1sb29rdXAucGF0aDtyZXQucGFyZW50T2JqZWN0PWxvb2t1cC5ub2RlO3JldC5uYW1lPVBBVEguYmFzZW5hbWUocGF0aCk7bG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250UmVzb2x2ZUxhc3RMaW5rfSk7cmV0LmV4aXN0cz10cnVlO3JldC5wYXRoPWxvb2t1cC5wYXRoO3JldC5vYmplY3Q9bG9va3VwLm5vZGU7cmV0Lm5hbWU9bG9va3VwLm5vZGUubmFtZTtyZXQuaXNSb290PWxvb2t1cC5wYXRoPT09Ii8ifWNhdGNoKGUpe3JldC5lcnJvcj1lLmVycm5vfXJldHVybiByZXR9LGNyZWF0ZVBhdGg6KHBhcmVudCxwYXRoLGNhblJlYWQsY2FuV3JpdGUpPT57cGFyZW50PXR5cGVvZiBwYXJlbnQ9PSJzdHJpbmciP3BhcmVudDpGUy5nZXRQYXRoKHBhcmVudCk7dmFyIHBhcnRzPXBhdGguc3BsaXQoIi8iKS5yZXZlcnNlKCk7d2hpbGUocGFydHMubGVuZ3RoKXt2YXIgcGFydD1wYXJ0cy5wb3AoKTtpZighcGFydCljb250aW51ZTt2YXIgY3VycmVudD1QQVRILmpvaW4yKHBhcmVudCxwYXJ0KTt0cnl7RlMubWtkaXIoY3VycmVudCl9Y2F0Y2goZSl7fXBhcmVudD1jdXJyZW50fXJldHVybiBjdXJyZW50fSxjcmVhdGVGaWxlOihwYXJlbnQsbmFtZSxwcm9wZXJ0aWVzLGNhblJlYWQsY2FuV3JpdGUpPT57dmFyIHBhdGg9UEFUSC5qb2luMih0eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpLG5hbWUpO3ZhciBtb2RlPUZTLmdldE1vZGUoY2FuUmVhZCxjYW5Xcml0ZSk7cmV0dXJuIEZTLmNyZWF0ZShwYXRoLG1vZGUpfSxjcmVhdGVEYXRhRmlsZToocGFyZW50LG5hbWUsZGF0YSxjYW5SZWFkLGNhbldyaXRlLGNhbk93bik9Pnt2YXIgcGF0aD1uYW1lO2lmKHBhcmVudCl7cGFyZW50PXR5cGVvZiBwYXJlbnQ9PSJzdHJpbmciP3BhcmVudDpGUy5nZXRQYXRoKHBhcmVudCk7cGF0aD1uYW1lP1BBVEguam9pbjIocGFyZW50LG5hbWUpOnBhcmVudH12YXIgbW9kZT1GUy5nZXRNb2RlKGNhblJlYWQsY2FuV3JpdGUpO3ZhciBub2RlPUZTLmNyZWF0ZShwYXRoLG1vZGUpO2lmKGRhdGEpe2lmKHR5cGVvZiBkYXRhPT0ic3RyaW5nIil7dmFyIGFycj1uZXcgQXJyYXkoZGF0YS5sZW5ndGgpO2Zvcih2YXIgaT0wLGxlbj1kYXRhLmxlbmd0aDtpPGxlbjsrK2kpYXJyW2ldPWRhdGEuY2hhckNvZGVBdChpKTtkYXRhPWFycn1GUy5jaG1vZChub2RlLG1vZGV8MTQ2KTt2YXIgc3RyZWFtPUZTLm9wZW4obm9kZSw1NzcpO0ZTLndyaXRlKHN0cmVhbSxkYXRhLDAsZGF0YS5sZW5ndGgsMCxjYW5Pd24pO0ZTLmNsb3NlKHN0cmVhbSk7RlMuY2htb2Qobm9kZSxtb2RlKX1yZXR1cm4gbm9kZX0sY3JlYXRlRGV2aWNlOihwYXJlbnQsbmFtZSxpbnB1dCxvdXRwdXQpPT57dmFyIHBhdGg9UEFUSC5qb2luMih0eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpLG5hbWUpO3ZhciBtb2RlPUZTLmdldE1vZGUoISFpbnB1dCwhIW91dHB1dCk7aWYoIUZTLmNyZWF0ZURldmljZS5tYWpvcilGUy5jcmVhdGVEZXZpY2UubWFqb3I9NjQ7dmFyIGRldj1GUy5tYWtlZGV2KEZTLmNyZWF0ZURldmljZS5tYWpvcisrLDApO0ZTLnJlZ2lzdGVyRGV2aWNlKGRldix7b3BlbjpzdHJlYW09PntzdHJlYW0uc2Vla2FibGU9ZmFsc2V9LGNsb3NlOnN0cmVhbT0+e2lmKG91dHB1dCYmb3V0cHV0LmJ1ZmZlciYmb3V0cHV0LmJ1ZmZlci5sZW5ndGgpe291dHB1dCgxMCl9fSxyZWFkOihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zKT0+e3ZhciBieXRlc1JlYWQ9MDtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe3ZhciByZXN1bHQ7dHJ5e3Jlc3VsdD1pbnB1dCgpfWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX1pZihyZXN1bHQ9PT11bmRlZmluZWQmJmJ5dGVzUmVhZD09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYpfWlmKHJlc3VsdD09PW51bGx8fHJlc3VsdD09PXVuZGVmaW5lZClicmVhaztieXRlc1JlYWQrKztidWZmZXJbb2Zmc2V0K2ldPXJlc3VsdH1pZihieXRlc1JlYWQpe3N0cmVhbS5ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpfXJldHVybiBieXRlc1JlYWR9LHdyaXRlOihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zKT0+e2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7dHJ5e291dHB1dChidWZmZXJbb2Zmc2V0K2ldKX1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9fWlmKGxlbmd0aCl7c3RyZWFtLm5vZGUudGltZXN0YW1wPURhdGUubm93KCl9cmV0dXJuIGl9fSk7cmV0dXJuIEZTLm1rZGV2KHBhdGgsbW9kZSxkZXYpfSxmb3JjZUxvYWRGaWxlOm9iaj0+e2lmKG9iai5pc0RldmljZXx8b2JqLmlzRm9sZGVyfHxvYmoubGlua3x8b2JqLmNvbnRlbnRzKXJldHVybiB0cnVlO2lmKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCE9InVuZGVmaW5lZCIpe3Rocm93IG5ldyBFcnJvcigiTGF6eSBsb2FkaW5nIHNob3VsZCBoYXZlIGJlZW4gcGVyZm9ybWVkIChjb250ZW50cyBzZXQpIGluIGNyZWF0ZUxhenlGaWxlLCBidXQgaXQgd2FzIG5vdC4gTGF6eSBsb2FkaW5nIG9ubHkgd29ya3MgaW4gd2ViIHdvcmtlcnMuIFVzZSAtLWVtYmVkLWZpbGUgb3IgLS1wcmVsb2FkLWZpbGUgaW4gZW1jYyBvbiB0aGUgbWFpbiB0aHJlYWQuIil9ZWxzZSBpZihyZWFkXyl7dHJ5e29iai5jb250ZW50cz1pbnRBcnJheUZyb21TdHJpbmcocmVhZF8ob2JqLnVybCksdHJ1ZSk7b2JqLnVzZWRCeXRlcz1vYmouY29udGVudHMubGVuZ3RofWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX19ZWxzZXt0aHJvdyBuZXcgRXJyb3IoIkNhbm5vdCBsb2FkIHdpdGhvdXQgcmVhZCgpIG9yIFhNTEh0dHBSZXF1ZXN0LiIpfX0sY3JlYXRlTGF6eUZpbGU6KHBhcmVudCxuYW1lLHVybCxjYW5SZWFkLGNhbldyaXRlKT0+e2Z1bmN0aW9uIExhenlVaW50OEFycmF5KCl7dGhpcy5sZW5ndGhLbm93bj1mYWxzZTt0aGlzLmNodW5rcz1bXX1MYXp5VWludDhBcnJheS5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uIExhenlVaW50OEFycmF5X2dldChpZHgpe2lmKGlkeD50aGlzLmxlbmd0aC0xfHxpZHg8MCl7cmV0dXJuIHVuZGVmaW5lZH12YXIgY2h1bmtPZmZzZXQ9aWR4JXRoaXMuY2h1bmtTaXplO3ZhciBjaHVua051bT1pZHgvdGhpcy5jaHVua1NpemV8MDtyZXR1cm4gdGhpcy5nZXR0ZXIoY2h1bmtOdW0pW2NodW5rT2Zmc2V0XX07TGF6eVVpbnQ4QXJyYXkucHJvdG90eXBlLnNldERhdGFHZXR0ZXI9ZnVuY3Rpb24gTGF6eVVpbnQ4QXJyYXlfc2V0RGF0YUdldHRlcihnZXR0ZXIpe3RoaXMuZ2V0dGVyPWdldHRlcn07TGF6eVVpbnQ4QXJyYXkucHJvdG90eXBlLmNhY2hlTGVuZ3RoPWZ1bmN0aW9uIExhenlVaW50OEFycmF5X2NhY2hlTGVuZ3RoKCl7dmFyIHhocj1uZXcgWE1MSHR0cFJlcXVlc3Q7eGhyLm9wZW4oIkhFQUQiLHVybCxmYWxzZSk7eGhyLnNlbmQobnVsbCk7aWYoISh4aHIuc3RhdHVzPj0yMDAmJnhoci5zdGF0dXM8MzAwfHx4aHIuc3RhdHVzPT09MzA0KSl0aHJvdyBuZXcgRXJyb3IoIkNvdWxkbid0IGxvYWQgIit1cmwrIi4gU3RhdHVzOiAiK3hoci5zdGF0dXMpO3ZhciBkYXRhbGVuZ3RoPU51bWJlcih4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoIkNvbnRlbnQtbGVuZ3RoIikpO3ZhciBoZWFkZXI7dmFyIGhhc0J5dGVTZXJ2aW5nPShoZWFkZXI9eGhyLmdldFJlc3BvbnNlSGVhZGVyKCJBY2NlcHQtUmFuZ2VzIikpJiZoZWFkZXI9PT0iYnl0ZXMiO3ZhciB1c2VzR3ppcD0oaGVhZGVyPXhoci5nZXRSZXNwb25zZUhlYWRlcigiQ29udGVudC1FbmNvZGluZyIpKSYmaGVhZGVyPT09Imd6aXAiO3ZhciBjaHVua1NpemU9MTAyNCoxMDI0O2lmKCFoYXNCeXRlU2VydmluZyljaHVua1NpemU9ZGF0YWxlbmd0aDt2YXIgZG9YSFI9KGZyb20sdG8pPT57aWYoZnJvbT50byl0aHJvdyBuZXcgRXJyb3IoImludmFsaWQgcmFuZ2UgKCIrZnJvbSsiLCAiK3RvKyIpIG9yIG5vIGJ5dGVzIHJlcXVlc3RlZCEiKTtpZih0bz5kYXRhbGVuZ3RoLTEpdGhyb3cgbmV3IEVycm9yKCJvbmx5ICIrZGF0YWxlbmd0aCsiIGJ5dGVzIGF2YWlsYWJsZSEgcHJvZ3JhbW1lciBlcnJvciEiKTt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO2lmKGRhdGFsZW5ndGghPT1jaHVua1NpemUpeGhyLnNldFJlcXVlc3RIZWFkZXIoIlJhbmdlIiwiYnl0ZXM9Iitmcm9tKyItIit0byk7eGhyLnJlc3BvbnNlVHlwZT0iYXJyYXlidWZmZXIiO2lmKHhoci5vdmVycmlkZU1pbWVUeXBlKXt4aHIub3ZlcnJpZGVNaW1lVHlwZSgidGV4dC9wbGFpbjsgY2hhcnNldD14LXVzZXItZGVmaW5lZCIpfXhoci5zZW5kKG51bGwpO2lmKCEoeGhyLnN0YXR1cz49MjAwJiZ4aHIuc3RhdHVzPDMwMHx8eGhyLnN0YXR1cz09PTMwNCkpdGhyb3cgbmV3IEVycm9yKCJDb3VsZG4ndCBsb2FkICIrdXJsKyIuIFN0YXR1czogIit4aHIuc3RhdHVzKTtpZih4aHIucmVzcG9uc2UhPT11bmRlZmluZWQpe3JldHVybiBuZXcgVWludDhBcnJheSh4aHIucmVzcG9uc2V8fFtdKX1lbHNle3JldHVybiBpbnRBcnJheUZyb21TdHJpbmcoeGhyLnJlc3BvbnNlVGV4dHx8IiIsdHJ1ZSl9fTt2YXIgbGF6eUFycmF5PXRoaXM7bGF6eUFycmF5LnNldERhdGFHZXR0ZXIoY2h1bmtOdW09Pnt2YXIgc3RhcnQ9Y2h1bmtOdW0qY2h1bmtTaXplO3ZhciBlbmQ9KGNodW5rTnVtKzEpKmNodW5rU2l6ZS0xO2VuZD1NYXRoLm1pbihlbmQsZGF0YWxlbmd0aC0xKTtpZih0eXBlb2YgbGF6eUFycmF5LmNodW5rc1tjaHVua051bV09PSJ1bmRlZmluZWQiKXtsYXp5QXJyYXkuY2h1bmtzW2NodW5rTnVtXT1kb1hIUihzdGFydCxlbmQpfWlmKHR5cGVvZiBsYXp5QXJyYXkuY2h1bmtzW2NodW5rTnVtXT09InVuZGVmaW5lZCIpdGhyb3cgbmV3IEVycm9yKCJkb1hIUiBmYWlsZWQhIik7cmV0dXJuIGxhenlBcnJheS5jaHVua3NbY2h1bmtOdW1dfSk7aWYodXNlc0d6aXB8fCFkYXRhbGVuZ3RoKXtjaHVua1NpemU9ZGF0YWxlbmd0aD0xO2RhdGFsZW5ndGg9dGhpcy5nZXR0ZXIoMCkubGVuZ3RoO2NodW5rU2l6ZT1kYXRhbGVuZ3RoO291dCgiTGF6eUZpbGVzIG9uIGd6aXAgZm9yY2VzIGRvd25sb2FkIG9mIHRoZSB3aG9sZSBmaWxlIHdoZW4gbGVuZ3RoIGlzIGFjY2Vzc2VkIil9dGhpcy5fbGVuZ3RoPWRhdGFsZW5ndGg7dGhpcy5fY2h1bmtTaXplPWNodW5rU2l6ZTt0aGlzLmxlbmd0aEtub3duPXRydWV9O2lmKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCE9InVuZGVmaW5lZCIpe2lmKCFFTlZJUk9OTUVOVF9JU19XT1JLRVIpdGhyb3ciQ2Fubm90IGRvIHN5bmNocm9ub3VzIGJpbmFyeSBYSFJzIG91dHNpZGUgd2Vid29ya2VycyBpbiBtb2Rlcm4gYnJvd3NlcnMuIFVzZSAtLWVtYmVkLWZpbGUgb3IgLS1wcmVsb2FkLWZpbGUgaW4gZW1jYyI7dmFyIGxhenlBcnJheT1uZXcgTGF6eVVpbnQ4QXJyYXk7T2JqZWN0LmRlZmluZVByb3BlcnRpZXMobGF6eUFycmF5LHtsZW5ndGg6e2dldDpmdW5jdGlvbigpe2lmKCF0aGlzLmxlbmd0aEtub3duKXt0aGlzLmNhY2hlTGVuZ3RoKCl9cmV0dXJuIHRoaXMuX2xlbmd0aH19LGNodW5rU2l6ZTp7Z2V0OmZ1bmN0aW9uKCl7aWYoIXRoaXMubGVuZ3RoS25vd24pe3RoaXMuY2FjaGVMZW5ndGgoKX1yZXR1cm4gdGhpcy5fY2h1bmtTaXplfX19KTt2YXIgcHJvcGVydGllcz17aXNEZXZpY2U6ZmFsc2UsY29udGVudHM6bGF6eUFycmF5fX1lbHNle3ZhciBwcm9wZXJ0aWVzPXtpc0RldmljZTpmYWxzZSx1cmw6dXJsfX12YXIgbm9kZT1GUy5jcmVhdGVGaWxlKHBhcmVudCxuYW1lLHByb3BlcnRpZXMsY2FuUmVhZCxjYW5Xcml0ZSk7aWYocHJvcGVydGllcy5jb250ZW50cyl7bm9kZS5jb250ZW50cz1wcm9wZXJ0aWVzLmNvbnRlbnRzfWVsc2UgaWYocHJvcGVydGllcy51cmwpe25vZGUuY29udGVudHM9bnVsbDtub2RlLnVybD1wcm9wZXJ0aWVzLnVybH1PYmplY3QuZGVmaW5lUHJvcGVydGllcyhub2RlLHt1c2VkQnl0ZXM6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNvbnRlbnRzLmxlbmd0aH19fSk7dmFyIHN0cmVhbV9vcHM9e307dmFyIGtleXM9T2JqZWN0LmtleXMobm9kZS5zdHJlYW1fb3BzKTtrZXlzLmZvckVhY2goa2V5PT57dmFyIGZuPW5vZGUuc3RyZWFtX29wc1trZXldO3N0cmVhbV9vcHNba2V5XT1mdW5jdGlvbiBmb3JjZUxvYWRMYXp5RmlsZSgpe0ZTLmZvcmNlTG9hZEZpbGUobm9kZSk7cmV0dXJuIGZuLmFwcGx5KG51bGwsYXJndW1lbnRzKX19KTtzdHJlYW1fb3BzLnJlYWQ9KChzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24pPT57RlMuZm9yY2VMb2FkRmlsZShub2RlKTt2YXIgY29udGVudHM9c3RyZWFtLm5vZGUuY29udGVudHM7aWYocG9zaXRpb24+PWNvbnRlbnRzLmxlbmd0aClyZXR1cm4gMDt2YXIgc2l6ZT1NYXRoLm1pbihjb250ZW50cy5sZW5ndGgtcG9zaXRpb24sbGVuZ3RoKTtpZihjb250ZW50cy5zbGljZSl7Zm9yKHZhciBpPTA7aTxzaXplO2krKyl7YnVmZmVyW29mZnNldCtpXT1jb250ZW50c1twb3NpdGlvbitpXX19ZWxzZXtmb3IodmFyIGk9MDtpPHNpemU7aSsrKXtidWZmZXJbb2Zmc2V0K2ldPWNvbnRlbnRzLmdldChwb3NpdGlvbitpKX19cmV0dXJuIHNpemV9KTtub2RlLnN0cmVhbV9vcHM9c3RyZWFtX29wcztyZXR1cm4gbm9kZX0sY3JlYXRlUHJlbG9hZGVkRmlsZToocGFyZW50LG5hbWUsdXJsLGNhblJlYWQsY2FuV3JpdGUsb25sb2FkLG9uZXJyb3IsZG9udENyZWF0ZUZpbGUsY2FuT3duLHByZUZpbmlzaCk9Pnt2YXIgZnVsbG5hbWU9bmFtZT9QQVRIX0ZTLnJlc29sdmUoUEFUSC5qb2luMihwYXJlbnQsbmFtZSkpOnBhcmVudDt2YXIgZGVwPWdldFVuaXF1ZVJ1bkRlcGVuZGVuY3koImNwICIrZnVsbG5hbWUpO2Z1bmN0aW9uIHByb2Nlc3NEYXRhKGJ5dGVBcnJheSl7ZnVuY3Rpb24gZmluaXNoKGJ5dGVBcnJheSl7aWYocHJlRmluaXNoKXByZUZpbmlzaCgpO2lmKCFkb250Q3JlYXRlRmlsZSl7RlMuY3JlYXRlRGF0YUZpbGUocGFyZW50LG5hbWUsYnl0ZUFycmF5LGNhblJlYWQsY2FuV3JpdGUsY2FuT3duKX1pZihvbmxvYWQpb25sb2FkKCk7cmVtb3ZlUnVuRGVwZW5kZW5jeShkZXApfWlmKEJyb3dzZXIuaGFuZGxlZEJ5UHJlbG9hZFBsdWdpbihieXRlQXJyYXksZnVsbG5hbWUsZmluaXNoLCgpPT57aWYob25lcnJvcilvbmVycm9yKCk7cmVtb3ZlUnVuRGVwZW5kZW5jeShkZXApfSkpe3JldHVybn1maW5pc2goYnl0ZUFycmF5KX1hZGRSdW5EZXBlbmRlbmN5KGRlcCk7aWYodHlwZW9mIHVybD09InN0cmluZyIpe2FzeW5jTG9hZCh1cmwsYnl0ZUFycmF5PT5wcm9jZXNzRGF0YShieXRlQXJyYXkpLG9uZXJyb3IpfWVsc2V7cHJvY2Vzc0RhdGEodXJsKX19LGluZGV4ZWREQjooKT0+e3JldHVybiB3aW5kb3cuaW5kZXhlZERCfHx3aW5kb3cubW96SW5kZXhlZERCfHx3aW5kb3cud2Via2l0SW5kZXhlZERCfHx3aW5kb3cubXNJbmRleGVkREJ9LERCX05BTUU6KCk9PntyZXR1cm4iRU1fRlNfIit3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9LERCX1ZFUlNJT046MjAsREJfU1RPUkVfTkFNRToiRklMRV9EQVRBIixzYXZlRmlsZXNUb0RCOihwYXRocyxvbmxvYWQsb25lcnJvcik9PntvbmxvYWQ9b25sb2FkfHwoKCk9Pnt9KTtvbmVycm9yPW9uZXJyb3J8fCgoKT0+e30pO3ZhciBpbmRleGVkREI9RlMuaW5kZXhlZERCKCk7dHJ5e3ZhciBvcGVuUmVxdWVzdD1pbmRleGVkREIub3BlbihGUy5EQl9OQU1FKCksRlMuREJfVkVSU0lPTil9Y2F0Y2goZSl7cmV0dXJuIG9uZXJyb3IoZSl9b3BlblJlcXVlc3Qub251cGdyYWRlbmVlZGVkPSgoKT0+e291dCgiY3JlYXRpbmcgZGIiKTt2YXIgZGI9b3BlblJlcXVlc3QucmVzdWx0O2RiLmNyZWF0ZU9iamVjdFN0b3JlKEZTLkRCX1NUT1JFX05BTUUpfSk7b3BlblJlcXVlc3Qub25zdWNjZXNzPSgoKT0+e3ZhciBkYj1vcGVuUmVxdWVzdC5yZXN1bHQ7dmFyIHRyYW5zYWN0aW9uPWRiLnRyYW5zYWN0aW9uKFtGUy5EQl9TVE9SRV9OQU1FXSwicmVhZHdyaXRlIik7dmFyIGZpbGVzPXRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKEZTLkRCX1NUT1JFX05BTUUpO3ZhciBvaz0wLGZhaWw9MCx0b3RhbD1wYXRocy5sZW5ndGg7ZnVuY3Rpb24gZmluaXNoKCl7aWYoZmFpbD09MClvbmxvYWQoKTtlbHNlIG9uZXJyb3IoKX1wYXRocy5mb3JFYWNoKHBhdGg9Pnt2YXIgcHV0UmVxdWVzdD1maWxlcy5wdXQoRlMuYW5hbHl6ZVBhdGgocGF0aCkub2JqZWN0LmNvbnRlbnRzLHBhdGgpO3B1dFJlcXVlc3Qub25zdWNjZXNzPSgoKT0+e29rKys7aWYob2srZmFpbD09dG90YWwpZmluaXNoKCl9KTtwdXRSZXF1ZXN0Lm9uZXJyb3I9KCgpPT57ZmFpbCsrO2lmKG9rK2ZhaWw9PXRvdGFsKWZpbmlzaCgpfSl9KTt0cmFuc2FjdGlvbi5vbmVycm9yPW9uZXJyb3J9KTtvcGVuUmVxdWVzdC5vbmVycm9yPW9uZXJyb3J9LGxvYWRGaWxlc0Zyb21EQjoocGF0aHMsb25sb2FkLG9uZXJyb3IpPT57b25sb2FkPW9ubG9hZHx8KCgpPT57fSk7b25lcnJvcj1vbmVycm9yfHwoKCk9Pnt9KTt2YXIgaW5kZXhlZERCPUZTLmluZGV4ZWREQigpO3RyeXt2YXIgb3BlblJlcXVlc3Q9aW5kZXhlZERCLm9wZW4oRlMuREJfTkFNRSgpLEZTLkRCX1ZFUlNJT04pfWNhdGNoKGUpe3JldHVybiBvbmVycm9yKGUpfW9wZW5SZXF1ZXN0Lm9udXBncmFkZW5lZWRlZD1vbmVycm9yO29wZW5SZXF1ZXN0Lm9uc3VjY2Vzcz0oKCk9Pnt2YXIgZGI9b3BlblJlcXVlc3QucmVzdWx0O3RyeXt2YXIgdHJhbnNhY3Rpb249ZGIudHJhbnNhY3Rpb24oW0ZTLkRCX1NUT1JFX05BTUVdLCJyZWFkb25seSIpfWNhdGNoKGUpe29uZXJyb3IoZSk7cmV0dXJufXZhciBmaWxlcz10cmFuc2FjdGlvbi5vYmplY3RTdG9yZShGUy5EQl9TVE9SRV9OQU1FKTt2YXIgb2s9MCxmYWlsPTAsdG90YWw9cGF0aHMubGVuZ3RoO2Z1bmN0aW9uIGZpbmlzaCgpe2lmKGZhaWw9PTApb25sb2FkKCk7ZWxzZSBvbmVycm9yKCl9cGF0aHMuZm9yRWFjaChwYXRoPT57dmFyIGdldFJlcXVlc3Q9ZmlsZXMuZ2V0KHBhdGgpO2dldFJlcXVlc3Qub25zdWNjZXNzPSgoKT0+e2lmKEZTLmFuYWx5emVQYXRoKHBhdGgpLmV4aXN0cyl7RlMudW5saW5rKHBhdGgpfUZTLmNyZWF0ZURhdGFGaWxlKFBBVEguZGlybmFtZShwYXRoKSxQQVRILmJhc2VuYW1lKHBhdGgpLGdldFJlcXVlc3QucmVzdWx0LHRydWUsdHJ1ZSx0cnVlKTtvaysrO2lmKG9rK2ZhaWw9PXRvdGFsKWZpbmlzaCgpfSk7Z2V0UmVxdWVzdC5vbmVycm9yPSgoKT0+e2ZhaWwrKztpZihvaytmYWlsPT10b3RhbClmaW5pc2goKX0pfSk7dHJhbnNhY3Rpb24ub25lcnJvcj1vbmVycm9yfSk7b3BlblJlcXVlc3Qub25lcnJvcj1vbmVycm9yfX07dmFyIFNZU0NBTExTPXtERUZBVUxUX1BPTExNQVNLOjUsY2FsY3VsYXRlQXQ6ZnVuY3Rpb24oZGlyZmQscGF0aCxhbGxvd0VtcHR5KXtpZihQQVRILmlzQWJzKHBhdGgpKXtyZXR1cm4gcGF0aH12YXIgZGlyO2lmKGRpcmZkPT09LTEwMCl7ZGlyPUZTLmN3ZCgpfWVsc2V7dmFyIGRpcnN0cmVhbT1GUy5nZXRTdHJlYW0oZGlyZmQpO2lmKCFkaXJzdHJlYW0pdGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCk7ZGlyPWRpcnN0cmVhbS5wYXRofWlmKHBhdGgubGVuZ3RoPT0wKXtpZighYWxsb3dFbXB0eSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfXJldHVybiBkaXJ9cmV0dXJuIFBBVEguam9pbjIoZGlyLHBhdGgpfSxkb1N0YXQ6ZnVuY3Rpb24oZnVuYyxwYXRoLGJ1Zil7dHJ5e3ZhciBzdGF0PWZ1bmMocGF0aCl9Y2F0Y2goZSl7aWYoZSYmZS5ub2RlJiZQQVRILm5vcm1hbGl6ZShwYXRoKSE9PVBBVEgubm9ybWFsaXplKEZTLmdldFBhdGgoZS5ub2RlKSkpe3JldHVybi01NH10aHJvdyBlfUhFQVAzMltidWY+PjJdPXN0YXQuZGV2O0hFQVAzMltidWYrND4+Ml09MDtIRUFQMzJbYnVmKzg+PjJdPXN0YXQuaW5vO0hFQVAzMltidWYrMTI+PjJdPXN0YXQubW9kZTtIRUFQMzJbYnVmKzE2Pj4yXT1zdGF0Lm5saW5rO0hFQVAzMltidWYrMjA+PjJdPXN0YXQudWlkO0hFQVAzMltidWYrMjQ+PjJdPXN0YXQuZ2lkO0hFQVAzMltidWYrMjg+PjJdPXN0YXQucmRldjtIRUFQMzJbYnVmKzMyPj4yXT0wO3RlbXBJNjQ9W3N0YXQuc2l6ZT4+PjAsKHRlbXBEb3VibGU9c3RhdC5zaXplLCtNYXRoLmFicyh0ZW1wRG91YmxlKT49MT90ZW1wRG91YmxlPjA/KE1hdGgubWluKCtNYXRoLmZsb29yKHRlbXBEb3VibGUvNDI5NDk2NzI5NiksNDI5NDk2NzI5NSl8MCk+Pj4wOn5+K01hdGguY2VpbCgodGVtcERvdWJsZS0rKH5+dGVtcERvdWJsZT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCldLEhFQVAzMltidWYrNDA+PjJdPXRlbXBJNjRbMF0sSEVBUDMyW2J1Zis0ND4+Ml09dGVtcEk2NFsxXTtIRUFQMzJbYnVmKzQ4Pj4yXT00MDk2O0hFQVAzMltidWYrNTI+PjJdPXN0YXQuYmxvY2tzO0hFQVAzMltidWYrNTY+PjJdPXN0YXQuYXRpbWUuZ2V0VGltZSgpLzFlM3wwO0hFQVAzMltidWYrNjA+PjJdPTA7SEVBUDMyW2J1Zis2ND4+Ml09c3RhdC5tdGltZS5nZXRUaW1lKCkvMWUzfDA7SEVBUDMyW2J1Zis2OD4+Ml09MDtIRUFQMzJbYnVmKzcyPj4yXT1zdGF0LmN0aW1lLmdldFRpbWUoKS8xZTN8MDtIRUFQMzJbYnVmKzc2Pj4yXT0wO3RlbXBJNjQ9W3N0YXQuaW5vPj4+MCwodGVtcERvdWJsZT1zdGF0LmlubywrTWF0aC5hYnModGVtcERvdWJsZSk+PTE/dGVtcERvdWJsZT4wPyhNYXRoLm1pbigrTWF0aC5mbG9vcih0ZW1wRG91YmxlLzQyOTQ5NjcyOTYpLDQyOTQ5NjcyOTUpfDApPj4+MDp+fitNYXRoLmNlaWwoKHRlbXBEb3VibGUtKyh+fnRlbXBEb3VibGU+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApXSxIRUFQMzJbYnVmKzgwPj4yXT10ZW1wSTY0WzBdLEhFQVAzMltidWYrODQ+PjJdPXRlbXBJNjRbMV07cmV0dXJuIDB9LGRvTXN5bmM6ZnVuY3Rpb24oYWRkcixzdHJlYW0sbGVuLGZsYWdzLG9mZnNldCl7dmFyIGJ1ZmZlcj1IRUFQVTguc2xpY2UoYWRkcixhZGRyK2xlbik7RlMubXN5bmMoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuLGZsYWdzKX0sdmFyYXJnczp1bmRlZmluZWQsZ2V0OmZ1bmN0aW9uKCl7U1lTQ0FMTFMudmFyYXJncys9NDt2YXIgcmV0PUhFQVAzMltTWVNDQUxMUy52YXJhcmdzLTQ+PjJdO3JldHVybiByZXR9LGdldFN0cjpmdW5jdGlvbihwdHIpe3ZhciByZXQ9VVRGOFRvU3RyaW5nKHB0cik7cmV0dXJuIHJldH0sZ2V0U3RyZWFtRnJvbUZEOmZ1bmN0aW9uKGZkKXt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoIXN0cmVhbSl0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KTtyZXR1cm4gc3RyZWFtfX07ZnVuY3Rpb24gX19fc3lzY2FsbF9mc3RhdDY0KGZkLGJ1Zil7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTtyZXR1cm4gU1lTQ0FMTFMuZG9TdGF0KEZTLnN0YXQsc3RyZWFtLnBhdGgsYnVmKX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX2Z0cnVuY2F0ZTY0KGZkLGxlbmd0aF9sb3csbGVuZ3RoX2hpZ2gpe3RyeXt2YXIgbGVuZ3RoPWxlbmd0aF9oaWdoKjQyOTQ5NjcyOTYrKGxlbmd0aF9sb3c+Pj4wKTtGUy5mdHJ1bmNhdGUoZmQsbGVuZ3RoKTtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX2xzdGF0NjQocGF0aCxidWYpe3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtyZXR1cm4gU1lTQ0FMTFMuZG9TdGF0KEZTLmxzdGF0LHBhdGgsYnVmKX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX25ld2ZzdGF0YXQoZGlyZmQscGF0aCxidWYsZmxhZ3Mpe3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTt2YXIgbm9mb2xsb3c9ZmxhZ3MmMjU2O3ZhciBhbGxvd0VtcHR5PWZsYWdzJjQwOTY7ZmxhZ3M9ZmxhZ3MmfjQzNTI7cGF0aD1TWVNDQUxMUy5jYWxjdWxhdGVBdChkaXJmZCxwYXRoLGFsbG93RW1wdHkpO3JldHVybiBTWVNDQUxMUy5kb1N0YXQobm9mb2xsb3c/RlMubHN0YXQ6RlMuc3RhdCxwYXRoLGJ1Zil9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9vcGVuYXQoZGlyZmQscGF0aCxmbGFncyx2YXJhcmdzKXtTWVNDQUxMUy52YXJhcmdzPXZhcmFyZ3M7dHJ5e3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKHBhdGgpO3BhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQoZGlyZmQscGF0aCk7dmFyIG1vZGU9dmFyYXJncz9TWVNDQUxMUy5nZXQoKTowO3JldHVybiBGUy5vcGVuKHBhdGgsZmxhZ3MsbW9kZSkuZmR9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9yZW5hbWVhdChvbGRkaXJmZCxvbGRwYXRoLG5ld2RpcmZkLG5ld3BhdGgpe3RyeXtvbGRwYXRoPVNZU0NBTExTLmdldFN0cihvbGRwYXRoKTtuZXdwYXRoPVNZU0NBTExTLmdldFN0cihuZXdwYXRoKTtvbGRwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KG9sZGRpcmZkLG9sZHBhdGgpO25ld3BhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQobmV3ZGlyZmQsbmV3cGF0aCk7RlMucmVuYW1lKG9sZHBhdGgsbmV3cGF0aCk7cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9zdGF0NjQocGF0aCxidWYpe3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtyZXR1cm4gU1lTQ0FMTFMuZG9TdGF0KEZTLnN0YXQscGF0aCxidWYpfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfdW5saW5rYXQoZGlyZmQscGF0aCxmbGFncyl7dHJ5e3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKHBhdGgpO3BhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQoZGlyZmQscGF0aCk7aWYoZmxhZ3M9PT0wKXtGUy51bmxpbmsocGF0aCl9ZWxzZSBpZihmbGFncz09PTUxMil7RlMucm1kaXIocGF0aCl9ZWxzZXthYm9ydCgiSW52YWxpZCBmbGFncyBwYXNzZWQgdG8gdW5saW5rYXQiKX1yZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX2RsaW5pdChtYWluX2Rzb19oYW5kbGUpe312YXIgZGxvcGVuTWlzc2luZ0Vycm9yPSJUbyB1c2UgZGxvcGVuLCB5b3UgbmVlZCBlbmFibGUgZHluYW1pYyBsaW5raW5nLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2Vtc2NyaXB0ZW4tY29yZS9lbXNjcmlwdGVuL3dpa2kvTGlua2luZyI7ZnVuY3Rpb24gX19kbG9wZW5fanMoZmlsZW5hbWUsZmxhZyl7YWJvcnQoZGxvcGVuTWlzc2luZ0Vycm9yKX1mdW5jdGlvbiBfX2Rsc3ltX2pzKGhhbmRsZSxzeW1ib2wpe2Fib3J0KGRsb3Blbk1pc3NpbmdFcnJvcil9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfYmlnaW50KHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKXt9ZnVuY3Rpb24gZ2V0U2hpZnRGcm9tU2l6ZShzaXplKXtzd2l0Y2goc2l6ZSl7Y2FzZSAxOnJldHVybiAwO2Nhc2UgMjpyZXR1cm4gMTtjYXNlIDQ6cmV0dXJuIDI7Y2FzZSA4OnJldHVybiAzO2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcigiVW5rbm93biB0eXBlIHNpemU6ICIrc2l6ZSl9fWZ1bmN0aW9uIGVtYmluZF9pbml0X2NoYXJDb2Rlcygpe3ZhciBjb2Rlcz1uZXcgQXJyYXkoMjU2KTtmb3IodmFyIGk9MDtpPDI1NjsrK2kpe2NvZGVzW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoaSl9ZW1iaW5kX2NoYXJDb2Rlcz1jb2Rlc312YXIgZW1iaW5kX2NoYXJDb2Rlcz11bmRlZmluZWQ7ZnVuY3Rpb24gcmVhZExhdGluMVN0cmluZyhwdHIpe3ZhciByZXQ9IiI7dmFyIGM9cHRyO3doaWxlKEhFQVBVOFtjXSl7cmV0Kz1lbWJpbmRfY2hhckNvZGVzW0hFQVBVOFtjKytdXX1yZXR1cm4gcmV0fXZhciBhd2FpdGluZ0RlcGVuZGVuY2llcz17fTt2YXIgcmVnaXN0ZXJlZFR5cGVzPXt9O3ZhciB0eXBlRGVwZW5kZW5jaWVzPXt9O3ZhciBjaGFyXzA9NDg7dmFyIGNoYXJfOT01NztmdW5jdGlvbiBtYWtlTGVnYWxGdW5jdGlvbk5hbWUobmFtZSl7aWYodW5kZWZpbmVkPT09bmFtZSl7cmV0dXJuIl91bmtub3duIn1uYW1lPW5hbWUucmVwbGFjZSgvW15hLXpBLVowLTlfXS9nLCIkIik7dmFyIGY9bmFtZS5jaGFyQ29kZUF0KDApO2lmKGY+PWNoYXJfMCYmZjw9Y2hhcl85KXtyZXR1cm4iXyIrbmFtZX1yZXR1cm4gbmFtZX1mdW5jdGlvbiBjcmVhdGVOYW1lZEZ1bmN0aW9uKG5hbWUsYm9keSl7bmFtZT1tYWtlTGVnYWxGdW5jdGlvbk5hbWUobmFtZSk7cmV0dXJuIG5ldyBGdW5jdGlvbigiYm9keSIsInJldHVybiBmdW5jdGlvbiAiK25hbWUrIigpIHtcbiIrJyAgICAidXNlIHN0cmljdCI7JysiICAgIHJldHVybiBib2R5LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4iKyJ9O1xuIikoYm9keSl9ZnVuY3Rpb24gZXh0ZW5kRXJyb3IoYmFzZUVycm9yVHlwZSxlcnJvck5hbWUpe3ZhciBlcnJvckNsYXNzPWNyZWF0ZU5hbWVkRnVuY3Rpb24oZXJyb3JOYW1lLGZ1bmN0aW9uKG1lc3NhZ2Upe3RoaXMubmFtZT1lcnJvck5hbWU7dGhpcy5tZXNzYWdlPW1lc3NhZ2U7dmFyIHN0YWNrPW5ldyBFcnJvcihtZXNzYWdlKS5zdGFjaztpZihzdGFjayE9PXVuZGVmaW5lZCl7dGhpcy5zdGFjaz10aGlzLnRvU3RyaW5nKCkrIlxuIitzdGFjay5yZXBsYWNlKC9eRXJyb3IoOlteXG5dKik/XG4vLCIiKX19KTtlcnJvckNsYXNzLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGJhc2VFcnJvclR5cGUucHJvdG90eXBlKTtlcnJvckNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1lcnJvckNsYXNzO2Vycm9yQ2xhc3MucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7aWYodGhpcy5tZXNzYWdlPT09dW5kZWZpbmVkKXtyZXR1cm4gdGhpcy5uYW1lfWVsc2V7cmV0dXJuIHRoaXMubmFtZSsiOiAiK3RoaXMubWVzc2FnZX19O3JldHVybiBlcnJvckNsYXNzfXZhciBCaW5kaW5nRXJyb3I9dW5kZWZpbmVkO2Z1bmN0aW9uIHRocm93QmluZGluZ0Vycm9yKG1lc3NhZ2Upe3Rocm93IG5ldyBCaW5kaW5nRXJyb3IobWVzc2FnZSl9dmFyIEludGVybmFsRXJyb3I9dW5kZWZpbmVkO2Z1bmN0aW9uIHRocm93SW50ZXJuYWxFcnJvcihtZXNzYWdlKXt0aHJvdyBuZXcgSW50ZXJuYWxFcnJvcihtZXNzYWdlKX1mdW5jdGlvbiB3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChteVR5cGVzLGRlcGVuZGVudFR5cGVzLGdldFR5cGVDb252ZXJ0ZXJzKXtteVR5cGVzLmZvckVhY2goZnVuY3Rpb24odHlwZSl7dHlwZURlcGVuZGVuY2llc1t0eXBlXT1kZXBlbmRlbnRUeXBlc30pO2Z1bmN0aW9uIG9uQ29tcGxldGUodHlwZUNvbnZlcnRlcnMpe3ZhciBteVR5cGVDb252ZXJ0ZXJzPWdldFR5cGVDb252ZXJ0ZXJzKHR5cGVDb252ZXJ0ZXJzKTtpZihteVR5cGVDb252ZXJ0ZXJzLmxlbmd0aCE9PW15VHlwZXMubGVuZ3RoKXt0aHJvd0ludGVybmFsRXJyb3IoIk1pc21hdGNoZWQgdHlwZSBjb252ZXJ0ZXIgY291bnQiKX1mb3IodmFyIGk9MDtpPG15VHlwZXMubGVuZ3RoOysraSl7cmVnaXN0ZXJUeXBlKG15VHlwZXNbaV0sbXlUeXBlQ29udmVydGVyc1tpXSl9fXZhciB0eXBlQ29udmVydGVycz1uZXcgQXJyYXkoZGVwZW5kZW50VHlwZXMubGVuZ3RoKTt2YXIgdW5yZWdpc3RlcmVkVHlwZXM9W107dmFyIHJlZ2lzdGVyZWQ9MDtkZXBlbmRlbnRUeXBlcy5mb3JFYWNoKChkdCxpKT0+e2lmKHJlZ2lzdGVyZWRUeXBlcy5oYXNPd25Qcm9wZXJ0eShkdCkpe3R5cGVDb252ZXJ0ZXJzW2ldPXJlZ2lzdGVyZWRUeXBlc1tkdF19ZWxzZXt1bnJlZ2lzdGVyZWRUeXBlcy5wdXNoKGR0KTtpZighYXdhaXRpbmdEZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoZHQpKXthd2FpdGluZ0RlcGVuZGVuY2llc1tkdF09W119YXdhaXRpbmdEZXBlbmRlbmNpZXNbZHRdLnB1c2goKCk9Pnt0eXBlQ29udmVydGVyc1tpXT1yZWdpc3RlcmVkVHlwZXNbZHRdOysrcmVnaXN0ZXJlZDtpZihyZWdpc3RlcmVkPT09dW5yZWdpc3RlcmVkVHlwZXMubGVuZ3RoKXtvbkNvbXBsZXRlKHR5cGVDb252ZXJ0ZXJzKX19KX19KTtpZigwPT09dW5yZWdpc3RlcmVkVHlwZXMubGVuZ3RoKXtvbkNvbXBsZXRlKHR5cGVDb252ZXJ0ZXJzKX19ZnVuY3Rpb24gcmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnM9e30pe2lmKCEoImFyZ1BhY2tBZHZhbmNlImluIHJlZ2lzdGVyZWRJbnN0YW5jZSkpe3Rocm93IG5ldyBUeXBlRXJyb3IoInJlZ2lzdGVyVHlwZSByZWdpc3RlcmVkSW5zdGFuY2UgcmVxdWlyZXMgYXJnUGFja0FkdmFuY2UiKX12YXIgbmFtZT1yZWdpc3RlcmVkSW5zdGFuY2UubmFtZTtpZighcmF3VHlwZSl7dGhyb3dCaW5kaW5nRXJyb3IoJ3R5cGUgIicrbmFtZSsnIiBtdXN0IGhhdmUgYSBwb3NpdGl2ZSBpbnRlZ2VyIHR5cGVpZCBwb2ludGVyJyl9aWYocmVnaXN0ZXJlZFR5cGVzLmhhc093blByb3BlcnR5KHJhd1R5cGUpKXtpZihvcHRpb25zLmlnbm9yZUR1cGxpY2F0ZVJlZ2lzdHJhdGlvbnMpe3JldHVybn1lbHNle3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcmVnaXN0ZXIgdHlwZSAnIituYW1lKyInIHR3aWNlIil9fXJlZ2lzdGVyZWRUeXBlc1tyYXdUeXBlXT1yZWdpc3RlcmVkSW5zdGFuY2U7ZGVsZXRlIHR5cGVEZXBlbmRlbmNpZXNbcmF3VHlwZV07aWYoYXdhaXRpbmdEZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkocmF3VHlwZSkpe3ZhciBjYWxsYmFja3M9YXdhaXRpbmdEZXBlbmRlbmNpZXNbcmF3VHlwZV07ZGVsZXRlIGF3YWl0aW5nRGVwZW5kZW5jaWVzW3Jhd1R5cGVdO2NhbGxiYWNrcy5mb3JFYWNoKGNiPT5jYigpKX19ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfYm9vbChyYXdUeXBlLG5hbWUsc2l6ZSx0cnVlVmFsdWUsZmFsc2VWYWx1ZSl7dmFyIHNoaWZ0PWdldFNoaWZ0RnJvbVNpemUoc2l6ZSk7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24od3Qpe3JldHVybiEhd3R9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyxvKXtyZXR1cm4gbz90cnVlVmFsdWU6ZmFsc2VWYWx1ZX0sImFyZ1BhY2tBZHZhbmNlIjo4LCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZnVuY3Rpb24ocG9pbnRlcil7dmFyIGhlYXA7aWYoc2l6ZT09PTEpe2hlYXA9SEVBUDh9ZWxzZSBpZihzaXplPT09Mil7aGVhcD1IRUFQMTZ9ZWxzZSBpZihzaXplPT09NCl7aGVhcD1IRUFQMzJ9ZWxzZXt0aHJvdyBuZXcgVHlwZUVycm9yKCJVbmtub3duIGJvb2xlYW4gdHlwZSBzaXplOiAiK25hbWUpfXJldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShoZWFwW3BvaW50ZXI+PnNoaWZ0XSl9LGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSl9ZnVuY3Rpb24gQ2xhc3NIYW5kbGVfaXNBbGlhc09mKG90aGVyKXtpZighKHRoaXMgaW5zdGFuY2VvZiBDbGFzc0hhbmRsZSkpe3JldHVybiBmYWxzZX1pZighKG90aGVyIGluc3RhbmNlb2YgQ2xhc3NIYW5kbGUpKXtyZXR1cm4gZmFsc2V9dmFyIGxlZnRDbGFzcz10aGlzLiQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzO3ZhciBsZWZ0PXRoaXMuJCQucHRyO3ZhciByaWdodENsYXNzPW90aGVyLiQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzO3ZhciByaWdodD1vdGhlci4kJC5wdHI7d2hpbGUobGVmdENsYXNzLmJhc2VDbGFzcyl7bGVmdD1sZWZ0Q2xhc3MudXBjYXN0KGxlZnQpO2xlZnRDbGFzcz1sZWZ0Q2xhc3MuYmFzZUNsYXNzfXdoaWxlKHJpZ2h0Q2xhc3MuYmFzZUNsYXNzKXtyaWdodD1yaWdodENsYXNzLnVwY2FzdChyaWdodCk7cmlnaHRDbGFzcz1yaWdodENsYXNzLmJhc2VDbGFzc31yZXR1cm4gbGVmdENsYXNzPT09cmlnaHRDbGFzcyYmbGVmdD09PXJpZ2h0fWZ1bmN0aW9uIHNoYWxsb3dDb3B5SW50ZXJuYWxQb2ludGVyKG8pe3JldHVybntjb3VudDpvLmNvdW50LGRlbGV0ZVNjaGVkdWxlZDpvLmRlbGV0ZVNjaGVkdWxlZCxwcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZTpvLnByZXNlcnZlUG9pbnRlck9uRGVsZXRlLHB0cjpvLnB0cixwdHJUeXBlOm8ucHRyVHlwZSxzbWFydFB0cjpvLnNtYXJ0UHRyLHNtYXJ0UHRyVHlwZTpvLnNtYXJ0UHRyVHlwZX19ZnVuY3Rpb24gdGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkKG9iail7ZnVuY3Rpb24gZ2V0SW5zdGFuY2VUeXBlTmFtZShoYW5kbGUpe3JldHVybiBoYW5kbGUuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3MubmFtZX10aHJvd0JpbmRpbmdFcnJvcihnZXRJbnN0YW5jZVR5cGVOYW1lKG9iaikrIiBpbnN0YW5jZSBhbHJlYWR5IGRlbGV0ZWQiKX12YXIgZmluYWxpemF0aW9uUmVnaXN0cnk9ZmFsc2U7ZnVuY3Rpb24gZGV0YWNoRmluYWxpemVyKGhhbmRsZSl7fWZ1bmN0aW9uIHJ1bkRlc3RydWN0b3IoJCQpe2lmKCQkLnNtYXJ0UHRyKXskJC5zbWFydFB0clR5cGUucmF3RGVzdHJ1Y3RvcigkJC5zbWFydFB0cil9ZWxzZXskJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzcy5yYXdEZXN0cnVjdG9yKCQkLnB0cil9fWZ1bmN0aW9uIHJlbGVhc2VDbGFzc0hhbmRsZSgkJCl7JCQuY291bnQudmFsdWUtPTE7dmFyIHRvRGVsZXRlPTA9PT0kJC5jb3VudC52YWx1ZTtpZih0b0RlbGV0ZSl7cnVuRGVzdHJ1Y3RvcigkJCl9fWZ1bmN0aW9uIGRvd25jYXN0UG9pbnRlcihwdHIscHRyQ2xhc3MsZGVzaXJlZENsYXNzKXtpZihwdHJDbGFzcz09PWRlc2lyZWRDbGFzcyl7cmV0dXJuIHB0cn1pZih1bmRlZmluZWQ9PT1kZXNpcmVkQ2xhc3MuYmFzZUNsYXNzKXtyZXR1cm4gbnVsbH12YXIgcnY9ZG93bmNhc3RQb2ludGVyKHB0cixwdHJDbGFzcyxkZXNpcmVkQ2xhc3MuYmFzZUNsYXNzKTtpZihydj09PW51bGwpe3JldHVybiBudWxsfXJldHVybiBkZXNpcmVkQ2xhc3MuZG93bmNhc3QocnYpfXZhciByZWdpc3RlcmVkUG9pbnRlcnM9e307ZnVuY3Rpb24gZ2V0SW5oZXJpdGVkSW5zdGFuY2VDb3VudCgpe3JldHVybiBPYmplY3Qua2V5cyhyZWdpc3RlcmVkSW5zdGFuY2VzKS5sZW5ndGh9ZnVuY3Rpb24gZ2V0TGl2ZUluaGVyaXRlZEluc3RhbmNlcygpe3ZhciBydj1bXTtmb3IodmFyIGsgaW4gcmVnaXN0ZXJlZEluc3RhbmNlcyl7aWYocmVnaXN0ZXJlZEluc3RhbmNlcy5oYXNPd25Qcm9wZXJ0eShrKSl7cnYucHVzaChyZWdpc3RlcmVkSW5zdGFuY2VzW2tdKX19cmV0dXJuIHJ2fXZhciBkZWxldGlvblF1ZXVlPVtdO2Z1bmN0aW9uIGZsdXNoUGVuZGluZ0RlbGV0ZXMoKXt3aGlsZShkZWxldGlvblF1ZXVlLmxlbmd0aCl7dmFyIG9iaj1kZWxldGlvblF1ZXVlLnBvcCgpO29iai4kJC5kZWxldGVTY2hlZHVsZWQ9ZmFsc2U7b2JqWyJkZWxldGUiXSgpfX12YXIgZGVsYXlGdW5jdGlvbj11bmRlZmluZWQ7ZnVuY3Rpb24gc2V0RGVsYXlGdW5jdGlvbihmbil7ZGVsYXlGdW5jdGlvbj1mbjtpZihkZWxldGlvblF1ZXVlLmxlbmd0aCYmZGVsYXlGdW5jdGlvbil7ZGVsYXlGdW5jdGlvbihmbHVzaFBlbmRpbmdEZWxldGVzKX19ZnVuY3Rpb24gaW5pdF9lbWJpbmQoKXtNb2R1bGVbImdldEluaGVyaXRlZEluc3RhbmNlQ291bnQiXT1nZXRJbmhlcml0ZWRJbnN0YW5jZUNvdW50O01vZHVsZVsiZ2V0TGl2ZUluaGVyaXRlZEluc3RhbmNlcyJdPWdldExpdmVJbmhlcml0ZWRJbnN0YW5jZXM7TW9kdWxlWyJmbHVzaFBlbmRpbmdEZWxldGVzIl09Zmx1c2hQZW5kaW5nRGVsZXRlcztNb2R1bGVbInNldERlbGF5RnVuY3Rpb24iXT1zZXREZWxheUZ1bmN0aW9ufXZhciByZWdpc3RlcmVkSW5zdGFuY2VzPXt9O2Z1bmN0aW9uIGdldEJhc2VzdFBvaW50ZXIoY2xhc3NfLHB0cil7aWYocHRyPT09dW5kZWZpbmVkKXt0aHJvd0JpbmRpbmdFcnJvcigicHRyIHNob3VsZCBub3QgYmUgdW5kZWZpbmVkIil9d2hpbGUoY2xhc3NfLmJhc2VDbGFzcyl7cHRyPWNsYXNzXy51cGNhc3QocHRyKTtjbGFzc189Y2xhc3NfLmJhc2VDbGFzc31yZXR1cm4gcHRyfWZ1bmN0aW9uIGdldEluaGVyaXRlZEluc3RhbmNlKGNsYXNzXyxwdHIpe3B0cj1nZXRCYXNlc3RQb2ludGVyKGNsYXNzXyxwdHIpO3JldHVybiByZWdpc3RlcmVkSW5zdGFuY2VzW3B0cl19ZnVuY3Rpb24gbWFrZUNsYXNzSGFuZGxlKHByb3RvdHlwZSxyZWNvcmQpe2lmKCFyZWNvcmQucHRyVHlwZXx8IXJlY29yZC5wdHIpe3Rocm93SW50ZXJuYWxFcnJvcigibWFrZUNsYXNzSGFuZGxlIHJlcXVpcmVzIHB0ciBhbmQgcHRyVHlwZSIpfXZhciBoYXNTbWFydFB0clR5cGU9ISFyZWNvcmQuc21hcnRQdHJUeXBlO3ZhciBoYXNTbWFydFB0cj0hIXJlY29yZC5zbWFydFB0cjtpZihoYXNTbWFydFB0clR5cGUhPT1oYXNTbWFydFB0cil7dGhyb3dJbnRlcm5hbEVycm9yKCJCb3RoIHNtYXJ0UHRyVHlwZSBhbmQgc21hcnRQdHIgbXVzdCBiZSBzcGVjaWZpZWQiKX1yZWNvcmQuY291bnQ9e3ZhbHVlOjF9O3JldHVybiBhdHRhY2hGaW5hbGl6ZXIoT2JqZWN0LmNyZWF0ZShwcm90b3R5cGUseyQkOnt2YWx1ZTpyZWNvcmR9fSkpfWZ1bmN0aW9uIFJlZ2lzdGVyZWRQb2ludGVyX2Zyb21XaXJlVHlwZShwdHIpe3ZhciByYXdQb2ludGVyPXRoaXMuZ2V0UG9pbnRlZShwdHIpO2lmKCFyYXdQb2ludGVyKXt0aGlzLmRlc3RydWN0b3IocHRyKTtyZXR1cm4gbnVsbH12YXIgcmVnaXN0ZXJlZEluc3RhbmNlPWdldEluaGVyaXRlZEluc3RhbmNlKHRoaXMucmVnaXN0ZXJlZENsYXNzLHJhd1BvaW50ZXIpO2lmKHVuZGVmaW5lZCE9PXJlZ2lzdGVyZWRJbnN0YW5jZSl7aWYoMD09PXJlZ2lzdGVyZWRJbnN0YW5jZS4kJC5jb3VudC52YWx1ZSl7cmVnaXN0ZXJlZEluc3RhbmNlLiQkLnB0cj1yYXdQb2ludGVyO3JlZ2lzdGVyZWRJbnN0YW5jZS4kJC5zbWFydFB0cj1wdHI7cmV0dXJuIHJlZ2lzdGVyZWRJbnN0YW5jZVsiY2xvbmUiXSgpfWVsc2V7dmFyIHJ2PXJlZ2lzdGVyZWRJbnN0YW5jZVsiY2xvbmUiXSgpO3RoaXMuZGVzdHJ1Y3RvcihwdHIpO3JldHVybiBydn19ZnVuY3Rpb24gbWFrZURlZmF1bHRIYW5kbGUoKXtpZih0aGlzLmlzU21hcnRQb2ludGVyKXtyZXR1cm4gbWFrZUNsYXNzSGFuZGxlKHRoaXMucmVnaXN0ZXJlZENsYXNzLmluc3RhbmNlUHJvdG90eXBlLHtwdHJUeXBlOnRoaXMucG9pbnRlZVR5cGUscHRyOnJhd1BvaW50ZXIsc21hcnRQdHJUeXBlOnRoaXMsc21hcnRQdHI6cHRyfSl9ZWxzZXtyZXR1cm4gbWFrZUNsYXNzSGFuZGxlKHRoaXMucmVnaXN0ZXJlZENsYXNzLmluc3RhbmNlUHJvdG90eXBlLHtwdHJUeXBlOnRoaXMscHRyOnB0cn0pfX12YXIgYWN0dWFsVHlwZT10aGlzLnJlZ2lzdGVyZWRDbGFzcy5nZXRBY3R1YWxUeXBlKHJhd1BvaW50ZXIpO3ZhciByZWdpc3RlcmVkUG9pbnRlclJlY29yZD1yZWdpc3RlcmVkUG9pbnRlcnNbYWN0dWFsVHlwZV07aWYoIXJlZ2lzdGVyZWRQb2ludGVyUmVjb3JkKXtyZXR1cm4gbWFrZURlZmF1bHRIYW5kbGUuY2FsbCh0aGlzKX12YXIgdG9UeXBlO2lmKHRoaXMuaXNDb25zdCl7dG9UeXBlPXJlZ2lzdGVyZWRQb2ludGVyUmVjb3JkLmNvbnN0UG9pbnRlclR5cGV9ZWxzZXt0b1R5cGU9cmVnaXN0ZXJlZFBvaW50ZXJSZWNvcmQucG9pbnRlclR5cGV9dmFyIGRwPWRvd25jYXN0UG9pbnRlcihyYXdQb2ludGVyLHRoaXMucmVnaXN0ZXJlZENsYXNzLHRvVHlwZS5yZWdpc3RlcmVkQ2xhc3MpO2lmKGRwPT09bnVsbCl7cmV0dXJuIG1ha2VEZWZhdWx0SGFuZGxlLmNhbGwodGhpcyl9aWYodGhpcy5pc1NtYXJ0UG9pbnRlcil7cmV0dXJuIG1ha2VDbGFzc0hhbmRsZSh0b1R5cGUucmVnaXN0ZXJlZENsYXNzLmluc3RhbmNlUHJvdG90eXBlLHtwdHJUeXBlOnRvVHlwZSxwdHI6ZHAsc21hcnRQdHJUeXBlOnRoaXMsc21hcnRQdHI6cHRyfSl9ZWxzZXtyZXR1cm4gbWFrZUNsYXNzSGFuZGxlKHRvVHlwZS5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGUse3B0clR5cGU6dG9UeXBlLHB0cjpkcH0pfX1mdW5jdGlvbiBhdHRhY2hGaW5hbGl6ZXIoaGFuZGxlKXtpZigidW5kZWZpbmVkIj09PXR5cGVvZiBGaW5hbGl6YXRpb25SZWdpc3RyeSl7YXR0YWNoRmluYWxpemVyPShoYW5kbGU9PmhhbmRsZSk7cmV0dXJuIGhhbmRsZX1maW5hbGl6YXRpb25SZWdpc3RyeT1uZXcgRmluYWxpemF0aW9uUmVnaXN0cnkoaW5mbz0+e3JlbGVhc2VDbGFzc0hhbmRsZShpbmZvLiQkKX0pO2F0dGFjaEZpbmFsaXplcj0oaGFuZGxlPT57dmFyICQkPWhhbmRsZS4kJDt2YXIgaGFzU21hcnRQdHI9ISEkJC5zbWFydFB0cjtpZihoYXNTbWFydFB0cil7dmFyIGluZm89eyQkOiQkfTtmaW5hbGl6YXRpb25SZWdpc3RyeS5yZWdpc3RlcihoYW5kbGUsaW5mbyxoYW5kbGUpfXJldHVybiBoYW5kbGV9KTtkZXRhY2hGaW5hbGl6ZXI9KGhhbmRsZT0+ZmluYWxpemF0aW9uUmVnaXN0cnkudW5yZWdpc3RlcihoYW5kbGUpKTtyZXR1cm4gYXR0YWNoRmluYWxpemVyKGhhbmRsZSl9ZnVuY3Rpb24gQ2xhc3NIYW5kbGVfY2xvbmUoKXtpZighdGhpcy4kJC5wdHIpe3Rocm93SW5zdGFuY2VBbHJlYWR5RGVsZXRlZCh0aGlzKX1pZih0aGlzLiQkLnByZXNlcnZlUG9pbnRlck9uRGVsZXRlKXt0aGlzLiQkLmNvdW50LnZhbHVlKz0xO3JldHVybiB0aGlzfWVsc2V7dmFyIGNsb25lPWF0dGFjaEZpbmFsaXplcihPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSx7JCQ6e3ZhbHVlOnNoYWxsb3dDb3B5SW50ZXJuYWxQb2ludGVyKHRoaXMuJCQpfX0pKTtjbG9uZS4kJC5jb3VudC52YWx1ZSs9MTtjbG9uZS4kJC5kZWxldGVTY2hlZHVsZWQ9ZmFsc2U7cmV0dXJuIGNsb25lfX1mdW5jdGlvbiBDbGFzc0hhbmRsZV9kZWxldGUoKXtpZighdGhpcy4kJC5wdHIpe3Rocm93SW5zdGFuY2VBbHJlYWR5RGVsZXRlZCh0aGlzKX1pZih0aGlzLiQkLmRlbGV0ZVNjaGVkdWxlZCYmIXRoaXMuJCQucHJlc2VydmVQb2ludGVyT25EZWxldGUpe3Rocm93QmluZGluZ0Vycm9yKCJPYmplY3QgYWxyZWFkeSBzY2hlZHVsZWQgZm9yIGRlbGV0aW9uIil9ZGV0YWNoRmluYWxpemVyKHRoaXMpO3JlbGVhc2VDbGFzc0hhbmRsZSh0aGlzLiQkKTtpZighdGhpcy4kJC5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSl7dGhpcy4kJC5zbWFydFB0cj11bmRlZmluZWQ7dGhpcy4kJC5wdHI9dW5kZWZpbmVkfX1mdW5jdGlvbiBDbGFzc0hhbmRsZV9pc0RlbGV0ZWQoKXtyZXR1cm4hdGhpcy4kJC5wdHJ9ZnVuY3Rpb24gQ2xhc3NIYW5kbGVfZGVsZXRlTGF0ZXIoKXtpZighdGhpcy4kJC5wdHIpe3Rocm93SW5zdGFuY2VBbHJlYWR5RGVsZXRlZCh0aGlzKX1pZih0aGlzLiQkLmRlbGV0ZVNjaGVkdWxlZCYmIXRoaXMuJCQucHJlc2VydmVQb2ludGVyT25EZWxldGUpe3Rocm93QmluZGluZ0Vycm9yKCJPYmplY3QgYWxyZWFkeSBzY2hlZHVsZWQgZm9yIGRlbGV0aW9uIil9ZGVsZXRpb25RdWV1ZS5wdXNoKHRoaXMpO2lmKGRlbGV0aW9uUXVldWUubGVuZ3RoPT09MSYmZGVsYXlGdW5jdGlvbil7ZGVsYXlGdW5jdGlvbihmbHVzaFBlbmRpbmdEZWxldGVzKX10aGlzLiQkLmRlbGV0ZVNjaGVkdWxlZD10cnVlO3JldHVybiB0aGlzfWZ1bmN0aW9uIGluaXRfQ2xhc3NIYW5kbGUoKXtDbGFzc0hhbmRsZS5wcm90b3R5cGVbImlzQWxpYXNPZiJdPUNsYXNzSGFuZGxlX2lzQWxpYXNPZjtDbGFzc0hhbmRsZS5wcm90b3R5cGVbImNsb25lIl09Q2xhc3NIYW5kbGVfY2xvbmU7Q2xhc3NIYW5kbGUucHJvdG90eXBlWyJkZWxldGUiXT1DbGFzc0hhbmRsZV9kZWxldGU7Q2xhc3NIYW5kbGUucHJvdG90eXBlWyJpc0RlbGV0ZWQiXT1DbGFzc0hhbmRsZV9pc0RlbGV0ZWQ7Q2xhc3NIYW5kbGUucHJvdG90eXBlWyJkZWxldGVMYXRlciJdPUNsYXNzSGFuZGxlX2RlbGV0ZUxhdGVyfWZ1bmN0aW9uIENsYXNzSGFuZGxlKCl7fWZ1bmN0aW9uIGVuc3VyZU92ZXJsb2FkVGFibGUocHJvdG8sbWV0aG9kTmFtZSxodW1hbk5hbWUpe2lmKHVuZGVmaW5lZD09PXByb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGUpe3ZhciBwcmV2RnVuYz1wcm90b1ttZXRob2ROYW1lXTtwcm90b1ttZXRob2ROYW1lXT1mdW5jdGlvbigpe2lmKCFwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlLmhhc093blByb3BlcnR5KGFyZ3VtZW50cy5sZW5ndGgpKXt0aHJvd0JpbmRpbmdFcnJvcigiRnVuY3Rpb24gJyIraHVtYW5OYW1lKyInIGNhbGxlZCB3aXRoIGFuIGludmFsaWQgbnVtYmVyIG9mIGFyZ3VtZW50cyAoIithcmd1bWVudHMubGVuZ3RoKyIpIC0gZXhwZWN0cyBvbmUgb2YgKCIrcHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZSsiKSEiKX1yZXR1cm4gcHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZVthcmd1bWVudHMubGVuZ3RoXS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O3Byb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGU9W107cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZVtwcmV2RnVuYy5hcmdDb3VudF09cHJldkZ1bmN9fWZ1bmN0aW9uIGV4cG9zZVB1YmxpY1N5bWJvbChuYW1lLHZhbHVlLG51bUFyZ3VtZW50cyl7aWYoTW9kdWxlLmhhc093blByb3BlcnR5KG5hbWUpKXtpZih1bmRlZmluZWQ9PT1udW1Bcmd1bWVudHN8fHVuZGVmaW5lZCE9PU1vZHVsZVtuYW1lXS5vdmVybG9hZFRhYmxlJiZ1bmRlZmluZWQhPT1Nb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZVtudW1Bcmd1bWVudHNdKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHJlZ2lzdGVyIHB1YmxpYyBuYW1lICciK25hbWUrIicgdHdpY2UiKX1lbnN1cmVPdmVybG9hZFRhYmxlKE1vZHVsZSxuYW1lLG5hbWUpO2lmKE1vZHVsZS5oYXNPd25Qcm9wZXJ0eShudW1Bcmd1bWVudHMpKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHJlZ2lzdGVyIG11bHRpcGxlIG92ZXJsb2FkcyBvZiBhIGZ1bmN0aW9uIHdpdGggdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50cyAoIitudW1Bcmd1bWVudHMrIikhIil9TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGVbbnVtQXJndW1lbnRzXT12YWx1ZX1lbHNle01vZHVsZVtuYW1lXT12YWx1ZTtpZih1bmRlZmluZWQhPT1udW1Bcmd1bWVudHMpe01vZHVsZVtuYW1lXS5udW1Bcmd1bWVudHM9bnVtQXJndW1lbnRzfX19ZnVuY3Rpb24gUmVnaXN0ZXJlZENsYXNzKG5hbWUsY29uc3RydWN0b3IsaW5zdGFuY2VQcm90b3R5cGUscmF3RGVzdHJ1Y3RvcixiYXNlQ2xhc3MsZ2V0QWN0dWFsVHlwZSx1cGNhc3QsZG93bmNhc3Qpe3RoaXMubmFtZT1uYW1lO3RoaXMuY29uc3RydWN0b3I9Y29uc3RydWN0b3I7dGhpcy5pbnN0YW5jZVByb3RvdHlwZT1pbnN0YW5jZVByb3RvdHlwZTt0aGlzLnJhd0Rlc3RydWN0b3I9cmF3RGVzdHJ1Y3Rvcjt0aGlzLmJhc2VDbGFzcz1iYXNlQ2xhc3M7dGhpcy5nZXRBY3R1YWxUeXBlPWdldEFjdHVhbFR5cGU7dGhpcy51cGNhc3Q9dXBjYXN0O3RoaXMuZG93bmNhc3Q9ZG93bmNhc3Q7dGhpcy5wdXJlVmlydHVhbEZ1bmN0aW9ucz1bXX1mdW5jdGlvbiB1cGNhc3RQb2ludGVyKHB0cixwdHJDbGFzcyxkZXNpcmVkQ2xhc3Mpe3doaWxlKHB0ckNsYXNzIT09ZGVzaXJlZENsYXNzKXtpZighcHRyQ2xhc3MudXBjYXN0KXt0aHJvd0JpbmRpbmdFcnJvcigiRXhwZWN0ZWQgbnVsbCBvciBpbnN0YW5jZSBvZiAiK2Rlc2lyZWRDbGFzcy5uYW1lKyIsIGdvdCBhbiBpbnN0YW5jZSBvZiAiK3B0ckNsYXNzLm5hbWUpfXB0cj1wdHJDbGFzcy51cGNhc3QocHRyKTtwdHJDbGFzcz1wdHJDbGFzcy5iYXNlQ2xhc3N9cmV0dXJuIHB0cn1mdW5jdGlvbiBjb25zdE5vU21hcnRQdHJSYXdQb2ludGVyVG9XaXJlVHlwZShkZXN0cnVjdG9ycyxoYW5kbGUpe2lmKGhhbmRsZT09PW51bGwpe2lmKHRoaXMuaXNSZWZlcmVuY2Upe3Rocm93QmluZGluZ0Vycm9yKCJudWxsIGlzIG5vdCBhIHZhbGlkICIrdGhpcy5uYW1lKX1yZXR1cm4gMH1pZighaGFuZGxlLiQkKXt0aHJvd0JpbmRpbmdFcnJvcignQ2Fubm90IHBhc3MgIicrX2VtYmluZF9yZXByKGhhbmRsZSkrJyIgYXMgYSAnK3RoaXMubmFtZSl9aWYoIWhhbmRsZS4kJC5wdHIpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcGFzcyBkZWxldGVkIG9iamVjdCBhcyBhIHBvaW50ZXIgb2YgdHlwZSAiK3RoaXMubmFtZSl9dmFyIGhhbmRsZUNsYXNzPWhhbmRsZS4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgcHRyPXVwY2FzdFBvaW50ZXIoaGFuZGxlLiQkLnB0cixoYW5kbGVDbGFzcyx0aGlzLnJlZ2lzdGVyZWRDbGFzcyk7cmV0dXJuIHB0cn1mdW5jdGlvbiBnZW5lcmljUG9pbnRlclRvV2lyZVR5cGUoZGVzdHJ1Y3RvcnMsaGFuZGxlKXt2YXIgcHRyO2lmKGhhbmRsZT09PW51bGwpe2lmKHRoaXMuaXNSZWZlcmVuY2Upe3Rocm93QmluZGluZ0Vycm9yKCJudWxsIGlzIG5vdCBhIHZhbGlkICIrdGhpcy5uYW1lKX1pZih0aGlzLmlzU21hcnRQb2ludGVyKXtwdHI9dGhpcy5yYXdDb25zdHJ1Y3RvcigpO2lmKGRlc3RydWN0b3JzIT09bnVsbCl7ZGVzdHJ1Y3RvcnMucHVzaCh0aGlzLnJhd0Rlc3RydWN0b3IscHRyKX1yZXR1cm4gcHRyfWVsc2V7cmV0dXJuIDB9fWlmKCFoYW5kbGUuJCQpe3Rocm93QmluZGluZ0Vycm9yKCdDYW5ub3QgcGFzcyAiJytfZW1iaW5kX3JlcHIoaGFuZGxlKSsnIiBhcyBhICcrdGhpcy5uYW1lKX1pZighaGFuZGxlLiQkLnB0cil7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIGRlbGV0ZWQgb2JqZWN0IGFzIGEgcG9pbnRlciBvZiB0eXBlICIrdGhpcy5uYW1lKX1pZighdGhpcy5pc0NvbnN0JiZoYW5kbGUuJCQucHRyVHlwZS5pc0NvbnN0KXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IGNvbnZlcnQgYXJndW1lbnQgb2YgdHlwZSAiKyhoYW5kbGUuJCQuc21hcnRQdHJUeXBlP2hhbmRsZS4kJC5zbWFydFB0clR5cGUubmFtZTpoYW5kbGUuJCQucHRyVHlwZS5uYW1lKSsiIHRvIHBhcmFtZXRlciB0eXBlICIrdGhpcy5uYW1lKX12YXIgaGFuZGxlQ2xhc3M9aGFuZGxlLiQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzO3B0cj11cGNhc3RQb2ludGVyKGhhbmRsZS4kJC5wdHIsaGFuZGxlQ2xhc3MsdGhpcy5yZWdpc3RlcmVkQ2xhc3MpO2lmKHRoaXMuaXNTbWFydFBvaW50ZXIpe2lmKHVuZGVmaW5lZD09PWhhbmRsZS4kJC5zbWFydFB0cil7dGhyb3dCaW5kaW5nRXJyb3IoIlBhc3NpbmcgcmF3IHBvaW50ZXIgdG8gc21hcnQgcG9pbnRlciBpcyBpbGxlZ2FsIil9c3dpdGNoKHRoaXMuc2hhcmluZ1BvbGljeSl7Y2FzZSAwOmlmKGhhbmRsZS4kJC5zbWFydFB0clR5cGU9PT10aGlzKXtwdHI9aGFuZGxlLiQkLnNtYXJ0UHRyfWVsc2V7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBjb252ZXJ0IGFyZ3VtZW50IG9mIHR5cGUgIisoaGFuZGxlLiQkLnNtYXJ0UHRyVHlwZT9oYW5kbGUuJCQuc21hcnRQdHJUeXBlLm5hbWU6aGFuZGxlLiQkLnB0clR5cGUubmFtZSkrIiB0byBwYXJhbWV0ZXIgdHlwZSAiK3RoaXMubmFtZSl9YnJlYWs7Y2FzZSAxOnB0cj1oYW5kbGUuJCQuc21hcnRQdHI7YnJlYWs7Y2FzZSAyOmlmKGhhbmRsZS4kJC5zbWFydFB0clR5cGU9PT10aGlzKXtwdHI9aGFuZGxlLiQkLnNtYXJ0UHRyfWVsc2V7dmFyIGNsb25lZEhhbmRsZT1oYW5kbGVbImNsb25lIl0oKTtwdHI9dGhpcy5yYXdTaGFyZShwdHIsRW12YWwudG9IYW5kbGUoZnVuY3Rpb24oKXtjbG9uZWRIYW5kbGVbImRlbGV0ZSJdKCl9KSk7aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKHRoaXMucmF3RGVzdHJ1Y3RvcixwdHIpfX1icmVhaztkZWZhdWx0OnRocm93QmluZGluZ0Vycm9yKCJVbnN1cHBvcnRpbmcgc2hhcmluZyBwb2xpY3kiKX19cmV0dXJuIHB0cn1mdW5jdGlvbiBub25Db25zdE5vU21hcnRQdHJSYXdQb2ludGVyVG9XaXJlVHlwZShkZXN0cnVjdG9ycyxoYW5kbGUpe2lmKGhhbmRsZT09PW51bGwpe2lmKHRoaXMuaXNSZWZlcmVuY2Upe3Rocm93QmluZGluZ0Vycm9yKCJudWxsIGlzIG5vdCBhIHZhbGlkICIrdGhpcy5uYW1lKX1yZXR1cm4gMH1pZighaGFuZGxlLiQkKXt0aHJvd0JpbmRpbmdFcnJvcignQ2Fubm90IHBhc3MgIicrX2VtYmluZF9yZXByKGhhbmRsZSkrJyIgYXMgYSAnK3RoaXMubmFtZSl9aWYoIWhhbmRsZS4kJC5wdHIpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcGFzcyBkZWxldGVkIG9iamVjdCBhcyBhIHBvaW50ZXIgb2YgdHlwZSAiK3RoaXMubmFtZSl9aWYoaGFuZGxlLiQkLnB0clR5cGUuaXNDb25zdCl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBjb252ZXJ0IGFyZ3VtZW50IG9mIHR5cGUgIitoYW5kbGUuJCQucHRyVHlwZS5uYW1lKyIgdG8gcGFyYW1ldGVyIHR5cGUgIit0aGlzLm5hbWUpfXZhciBoYW5kbGVDbGFzcz1oYW5kbGUuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3M7dmFyIHB0cj11cGNhc3RQb2ludGVyKGhhbmRsZS4kJC5wdHIsaGFuZGxlQ2xhc3MsdGhpcy5yZWdpc3RlcmVkQ2xhc3MpO3JldHVybiBwdHJ9ZnVuY3Rpb24gc2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBVMzJbcG9pbnRlcj4+Ml0pfWZ1bmN0aW9uIFJlZ2lzdGVyZWRQb2ludGVyX2dldFBvaW50ZWUocHRyKXtpZih0aGlzLnJhd0dldFBvaW50ZWUpe3B0cj10aGlzLnJhd0dldFBvaW50ZWUocHRyKX1yZXR1cm4gcHRyfWZ1bmN0aW9uIFJlZ2lzdGVyZWRQb2ludGVyX2Rlc3RydWN0b3IocHRyKXtpZih0aGlzLnJhd0Rlc3RydWN0b3Ipe3RoaXMucmF3RGVzdHJ1Y3RvcihwdHIpfX1mdW5jdGlvbiBSZWdpc3RlcmVkUG9pbnRlcl9kZWxldGVPYmplY3QoaGFuZGxlKXtpZihoYW5kbGUhPT1udWxsKXtoYW5kbGVbImRlbGV0ZSJdKCl9fWZ1bmN0aW9uIGluaXRfUmVnaXN0ZXJlZFBvaW50ZXIoKXtSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGUuZ2V0UG9pbnRlZT1SZWdpc3RlcmVkUG9pbnRlcl9nZXRQb2ludGVlO1JlZ2lzdGVyZWRQb2ludGVyLnByb3RvdHlwZS5kZXN0cnVjdG9yPVJlZ2lzdGVyZWRQb2ludGVyX2Rlc3RydWN0b3I7UmVnaXN0ZXJlZFBvaW50ZXIucHJvdG90eXBlWyJhcmdQYWNrQWR2YW5jZSJdPTg7UmVnaXN0ZXJlZFBvaW50ZXIucHJvdG90eXBlWyJyZWFkVmFsdWVGcm9tUG9pbnRlciJdPXNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyO1JlZ2lzdGVyZWRQb2ludGVyLnByb3RvdHlwZVsiZGVsZXRlT2JqZWN0Il09UmVnaXN0ZXJlZFBvaW50ZXJfZGVsZXRlT2JqZWN0O1JlZ2lzdGVyZWRQb2ludGVyLnByb3RvdHlwZVsiZnJvbVdpcmVUeXBlIl09UmVnaXN0ZXJlZFBvaW50ZXJfZnJvbVdpcmVUeXBlfWZ1bmN0aW9uIFJlZ2lzdGVyZWRQb2ludGVyKG5hbWUscmVnaXN0ZXJlZENsYXNzLGlzUmVmZXJlbmNlLGlzQ29uc3QsaXNTbWFydFBvaW50ZXIscG9pbnRlZVR5cGUsc2hhcmluZ1BvbGljeSxyYXdHZXRQb2ludGVlLHJhd0NvbnN0cnVjdG9yLHJhd1NoYXJlLHJhd0Rlc3RydWN0b3Ipe3RoaXMubmFtZT1uYW1lO3RoaXMucmVnaXN0ZXJlZENsYXNzPXJlZ2lzdGVyZWRDbGFzczt0aGlzLmlzUmVmZXJlbmNlPWlzUmVmZXJlbmNlO3RoaXMuaXNDb25zdD1pc0NvbnN0O3RoaXMuaXNTbWFydFBvaW50ZXI9aXNTbWFydFBvaW50ZXI7dGhpcy5wb2ludGVlVHlwZT1wb2ludGVlVHlwZTt0aGlzLnNoYXJpbmdQb2xpY3k9c2hhcmluZ1BvbGljeTt0aGlzLnJhd0dldFBvaW50ZWU9cmF3R2V0UG9pbnRlZTt0aGlzLnJhd0NvbnN0cnVjdG9yPXJhd0NvbnN0cnVjdG9yO3RoaXMucmF3U2hhcmU9cmF3U2hhcmU7dGhpcy5yYXdEZXN0cnVjdG9yPXJhd0Rlc3RydWN0b3I7aWYoIWlzU21hcnRQb2ludGVyJiZyZWdpc3RlcmVkQ2xhc3MuYmFzZUNsYXNzPT09dW5kZWZpbmVkKXtpZihpc0NvbnN0KXt0aGlzWyJ0b1dpcmVUeXBlIl09Y29uc3ROb1NtYXJ0UHRyUmF3UG9pbnRlclRvV2lyZVR5cGU7dGhpcy5kZXN0cnVjdG9yRnVuY3Rpb249bnVsbH1lbHNle3RoaXNbInRvV2lyZVR5cGUiXT1ub25Db25zdE5vU21hcnRQdHJSYXdQb2ludGVyVG9XaXJlVHlwZTt0aGlzLmRlc3RydWN0b3JGdW5jdGlvbj1udWxsfX1lbHNle3RoaXNbInRvV2lyZVR5cGUiXT1nZW5lcmljUG9pbnRlclRvV2lyZVR5cGV9fWZ1bmN0aW9uIHJlcGxhY2VQdWJsaWNTeW1ib2wobmFtZSx2YWx1ZSxudW1Bcmd1bWVudHMpe2lmKCFNb2R1bGUuaGFzT3duUHJvcGVydHkobmFtZSkpe3Rocm93SW50ZXJuYWxFcnJvcigiUmVwbGFjaW5nIG5vbmV4aXN0YW50IHB1YmxpYyBzeW1ib2wiKX1pZih1bmRlZmluZWQhPT1Nb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZSYmdW5kZWZpbmVkIT09bnVtQXJndW1lbnRzKXtNb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZVtudW1Bcmd1bWVudHNdPXZhbHVlfWVsc2V7TW9kdWxlW25hbWVdPXZhbHVlO01vZHVsZVtuYW1lXS5hcmdDb3VudD1udW1Bcmd1bWVudHN9fWZ1bmN0aW9uIGR5bkNhbGxMZWdhY3koc2lnLHB0cixhcmdzKXt2YXIgZj1Nb2R1bGVbImR5bkNhbGxfIitzaWddO3JldHVybiBhcmdzJiZhcmdzLmxlbmd0aD9mLmFwcGx5KG51bGwsW3B0cl0uY29uY2F0KGFyZ3MpKTpmLmNhbGwobnVsbCxwdHIpfWZ1bmN0aW9uIGR5bkNhbGwoc2lnLHB0cixhcmdzKXtpZihzaWcuaW5jbHVkZXMoImoiKSl7cmV0dXJuIGR5bkNhbGxMZWdhY3koc2lnLHB0cixhcmdzKX1yZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkocHRyKS5hcHBseShudWxsLGFyZ3MpfWZ1bmN0aW9uIGdldER5bkNhbGxlcihzaWcscHRyKXt2YXIgYXJnQ2FjaGU9W107cmV0dXJuIGZ1bmN0aW9uKCl7YXJnQ2FjaGUubGVuZ3RoPTA7T2JqZWN0LmFzc2lnbihhcmdDYWNoZSxhcmd1bWVudHMpO3JldHVybiBkeW5DYWxsKHNpZyxwdHIsYXJnQ2FjaGUpfX1mdW5jdGlvbiBlbWJpbmRfX3JlcXVpcmVGdW5jdGlvbihzaWduYXR1cmUscmF3RnVuY3Rpb24pe3NpZ25hdHVyZT1yZWFkTGF0aW4xU3RyaW5nKHNpZ25hdHVyZSk7ZnVuY3Rpb24gbWFrZUR5bkNhbGxlcigpe2lmKHNpZ25hdHVyZS5pbmNsdWRlcygiaiIpKXtyZXR1cm4gZ2V0RHluQ2FsbGVyKHNpZ25hdHVyZSxyYXdGdW5jdGlvbil9cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KHJhd0Z1bmN0aW9uKX12YXIgZnA9bWFrZUR5bkNhbGxlcigpO2lmKHR5cGVvZiBmcCE9ImZ1bmN0aW9uIil7dGhyb3dCaW5kaW5nRXJyb3IoInVua25vd24gZnVuY3Rpb24gcG9pbnRlciB3aXRoIHNpZ25hdHVyZSAiK3NpZ25hdHVyZSsiOiAiK3Jhd0Z1bmN0aW9uKX1yZXR1cm4gZnB9dmFyIFVuYm91bmRUeXBlRXJyb3I9dW5kZWZpbmVkO2Z1bmN0aW9uIGdldFR5cGVOYW1lKHR5cGUpe3ZhciBwdHI9X19fZ2V0VHlwZU5hbWUodHlwZSk7dmFyIHJ2PXJlYWRMYXRpbjFTdHJpbmcocHRyKTtfZnJlZShwdHIpO3JldHVybiBydn1mdW5jdGlvbiB0aHJvd1VuYm91bmRUeXBlRXJyb3IobWVzc2FnZSx0eXBlcyl7dmFyIHVuYm91bmRUeXBlcz1bXTt2YXIgc2Vlbj17fTtmdW5jdGlvbiB2aXNpdCh0eXBlKXtpZihzZWVuW3R5cGVdKXtyZXR1cm59aWYocmVnaXN0ZXJlZFR5cGVzW3R5cGVdKXtyZXR1cm59aWYodHlwZURlcGVuZGVuY2llc1t0eXBlXSl7dHlwZURlcGVuZGVuY2llc1t0eXBlXS5mb3JFYWNoKHZpc2l0KTtyZXR1cm59dW5ib3VuZFR5cGVzLnB1c2godHlwZSk7c2Vlblt0eXBlXT10cnVlfXR5cGVzLmZvckVhY2godmlzaXQpO3Rocm93IG5ldyBVbmJvdW5kVHlwZUVycm9yKG1lc3NhZ2UrIjogIit1bmJvdW5kVHlwZXMubWFwKGdldFR5cGVOYW1lKS5qb2luKFsiLCAiXSkpfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzKHJhd1R5cGUscmF3UG9pbnRlclR5cGUscmF3Q29uc3RQb2ludGVyVHlwZSxiYXNlQ2xhc3NSYXdUeXBlLGdldEFjdHVhbFR5cGVTaWduYXR1cmUsZ2V0QWN0dWFsVHlwZSx1cGNhc3RTaWduYXR1cmUsdXBjYXN0LGRvd25jYXN0U2lnbmF0dXJlLGRvd25jYXN0LG5hbWUsZGVzdHJ1Y3RvclNpZ25hdHVyZSxyYXdEZXN0cnVjdG9yKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7Z2V0QWN0dWFsVHlwZT1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbihnZXRBY3R1YWxUeXBlU2lnbmF0dXJlLGdldEFjdHVhbFR5cGUpO2lmKHVwY2FzdCl7dXBjYXN0PWVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKHVwY2FzdFNpZ25hdHVyZSx1cGNhc3QpfWlmKGRvd25jYXN0KXtkb3duY2FzdD1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbihkb3duY2FzdFNpZ25hdHVyZSxkb3duY2FzdCl9cmF3RGVzdHJ1Y3Rvcj1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbihkZXN0cnVjdG9yU2lnbmF0dXJlLHJhd0Rlc3RydWN0b3IpO3ZhciBsZWdhbEZ1bmN0aW9uTmFtZT1tYWtlTGVnYWxGdW5jdGlvbk5hbWUobmFtZSk7ZXhwb3NlUHVibGljU3ltYm9sKGxlZ2FsRnVuY3Rpb25OYW1lLGZ1bmN0aW9uKCl7dGhyb3dVbmJvdW5kVHlwZUVycm9yKCJDYW5ub3QgY29uc3RydWN0ICIrbmFtZSsiIGR1ZSB0byB1bmJvdW5kIHR5cGVzIixbYmFzZUNsYXNzUmF3VHlwZV0pfSk7d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW3Jhd1R5cGUscmF3UG9pbnRlclR5cGUscmF3Q29uc3RQb2ludGVyVHlwZV0sYmFzZUNsYXNzUmF3VHlwZT9bYmFzZUNsYXNzUmF3VHlwZV06W10sZnVuY3Rpb24oYmFzZSl7YmFzZT1iYXNlWzBdO3ZhciBiYXNlQ2xhc3M7dmFyIGJhc2VQcm90b3R5cGU7aWYoYmFzZUNsYXNzUmF3VHlwZSl7YmFzZUNsYXNzPWJhc2UucmVnaXN0ZXJlZENsYXNzO2Jhc2VQcm90b3R5cGU9YmFzZUNsYXNzLmluc3RhbmNlUHJvdG90eXBlfWVsc2V7YmFzZVByb3RvdHlwZT1DbGFzc0hhbmRsZS5wcm90b3R5cGV9dmFyIGNvbnN0cnVjdG9yPWNyZWF0ZU5hbWVkRnVuY3Rpb24obGVnYWxGdW5jdGlvbk5hbWUsZnVuY3Rpb24oKXtpZihPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykhPT1pbnN0YW5jZVByb3RvdHlwZSl7dGhyb3cgbmV3IEJpbmRpbmdFcnJvcigiVXNlICduZXcnIHRvIGNvbnN0cnVjdCAiK25hbWUpfWlmKHVuZGVmaW5lZD09PXJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5KXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKG5hbWUrIiBoYXMgbm8gYWNjZXNzaWJsZSBjb25zdHJ1Y3RvciIpfXZhciBib2R5PXJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5W2FyZ3VtZW50cy5sZW5ndGhdO2lmKHVuZGVmaW5lZD09PWJvZHkpe3Rocm93IG5ldyBCaW5kaW5nRXJyb3IoIlRyaWVkIHRvIGludm9rZSBjdG9yIG9mICIrbmFtZSsiIHdpdGggaW52YWxpZCBudW1iZXIgb2YgcGFyYW1ldGVycyAoIithcmd1bWVudHMubGVuZ3RoKyIpIC0gZXhwZWN0ZWQgKCIrT2JqZWN0LmtleXMocmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHkpLnRvU3RyaW5nKCkrIikgcGFyYW1ldGVycyBpbnN0ZWFkISIpfXJldHVybiBib2R5LmFwcGx5KHRoaXMsYXJndW1lbnRzKX0pO3ZhciBpbnN0YW5jZVByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGJhc2VQcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTpjb25zdHJ1Y3Rvcn19KTtjb25zdHJ1Y3Rvci5wcm90b3R5cGU9aW5zdGFuY2VQcm90b3R5cGU7dmFyIHJlZ2lzdGVyZWRDbGFzcz1uZXcgUmVnaXN0ZXJlZENsYXNzKG5hbWUsY29uc3RydWN0b3IsaW5zdGFuY2VQcm90b3R5cGUscmF3RGVzdHJ1Y3RvcixiYXNlQ2xhc3MsZ2V0QWN0dWFsVHlwZSx1cGNhc3QsZG93bmNhc3QpO3ZhciByZWZlcmVuY2VDb252ZXJ0ZXI9bmV3IFJlZ2lzdGVyZWRQb2ludGVyKG5hbWUscmVnaXN0ZXJlZENsYXNzLHRydWUsZmFsc2UsZmFsc2UpO3ZhciBwb2ludGVyQ29udmVydGVyPW5ldyBSZWdpc3RlcmVkUG9pbnRlcihuYW1lKyIqIixyZWdpc3RlcmVkQ2xhc3MsZmFsc2UsZmFsc2UsZmFsc2UpO3ZhciBjb25zdFBvaW50ZXJDb252ZXJ0ZXI9bmV3IFJlZ2lzdGVyZWRQb2ludGVyKG5hbWUrIiBjb25zdCoiLHJlZ2lzdGVyZWRDbGFzcyxmYWxzZSx0cnVlLGZhbHNlKTtyZWdpc3RlcmVkUG9pbnRlcnNbcmF3VHlwZV09e3BvaW50ZXJUeXBlOnBvaW50ZXJDb252ZXJ0ZXIsY29uc3RQb2ludGVyVHlwZTpjb25zdFBvaW50ZXJDb252ZXJ0ZXJ9O3JlcGxhY2VQdWJsaWNTeW1ib2wobGVnYWxGdW5jdGlvbk5hbWUsY29uc3RydWN0b3IpO3JldHVybltyZWZlcmVuY2VDb252ZXJ0ZXIscG9pbnRlckNvbnZlcnRlcixjb25zdFBvaW50ZXJDb252ZXJ0ZXJdfSl9ZnVuY3Rpb24gaGVhcDMyVmVjdG9yVG9BcnJheShjb3VudCxmaXJzdEVsZW1lbnQpe3ZhciBhcnJheT1bXTtmb3IodmFyIGk9MDtpPGNvdW50O2krKyl7YXJyYXkucHVzaChIRUFQMzJbKGZpcnN0RWxlbWVudD4+MikraV0pfXJldHVybiBhcnJheX1mdW5jdGlvbiBydW5EZXN0cnVjdG9ycyhkZXN0cnVjdG9ycyl7d2hpbGUoZGVzdHJ1Y3RvcnMubGVuZ3RoKXt2YXIgcHRyPWRlc3RydWN0b3JzLnBvcCgpO3ZhciBkZWw9ZGVzdHJ1Y3RvcnMucG9wKCk7ZGVsKHB0cil9fWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2NvbnN0cnVjdG9yKHJhd0NsYXNzVHlwZSxhcmdDb3VudCxyYXdBcmdUeXBlc0FkZHIsaW52b2tlclNpZ25hdHVyZSxpbnZva2VyLHJhd0NvbnN0cnVjdG9yKXthc3NlcnQoYXJnQ291bnQ+MCk7dmFyIHJhd0FyZ1R5cGVzPWhlYXAzMlZlY3RvclRvQXJyYXkoYXJnQ291bnQscmF3QXJnVHlwZXNBZGRyKTtpbnZva2VyPWVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKGludm9rZXJTaWduYXR1cmUsaW52b2tlcik7d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW10sW3Jhd0NsYXNzVHlwZV0sZnVuY3Rpb24oY2xhc3NUeXBlKXtjbGFzc1R5cGU9Y2xhc3NUeXBlWzBdO3ZhciBodW1hbk5hbWU9ImNvbnN0cnVjdG9yICIrY2xhc3NUeXBlLm5hbWU7aWYodW5kZWZpbmVkPT09Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5KXtjbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHk9W119aWYodW5kZWZpbmVkIT09Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5W2FyZ0NvdW50LTFdKXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKCJDYW5ub3QgcmVnaXN0ZXIgbXVsdGlwbGUgY29uc3RydWN0b3JzIHdpdGggaWRlbnRpY2FsIG51bWJlciBvZiBwYXJhbWV0ZXJzICgiKyhhcmdDb3VudC0xKSsiKSBmb3IgY2xhc3MgJyIrY2xhc3NUeXBlLm5hbWUrIichIE92ZXJsb2FkIHJlc29sdXRpb24gaXMgY3VycmVudGx5IG9ubHkgcGVyZm9ybWVkIHVzaW5nIHRoZSBwYXJhbWV0ZXIgY291bnQsIG5vdCBhY3R1YWwgdHlwZSBpbmZvISIpfWNsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keVthcmdDb3VudC0xXT0oKCk9Pnt0aHJvd1VuYm91bmRUeXBlRXJyb3IoIkNhbm5vdCBjb25zdHJ1Y3QgIitjbGFzc1R5cGUubmFtZSsiIGR1ZSB0byB1bmJvdW5kIHR5cGVzIixyYXdBcmdUeXBlcyl9KTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxyYXdBcmdUeXBlcyxmdW5jdGlvbihhcmdUeXBlcyl7YXJnVHlwZXMuc3BsaWNlKDEsMCxudWxsKTtjbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHlbYXJnQ291bnQtMV09Y3JhZnRJbnZva2VyRnVuY3Rpb24oaHVtYW5OYW1lLGFyZ1R5cGVzLG51bGwsaW52b2tlcixyYXdDb25zdHJ1Y3Rvcik7cmV0dXJuW119KTtyZXR1cm5bXX0pfWZ1bmN0aW9uIG5ld18oY29uc3RydWN0b3IsYXJndW1lbnRMaXN0KXtpZighKGNvbnN0cnVjdG9yIGluc3RhbmNlb2YgRnVuY3Rpb24pKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJuZXdfIGNhbGxlZCB3aXRoIGNvbnN0cnVjdG9yIHR5cGUgIit0eXBlb2YgY29uc3RydWN0b3IrIiB3aGljaCBpcyBub3QgYSBmdW5jdGlvbiIpfXZhciBkdW1teT1jcmVhdGVOYW1lZEZ1bmN0aW9uKGNvbnN0cnVjdG9yLm5hbWV8fCJ1bmtub3duRnVuY3Rpb25OYW1lIixmdW5jdGlvbigpe30pO2R1bW15LnByb3RvdHlwZT1jb25zdHJ1Y3Rvci5wcm90b3R5cGU7dmFyIG9iaj1uZXcgZHVtbXk7dmFyIHI9Y29uc3RydWN0b3IuYXBwbHkob2JqLGFyZ3VtZW50TGlzdCk7cmV0dXJuIHIgaW5zdGFuY2VvZiBPYmplY3Q/cjpvYmp9ZnVuY3Rpb24gY3JhZnRJbnZva2VyRnVuY3Rpb24oaHVtYW5OYW1lLGFyZ1R5cGVzLGNsYXNzVHlwZSxjcHBJbnZva2VyRnVuYyxjcHBUYXJnZXRGdW5jKXt2YXIgYXJnQ291bnQ9YXJnVHlwZXMubGVuZ3RoO2lmKGFyZ0NvdW50PDIpe3Rocm93QmluZGluZ0Vycm9yKCJhcmdUeXBlcyBhcnJheSBzaXplIG1pc21hdGNoISBNdXN0IGF0IGxlYXN0IGdldCByZXR1cm4gdmFsdWUgYW5kICd0aGlzJyB0eXBlcyEiKX12YXIgaXNDbGFzc01ldGhvZEZ1bmM9YXJnVHlwZXNbMV0hPT1udWxsJiZjbGFzc1R5cGUhPT1udWxsO3ZhciBuZWVkc0Rlc3RydWN0b3JTdGFjaz1mYWxzZTtmb3IodmFyIGk9MTtpPGFyZ1R5cGVzLmxlbmd0aDsrK2kpe2lmKGFyZ1R5cGVzW2ldIT09bnVsbCYmYXJnVHlwZXNbaV0uZGVzdHJ1Y3RvckZ1bmN0aW9uPT09dW5kZWZpbmVkKXtuZWVkc0Rlc3RydWN0b3JTdGFjaz10cnVlO2JyZWFrfX12YXIgcmV0dXJucz1hcmdUeXBlc1swXS5uYW1lIT09InZvaWQiO3ZhciBhcmdzTGlzdD0iIjt2YXIgYXJnc0xpc3RXaXJlZD0iIjtmb3IodmFyIGk9MDtpPGFyZ0NvdW50LTI7KytpKXthcmdzTGlzdCs9KGkhPT0wPyIsICI6IiIpKyJhcmciK2k7YXJnc0xpc3RXaXJlZCs9KGkhPT0wPyIsICI6IiIpKyJhcmciK2krIldpcmVkIn12YXIgaW52b2tlckZuQm9keT0icmV0dXJuIGZ1bmN0aW9uICIrbWFrZUxlZ2FsRnVuY3Rpb25OYW1lKGh1bWFuTmFtZSkrIigiK2FyZ3NMaXN0KyIpIHtcbiIrImlmIChhcmd1bWVudHMubGVuZ3RoICE9PSAiKyhhcmdDb3VudC0yKSsiKSB7XG4iKyJ0aHJvd0JpbmRpbmdFcnJvcignZnVuY3Rpb24gIitodW1hbk5hbWUrIiBjYWxsZWQgd2l0aCAnICsgYXJndW1lbnRzLmxlbmd0aCArICcgYXJndW1lbnRzLCBleHBlY3RlZCAiKyhhcmdDb3VudC0yKSsiIGFyZ3MhJyk7XG4iKyJ9XG4iO2lmKG5lZWRzRGVzdHJ1Y3RvclN0YWNrKXtpbnZva2VyRm5Cb2R5Kz0idmFyIGRlc3RydWN0b3JzID0gW107XG4ifXZhciBkdG9yU3RhY2s9bmVlZHNEZXN0cnVjdG9yU3RhY2s/ImRlc3RydWN0b3JzIjoibnVsbCI7dmFyIGFyZ3MxPVsidGhyb3dCaW5kaW5nRXJyb3IiLCJpbnZva2VyIiwiZm4iLCJydW5EZXN0cnVjdG9ycyIsInJldFR5cGUiLCJjbGFzc1BhcmFtIl07dmFyIGFyZ3MyPVt0aHJvd0JpbmRpbmdFcnJvcixjcHBJbnZva2VyRnVuYyxjcHBUYXJnZXRGdW5jLHJ1bkRlc3RydWN0b3JzLGFyZ1R5cGVzWzBdLGFyZ1R5cGVzWzFdXTtpZihpc0NsYXNzTWV0aG9kRnVuYyl7aW52b2tlckZuQm9keSs9InZhciB0aGlzV2lyZWQgPSBjbGFzc1BhcmFtLnRvV2lyZVR5cGUoIitkdG9yU3RhY2srIiwgdGhpcyk7XG4ifWZvcih2YXIgaT0wO2k8YXJnQ291bnQtMjsrK2kpe2ludm9rZXJGbkJvZHkrPSJ2YXIgYXJnIitpKyJXaXJlZCA9IGFyZ1R5cGUiK2krIi50b1dpcmVUeXBlKCIrZHRvclN0YWNrKyIsIGFyZyIraSsiKTsgLy8gIithcmdUeXBlc1tpKzJdLm5hbWUrIlxuIjthcmdzMS5wdXNoKCJhcmdUeXBlIitpKTthcmdzMi5wdXNoKGFyZ1R5cGVzW2krMl0pfWlmKGlzQ2xhc3NNZXRob2RGdW5jKXthcmdzTGlzdFdpcmVkPSJ0aGlzV2lyZWQiKyhhcmdzTGlzdFdpcmVkLmxlbmd0aD4wPyIsICI6IiIpK2FyZ3NMaXN0V2lyZWR9aW52b2tlckZuQm9keSs9KHJldHVybnM/InZhciBydiA9ICI6IiIpKyJpbnZva2VyKGZuIisoYXJnc0xpc3RXaXJlZC5sZW5ndGg+MD8iLCAiOiIiKSthcmdzTGlzdFdpcmVkKyIpO1xuIjtpZihuZWVkc0Rlc3RydWN0b3JTdGFjayl7aW52b2tlckZuQm9keSs9InJ1bkRlc3RydWN0b3JzKGRlc3RydWN0b3JzKTtcbiJ9ZWxzZXtmb3IodmFyIGk9aXNDbGFzc01ldGhvZEZ1bmM/MToyO2k8YXJnVHlwZXMubGVuZ3RoOysraSl7dmFyIHBhcmFtTmFtZT1pPT09MT8idGhpc1dpcmVkIjoiYXJnIisoaS0yKSsiV2lyZWQiO2lmKGFyZ1R5cGVzW2ldLmRlc3RydWN0b3JGdW5jdGlvbiE9PW51bGwpe2ludm9rZXJGbkJvZHkrPXBhcmFtTmFtZSsiX2R0b3IoIitwYXJhbU5hbWUrIik7IC8vICIrYXJnVHlwZXNbaV0ubmFtZSsiXG4iO2FyZ3MxLnB1c2gocGFyYW1OYW1lKyJfZHRvciIpO2FyZ3MyLnB1c2goYXJnVHlwZXNbaV0uZGVzdHJ1Y3RvckZ1bmN0aW9uKX19fWlmKHJldHVybnMpe2ludm9rZXJGbkJvZHkrPSJ2YXIgcmV0ID0gcmV0VHlwZS5mcm9tV2lyZVR5cGUocnYpO1xuIisicmV0dXJuIHJldDtcbiJ9ZWxzZXt9aW52b2tlckZuQm9keSs9In1cbiI7YXJnczEucHVzaChpbnZva2VyRm5Cb2R5KTt2YXIgaW52b2tlckZ1bmN0aW9uPW5ld18oRnVuY3Rpb24sYXJnczEpLmFwcGx5KG51bGwsYXJnczIpO3JldHVybiBpbnZva2VyRnVuY3Rpb259ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfZnVuY3Rpb24ocmF3Q2xhc3NUeXBlLG1ldGhvZE5hbWUsYXJnQ291bnQscmF3QXJnVHlwZXNBZGRyLGludm9rZXJTaWduYXR1cmUscmF3SW52b2tlcixjb250ZXh0LGlzUHVyZVZpcnR1YWwpe3ZhciByYXdBcmdUeXBlcz1oZWFwMzJWZWN0b3JUb0FycmF5KGFyZ0NvdW50LHJhd0FyZ1R5cGVzQWRkcik7bWV0aG9kTmFtZT1yZWFkTGF0aW4xU3RyaW5nKG1ldGhvZE5hbWUpO3Jhd0ludm9rZXI9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oaW52b2tlclNpZ25hdHVyZSxyYXdJbnZva2VyKTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxbcmF3Q2xhc3NUeXBlXSxmdW5jdGlvbihjbGFzc1R5cGUpe2NsYXNzVHlwZT1jbGFzc1R5cGVbMF07dmFyIGh1bWFuTmFtZT1jbGFzc1R5cGUubmFtZSsiLiIrbWV0aG9kTmFtZTtpZihtZXRob2ROYW1lLnN0YXJ0c1dpdGgoIkBAIikpe21ldGhvZE5hbWU9U3ltYm9sW21ldGhvZE5hbWUuc3Vic3RyaW5nKDIpXX1pZihpc1B1cmVWaXJ0dWFsKXtjbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLnB1cmVWaXJ0dWFsRnVuY3Rpb25zLnB1c2gobWV0aG9kTmFtZSl9ZnVuY3Rpb24gdW5ib3VuZFR5cGVzSGFuZGxlcigpe3Rocm93VW5ib3VuZFR5cGVFcnJvcigiQ2Fubm90IGNhbGwgIitodW1hbk5hbWUrIiBkdWUgdG8gdW5ib3VuZCB0eXBlcyIscmF3QXJnVHlwZXMpfXZhciBwcm90bz1jbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmluc3RhbmNlUHJvdG90eXBlO3ZhciBtZXRob2Q9cHJvdG9bbWV0aG9kTmFtZV07aWYodW5kZWZpbmVkPT09bWV0aG9kfHx1bmRlZmluZWQ9PT1tZXRob2Qub3ZlcmxvYWRUYWJsZSYmbWV0aG9kLmNsYXNzTmFtZSE9PWNsYXNzVHlwZS5uYW1lJiZtZXRob2QuYXJnQ291bnQ9PT1hcmdDb3VudC0yKXt1bmJvdW5kVHlwZXNIYW5kbGVyLmFyZ0NvdW50PWFyZ0NvdW50LTI7dW5ib3VuZFR5cGVzSGFuZGxlci5jbGFzc05hbWU9Y2xhc3NUeXBlLm5hbWU7cHJvdG9bbWV0aG9kTmFtZV09dW5ib3VuZFR5cGVzSGFuZGxlcn1lbHNle2Vuc3VyZU92ZXJsb2FkVGFibGUocHJvdG8sbWV0aG9kTmFtZSxodW1hbk5hbWUpO3Byb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGVbYXJnQ291bnQtMl09dW5ib3VuZFR5cGVzSGFuZGxlcn13aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxyYXdBcmdUeXBlcyxmdW5jdGlvbihhcmdUeXBlcyl7dmFyIG1lbWJlckZ1bmN0aW9uPWNyYWZ0SW52b2tlckZ1bmN0aW9uKGh1bWFuTmFtZSxhcmdUeXBlcyxjbGFzc1R5cGUscmF3SW52b2tlcixjb250ZXh0KTtpZih1bmRlZmluZWQ9PT1wcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlKXttZW1iZXJGdW5jdGlvbi5hcmdDb3VudD1hcmdDb3VudC0yO3Byb3RvW21ldGhvZE5hbWVdPW1lbWJlckZ1bmN0aW9ufWVsc2V7cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZVthcmdDb3VudC0yXT1tZW1iZXJGdW5jdGlvbn1yZXR1cm5bXX0pO3JldHVybltdfSl9dmFyIGVtdmFsX2ZyZWVfbGlzdD1bXTt2YXIgZW12YWxfaGFuZGxlX2FycmF5PVt7fSx7dmFsdWU6dW5kZWZpbmVkfSx7dmFsdWU6bnVsbH0se3ZhbHVlOnRydWV9LHt2YWx1ZTpmYWxzZX1dO2Z1bmN0aW9uIF9fZW12YWxfZGVjcmVmKGhhbmRsZSl7aWYoaGFuZGxlPjQmJjA9PT0tLWVtdmFsX2hhbmRsZV9hcnJheVtoYW5kbGVdLnJlZmNvdW50KXtlbXZhbF9oYW5kbGVfYXJyYXlbaGFuZGxlXT11bmRlZmluZWQ7ZW12YWxfZnJlZV9saXN0LnB1c2goaGFuZGxlKX19ZnVuY3Rpb24gY291bnRfZW12YWxfaGFuZGxlcygpe3ZhciBjb3VudD0wO2Zvcih2YXIgaT01O2k8ZW12YWxfaGFuZGxlX2FycmF5Lmxlbmd0aDsrK2kpe2lmKGVtdmFsX2hhbmRsZV9hcnJheVtpXSE9PXVuZGVmaW5lZCl7Kytjb3VudH19cmV0dXJuIGNvdW50fWZ1bmN0aW9uIGdldF9maXJzdF9lbXZhbCgpe2Zvcih2YXIgaT01O2k8ZW12YWxfaGFuZGxlX2FycmF5Lmxlbmd0aDsrK2kpe2lmKGVtdmFsX2hhbmRsZV9hcnJheVtpXSE9PXVuZGVmaW5lZCl7cmV0dXJuIGVtdmFsX2hhbmRsZV9hcnJheVtpXX19cmV0dXJuIG51bGx9ZnVuY3Rpb24gaW5pdF9lbXZhbCgpe01vZHVsZVsiY291bnRfZW12YWxfaGFuZGxlcyJdPWNvdW50X2VtdmFsX2hhbmRsZXM7TW9kdWxlWyJnZXRfZmlyc3RfZW12YWwiXT1nZXRfZmlyc3RfZW12YWx9dmFyIEVtdmFsPXt0b1ZhbHVlOmhhbmRsZT0+e2lmKCFoYW5kbGUpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSAiK2hhbmRsZSl9cmV0dXJuIGVtdmFsX2hhbmRsZV9hcnJheVtoYW5kbGVdLnZhbHVlfSx0b0hhbmRsZTp2YWx1ZT0+e3N3aXRjaCh2YWx1ZSl7Y2FzZSB1bmRlZmluZWQ6cmV0dXJuIDE7Y2FzZSBudWxsOnJldHVybiAyO2Nhc2UgdHJ1ZTpyZXR1cm4gMztjYXNlIGZhbHNlOnJldHVybiA0O2RlZmF1bHQ6e3ZhciBoYW5kbGU9ZW12YWxfZnJlZV9saXN0Lmxlbmd0aD9lbXZhbF9mcmVlX2xpc3QucG9wKCk6ZW12YWxfaGFuZGxlX2FycmF5Lmxlbmd0aDtlbXZhbF9oYW5kbGVfYXJyYXlbaGFuZGxlXT17cmVmY291bnQ6MSx2YWx1ZTp2YWx1ZX07cmV0dXJuIGhhbmRsZX19fX07ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfZW12YWwocmF3VHlwZSxuYW1lKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbihoYW5kbGUpe3ZhciBydj1FbXZhbC50b1ZhbHVlKGhhbmRsZSk7X19lbXZhbF9kZWNyZWYoaGFuZGxlKTtyZXR1cm4gcnZ9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7cmV0dXJuIEVtdmFsLnRvSGFuZGxlKHZhbHVlKX0sImFyZ1BhY2tBZHZhbmNlIjo4LCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6c2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX1mdW5jdGlvbiBfZW1iaW5kX3JlcHIodil7aWYodj09PW51bGwpe3JldHVybiJudWxsIn12YXIgdD10eXBlb2YgdjtpZih0PT09Im9iamVjdCJ8fHQ9PT0iYXJyYXkifHx0PT09ImZ1bmN0aW9uIil7cmV0dXJuIHYudG9TdHJpbmcoKX1lbHNle3JldHVybiIiK3Z9fWZ1bmN0aW9uIGZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaGlmdCl7c3dpdGNoKHNoaWZ0KXtjYXNlIDI6cmV0dXJuIGZ1bmN0aW9uKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQRjMyW3BvaW50ZXI+PjJdKX07Y2FzZSAzOnJldHVybiBmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUEY2NFtwb2ludGVyPj4zXSl9O2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcigiVW5rbm93biBmbG9hdCB0eXBlOiAiK25hbWUpfX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdChyYXdUeXBlLG5hbWUsc2l6ZSl7dmFyIHNoaWZ0PWdldFNoaWZ0RnJvbVNpemUoc2l6ZSk7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24odmFsdWUpe3JldHVybiB2YWx1ZX0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtyZXR1cm4gdmFsdWV9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaGlmdCksZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX1mdW5jdGlvbiBpbnRlZ2VyUmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaGlmdCxzaWduZWQpe3N3aXRjaChzaGlmdCl7Y2FzZSAwOnJldHVybiBzaWduZWQ/ZnVuY3Rpb24gcmVhZFM4RnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIEhFQVA4W3BvaW50ZXJdfTpmdW5jdGlvbiByZWFkVThGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gSEVBUFU4W3BvaW50ZXJdfTtjYXNlIDE6cmV0dXJuIHNpZ25lZD9mdW5jdGlvbiByZWFkUzE2RnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIEhFQVAxNltwb2ludGVyPj4xXX06ZnVuY3Rpb24gcmVhZFUxNkZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBIRUFQVTE2W3BvaW50ZXI+PjFdfTtjYXNlIDI6cmV0dXJuIHNpZ25lZD9mdW5jdGlvbiByZWFkUzMyRnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIEhFQVAzMltwb2ludGVyPj4yXX06ZnVuY3Rpb24gcmVhZFUzMkZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBIRUFQVTMyW3BvaW50ZXI+PjJdfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoIlVua25vd24gaW50ZWdlciB0eXBlOiAiK25hbWUpfX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyKHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7aWYobWF4UmFuZ2U9PT0tMSl7bWF4UmFuZ2U9NDI5NDk2NzI5NX12YXIgc2hpZnQ9Z2V0U2hpZnRGcm9tU2l6ZShzaXplKTt2YXIgZnJvbVdpcmVUeXBlPXZhbHVlPT52YWx1ZTtpZihtaW5SYW5nZT09PTApe3ZhciBiaXRzaGlmdD0zMi04KnNpemU7ZnJvbVdpcmVUeXBlPSh2YWx1ZT0+dmFsdWU8PGJpdHNoaWZ0Pj4+Yml0c2hpZnQpfXZhciBpc1Vuc2lnbmVkVHlwZT1uYW1lLmluY2x1ZGVzKCJ1bnNpZ25lZCIpO3ZhciBjaGVja0Fzc2VydGlvbnM9KHZhbHVlLHRvVHlwZU5hbWUpPT57fTt2YXIgdG9XaXJlVHlwZTtpZihpc1Vuc2lnbmVkVHlwZSl7dG9XaXJlVHlwZT1mdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7Y2hlY2tBc3NlcnRpb25zKHZhbHVlLHRoaXMubmFtZSk7cmV0dXJuIHZhbHVlPj4+MH19ZWxzZXt0b1dpcmVUeXBlPWZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtjaGVja0Fzc2VydGlvbnModmFsdWUsdGhpcy5uYW1lKTtyZXR1cm4gdmFsdWV9fXJlZ2lzdGVyVHlwZShwcmltaXRpdmVUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnJvbVdpcmVUeXBlLCJ0b1dpcmVUeXBlIjp0b1dpcmVUeXBlLCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmludGVnZXJSZWFkVmFsdWVGcm9tUG9pbnRlcihuYW1lLHNoaWZ0LG1pblJhbmdlIT09MCksZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldyhyYXdUeXBlLGRhdGFUeXBlSW5kZXgsbmFtZSl7dmFyIHR5cGVNYXBwaW5nPVtJbnQ4QXJyYXksVWludDhBcnJheSxJbnQxNkFycmF5LFVpbnQxNkFycmF5LEludDMyQXJyYXksVWludDMyQXJyYXksRmxvYXQzMkFycmF5LEZsb2F0NjRBcnJheV07dmFyIFRBPXR5cGVNYXBwaW5nW2RhdGFUeXBlSW5kZXhdO2Z1bmN0aW9uIGRlY29kZU1lbW9yeVZpZXcoaGFuZGxlKXtoYW5kbGU9aGFuZGxlPj4yO3ZhciBoZWFwPUhFQVBVMzI7dmFyIHNpemU9aGVhcFtoYW5kbGVdO3ZhciBkYXRhPWhlYXBbaGFuZGxlKzFdO3JldHVybiBuZXcgVEEoYnVmZmVyLGRhdGEsc2l6ZSl9bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZGVjb2RlTWVtb3J5VmlldywiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpkZWNvZGVNZW1vcnlWaWV3fSx7aWdub3JlRHVwbGljYXRlUmVnaXN0cmF0aW9uczp0cnVlfSl9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZyhyYXdUeXBlLG5hbWUpe25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTt2YXIgc3RkU3RyaW5nSXNVVEY4PW5hbWU9PT0ic3RkOjpzdHJpbmciO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24odmFsdWUpe3ZhciBsZW5ndGg9SEVBUFUzMlt2YWx1ZT4+Ml07dmFyIHN0cjtpZihzdGRTdHJpbmdJc1VURjgpe3ZhciBkZWNvZGVTdGFydFB0cj12YWx1ZSs0O2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj12YWx1ZSs0K2k7aWYoaT09bGVuZ3RofHxIRUFQVThbY3VycmVudEJ5dGVQdHJdPT0wKXt2YXIgbWF4UmVhZD1jdXJyZW50Qnl0ZVB0ci1kZWNvZGVTdGFydFB0cjt2YXIgc3RyaW5nU2VnbWVudD1VVEY4VG9TdHJpbmcoZGVjb2RlU3RhcnRQdHIsbWF4UmVhZCk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudH1lbHNle3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgwKTtzdHIrPXN0cmluZ1NlZ21lbnR9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrMX19fWVsc2V7dmFyIGE9bmV3IEFycmF5KGxlbmd0aCk7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXthW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoSEVBUFU4W3ZhbHVlKzQraV0pfXN0cj1hLmpvaW4oIiIpfV9mcmVlKHZhbHVlKTtyZXR1cm4gc3RyfSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe2lmKHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe3ZhbHVlPW5ldyBVaW50OEFycmF5KHZhbHVlKX12YXIgZ2V0TGVuZ3RoO3ZhciB2YWx1ZUlzT2ZUeXBlU3RyaW5nPXR5cGVvZiB2YWx1ZT09InN0cmluZyI7aWYoISh2YWx1ZUlzT2ZUeXBlU3RyaW5nfHx2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl8fHZhbHVlIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXl8fHZhbHVlIGluc3RhbmNlb2YgSW50OEFycmF5KSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gc3RkOjpzdHJpbmciKX1pZihzdGRTdHJpbmdJc1VURjgmJnZhbHVlSXNPZlR5cGVTdHJpbmcpe2dldExlbmd0aD0oKCk9Pmxlbmd0aEJ5dGVzVVRGOCh2YWx1ZSkpfWVsc2V7Z2V0TGVuZ3RoPSgoKT0+dmFsdWUubGVuZ3RoKX12YXIgbGVuZ3RoPWdldExlbmd0aCgpO3ZhciBwdHI9X21hbGxvYyg0K2xlbmd0aCsxKTtIRUFQVTMyW3B0cj4+Ml09bGVuZ3RoO2lmKHN0ZFN0cmluZ0lzVVRGOCYmdmFsdWVJc09mVHlwZVN0cmluZyl7c3RyaW5nVG9VVEY4KHZhbHVlLHB0cis0LGxlbmd0aCsxKX1lbHNle2lmKHZhbHVlSXNPZlR5cGVTdHJpbmcpe2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7dmFyIGNoYXJDb2RlPXZhbHVlLmNoYXJDb2RlQXQoaSk7aWYoY2hhckNvZGU+MjU1KXtfZnJlZShwdHIpO3Rocm93QmluZGluZ0Vycm9yKCJTdHJpbmcgaGFzIFVURi0xNiBjb2RlIHVuaXRzIHRoYXQgZG8gbm90IGZpdCBpbiA4IGJpdHMiKX1IRUFQVThbcHRyKzQraV09Y2hhckNvZGV9fWVsc2V7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXtIRUFQVThbcHRyKzQraV09dmFsdWVbaV19fX1pZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUscHRyKX1yZXR1cm4gcHRyfSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb246ZnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpfX0pfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nKHJhd1R5cGUsY2hhclNpemUsbmFtZSl7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3ZhciBkZWNvZGVTdHJpbmcsZW5jb2RlU3RyaW5nLGdldEhlYXAsbGVuZ3RoQnl0ZXNVVEYsc2hpZnQ7aWYoY2hhclNpemU9PT0yKXtkZWNvZGVTdHJpbmc9VVRGMTZUb1N0cmluZztlbmNvZGVTdHJpbmc9c3RyaW5nVG9VVEYxNjtsZW5ndGhCeXRlc1VURj1sZW5ndGhCeXRlc1VURjE2O2dldEhlYXA9KCgpPT5IRUFQVTE2KTtzaGlmdD0xfWVsc2UgaWYoY2hhclNpemU9PT00KXtkZWNvZGVTdHJpbmc9VVRGMzJUb1N0cmluZztlbmNvZGVTdHJpbmc9c3RyaW5nVG9VVEYzMjtsZW5ndGhCeXRlc1VURj1sZW5ndGhCeXRlc1VURjMyO2dldEhlYXA9KCgpPT5IRUFQVTMyKTtzaGlmdD0yfXJlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24odmFsdWUpe3ZhciBsZW5ndGg9SEVBUFUzMlt2YWx1ZT4+Ml07dmFyIEhFQVA9Z2V0SGVhcCgpO3ZhciBzdHI7dmFyIGRlY29kZVN0YXJ0UHRyPXZhbHVlKzQ7Zm9yKHZhciBpPTA7aTw9bGVuZ3RoOysraSl7dmFyIGN1cnJlbnRCeXRlUHRyPXZhbHVlKzQraSpjaGFyU2l6ZTtpZihpPT1sZW5ndGh8fEhFQVBbY3VycmVudEJ5dGVQdHI+PnNoaWZ0XT09MCl7dmFyIG1heFJlYWRCeXRlcz1jdXJyZW50Qnl0ZVB0ci1kZWNvZGVTdGFydFB0cjt2YXIgc3RyaW5nU2VnbWVudD1kZWNvZGVTdHJpbmcoZGVjb2RlU3RhcnRQdHIsbWF4UmVhZEJ5dGVzKTtpZihzdHI9PT11bmRlZmluZWQpe3N0cj1zdHJpbmdTZWdtZW50fWVsc2V7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApO3N0cis9c3RyaW5nU2VnbWVudH1kZWNvZGVTdGFydFB0cj1jdXJyZW50Qnl0ZVB0citjaGFyU2l6ZX19X2ZyZWUodmFsdWUpO3JldHVybiBzdHJ9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7aWYoISh0eXBlb2YgdmFsdWU9PSJzdHJpbmciKSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gQysrIHN0cmluZyB0eXBlICIrbmFtZSl9dmFyIGxlbmd0aD1sZW5ndGhCeXRlc1VURih2YWx1ZSk7dmFyIHB0cj1fbWFsbG9jKDQrbGVuZ3RoK2NoYXJTaXplKTtIRUFQVTMyW3B0cj4+Ml09bGVuZ3RoPj5zaGlmdDtlbmNvZGVTdHJpbmcodmFsdWUscHRyKzQsbGVuZ3RoK2NoYXJTaXplKTtpZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUscHRyKX1yZXR1cm4gcHRyfSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb246ZnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpfX0pfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQocmF3VHlwZSxuYW1lKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse2lzVm9pZDp0cnVlLG5hbWU6bmFtZSwiYXJnUGFja0FkdmFuY2UiOjAsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24oKXtyZXR1cm4gdW5kZWZpbmVkfSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsbyl7cmV0dXJuIHVuZGVmaW5lZH19KX1mdW5jdGlvbiBfX2Vtc2NyaXB0ZW5fZGF0ZV9ub3coKXtyZXR1cm4gRGF0ZS5ub3coKX12YXIgbm93SXNNb25vdG9uaWM9dHJ1ZTtmdW5jdGlvbiBfX2Vtc2NyaXB0ZW5fZ2V0X25vd19pc19tb25vdG9uaWMoKXtyZXR1cm4gbm93SXNNb25vdG9uaWN9ZnVuY3Rpb24gX19lbXZhbF9pbmNyZWYoaGFuZGxlKXtpZihoYW5kbGU+NCl7ZW12YWxfaGFuZGxlX2FycmF5W2hhbmRsZV0ucmVmY291bnQrPTF9fWZ1bmN0aW9uIHJlcXVpcmVSZWdpc3RlcmVkVHlwZShyYXdUeXBlLGh1bWFuTmFtZSl7dmFyIGltcGw9cmVnaXN0ZXJlZFR5cGVzW3Jhd1R5cGVdO2lmKHVuZGVmaW5lZD09PWltcGwpe3Rocm93QmluZGluZ0Vycm9yKGh1bWFuTmFtZSsiIGhhcyB1bmtub3duIHR5cGUgIitnZXRUeXBlTmFtZShyYXdUeXBlKSl9cmV0dXJuIGltcGx9ZnVuY3Rpb24gX19lbXZhbF90YWtlX3ZhbHVlKHR5cGUsYXJndil7dHlwZT1yZXF1aXJlUmVnaXN0ZXJlZFR5cGUodHlwZSwiX2VtdmFsX3Rha2VfdmFsdWUiKTt2YXIgdj10eXBlWyJyZWFkVmFsdWVGcm9tUG9pbnRlciJdKGFyZ3YpO3JldHVybiBFbXZhbC50b0hhbmRsZSh2KX1mdW5jdGlvbiBfX21tYXBfanMoYWRkcixsZW4scHJvdCxmbGFncyxmZCxvZmYsYWxsb2NhdGVkLGJ1aWx0aW4pe3RyeXt2YXIgaW5mbz1GUy5nZXRTdHJlYW0oZmQpO2lmKCFpbmZvKXJldHVybi04O3ZhciByZXM9RlMubW1hcChpbmZvLGFkZHIsbGVuLG9mZixwcm90LGZsYWdzKTt2YXIgcHRyPXJlcy5wdHI7SEVBUDMyW2FsbG9jYXRlZD4+Ml09cmVzLmFsbG9jYXRlZDtyZXR1cm4gcHRyfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fbXVubWFwX2pzKGFkZHIsbGVuLHByb3QsZmxhZ3MsZmQsb2Zmc2V0KXt0cnl7dmFyIHN0cmVhbT1GUy5nZXRTdHJlYW0oZmQpO2lmKHN0cmVhbSl7aWYocHJvdCYyKXtTWVNDQUxMUy5kb01zeW5jKGFkZHIsc3RyZWFtLGxlbixmbGFncyxvZmZzZXQpfUZTLm11bm1hcChzdHJlYW0pfX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfYWJvcnQoKXthYm9ydCgiIil9ZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fZ2V0X2hlYXBfbWF4KCl7cmV0dXJuIDIxNDc0ODM2NDh9dmFyIF9lbXNjcmlwdGVuX2dldF9ub3c7X2Vtc2NyaXB0ZW5fZ2V0X25vdz0oKCk9PnBlcmZvcm1hbmNlLm5vdygpKTtmdW5jdGlvbiBfZW1zY3JpcHRlbl9tZW1jcHlfYmlnKGRlc3Qsc3JjLG51bSl7SEVBUFU4LmNvcHlXaXRoaW4oZGVzdCxzcmMsc3JjK251bSl9ZnVuY3Rpb24gZW1zY3JpcHRlbl9yZWFsbG9jX2J1ZmZlcihzaXplKXt0cnl7d2FzbU1lbW9yeS5ncm93KHNpemUtYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzU+Pj4xNik7dXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3Mod2FzbU1lbW9yeS5idWZmZXIpO3JldHVybiAxfWNhdGNoKGUpe319ZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXAocmVxdWVzdGVkU2l6ZSl7dmFyIG9sZFNpemU9SEVBUFU4Lmxlbmd0aDtyZXF1ZXN0ZWRTaXplPXJlcXVlc3RlZFNpemU+Pj4wO3ZhciBtYXhIZWFwU2l6ZT1fZW1zY3JpcHRlbl9nZXRfaGVhcF9tYXgoKTtpZihyZXF1ZXN0ZWRTaXplPm1heEhlYXBTaXplKXtyZXR1cm4gZmFsc2V9bGV0IGFsaWduVXA9KHgsbXVsdGlwbGUpPT54KyhtdWx0aXBsZS14JW11bHRpcGxlKSVtdWx0aXBsZTtmb3IodmFyIGN1dERvd249MTtjdXREb3duPD00O2N1dERvd24qPTIpe3ZhciBvdmVyR3Jvd25IZWFwU2l6ZT1vbGRTaXplKigxKy4yL2N1dERvd24pO292ZXJHcm93bkhlYXBTaXplPU1hdGgubWluKG92ZXJHcm93bkhlYXBTaXplLHJlcXVlc3RlZFNpemUrMTAwNjYzMjk2KTt2YXIgbmV3U2l6ZT1NYXRoLm1pbihtYXhIZWFwU2l6ZSxhbGlnblVwKE1hdGgubWF4KHJlcXVlc3RlZFNpemUsb3Zlckdyb3duSGVhcFNpemUpLDY1NTM2KSk7dmFyIHJlcGxhY2VtZW50PWVtc2NyaXB0ZW5fcmVhbGxvY19idWZmZXIobmV3U2l6ZSk7aWYocmVwbGFjZW1lbnQpe3JldHVybiB0cnVlfX1yZXR1cm4gZmFsc2V9dmFyIEVOVj17fTtmdW5jdGlvbiBnZXRFeGVjdXRhYmxlTmFtZSgpe3JldHVybiB0aGlzUHJvZ3JhbXx8Ii4vdGhpcy5wcm9ncmFtIn1mdW5jdGlvbiBnZXRFbnZTdHJpbmdzKCl7aWYoIWdldEVudlN0cmluZ3Muc3RyaW5ncyl7dmFyIGxhbmc9KHR5cGVvZiBuYXZpZ2F0b3I9PSJvYmplY3QiJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzWzBdfHwiQyIpLnJlcGxhY2UoIi0iLCJfIikrIi5VVEYtOCI7dmFyIGVudj17IlVTRVIiOiJ3ZWJfdXNlciIsIkxPR05BTUUiOiJ3ZWJfdXNlciIsIlBBVEgiOiIvIiwiUFdEIjoiLyIsIkhPTUUiOiIvaG9tZS93ZWJfdXNlciIsIkxBTkciOmxhbmcsIl8iOmdldEV4ZWN1dGFibGVOYW1lKCl9O2Zvcih2YXIgeCBpbiBFTlYpe2lmKEVOVlt4XT09PXVuZGVmaW5lZClkZWxldGUgZW52W3hdO2Vsc2UgZW52W3hdPUVOVlt4XX12YXIgc3RyaW5ncz1bXTtmb3IodmFyIHggaW4gZW52KXtzdHJpbmdzLnB1c2goeCsiPSIrZW52W3hdKX1nZXRFbnZTdHJpbmdzLnN0cmluZ3M9c3RyaW5nc31yZXR1cm4gZ2V0RW52U3RyaW5ncy5zdHJpbmdzfWZ1bmN0aW9uIF9lbnZpcm9uX2dldChfX2Vudmlyb24sZW52aXJvbl9idWYpe3ZhciBidWZTaXplPTA7Z2V0RW52U3RyaW5ncygpLmZvckVhY2goZnVuY3Rpb24oc3RyaW5nLGkpe3ZhciBwdHI9ZW52aXJvbl9idWYrYnVmU2l6ZTtIRUFQMzJbX19lbnZpcm9uK2kqND4+Ml09cHRyO3dyaXRlQXNjaWlUb01lbW9yeShzdHJpbmcscHRyKTtidWZTaXplKz1zdHJpbmcubGVuZ3RoKzF9KTtyZXR1cm4gMH1mdW5jdGlvbiBfZW52aXJvbl9zaXplc19nZXQocGVudmlyb25fY291bnQscGVudmlyb25fYnVmX3NpemUpe3ZhciBzdHJpbmdzPWdldEVudlN0cmluZ3MoKTtIRUFQMzJbcGVudmlyb25fY291bnQ+PjJdPXN0cmluZ3MubGVuZ3RoO3ZhciBidWZTaXplPTA7c3RyaW5ncy5mb3JFYWNoKGZ1bmN0aW9uKHN0cmluZyl7YnVmU2l6ZSs9c3RyaW5nLmxlbmd0aCsxfSk7SEVBUDMyW3BlbnZpcm9uX2J1Zl9zaXplPj4yXT1idWZTaXplO3JldHVybiAwfWZ1bmN0aW9uIF9leGl0KHN0YXR1cyl7ZXhpdChzdGF0dXMpfWZ1bmN0aW9uIF9mZF9jbG9zZShmZCl7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTtGUy5jbG9zZShzdHJlYW0pO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIGRvUmVhZHYoc3RyZWFtLGlvdixpb3ZjbnQsb2Zmc2V0KXt2YXIgcmV0PTA7Zm9yKHZhciBpPTA7aTxpb3ZjbnQ7aSsrKXt2YXIgcHRyPUhFQVBVMzJbaW92Pj4yXTt2YXIgbGVuPUhFQVBVMzJbaW92KzQ+PjJdO2lvdis9ODt2YXIgY3Vycj1GUy5yZWFkKHN0cmVhbSxIRUFQOCxwdHIsbGVuLG9mZnNldCk7aWYoY3VycjwwKXJldHVybi0xO3JldCs9Y3VycjtpZihjdXJyPGxlbilicmVha31yZXR1cm4gcmV0fWZ1bmN0aW9uIF9mZF9yZWFkKGZkLGlvdixpb3ZjbnQscG51bSl7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTt2YXIgbnVtPWRvUmVhZHYoc3RyZWFtLGlvdixpb3ZjbnQpO0hFQVAzMltwbnVtPj4yXT1udW07cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4gZS5lcnJub319ZnVuY3Rpb24gX2ZkX3NlZWsoZmQsb2Zmc2V0X2xvdyxvZmZzZXRfaGlnaCx3aGVuY2UsbmV3T2Zmc2V0KXt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3ZhciBISUdIX09GRlNFVD00Mjk0OTY3Mjk2O3ZhciBvZmZzZXQ9b2Zmc2V0X2hpZ2gqSElHSF9PRkZTRVQrKG9mZnNldF9sb3c+Pj4wKTt2YXIgRE9VQkxFX0xJTUlUPTkwMDcxOTkyNTQ3NDA5OTI7aWYob2Zmc2V0PD0tRE9VQkxFX0xJTUlUfHxvZmZzZXQ+PURPVUJMRV9MSU1JVCl7cmV0dXJuIDYxfUZTLmxsc2VlayhzdHJlYW0sb2Zmc2V0LHdoZW5jZSk7dGVtcEk2ND1bc3RyZWFtLnBvc2l0aW9uPj4+MCwodGVtcERvdWJsZT1zdHJlYW0ucG9zaXRpb24sK01hdGguYWJzKHRlbXBEb3VibGUpPj0xP3RlbXBEb3VibGU+MD8oTWF0aC5taW4oK01hdGguZmxvb3IodGVtcERvdWJsZS80Mjk0OTY3Mjk2KSw0Mjk0OTY3Mjk1KXwwKT4+PjA6fn4rTWF0aC5jZWlsKCh0ZW1wRG91YmxlLSsofn50ZW1wRG91YmxlPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKV0sSEVBUDMyW25ld09mZnNldD4+Ml09dGVtcEk2NFswXSxIRUFQMzJbbmV3T2Zmc2V0KzQ+PjJdPXRlbXBJNjRbMV07aWYoc3RyZWFtLmdldGRlbnRzJiZvZmZzZXQ9PT0wJiZ3aGVuY2U9PT0wKXN0cmVhbS5nZXRkZW50cz1udWxsO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIF9mZF9zeW5jKGZkKXt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO2lmKHN0cmVhbS5zdHJlYW1fb3BzJiZzdHJlYW0uc3RyZWFtX29wcy5mc3luYyl7cmV0dXJuLXN0cmVhbS5zdHJlYW1fb3BzLmZzeW5jKHN0cmVhbSl9cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4gZS5lcnJub319ZnVuY3Rpb24gZG9Xcml0ZXYoc3RyZWFtLGlvdixpb3ZjbnQsb2Zmc2V0KXt2YXIgcmV0PTA7Zm9yKHZhciBpPTA7aTxpb3ZjbnQ7aSsrKXt2YXIgcHRyPUhFQVBVMzJbaW92Pj4yXTt2YXIgbGVuPUhFQVBVMzJbaW92KzQ+PjJdO2lvdis9ODt2YXIgY3Vycj1GUy53cml0ZShzdHJlYW0sSEVBUDgscHRyLGxlbixvZmZzZXQpO2lmKGN1cnI8MClyZXR1cm4tMTtyZXQrPWN1cnJ9cmV0dXJuIHJldH1mdW5jdGlvbiBfZmRfd3JpdGUoZmQsaW92LGlvdmNudCxwbnVtKXt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3ZhciBudW09ZG9Xcml0ZXYoc3RyZWFtLGlvdixpb3ZjbnQpO0hFQVAzMltwbnVtPj4yXT1udW07cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4gZS5lcnJub319ZnVuY3Rpb24gX2dldFRlbXBSZXQwKCl7cmV0dXJuIGdldFRlbXBSZXQwKCl9ZnVuY3Rpb24gX2dldGVudHJvcHkoYnVmZmVyLHNpemUpe2lmKCFfZ2V0ZW50cm9weS5yYW5kb21EZXZpY2Upe19nZXRlbnRyb3B5LnJhbmRvbURldmljZT1nZXRSYW5kb21EZXZpY2UoKX1mb3IodmFyIGk9MDtpPHNpemU7aSsrKXtIRUFQOFtidWZmZXIraT4+MF09X2dldGVudHJvcHkucmFuZG9tRGV2aWNlKCl9cmV0dXJuIDB9ZnVuY3Rpb24gX3NldFRlbXBSZXQwKHZhbCl7c2V0VGVtcFJldDAodmFsKX1mdW5jdGlvbiBfX2lzTGVhcFllYXIoeWVhcil7cmV0dXJuIHllYXIlND09PTAmJih5ZWFyJTEwMCE9PTB8fHllYXIlNDAwPT09MCl9ZnVuY3Rpb24gX19hcnJheVN1bShhcnJheSxpbmRleCl7dmFyIHN1bT0wO2Zvcih2YXIgaT0wO2k8PWluZGV4O3N1bSs9YXJyYXlbaSsrXSl7fXJldHVybiBzdW19dmFyIF9fTU9OVEhfREFZU19MRUFQPVszMSwyOSwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07dmFyIF9fTU9OVEhfREFZU19SRUdVTEFSPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gX19hZGREYXlzKGRhdGUsZGF5cyl7dmFyIG5ld0RhdGU9bmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpO3doaWxlKGRheXM+MCl7dmFyIGxlYXA9X19pc0xlYXBZZWFyKG5ld0RhdGUuZ2V0RnVsbFllYXIoKSk7dmFyIGN1cnJlbnRNb250aD1uZXdEYXRlLmdldE1vbnRoKCk7dmFyIGRheXNJbkN1cnJlbnRNb250aD0obGVhcD9fX01PTlRIX0RBWVNfTEVBUDpfX01PTlRIX0RBWVNfUkVHVUxBUilbY3VycmVudE1vbnRoXTtpZihkYXlzPmRheXNJbkN1cnJlbnRNb250aC1uZXdEYXRlLmdldERhdGUoKSl7ZGF5cy09ZGF5c0luQ3VycmVudE1vbnRoLW5ld0RhdGUuZ2V0RGF0ZSgpKzE7bmV3RGF0ZS5zZXREYXRlKDEpO2lmKGN1cnJlbnRNb250aDwxMSl7bmV3RGF0ZS5zZXRNb250aChjdXJyZW50TW9udGgrMSl9ZWxzZXtuZXdEYXRlLnNldE1vbnRoKDApO25ld0RhdGUuc2V0RnVsbFllYXIobmV3RGF0ZS5nZXRGdWxsWWVhcigpKzEpfX1lbHNle25ld0RhdGUuc2V0RGF0ZShuZXdEYXRlLmdldERhdGUoKStkYXlzKTtyZXR1cm4gbmV3RGF0ZX19cmV0dXJuIG5ld0RhdGV9ZnVuY3Rpb24gX3N0cmZ0aW1lKHMsbWF4c2l6ZSxmb3JtYXQsdG0pe3ZhciB0bV96b25lPUhFQVAzMlt0bSs0MD4+Ml07dmFyIGRhdGU9e3RtX3NlYzpIRUFQMzJbdG0+PjJdLHRtX21pbjpIRUFQMzJbdG0rND4+Ml0sdG1faG91cjpIRUFQMzJbdG0rOD4+Ml0sdG1fbWRheTpIRUFQMzJbdG0rMTI+PjJdLHRtX21vbjpIRUFQMzJbdG0rMTY+PjJdLHRtX3llYXI6SEVBUDMyW3RtKzIwPj4yXSx0bV93ZGF5OkhFQVAzMlt0bSsyND4+Ml0sdG1feWRheTpIRUFQMzJbdG0rMjg+PjJdLHRtX2lzZHN0OkhFQVAzMlt0bSszMj4+Ml0sdG1fZ210b2ZmOkhFQVAzMlt0bSszNj4+Ml0sdG1fem9uZTp0bV96b25lP1VURjhUb1N0cmluZyh0bV96b25lKToiIn07dmFyIHBhdHRlcm49VVRGOFRvU3RyaW5nKGZvcm1hdCk7dmFyIEVYUEFOU0lPTl9SVUxFU18xPXsiJWMiOiIlYSAlYiAlZCAlSDolTTolUyAlWSIsIiVEIjoiJW0vJWQvJXkiLCIlRiI6IiVZLSVtLSVkIiwiJWgiOiIlYiIsIiVyIjoiJUk6JU06JVMgJXAiLCIlUiI6IiVIOiVNIiwiJVQiOiIlSDolTTolUyIsIiV4IjoiJW0vJWQvJXkiLCIlWCI6IiVIOiVNOiVTIiwiJUVjIjoiJWMiLCIlRUMiOiIlQyIsIiVFeCI6IiVtLyVkLyV5IiwiJUVYIjoiJUg6JU06JVMiLCIlRXkiOiIleSIsIiVFWSI6IiVZIiwiJU9kIjoiJWQiLCIlT2UiOiIlZSIsIiVPSCI6IiVIIiwiJU9JIjoiJUkiLCIlT20iOiIlbSIsIiVPTSI6IiVNIiwiJU9TIjoiJVMiLCIlT3UiOiIldSIsIiVPVSI6IiVVIiwiJU9WIjoiJVYiLCIlT3ciOiIldyIsIiVPVyI6IiVXIiwiJU95IjoiJXkifTtmb3IodmFyIHJ1bGUgaW4gRVhQQU5TSU9OX1JVTEVTXzEpe3BhdHRlcm49cGF0dGVybi5yZXBsYWNlKG5ldyBSZWdFeHAocnVsZSwiZyIpLEVYUEFOU0lPTl9SVUxFU18xW3J1bGVdKX12YXIgV0VFS0RBWVM9WyJTdW5kYXkiLCJNb25kYXkiLCJUdWVzZGF5IiwiV2VkbmVzZGF5IiwiVGh1cnNkYXkiLCJGcmlkYXkiLCJTYXR1cmRheSJdO3ZhciBNT05USFM9WyJKYW51YXJ5IiwiRmVicnVhcnkiLCJNYXJjaCIsIkFwcmlsIiwiTWF5IiwiSnVuZSIsIkp1bHkiLCJBdWd1c3QiLCJTZXB0ZW1iZXIiLCJPY3RvYmVyIiwiTm92ZW1iZXIiLCJEZWNlbWJlciJdO2Z1bmN0aW9uIGxlYWRpbmdTb21ldGhpbmcodmFsdWUsZGlnaXRzLGNoYXJhY3Rlcil7dmFyIHN0cj10eXBlb2YgdmFsdWU9PSJudW1iZXIiP3ZhbHVlLnRvU3RyaW5nKCk6dmFsdWV8fCIiO3doaWxlKHN0ci5sZW5ndGg8ZGlnaXRzKXtzdHI9Y2hhcmFjdGVyWzBdK3N0cn1yZXR1cm4gc3RyfWZ1bmN0aW9uIGxlYWRpbmdOdWxscyh2YWx1ZSxkaWdpdHMpe3JldHVybiBsZWFkaW5nU29tZXRoaW5nKHZhbHVlLGRpZ2l0cywiMCIpfWZ1bmN0aW9uIGNvbXBhcmVCeURheShkYXRlMSxkYXRlMil7ZnVuY3Rpb24gc2duKHZhbHVlKXtyZXR1cm4gdmFsdWU8MD8tMTp2YWx1ZT4wPzE6MH12YXIgY29tcGFyZTtpZigoY29tcGFyZT1zZ24oZGF0ZTEuZ2V0RnVsbFllYXIoKS1kYXRlMi5nZXRGdWxsWWVhcigpKSk9PT0wKXtpZigoY29tcGFyZT1zZ24oZGF0ZTEuZ2V0TW9udGgoKS1kYXRlMi5nZXRNb250aCgpKSk9PT0wKXtjb21wYXJlPXNnbihkYXRlMS5nZXREYXRlKCktZGF0ZTIuZ2V0RGF0ZSgpKX19cmV0dXJuIGNvbXBhcmV9ZnVuY3Rpb24gZ2V0Rmlyc3RXZWVrU3RhcnREYXRlKGphbkZvdXJ0aCl7c3dpdGNoKGphbkZvdXJ0aC5nZXREYXkoKSl7Y2FzZSAwOnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKS0xLDExLDI5KTtjYXNlIDE6cmV0dXJuIGphbkZvdXJ0aDtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLDAsMyk7Y2FzZSAzOnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKSwwLDIpO2Nhc2UgNDpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCksMCwxKTtjYXNlIDU6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCktMSwxMSwzMCl9fWZ1bmN0aW9uIGdldFdlZWtCYXNlZFllYXIoZGF0ZSl7dmFyIHRoaXNEYXRlPV9fYWRkRGF5cyhuZXcgRGF0ZShkYXRlLnRtX3llYXIrMTkwMCwwLDEpLGRhdGUudG1feWRheSk7dmFyIGphbkZvdXJ0aFRoaXNZZWFyPW5ldyBEYXRlKHRoaXNEYXRlLmdldEZ1bGxZZWFyKCksMCw0KTt2YXIgamFuRm91cnRoTmV4dFllYXI9bmV3IERhdGUodGhpc0RhdGUuZ2V0RnVsbFllYXIoKSsxLDAsNCk7dmFyIGZpcnN0V2Vla1N0YXJ0VGhpc1llYXI9Z2V0Rmlyc3RXZWVrU3RhcnREYXRlKGphbkZvdXJ0aFRoaXNZZWFyKTt2YXIgZmlyc3RXZWVrU3RhcnROZXh0WWVhcj1nZXRGaXJzdFdlZWtTdGFydERhdGUoamFuRm91cnRoTmV4dFllYXIpO2lmKGNvbXBhcmVCeURheShmaXJzdFdlZWtTdGFydFRoaXNZZWFyLHRoaXNEYXRlKTw9MCl7aWYoY29tcGFyZUJ5RGF5KGZpcnN0V2Vla1N0YXJ0TmV4dFllYXIsdGhpc0RhdGUpPD0wKXtyZXR1cm4gdGhpc0RhdGUuZ2V0RnVsbFllYXIoKSsxfWVsc2V7cmV0dXJuIHRoaXNEYXRlLmdldEZ1bGxZZWFyKCl9fWVsc2V7cmV0dXJuIHRoaXNEYXRlLmdldEZ1bGxZZWFyKCktMX19dmFyIEVYUEFOU0lPTl9SVUxFU18yPXsiJWEiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBXRUVLREFZU1tkYXRlLnRtX3dkYXldLnN1YnN0cmluZygwLDMpfSwiJUEiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBXRUVLREFZU1tkYXRlLnRtX3dkYXldfSwiJWIiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBNT05USFNbZGF0ZS50bV9tb25dLnN1YnN0cmluZygwLDMpfSwiJUIiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBNT05USFNbZGF0ZS50bV9tb25dfSwiJUMiOmZ1bmN0aW9uKGRhdGUpe3ZhciB5ZWFyPWRhdGUudG1feWVhcisxOTAwO3JldHVybiBsZWFkaW5nTnVsbHMoeWVhci8xMDB8MCwyKX0sIiVkIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gbGVhZGluZ051bGxzKGRhdGUudG1fbWRheSwyKX0sIiVlIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gbGVhZGluZ1NvbWV0aGluZyhkYXRlLnRtX21kYXksMiwiICIpfSwiJWciOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBnZXRXZWVrQmFzZWRZZWFyKGRhdGUpLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpfSwiJUciOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBnZXRXZWVrQmFzZWRZZWFyKGRhdGUpfSwiJUgiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBsZWFkaW5nTnVsbHMoZGF0ZS50bV9ob3VyLDIpfSwiJUkiOmZ1bmN0aW9uKGRhdGUpe3ZhciB0d2VsdmVIb3VyPWRhdGUudG1faG91cjtpZih0d2VsdmVIb3VyPT0wKXR3ZWx2ZUhvdXI9MTI7ZWxzZSBpZih0d2VsdmVIb3VyPjEyKXR3ZWx2ZUhvdXItPTEyO3JldHVybiBsZWFkaW5nTnVsbHModHdlbHZlSG91ciwyKX0sIiVqIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gbGVhZGluZ051bGxzKGRhdGUudG1fbWRheStfX2FycmF5U3VtKF9faXNMZWFwWWVhcihkYXRlLnRtX3llYXIrMTkwMCk/X19NT05USF9EQVlTX0xFQVA6X19NT05USF9EQVlTX1JFR1VMQVIsZGF0ZS50bV9tb24tMSksMyl9LCIlbSI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGxlYWRpbmdOdWxscyhkYXRlLnRtX21vbisxLDIpfSwiJU0iOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBsZWFkaW5nTnVsbHMoZGF0ZS50bV9taW4sMil9LCIlbiI6ZnVuY3Rpb24oKXtyZXR1cm4iXG4ifSwiJXAiOmZ1bmN0aW9uKGRhdGUpe2lmKGRhdGUudG1faG91cj49MCYmZGF0ZS50bV9ob3VyPDEyKXtyZXR1cm4iQU0ifWVsc2V7cmV0dXJuIlBNIn19LCIlUyI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGxlYWRpbmdOdWxscyhkYXRlLnRtX3NlYywyKX0sIiV0IjpmdW5jdGlvbigpe3JldHVybiJcdCJ9LCIldSI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGRhdGUudG1fd2RheXx8N30sIiVVIjpmdW5jdGlvbihkYXRlKXt2YXIgZGF5cz1kYXRlLnRtX3lkYXkrNy1kYXRlLnRtX3dkYXk7cmV0dXJuIGxlYWRpbmdOdWxscyhNYXRoLmZsb29yKGRheXMvNyksMil9LCIlViI6ZnVuY3Rpb24oZGF0ZSl7dmFyIHZhbD1NYXRoLmZsb29yKChkYXRlLnRtX3lkYXkrNy0oZGF0ZS50bV93ZGF5KzYpJTcpLzcpO2lmKChkYXRlLnRtX3dkYXkrMzcxLWRhdGUudG1feWRheS0yKSU3PD0yKXt2YWwrK31pZighdmFsKXt2YWw9NTI7dmFyIGRlYzMxPShkYXRlLnRtX3dkYXkrNy1kYXRlLnRtX3lkYXktMSklNztpZihkZWMzMT09NHx8ZGVjMzE9PTUmJl9faXNMZWFwWWVhcihkYXRlLnRtX3llYXIlNDAwLTEpKXt2YWwrK319ZWxzZSBpZih2YWw9PTUzKXt2YXIgamFuMT0oZGF0ZS50bV93ZGF5KzM3MS1kYXRlLnRtX3lkYXkpJTc7aWYoamFuMSE9NCYmKGphbjEhPTN8fCFfX2lzTGVhcFllYXIoZGF0ZS50bV95ZWFyKSkpdmFsPTF9cmV0dXJuIGxlYWRpbmdOdWxscyh2YWwsMil9LCIldyI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGRhdGUudG1fd2RheX0sIiVXIjpmdW5jdGlvbihkYXRlKXt2YXIgZGF5cz1kYXRlLnRtX3lkYXkrNy0oZGF0ZS50bV93ZGF5KzYpJTc7cmV0dXJuIGxlYWRpbmdOdWxscyhNYXRoLmZsb29yKGRheXMvNyksMil9LCIleSI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuKGRhdGUudG1feWVhcisxOTAwKS50b1N0cmluZygpLnN1YnN0cmluZygyKX0sIiVZIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gZGF0ZS50bV95ZWFyKzE5MDB9LCIleiI6ZnVuY3Rpb24oZGF0ZSl7dmFyIG9mZj1kYXRlLnRtX2dtdG9mZjt2YXIgYWhlYWQ9b2ZmPj0wO29mZj1NYXRoLmFicyhvZmYpLzYwO29mZj1vZmYvNjAqMTAwK29mZiU2MDtyZXR1cm4oYWhlYWQ/IisiOiItIikrU3RyaW5nKCIwMDAwIitvZmYpLnNsaWNlKC00KX0sIiVaIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gZGF0ZS50bV96b25lfSwiJSUiOmZ1bmN0aW9uKCl7cmV0dXJuIiUifX07cGF0dGVybj1wYXR0ZXJuLnJlcGxhY2UoLyUlL2csIlwwXDAiKTtmb3IodmFyIHJ1bGUgaW4gRVhQQU5TSU9OX1JVTEVTXzIpe2lmKHBhdHRlcm4uaW5jbHVkZXMocnVsZSkpe3BhdHRlcm49cGF0dGVybi5yZXBsYWNlKG5ldyBSZWdFeHAocnVsZSwiZyIpLEVYUEFOU0lPTl9SVUxFU18yW3J1bGVdKGRhdGUpKX19cGF0dGVybj1wYXR0ZXJuLnJlcGxhY2UoL1wwXDAvZywiJSIpO3ZhciBieXRlcz1pbnRBcnJheUZyb21TdHJpbmcocGF0dGVybixmYWxzZSk7aWYoYnl0ZXMubGVuZ3RoPm1heHNpemUpe3JldHVybiAwfXdyaXRlQXJyYXlUb01lbW9yeShieXRlcyxzKTtyZXR1cm4gYnl0ZXMubGVuZ3RoLTF9ZnVuY3Rpb24gX3N0cmZ0aW1lX2wocyxtYXhzaXplLGZvcm1hdCx0bSl7cmV0dXJuIF9zdHJmdGltZShzLG1heHNpemUsZm9ybWF0LHRtKX12YXIgRlNOb2RlPWZ1bmN0aW9uKHBhcmVudCxuYW1lLG1vZGUscmRldil7aWYoIXBhcmVudCl7cGFyZW50PXRoaXN9dGhpcy5wYXJlbnQ9cGFyZW50O3RoaXMubW91bnQ9cGFyZW50Lm1vdW50O3RoaXMubW91bnRlZD1udWxsO3RoaXMuaWQ9RlMubmV4dElub2RlKys7dGhpcy5uYW1lPW5hbWU7dGhpcy5tb2RlPW1vZGU7dGhpcy5ub2RlX29wcz17fTt0aGlzLnN0cmVhbV9vcHM9e307dGhpcy5yZGV2PXJkZXZ9O3ZhciByZWFkTW9kZT0yOTJ8NzM7dmFyIHdyaXRlTW9kZT0xNDY7T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoRlNOb2RlLnByb3RvdHlwZSx7cmVhZDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMubW9kZSZyZWFkTW9kZSk9PT1yZWFkTW9kZX0sc2V0OmZ1bmN0aW9uKHZhbCl7dmFsP3RoaXMubW9kZXw9cmVhZE1vZGU6dGhpcy5tb2RlJj1+cmVhZE1vZGV9fSx3cml0ZTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMubW9kZSZ3cml0ZU1vZGUpPT09d3JpdGVNb2RlfSxzZXQ6ZnVuY3Rpb24odmFsKXt2YWw/dGhpcy5tb2RlfD13cml0ZU1vZGU6dGhpcy5tb2RlJj1+d3JpdGVNb2RlfX0saXNGb2xkZXI6e2dldDpmdW5jdGlvbigpe3JldHVybiBGUy5pc0Rpcih0aGlzLm1vZGUpfX0saXNEZXZpY2U6e2dldDpmdW5jdGlvbigpe3JldHVybiBGUy5pc0NocmRldih0aGlzLm1vZGUpfX19KTtGUy5GU05vZGU9RlNOb2RlO0ZTLnN0YXRpY0luaXQoKTtlbWJpbmRfaW5pdF9jaGFyQ29kZXMoKTtCaW5kaW5nRXJyb3I9TW9kdWxlWyJCaW5kaW5nRXJyb3IiXT1leHRlbmRFcnJvcihFcnJvciwiQmluZGluZ0Vycm9yIik7SW50ZXJuYWxFcnJvcj1Nb2R1bGVbIkludGVybmFsRXJyb3IiXT1leHRlbmRFcnJvcihFcnJvciwiSW50ZXJuYWxFcnJvciIpO2luaXRfQ2xhc3NIYW5kbGUoKTtpbml0X2VtYmluZCgpO2luaXRfUmVnaXN0ZXJlZFBvaW50ZXIoKTtVbmJvdW5kVHlwZUVycm9yPU1vZHVsZVsiVW5ib3VuZFR5cGVFcnJvciJdPWV4dGVuZEVycm9yKEVycm9yLCJVbmJvdW5kVHlwZUVycm9yIik7aW5pdF9lbXZhbCgpO2Z1bmN0aW9uIGludEFycmF5RnJvbVN0cmluZyhzdHJpbmd5LGRvbnRBZGROdWxsLGxlbmd0aCl7dmFyIGxlbj1sZW5ndGg+MD9sZW5ndGg6bGVuZ3RoQnl0ZXNVVEY4KHN0cmluZ3kpKzE7dmFyIHU4YXJyYXk9bmV3IEFycmF5KGxlbik7dmFyIG51bUJ5dGVzV3JpdHRlbj1zdHJpbmdUb1VURjhBcnJheShzdHJpbmd5LHU4YXJyYXksMCx1OGFycmF5Lmxlbmd0aCk7aWYoZG9udEFkZE51bGwpdThhcnJheS5sZW5ndGg9bnVtQnl0ZXNXcml0dGVuO3JldHVybiB1OGFycmF5fXZhciBhc21MaWJyYXJ5QXJnPXsiYSI6X19fYXNzZXJ0X2ZhaWwsImsiOl9fX2N4YV9hbGxvY2F0ZV9leGNlcHRpb24sInQiOl9fX2N4YV9iZWdpbl9jYXRjaCwiaWEiOl9fX2N4YV9jdXJyZW50X3ByaW1hcnlfZXhjZXB0aW9uLCJSIjpfX19jeGFfZGVjcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudCwidiI6X19fY3hhX2VuZF9jYXRjaCwiZCI6X19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMiwiaSI6X19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMywiciI6X19fY3hhX2ZyZWVfZXhjZXB0aW9uLCJRIjpfX19jeGFfaW5jcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudCwiWCI6X19fY3hhX3JldGhyb3csImhhIjpfX19jeGFfcmV0aHJvd19wcmltYXJ5X2V4Y2VwdGlvbiwicCI6X19fY3hhX3Rocm93LCJqYSI6X19fY3hhX3VuY2F1Z2h0X2V4Y2VwdGlvbnMsImciOl9fX3Jlc3VtZUV4Y2VwdGlvbiwid2EiOl9fX3N5c2NhbGxfZnN0YXQ2NCwiY2EiOl9fX3N5c2NhbGxfZnRydW5jYXRlNjQsInRhIjpfX19zeXNjYWxsX2xzdGF0NjQsInVhIjpfX19zeXNjYWxsX25ld2ZzdGF0YXQsInhhIjpfX19zeXNjYWxsX29wZW5hdCwibmEiOl9fX3N5c2NhbGxfcmVuYW1lYXQsInZhIjpfX19zeXNjYWxsX3N0YXQ2NCwibGEiOl9fX3N5c2NhbGxfdW5saW5rYXQsIkFhIjpfX2RsaW5pdCwiQ2EiOl9fZGxvcGVuX2pzLCJCYSI6X19kbHN5bV9qcywiZGEiOl9fZW1iaW5kX3JlZ2lzdGVyX2JpZ2ludCwiRWEiOl9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2wsIk1hIjpfX2VtYmluZF9yZWdpc3Rlcl9jbGFzcywiTGEiOl9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2NvbnN0cnVjdG9yLCJ3IjpfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19mdW5jdGlvbiwiRGEiOl9fZW1iaW5kX3JlZ2lzdGVyX2VtdmFsLCJXIjpfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdCwieSI6X19lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlciwicyI6X19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXcsIlYiOl9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmcsIkwiOl9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nLCJGYSI6X19lbWJpbmRfcmVnaXN0ZXJfdm9pZCwiVCI6X19lbXNjcmlwdGVuX2RhdGVfbm93LCJ5YSI6X19lbXNjcmlwdGVuX2dldF9ub3dfaXNfbW9ub3RvbmljLCJLYSI6X19lbXZhbF9kZWNyZWYsImJhIjpfX2VtdmFsX2luY3JlZiwiRyI6X19lbXZhbF90YWtlX3ZhbHVlLCJvYSI6X19tbWFwX2pzLCJwYSI6X19tdW5tYXBfanMsImIiOl9hYm9ydCwibWEiOl9lbXNjcmlwdGVuX2dldF9oZWFwX21heCwiSyI6X2Vtc2NyaXB0ZW5fZ2V0X25vdywiemEiOl9lbXNjcmlwdGVuX21lbWNweV9iaWcsImthIjpfZW1zY3JpcHRlbl9yZXNpemVfaGVhcCwicWEiOl9lbnZpcm9uX2dldCwicmEiOl9lbnZpcm9uX3NpemVzX2dldCwiR2EiOl9leGl0LCJVIjpfZmRfY2xvc2UsIlMiOl9mZF9yZWFkLCJhYSI6X2ZkX3NlZWssInNhIjpfZmRfc3luYywiSiI6X2ZkX3dyaXRlLCJjIjpfZ2V0VGVtcFJldDAsImVhIjpfZ2V0ZW50cm9weSwiTiI6aW52b2tlX2RpaWksIkphIjppbnZva2VfZmksIk8iOmludm9rZV9maWlpLCJxIjppbnZva2VfaSwiZiI6aW52b2tlX2lpLCJIYSI6aW52b2tlX2lpZGlpLCJlIjppbnZva2VfaWlpLCJsIjppbnZva2VfaWlpaSwibSI6aW52b2tlX2lpaWlpLCJnYSI6aW52b2tlX2lpaWlpZCwiQyI6aW52b2tlX2lpaWlpaSwieCI6aW52b2tlX2lpaWlpaWksIlAiOmludm9rZV9paWlpaWlpaSwiRiI6aW52b2tlX2lpaWlpaWlpaWlpaSwiJCI6aW52b2tlX2osIl8iOmludm9rZV9qaWlpaSwibiI6aW52b2tlX3YsImoiOmludm9rZV92aSwiaCI6aW52b2tlX3ZpaSwiQSI6aW52b2tlX3ZpaWQsIk0iOmludm9rZV92aWlkaSwibyI6aW52b2tlX3ZpaWksIklhIjppbnZva2VfdmlpaWRpaWksIkgiOmludm9rZV92aWlpaSwiWSI6aW52b2tlX3ZpaWlpZGksIloiOmludm9rZV92aWlpaWksInUiOmludm9rZV92aWlpaWlpaSwiRCI6aW52b2tlX3ZpaWlpaWlpZGksIkkiOmludm9rZV92aWlpaWlpaWksIkIiOmludm9rZV92aWlpaWlpaWlpaSwiRSI6aW52b2tlX3ZpaWlpaWlpaWlpaWlpaWksInoiOl9zZXRUZW1wUmV0MCwiZmEiOl9zdHJmdGltZV9sfTt2YXIgYXNtPWNyZWF0ZVdhc20oKTt2YXIgX19fd2FzbV9jYWxsX2N0b3JzPU1vZHVsZVsiX19fd2FzbV9jYWxsX2N0b3JzIl09ZnVuY3Rpb24oKXtyZXR1cm4oX19fd2FzbV9jYWxsX2N0b3JzPU1vZHVsZVsiX19fd2FzbV9jYWxsX2N0b3JzIl09TW9kdWxlWyJhc20iXVsiT2EiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX21hbGxvYz1Nb2R1bGVbIl9tYWxsb2MiXT1mdW5jdGlvbigpe3JldHVybihfbWFsbG9jPU1vZHVsZVsiX21hbGxvYyJdPU1vZHVsZVsiYXNtIl1bIlFhIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9mcmVlPU1vZHVsZVsiX2ZyZWUiXT1mdW5jdGlvbigpe3JldHVybihfZnJlZT1Nb2R1bGVbIl9mcmVlIl09TW9kdWxlWyJhc20iXVsiUmEiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19fZ2V0VHlwZU5hbWU9TW9kdWxlWyJfX19nZXRUeXBlTmFtZSJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX2dldFR5cGVOYW1lPU1vZHVsZVsiX19fZ2V0VHlwZU5hbWUiXT1Nb2R1bGVbImFzbSJdWyJTYSJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX19lbWJpbmRfcmVnaXN0ZXJfbmF0aXZlX2FuZF9idWlsdGluX3R5cGVzPU1vZHVsZVsiX19fZW1iaW5kX3JlZ2lzdGVyX25hdGl2ZV9hbmRfYnVpbHRpbl90eXBlcyJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX2VtYmluZF9yZWdpc3Rlcl9uYXRpdmVfYW5kX2J1aWx0aW5fdHlwZXM9TW9kdWxlWyJfX19lbWJpbmRfcmVnaXN0ZXJfbmF0aXZlX2FuZF9idWlsdGluX3R5cGVzIl09TW9kdWxlWyJhc20iXVsiVGEiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19fc3RkaW9fZXhpdD1Nb2R1bGVbIl9fX3N0ZGlvX2V4aXQiXT1mdW5jdGlvbigpe3JldHVybihfX19zdGRpb19leGl0PU1vZHVsZVsiX19fc3RkaW9fZXhpdCJdPU1vZHVsZVsiYXNtIl1bIlVhIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX2Z1bmNzX29uX2V4aXQ9TW9kdWxlWyJfX19mdW5jc19vbl9leGl0Il09ZnVuY3Rpb24oKXtyZXR1cm4oX19fZnVuY3Nfb25fZXhpdD1Nb2R1bGVbIl9fX2Z1bmNzX29uX2V4aXQiXT1Nb2R1bGVbImFzbSJdWyJWYSJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfZW1zY3JpcHRlbl9idWlsdGluX21lbWFsaWduPU1vZHVsZVsiX2Vtc2NyaXB0ZW5fYnVpbHRpbl9tZW1hbGlnbiJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9lbXNjcmlwdGVuX2J1aWx0aW5fbWVtYWxpZ249TW9kdWxlWyJfZW1zY3JpcHRlbl9idWlsdGluX21lbWFsaWduIl09TW9kdWxlWyJhc20iXVsiV2EiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX3NldFRocmV3PU1vZHVsZVsiX3NldFRocmV3Il09ZnVuY3Rpb24oKXtyZXR1cm4oX3NldFRocmV3PU1vZHVsZVsiX3NldFRocmV3Il09TW9kdWxlWyJhc20iXVsiWGEiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgc3RhY2tTYXZlPU1vZHVsZVsic3RhY2tTYXZlIl09ZnVuY3Rpb24oKXtyZXR1cm4oc3RhY2tTYXZlPU1vZHVsZVsic3RhY2tTYXZlIl09TW9kdWxlWyJhc20iXVsiWWEiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgc3RhY2tSZXN0b3JlPU1vZHVsZVsic3RhY2tSZXN0b3JlIl09ZnVuY3Rpb24oKXtyZXR1cm4oc3RhY2tSZXN0b3JlPU1vZHVsZVsic3RhY2tSZXN0b3JlIl09TW9kdWxlWyJhc20iXVsiWmEiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19fY3hhX2Nhbl9jYXRjaD1Nb2R1bGVbIl9fX2N4YV9jYW5fY2F0Y2giXT1mdW5jdGlvbigpe3JldHVybihfX19jeGFfY2FuX2NhdGNoPU1vZHVsZVsiX19fY3hhX2Nhbl9jYXRjaCJdPU1vZHVsZVsiYXNtIl1bIl9hIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX2N4YV9pc19wb2ludGVyX3R5cGU9TW9kdWxlWyJfX19jeGFfaXNfcG9pbnRlcl90eXBlIl09ZnVuY3Rpb24oKXtyZXR1cm4oX19fY3hhX2lzX3BvaW50ZXJfdHlwZT1Nb2R1bGVbIl9fX2N4YV9pc19wb2ludGVyX3R5cGUiXT1Nb2R1bGVbImFzbSJdWyIkYSJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2lpaWlqPU1vZHVsZVsiZHluQ2FsbF9paWlpaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlpaWo9TW9kdWxlWyJkeW5DYWxsX2lpaWlqIl09TW9kdWxlWyJhc20iXVsiYWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9qaWk9TW9kdWxlWyJkeW5DYWxsX2ppaSJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfamlpPU1vZHVsZVsiZHluQ2FsbF9qaWkiXT1Nb2R1bGVbImFzbSJdWyJiYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2pqaj1Nb2R1bGVbImR5bkNhbGxfampqIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qamo9TW9kdWxlWyJkeW5DYWxsX2pqaiJdPU1vZHVsZVsiYXNtIl1bImNiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfamppPU1vZHVsZVsiZHluQ2FsbF9qamkiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2pqaT1Nb2R1bGVbImR5bkNhbGxfamppIl09TW9kdWxlWyJhc20iXVsiZGIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9qaWlpPU1vZHVsZVsiZHluQ2FsbF9qaWlpIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qaWlpPU1vZHVsZVsiZHluQ2FsbF9qaWlpIl09TW9kdWxlWyJhc20iXVsiZWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9paWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlqaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlpaWpqPU1vZHVsZVsiZHluQ2FsbF9paWlpamoiXT1Nb2R1bGVbImFzbSJdWyJmYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX3ZpaWpqPU1vZHVsZVsiZHluQ2FsbF92aWlqaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfdmlpamo9TW9kdWxlWyJkeW5DYWxsX3ZpaWpqIl09TW9kdWxlWyJhc20iXVsiZ2IiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF92aWlpampqaj1Nb2R1bGVbImR5bkNhbGxfdmlpaWpqamoiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX3ZpaWlqampqPU1vZHVsZVsiZHluQ2FsbF92aWlpampqaiJdPU1vZHVsZVsiYXNtIl1bImhiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfaWlqamlpaWk9TW9kdWxlWyJkeW5DYWxsX2lpamppaWlpIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9paWpqaWlpaT1Nb2R1bGVbImR5bkNhbGxfaWlqamlpaWkiXT1Nb2R1bGVbImFzbSJdWyJpYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2ppamk9TW9kdWxlWyJkeW5DYWxsX2ppamkiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2ppamk9TW9kdWxlWyJkeW5DYWxsX2ppamkiXT1Nb2R1bGVbImFzbSJdWyJqYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2o9TW9kdWxlWyJkeW5DYWxsX2oiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2o9TW9kdWxlWyJkeW5DYWxsX2oiXT1Nb2R1bGVbImFzbSJdWyJrYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX3ZpaWppaT1Nb2R1bGVbImR5bkNhbGxfdmlpamlpIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF92aWlqaWk9TW9kdWxlWyJkeW5DYWxsX3ZpaWppaSJdPU1vZHVsZVsiYXNtIl1bImxiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfamlpaWk9TW9kdWxlWyJkeW5DYWxsX2ppaWlpIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qaWlpaT1Nb2R1bGVbImR5bkNhbGxfamlpaWkiXT1Nb2R1bGVbImFzbSJdWyJtYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2lpaWlpaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlqIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9paWlpaWo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpaiJdPU1vZHVsZVsiYXNtIl1bIm5iIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfaWlpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlqaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlqaiJdPU1vZHVsZVsiYXNtIl1bIm9iIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfaWlpaWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpaWpqIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9paWlpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlpamoiXT1Nb2R1bGVbImFzbSJdWyJwYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O2Z1bmN0aW9uIGludm9rZV9paShpbmRleCxhMSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaShpbmRleCxhMSxhMil7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpKGluZGV4LGExKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpKGluZGV4LGExLGEyLGEzKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpKGluZGV4LGExLGEyKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9pKGluZGV4KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWkoaW5kZXgsYTEsYTIsYTMpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2ZpKGluZGV4LGExKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNil7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWlpaWlkaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdihpbmRleCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpZGkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlkaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNixhNyl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlkKGluZGV4LGExLGEyLGEzKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpKGluZGV4LGExLGEyLGEzLGE0KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpZGkoaW5kZXgsYTEsYTIsYTMsYTQpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpKGluZGV4LGExLGEyLGEzLGE0KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWRpaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpZChpbmRleCxhMSxhMixhMyxhNCxhNSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfZmlpaShpbmRleCxhMSxhMixhMyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2RpaWkoaW5kZXgsYTEsYTIsYTMpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaWlpaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCxhMTEpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSxhMTAsYTExKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTksYTEwKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaWlpaWlpaWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTksYTEwLGExMSxhMTIsYTEzLGExNCxhMTUpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCxhMTEsYTEyLGExMyxhMTQsYTE1KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2ooaW5kZXgpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGR5bkNhbGxfaihpbmRleCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9qaWlpaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZHluQ2FsbF9qaWlpaShpbmRleCxhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fXZhciBjYWxsZWRSdW47ZnVuY3Rpb24gRXhpdFN0YXR1cyhzdGF0dXMpe3RoaXMubmFtZT0iRXhpdFN0YXR1cyI7dGhpcy5tZXNzYWdlPSJQcm9ncmFtIHRlcm1pbmF0ZWQgd2l0aCBleGl0KCIrc3RhdHVzKyIpIjt0aGlzLnN0YXR1cz1zdGF0dXN9ZGVwZW5kZW5jaWVzRnVsZmlsbGVkPWZ1bmN0aW9uIHJ1bkNhbGxlcigpe2lmKCFjYWxsZWRSdW4pcnVuKCk7aWYoIWNhbGxlZFJ1bilkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9cnVuQ2FsbGVyfTtmdW5jdGlvbiBydW4oYXJncyl7YXJncz1hcmdzfHxhcmd1bWVudHNfO2lmKHJ1bkRlcGVuZGVuY2llcz4wKXtyZXR1cm59cHJlUnVuKCk7aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1mdW5jdGlvbiBkb1J1bigpe2lmKGNhbGxlZFJ1bilyZXR1cm47Y2FsbGVkUnVuPXRydWU7TW9kdWxlWyJjYWxsZWRSdW4iXT10cnVlO2lmKEFCT1JUKXJldHVybjtpbml0UnVudGltZSgpO3JlYWR5UHJvbWlzZVJlc29sdmUoTW9kdWxlKTtpZihNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0pTW9kdWxlWyJvblJ1bnRpbWVJbml0aWFsaXplZCJdKCk7cG9zdFJ1bigpfWlmKE1vZHVsZVsic2V0U3RhdHVzIl0pe01vZHVsZVsic2V0U3RhdHVzIl0oIlJ1bm5pbmcuLi4iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe01vZHVsZVsic2V0U3RhdHVzIl0oIiIpfSwxKTtkb1J1bigpfSwxKX1lbHNle2RvUnVuKCl9fU1vZHVsZVsicnVuIl09cnVuO2Z1bmN0aW9uIGV4aXQoc3RhdHVzLGltcGxpY2l0KXtFWElUU1RBVFVTPXN0YXR1cztpZigha2VlcFJ1bnRpbWVBbGl2ZSgpKXtleGl0UnVudGltZSgpfXByb2NFeGl0KHN0YXR1cyl9ZnVuY3Rpb24gcHJvY0V4aXQoY29kZSl7RVhJVFNUQVRVUz1jb2RlO2lmKCFrZWVwUnVudGltZUFsaXZlKCkpe2lmKE1vZHVsZVsib25FeGl0Il0pTW9kdWxlWyJvbkV4aXQiXShjb2RlKTtBQk9SVD10cnVlfXF1aXRfKGNvZGUsbmV3IEV4aXRTdGF0dXMoY29kZSkpfWlmKE1vZHVsZVsicHJlSW5pdCJdKXtpZih0eXBlb2YgTW9kdWxlWyJwcmVJbml0Il09PSJmdW5jdGlvbiIpTW9kdWxlWyJwcmVJbml0Il09W01vZHVsZVsicHJlSW5pdCJdXTt3aGlsZShNb2R1bGVbInByZUluaXQiXS5sZW5ndGg+MCl7TW9kdWxlWyJwcmVJbml0Il0ucG9wKCkoKX19cnVuKCk7CgoKICByZXR1cm4gTW9kdWxlLnJlYWR5Cn0KKTsKfSkoKTsKY3JlYXRlV2FzbU1vbm9JbnN0YW5jZSA9IE1vZHVsZTsgfSAgICAKICAgIAogICAgICAgICAgICBsZXQgY3JlYXRlV2FzbU11bHRpSW5zdGFuY2U7IHsKCnZhciBNb2R1bGUgPSAoKCkgPT4gewogIHZhciBfc2NyaXB0RGlyID0gbG9jYXRpb24uaHJlZjsKICAKICByZXR1cm4gKApmdW5jdGlvbihNb2R1bGUpIHsKICBNb2R1bGUgPSBNb2R1bGUgfHwge307CgpmdW5jdGlvbiBHUk9XQUJMRV9IRUFQX0k4KCl7aWYod2FzbU1lbW9yeS5idWZmZXIhPWJ1ZmZlcil7dXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3Mod2FzbU1lbW9yeS5idWZmZXIpfXJldHVybiBIRUFQOH1mdW5jdGlvbiBHUk9XQUJMRV9IRUFQX1U4KCl7aWYod2FzbU1lbW9yeS5idWZmZXIhPWJ1ZmZlcil7dXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3Mod2FzbU1lbW9yeS5idWZmZXIpfXJldHVybiBIRUFQVTh9ZnVuY3Rpb24gR1JPV0FCTEVfSEVBUF9JMTYoKXtpZih3YXNtTWVtb3J5LmJ1ZmZlciE9YnVmZmVyKXt1cGRhdGVHbG9iYWxCdWZmZXJBbmRWaWV3cyh3YXNtTWVtb3J5LmJ1ZmZlcil9cmV0dXJuIEhFQVAxNn1mdW5jdGlvbiBHUk9XQUJMRV9IRUFQX1UxNigpe2lmKHdhc21NZW1vcnkuYnVmZmVyIT1idWZmZXIpe3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKX1yZXR1cm4gSEVBUFUxNn1mdW5jdGlvbiBHUk9XQUJMRV9IRUFQX0kzMigpe2lmKHdhc21NZW1vcnkuYnVmZmVyIT1idWZmZXIpe3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKX1yZXR1cm4gSEVBUDMyfWZ1bmN0aW9uIEdST1dBQkxFX0hFQVBfVTMyKCl7aWYod2FzbU1lbW9yeS5idWZmZXIhPWJ1ZmZlcil7dXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3Mod2FzbU1lbW9yeS5idWZmZXIpfXJldHVybiBIRUFQVTMyfWZ1bmN0aW9uIEdST1dBQkxFX0hFQVBfRjMyKCl7aWYod2FzbU1lbW9yeS5idWZmZXIhPWJ1ZmZlcil7dXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3Mod2FzbU1lbW9yeS5idWZmZXIpfXJldHVybiBIRUFQRjMyfWZ1bmN0aW9uIEdST1dBQkxFX0hFQVBfRjY0KCl7aWYod2FzbU1lbW9yeS5idWZmZXIhPWJ1ZmZlcil7dXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3Mod2FzbU1lbW9yeS5idWZmZXIpfXJldHVybiBIRUFQRjY0fXZhciBNb2R1bGU9dHlwZW9mIE1vZHVsZSE9InVuZGVmaW5lZCI/TW9kdWxlOnt9O3ZhciByZWFkeVByb21pc2VSZXNvbHZlLHJlYWR5UHJvbWlzZVJlamVjdDtNb2R1bGVbInJlYWR5Il09bmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSxyZWplY3Qpe3JlYWR5UHJvbWlzZVJlc29sdmU9cmVzb2x2ZTtyZWFkeVByb21pc2VSZWplY3Q9cmVqZWN0fSk7dmFyIG1vZHVsZU92ZXJyaWRlcz1PYmplY3QuYXNzaWduKHt9LE1vZHVsZSk7dmFyIGFyZ3VtZW50c189W107dmFyIHRoaXNQcm9ncmFtPSIuL3RoaXMucHJvZ3JhbSI7dmFyIHF1aXRfPShzdGF0dXMsdG9UaHJvdyk9Pnt0aHJvdyB0b1Rocm93fTt2YXIgRU5WSVJPTk1FTlRfSVNfV0VCPXR5cGVvZiB3aW5kb3c9PSJvYmplY3QiO3ZhciBFTlZJUk9OTUVOVF9JU19XT1JLRVI9dHlwZW9mIGltcG9ydFNjcmlwdHM9PSJmdW5jdGlvbiI7dmFyIEVOVklST05NRU5UX0lTX05PREU9dHlwZW9mIHByb2Nlc3M9PSJvYmplY3QiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucz09Im9iamVjdCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGU9PSJzdHJpbmciO3ZhciBFTlZJUk9OTUVOVF9JU19QVEhSRUFEPU1vZHVsZVsiRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCJdfHxmYWxzZTt2YXIgc2NyaXB0RGlyZWN0b3J5PSIiO2Z1bmN0aW9uIGxvY2F0ZUZpbGUocGF0aCl7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3JldHVybiBNb2R1bGVbImxvY2F0ZUZpbGUiXShwYXRoLHNjcmlwdERpcmVjdG9yeSl9cmV0dXJuIHNjcmlwdERpcmVjdG9yeStwYXRofXZhciByZWFkXyxyZWFkQXN5bmMscmVhZEJpbmFyeSxzZXRXaW5kb3dUaXRsZTtpZihFTlZJUk9OTUVOVF9JU19XRUJ8fEVOVklST05NRU5UX0lTX1dPUktFUil7aWYoRU5WSVJPTk1FTlRfSVNfV09SS0VSKXtzY3JpcHREaXJlY3Rvcnk9c2VsZi5sb2NhdGlvbi5ocmVmfWVsc2UgaWYodHlwZW9mIGRvY3VtZW50IT0idW5kZWZpbmVkIiYmZG9jdW1lbnQuY3VycmVudFNjcmlwdCl7c2NyaXB0RGlyZWN0b3J5PWRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjfWlmKF9zY3JpcHREaXIpe3NjcmlwdERpcmVjdG9yeT1fc2NyaXB0RGlyfWlmKHNjcmlwdERpcmVjdG9yeS5pbmRleE9mKCJibG9iOiIpIT09MCl7c2NyaXB0RGlyZWN0b3J5PXNjcmlwdERpcmVjdG9yeS5zdWJzdHIoMCxzY3JpcHREaXJlY3RvcnkucmVwbGFjZSgvWz8jXS4qLywiIikubGFzdEluZGV4T2YoIi8iKSsxKX1lbHNle3NjcmlwdERpcmVjdG9yeT0iIn17cmVhZF89KHVybD0+e3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCxmYWxzZSk7eGhyLnNlbmQobnVsbCk7cmV0dXJuIHhoci5yZXNwb25zZVRleHR9KTtpZihFTlZJUk9OTUVOVF9JU19XT1JLRVIpe3JlYWRCaW5hcnk9KHVybD0+e3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCxmYWxzZSk7eGhyLnJlc3BvbnNlVHlwZT0iYXJyYXlidWZmZXIiO3hoci5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheSh4aHIucmVzcG9uc2UpfSl9cmVhZEFzeW5jPSgodXJsLG9ubG9hZCxvbmVycm9yKT0+e3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCx0cnVlKTt4aHIucmVzcG9uc2VUeXBlPSJhcnJheWJ1ZmZlciI7eGhyLm9ubG9hZD0oKCk9PntpZih4aHIuc3RhdHVzPT0yMDB8fHhoci5zdGF0dXM9PTAmJnhoci5yZXNwb25zZSl7b25sb2FkKHhoci5yZXNwb25zZSk7cmV0dXJufW9uZXJyb3IoKX0pO3hoci5vbmVycm9yPW9uZXJyb3I7eGhyLnNlbmQobnVsbCl9KX1zZXRXaW5kb3dUaXRsZT0odGl0bGU9PmRvY3VtZW50LnRpdGxlPXRpdGxlKX1lbHNle312YXIgb3V0PU1vZHVsZVsicHJpbnQiXXx8Y29uc29sZS5sb2cuYmluZChjb25zb2xlKTt2YXIgZXJyPU1vZHVsZVsicHJpbnRFcnIiXXx8Y29uc29sZS53YXJuLmJpbmQoY29uc29sZSk7T2JqZWN0LmFzc2lnbihNb2R1bGUsbW9kdWxlT3ZlcnJpZGVzKTttb2R1bGVPdmVycmlkZXM9bnVsbDtpZihNb2R1bGVbImFyZ3VtZW50cyJdKWFyZ3VtZW50c189TW9kdWxlWyJhcmd1bWVudHMiXTtpZihNb2R1bGVbInRoaXNQcm9ncmFtIl0pdGhpc1Byb2dyYW09TW9kdWxlWyJ0aGlzUHJvZ3JhbSJdO2lmKE1vZHVsZVsicXVpdCJdKXF1aXRfPU1vZHVsZVsicXVpdCJdO2Z1bmN0aW9uIHdhcm5PbmNlKHRleHQpe2lmKCF3YXJuT25jZS5zaG93bil3YXJuT25jZS5zaG93bj17fTtpZighd2Fybk9uY2Uuc2hvd25bdGV4dF0pe3dhcm5PbmNlLnNob3duW3RleHRdPTE7ZXJyKHRleHQpfX12YXIgdGVtcFJldDA9MDt2YXIgc2V0VGVtcFJldDA9dmFsdWU9Pnt0ZW1wUmV0MD12YWx1ZX07dmFyIGdldFRlbXBSZXQwPSgpPT50ZW1wUmV0MDt2YXIgQXRvbWljc19sb2FkPUF0b21pY3MubG9hZDt2YXIgQXRvbWljc19zdG9yZT1BdG9taWNzLnN0b3JlO3ZhciBBdG9taWNzX2NvbXBhcmVFeGNoYW5nZT1BdG9taWNzLmNvbXBhcmVFeGNoYW5nZTt2YXIgd2FzbUJpbmFyeTtpZihNb2R1bGVbIndhc21CaW5hcnkiXSl3YXNtQmluYXJ5PU1vZHVsZVsid2FzbUJpbmFyeSJdO3ZhciBub0V4aXRSdW50aW1lPU1vZHVsZVsibm9FeGl0UnVudGltZSJdfHxmYWxzZTtpZih0eXBlb2YgV2ViQXNzZW1ibHkhPSJvYmplY3QiKXthYm9ydCgibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZCIpfXZhciB3YXNtTWVtb3J5O3ZhciB3YXNtTW9kdWxlO3ZhciBBQk9SVD1mYWxzZTt2YXIgRVhJVFNUQVRVUztmdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLHRleHQpe2lmKCFjb25kaXRpb24pe2Fib3J0KHRleHQpfX12YXIgVVRGOERlY29kZXI9dHlwZW9mIFRleHREZWNvZGVyIT0idW5kZWZpbmVkIj9uZXcgVGV4dERlY29kZXIoInV0ZjgiKTp1bmRlZmluZWQ7ZnVuY3Rpb24gVVRGOEFycmF5VG9TdHJpbmcoaGVhcE9yQXJyYXksaWR4LG1heEJ5dGVzVG9SZWFkKXt2YXIgZW5kSWR4PWlkeCttYXhCeXRlc1RvUmVhZDt2YXIgZW5kUHRyPWlkeDt3aGlsZShoZWFwT3JBcnJheVtlbmRQdHJdJiYhKGVuZFB0cj49ZW5kSWR4KSkrK2VuZFB0cjtpZihlbmRQdHItaWR4PjE2JiZoZWFwT3JBcnJheS5idWZmZXImJlVURjhEZWNvZGVyKXtyZXR1cm4gVVRGOERlY29kZXIuZGVjb2RlKGhlYXBPckFycmF5LmJ1ZmZlciBpbnN0YW5jZW9mIFNoYXJlZEFycmF5QnVmZmVyP2hlYXBPckFycmF5LnNsaWNlKGlkeCxlbmRQdHIpOmhlYXBPckFycmF5LnN1YmFycmF5KGlkeCxlbmRQdHIpKX1lbHNle3ZhciBzdHI9IiI7d2hpbGUoaWR4PGVuZFB0cil7dmFyIHUwPWhlYXBPckFycmF5W2lkeCsrXTtpZighKHUwJjEyOCkpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1MCk7Y29udGludWV9dmFyIHUxPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjI0KT09MTkyKXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoKHUwJjMxKTw8Nnx1MSk7Y29udGludWV9dmFyIHUyPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjQwKT09MjI0KXt1MD0odTAmMTUpPDwxMnx1MTw8Nnx1Mn1lbHNle3UwPSh1MCY3KTw8MTh8dTE8PDEyfHUyPDw2fGhlYXBPckFycmF5W2lkeCsrXSY2M31pZih1MDw2NTUzNil7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHUwKX1lbHNle3ZhciBjaD11MC02NTUzNjtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8Y2g+PjEwLDU2MzIwfGNoJjEwMjMpfX19cmV0dXJuIHN0cn1mdW5jdGlvbiBVVEY4VG9TdHJpbmcocHRyLG1heEJ5dGVzVG9SZWFkKXtyZXR1cm4gcHRyP1VURjhBcnJheVRvU3RyaW5nKEdST1dBQkxFX0hFQVBfVTgoKSxwdHIsbWF4Qnl0ZXNUb1JlYWQpOiIifWZ1bmN0aW9uIHN0cmluZ1RvVVRGOEFycmF5KHN0cixoZWFwLG91dElkeCxtYXhCeXRlc1RvV3JpdGUpe2lmKCEobWF4Qnl0ZXNUb1dyaXRlPjApKXJldHVybiAwO3ZhciBzdGFydElkeD1vdXRJZHg7dmFyIGVuZElkeD1vdXRJZHgrbWF4Qnl0ZXNUb1dyaXRlLTE7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIHU9c3RyLmNoYXJDb2RlQXQoaSk7aWYodT49NTUyOTYmJnU8PTU3MzQzKXt2YXIgdTE9c3RyLmNoYXJDb2RlQXQoKytpKTt1PTY1NTM2KygodSYxMDIzKTw8MTApfHUxJjEwMjN9aWYodTw9MTI3KXtpZihvdXRJZHg+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT11fWVsc2UgaWYodTw9MjA0Nyl7aWYob3V0SWR4KzE+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0xOTJ8dT4+NjtoZWFwW291dElkeCsrXT0xMjh8dSY2M31lbHNlIGlmKHU8PTY1NTM1KXtpZihvdXRJZHgrMj49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTIyNHx1Pj4xMjtoZWFwW291dElkeCsrXT0xMjh8dT4+NiY2MztoZWFwW291dElkeCsrXT0xMjh8dSY2M31lbHNle2lmKG91dElkeCszPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MjQwfHU+PjE4O2hlYXBbb3V0SWR4KytdPTEyOHx1Pj4xMiY2MztoZWFwW291dElkeCsrXT0xMjh8dT4+NiY2MztoZWFwW291dElkeCsrXT0xMjh8dSY2M319aGVhcFtvdXRJZHhdPTA7cmV0dXJuIG91dElkeC1zdGFydElkeH1mdW5jdGlvbiBzdHJpbmdUb1VURjgoc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpe3JldHVybiBzdHJpbmdUb1VURjhBcnJheShzdHIsR1JPV0FCTEVfSEVBUF9VOCgpLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpfWZ1bmN0aW9uIGxlbmd0aEJ5dGVzVVRGOChzdHIpe3ZhciBsZW49MDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgdT1zdHIuY2hhckNvZGVBdChpKTtpZih1Pj01NTI5NiYmdTw9NTczNDMpdT02NTUzNisoKHUmMTAyMyk8PDEwKXxzdHIuY2hhckNvZGVBdCgrK2kpJjEwMjM7aWYodTw9MTI3KSsrbGVuO2Vsc2UgaWYodTw9MjA0NylsZW4rPTI7ZWxzZSBpZih1PD02NTUzNSlsZW4rPTM7ZWxzZSBsZW4rPTR9cmV0dXJuIGxlbn12YXIgVVRGMTZEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGYtMTZsZSIpOnVuZGVmaW5lZDtmdW5jdGlvbiBVVEYxNlRvU3RyaW5nKHB0cixtYXhCeXRlc1RvUmVhZCl7dmFyIGVuZFB0cj1wdHI7dmFyIGlkeD1lbmRQdHI+PjE7dmFyIG1heElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQvMjt3aGlsZSghKGlkeD49bWF4SWR4KSYmR1JPV0FCTEVfSEVBUF9VMTYoKVtpZHhdKSsraWR4O2VuZFB0cj1pZHg8PDE7aWYoZW5kUHRyLXB0cj4zMiYmVVRGMTZEZWNvZGVyKXtyZXR1cm4gVVRGMTZEZWNvZGVyLmRlY29kZShHUk9XQUJMRV9IRUFQX1U4KCkuc2xpY2UocHRyLGVuZFB0cikpfWVsc2V7dmFyIHN0cj0iIjtmb3IodmFyIGk9MDshKGk+PW1heEJ5dGVzVG9SZWFkLzIpOysraSl7dmFyIGNvZGVVbml0PUdST1dBQkxFX0hFQVBfSTE2KClbcHRyK2kqMj4+MV07aWYoY29kZVVuaXQ9PTApYnJlYWs7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGVVbml0KX1yZXR1cm4gc3RyfX1mdW5jdGlvbiBzdHJpbmdUb1VURjE2KHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKXtpZihtYXhCeXRlc1RvV3JpdGU9PT11bmRlZmluZWQpe21heEJ5dGVzVG9Xcml0ZT0yMTQ3NDgzNjQ3fWlmKG1heEJ5dGVzVG9Xcml0ZTwyKXJldHVybiAwO21heEJ5dGVzVG9Xcml0ZS09Mjt2YXIgc3RhcnRQdHI9b3V0UHRyO3ZhciBudW1DaGFyc1RvV3JpdGU9bWF4Qnl0ZXNUb1dyaXRlPHN0ci5sZW5ndGgqMj9tYXhCeXRlc1RvV3JpdGUvMjpzdHIubGVuZ3RoO2Zvcih2YXIgaT0wO2k8bnVtQ2hhcnNUb1dyaXRlOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO0dST1dBQkxFX0hFQVBfSTE2KClbb3V0UHRyPj4xXT1jb2RlVW5pdDtvdXRQdHIrPTJ9R1JPV0FCTEVfSEVBUF9JMTYoKVtvdXRQdHI+PjFdPTA7cmV0dXJuIG91dFB0ci1zdGFydFB0cn1mdW5jdGlvbiBsZW5ndGhCeXRlc1VURjE2KHN0cil7cmV0dXJuIHN0ci5sZW5ndGgqMn1mdW5jdGlvbiBVVEYzMlRvU3RyaW5nKHB0cixtYXhCeXRlc1RvUmVhZCl7dmFyIGk9MDt2YXIgc3RyPSIiO3doaWxlKCEoaT49bWF4Qnl0ZXNUb1JlYWQvNCkpe3ZhciB1dGYzMj1HUk9XQUJMRV9IRUFQX0kzMigpW3B0citpKjQ+PjJdO2lmKHV0ZjMyPT0wKWJyZWFrOysraTtpZih1dGYzMj49NjU1MzYpe3ZhciBjaD11dGYzMi02NTUzNjtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8Y2g+PjEwLDU2MzIwfGNoJjEwMjMpfWVsc2V7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHV0ZjMyKX19cmV0dXJuIHN0cn1mdW5jdGlvbiBzdHJpbmdUb1VURjMyKHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKXtpZihtYXhCeXRlc1RvV3JpdGU9PT11bmRlZmluZWQpe21heEJ5dGVzVG9Xcml0ZT0yMTQ3NDgzNjQ3fWlmKG1heEJ5dGVzVG9Xcml0ZTw0KXJldHVybiAwO3ZhciBzdGFydFB0cj1vdXRQdHI7dmFyIGVuZFB0cj1zdGFydFB0cittYXhCeXRlc1RvV3JpdGUtNDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7aWYoY29kZVVuaXQ+PTU1Mjk2JiZjb2RlVW5pdDw9NTczNDMpe3ZhciB0cmFpbFN1cnJvZ2F0ZT1zdHIuY2hhckNvZGVBdCgrK2kpO2NvZGVVbml0PTY1NTM2KygoY29kZVVuaXQmMTAyMyk8PDEwKXx0cmFpbFN1cnJvZ2F0ZSYxMDIzfUdST1dBQkxFX0hFQVBfSTMyKClbb3V0UHRyPj4yXT1jb2RlVW5pdDtvdXRQdHIrPTQ7aWYob3V0UHRyKzQ+ZW5kUHRyKWJyZWFrfUdST1dBQkxFX0hFQVBfSTMyKClbb3V0UHRyPj4yXT0wO3JldHVybiBvdXRQdHItc3RhcnRQdHJ9ZnVuY3Rpb24gbGVuZ3RoQnl0ZXNVVEYzMihzdHIpe3ZhciBsZW49MDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7aWYoY29kZVVuaXQ+PTU1Mjk2JiZjb2RlVW5pdDw9NTczNDMpKytpO2xlbis9NH1yZXR1cm4gbGVufWZ1bmN0aW9uIHdyaXRlQXJyYXlUb01lbW9yeShhcnJheSxidWZmZXIpe0dST1dBQkxFX0hFQVBfSTgoKS5zZXQoYXJyYXksYnVmZmVyKX1mdW5jdGlvbiB3cml0ZUFzY2lpVG9NZW1vcnkoc3RyLGJ1ZmZlcixkb250QWRkTnVsbCl7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7R1JPV0FCTEVfSEVBUF9JOCgpW2J1ZmZlcisrPj4wXT1zdHIuY2hhckNvZGVBdChpKX1pZighZG9udEFkZE51bGwpR1JPV0FCTEVfSEVBUF9JOCgpW2J1ZmZlcj4+MF09MH12YXIgYnVmZmVyLEhFQVA4LEhFQVBVOCxIRUFQMTYsSEVBUFUxNixIRUFQMzIsSEVBUFUzMixIRUFQRjMyLEhFQVBGNjQ7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCl7YnVmZmVyPU1vZHVsZVsiYnVmZmVyIl19ZnVuY3Rpb24gdXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3MoYnVmKXtidWZmZXI9YnVmO01vZHVsZVsiSEVBUDgiXT1IRUFQOD1uZXcgSW50OEFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQMTYiXT1IRUFQMTY9bmV3IEludDE2QXJyYXkoYnVmKTtNb2R1bGVbIkhFQVAzMiJdPUhFQVAzMj1uZXcgSW50MzJBcnJheShidWYpO01vZHVsZVsiSEVBUFU4Il09SEVBUFU4PW5ldyBVaW50OEFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQVTE2Il09SEVBUFUxNj1uZXcgVWludDE2QXJyYXkoYnVmKTtNb2R1bGVbIkhFQVBVMzIiXT1IRUFQVTMyPW5ldyBVaW50MzJBcnJheShidWYpO01vZHVsZVsiSEVBUEYzMiJdPUhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShidWYpO01vZHVsZVsiSEVBUEY2NCJdPUhFQVBGNjQ9bmV3IEZsb2F0NjRBcnJheShidWYpfXZhciBJTklUSUFMX01FTU9SWT1Nb2R1bGVbIklOSVRJQUxfTUVNT1JZIl18fDE2Nzc3MjE2O2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpe3dhc21NZW1vcnk9TW9kdWxlWyJ3YXNtTWVtb3J5Il07YnVmZmVyPU1vZHVsZVsiYnVmZmVyIl19ZWxzZXtpZihNb2R1bGVbIndhc21NZW1vcnkiXSl7d2FzbU1lbW9yeT1Nb2R1bGVbIndhc21NZW1vcnkiXX1lbHNle3dhc21NZW1vcnk9bmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7ImluaXRpYWwiOklOSVRJQUxfTUVNT1JZLzY1NTM2LCJtYXhpbXVtIjoyMTQ3NDgzNjQ4LzY1NTM2LCJzaGFyZWQiOnRydWV9KTtpZighKHdhc21NZW1vcnkuYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXIpKXtlcnIoInJlcXVlc3RlZCBhIHNoYXJlZCBXZWJBc3NlbWJseS5NZW1vcnkgYnV0IHRoZSByZXR1cm5lZCBidWZmZXIgaXMgbm90IGEgU2hhcmVkQXJyYXlCdWZmZXIsIGluZGljYXRpbmcgdGhhdCB3aGlsZSB0aGUgYnJvd3NlciBoYXMgU2hhcmVkQXJyYXlCdWZmZXIgaXQgZG9lcyBub3QgaGF2ZSBXZWJBc3NlbWJseSB0aHJlYWRzIHN1cHBvcnQgLSB5b3UgbWF5IG5lZWQgdG8gc2V0IGEgZmxhZyIpO2lmKEVOVklST05NRU5UX0lTX05PREUpe2NvbnNvbGUubG9nKCIob24gbm9kZSB5b3UgbWF5IG5lZWQ6IC0tZXhwZXJpbWVudGFsLXdhc20tdGhyZWFkcyAtLWV4cGVyaW1lbnRhbC13YXNtLWJ1bGstbWVtb3J5IGFuZCBhbHNvIHVzZSBhIHJlY2VudCB2ZXJzaW9uKSIpfXRocm93IEVycm9yKCJiYWQgbWVtb3J5Iil9fX1pZih3YXNtTWVtb3J5KXtidWZmZXI9d2FzbU1lbW9yeS5idWZmZXJ9SU5JVElBTF9NRU1PUlk9YnVmZmVyLmJ5dGVMZW5ndGg7dXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3MoYnVmZmVyKTt2YXIgd2FzbVRhYmxlO3ZhciBfX0FUUFJFUlVOX189W107dmFyIF9fQVRJTklUX189W107dmFyIF9fQVRFWElUX189W107dmFyIF9fQVRQT1NUUlVOX189W107dmFyIHJ1bnRpbWVJbml0aWFsaXplZD1mYWxzZTt2YXIgcnVudGltZUV4aXRlZD1mYWxzZTt2YXIgcnVudGltZUtlZXBhbGl2ZUNvdW50ZXI9MDtmdW5jdGlvbiBrZWVwUnVudGltZUFsaXZlKCl7cmV0dXJuIG5vRXhpdFJ1bnRpbWV8fHJ1bnRpbWVLZWVwYWxpdmVDb3VudGVyPjB9ZnVuY3Rpb24gcHJlUnVuKCl7aWYoTW9kdWxlWyJwcmVSdW4iXSl7aWYodHlwZW9mIE1vZHVsZVsicHJlUnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwcmVSdW4iXT1bTW9kdWxlWyJwcmVSdW4iXV07d2hpbGUoTW9kdWxlWyJwcmVSdW4iXS5sZW5ndGgpe2FkZE9uUHJlUnVuKE1vZHVsZVsicHJlUnVuIl0uc2hpZnQoKSl9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQUkVSVU5fXyl9ZnVuY3Rpb24gaW5pdFJ1bnRpbWUoKXtydW50aW1lSW5pdGlhbGl6ZWQ9dHJ1ZTtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybjtpZighTW9kdWxlWyJub0ZTSW5pdCJdJiYhRlMuaW5pdC5pbml0aWFsaXplZClGUy5pbml0KCk7RlMuaWdub3JlUGVybWlzc2lvbnM9ZmFsc2U7VFRZLmluaXQoKTtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUSU5JVF9fKX1mdW5jdGlvbiBleGl0UnVudGltZSgpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuO19fX2Z1bmNzX29uX2V4aXQoKTtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FURVhJVF9fKTtGUy5xdWl0KCk7VFRZLnNodXRkb3duKCk7UFRocmVhZC50ZXJtaW5hdGVBbGxUaHJlYWRzKCk7cnVudGltZUV4aXRlZD10cnVlfWZ1bmN0aW9uIHBvc3RSdW4oKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybjtpZihNb2R1bGVbInBvc3RSdW4iXSl7aWYodHlwZW9mIE1vZHVsZVsicG9zdFJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicG9zdFJ1biJdPVtNb2R1bGVbInBvc3RSdW4iXV07d2hpbGUoTW9kdWxlWyJwb3N0UnVuIl0ubGVuZ3RoKXthZGRPblBvc3RSdW4oTW9kdWxlWyJwb3N0UnVuIl0uc2hpZnQoKSl9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pfWZ1bmN0aW9uIGFkZE9uUHJlUnVuKGNiKXtfX0FUUFJFUlVOX18udW5zaGlmdChjYil9ZnVuY3Rpb24gYWRkT25Jbml0KGNiKXtfX0FUSU5JVF9fLnVuc2hpZnQoY2IpfWZ1bmN0aW9uIGFkZE9uUG9zdFJ1bihjYil7X19BVFBPU1RSVU5fXy51bnNoaWZ0KGNiKX12YXIgcnVuRGVwZW5kZW5jaWVzPTA7dmFyIHJ1bkRlcGVuZGVuY3lXYXRjaGVyPW51bGw7dmFyIGRlcGVuZGVuY2llc0Z1bGZpbGxlZD1udWxsO2Z1bmN0aW9uIGdldFVuaXF1ZVJ1bkRlcGVuZGVuY3koaWQpe3JldHVybiBpZH1mdW5jdGlvbiBhZGRSdW5EZXBlbmRlbmN5KGlkKXtydW5EZXBlbmRlbmNpZXMrKztpZihNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXSl7TW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0ocnVuRGVwZW5kZW5jaWVzKX19ZnVuY3Rpb24gcmVtb3ZlUnVuRGVwZW5kZW5jeShpZCl7cnVuRGVwZW5kZW5jaWVzLS07aWYoTW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0pe01vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKHJ1bkRlcGVuZGVuY2llcyl9aWYocnVuRGVwZW5kZW5jaWVzPT0wKXtpZihydW5EZXBlbmRlbmN5V2F0Y2hlciE9PW51bGwpe2NsZWFySW50ZXJ2YWwocnVuRGVwZW5kZW5jeVdhdGNoZXIpO3J1bkRlcGVuZGVuY3lXYXRjaGVyPW51bGx9aWYoZGVwZW5kZW5jaWVzRnVsZmlsbGVkKXt2YXIgY2FsbGJhY2s9ZGVwZW5kZW5jaWVzRnVsZmlsbGVkO2RlcGVuZGVuY2llc0Z1bGZpbGxlZD1udWxsO2NhbGxiYWNrKCl9fX1mdW5jdGlvbiBhYm9ydCh3aGF0KXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXtwb3N0TWVzc2FnZSh7ImNtZCI6Im9uQWJvcnQiLCJhcmciOndoYXR9KX1lbHNle2lmKE1vZHVsZVsib25BYm9ydCJdKXtNb2R1bGVbIm9uQWJvcnQiXSh3aGF0KX19d2hhdD0iQWJvcnRlZCgiK3doYXQrIikiO2Vycih3aGF0KTtBQk9SVD10cnVlO0VYSVRTVEFUVVM9MTt3aGF0Kz0iLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLiI7dmFyIGU9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcih3aGF0KTtyZWFkeVByb21pc2VSZWplY3QoZSk7dGhyb3cgZX12YXIgZGF0YVVSSVByZWZpeD0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LCI7ZnVuY3Rpb24gaXNEYXRhVVJJKGZpbGVuYW1lKXtyZXR1cm4gZmlsZW5hbWUuc3RhcnRzV2l0aChkYXRhVVJJUHJlZml4KX12YXIgd2FzbUJpbmFyeUZpbGU7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3dhc21CaW5hcnlGaWxlPSJtYWluLWJpbi1tdWx0aS53YXNtIjtpZighaXNEYXRhVVJJKHdhc21CaW5hcnlGaWxlKSl7d2FzbUJpbmFyeUZpbGU9bG9jYXRlRmlsZSh3YXNtQmluYXJ5RmlsZSl9fWVsc2V7d2FzbUJpbmFyeUZpbGU9bmV3IFVSTCgibWFpbi1iaW4tbXVsdGkud2FzbSIsbG9jYXRpb24uaHJlZikudG9TdHJpbmcoKX1mdW5jdGlvbiBnZXRCaW5hcnkoZmlsZSl7dHJ5e2lmKGZpbGU9PXdhc21CaW5hcnlGaWxlJiZ3YXNtQmluYXJ5KXtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkod2FzbUJpbmFyeSl9aWYocmVhZEJpbmFyeSl7cmV0dXJuIHJlYWRCaW5hcnkoZmlsZSl9ZWxzZXt0aHJvdyJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZCJ9fWNhdGNoKGVycil7YWJvcnQoZXJyKX19ZnVuY3Rpb24gZ2V0QmluYXJ5UHJvbWlzZSgpe2lmKCF3YXNtQmluYXJ5JiYoRU5WSVJPTk1FTlRfSVNfV0VCfHxFTlZJUk9OTUVOVF9JU19XT1JLRVIpKXtpZih0eXBlb2YgZmV0Y2g9PSJmdW5jdGlvbiIpe3JldHVybiBmZXRjaCh3YXNtQmluYXJ5RmlsZSx7Y3JlZGVudGlhbHM6InNhbWUtb3JpZ2luIn0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe2lmKCFyZXNwb25zZVsib2siXSl7dGhyb3ciZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnIit3YXNtQmluYXJ5RmlsZSsiJyJ9cmV0dXJuIHJlc3BvbnNlWyJhcnJheUJ1ZmZlciJdKCl9KS5jYXRjaChmdW5jdGlvbigpe3JldHVybiBnZXRCaW5hcnkod2FzbUJpbmFyeUZpbGUpfSl9fXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uKCl7cmV0dXJuIGdldEJpbmFyeSh3YXNtQmluYXJ5RmlsZSl9KX1mdW5jdGlvbiBjcmVhdGVXYXNtKCl7dmFyIGluZm89eyJhIjphc21MaWJyYXJ5QXJnfTtmdW5jdGlvbiByZWNlaXZlSW5zdGFuY2UoaW5zdGFuY2UsbW9kdWxlKXt2YXIgZXhwb3J0cz1pbnN0YW5jZS5leHBvcnRzO01vZHVsZVsiYXNtIl09ZXhwb3J0cztyZWdpc3RlclRsc0luaXQoTW9kdWxlWyJhc20iXVsiY2IiXSk7d2FzbVRhYmxlPU1vZHVsZVsiYXNtIl1bIlphIl07YWRkT25Jbml0KE1vZHVsZVsiYXNtIl1bIllhIl0pO3dhc21Nb2R1bGU9bW9kdWxlO2lmKCFFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXt2YXIgbnVtV29ya2Vyc1RvTG9hZD1QVGhyZWFkLnVudXNlZFdvcmtlcnMubGVuZ3RoO1BUaHJlYWQudW51c2VkV29ya2Vycy5mb3JFYWNoKGZ1bmN0aW9uKHcpe1BUaHJlYWQubG9hZFdhc21Nb2R1bGVUb1dvcmtlcih3LGZ1bmN0aW9uKCl7aWYoIS0tbnVtV29ya2Vyc1RvTG9hZClyZW1vdmVSdW5EZXBlbmRlbmN5KCJ3YXNtLWluc3RhbnRpYXRlIil9KX0pfX1pZighRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCl7YWRkUnVuRGVwZW5kZW5jeSgid2FzbS1pbnN0YW50aWF0ZSIpfWZ1bmN0aW9uIHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KHJlc3VsdCl7cmVjZWl2ZUluc3RhbmNlKHJlc3VsdFsiaW5zdGFuY2UiXSxyZXN1bHRbIm1vZHVsZSJdKX1mdW5jdGlvbiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKHJlY2VpdmVyKXtyZXR1cm4gZ2V0QmluYXJ5UHJvbWlzZSgpLnRoZW4oZnVuY3Rpb24oYmluYXJ5KXtyZXR1cm4gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYmluYXJ5LGluZm8pfSkudGhlbihmdW5jdGlvbihpbnN0YW5jZSl7cmV0dXJuIGluc3RhbmNlfSkudGhlbihyZWNlaXZlcixmdW5jdGlvbihyZWFzb24pe2VycigiZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogIityZWFzb24pO2Fib3J0KHJlYXNvbil9KX1mdW5jdGlvbiBpbnN0YW50aWF0ZUFzeW5jKCl7aWYoIXdhc21CaW5hcnkmJnR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZz09ImZ1bmN0aW9uIiYmIWlzRGF0YVVSSSh3YXNtQmluYXJ5RmlsZSkmJnR5cGVvZiBmZXRjaD09ImZ1bmN0aW9uIil7cmV0dXJuIGZldGNoKHdhc21CaW5hcnlGaWxlLHtjcmVkZW50aWFsczoic2FtZS1vcmlnaW4ifSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7dmFyIHJlc3VsdD1XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhyZXNwb25zZSxpbmZvKTtyZXR1cm4gcmVzdWx0LnRoZW4ocmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQsZnVuY3Rpb24ocmVhc29uKXtlcnIoIndhc20gc3RyZWFtaW5nIGNvbXBpbGUgZmFpbGVkOiAiK3JlYXNvbik7ZXJyKCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvbiIpO3JldHVybiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KX0pfSl9ZWxzZXtyZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihyZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdCl9fWlmKE1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0pe3RyeXt2YXIgZXhwb3J0cz1Nb2R1bGVbImluc3RhbnRpYXRlV2FzbSJdKGluZm8scmVjZWl2ZUluc3RhbmNlKTtyZXR1cm4gZXhwb3J0c31jYXRjaChlKXtlcnIoIk1vZHVsZS5pbnN0YW50aWF0ZVdhc20gY2FsbGJhY2sgZmFpbGVkIHdpdGggZXJyb3I6ICIrZSk7cmV0dXJuIGZhbHNlfX1pbnN0YW50aWF0ZUFzeW5jKCkuY2F0Y2gocmVhZHlQcm9taXNlUmVqZWN0KTtyZXR1cm57fX12YXIgdGVtcERvdWJsZTt2YXIgdGVtcEk2NDt2YXIgQVNNX0NPTlNUUz17fTtmdW5jdGlvbiBraWxsVGhyZWFkKHB0aHJlYWRfcHRyKXtHUk9XQUJMRV9IRUFQX0kzMigpW3B0aHJlYWRfcHRyPj4yXT0wO3ZhciBwdGhyZWFkPVBUaHJlYWQucHRocmVhZHNbcHRocmVhZF9wdHJdO2RlbGV0ZSBQVGhyZWFkLnB0aHJlYWRzW3B0aHJlYWRfcHRyXTtwdGhyZWFkLndvcmtlci50ZXJtaW5hdGUoKTtfX2Vtc2NyaXB0ZW5fdGhyZWFkX2ZyZWVfZGF0YShwdGhyZWFkX3B0cik7UFRocmVhZC5ydW5uaW5nV29ya2Vycy5zcGxpY2UoUFRocmVhZC5ydW5uaW5nV29ya2Vycy5pbmRleE9mKHB0aHJlYWQud29ya2VyKSwxKTtwdGhyZWFkLndvcmtlci5wdGhyZWFkPXVuZGVmaW5lZH1mdW5jdGlvbiBjYW5jZWxUaHJlYWQocHRocmVhZF9wdHIpe3ZhciBwdGhyZWFkPVBUaHJlYWQucHRocmVhZHNbcHRocmVhZF9wdHJdO3B0aHJlYWQud29ya2VyLnBvc3RNZXNzYWdlKHsiY21kIjoiY2FuY2VsIn0pfWZ1bmN0aW9uIGNsZWFudXBUaHJlYWQocHRocmVhZF9wdHIpe3ZhciBwdGhyZWFkPVBUaHJlYWQucHRocmVhZHNbcHRocmVhZF9wdHJdO2lmKHB0aHJlYWQpe0dST1dBQkxFX0hFQVBfSTMyKClbcHRocmVhZF9wdHI+PjJdPTA7dmFyIHdvcmtlcj1wdGhyZWFkLndvcmtlcjtQVGhyZWFkLnJldHVybldvcmtlclRvUG9vbCh3b3JrZXIpfX1mdW5jdGlvbiB6ZXJvTWVtb3J5KGFkZHJlc3Msc2l6ZSl7R1JPV0FCTEVfSEVBUF9VOCgpLmZpbGwoMCxhZGRyZXNzLGFkZHJlc3Mrc2l6ZSl9ZnVuY3Rpb24gc3Bhd25UaHJlYWQodGhyZWFkUGFyYW1zKXt2YXIgd29ya2VyPVBUaHJlYWQuZ2V0TmV3V29ya2VyKCk7aWYoIXdvcmtlcil7cmV0dXJuIDZ9UFRocmVhZC5ydW5uaW5nV29ya2Vycy5wdXNoKHdvcmtlcik7dmFyIHB0aHJlYWQ9UFRocmVhZC5wdGhyZWFkc1t0aHJlYWRQYXJhbXMucHRocmVhZF9wdHJdPXt3b3JrZXI6d29ya2VyLHRocmVhZEluZm9TdHJ1Y3Q6dGhyZWFkUGFyYW1zLnB0aHJlYWRfcHRyfTt3b3JrZXIucHRocmVhZD1wdGhyZWFkO3ZhciBtc2c9eyJjbWQiOiJydW4iLCJzdGFydF9yb3V0aW5lIjp0aHJlYWRQYXJhbXMuc3RhcnRSb3V0aW5lLCJhcmciOnRocmVhZFBhcmFtcy5hcmcsInRocmVhZEluZm9TdHJ1Y3QiOnRocmVhZFBhcmFtcy5wdGhyZWFkX3B0cn07d29ya2VyLnJ1blB0aHJlYWQ9KCgpPT57bXNnLnRpbWU9cGVyZm9ybWFuY2Uubm93KCk7d29ya2VyLnBvc3RNZXNzYWdlKG1zZyx0aHJlYWRQYXJhbXMudHJhbnNmZXJMaXN0KX0pO2lmKHdvcmtlci5sb2FkZWQpe3dvcmtlci5ydW5QdGhyZWFkKCk7ZGVsZXRlIHdvcmtlci5ydW5QdGhyZWFkfXJldHVybiAwfWZ1bmN0aW9uIF9leGl0KHN0YXR1cyl7ZXhpdChzdGF0dXMpfWZ1bmN0aW9uIGhhbmRsZUV4Y2VwdGlvbihlKXtpZihlIGluc3RhbmNlb2YgRXhpdFN0YXR1c3x8ZT09InVud2luZCIpe3JldHVybiBFWElUU1RBVFVTfXF1aXRfKDEsZSl9dmFyIFBUaHJlYWQ9e3VudXNlZFdvcmtlcnM6W10scnVubmluZ1dvcmtlcnM6W10sdGxzSW5pdEZ1bmN0aW9uczpbXSxpbml0OmZ1bmN0aW9uKCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCl7UFRocmVhZC5pbml0V29ya2VyKCl9ZWxzZXtQVGhyZWFkLmluaXRNYWluVGhyZWFkKCl9fSxpbml0TWFpblRocmVhZDpmdW5jdGlvbigpe3ZhciBwdGhyZWFkUG9vbFNpemU9Njtmb3IodmFyIGk9MDtpPHB0aHJlYWRQb29sU2l6ZTsrK2kpe1BUaHJlYWQuYWxsb2NhdGVVbnVzZWRXb3JrZXIoKX19LGluaXRXb3JrZXI6ZnVuY3Rpb24oKXtub0V4aXRSdW50aW1lPWZhbHNlfSxwdGhyZWFkczp7fSxzZXRFeGl0U3RhdHVzOmZ1bmN0aW9uKHN0YXR1cyl7RVhJVFNUQVRVUz1zdGF0dXN9LHRlcm1pbmF0ZUFsbFRocmVhZHM6ZnVuY3Rpb24oKXtmb3IodmFyIHQgaW4gUFRocmVhZC5wdGhyZWFkcyl7dmFyIHB0aHJlYWQ9UFRocmVhZC5wdGhyZWFkc1t0XTtpZihwdGhyZWFkJiZwdGhyZWFkLndvcmtlcil7UFRocmVhZC5yZXR1cm5Xb3JrZXJUb1Bvb2wocHRocmVhZC53b3JrZXIpfX1mb3IodmFyIGk9MDtpPFBUaHJlYWQudW51c2VkV29ya2Vycy5sZW5ndGg7KytpKXt2YXIgd29ya2VyPVBUaHJlYWQudW51c2VkV29ya2Vyc1tpXTt3b3JrZXIudGVybWluYXRlKCl9UFRocmVhZC51bnVzZWRXb3JrZXJzPVtdfSxyZXR1cm5Xb3JrZXJUb1Bvb2w6ZnVuY3Rpb24od29ya2VyKXtQVGhyZWFkLnJ1bldpdGhvdXRNYWluVGhyZWFkUXVldWVkQ2FsbHMoZnVuY3Rpb24oKXtkZWxldGUgUFRocmVhZC5wdGhyZWFkc1t3b3JrZXIucHRocmVhZC50aHJlYWRJbmZvU3RydWN0XTtQVGhyZWFkLnVudXNlZFdvcmtlcnMucHVzaCh3b3JrZXIpO1BUaHJlYWQucnVubmluZ1dvcmtlcnMuc3BsaWNlKFBUaHJlYWQucnVubmluZ1dvcmtlcnMuaW5kZXhPZih3b3JrZXIpLDEpO19fZW1zY3JpcHRlbl90aHJlYWRfZnJlZV9kYXRhKHdvcmtlci5wdGhyZWFkLnRocmVhZEluZm9TdHJ1Y3QpO3dvcmtlci5wdGhyZWFkPXVuZGVmaW5lZH0pfSxydW5XaXRob3V0TWFpblRocmVhZFF1ZXVlZENhbGxzOmZ1bmN0aW9uKGZ1bmMpe0dST1dBQkxFX0hFQVBfSTMyKClbX19lbXNjcmlwdGVuX2FsbG93X21haW5fcnVudGltZV9xdWV1ZWRfY2FsbHM+PjJdPTA7dHJ5e2Z1bmMoKX1maW5hbGx5e0dST1dBQkxFX0hFQVBfSTMyKClbX19lbXNjcmlwdGVuX2FsbG93X21haW5fcnVudGltZV9xdWV1ZWRfY2FsbHM+PjJdPTF9fSxyZWNlaXZlT2JqZWN0VHJhbnNmZXI6ZnVuY3Rpb24oZGF0YSl7fSx0aHJlYWRJbml0OmZ1bmN0aW9uKCl7Zm9yKHZhciBpIGluIFBUaHJlYWQudGxzSW5pdEZ1bmN0aW9ucyl7aWYoUFRocmVhZC50bHNJbml0RnVuY3Rpb25zLmhhc093blByb3BlcnR5KGkpKVBUaHJlYWQudGxzSW5pdEZ1bmN0aW9uc1tpXSgpfX0sbG9hZFdhc21Nb2R1bGVUb1dvcmtlcjpmdW5jdGlvbih3b3JrZXIsb25GaW5pc2hlZExvYWRpbmcpe3dvcmtlci5vbm1lc3NhZ2U9KGU9Pnt2YXIgZD1lWyJkYXRhIl07dmFyIGNtZD1kWyJjbWQiXTtpZih3b3JrZXIucHRocmVhZClQVGhyZWFkLmN1cnJlbnRQcm94aWVkT3BlcmF0aW9uQ2FsbGVyVGhyZWFkPXdvcmtlci5wdGhyZWFkLnRocmVhZEluZm9TdHJ1Y3Q7aWYoZFsidGFyZ2V0VGhyZWFkIl0mJmRbInRhcmdldFRocmVhZCJdIT1fcHRocmVhZF9zZWxmKCkpe3ZhciB0aHJlYWQ9UFRocmVhZC5wdGhyZWFkc1tkLnRhcmdldFRocmVhZF07aWYodGhyZWFkKXt0aHJlYWQud29ya2VyLnBvc3RNZXNzYWdlKGQsZFsidHJhbnNmZXJMaXN0Il0pfWVsc2V7ZXJyKCdJbnRlcm5hbCBlcnJvciEgV29ya2VyIHNlbnQgYSBtZXNzYWdlICInK2NtZCsnIiB0byB0YXJnZXQgcHRocmVhZCAnK2RbInRhcmdldFRocmVhZCJdKyIsIGJ1dCB0aGF0IHRocmVhZCBubyBsb25nZXIgZXhpc3RzISIpfVBUaHJlYWQuY3VycmVudFByb3hpZWRPcGVyYXRpb25DYWxsZXJUaHJlYWQ9dW5kZWZpbmVkO3JldHVybn1pZihjbWQ9PT0icHJvY2Vzc1Byb3h5aW5nUXVldWUiKXtleGVjdXRlTm90aWZpZWRQcm94eWluZ1F1ZXVlKGRbInF1ZXVlIl0pfWVsc2UgaWYoY21kPT09InNwYXduVGhyZWFkIil7c3Bhd25UaHJlYWQoZCl9ZWxzZSBpZihjbWQ9PT0iY2xlYW51cFRocmVhZCIpe2NsZWFudXBUaHJlYWQoZFsidGhyZWFkIl0pfWVsc2UgaWYoY21kPT09ImtpbGxUaHJlYWQiKXtraWxsVGhyZWFkKGRbInRocmVhZCJdKX1lbHNlIGlmKGNtZD09PSJjYW5jZWxUaHJlYWQiKXtjYW5jZWxUaHJlYWQoZFsidGhyZWFkIl0pfWVsc2UgaWYoY21kPT09ImxvYWRlZCIpe3dvcmtlci5sb2FkZWQ9dHJ1ZTtpZihvbkZpbmlzaGVkTG9hZGluZylvbkZpbmlzaGVkTG9hZGluZyh3b3JrZXIpO2lmKHdvcmtlci5ydW5QdGhyZWFkKXt3b3JrZXIucnVuUHRocmVhZCgpO2RlbGV0ZSB3b3JrZXIucnVuUHRocmVhZH19ZWxzZSBpZihjbWQ9PT0icHJpbnQiKXtvdXQoIlRocmVhZCAiK2RbInRocmVhZElkIl0rIjogIitkWyJ0ZXh0Il0pfWVsc2UgaWYoY21kPT09InByaW50RXJyIil7ZXJyKCJUaHJlYWQgIitkWyJ0aHJlYWRJZCJdKyI6ICIrZFsidGV4dCJdKX1lbHNlIGlmKGNtZD09PSJhbGVydCIpe2FsZXJ0KCJUaHJlYWQgIitkWyJ0aHJlYWRJZCJdKyI6ICIrZFsidGV4dCJdKX1lbHNlIGlmKGQudGFyZ2V0PT09InNldGltbWVkaWF0ZSIpe3dvcmtlci5wb3N0TWVzc2FnZShkKX1lbHNlIGlmKGNtZD09PSJvbkFib3J0Iil7aWYoTW9kdWxlWyJvbkFib3J0Il0pe01vZHVsZVsib25BYm9ydCJdKGRbImFyZyJdKX19ZWxzZSBpZihjbWQpe2Vycigid29ya2VyIHNlbnQgYW4gdW5rbm93biBjb21tYW5kICIrY21kKX1QVGhyZWFkLmN1cnJlbnRQcm94aWVkT3BlcmF0aW9uQ2FsbGVyVGhyZWFkPXVuZGVmaW5lZH0pO3dvcmtlci5vbmVycm9yPShlPT57dmFyIG1lc3NhZ2U9IndvcmtlciBzZW50IGFuIGVycm9yISI7ZXJyKG1lc3NhZ2UrIiAiK2UuZmlsZW5hbWUrIjoiK2UubGluZW5vKyI6ICIrZS5tZXNzYWdlKTt0aHJvdyBlfSk7d29ya2VyLnBvc3RNZXNzYWdlKHsiY21kIjoibG9hZCIsInVybE9yQmxvYiI6TW9kdWxlWyJtYWluU2NyaXB0VXJsT3JCbG9iIl0sIndhc21NZW1vcnkiOndhc21NZW1vcnksIndhc21Nb2R1bGUiOndhc21Nb2R1bGV9KX0sYWxsb2NhdGVVbnVzZWRXb3JrZXI6ZnVuY3Rpb24oKXtpZighTW9kdWxlWyJsb2NhdGVGaWxlIl0pe1BUaHJlYWQudW51c2VkV29ya2Vycy5wdXNoKG5ldyBXb3JrZXIobmV3IFVSTCgibWFpbi1iaW4tbXVsdGkud29ya2VyLmpzIixsb2NhdGlvbi5ocmVmKSkpO3JldHVybn12YXIgcHRocmVhZE1haW5Kcz1sb2NhdGVGaWxlKCJtYWluLWJpbi1tdWx0aS53b3JrZXIuanMiKTtQVGhyZWFkLnVudXNlZFdvcmtlcnMucHVzaChuZXcgV29ya2VyKHB0aHJlYWRNYWluSnMsIHsgdHlwZTogIm1vZHVsZSIgfSkpfSxnZXROZXdXb3JrZXI6ZnVuY3Rpb24oKXtpZihQVGhyZWFkLnVudXNlZFdvcmtlcnMubGVuZ3RoPT0wKXtQVGhyZWFkLmFsbG9jYXRlVW51c2VkV29ya2VyKCk7UFRocmVhZC5sb2FkV2FzbU1vZHVsZVRvV29ya2VyKFBUaHJlYWQudW51c2VkV29ya2Vyc1swXSl9cmV0dXJuIFBUaHJlYWQudW51c2VkV29ya2Vycy5wb3AoKX19O01vZHVsZVsiUFRocmVhZCJdPVBUaHJlYWQ7ZnVuY3Rpb24gY2FsbFJ1bnRpbWVDYWxsYmFja3MoY2FsbGJhY2tzKXt3aGlsZShjYWxsYmFja3MubGVuZ3RoPjApe3ZhciBjYWxsYmFjaz1jYWxsYmFja3Muc2hpZnQoKTtpZih0eXBlb2YgY2FsbGJhY2s9PSJmdW5jdGlvbiIpe2NhbGxiYWNrKE1vZHVsZSk7Y29udGludWV9dmFyIGZ1bmM9Y2FsbGJhY2suZnVuYztpZih0eXBlb2YgZnVuYz09Im51bWJlciIpe2lmKGNhbGxiYWNrLmFyZz09PXVuZGVmaW5lZCl7Z2V0V2FzbVRhYmxlRW50cnkoZnVuYykoKX1lbHNle2dldFdhc21UYWJsZUVudHJ5KGZ1bmMpKGNhbGxiYWNrLmFyZyl9fWVsc2V7ZnVuYyhjYWxsYmFjay5hcmc9PT11bmRlZmluZWQ/bnVsbDpjYWxsYmFjay5hcmcpfX19ZnVuY3Rpb24gd2l0aFN0YWNrU2F2ZShmKXt2YXIgc3RhY2s9c3RhY2tTYXZlKCk7dmFyIHJldD1mKCk7c3RhY2tSZXN0b3JlKHN0YWNrKTtyZXR1cm4gcmV0fWZ1bmN0aW9uIGVzdGFibGlzaFN0YWNrU3BhY2UoKXt2YXIgcHRocmVhZF9wdHI9X3B0aHJlYWRfc2VsZigpO3ZhciBzdGFja1RvcD1HUk9XQUJMRV9IRUFQX0kzMigpW3B0aHJlYWRfcHRyKzQ0Pj4yXTt2YXIgc3RhY2tTaXplPUdST1dBQkxFX0hFQVBfSTMyKClbcHRocmVhZF9wdHIrNDg+PjJdO3ZhciBzdGFja01heD1zdGFja1RvcC1zdGFja1NpemU7X2Vtc2NyaXB0ZW5fc3RhY2tfc2V0X2xpbWl0cyhzdGFja1RvcCxzdGFja01heCk7c3RhY2tSZXN0b3JlKHN0YWNrVG9wKX1Nb2R1bGVbImVzdGFibGlzaFN0YWNrU3BhY2UiXT1lc3RhYmxpc2hTdGFja1NwYWNlO2Z1bmN0aW9uIGV4aXRPbk1haW5UaHJlYWQocmV0dXJuQ29kZSl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMSwwLHJldHVybkNvZGUpO3RyeXtfZXhpdChyZXR1cm5Db2RlKX1jYXRjaChlKXtoYW5kbGVFeGNlcHRpb24oZSl9fXZhciB3YXNtVGFibGVNaXJyb3I9W107ZnVuY3Rpb24gZ2V0V2FzbVRhYmxlRW50cnkoZnVuY1B0cil7dmFyIGZ1bmM9d2FzbVRhYmxlTWlycm9yW2Z1bmNQdHJdO2lmKCFmdW5jKXtpZihmdW5jUHRyPj13YXNtVGFibGVNaXJyb3IubGVuZ3RoKXdhc21UYWJsZU1pcnJvci5sZW5ndGg9ZnVuY1B0cisxO3dhc21UYWJsZU1pcnJvcltmdW5jUHRyXT1mdW5jPXdhc21UYWJsZS5nZXQoZnVuY1B0cil9cmV0dXJuIGZ1bmN9ZnVuY3Rpb24gaW52b2tlRW50cnlQb2ludChwdHIsYXJnKXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkocHRyKShhcmcpfU1vZHVsZVsiaW52b2tlRW50cnlQb2ludCJdPWludm9rZUVudHJ5UG9pbnQ7ZnVuY3Rpb24gcmVnaXN0ZXJUbHNJbml0KHRsc0luaXRGdW5jKXtQVGhyZWFkLnRsc0luaXRGdW5jdGlvbnMucHVzaCh0bHNJbml0RnVuYyl9ZnVuY3Rpb24gX19fYXNzZXJ0X2ZhaWwoY29uZGl0aW9uLGZpbGVuYW1lLGxpbmUsZnVuYyl7YWJvcnQoIkFzc2VydGlvbiBmYWlsZWQ6ICIrVVRGOFRvU3RyaW5nKGNvbmRpdGlvbikrIiwgYXQ6ICIrW2ZpbGVuYW1lP1VURjhUb1N0cmluZyhmaWxlbmFtZSk6InVua25vd24gZmlsZW5hbWUiLGxpbmUsZnVuYz9VVEY4VG9TdHJpbmcoZnVuYyk6InVua25vd24gZnVuY3Rpb24iXSl9ZnVuY3Rpb24gX19fY3hhX2FsbG9jYXRlX2V4Y2VwdGlvbihzaXplKXtyZXR1cm4gX21hbGxvYyhzaXplKzI0KSsyNH12YXIgZXhjZXB0aW9uQ2F1Z2h0PVtdO2Z1bmN0aW9uIGV4Y2VwdGlvbl9hZGRSZWYoaW5mbyl7aW5mby5hZGRfcmVmKCl9dmFyIHVuY2F1Z2h0RXhjZXB0aW9uQ291bnQ9MDtmdW5jdGlvbiBfX19jeGFfYmVnaW5fY2F0Y2gocHRyKXt2YXIgaW5mbz1uZXcgRXhjZXB0aW9uSW5mbyhwdHIpO2lmKCFpbmZvLmdldF9jYXVnaHQoKSl7aW5mby5zZXRfY2F1Z2h0KHRydWUpO3VuY2F1Z2h0RXhjZXB0aW9uQ291bnQtLX1pbmZvLnNldF9yZXRocm93bihmYWxzZSk7ZXhjZXB0aW9uQ2F1Z2h0LnB1c2goaW5mbyk7ZXhjZXB0aW9uX2FkZFJlZihpbmZvKTtyZXR1cm4gaW5mby5nZXRfZXhjZXB0aW9uX3B0cigpfWZ1bmN0aW9uIF9fX2N4YV9jdXJyZW50X3ByaW1hcnlfZXhjZXB0aW9uKCl7aWYoIWV4Y2VwdGlvbkNhdWdodC5sZW5ndGgpe3JldHVybiAwfXZhciBpbmZvPWV4Y2VwdGlvbkNhdWdodFtleGNlcHRpb25DYXVnaHQubGVuZ3RoLTFdO2V4Y2VwdGlvbl9hZGRSZWYoaW5mbyk7cmV0dXJuIGluZm8uZXhjUHRyfWZ1bmN0aW9uIEV4Y2VwdGlvbkluZm8oZXhjUHRyKXt0aGlzLmV4Y1B0cj1leGNQdHI7dGhpcy5wdHI9ZXhjUHRyLTI0O3RoaXMuc2V0X3R5cGU9ZnVuY3Rpb24odHlwZSl7R1JPV0FCTEVfSEVBUF9VMzIoKVt0aGlzLnB0cis0Pj4yXT10eXBlfTt0aGlzLmdldF90eXBlPWZ1bmN0aW9uKCl7cmV0dXJuIEdST1dBQkxFX0hFQVBfVTMyKClbdGhpcy5wdHIrND4+Ml19O3RoaXMuc2V0X2Rlc3RydWN0b3I9ZnVuY3Rpb24oZGVzdHJ1Y3Rvcil7R1JPV0FCTEVfSEVBUF9VMzIoKVt0aGlzLnB0cis4Pj4yXT1kZXN0cnVjdG9yfTt0aGlzLmdldF9kZXN0cnVjdG9yPWZ1bmN0aW9uKCl7cmV0dXJuIEdST1dBQkxFX0hFQVBfVTMyKClbdGhpcy5wdHIrOD4+Ml19O3RoaXMuc2V0X3JlZmNvdW50PWZ1bmN0aW9uKHJlZmNvdW50KXtHUk9XQUJMRV9IRUFQX0kzMigpW3RoaXMucHRyPj4yXT1yZWZjb3VudH07dGhpcy5zZXRfY2F1Z2h0PWZ1bmN0aW9uKGNhdWdodCl7Y2F1Z2h0PWNhdWdodD8xOjA7R1JPV0FCTEVfSEVBUF9JOCgpW3RoaXMucHRyKzEyPj4wXT1jYXVnaHR9O3RoaXMuZ2V0X2NhdWdodD1mdW5jdGlvbigpe3JldHVybiBHUk9XQUJMRV9IRUFQX0k4KClbdGhpcy5wdHIrMTI+PjBdIT0wfTt0aGlzLnNldF9yZXRocm93bj1mdW5jdGlvbihyZXRocm93bil7cmV0aHJvd249cmV0aHJvd24/MTowO0dST1dBQkxFX0hFQVBfSTgoKVt0aGlzLnB0cisxMz4+MF09cmV0aHJvd259O3RoaXMuZ2V0X3JldGhyb3duPWZ1bmN0aW9uKCl7cmV0dXJuIEdST1dBQkxFX0hFQVBfSTgoKVt0aGlzLnB0cisxMz4+MF0hPTB9O3RoaXMuaW5pdD1mdW5jdGlvbih0eXBlLGRlc3RydWN0b3Ipe3RoaXMuc2V0X2FkanVzdGVkX3B0cigwKTt0aGlzLnNldF90eXBlKHR5cGUpO3RoaXMuc2V0X2Rlc3RydWN0b3IoZGVzdHJ1Y3Rvcik7dGhpcy5zZXRfcmVmY291bnQoMCk7dGhpcy5zZXRfY2F1Z2h0KGZhbHNlKTt0aGlzLnNldF9yZXRocm93bihmYWxzZSl9O3RoaXMuYWRkX3JlZj1mdW5jdGlvbigpe0F0b21pY3MuYWRkKEdST1dBQkxFX0hFQVBfSTMyKCksdGhpcy5wdHIrMD4+MiwxKX07dGhpcy5yZWxlYXNlX3JlZj1mdW5jdGlvbigpe3ZhciBwcmV2PUF0b21pY3Muc3ViKEdST1dBQkxFX0hFQVBfSTMyKCksdGhpcy5wdHIrMD4+MiwxKTtyZXR1cm4gcHJldj09PTF9O3RoaXMuc2V0X2FkanVzdGVkX3B0cj1mdW5jdGlvbihhZGp1c3RlZFB0cil7R1JPV0FCTEVfSEVBUF9VMzIoKVt0aGlzLnB0cisxNj4+Ml09YWRqdXN0ZWRQdHJ9O3RoaXMuZ2V0X2FkanVzdGVkX3B0cj1mdW5jdGlvbigpe3JldHVybiBHUk9XQUJMRV9IRUFQX1UzMigpW3RoaXMucHRyKzE2Pj4yXX07dGhpcy5nZXRfZXhjZXB0aW9uX3B0cj1mdW5jdGlvbigpe3ZhciBpc1BvaW50ZXI9X19fY3hhX2lzX3BvaW50ZXJfdHlwZSh0aGlzLmdldF90eXBlKCkpO2lmKGlzUG9pbnRlcil7cmV0dXJuIEdST1dBQkxFX0hFQVBfVTMyKClbdGhpcy5leGNQdHI+PjJdfXZhciBhZGp1c3RlZD10aGlzLmdldF9hZGp1c3RlZF9wdHIoKTtpZihhZGp1c3RlZCE9PTApcmV0dXJuIGFkanVzdGVkO3JldHVybiB0aGlzLmV4Y1B0cn19ZnVuY3Rpb24gX19fY3hhX2ZyZWVfZXhjZXB0aW9uKHB0cil7cmV0dXJuIF9mcmVlKG5ldyBFeGNlcHRpb25JbmZvKHB0cikucHRyKX1mdW5jdGlvbiBleGNlcHRpb25fZGVjUmVmKGluZm8pe2lmKGluZm8ucmVsZWFzZV9yZWYoKSYmIWluZm8uZ2V0X3JldGhyb3duKCkpe3ZhciBkZXN0cnVjdG9yPWluZm8uZ2V0X2Rlc3RydWN0b3IoKTtpZihkZXN0cnVjdG9yKXtnZXRXYXNtVGFibGVFbnRyeShkZXN0cnVjdG9yKShpbmZvLmV4Y1B0cil9X19fY3hhX2ZyZWVfZXhjZXB0aW9uKGluZm8uZXhjUHRyKX19ZnVuY3Rpb24gX19fY3hhX2RlY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQocHRyKXtpZighcHRyKXJldHVybjtleGNlcHRpb25fZGVjUmVmKG5ldyBFeGNlcHRpb25JbmZvKHB0cikpfXZhciBleGNlcHRpb25MYXN0PTA7ZnVuY3Rpb24gX19fY3hhX2VuZF9jYXRjaCgpe19zZXRUaHJldygwKTt2YXIgaW5mbz1leGNlcHRpb25DYXVnaHQucG9wKCk7ZXhjZXB0aW9uX2RlY1JlZihpbmZvKTtleGNlcHRpb25MYXN0PTB9ZnVuY3Rpb24gX19fcmVzdW1lRXhjZXB0aW9uKHB0cil7aWYoIWV4Y2VwdGlvbkxhc3Qpe2V4Y2VwdGlvbkxhc3Q9cHRyfXRocm93IHB0cn1mdW5jdGlvbiBfX19jeGFfZmluZF9tYXRjaGluZ19jYXRjaF8yKCl7dmFyIHRocm93bj1leGNlcHRpb25MYXN0O2lmKCF0aHJvd24pe3NldFRlbXBSZXQwKDApO3JldHVybiAwfXZhciBpbmZvPW5ldyBFeGNlcHRpb25JbmZvKHRocm93bik7aW5mby5zZXRfYWRqdXN0ZWRfcHRyKHRocm93bik7dmFyIHRocm93blR5cGU9aW5mby5nZXRfdHlwZSgpO2lmKCF0aHJvd25UeXBlKXtzZXRUZW1wUmV0MCgwKTtyZXR1cm4gdGhyb3dufXZhciB0eXBlQXJyYXk9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtmb3IodmFyIGk9MDtpPHR5cGVBcnJheS5sZW5ndGg7aSsrKXt2YXIgY2F1Z2h0VHlwZT10eXBlQXJyYXlbaV07aWYoY2F1Z2h0VHlwZT09PTB8fGNhdWdodFR5cGU9PT10aHJvd25UeXBlKXticmVha312YXIgYWRqdXN0ZWRfcHRyX2FkZHI9aW5mby5wdHIrMTY7aWYoX19fY3hhX2Nhbl9jYXRjaChjYXVnaHRUeXBlLHRocm93blR5cGUsYWRqdXN0ZWRfcHRyX2FkZHIpKXtzZXRUZW1wUmV0MChjYXVnaHRUeXBlKTtyZXR1cm4gdGhyb3dufX1zZXRUZW1wUmV0MCh0aHJvd25UeXBlKTtyZXR1cm4gdGhyb3dufWZ1bmN0aW9uIF9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzMoKXt2YXIgdGhyb3duPWV4Y2VwdGlvbkxhc3Q7aWYoIXRocm93bil7c2V0VGVtcFJldDAoMCk7cmV0dXJuIDB9dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8odGhyb3duKTtpbmZvLnNldF9hZGp1c3RlZF9wdHIodGhyb3duKTt2YXIgdGhyb3duVHlwZT1pbmZvLmdldF90eXBlKCk7aWYoIXRocm93blR5cGUpe3NldFRlbXBSZXQwKDApO3JldHVybiB0aHJvd259dmFyIHR5cGVBcnJheT1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO2Zvcih2YXIgaT0wO2k8dHlwZUFycmF5Lmxlbmd0aDtpKyspe3ZhciBjYXVnaHRUeXBlPXR5cGVBcnJheVtpXTtpZihjYXVnaHRUeXBlPT09MHx8Y2F1Z2h0VHlwZT09PXRocm93blR5cGUpe2JyZWFrfXZhciBhZGp1c3RlZF9wdHJfYWRkcj1pbmZvLnB0cisxNjtpZihfX19jeGFfY2FuX2NhdGNoKGNhdWdodFR5cGUsdGhyb3duVHlwZSxhZGp1c3RlZF9wdHJfYWRkcikpe3NldFRlbXBSZXQwKGNhdWdodFR5cGUpO3JldHVybiB0aHJvd259fXNldFRlbXBSZXQwKHRocm93blR5cGUpO3JldHVybiB0aHJvd259ZnVuY3Rpb24gX19fY3hhX2luY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQocHRyKXtpZighcHRyKXJldHVybjtleGNlcHRpb25fYWRkUmVmKG5ldyBFeGNlcHRpb25JbmZvKHB0cikpfWZ1bmN0aW9uIF9fX2N4YV9yZXRocm93KCl7dmFyIGluZm89ZXhjZXB0aW9uQ2F1Z2h0LnBvcCgpO2lmKCFpbmZvKXthYm9ydCgibm8gZXhjZXB0aW9uIHRvIHRocm93Iil9dmFyIHB0cj1pbmZvLmV4Y1B0cjtpZighaW5mby5nZXRfcmV0aHJvd24oKSl7ZXhjZXB0aW9uQ2F1Z2h0LnB1c2goaW5mbyk7aW5mby5zZXRfcmV0aHJvd24odHJ1ZSk7aW5mby5zZXRfY2F1Z2h0KGZhbHNlKTt1bmNhdWdodEV4Y2VwdGlvbkNvdW50Kyt9ZXhjZXB0aW9uTGFzdD1wdHI7dGhyb3cgcHRyfWZ1bmN0aW9uIF9fX2N4YV9yZXRocm93X3ByaW1hcnlfZXhjZXB0aW9uKHB0cil7aWYoIXB0cilyZXR1cm47dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8ocHRyKTtleGNlcHRpb25DYXVnaHQucHVzaChpbmZvKTtpbmZvLnNldF9yZXRocm93bih0cnVlKTtfX19jeGFfcmV0aHJvdygpfWZ1bmN0aW9uIF9fX2N4YV90aHJvdyhwdHIsdHlwZSxkZXN0cnVjdG9yKXt2YXIgaW5mbz1uZXcgRXhjZXB0aW9uSW5mbyhwdHIpO2luZm8uaW5pdCh0eXBlLGRlc3RydWN0b3IpO2V4Y2VwdGlvbkxhc3Q9cHRyO3VuY2F1Z2h0RXhjZXB0aW9uQ291bnQrKzt0aHJvdyBwdHJ9ZnVuY3Rpb24gX19fY3hhX3VuY2F1Z2h0X2V4Y2VwdGlvbnMoKXtyZXR1cm4gdW5jYXVnaHRFeGNlcHRpb25Db3VudH1mdW5jdGlvbiBfX19lbXNjcmlwdGVuX2luaXRfbWFpbl90aHJlYWRfanModGIpe19fZW1zY3JpcHRlbl90aHJlYWRfaW5pdCh0YiwhRU5WSVJPTk1FTlRfSVNfV09SS0VSLDEsIUVOVklST05NRU5UX0lTX1dFQik7UFRocmVhZC50aHJlYWRJbml0KCl9ZnVuY3Rpb24gX19fZW1zY3JpcHRlbl90aHJlYWRfY2xlYW51cCh0aHJlYWQpe2lmKCFFTlZJUk9OTUVOVF9JU19QVEhSRUFEKWNsZWFudXBUaHJlYWQodGhyZWFkKTtlbHNlIHBvc3RNZXNzYWdlKHsiY21kIjoiY2xlYW51cFRocmVhZCIsInRocmVhZCI6dGhyZWFkfSl9ZnVuY3Rpb24gcHRocmVhZENyZWF0ZVByb3hpZWQocHRocmVhZF9wdHIsYXR0cixzdGFydF9yb3V0aW5lLGFyZyl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMiwxLHB0aHJlYWRfcHRyLGF0dHIsc3RhcnRfcm91dGluZSxhcmcpO3JldHVybiBfX19wdGhyZWFkX2NyZWF0ZV9qcyhwdGhyZWFkX3B0cixhdHRyLHN0YXJ0X3JvdXRpbmUsYXJnKX1mdW5jdGlvbiBfX19wdGhyZWFkX2NyZWF0ZV9qcyhwdGhyZWFkX3B0cixhdHRyLHN0YXJ0X3JvdXRpbmUsYXJnKXtpZih0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXI9PSJ1bmRlZmluZWQiKXtlcnIoIkN1cnJlbnQgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCBTaGFyZWRBcnJheUJ1ZmZlciwgcHRocmVhZHMgYXJlIG5vdCBhdmFpbGFibGUhIik7cmV0dXJuIDZ9dmFyIHRyYW5zZmVyTGlzdD1bXTt2YXIgZXJyb3I9MDtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEJiYodHJhbnNmZXJMaXN0Lmxlbmd0aD09PTB8fGVycm9yKSl7cmV0dXJuIHB0aHJlYWRDcmVhdGVQcm94aWVkKHB0aHJlYWRfcHRyLGF0dHIsc3RhcnRfcm91dGluZSxhcmcpfWlmKGVycm9yKXJldHVybiBlcnJvcjt2YXIgdGhyZWFkUGFyYW1zPXtzdGFydFJvdXRpbmU6c3RhcnRfcm91dGluZSxwdGhyZWFkX3B0cjpwdGhyZWFkX3B0cixhcmc6YXJnLHRyYW5zZmVyTGlzdDp0cmFuc2Zlckxpc3R9O2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpe3RocmVhZFBhcmFtcy5jbWQ9InNwYXduVGhyZWFkIjtwb3N0TWVzc2FnZSh0aHJlYWRQYXJhbXMsdHJhbnNmZXJMaXN0KTtyZXR1cm4gMH1yZXR1cm4gc3Bhd25UaHJlYWQodGhyZWFkUGFyYW1zKX1mdW5jdGlvbiBzZXRFcnJObyh2YWx1ZSl7R1JPV0FCTEVfSEVBUF9JMzIoKVtfX19lcnJub19sb2NhdGlvbigpPj4yXT12YWx1ZTtyZXR1cm4gdmFsdWV9dmFyIFBBVEg9e2lzQWJzOnBhdGg9PnBhdGguY2hhckF0KDApPT09Ii8iLHNwbGl0UGF0aDpmaWxlbmFtZT0+e3ZhciBzcGxpdFBhdGhSZT0vXihcLz98KShbXHNcU10qPykoKD86XC57MSwyfXxbXlwvXSs/fCkoXC5bXi5cL10qfCkpKD86W1wvXSopJC87cmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpfSxub3JtYWxpemVBcnJheToocGFydHMsYWxsb3dBYm92ZVJvb3QpPT57dmFyIHVwPTA7Zm9yKHZhciBpPXBhcnRzLmxlbmd0aC0xO2k+PTA7aS0tKXt2YXIgbGFzdD1wYXJ0c1tpXTtpZihsYXN0PT09Ii4iKXtwYXJ0cy5zcGxpY2UoaSwxKX1lbHNlIGlmKGxhc3Q9PT0iLi4iKXtwYXJ0cy5zcGxpY2UoaSwxKTt1cCsrfWVsc2UgaWYodXApe3BhcnRzLnNwbGljZShpLDEpO3VwLS19fWlmKGFsbG93QWJvdmVSb290KXtmb3IoO3VwO3VwLS0pe3BhcnRzLnVuc2hpZnQoIi4uIil9fXJldHVybiBwYXJ0c30sbm9ybWFsaXplOnBhdGg9Pnt2YXIgaXNBYnNvbHV0ZT1QQVRILmlzQWJzKHBhdGgpLHRyYWlsaW5nU2xhc2g9cGF0aC5zdWJzdHIoLTEpPT09Ii8iO3BhdGg9UEFUSC5ub3JtYWxpemVBcnJheShwYXRoLnNwbGl0KCIvIikuZmlsdGVyKHA9PiEhcCksIWlzQWJzb2x1dGUpLmpvaW4oIi8iKTtpZighcGF0aCYmIWlzQWJzb2x1dGUpe3BhdGg9Ii4ifWlmKHBhdGgmJnRyYWlsaW5nU2xhc2gpe3BhdGgrPSIvIn1yZXR1cm4oaXNBYnNvbHV0ZT8iLyI6IiIpK3BhdGh9LGRpcm5hbWU6cGF0aD0+e3ZhciByZXN1bHQ9UEFUSC5zcGxpdFBhdGgocGF0aCkscm9vdD1yZXN1bHRbMF0sZGlyPXJlc3VsdFsxXTtpZighcm9vdCYmIWRpcil7cmV0dXJuIi4ifWlmKGRpcil7ZGlyPWRpci5zdWJzdHIoMCxkaXIubGVuZ3RoLTEpfXJldHVybiByb290K2Rpcn0sYmFzZW5hbWU6cGF0aD0+e2lmKHBhdGg9PT0iLyIpcmV0dXJuIi8iO3BhdGg9UEFUSC5ub3JtYWxpemUocGF0aCk7cGF0aD1wYXRoLnJlcGxhY2UoL1wvJC8sIiIpO3ZhciBsYXN0U2xhc2g9cGF0aC5sYXN0SW5kZXhPZigiLyIpO2lmKGxhc3RTbGFzaD09PS0xKXJldHVybiBwYXRoO3JldHVybiBwYXRoLnN1YnN0cihsYXN0U2xhc2grMSl9LGpvaW46ZnVuY3Rpb24oKXt2YXIgcGF0aHM9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDApO3JldHVybiBQQVRILm5vcm1hbGl6ZShwYXRocy5qb2luKCIvIikpfSxqb2luMjoobCxyKT0+e3JldHVybiBQQVRILm5vcm1hbGl6ZShsKyIvIityKX19O2Z1bmN0aW9uIGdldFJhbmRvbURldmljZSgpe2lmKHR5cGVvZiBjcnlwdG89PSJvYmplY3QiJiZ0eXBlb2YgY3J5cHRvWyJnZXRSYW5kb21WYWx1ZXMiXT09ImZ1bmN0aW9uIil7dmFyIHJhbmRvbUJ1ZmZlcj1uZXcgVWludDhBcnJheSgxKTtyZXR1cm4gZnVuY3Rpb24oKXtjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHJhbmRvbUJ1ZmZlcik7cmV0dXJuIHJhbmRvbUJ1ZmZlclswXX19ZWxzZSByZXR1cm4gZnVuY3Rpb24oKXthYm9ydCgicmFuZG9tRGV2aWNlIil9fXZhciBQQVRIX0ZTPXtyZXNvbHZlOmZ1bmN0aW9uKCl7dmFyIHJlc29sdmVkUGF0aD0iIixyZXNvbHZlZEFic29sdXRlPWZhbHNlO2Zvcih2YXIgaT1hcmd1bWVudHMubGVuZ3RoLTE7aT49LTEmJiFyZXNvbHZlZEFic29sdXRlO2ktLSl7dmFyIHBhdGg9aT49MD9hcmd1bWVudHNbaV06RlMuY3dkKCk7aWYodHlwZW9mIHBhdGghPSJzdHJpbmciKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncyIpfWVsc2UgaWYoIXBhdGgpe3JldHVybiIifXJlc29sdmVkUGF0aD1wYXRoKyIvIityZXNvbHZlZFBhdGg7cmVzb2x2ZWRBYnNvbHV0ZT1QQVRILmlzQWJzKHBhdGgpfXJlc29sdmVkUGF0aD1QQVRILm5vcm1hbGl6ZUFycmF5KHJlc29sdmVkUGF0aC5zcGxpdCgiLyIpLmZpbHRlcihwPT4hIXApLCFyZXNvbHZlZEFic29sdXRlKS5qb2luKCIvIik7cmV0dXJuKHJlc29sdmVkQWJzb2x1dGU/Ii8iOiIiKStyZXNvbHZlZFBhdGh8fCIuIn0scmVsYXRpdmU6KGZyb20sdG8pPT57ZnJvbT1QQVRIX0ZTLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO3RvPVBBVEhfRlMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO2Z1bmN0aW9uIHRyaW0oYXJyKXt2YXIgc3RhcnQ9MDtmb3IoO3N0YXJ0PGFyci5sZW5ndGg7c3RhcnQrKyl7aWYoYXJyW3N0YXJ0XSE9PSIiKWJyZWFrfXZhciBlbmQ9YXJyLmxlbmd0aC0xO2Zvcig7ZW5kPj0wO2VuZC0tKXtpZihhcnJbZW5kXSE9PSIiKWJyZWFrfWlmKHN0YXJ0PmVuZClyZXR1cm5bXTtyZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LGVuZC1zdGFydCsxKX12YXIgZnJvbVBhcnRzPXRyaW0oZnJvbS5zcGxpdCgiLyIpKTt2YXIgdG9QYXJ0cz10cmltKHRvLnNwbGl0KCIvIikpO3ZhciBsZW5ndGg9TWF0aC5taW4oZnJvbVBhcnRzLmxlbmd0aCx0b1BhcnRzLmxlbmd0aCk7dmFyIHNhbWVQYXJ0c0xlbmd0aD1sZW5ndGg7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXtpZihmcm9tUGFydHNbaV0hPT10b1BhcnRzW2ldKXtzYW1lUGFydHNMZW5ndGg9aTticmVha319dmFyIG91dHB1dFBhcnRzPVtdO2Zvcih2YXIgaT1zYW1lUGFydHNMZW5ndGg7aTxmcm9tUGFydHMubGVuZ3RoO2krKyl7b3V0cHV0UGFydHMucHVzaCgiLi4iKX1vdXRwdXRQYXJ0cz1vdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtyZXR1cm4gb3V0cHV0UGFydHMuam9pbigiLyIpfX07dmFyIFRUWT17dHR5czpbXSxpbml0OmZ1bmN0aW9uKCl7fSxzaHV0ZG93bjpmdW5jdGlvbigpe30scmVnaXN0ZXI6ZnVuY3Rpb24oZGV2LG9wcyl7VFRZLnR0eXNbZGV2XT17aW5wdXQ6W10sb3V0cHV0OltdLG9wczpvcHN9O0ZTLnJlZ2lzdGVyRGV2aWNlKGRldixUVFkuc3RyZWFtX29wcyl9LHN0cmVhbV9vcHM6e29wZW46ZnVuY3Rpb24oc3RyZWFtKXt2YXIgdHR5PVRUWS50dHlzW3N0cmVhbS5ub2RlLnJkZXZdO2lmKCF0dHkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQzKX1zdHJlYW0udHR5PXR0eTtzdHJlYW0uc2Vla2FibGU9ZmFsc2V9LGNsb3NlOmZ1bmN0aW9uKHN0cmVhbSl7c3RyZWFtLnR0eS5vcHMuZmx1c2goc3RyZWFtLnR0eSl9LGZsdXNoOmZ1bmN0aW9uKHN0cmVhbSl7c3RyZWFtLnR0eS5vcHMuZmx1c2goc3RyZWFtLnR0eSl9LHJlYWQ6ZnVuY3Rpb24oc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyl7aWYoIXN0cmVhbS50dHl8fCFzdHJlYW0udHR5Lm9wcy5nZXRfY2hhcil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjApfXZhciBieXRlc1JlYWQ9MDtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe3ZhciByZXN1bHQ7dHJ5e3Jlc3VsdD1zdHJlYW0udHR5Lm9wcy5nZXRfY2hhcihzdHJlYW0udHR5KX1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9aWYocmVzdWx0PT09dW5kZWZpbmVkJiZieXRlc1JlYWQ9PT0wKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2KX1pZihyZXN1bHQ9PT1udWxsfHxyZXN1bHQ9PT11bmRlZmluZWQpYnJlYWs7Ynl0ZXNSZWFkKys7YnVmZmVyW29mZnNldCtpXT1yZXN1bHR9aWYoYnl0ZXNSZWFkKXtzdHJlYW0ubm9kZS50aW1lc3RhbXA9RGF0ZS5ub3coKX1yZXR1cm4gYnl0ZXNSZWFkfSx3cml0ZTpmdW5jdGlvbihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zKXtpZighc3RyZWFtLnR0eXx8IXN0cmVhbS50dHkub3BzLnB1dF9jaGFyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2MCl9dHJ5e2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7c3RyZWFtLnR0eS5vcHMucHV0X2NoYXIoc3RyZWFtLnR0eSxidWZmZXJbb2Zmc2V0K2ldKX19Y2F0Y2goZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjkpfWlmKGxlbmd0aCl7c3RyZWFtLm5vZGUudGltZXN0YW1wPURhdGUubm93KCl9cmV0dXJuIGl9fSxkZWZhdWx0X3R0eV9vcHM6e2dldF9jaGFyOmZ1bmN0aW9uKHR0eSl7aWYoIXR0eS5pbnB1dC5sZW5ndGgpe3ZhciByZXN1bHQ9bnVsbDtpZih0eXBlb2Ygd2luZG93IT0idW5kZWZpbmVkIiYmdHlwZW9mIHdpbmRvdy5wcm9tcHQ9PSJmdW5jdGlvbiIpe3Jlc3VsdD13aW5kb3cucHJvbXB0KCJJbnB1dDogIik7aWYocmVzdWx0IT09bnVsbCl7cmVzdWx0Kz0iXG4ifX1lbHNlIGlmKHR5cGVvZiByZWFkbGluZT09ImZ1bmN0aW9uIil7cmVzdWx0PXJlYWRsaW5lKCk7aWYocmVzdWx0IT09bnVsbCl7cmVzdWx0Kz0iXG4ifX1pZighcmVzdWx0KXtyZXR1cm4gbnVsbH10dHkuaW5wdXQ9aW50QXJyYXlGcm9tU3RyaW5nKHJlc3VsdCx0cnVlKX1yZXR1cm4gdHR5LmlucHV0LnNoaWZ0KCl9LHB1dF9jaGFyOmZ1bmN0aW9uKHR0eSx2YWwpe2lmKHZhbD09PW51bGx8fHZhbD09PTEwKXtvdXQoVVRGOEFycmF5VG9TdHJpbmcodHR5Lm91dHB1dCwwKSk7dHR5Lm91dHB1dD1bXX1lbHNle2lmKHZhbCE9MCl0dHkub3V0cHV0LnB1c2godmFsKX19LGZsdXNoOmZ1bmN0aW9uKHR0eSl7aWYodHR5Lm91dHB1dCYmdHR5Lm91dHB1dC5sZW5ndGg+MCl7b3V0KFVURjhBcnJheVRvU3RyaW5nKHR0eS5vdXRwdXQsMCkpO3R0eS5vdXRwdXQ9W119fX0sZGVmYXVsdF90dHkxX29wczp7cHV0X2NoYXI6ZnVuY3Rpb24odHR5LHZhbCl7aWYodmFsPT09bnVsbHx8dmFsPT09MTApe2VycihVVEY4QXJyYXlUb1N0cmluZyh0dHkub3V0cHV0LDApKTt0dHkub3V0cHV0PVtdfWVsc2V7aWYodmFsIT0wKXR0eS5vdXRwdXQucHVzaCh2YWwpfX0sZmx1c2g6ZnVuY3Rpb24odHR5KXtpZih0dHkub3V0cHV0JiZ0dHkub3V0cHV0Lmxlbmd0aD4wKXtlcnIoVVRGOEFycmF5VG9TdHJpbmcodHR5Lm91dHB1dCwwKSk7dHR5Lm91dHB1dD1bXX19fX07ZnVuY3Rpb24gYWxpZ25NZW1vcnkoc2l6ZSxhbGlnbm1lbnQpe3JldHVybiBNYXRoLmNlaWwoc2l6ZS9hbGlnbm1lbnQpKmFsaWdubWVudH1mdW5jdGlvbiBtbWFwQWxsb2Moc2l6ZSl7c2l6ZT1hbGlnbk1lbW9yeShzaXplLDY1NTM2KTt2YXIgcHRyPV9lbXNjcmlwdGVuX2J1aWx0aW5fbWVtYWxpZ24oNjU1MzYsc2l6ZSk7aWYoIXB0cilyZXR1cm4gMDt6ZXJvTWVtb3J5KHB0cixzaXplKTtyZXR1cm4gcHRyfXZhciBNRU1GUz17b3BzX3RhYmxlOm51bGwsbW91bnQ6ZnVuY3Rpb24obW91bnQpe3JldHVybiBNRU1GUy5jcmVhdGVOb2RlKG51bGwsIi8iLDE2Mzg0fDUxMSwwKX0sY3JlYXRlTm9kZTpmdW5jdGlvbihwYXJlbnQsbmFtZSxtb2RlLGRldil7aWYoRlMuaXNCbGtkZXYobW9kZSl8fEZTLmlzRklGTyhtb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKCFNRU1GUy5vcHNfdGFibGUpe01FTUZTLm9wc190YWJsZT17ZGlyOntub2RlOntnZXRhdHRyOk1FTUZTLm5vZGVfb3BzLmdldGF0dHIsc2V0YXR0cjpNRU1GUy5ub2RlX29wcy5zZXRhdHRyLGxvb2t1cDpNRU1GUy5ub2RlX29wcy5sb29rdXAsbWtub2Q6TUVNRlMubm9kZV9vcHMubWtub2QscmVuYW1lOk1FTUZTLm5vZGVfb3BzLnJlbmFtZSx1bmxpbms6TUVNRlMubm9kZV9vcHMudW5saW5rLHJtZGlyOk1FTUZTLm5vZGVfb3BzLnJtZGlyLHJlYWRkaXI6TUVNRlMubm9kZV9vcHMucmVhZGRpcixzeW1saW5rOk1FTUZTLm5vZGVfb3BzLnN5bWxpbmt9LHN0cmVhbTp7bGxzZWVrOk1FTUZTLnN0cmVhbV9vcHMubGxzZWVrfX0sZmlsZTp7bm9kZTp7Z2V0YXR0cjpNRU1GUy5ub2RlX29wcy5nZXRhdHRyLHNldGF0dHI6TUVNRlMubm9kZV9vcHMuc2V0YXR0cn0sc3RyZWFtOntsbHNlZWs6TUVNRlMuc3RyZWFtX29wcy5sbHNlZWsscmVhZDpNRU1GUy5zdHJlYW1fb3BzLnJlYWQsd3JpdGU6TUVNRlMuc3RyZWFtX29wcy53cml0ZSxhbGxvY2F0ZTpNRU1GUy5zdHJlYW1fb3BzLmFsbG9jYXRlLG1tYXA6TUVNRlMuc3RyZWFtX29wcy5tbWFwLG1zeW5jOk1FTUZTLnN0cmVhbV9vcHMubXN5bmN9fSxsaW5rOntub2RlOntnZXRhdHRyOk1FTUZTLm5vZGVfb3BzLmdldGF0dHIsc2V0YXR0cjpNRU1GUy5ub2RlX29wcy5zZXRhdHRyLHJlYWRsaW5rOk1FTUZTLm5vZGVfb3BzLnJlYWRsaW5rfSxzdHJlYW06e319LGNocmRldjp7bm9kZTp7Z2V0YXR0cjpNRU1GUy5ub2RlX29wcy5nZXRhdHRyLHNldGF0dHI6TUVNRlMubm9kZV9vcHMuc2V0YXR0cn0sc3RyZWFtOkZTLmNocmRldl9zdHJlYW1fb3BzfX19dmFyIG5vZGU9RlMuY3JlYXRlTm9kZShwYXJlbnQsbmFtZSxtb2RlLGRldik7aWYoRlMuaXNEaXIobm9kZS5tb2RlKSl7bm9kZS5ub2RlX29wcz1NRU1GUy5vcHNfdGFibGUuZGlyLm5vZGU7bm9kZS5zdHJlYW1fb3BzPU1FTUZTLm9wc190YWJsZS5kaXIuc3RyZWFtO25vZGUuY29udGVudHM9e319ZWxzZSBpZihGUy5pc0ZpbGUobm9kZS5tb2RlKSl7bm9kZS5ub2RlX29wcz1NRU1GUy5vcHNfdGFibGUuZmlsZS5ub2RlO25vZGUuc3RyZWFtX29wcz1NRU1GUy5vcHNfdGFibGUuZmlsZS5zdHJlYW07bm9kZS51c2VkQnl0ZXM9MDtub2RlLmNvbnRlbnRzPW51bGx9ZWxzZSBpZihGUy5pc0xpbmsobm9kZS5tb2RlKSl7bm9kZS5ub2RlX29wcz1NRU1GUy5vcHNfdGFibGUubGluay5ub2RlO25vZGUuc3RyZWFtX29wcz1NRU1GUy5vcHNfdGFibGUubGluay5zdHJlYW19ZWxzZSBpZihGUy5pc0NocmRldihub2RlLm1vZGUpKXtub2RlLm5vZGVfb3BzPU1FTUZTLm9wc190YWJsZS5jaHJkZXYubm9kZTtub2RlLnN0cmVhbV9vcHM9TUVNRlMub3BzX3RhYmxlLmNocmRldi5zdHJlYW19bm9kZS50aW1lc3RhbXA9RGF0ZS5ub3coKTtpZihwYXJlbnQpe3BhcmVudC5jb250ZW50c1tuYW1lXT1ub2RlO3BhcmVudC50aW1lc3RhbXA9bm9kZS50aW1lc3RhbXB9cmV0dXJuIG5vZGV9LGdldEZpbGVEYXRhQXNUeXBlZEFycmF5OmZ1bmN0aW9uKG5vZGUpe2lmKCFub2RlLmNvbnRlbnRzKXJldHVybiBuZXcgVWludDhBcnJheSgwKTtpZihub2RlLmNvbnRlbnRzLnN1YmFycmF5KXJldHVybiBub2RlLmNvbnRlbnRzLnN1YmFycmF5KDAsbm9kZS51c2VkQnl0ZXMpO3JldHVybiBuZXcgVWludDhBcnJheShub2RlLmNvbnRlbnRzKX0sZXhwYW5kRmlsZVN0b3JhZ2U6ZnVuY3Rpb24obm9kZSxuZXdDYXBhY2l0eSl7dmFyIHByZXZDYXBhY2l0eT1ub2RlLmNvbnRlbnRzP25vZGUuY29udGVudHMubGVuZ3RoOjA7aWYocHJldkNhcGFjaXR5Pj1uZXdDYXBhY2l0eSlyZXR1cm47dmFyIENBUEFDSVRZX0RPVUJMSU5HX01BWD0xMDI0KjEwMjQ7bmV3Q2FwYWNpdHk9TWF0aC5tYXgobmV3Q2FwYWNpdHkscHJldkNhcGFjaXR5KihwcmV2Q2FwYWNpdHk8Q0FQQUNJVFlfRE9VQkxJTkdfTUFYPzI6MS4xMjUpPj4+MCk7aWYocHJldkNhcGFjaXR5IT0wKW5ld0NhcGFjaXR5PU1hdGgubWF4KG5ld0NhcGFjaXR5LDI1Nik7dmFyIG9sZENvbnRlbnRzPW5vZGUuY29udGVudHM7bm9kZS5jb250ZW50cz1uZXcgVWludDhBcnJheShuZXdDYXBhY2l0eSk7aWYobm9kZS51c2VkQnl0ZXM+MClub2RlLmNvbnRlbnRzLnNldChvbGRDb250ZW50cy5zdWJhcnJheSgwLG5vZGUudXNlZEJ5dGVzKSwwKX0scmVzaXplRmlsZVN0b3JhZ2U6ZnVuY3Rpb24obm9kZSxuZXdTaXplKXtpZihub2RlLnVzZWRCeXRlcz09bmV3U2l6ZSlyZXR1cm47aWYobmV3U2l6ZT09MCl7bm9kZS5jb250ZW50cz1udWxsO25vZGUudXNlZEJ5dGVzPTB9ZWxzZXt2YXIgb2xkQ29udGVudHM9bm9kZS5jb250ZW50cztub2RlLmNvbnRlbnRzPW5ldyBVaW50OEFycmF5KG5ld1NpemUpO2lmKG9sZENvbnRlbnRzKXtub2RlLmNvbnRlbnRzLnNldChvbGRDb250ZW50cy5zdWJhcnJheSgwLE1hdGgubWluKG5ld1NpemUsbm9kZS51c2VkQnl0ZXMpKSl9bm9kZS51c2VkQnl0ZXM9bmV3U2l6ZX19LG5vZGVfb3BzOntnZXRhdHRyOmZ1bmN0aW9uKG5vZGUpe3ZhciBhdHRyPXt9O2F0dHIuZGV2PUZTLmlzQ2hyZGV2KG5vZGUubW9kZSk/bm9kZS5pZDoxO2F0dHIuaW5vPW5vZGUuaWQ7YXR0ci5tb2RlPW5vZGUubW9kZTthdHRyLm5saW5rPTE7YXR0ci51aWQ9MDthdHRyLmdpZD0wO2F0dHIucmRldj1ub2RlLnJkZXY7aWYoRlMuaXNEaXIobm9kZS5tb2RlKSl7YXR0ci5zaXplPTQwOTZ9ZWxzZSBpZihGUy5pc0ZpbGUobm9kZS5tb2RlKSl7YXR0ci5zaXplPW5vZGUudXNlZEJ5dGVzfWVsc2UgaWYoRlMuaXNMaW5rKG5vZGUubW9kZSkpe2F0dHIuc2l6ZT1ub2RlLmxpbmsubGVuZ3RofWVsc2V7YXR0ci5zaXplPTB9YXR0ci5hdGltZT1uZXcgRGF0ZShub2RlLnRpbWVzdGFtcCk7YXR0ci5tdGltZT1uZXcgRGF0ZShub2RlLnRpbWVzdGFtcCk7YXR0ci5jdGltZT1uZXcgRGF0ZShub2RlLnRpbWVzdGFtcCk7YXR0ci5ibGtzaXplPTQwOTY7YXR0ci5ibG9ja3M9TWF0aC5jZWlsKGF0dHIuc2l6ZS9hdHRyLmJsa3NpemUpO3JldHVybiBhdHRyfSxzZXRhdHRyOmZ1bmN0aW9uKG5vZGUsYXR0cil7aWYoYXR0ci5tb2RlIT09dW5kZWZpbmVkKXtub2RlLm1vZGU9YXR0ci5tb2RlfWlmKGF0dHIudGltZXN0YW1wIT09dW5kZWZpbmVkKXtub2RlLnRpbWVzdGFtcD1hdHRyLnRpbWVzdGFtcH1pZihhdHRyLnNpemUhPT11bmRlZmluZWQpe01FTUZTLnJlc2l6ZUZpbGVTdG9yYWdlKG5vZGUsYXR0ci5zaXplKX19LGxvb2t1cDpmdW5jdGlvbihwYXJlbnQsbmFtZSl7dGhyb3cgRlMuZ2VuZXJpY0Vycm9yc1s0NF19LG1rbm9kOmZ1bmN0aW9uKHBhcmVudCxuYW1lLG1vZGUsZGV2KXtyZXR1cm4gTUVNRlMuY3JlYXRlTm9kZShwYXJlbnQsbmFtZSxtb2RlLGRldil9LHJlbmFtZTpmdW5jdGlvbihvbGRfbm9kZSxuZXdfZGlyLG5ld19uYW1lKXtpZihGUy5pc0RpcihvbGRfbm9kZS5tb2RlKSl7dmFyIG5ld19ub2RlO3RyeXtuZXdfbm9kZT1GUy5sb29rdXBOb2RlKG5ld19kaXIsbmV3X25hbWUpfWNhdGNoKGUpe31pZihuZXdfbm9kZSl7Zm9yKHZhciBpIGluIG5ld19ub2RlLmNvbnRlbnRzKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NSl9fX1kZWxldGUgb2xkX25vZGUucGFyZW50LmNvbnRlbnRzW29sZF9ub2RlLm5hbWVdO29sZF9ub2RlLnBhcmVudC50aW1lc3RhbXA9RGF0ZS5ub3coKTtvbGRfbm9kZS5uYW1lPW5ld19uYW1lO25ld19kaXIuY29udGVudHNbbmV3X25hbWVdPW9sZF9ub2RlO25ld19kaXIudGltZXN0YW1wPW9sZF9ub2RlLnBhcmVudC50aW1lc3RhbXA7b2xkX25vZGUucGFyZW50PW5ld19kaXJ9LHVubGluazpmdW5jdGlvbihwYXJlbnQsbmFtZSl7ZGVsZXRlIHBhcmVudC5jb250ZW50c1tuYW1lXTtwYXJlbnQudGltZXN0YW1wPURhdGUubm93KCl9LHJtZGlyOmZ1bmN0aW9uKHBhcmVudCxuYW1lKXt2YXIgbm9kZT1GUy5sb29rdXBOb2RlKHBhcmVudCxuYW1lKTtmb3IodmFyIGkgaW4gbm9kZS5jb250ZW50cyl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTUpfWRlbGV0ZSBwYXJlbnQuY29udGVudHNbbmFtZV07cGFyZW50LnRpbWVzdGFtcD1EYXRlLm5vdygpfSxyZWFkZGlyOmZ1bmN0aW9uKG5vZGUpe3ZhciBlbnRyaWVzPVsiLiIsIi4uIl07Zm9yKHZhciBrZXkgaW4gbm9kZS5jb250ZW50cyl7aWYoIW5vZGUuY29udGVudHMuaGFzT3duUHJvcGVydHkoa2V5KSl7Y29udGludWV9ZW50cmllcy5wdXNoKGtleSl9cmV0dXJuIGVudHJpZXN9LHN5bWxpbms6ZnVuY3Rpb24ocGFyZW50LG5ld25hbWUsb2xkcGF0aCl7dmFyIG5vZGU9TUVNRlMuY3JlYXRlTm9kZShwYXJlbnQsbmV3bmFtZSw1MTF8NDA5NjAsMCk7bm9kZS5saW5rPW9sZHBhdGg7cmV0dXJuIG5vZGV9LHJlYWRsaW5rOmZ1bmN0aW9uKG5vZGUpe2lmKCFGUy5pc0xpbmsobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXJldHVybiBub2RlLmxpbmt9fSxzdHJlYW1fb3BzOntyZWFkOmZ1bmN0aW9uKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbil7dmFyIGNvbnRlbnRzPXN0cmVhbS5ub2RlLmNvbnRlbnRzO2lmKHBvc2l0aW9uPj1zdHJlYW0ubm9kZS51c2VkQnl0ZXMpcmV0dXJuIDA7dmFyIHNpemU9TWF0aC5taW4oc3RyZWFtLm5vZGUudXNlZEJ5dGVzLXBvc2l0aW9uLGxlbmd0aCk7aWYoc2l6ZT44JiZjb250ZW50cy5zdWJhcnJheSl7YnVmZmVyLnNldChjb250ZW50cy5zdWJhcnJheShwb3NpdGlvbixwb3NpdGlvbitzaXplKSxvZmZzZXQpfWVsc2V7Zm9yKHZhciBpPTA7aTxzaXplO2krKylidWZmZXJbb2Zmc2V0K2ldPWNvbnRlbnRzW3Bvc2l0aW9uK2ldfXJldHVybiBzaXplfSx3cml0ZTpmdW5jdGlvbihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24sY2FuT3duKXtpZihidWZmZXIuYnVmZmVyPT09R1JPV0FCTEVfSEVBUF9JOCgpLmJ1ZmZlcil7Y2FuT3duPWZhbHNlfWlmKCFsZW5ndGgpcmV0dXJuIDA7dmFyIG5vZGU9c3RyZWFtLm5vZGU7bm9kZS50aW1lc3RhbXA9RGF0ZS5ub3coKTtpZihidWZmZXIuc3ViYXJyYXkmJighbm9kZS5jb250ZW50c3x8bm9kZS5jb250ZW50cy5zdWJhcnJheSkpe2lmKGNhbk93bil7bm9kZS5jb250ZW50cz1idWZmZXIuc3ViYXJyYXkob2Zmc2V0LG9mZnNldCtsZW5ndGgpO25vZGUudXNlZEJ5dGVzPWxlbmd0aDtyZXR1cm4gbGVuZ3RofWVsc2UgaWYobm9kZS51c2VkQnl0ZXM9PT0wJiZwb3NpdGlvbj09PTApe25vZGUuY29udGVudHM9YnVmZmVyLnNsaWNlKG9mZnNldCxvZmZzZXQrbGVuZ3RoKTtub2RlLnVzZWRCeXRlcz1sZW5ndGg7cmV0dXJuIGxlbmd0aH1lbHNlIGlmKHBvc2l0aW9uK2xlbmd0aDw9bm9kZS51c2VkQnl0ZXMpe25vZGUuY29udGVudHMuc2V0KGJ1ZmZlci5zdWJhcnJheShvZmZzZXQsb2Zmc2V0K2xlbmd0aCkscG9zaXRpb24pO3JldHVybiBsZW5ndGh9fU1FTUZTLmV4cGFuZEZpbGVTdG9yYWdlKG5vZGUscG9zaXRpb24rbGVuZ3RoKTtpZihub2RlLmNvbnRlbnRzLnN1YmFycmF5JiZidWZmZXIuc3ViYXJyYXkpe25vZGUuY29udGVudHMuc2V0KGJ1ZmZlci5zdWJhcnJheShvZmZzZXQsb2Zmc2V0K2xlbmd0aCkscG9zaXRpb24pfWVsc2V7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXtub2RlLmNvbnRlbnRzW3Bvc2l0aW9uK2ldPWJ1ZmZlcltvZmZzZXQraV19fW5vZGUudXNlZEJ5dGVzPU1hdGgubWF4KG5vZGUudXNlZEJ5dGVzLHBvc2l0aW9uK2xlbmd0aCk7cmV0dXJuIGxlbmd0aH0sbGxzZWVrOmZ1bmN0aW9uKHN0cmVhbSxvZmZzZXQsd2hlbmNlKXt2YXIgcG9zaXRpb249b2Zmc2V0O2lmKHdoZW5jZT09PTEpe3Bvc2l0aW9uKz1zdHJlYW0ucG9zaXRpb259ZWxzZSBpZih3aGVuY2U9PT0yKXtpZihGUy5pc0ZpbGUoc3RyZWFtLm5vZGUubW9kZSkpe3Bvc2l0aW9uKz1zdHJlYW0ubm9kZS51c2VkQnl0ZXN9fWlmKHBvc2l0aW9uPDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1yZXR1cm4gcG9zaXRpb259LGFsbG9jYXRlOmZ1bmN0aW9uKHN0cmVhbSxvZmZzZXQsbGVuZ3RoKXtNRU1GUy5leHBhbmRGaWxlU3RvcmFnZShzdHJlYW0ubm9kZSxvZmZzZXQrbGVuZ3RoKTtzdHJlYW0ubm9kZS51c2VkQnl0ZXM9TWF0aC5tYXgoc3RyZWFtLm5vZGUudXNlZEJ5dGVzLG9mZnNldCtsZW5ndGgpfSxtbWFwOmZ1bmN0aW9uKHN0cmVhbSxhZGRyZXNzLGxlbmd0aCxwb3NpdGlvbixwcm90LGZsYWdzKXtpZihhZGRyZXNzIT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfWlmKCFGUy5pc0ZpbGUoc3RyZWFtLm5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQzKX12YXIgcHRyO3ZhciBhbGxvY2F0ZWQ7dmFyIGNvbnRlbnRzPXN0cmVhbS5ub2RlLmNvbnRlbnRzO2lmKCEoZmxhZ3MmMikmJmNvbnRlbnRzLmJ1ZmZlcj09PWJ1ZmZlcil7YWxsb2NhdGVkPWZhbHNlO3B0cj1jb250ZW50cy5ieXRlT2Zmc2V0fWVsc2V7aWYocG9zaXRpb24+MHx8cG9zaXRpb24rbGVuZ3RoPGNvbnRlbnRzLmxlbmd0aCl7aWYoY29udGVudHMuc3ViYXJyYXkpe2NvbnRlbnRzPWNvbnRlbnRzLnN1YmFycmF5KHBvc2l0aW9uLHBvc2l0aW9uK2xlbmd0aCl9ZWxzZXtjb250ZW50cz1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjb250ZW50cyxwb3NpdGlvbixwb3NpdGlvbitsZW5ndGgpfX1hbGxvY2F0ZWQ9dHJ1ZTtwdHI9bW1hcEFsbG9jKGxlbmd0aCk7aWYoIXB0cil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDgpfUdST1dBQkxFX0hFQVBfSTgoKS5zZXQoY29udGVudHMscHRyKX1yZXR1cm57cHRyOnB0cixhbGxvY2F0ZWQ6YWxsb2NhdGVkfX0sbXN5bmM6ZnVuY3Rpb24oc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLG1tYXBGbGFncyl7aWYoIUZTLmlzRmlsZShzdHJlYW0ubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfWlmKG1tYXBGbGFncyYyKXtyZXR1cm4gMH12YXIgYnl0ZXNXcml0dGVuPU1FTUZTLnN0cmVhbV9vcHMud3JpdGUoc3RyZWFtLGJ1ZmZlciwwLGxlbmd0aCxvZmZzZXQsZmFsc2UpO3JldHVybiAwfX19O2Z1bmN0aW9uIGFzeW5jTG9hZCh1cmwsb25sb2FkLG9uZXJyb3Isbm9SdW5EZXApe3ZhciBkZXA9IW5vUnVuRGVwP2dldFVuaXF1ZVJ1bkRlcGVuZGVuY3koImFsICIrdXJsKToiIjtyZWFkQXN5bmModXJsLGZ1bmN0aW9uKGFycmF5QnVmZmVyKXthc3NlcnQoYXJyYXlCdWZmZXIsJ0xvYWRpbmcgZGF0YSBmaWxlICInK3VybCsnIiBmYWlsZWQgKG5vIGFycmF5QnVmZmVyKS4nKTtvbmxvYWQobmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpKTtpZihkZXApcmVtb3ZlUnVuRGVwZW5kZW5jeShkZXApfSxmdW5jdGlvbihldmVudCl7aWYob25lcnJvcil7b25lcnJvcigpfWVsc2V7dGhyb3cnTG9hZGluZyBkYXRhIGZpbGUgIicrdXJsKyciIGZhaWxlZC4nfX0pO2lmKGRlcClhZGRSdW5EZXBlbmRlbmN5KGRlcCl9dmFyIEZTPXtyb290Om51bGwsbW91bnRzOltdLGRldmljZXM6e30sc3RyZWFtczpbXSxuZXh0SW5vZGU6MSxuYW1lVGFibGU6bnVsbCxjdXJyZW50UGF0aDoiLyIsaW5pdGlhbGl6ZWQ6ZmFsc2UsaWdub3JlUGVybWlzc2lvbnM6dHJ1ZSxFcnJub0Vycm9yOm51bGwsZ2VuZXJpY0Vycm9yczp7fSxmaWxlc3lzdGVtczpudWxsLHN5bmNGU1JlcXVlc3RzOjAsbG9va3VwUGF0aDoocGF0aCxvcHRzPXt9KT0+e3BhdGg9UEFUSF9GUy5yZXNvbHZlKEZTLmN3ZCgpLHBhdGgpO2lmKCFwYXRoKXJldHVybntwYXRoOiIiLG5vZGU6bnVsbH07dmFyIGRlZmF1bHRzPXtmb2xsb3dfbW91bnQ6dHJ1ZSxyZWN1cnNlX2NvdW50OjB9O29wdHM9T2JqZWN0LmFzc2lnbihkZWZhdWx0cyxvcHRzKTtpZihvcHRzLnJlY3Vyc2VfY291bnQ+OCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzIpfXZhciBwYXJ0cz1QQVRILm5vcm1hbGl6ZUFycmF5KHBhdGguc3BsaXQoIi8iKS5maWx0ZXIocD0+ISFwKSxmYWxzZSk7dmFyIGN1cnJlbnQ9RlMucm9vdDt2YXIgY3VycmVudF9wYXRoPSIvIjtmb3IodmFyIGk9MDtpPHBhcnRzLmxlbmd0aDtpKyspe3ZhciBpc2xhc3Q9aT09PXBhcnRzLmxlbmd0aC0xO2lmKGlzbGFzdCYmb3B0cy5wYXJlbnQpe2JyZWFrfWN1cnJlbnQ9RlMubG9va3VwTm9kZShjdXJyZW50LHBhcnRzW2ldKTtjdXJyZW50X3BhdGg9UEFUSC5qb2luMihjdXJyZW50X3BhdGgscGFydHNbaV0pO2lmKEZTLmlzTW91bnRwb2ludChjdXJyZW50KSl7aWYoIWlzbGFzdHx8aXNsYXN0JiZvcHRzLmZvbGxvd19tb3VudCl7Y3VycmVudD1jdXJyZW50Lm1vdW50ZWQucm9vdH19aWYoIWlzbGFzdHx8b3B0cy5mb2xsb3cpe3ZhciBjb3VudD0wO3doaWxlKEZTLmlzTGluayhjdXJyZW50Lm1vZGUpKXt2YXIgbGluaz1GUy5yZWFkbGluayhjdXJyZW50X3BhdGgpO2N1cnJlbnRfcGF0aD1QQVRIX0ZTLnJlc29sdmUoUEFUSC5kaXJuYW1lKGN1cnJlbnRfcGF0aCksbGluayk7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKGN1cnJlbnRfcGF0aCx7cmVjdXJzZV9jb3VudDpvcHRzLnJlY3Vyc2VfY291bnQrMX0pO2N1cnJlbnQ9bG9va3VwLm5vZGU7aWYoY291bnQrKz40MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzIpfX19fXJldHVybntwYXRoOmN1cnJlbnRfcGF0aCxub2RlOmN1cnJlbnR9fSxnZXRQYXRoOm5vZGU9Pnt2YXIgcGF0aDt3aGlsZSh0cnVlKXtpZihGUy5pc1Jvb3Qobm9kZSkpe3ZhciBtb3VudD1ub2RlLm1vdW50Lm1vdW50cG9pbnQ7aWYoIXBhdGgpcmV0dXJuIG1vdW50O3JldHVybiBtb3VudFttb3VudC5sZW5ndGgtMV0hPT0iLyI/bW91bnQrIi8iK3BhdGg6bW91bnQrcGF0aH1wYXRoPXBhdGg/bm9kZS5uYW1lKyIvIitwYXRoOm5vZGUubmFtZTtub2RlPW5vZGUucGFyZW50fX0saGFzaE5hbWU6KHBhcmVudGlkLG5hbWUpPT57dmFyIGhhc2g9MDtmb3IodmFyIGk9MDtpPG5hbWUubGVuZ3RoO2krKyl7aGFzaD0oaGFzaDw8NSktaGFzaCtuYW1lLmNoYXJDb2RlQXQoaSl8MH1yZXR1cm4ocGFyZW50aWQraGFzaD4+PjApJUZTLm5hbWVUYWJsZS5sZW5ndGh9LGhhc2hBZGROb2RlOm5vZGU9Pnt2YXIgaGFzaD1GUy5oYXNoTmFtZShub2RlLnBhcmVudC5pZCxub2RlLm5hbWUpO25vZGUubmFtZV9uZXh0PUZTLm5hbWVUYWJsZVtoYXNoXTtGUy5uYW1lVGFibGVbaGFzaF09bm9kZX0saGFzaFJlbW92ZU5vZGU6bm9kZT0+e3ZhciBoYXNoPUZTLmhhc2hOYW1lKG5vZGUucGFyZW50LmlkLG5vZGUubmFtZSk7aWYoRlMubmFtZVRhYmxlW2hhc2hdPT09bm9kZSl7RlMubmFtZVRhYmxlW2hhc2hdPW5vZGUubmFtZV9uZXh0fWVsc2V7dmFyIGN1cnJlbnQ9RlMubmFtZVRhYmxlW2hhc2hdO3doaWxlKGN1cnJlbnQpe2lmKGN1cnJlbnQubmFtZV9uZXh0PT09bm9kZSl7Y3VycmVudC5uYW1lX25leHQ9bm9kZS5uYW1lX25leHQ7YnJlYWt9Y3VycmVudD1jdXJyZW50Lm5hbWVfbmV4dH19fSxsb29rdXBOb2RlOihwYXJlbnQsbmFtZSk9Pnt2YXIgZXJyQ29kZT1GUy5tYXlMb29rdXAocGFyZW50KTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlLHBhcmVudCl9dmFyIGhhc2g9RlMuaGFzaE5hbWUocGFyZW50LmlkLG5hbWUpO2Zvcih2YXIgbm9kZT1GUy5uYW1lVGFibGVbaGFzaF07bm9kZTtub2RlPW5vZGUubmFtZV9uZXh0KXt2YXIgbm9kZU5hbWU9bm9kZS5uYW1lO2lmKG5vZGUucGFyZW50LmlkPT09cGFyZW50LmlkJiZub2RlTmFtZT09PW5hbWUpe3JldHVybiBub2RlfX1yZXR1cm4gRlMubG9va3VwKHBhcmVudCxuYW1lKX0sY3JlYXRlTm9kZToocGFyZW50LG5hbWUsbW9kZSxyZGV2KT0+e3ZhciBub2RlPW5ldyBGUy5GU05vZGUocGFyZW50LG5hbWUsbW9kZSxyZGV2KTtGUy5oYXNoQWRkTm9kZShub2RlKTtyZXR1cm4gbm9kZX0sZGVzdHJveU5vZGU6bm9kZT0+e0ZTLmhhc2hSZW1vdmVOb2RlKG5vZGUpfSxpc1Jvb3Q6bm9kZT0+e3JldHVybiBub2RlPT09bm9kZS5wYXJlbnR9LGlzTW91bnRwb2ludDpub2RlPT57cmV0dXJuISFub2RlLm1vdW50ZWR9LGlzRmlsZTptb2RlPT57cmV0dXJuKG1vZGUmNjE0NDApPT09MzI3Njh9LGlzRGlyOm1vZGU9PntyZXR1cm4obW9kZSY2MTQ0MCk9PT0xNjM4NH0saXNMaW5rOm1vZGU9PntyZXR1cm4obW9kZSY2MTQ0MCk9PT00MDk2MH0saXNDaHJkZXY6bW9kZT0+e3JldHVybihtb2RlJjYxNDQwKT09PTgxOTJ9LGlzQmxrZGV2Om1vZGU9PntyZXR1cm4obW9kZSY2MTQ0MCk9PT0yNDU3Nn0saXNGSUZPOm1vZGU9PntyZXR1cm4obW9kZSY2MTQ0MCk9PT00MDk2fSxpc1NvY2tldDptb2RlPT57cmV0dXJuKG1vZGUmNDkxNTIpPT09NDkxNTJ9LGZsYWdNb2Rlczp7InIiOjAsInIrIjoyLCJ3Ijo1NzcsIncrIjo1NzgsImEiOjEwODksImErIjoxMDkwfSxtb2RlU3RyaW5nVG9GbGFnczpzdHI9Pnt2YXIgZmxhZ3M9RlMuZmxhZ01vZGVzW3N0cl07aWYodHlwZW9mIGZsYWdzPT0idW5kZWZpbmVkIil7dGhyb3cgbmV3IEVycm9yKCJVbmtub3duIGZpbGUgb3BlbiBtb2RlOiAiK3N0cil9cmV0dXJuIGZsYWdzfSxmbGFnc1RvUGVybWlzc2lvblN0cmluZzpmbGFnPT57dmFyIHBlcm1zPVsiciIsInciLCJydyJdW2ZsYWcmM107aWYoZmxhZyY1MTIpe3Blcm1zKz0idyJ9cmV0dXJuIHBlcm1zfSxub2RlUGVybWlzc2lvbnM6KG5vZGUscGVybXMpPT57aWYoRlMuaWdub3JlUGVybWlzc2lvbnMpe3JldHVybiAwfWlmKHBlcm1zLmluY2x1ZGVzKCJyIikmJiEobm9kZS5tb2RlJjI5Mikpe3JldHVybiAyfWVsc2UgaWYocGVybXMuaW5jbHVkZXMoInciKSYmIShub2RlLm1vZGUmMTQ2KSl7cmV0dXJuIDJ9ZWxzZSBpZihwZXJtcy5pbmNsdWRlcygieCIpJiYhKG5vZGUubW9kZSY3Mykpe3JldHVybiAyfXJldHVybiAwfSxtYXlMb29rdXA6ZGlyPT57dmFyIGVyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKGRpciwieCIpO2lmKGVyckNvZGUpcmV0dXJuIGVyckNvZGU7aWYoIWRpci5ub2RlX29wcy5sb29rdXApcmV0dXJuIDI7cmV0dXJuIDB9LG1heUNyZWF0ZTooZGlyLG5hbWUpPT57dHJ5e3ZhciBub2RlPUZTLmxvb2t1cE5vZGUoZGlyLG5hbWUpO3JldHVybiAyMH1jYXRjaChlKXt9cmV0dXJuIEZTLm5vZGVQZXJtaXNzaW9ucyhkaXIsInd4Iil9LG1heURlbGV0ZTooZGlyLG5hbWUsaXNkaXIpPT57dmFyIG5vZGU7dHJ5e25vZGU9RlMubG9va3VwTm9kZShkaXIsbmFtZSl9Y2F0Y2goZSl7cmV0dXJuIGUuZXJybm99dmFyIGVyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKGRpciwid3giKTtpZihlcnJDb2RlKXtyZXR1cm4gZXJyQ29kZX1pZihpc2Rpcil7aWYoIUZTLmlzRGlyKG5vZGUubW9kZSkpe3JldHVybiA1NH1pZihGUy5pc1Jvb3Qobm9kZSl8fEZTLmdldFBhdGgobm9kZSk9PT1GUy5jd2QoKSl7cmV0dXJuIDEwfX1lbHNle2lmKEZTLmlzRGlyKG5vZGUubW9kZSkpe3JldHVybiAzMX19cmV0dXJuIDB9LG1heU9wZW46KG5vZGUsZmxhZ3MpPT57aWYoIW5vZGUpe3JldHVybiA0NH1pZihGUy5pc0xpbmsobm9kZS5tb2RlKSl7cmV0dXJuIDMyfWVsc2UgaWYoRlMuaXNEaXIobm9kZS5tb2RlKSl7aWYoRlMuZmxhZ3NUb1Blcm1pc3Npb25TdHJpbmcoZmxhZ3MpIT09InIifHxmbGFncyY1MTIpe3JldHVybiAzMX19cmV0dXJuIEZTLm5vZGVQZXJtaXNzaW9ucyhub2RlLEZTLmZsYWdzVG9QZXJtaXNzaW9uU3RyaW5nKGZsYWdzKSl9LE1BWF9PUEVOX0ZEUzo0MDk2LG5leHRmZDooZmRfc3RhcnQ9MCxmZF9lbmQ9RlMuTUFYX09QRU5fRkRTKT0+e2Zvcih2YXIgZmQ9ZmRfc3RhcnQ7ZmQ8PWZkX2VuZDtmZCsrKXtpZighRlMuc3RyZWFtc1tmZF0pe3JldHVybiBmZH19dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzMpfSxnZXRTdHJlYW06ZmQ9PkZTLnN0cmVhbXNbZmRdLGNyZWF0ZVN0cmVhbTooc3RyZWFtLGZkX3N0YXJ0LGZkX2VuZCk9PntpZighRlMuRlNTdHJlYW0pe0ZTLkZTU3RyZWFtPWZ1bmN0aW9uKCl7dGhpcy5zaGFyZWQ9e319O0ZTLkZTU3RyZWFtLnByb3RvdHlwZT17b2JqZWN0OntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ub2RlfSxzZXQ6ZnVuY3Rpb24odmFsKXt0aGlzLm5vZGU9dmFsfX0saXNSZWFkOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy5mbGFncyYyMDk3MTU1KSE9PTF9fSxpc1dyaXRlOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy5mbGFncyYyMDk3MTU1KSE9PTB9fSxpc0FwcGVuZDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZmxhZ3MmMTAyNH19LGZsYWdzOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zaGFyZWQuZmxhZ3N9LHNldDpmdW5jdGlvbih2YWwpe3RoaXMuc2hhcmVkLmZsYWdzPXZhbH19LHBvc2l0aW9uOntnZXQgZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zaGFyZWQucG9zaXRpb259LHNldDpmdW5jdGlvbih2YWwpe3RoaXMuc2hhcmVkLnBvc2l0aW9uPXZhbH19fX1zdHJlYW09T2JqZWN0LmFzc2lnbihuZXcgRlMuRlNTdHJlYW0sc3RyZWFtKTt2YXIgZmQ9RlMubmV4dGZkKGZkX3N0YXJ0LGZkX2VuZCk7c3RyZWFtLmZkPWZkO0ZTLnN0cmVhbXNbZmRdPXN0cmVhbTtyZXR1cm4gc3RyZWFtfSxjbG9zZVN0cmVhbTpmZD0+e0ZTLnN0cmVhbXNbZmRdPW51bGx9LGNocmRldl9zdHJlYW1fb3BzOntvcGVuOnN0cmVhbT0+e3ZhciBkZXZpY2U9RlMuZ2V0RGV2aWNlKHN0cmVhbS5ub2RlLnJkZXYpO3N0cmVhbS5zdHJlYW1fb3BzPWRldmljZS5zdHJlYW1fb3BzO2lmKHN0cmVhbS5zdHJlYW1fb3BzLm9wZW4pe3N0cmVhbS5zdHJlYW1fb3BzLm9wZW4oc3RyZWFtKX19LGxsc2VlazooKT0+e3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDcwKX19LG1ham9yOmRldj0+ZGV2Pj44LG1pbm9yOmRldj0+ZGV2JjI1NSxtYWtlZGV2OihtYSxtaSk9Pm1hPDw4fG1pLHJlZ2lzdGVyRGV2aWNlOihkZXYsb3BzKT0+e0ZTLmRldmljZXNbZGV2XT17c3RyZWFtX29wczpvcHN9fSxnZXREZXZpY2U6ZGV2PT5GUy5kZXZpY2VzW2Rldl0sZ2V0TW91bnRzOm1vdW50PT57dmFyIG1vdW50cz1bXTt2YXIgY2hlY2s9W21vdW50XTt3aGlsZShjaGVjay5sZW5ndGgpe3ZhciBtPWNoZWNrLnBvcCgpO21vdW50cy5wdXNoKG0pO2NoZWNrLnB1c2guYXBwbHkoY2hlY2ssbS5tb3VudHMpfXJldHVybiBtb3VudHN9LHN5bmNmczoocG9wdWxhdGUsY2FsbGJhY2spPT57aWYodHlwZW9mIHBvcHVsYXRlPT0iZnVuY3Rpb24iKXtjYWxsYmFjaz1wb3B1bGF0ZTtwb3B1bGF0ZT1mYWxzZX1GUy5zeW5jRlNSZXF1ZXN0cysrO2lmKEZTLnN5bmNGU1JlcXVlc3RzPjEpe2Vycigid2FybmluZzogIitGUy5zeW5jRlNSZXF1ZXN0cysiIEZTLnN5bmNmcyBvcGVyYXRpb25zIGluIGZsaWdodCBhdCBvbmNlLCBwcm9iYWJseSBqdXN0IGRvaW5nIGV4dHJhIHdvcmsiKX12YXIgbW91bnRzPUZTLmdldE1vdW50cyhGUy5yb290Lm1vdW50KTt2YXIgY29tcGxldGVkPTA7ZnVuY3Rpb24gZG9DYWxsYmFjayhlcnJDb2RlKXtGUy5zeW5jRlNSZXF1ZXN0cy0tO3JldHVybiBjYWxsYmFjayhlcnJDb2RlKX1mdW5jdGlvbiBkb25lKGVyckNvZGUpe2lmKGVyckNvZGUpe2lmKCFkb25lLmVycm9yZWQpe2RvbmUuZXJyb3JlZD10cnVlO3JldHVybiBkb0NhbGxiYWNrKGVyckNvZGUpfXJldHVybn1pZigrK2NvbXBsZXRlZD49bW91bnRzLmxlbmd0aCl7ZG9DYWxsYmFjayhudWxsKX19bW91bnRzLmZvckVhY2gobW91bnQ9PntpZighbW91bnQudHlwZS5zeW5jZnMpe3JldHVybiBkb25lKG51bGwpfW1vdW50LnR5cGUuc3luY2ZzKG1vdW50LHBvcHVsYXRlLGRvbmUpfSl9LG1vdW50Oih0eXBlLG9wdHMsbW91bnRwb2ludCk9Pnt2YXIgcm9vdD1tb3VudHBvaW50PT09Ii8iO3ZhciBwc2V1ZG89IW1vdW50cG9pbnQ7dmFyIG5vZGU7aWYocm9vdCYmRlMucm9vdCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTApfWVsc2UgaWYoIXJvb3QmJiFwc2V1ZG8pe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChtb3VudHBvaW50LHtmb2xsb3dfbW91bnQ6ZmFsc2V9KTttb3VudHBvaW50PWxvb2t1cC5wYXRoO25vZGU9bG9va3VwLm5vZGU7aWYoRlMuaXNNb3VudHBvaW50KG5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9aWYoIUZTLmlzRGlyKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU0KX19dmFyIG1vdW50PXt0eXBlOnR5cGUsb3B0czpvcHRzLG1vdW50cG9pbnQ6bW91bnRwb2ludCxtb3VudHM6W119O3ZhciBtb3VudFJvb3Q9dHlwZS5tb3VudChtb3VudCk7bW91bnRSb290Lm1vdW50PW1vdW50O21vdW50LnJvb3Q9bW91bnRSb290O2lmKHJvb3Qpe0ZTLnJvb3Q9bW91bnRSb290fWVsc2UgaWYobm9kZSl7bm9kZS5tb3VudGVkPW1vdW50O2lmKG5vZGUubW91bnQpe25vZGUubW91bnQubW91bnRzLnB1c2gobW91bnQpfX1yZXR1cm4gbW91bnRSb290fSx1bm1vdW50Om1vdW50cG9pbnQ9Pnt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgobW91bnRwb2ludCx7Zm9sbG93X21vdW50OmZhbHNlfSk7aWYoIUZTLmlzTW91bnRwb2ludChsb29rdXAubm9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgbm9kZT1sb29rdXAubm9kZTt2YXIgbW91bnQ9bm9kZS5tb3VudGVkO3ZhciBtb3VudHM9RlMuZ2V0TW91bnRzKG1vdW50KTtPYmplY3Qua2V5cyhGUy5uYW1lVGFibGUpLmZvckVhY2goaGFzaD0+e3ZhciBjdXJyZW50PUZTLm5hbWVUYWJsZVtoYXNoXTt3aGlsZShjdXJyZW50KXt2YXIgbmV4dD1jdXJyZW50Lm5hbWVfbmV4dDtpZihtb3VudHMuaW5jbHVkZXMoY3VycmVudC5tb3VudCkpe0ZTLmRlc3Ryb3lOb2RlKGN1cnJlbnQpfWN1cnJlbnQ9bmV4dH19KTtub2RlLm1vdW50ZWQ9bnVsbDt2YXIgaWR4PW5vZGUubW91bnQubW91bnRzLmluZGV4T2YobW91bnQpO25vZGUubW91bnQubW91bnRzLnNwbGljZShpZHgsMSl9LGxvb2t1cDoocGFyZW50LG5hbWUpPT57cmV0dXJuIHBhcmVudC5ub2RlX29wcy5sb29rdXAocGFyZW50LG5hbWUpfSxta25vZDoocGF0aCxtb2RlLGRldik9Pnt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7cGFyZW50OnRydWV9KTt2YXIgcGFyZW50PWxvb2t1cC5ub2RlO3ZhciBuYW1lPVBBVEguYmFzZW5hbWUocGF0aCk7aWYoIW5hbWV8fG5hbWU9PT0iLiJ8fG5hbWU9PT0iLi4iKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9dmFyIGVyckNvZGU9RlMubWF5Q3JlYXRlKHBhcmVudCxuYW1lKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1pZighcGFyZW50Lm5vZGVfb3BzLm1rbm9kKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9cmV0dXJuIHBhcmVudC5ub2RlX29wcy5ta25vZChwYXJlbnQsbmFtZSxtb2RlLGRldil9LGNyZWF0ZToocGF0aCxtb2RlKT0+e21vZGU9bW9kZSE9PXVuZGVmaW5lZD9tb2RlOjQzODttb2RlJj00MDk1O21vZGV8PTMyNzY4O3JldHVybiBGUy5ta25vZChwYXRoLG1vZGUsMCl9LG1rZGlyOihwYXRoLG1vZGUpPT57bW9kZT1tb2RlIT09dW5kZWZpbmVkP21vZGU6NTExO21vZGUmPTUxMXw1MTI7bW9kZXw9MTYzODQ7cmV0dXJuIEZTLm1rbm9kKHBhdGgsbW9kZSwwKX0sbWtkaXJUcmVlOihwYXRoLG1vZGUpPT57dmFyIGRpcnM9cGF0aC5zcGxpdCgiLyIpO3ZhciBkPSIiO2Zvcih2YXIgaT0wO2k8ZGlycy5sZW5ndGg7KytpKXtpZighZGlyc1tpXSljb250aW51ZTtkKz0iLyIrZGlyc1tpXTt0cnl7RlMubWtkaXIoZCxtb2RlKX1jYXRjaChlKXtpZihlLmVycm5vIT0yMCl0aHJvdyBlfX19LG1rZGV2OihwYXRoLG1vZGUsZGV2KT0+e2lmKHR5cGVvZiBkZXY9PSJ1bmRlZmluZWQiKXtkZXY9bW9kZTttb2RlPTQzOH1tb2RlfD04MTkyO3JldHVybiBGUy5ta25vZChwYXRoLG1vZGUsZGV2KX0sc3ltbGluazoob2xkcGF0aCxuZXdwYXRoKT0+e2lmKCFQQVRIX0ZTLnJlc29sdmUob2xkcGF0aCkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX12YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgobmV3cGF0aCx7cGFyZW50OnRydWV9KTt2YXIgcGFyZW50PWxvb2t1cC5ub2RlO2lmKCFwYXJlbnQpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX12YXIgbmV3bmFtZT1QQVRILmJhc2VuYW1lKG5ld3BhdGgpO3ZhciBlcnJDb2RlPUZTLm1heUNyZWF0ZShwYXJlbnQsbmV3bmFtZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIXBhcmVudC5ub2RlX29wcy5zeW1saW5rKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9cmV0dXJuIHBhcmVudC5ub2RlX29wcy5zeW1saW5rKHBhcmVudCxuZXduYW1lLG9sZHBhdGgpfSxyZW5hbWU6KG9sZF9wYXRoLG5ld19wYXRoKT0+e3ZhciBvbGRfZGlybmFtZT1QQVRILmRpcm5hbWUob2xkX3BhdGgpO3ZhciBuZXdfZGlybmFtZT1QQVRILmRpcm5hbWUobmV3X3BhdGgpO3ZhciBvbGRfbmFtZT1QQVRILmJhc2VuYW1lKG9sZF9wYXRoKTt2YXIgbmV3X25hbWU9UEFUSC5iYXNlbmFtZShuZXdfcGF0aCk7dmFyIGxvb2t1cCxvbGRfZGlyLG5ld19kaXI7bG9va3VwPUZTLmxvb2t1cFBhdGgob2xkX3BhdGgse3BhcmVudDp0cnVlfSk7b2xkX2Rpcj1sb29rdXAubm9kZTtsb29rdXA9RlMubG9va3VwUGF0aChuZXdfcGF0aCx7cGFyZW50OnRydWV9KTtuZXdfZGlyPWxvb2t1cC5ub2RlO2lmKCFvbGRfZGlyfHwhbmV3X2Rpcil0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCk7aWYob2xkX2Rpci5tb3VudCE9PW5ld19kaXIubW91bnQpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDc1KX12YXIgb2xkX25vZGU9RlMubG9va3VwTm9kZShvbGRfZGlyLG9sZF9uYW1lKTt2YXIgcmVsYXRpdmU9UEFUSF9GUy5yZWxhdGl2ZShvbGRfcGF0aCxuZXdfZGlybmFtZSk7aWYocmVsYXRpdmUuY2hhckF0KDApIT09Ii4iKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9cmVsYXRpdmU9UEFUSF9GUy5yZWxhdGl2ZShuZXdfcGF0aCxvbGRfZGlybmFtZSk7aWYocmVsYXRpdmUuY2hhckF0KDApIT09Ii4iKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NSl9dmFyIG5ld19ub2RlO3RyeXtuZXdfbm9kZT1GUy5sb29rdXBOb2RlKG5ld19kaXIsbmV3X25hbWUpfWNhdGNoKGUpe31pZihvbGRfbm9kZT09PW5ld19ub2RlKXtyZXR1cm59dmFyIGlzZGlyPUZTLmlzRGlyKG9sZF9ub2RlLm1vZGUpO3ZhciBlcnJDb2RlPUZTLm1heURlbGV0ZShvbGRfZGlyLG9sZF9uYW1lLGlzZGlyKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1lcnJDb2RlPW5ld19ub2RlP0ZTLm1heURlbGV0ZShuZXdfZGlyLG5ld19uYW1lLGlzZGlyKTpGUy5tYXlDcmVhdGUobmV3X2RpcixuZXdfbmFtZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIW9sZF9kaXIubm9kZV9vcHMucmVuYW1lKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNNb3VudHBvaW50KG9sZF9ub2RlKXx8bmV3X25vZGUmJkZTLmlzTW91bnRwb2ludChuZXdfbm9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDEwKX1pZihuZXdfZGlyIT09b2xkX2Rpcil7ZXJyQ29kZT1GUy5ub2RlUGVybWlzc2lvbnMob2xkX2RpciwidyIpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfX1GUy5oYXNoUmVtb3ZlTm9kZShvbGRfbm9kZSk7dHJ5e29sZF9kaXIubm9kZV9vcHMucmVuYW1lKG9sZF9ub2RlLG5ld19kaXIsbmV3X25hbWUpfWNhdGNoKGUpe3Rocm93IGV9ZmluYWxseXtGUy5oYXNoQWRkTm9kZShvbGRfbm9kZSl9fSxybWRpcjpwYXRoPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTt2YXIgbmFtZT1QQVRILmJhc2VuYW1lKHBhdGgpO3ZhciBub2RlPUZTLmxvb2t1cE5vZGUocGFyZW50LG5hbWUpO3ZhciBlcnJDb2RlPUZTLm1heURlbGV0ZShwYXJlbnQsbmFtZSx0cnVlKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1pZighcGFyZW50Lm5vZGVfb3BzLnJtZGlyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNNb3VudHBvaW50KG5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9cGFyZW50Lm5vZGVfb3BzLnJtZGlyKHBhcmVudCxuYW1lKTtGUy5kZXN0cm95Tm9kZShub2RlKX0scmVhZGRpcjpwYXRoPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzp0cnVlfSk7dmFyIG5vZGU9bG9va3VwLm5vZGU7aWYoIW5vZGUubm9kZV9vcHMucmVhZGRpcil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTQpfXJldHVybiBub2RlLm5vZGVfb3BzLnJlYWRkaXIobm9kZSl9LHVubGluazpwYXRoPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTtpZighcGFyZW50KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9dmFyIG5hbWU9UEFUSC5iYXNlbmFtZShwYXRoKTt2YXIgbm9kZT1GUy5sb29rdXBOb2RlKHBhcmVudCxuYW1lKTt2YXIgZXJyQ29kZT1GUy5tYXlEZWxldGUocGFyZW50LG5hbWUsZmFsc2UpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfWlmKCFwYXJlbnQubm9kZV9vcHMudW5saW5rKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNNb3VudHBvaW50KG5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9cGFyZW50Lm5vZGVfb3BzLnVubGluayhwYXJlbnQsbmFtZSk7RlMuZGVzdHJveU5vZGUobm9kZSl9LHJlYWRsaW5rOnBhdGg9Pnt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCk7dmFyIGxpbms9bG9va3VwLm5vZGU7aWYoIWxpbmspe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1pZighbGluay5ub2RlX29wcy5yZWFkbGluayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXJldHVybiBQQVRIX0ZTLnJlc29sdmUoRlMuZ2V0UGF0aChsaW5rLnBhcmVudCksbGluay5ub2RlX29wcy5yZWFkbGluayhsaW5rKSl9LHN0YXQ6KHBhdGgsZG9udEZvbGxvdyk9Pnt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250Rm9sbG93fSk7dmFyIG5vZGU9bG9va3VwLm5vZGU7aWYoIW5vZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1pZighbm9kZS5ub2RlX29wcy5nZXRhdHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9cmV0dXJuIG5vZGUubm9kZV9vcHMuZ2V0YXR0cihub2RlKX0sbHN0YXQ6cGF0aD0+e3JldHVybiBGUy5zdGF0KHBhdGgsdHJ1ZSl9LGNobW9kOihwYXRoLG1vZGUsZG9udEZvbGxvdyk9Pnt2YXIgbm9kZTtpZih0eXBlb2YgcGF0aD09InN0cmluZyIpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6IWRvbnRGb2xsb3d9KTtub2RlPWxvb2t1cC5ub2RlfWVsc2V7bm9kZT1wYXRofWlmKCFub2RlLm5vZGVfb3BzLnNldGF0dHIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYzKX1ub2RlLm5vZGVfb3BzLnNldGF0dHIobm9kZSx7bW9kZTptb2RlJjQwOTV8bm9kZS5tb2RlJn40MDk1LHRpbWVzdGFtcDpEYXRlLm5vdygpfSl9LGxjaG1vZDoocGF0aCxtb2RlKT0+e0ZTLmNobW9kKHBhdGgsbW9kZSx0cnVlKX0sZmNobW9kOihmZCxtb2RlKT0+e3ZhciBzdHJlYW09RlMuZ2V0U3RyZWFtKGZkKTtpZighc3RyZWFtKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1GUy5jaG1vZChzdHJlYW0ubm9kZSxtb2RlKX0sY2hvd246KHBhdGgsdWlkLGdpZCxkb250Rm9sbG93KT0+e3ZhciBub2RlO2lmKHR5cGVvZiBwYXRoPT0ic3RyaW5nIil7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udEZvbGxvd30pO25vZGU9bG9va3VwLm5vZGV9ZWxzZXtub2RlPXBhdGh9aWYoIW5vZGUubm9kZV9vcHMuc2V0YXR0cil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfW5vZGUubm9kZV9vcHMuc2V0YXR0cihub2RlLHt0aW1lc3RhbXA6RGF0ZS5ub3coKX0pfSxsY2hvd246KHBhdGgsdWlkLGdpZCk9PntGUy5jaG93bihwYXRoLHVpZCxnaWQsdHJ1ZSl9LGZjaG93bjooZmQsdWlkLGdpZCk9Pnt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoIXN0cmVhbSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9RlMuY2hvd24oc3RyZWFtLm5vZGUsdWlkLGdpZCl9LHRydW5jYXRlOihwYXRoLGxlbik9PntpZihsZW48MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXZhciBub2RlO2lmKHR5cGVvZiBwYXRoPT0ic3RyaW5nIil7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzp0cnVlfSk7bm9kZT1sb29rdXAubm9kZX1lbHNle25vZGU9cGF0aH1pZighbm9kZS5ub2RlX29wcy5zZXRhdHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNEaXIobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzEpfWlmKCFGUy5pc0ZpbGUobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhub2RlLCJ3Iik7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9bm9kZS5ub2RlX29wcy5zZXRhdHRyKG5vZGUse3NpemU6bGVuLHRpbWVzdGFtcDpEYXRlLm5vdygpfSl9LGZ0cnVuY2F0ZTooZmQsbGVuKT0+e3ZhciBzdHJlYW09RlMuZ2V0U3RyZWFtKGZkKTtpZighc3RyZWFtKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZigoc3RyZWFtLmZsYWdzJjIwOTcxNTUpPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfUZTLnRydW5jYXRlKHN0cmVhbS5ub2RlLGxlbil9LHV0aW1lOihwYXRoLGF0aW1lLG10aW1lKT0+e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6dHJ1ZX0pO3ZhciBub2RlPWxvb2t1cC5ub2RlO25vZGUubm9kZV9vcHMuc2V0YXR0cihub2RlLHt0aW1lc3RhbXA6TWF0aC5tYXgoYXRpbWUsbXRpbWUpfSl9LG9wZW46KHBhdGgsZmxhZ3MsbW9kZSk9PntpZihwYXRoPT09IiIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1mbGFncz10eXBlb2YgZmxhZ3M9PSJzdHJpbmciP0ZTLm1vZGVTdHJpbmdUb0ZsYWdzKGZsYWdzKTpmbGFnczttb2RlPXR5cGVvZiBtb2RlPT0idW5kZWZpbmVkIj80Mzg6bW9kZTtpZihmbGFncyY2NCl7bW9kZT1tb2RlJjQwOTV8MzI3Njh9ZWxzZXttb2RlPTB9dmFyIG5vZGU7aWYodHlwZW9mIHBhdGg9PSJvYmplY3QiKXtub2RlPXBhdGh9ZWxzZXtwYXRoPVBBVEgubm9ybWFsaXplKHBhdGgpO3RyeXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiEoZmxhZ3MmMTMxMDcyKX0pO25vZGU9bG9va3VwLm5vZGV9Y2F0Y2goZSl7fX12YXIgY3JlYXRlZD1mYWxzZTtpZihmbGFncyY2NCl7aWYobm9kZSl7aWYoZmxhZ3MmMTI4KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyMCl9fWVsc2V7bm9kZT1GUy5ta25vZChwYXRoLG1vZGUsMCk7Y3JlYXRlZD10cnVlfX1pZighbm9kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfWlmKEZTLmlzQ2hyZGV2KG5vZGUubW9kZSkpe2ZsYWdzJj1+NTEyfWlmKGZsYWdzJjY1NTM2JiYhRlMuaXNEaXIobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTQpfWlmKCFjcmVhdGVkKXt2YXIgZXJyQ29kZT1GUy5tYXlPcGVuKG5vZGUsZmxhZ3MpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfX1pZihmbGFncyY1MTImJiFjcmVhdGVkKXtGUy50cnVuY2F0ZShub2RlLDApfWZsYWdzJj1+KDEyOHw1MTJ8MTMxMDcyKTt2YXIgc3RyZWFtPUZTLmNyZWF0ZVN0cmVhbSh7bm9kZTpub2RlLHBhdGg6RlMuZ2V0UGF0aChub2RlKSxmbGFnczpmbGFncyxzZWVrYWJsZTp0cnVlLHBvc2l0aW9uOjAsc3RyZWFtX29wczpub2RlLnN0cmVhbV9vcHMsdW5nb3R0ZW46W10sZXJyb3I6ZmFsc2V9KTtpZihzdHJlYW0uc3RyZWFtX29wcy5vcGVuKXtzdHJlYW0uc3RyZWFtX29wcy5vcGVuKHN0cmVhbSl9aWYoTW9kdWxlWyJsb2dSZWFkRmlsZXMiXSYmIShmbGFncyYxKSl7aWYoIUZTLnJlYWRGaWxlcylGUy5yZWFkRmlsZXM9e307aWYoIShwYXRoIGluIEZTLnJlYWRGaWxlcykpe0ZTLnJlYWRGaWxlc1twYXRoXT0xfX1yZXR1cm4gc3RyZWFtfSxjbG9zZTpzdHJlYW09PntpZihGUy5pc0Nsb3NlZChzdHJlYW0pKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZihzdHJlYW0uZ2V0ZGVudHMpc3RyZWFtLmdldGRlbnRzPW51bGw7dHJ5e2lmKHN0cmVhbS5zdHJlYW1fb3BzLmNsb3NlKXtzdHJlYW0uc3RyZWFtX29wcy5jbG9zZShzdHJlYW0pfX1jYXRjaChlKXt0aHJvdyBlfWZpbmFsbHl7RlMuY2xvc2VTdHJlYW0oc3RyZWFtLmZkKX1zdHJlYW0uZmQ9bnVsbH0saXNDbG9zZWQ6c3RyZWFtPT57cmV0dXJuIHN0cmVhbS5mZD09PW51bGx9LGxsc2Vlazooc3RyZWFtLG9mZnNldCx3aGVuY2UpPT57aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoIXN0cmVhbS5zZWVrYWJsZXx8IXN0cmVhbS5zdHJlYW1fb3BzLmxsc2Vlayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNzApfWlmKHdoZW5jZSE9MCYmd2hlbmNlIT0xJiZ3aGVuY2UhPTIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1zdHJlYW0ucG9zaXRpb249c3RyZWFtLnN0cmVhbV9vcHMubGxzZWVrKHN0cmVhbSxvZmZzZXQsd2hlbmNlKTtzdHJlYW0udW5nb3R0ZW49W107cmV0dXJuIHN0cmVhbS5wb3NpdGlvbn0scmVhZDooc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uKT0+e2lmKGxlbmd0aDwwfHxwb3NpdGlvbjwwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTEpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKEZTLmlzRGlyKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigzMSl9aWYoIXN0cmVhbS5zdHJlYW1fb3BzLnJlYWQpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgc2Vla2luZz10eXBlb2YgcG9zaXRpb24hPSJ1bmRlZmluZWQiO2lmKCFzZWVraW5nKXtwb3NpdGlvbj1zdHJlYW0ucG9zaXRpb259ZWxzZSBpZighc3RyZWFtLnNlZWthYmxlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3MCl9dmFyIGJ5dGVzUmVhZD1zdHJlYW0uc3RyZWFtX29wcy5yZWFkKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbik7aWYoIXNlZWtpbmcpc3RyZWFtLnBvc2l0aW9uKz1ieXRlc1JlYWQ7cmV0dXJuIGJ5dGVzUmVhZH0sd3JpdGU6KHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbixjYW5Pd24pPT57aWYobGVuZ3RoPDB8fHBvc2l0aW9uPDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZihGUy5pc0Nsb3NlZChzdHJlYW0pKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZigoc3RyZWFtLmZsYWdzJjIwOTcxNTUpPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoRlMuaXNEaXIoc3RyZWFtLm5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMxKX1pZighc3RyZWFtLnN0cmVhbV9vcHMud3JpdGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZihzdHJlYW0uc2Vla2FibGUmJnN0cmVhbS5mbGFncyYxMDI0KXtGUy5sbHNlZWsoc3RyZWFtLDAsMil9dmFyIHNlZWtpbmc9dHlwZW9mIHBvc2l0aW9uIT0idW5kZWZpbmVkIjtpZighc2Vla2luZyl7cG9zaXRpb249c3RyZWFtLnBvc2l0aW9ufWVsc2UgaWYoIXN0cmVhbS5zZWVrYWJsZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNzApfXZhciBieXRlc1dyaXR0ZW49c3RyZWFtLnN0cmVhbV9vcHMud3JpdGUoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uLGNhbk93bik7aWYoIXNlZWtpbmcpc3RyZWFtLnBvc2l0aW9uKz1ieXRlc1dyaXR0ZW47cmV0dXJuIGJ5dGVzV3JpdHRlbn0sYWxsb2NhdGU6KHN0cmVhbSxvZmZzZXQsbGVuZ3RoKT0+e2lmKEZTLmlzQ2xvc2VkKHN0cmVhbSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKG9mZnNldDwwfHxsZW5ndGg8PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZigoc3RyZWFtLmZsYWdzJjIwOTcxNTUpPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoIUZTLmlzRmlsZShzdHJlYW0ubm9kZS5tb2RlKSYmIUZTLmlzRGlyKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9aWYoIXN0cmVhbS5zdHJlYW1fb3BzLmFsbG9jYXRlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMzgpfXN0cmVhbS5zdHJlYW1fb3BzLmFsbG9jYXRlKHN0cmVhbSxvZmZzZXQsbGVuZ3RoKX0sbW1hcDooc3RyZWFtLGFkZHJlc3MsbGVuZ3RoLHBvc2l0aW9uLHByb3QsZmxhZ3MpPT57aWYoKHByb3QmMikhPT0wJiYoZmxhZ3MmMik9PT0wJiYoc3RyZWFtLmZsYWdzJjIwOTcxNTUpIT09Mil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMil9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTEpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDIpfWlmKCFzdHJlYW0uc3RyZWFtX29wcy5tbWFwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9cmV0dXJuIHN0cmVhbS5zdHJlYW1fb3BzLm1tYXAoc3RyZWFtLGFkZHJlc3MsbGVuZ3RoLHBvc2l0aW9uLHByb3QsZmxhZ3MpfSxtc3luYzooc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLG1tYXBGbGFncyk9PntpZighc3RyZWFtfHwhc3RyZWFtLnN0cmVhbV9vcHMubXN5bmMpe3JldHVybiAwfXJldHVybiBzdHJlYW0uc3RyZWFtX29wcy5tc3luYyhzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgsbW1hcEZsYWdzKX0sbXVubWFwOnN0cmVhbT0+MCxpb2N0bDooc3RyZWFtLGNtZCxhcmcpPT57aWYoIXN0cmVhbS5zdHJlYW1fb3BzLmlvY3RsKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1OSl9cmV0dXJuIHN0cmVhbS5zdHJlYW1fb3BzLmlvY3RsKHN0cmVhbSxjbWQsYXJnKX0scmVhZEZpbGU6KHBhdGgsb3B0cz17fSk9PntvcHRzLmZsYWdzPW9wdHMuZmxhZ3N8fDA7b3B0cy5lbmNvZGluZz1vcHRzLmVuY29kaW5nfHwiYmluYXJ5IjtpZihvcHRzLmVuY29kaW5nIT09InV0ZjgiJiZvcHRzLmVuY29kaW5nIT09ImJpbmFyeSIpe3Rocm93IG5ldyBFcnJvcignSW52YWxpZCBlbmNvZGluZyB0eXBlICInK29wdHMuZW5jb2RpbmcrJyInKX12YXIgcmV0O3ZhciBzdHJlYW09RlMub3BlbihwYXRoLG9wdHMuZmxhZ3MpO3ZhciBzdGF0PUZTLnN0YXQocGF0aCk7dmFyIGxlbmd0aD1zdGF0LnNpemU7dmFyIGJ1Zj1uZXcgVWludDhBcnJheShsZW5ndGgpO0ZTLnJlYWQoc3RyZWFtLGJ1ZiwwLGxlbmd0aCwwKTtpZihvcHRzLmVuY29kaW5nPT09InV0ZjgiKXtyZXQ9VVRGOEFycmF5VG9TdHJpbmcoYnVmLDApfWVsc2UgaWYob3B0cy5lbmNvZGluZz09PSJiaW5hcnkiKXtyZXQ9YnVmfUZTLmNsb3NlKHN0cmVhbSk7cmV0dXJuIHJldH0sd3JpdGVGaWxlOihwYXRoLGRhdGEsb3B0cz17fSk9PntvcHRzLmZsYWdzPW9wdHMuZmxhZ3N8fDU3Nzt2YXIgc3RyZWFtPUZTLm9wZW4ocGF0aCxvcHRzLmZsYWdzLG9wdHMubW9kZSk7aWYodHlwZW9mIGRhdGE9PSJzdHJpbmciKXt2YXIgYnVmPW5ldyBVaW50OEFycmF5KGxlbmd0aEJ5dGVzVVRGOChkYXRhKSsxKTt2YXIgYWN0dWFsTnVtQnl0ZXM9c3RyaW5nVG9VVEY4QXJyYXkoZGF0YSxidWYsMCxidWYubGVuZ3RoKTtGUy53cml0ZShzdHJlYW0sYnVmLDAsYWN0dWFsTnVtQnl0ZXMsdW5kZWZpbmVkLG9wdHMuY2FuT3duKX1lbHNlIGlmKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSl7RlMud3JpdGUoc3RyZWFtLGRhdGEsMCxkYXRhLmJ5dGVMZW5ndGgsdW5kZWZpbmVkLG9wdHMuY2FuT3duKX1lbHNle3Rocm93IG5ldyBFcnJvcigiVW5zdXBwb3J0ZWQgZGF0YSB0eXBlIil9RlMuY2xvc2Uoc3RyZWFtKX0sY3dkOigpPT5GUy5jdXJyZW50UGF0aCxjaGRpcjpwYXRoPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzp0cnVlfSk7aWYobG9va3VwLm5vZGU9PT1udWxsKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9aWYoIUZTLmlzRGlyKGxvb2t1cC5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NCl9dmFyIGVyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKGxvb2t1cC5ub2RlLCJ4Iik7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9RlMuY3VycmVudFBhdGg9bG9va3VwLnBhdGh9LGNyZWF0ZURlZmF1bHREaXJlY3RvcmllczooKT0+e0ZTLm1rZGlyKCIvdG1wIik7RlMubWtkaXIoIi9ob21lIik7RlMubWtkaXIoIi9ob21lL3dlYl91c2VyIil9LGNyZWF0ZURlZmF1bHREZXZpY2VzOigpPT57RlMubWtkaXIoIi9kZXYiKTtGUy5yZWdpc3RlckRldmljZShGUy5tYWtlZGV2KDEsMykse3JlYWQ6KCk9PjAsd3JpdGU6KHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3MpPT5sZW5ndGh9KTtGUy5ta2RldigiL2Rldi9udWxsIixGUy5tYWtlZGV2KDEsMykpO1RUWS5yZWdpc3RlcihGUy5tYWtlZGV2KDUsMCksVFRZLmRlZmF1bHRfdHR5X29wcyk7VFRZLnJlZ2lzdGVyKEZTLm1ha2VkZXYoNiwwKSxUVFkuZGVmYXVsdF90dHkxX29wcyk7RlMubWtkZXYoIi9kZXYvdHR5IixGUy5tYWtlZGV2KDUsMCkpO0ZTLm1rZGV2KCIvZGV2L3R0eTEiLEZTLm1ha2VkZXYoNiwwKSk7dmFyIHJhbmRvbV9kZXZpY2U9Z2V0UmFuZG9tRGV2aWNlKCk7RlMuY3JlYXRlRGV2aWNlKCIvZGV2IiwicmFuZG9tIixyYW5kb21fZGV2aWNlKTtGUy5jcmVhdGVEZXZpY2UoIi9kZXYiLCJ1cmFuZG9tIixyYW5kb21fZGV2aWNlKTtGUy5ta2RpcigiL2Rldi9zaG0iKTtGUy5ta2RpcigiL2Rldi9zaG0vdG1wIil9LGNyZWF0ZVNwZWNpYWxEaXJlY3RvcmllczooKT0+e0ZTLm1rZGlyKCIvcHJvYyIpO3ZhciBwcm9jX3NlbGY9RlMubWtkaXIoIi9wcm9jL3NlbGYiKTtGUy5ta2RpcigiL3Byb2Mvc2VsZi9mZCIpO0ZTLm1vdW50KHttb3VudDooKT0+e3ZhciBub2RlPUZTLmNyZWF0ZU5vZGUocHJvY19zZWxmLCJmZCIsMTYzODR8NTExLDczKTtub2RlLm5vZGVfb3BzPXtsb29rdXA6KHBhcmVudCxuYW1lKT0+e3ZhciBmZD0rbmFtZTt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoIXN0cmVhbSl0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KTt2YXIgcmV0PXtwYXJlbnQ6bnVsbCxtb3VudDp7bW91bnRwb2ludDoiZmFrZSJ9LG5vZGVfb3BzOntyZWFkbGluazooKT0+c3RyZWFtLnBhdGh9fTtyZXQucGFyZW50PXJldDtyZXR1cm4gcmV0fX07cmV0dXJuIG5vZGV9fSx7fSwiL3Byb2Mvc2VsZi9mZCIpfSxjcmVhdGVTdGFuZGFyZFN0cmVhbXM6KCk9PntpZihNb2R1bGVbInN0ZGluIl0pe0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInN0ZGluIixNb2R1bGVbInN0ZGluIl0pfWVsc2V7RlMuc3ltbGluaygiL2Rldi90dHkiLCIvZGV2L3N0ZGluIil9aWYoTW9kdWxlWyJzdGRvdXQiXSl7RlMuY3JlYXRlRGV2aWNlKCIvZGV2Iiwic3Rkb3V0IixudWxsLE1vZHVsZVsic3Rkb3V0Il0pfWVsc2V7RlMuc3ltbGluaygiL2Rldi90dHkiLCIvZGV2L3N0ZG91dCIpfWlmKE1vZHVsZVsic3RkZXJyIl0pe0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInN0ZGVyciIsbnVsbCxNb2R1bGVbInN0ZGVyciJdKX1lbHNle0ZTLnN5bWxpbmsoIi9kZXYvdHR5MSIsIi9kZXYvc3RkZXJyIil9dmFyIHN0ZGluPUZTLm9wZW4oIi9kZXYvc3RkaW4iLDApO3ZhciBzdGRvdXQ9RlMub3BlbigiL2Rldi9zdGRvdXQiLDEpO3ZhciBzdGRlcnI9RlMub3BlbigiL2Rldi9zdGRlcnIiLDEpfSxlbnN1cmVFcnJub0Vycm9yOigpPT57aWYoRlMuRXJybm9FcnJvcilyZXR1cm47RlMuRXJybm9FcnJvcj1mdW5jdGlvbiBFcnJub0Vycm9yKGVycm5vLG5vZGUpe3RoaXMubm9kZT1ub2RlO3RoaXMuc2V0RXJybm89ZnVuY3Rpb24oZXJybm8pe3RoaXMuZXJybm89ZXJybm99O3RoaXMuc2V0RXJybm8oZXJybm8pO3RoaXMubWVzc2FnZT0iRlMgZXJyb3IifTtGUy5FcnJub0Vycm9yLnByb3RvdHlwZT1uZXcgRXJyb3I7RlMuRXJybm9FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3I9RlMuRXJybm9FcnJvcjtbNDRdLmZvckVhY2goY29kZT0+e0ZTLmdlbmVyaWNFcnJvcnNbY29kZV09bmV3IEZTLkVycm5vRXJyb3IoY29kZSk7RlMuZ2VuZXJpY0Vycm9yc1tjb2RlXS5zdGFjaz0iPGdlbmVyaWMgZXJyb3IsIG5vIHN0YWNrPiJ9KX0sc3RhdGljSW5pdDooKT0+e0ZTLmVuc3VyZUVycm5vRXJyb3IoKTtGUy5uYW1lVGFibGU9bmV3IEFycmF5KDQwOTYpO0ZTLm1vdW50KE1FTUZTLHt9LCIvIik7RlMuY3JlYXRlRGVmYXVsdERpcmVjdG9yaWVzKCk7RlMuY3JlYXRlRGVmYXVsdERldmljZXMoKTtGUy5jcmVhdGVTcGVjaWFsRGlyZWN0b3JpZXMoKTtGUy5maWxlc3lzdGVtcz17Ik1FTUZTIjpNRU1GU319LGluaXQ6KGlucHV0LG91dHB1dCxlcnJvcik9PntGUy5pbml0LmluaXRpYWxpemVkPXRydWU7RlMuZW5zdXJlRXJybm9FcnJvcigpO01vZHVsZVsic3RkaW4iXT1pbnB1dHx8TW9kdWxlWyJzdGRpbiJdO01vZHVsZVsic3Rkb3V0Il09b3V0cHV0fHxNb2R1bGVbInN0ZG91dCJdO01vZHVsZVsic3RkZXJyIl09ZXJyb3J8fE1vZHVsZVsic3RkZXJyIl07RlMuY3JlYXRlU3RhbmRhcmRTdHJlYW1zKCl9LHF1aXQ6KCk9PntGUy5pbml0LmluaXRpYWxpemVkPWZhbHNlO19fX3N0ZGlvX2V4aXQoKTtmb3IodmFyIGk9MDtpPEZTLnN0cmVhbXMubGVuZ3RoO2krKyl7dmFyIHN0cmVhbT1GUy5zdHJlYW1zW2ldO2lmKCFzdHJlYW0pe2NvbnRpbnVlfUZTLmNsb3NlKHN0cmVhbSl9fSxnZXRNb2RlOihjYW5SZWFkLGNhbldyaXRlKT0+e3ZhciBtb2RlPTA7aWYoY2FuUmVhZCltb2RlfD0yOTJ8NzM7aWYoY2FuV3JpdGUpbW9kZXw9MTQ2O3JldHVybiBtb2RlfSxmaW5kT2JqZWN0OihwYXRoLGRvbnRSZXNvbHZlTGFzdExpbmspPT57dmFyIHJldD1GUy5hbmFseXplUGF0aChwYXRoLGRvbnRSZXNvbHZlTGFzdExpbmspO2lmKHJldC5leGlzdHMpe3JldHVybiByZXQub2JqZWN0fWVsc2V7cmV0dXJuIG51bGx9fSxhbmFseXplUGF0aDoocGF0aCxkb250UmVzb2x2ZUxhc3RMaW5rKT0+e3RyeXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250UmVzb2x2ZUxhc3RMaW5rfSk7cGF0aD1sb29rdXAucGF0aH1jYXRjaChlKXt9dmFyIHJldD17aXNSb290OmZhbHNlLGV4aXN0czpmYWxzZSxlcnJvcjowLG5hbWU6bnVsbCxwYXRoOm51bGwsb2JqZWN0Om51bGwscGFyZW50RXhpc3RzOmZhbHNlLHBhcmVudFBhdGg6bnVsbCxwYXJlbnRPYmplY3Q6bnVsbH07dHJ5e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtwYXJlbnQ6dHJ1ZX0pO3JldC5wYXJlbnRFeGlzdHM9dHJ1ZTtyZXQucGFyZW50UGF0aD1sb29rdXAucGF0aDtyZXQucGFyZW50T2JqZWN0PWxvb2t1cC5ub2RlO3JldC5uYW1lPVBBVEguYmFzZW5hbWUocGF0aCk7bG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250UmVzb2x2ZUxhc3RMaW5rfSk7cmV0LmV4aXN0cz10cnVlO3JldC5wYXRoPWxvb2t1cC5wYXRoO3JldC5vYmplY3Q9bG9va3VwLm5vZGU7cmV0Lm5hbWU9bG9va3VwLm5vZGUubmFtZTtyZXQuaXNSb290PWxvb2t1cC5wYXRoPT09Ii8ifWNhdGNoKGUpe3JldC5lcnJvcj1lLmVycm5vfXJldHVybiByZXR9LGNyZWF0ZVBhdGg6KHBhcmVudCxwYXRoLGNhblJlYWQsY2FuV3JpdGUpPT57cGFyZW50PXR5cGVvZiBwYXJlbnQ9PSJzdHJpbmciP3BhcmVudDpGUy5nZXRQYXRoKHBhcmVudCk7dmFyIHBhcnRzPXBhdGguc3BsaXQoIi8iKS5yZXZlcnNlKCk7d2hpbGUocGFydHMubGVuZ3RoKXt2YXIgcGFydD1wYXJ0cy5wb3AoKTtpZighcGFydCljb250aW51ZTt2YXIgY3VycmVudD1QQVRILmpvaW4yKHBhcmVudCxwYXJ0KTt0cnl7RlMubWtkaXIoY3VycmVudCl9Y2F0Y2goZSl7fXBhcmVudD1jdXJyZW50fXJldHVybiBjdXJyZW50fSxjcmVhdGVGaWxlOihwYXJlbnQsbmFtZSxwcm9wZXJ0aWVzLGNhblJlYWQsY2FuV3JpdGUpPT57dmFyIHBhdGg9UEFUSC5qb2luMih0eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpLG5hbWUpO3ZhciBtb2RlPUZTLmdldE1vZGUoY2FuUmVhZCxjYW5Xcml0ZSk7cmV0dXJuIEZTLmNyZWF0ZShwYXRoLG1vZGUpfSxjcmVhdGVEYXRhRmlsZToocGFyZW50LG5hbWUsZGF0YSxjYW5SZWFkLGNhbldyaXRlLGNhbk93bik9Pnt2YXIgcGF0aD1uYW1lO2lmKHBhcmVudCl7cGFyZW50PXR5cGVvZiBwYXJlbnQ9PSJzdHJpbmciP3BhcmVudDpGUy5nZXRQYXRoKHBhcmVudCk7cGF0aD1uYW1lP1BBVEguam9pbjIocGFyZW50LG5hbWUpOnBhcmVudH12YXIgbW9kZT1GUy5nZXRNb2RlKGNhblJlYWQsY2FuV3JpdGUpO3ZhciBub2RlPUZTLmNyZWF0ZShwYXRoLG1vZGUpO2lmKGRhdGEpe2lmKHR5cGVvZiBkYXRhPT0ic3RyaW5nIil7dmFyIGFycj1uZXcgQXJyYXkoZGF0YS5sZW5ndGgpO2Zvcih2YXIgaT0wLGxlbj1kYXRhLmxlbmd0aDtpPGxlbjsrK2kpYXJyW2ldPWRhdGEuY2hhckNvZGVBdChpKTtkYXRhPWFycn1GUy5jaG1vZChub2RlLG1vZGV8MTQ2KTt2YXIgc3RyZWFtPUZTLm9wZW4obm9kZSw1NzcpO0ZTLndyaXRlKHN0cmVhbSxkYXRhLDAsZGF0YS5sZW5ndGgsMCxjYW5Pd24pO0ZTLmNsb3NlKHN0cmVhbSk7RlMuY2htb2Qobm9kZSxtb2RlKX1yZXR1cm4gbm9kZX0sY3JlYXRlRGV2aWNlOihwYXJlbnQsbmFtZSxpbnB1dCxvdXRwdXQpPT57dmFyIHBhdGg9UEFUSC5qb2luMih0eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpLG5hbWUpO3ZhciBtb2RlPUZTLmdldE1vZGUoISFpbnB1dCwhIW91dHB1dCk7aWYoIUZTLmNyZWF0ZURldmljZS5tYWpvcilGUy5jcmVhdGVEZXZpY2UubWFqb3I9NjQ7dmFyIGRldj1GUy5tYWtlZGV2KEZTLmNyZWF0ZURldmljZS5tYWpvcisrLDApO0ZTLnJlZ2lzdGVyRGV2aWNlKGRldix7b3BlbjpzdHJlYW09PntzdHJlYW0uc2Vla2FibGU9ZmFsc2V9LGNsb3NlOnN0cmVhbT0+e2lmKG91dHB1dCYmb3V0cHV0LmJ1ZmZlciYmb3V0cHV0LmJ1ZmZlci5sZW5ndGgpe291dHB1dCgxMCl9fSxyZWFkOihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zKT0+e3ZhciBieXRlc1JlYWQ9MDtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe3ZhciByZXN1bHQ7dHJ5e3Jlc3VsdD1pbnB1dCgpfWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX1pZihyZXN1bHQ9PT11bmRlZmluZWQmJmJ5dGVzUmVhZD09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYpfWlmKHJlc3VsdD09PW51bGx8fHJlc3VsdD09PXVuZGVmaW5lZClicmVhaztieXRlc1JlYWQrKztidWZmZXJbb2Zmc2V0K2ldPXJlc3VsdH1pZihieXRlc1JlYWQpe3N0cmVhbS5ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpfXJldHVybiBieXRlc1JlYWR9LHdyaXRlOihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zKT0+e2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7dHJ5e291dHB1dChidWZmZXJbb2Zmc2V0K2ldKX1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9fWlmKGxlbmd0aCl7c3RyZWFtLm5vZGUudGltZXN0YW1wPURhdGUubm93KCl9cmV0dXJuIGl9fSk7cmV0dXJuIEZTLm1rZGV2KHBhdGgsbW9kZSxkZXYpfSxmb3JjZUxvYWRGaWxlOm9iaj0+e2lmKG9iai5pc0RldmljZXx8b2JqLmlzRm9sZGVyfHxvYmoubGlua3x8b2JqLmNvbnRlbnRzKXJldHVybiB0cnVlO2lmKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCE9InVuZGVmaW5lZCIpe3Rocm93IG5ldyBFcnJvcigiTGF6eSBsb2FkaW5nIHNob3VsZCBoYXZlIGJlZW4gcGVyZm9ybWVkIChjb250ZW50cyBzZXQpIGluIGNyZWF0ZUxhenlGaWxlLCBidXQgaXQgd2FzIG5vdC4gTGF6eSBsb2FkaW5nIG9ubHkgd29ya3MgaW4gd2ViIHdvcmtlcnMuIFVzZSAtLWVtYmVkLWZpbGUgb3IgLS1wcmVsb2FkLWZpbGUgaW4gZW1jYyBvbiB0aGUgbWFpbiB0aHJlYWQuIil9ZWxzZSBpZihyZWFkXyl7dHJ5e29iai5jb250ZW50cz1pbnRBcnJheUZyb21TdHJpbmcocmVhZF8ob2JqLnVybCksdHJ1ZSk7b2JqLnVzZWRCeXRlcz1vYmouY29udGVudHMubGVuZ3RofWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX19ZWxzZXt0aHJvdyBuZXcgRXJyb3IoIkNhbm5vdCBsb2FkIHdpdGhvdXQgcmVhZCgpIG9yIFhNTEh0dHBSZXF1ZXN0LiIpfX0sY3JlYXRlTGF6eUZpbGU6KHBhcmVudCxuYW1lLHVybCxjYW5SZWFkLGNhbldyaXRlKT0+e2Z1bmN0aW9uIExhenlVaW50OEFycmF5KCl7dGhpcy5sZW5ndGhLbm93bj1mYWxzZTt0aGlzLmNodW5rcz1bXX1MYXp5VWludDhBcnJheS5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uIExhenlVaW50OEFycmF5X2dldChpZHgpe2lmKGlkeD50aGlzLmxlbmd0aC0xfHxpZHg8MCl7cmV0dXJuIHVuZGVmaW5lZH12YXIgY2h1bmtPZmZzZXQ9aWR4JXRoaXMuY2h1bmtTaXplO3ZhciBjaHVua051bT1pZHgvdGhpcy5jaHVua1NpemV8MDtyZXR1cm4gdGhpcy5nZXR0ZXIoY2h1bmtOdW0pW2NodW5rT2Zmc2V0XX07TGF6eVVpbnQ4QXJyYXkucHJvdG90eXBlLnNldERhdGFHZXR0ZXI9ZnVuY3Rpb24gTGF6eVVpbnQ4QXJyYXlfc2V0RGF0YUdldHRlcihnZXR0ZXIpe3RoaXMuZ2V0dGVyPWdldHRlcn07TGF6eVVpbnQ4QXJyYXkucHJvdG90eXBlLmNhY2hlTGVuZ3RoPWZ1bmN0aW9uIExhenlVaW50OEFycmF5X2NhY2hlTGVuZ3RoKCl7dmFyIHhocj1uZXcgWE1MSHR0cFJlcXVlc3Q7eGhyLm9wZW4oIkhFQUQiLHVybCxmYWxzZSk7eGhyLnNlbmQobnVsbCk7aWYoISh4aHIuc3RhdHVzPj0yMDAmJnhoci5zdGF0dXM8MzAwfHx4aHIuc3RhdHVzPT09MzA0KSl0aHJvdyBuZXcgRXJyb3IoIkNvdWxkbid0IGxvYWQgIit1cmwrIi4gU3RhdHVzOiAiK3hoci5zdGF0dXMpO3ZhciBkYXRhbGVuZ3RoPU51bWJlcih4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoIkNvbnRlbnQtbGVuZ3RoIikpO3ZhciBoZWFkZXI7dmFyIGhhc0J5dGVTZXJ2aW5nPShoZWFkZXI9eGhyLmdldFJlc3BvbnNlSGVhZGVyKCJBY2NlcHQtUmFuZ2VzIikpJiZoZWFkZXI9PT0iYnl0ZXMiO3ZhciB1c2VzR3ppcD0oaGVhZGVyPXhoci5nZXRSZXNwb25zZUhlYWRlcigiQ29udGVudC1FbmNvZGluZyIpKSYmaGVhZGVyPT09Imd6aXAiO3ZhciBjaHVua1NpemU9MTAyNCoxMDI0O2lmKCFoYXNCeXRlU2VydmluZyljaHVua1NpemU9ZGF0YWxlbmd0aDt2YXIgZG9YSFI9KGZyb20sdG8pPT57aWYoZnJvbT50byl0aHJvdyBuZXcgRXJyb3IoImludmFsaWQgcmFuZ2UgKCIrZnJvbSsiLCAiK3RvKyIpIG9yIG5vIGJ5dGVzIHJlcXVlc3RlZCEiKTtpZih0bz5kYXRhbGVuZ3RoLTEpdGhyb3cgbmV3IEVycm9yKCJvbmx5ICIrZGF0YWxlbmd0aCsiIGJ5dGVzIGF2YWlsYWJsZSEgcHJvZ3JhbW1lciBlcnJvciEiKTt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO2lmKGRhdGFsZW5ndGghPT1jaHVua1NpemUpeGhyLnNldFJlcXVlc3RIZWFkZXIoIlJhbmdlIiwiYnl0ZXM9Iitmcm9tKyItIit0byk7eGhyLnJlc3BvbnNlVHlwZT0iYXJyYXlidWZmZXIiO2lmKHhoci5vdmVycmlkZU1pbWVUeXBlKXt4aHIub3ZlcnJpZGVNaW1lVHlwZSgidGV4dC9wbGFpbjsgY2hhcnNldD14LXVzZXItZGVmaW5lZCIpfXhoci5zZW5kKG51bGwpO2lmKCEoeGhyLnN0YXR1cz49MjAwJiZ4aHIuc3RhdHVzPDMwMHx8eGhyLnN0YXR1cz09PTMwNCkpdGhyb3cgbmV3IEVycm9yKCJDb3VsZG4ndCBsb2FkICIrdXJsKyIuIFN0YXR1czogIit4aHIuc3RhdHVzKTtpZih4aHIucmVzcG9uc2UhPT11bmRlZmluZWQpe3JldHVybiBuZXcgVWludDhBcnJheSh4aHIucmVzcG9uc2V8fFtdKX1lbHNle3JldHVybiBpbnRBcnJheUZyb21TdHJpbmcoeGhyLnJlc3BvbnNlVGV4dHx8IiIsdHJ1ZSl9fTt2YXIgbGF6eUFycmF5PXRoaXM7bGF6eUFycmF5LnNldERhdGFHZXR0ZXIoY2h1bmtOdW09Pnt2YXIgc3RhcnQ9Y2h1bmtOdW0qY2h1bmtTaXplO3ZhciBlbmQ9KGNodW5rTnVtKzEpKmNodW5rU2l6ZS0xO2VuZD1NYXRoLm1pbihlbmQsZGF0YWxlbmd0aC0xKTtpZih0eXBlb2YgbGF6eUFycmF5LmNodW5rc1tjaHVua051bV09PSJ1bmRlZmluZWQiKXtsYXp5QXJyYXkuY2h1bmtzW2NodW5rTnVtXT1kb1hIUihzdGFydCxlbmQpfWlmKHR5cGVvZiBsYXp5QXJyYXkuY2h1bmtzW2NodW5rTnVtXT09InVuZGVmaW5lZCIpdGhyb3cgbmV3IEVycm9yKCJkb1hIUiBmYWlsZWQhIik7cmV0dXJuIGxhenlBcnJheS5jaHVua3NbY2h1bmtOdW1dfSk7aWYodXNlc0d6aXB8fCFkYXRhbGVuZ3RoKXtjaHVua1NpemU9ZGF0YWxlbmd0aD0xO2RhdGFsZW5ndGg9dGhpcy5nZXR0ZXIoMCkubGVuZ3RoO2NodW5rU2l6ZT1kYXRhbGVuZ3RoO291dCgiTGF6eUZpbGVzIG9uIGd6aXAgZm9yY2VzIGRvd25sb2FkIG9mIHRoZSB3aG9sZSBmaWxlIHdoZW4gbGVuZ3RoIGlzIGFjY2Vzc2VkIil9dGhpcy5fbGVuZ3RoPWRhdGFsZW5ndGg7dGhpcy5fY2h1bmtTaXplPWNodW5rU2l6ZTt0aGlzLmxlbmd0aEtub3duPXRydWV9O2lmKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCE9InVuZGVmaW5lZCIpe2lmKCFFTlZJUk9OTUVOVF9JU19XT1JLRVIpdGhyb3ciQ2Fubm90IGRvIHN5bmNocm9ub3VzIGJpbmFyeSBYSFJzIG91dHNpZGUgd2Vid29ya2VycyBpbiBtb2Rlcm4gYnJvd3NlcnMuIFVzZSAtLWVtYmVkLWZpbGUgb3IgLS1wcmVsb2FkLWZpbGUgaW4gZW1jYyI7dmFyIGxhenlBcnJheT1uZXcgTGF6eVVpbnQ4QXJyYXk7T2JqZWN0LmRlZmluZVByb3BlcnRpZXMobGF6eUFycmF5LHtsZW5ndGg6e2dldDpmdW5jdGlvbigpe2lmKCF0aGlzLmxlbmd0aEtub3duKXt0aGlzLmNhY2hlTGVuZ3RoKCl9cmV0dXJuIHRoaXMuX2xlbmd0aH19LGNodW5rU2l6ZTp7Z2V0OmZ1bmN0aW9uKCl7aWYoIXRoaXMubGVuZ3RoS25vd24pe3RoaXMuY2FjaGVMZW5ndGgoKX1yZXR1cm4gdGhpcy5fY2h1bmtTaXplfX19KTt2YXIgcHJvcGVydGllcz17aXNEZXZpY2U6ZmFsc2UsY29udGVudHM6bGF6eUFycmF5fX1lbHNle3ZhciBwcm9wZXJ0aWVzPXtpc0RldmljZTpmYWxzZSx1cmw6dXJsfX12YXIgbm9kZT1GUy5jcmVhdGVGaWxlKHBhcmVudCxuYW1lLHByb3BlcnRpZXMsY2FuUmVhZCxjYW5Xcml0ZSk7aWYocHJvcGVydGllcy5jb250ZW50cyl7bm9kZS5jb250ZW50cz1wcm9wZXJ0aWVzLmNvbnRlbnRzfWVsc2UgaWYocHJvcGVydGllcy51cmwpe25vZGUuY29udGVudHM9bnVsbDtub2RlLnVybD1wcm9wZXJ0aWVzLnVybH1PYmplY3QuZGVmaW5lUHJvcGVydGllcyhub2RlLHt1c2VkQnl0ZXM6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNvbnRlbnRzLmxlbmd0aH19fSk7dmFyIHN0cmVhbV9vcHM9e307dmFyIGtleXM9T2JqZWN0LmtleXMobm9kZS5zdHJlYW1fb3BzKTtrZXlzLmZvckVhY2goa2V5PT57dmFyIGZuPW5vZGUuc3RyZWFtX29wc1trZXldO3N0cmVhbV9vcHNba2V5XT1mdW5jdGlvbiBmb3JjZUxvYWRMYXp5RmlsZSgpe0ZTLmZvcmNlTG9hZEZpbGUobm9kZSk7cmV0dXJuIGZuLmFwcGx5KG51bGwsYXJndW1lbnRzKX19KTtzdHJlYW1fb3BzLnJlYWQ9KChzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24pPT57RlMuZm9yY2VMb2FkRmlsZShub2RlKTt2YXIgY29udGVudHM9c3RyZWFtLm5vZGUuY29udGVudHM7aWYocG9zaXRpb24+PWNvbnRlbnRzLmxlbmd0aClyZXR1cm4gMDt2YXIgc2l6ZT1NYXRoLm1pbihjb250ZW50cy5sZW5ndGgtcG9zaXRpb24sbGVuZ3RoKTtpZihjb250ZW50cy5zbGljZSl7Zm9yKHZhciBpPTA7aTxzaXplO2krKyl7YnVmZmVyW29mZnNldCtpXT1jb250ZW50c1twb3NpdGlvbitpXX19ZWxzZXtmb3IodmFyIGk9MDtpPHNpemU7aSsrKXtidWZmZXJbb2Zmc2V0K2ldPWNvbnRlbnRzLmdldChwb3NpdGlvbitpKX19cmV0dXJuIHNpemV9KTtub2RlLnN0cmVhbV9vcHM9c3RyZWFtX29wcztyZXR1cm4gbm9kZX0sY3JlYXRlUHJlbG9hZGVkRmlsZToocGFyZW50LG5hbWUsdXJsLGNhblJlYWQsY2FuV3JpdGUsb25sb2FkLG9uZXJyb3IsZG9udENyZWF0ZUZpbGUsY2FuT3duLHByZUZpbmlzaCk9Pnt2YXIgZnVsbG5hbWU9bmFtZT9QQVRIX0ZTLnJlc29sdmUoUEFUSC5qb2luMihwYXJlbnQsbmFtZSkpOnBhcmVudDt2YXIgZGVwPWdldFVuaXF1ZVJ1bkRlcGVuZGVuY3koImNwICIrZnVsbG5hbWUpO2Z1bmN0aW9uIHByb2Nlc3NEYXRhKGJ5dGVBcnJheSl7ZnVuY3Rpb24gZmluaXNoKGJ5dGVBcnJheSl7aWYocHJlRmluaXNoKXByZUZpbmlzaCgpO2lmKCFkb250Q3JlYXRlRmlsZSl7RlMuY3JlYXRlRGF0YUZpbGUocGFyZW50LG5hbWUsYnl0ZUFycmF5LGNhblJlYWQsY2FuV3JpdGUsY2FuT3duKX1pZihvbmxvYWQpb25sb2FkKCk7cmVtb3ZlUnVuRGVwZW5kZW5jeShkZXApfWlmKEJyb3dzZXIuaGFuZGxlZEJ5UHJlbG9hZFBsdWdpbihieXRlQXJyYXksZnVsbG5hbWUsZmluaXNoLCgpPT57aWYob25lcnJvcilvbmVycm9yKCk7cmVtb3ZlUnVuRGVwZW5kZW5jeShkZXApfSkpe3JldHVybn1maW5pc2goYnl0ZUFycmF5KX1hZGRSdW5EZXBlbmRlbmN5KGRlcCk7aWYodHlwZW9mIHVybD09InN0cmluZyIpe2FzeW5jTG9hZCh1cmwsYnl0ZUFycmF5PT5wcm9jZXNzRGF0YShieXRlQXJyYXkpLG9uZXJyb3IpfWVsc2V7cHJvY2Vzc0RhdGEodXJsKX19LGluZGV4ZWREQjooKT0+e3JldHVybiB3aW5kb3cuaW5kZXhlZERCfHx3aW5kb3cubW96SW5kZXhlZERCfHx3aW5kb3cud2Via2l0SW5kZXhlZERCfHx3aW5kb3cubXNJbmRleGVkREJ9LERCX05BTUU6KCk9PntyZXR1cm4iRU1fRlNfIit3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9LERCX1ZFUlNJT046MjAsREJfU1RPUkVfTkFNRToiRklMRV9EQVRBIixzYXZlRmlsZXNUb0RCOihwYXRocyxvbmxvYWQsb25lcnJvcik9PntvbmxvYWQ9b25sb2FkfHwoKCk9Pnt9KTtvbmVycm9yPW9uZXJyb3J8fCgoKT0+e30pO3ZhciBpbmRleGVkREI9RlMuaW5kZXhlZERCKCk7dHJ5e3ZhciBvcGVuUmVxdWVzdD1pbmRleGVkREIub3BlbihGUy5EQl9OQU1FKCksRlMuREJfVkVSU0lPTil9Y2F0Y2goZSl7cmV0dXJuIG9uZXJyb3IoZSl9b3BlblJlcXVlc3Qub251cGdyYWRlbmVlZGVkPSgoKT0+e291dCgiY3JlYXRpbmcgZGIiKTt2YXIgZGI9b3BlblJlcXVlc3QucmVzdWx0O2RiLmNyZWF0ZU9iamVjdFN0b3JlKEZTLkRCX1NUT1JFX05BTUUpfSk7b3BlblJlcXVlc3Qub25zdWNjZXNzPSgoKT0+e3ZhciBkYj1vcGVuUmVxdWVzdC5yZXN1bHQ7dmFyIHRyYW5zYWN0aW9uPWRiLnRyYW5zYWN0aW9uKFtGUy5EQl9TVE9SRV9OQU1FXSwicmVhZHdyaXRlIik7dmFyIGZpbGVzPXRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKEZTLkRCX1NUT1JFX05BTUUpO3ZhciBvaz0wLGZhaWw9MCx0b3RhbD1wYXRocy5sZW5ndGg7ZnVuY3Rpb24gZmluaXNoKCl7aWYoZmFpbD09MClvbmxvYWQoKTtlbHNlIG9uZXJyb3IoKX1wYXRocy5mb3JFYWNoKHBhdGg9Pnt2YXIgcHV0UmVxdWVzdD1maWxlcy5wdXQoRlMuYW5hbHl6ZVBhdGgocGF0aCkub2JqZWN0LmNvbnRlbnRzLHBhdGgpO3B1dFJlcXVlc3Qub25zdWNjZXNzPSgoKT0+e29rKys7aWYob2srZmFpbD09dG90YWwpZmluaXNoKCl9KTtwdXRSZXF1ZXN0Lm9uZXJyb3I9KCgpPT57ZmFpbCsrO2lmKG9rK2ZhaWw9PXRvdGFsKWZpbmlzaCgpfSl9KTt0cmFuc2FjdGlvbi5vbmVycm9yPW9uZXJyb3J9KTtvcGVuUmVxdWVzdC5vbmVycm9yPW9uZXJyb3J9LGxvYWRGaWxlc0Zyb21EQjoocGF0aHMsb25sb2FkLG9uZXJyb3IpPT57b25sb2FkPW9ubG9hZHx8KCgpPT57fSk7b25lcnJvcj1vbmVycm9yfHwoKCk9Pnt9KTt2YXIgaW5kZXhlZERCPUZTLmluZGV4ZWREQigpO3RyeXt2YXIgb3BlblJlcXVlc3Q9aW5kZXhlZERCLm9wZW4oRlMuREJfTkFNRSgpLEZTLkRCX1ZFUlNJT04pfWNhdGNoKGUpe3JldHVybiBvbmVycm9yKGUpfW9wZW5SZXF1ZXN0Lm9udXBncmFkZW5lZWRlZD1vbmVycm9yO29wZW5SZXF1ZXN0Lm9uc3VjY2Vzcz0oKCk9Pnt2YXIgZGI9b3BlblJlcXVlc3QucmVzdWx0O3RyeXt2YXIgdHJhbnNhY3Rpb249ZGIudHJhbnNhY3Rpb24oW0ZTLkRCX1NUT1JFX05BTUVdLCJyZWFkb25seSIpfWNhdGNoKGUpe29uZXJyb3IoZSk7cmV0dXJufXZhciBmaWxlcz10cmFuc2FjdGlvbi5vYmplY3RTdG9yZShGUy5EQl9TVE9SRV9OQU1FKTt2YXIgb2s9MCxmYWlsPTAsdG90YWw9cGF0aHMubGVuZ3RoO2Z1bmN0aW9uIGZpbmlzaCgpe2lmKGZhaWw9PTApb25sb2FkKCk7ZWxzZSBvbmVycm9yKCl9cGF0aHMuZm9yRWFjaChwYXRoPT57dmFyIGdldFJlcXVlc3Q9ZmlsZXMuZ2V0KHBhdGgpO2dldFJlcXVlc3Qub25zdWNjZXNzPSgoKT0+e2lmKEZTLmFuYWx5emVQYXRoKHBhdGgpLmV4aXN0cyl7RlMudW5saW5rKHBhdGgpfUZTLmNyZWF0ZURhdGFGaWxlKFBBVEguZGlybmFtZShwYXRoKSxQQVRILmJhc2VuYW1lKHBhdGgpLGdldFJlcXVlc3QucmVzdWx0LHRydWUsdHJ1ZSx0cnVlKTtvaysrO2lmKG9rK2ZhaWw9PXRvdGFsKWZpbmlzaCgpfSk7Z2V0UmVxdWVzdC5vbmVycm9yPSgoKT0+e2ZhaWwrKztpZihvaytmYWlsPT10b3RhbClmaW5pc2goKX0pfSk7dHJhbnNhY3Rpb24ub25lcnJvcj1vbmVycm9yfSk7b3BlblJlcXVlc3Qub25lcnJvcj1vbmVycm9yfX07dmFyIFNZU0NBTExTPXtERUZBVUxUX1BPTExNQVNLOjUsY2FsY3VsYXRlQXQ6ZnVuY3Rpb24oZGlyZmQscGF0aCxhbGxvd0VtcHR5KXtpZihQQVRILmlzQWJzKHBhdGgpKXtyZXR1cm4gcGF0aH12YXIgZGlyO2lmKGRpcmZkPT09LTEwMCl7ZGlyPUZTLmN3ZCgpfWVsc2V7dmFyIGRpcnN0cmVhbT1GUy5nZXRTdHJlYW0oZGlyZmQpO2lmKCFkaXJzdHJlYW0pdGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCk7ZGlyPWRpcnN0cmVhbS5wYXRofWlmKHBhdGgubGVuZ3RoPT0wKXtpZighYWxsb3dFbXB0eSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfXJldHVybiBkaXJ9cmV0dXJuIFBBVEguam9pbjIoZGlyLHBhdGgpfSxkb1N0YXQ6ZnVuY3Rpb24oZnVuYyxwYXRoLGJ1Zil7dHJ5e3ZhciBzdGF0PWZ1bmMocGF0aCl9Y2F0Y2goZSl7aWYoZSYmZS5ub2RlJiZQQVRILm5vcm1hbGl6ZShwYXRoKSE9PVBBVEgubm9ybWFsaXplKEZTLmdldFBhdGgoZS5ub2RlKSkpe3JldHVybi01NH10aHJvdyBlfUdST1dBQkxFX0hFQVBfSTMyKClbYnVmPj4yXT1zdGF0LmRldjtHUk9XQUJMRV9IRUFQX0kzMigpW2J1Zis0Pj4yXT0wO0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzg+PjJdPXN0YXQuaW5vO0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzEyPj4yXT1zdGF0Lm1vZGU7R1JPV0FCTEVfSEVBUF9JMzIoKVtidWYrMTY+PjJdPXN0YXQubmxpbms7R1JPV0FCTEVfSEVBUF9JMzIoKVtidWYrMjA+PjJdPXN0YXQudWlkO0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzI0Pj4yXT1zdGF0LmdpZDtHUk9XQUJMRV9IRUFQX0kzMigpW2J1ZisyOD4+Ml09c3RhdC5yZGV2O0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzMyPj4yXT0wO3RlbXBJNjQ9W3N0YXQuc2l6ZT4+PjAsKHRlbXBEb3VibGU9c3RhdC5zaXplLCtNYXRoLmFicyh0ZW1wRG91YmxlKT49MT90ZW1wRG91YmxlPjA/KE1hdGgubWluKCtNYXRoLmZsb29yKHRlbXBEb3VibGUvNDI5NDk2NzI5NiksNDI5NDk2NzI5NSl8MCk+Pj4wOn5+K01hdGguY2VpbCgodGVtcERvdWJsZS0rKH5+dGVtcERvdWJsZT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCldLEdST1dBQkxFX0hFQVBfSTMyKClbYnVmKzQwPj4yXT10ZW1wSTY0WzBdLEdST1dBQkxFX0hFQVBfSTMyKClbYnVmKzQ0Pj4yXT10ZW1wSTY0WzFdO0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzQ4Pj4yXT00MDk2O0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzUyPj4yXT1zdGF0LmJsb2NrcztHUk9XQUJMRV9IRUFQX0kzMigpW2J1Zis1Nj4+Ml09c3RhdC5hdGltZS5nZXRUaW1lKCkvMWUzfDA7R1JPV0FCTEVfSEVBUF9JMzIoKVtidWYrNjA+PjJdPTA7R1JPV0FCTEVfSEVBUF9JMzIoKVtidWYrNjQ+PjJdPXN0YXQubXRpbWUuZ2V0VGltZSgpLzFlM3wwO0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzY4Pj4yXT0wO0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzcyPj4yXT1zdGF0LmN0aW1lLmdldFRpbWUoKS8xZTN8MDtHUk9XQUJMRV9IRUFQX0kzMigpW2J1Zis3Nj4+Ml09MDt0ZW1wSTY0PVtzdGF0Lmlubz4+PjAsKHRlbXBEb3VibGU9c3RhdC5pbm8sK01hdGguYWJzKHRlbXBEb3VibGUpPj0xP3RlbXBEb3VibGU+MD8oTWF0aC5taW4oK01hdGguZmxvb3IodGVtcERvdWJsZS80Mjk0OTY3Mjk2KSw0Mjk0OTY3Mjk1KXwwKT4+PjA6fn4rTWF0aC5jZWlsKCh0ZW1wRG91YmxlLSsofn50ZW1wRG91YmxlPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKV0sR1JPV0FCTEVfSEVBUF9JMzIoKVtidWYrODA+PjJdPXRlbXBJNjRbMF0sR1JPV0FCTEVfSEVBUF9JMzIoKVtidWYrODQ+PjJdPXRlbXBJNjRbMV07cmV0dXJuIDB9LGRvTXN5bmM6ZnVuY3Rpb24oYWRkcixzdHJlYW0sbGVuLGZsYWdzLG9mZnNldCl7dmFyIGJ1ZmZlcj1HUk9XQUJMRV9IRUFQX1U4KCkuc2xpY2UoYWRkcixhZGRyK2xlbik7RlMubXN5bmMoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuLGZsYWdzKX0sdmFyYXJnczp1bmRlZmluZWQsZ2V0OmZ1bmN0aW9uKCl7U1lTQ0FMTFMudmFyYXJncys9NDt2YXIgcmV0PUdST1dBQkxFX0hFQVBfSTMyKClbU1lTQ0FMTFMudmFyYXJncy00Pj4yXTtyZXR1cm4gcmV0fSxnZXRTdHI6ZnVuY3Rpb24ocHRyKXt2YXIgcmV0PVVURjhUb1N0cmluZyhwdHIpO3JldHVybiByZXR9LGdldFN0cmVhbUZyb21GRDpmdW5jdGlvbihmZCl7dmFyIHN0cmVhbT1GUy5nZXRTdHJlYW0oZmQpO2lmKCFzdHJlYW0pdGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCk7cmV0dXJuIHN0cmVhbX19O2Z1bmN0aW9uIF9fX3N5c2NhbGxfZmNudGw2NChmZCxjbWQsdmFyYXJncyl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMywxLGZkLGNtZCx2YXJhcmdzKTtTWVNDQUxMUy52YXJhcmdzPXZhcmFyZ3M7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTtzd2l0Y2goY21kKXtjYXNlIDA6e3ZhciBhcmc9U1lTQ0FMTFMuZ2V0KCk7aWYoYXJnPDApe3JldHVybi0yOH12YXIgbmV3U3RyZWFtO25ld1N0cmVhbT1GUy5jcmVhdGVTdHJlYW0oc3RyZWFtLGFyZyk7cmV0dXJuIG5ld1N0cmVhbS5mZH1jYXNlIDE6Y2FzZSAyOnJldHVybiAwO2Nhc2UgMzpyZXR1cm4gc3RyZWFtLmZsYWdzO2Nhc2UgNDp7dmFyIGFyZz1TWVNDQUxMUy5nZXQoKTtzdHJlYW0uZmxhZ3N8PWFyZztyZXR1cm4gMH1jYXNlIDU6e3ZhciBhcmc9U1lTQ0FMTFMuZ2V0KCk7dmFyIG9mZnNldD0wO0dST1dBQkxFX0hFQVBfSTE2KClbYXJnK29mZnNldD4+MV09MjtyZXR1cm4gMH1jYXNlIDY6Y2FzZSA3OnJldHVybiAwO2Nhc2UgMTY6Y2FzZSA4OnJldHVybi0yODtjYXNlIDk6c2V0RXJyTm8oMjgpO3JldHVybi0xO2RlZmF1bHQ6e3JldHVybi0yOH19fWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfZnN0YXQ2NChmZCxidWYpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDQsMSxmZCxidWYpO3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7cmV0dXJuIFNZU0NBTExTLmRvU3RhdChGUy5zdGF0LHN0cmVhbS5wYXRoLGJ1Zil9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9mdHJ1bmNhdGU2NChmZCxsZW5ndGhfbG93LGxlbmd0aF9oaWdoKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcyg1LDEsZmQsbGVuZ3RoX2xvdyxsZW5ndGhfaGlnaCk7dHJ5e3ZhciBsZW5ndGg9bGVuZ3RoX2hpZ2gqNDI5NDk2NzI5NisobGVuZ3RoX2xvdz4+PjApO0ZTLmZ0cnVuY2F0ZShmZCxsZW5ndGgpO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfaW9jdGwoZmQsb3AsdmFyYXJncyl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoNiwxLGZkLG9wLHZhcmFyZ3MpO1NZU0NBTExTLnZhcmFyZ3M9dmFyYXJnczt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3N3aXRjaChvcCl7Y2FzZSAyMTUwOTpjYXNlIDIxNTA1OntpZighc3RyZWFtLnR0eSlyZXR1cm4tNTk7cmV0dXJuIDB9Y2FzZSAyMTUxMDpjYXNlIDIxNTExOmNhc2UgMjE1MTI6Y2FzZSAyMTUwNjpjYXNlIDIxNTA3OmNhc2UgMjE1MDg6e2lmKCFzdHJlYW0udHR5KXJldHVybi01OTtyZXR1cm4gMH1jYXNlIDIxNTE5OntpZighc3RyZWFtLnR0eSlyZXR1cm4tNTk7dmFyIGFyZ3A9U1lTQ0FMTFMuZ2V0KCk7R1JPV0FCTEVfSEVBUF9JMzIoKVthcmdwPj4yXT0wO3JldHVybiAwfWNhc2UgMjE1MjA6e2lmKCFzdHJlYW0udHR5KXJldHVybi01OTtyZXR1cm4tMjh9Y2FzZSAyMTUzMTp7dmFyIGFyZ3A9U1lTQ0FMTFMuZ2V0KCk7cmV0dXJuIEZTLmlvY3RsKHN0cmVhbSxvcCxhcmdwKX1jYXNlIDIxNTIzOntpZighc3RyZWFtLnR0eSlyZXR1cm4tNTk7cmV0dXJuIDB9Y2FzZSAyMTUyNDp7aWYoIXN0cmVhbS50dHkpcmV0dXJuLTU5O3JldHVybiAwfWRlZmF1bHQ6YWJvcnQoImJhZCBpb2N0bCBzeXNjYWxsICIrb3ApfX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX2xzdGF0NjQocGF0aCxidWYpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDcsMSxwYXRoLGJ1Zik7dHJ5e3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKHBhdGgpO3JldHVybiBTWVNDQUxMUy5kb1N0YXQoRlMubHN0YXQscGF0aCxidWYpfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfbmV3ZnN0YXRhdChkaXJmZCxwYXRoLGJ1ZixmbGFncyl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoOCwxLGRpcmZkLHBhdGgsYnVmLGZsYWdzKTt0cnl7cGF0aD1TWVNDQUxMUy5nZXRTdHIocGF0aCk7dmFyIG5vZm9sbG93PWZsYWdzJjI1Njt2YXIgYWxsb3dFbXB0eT1mbGFncyY0MDk2O2ZsYWdzPWZsYWdzJn40MzUyO3BhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQoZGlyZmQscGF0aCxhbGxvd0VtcHR5KTtyZXR1cm4gU1lTQ0FMTFMuZG9TdGF0KG5vZm9sbG93P0ZTLmxzdGF0OkZTLnN0YXQscGF0aCxidWYpfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfb3BlbmF0KGRpcmZkLHBhdGgsZmxhZ3MsdmFyYXJncyl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoOSwxLGRpcmZkLHBhdGgsZmxhZ3MsdmFyYXJncyk7U1lTQ0FMTFMudmFyYXJncz12YXJhcmdzO3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KGRpcmZkLHBhdGgpO3ZhciBtb2RlPXZhcmFyZ3M/U1lTQ0FMTFMuZ2V0KCk6MDtyZXR1cm4gRlMub3BlbihwYXRoLGZsYWdzLG1vZGUpLmZkfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfcmVuYW1lYXQob2xkZGlyZmQsb2xkcGF0aCxuZXdkaXJmZCxuZXdwYXRoKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcygxMCwxLG9sZGRpcmZkLG9sZHBhdGgsbmV3ZGlyZmQsbmV3cGF0aCk7dHJ5e29sZHBhdGg9U1lTQ0FMTFMuZ2V0U3RyKG9sZHBhdGgpO25ld3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKG5ld3BhdGgpO29sZHBhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQob2xkZGlyZmQsb2xkcGF0aCk7bmV3cGF0aD1TWVNDQUxMUy5jYWxjdWxhdGVBdChuZXdkaXJmZCxuZXdwYXRoKTtGUy5yZW5hbWUob2xkcGF0aCxuZXdwYXRoKTtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX3N0YXQ2NChwYXRoLGJ1Zil7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMTEsMSxwYXRoLGJ1Zik7dHJ5e3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKHBhdGgpO3JldHVybiBTWVNDQUxMUy5kb1N0YXQoRlMuc3RhdCxwYXRoLGJ1Zil9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF91bmxpbmthdChkaXJmZCxwYXRoLGZsYWdzKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcygxMiwxLGRpcmZkLHBhdGgsZmxhZ3MpO3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KGRpcmZkLHBhdGgpO2lmKGZsYWdzPT09MCl7RlMudW5saW5rKHBhdGgpfWVsc2UgaWYoZmxhZ3M9PT01MTIpe0ZTLnJtZGlyKHBhdGgpfWVsc2V7YWJvcnQoIkludmFsaWQgZmxhZ3MgcGFzc2VkIHRvIHVubGlua2F0Iil9cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19kbGluaXQobWFpbl9kc29faGFuZGxlKXt9dmFyIGRsb3Blbk1pc3NpbmdFcnJvcj0iVG8gdXNlIGRsb3BlbiwgeW91IG5lZWQgZW5hYmxlIGR5bmFtaWMgbGlua2luZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbXNjcmlwdGVuLWNvcmUvZW1zY3JpcHRlbi93aWtpL0xpbmtpbmciO2Z1bmN0aW9uIF9fZGxvcGVuX2pzKGZpbGVuYW1lLGZsYWcpe2Fib3J0KGRsb3Blbk1pc3NpbmdFcnJvcil9ZnVuY3Rpb24gX19kbHN5bV9qcyhoYW5kbGUsc3ltYm9sKXthYm9ydChkbG9wZW5NaXNzaW5nRXJyb3IpfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2JpZ2ludChwcmltaXRpdmVUeXBlLG5hbWUsc2l6ZSxtaW5SYW5nZSxtYXhSYW5nZSl7fWZ1bmN0aW9uIGdldFNoaWZ0RnJvbVNpemUoc2l6ZSl7c3dpdGNoKHNpemUpe2Nhc2UgMTpyZXR1cm4gMDtjYXNlIDI6cmV0dXJuIDE7Y2FzZSA0OnJldHVybiAyO2Nhc2UgODpyZXR1cm4gMztkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoIlVua25vd24gdHlwZSBzaXplOiAiK3NpemUpfX1mdW5jdGlvbiBlbWJpbmRfaW5pdF9jaGFyQ29kZXMoKXt2YXIgY29kZXM9bmV3IEFycmF5KDI1Nik7Zm9yKHZhciBpPTA7aTwyNTY7KytpKXtjb2Rlc1tpXT1TdHJpbmcuZnJvbUNoYXJDb2RlKGkpfWVtYmluZF9jaGFyQ29kZXM9Y29kZXN9dmFyIGVtYmluZF9jaGFyQ29kZXM9dW5kZWZpbmVkO2Z1bmN0aW9uIHJlYWRMYXRpbjFTdHJpbmcocHRyKXt2YXIgcmV0PSIiO3ZhciBjPXB0cjt3aGlsZShHUk9XQUJMRV9IRUFQX1U4KClbY10pe3JldCs9ZW1iaW5kX2NoYXJDb2Rlc1tHUk9XQUJMRV9IRUFQX1U4KClbYysrXV19cmV0dXJuIHJldH12YXIgYXdhaXRpbmdEZXBlbmRlbmNpZXM9e307dmFyIHJlZ2lzdGVyZWRUeXBlcz17fTt2YXIgdHlwZURlcGVuZGVuY2llcz17fTt2YXIgY2hhcl8wPTQ4O3ZhciBjaGFyXzk9NTc7ZnVuY3Rpb24gbWFrZUxlZ2FsRnVuY3Rpb25OYW1lKG5hbWUpe2lmKHVuZGVmaW5lZD09PW5hbWUpe3JldHVybiJfdW5rbm93biJ9bmFtZT1uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05X10vZywiJCIpO3ZhciBmPW5hbWUuY2hhckNvZGVBdCgwKTtpZihmPj1jaGFyXzAmJmY8PWNoYXJfOSl7cmV0dXJuIl8iK25hbWV9cmV0dXJuIG5hbWV9ZnVuY3Rpb24gY3JlYXRlTmFtZWRGdW5jdGlvbihuYW1lLGJvZHkpe25hbWU9bWFrZUxlZ2FsRnVuY3Rpb25OYW1lKG5hbWUpO3JldHVybiBuZXcgRnVuY3Rpb24oImJvZHkiLCJyZXR1cm4gZnVuY3Rpb24gIituYW1lKyIoKSB7XG4iKycgICAgInVzZSBzdHJpY3QiOycrIiAgICByZXR1cm4gYm9keS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuIisifTtcbiIpKGJvZHkpfWZ1bmN0aW9uIGV4dGVuZEVycm9yKGJhc2VFcnJvclR5cGUsZXJyb3JOYW1lKXt2YXIgZXJyb3JDbGFzcz1jcmVhdGVOYW1lZEZ1bmN0aW9uKGVycm9yTmFtZSxmdW5jdGlvbihtZXNzYWdlKXt0aGlzLm5hbWU9ZXJyb3JOYW1lO3RoaXMubWVzc2FnZT1tZXNzYWdlO3ZhciBzdGFjaz1uZXcgRXJyb3IobWVzc2FnZSkuc3RhY2s7aWYoc3RhY2shPT11bmRlZmluZWQpe3RoaXMuc3RhY2s9dGhpcy50b1N0cmluZygpKyJcbiIrc3RhY2sucmVwbGFjZSgvXkVycm9yKDpbXlxuXSopP1xuLywiIil9fSk7ZXJyb3JDbGFzcy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiYXNlRXJyb3JUeXBlLnByb3RvdHlwZSk7ZXJyb3JDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3I9ZXJyb3JDbGFzcztlcnJvckNsYXNzLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe2lmKHRoaXMubWVzc2FnZT09PXVuZGVmaW5lZCl7cmV0dXJuIHRoaXMubmFtZX1lbHNle3JldHVybiB0aGlzLm5hbWUrIjogIit0aGlzLm1lc3NhZ2V9fTtyZXR1cm4gZXJyb3JDbGFzc312YXIgQmluZGluZ0Vycm9yPXVuZGVmaW5lZDtmdW5jdGlvbiB0aHJvd0JpbmRpbmdFcnJvcihtZXNzYWdlKXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKG1lc3NhZ2UpfXZhciBJbnRlcm5hbEVycm9yPXVuZGVmaW5lZDtmdW5jdGlvbiB0aHJvd0ludGVybmFsRXJyb3IobWVzc2FnZSl7dGhyb3cgbmV3IEludGVybmFsRXJyb3IobWVzc2FnZSl9ZnVuY3Rpb24gd2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQobXlUeXBlcyxkZXBlbmRlbnRUeXBlcyxnZXRUeXBlQ29udmVydGVycyl7bXlUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpe3R5cGVEZXBlbmRlbmNpZXNbdHlwZV09ZGVwZW5kZW50VHlwZXN9KTtmdW5jdGlvbiBvbkNvbXBsZXRlKHR5cGVDb252ZXJ0ZXJzKXt2YXIgbXlUeXBlQ29udmVydGVycz1nZXRUeXBlQ29udmVydGVycyh0eXBlQ29udmVydGVycyk7aWYobXlUeXBlQ29udmVydGVycy5sZW5ndGghPT1teVR5cGVzLmxlbmd0aCl7dGhyb3dJbnRlcm5hbEVycm9yKCJNaXNtYXRjaGVkIHR5cGUgY29udmVydGVyIGNvdW50Iil9Zm9yKHZhciBpPTA7aTxteVR5cGVzLmxlbmd0aDsrK2kpe3JlZ2lzdGVyVHlwZShteVR5cGVzW2ldLG15VHlwZUNvbnZlcnRlcnNbaV0pfX12YXIgdHlwZUNvbnZlcnRlcnM9bmV3IEFycmF5KGRlcGVuZGVudFR5cGVzLmxlbmd0aCk7dmFyIHVucmVnaXN0ZXJlZFR5cGVzPVtdO3ZhciByZWdpc3RlcmVkPTA7ZGVwZW5kZW50VHlwZXMuZm9yRWFjaCgoZHQsaSk9PntpZihyZWdpc3RlcmVkVHlwZXMuaGFzT3duUHJvcGVydHkoZHQpKXt0eXBlQ29udmVydGVyc1tpXT1yZWdpc3RlcmVkVHlwZXNbZHRdfWVsc2V7dW5yZWdpc3RlcmVkVHlwZXMucHVzaChkdCk7aWYoIWF3YWl0aW5nRGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KGR0KSl7YXdhaXRpbmdEZXBlbmRlbmNpZXNbZHRdPVtdfWF3YWl0aW5nRGVwZW5kZW5jaWVzW2R0XS5wdXNoKCgpPT57dHlwZUNvbnZlcnRlcnNbaV09cmVnaXN0ZXJlZFR5cGVzW2R0XTsrK3JlZ2lzdGVyZWQ7aWYocmVnaXN0ZXJlZD09PXVucmVnaXN0ZXJlZFR5cGVzLmxlbmd0aCl7b25Db21wbGV0ZSh0eXBlQ29udmVydGVycyl9fSl9fSk7aWYoMD09PXVucmVnaXN0ZXJlZFR5cGVzLmxlbmd0aCl7b25Db21wbGV0ZSh0eXBlQ29udmVydGVycyl9fWZ1bmN0aW9uIHJlZ2lzdGVyVHlwZShyYXdUeXBlLHJlZ2lzdGVyZWRJbnN0YW5jZSxvcHRpb25zPXt9KXtpZighKCJhcmdQYWNrQWR2YW5jZSJpbiByZWdpc3RlcmVkSW5zdGFuY2UpKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJyZWdpc3RlclR5cGUgcmVnaXN0ZXJlZEluc3RhbmNlIHJlcXVpcmVzIGFyZ1BhY2tBZHZhbmNlIil9dmFyIG5hbWU9cmVnaXN0ZXJlZEluc3RhbmNlLm5hbWU7aWYoIXJhd1R5cGUpe3Rocm93QmluZGluZ0Vycm9yKCd0eXBlICInK25hbWUrJyIgbXVzdCBoYXZlIGEgcG9zaXRpdmUgaW50ZWdlciB0eXBlaWQgcG9pbnRlcicpfWlmKHJlZ2lzdGVyZWRUeXBlcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7aWYob3B0aW9ucy5pZ25vcmVEdXBsaWNhdGVSZWdpc3RyYXRpb25zKXtyZXR1cm59ZWxzZXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHJlZ2lzdGVyIHR5cGUgJyIrbmFtZSsiJyB0d2ljZSIpfX1yZWdpc3RlcmVkVHlwZXNbcmF3VHlwZV09cmVnaXN0ZXJlZEluc3RhbmNlO2RlbGV0ZSB0eXBlRGVwZW5kZW5jaWVzW3Jhd1R5cGVdO2lmKGF3YWl0aW5nRGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KHJhd1R5cGUpKXt2YXIgY2FsbGJhY2tzPWF3YWl0aW5nRGVwZW5kZW5jaWVzW3Jhd1R5cGVdO2RlbGV0ZSBhd2FpdGluZ0RlcGVuZGVuY2llc1tyYXdUeXBlXTtjYWxsYmFja3MuZm9yRWFjaChjYj0+Y2IoKSl9fWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2wocmF3VHlwZSxuYW1lLHNpemUsdHJ1ZVZhbHVlLGZhbHNlVmFsdWUpe3ZhciBzaGlmdD1nZXRTaGlmdEZyb21TaXplKHNpemUpO25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKHd0KXtyZXR1cm4hIXd0fSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsbyl7cmV0dXJuIG8/dHJ1ZVZhbHVlOmZhbHNlVmFsdWV9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmZ1bmN0aW9uKHBvaW50ZXIpe3ZhciBoZWFwO2lmKHNpemU9PT0xKXtoZWFwPUdST1dBQkxFX0hFQVBfSTgoKX1lbHNlIGlmKHNpemU9PT0yKXtoZWFwPUdST1dBQkxFX0hFQVBfSTE2KCl9ZWxzZSBpZihzaXplPT09NCl7aGVhcD1HUk9XQUJMRV9IRUFQX0kzMigpfWVsc2V7dGhyb3cgbmV3IFR5cGVFcnJvcigiVW5rbm93biBib29sZWFuIHR5cGUgc2l6ZTogIituYW1lKX1yZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oaGVhcFtwb2ludGVyPj5zaGlmdF0pfSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pfWZ1bmN0aW9uIENsYXNzSGFuZGxlX2lzQWxpYXNPZihvdGhlcil7aWYoISh0aGlzIGluc3RhbmNlb2YgQ2xhc3NIYW5kbGUpKXtyZXR1cm4gZmFsc2V9aWYoIShvdGhlciBpbnN0YW5jZW9mIENsYXNzSGFuZGxlKSl7cmV0dXJuIGZhbHNlfXZhciBsZWZ0Q2xhc3M9dGhpcy4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgbGVmdD10aGlzLiQkLnB0cjt2YXIgcmlnaHRDbGFzcz1vdGhlci4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgcmlnaHQ9b3RoZXIuJCQucHRyO3doaWxlKGxlZnRDbGFzcy5iYXNlQ2xhc3Mpe2xlZnQ9bGVmdENsYXNzLnVwY2FzdChsZWZ0KTtsZWZ0Q2xhc3M9bGVmdENsYXNzLmJhc2VDbGFzc313aGlsZShyaWdodENsYXNzLmJhc2VDbGFzcyl7cmlnaHQ9cmlnaHRDbGFzcy51cGNhc3QocmlnaHQpO3JpZ2h0Q2xhc3M9cmlnaHRDbGFzcy5iYXNlQ2xhc3N9cmV0dXJuIGxlZnRDbGFzcz09PXJpZ2h0Q2xhc3MmJmxlZnQ9PT1yaWdodH1mdW5jdGlvbiBzaGFsbG93Q29weUludGVybmFsUG9pbnRlcihvKXtyZXR1cm57Y291bnQ6by5jb3VudCxkZWxldGVTY2hlZHVsZWQ6by5kZWxldGVTY2hlZHVsZWQscHJlc2VydmVQb2ludGVyT25EZWxldGU6by5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSxwdHI6by5wdHIscHRyVHlwZTpvLnB0clR5cGUsc21hcnRQdHI6by5zbWFydFB0cixzbWFydFB0clR5cGU6by5zbWFydFB0clR5cGV9fWZ1bmN0aW9uIHRocm93SW5zdGFuY2VBbHJlYWR5RGVsZXRlZChvYmope2Z1bmN0aW9uIGdldEluc3RhbmNlVHlwZU5hbWUoaGFuZGxlKXtyZXR1cm4gaGFuZGxlLiQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzLm5hbWV9dGhyb3dCaW5kaW5nRXJyb3IoZ2V0SW5zdGFuY2VUeXBlTmFtZShvYmopKyIgaW5zdGFuY2UgYWxyZWFkeSBkZWxldGVkIil9dmFyIGZpbmFsaXphdGlvblJlZ2lzdHJ5PWZhbHNlO2Z1bmN0aW9uIGRldGFjaEZpbmFsaXplcihoYW5kbGUpe31mdW5jdGlvbiBydW5EZXN0cnVjdG9yKCQkKXtpZigkJC5zbWFydFB0cil7JCQuc21hcnRQdHJUeXBlLnJhd0Rlc3RydWN0b3IoJCQuc21hcnRQdHIpfWVsc2V7JCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3MucmF3RGVzdHJ1Y3RvcigkJC5wdHIpfX1mdW5jdGlvbiByZWxlYXNlQ2xhc3NIYW5kbGUoJCQpeyQkLmNvdW50LnZhbHVlLT0xO3ZhciB0b0RlbGV0ZT0wPT09JCQuY291bnQudmFsdWU7aWYodG9EZWxldGUpe3J1bkRlc3RydWN0b3IoJCQpfX1mdW5jdGlvbiBkb3duY2FzdFBvaW50ZXIocHRyLHB0ckNsYXNzLGRlc2lyZWRDbGFzcyl7aWYocHRyQ2xhc3M9PT1kZXNpcmVkQ2xhc3Mpe3JldHVybiBwdHJ9aWYodW5kZWZpbmVkPT09ZGVzaXJlZENsYXNzLmJhc2VDbGFzcyl7cmV0dXJuIG51bGx9dmFyIHJ2PWRvd25jYXN0UG9pbnRlcihwdHIscHRyQ2xhc3MsZGVzaXJlZENsYXNzLmJhc2VDbGFzcyk7aWYocnY9PT1udWxsKXtyZXR1cm4gbnVsbH1yZXR1cm4gZGVzaXJlZENsYXNzLmRvd25jYXN0KHJ2KX12YXIgcmVnaXN0ZXJlZFBvaW50ZXJzPXt9O2Z1bmN0aW9uIGdldEluaGVyaXRlZEluc3RhbmNlQ291bnQoKXtyZXR1cm4gT2JqZWN0LmtleXMocmVnaXN0ZXJlZEluc3RhbmNlcykubGVuZ3RofWZ1bmN0aW9uIGdldExpdmVJbmhlcml0ZWRJbnN0YW5jZXMoKXt2YXIgcnY9W107Zm9yKHZhciBrIGluIHJlZ2lzdGVyZWRJbnN0YW5jZXMpe2lmKHJlZ2lzdGVyZWRJbnN0YW5jZXMuaGFzT3duUHJvcGVydHkoaykpe3J2LnB1c2gocmVnaXN0ZXJlZEluc3RhbmNlc1trXSl9fXJldHVybiBydn12YXIgZGVsZXRpb25RdWV1ZT1bXTtmdW5jdGlvbiBmbHVzaFBlbmRpbmdEZWxldGVzKCl7d2hpbGUoZGVsZXRpb25RdWV1ZS5sZW5ndGgpe3ZhciBvYmo9ZGVsZXRpb25RdWV1ZS5wb3AoKTtvYmouJCQuZGVsZXRlU2NoZWR1bGVkPWZhbHNlO29ialsiZGVsZXRlIl0oKX19dmFyIGRlbGF5RnVuY3Rpb249dW5kZWZpbmVkO2Z1bmN0aW9uIHNldERlbGF5RnVuY3Rpb24oZm4pe2RlbGF5RnVuY3Rpb249Zm47aWYoZGVsZXRpb25RdWV1ZS5sZW5ndGgmJmRlbGF5RnVuY3Rpb24pe2RlbGF5RnVuY3Rpb24oZmx1c2hQZW5kaW5nRGVsZXRlcyl9fWZ1bmN0aW9uIGluaXRfZW1iaW5kKCl7TW9kdWxlWyJnZXRJbmhlcml0ZWRJbnN0YW5jZUNvdW50Il09Z2V0SW5oZXJpdGVkSW5zdGFuY2VDb3VudDtNb2R1bGVbImdldExpdmVJbmhlcml0ZWRJbnN0YW5jZXMiXT1nZXRMaXZlSW5oZXJpdGVkSW5zdGFuY2VzO01vZHVsZVsiZmx1c2hQZW5kaW5nRGVsZXRlcyJdPWZsdXNoUGVuZGluZ0RlbGV0ZXM7TW9kdWxlWyJzZXREZWxheUZ1bmN0aW9uIl09c2V0RGVsYXlGdW5jdGlvbn12YXIgcmVnaXN0ZXJlZEluc3RhbmNlcz17fTtmdW5jdGlvbiBnZXRCYXNlc3RQb2ludGVyKGNsYXNzXyxwdHIpe2lmKHB0cj09PXVuZGVmaW5lZCl7dGhyb3dCaW5kaW5nRXJyb3IoInB0ciBzaG91bGQgbm90IGJlIHVuZGVmaW5lZCIpfXdoaWxlKGNsYXNzXy5iYXNlQ2xhc3Mpe3B0cj1jbGFzc18udXBjYXN0KHB0cik7Y2xhc3NfPWNsYXNzXy5iYXNlQ2xhc3N9cmV0dXJuIHB0cn1mdW5jdGlvbiBnZXRJbmhlcml0ZWRJbnN0YW5jZShjbGFzc18scHRyKXtwdHI9Z2V0QmFzZXN0UG9pbnRlcihjbGFzc18scHRyKTtyZXR1cm4gcmVnaXN0ZXJlZEluc3RhbmNlc1twdHJdfWZ1bmN0aW9uIG1ha2VDbGFzc0hhbmRsZShwcm90b3R5cGUscmVjb3JkKXtpZighcmVjb3JkLnB0clR5cGV8fCFyZWNvcmQucHRyKXt0aHJvd0ludGVybmFsRXJyb3IoIm1ha2VDbGFzc0hhbmRsZSByZXF1aXJlcyBwdHIgYW5kIHB0clR5cGUiKX12YXIgaGFzU21hcnRQdHJUeXBlPSEhcmVjb3JkLnNtYXJ0UHRyVHlwZTt2YXIgaGFzU21hcnRQdHI9ISFyZWNvcmQuc21hcnRQdHI7aWYoaGFzU21hcnRQdHJUeXBlIT09aGFzU21hcnRQdHIpe3Rocm93SW50ZXJuYWxFcnJvcigiQm90aCBzbWFydFB0clR5cGUgYW5kIHNtYXJ0UHRyIG11c3QgYmUgc3BlY2lmaWVkIil9cmVjb3JkLmNvdW50PXt2YWx1ZToxfTtyZXR1cm4gYXR0YWNoRmluYWxpemVyKE9iamVjdC5jcmVhdGUocHJvdG90eXBlLHskJDp7dmFsdWU6cmVjb3JkfX0pKX1mdW5jdGlvbiBSZWdpc3RlcmVkUG9pbnRlcl9mcm9tV2lyZVR5cGUocHRyKXt2YXIgcmF3UG9pbnRlcj10aGlzLmdldFBvaW50ZWUocHRyKTtpZighcmF3UG9pbnRlcil7dGhpcy5kZXN0cnVjdG9yKHB0cik7cmV0dXJuIG51bGx9dmFyIHJlZ2lzdGVyZWRJbnN0YW5jZT1nZXRJbmhlcml0ZWRJbnN0YW5jZSh0aGlzLnJlZ2lzdGVyZWRDbGFzcyxyYXdQb2ludGVyKTtpZih1bmRlZmluZWQhPT1yZWdpc3RlcmVkSW5zdGFuY2Upe2lmKDA9PT1yZWdpc3RlcmVkSW5zdGFuY2UuJCQuY291bnQudmFsdWUpe3JlZ2lzdGVyZWRJbnN0YW5jZS4kJC5wdHI9cmF3UG9pbnRlcjtyZWdpc3RlcmVkSW5zdGFuY2UuJCQuc21hcnRQdHI9cHRyO3JldHVybiByZWdpc3RlcmVkSW5zdGFuY2VbImNsb25lIl0oKX1lbHNle3ZhciBydj1yZWdpc3RlcmVkSW5zdGFuY2VbImNsb25lIl0oKTt0aGlzLmRlc3RydWN0b3IocHRyKTtyZXR1cm4gcnZ9fWZ1bmN0aW9uIG1ha2VEZWZhdWx0SGFuZGxlKCl7aWYodGhpcy5pc1NtYXJ0UG9pbnRlcil7cmV0dXJuIG1ha2VDbGFzc0hhbmRsZSh0aGlzLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZSx7cHRyVHlwZTp0aGlzLnBvaW50ZWVUeXBlLHB0cjpyYXdQb2ludGVyLHNtYXJ0UHRyVHlwZTp0aGlzLHNtYXJ0UHRyOnB0cn0pfWVsc2V7cmV0dXJuIG1ha2VDbGFzc0hhbmRsZSh0aGlzLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZSx7cHRyVHlwZTp0aGlzLHB0cjpwdHJ9KX19dmFyIGFjdHVhbFR5cGU9dGhpcy5yZWdpc3RlcmVkQ2xhc3MuZ2V0QWN0dWFsVHlwZShyYXdQb2ludGVyKTt2YXIgcmVnaXN0ZXJlZFBvaW50ZXJSZWNvcmQ9cmVnaXN0ZXJlZFBvaW50ZXJzW2FjdHVhbFR5cGVdO2lmKCFyZWdpc3RlcmVkUG9pbnRlclJlY29yZCl7cmV0dXJuIG1ha2VEZWZhdWx0SGFuZGxlLmNhbGwodGhpcyl9dmFyIHRvVHlwZTtpZih0aGlzLmlzQ29uc3Qpe3RvVHlwZT1yZWdpc3RlcmVkUG9pbnRlclJlY29yZC5jb25zdFBvaW50ZXJUeXBlfWVsc2V7dG9UeXBlPXJlZ2lzdGVyZWRQb2ludGVyUmVjb3JkLnBvaW50ZXJUeXBlfXZhciBkcD1kb3duY2FzdFBvaW50ZXIocmF3UG9pbnRlcix0aGlzLnJlZ2lzdGVyZWRDbGFzcyx0b1R5cGUucmVnaXN0ZXJlZENsYXNzKTtpZihkcD09PW51bGwpe3JldHVybiBtYWtlRGVmYXVsdEhhbmRsZS5jYWxsKHRoaXMpfWlmKHRoaXMuaXNTbWFydFBvaW50ZXIpe3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodG9UeXBlLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZSx7cHRyVHlwZTp0b1R5cGUscHRyOmRwLHNtYXJ0UHRyVHlwZTp0aGlzLHNtYXJ0UHRyOnB0cn0pfWVsc2V7cmV0dXJuIG1ha2VDbGFzc0hhbmRsZSh0b1R5cGUucmVnaXN0ZXJlZENsYXNzLmluc3RhbmNlUHJvdG90eXBlLHtwdHJUeXBlOnRvVHlwZSxwdHI6ZHB9KX19ZnVuY3Rpb24gYXR0YWNoRmluYWxpemVyKGhhbmRsZSl7aWYoInVuZGVmaW5lZCI9PT10eXBlb2YgRmluYWxpemF0aW9uUmVnaXN0cnkpe2F0dGFjaEZpbmFsaXplcj0oaGFuZGxlPT5oYW5kbGUpO3JldHVybiBoYW5kbGV9ZmluYWxpemF0aW9uUmVnaXN0cnk9bmV3IEZpbmFsaXphdGlvblJlZ2lzdHJ5KGluZm89PntyZWxlYXNlQ2xhc3NIYW5kbGUoaW5mby4kJCl9KTthdHRhY2hGaW5hbGl6ZXI9KGhhbmRsZT0+e3ZhciAkJD1oYW5kbGUuJCQ7dmFyIGhhc1NtYXJ0UHRyPSEhJCQuc21hcnRQdHI7aWYoaGFzU21hcnRQdHIpe3ZhciBpbmZvPXskJDokJH07ZmluYWxpemF0aW9uUmVnaXN0cnkucmVnaXN0ZXIoaGFuZGxlLGluZm8saGFuZGxlKX1yZXR1cm4gaGFuZGxlfSk7ZGV0YWNoRmluYWxpemVyPShoYW5kbGU9PmZpbmFsaXphdGlvblJlZ2lzdHJ5LnVucmVnaXN0ZXIoaGFuZGxlKSk7cmV0dXJuIGF0dGFjaEZpbmFsaXplcihoYW5kbGUpfWZ1bmN0aW9uIENsYXNzSGFuZGxlX2Nsb25lKCl7aWYoIXRoaXMuJCQucHRyKXt0aHJvd0luc3RhbmNlQWxyZWFkeURlbGV0ZWQodGhpcyl9aWYodGhpcy4kJC5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSl7dGhpcy4kJC5jb3VudC52YWx1ZSs9MTtyZXR1cm4gdGhpc31lbHNle3ZhciBjbG9uZT1hdHRhY2hGaW5hbGl6ZXIoT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykseyQkOnt2YWx1ZTpzaGFsbG93Q29weUludGVybmFsUG9pbnRlcih0aGlzLiQkKX19KSk7Y2xvbmUuJCQuY291bnQudmFsdWUrPTE7Y2xvbmUuJCQuZGVsZXRlU2NoZWR1bGVkPWZhbHNlO3JldHVybiBjbG9uZX19ZnVuY3Rpb24gQ2xhc3NIYW5kbGVfZGVsZXRlKCl7aWYoIXRoaXMuJCQucHRyKXt0aHJvd0luc3RhbmNlQWxyZWFkeURlbGV0ZWQodGhpcyl9aWYodGhpcy4kJC5kZWxldGVTY2hlZHVsZWQmJiF0aGlzLiQkLnByZXNlcnZlUG9pbnRlck9uRGVsZXRlKXt0aHJvd0JpbmRpbmdFcnJvcigiT2JqZWN0IGFscmVhZHkgc2NoZWR1bGVkIGZvciBkZWxldGlvbiIpfWRldGFjaEZpbmFsaXplcih0aGlzKTtyZWxlYXNlQ2xhc3NIYW5kbGUodGhpcy4kJCk7aWYoIXRoaXMuJCQucHJlc2VydmVQb2ludGVyT25EZWxldGUpe3RoaXMuJCQuc21hcnRQdHI9dW5kZWZpbmVkO3RoaXMuJCQucHRyPXVuZGVmaW5lZH19ZnVuY3Rpb24gQ2xhc3NIYW5kbGVfaXNEZWxldGVkKCl7cmV0dXJuIXRoaXMuJCQucHRyfWZ1bmN0aW9uIENsYXNzSGFuZGxlX2RlbGV0ZUxhdGVyKCl7aWYoIXRoaXMuJCQucHRyKXt0aHJvd0luc3RhbmNlQWxyZWFkeURlbGV0ZWQodGhpcyl9aWYodGhpcy4kJC5kZWxldGVTY2hlZHVsZWQmJiF0aGlzLiQkLnByZXNlcnZlUG9pbnRlck9uRGVsZXRlKXt0aHJvd0JpbmRpbmdFcnJvcigiT2JqZWN0IGFscmVhZHkgc2NoZWR1bGVkIGZvciBkZWxldGlvbiIpfWRlbGV0aW9uUXVldWUucHVzaCh0aGlzKTtpZihkZWxldGlvblF1ZXVlLmxlbmd0aD09PTEmJmRlbGF5RnVuY3Rpb24pe2RlbGF5RnVuY3Rpb24oZmx1c2hQZW5kaW5nRGVsZXRlcyl9dGhpcy4kJC5kZWxldGVTY2hlZHVsZWQ9dHJ1ZTtyZXR1cm4gdGhpc31mdW5jdGlvbiBpbml0X0NsYXNzSGFuZGxlKCl7Q2xhc3NIYW5kbGUucHJvdG90eXBlWyJpc0FsaWFzT2YiXT1DbGFzc0hhbmRsZV9pc0FsaWFzT2Y7Q2xhc3NIYW5kbGUucHJvdG90eXBlWyJjbG9uZSJdPUNsYXNzSGFuZGxlX2Nsb25lO0NsYXNzSGFuZGxlLnByb3RvdHlwZVsiZGVsZXRlIl09Q2xhc3NIYW5kbGVfZGVsZXRlO0NsYXNzSGFuZGxlLnByb3RvdHlwZVsiaXNEZWxldGVkIl09Q2xhc3NIYW5kbGVfaXNEZWxldGVkO0NsYXNzSGFuZGxlLnByb3RvdHlwZVsiZGVsZXRlTGF0ZXIiXT1DbGFzc0hhbmRsZV9kZWxldGVMYXRlcn1mdW5jdGlvbiBDbGFzc0hhbmRsZSgpe31mdW5jdGlvbiBlbnN1cmVPdmVybG9hZFRhYmxlKHByb3RvLG1ldGhvZE5hbWUsaHVtYW5OYW1lKXtpZih1bmRlZmluZWQ9PT1wcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlKXt2YXIgcHJldkZ1bmM9cHJvdG9bbWV0aG9kTmFtZV07cHJvdG9bbWV0aG9kTmFtZV09ZnVuY3Rpb24oKXtpZighcHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZS5oYXNPd25Qcm9wZXJ0eShhcmd1bWVudHMubGVuZ3RoKSl7dGhyb3dCaW5kaW5nRXJyb3IoIkZ1bmN0aW9uICciK2h1bWFuTmFtZSsiJyBjYWxsZWQgd2l0aCBhbiBpbnZhbGlkIG51bWJlciBvZiBhcmd1bWVudHMgKCIrYXJndW1lbnRzLmxlbmd0aCsiKSAtIGV4cGVjdHMgb25lIG9mICgiK3Byb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGUrIikhIil9cmV0dXJuIHByb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGVbYXJndW1lbnRzLmxlbmd0aF0uYXBwbHkodGhpcyxhcmd1bWVudHMpfTtwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlPVtdO3Byb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGVbcHJldkZ1bmMuYXJnQ291bnRdPXByZXZGdW5jfX1mdW5jdGlvbiBleHBvc2VQdWJsaWNTeW1ib2wobmFtZSx2YWx1ZSxudW1Bcmd1bWVudHMpe2lmKE1vZHVsZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSl7aWYodW5kZWZpbmVkPT09bnVtQXJndW1lbnRzfHx1bmRlZmluZWQhPT1Nb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZSYmdW5kZWZpbmVkIT09TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGVbbnVtQXJndW1lbnRzXSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCByZWdpc3RlciBwdWJsaWMgbmFtZSAnIituYW1lKyInIHR3aWNlIil9ZW5zdXJlT3ZlcmxvYWRUYWJsZShNb2R1bGUsbmFtZSxuYW1lKTtpZihNb2R1bGUuaGFzT3duUHJvcGVydHkobnVtQXJndW1lbnRzKSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCByZWdpc3RlciBtdWx0aXBsZSBvdmVybG9hZHMgb2YgYSBmdW5jdGlvbiB3aXRoIHRoZSBzYW1lIG51bWJlciBvZiBhcmd1bWVudHMgKCIrbnVtQXJndW1lbnRzKyIpISIpfU1vZHVsZVtuYW1lXS5vdmVybG9hZFRhYmxlW251bUFyZ3VtZW50c109dmFsdWV9ZWxzZXtNb2R1bGVbbmFtZV09dmFsdWU7aWYodW5kZWZpbmVkIT09bnVtQXJndW1lbnRzKXtNb2R1bGVbbmFtZV0ubnVtQXJndW1lbnRzPW51bUFyZ3VtZW50c319fWZ1bmN0aW9uIFJlZ2lzdGVyZWRDbGFzcyhuYW1lLGNvbnN0cnVjdG9yLGluc3RhbmNlUHJvdG90eXBlLHJhd0Rlc3RydWN0b3IsYmFzZUNsYXNzLGdldEFjdHVhbFR5cGUsdXBjYXN0LGRvd25jYXN0KXt0aGlzLm5hbWU9bmFtZTt0aGlzLmNvbnN0cnVjdG9yPWNvbnN0cnVjdG9yO3RoaXMuaW5zdGFuY2VQcm90b3R5cGU9aW5zdGFuY2VQcm90b3R5cGU7dGhpcy5yYXdEZXN0cnVjdG9yPXJhd0Rlc3RydWN0b3I7dGhpcy5iYXNlQ2xhc3M9YmFzZUNsYXNzO3RoaXMuZ2V0QWN0dWFsVHlwZT1nZXRBY3R1YWxUeXBlO3RoaXMudXBjYXN0PXVwY2FzdDt0aGlzLmRvd25jYXN0PWRvd25jYXN0O3RoaXMucHVyZVZpcnR1YWxGdW5jdGlvbnM9W119ZnVuY3Rpb24gdXBjYXN0UG9pbnRlcihwdHIscHRyQ2xhc3MsZGVzaXJlZENsYXNzKXt3aGlsZShwdHJDbGFzcyE9PWRlc2lyZWRDbGFzcyl7aWYoIXB0ckNsYXNzLnVwY2FzdCl7dGhyb3dCaW5kaW5nRXJyb3IoIkV4cGVjdGVkIG51bGwgb3IgaW5zdGFuY2Ugb2YgIitkZXNpcmVkQ2xhc3MubmFtZSsiLCBnb3QgYW4gaW5zdGFuY2Ugb2YgIitwdHJDbGFzcy5uYW1lKX1wdHI9cHRyQ2xhc3MudXBjYXN0KHB0cik7cHRyQ2xhc3M9cHRyQ2xhc3MuYmFzZUNsYXNzfXJldHVybiBwdHJ9ZnVuY3Rpb24gY29uc3ROb1NtYXJ0UHRyUmF3UG9pbnRlclRvV2lyZVR5cGUoZGVzdHJ1Y3RvcnMsaGFuZGxlKXtpZihoYW5kbGU9PT1udWxsKXtpZih0aGlzLmlzUmVmZXJlbmNlKXt0aHJvd0JpbmRpbmdFcnJvcigibnVsbCBpcyBub3QgYSB2YWxpZCAiK3RoaXMubmFtZSl9cmV0dXJuIDB9aWYoIWhhbmRsZS4kJCl7dGhyb3dCaW5kaW5nRXJyb3IoJ0Nhbm5vdCBwYXNzICInK19lbWJpbmRfcmVwcihoYW5kbGUpKyciIGFzIGEgJyt0aGlzLm5hbWUpfWlmKCFoYW5kbGUuJCQucHRyKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3MgZGVsZXRlZCBvYmplY3QgYXMgYSBwb2ludGVyIG9mIHR5cGUgIit0aGlzLm5hbWUpfXZhciBoYW5kbGVDbGFzcz1oYW5kbGUuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3M7dmFyIHB0cj11cGNhc3RQb2ludGVyKGhhbmRsZS4kJC5wdHIsaGFuZGxlQ2xhc3MsdGhpcy5yZWdpc3RlcmVkQ2xhc3MpO3JldHVybiBwdHJ9ZnVuY3Rpb24gZ2VuZXJpY1BvaW50ZXJUb1dpcmVUeXBlKGRlc3RydWN0b3JzLGhhbmRsZSl7dmFyIHB0cjtpZihoYW5kbGU9PT1udWxsKXtpZih0aGlzLmlzUmVmZXJlbmNlKXt0aHJvd0JpbmRpbmdFcnJvcigibnVsbCBpcyBub3QgYSB2YWxpZCAiK3RoaXMubmFtZSl9aWYodGhpcy5pc1NtYXJ0UG9pbnRlcil7cHRyPXRoaXMucmF3Q29uc3RydWN0b3IoKTtpZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2godGhpcy5yYXdEZXN0cnVjdG9yLHB0cil9cmV0dXJuIHB0cn1lbHNle3JldHVybiAwfX1pZighaGFuZGxlLiQkKXt0aHJvd0JpbmRpbmdFcnJvcignQ2Fubm90IHBhc3MgIicrX2VtYmluZF9yZXByKGhhbmRsZSkrJyIgYXMgYSAnK3RoaXMubmFtZSl9aWYoIWhhbmRsZS4kJC5wdHIpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcGFzcyBkZWxldGVkIG9iamVjdCBhcyBhIHBvaW50ZXIgb2YgdHlwZSAiK3RoaXMubmFtZSl9aWYoIXRoaXMuaXNDb25zdCYmaGFuZGxlLiQkLnB0clR5cGUuaXNDb25zdCl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBjb252ZXJ0IGFyZ3VtZW50IG9mIHR5cGUgIisoaGFuZGxlLiQkLnNtYXJ0UHRyVHlwZT9oYW5kbGUuJCQuc21hcnRQdHJUeXBlLm5hbWU6aGFuZGxlLiQkLnB0clR5cGUubmFtZSkrIiB0byBwYXJhbWV0ZXIgdHlwZSAiK3RoaXMubmFtZSl9dmFyIGhhbmRsZUNsYXNzPWhhbmRsZS4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzcztwdHI9dXBjYXN0UG9pbnRlcihoYW5kbGUuJCQucHRyLGhhbmRsZUNsYXNzLHRoaXMucmVnaXN0ZXJlZENsYXNzKTtpZih0aGlzLmlzU21hcnRQb2ludGVyKXtpZih1bmRlZmluZWQ9PT1oYW5kbGUuJCQuc21hcnRQdHIpe3Rocm93QmluZGluZ0Vycm9yKCJQYXNzaW5nIHJhdyBwb2ludGVyIHRvIHNtYXJ0IHBvaW50ZXIgaXMgaWxsZWdhbCIpfXN3aXRjaCh0aGlzLnNoYXJpbmdQb2xpY3kpe2Nhc2UgMDppZihoYW5kbGUuJCQuc21hcnRQdHJUeXBlPT09dGhpcyl7cHRyPWhhbmRsZS4kJC5zbWFydFB0cn1lbHNle3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgY29udmVydCBhcmd1bWVudCBvZiB0eXBlICIrKGhhbmRsZS4kJC5zbWFydFB0clR5cGU/aGFuZGxlLiQkLnNtYXJ0UHRyVHlwZS5uYW1lOmhhbmRsZS4kJC5wdHJUeXBlLm5hbWUpKyIgdG8gcGFyYW1ldGVyIHR5cGUgIit0aGlzLm5hbWUpfWJyZWFrO2Nhc2UgMTpwdHI9aGFuZGxlLiQkLnNtYXJ0UHRyO2JyZWFrO2Nhc2UgMjppZihoYW5kbGUuJCQuc21hcnRQdHJUeXBlPT09dGhpcyl7cHRyPWhhbmRsZS4kJC5zbWFydFB0cn1lbHNle3ZhciBjbG9uZWRIYW5kbGU9aGFuZGxlWyJjbG9uZSJdKCk7cHRyPXRoaXMucmF3U2hhcmUocHRyLEVtdmFsLnRvSGFuZGxlKGZ1bmN0aW9uKCl7Y2xvbmVkSGFuZGxlWyJkZWxldGUiXSgpfSkpO2lmKGRlc3RydWN0b3JzIT09bnVsbCl7ZGVzdHJ1Y3RvcnMucHVzaCh0aGlzLnJhd0Rlc3RydWN0b3IscHRyKX19YnJlYWs7ZGVmYXVsdDp0aHJvd0JpbmRpbmdFcnJvcigiVW5zdXBwb3J0aW5nIHNoYXJpbmcgcG9saWN5Iil9fXJldHVybiBwdHJ9ZnVuY3Rpb24gbm9uQ29uc3ROb1NtYXJ0UHRyUmF3UG9pbnRlclRvV2lyZVR5cGUoZGVzdHJ1Y3RvcnMsaGFuZGxlKXtpZihoYW5kbGU9PT1udWxsKXtpZih0aGlzLmlzUmVmZXJlbmNlKXt0aHJvd0JpbmRpbmdFcnJvcigibnVsbCBpcyBub3QgYSB2YWxpZCAiK3RoaXMubmFtZSl9cmV0dXJuIDB9aWYoIWhhbmRsZS4kJCl7dGhyb3dCaW5kaW5nRXJyb3IoJ0Nhbm5vdCBwYXNzICInK19lbWJpbmRfcmVwcihoYW5kbGUpKyciIGFzIGEgJyt0aGlzLm5hbWUpfWlmKCFoYW5kbGUuJCQucHRyKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3MgZGVsZXRlZCBvYmplY3QgYXMgYSBwb2ludGVyIG9mIHR5cGUgIit0aGlzLm5hbWUpfWlmKGhhbmRsZS4kJC5wdHJUeXBlLmlzQ29uc3Qpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgY29udmVydCBhcmd1bWVudCBvZiB0eXBlICIraGFuZGxlLiQkLnB0clR5cGUubmFtZSsiIHRvIHBhcmFtZXRlciB0eXBlICIrdGhpcy5uYW1lKX12YXIgaGFuZGxlQ2xhc3M9aGFuZGxlLiQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzO3ZhciBwdHI9dXBjYXN0UG9pbnRlcihoYW5kbGUuJCQucHRyLGhhbmRsZUNsYXNzLHRoaXMucmVnaXN0ZXJlZENsYXNzKTtyZXR1cm4gcHRyfWZ1bmN0aW9uIHNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShHUk9XQUJMRV9IRUFQX1UzMigpW3BvaW50ZXI+PjJdKX1mdW5jdGlvbiBSZWdpc3RlcmVkUG9pbnRlcl9nZXRQb2ludGVlKHB0cil7aWYodGhpcy5yYXdHZXRQb2ludGVlKXtwdHI9dGhpcy5yYXdHZXRQb2ludGVlKHB0cil9cmV0dXJuIHB0cn1mdW5jdGlvbiBSZWdpc3RlcmVkUG9pbnRlcl9kZXN0cnVjdG9yKHB0cil7aWYodGhpcy5yYXdEZXN0cnVjdG9yKXt0aGlzLnJhd0Rlc3RydWN0b3IocHRyKX19ZnVuY3Rpb24gUmVnaXN0ZXJlZFBvaW50ZXJfZGVsZXRlT2JqZWN0KGhhbmRsZSl7aWYoaGFuZGxlIT09bnVsbCl7aGFuZGxlWyJkZWxldGUiXSgpfX1mdW5jdGlvbiBpbml0X1JlZ2lzdGVyZWRQb2ludGVyKCl7UmVnaXN0ZXJlZFBvaW50ZXIucHJvdG90eXBlLmdldFBvaW50ZWU9UmVnaXN0ZXJlZFBvaW50ZXJfZ2V0UG9pbnRlZTtSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGUuZGVzdHJ1Y3Rvcj1SZWdpc3RlcmVkUG9pbnRlcl9kZXN0cnVjdG9yO1JlZ2lzdGVyZWRQb2ludGVyLnByb3RvdHlwZVsiYXJnUGFja0FkdmFuY2UiXT04O1JlZ2lzdGVyZWRQb2ludGVyLnByb3RvdHlwZVsicmVhZFZhbHVlRnJvbVBvaW50ZXIiXT1zaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcjtSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGVbImRlbGV0ZU9iamVjdCJdPVJlZ2lzdGVyZWRQb2ludGVyX2RlbGV0ZU9iamVjdDtSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGVbImZyb21XaXJlVHlwZSJdPVJlZ2lzdGVyZWRQb2ludGVyX2Zyb21XaXJlVHlwZX1mdW5jdGlvbiBSZWdpc3RlcmVkUG9pbnRlcihuYW1lLHJlZ2lzdGVyZWRDbGFzcyxpc1JlZmVyZW5jZSxpc0NvbnN0LGlzU21hcnRQb2ludGVyLHBvaW50ZWVUeXBlLHNoYXJpbmdQb2xpY3kscmF3R2V0UG9pbnRlZSxyYXdDb25zdHJ1Y3RvcixyYXdTaGFyZSxyYXdEZXN0cnVjdG9yKXt0aGlzLm5hbWU9bmFtZTt0aGlzLnJlZ2lzdGVyZWRDbGFzcz1yZWdpc3RlcmVkQ2xhc3M7dGhpcy5pc1JlZmVyZW5jZT1pc1JlZmVyZW5jZTt0aGlzLmlzQ29uc3Q9aXNDb25zdDt0aGlzLmlzU21hcnRQb2ludGVyPWlzU21hcnRQb2ludGVyO3RoaXMucG9pbnRlZVR5cGU9cG9pbnRlZVR5cGU7dGhpcy5zaGFyaW5nUG9saWN5PXNoYXJpbmdQb2xpY3k7dGhpcy5yYXdHZXRQb2ludGVlPXJhd0dldFBvaW50ZWU7dGhpcy5yYXdDb25zdHJ1Y3Rvcj1yYXdDb25zdHJ1Y3Rvcjt0aGlzLnJhd1NoYXJlPXJhd1NoYXJlO3RoaXMucmF3RGVzdHJ1Y3Rvcj1yYXdEZXN0cnVjdG9yO2lmKCFpc1NtYXJ0UG9pbnRlciYmcmVnaXN0ZXJlZENsYXNzLmJhc2VDbGFzcz09PXVuZGVmaW5lZCl7aWYoaXNDb25zdCl7dGhpc1sidG9XaXJlVHlwZSJdPWNvbnN0Tm9TbWFydFB0clJhd1BvaW50ZXJUb1dpcmVUeXBlO3RoaXMuZGVzdHJ1Y3RvckZ1bmN0aW9uPW51bGx9ZWxzZXt0aGlzWyJ0b1dpcmVUeXBlIl09bm9uQ29uc3ROb1NtYXJ0UHRyUmF3UG9pbnRlclRvV2lyZVR5cGU7dGhpcy5kZXN0cnVjdG9yRnVuY3Rpb249bnVsbH19ZWxzZXt0aGlzWyJ0b1dpcmVUeXBlIl09Z2VuZXJpY1BvaW50ZXJUb1dpcmVUeXBlfX1mdW5jdGlvbiByZXBsYWNlUHVibGljU3ltYm9sKG5hbWUsdmFsdWUsbnVtQXJndW1lbnRzKXtpZighTW9kdWxlLmhhc093blByb3BlcnR5KG5hbWUpKXt0aHJvd0ludGVybmFsRXJyb3IoIlJlcGxhY2luZyBub25leGlzdGFudCBwdWJsaWMgc3ltYm9sIil9aWYodW5kZWZpbmVkIT09TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGUmJnVuZGVmaW5lZCE9PW51bUFyZ3VtZW50cyl7TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGVbbnVtQXJndW1lbnRzXT12YWx1ZX1lbHNle01vZHVsZVtuYW1lXT12YWx1ZTtNb2R1bGVbbmFtZV0uYXJnQ291bnQ9bnVtQXJndW1lbnRzfX1mdW5jdGlvbiBkeW5DYWxsTGVnYWN5KHNpZyxwdHIsYXJncyl7dmFyIGY9TW9kdWxlWyJkeW5DYWxsXyIrc2lnXTtyZXR1cm4gYXJncyYmYXJncy5sZW5ndGg/Zi5hcHBseShudWxsLFtwdHJdLmNvbmNhdChhcmdzKSk6Zi5jYWxsKG51bGwscHRyKX1mdW5jdGlvbiBkeW5DYWxsKHNpZyxwdHIsYXJncyl7aWYoc2lnLmluY2x1ZGVzKCJqIikpe3JldHVybiBkeW5DYWxsTGVnYWN5KHNpZyxwdHIsYXJncyl9cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KHB0cikuYXBwbHkobnVsbCxhcmdzKX1mdW5jdGlvbiBnZXREeW5DYWxsZXIoc2lnLHB0cil7dmFyIGFyZ0NhY2hlPVtdO3JldHVybiBmdW5jdGlvbigpe2FyZ0NhY2hlLmxlbmd0aD0wO09iamVjdC5hc3NpZ24oYXJnQ2FjaGUsYXJndW1lbnRzKTtyZXR1cm4gZHluQ2FsbChzaWcscHRyLGFyZ0NhY2hlKX19ZnVuY3Rpb24gZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oc2lnbmF0dXJlLHJhd0Z1bmN0aW9uKXtzaWduYXR1cmU9cmVhZExhdGluMVN0cmluZyhzaWduYXR1cmUpO2Z1bmN0aW9uIG1ha2VEeW5DYWxsZXIoKXtpZihzaWduYXR1cmUuaW5jbHVkZXMoImoiKSl7cmV0dXJuIGdldER5bkNhbGxlcihzaWduYXR1cmUscmF3RnVuY3Rpb24pfXJldHVybiBnZXRXYXNtVGFibGVFbnRyeShyYXdGdW5jdGlvbil9dmFyIGZwPW1ha2VEeW5DYWxsZXIoKTtpZih0eXBlb2YgZnAhPSJmdW5jdGlvbiIpe3Rocm93QmluZGluZ0Vycm9yKCJ1bmtub3duIGZ1bmN0aW9uIHBvaW50ZXIgd2l0aCBzaWduYXR1cmUgIitzaWduYXR1cmUrIjogIityYXdGdW5jdGlvbil9cmV0dXJuIGZwfXZhciBVbmJvdW5kVHlwZUVycm9yPXVuZGVmaW5lZDtmdW5jdGlvbiBnZXRUeXBlTmFtZSh0eXBlKXt2YXIgcHRyPV9fX2dldFR5cGVOYW1lKHR5cGUpO3ZhciBydj1yZWFkTGF0aW4xU3RyaW5nKHB0cik7X2ZyZWUocHRyKTtyZXR1cm4gcnZ9ZnVuY3Rpb24gdGhyb3dVbmJvdW5kVHlwZUVycm9yKG1lc3NhZ2UsdHlwZXMpe3ZhciB1bmJvdW5kVHlwZXM9W107dmFyIHNlZW49e307ZnVuY3Rpb24gdmlzaXQodHlwZSl7aWYoc2Vlblt0eXBlXSl7cmV0dXJufWlmKHJlZ2lzdGVyZWRUeXBlc1t0eXBlXSl7cmV0dXJufWlmKHR5cGVEZXBlbmRlbmNpZXNbdHlwZV0pe3R5cGVEZXBlbmRlbmNpZXNbdHlwZV0uZm9yRWFjaCh2aXNpdCk7cmV0dXJufXVuYm91bmRUeXBlcy5wdXNoKHR5cGUpO3NlZW5bdHlwZV09dHJ1ZX10eXBlcy5mb3JFYWNoKHZpc2l0KTt0aHJvdyBuZXcgVW5ib3VuZFR5cGVFcnJvcihtZXNzYWdlKyI6ICIrdW5ib3VuZFR5cGVzLm1hcChnZXRUeXBlTmFtZSkuam9pbihbIiwgIl0pKX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9jbGFzcyhyYXdUeXBlLHJhd1BvaW50ZXJUeXBlLHJhd0NvbnN0UG9pbnRlclR5cGUsYmFzZUNsYXNzUmF3VHlwZSxnZXRBY3R1YWxUeXBlU2lnbmF0dXJlLGdldEFjdHVhbFR5cGUsdXBjYXN0U2lnbmF0dXJlLHVwY2FzdCxkb3duY2FzdFNpZ25hdHVyZSxkb3duY2FzdCxuYW1lLGRlc3RydWN0b3JTaWduYXR1cmUscmF3RGVzdHJ1Y3Rvcil7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO2dldEFjdHVhbFR5cGU9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZ2V0QWN0dWFsVHlwZVNpZ25hdHVyZSxnZXRBY3R1YWxUeXBlKTtpZih1cGNhc3Qpe3VwY2FzdD1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbih1cGNhc3RTaWduYXR1cmUsdXBjYXN0KX1pZihkb3duY2FzdCl7ZG93bmNhc3Q9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZG93bmNhc3RTaWduYXR1cmUsZG93bmNhc3QpfXJhd0Rlc3RydWN0b3I9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZGVzdHJ1Y3RvclNpZ25hdHVyZSxyYXdEZXN0cnVjdG9yKTt2YXIgbGVnYWxGdW5jdGlvbk5hbWU9bWFrZUxlZ2FsRnVuY3Rpb25OYW1lKG5hbWUpO2V4cG9zZVB1YmxpY1N5bWJvbChsZWdhbEZ1bmN0aW9uTmFtZSxmdW5jdGlvbigpe3Rocm93VW5ib3VuZFR5cGVFcnJvcigiQ2Fubm90IGNvbnN0cnVjdCAiK25hbWUrIiBkdWUgdG8gdW5ib3VuZCB0eXBlcyIsW2Jhc2VDbGFzc1Jhd1R5cGVdKX0pO3doZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkKFtyYXdUeXBlLHJhd1BvaW50ZXJUeXBlLHJhd0NvbnN0UG9pbnRlclR5cGVdLGJhc2VDbGFzc1Jhd1R5cGU/W2Jhc2VDbGFzc1Jhd1R5cGVdOltdLGZ1bmN0aW9uKGJhc2Upe2Jhc2U9YmFzZVswXTt2YXIgYmFzZUNsYXNzO3ZhciBiYXNlUHJvdG90eXBlO2lmKGJhc2VDbGFzc1Jhd1R5cGUpe2Jhc2VDbGFzcz1iYXNlLnJlZ2lzdGVyZWRDbGFzcztiYXNlUHJvdG90eXBlPWJhc2VDbGFzcy5pbnN0YW5jZVByb3RvdHlwZX1lbHNle2Jhc2VQcm90b3R5cGU9Q2xhc3NIYW5kbGUucHJvdG90eXBlfXZhciBjb25zdHJ1Y3Rvcj1jcmVhdGVOYW1lZEZ1bmN0aW9uKGxlZ2FsRnVuY3Rpb25OYW1lLGZ1bmN0aW9uKCl7aWYoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpIT09aW5zdGFuY2VQcm90b3R5cGUpe3Rocm93IG5ldyBCaW5kaW5nRXJyb3IoIlVzZSAnbmV3JyB0byBjb25zdHJ1Y3QgIituYW1lKX1pZih1bmRlZmluZWQ9PT1yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keSl7dGhyb3cgbmV3IEJpbmRpbmdFcnJvcihuYW1lKyIgaGFzIG5vIGFjY2Vzc2libGUgY29uc3RydWN0b3IiKX12YXIgYm9keT1yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keVthcmd1bWVudHMubGVuZ3RoXTtpZih1bmRlZmluZWQ9PT1ib2R5KXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKCJUcmllZCB0byBpbnZva2UgY3RvciBvZiAiK25hbWUrIiB3aXRoIGludmFsaWQgbnVtYmVyIG9mIHBhcmFtZXRlcnMgKCIrYXJndW1lbnRzLmxlbmd0aCsiKSAtIGV4cGVjdGVkICgiK09iamVjdC5rZXlzKHJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5KS50b1N0cmluZygpKyIpIHBhcmFtZXRlcnMgaW5zdGVhZCEiKX1yZXR1cm4gYm9keS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9KTt2YXIgaW5zdGFuY2VQcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiYXNlUHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6Y29uc3RydWN0b3J9fSk7Y29uc3RydWN0b3IucHJvdG90eXBlPWluc3RhbmNlUHJvdG90eXBlO3ZhciByZWdpc3RlcmVkQ2xhc3M9bmV3IFJlZ2lzdGVyZWRDbGFzcyhuYW1lLGNvbnN0cnVjdG9yLGluc3RhbmNlUHJvdG90eXBlLHJhd0Rlc3RydWN0b3IsYmFzZUNsYXNzLGdldEFjdHVhbFR5cGUsdXBjYXN0LGRvd25jYXN0KTt2YXIgcmVmZXJlbmNlQ29udmVydGVyPW5ldyBSZWdpc3RlcmVkUG9pbnRlcihuYW1lLHJlZ2lzdGVyZWRDbGFzcyx0cnVlLGZhbHNlLGZhbHNlKTt2YXIgcG9pbnRlckNvbnZlcnRlcj1uZXcgUmVnaXN0ZXJlZFBvaW50ZXIobmFtZSsiKiIscmVnaXN0ZXJlZENsYXNzLGZhbHNlLGZhbHNlLGZhbHNlKTt2YXIgY29uc3RQb2ludGVyQ29udmVydGVyPW5ldyBSZWdpc3RlcmVkUG9pbnRlcihuYW1lKyIgY29uc3QqIixyZWdpc3RlcmVkQ2xhc3MsZmFsc2UsdHJ1ZSxmYWxzZSk7cmVnaXN0ZXJlZFBvaW50ZXJzW3Jhd1R5cGVdPXtwb2ludGVyVHlwZTpwb2ludGVyQ29udmVydGVyLGNvbnN0UG9pbnRlclR5cGU6Y29uc3RQb2ludGVyQ29udmVydGVyfTtyZXBsYWNlUHVibGljU3ltYm9sKGxlZ2FsRnVuY3Rpb25OYW1lLGNvbnN0cnVjdG9yKTtyZXR1cm5bcmVmZXJlbmNlQ29udmVydGVyLHBvaW50ZXJDb252ZXJ0ZXIsY29uc3RQb2ludGVyQ29udmVydGVyXX0pfWZ1bmN0aW9uIGhlYXAzMlZlY3RvclRvQXJyYXkoY291bnQsZmlyc3RFbGVtZW50KXt2YXIgYXJyYXk9W107Zm9yKHZhciBpPTA7aTxjb3VudDtpKyspe2FycmF5LnB1c2goR1JPV0FCTEVfSEVBUF9JMzIoKVsoZmlyc3RFbGVtZW50Pj4yKStpXSl9cmV0dXJuIGFycmF5fWZ1bmN0aW9uIHJ1bkRlc3RydWN0b3JzKGRlc3RydWN0b3JzKXt3aGlsZShkZXN0cnVjdG9ycy5sZW5ndGgpe3ZhciBwdHI9ZGVzdHJ1Y3RvcnMucG9wKCk7dmFyIGRlbD1kZXN0cnVjdG9ycy5wb3AoKTtkZWwocHRyKX19ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfY29uc3RydWN0b3IocmF3Q2xhc3NUeXBlLGFyZ0NvdW50LHJhd0FyZ1R5cGVzQWRkcixpbnZva2VyU2lnbmF0dXJlLGludm9rZXIscmF3Q29uc3RydWN0b3Ipe2Fzc2VydChhcmdDb3VudD4wKTt2YXIgcmF3QXJnVHlwZXM9aGVhcDMyVmVjdG9yVG9BcnJheShhcmdDb3VudCxyYXdBcmdUeXBlc0FkZHIpO2ludm9rZXI9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oaW52b2tlclNpZ25hdHVyZSxpbnZva2VyKTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxbcmF3Q2xhc3NUeXBlXSxmdW5jdGlvbihjbGFzc1R5cGUpe2NsYXNzVHlwZT1jbGFzc1R5cGVbMF07dmFyIGh1bWFuTmFtZT0iY29uc3RydWN0b3IgIitjbGFzc1R5cGUubmFtZTtpZih1bmRlZmluZWQ9PT1jbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHkpe2NsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keT1bXX1pZih1bmRlZmluZWQhPT1jbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHlbYXJnQ291bnQtMV0pe3Rocm93IG5ldyBCaW5kaW5nRXJyb3IoIkNhbm5vdCByZWdpc3RlciBtdWx0aXBsZSBjb25zdHJ1Y3RvcnMgd2l0aCBpZGVudGljYWwgbnVtYmVyIG9mIHBhcmFtZXRlcnMgKCIrKGFyZ0NvdW50LTEpKyIpIGZvciBjbGFzcyAnIitjbGFzc1R5cGUubmFtZSsiJyEgT3ZlcmxvYWQgcmVzb2x1dGlvbiBpcyBjdXJyZW50bHkgb25seSBwZXJmb3JtZWQgdXNpbmcgdGhlIHBhcmFtZXRlciBjb3VudCwgbm90IGFjdHVhbCB0eXBlIGluZm8hIil9Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5W2FyZ0NvdW50LTFdPSgoKT0+e3Rocm93VW5ib3VuZFR5cGVFcnJvcigiQ2Fubm90IGNvbnN0cnVjdCAiK2NsYXNzVHlwZS5uYW1lKyIgZHVlIHRvIHVuYm91bmQgdHlwZXMiLHJhd0FyZ1R5cGVzKX0pO3doZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkKFtdLHJhd0FyZ1R5cGVzLGZ1bmN0aW9uKGFyZ1R5cGVzKXthcmdUeXBlcy5zcGxpY2UoMSwwLG51bGwpO2NsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keVthcmdDb3VudC0xXT1jcmFmdEludm9rZXJGdW5jdGlvbihodW1hbk5hbWUsYXJnVHlwZXMsbnVsbCxpbnZva2VyLHJhd0NvbnN0cnVjdG9yKTtyZXR1cm5bXX0pO3JldHVybltdfSl9ZnVuY3Rpb24gbmV3Xyhjb25zdHJ1Y3Rvcixhcmd1bWVudExpc3Qpe2lmKCEoY29uc3RydWN0b3IgaW5zdGFuY2VvZiBGdW5jdGlvbikpe3Rocm93IG5ldyBUeXBlRXJyb3IoIm5ld18gY2FsbGVkIHdpdGggY29uc3RydWN0b3IgdHlwZSAiK3R5cGVvZiBjb25zdHJ1Y3RvcisiIHdoaWNoIGlzIG5vdCBhIGZ1bmN0aW9uIil9dmFyIGR1bW15PWNyZWF0ZU5hbWVkRnVuY3Rpb24oY29uc3RydWN0b3IubmFtZXx8InVua25vd25GdW5jdGlvbk5hbWUiLGZ1bmN0aW9uKCl7fSk7ZHVtbXkucHJvdG90eXBlPWNvbnN0cnVjdG9yLnByb3RvdHlwZTt2YXIgb2JqPW5ldyBkdW1teTt2YXIgcj1jb25zdHJ1Y3Rvci5hcHBseShvYmosYXJndW1lbnRMaXN0KTtyZXR1cm4gciBpbnN0YW5jZW9mIE9iamVjdD9yOm9ian1mdW5jdGlvbiBjcmFmdEludm9rZXJGdW5jdGlvbihodW1hbk5hbWUsYXJnVHlwZXMsY2xhc3NUeXBlLGNwcEludm9rZXJGdW5jLGNwcFRhcmdldEZ1bmMpe3ZhciBhcmdDb3VudD1hcmdUeXBlcy5sZW5ndGg7aWYoYXJnQ291bnQ8Mil7dGhyb3dCaW5kaW5nRXJyb3IoImFyZ1R5cGVzIGFycmF5IHNpemUgbWlzbWF0Y2ghIE11c3QgYXQgbGVhc3QgZ2V0IHJldHVybiB2YWx1ZSBhbmQgJ3RoaXMnIHR5cGVzISIpfXZhciBpc0NsYXNzTWV0aG9kRnVuYz1hcmdUeXBlc1sxXSE9PW51bGwmJmNsYXNzVHlwZSE9PW51bGw7dmFyIG5lZWRzRGVzdHJ1Y3RvclN0YWNrPWZhbHNlO2Zvcih2YXIgaT0xO2k8YXJnVHlwZXMubGVuZ3RoOysraSl7aWYoYXJnVHlwZXNbaV0hPT1udWxsJiZhcmdUeXBlc1tpXS5kZXN0cnVjdG9yRnVuY3Rpb249PT11bmRlZmluZWQpe25lZWRzRGVzdHJ1Y3RvclN0YWNrPXRydWU7YnJlYWt9fXZhciByZXR1cm5zPWFyZ1R5cGVzWzBdLm5hbWUhPT0idm9pZCI7dmFyIGFyZ3NMaXN0PSIiO3ZhciBhcmdzTGlzdFdpcmVkPSIiO2Zvcih2YXIgaT0wO2k8YXJnQ291bnQtMjsrK2kpe2FyZ3NMaXN0Kz0oaSE9PTA/IiwgIjoiIikrImFyZyIraTthcmdzTGlzdFdpcmVkKz0oaSE9PTA/IiwgIjoiIikrImFyZyIraSsiV2lyZWQifXZhciBpbnZva2VyRm5Cb2R5PSJyZXR1cm4gZnVuY3Rpb24gIittYWtlTGVnYWxGdW5jdGlvbk5hbWUoaHVtYW5OYW1lKSsiKCIrYXJnc0xpc3QrIikge1xuIisiaWYgKGFyZ3VtZW50cy5sZW5ndGggIT09ICIrKGFyZ0NvdW50LTIpKyIpIHtcbiIrInRocm93QmluZGluZ0Vycm9yKCdmdW5jdGlvbiAiK2h1bWFuTmFtZSsiIGNhbGxlZCB3aXRoICcgKyBhcmd1bWVudHMubGVuZ3RoICsgJyBhcmd1bWVudHMsIGV4cGVjdGVkICIrKGFyZ0NvdW50LTIpKyIgYXJncyEnKTtcbiIrIn1cbiI7aWYobmVlZHNEZXN0cnVjdG9yU3RhY2spe2ludm9rZXJGbkJvZHkrPSJ2YXIgZGVzdHJ1Y3RvcnMgPSBbXTtcbiJ9dmFyIGR0b3JTdGFjaz1uZWVkc0Rlc3RydWN0b3JTdGFjaz8iZGVzdHJ1Y3RvcnMiOiJudWxsIjt2YXIgYXJnczE9WyJ0aHJvd0JpbmRpbmdFcnJvciIsImludm9rZXIiLCJmbiIsInJ1bkRlc3RydWN0b3JzIiwicmV0VHlwZSIsImNsYXNzUGFyYW0iXTt2YXIgYXJnczI9W3Rocm93QmluZGluZ0Vycm9yLGNwcEludm9rZXJGdW5jLGNwcFRhcmdldEZ1bmMscnVuRGVzdHJ1Y3RvcnMsYXJnVHlwZXNbMF0sYXJnVHlwZXNbMV1dO2lmKGlzQ2xhc3NNZXRob2RGdW5jKXtpbnZva2VyRm5Cb2R5Kz0idmFyIHRoaXNXaXJlZCA9IGNsYXNzUGFyYW0udG9XaXJlVHlwZSgiK2R0b3JTdGFjaysiLCB0aGlzKTtcbiJ9Zm9yKHZhciBpPTA7aTxhcmdDb3VudC0yOysraSl7aW52b2tlckZuQm9keSs9InZhciBhcmciK2krIldpcmVkID0gYXJnVHlwZSIraSsiLnRvV2lyZVR5cGUoIitkdG9yU3RhY2srIiwgYXJnIitpKyIpOyAvLyAiK2FyZ1R5cGVzW2krMl0ubmFtZSsiXG4iO2FyZ3MxLnB1c2goImFyZ1R5cGUiK2kpO2FyZ3MyLnB1c2goYXJnVHlwZXNbaSsyXSl9aWYoaXNDbGFzc01ldGhvZEZ1bmMpe2FyZ3NMaXN0V2lyZWQ9InRoaXNXaXJlZCIrKGFyZ3NMaXN0V2lyZWQubGVuZ3RoPjA/IiwgIjoiIikrYXJnc0xpc3RXaXJlZH1pbnZva2VyRm5Cb2R5Kz0ocmV0dXJucz8idmFyIHJ2ID0gIjoiIikrImludm9rZXIoZm4iKyhhcmdzTGlzdFdpcmVkLmxlbmd0aD4wPyIsICI6IiIpK2FyZ3NMaXN0V2lyZWQrIik7XG4iO2lmKG5lZWRzRGVzdHJ1Y3RvclN0YWNrKXtpbnZva2VyRm5Cb2R5Kz0icnVuRGVzdHJ1Y3RvcnMoZGVzdHJ1Y3RvcnMpO1xuIn1lbHNle2Zvcih2YXIgaT1pc0NsYXNzTWV0aG9kRnVuYz8xOjI7aTxhcmdUeXBlcy5sZW5ndGg7KytpKXt2YXIgcGFyYW1OYW1lPWk9PT0xPyJ0aGlzV2lyZWQiOiJhcmciKyhpLTIpKyJXaXJlZCI7aWYoYXJnVHlwZXNbaV0uZGVzdHJ1Y3RvckZ1bmN0aW9uIT09bnVsbCl7aW52b2tlckZuQm9keSs9cGFyYW1OYW1lKyJfZHRvcigiK3BhcmFtTmFtZSsiKTsgLy8gIithcmdUeXBlc1tpXS5uYW1lKyJcbiI7YXJnczEucHVzaChwYXJhbU5hbWUrIl9kdG9yIik7YXJnczIucHVzaChhcmdUeXBlc1tpXS5kZXN0cnVjdG9yRnVuY3Rpb24pfX19aWYocmV0dXJucyl7aW52b2tlckZuQm9keSs9InZhciByZXQgPSByZXRUeXBlLmZyb21XaXJlVHlwZShydik7XG4iKyJyZXR1cm4gcmV0O1xuIn1lbHNle31pbnZva2VyRm5Cb2R5Kz0ifVxuIjthcmdzMS5wdXNoKGludm9rZXJGbkJvZHkpO3ZhciBpbnZva2VyRnVuY3Rpb249bmV3XyhGdW5jdGlvbixhcmdzMSkuYXBwbHkobnVsbCxhcmdzMik7cmV0dXJuIGludm9rZXJGdW5jdGlvbn1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19mdW5jdGlvbihyYXdDbGFzc1R5cGUsbWV0aG9kTmFtZSxhcmdDb3VudCxyYXdBcmdUeXBlc0FkZHIsaW52b2tlclNpZ25hdHVyZSxyYXdJbnZva2VyLGNvbnRleHQsaXNQdXJlVmlydHVhbCl7dmFyIHJhd0FyZ1R5cGVzPWhlYXAzMlZlY3RvclRvQXJyYXkoYXJnQ291bnQscmF3QXJnVHlwZXNBZGRyKTttZXRob2ROYW1lPXJlYWRMYXRpbjFTdHJpbmcobWV0aG9kTmFtZSk7cmF3SW52b2tlcj1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbihpbnZva2VyU2lnbmF0dXJlLHJhd0ludm9rZXIpO3doZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkKFtdLFtyYXdDbGFzc1R5cGVdLGZ1bmN0aW9uKGNsYXNzVHlwZSl7Y2xhc3NUeXBlPWNsYXNzVHlwZVswXTt2YXIgaHVtYW5OYW1lPWNsYXNzVHlwZS5uYW1lKyIuIittZXRob2ROYW1lO2lmKG1ldGhvZE5hbWUuc3RhcnRzV2l0aCgiQEAiKSl7bWV0aG9kTmFtZT1TeW1ib2xbbWV0aG9kTmFtZS5zdWJzdHJpbmcoMildfWlmKGlzUHVyZVZpcnR1YWwpe2NsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MucHVyZVZpcnR1YWxGdW5jdGlvbnMucHVzaChtZXRob2ROYW1lKX1mdW5jdGlvbiB1bmJvdW5kVHlwZXNIYW5kbGVyKCl7dGhyb3dVbmJvdW5kVHlwZUVycm9yKCJDYW5ub3QgY2FsbCAiK2h1bWFuTmFtZSsiIGR1ZSB0byB1bmJvdW5kIHR5cGVzIixyYXdBcmdUeXBlcyl9dmFyIHByb3RvPWNsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGU7dmFyIG1ldGhvZD1wcm90b1ttZXRob2ROYW1lXTtpZih1bmRlZmluZWQ9PT1tZXRob2R8fHVuZGVmaW5lZD09PW1ldGhvZC5vdmVybG9hZFRhYmxlJiZtZXRob2QuY2xhc3NOYW1lIT09Y2xhc3NUeXBlLm5hbWUmJm1ldGhvZC5hcmdDb3VudD09PWFyZ0NvdW50LTIpe3VuYm91bmRUeXBlc0hhbmRsZXIuYXJnQ291bnQ9YXJnQ291bnQtMjt1bmJvdW5kVHlwZXNIYW5kbGVyLmNsYXNzTmFtZT1jbGFzc1R5cGUubmFtZTtwcm90b1ttZXRob2ROYW1lXT11bmJvdW5kVHlwZXNIYW5kbGVyfWVsc2V7ZW5zdXJlT3ZlcmxvYWRUYWJsZShwcm90byxtZXRob2ROYW1lLGh1bWFuTmFtZSk7cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZVthcmdDb3VudC0yXT11bmJvdW5kVHlwZXNIYW5kbGVyfXdoZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkKFtdLHJhd0FyZ1R5cGVzLGZ1bmN0aW9uKGFyZ1R5cGVzKXt2YXIgbWVtYmVyRnVuY3Rpb249Y3JhZnRJbnZva2VyRnVuY3Rpb24oaHVtYW5OYW1lLGFyZ1R5cGVzLGNsYXNzVHlwZSxyYXdJbnZva2VyLGNvbnRleHQpO2lmKHVuZGVmaW5lZD09PXByb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGUpe21lbWJlckZ1bmN0aW9uLmFyZ0NvdW50PWFyZ0NvdW50LTI7cHJvdG9bbWV0aG9kTmFtZV09bWVtYmVyRnVuY3Rpb259ZWxzZXtwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlW2FyZ0NvdW50LTJdPW1lbWJlckZ1bmN0aW9ufXJldHVybltdfSk7cmV0dXJuW119KX12YXIgZW12YWxfZnJlZV9saXN0PVtdO3ZhciBlbXZhbF9oYW5kbGVfYXJyYXk9W3t9LHt2YWx1ZTp1bmRlZmluZWR9LHt2YWx1ZTpudWxsfSx7dmFsdWU6dHJ1ZX0se3ZhbHVlOmZhbHNlfV07ZnVuY3Rpb24gX19lbXZhbF9kZWNyZWYoaGFuZGxlKXtpZihoYW5kbGU+NCYmMD09PS0tZW12YWxfaGFuZGxlX2FycmF5W2hhbmRsZV0ucmVmY291bnQpe2VtdmFsX2hhbmRsZV9hcnJheVtoYW5kbGVdPXVuZGVmaW5lZDtlbXZhbF9mcmVlX2xpc3QucHVzaChoYW5kbGUpfX1mdW5jdGlvbiBjb3VudF9lbXZhbF9oYW5kbGVzKCl7dmFyIGNvdW50PTA7Zm9yKHZhciBpPTU7aTxlbXZhbF9oYW5kbGVfYXJyYXkubGVuZ3RoOysraSl7aWYoZW12YWxfaGFuZGxlX2FycmF5W2ldIT09dW5kZWZpbmVkKXsrK2NvdW50fX1yZXR1cm4gY291bnR9ZnVuY3Rpb24gZ2V0X2ZpcnN0X2VtdmFsKCl7Zm9yKHZhciBpPTU7aTxlbXZhbF9oYW5kbGVfYXJyYXkubGVuZ3RoOysraSl7aWYoZW12YWxfaGFuZGxlX2FycmF5W2ldIT09dW5kZWZpbmVkKXtyZXR1cm4gZW12YWxfaGFuZGxlX2FycmF5W2ldfX1yZXR1cm4gbnVsbH1mdW5jdGlvbiBpbml0X2VtdmFsKCl7TW9kdWxlWyJjb3VudF9lbXZhbF9oYW5kbGVzIl09Y291bnRfZW12YWxfaGFuZGxlcztNb2R1bGVbImdldF9maXJzdF9lbXZhbCJdPWdldF9maXJzdF9lbXZhbH12YXIgRW12YWw9e3RvVmFsdWU6aGFuZGxlPT57aWYoIWhhbmRsZSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCB1c2UgZGVsZXRlZCB2YWwuIGhhbmRsZSA9ICIraGFuZGxlKX1yZXR1cm4gZW12YWxfaGFuZGxlX2FycmF5W2hhbmRsZV0udmFsdWV9LHRvSGFuZGxlOnZhbHVlPT57c3dpdGNoKHZhbHVlKXtjYXNlIHVuZGVmaW5lZDpyZXR1cm4gMTtjYXNlIG51bGw6cmV0dXJuIDI7Y2FzZSB0cnVlOnJldHVybiAzO2Nhc2UgZmFsc2U6cmV0dXJuIDQ7ZGVmYXVsdDp7dmFyIGhhbmRsZT1lbXZhbF9mcmVlX2xpc3QubGVuZ3RoP2VtdmFsX2ZyZWVfbGlzdC5wb3AoKTplbXZhbF9oYW5kbGVfYXJyYXkubGVuZ3RoO2VtdmFsX2hhbmRsZV9hcnJheVtoYW5kbGVdPXtyZWZjb3VudDoxLHZhbHVlOnZhbHVlfTtyZXR1cm4gaGFuZGxlfX19fTtmdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9lbXZhbChyYXdUeXBlLG5hbWUpe25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKGhhbmRsZSl7dmFyIHJ2PUVtdmFsLnRvVmFsdWUoaGFuZGxlKTtfX2VtdmFsX2RlY3JlZihoYW5kbGUpO3JldHVybiBydn0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtyZXR1cm4gRW12YWwudG9IYW5kbGUodmFsdWUpfSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pfWZ1bmN0aW9uIF9lbWJpbmRfcmVwcih2KXtpZih2PT09bnVsbCl7cmV0dXJuIm51bGwifXZhciB0PXR5cGVvZiB2O2lmKHQ9PT0ib2JqZWN0Inx8dD09PSJhcnJheSJ8fHQ9PT0iZnVuY3Rpb24iKXtyZXR1cm4gdi50b1N0cmluZygpfWVsc2V7cmV0dXJuIiIrdn19ZnVuY3Rpb24gZmxvYXRSZWFkVmFsdWVGcm9tUG9pbnRlcihuYW1lLHNoaWZ0KXtzd2l0Y2goc2hpZnQpe2Nhc2UgMjpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEdST1dBQkxFX0hFQVBfRjMyKClbcG9pbnRlcj4+Ml0pfTtjYXNlIDM6cmV0dXJuIGZ1bmN0aW9uKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShHUk9XQUJMRV9IRUFQX0Y2NCgpW3BvaW50ZXI+PjNdKX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKCJVbmtub3duIGZsb2F0IHR5cGU6ICIrbmFtZSl9fWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0KHJhd1R5cGUsbmFtZSxzaXplKXt2YXIgc2hpZnQ9Z2V0U2hpZnRGcm9tU2l6ZShzaXplKTtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbih2YWx1ZSl7cmV0dXJuIHZhbHVlfSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe3JldHVybiB2YWx1ZX0sImFyZ1BhY2tBZHZhbmNlIjo4LCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZmxvYXRSZWFkVmFsdWVGcm9tUG9pbnRlcihuYW1lLHNoaWZ0KSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pfWZ1bmN0aW9uIGludGVnZXJSZWFkVmFsdWVGcm9tUG9pbnRlcihuYW1lLHNoaWZ0LHNpZ25lZCl7c3dpdGNoKHNoaWZ0KXtjYXNlIDA6cmV0dXJuIHNpZ25lZD9mdW5jdGlvbiByZWFkUzhGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gR1JPV0FCTEVfSEVBUF9JOCgpW3BvaW50ZXJdfTpmdW5jdGlvbiByZWFkVThGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gR1JPV0FCTEVfSEVBUF9VOCgpW3BvaW50ZXJdfTtjYXNlIDE6cmV0dXJuIHNpZ25lZD9mdW5jdGlvbiByZWFkUzE2RnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIEdST1dBQkxFX0hFQVBfSTE2KClbcG9pbnRlcj4+MV19OmZ1bmN0aW9uIHJlYWRVMTZGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gR1JPV0FCTEVfSEVBUF9VMTYoKVtwb2ludGVyPj4xXX07Y2FzZSAyOnJldHVybiBzaWduZWQ/ZnVuY3Rpb24gcmVhZFMzMkZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBHUk9XQUJMRV9IRUFQX0kzMigpW3BvaW50ZXI+PjJdfTpmdW5jdGlvbiByZWFkVTMyRnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIEdST1dBQkxFX0hFQVBfVTMyKClbcG9pbnRlcj4+Ml19O2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcigiVW5rbm93biBpbnRlZ2VyIHR5cGU6ICIrbmFtZSl9fWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXIocHJpbWl0aXZlVHlwZSxuYW1lLHNpemUsbWluUmFuZ2UsbWF4UmFuZ2Upe25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtpZihtYXhSYW5nZT09PS0xKXttYXhSYW5nZT00Mjk0OTY3Mjk1fXZhciBzaGlmdD1nZXRTaGlmdEZyb21TaXplKHNpemUpO3ZhciBmcm9tV2lyZVR5cGU9dmFsdWU9PnZhbHVlO2lmKG1pblJhbmdlPT09MCl7dmFyIGJpdHNoaWZ0PTMyLTgqc2l6ZTtmcm9tV2lyZVR5cGU9KHZhbHVlPT52YWx1ZTw8Yml0c2hpZnQ+Pj5iaXRzaGlmdCl9dmFyIGlzVW5zaWduZWRUeXBlPW5hbWUuaW5jbHVkZXMoInVuc2lnbmVkIik7dmFyIGNoZWNrQXNzZXJ0aW9ucz0odmFsdWUsdG9UeXBlTmFtZSk9Pnt9O3ZhciB0b1dpcmVUeXBlO2lmKGlzVW5zaWduZWRUeXBlKXt0b1dpcmVUeXBlPWZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtjaGVja0Fzc2VydGlvbnModmFsdWUsdGhpcy5uYW1lKTtyZXR1cm4gdmFsdWU+Pj4wfX1lbHNle3RvV2lyZVR5cGU9ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe2NoZWNrQXNzZXJ0aW9ucyh2YWx1ZSx0aGlzLm5hbWUpO3JldHVybiB2YWx1ZX19cmVnaXN0ZXJUeXBlKHByaW1pdGl2ZVR5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmcm9tV2lyZVR5cGUsInRvV2lyZVR5cGUiOnRvV2lyZVR5cGUsImFyZ1BhY2tBZHZhbmNlIjo4LCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6aW50ZWdlclJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2hpZnQsbWluUmFuZ2UhPT0wKSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX21lbW9yeV92aWV3KHJhd1R5cGUsZGF0YVR5cGVJbmRleCxuYW1lKXt2YXIgdHlwZU1hcHBpbmc9W0ludDhBcnJheSxVaW50OEFycmF5LEludDE2QXJyYXksVWludDE2QXJyYXksSW50MzJBcnJheSxVaW50MzJBcnJheSxGbG9hdDMyQXJyYXksRmxvYXQ2NEFycmF5XTt2YXIgVEE9dHlwZU1hcHBpbmdbZGF0YVR5cGVJbmRleF07ZnVuY3Rpb24gZGVjb2RlTWVtb3J5VmlldyhoYW5kbGUpe2hhbmRsZT1oYW5kbGU+PjI7dmFyIGhlYXA9R1JPV0FCTEVfSEVBUF9VMzIoKTt2YXIgc2l6ZT1oZWFwW2hhbmRsZV07dmFyIGRhdGE9aGVhcFtoYW5kbGUrMV07cmV0dXJuIG5ldyBUQShidWZmZXIsZGF0YSxzaXplKX1uYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpkZWNvZGVNZW1vcnlWaWV3LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmRlY29kZU1lbW9yeVZpZXd9LHtpZ25vcmVEdXBsaWNhdGVSZWdpc3RyYXRpb25zOnRydWV9KX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nKHJhd1R5cGUsbmFtZSl7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3ZhciBzdGRTdHJpbmdJc1VURjg9bmFtZT09PSJzdGQ6OnN0cmluZyI7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbih2YWx1ZSl7dmFyIGxlbmd0aD1HUk9XQUJMRV9IRUFQX1UzMigpW3ZhbHVlPj4yXTt2YXIgc3RyO2lmKHN0ZFN0cmluZ0lzVVRGOCl7dmFyIGRlY29kZVN0YXJ0UHRyPXZhbHVlKzQ7Zm9yKHZhciBpPTA7aTw9bGVuZ3RoOysraSl7dmFyIGN1cnJlbnRCeXRlUHRyPXZhbHVlKzQraTtpZihpPT1sZW5ndGh8fEdST1dBQkxFX0hFQVBfVTgoKVtjdXJyZW50Qnl0ZVB0cl09PTApe3ZhciBtYXhSZWFkPWN1cnJlbnRCeXRlUHRyLWRlY29kZVN0YXJ0UHRyO3ZhciBzdHJpbmdTZWdtZW50PVVURjhUb1N0cmluZyhkZWNvZGVTdGFydFB0cixtYXhSZWFkKTtpZihzdHI9PT11bmRlZmluZWQpe3N0cj1zdHJpbmdTZWdtZW50fWVsc2V7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApO3N0cis9c3RyaW5nU2VnbWVudH1kZWNvZGVTdGFydFB0cj1jdXJyZW50Qnl0ZVB0cisxfX19ZWxzZXt2YXIgYT1uZXcgQXJyYXkobGVuZ3RoKTtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe2FbaV09U3RyaW5nLmZyb21DaGFyQ29kZShHUk9XQUJMRV9IRUFQX1U4KClbdmFsdWUrNCtpXSl9c3RyPWEuam9pbigiIil9X2ZyZWUodmFsdWUpO3JldHVybiBzdHJ9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7aWYodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7dmFsdWU9bmV3IFVpbnQ4QXJyYXkodmFsdWUpfXZhciBnZXRMZW5ndGg7dmFyIHZhbHVlSXNPZlR5cGVTdHJpbmc9dHlwZW9mIHZhbHVlPT0ic3RyaW5nIjtpZighKHZhbHVlSXNPZlR5cGVTdHJpbmd8fHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheXx8dmFsdWUgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheXx8dmFsdWUgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBzdGQ6OnN0cmluZyIpfWlmKHN0ZFN0cmluZ0lzVVRGOCYmdmFsdWVJc09mVHlwZVN0cmluZyl7Z2V0TGVuZ3RoPSgoKT0+bGVuZ3RoQnl0ZXNVVEY4KHZhbHVlKSl9ZWxzZXtnZXRMZW5ndGg9KCgpPT52YWx1ZS5sZW5ndGgpfXZhciBsZW5ndGg9Z2V0TGVuZ3RoKCk7dmFyIHB0cj1fbWFsbG9jKDQrbGVuZ3RoKzEpO0dST1dBQkxFX0hFQVBfVTMyKClbcHRyPj4yXT1sZW5ndGg7aWYoc3RkU3RyaW5nSXNVVEY4JiZ2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtzdHJpbmdUb1VURjgodmFsdWUscHRyKzQsbGVuZ3RoKzEpfWVsc2V7aWYodmFsdWVJc09mVHlwZVN0cmluZyl7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXt2YXIgY2hhckNvZGU9dmFsdWUuY2hhckNvZGVBdChpKTtpZihjaGFyQ29kZT4yNTUpe19mcmVlKHB0cik7dGhyb3dCaW5kaW5nRXJyb3IoIlN0cmluZyBoYXMgVVRGLTE2IGNvZGUgdW5pdHMgdGhhdCBkbyBub3QgZml0IGluIDggYml0cyIpfUdST1dBQkxFX0hFQVBfVTgoKVtwdHIrNCtpXT1jaGFyQ29kZX19ZWxzZXtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe0dST1dBQkxFX0hFQVBfVTgoKVtwdHIrNCtpXT12YWx1ZVtpXX19fWlmKGRlc3RydWN0b3JzIT09bnVsbCl7ZGVzdHJ1Y3RvcnMucHVzaChfZnJlZSxwdHIpfXJldHVybiBwdHJ9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbjpmdW5jdGlvbihwdHIpe19mcmVlKHB0cil9fSl9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmcocmF3VHlwZSxjaGFyU2l6ZSxuYW1lKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIGRlY29kZVN0cmluZyxlbmNvZGVTdHJpbmcsZ2V0SGVhcCxsZW5ndGhCeXRlc1VURixzaGlmdDtpZihjaGFyU2l6ZT09PTIpe2RlY29kZVN0cmluZz1VVEYxNlRvU3RyaW5nO2VuY29kZVN0cmluZz1zdHJpbmdUb1VURjE2O2xlbmd0aEJ5dGVzVVRGPWxlbmd0aEJ5dGVzVVRGMTY7Z2V0SGVhcD0oKCk9PkdST1dBQkxFX0hFQVBfVTE2KCkpO3NoaWZ0PTF9ZWxzZSBpZihjaGFyU2l6ZT09PTQpe2RlY29kZVN0cmluZz1VVEYzMlRvU3RyaW5nO2VuY29kZVN0cmluZz1zdHJpbmdUb1VURjMyO2xlbmd0aEJ5dGVzVVRGPWxlbmd0aEJ5dGVzVVRGMzI7Z2V0SGVhcD0oKCk9PkdST1dBQkxFX0hFQVBfVTMyKCkpO3NoaWZ0PTJ9cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbih2YWx1ZSl7dmFyIGxlbmd0aD1HUk9XQUJMRV9IRUFQX1UzMigpW3ZhbHVlPj4yXTt2YXIgSEVBUD1nZXRIZWFwKCk7dmFyIHN0cjt2YXIgZGVjb2RlU3RhcnRQdHI9dmFsdWUrNDtmb3IodmFyIGk9MDtpPD1sZW5ndGg7KytpKXt2YXIgY3VycmVudEJ5dGVQdHI9dmFsdWUrNCtpKmNoYXJTaXplO2lmKGk9PWxlbmd0aHx8SEVBUFtjdXJyZW50Qnl0ZVB0cj4+c2hpZnRdPT0wKXt2YXIgbWF4UmVhZEJ5dGVzPWN1cnJlbnRCeXRlUHRyLWRlY29kZVN0YXJ0UHRyO3ZhciBzdHJpbmdTZWdtZW50PWRlY29kZVN0cmluZyhkZWNvZGVTdGFydFB0cixtYXhSZWFkQnl0ZXMpO2lmKHN0cj09PXVuZGVmaW5lZCl7c3RyPXN0cmluZ1NlZ21lbnR9ZWxzZXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCk7c3RyKz1zdHJpbmdTZWdtZW50fWRlY29kZVN0YXJ0UHRyPWN1cnJlbnRCeXRlUHRyK2NoYXJTaXplfX1fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtpZighKHR5cGVvZiB2YWx1ZT09InN0cmluZyIpKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBDKysgc3RyaW5nIHR5cGUgIituYW1lKX12YXIgbGVuZ3RoPWxlbmd0aEJ5dGVzVVRGKHZhbHVlKTt2YXIgcHRyPV9tYWxsb2MoNCtsZW5ndGgrY2hhclNpemUpO0dST1dBQkxFX0hFQVBfVTMyKClbcHRyPj4yXT1sZW5ndGg+PnNoaWZ0O2VuY29kZVN0cmluZyh2YWx1ZSxwdHIrNCxsZW5ndGgrY2hhclNpemUpO2lmKGRlc3RydWN0b3JzIT09bnVsbCl7ZGVzdHJ1Y3RvcnMucHVzaChfZnJlZSxwdHIpfXJldHVybiBwdHJ9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbjpmdW5jdGlvbihwdHIpe19mcmVlKHB0cil9fSl9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfdm9pZChyYXdUeXBlLG5hbWUpe25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7aXNWb2lkOnRydWUsbmFtZTpuYW1lLCJhcmdQYWNrQWR2YW5jZSI6MCwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbigpe3JldHVybiB1bmRlZmluZWR9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyxvKXtyZXR1cm4gdW5kZWZpbmVkfX0pfWZ1bmN0aW9uIF9fZW1zY3JpcHRlbl9kYXRlX25vdygpe3JldHVybiBEYXRlLm5vdygpfWZ1bmN0aW9uIF9fZW1zY3JpcHRlbl9kZWZhdWx0X3B0aHJlYWRfc3RhY2tfc2l6ZSgpe3JldHVybiAyMDk3MTUyfXZhciBub3dJc01vbm90b25pYz10cnVlO2Z1bmN0aW9uIF9fZW1zY3JpcHRlbl9nZXRfbm93X2lzX21vbm90b25pYygpe3JldHVybiBub3dJc01vbm90b25pY31mdW5jdGlvbiBleGVjdXRlTm90aWZpZWRQcm94eWluZ1F1ZXVlKHF1ZXVlKXtBdG9taWNzLnN0b3JlKEdST1dBQkxFX0hFQVBfSTMyKCkscXVldWU+PjIsMSk7aWYoX3B0aHJlYWRfc2VsZigpKXtfX2Vtc2NyaXB0ZW5fcHJveHlfZXhlY3V0ZV90YXNrX3F1ZXVlKHF1ZXVlKX1BdG9taWNzLmNvbXBhcmVFeGNoYW5nZShHUk9XQUJMRV9IRUFQX0kzMigpLHF1ZXVlPj4yLDEsMCl9TW9kdWxlWyJleGVjdXRlTm90aWZpZWRQcm94eWluZ1F1ZXVlIl09ZXhlY3V0ZU5vdGlmaWVkUHJveHlpbmdRdWV1ZTtmdW5jdGlvbiBfX2Vtc2NyaXB0ZW5fbm90aWZ5X3Rhc2tfcXVldWUodGFyZ2V0VGhyZWFkSWQsY3VyclRocmVhZElkLG1haW5UaHJlYWRJZCxxdWV1ZSl7aWYodGFyZ2V0VGhyZWFkSWQ9PWN1cnJUaHJlYWRJZCl7c2V0VGltZW91dCgoKT0+ZXhlY3V0ZU5vdGlmaWVkUHJveHlpbmdRdWV1ZShxdWV1ZSkpfWVsc2UgaWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCl7cG9zdE1lc3NhZ2UoeyJ0YXJnZXRUaHJlYWQiOnRhcmdldFRocmVhZElkLCJjbWQiOiJwcm9jZXNzUHJveHlpbmdRdWV1ZSIsInF1ZXVlIjpxdWV1ZX0pfWVsc2V7dmFyIHB0aHJlYWQ9UFRocmVhZC5wdGhyZWFkc1t0YXJnZXRUaHJlYWRJZF07dmFyIHdvcmtlcj1wdGhyZWFkJiZwdGhyZWFkLndvcmtlcjtpZighd29ya2VyKXtyZXR1cm59d29ya2VyLnBvc3RNZXNzYWdlKHsiY21kIjoicHJvY2Vzc1Byb3h5aW5nUXVldWUiLCJxdWV1ZSI6cXVldWV9KX1yZXR1cm4gMX1mdW5jdGlvbiBfX2Vtc2NyaXB0ZW5fc2V0X29mZnNjcmVlbmNhbnZhc19zaXplKHRhcmdldCx3aWR0aCxoZWlnaHQpe3JldHVybi0xfWZ1bmN0aW9uIF9fZW12YWxfaW5jcmVmKGhhbmRsZSl7aWYoaGFuZGxlPjQpe2VtdmFsX2hhbmRsZV9hcnJheVtoYW5kbGVdLnJlZmNvdW50Kz0xfX1mdW5jdGlvbiByZXF1aXJlUmVnaXN0ZXJlZFR5cGUocmF3VHlwZSxodW1hbk5hbWUpe3ZhciBpbXBsPXJlZ2lzdGVyZWRUeXBlc1tyYXdUeXBlXTtpZih1bmRlZmluZWQ9PT1pbXBsKXt0aHJvd0JpbmRpbmdFcnJvcihodW1hbk5hbWUrIiBoYXMgdW5rbm93biB0eXBlICIrZ2V0VHlwZU5hbWUocmF3VHlwZSkpfXJldHVybiBpbXBsfWZ1bmN0aW9uIF9fZW12YWxfdGFrZV92YWx1ZSh0eXBlLGFyZ3Ype3R5cGU9cmVxdWlyZVJlZ2lzdGVyZWRUeXBlKHR5cGUsIl9lbXZhbF90YWtlX3ZhbHVlIik7dmFyIHY9dHlwZVsicmVhZFZhbHVlRnJvbVBvaW50ZXIiXShhcmd2KTtyZXR1cm4gRW12YWwudG9IYW5kbGUodil9ZnVuY3Rpb24gX19tbWFwX2pzKGFkZHIsbGVuLHByb3QsZmxhZ3MsZmQsb2ZmLGFsbG9jYXRlZCxidWlsdGluKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcygxMywxLGFkZHIsbGVuLHByb3QsZmxhZ3MsZmQsb2ZmLGFsbG9jYXRlZCxidWlsdGluKTt0cnl7dmFyIGluZm89RlMuZ2V0U3RyZWFtKGZkKTtpZighaW5mbylyZXR1cm4tODt2YXIgcmVzPUZTLm1tYXAoaW5mbyxhZGRyLGxlbixvZmYscHJvdCxmbGFncyk7dmFyIHB0cj1yZXMucHRyO0dST1dBQkxFX0hFQVBfSTMyKClbYWxsb2NhdGVkPj4yXT1yZXMuYWxsb2NhdGVkO3JldHVybiBwdHJ9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19tdW5tYXBfanMoYWRkcixsZW4scHJvdCxmbGFncyxmZCxvZmZzZXQpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDE0LDEsYWRkcixsZW4scHJvdCxmbGFncyxmZCxvZmZzZXQpO3RyeXt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoc3RyZWFtKXtpZihwcm90JjIpe1NZU0NBTExTLmRvTXN5bmMoYWRkcixzdHJlYW0sbGVuLGZsYWdzLG9mZnNldCl9RlMubXVubWFwKHN0cmVhbSl9fWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9hYm9ydCgpe2Fib3J0KCIiKX1mdW5jdGlvbiBfZW1zY3JpcHRlbl9jaGVja19ibG9ja2luZ19hbGxvd2VkKCl7aWYoRU5WSVJPTk1FTlRfSVNfV09SS0VSKXJldHVybjt3YXJuT25jZSgiQmxvY2tpbmcgb24gdGhlIG1haW4gdGhyZWFkIGlzIHZlcnkgZGFuZ2Vyb3VzLCBzZWUgaHR0cHM6Ly9lbXNjcmlwdGVuLm9yZy9kb2NzL3BvcnRpbmcvcHRocmVhZHMuaHRtbCNibG9ja2luZy1vbi10aGUtbWFpbi1icm93c2VyLXRocmVhZCIpfWZ1bmN0aW9uIF9lbXNjcmlwdGVuX2dldF9oZWFwX21heCgpe3JldHVybiAyMTQ3NDgzNjQ4fXZhciBfZW1zY3JpcHRlbl9nZXRfbm93O2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpe19lbXNjcmlwdGVuX2dldF9ub3c9KCgpPT5wZXJmb3JtYW5jZS5ub3coKS1Nb2R1bGVbIl9fcGVyZm9ybWFuY2Vfbm93X2Nsb2NrX2RyaWZ0Il0pfWVsc2UgX2Vtc2NyaXB0ZW5fZ2V0X25vdz0oKCk9PnBlcmZvcm1hbmNlLm5vdygpKTtmdW5jdGlvbiBfZW1zY3JpcHRlbl9tZW1jcHlfYmlnKGRlc3Qsc3JjLG51bSl7R1JPV0FCTEVfSEVBUF9VOCgpLmNvcHlXaXRoaW4oZGVzdCxzcmMsc3JjK251bSl9ZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fbnVtX2xvZ2ljYWxfY29yZXMoKXtyZXR1cm4gbmF2aWdhdG9yWyJoYXJkd2FyZUNvbmN1cnJlbmN5Il19ZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoaW5kZXgsc3luYyl7dmFyIG51bUNhbGxBcmdzPWFyZ3VtZW50cy5sZW5ndGgtMjt2YXIgb3V0ZXJBcmdzPWFyZ3VtZW50cztyZXR1cm4gd2l0aFN0YWNrU2F2ZShmdW5jdGlvbigpe3ZhciBzZXJpYWxpemVkTnVtQ2FsbEFyZ3M9bnVtQ2FsbEFyZ3M7dmFyIGFyZ3M9c3RhY2tBbGxvYyhzZXJpYWxpemVkTnVtQ2FsbEFyZ3MqOCk7dmFyIGI9YXJncz4+Mztmb3IodmFyIGk9MDtpPG51bUNhbGxBcmdzO2krKyl7dmFyIGFyZz1vdXRlckFyZ3NbMitpXTtHUk9XQUJMRV9IRUFQX0Y2NCgpW2IraV09YXJnfXJldHVybiBfZW1zY3JpcHRlbl9ydW5faW5fbWFpbl9ydW50aW1lX3RocmVhZF9qcyhpbmRleCxzZXJpYWxpemVkTnVtQ2FsbEFyZ3MsYXJncyxzeW5jKX0pfXZhciBfZW1zY3JpcHRlbl9yZWNlaXZlX29uX21haW5fdGhyZWFkX2pzX2NhbGxBcmdzPVtdO2Z1bmN0aW9uIF9lbXNjcmlwdGVuX3JlY2VpdmVfb25fbWFpbl90aHJlYWRfanMoaW5kZXgsbnVtQ2FsbEFyZ3MsYXJncyl7X2Vtc2NyaXB0ZW5fcmVjZWl2ZV9vbl9tYWluX3RocmVhZF9qc19jYWxsQXJncy5sZW5ndGg9bnVtQ2FsbEFyZ3M7dmFyIGI9YXJncz4+Mztmb3IodmFyIGk9MDtpPG51bUNhbGxBcmdzO2krKyl7X2Vtc2NyaXB0ZW5fcmVjZWl2ZV9vbl9tYWluX3RocmVhZF9qc19jYWxsQXJnc1tpXT1HUk9XQUJMRV9IRUFQX0Y2NCgpW2IraV19dmFyIGlzRW1Bc21Db25zdD1pbmRleDwwO3ZhciBmdW5jPSFpc0VtQXNtQ29uc3Q/cHJveGllZEZ1bmN0aW9uVGFibGVbaW5kZXhdOkFTTV9DT05TVFNbLWluZGV4LTFdO3JldHVybiBmdW5jLmFwcGx5KG51bGwsX2Vtc2NyaXB0ZW5fcmVjZWl2ZV9vbl9tYWluX3RocmVhZF9qc19jYWxsQXJncyl9ZnVuY3Rpb24gZW1zY3JpcHRlbl9yZWFsbG9jX2J1ZmZlcihzaXplKXt0cnl7d2FzbU1lbW9yeS5ncm93KHNpemUtYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzU+Pj4xNik7dXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3Mod2FzbU1lbW9yeS5idWZmZXIpO3JldHVybiAxfWNhdGNoKGUpe319ZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXAocmVxdWVzdGVkU2l6ZSl7dmFyIG9sZFNpemU9R1JPV0FCTEVfSEVBUF9VOCgpLmxlbmd0aDtyZXF1ZXN0ZWRTaXplPXJlcXVlc3RlZFNpemU+Pj4wO2lmKHJlcXVlc3RlZFNpemU8PW9sZFNpemUpe3JldHVybiBmYWxzZX12YXIgbWF4SGVhcFNpemU9X2Vtc2NyaXB0ZW5fZ2V0X2hlYXBfbWF4KCk7aWYocmVxdWVzdGVkU2l6ZT5tYXhIZWFwU2l6ZSl7cmV0dXJuIGZhbHNlfWxldCBhbGlnblVwPSh4LG11bHRpcGxlKT0+eCsobXVsdGlwbGUteCVtdWx0aXBsZSklbXVsdGlwbGU7Zm9yKHZhciBjdXREb3duPTE7Y3V0RG93bjw9NDtjdXREb3duKj0yKXt2YXIgb3Zlckdyb3duSGVhcFNpemU9b2xkU2l6ZSooMSsuMi9jdXREb3duKTtvdmVyR3Jvd25IZWFwU2l6ZT1NYXRoLm1pbihvdmVyR3Jvd25IZWFwU2l6ZSxyZXF1ZXN0ZWRTaXplKzEwMDY2MzI5Nik7dmFyIG5ld1NpemU9TWF0aC5taW4obWF4SGVhcFNpemUsYWxpZ25VcChNYXRoLm1heChyZXF1ZXN0ZWRTaXplLG92ZXJHcm93bkhlYXBTaXplKSw2NTUzNikpO3ZhciByZXBsYWNlbWVudD1lbXNjcmlwdGVuX3JlYWxsb2NfYnVmZmVyKG5ld1NpemUpO2lmKHJlcGxhY2VtZW50KXtyZXR1cm4gdHJ1ZX19cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIF9lbXNjcmlwdGVuX3Vud2luZF90b19qc19ldmVudF9sb29wKCl7dGhyb3cidW53aW5kIn12YXIgRU5WPXt9O2Z1bmN0aW9uIGdldEV4ZWN1dGFibGVOYW1lKCl7cmV0dXJuIHRoaXNQcm9ncmFtfHwiLi90aGlzLnByb2dyYW0ifWZ1bmN0aW9uIGdldEVudlN0cmluZ3MoKXtpZighZ2V0RW52U3RyaW5ncy5zdHJpbmdzKXt2YXIgbGFuZz0odHlwZW9mIG5hdmlnYXRvcj09Im9iamVjdCImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fCJDIikucmVwbGFjZSgiLSIsIl8iKSsiLlVURi04Ijt2YXIgZW52PXsiVVNFUiI6IndlYl91c2VyIiwiTE9HTkFNRSI6IndlYl91c2VyIiwiUEFUSCI6Ii8iLCJQV0QiOiIvIiwiSE9NRSI6Ii9ob21lL3dlYl91c2VyIiwiTEFORyI6bGFuZywiXyI6Z2V0RXhlY3V0YWJsZU5hbWUoKX07Zm9yKHZhciB4IGluIEVOVil7aWYoRU5WW3hdPT09dW5kZWZpbmVkKWRlbGV0ZSBlbnZbeF07ZWxzZSBlbnZbeF09RU5WW3hdfXZhciBzdHJpbmdzPVtdO2Zvcih2YXIgeCBpbiBlbnYpe3N0cmluZ3MucHVzaCh4KyI9IitlbnZbeF0pfWdldEVudlN0cmluZ3Muc3RyaW5ncz1zdHJpbmdzfXJldHVybiBnZXRFbnZTdHJpbmdzLnN0cmluZ3N9ZnVuY3Rpb24gX2Vudmlyb25fZ2V0KF9fZW52aXJvbixlbnZpcm9uX2J1Zil7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMTUsMSxfX2Vudmlyb24sZW52aXJvbl9idWYpO3ZhciBidWZTaXplPTA7Z2V0RW52U3RyaW5ncygpLmZvckVhY2goZnVuY3Rpb24oc3RyaW5nLGkpe3ZhciBwdHI9ZW52aXJvbl9idWYrYnVmU2l6ZTtHUk9XQUJMRV9IRUFQX0kzMigpW19fZW52aXJvbitpKjQ+PjJdPXB0cjt3cml0ZUFzY2lpVG9NZW1vcnkoc3RyaW5nLHB0cik7YnVmU2l6ZSs9c3RyaW5nLmxlbmd0aCsxfSk7cmV0dXJuIDB9ZnVuY3Rpb24gX2Vudmlyb25fc2l6ZXNfZ2V0KHBlbnZpcm9uX2NvdW50LHBlbnZpcm9uX2J1Zl9zaXplKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcygxNiwxLHBlbnZpcm9uX2NvdW50LHBlbnZpcm9uX2J1Zl9zaXplKTt2YXIgc3RyaW5ncz1nZXRFbnZTdHJpbmdzKCk7R1JPV0FCTEVfSEVBUF9JMzIoKVtwZW52aXJvbl9jb3VudD4+Ml09c3RyaW5ncy5sZW5ndGg7dmFyIGJ1ZlNpemU9MDtzdHJpbmdzLmZvckVhY2goZnVuY3Rpb24oc3RyaW5nKXtidWZTaXplKz1zdHJpbmcubGVuZ3RoKzF9KTtHUk9XQUJMRV9IRUFQX0kzMigpW3BlbnZpcm9uX2J1Zl9zaXplPj4yXT1idWZTaXplO3JldHVybiAwfWZ1bmN0aW9uIF9mZF9jbG9zZShmZCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMTcsMSxmZCk7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTtGUy5jbG9zZShzdHJlYW0pO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIGRvUmVhZHYoc3RyZWFtLGlvdixpb3ZjbnQsb2Zmc2V0KXt2YXIgcmV0PTA7Zm9yKHZhciBpPTA7aTxpb3ZjbnQ7aSsrKXt2YXIgcHRyPUdST1dBQkxFX0hFQVBfVTMyKClbaW92Pj4yXTt2YXIgbGVuPUdST1dBQkxFX0hFQVBfVTMyKClbaW92KzQ+PjJdO2lvdis9ODt2YXIgY3Vycj1GUy5yZWFkKHN0cmVhbSxHUk9XQUJMRV9IRUFQX0k4KCkscHRyLGxlbixvZmZzZXQpO2lmKGN1cnI8MClyZXR1cm4tMTtyZXQrPWN1cnI7aWYoY3VycjxsZW4pYnJlYWt9cmV0dXJuIHJldH1mdW5jdGlvbiBfZmRfcmVhZChmZCxpb3YsaW92Y250LHBudW0pe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDE4LDEsZmQsaW92LGlvdmNudCxwbnVtKTt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3ZhciBudW09ZG9SZWFkdihzdHJlYW0saW92LGlvdmNudCk7R1JPV0FCTEVfSEVBUF9JMzIoKVtwbnVtPj4yXT1udW07cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4gZS5lcnJub319ZnVuY3Rpb24gX2ZkX3NlZWsoZmQsb2Zmc2V0X2xvdyxvZmZzZXRfaGlnaCx3aGVuY2UsbmV3T2Zmc2V0KXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcygxOSwxLGZkLG9mZnNldF9sb3csb2Zmc2V0X2hpZ2gsd2hlbmNlLG5ld09mZnNldCk7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTt2YXIgSElHSF9PRkZTRVQ9NDI5NDk2NzI5Njt2YXIgb2Zmc2V0PW9mZnNldF9oaWdoKkhJR0hfT0ZGU0VUKyhvZmZzZXRfbG93Pj4+MCk7dmFyIERPVUJMRV9MSU1JVD05MDA3MTk5MjU0NzQwOTkyO2lmKG9mZnNldDw9LURPVUJMRV9MSU1JVHx8b2Zmc2V0Pj1ET1VCTEVfTElNSVQpe3JldHVybiA2MX1GUy5sbHNlZWsoc3RyZWFtLG9mZnNldCx3aGVuY2UpO3RlbXBJNjQ9W3N0cmVhbS5wb3NpdGlvbj4+PjAsKHRlbXBEb3VibGU9c3RyZWFtLnBvc2l0aW9uLCtNYXRoLmFicyh0ZW1wRG91YmxlKT49MT90ZW1wRG91YmxlPjA/KE1hdGgubWluKCtNYXRoLmZsb29yKHRlbXBEb3VibGUvNDI5NDk2NzI5NiksNDI5NDk2NzI5NSl8MCk+Pj4wOn5+K01hdGguY2VpbCgodGVtcERvdWJsZS0rKH5+dGVtcERvdWJsZT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCldLEdST1dBQkxFX0hFQVBfSTMyKClbbmV3T2Zmc2V0Pj4yXT10ZW1wSTY0WzBdLEdST1dBQkxFX0hFQVBfSTMyKClbbmV3T2Zmc2V0KzQ+PjJdPXRlbXBJNjRbMV07aWYoc3RyZWFtLmdldGRlbnRzJiZvZmZzZXQ9PT0wJiZ3aGVuY2U9PT0wKXN0cmVhbS5nZXRkZW50cz1udWxsO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIF9mZF9zeW5jKGZkKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcygyMCwxLGZkKTt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO2lmKHN0cmVhbS5zdHJlYW1fb3BzJiZzdHJlYW0uc3RyZWFtX29wcy5mc3luYyl7cmV0dXJuLXN0cmVhbS5zdHJlYW1fb3BzLmZzeW5jKHN0cmVhbSl9cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4gZS5lcnJub319ZnVuY3Rpb24gZG9Xcml0ZXYoc3RyZWFtLGlvdixpb3ZjbnQsb2Zmc2V0KXt2YXIgcmV0PTA7Zm9yKHZhciBpPTA7aTxpb3ZjbnQ7aSsrKXt2YXIgcHRyPUdST1dBQkxFX0hFQVBfVTMyKClbaW92Pj4yXTt2YXIgbGVuPUdST1dBQkxFX0hFQVBfVTMyKClbaW92KzQ+PjJdO2lvdis9ODt2YXIgY3Vycj1GUy53cml0ZShzdHJlYW0sR1JPV0FCTEVfSEVBUF9JOCgpLHB0cixsZW4sb2Zmc2V0KTtpZihjdXJyPDApcmV0dXJuLTE7cmV0Kz1jdXJyfXJldHVybiByZXR9ZnVuY3Rpb24gX2ZkX3dyaXRlKGZkLGlvdixpb3ZjbnQscG51bSl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMjEsMSxmZCxpb3YsaW92Y250LHBudW0pO3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7dmFyIG51bT1kb1dyaXRldihzdHJlYW0saW92LGlvdmNudCk7R1JPV0FCTEVfSEVBUF9JMzIoKVtwbnVtPj4yXT1udW07cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4gZS5lcnJub319ZnVuY3Rpb24gX2dldFRlbXBSZXQwKCl7cmV0dXJuIGdldFRlbXBSZXQwKCl9ZnVuY3Rpb24gX2dldGVudHJvcHkoYnVmZmVyLHNpemUpe2lmKCFfZ2V0ZW50cm9weS5yYW5kb21EZXZpY2Upe19nZXRlbnRyb3B5LnJhbmRvbURldmljZT1nZXRSYW5kb21EZXZpY2UoKX1mb3IodmFyIGk9MDtpPHNpemU7aSsrKXtHUk9XQUJMRV9IRUFQX0k4KClbYnVmZmVyK2k+PjBdPV9nZXRlbnRyb3B5LnJhbmRvbURldmljZSgpfXJldHVybiAwfWZ1bmN0aW9uIF9zZXRUZW1wUmV0MCh2YWwpe3NldFRlbXBSZXQwKHZhbCl9ZnVuY3Rpb24gX19pc0xlYXBZZWFyKHllYXIpe3JldHVybiB5ZWFyJTQ9PT0wJiYoeWVhciUxMDAhPT0wfHx5ZWFyJTQwMD09PTApfWZ1bmN0aW9uIF9fYXJyYXlTdW0oYXJyYXksaW5kZXgpe3ZhciBzdW09MDtmb3IodmFyIGk9MDtpPD1pbmRleDtzdW0rPWFycmF5W2krK10pe31yZXR1cm4gc3VtfXZhciBfX01PTlRIX0RBWVNfTEVBUD1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO3ZhciBfX01PTlRIX0RBWVNfUkVHVUxBUj1bMzEsMjgsMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO2Z1bmN0aW9uIF9fYWRkRGF5cyhkYXRlLGRheXMpe3ZhciBuZXdEYXRlPW5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKTt3aGlsZShkYXlzPjApe3ZhciBsZWFwPV9faXNMZWFwWWVhcihuZXdEYXRlLmdldEZ1bGxZZWFyKCkpO3ZhciBjdXJyZW50TW9udGg9bmV3RGF0ZS5nZXRNb250aCgpO3ZhciBkYXlzSW5DdXJyZW50TW9udGg9KGxlYXA/X19NT05USF9EQVlTX0xFQVA6X19NT05USF9EQVlTX1JFR1VMQVIpW2N1cnJlbnRNb250aF07aWYoZGF5cz5kYXlzSW5DdXJyZW50TW9udGgtbmV3RGF0ZS5nZXREYXRlKCkpe2RheXMtPWRheXNJbkN1cnJlbnRNb250aC1uZXdEYXRlLmdldERhdGUoKSsxO25ld0RhdGUuc2V0RGF0ZSgxKTtpZihjdXJyZW50TW9udGg8MTEpe25ld0RhdGUuc2V0TW9udGgoY3VycmVudE1vbnRoKzEpfWVsc2V7bmV3RGF0ZS5zZXRNb250aCgwKTtuZXdEYXRlLnNldEZ1bGxZZWFyKG5ld0RhdGUuZ2V0RnVsbFllYXIoKSsxKX19ZWxzZXtuZXdEYXRlLnNldERhdGUobmV3RGF0ZS5nZXREYXRlKCkrZGF5cyk7cmV0dXJuIG5ld0RhdGV9fXJldHVybiBuZXdEYXRlfWZ1bmN0aW9uIF9zdHJmdGltZShzLG1heHNpemUsZm9ybWF0LHRtKXt2YXIgdG1fem9uZT1HUk9XQUJMRV9IRUFQX0kzMigpW3RtKzQwPj4yXTt2YXIgZGF0ZT17dG1fc2VjOkdST1dBQkxFX0hFQVBfSTMyKClbdG0+PjJdLHRtX21pbjpHUk9XQUJMRV9IRUFQX0kzMigpW3RtKzQ+PjJdLHRtX2hvdXI6R1JPV0FCTEVfSEVBUF9JMzIoKVt0bSs4Pj4yXSx0bV9tZGF5OkdST1dBQkxFX0hFQVBfSTMyKClbdG0rMTI+PjJdLHRtX21vbjpHUk9XQUJMRV9IRUFQX0kzMigpW3RtKzE2Pj4yXSx0bV95ZWFyOkdST1dBQkxFX0hFQVBfSTMyKClbdG0rMjA+PjJdLHRtX3dkYXk6R1JPV0FCTEVfSEVBUF9JMzIoKVt0bSsyND4+Ml0sdG1feWRheTpHUk9XQUJMRV9IRUFQX0kzMigpW3RtKzI4Pj4yXSx0bV9pc2RzdDpHUk9XQUJMRV9IRUFQX0kzMigpW3RtKzMyPj4yXSx0bV9nbXRvZmY6R1JPV0FCTEVfSEVBUF9JMzIoKVt0bSszNj4+Ml0sdG1fem9uZTp0bV96b25lP1VURjhUb1N0cmluZyh0bV96b25lKToiIn07dmFyIHBhdHRlcm49VVRGOFRvU3RyaW5nKGZvcm1hdCk7dmFyIEVYUEFOU0lPTl9SVUxFU18xPXsiJWMiOiIlYSAlYiAlZCAlSDolTTolUyAlWSIsIiVEIjoiJW0vJWQvJXkiLCIlRiI6IiVZLSVtLSVkIiwiJWgiOiIlYiIsIiVyIjoiJUk6JU06JVMgJXAiLCIlUiI6IiVIOiVNIiwiJVQiOiIlSDolTTolUyIsIiV4IjoiJW0vJWQvJXkiLCIlWCI6IiVIOiVNOiVTIiwiJUVjIjoiJWMiLCIlRUMiOiIlQyIsIiVFeCI6IiVtLyVkLyV5IiwiJUVYIjoiJUg6JU06JVMiLCIlRXkiOiIleSIsIiVFWSI6IiVZIiwiJU9kIjoiJWQiLCIlT2UiOiIlZSIsIiVPSCI6IiVIIiwiJU9JIjoiJUkiLCIlT20iOiIlbSIsIiVPTSI6IiVNIiwiJU9TIjoiJVMiLCIlT3UiOiIldSIsIiVPVSI6IiVVIiwiJU9WIjoiJVYiLCIlT3ciOiIldyIsIiVPVyI6IiVXIiwiJU95IjoiJXkifTtmb3IodmFyIHJ1bGUgaW4gRVhQQU5TSU9OX1JVTEVTXzEpe3BhdHRlcm49cGF0dGVybi5yZXBsYWNlKG5ldyBSZWdFeHAocnVsZSwiZyIpLEVYUEFOU0lPTl9SVUxFU18xW3J1bGVdKX12YXIgV0VFS0RBWVM9WyJTdW5kYXkiLCJNb25kYXkiLCJUdWVzZGF5IiwiV2VkbmVzZGF5IiwiVGh1cnNkYXkiLCJGcmlkYXkiLCJTYXR1cmRheSJdO3ZhciBNT05USFM9WyJKYW51YXJ5IiwiRmVicnVhcnkiLCJNYXJjaCIsIkFwcmlsIiwiTWF5IiwiSnVuZSIsIkp1bHkiLCJBdWd1c3QiLCJTZXB0ZW1iZXIiLCJPY3RvYmVyIiwiTm92ZW1iZXIiLCJEZWNlbWJlciJdO2Z1bmN0aW9uIGxlYWRpbmdTb21ldGhpbmcodmFsdWUsZGlnaXRzLGNoYXJhY3Rlcil7dmFyIHN0cj10eXBlb2YgdmFsdWU9PSJudW1iZXIiP3ZhbHVlLnRvU3RyaW5nKCk6dmFsdWV8fCIiO3doaWxlKHN0ci5sZW5ndGg8ZGlnaXRzKXtzdHI9Y2hhcmFjdGVyWzBdK3N0cn1yZXR1cm4gc3RyfWZ1bmN0aW9uIGxlYWRpbmdOdWxscyh2YWx1ZSxkaWdpdHMpe3JldHVybiBsZWFkaW5nU29tZXRoaW5nKHZhbHVlLGRpZ2l0cywiMCIpfWZ1bmN0aW9uIGNvbXBhcmVCeURheShkYXRlMSxkYXRlMil7ZnVuY3Rpb24gc2duKHZhbHVlKXtyZXR1cm4gdmFsdWU8MD8tMTp2YWx1ZT4wPzE6MH12YXIgY29tcGFyZTtpZigoY29tcGFyZT1zZ24oZGF0ZTEuZ2V0RnVsbFllYXIoKS1kYXRlMi5nZXRGdWxsWWVhcigpKSk9PT0wKXtpZigoY29tcGFyZT1zZ24oZGF0ZTEuZ2V0TW9udGgoKS1kYXRlMi5nZXRNb250aCgpKSk9PT0wKXtjb21wYXJlPXNnbihkYXRlMS5nZXREYXRlKCktZGF0ZTIuZ2V0RGF0ZSgpKX19cmV0dXJuIGNvbXBhcmV9ZnVuY3Rpb24gZ2V0Rmlyc3RXZWVrU3RhcnREYXRlKGphbkZvdXJ0aCl7c3dpdGNoKGphbkZvdXJ0aC5nZXREYXkoKSl7Y2FzZSAwOnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKS0xLDExLDI5KTtjYXNlIDE6cmV0dXJuIGphbkZvdXJ0aDtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLDAsMyk7Y2FzZSAzOnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKSwwLDIpO2Nhc2UgNDpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCksMCwxKTtjYXNlIDU6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCktMSwxMSwzMCl9fWZ1bmN0aW9uIGdldFdlZWtCYXNlZFllYXIoZGF0ZSl7dmFyIHRoaXNEYXRlPV9fYWRkRGF5cyhuZXcgRGF0ZShkYXRlLnRtX3llYXIrMTkwMCwwLDEpLGRhdGUudG1feWRheSk7dmFyIGphbkZvdXJ0aFRoaXNZZWFyPW5ldyBEYXRlKHRoaXNEYXRlLmdldEZ1bGxZZWFyKCksMCw0KTt2YXIgamFuRm91cnRoTmV4dFllYXI9bmV3IERhdGUodGhpc0RhdGUuZ2V0RnVsbFllYXIoKSsxLDAsNCk7dmFyIGZpcnN0V2Vla1N0YXJ0VGhpc1llYXI9Z2V0Rmlyc3RXZWVrU3RhcnREYXRlKGphbkZvdXJ0aFRoaXNZZWFyKTt2YXIgZmlyc3RXZWVrU3RhcnROZXh0WWVhcj1nZXRGaXJzdFdlZWtTdGFydERhdGUoamFuRm91cnRoTmV4dFllYXIpO2lmKGNvbXBhcmVCeURheShmaXJzdFdlZWtTdGFydFRoaXNZZWFyLHRoaXNEYXRlKTw9MCl7aWYoY29tcGFyZUJ5RGF5KGZpcnN0V2Vla1N0YXJ0TmV4dFllYXIsdGhpc0RhdGUpPD0wKXtyZXR1cm4gdGhpc0RhdGUuZ2V0RnVsbFllYXIoKSsxfWVsc2V7cmV0dXJuIHRoaXNEYXRlLmdldEZ1bGxZZWFyKCl9fWVsc2V7cmV0dXJuIHRoaXNEYXRlLmdldEZ1bGxZZWFyKCktMX19dmFyIEVYUEFOU0lPTl9SVUxFU18yPXsiJWEiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBXRUVLREFZU1tkYXRlLnRtX3dkYXldLnN1YnN0cmluZygwLDMpfSwiJUEiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBXRUVLREFZU1tkYXRlLnRtX3dkYXldfSwiJWIiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBNT05USFNbZGF0ZS50bV9tb25dLnN1YnN0cmluZygwLDMpfSwiJUIiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBNT05USFNbZGF0ZS50bV9tb25dfSwiJUMiOmZ1bmN0aW9uKGRhdGUpe3ZhciB5ZWFyPWRhdGUudG1feWVhcisxOTAwO3JldHVybiBsZWFkaW5nTnVsbHMoeWVhci8xMDB8MCwyKX0sIiVkIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gbGVhZGluZ051bGxzKGRhdGUudG1fbWRheSwyKX0sIiVlIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gbGVhZGluZ1NvbWV0aGluZyhkYXRlLnRtX21kYXksMiwiICIpfSwiJWciOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBnZXRXZWVrQmFzZWRZZWFyKGRhdGUpLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpfSwiJUciOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBnZXRXZWVrQmFzZWRZZWFyKGRhdGUpfSwiJUgiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBsZWFkaW5nTnVsbHMoZGF0ZS50bV9ob3VyLDIpfSwiJUkiOmZ1bmN0aW9uKGRhdGUpe3ZhciB0d2VsdmVIb3VyPWRhdGUudG1faG91cjtpZih0d2VsdmVIb3VyPT0wKXR3ZWx2ZUhvdXI9MTI7ZWxzZSBpZih0d2VsdmVIb3VyPjEyKXR3ZWx2ZUhvdXItPTEyO3JldHVybiBsZWFkaW5nTnVsbHModHdlbHZlSG91ciwyKX0sIiVqIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gbGVhZGluZ051bGxzKGRhdGUudG1fbWRheStfX2FycmF5U3VtKF9faXNMZWFwWWVhcihkYXRlLnRtX3llYXIrMTkwMCk/X19NT05USF9EQVlTX0xFQVA6X19NT05USF9EQVlTX1JFR1VMQVIsZGF0ZS50bV9tb24tMSksMyl9LCIlbSI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGxlYWRpbmdOdWxscyhkYXRlLnRtX21vbisxLDIpfSwiJU0iOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBsZWFkaW5nTnVsbHMoZGF0ZS50bV9taW4sMil9LCIlbiI6ZnVuY3Rpb24oKXtyZXR1cm4iXG4ifSwiJXAiOmZ1bmN0aW9uKGRhdGUpe2lmKGRhdGUudG1faG91cj49MCYmZGF0ZS50bV9ob3VyPDEyKXtyZXR1cm4iQU0ifWVsc2V7cmV0dXJuIlBNIn19LCIlUyI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGxlYWRpbmdOdWxscyhkYXRlLnRtX3NlYywyKX0sIiV0IjpmdW5jdGlvbigpe3JldHVybiJcdCJ9LCIldSI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGRhdGUudG1fd2RheXx8N30sIiVVIjpmdW5jdGlvbihkYXRlKXt2YXIgZGF5cz1kYXRlLnRtX3lkYXkrNy1kYXRlLnRtX3dkYXk7cmV0dXJuIGxlYWRpbmdOdWxscyhNYXRoLmZsb29yKGRheXMvNyksMil9LCIlViI6ZnVuY3Rpb24oZGF0ZSl7dmFyIHZhbD1NYXRoLmZsb29yKChkYXRlLnRtX3lkYXkrNy0oZGF0ZS50bV93ZGF5KzYpJTcpLzcpO2lmKChkYXRlLnRtX3dkYXkrMzcxLWRhdGUudG1feWRheS0yKSU3PD0yKXt2YWwrK31pZighdmFsKXt2YWw9NTI7dmFyIGRlYzMxPShkYXRlLnRtX3dkYXkrNy1kYXRlLnRtX3lkYXktMSklNztpZihkZWMzMT09NHx8ZGVjMzE9PTUmJl9faXNMZWFwWWVhcihkYXRlLnRtX3llYXIlNDAwLTEpKXt2YWwrK319ZWxzZSBpZih2YWw9PTUzKXt2YXIgamFuMT0oZGF0ZS50bV93ZGF5KzM3MS1kYXRlLnRtX3lkYXkpJTc7aWYoamFuMSE9NCYmKGphbjEhPTN8fCFfX2lzTGVhcFllYXIoZGF0ZS50bV95ZWFyKSkpdmFsPTF9cmV0dXJuIGxlYWRpbmdOdWxscyh2YWwsMil9LCIldyI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGRhdGUudG1fd2RheX0sIiVXIjpmdW5jdGlvbihkYXRlKXt2YXIgZGF5cz1kYXRlLnRtX3lkYXkrNy0oZGF0ZS50bV93ZGF5KzYpJTc7cmV0dXJuIGxlYWRpbmdOdWxscyhNYXRoLmZsb29yKGRheXMvNyksMil9LCIleSI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuKGRhdGUudG1feWVhcisxOTAwKS50b1N0cmluZygpLnN1YnN0cmluZygyKX0sIiVZIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gZGF0ZS50bV95ZWFyKzE5MDB9LCIleiI6ZnVuY3Rpb24oZGF0ZSl7dmFyIG9mZj1kYXRlLnRtX2dtdG9mZjt2YXIgYWhlYWQ9b2ZmPj0wO29mZj1NYXRoLmFicyhvZmYpLzYwO29mZj1vZmYvNjAqMTAwK29mZiU2MDtyZXR1cm4oYWhlYWQ/IisiOiItIikrU3RyaW5nKCIwMDAwIitvZmYpLnNsaWNlKC00KX0sIiVaIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gZGF0ZS50bV96b25lfSwiJSUiOmZ1bmN0aW9uKCl7cmV0dXJuIiUifX07cGF0dGVybj1wYXR0ZXJuLnJlcGxhY2UoLyUlL2csIlwwXDAiKTtmb3IodmFyIHJ1bGUgaW4gRVhQQU5TSU9OX1JVTEVTXzIpe2lmKHBhdHRlcm4uaW5jbHVkZXMocnVsZSkpe3BhdHRlcm49cGF0dGVybi5yZXBsYWNlKG5ldyBSZWdFeHAocnVsZSwiZyIpLEVYUEFOU0lPTl9SVUxFU18yW3J1bGVdKGRhdGUpKX19cGF0dGVybj1wYXR0ZXJuLnJlcGxhY2UoL1wwXDAvZywiJSIpO3ZhciBieXRlcz1pbnRBcnJheUZyb21TdHJpbmcocGF0dGVybixmYWxzZSk7aWYoYnl0ZXMubGVuZ3RoPm1heHNpemUpe3JldHVybiAwfXdyaXRlQXJyYXlUb01lbW9yeShieXRlcyxzKTtyZXR1cm4gYnl0ZXMubGVuZ3RoLTF9ZnVuY3Rpb24gX3N0cmZ0aW1lX2wocyxtYXhzaXplLGZvcm1hdCx0bSl7cmV0dXJuIF9zdHJmdGltZShzLG1heHNpemUsZm9ybWF0LHRtKX1QVGhyZWFkLmluaXQoKTt2YXIgRlNOb2RlPWZ1bmN0aW9uKHBhcmVudCxuYW1lLG1vZGUscmRldil7aWYoIXBhcmVudCl7cGFyZW50PXRoaXN9dGhpcy5wYXJlbnQ9cGFyZW50O3RoaXMubW91bnQ9cGFyZW50Lm1vdW50O3RoaXMubW91bnRlZD1udWxsO3RoaXMuaWQ9RlMubmV4dElub2RlKys7dGhpcy5uYW1lPW5hbWU7dGhpcy5tb2RlPW1vZGU7dGhpcy5ub2RlX29wcz17fTt0aGlzLnN0cmVhbV9vcHM9e307dGhpcy5yZGV2PXJkZXZ9O3ZhciByZWFkTW9kZT0yOTJ8NzM7dmFyIHdyaXRlTW9kZT0xNDY7T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoRlNOb2RlLnByb3RvdHlwZSx7cmVhZDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMubW9kZSZyZWFkTW9kZSk9PT1yZWFkTW9kZX0sc2V0OmZ1bmN0aW9uKHZhbCl7dmFsP3RoaXMubW9kZXw9cmVhZE1vZGU6dGhpcy5tb2RlJj1+cmVhZE1vZGV9fSx3cml0ZTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMubW9kZSZ3cml0ZU1vZGUpPT09d3JpdGVNb2RlfSxzZXQ6ZnVuY3Rpb24odmFsKXt2YWw/dGhpcy5tb2RlfD13cml0ZU1vZGU6dGhpcy5tb2RlJj1+d3JpdGVNb2RlfX0saXNGb2xkZXI6e2dldDpmdW5jdGlvbigpe3JldHVybiBGUy5pc0Rpcih0aGlzLm1vZGUpfX0saXNEZXZpY2U6e2dldDpmdW5jdGlvbigpe3JldHVybiBGUy5pc0NocmRldih0aGlzLm1vZGUpfX19KTtGUy5GU05vZGU9RlNOb2RlO0ZTLnN0YXRpY0luaXQoKTtlbWJpbmRfaW5pdF9jaGFyQ29kZXMoKTtCaW5kaW5nRXJyb3I9TW9kdWxlWyJCaW5kaW5nRXJyb3IiXT1leHRlbmRFcnJvcihFcnJvciwiQmluZGluZ0Vycm9yIik7SW50ZXJuYWxFcnJvcj1Nb2R1bGVbIkludGVybmFsRXJyb3IiXT1leHRlbmRFcnJvcihFcnJvciwiSW50ZXJuYWxFcnJvciIpO2luaXRfQ2xhc3NIYW5kbGUoKTtpbml0X2VtYmluZCgpO2luaXRfUmVnaXN0ZXJlZFBvaW50ZXIoKTtVbmJvdW5kVHlwZUVycm9yPU1vZHVsZVsiVW5ib3VuZFR5cGVFcnJvciJdPWV4dGVuZEVycm9yKEVycm9yLCJVbmJvdW5kVHlwZUVycm9yIik7aW5pdF9lbXZhbCgpO3ZhciBwcm94aWVkRnVuY3Rpb25UYWJsZT1bbnVsbCxleGl0T25NYWluVGhyZWFkLHB0aHJlYWRDcmVhdGVQcm94aWVkLF9fX3N5c2NhbGxfZmNudGw2NCxfX19zeXNjYWxsX2ZzdGF0NjQsX19fc3lzY2FsbF9mdHJ1bmNhdGU2NCxfX19zeXNjYWxsX2lvY3RsLF9fX3N5c2NhbGxfbHN0YXQ2NCxfX19zeXNjYWxsX25ld2ZzdGF0YXQsX19fc3lzY2FsbF9vcGVuYXQsX19fc3lzY2FsbF9yZW5hbWVhdCxfX19zeXNjYWxsX3N0YXQ2NCxfX19zeXNjYWxsX3VubGlua2F0LF9fbW1hcF9qcyxfX211bm1hcF9qcyxfZW52aXJvbl9nZXQsX2Vudmlyb25fc2l6ZXNfZ2V0LF9mZF9jbG9zZSxfZmRfcmVhZCxfZmRfc2VlayxfZmRfc3luYyxfZmRfd3JpdGVdO2Z1bmN0aW9uIGludEFycmF5RnJvbVN0cmluZyhzdHJpbmd5LGRvbnRBZGROdWxsLGxlbmd0aCl7dmFyIGxlbj1sZW5ndGg+MD9sZW5ndGg6bGVuZ3RoQnl0ZXNVVEY4KHN0cmluZ3kpKzE7dmFyIHU4YXJyYXk9bmV3IEFycmF5KGxlbik7dmFyIG51bUJ5dGVzV3JpdHRlbj1zdHJpbmdUb1VURjhBcnJheShzdHJpbmd5LHU4YXJyYXksMCx1OGFycmF5Lmxlbmd0aCk7aWYoZG9udEFkZE51bGwpdThhcnJheS5sZW5ndGg9bnVtQnl0ZXNXcml0dGVuO3JldHVybiB1OGFycmF5fXZhciBhc21MaWJyYXJ5QXJnPXsiYiI6X19fYXNzZXJ0X2ZhaWwsIm4iOl9fX2N4YV9hbGxvY2F0ZV9leGNlcHRpb24sInUiOl9fX2N4YV9iZWdpbl9jYXRjaCwibGEiOl9fX2N4YV9jdXJyZW50X3ByaW1hcnlfZXhjZXB0aW9uLCJSIjpfX19jeGFfZGVjcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudCwieCI6X19fY3hhX2VuZF9jYXRjaCwiZSI6X19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMiwiaiI6X19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMywicyI6X19fY3hhX2ZyZWVfZXhjZXB0aW9uLCJRIjpfX19jeGFfaW5jcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudCwiYWEiOl9fX2N4YV9yZXRocm93LCJrYSI6X19fY3hhX3JldGhyb3dfcHJpbWFyeV9leGNlcHRpb24sInIiOl9fX2N4YV90aHJvdywibWEiOl9fX2N4YV91bmNhdWdodF9leGNlcHRpb25zLCJ3YSI6X19fZW1zY3JpcHRlbl9pbml0X21haW5fdGhyZWFkX2pzLCJTIjpfX19lbXNjcmlwdGVuX3RocmVhZF9jbGVhbnVwLCJyYSI6X19fcHRocmVhZF9jcmVhdGVfanMsImYiOl9fX3Jlc3VtZUV4Y2VwdGlvbiwiRmEiOl9fX3N5c2NhbGxfZnN0YXQ2NCwiZWEiOl9fX3N5c2NhbGxfZnRydW5jYXRlNjQsIkNhIjpfX19zeXNjYWxsX2xzdGF0NjQsIkRhIjpfX19zeXNjYWxsX25ld2ZzdGF0YXQsIkhhIjpfX19zeXNjYWxsX29wZW5hdCwicWEiOl9fX3N5c2NhbGxfcmVuYW1lYXQsIkVhIjpfX19zeXNjYWxsX3N0YXQ2NCwib2EiOl9fX3N5c2NhbGxfdW5saW5rYXQsIkthIjpfX2RsaW5pdCwiVyI6X19kbG9wZW5fanMsIkxhIjpfX2Rsc3ltX2pzLCJmYSI6X19lbWJpbmRfcmVnaXN0ZXJfYmlnaW50LCJOYSI6X19lbWJpbmRfcmVnaXN0ZXJfYm9vbCwiWGEiOl9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzLCJXYSI6X19lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfY29uc3RydWN0b3IsInkiOl9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2Z1bmN0aW9uLCJNYSI6X19lbWJpbmRfcmVnaXN0ZXJfZW12YWwsIloiOl9fZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0LCJBIjpfX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyLCJ0IjpfX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldywiWSI6X19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZywiTCI6X19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmcsIk9hIjpfX2VtYmluZF9yZWdpc3Rlcl92b2lkLCJWIjpfX2Vtc2NyaXB0ZW5fZGF0ZV9ub3csInNhIjpfX2Vtc2NyaXB0ZW5fZGVmYXVsdF9wdGhyZWFkX3N0YWNrX3NpemUsIkphIjpfX2Vtc2NyaXB0ZW5fZ2V0X25vd19pc19tb25vdG9uaWMsInRhIjpfX2Vtc2NyaXB0ZW5fbm90aWZ5X3Rhc2tfcXVldWUsInlhIjpfX2Vtc2NyaXB0ZW5fc2V0X29mZnNjcmVlbmNhbnZhc19zaXplLCJTYSI6X19lbXZhbF9kZWNyZWYsImlhIjpfX2VtdmFsX2luY3JlZiwiSSI6X19lbXZhbF90YWtlX3ZhbHVlLCJ1YSI6X19tbWFwX2pzLCJ2YSI6X19tdW5tYXBfanMsImQiOl9hYm9ydCwiVCI6X2Vtc2NyaXB0ZW5fY2hlY2tfYmxvY2tpbmdfYWxsb3dlZCwicGEiOl9lbXNjcmlwdGVuX2dldF9oZWFwX21heCwidyI6X2Vtc2NyaXB0ZW5fZ2V0X25vdywiR2EiOl9lbXNjcmlwdGVuX21lbWNweV9iaWcsIl8iOl9lbXNjcmlwdGVuX251bV9sb2dpY2FsX2NvcmVzLCJ4YSI6X2Vtc2NyaXB0ZW5fcmVjZWl2ZV9vbl9tYWluX3RocmVhZF9qcywibmEiOl9lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwLCJJYSI6X2Vtc2NyaXB0ZW5fdW53aW5kX3RvX2pzX2V2ZW50X2xvb3AsInphIjpfZW52aXJvbl9nZXQsIkFhIjpfZW52aXJvbl9zaXplc19nZXQsIiQiOl9leGl0LCJYIjpfZmRfY2xvc2UsIlUiOl9mZF9yZWFkLCJWYSI6X2ZkX3NlZWssIkJhIjpfZmRfc3luYywiSyI6X2ZkX3dyaXRlLCJjIjpfZ2V0VGVtcFJldDAsImdhIjpfZ2V0ZW50cm9weSwiTiI6aW52b2tlX2RpaWksIlJhIjppbnZva2VfZmksIk8iOmludm9rZV9maWlpLCJxIjppbnZva2VfaSwiZyI6aW52b2tlX2lpLCJQYSI6aW52b2tlX2lpZGlpLCJoIjppbnZva2VfaWlpLCJtIjppbnZva2VfaWlpaSwibyI6aW52b2tlX2lpaWlpLCJqYSI6aW52b2tlX2lpaWlpZCwiRSI6aW52b2tlX2lpaWlpaSwieiI6aW52b2tlX2lpaWlpaWksIlAiOmludm9rZV9paWlpaWlpaSwiSCI6aW52b2tlX2lpaWlpaWlpaWlpaSwiVWEiOmludm9rZV9qLCJUYSI6aW52b2tlX2ppaWlpLCJsIjppbnZva2VfdiwiayI6aW52b2tlX3ZpLCJpIjppbnZva2VfdmlpLCJDIjppbnZva2VfdmlpZCwiTSI6aW52b2tlX3ZpaWRpLCJwIjppbnZva2VfdmlpaSwiUWEiOmludm9rZV92aWlpZGlpaSwiSiI6aW52b2tlX3ZpaWlpLCJjYSI6aW52b2tlX3ZpaWlpZGksImRhIjppbnZva2VfdmlpaWlpLCJ2IjppbnZva2VfdmlpaWlpaWksIkYiOmludm9rZV92aWlpaWlpaWRpLCJiYSI6aW52b2tlX3ZpaWlpaWlpaSwiRCI6aW52b2tlX3ZpaWlpaWlpaWlpLCJHIjppbnZva2VfdmlpaWlpaWlpaWlpaWlpaSwiYSI6d2FzbU1lbW9yeXx8TW9kdWxlWyJ3YXNtTWVtb3J5Il0sIkIiOl9zZXRUZW1wUmV0MCwiaGEiOl9zdHJmdGltZV9sfTt2YXIgYXNtPWNyZWF0ZVdhc20oKTt2YXIgX19fd2FzbV9jYWxsX2N0b3JzPU1vZHVsZVsiX19fd2FzbV9jYWxsX2N0b3JzIl09ZnVuY3Rpb24oKXtyZXR1cm4oX19fd2FzbV9jYWxsX2N0b3JzPU1vZHVsZVsiX19fd2FzbV9jYWxsX2N0b3JzIl09TW9kdWxlWyJhc20iXVsiWWEiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX21hbGxvYz1Nb2R1bGVbIl9tYWxsb2MiXT1mdW5jdGlvbigpe3JldHVybihfbWFsbG9jPU1vZHVsZVsiX21hbGxvYyJdPU1vZHVsZVsiYXNtIl1bIl9hIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9mcmVlPU1vZHVsZVsiX2ZyZWUiXT1mdW5jdGlvbigpe3JldHVybihfZnJlZT1Nb2R1bGVbIl9mcmVlIl09TW9kdWxlWyJhc20iXVsiJGEiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19fZXJybm9fbG9jYXRpb249TW9kdWxlWyJfX19lcnJub19sb2NhdGlvbiJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX2Vycm5vX2xvY2F0aW9uPU1vZHVsZVsiX19fZXJybm9fbG9jYXRpb24iXT1Nb2R1bGVbImFzbSJdWyJhYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfcHRocmVhZF9zZWxmPU1vZHVsZVsiX3B0aHJlYWRfc2VsZiJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9wdGhyZWFkX3NlbGY9TW9kdWxlWyJfcHRocmVhZF9zZWxmIl09TW9kdWxlWyJhc20iXVsiYmIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX2Vtc2NyaXB0ZW5fdGxzX2luaXQ9TW9kdWxlWyJfZW1zY3JpcHRlbl90bHNfaW5pdCJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9lbXNjcmlwdGVuX3Rsc19pbml0PU1vZHVsZVsiX2Vtc2NyaXB0ZW5fdGxzX2luaXQiXT1Nb2R1bGVbImFzbSJdWyJjYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfZW1zY3JpcHRlbl9idWlsdGluX21lbWFsaWduPU1vZHVsZVsiX2Vtc2NyaXB0ZW5fYnVpbHRpbl9tZW1hbGlnbiJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9lbXNjcmlwdGVuX2J1aWx0aW5fbWVtYWxpZ249TW9kdWxlWyJfZW1zY3JpcHRlbl9idWlsdGluX21lbWFsaWduIl09TW9kdWxlWyJhc20iXVsiZGIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19fZ2V0VHlwZU5hbWU9TW9kdWxlWyJfX19nZXRUeXBlTmFtZSJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX2dldFR5cGVOYW1lPU1vZHVsZVsiX19fZ2V0VHlwZU5hbWUiXT1Nb2R1bGVbImFzbSJdWyJlYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX19lbWJpbmRfcmVnaXN0ZXJfbmF0aXZlX2FuZF9idWlsdGluX3R5cGVzPU1vZHVsZVsiX19fZW1iaW5kX3JlZ2lzdGVyX25hdGl2ZV9hbmRfYnVpbHRpbl90eXBlcyJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX2VtYmluZF9yZWdpc3Rlcl9uYXRpdmVfYW5kX2J1aWx0aW5fdHlwZXM9TW9kdWxlWyJfX19lbWJpbmRfcmVnaXN0ZXJfbmF0aXZlX2FuZF9idWlsdGluX3R5cGVzIl09TW9kdWxlWyJhc20iXVsiZmIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19fc3RkaW9fZXhpdD1Nb2R1bGVbIl9fX3N0ZGlvX2V4aXQiXT1mdW5jdGlvbigpe3JldHVybihfX19zdGRpb19leGl0PU1vZHVsZVsiX19fc3RkaW9fZXhpdCJdPU1vZHVsZVsiYXNtIl1bImdiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX2Z1bmNzX29uX2V4aXQ9TW9kdWxlWyJfX19mdW5jc19vbl9leGl0Il09ZnVuY3Rpb24oKXtyZXR1cm4oX19fZnVuY3Nfb25fZXhpdD1Nb2R1bGVbIl9fX2Z1bmNzX29uX2V4aXQiXT1Nb2R1bGVbImFzbSJdWyJoYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQ9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQiXT1mdW5jdGlvbigpe3JldHVybihfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQ9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQiXT1Nb2R1bGVbImFzbSJdWyJpYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQ9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQiXT1mdW5jdGlvbigpe3JldHVybihfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQ9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQiXT1Nb2R1bGVbImFzbSJdWyJqYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfZW1zY3JpcHRlbl9ydW5faW5fbWFpbl9ydW50aW1lX3RocmVhZF9qcz1Nb2R1bGVbIl9lbXNjcmlwdGVuX3J1bl9pbl9tYWluX3J1bnRpbWVfdGhyZWFkX2pzIl09ZnVuY3Rpb24oKXtyZXR1cm4oX2Vtc2NyaXB0ZW5fcnVuX2luX21haW5fcnVudGltZV90aHJlYWRfanM9TW9kdWxlWyJfZW1zY3JpcHRlbl9ydW5faW5fbWFpbl9ydW50aW1lX3RocmVhZF9qcyJdPU1vZHVsZVsiYXNtIl1bImtiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fZW1zY3JpcHRlbl9wcm94eV9leGVjdXRlX3Rhc2tfcXVldWU9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fcHJveHlfZXhlY3V0ZV90YXNrX3F1ZXVlIl09ZnVuY3Rpb24oKXtyZXR1cm4oX19lbXNjcmlwdGVuX3Byb3h5X2V4ZWN1dGVfdGFza19xdWV1ZT1Nb2R1bGVbIl9fZW1zY3JpcHRlbl9wcm94eV9leGVjdXRlX3Rhc2tfcXVldWUiXT1Nb2R1bGVbImFzbSJdWyJsYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX2Vtc2NyaXB0ZW5fdGhyZWFkX2ZyZWVfZGF0YT1Nb2R1bGVbIl9fZW1zY3JpcHRlbl90aHJlYWRfZnJlZV9kYXRhIl09ZnVuY3Rpb24oKXtyZXR1cm4oX19lbXNjcmlwdGVuX3RocmVhZF9mcmVlX2RhdGE9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2ZyZWVfZGF0YSJdPU1vZHVsZVsiYXNtIl1bIm1iIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1Nb2R1bGVbIl9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdCJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1Nb2R1bGVbIl9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdCJdPU1vZHVsZVsiYXNtIl1bIm5iIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9zZXRUaHJldz1Nb2R1bGVbIl9zZXRUaHJldyJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9zZXRUaHJldz1Nb2R1bGVbIl9zZXRUaHJldyJdPU1vZHVsZVsiYXNtIl1bIm9iIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9lbXNjcmlwdGVuX3N0YWNrX3NldF9saW1pdHM9TW9kdWxlWyJfZW1zY3JpcHRlbl9zdGFja19zZXRfbGltaXRzIl09ZnVuY3Rpb24oKXtyZXR1cm4oX2Vtc2NyaXB0ZW5fc3RhY2tfc2V0X2xpbWl0cz1Nb2R1bGVbIl9lbXNjcmlwdGVuX3N0YWNrX3NldF9saW1pdHMiXT1Nb2R1bGVbImFzbSJdWyJwYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBzdGFja1NhdmU9TW9kdWxlWyJzdGFja1NhdmUiXT1mdW5jdGlvbigpe3JldHVybihzdGFja1NhdmU9TW9kdWxlWyJzdGFja1NhdmUiXT1Nb2R1bGVbImFzbSJdWyJxYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBzdGFja1Jlc3RvcmU9TW9kdWxlWyJzdGFja1Jlc3RvcmUiXT1mdW5jdGlvbigpe3JldHVybihzdGFja1Jlc3RvcmU9TW9kdWxlWyJzdGFja1Jlc3RvcmUiXT1Nb2R1bGVbImFzbSJdWyJyYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBzdGFja0FsbG9jPU1vZHVsZVsic3RhY2tBbGxvYyJdPWZ1bmN0aW9uKCl7cmV0dXJuKHN0YWNrQWxsb2M9TW9kdWxlWyJzdGFja0FsbG9jIl09TW9kdWxlWyJhc20iXVsic2IiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19fY3hhX2Nhbl9jYXRjaD1Nb2R1bGVbIl9fX2N4YV9jYW5fY2F0Y2giXT1mdW5jdGlvbigpe3JldHVybihfX19jeGFfY2FuX2NhdGNoPU1vZHVsZVsiX19fY3hhX2Nhbl9jYXRjaCJdPU1vZHVsZVsiYXNtIl1bInRiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX2N4YV9pc19wb2ludGVyX3R5cGU9TW9kdWxlWyJfX19jeGFfaXNfcG9pbnRlcl90eXBlIl09ZnVuY3Rpb24oKXtyZXR1cm4oX19fY3hhX2lzX3BvaW50ZXJfdHlwZT1Nb2R1bGVbIl9fX2N4YV9pc19wb2ludGVyX3R5cGUiXT1Nb2R1bGVbImFzbSJdWyJ1YiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2lpaWlqPU1vZHVsZVsiZHluQ2FsbF9paWlpaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlpaWo9TW9kdWxlWyJkeW5DYWxsX2lpaWlqIl09TW9kdWxlWyJhc20iXVsidmIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9qaWk9TW9kdWxlWyJkeW5DYWxsX2ppaSJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfamlpPU1vZHVsZVsiZHluQ2FsbF9qaWkiXT1Nb2R1bGVbImFzbSJdWyJ3YiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2pqaj1Nb2R1bGVbImR5bkNhbGxfampqIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qamo9TW9kdWxlWyJkeW5DYWxsX2pqaiJdPU1vZHVsZVsiYXNtIl1bInhiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfamppPU1vZHVsZVsiZHluQ2FsbF9qamkiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2pqaT1Nb2R1bGVbImR5bkNhbGxfamppIl09TW9kdWxlWyJhc20iXVsieWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9qaWlpPU1vZHVsZVsiZHluQ2FsbF9qaWlpIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qaWlpPU1vZHVsZVsiZHluQ2FsbF9qaWlpIl09TW9kdWxlWyJhc20iXVsiemIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9paWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlqaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlpaWpqPU1vZHVsZVsiZHluQ2FsbF9paWlpamoiXT1Nb2R1bGVbImFzbSJdWyJBYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX3ZpaWpqPU1vZHVsZVsiZHluQ2FsbF92aWlqaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfdmlpamo9TW9kdWxlWyJkeW5DYWxsX3ZpaWpqIl09TW9kdWxlWyJhc20iXVsiQmIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF92aWlpampqaj1Nb2R1bGVbImR5bkNhbGxfdmlpaWpqamoiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX3ZpaWlqampqPU1vZHVsZVsiZHluQ2FsbF92aWlpampqaiJdPU1vZHVsZVsiYXNtIl1bIkNiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfaWlqamlpaWk9TW9kdWxlWyJkeW5DYWxsX2lpamppaWlpIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9paWpqaWlpaT1Nb2R1bGVbImR5bkNhbGxfaWlqamlpaWkiXT1Nb2R1bGVbImFzbSJdWyJEYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2ppamk9TW9kdWxlWyJkeW5DYWxsX2ppamkiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2ppamk9TW9kdWxlWyJkeW5DYWxsX2ppamkiXT1Nb2R1bGVbImFzbSJdWyJFYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2o9TW9kdWxlWyJkeW5DYWxsX2oiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2o9TW9kdWxlWyJkeW5DYWxsX2oiXT1Nb2R1bGVbImFzbSJdWyJGYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX3ZpaWppaT1Nb2R1bGVbImR5bkNhbGxfdmlpamlpIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF92aWlqaWk9TW9kdWxlWyJkeW5DYWxsX3ZpaWppaSJdPU1vZHVsZVsiYXNtIl1bIkdiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfamlpaWk9TW9kdWxlWyJkeW5DYWxsX2ppaWlpIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qaWlpaT1Nb2R1bGVbImR5bkNhbGxfamlpaWkiXT1Nb2R1bGVbImFzbSJdWyJIYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2lpaWlpaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlqIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9paWlpaWo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpaiJdPU1vZHVsZVsiYXNtIl1bIkliIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfaWlpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlqaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlqaiJdPU1vZHVsZVsiYXNtIl1bIkpiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfaWlpaWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpaWpqIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9paWlpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlpamoiXT1Nb2R1bGVbImFzbSJdWyJLYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX2Vtc2NyaXB0ZW5fYWxsb3dfbWFpbl9ydW50aW1lX3F1ZXVlZF9jYWxscz1Nb2R1bGVbIl9fZW1zY3JpcHRlbl9hbGxvd19tYWluX3J1bnRpbWVfcXVldWVkX2NhbGxzIl09MjQwMzU2O2Z1bmN0aW9uIGludm9rZV9paShpbmRleCxhMSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaShpbmRleCxhMSxhMil7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpKGluZGV4LGExKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpKGluZGV4LGExLGEyLGEzKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpKGluZGV4LGExLGEyKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9pKGluZGV4KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWkoaW5kZXgsYTEsYTIsYTMpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2ZpKGluZGV4LGExKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNil7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWlpaWlkaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdihpbmRleCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpZGkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlkaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNixhNyl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlkKGluZGV4LGExLGEyLGEzKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpKGluZGV4LGExLGEyLGEzLGE0KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpZGkoaW5kZXgsYTEsYTIsYTMsYTQpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpKGluZGV4LGExLGEyLGEzLGE0KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWRpaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpZChpbmRleCxhMSxhMixhMyxhNCxhNSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfZmlpaShpbmRleCxhMSxhMixhMyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2RpaWkoaW5kZXgsYTEsYTIsYTMpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaWlpaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCxhMTEpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSxhMTAsYTExKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTksYTEwKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaWlpaWlpaWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTksYTEwLGExMSxhMTIsYTEzLGExNCxhMTUpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCxhMTEsYTEyLGExMyxhMTQsYTE1KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2ooaW5kZXgpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGR5bkNhbGxfaihpbmRleCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9qaWlpaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZHluQ2FsbF9qaWlpaShpbmRleCxhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fU1vZHVsZVsia2VlcFJ1bnRpbWVBbGl2ZSJdPWtlZXBSdW50aW1lQWxpdmU7TW9kdWxlWyJ3YXNtTWVtb3J5Il09d2FzbU1lbW9yeTtNb2R1bGVbIkV4aXRTdGF0dXMiXT1FeGl0U3RhdHVzO01vZHVsZVsiUFRocmVhZCJdPVBUaHJlYWQ7dmFyIGNhbGxlZFJ1bjtmdW5jdGlvbiBFeGl0U3RhdHVzKHN0YXR1cyl7dGhpcy5uYW1lPSJFeGl0U3RhdHVzIjt0aGlzLm1lc3NhZ2U9IlByb2dyYW0gdGVybWluYXRlZCB3aXRoIGV4aXQoIitzdGF0dXMrIikiO3RoaXMuc3RhdHVzPXN0YXR1c31kZXBlbmRlbmNpZXNGdWxmaWxsZWQ9ZnVuY3Rpb24gcnVuQ2FsbGVyKCl7aWYoIWNhbGxlZFJ1bilydW4oKTtpZighY2FsbGVkUnVuKWRlcGVuZGVuY2llc0Z1bGZpbGxlZD1ydW5DYWxsZXJ9O2Z1bmN0aW9uIHJ1bihhcmdzKXthcmdzPWFyZ3N8fGFyZ3VtZW50c187aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1pZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXtyZWFkeVByb21pc2VSZXNvbHZlKE1vZHVsZSk7aW5pdFJ1bnRpbWUoKTtwb3N0TWVzc2FnZSh7ImNtZCI6ImxvYWRlZCJ9KTtyZXR1cm59cHJlUnVuKCk7aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1mdW5jdGlvbiBkb1J1bigpe2lmKGNhbGxlZFJ1bilyZXR1cm47Y2FsbGVkUnVuPXRydWU7TW9kdWxlWyJjYWxsZWRSdW4iXT10cnVlO2lmKEFCT1JUKXJldHVybjtpbml0UnVudGltZSgpO3JlYWR5UHJvbWlzZVJlc29sdmUoTW9kdWxlKTtpZihNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0pTW9kdWxlWyJvblJ1bnRpbWVJbml0aWFsaXplZCJdKCk7cG9zdFJ1bigpfWlmKE1vZHVsZVsic2V0U3RhdHVzIl0pe01vZHVsZVsic2V0U3RhdHVzIl0oIlJ1bm5pbmcuLi4iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe01vZHVsZVsic2V0U3RhdHVzIl0oIiIpfSwxKTtkb1J1bigpfSwxKX1lbHNle2RvUnVuKCl9fU1vZHVsZVsicnVuIl09cnVuO2Z1bmN0aW9uIGV4aXQoc3RhdHVzLGltcGxpY2l0KXtFWElUU1RBVFVTPXN0YXR1cztpZighaW1wbGljaXQpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpe2V4aXRPbk1haW5UaHJlYWQoc3RhdHVzKTt0aHJvdyJ1bndpbmQifWVsc2V7fX1pZigha2VlcFJ1bnRpbWVBbGl2ZSgpKXtleGl0UnVudGltZSgpfXByb2NFeGl0KHN0YXR1cyl9ZnVuY3Rpb24gcHJvY0V4aXQoY29kZSl7RVhJVFNUQVRVUz1jb2RlO2lmKCFrZWVwUnVudGltZUFsaXZlKCkpe1BUaHJlYWQudGVybWluYXRlQWxsVGhyZWFkcygpO2lmKE1vZHVsZVsib25FeGl0Il0pTW9kdWxlWyJvbkV4aXQiXShjb2RlKTtBQk9SVD10cnVlfXF1aXRfKGNvZGUsbmV3IEV4aXRTdGF0dXMoY29kZSkpfWlmKE1vZHVsZVsicHJlSW5pdCJdKXtpZih0eXBlb2YgTW9kdWxlWyJwcmVJbml0Il09PSJmdW5jdGlvbiIpTW9kdWxlWyJwcmVJbml0Il09W01vZHVsZVsicHJlSW5pdCJdXTt3aGlsZShNb2R1bGVbInByZUluaXQiXS5sZW5ndGg+MCl7TW9kdWxlWyJwcmVJbml0Il0ucG9wKCkoKX19cnVuKCk7CgoKICByZXR1cm4gTW9kdWxlLnJlYWR5Cn0KKTsKfSkoKTsKY3JlYXRlV2FzbU11bHRpSW5zdGFuY2UgPSBNb2R1bGU7IH0gICAgCiAgICAKICAgICAgICAgICAgIWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO3ZhciBlPU9iamVjdC5kZWZpbmVQcm9wZXJ0eSxhPSh0LHIsbik9PigoKHQscixuKT0+e3IgaW4gdD9lKHQscix7ZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6bn0pOnRbcl09bn0pKHQsInN5bWJvbCIhPXR5cGVvZiByP3IrIiI6cixuKSxuKTtjbGFzcyBse31hKGwsInVwZGF0ZXMiLHt0cmFuc2Zvcm1lcl9uZXc6Ik5ldyB0cmFuc2Zvcm1lciIsdHJhbnNmb3JtZXJfbnVsbDoiTnVsbCB0cmFuc2Zvcm1lciJ9KSxhKGwsImVycm9ycyIse3RyYW5zZm9ybWVyX25vbmU6Ik5vIHRyYW5zZm9ybWVycyBwcm92aWRlZCIsdHJhbnNmb3JtZXJfc3RhcnQ6IkNhbm5vdCBzdGFydCB0cmFuc2Zvcm1lciIsdHJhbnNmb3JtZXJfdHJhbnNmb3JtOiJDYW5ub3QgdHJhbnNmb3JtIGZyYW1lIix0cmFuc2Zvcm1lcl9mbHVzaDoiQ2Fubm90IGZsdXNoIHRyYW5zZm9ybWVyIixyZWFkYWJsZV9udWxsOiJSZWFkYWJsZSBpcyBudWxsIix3cml0YWJsZV9udWxsOiJXcml0YWJsZSBpcyBudWxsIn0pO2NvbnN0IHQ9bmV3IFdlYWtNYXAscj1uZXcgV2Vha01hcCxuPW5ldyBXZWFrTWFwLGM9U3ltYm9sKCJhbnlQcm9kdWNlciIpLGY9UHJvbWlzZS5yZXNvbHZlKCksaD1TeW1ib2woImxpc3RlbmVyQWRkZWQiKSx1PVN5bWJvbCgibGlzdGVuZXJSZW1vdmVkIik7bGV0IGQ9ITE7ZnVuY3Rpb24gZyhlKXtpZigic3RyaW5nIiE9dHlwZW9mIGUmJiJzeW1ib2wiIT10eXBlb2YgZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJldmVudE5hbWUgbXVzdCBiZSBhIHN0cmluZyBvciBhIHN5bWJvbCIpfWZ1bmN0aW9uIFQoZSl7aWYoImZ1bmN0aW9uIiE9dHlwZW9mIGUpdGhyb3cgbmV3IFR5cGVFcnJvcigibGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uIil9ZnVuY3Rpb24gXyhlLHQpe2NvbnN0IG49ci5nZXQoZSk7cmV0dXJuIG4uaGFzKHQpfHxuLnNldCh0LG5ldyBTZXQpLG4uZ2V0KHQpfWZ1bmN0aW9uIGIoZSx0KXtjb25zdCByPSJzdHJpbmciPT10eXBlb2YgdHx8InN5bWJvbCI9PXR5cGVvZiB0P3Q6YyxmPW4uZ2V0KGUpO3JldHVybiBmLmhhcyhyKXx8Zi5zZXQocixuZXcgU2V0KSxmLmdldChyKX1mdW5jdGlvbiAkKGUsdCl7dD1BcnJheS5pc0FycmF5KHQpP3Q6W3RdO2xldCByPSExLHM9KCk9Pnt9LG49W107Y29uc3QgYz17ZW5xdWV1ZShlKXtuLnB1c2goZSkscygpfSxmaW5pc2goKXtyPSEwLHMoKX19O2Zvcihjb25zdCBmIG9mIHQpYihlLGYpLmFkZChjKTtyZXR1cm57YXN5bmMgbmV4dCgpe3JldHVybiBuPzA9PT1uLmxlbmd0aD9yPyhuPXZvaWQgMCx0aGlzLm5leHQoKSk6KGF3YWl0IG5ldyBQcm9taXNlKChlPT57cz1lfSkpLHRoaXMubmV4dCgpKTp7ZG9uZTohMSx2YWx1ZTphd2FpdCBuLnNoaWZ0KCl9Ontkb25lOiEwfX0sYXN5bmMgcmV0dXJuKHIpe249dm9pZCAwO2Zvcihjb25zdCBuIG9mIHQpYihlLG4pLmRlbGV0ZShjKTtyZXR1cm4gcygpLGFyZ3VtZW50cy5sZW5ndGg+MD97ZG9uZTohMCx2YWx1ZTphd2FpdCByfTp7ZG9uZTohMH19LFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKXtyZXR1cm4gdGhpc319fWZ1bmN0aW9uIEgoZSl7aWYodm9pZCAwPT09ZSlyZXR1cm4gcDtpZighQXJyYXkuaXNBcnJheShlKSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgbWV0aG9kTmFtZXNgIG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncyIpO2Zvcihjb25zdCB0IG9mIGUpaWYoIXAuaW5jbHVkZXModCkpdGhyb3cic3RyaW5nIiE9dHlwZW9mIHQ/bmV3IFR5cGVFcnJvcigiYG1ldGhvZE5hbWVzYCBlbGVtZW50IG11c3QgYmUgYSBzdHJpbmciKTpuZXcgRXJyb3IoYCR7dH0gaXMgbm90IEVtaXR0ZXJ5IG1ldGhvZGApO3JldHVybiBlfWNvbnN0IEk9ZT0+ZT09PWh8fGU9PT11O2NsYXNzIG17c3RhdGljIG1peGluKGUsdCl7cmV0dXJuIHQ9SCh0KSxyPT57aWYoImZ1bmN0aW9uIiE9dHlwZW9mIHIpdGhyb3cgbmV3IFR5cGVFcnJvcigiYHRhcmdldGAgbXVzdCBiZSBmdW5jdGlvbiIpO2Zvcihjb25zdCBlIG9mIHQpaWYodm9pZCAwIT09ci5wcm90b3R5cGVbZV0pdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvcGVydHkgXGAke2V9XGAgYWxyZWFkeSBleGlzdHMgb24gXGB0YXJnZXRcYGApO09iamVjdC5kZWZpbmVQcm9wZXJ0eShyLnByb3RvdHlwZSxlLHtlbnVtZXJhYmxlOiExLGdldDpmdW5jdGlvbiBvKCl7cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLGUse2VudW1lcmFibGU6ITEsdmFsdWU6bmV3IG19KSx0aGlzW2VdfX0pO2NvbnN0IGk9dD0+ZnVuY3Rpb24oLi4ucil7cmV0dXJuIHRoaXNbZV1bdF0oLi4ucil9O2Zvcihjb25zdCBlIG9mIHQpT2JqZWN0LmRlZmluZVByb3BlcnR5KHIucHJvdG90eXBlLGUse2VudW1lcmFibGU6ITEsdmFsdWU6aShlKX0pO3JldHVybiByfX1zdGF0aWMgZ2V0IGlzRGVidWdFbmFibGVkKCl7aWYoIm9iamVjdCIhPXR5cGVvZiBwcm9jZXNzKXJldHVybiBkO2NvbnN0e2VudjplfT1wcm9jZXNzfHx7ZW52Ont9fTtyZXR1cm4iZW1pdHRlcnkiPT09ZS5ERUJVR3x8IioiPT09ZS5ERUJVR3x8ZH1zdGF0aWMgc2V0IGlzRGVidWdFbmFibGVkKGUpe2Q9ZX1jb25zdHJ1Y3RvcihlPXt9KXt0LnNldCh0aGlzLG5ldyBTZXQpLHIuc2V0KHRoaXMsbmV3IE1hcCksbi5zZXQodGhpcyxuZXcgTWFwKSx0aGlzLmRlYnVnPWUuZGVidWd8fHt9LHZvaWQgMD09PXRoaXMuZGVidWcuZW5hYmxlZCYmKHRoaXMuZGVidWcuZW5hYmxlZD0hMSksdGhpcy5kZWJ1Zy5sb2dnZXJ8fCh0aGlzLmRlYnVnLmxvZ2dlcj0oZSx0LHIsbik9Pnt0cnl7bj1KU09OLnN0cmluZ2lmeShuKX1jYXRjaHtuPWBPYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIGtleXMgZmFpbGVkIHRvIHN0cmluZ2lmeTogJHtPYmplY3Qua2V5cyhuKS5qb2luKCIsIil9YH0ic3ltYm9sIj09dHlwZW9mIHImJihyPXIudG9TdHJpbmcoKSk7Y29uc3QgYz1uZXcgRGF0ZSxmPWAke2MuZ2V0SG91cnMoKX06JHtjLmdldE1pbnV0ZXMoKX06JHtjLmdldFNlY29uZHMoKX0uJHtjLmdldE1pbGxpc2Vjb25kcygpfWA7Y29uc29sZS5sb2coYFske2Z9XVtlbWl0dGVyeToke2V9XVske3R9XSBFdmVudCBOYW1lOiAke3J9XG5cdGRhdGE6ICR7bn1gKX0pfWxvZ0lmRGVidWdFbmFibGVkKGUsdCxyKXsobS5pc0RlYnVnRW5hYmxlZHx8dGhpcy5kZWJ1Zy5lbmFibGVkKSYmdGhpcy5kZWJ1Zy5sb2dnZXIoZSx0aGlzLmRlYnVnLm5hbWUsdCxyKX1vbihlLHQpe1QodCksZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCByIG9mIGUpZyhyKSxfKHRoaXMscikuYWRkKHQpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInN1YnNjcmliZSIscix2b2lkIDApLEkocil8fHRoaXMuZW1pdChoLHtldmVudE5hbWU6cixsaXN0ZW5lcjp0fSk7cmV0dXJuIHRoaXMub2ZmLmJpbmQodGhpcyxlLHQpfW9mZihlLHQpe1QodCksZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCByIG9mIGUpZyhyKSxfKHRoaXMscikuZGVsZXRlKHQpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInVuc3Vic2NyaWJlIixyLHZvaWQgMCksSShyKXx8dGhpcy5lbWl0KHUse2V2ZW50TmFtZTpyLGxpc3RlbmVyOnR9KX1vbmNlKGUpe3JldHVybiBuZXcgUHJvbWlzZSgodD0+e2NvbnN0IHI9dGhpcy5vbihlLChlPT57cigpLHQoZSl9KSl9KSl9ZXZlbnRzKGUpe2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgdCBvZiBlKWcodCk7cmV0dXJuICQodGhpcyxlKX1hc3luYyBlbWl0KGUscil7ZyhlKSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJlbWl0IixlLHIpLGZ1bmN0aW9uIHEoZSx0LHIpe2NvbnN0IGY9bi5nZXQoZSk7aWYoZi5oYXModCkpZm9yKGNvbnN0IG4gb2YgZi5nZXQodCkpbi5lbnF1ZXVlKHIpO2lmKGYuaGFzKGMpKXtjb25zdCBlPVByb21pc2UuYWxsKFt0LHJdKTtmb3IoY29uc3QgdCBvZiBmLmdldChjKSl0LmVucXVldWUoZSl9fSh0aGlzLGUscik7Y29uc3QgaD1fKHRoaXMsZSksdT10LmdldCh0aGlzKSxkPVsuLi5oXSxwPUkoZSk/W106Wy4uLnVdO2F3YWl0IGYsYXdhaXQgUHJvbWlzZS5hbGwoWy4uLmQubWFwKChhc3luYyBlPT57aWYoaC5oYXMoZSkpcmV0dXJuIGUocil9KSksLi4ucC5tYXAoKGFzeW5jIHQ9PntpZih1Lmhhcyh0KSlyZXR1cm4gdChlLHIpfSkpXSl9YXN5bmMgZW1pdFNlcmlhbChlLHIpe2coZSksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgiZW1pdFNlcmlhbCIsZSxyKTtjb25zdCBuPV8odGhpcyxlKSxjPXQuZ2V0KHRoaXMpLGg9Wy4uLm5dLHU9Wy4uLmNdO2F3YWl0IGY7Zm9yKGNvbnN0IHQgb2YgaCluLmhhcyh0KSYmYXdhaXQgdChyKTtmb3IoY29uc3QgdCBvZiB1KWMuaGFzKHQpJiZhd2FpdCB0KGUscil9b25BbnkoZSl7cmV0dXJuIFQoZSksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgic3Vic2NyaWJlQW55Iix2b2lkIDAsdm9pZCAwKSx0LmdldCh0aGlzKS5hZGQoZSksdGhpcy5lbWl0KGgse2xpc3RlbmVyOmV9KSx0aGlzLm9mZkFueS5iaW5kKHRoaXMsZSl9YW55RXZlbnQoKXtyZXR1cm4gJCh0aGlzKX1vZmZBbnkoZSl7VChlKSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJ1bnN1YnNjcmliZUFueSIsdm9pZCAwLHZvaWQgMCksdGhpcy5lbWl0KHUse2xpc3RlbmVyOmV9KSx0LmdldCh0aGlzKS5kZWxldGUoZSl9Y2xlYXJMaXN0ZW5lcnMoZSl7ZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCBjIG9mIGUpaWYodGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgiY2xlYXIiLGMsdm9pZCAwKSwic3RyaW5nIj09dHlwZW9mIGN8fCJzeW1ib2wiPT10eXBlb2YgYyl7Xyh0aGlzLGMpLmNsZWFyKCk7Y29uc3QgZT1iKHRoaXMsYyk7Zm9yKGNvbnN0IHQgb2YgZSl0LmZpbmlzaCgpO2UuY2xlYXIoKX1lbHNle3QuZ2V0KHRoaXMpLmNsZWFyKCk7Zm9yKGNvbnN0IGUgb2Ygci5nZXQodGhpcykudmFsdWVzKCkpZS5jbGVhcigpO2Zvcihjb25zdCBlIG9mIG4uZ2V0KHRoaXMpLnZhbHVlcygpKXtmb3IoY29uc3QgdCBvZiBlKXQuZmluaXNoKCk7ZS5jbGVhcigpfX19bGlzdGVuZXJDb3VudChlKXtlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07bGV0IGM9MDtmb3IoY29uc3QgZiBvZiBlKWlmKCJzdHJpbmciIT10eXBlb2YgZil7dHlwZW9mIGY8InUiJiZnKGYpLGMrPXQuZ2V0KHRoaXMpLnNpemU7Zm9yKGNvbnN0IGUgb2Ygci5nZXQodGhpcykudmFsdWVzKCkpYys9ZS5zaXplO2Zvcihjb25zdCBlIG9mIG4uZ2V0KHRoaXMpLnZhbHVlcygpKWMrPWUuc2l6ZX1lbHNlIGMrPXQuZ2V0KHRoaXMpLnNpemUrXyh0aGlzLGYpLnNpemUrYih0aGlzLGYpLnNpemUrYih0aGlzKS5zaXplO3JldHVybiBjfWJpbmRNZXRob2RzKGUsdCl7aWYoIm9iamVjdCIhPXR5cGVvZiBlfHxudWxsPT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgdGFyZ2V0YCBtdXN0IGJlIGFuIG9iamVjdCIpO3Q9SCh0KTtmb3IoY29uc3QgciBvZiB0KXtpZih2b2lkIDAhPT1lW3JdKXRocm93IG5ldyBFcnJvcihgVGhlIHByb3BlcnR5IFxgJHtyfVxgIGFscmVhZHkgZXhpc3RzIG9uIFxgdGFyZ2V0XGBgKTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLHtlbnVtZXJhYmxlOiExLHZhbHVlOnRoaXNbcl0uYmluZCh0aGlzKX0pfX19Y29uc3QgcD1PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtLnByb3RvdHlwZSkuZmlsdGVyKChlPT4iY29uc3RydWN0b3IiIT09ZSkpO09iamVjdC5kZWZpbmVQcm9wZXJ0eShtLCJsaXN0ZW5lckFkZGVkIix7dmFsdWU6aCx3cml0YWJsZTohMSxlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtLCJsaXN0ZW5lclJlbW92ZWQiLHt2YWx1ZTp1LHdyaXRhYmxlOiExLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiExfSk7dmFyIHk9bTtmdW5jdGlvbiB2KGUpe3JldHVybiBmdW5jdGlvbiBYKGUpe2lmKGZ1bmN0aW9uIEooZSl7cmV0dXJuIm9iamVjdCI9PXR5cGVvZiBlJiZudWxsIT09ZSYmIm1lc3NhZ2UiaW4gZSYmInN0cmluZyI9PXR5cGVvZiBlLm1lc3NhZ2V9KGUpKXJldHVybiBlO3RyeXtyZXR1cm4gbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KGUpKX1jYXRjaHtyZXR1cm4gbmV3IEVycm9yKFN0cmluZyhlKSl9fShlKS5tZXNzYWdlfXZhciBFPU9iamVjdC5kZWZpbmVQcm9wZXJ0eSxOPShlLHQscik9PigoKGUsdCxyKT0+e3QgaW4gZT9FKGUsdCx7ZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6cn0pOmVbdF09cn0pKGUsInN5bWJvbCIhPXR5cGVvZiB0P3QrIiI6dCxyKSxyKTtsZXQgQTtjb25zdCBTPW5ldyBVaW50OEFycmF5KDE2KTtmdW5jdGlvbiBpZSgpe2lmKCFBJiYoQT10eXBlb2YgY3J5cHRvPCJ1IiYmY3J5cHRvLmdldFJhbmRvbVZhbHVlcyYmY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0byksIUEpKXRocm93IG5ldyBFcnJvcigiY3J5cHRvLmdldFJhbmRvbVZhbHVlcygpIG5vdCBzdXBwb3J0ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQjZ2V0cmFuZG9tdmFsdWVzLW5vdC1zdXBwb3J0ZWQiKTtyZXR1cm4gQShTKX1jb25zdCBPPVtdO2ZvcihsZXQgQ2U9MDtDZTwyNTY7KytDZSlPLnB1c2goKENlKzI1NikudG9TdHJpbmcoMTYpLnNsaWNlKDEpKTtjb25zdCBNPXtyYW5kb21VVUlEOnR5cGVvZiBjcnlwdG88InUiJiZjcnlwdG8ucmFuZG9tVVVJRCYmY3J5cHRvLnJhbmRvbVVVSUQuYmluZChjcnlwdG8pfTtmdW5jdGlvbiBjZShlLHQscil7aWYoTS5yYW5kb21VVUlEJiYhdCYmIWUpcmV0dXJuIE0ucmFuZG9tVVVJRCgpO2NvbnN0IG49KGU9ZXx8e30pLnJhbmRvbXx8KGUucm5nfHxpZSkoKTtpZihuWzZdPTE1Jm5bNl18NjQsbls4XT02MyZuWzhdfDEyOCx0KXtyPXJ8fDA7Zm9yKGxldCBlPTA7ZTwxNjsrK2UpdFtyK2VdPW5bZV07cmV0dXJuIHR9cmV0dXJuIGZ1bmN0aW9uIG5lKGUsdD0wKXtyZXR1cm4oT1tlW3QrMF1dK09bZVt0KzFdXStPW2VbdCsyXV0rT1tlW3QrM11dKyItIitPW2VbdCs0XV0rT1tlW3QrNV1dKyItIitPW2VbdCs2XV0rT1tlW3QrN11dKyItIitPW2VbdCs4XV0rT1tlW3QrOV1dKyItIitPW2VbdCsxMF1dK09bZVt0KzExXV0rT1tlW3QrMTJdXStPW2VbdCsxM11dK09bZVt0KzE0XV0rT1tlW3QrMTVdXSkudG9Mb3dlckNhc2UoKX0obil9ZnVuY3Rpb24gVyhlLHQpe2dsb2JhbFRoaXMudm9uYWdlfHwoZ2xvYmFsVGhpcy52b25hZ2U9e30pLGdsb2JhbFRoaXMudm9uYWdlLndvcmtlcml6ZXJ8fChnbG9iYWxUaGlzLnZvbmFnZS53b3JrZXJpemVyPXt9KTtsZXQgcj1nbG9iYWxUaGlzLnZvbmFnZS53b3JrZXJpemVyO3JldHVybiByW2VdfHwocltlXT10KSxyW2VdfWNvbnN0IGs9VygiZ2xvYmFscyIse30pO3ZhciBSPShlPT4oZS5JTklUPSJJTklUIixlLkZPUldBUkQ9IkZPUldBUkQiLGUuVEVSTUlOQVRFPSJURVJNSU5BVEUiLGUuR0xPQkFMU19TWU5DPSJHTE9CQUxTX1NZTkMiLGUpKShSfHx7fSk7ZnVuY3Rpb24gaihlKXtyZXR1cm5bSW1hZ2VCaXRtYXAsUmVhZGFibGVTdHJlYW0sV3JpdGFibGVTdHJlYW1dLnNvbWUoKHQ9PmUgaW5zdGFuY2VvZiB0KSl9bGV0IHg9MDtmdW5jdGlvbiBsZShlLHQscixuLGMpe2NvbnN0IGY9eCsrO3JldHVybiBlLnBvc3RNZXNzYWdlKHtpZDpmLHR5cGU6dCxmdW5jdGlvbk5hbWU6cixhcmdzOm59LG4uZmlsdGVyKChlPT5qKGUpKSkpLG5ldyBQcm9taXNlKChlPT57bnVsbD09Y3x8Yy5zZXQoZixlKX0pKX1mdW5jdGlvbiB3KGUsdCl7Y29uc3R7aWQ6cix0eXBlOm59PWUsYz1BcnJheS5pc0FycmF5KHQpP3Q6W3RdO3Bvc3RNZXNzYWdlKHtpZDpyLHR5cGU6bixyZXN1bHQ6dH0sYy5maWx0ZXIoKGU9PmooZSkpKSl9Y29uc3QgTD1XKCJ3b3JrZXJpemVkIix7fSk7ZnVuY3Rpb24gQigpe3JldHVybiB0eXBlb2YgV29ya2VyR2xvYmFsU2NvcGU8InUiJiZzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGV9ZnVuY3Rpb24gUChlLHQpe2lmKEFycmF5LmlzQXJyYXkodCkpdC5zcGxpY2UoMCx0Lmxlbmd0aCk7ZWxzZSBpZigib2JqZWN0Ij09dHlwZW9mIHQpZm9yKGNvbnN0IHIgaW4gdClkZWxldGUgdFtyXTtmb3IoY29uc3QgciBpbiBlKUFycmF5LmlzQXJyYXkoZVtyXSk/KHRbcl09W10sUChlW3JdLHRbcl0pKToib2JqZWN0Ij09dHlwZW9mIGVbcl0/KHRbcl09e30sUChlW3JdLHRbcl0pKTp0W3JdPWVbcl19Y29uc3Qgej1XKCJyZWdpc3RlcmVkV29ya2VycyIse30pO2Z1bmN0aW9uIHllKGUsdCl7cmV0dXJuIGtbZV18fChrW2VdPXQpLFsoKT0+a1tlXSxhc3luYyB0PT57a1tlXT10LGF3YWl0IGFzeW5jIGZ1bmN0aW9uIHVlKCl7aWYoQigpKXcoe3R5cGU6Ui5HTE9CQUxTX1NZTkN9LGspO2Vsc2V7Y29uc3QgZT1bXTtmb3IoY29uc3QgdCBpbiBMKXtjb25zdHt3b3JrZXI6cixyZXNvbHZlcnM6bn09TFt0XS53b3JrZXJDb250ZXh0O3ImJmUucHVzaChsZShyLFIuR0xPQkFMU19TWU5DLCIiLFtrXSxuKSl9YXdhaXQgUHJvbWlzZS5hbGwoZSl9fSgpfV19QigpJiZmdW5jdGlvbiBfZSgpe2NvbnN0IGU9e307b25tZXNzYWdlPWFzeW5jIHQ9Pntjb25zdCByPXQuZGF0YTtzd2l0Y2goci50eXBlKXtjYXNlIFIuSU5JVDohZnVuY3Rpb24gZGUoZSx0KXtpZighZS5hcmdzKXRocm93Ik1pc3NpbmcgY2xhc3NOYW1lIHdoaWxlIGluaXRpYWxpemluZyB3b3JrZXIiO2NvbnN0W3Isbl09ZS5hcmdzLGM9eltyXTtpZighYyl0aHJvd2B1bmtub3duIHdvcmtlciBjbGFzcyAke3J9YDt0Lmluc3RhbmNlPW5ldyBjKGUuYXJncy5zbGljZSgxKSksUChuLGspLHcoZSx2b2lkIDAhPT10eXBlb2YgdC5pbnN0YW5jZSl9KHIsZSk7YnJlYWs7Y2FzZSBSLkZPUldBUkQ6IWFzeW5jIGZ1bmN0aW9uIGhlKGUsdCl7Y29uc3R7ZnVuY3Rpb25OYW1lOnIsYXJnczpufT1lO2lmKCF0Lmluc3RhbmNlKXRocm93Imluc3RhbmNlIG5vdCBpbml0aWFsaXplZCI7aWYoIXIpdGhyb3cibWlzc2luZyBmdW5jdGlvbiBuYW1lIHRvIGNhbGwiO2lmKCF0Lmluc3RhbmNlW3JdKXRocm93YHVuZGVmaW5lZCBmdW5jdGlvbiBbJHtyfV0gaW4gY2xhc3MgJHt0Lmluc3RhbmNlLmNvbnN0cnVjdG9yLndvcmtlcklkfWA7dyhlLGF3YWl0IHQuaW5zdGFuY2Vbcl0oLi4ubnVsbCE9bj9uOltdKSl9KHIsZSk7YnJlYWs7Y2FzZSBSLlRFUk1JTkFURTohYXN5bmMgZnVuY3Rpb24gbWUoZSx0KXtjb25zdHthcmdzOnJ9PWU7aWYoIXQuaW5zdGFuY2UpdGhyb3ciaW5zdGFuY2Ugbm90IGluaXRpYWxpemVkIjtsZXQgbjt0Lmluc3RhbmNlLnRlcm1pbmF0ZSYmKG49YXdhaXQgdC5pbnN0YW5jZS50ZXJtaW5hdGUoLi4ubnVsbCE9cj9yOltdKSksdyhlLG4pfShyLGUpO2JyZWFrO2Nhc2UgUi5HTE9CQUxTX1NZTkM6IWZ1bmN0aW9uIGdlKGUpe2lmKCFlLmFyZ3MpdGhyb3ciTWlzc2luZyBnbG9iYWxzIHdoaWxlIHN5bmNpbmciO1AoZS5hcmdzWzBdLGspLHcoZSx7fSl9KHIpfX19KCk7Y29uc3RbRixVXT1mdW5jdGlvbiBiZShlLHQpe3JldHVybiB5ZShlLHQpfSgibWV0YWRhdGEiKTtmdW5jdGlvbiBDKCl7cmV0dXJuIEYoKX1jbGFzcyBEe2NvbnN0cnVjdG9yKGUpe04odGhpcywidXVpZCIsY2UoKSksdGhpcy5jb25maWc9ZX1hc3luYyBzZW5kKGUpe3ZhciB0LHIsbjtjb25zdHthcHBJZDpjLHNvdXJjZVR5cGU6Zn09bnVsbCE9KHQ9QygpKT90Ont9O2lmKCFjfHwhZilyZXR1cm4ibWV0YWRhdGEgbWlzc2luZyI7Y29uc3QgaD1uZXcgQWJvcnRDb250cm9sbGVyLHU9c2V0VGltZW91dCgoKCk9PmguYWJvcnQoKSksMWU0KTtyZXR1cm4gYXdhaXQobnVsbCE9KG49bnVsbD09KHI9dGhpcy5jb25maWcpP3ZvaWQgMDpyLmZldGNoKT9uOmZldGNoKSh0aGlzLmdldFVybCgpLHttZXRob2Q6IlBPU1QiLGhlYWRlcnM6dGhpcy5nZXRIZWFkZXJzKCksYm9keTpKU09OLnN0cmluZ2lmeSh0aGlzLmJ1aWxkUmVwb3J0KGUpKSxzaWduYWw6aC5zaWduYWx9KSxjbGVhclRpbWVvdXQodSksInN1Y2Nlc3MifWdldFVybCgpe3ZhciBlO2xldCB0PW51bGwhPShlPUMoKS5wcm94eVVybCk/ZToiaHR0cHM6Ly8iO3JldHVybiB0Kz0oIi8iPT09dC5hdCgtMSk/IiI6Ii8iKSsiaGxnLnRva2JveC5jb20vcHJvZC9sb2dnaW5nL3ZjcF93ZWJydGMiLHR9Z2V0SGVhZGVycygpe3JldHVybnsiQ29udGVudC1UeXBlIjoiYXBwbGljYXRpb24vanNvbiJ9fWJ1aWxkUmVwb3J0KGUpe2NvbnN0IHQ9QygpO3JldHVybntndWlkOnRoaXMudXVpZCwuLi5lLGFwcGxpY2F0aW9uSWQ6dC5hcHBJZCx0aW1lc3RhbXA6RGF0ZS5ub3coKSxwcm94eVVybDp0LnByb3h5VXJsLHNvdXJjZTp0LnNvdXJjZVR5cGV9fX1jb25zdCBHPSIyLjAuMyI7Y2xhc3MgU2V7Y29uc3RydWN0b3IoZSl7YSh0aGlzLCJmcmFtZVRyYW5zZm9ybWVkQ291bnQiLDApLGEodGhpcywiZnJhbWVGcm9tU291cmNlQ291bnQiLDApLGEodGhpcywic3RhcnRBdCIsMCksYSh0aGlzLCJyZXBvcnRlciIpLHRoaXMuY29uZmlnPWUsdGhpcy5yZXBvcnRlcj1uZXcgRChlKX1hc3luYyBvbkZyYW1lRnJvbVNvdXJjZSgpe3RoaXMuZnJhbWVGcm9tU291cmNlQ291bnQrK31nZXQgZnBzKCl7Y29uc3R7c3RhcnRBdDplLGZyYW1lRnJvbVNvdXJjZUNvdW50OnR9PXRoaXM7cmV0dXJuIHQvKChEYXRlLm5vdygpLWUpLzFlMyl9YXN5bmMgb25GcmFtZVRyYW5zZm9ybWVkKGU9e30sdD0hMSl7MD09PXRoaXMuc3RhcnRBdCYmKHRoaXMuc3RhcnRBdD1EYXRlLm5vdygpKSx0aGlzLmZyYW1lVHJhbnNmb3JtZWRDb3VudCsrO2NvbnN0e3N0YXJ0QXQ6cixmcmFtZVRyYW5zZm9ybWVkQ291bnQ6bixmcmFtZUZyb21Tb3VyY2VDb3VudDpjfT10aGlzLGY9RGF0ZS5ub3coKSxoPShmLXIpLzFlMyx1PW4vaCxkPWMvaDtyZXR1cm4gdHx8dGhpcy5mcmFtZVRyYW5zZm9ybWVkQ291bnQ+PXRoaXMuY29uZmlnLmxvZ2dpbmdJbnRlcnZhbEZyYW1lQ291bnQ/KHRoaXMuZnJhbWVGcm9tU291cmNlQ291bnQ9MCx0aGlzLmZyYW1lVHJhbnNmb3JtZWRDb3VudD0wLHRoaXMuc3RhcnRBdD1mLHRoaXMucmVwb3J0ZXIuY29uZmlnPXRoaXMuY29uZmlnLHRoaXMucmVwb3J0ZXIuc2VuZCh7Li4udGhpcy5jb25maWcucmVwb3J0LHZhcmlhdGlvbjoiUW9TIixmcHM6ZCx0cmFuc2Zvcm1lZEZwczp1LGZyYW1lc1RyYW5zZm9ybWVkOm4sLi4uZX0pKToic3VjY2VzcyJ9fXZhciBRPShlPT4oZS5waXBlbGluZV9lbmRlZD0icGlwZWxpbmVfZW5kZWQiLGUucGlwZWxpbmVfZW5kZWRfd2l0aF9lcnJvcj0icGlwZWxpbmVfZW5kZWRfd2l0aF9lcnJvciIsZS5waXBlbGluZV9zdGFydGVkPSJwaXBlbGluZV9zdGFydGVkIixlLnBpcGVsaW5lX3N0YXJ0ZWRfd2l0aF9lcnJvcj0icGlwZWxpbmVfc3RhcnRlZF93aXRoX2Vycm9yIixlLnBpcGVsaW5lX3Jlc3RhcnRlZD0icGlwZWxpbmVfcmVzdGFydGVkIixlLnBpcGVsaW5lX3Jlc3RhcnRlZF93aXRoX2Vycm9yPSJwaXBlbGluZV9yZXN0YXJ0ZWRfd2l0aF9lcnJvciIsZSkpKFF8fHt9KTtjbGFzcyBQZSBleHRlbmRzIHl7Y29uc3RydWN0b3IoZSx0KXtzdXBlcigpLGEodGhpcywicmVwb3J0ZXJfIixuZXcgRCksYSh0aGlzLCJyZXBvcnRlclFvc18iLG5ldyBTZSh7bG9nZ2luZ0ludGVydmFsRnJhbWVDb3VudDo1MDAscmVwb3J0Ont2ZXJzaW9uOkd9fSkpLGEodGhpcywidHJhbnNmb3JtZXJUeXBlXyIpLGEodGhpcywidHJhbnNmb3JtZXJfIiksYSh0aGlzLCJzaG91bGRTdG9wXyIpLGEodGhpcywiaXNGbGFzaGVkXyIpLGEodGhpcywibWVkaWFUcmFuc2Zvcm1lclFvc1JlcG9ydFN0YXJ0VGltZXN0YW1wXyIpLGEodGhpcywidmlkZW9IZWlnaHRfIiksYSh0aGlzLCJ2aWRlb1dpZHRoXyIpLGEodGhpcywidHJhY2tFeHBlY3RlZFJhdGVfIiksYSh0aGlzLCJpbmRleF8iKSxhKHRoaXMsImNvbnRyb2xsZXJfIiksdGhpcy5pbmRleF89dCx0aGlzLnRyYW5zZm9ybWVyXz1lLHRoaXMuc2hvdWxkU3RvcF89ITEsdGhpcy5pc0ZsYXNoZWRfPSExLHRoaXMubWVkaWFUcmFuc2Zvcm1lclFvc1JlcG9ydFN0YXJ0VGltZXN0YW1wXz0wLHRoaXMudmlkZW9IZWlnaHRfPTAsdGhpcy52aWRlb1dpZHRoXz0wLHRoaXMudHJhY2tFeHBlY3RlZFJhdGVfPS0xLHRoaXMudHJhbnNmb3JtZXJUeXBlXz0iQ3VzdG9tIiwiZ2V0VHJhbnNmb3JtZXJUeXBlImluIGUmJih0aGlzLnRyYW5zZm9ybWVyVHlwZV89ZS5nZXRUcmFuc2Zvcm1lclR5cGUoKSksdGhpcy5yZXBvcnQoe3ZhcmlhdGlvbjoiQ3JlYXRlIn0pfXNldFRyYWNrRXhwZWN0ZWRSYXRlKGUpe3RoaXMudHJhY2tFeHBlY3RlZFJhdGVfPWV9YXN5bmMgc3RhcnQoZSl7aWYodGhpcy5jb250cm9sbGVyXz1lLHRoaXMudHJhbnNmb3JtZXJfJiYiZnVuY3Rpb24iPT10eXBlb2YgdGhpcy50cmFuc2Zvcm1lcl8uc3RhcnQpdHJ5e2F3YWl0IHRoaXMudHJhbnNmb3JtZXJfLnN0YXJ0KGUpfWNhdGNoKHQpe3RoaXMucmVwb3J0KHttZXNzYWdlOmwuZXJyb3JzLnRyYW5zZm9ybWVyX3N0YXJ0LHZhcmlhdGlvbjoiRXJyb3IiLGVycm9yOnYodCl9KTtjb25zdCBlPXtldmVudE1ldGFEYXRhOnt0cmFuc2Zvcm1lckluZGV4OnRoaXMuaW5kZXhffSxlcnJvcjp0LGZ1bmN0aW9uOiJzdGFydCJ9O3RoaXMuZW1pdCgiZXJyb3IiLGUpfX1hc3luYyB0cmFuc2Zvcm0oZSx0KXt2YXIgcixuLGMsZjtpZigwPT09dGhpcy5tZWRpYVRyYW5zZm9ybWVyUW9zUmVwb3J0U3RhcnRUaW1lc3RhbXBfJiYodGhpcy5tZWRpYVRyYW5zZm9ybWVyUW9zUmVwb3J0U3RhcnRUaW1lc3RhbXBfPURhdGUubm93KCkpLGUgaW5zdGFuY2VvZiBWaWRlb0ZyYW1lJiYodGhpcy52aWRlb0hlaWdodF89bnVsbCE9KHI9bnVsbD09ZT92b2lkIDA6ZS5kaXNwbGF5SGVpZ2h0KT9yOjAsdGhpcy52aWRlb1dpZHRoXz1udWxsIT0obj1udWxsPT1lP3ZvaWQgMDplLmRpc3BsYXlXaWR0aCk/bjowKSx0aGlzLnJlcG9ydGVyUW9zXy5vbkZyYW1lRnJvbVNvdXJjZSgpLHRoaXMudHJhbnNmb3JtZXJfKWlmKHRoaXMuc2hvdWxkU3RvcF8pY29uc29sZS53YXJuKCJbUGlwZWxpbmVdIGZsdXNoIGZyb20gdHJhbnNmb3JtIiksZS5jbG9zZSgpLHRoaXMuZmx1c2godCksdC50ZXJtaW5hdGUoKTtlbHNle3RyeXthd2FpdChudWxsPT0oZj0oYz10aGlzLnRyYW5zZm9ybWVyXykudHJhbnNmb3JtKT92b2lkIDA6Zi5jYWxsKGMsZSx0KSksdGhpcy5yZXBvcnRRb3MoKX1jYXRjaChoKXt0aGlzLnJlcG9ydCh7bWVzc2FnZTpsLmVycm9ycy50cmFuc2Zvcm1lcl90cmFuc2Zvcm0sdmFyaWF0aW9uOiJFcnJvciIsZXJyb3I6dihoKX0pO2NvbnN0IGU9e2V2ZW50TWV0YURhdGE6e3RyYW5zZm9ybWVySW5kZXg6dGhpcy5pbmRleF99LGVycm9yOmgsZnVuY3Rpb246InRyYW5zZm9ybSJ9O3RoaXMuZW1pdCgiZXJyb3IiLGUpfWlmKC0xIT10aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXyYmLjgqdGhpcy50cmFja0V4cGVjdGVkUmF0ZV8+dGhpcy5yZXBvcnRlclFvc18uZnBzKXtjb25zdCBlPXtldmVudE1ldGFEYXRhOnt0cmFuc2Zvcm1lckluZGV4OnRoaXMuaW5kZXhffSx3YXJuaW5nVHlwZToiZnBzX2Ryb3AiLGRyb3BJbmZvOntyZXF1ZXN0ZWQ6dGhpcy50cmFja0V4cGVjdGVkUmF0ZV8sY3VycmVudDp0aGlzLnJlcG9ydGVyUW9zXy5mcHN9fTt0aGlzLmVtaXQoIndhcm4iLGUpfX19YXN5bmMgZmx1c2goZSl7aWYodGhpcy50cmFuc2Zvcm1lcl8mJiJmdW5jdGlvbiI9PXR5cGVvZiB0aGlzLnRyYW5zZm9ybWVyXy5mbHVzaCYmIXRoaXMuaXNGbGFzaGVkXyl7dGhpcy5pc0ZsYXNoZWRfPSEwO3RyeXthd2FpdCB0aGlzLnRyYW5zZm9ybWVyXy5mbHVzaChlKX1jYXRjaCh0KXt0aGlzLnJlcG9ydCh7bWVzc2FnZTpsLmVycm9ycy50cmFuc2Zvcm1lcl9mbHVzaCx2YXJpYXRpb246IkVycm9yIixlcnJvcjp2KHQpfSk7Y29uc3QgZT17ZXZlbnRNZXRhRGF0YTp7dHJhbnNmb3JtZXJJbmRleDp0aGlzLmluZGV4X30sZXJyb3I6dCxmdW5jdGlvbjoiZmx1c2gifTt0aGlzLmVtaXQoImVycm9yIixlKX19dGhpcy5yZXBvcnRRb3MoITApLHRoaXMucmVwb3J0KHt2YXJpYXRpb246IkRlbGV0ZSJ9KX1zdG9wKCl7Y29uc29sZS5sb2coIltQaXBlbGluZV0gU3RvcCBzdHJlYW0uIiksdGhpcy5jb250cm9sbGVyXyYmKHRoaXMuZmx1c2godGhpcy5jb250cm9sbGVyXyksdGhpcy5jb250cm9sbGVyXy50ZXJtaW5hdGUoKSksdGhpcy5zaG91bGRTdG9wXz0hMH1yZXBvcnQoZSl7dGhpcy5yZXBvcnRlcl8uc2VuZCh7dmVyc2lvbjpHLGFjdGlvbjoiTWVkaWFUcmFuc2Zvcm1lciIsdHJhbnNmb3JtZXJUeXBlOnRoaXMudHJhbnNmb3JtZXJUeXBlXywuLi5lfSl9cmVwb3J0UW9zKGU9ITEpe3RoaXMucmVwb3J0ZXJRb3NfLmNvbmZpZz17Li4udGhpcy5yZXBvcnRlclFvc18uY29uZmlnfSx0aGlzLnJlcG9ydGVyUW9zXy5vbkZyYW1lVHJhbnNmb3JtZWQoe3ZlcnNpb246RyxhY3Rpb246Ik1lZGlhVHJhbnNmb3JtZXIiLHRyYW5zZm9ybWVyVHlwZTp0aGlzLnRyYW5zZm9ybWVyVHlwZV8sdmlkZW9XaWR0aDp0aGlzLnZpZGVvV2lkdGhfLHZpZGVvSGVpZ2h0OnRoaXMudmlkZW9IZWlnaHRffSxlKX19Y2xhc3MgTWUgZXh0ZW5kcyB5e2NvbnN0cnVjdG9yKGUpe3N1cGVyKCksYSh0aGlzLCJ0cmFuc2Zvcm1lcnNfIiksYSh0aGlzLCJ0cmFja0V4cGVjdGVkUmF0ZV8iKSx0aGlzLnRyYW5zZm9ybWVyc189W10sdGhpcy50cmFja0V4cGVjdGVkUmF0ZV89LTE7Zm9yKGxldCB0PTA7dDxlLmxlbmd0aDt0Kyspe2xldCByPW5ldyBQZShlW3RdLHQpO3Iub24oImVycm9yIiwoZT0+e3RoaXMuZW1pdCgiZXJyb3IiLGUpfSkpLHIub24oIndhcm4iLChlPT57dGhpcy5lbWl0KCJ3YXJuIixlKX0pKSx0aGlzLnRyYW5zZm9ybWVyc18ucHVzaChyKX19c2V0VHJhY2tFeHBlY3RlZFJhdGUoZSl7dGhpcy50cmFja0V4cGVjdGVkUmF0ZV89ZTtmb3IobGV0IHQgb2YgdGhpcy50cmFuc2Zvcm1lcnNfKXQuc2V0VHJhY2tFeHBlY3RlZFJhdGUodGhpcy50cmFja0V4cGVjdGVkUmF0ZV8pfWFzeW5jIHN0YXJ0KGUsdCl7aWYodGhpcy50cmFuc2Zvcm1lcnNfJiYwIT09dGhpcy50cmFuc2Zvcm1lcnNfLmxlbmd0aCl7dHJ5e2xldCByPWU7Zm9yKGxldCB0IG9mIHRoaXMudHJhbnNmb3JtZXJzXyllPWUucGlwZVRocm91Z2gobmV3IFRyYW5zZm9ybVN0cmVhbSh0KSk7ZS5waXBlVG8odCkudGhlbigoYXN5bmMoKT0+e2NvbnNvbGUubG9nKCJbUGlwZWxpbmVdIFNldHVwLiIpLGF3YWl0IHQuYWJvcnQoKSxhd2FpdCByLmNhbmNlbCgpLHRoaXMuZW1pdCgicGlwZWxpbmVJbmZvIiwicGlwZWxpbmVfZW5kZWQiKX0pKS5jYXRjaCgoYXN5bmMgbj0+e2UuY2FuY2VsKCkudGhlbigoKCk9Pntjb25zb2xlLmxvZygiW1BpcGVsaW5lXSBTaHV0dGluZyBkb3duIHN0cmVhbXMgYWZ0ZXIgYWJvcnQuIil9KSkuY2F0Y2goKGU9Pntjb25zb2xlLmVycm9yKCJbUGlwZWxpbmVdIEVycm9yIGZyb20gc3RyZWFtIHRyYW5zZm9ybToiLGUpfSkpLGF3YWl0IHQuYWJvcnQobiksYXdhaXQgci5jYW5jZWwobiksdGhpcy5lbWl0KCJwaXBlbGluZUluZm8iLCJwaXBlbGluZV9lbmRlZF93aXRoX2Vycm9yIil9KSl9Y2F0Y2h7cmV0dXJuIHRoaXMuZW1pdCgicGlwZWxpbmVJbmZvIiwicGlwZWxpbmVfc3RhcnRlZF93aXRoX2Vycm9yIiksdm9pZCB0aGlzLmRlc3Ryb3koKX10aGlzLmVtaXQoInBpcGVsaW5lSW5mbyIsInBpcGVsaW5lX3N0YXJ0ZWQiKSxjb25zb2xlLmxvZygiW1BpcGVsaW5lXSBQaXBlbGluZSBzdGFydGVkLiIpfWVsc2UgY29uc29sZS5sb2coIltQaXBlbGluZV0gTm8gdHJhbnNmb3JtZXJzLiIpfWFzeW5jIGRlc3Ryb3koKXtjb25zb2xlLmxvZygiW1BpcGVsaW5lXSBEZXN0cm95aW5nIFBpcGVsaW5lLiIpO2ZvcihsZXQgZSBvZiB0aGlzLnRyYW5zZm9ybWVyc18pZS5zdG9wKCl9fWNsYXNzIE9lIGV4dGVuZHMgeXtjb25zdHJ1Y3Rvcigpe3N1cGVyKCksYSh0aGlzLCJyZXBvcnRlcl8iKSxhKHRoaXMsInBpcGVsaW5lXyIpLGEodGhpcywidHJhbnNmb3JtZXJzXyIpLGEodGhpcywicmVhZGFibGVfIiksYSh0aGlzLCJ3cml0YWJsZV8iKSxhKHRoaXMsInRyYWNrRXhwZWN0ZWRSYXRlXyIpLHRoaXMucmVwb3J0ZXJfPW5ldyBELHRoaXMudHJhY2tFeHBlY3RlZFJhdGVfPS0xLHRoaXMucmVwb3J0KHt2YXJpYXRpb246IkNyZWF0ZSJ9KX1zZXRUcmFja0V4cGVjdGVkUmF0ZShlKXt0aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXz1lLHRoaXMucGlwZWxpbmVfJiZ0aGlzLnBpcGVsaW5lXy5zZXRUcmFja0V4cGVjdGVkUmF0ZSh0aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXyl9dHJhbnNmb3JtKGUsdCl7cmV0dXJuIHRoaXMucmVhZGFibGVfPWUsdGhpcy53cml0YWJsZV89dCx0aGlzLnRyYW5zZm9ybUludGVybmFsKCl9dHJhbnNmb3JtSW50ZXJuYWwoKXtyZXR1cm4gbmV3IFByb21pc2UoKGFzeW5jKGUsdCk9PntpZighdGhpcy50cmFuc2Zvcm1lcnNffHwwPT09dGhpcy50cmFuc2Zvcm1lcnNfLmxlbmd0aClyZXR1cm4gdGhpcy5yZXBvcnQoe21lc3NhZ2U6bC5lcnJvcnMudHJhbnNmb3JtZXJfbm9uZSx2YXJpYXRpb246IkVycm9yIn0pLHZvaWQgdCgiW01lZGlhUHJvY2Vzc29yXSBOZWVkIHRvIHNldCB0cmFuc2Zvcm1lcnMuIik7aWYoIXRoaXMucmVhZGFibGVfKXJldHVybiB0aGlzLnJlcG9ydCh7dmFyaWF0aW9uOiJFcnJvciIsbWVzc2FnZTpsLmVycm9ycy5yZWFkYWJsZV9udWxsfSksdm9pZCB0KCJbTWVkaWFQcm9jZXNzb3JdIFJlYWRhYmxlIGlzIG51bGwuIik7aWYoIXRoaXMud3JpdGFibGVfKXJldHVybiB0aGlzLnJlcG9ydCh7dmFyaWF0aW9uOiJFcnJvciIsbWVzc2FnZTpsLmVycm9ycy53cml0YWJsZV9udWxsfSksdm9pZCB0KCJbTWVkaWFQcm9jZXNzb3JdIFdyaXRhYmxlIGlzIG51bGwuIik7bGV0IHI9ITE7dGhpcy5waXBlbGluZV8mJihyPSEwLHRoaXMucGlwZWxpbmVfLmNsZWFyTGlzdGVuZXJzKCksdGhpcy5waXBlbGluZV8uZGVzdHJveSgpKSx0aGlzLnBpcGVsaW5lXz1uZXcgTWUodGhpcy50cmFuc2Zvcm1lcnNfKSx0aGlzLnBpcGVsaW5lXy5vbigid2FybiIsKGU9Pnt0aGlzLmVtaXQoIndhcm4iLGUpfSkpLHRoaXMucGlwZWxpbmVfLm9uKCJlcnJvciIsKGU9Pnt0aGlzLmVtaXQoImVycm9yIixlKX0pKSx0aGlzLnBpcGVsaW5lXy5vbigicGlwZWxpbmVJbmZvIiwoZT0+e3ImJigicGlwZWxpbmVfc3RhcnRlZCI9PT1lP2U9US5waXBlbGluZV9yZXN0YXJ0ZWQ6InBpcGVsaW5lX3N0YXJ0ZWRfd2l0aF9lcnJvciI9PT1lJiYoZT1RLnBpcGVsaW5lX3Jlc3RhcnRlZF93aXRoX2Vycm9yKSksdGhpcy5lbWl0KCJwaXBlbGluZUluZm8iLGUpfSkpLC0xIT10aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXyYmdGhpcy5waXBlbGluZV8uc2V0VHJhY2tFeHBlY3RlZFJhdGUodGhpcy50cmFja0V4cGVjdGVkUmF0ZV8pLHRoaXMucGlwZWxpbmVfLnN0YXJ0KHRoaXMucmVhZGFibGVfLHRoaXMud3JpdGFibGVfKS50aGVuKCgoKT0+e2UoKX0pKS5jYXRjaCgoZT0+e3QoZSl9KSl9KSl9c2V0VHJhbnNmb3JtZXJzKGUpe3JldHVybiB0aGlzLnJlcG9ydCh7dmFyaWF0aW9uOiJVcGRhdGUiLG1lc3NhZ2U6bC51cGRhdGVzLnRyYW5zZm9ybWVyX25ld30pLHRoaXMudHJhbnNmb3JtZXJzXz1lLHRoaXMucmVhZGFibGVfJiZ0aGlzLndyaXRhYmxlXz90aGlzLnRyYW5zZm9ybUludGVybmFsKCk6UHJvbWlzZS5yZXNvbHZlKCl9ZGVzdHJveSgpe3JldHVybiBuZXcgUHJvbWlzZSgoYXN5bmMgZT0+e3RoaXMucGlwZWxpbmVfJiZ0aGlzLnBpcGVsaW5lXy5kZXN0cm95KCksdGhpcy5yZXBvcnQoe3ZhcmlhdGlvbjoiRGVsZXRlIn0pLGUoKX0pKX1yZXBvcnQoZSl7dGhpcy5yZXBvcnRlcl8uc2VuZCh7dmVyc2lvbjpHLGFjdGlvbjoiTWVkaWFQcm9jZXNzb3IiLC4uLmV9KX19Y29uc3QgVj1uZXcgV2Vha01hcCxZPW5ldyBXZWFrTWFwLEs9bmV3IFdlYWtNYXAsWj1TeW1ib2woImFueVByb2R1Y2VyIiksZWU9UHJvbWlzZS5yZXNvbHZlKCksdGU9U3ltYm9sKCJsaXN0ZW5lckFkZGVkIikscmU9U3ltYm9sKCJsaXN0ZW5lclJlbW92ZWQiKTtsZXQgc2U9ITEsb2U9ITE7ZnVuY3Rpb24gYXNzZXJ0RXZlbnROYW1lJDEoZSl7aWYoInN0cmluZyIhPXR5cGVvZiBlJiYic3ltYm9sIiE9dHlwZW9mIGUmJiJudW1iZXIiIT10eXBlb2YgZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgZXZlbnROYW1lYCBtdXN0IGJlIGEgc3RyaW5nLCBzeW1ib2wsIG9yIG51bWJlciIpfWZ1bmN0aW9uIGFzc2VydExpc3RlbmVyJDEoZSl7aWYoImZ1bmN0aW9uIiE9dHlwZW9mIGUpdGhyb3cgbmV3IFR5cGVFcnJvcigibGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uIil9ZnVuY3Rpb24gZ2V0TGlzdGVuZXJzJDEoZSx0KXtjb25zdCByPVkuZ2V0KGUpO2lmKHIuaGFzKHQpKXJldHVybiByLmdldCh0KX1mdW5jdGlvbiBnZXRFdmVudFByb2R1Y2VycyQxKGUsdCl7Y29uc3Qgcj0ic3RyaW5nIj09dHlwZW9mIHR8fCJzeW1ib2wiPT10eXBlb2YgdHx8Im51bWJlciI9PXR5cGVvZiB0P3Q6WixuPUsuZ2V0KGUpO2lmKG4uaGFzKHIpKXJldHVybiBuLmdldChyKX1mdW5jdGlvbiBpdGVyYXRvciQxKGUsdCl7dD1BcnJheS5pc0FycmF5KHQpP3Q6W3RdO2xldCByPSExLGZsdXNoPSgpPT57fSxuPVtdO2NvbnN0IGM9e2VucXVldWUoZSl7bi5wdXNoKGUpLGZsdXNoKCl9LGZpbmlzaCgpe3I9ITAsZmx1c2goKX19O2Zvcihjb25zdCBmIG9mIHQpe2xldCB0PWdldEV2ZW50UHJvZHVjZXJzJDEoZSxmKTtpZighdCl7dD1uZXcgU2V0O0suZ2V0KGUpLnNldChmLHQpfXQuYWRkKGMpfXJldHVybnthc3luYyBuZXh0KCl7cmV0dXJuIG4/MD09PW4ubGVuZ3RoP3I/KG49dm9pZCAwLHRoaXMubmV4dCgpKTooYXdhaXQgbmV3IFByb21pc2UoKGU9PntmbHVzaD1lfSkpLHRoaXMubmV4dCgpKTp7ZG9uZTohMSx2YWx1ZTphd2FpdCBuLnNoaWZ0KCl9Ontkb25lOiEwfX0sYXN5bmMgcmV0dXJuKHIpe249dm9pZCAwO2Zvcihjb25zdCBuIG9mIHQpe2NvbnN0IHQ9Z2V0RXZlbnRQcm9kdWNlcnMkMShlLG4pO2lmKHQmJih0LmRlbGV0ZShjKSwwPT09dC5zaXplKSl7Sy5nZXQoZSkuZGVsZXRlKG4pfX1yZXR1cm4gZmx1c2goKSxhcmd1bWVudHMubGVuZ3RoPjA/e2RvbmU6ITAsdmFsdWU6YXdhaXQgcn06e2RvbmU6ITB9fSxbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCl7cmV0dXJuIHRoaXN9fX1mdW5jdGlvbiBkZWZhdWx0TWV0aG9kTmFtZXNPckFzc2VydCQxKGUpe2lmKHZvaWQgMD09PWUpcmV0dXJuIGZlO2lmKCFBcnJheS5pc0FycmF5KGUpKXRocm93IG5ldyBUeXBlRXJyb3IoImBtZXRob2ROYW1lc2AgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzIik7Zm9yKGNvbnN0IHQgb2YgZSlpZighZmUuaW5jbHVkZXModCkpe2lmKCJzdHJpbmciIT10eXBlb2YgdCl0aHJvdyBuZXcgVHlwZUVycm9yKCJgbWV0aG9kTmFtZXNgIGVsZW1lbnQgbXVzdCBiZSBhIHN0cmluZyIpO3Rocm93IG5ldyBFcnJvcihgJHt0fSBpcyBub3QgRW1pdHRlcnkgbWV0aG9kYCl9cmV0dXJuIGV9Y29uc3QgaXNNZXRhRXZlbnQkMT1lPT5lPT09dGV8fGU9PT1yZTtmdW5jdGlvbiBlbWl0TWV0YUV2ZW50JDEoZSx0LHIpe2lmKGlzTWV0YUV2ZW50JDEodCkpdHJ5e3NlPSEwLGUuZW1pdCh0LHIpfWZpbmFsbHl7c2U9ITF9fWxldCBhZT1jbGFzcyBFbWl0dGVyeTJ7c3RhdGljIG1peGluKGUsdCl7cmV0dXJuIHQ9ZGVmYXVsdE1ldGhvZE5hbWVzT3JBc3NlcnQkMSh0KSxyPT57aWYoImZ1bmN0aW9uIiE9dHlwZW9mIHIpdGhyb3cgbmV3IFR5cGVFcnJvcigiYHRhcmdldGAgbXVzdCBiZSBmdW5jdGlvbiIpO2Zvcihjb25zdCBlIG9mIHQpaWYodm9pZCAwIT09ci5wcm90b3R5cGVbZV0pdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvcGVydHkgXGAke2V9XGAgYWxyZWFkeSBleGlzdHMgb24gXGB0YXJnZXRcYGApO09iamVjdC5kZWZpbmVQcm9wZXJ0eShyLnByb3RvdHlwZSxlLHtlbnVtZXJhYmxlOiExLGdldDpmdW5jdGlvbiBnZXRFbWl0dGVyeVByb3BlcnR5KCl7cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLGUse2VudW1lcmFibGU6ITEsdmFsdWU6bmV3IEVtaXR0ZXJ5Mn0pLHRoaXNbZV19fSk7Y29uc3QgZW1pdHRlcnlNZXRob2RDYWxsZXI9dD0+ZnVuY3Rpb24oLi4ucil7cmV0dXJuIHRoaXNbZV1bdF0oLi4ucil9O2Zvcihjb25zdCBlIG9mIHQpT2JqZWN0LmRlZmluZVByb3BlcnR5KHIucHJvdG90eXBlLGUse2VudW1lcmFibGU6ITEsdmFsdWU6ZW1pdHRlcnlNZXRob2RDYWxsZXIoZSl9KTtyZXR1cm4gcn19c3RhdGljIGdldCBpc0RlYnVnRW5hYmxlZCgpe2lmKCJvYmplY3QiIT10eXBlb2YgZ2xvYmFsVGhpcy5wcm9jZXNzPy5lbnYpcmV0dXJuIG9lO2NvbnN0e2VudjplfT1nbG9iYWxUaGlzLnByb2Nlc3M/P3tlbnY6e319O3JldHVybiJlbWl0dGVyeSI9PT1lLkRFQlVHfHwiKiI9PT1lLkRFQlVHfHxvZX1zdGF0aWMgc2V0IGlzRGVidWdFbmFibGVkKGUpe29lPWV9Y29uc3RydWN0b3IoZT17fSl7Vi5zZXQodGhpcyxuZXcgU2V0KSxZLnNldCh0aGlzLG5ldyBNYXApLEsuc2V0KHRoaXMsbmV3IE1hcCksSy5nZXQodGhpcykuc2V0KFosbmV3IFNldCksdGhpcy5kZWJ1Zz1lLmRlYnVnPz97fSx2b2lkIDA9PT10aGlzLmRlYnVnLmVuYWJsZWQmJih0aGlzLmRlYnVnLmVuYWJsZWQ9ITEpLHRoaXMuZGVidWcubG9nZ2VyfHwodGhpcy5kZWJ1Zy5sb2dnZXI9KGUsdCxyLG4pPT57dHJ5e249SlNPTi5zdHJpbmdpZnkobil9Y2F0Y2h7bj1gT2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzIGZhaWxlZCB0byBzdHJpbmdpZnk6ICR7T2JqZWN0LmtleXMobikuam9pbigiLCIpfWB9InN5bWJvbCIhPXR5cGVvZiByJiYibnVtYmVyIiE9dHlwZW9mIHJ8fChyPXIudG9TdHJpbmcoKSk7Y29uc3QgYz1uZXcgRGF0ZSxmPWAke2MuZ2V0SG91cnMoKX06JHtjLmdldE1pbnV0ZXMoKX06JHtjLmdldFNlY29uZHMoKX0uJHtjLmdldE1pbGxpc2Vjb25kcygpfWA7Y29uc29sZS5sb2coYFske2Z9XVtlbWl0dGVyeToke2V9XVske3R9XSBFdmVudCBOYW1lOiAke3J9XG5cdGRhdGE6ICR7bn1gKX0pfWxvZ0lmRGVidWdFbmFibGVkKGUsdCxyKXsoRW1pdHRlcnkyLmlzRGVidWdFbmFibGVkfHx0aGlzLmRlYnVnLmVuYWJsZWQpJiZ0aGlzLmRlYnVnLmxvZ2dlcihlLHRoaXMuZGVidWcubmFtZSx0LHIpfW9uKGUsdCl7YXNzZXJ0TGlzdGVuZXIkMSh0KSxlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07Zm9yKGNvbnN0IHIgb2YgZSl7YXNzZXJ0RXZlbnROYW1lJDEocik7bGV0IGU9Z2V0TGlzdGVuZXJzJDEodGhpcyxyKTtpZighZSl7ZT1uZXcgU2V0O1kuZ2V0KHRoaXMpLnNldChyLGUpfWUuYWRkKHQpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInN1YnNjcmliZSIscix2b2lkIDApLGlzTWV0YUV2ZW50JDEocil8fGVtaXRNZXRhRXZlbnQkMSh0aGlzLHRlLHtldmVudE5hbWU6cixsaXN0ZW5lcjp0fSl9cmV0dXJuIHRoaXMub2ZmLmJpbmQodGhpcyxlLHQpfW9mZihlLHQpe2Fzc2VydExpc3RlbmVyJDEodCksZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCByIG9mIGUpe2Fzc2VydEV2ZW50TmFtZSQxKHIpO2NvbnN0IGU9Z2V0TGlzdGVuZXJzJDEodGhpcyxyKTtpZihlJiYoZS5kZWxldGUodCksMD09PWUuc2l6ZSkpe1kuZ2V0KHRoaXMpLmRlbGV0ZShyKX10aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJ1bnN1YnNjcmliZSIscix2b2lkIDApLGlzTWV0YUV2ZW50JDEocil8fGVtaXRNZXRhRXZlbnQkMSh0aGlzLHJlLHtldmVudE5hbWU6cixsaXN0ZW5lcjp0fSl9fW9uY2UoZSl7bGV0IHQ7Y29uc3Qgcj1uZXcgUHJvbWlzZSgocj0+e3Q9dGhpcy5vbihlLChlPT57dCgpLHIoZSl9KSl9KSk7cmV0dXJuIHIub2ZmPXQscn1ldmVudHMoZSl7ZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCB0IG9mIGUpYXNzZXJ0RXZlbnROYW1lJDEodCk7cmV0dXJuIGl0ZXJhdG9yJDEodGhpcyxlKX1hc3luYyBlbWl0KGUsdCl7aWYoYXNzZXJ0RXZlbnROYW1lJDEoZSksaXNNZXRhRXZlbnQkMShlKSYmIXNlKXRocm93IG5ldyBUeXBlRXJyb3IoImBldmVudE5hbWVgIGNhbm5vdCBiZSBtZXRhIGV2ZW50IGBsaXN0ZW5lckFkZGVkYCBvciBgbGlzdGVuZXJSZW1vdmVkYCIpO3RoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoImVtaXQiLGUsdCksZnVuY3Rpb24gZW5xdWV1ZVByb2R1Y2VycyQxKGUsdCxyKXtjb25zdCBuPUsuZ2V0KGUpO2lmKG4uaGFzKHQpKWZvcihjb25zdCBjIG9mIG4uZ2V0KHQpKWMuZW5xdWV1ZShyKTtpZihuLmhhcyhaKSl7Y29uc3QgZT1Qcm9taXNlLmFsbChbdCxyXSk7Zm9yKGNvbnN0IHQgb2Ygbi5nZXQoWikpdC5lbnF1ZXVlKGUpfX0odGhpcyxlLHQpO2NvbnN0IHI9Z2V0TGlzdGVuZXJzJDEodGhpcyxlKT8/bmV3IFNldCxuPVYuZ2V0KHRoaXMpLGM9Wy4uLnJdLGY9aXNNZXRhRXZlbnQkMShlKT9bXTpbLi4ubl07YXdhaXQgZWUsYXdhaXQgUHJvbWlzZS5hbGwoWy4uLmMubWFwKChhc3luYyBlPT57aWYoci5oYXMoZSkpcmV0dXJuIGUodCl9KSksLi4uZi5tYXAoKGFzeW5jIHI9PntpZihuLmhhcyhyKSlyZXR1cm4gcihlLHQpfSkpXSl9YXN5bmMgZW1pdFNlcmlhbChlLHQpe2lmKGFzc2VydEV2ZW50TmFtZSQxKGUpLGlzTWV0YUV2ZW50JDEoZSkmJiFzZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgZXZlbnROYW1lYCBjYW5ub3QgYmUgbWV0YSBldmVudCBgbGlzdGVuZXJBZGRlZGAgb3IgYGxpc3RlbmVyUmVtb3ZlZGAiKTt0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJlbWl0U2VyaWFsIixlLHQpO2NvbnN0IHI9Z2V0TGlzdGVuZXJzJDEodGhpcyxlKT8/bmV3IFNldCxuPVYuZ2V0KHRoaXMpLGM9Wy4uLnJdLGY9Wy4uLm5dO2F3YWl0IGVlO2Zvcihjb25zdCBoIG9mIGMpci5oYXMoaCkmJmF3YWl0IGgodCk7Zm9yKGNvbnN0IGggb2YgZiluLmhhcyhoKSYmYXdhaXQgaChlLHQpfW9uQW55KGUpe3JldHVybiBhc3NlcnRMaXN0ZW5lciQxKGUpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInN1YnNjcmliZUFueSIsdm9pZCAwLHZvaWQgMCksVi5nZXQodGhpcykuYWRkKGUpLGVtaXRNZXRhRXZlbnQkMSh0aGlzLHRlLHtsaXN0ZW5lcjplfSksdGhpcy5vZmZBbnkuYmluZCh0aGlzLGUpfWFueUV2ZW50KCl7cmV0dXJuIGl0ZXJhdG9yJDEodGhpcyl9b2ZmQW55KGUpe2Fzc2VydExpc3RlbmVyJDEoZSksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgidW5zdWJzY3JpYmVBbnkiLHZvaWQgMCx2b2lkIDApLGVtaXRNZXRhRXZlbnQkMSh0aGlzLHJlLHtsaXN0ZW5lcjplfSksVi5nZXQodGhpcykuZGVsZXRlKGUpfWNsZWFyTGlzdGVuZXJzKGUpe2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgdCBvZiBlKWlmKHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoImNsZWFyIix0LHZvaWQgMCksInN0cmluZyI9PXR5cGVvZiB0fHwic3ltYm9sIj09dHlwZW9mIHR8fCJudW1iZXIiPT10eXBlb2YgdCl7Y29uc3QgZT1nZXRMaXN0ZW5lcnMkMSh0aGlzLHQpO2UmJmUuY2xlYXIoKTtjb25zdCByPWdldEV2ZW50UHJvZHVjZXJzJDEodGhpcyx0KTtpZihyKXtmb3IoY29uc3QgZSBvZiByKWUuZmluaXNoKCk7ci5jbGVhcigpfX1lbHNle1YuZ2V0KHRoaXMpLmNsZWFyKCk7Zm9yKGNvbnN0W2UsdF1vZiBZLmdldCh0aGlzKS5lbnRyaWVzKCkpdC5jbGVhcigpLFkuZ2V0KHRoaXMpLmRlbGV0ZShlKTtmb3IoY29uc3RbZSx0XW9mIEsuZ2V0KHRoaXMpLmVudHJpZXMoKSl7Zm9yKGNvbnN0IGUgb2YgdCllLmZpbmlzaCgpO3QuY2xlYXIoKSxLLmdldCh0aGlzKS5kZWxldGUoZSl9fX1saXN0ZW5lckNvdW50KGUpe2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtsZXQgdD0wO2Zvcihjb25zdCByIG9mIGUpaWYoInN0cmluZyIhPXR5cGVvZiByKXt2b2lkIDAhPT1yJiZhc3NlcnRFdmVudE5hbWUkMShyKSx0Kz1WLmdldCh0aGlzKS5zaXplO2Zvcihjb25zdCBlIG9mIFkuZ2V0KHRoaXMpLnZhbHVlcygpKXQrPWUuc2l6ZTtmb3IoY29uc3QgZSBvZiBLLmdldCh0aGlzKS52YWx1ZXMoKSl0Kz1lLnNpemV9ZWxzZSB0Kz1WLmdldCh0aGlzKS5zaXplKyhnZXRMaXN0ZW5lcnMkMSh0aGlzLHIpPy5zaXplPz8wKSsoZ2V0RXZlbnRQcm9kdWNlcnMkMSh0aGlzLHIpPy5zaXplPz8wKSsoZ2V0RXZlbnRQcm9kdWNlcnMkMSh0aGlzKT8uc2l6ZT8/MCk7cmV0dXJuIHR9YmluZE1ldGhvZHMoZSx0KXtpZigib2JqZWN0IiE9dHlwZW9mIGV8fG51bGw9PT1lKXRocm93IG5ldyBUeXBlRXJyb3IoImB0YXJnZXRgIG11c3QgYmUgYW4gb2JqZWN0Iik7dD1kZWZhdWx0TWV0aG9kTmFtZXNPckFzc2VydCQxKHQpO2Zvcihjb25zdCByIG9mIHQpe2lmKHZvaWQgMCE9PWVbcl0pdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvcGVydHkgXGAke3J9XGAgYWxyZWFkeSBleGlzdHMgb24gXGB0YXJnZXRcYGApO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIse2VudW1lcmFibGU6ITEsdmFsdWU6dGhpc1tyXS5iaW5kKHRoaXMpfSl9fX07Y29uc3QgZmU9T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYWUucHJvdG90eXBlKS5maWx0ZXIoKGU9PiJjb25zdHJ1Y3RvciIhPT1lKSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KGFlLCJsaXN0ZW5lckFkZGVkIix7dmFsdWU6dGUsd3JpdGFibGU6ITEsZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITF9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYWUsImxpc3RlbmVyUmVtb3ZlZCIse3ZhbHVlOnJlLHdyaXRhYmxlOiExLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiExfSk7Y2xhc3MgQXZlcmFnZXtjb25zdHJ1Y3RvcihlKXt0aGlzLnNpemU9ZSx0aGlzLnZhbHVlcz1bXSx0aGlzLnN1bT0wfXB1c2goZSl7Zm9yKHRoaXMudmFsdWVzLnB1c2goZSksdGhpcy5zdW0rPWU7dGhpcy5zaXplPHRoaXMudmFsdWVzLmxlbmd0aDspdGhpcy5zdW0tPXRoaXMudmFsdWVzLnNoaWZ0KCk/PzB9dmFsdWUoKXtyZXR1cm4gdGhpcy5zdW0vTWF0aC5tYXgoMSx0aGlzLnZhbHVlcy5sZW5ndGgpfX1jbGFzcyBOb2lzZVN1cHByZXNzaW9uVHJhbnNmb3JtZXIgZXh0ZW5kcyBhZXtjb25zdHJ1Y3Rvcigpe3N1cGVyKCksdGhpcy5pc0VuYWJsZWQ9ITAsdGhpcy5pbnRlcm5hbFJlc2FtcGxlU3VwcG9ydGVkPSExLHRoaXMubGF0ZW5jeT1uZXcgQXZlcmFnZSgxMDApLHRoaXMudHJhbnNmb3JtPXRoaXMudHJhbnNmb3JtQXVkaW9EYXRhLmJpbmQodGhpcyl9YXN5bmMgaW5pdChlPXt9KXtjb25zb2xlLmxvZygiTm9pc2Ugc3VwcHJlc3Npb24gdHJhbnNmb3JtZXIgaW5pdGlhbGl6YXRpb24iKSx0aGlzLnRyYW5zZm9ybT1lLmRlYnVnP3RoaXMudHJhbnNmb3JtRGVidWcuYmluZCh0aGlzKTp0aGlzLnRyYW5zZm9ybUF1ZGlvRGF0YS5iaW5kKHRoaXMpO2NvbnN0IHQ9ZS5hc3NldHNEaXJCYXNlVXJsPz8iaHR0cHM6Ly9kM29wcWptcXp4ZjA1Ny5jbG91ZGZyb250Lm5ldC9ub2lzZS1zdXBwcmVzc2lvbi8xLjAuMC1iZXRhLjQiLGxvY2F0ZUZpbGU9ZT0+YCR7dH0vJHtlfWA7bGV0IHIsbj0xO2F3YWl0IHRoaXMuaXNNb25vVGhyZWFkKGUpP3RoaXMud2FzbUluc3RhbmNlPWF3YWl0IGNyZWF0ZVdhc21Nb25vSW5zdGFuY2Uoe2xvY2F0ZUZpbGU6bG9jYXRlRmlsZSxtYWluU2NyaXB0VXJsT3JCbG9iOmxvY2F0ZUZpbGUoIm1haW4tYmluLW1vbm8uanMiKX0pOih0aGlzLndhc21JbnN0YW5jZT1hd2FpdCBjcmVhdGVXYXNtTXVsdGlJbnN0YW5jZSh7bG9jYXRlRmlsZTpsb2NhdGVGaWxlLG1haW5TY3JpcHRVcmxPckJsb2I6bG9jYXRlRmlsZSgibWFpbi1iaW4tbXVsdGkuanMiKX0pLG49MyksdGhpcy53YXNtVHJhbnNmb3JtZXI9bmV3IHRoaXMud2FzbUluc3RhbmNlLkR0bG5UcmFuc2Zvcm1lcixhd2FpdCBQcm9taXNlLmFsbChbdGhpcy5sb2FkTW9kZWwoYCR7dH0vbW9kZWxfMS50ZmxpdGVgLDEpLHRoaXMubG9hZE1vZGVsKGAke3R9L21vZGVsXzIudGZsaXRlYCwyKV0pO3RyeXtyPXRoaXMud2FzbVRyYW5zZm9ybWVyPy5pbml0KG4pfWNhdGNoKGMpe2lmKCJudW1iZXIiPT10eXBlb2YgYyl7bGV0IGU9IiI7Zm9yKGxldCB0PTA7dDw1MDA7Kyt0KWUrPVN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy53YXNtSW5zdGFuY2UuSEVBUDhbYyt0XSk7Y29uc29sZS5lcnJvcihlKX1lbHNlIGNvbnNvbGUuZXJyb3IoYyl9aWYoMCE9PXIpe2NvbnN0IGU9YEZhaWwgdG8gaW5pdCB3YXNtIHRyYW5zZm9ybWVyLCBlcnJvciBjb2RlID0gJHtyfWA7dGhyb3cgY29uc29sZS5lcnJvcihlKSxlfWlmKHRoaXMuaW50ZXJuYWxSZXNhbXBsZVN1cHBvcnRlZD10aGlzLndhc21UcmFuc2Zvcm1lcj8uZ2V0SW50ZXJuYWxSZXNhbXBsZVN1cHBvcnRlZCgpLCF0aGlzLmludGVybmFsUmVzYW1wbGVTdXBwb3J0ZWQpe2NvbnN0IGU9IkludGVybmFsIHJlc2FtcGxpbmcgbm90IHN1cHBvcnRlZCI7dGhyb3cgY29uc29sZS5lcnJvcihlKSxlfWNvbnNvbGUubG9nKCJOb2lzZSBzdXBwcmVzc2lvbiB0cmFuc2Zvcm1lciByZWFkeSIpfXNldEF1ZGlvT3B0aW9ucyhlLHQscixuLGMpe3RoaXMud2FzbVRyYW5zZm9ybWVyPy5zZXRBdWRpb09wdGlvbnMoZSx0LHIsbixjKX1lbmFibGUoKXt0aGlzLmlzRW5hYmxlZD0hMH1kaXNhYmxlKCl7dGhpcy5pc0VuYWJsZWQ9ITF9Z2V0TGF0ZW5jeSgpe3JldHVybiB0aGlzLmxhdGVuY3kudmFsdWUoKX1nZXRXYXNtTGF0ZW5jeU5zKCl7cmV0dXJuIHRoaXMud2FzbVRyYW5zZm9ybWVyPy5nZXRMYXRlbmN5TnMoKT8/MH1hc3luYyB0cmFuc2Zvcm1EZWJ1ZyhlLHQpe3RyeXtjb25zdCByPXBlcmZvcm1hbmNlLm5vdygpO2F3YWl0IHRoaXMudHJhbnNmb3JtQXVkaW9EYXRhKGUsdCksdGhpcy5sYXRlbmN5LnB1c2gocGVyZm9ybWFuY2Uubm93KCktcil9Y2F0Y2gocil7Y29uc29sZS5lcnJvcihyKX19YXN5bmMgdHJhbnNmb3JtQXVkaW9EYXRhKGUsdCl7aWYodGhpcy53YXNtVHJhbnNmb3JtZXJ8fHRoaXMuZW1pdCgid2FybmluZyIsInRyYW5zZm9ybWVyIG5vdCBpbml0aWFsaXplZCIpLHRoaXMuaXNFbmFibGVkJiZ0aGlzLndhc21UcmFuc2Zvcm1lcil0cnl7Y29uc3QgdD10aGlzLmdldEF1ZGlvRGF0YUFzRmxvYXQzMihlKSxuPXRoaXMuY29udmVydFR5cGVkQXJyYXkodCxJbnQxNkFycmF5LDMyNzY3KTt0aGlzLndhc21UcmFuc2Zvcm1lci5nZXRJbnB1dEZyYW1lKGUubnVtYmVyT2ZGcmFtZXMpLnNldChuKTtsZXQgYz0wO3RyeXtjPXRoaXMud2FzbVRyYW5zZm9ybWVyLnJ1bkFsZ29yaXRobShlLm51bWJlck9mRnJhbWVzLGUuc2FtcGxlUmF0ZSxlLm51bWJlck9mQ2hhbm5lbHMpfWNhdGNoKHIpe2lmKCJudW1iZXIiPT10eXBlb2Ygcil7bGV0IGU9IiI7Zm9yKGxldCB0PTA7dDw1MDA7Kyt0KWUrPVN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy53YXNtSW5zdGFuY2UuSEVBUDhbcit0XSk7Y29uc29sZS5lcnJvcihlKX1lbHNlIGNvbnNvbGUuZXJyb3Iocil9aWYoYz4wKXtjb25zdCB0PXRoaXMud2FzbVRyYW5zZm9ybWVyLmdldE91dHB1dEZyYW1lKCkuc2xpY2UoMCxjKSxyPXRoaXMuY29udmVydFR5cGVkQXJyYXkodCxGbG9hdDMyQXJyYXksMS8zMjc2Nykse3RpbWVzdGFtcDpuLHNhbXBsZVJhdGU6ZixudW1iZXJPZkNoYW5uZWxzOmh9PWU7ZT1uZXcgQXVkaW9EYXRhKHtkYXRhOnIsZm9ybWF0OiJmMzItcGxhbmFyIixudW1iZXJPZkNoYW5uZWxzOmgsbnVtYmVyT2ZGcmFtZXM6ci5sZW5ndGgsc2FtcGxlUmF0ZTpmLHRpbWVzdGFtcDpufSl9fWNhdGNoKHIpe2NvbnNvbGUuZXJyb3Iocil9dC5lbnF1ZXVlKGUpfWFzeW5jIGxvYWRNb2RlbChlLHQpe2lmKCF0aGlzLndhc21UcmFuc2Zvcm1lcilyZXR1cm47Y29uc3Qgcj1hd2FpdCBmZXRjaChlKSxuPWF3YWl0IHIuYXJyYXlCdWZmZXIoKSxjPW4uYnl0ZUxlbmd0aCxmPWBnZXRNb2RlbCR7dH1gLGg9dGhpcy53YXNtVHJhbnNmb3JtZXJbZl0oYyk7aWYoaCl7Y29uc3QgZT1uZXcgVWludDhBcnJheShuKTtoLnNldChlKX19Z2V0QXVkaW9EYXRhQXNGbG9hdDMyKGUpe3JldHVybiB0aGlzLmF1ZGlvRGF0YVRvVHlwZWRBcnJheShlLEZsb2F0MzJBcnJheSwiZjMyLXBsYW5hciIsMSl9YXVkaW9EYXRhVG9UeXBlZEFycmF5KGUsdCxyLG49ZS5udW1iZXJPZkNoYW5uZWxzKXtjb25zdCBjPW5ldyB0KGUubnVtYmVyT2ZGcmFtZXMqbik7Zm9yKGxldCBmPTA7ZjxuOysrZil7Y29uc3QgdD1lLm51bWJlck9mRnJhbWVzKmYsbj1jLnN1YmFycmF5KHQsdCtlLm51bWJlck9mRnJhbWVzKTtlLmNvcHlUbyhuLHtwbGFuZUluZGV4OmYsZm9ybWF0OnJ9KX1yZXR1cm4gY31jb252ZXJ0VHlwZWRBcnJheShlLHQscil7Y29uc3Qgbj1lLmxlbmd0aCxjPW5ldyB0KG4pO2ZvcihsZXQgZj0wO2Y8bjsrK2YpY1tmXT1lW2ZdKnI7cmV0dXJuIGN9aXNNb25vVGhyZWFkKGUpe2lmKGUuZGlzYWJsZVdhc21NdWx0aVRocmVhZClyZXR1cm4hMDt0cnl7aWYodm9pZCAwPT09bmV3IFNoYXJlZEFycmF5QnVmZmVyKDEwMjQpKXRocm93IG5ldyBFcnJvcigibm90IHN1cHBvcnRlZCIpfWNhdGNoKHQpe3JldHVybiB0aGlzLmVtaXQoIndhcm5pbmciLCJcbk11bHRpdGhyZWFkIGlzIG5vdCBhdmFpbGFibGUsIG5vaXNlLXN1cHByZXNpb24gaXMgbm93IHJ1bm5pbmcgb24gYSBzaW5nbGUgdGhyZWFkLlxuVGhpcyBpcyBpbXBhY3RpbmcgdGhlIHBlcmZvcm1hbmNlIGFuZCBpbmNyZWFzZSB0aGUgbGF0ZW5jeS5cblxuVG8gZW5hYmxlIG11bHRpdGhyZWFkLCB5b3UgbmVlZCB0byBzZXJ2ZSB0aGUgYXBwbGljYXRpb24gdmlhIGh0dHBzIHdpdGggdGhlc2UgaHR0cCBoZWFkZXJzIDpcbiAgIC0gQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3k6IHNhbWUtb3JpZ2luXG4gICAtIENyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3k6IHJlcXVpcmUtY29ycC5cbk1vcmUgaW5mbzogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU2hhcmVkQXJyYXlCdWZmZXIjc2VjdXJpdHlfcmVxdWlyZW1lbnRzXG5cbllvdSBjYW4gZGlzYWJsZSB0aGlzIHdhcm5pbmcgYnkgZW5hYmxpbmcgZGlzYWJsZVdhc21NdWx0aVRocmVhZCB3aXRoaW4gdGhlIG5vaXNlU3VwcHJlc3Npb24gb3B0aW9ucy5cbiIpLCEwfXJldHVybiExfX1mdW5jdGlvbiBjcmVhdGVHbG9iYWxUaGlzVmFyaWFibGUoZSx0KXtnbG9iYWxUaGlzLnZvbmFnZXx8KGdsb2JhbFRoaXMudm9uYWdlPXt9KSxnbG9iYWxUaGlzLnZvbmFnZS53b3JrZXJpemVyfHwoZ2xvYmFsVGhpcy52b25hZ2Uud29ya2VyaXplcj17fSk7bGV0IHI9Z2xvYmFsVGhpcy52b25hZ2Uud29ya2VyaXplcjtyZXR1cm4gcltlXXx8KHJbZV09dCkscltlXX1jb25zdCBwZT1jcmVhdGVHbG9iYWxUaGlzVmFyaWFibGUoImdsb2JhbHMiLHt9KTt2YXIgd2U9KGU9PihlLklOSVQ9IklOSVQiLGUuRk9SV0FSRD0iRk9SV0FSRCIsZS5URVJNSU5BVEU9IlRFUk1JTkFURSIsZS5HTE9CQUxTX1NZTkM9IkdMT0JBTFNfU1lOQyIsZS5FVkVOVD0iRVZFTlQiLGUpKSh3ZXx8e30pO2Z1bmN0aW9uIHBvc3RDb21tYW5kKGUsdCl7Y29uc3R7aWQ6cix0eXBlOm59PWUsYz1BcnJheS5pc0FycmF5KHQpP3Q6W3RdO3Bvc3RNZXNzYWdlKHtpZDpyLHR5cGU6bixyZXN1bHQ6dH0sYy5maWx0ZXIoKGU9PmZ1bmN0aW9uIGlzVHJhbnNmZXJhYmxlKGUpe3JldHVybltJbWFnZUJpdG1hcCxSZWFkYWJsZVN0cmVhbSxXcml0YWJsZVN0cmVhbV0uc29tZSgodD0+ZSBpbnN0YW5jZW9mIHQpKX0oZSkpKSl9ZnVuY3Rpb24gaXNXb3JrZXIoKXtyZXR1cm4idW5kZWZpbmVkIiE9dHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlJiZzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGV9ZnVuY3Rpb24gY29weShlLHQpe2lmKEFycmF5LmlzQXJyYXkodCkpdC5zcGxpY2UoMCx0Lmxlbmd0aCk7ZWxzZSBpZigib2JqZWN0Ij09dHlwZW9mIHQpZm9yKGNvbnN0IHIgaW4gdClkZWxldGUgdFtyXTtmb3IoY29uc3QgciBpbiBlKUFycmF5LmlzQXJyYXkoZVtyXSk/KHRbcl09W10sY29weShlW3JdLHRbcl0pKToib2JqZWN0Ij09dHlwZW9mIGVbcl0/KHRbcl09e30sY29weShlW3JdLHRbcl0pKTp0W3JdPWVbcl19Y3JlYXRlR2xvYmFsVGhpc1ZhcmlhYmxlKCJ3b3JrZXJpemVkIix7fSk7Y29uc3QgdmU9bmV3IFdlYWtNYXAsRWU9bmV3IFdlYWtNYXAsVGU9bmV3IFdlYWtNYXAsQWU9U3ltYm9sKCJhbnlQcm9kdWNlciIpLE5lPVByb21pc2UucmVzb2x2ZSgpLCRlPVN5bWJvbCgibGlzdGVuZXJBZGRlZCIpLEllPVN5bWJvbCgibGlzdGVuZXJSZW1vdmVkIik7bGV0IERlPSExLGtlPSExO2Z1bmN0aW9uIGFzc2VydEV2ZW50TmFtZShlKXtpZigic3RyaW5nIiE9dHlwZW9mIGUmJiJzeW1ib2wiIT10eXBlb2YgZSYmIm51bWJlciIhPXR5cGVvZiBlKXRocm93IG5ldyBUeXBlRXJyb3IoImBldmVudE5hbWVgIG11c3QgYmUgYSBzdHJpbmcsIHN5bWJvbCwgb3IgbnVtYmVyIil9ZnVuY3Rpb24gYXNzZXJ0TGlzdGVuZXIoZSl7aWYoImZ1bmN0aW9uIiE9dHlwZW9mIGUpdGhyb3cgbmV3IFR5cGVFcnJvcigibGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uIil9ZnVuY3Rpb24gZ2V0TGlzdGVuZXJzKGUsdCl7Y29uc3Qgcj1FZS5nZXQoZSk7aWYoci5oYXModCkpcmV0dXJuIHIuZ2V0KHQpfWZ1bmN0aW9uIGdldEV2ZW50UHJvZHVjZXJzKGUsdCl7Y29uc3Qgcj0ic3RyaW5nIj09dHlwZW9mIHR8fCJzeW1ib2wiPT10eXBlb2YgdHx8Im51bWJlciI9PXR5cGVvZiB0P3Q6QWUsbj1UZS5nZXQoZSk7aWYobi5oYXMocikpcmV0dXJuIG4uZ2V0KHIpfWZ1bmN0aW9uIGl0ZXJhdG9yKGUsdCl7dD1BcnJheS5pc0FycmF5KHQpP3Q6W3RdO2xldCByPSExLGZsdXNoPSgpPT57fSxuPVtdO2NvbnN0IGM9e2VucXVldWUoZSl7bi5wdXNoKGUpLGZsdXNoKCl9LGZpbmlzaCgpe3I9ITAsZmx1c2goKX19O2Zvcihjb25zdCBmIG9mIHQpe2xldCB0PWdldEV2ZW50UHJvZHVjZXJzKGUsZik7aWYoIXQpe3Q9bmV3IFNldDtUZS5nZXQoZSkuc2V0KGYsdCl9dC5hZGQoYyl9cmV0dXJue2FzeW5jIG5leHQoKXtyZXR1cm4gbj8wPT09bi5sZW5ndGg/cj8obj12b2lkIDAsdGhpcy5uZXh0KCkpOihhd2FpdCBuZXcgUHJvbWlzZSgoZT0+e2ZsdXNoPWV9KSksdGhpcy5uZXh0KCkpOntkb25lOiExLHZhbHVlOmF3YWl0IG4uc2hpZnQoKX06e2RvbmU6ITB9fSxhc3luYyByZXR1cm4ocil7bj12b2lkIDA7Zm9yKGNvbnN0IG4gb2YgdCl7Y29uc3QgdD1nZXRFdmVudFByb2R1Y2VycyhlLG4pO2lmKHQmJih0LmRlbGV0ZShjKSwwPT09dC5zaXplKSl7VGUuZ2V0KGUpLmRlbGV0ZShuKX19cmV0dXJuIGZsdXNoKCksYXJndW1lbnRzLmxlbmd0aD4wP3tkb25lOiEwLHZhbHVlOmF3YWl0IHJ9Ontkb25lOiEwfX0sW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpe3JldHVybiB0aGlzfX19ZnVuY3Rpb24gZGVmYXVsdE1ldGhvZE5hbWVzT3JBc3NlcnQoZSl7aWYodm9pZCAwPT09ZSlyZXR1cm4gUmU7aWYoIUFycmF5LmlzQXJyYXkoZSkpdGhyb3cgbmV3IFR5cGVFcnJvcigiYG1ldGhvZE5hbWVzYCBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3MiKTtmb3IoY29uc3QgdCBvZiBlKWlmKCFSZS5pbmNsdWRlcyh0KSl7aWYoInN0cmluZyIhPXR5cGVvZiB0KXRocm93IG5ldyBUeXBlRXJyb3IoImBtZXRob2ROYW1lc2AgZWxlbWVudCBtdXN0IGJlIGEgc3RyaW5nIik7dGhyb3cgbmV3IEVycm9yKGAke3R9IGlzIG5vdCBFbWl0dGVyeSBtZXRob2RgKX1yZXR1cm4gZX1jb25zdCBpc01ldGFFdmVudD1lPT5lPT09JGV8fGU9PT1JZTtmdW5jdGlvbiBlbWl0TWV0YUV2ZW50KGUsdCxyKXtpZihpc01ldGFFdmVudCh0KSl0cnl7RGU9ITAsZS5lbWl0KHQscil9ZmluYWxseXtEZT0hMX19Y2xhc3MgRW1pdHRlcnl7c3RhdGljIG1peGluKGUsdCl7cmV0dXJuIHQ9ZGVmYXVsdE1ldGhvZE5hbWVzT3JBc3NlcnQodCkscj0+e2lmKCJmdW5jdGlvbiIhPXR5cGVvZiByKXRocm93IG5ldyBUeXBlRXJyb3IoImB0YXJnZXRgIG11c3QgYmUgZnVuY3Rpb24iKTtmb3IoY29uc3QgZSBvZiB0KWlmKHZvaWQgMCE9PXIucHJvdG90eXBlW2VdKXRocm93IG5ldyBFcnJvcihgVGhlIHByb3BlcnR5IFxgJHtlfVxgIGFscmVhZHkgZXhpc3RzIG9uIFxgdGFyZ2V0XGBgKTtPYmplY3QuZGVmaW5lUHJvcGVydHkoci5wcm90b3R5cGUsZSx7ZW51bWVyYWJsZTohMSxnZXQ6ZnVuY3Rpb24gZ2V0RW1pdHRlcnlQcm9wZXJ0eSgpe3JldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxlLHtlbnVtZXJhYmxlOiExLHZhbHVlOm5ldyBFbWl0dGVyeX0pLHRoaXNbZV19fSk7Y29uc3QgZW1pdHRlcnlNZXRob2RDYWxsZXI9dD0+ZnVuY3Rpb24oLi4ucil7cmV0dXJuIHRoaXNbZV1bdF0oLi4ucil9O2Zvcihjb25zdCBlIG9mIHQpT2JqZWN0LmRlZmluZVByb3BlcnR5KHIucHJvdG90eXBlLGUse2VudW1lcmFibGU6ITEsdmFsdWU6ZW1pdHRlcnlNZXRob2RDYWxsZXIoZSl9KTtyZXR1cm4gcn19c3RhdGljIGdldCBpc0RlYnVnRW5hYmxlZCgpe3ZhciBlLHQ7aWYoIm9iamVjdCIhPXR5cGVvZihudWxsPT0oZT1nbG9iYWxUaGlzLnByb2Nlc3MpP3ZvaWQgMDplLmVudikpcmV0dXJuIGtlO2NvbnN0e2VudjpyfT1udWxsIT0odD1nbG9iYWxUaGlzLnByb2Nlc3MpP3Q6e2Vudjp7fX07cmV0dXJuImVtaXR0ZXJ5Ij09PXIuREVCVUd8fCIqIj09PXIuREVCVUd8fGtlfXN0YXRpYyBzZXQgaXNEZWJ1Z0VuYWJsZWQoZSl7a2U9ZX1jb25zdHJ1Y3RvcihlPXt9KXt2YXIgdDt2ZS5zZXQodGhpcyxuZXcgU2V0KSxFZS5zZXQodGhpcyxuZXcgTWFwKSxUZS5zZXQodGhpcyxuZXcgTWFwKSxUZS5nZXQodGhpcykuc2V0KEFlLG5ldyBTZXQpLHRoaXMuZGVidWc9bnVsbCE9KHQ9ZS5kZWJ1Zyk/dDp7fSx2b2lkIDA9PT10aGlzLmRlYnVnLmVuYWJsZWQmJih0aGlzLmRlYnVnLmVuYWJsZWQ9ITEpLHRoaXMuZGVidWcubG9nZ2VyfHwodGhpcy5kZWJ1Zy5sb2dnZXI9KGUsdCxyLG4pPT57dHJ5e249SlNPTi5zdHJpbmdpZnkobil9Y2F0Y2h7bj1gT2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzIGZhaWxlZCB0byBzdHJpbmdpZnk6ICR7T2JqZWN0LmtleXMobikuam9pbigiLCIpfWB9InN5bWJvbCIhPXR5cGVvZiByJiYibnVtYmVyIiE9dHlwZW9mIHJ8fChyPXIudG9TdHJpbmcoKSk7Y29uc3QgYz1uZXcgRGF0ZSxmPWAke2MuZ2V0SG91cnMoKX06JHtjLmdldE1pbnV0ZXMoKX06JHtjLmdldFNlY29uZHMoKX0uJHtjLmdldE1pbGxpc2Vjb25kcygpfWA7Y29uc29sZS5sb2coYFske2Z9XVtlbWl0dGVyeToke2V9XVske3R9XSBFdmVudCBOYW1lOiAke3J9XG5cdGRhdGE6ICR7bn1gKX0pfWxvZ0lmRGVidWdFbmFibGVkKGUsdCxyKXsoRW1pdHRlcnkuaXNEZWJ1Z0VuYWJsZWR8fHRoaXMuZGVidWcuZW5hYmxlZCkmJnRoaXMuZGVidWcubG9nZ2VyKGUsdGhpcy5kZWJ1Zy5uYW1lLHQscil9b24oZSx0KXthc3NlcnRMaXN0ZW5lcih0KSxlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07Zm9yKGNvbnN0IHIgb2YgZSl7YXNzZXJ0RXZlbnROYW1lKHIpO2xldCBlPWdldExpc3RlbmVycyh0aGlzLHIpO2lmKCFlKXtlPW5ldyBTZXQ7RWUuZ2V0KHRoaXMpLnNldChyLGUpfWUuYWRkKHQpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInN1YnNjcmliZSIscix2b2lkIDApLGlzTWV0YUV2ZW50KHIpfHxlbWl0TWV0YUV2ZW50KHRoaXMsJGUse2V2ZW50TmFtZTpyLGxpc3RlbmVyOnR9KX1yZXR1cm4gdGhpcy5vZmYuYmluZCh0aGlzLGUsdCl9b2ZmKGUsdCl7YXNzZXJ0TGlzdGVuZXIodCksZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCByIG9mIGUpe2Fzc2VydEV2ZW50TmFtZShyKTtjb25zdCBlPWdldExpc3RlbmVycyh0aGlzLHIpO2lmKGUmJihlLmRlbGV0ZSh0KSwwPT09ZS5zaXplKSl7RWUuZ2V0KHRoaXMpLmRlbGV0ZShyKX10aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJ1bnN1YnNjcmliZSIscix2b2lkIDApLGlzTWV0YUV2ZW50KHIpfHxlbWl0TWV0YUV2ZW50KHRoaXMsSWUse2V2ZW50TmFtZTpyLGxpc3RlbmVyOnR9KX19b25jZShlKXtsZXQgdDtjb25zdCByPW5ldyBQcm9taXNlKChyPT57dD10aGlzLm9uKGUsKGU9Pnt0KCkscihlKX0pKX0pKTtyZXR1cm4gci5vZmY9dCxyfWV2ZW50cyhlKXtlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07Zm9yKGNvbnN0IHQgb2YgZSlhc3NlcnRFdmVudE5hbWUodCk7cmV0dXJuIGl0ZXJhdG9yKHRoaXMsZSl9YXN5bmMgZW1pdChlLHQpe3ZhciByO2lmKGFzc2VydEV2ZW50TmFtZShlKSxpc01ldGFFdmVudChlKSYmIURlKXRocm93IG5ldyBUeXBlRXJyb3IoImBldmVudE5hbWVgIGNhbm5vdCBiZSBtZXRhIGV2ZW50IGBsaXN0ZW5lckFkZGVkYCBvciBgbGlzdGVuZXJSZW1vdmVkYCIpO3RoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoImVtaXQiLGUsdCksZnVuY3Rpb24gZW5xdWV1ZVByb2R1Y2VycyhlLHQscil7Y29uc3Qgbj1UZS5nZXQoZSk7aWYobi5oYXModCkpZm9yKGNvbnN0IGMgb2Ygbi5nZXQodCkpYy5lbnF1ZXVlKHIpO2lmKG4uaGFzKEFlKSl7Y29uc3QgZT1Qcm9taXNlLmFsbChbdCxyXSk7Zm9yKGNvbnN0IHQgb2Ygbi5nZXQoQWUpKXQuZW5xdWV1ZShlKX19KHRoaXMsZSx0KTtjb25zdCBuPW51bGwhPShyPWdldExpc3RlbmVycyh0aGlzLGUpKT9yOm5ldyBTZXQsYz12ZS5nZXQodGhpcyksZj1bLi4ubl0saD1pc01ldGFFdmVudChlKT9bXTpbLi4uY107YXdhaXQgTmUsYXdhaXQgUHJvbWlzZS5hbGwoWy4uLmYubWFwKChhc3luYyBlPT57aWYobi5oYXMoZSkpcmV0dXJuIGUodCl9KSksLi4uaC5tYXAoKGFzeW5jIHI9PntpZihjLmhhcyhyKSlyZXR1cm4gcihlLHQpfSkpXSl9YXN5bmMgZW1pdFNlcmlhbChlLHQpe3ZhciByO2lmKGFzc2VydEV2ZW50TmFtZShlKSxpc01ldGFFdmVudChlKSYmIURlKXRocm93IG5ldyBUeXBlRXJyb3IoImBldmVudE5hbWVgIGNhbm5vdCBiZSBtZXRhIGV2ZW50IGBsaXN0ZW5lckFkZGVkYCBvciBgbGlzdGVuZXJSZW1vdmVkYCIpO3RoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoImVtaXRTZXJpYWwiLGUsdCk7Y29uc3Qgbj1udWxsIT0ocj1nZXRMaXN0ZW5lcnModGhpcyxlKSk/cjpuZXcgU2V0LGM9dmUuZ2V0KHRoaXMpLGY9Wy4uLm5dLGg9Wy4uLmNdO2F3YWl0IE5lO2Zvcihjb25zdCB1IG9mIGYpbi5oYXModSkmJmF3YWl0IHUodCk7Zm9yKGNvbnN0IHUgb2YgaCljLmhhcyh1KSYmYXdhaXQgdShlLHQpfW9uQW55KGUpe3JldHVybiBhc3NlcnRMaXN0ZW5lcihlKSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJzdWJzY3JpYmVBbnkiLHZvaWQgMCx2b2lkIDApLHZlLmdldCh0aGlzKS5hZGQoZSksZW1pdE1ldGFFdmVudCh0aGlzLCRlLHtsaXN0ZW5lcjplfSksdGhpcy5vZmZBbnkuYmluZCh0aGlzLGUpfWFueUV2ZW50KCl7cmV0dXJuIGl0ZXJhdG9yKHRoaXMpfW9mZkFueShlKXthc3NlcnRMaXN0ZW5lcihlKSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJ1bnN1YnNjcmliZUFueSIsdm9pZCAwLHZvaWQgMCksZW1pdE1ldGFFdmVudCh0aGlzLEllLHtsaXN0ZW5lcjplfSksdmUuZ2V0KHRoaXMpLmRlbGV0ZShlKX1jbGVhckxpc3RlbmVycyhlKXtlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07Zm9yKGNvbnN0IHQgb2YgZSlpZih0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJjbGVhciIsdCx2b2lkIDApLCJzdHJpbmciPT10eXBlb2YgdHx8InN5bWJvbCI9PXR5cGVvZiB0fHwibnVtYmVyIj09dHlwZW9mIHQpe2NvbnN0IGU9Z2V0TGlzdGVuZXJzKHRoaXMsdCk7ZSYmZS5jbGVhcigpO2NvbnN0IHI9Z2V0RXZlbnRQcm9kdWNlcnModGhpcyx0KTtpZihyKXtmb3IoY29uc3QgZSBvZiByKWUuZmluaXNoKCk7ci5jbGVhcigpfX1lbHNle3ZlLmdldCh0aGlzKS5jbGVhcigpO2Zvcihjb25zdFtlLHRdb2YgRWUuZ2V0KHRoaXMpLmVudHJpZXMoKSl0LmNsZWFyKCksRWUuZ2V0KHRoaXMpLmRlbGV0ZShlKTtmb3IoY29uc3RbZSx0XW9mIFRlLmdldCh0aGlzKS5lbnRyaWVzKCkpe2Zvcihjb25zdCBlIG9mIHQpZS5maW5pc2goKTt0LmNsZWFyKCksVGUuZ2V0KHRoaXMpLmRlbGV0ZShlKX19fWxpc3RlbmVyQ291bnQoZSl7dmFyIHQscixuLGMsZixoO2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtsZXQgdT0wO2Zvcihjb25zdCBkIG9mIGUpaWYoInN0cmluZyIhPXR5cGVvZiBkKXt2b2lkIDAhPT1kJiZhc3NlcnRFdmVudE5hbWUoZCksdSs9dmUuZ2V0KHRoaXMpLnNpemU7Zm9yKGNvbnN0IGUgb2YgRWUuZ2V0KHRoaXMpLnZhbHVlcygpKXUrPWUuc2l6ZTtmb3IoY29uc3QgZSBvZiBUZS5nZXQodGhpcykudmFsdWVzKCkpdSs9ZS5zaXplfWVsc2UgdSs9dmUuZ2V0KHRoaXMpLnNpemUrKG51bGwhPShyPW51bGw9PSh0PWdldExpc3RlbmVycyh0aGlzLGQpKT92b2lkIDA6dC5zaXplKT9yOjApKyhudWxsIT0oYz1udWxsPT0obj1nZXRFdmVudFByb2R1Y2Vycyh0aGlzLGQpKT92b2lkIDA6bi5zaXplKT9jOjApKyhudWxsIT0oaD1udWxsPT0oZj1nZXRFdmVudFByb2R1Y2Vycyh0aGlzKSk/dm9pZCAwOmYuc2l6ZSk/aDowKTtyZXR1cm4gdX1iaW5kTWV0aG9kcyhlLHQpe2lmKCJvYmplY3QiIT10eXBlb2YgZXx8bnVsbD09PWUpdGhyb3cgbmV3IFR5cGVFcnJvcigiYHRhcmdldGAgbXVzdCBiZSBhbiBvYmplY3QiKTt0PWRlZmF1bHRNZXRob2ROYW1lc09yQXNzZXJ0KHQpO2Zvcihjb25zdCByIG9mIHQpe2lmKHZvaWQgMCE9PWVbcl0pdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvcGVydHkgXGAke3J9XGAgYWxyZWFkeSBleGlzdHMgb24gXGB0YXJnZXRcYGApO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIse2VudW1lcmFibGU6ITEsdmFsdWU6dGhpc1tyXS5iaW5kKHRoaXMpfSl9fX1jb25zdCBSZT1PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhFbWl0dGVyeS5wcm90b3R5cGUpLmZpbHRlcigoZT0+ImNvbnN0cnVjdG9yIiE9PWUpKTtPYmplY3QuZGVmaW5lUHJvcGVydHkoRW1pdHRlcnksImxpc3RlbmVyQWRkZWQiLHt2YWx1ZTokZSx3cml0YWJsZTohMSxlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbWl0dGVyeSwibGlzdGVuZXJSZW1vdmVkIix7dmFsdWU6SWUsd3JpdGFibGU6ITEsZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITF9KTtjb25zdCB4ZT1jcmVhdGVHbG9iYWxUaGlzVmFyaWFibGUoInJlZ2lzdGVyZWRXb3JrZXJzIix7fSk7aXNXb3JrZXIoKSYmZnVuY3Rpb24gaW5pdFdvcmtlcigpe2NvbnN0IGU9e307b25tZXNzYWdlPWFzeW5jIHQ9Pntjb25zdCByPXQuZGF0YTtzd2l0Y2goci50eXBlKXtjYXNlIHdlLklOSVQ6IWZ1bmN0aW9uIGhhbmRsZUNvbW1hbmRJbml0KGUsdCl7aWYoIWUuYXJncyl0aHJvdyJNaXNzaW5nIGNsYXNzTmFtZSB3aGlsZSBpbml0aWFsaXppbmcgd29ya2VyIjtjb25zdFtyLG5dPWUuYXJncyxjPXhlW3JdO2lmKCFjKXRocm93YHVua25vd24gd29ya2VyIGNsYXNzICR7cn1gO3QuaW5zdGFuY2U9bmV3IGMoZS5hcmdzLnNsaWNlKDEpKSxjb3B5KG4scGUpLGZ1bmN0aW9uIGlzSW5zdGFuY2VPZkVtaXR0ZXJ5KGUpe3JldHVybiBlLm9uQW55JiZlLmVtaXR9KHQuaW5zdGFuY2UpJiZ0Lmluc3RhbmNlLm9uQW55KCgoZSx0KT0+e3Bvc3RDb21tYW5kKHt0eXBlOndlLkVWRU5UfSx7bmFtZTplLGRhdGE6dH0pfSkpLHBvc3RDb21tYW5kKGUsdm9pZCAwIT09dHlwZW9mIHQuaW5zdGFuY2UpfShyLGUpO2JyZWFrO2Nhc2Ugd2UuRk9SV0FSRDohYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29tbWFuZEZvcndhcmQoZSx0KXtjb25zdHtmdW5jdGlvbk5hbWU6cixhcmdzOm59PWU7aWYoIXQuaW5zdGFuY2UpdGhyb3ciaW5zdGFuY2Ugbm90IGluaXRpYWxpemVkIjtpZighcil0aHJvdyJtaXNzaW5nIGZ1bmN0aW9uIG5hbWUgdG8gY2FsbCI7aWYoIXQuaW5zdGFuY2Vbcl0pdGhyb3dgdW5kZWZpbmVkIGZ1bmN0aW9uIFske3J9XSBpbiBjbGFzcyAke3QuaW5zdGFuY2UuY29uc3RydWN0b3Iud29ya2VySWR9YDtwb3N0Q29tbWFuZChlLGF3YWl0IHQuaW5zdGFuY2Vbcl0oLi4ubnVsbCE9bj9uOltdKSl9KHIsZSk7YnJlYWs7Y2FzZSB3ZS5URVJNSU5BVEU6IWFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvbW1hbmRUZXJtaW5hdGUoZSx0KXtjb25zdHthcmdzOnJ9PWU7aWYoIXQuaW5zdGFuY2UpdGhyb3ciaW5zdGFuY2Ugbm90IGluaXRpYWxpemVkIjtsZXQgbjt0Lmluc3RhbmNlLnRlcm1pbmF0ZSYmKG49YXdhaXQgdC5pbnN0YW5jZS50ZXJtaW5hdGUoLi4ubnVsbCE9cj9yOltdKSkscG9zdENvbW1hbmQoZSxuKX0ocixlKTticmVhaztjYXNlIHdlLkdMT0JBTFNfU1lOQzohZnVuY3Rpb24gaGFuZGxlQ29tbWFuZEdsb2JhbHNTeW5jKGUpe2lmKCFlLmFyZ3MpdGhyb3ciTWlzc2luZyBnbG9iYWxzIHdoaWxlIHN5bmNpbmciO2NvcHkoZS5hcmdzWzBdLHBlKSxwb3N0Q29tbWFuZChlLHt9KX0ocil9fX0oKTshZnVuY3Rpb24gcmVnaXN0ZXJXb3JrZXIoZSx0KXt0LndvcmtlcklkPWUsaXNXb3JrZXIoKSYmKHhlW3Qud29ya2VySWRdPXQpfSgiUHJvY2Vzc29yV29ya2VyIixjbGFzcyBfUHJvY2Vzc29yV29ya2VyIGV4dGVuZHMgYWV7Y29uc3RydWN0b3IoKXtzdXBlciguLi5hcmd1bWVudHMpLHRoaXMucHJvY2Vzc29yPW5ldyBPZX1hc3luYyBpbml0KGU9e30pe3RoaXMudHJhbnNmb3JtZXI9bmV3IE5vaXNlU3VwcHJlc3Npb25UcmFuc2Zvcm1lcix0aGlzLnByb2Nlc3Nvci5vbkFueSgoKGUsdCk9PnRoaXMuZW1pdChlLHQpKSksdGhpcy50cmFuc2Zvcm1lci5vbkFueSgoKGUsdCk9PnRoaXMuZW1pdChlLHQpKSksYXdhaXQgdGhpcy50cmFuc2Zvcm1lci5pbml0KGUpLGF3YWl0IHRoaXMucHJvY2Vzc29yLnNldFRyYW5zZm9ybWVycyhbdGhpcy50cmFuc2Zvcm1lcl0pfXRyYW5zZm9ybShlLHQpe3RoaXMucHJvY2Vzc29yLnRyYW5zZm9ybShlLHQpfXNldEF1ZGlvT3B0aW9ucyhlLHQscixuLGMpe3RoaXMudHJhbnNmb3JtZXI/LnNldEF1ZGlvT3B0aW9ucyhlLHQscixuLGMpfWVuYWJsZSgpe3RoaXMudHJhbnNmb3JtZXI/LmVuYWJsZSgpfWRpc2FibGUoKXt0aGlzLnRyYW5zZm9ybWVyPy5kaXNhYmxlKCl9YXN5bmMgdGVybWluYXRlKCl7YXdhaXQgdGhpcy5wcm9jZXNzb3IuZGVzdHJveSgpfWdldExhdGVuY3koKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm1lcj8uZ2V0TGF0ZW5jeSgpPz8wfWdldFdhc21MYXRlbmN5TnMoKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm1lcj8uZ2V0V2FzbUxhdGVuY3lOcygpPz8wfX0pfSgpOwo=';
const blob = typeof window !== 'undefined' && window.Blob && new Blob([atob(encodedJs)], { type: 'text/javascript;charset=utf-8' });
function WorkerWrapper() {
  let objURL;
  try {
    objURL = blob && (window.URL || window.webkitURL).createObjectURL(blob);
    if (!objURL) throw '';
    return new Worker(objURL);
  } catch (e) {
    return new Worker('data:application/javascript;base64,' + encodedJs);
  } finally {
    objURL && (window.URL || window.webkitURL).revokeObjectURL(objURL);
  }
}
class ProcessorMain extends Emittery$1 {
  constructor() {
    super(...arguments);
    this.isEnabled = true;
  }
  async init(options = {}) {
    await this.startWorker(options);
  }
  async enable() {
    this.isEnabled = true;
    await this.worker?.enable();
  }
  async disable() {
    this.isEnabled = false;
    await this.worker?.disable();
  }
  async transform(readable, writable) {
    await this.startWorker();
    await this.worker?.transform(readable, writable);
  }
  async destroy() {
    await this.worker?.terminate();
    this.worker = void 0;
  }
  async setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter) {
    await this.worker?.setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter);
  }
  /**
   * Return the latency of the transformation
   * The latency will be computed only if the options debug flag is true
   * Otherwise, will return 0;
   * @returns latency
   */
  async getLatency() {
    return this.worker?.getLatency() ?? 0;
  }
  /**
   * Return the latency of processing within the wasm in nanoseconds.
   * @returns latency
   */
  async getWasmLatencyNs() {
    return this.worker?.getWasmLatencyNs() ?? 0;
  }
  async startWorker(options = {}) {
    if (this.worker) {
      return;
    }
    this.worker = await workerize(ProcessorWorker, WorkerWrapper);
    this.worker.onAny((name, data) => this.emit(name, data));
    await this.worker.init(options);
    if (!this.isEnabled) {
      await this.worker.disable();
    }
  }
  /**
   * Delete the noise suppression
   */
  async close() {
    await this.worker?.terminate();
  }
}
class VonageNoiseSuppression extends Emittery$1 {
  /**
   * Initialize the transformer.
   * It is mandatory to call this function before using the NoiseSuppression
   * @param options Options used to initialize the transformer
   */
  async init(options = {}) {
    this.worker = new ProcessorMain();
    this.worker.onAny((name, data) => this.emit(name, data));
    await this.worker.init(options);
    this.connector = new Fe(this.worker);
  }
  /**
   * MediaProcessorConnector getter
   * @returns connector
   */
  getConnector() {
    return this.connector;
  }
  /**
   * Delete the noise suppression
   */
  async close() {
    await this.worker?.close();
  }
  /**
   * Enable the noise reduction
   */
  async enable() {
    await this.worker?.enable();
  }
  /**
   * Disable the noise reduction
   */
  async disable() {
    await this.worker?.disable();
  }
  /**
   * Return the latency of the transformation
   * The latency will be computed only if the options debug flag is true
   * Otherwise, will return 0;
   * @returns latency
   */
  async getLatency() {
    return this.worker?.getLatency() ?? 0;
  }
  /**
   * Return the latency of processing within the wasm in nanoseconds.
   * @returns latency
   */
  async getWasmLatencyNs() {
    return this.worker?.getWasmLatencyNs() ?? 0;
  }
}
function createVonageNoiseSuppression() {
  return new VonageNoiseSuppression();
}
export { NoiseSuppressionTransformer, VonageNoiseSuppression, createVonageNoiseSuppression };
