/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/TimestampQueryManager.ts":
/*!**************************************!*\
  !*** ./src/TimestampQueryManager.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TimestampQueryManager_timestampQuerySet, _TimestampQueryManager_timestampBuffer, _TimestampQueryManager_timestampMapBuffer, _TimestampQueryManager_callback;
class TimestampQueryManager {
    constructor(device, callback) {
        _TimestampQueryManager_timestampQuerySet.set(this, void 0);
        _TimestampQueryManager_timestampBuffer.set(this, void 0);
        _TimestampQueryManager_timestampMapBuffer.set(this, void 0);
        _TimestampQueryManager_callback.set(this, void 0);
        this.timestampSupported = device.features.has('timestamp-query');
        if (!this.timestampSupported)
            return;
        __classPrivateFieldSet(this, _TimestampQueryManager_callback, callback, "f");
        const timestampByteSize = 8;
        __classPrivateFieldSet(this, _TimestampQueryManager_timestampQuerySet, device.createQuerySet({
            type: 'timestamp',
            count: 2,
        }), "f");
        __classPrivateFieldSet(this, _TimestampQueryManager_timestampBuffer, device.createBuffer({
            size: __classPrivateFieldGet(this, _TimestampQueryManager_timestampQuerySet, "f").count * timestampByteSize,
            usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.QUERY_RESOLVE,
        }), "f");
        __classPrivateFieldSet(this, _TimestampQueryManager_timestampMapBuffer, device.createBuffer({
            size: __classPrivateFieldGet(this, _TimestampQueryManager_timestampBuffer, "f").size,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        }), "f");
    }
    addTimestampWrite(passDescriptor) {
        if (this.timestampSupported) {
            passDescriptor.timestampWrites = {
                querySet: __classPrivateFieldGet(this, _TimestampQueryManager_timestampQuerySet, "f"),
                beginningOfPassWriteIndex: 0,
                endOfPassWriteIndex: 1,
            };
        }
        return passDescriptor;
    }
    resolve(commandEncoder) {
        if (!this.timestampSupported)
            return;
        commandEncoder.resolveQuerySet(__classPrivateFieldGet(this, _TimestampQueryManager_timestampQuerySet, "f"), 0, __classPrivateFieldGet(this, _TimestampQueryManager_timestampQuerySet, "f").count, __classPrivateFieldGet(this, _TimestampQueryManager_timestampBuffer, "f"), 0);
        if (__classPrivateFieldGet(this, _TimestampQueryManager_timestampMapBuffer, "f").mapState === 'unmapped') {
            commandEncoder.copyBufferToBuffer(__classPrivateFieldGet(this, _TimestampQueryManager_timestampBuffer, "f"), 0, __classPrivateFieldGet(this, _TimestampQueryManager_timestampMapBuffer, "f"), 0, __classPrivateFieldGet(this, _TimestampQueryManager_timestampBuffer, "f").size);
        }
    }
    tryInitiateTimestampDownload() {
        if (!this.timestampSupported)
            return;
        if (__classPrivateFieldGet(this, _TimestampQueryManager_timestampMapBuffer, "f").mapState !== 'unmapped')
            return;
        const buffer = __classPrivateFieldGet(this, _TimestampQueryManager_timestampMapBuffer, "f");
        void buffer.mapAsync(GPUMapMode.READ).then(() => {
            const rawData = buffer.getMappedRange();
            const timestamps = new BigUint64Array(rawData);
            const elapsedNs = Number(timestamps[1] - timestamps[0]);
            if (elapsedNs >= 0 && __classPrivateFieldGet(this, _TimestampQueryManager_callback, "f")) {
                __classPrivateFieldGet(this, _TimestampQueryManager_callback, "f").call(this, elapsedNs);
            }
            buffer.unmap();
        });
    }
    downloadTimestampResult() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.timestampSupported)
                return 0;
            if (__classPrivateFieldGet(this, _TimestampQueryManager_timestampMapBuffer, "f").mapState !== 'unmapped')
                return 0;
            yield __classPrivateFieldGet(this, _TimestampQueryManager_timestampMapBuffer, "f").mapAsync(GPUMapMode.READ);
            const rawData = __classPrivateFieldGet(this, _TimestampQueryManager_timestampMapBuffer, "f").getMappedRange();
            const timestamps = new BigUint64Array(rawData);
            const elapsedNs = Number(timestamps[1] - timestamps[0]);
            __classPrivateFieldGet(this, _TimestampQueryManager_timestampMapBuffer, "f").unmap();
            return elapsedNs;
        });
    }
}
_TimestampQueryManager_timestampQuerySet = new WeakMap(), _TimestampQueryManager_timestampBuffer = new WeakMap(), _TimestampQueryManager_timestampMapBuffer = new WeakMap(), _TimestampQueryManager_callback = new WeakMap();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TimestampQueryManager);


/***/ }),

/***/ "./src/gpu-matrix.ts":
/*!***************************!*\
  !*** ./src/gpu-matrix.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   runWebGPUMultiplication: () => (/* binding */ runWebGPUMultiplication)
/* harmony export */ });
/* harmony import */ var _matrixMulti_wgsl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./matrixMulti.wgsl */ "./src/matrixMulti.wgsl");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util */ "./src/util.ts");
/* harmony import */ var _TimestampQueryManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TimestampQueryManager */ "./src/TimestampQueryManager.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



// Verify the matrix multiplication result
function verify_result(M, N, P, width) {
    for (let row = 0; row < width; row++) {
        for (let col = 0; col < width; col++) {
            let sum = 0;
            for (let k = 0; k < width; k++) {
                sum += M[row * width + k] * N[k * width + col];
            }
            const expected = sum;
            const actual = P[row * width + col];
            if (expected !== actual) {
                console.error(`Mismatch at [${row}, ${col}]: expected ${expected}, got ${actual}`);
                return false;
            }
        }
    }
    console.log("Matrix multiplication result is correct.");
}
// Function to print a matrix to the console
function printMatrix(matrix, width, label) {
    console.log(`\n${label}:`);
    for (let row = 0; row < width; row++) {
        let rowStr = '';
        for (let col = 0; col < width; col++) {
            rowStr += matrix[row * width + col].toString().padStart(4) + ' ';
        }
        console.log(rowStr);
    }
}
function runWebGPUMultiplication(M, N) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (navigator.gpu === undefined) {
            document.getElementById("webgpu-canvas").setAttribute("style", "display:none;");
            document.getElementById("no-webgpu").setAttribute("style", "display:block;");
            return;
        }
        // Get a GPU device to render with
        const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter({
            featureLevel: 'compatibility',
        }));
        const supportsTimestampQueries = adapter === null || adapter === void 0 ? void 0 : adapter.features.has('timestamp-query');
        const device = yield (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice({
            // We request a device that has support for timestamp queries
            requiredFeatures: supportsTimestampQueries ? ['timestamp-query'] : [],
        }));
        (0,_util__WEBPACK_IMPORTED_MODULE_1__.quitIfWebGPUNotAvailable)(adapter, device);
        const computePassDescriptor = {};
        const timestampQueryManager = new _TimestampQueryManager__WEBPACK_IMPORTED_MODULE_2__["default"](device, (elapsedNs) => {
            // Convert from nanoseconds to milliseconds:
            const elapsedMs = Number(elapsedNs) * 1e-6;
        });
        // Setup shader modules
        var shaderModule = device.createShaderModule({ code: _matrixMulti_wgsl__WEBPACK_IMPORTED_MODULE_0__ });
        var compilationInfo = yield shaderModule.getCompilationInfo();
        if (compilationInfo.messages.length > 0) {
            var hadError = false;
            console.log("Shader compilation log:");
            for (var i = 0; i < compilationInfo.messages.length; ++i) {
                var msg = compilationInfo.messages[i];
                console.log(`${msg.lineNum}:${msg.linePos} - ${msg.message}`);
                hadError = hadError || msg.type == "error";
            }
            if (hadError) {
                console.log("Shader failed to compile");
                return;
            }
        }
        // Define the size of matrix
        const Width = M.length;
        const matrixSize = Width * Width;
        const bufferSize = matrixSize * Uint32Array.BYTES_PER_ELEMENT;
        // Generate random M and N matrices
        const h_M = new Uint32Array(M.flat());
        const h_N = new Uint32Array(N.flat());
        // printMatrix(h_M, Width, "Matrix M");
        // printMatrix(h_N, Width, "Matrix N");
        // Allocate GPU memory for M, N, P, and Width
        const d_M = device.createBuffer({
            label: "M",
            size: bufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true
        });
        const d_N = device.createBuffer({
            label: "N",
            size: bufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true
        });
        const d_P = device.createBuffer({
            label: "P",
            size: bufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true
        });
        const d_Width = device.createBuffer({
            label: "Width",
            size: 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true
        });
        // Transfer M, N, and Width from CPU to GPU
        new Uint32Array(d_M.getMappedRange()).set(h_M);
        new Uint32Array(d_N.getMappedRange()).set(h_N);
        new Uint32Array(d_Width.getMappedRange()).set([Width]);
        // Unmap the buffers
        d_M.unmap();
        d_N.unmap();
        d_P.unmap();
        d_Width.unmap();
        // BInd group layout and bind group
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } }, // M
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } }, // N
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } }, // P
                { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } }, // Width
            ]
        });
        const bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: d_M } },
                { binding: 1, resource: { buffer: d_N } },
                { binding: 2, resource: { buffer: d_P } },
                { binding: 3, resource: { buffer: d_Width } }
            ]
        });
        // Create a pipeline layout
        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });
        // Create a compute pipeline
        const computePipeline = device.createComputePipeline({
            layout: pipelineLayout,
            compute: {
                module: shaderModule,
                entryPoint: "main",
            },
        });
        timestampQueryManager.addTimestampWrite(computePassDescriptor);
        // Create a command encoder and a compute pass
        const commandEncoder = device.createCommandEncoder();
        const pass = commandEncoder.beginComputePass(computePassDescriptor);
        pass.setPipeline(computePipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(Width / 16), Math.ceil(Width / 16));
        pass.end();
        timestampQueryManager.resolve(commandEncoder);
        // Copy the result from GPU to CPU
        const h_P = device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });
        commandEncoder.copyBufferToBuffer(d_P, 0, h_P, 0, bufferSize);
        // Wait for the queue to finish and read the result
        device.queue.submit([commandEncoder.finish()]);
        yield device.queue.onSubmittedWorkDone();
        yield h_P.mapAsync(GPUMapMode.READ);
        var elapsedNs = yield timestampQueryManager.downloadTimestampResult();
        elapsedNs = elapsedNs * 1e-6;
        const result = new Uint32Array(h_P.getMappedRange());
        // Print the result matrix
        // printMatrix(result, Width, "Matrix P");
        // Verify the result
        verify_result(h_M, h_N, result, Width);
        return elapsedNs;
    });
}


/***/ }),

/***/ "./src/js-matrix.ts":
/*!**************************!*\
  !*** ./src/js-matrix.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   jsMultiply: () => (/* binding */ jsMultiply)
/* harmony export */ });
function jsMultiply(A, B) {
    const n = A.length;
    const result = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += A[i][k] * B[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}


/***/ }),

/***/ "./src/util.ts":
/*!*********************!*\
  !*** ./src/util.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   quitIfAdapterNotAvailable: () => (/* binding */ quitIfAdapterNotAvailable),
/* harmony export */   quitIfLimitLessThan: () => (/* binding */ quitIfLimitLessThan),
/* harmony export */   quitIfWebGPUNotAvailable: () => (/* binding */ quitIfWebGPUNotAvailable)
/* harmony export */ });
/** Shows an error dialog if getting an adapter wasn't successful. */
function quitIfAdapterNotAvailable(adapter) {
    if (!('gpu' in navigator)) {
        fail('navigator.gpu is not defined - WebGPU not available in this browser');
    }
    if (!adapter) {
        fail("requestAdapter returned null - this sample can't run on this system");
    }
}
function quitIfLimitLessThan(adapter, limit, requiredValue, limits) {
    if (limit in adapter.limits) {
        const limitKey = limit;
        const limitValue = adapter.limits[limitKey];
        if (limitValue < requiredValue) {
            fail(`This sample can't run on this system. ${limit} is ${limitValue}, and this sample requires at least ${requiredValue}.`);
        }
        limits[limit] = requiredValue;
    }
}
/**
 * Shows an error dialog if getting a adapter or device wasn't successful,
 * or if/when the device is lost or has an uncaptured error.
 */
function quitIfWebGPUNotAvailable(adapter, device) {
    if (!device) {
        quitIfAdapterNotAvailable(adapter);
        fail('Unable to get a device for an unknown reason');
        return;
    }
    device.lost.then((reason) => {
        fail(`Device lost ("${reason.reason}"):\n${reason.message}`);
    });
    device.onuncapturederror = (ev) => {
        fail(`Uncaptured error:\n${ev.error.message}`);
    };
}
/** Fail by showing a console error, and dialog box if possible. */
const fail = (() => {
    function createErrorOutput() {
        if (typeof document === 'undefined') {
            // Not implemented in workers.
            return {
                show(msg) {
                    console.error(msg);
                },
            };
        }
        const dialogBox = document.createElement('dialog');
        dialogBox.close();
        document.body.append(dialogBox);
        const dialogText = document.createElement('pre');
        dialogText.style.whiteSpace = 'pre-wrap';
        dialogBox.append(dialogText);
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'OK';
        closeBtn.onclick = () => dialogBox.close();
        dialogBox.append(closeBtn);
        return {
            show(msg) {
                // Don't overwrite the dialog message while it's still open
                // (show the first error, not the most recent error).
                if (!dialogBox.open) {
                    dialogText.textContent = msg;
                    dialogBox.showModal();
                }
            },
        };
    }
    let output;
    return (message) => {
        if (!output)
            output = createErrorOutput();
        output.show(message);
        throw new Error(message);
    };
})();


/***/ }),

/***/ "./src/matrixMulti.wgsl":
/*!******************************!*\
  !*** ./src/matrixMulti.wgsl ***!
  \******************************/
/***/ ((module) => {

module.exports = "@group(0) @binding(0) var<storage, read> M: array<u32>;\r\n@group(0) @binding(1) var<storage, read> N: array<u32>;\r\n@group(0) @binding(2) var<storage, read_write> P: array<u32>;\r\n@group(0) @binding(3) var<storage, read> Width: u32;\r\n\r\n@compute @workgroup_size(16, 16)\r\nfn main(@builtin(global_invocation_id) global_id: vec3<u32>) {\r\n    let row = global_id.y;\r\n    let col = global_id.x;\r\n    if((row < Width) && (col < Width)) {\r\n        var Pvalue: u32 = 0;\r\n        for(var i: u32 = 0u; i < Width; i++) {\r\n            let m = M[row * Width + i];\r\n            let n = N[i * Width + col];\r\n            Pvalue = Pvalue + m * n;\r\n        }\r\n        P[row * Width + col] = Pvalue;\r\n    }\r\n}";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _js_matrix__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./js-matrix */ "./src/js-matrix.ts");
/* harmony import */ var _gpu_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gpu-matrix */ "./src/gpu-matrix.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


document.addEventListener('DOMContentLoaded', () => {
    const sizeSlider = document.getElementById("sizeSlider");
    const sizeDisplay = document.getElementById("matrixSizeDisplay");
    const sizeDisplay2 = document.getElementById("matrixSizeDisplay2");
    const matrixA = document.getElementById("matrixA");
    const matrixB = document.getElementById("matrixB");
    const resultMatrix = document.getElementById("resultMatrix");
    // const jsTime = document.getElementById("jsTime")!;
    // const gpuTime = document.getElementById("gpuTime")!;
    const calculateBtn = document.getElementById("calculateBtn");
    const clearBtn = document.getElementById("clearBtn");
    const randomBtn = document.getElementById("randomBtn");
    const largeTestBtn = document.getElementById("largeTestBtn");
    const largeMatrixSizeSelect = document.getElementById("largeMatrixSize");
    const largeMatrixTime = document.getElementById("largeMatrixTime");
    let size = parseInt(sizeSlider.value);
    // Create matrix input grids
    function createMatrix(container, size, editable = true) {
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        for (let i = 0; i < size * size; i++) {
            const input = document.createElement("input");
            input.type = "number";
            input.value = "0";
            if (!editable)
                input.disabled = true;
            container.appendChild(input);
        }
    }
    // Get values from a matrix
    function getMatrixValues(container, size) {
        const inputs = container.querySelectorAll("input");
        const values = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                const index = i * size + j;
                row.push(parseFloat(inputs[index].value) || 0);
            }
            values.push(row);
        }
        return values;
    }
    // Fill the result matrix
    function setMatrixValues(container, values) {
        const inputs = container.querySelectorAll("input");
        values.flat().forEach((val, i) => {
            inputs[i].value = val.toString();
        });
    }
    // Calculate and display result
    function updateResult() {
        return __awaiter(this, void 0, void 0, function* () {
            const A = getMatrixValues(matrixA, size);
            const B = getMatrixValues(matrixB, size);
            // JavaScript multiplication
            const start = performance.now();
            const result = (0,_js_matrix__WEBPACK_IMPORTED_MODULE_0__.jsMultiply)(A, B);
            const end = performance.now();
            // WebGPU multiplication
            const runtime = yield (0,_gpu_matrix__WEBPACK_IMPORTED_MODULE_1__.runWebGPUMultiplication)(A, B);
            setMatrixValues(resultMatrix, result);
            const timeTaken = (end - start).toFixed(6);
            // jsTime.textContent = `JavaScript time: ${timeTaken} ms`;
            // gpuTime.textContent = `WebGPU time: ${runtime.toFixed(6)} ms`;
        });
    }
    // Fill random integers into a matrix
    function fillRandomMatrix(container, size) {
        const inputs = container.querySelectorAll("input");
        inputs.forEach(input => {
            input.value = Math.floor(Math.random() * 10).toString();
        });
    }
    // Reset all matrices to zero
    function clearAllMatrices() {
        [matrixA, matrixB, resultMatrix].forEach(matrix => {
            matrix.querySelectorAll("input").forEach(input => input.value = "0");
        });
        // jsTime.textContent = `JavaScript time: 0 ms`;
        // gpuTime.textContent = `WebGPU time: 0 ms`;
    }
    // Initialize matrix UI
    function setupMatrices() {
        createMatrix(matrixA, size);
        createMatrix(matrixB, size);
        createMatrix(resultMatrix, size, false);
        // jsTime.textContent = `JavaScript time: 0 ms`;
        // gpuTime.textContent = `WebGPU time: 0 ms`;
    }
    function generateMatrix(n) {
        return Array.from({ length: n }, () => Array.from({ length: n }, () => Math.floor(Math.random() * 10)));
    }
    // Update on slider change
    sizeSlider.addEventListener("input", () => {
        size = parseInt(sizeSlider.value);
        sizeDisplay.textContent = size.toString();
        sizeDisplay2.textContent = size.toString();
        setupMatrices();
    });
    // Button bindings
    calculateBtn.addEventListener("click", updateResult);
    clearBtn.addEventListener("click", clearAllMatrices);
    randomBtn.addEventListener("click", () => {
        fillRandomMatrix(matrixA, size);
        fillRandomMatrix(matrixB, size);
    });
    largeTestBtn.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        const size = parseInt(largeMatrixSizeSelect.value);
        const A = generateMatrix(size);
        const B = generateMatrix(size);
        // JS multiply
        const jsStart = performance.now();
        (0,_js_matrix__WEBPACK_IMPORTED_MODULE_0__.jsMultiply)(A, B);
        const jsEnd = performance.now();
        const jsTime = (jsEnd - jsStart).toFixed(6);
        // WebGPU multiply
        const gpuTime = yield (0,_gpu_matrix__WEBPACK_IMPORTED_MODULE_1__.runWebGPUMultiplication)(A, B);
        const gpuTimeStr = gpuTime.toFixed(6);
        largeMatrixTime.textContent =
            `JavaScript time: ${jsTime} ms, WebGPU time: ${gpuTimeStr} ms`;
    }));
    // Initial load
    setupMatrices();
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyLy4vc3JjL1RpbWVzdGFtcFF1ZXJ5TWFuYWdlci50cyIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyLy4vc3JjL2dwdS1tYXRyaXgudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci8uL3NyYy9qcy1tYXRyaXgudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci8uL3NyYy91dGlsLnRzIiwid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyLy4vc3JjL2FwcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lc3RhbXBRdWVyeU1hbmFnZXIge1xyXG5cclxuICB0aW1lc3RhbXBTdXBwb3J0ZWQ6IGJvb2xlYW47XHJcblxyXG4gICN0aW1lc3RhbXBRdWVyeVNldDogR1BVUXVlcnlTZXQ7XHJcbiAgI3RpbWVzdGFtcEJ1ZmZlcjogR1BVQnVmZmVyO1xyXG4gICN0aW1lc3RhbXBNYXBCdWZmZXI6IEdQVUJ1ZmZlcjtcclxuICAjY2FsbGJhY2s/OiAoZGVsdGFUaW1lTnM6IG51bWJlcikgPT4gdm9pZDtcclxuXHJcbiAgY29uc3RydWN0b3IoZGV2aWNlOiBHUFVEZXZpY2UsIGNhbGxiYWNrPzogKGRlbHRhVGltZU5zOiBudW1iZXIpID0+IHZvaWQpIHtcclxuICAgIHRoaXMudGltZXN0YW1wU3VwcG9ydGVkID0gZGV2aWNlLmZlYXR1cmVzLmhhcygndGltZXN0YW1wLXF1ZXJ5Jyk7XHJcbiAgICBpZiAoIXRoaXMudGltZXN0YW1wU3VwcG9ydGVkKSByZXR1cm47XHJcblxyXG4gICAgdGhpcy4jY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuXHJcbiAgICBjb25zdCB0aW1lc3RhbXBCeXRlU2l6ZSA9IDg7XHJcbiAgICB0aGlzLiN0aW1lc3RhbXBRdWVyeVNldCA9IGRldmljZS5jcmVhdGVRdWVyeVNldCh7XHJcbiAgICAgIHR5cGU6ICd0aW1lc3RhbXAnLFxyXG4gICAgICBjb3VudDogMixcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuI3RpbWVzdGFtcEJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xyXG4gICAgICBzaXplOiB0aGlzLiN0aW1lc3RhbXBRdWVyeVNldC5jb3VudCAqIHRpbWVzdGFtcEJ5dGVTaXplLFxyXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMgfCBHUFVCdWZmZXJVc2FnZS5RVUVSWV9SRVNPTFZFLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4jdGltZXN0YW1wTWFwQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XHJcbiAgICAgIHNpemU6IHRoaXMuI3RpbWVzdGFtcEJ1ZmZlci5zaXplLFxyXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYWRkVGltZXN0YW1wV3JpdGUoXHJcbiAgICBwYXNzRGVzY3JpcHRvcjogR1BVUmVuZGVyUGFzc0Rlc2NyaXB0b3IgfCBHUFVDb21wdXRlUGFzc0Rlc2NyaXB0b3JcclxuICApIHtcclxuICAgIGlmICh0aGlzLnRpbWVzdGFtcFN1cHBvcnRlZCkge1xyXG4gICAgICBwYXNzRGVzY3JpcHRvci50aW1lc3RhbXBXcml0ZXMgPSB7XHJcbiAgICAgICAgcXVlcnlTZXQ6IHRoaXMuI3RpbWVzdGFtcFF1ZXJ5U2V0LFxyXG4gICAgICAgIGJlZ2lubmluZ09mUGFzc1dyaXRlSW5kZXg6IDAsXHJcbiAgICAgICAgZW5kT2ZQYXNzV3JpdGVJbmRleDogMSxcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXNzRGVzY3JpcHRvcjtcclxuICB9XHJcblxyXG4gIHJlc29sdmUoY29tbWFuZEVuY29kZXI6IEdQVUNvbW1hbmRFbmNvZGVyKSB7XHJcbiAgICBpZiAoIXRoaXMudGltZXN0YW1wU3VwcG9ydGVkKSByZXR1cm47XHJcblxyXG4gICAgY29tbWFuZEVuY29kZXIucmVzb2x2ZVF1ZXJ5U2V0KFxyXG4gICAgICB0aGlzLiN0aW1lc3RhbXBRdWVyeVNldCxcclxuICAgICAgMCxcclxuICAgICAgdGhpcy4jdGltZXN0YW1wUXVlcnlTZXQuY291bnQsXHJcbiAgICAgIHRoaXMuI3RpbWVzdGFtcEJ1ZmZlcixcclxuICAgICAgMFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAodGhpcy4jdGltZXN0YW1wTWFwQnVmZmVyLm1hcFN0YXRlID09PSAndW5tYXBwZWQnKSB7XHJcbiAgICAgIGNvbW1hbmRFbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihcclxuICAgICAgICB0aGlzLiN0aW1lc3RhbXBCdWZmZXIsXHJcbiAgICAgICAgMCxcclxuICAgICAgICB0aGlzLiN0aW1lc3RhbXBNYXBCdWZmZXIsXHJcbiAgICAgICAgMCxcclxuICAgICAgICB0aGlzLiN0aW1lc3RhbXBCdWZmZXIuc2l6ZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdHJ5SW5pdGlhdGVUaW1lc3RhbXBEb3dubG9hZCgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy50aW1lc3RhbXBTdXBwb3J0ZWQpIHJldHVybjtcclxuICAgIGlmICh0aGlzLiN0aW1lc3RhbXBNYXBCdWZmZXIubWFwU3RhdGUgIT09ICd1bm1hcHBlZCcpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBidWZmZXIgPSB0aGlzLiN0aW1lc3RhbXBNYXBCdWZmZXI7XHJcbiAgICB2b2lkIGJ1ZmZlci5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICBjb25zdCByYXdEYXRhID0gYnVmZmVyLmdldE1hcHBlZFJhbmdlKCk7XHJcbiAgICAgIGNvbnN0IHRpbWVzdGFtcHMgPSBuZXcgQmlnVWludDY0QXJyYXkocmF3RGF0YSk7XHJcbiAgICAgIGNvbnN0IGVsYXBzZWROcyA9IE51bWJlcih0aW1lc3RhbXBzWzFdIC0gdGltZXN0YW1wc1swXSk7XHJcbiAgICAgIGlmIChlbGFwc2VkTnMgPj0gMCAmJiB0aGlzLiNjYWxsYmFjaykge1xyXG4gICAgICAgIHRoaXMuI2NhbGxiYWNrKGVsYXBzZWROcyk7XHJcbiAgICAgIH1cclxuICAgICAgYnVmZmVyLnVubWFwKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRvd25sb2FkVGltZXN0YW1wUmVzdWx0KCk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICBpZiAoIXRoaXMudGltZXN0YW1wU3VwcG9ydGVkKSByZXR1cm4gMDtcclxuICAgIGlmICh0aGlzLiN0aW1lc3RhbXBNYXBCdWZmZXIubWFwU3RhdGUgIT09ICd1bm1hcHBlZCcpIHJldHVybiAwO1xyXG5cclxuICAgIGF3YWl0IHRoaXMuI3RpbWVzdGFtcE1hcEJ1ZmZlci5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xyXG4gICAgY29uc3QgcmF3RGF0YSA9IHRoaXMuI3RpbWVzdGFtcE1hcEJ1ZmZlci5nZXRNYXBwZWRSYW5nZSgpO1xyXG4gICAgY29uc3QgdGltZXN0YW1wcyA9IG5ldyBCaWdVaW50NjRBcnJheShyYXdEYXRhKTtcclxuICAgIGNvbnN0IGVsYXBzZWROcyA9IE51bWJlcih0aW1lc3RhbXBzWzFdIC0gdGltZXN0YW1wc1swXSk7XHJcbiAgICB0aGlzLiN0aW1lc3RhbXBNYXBCdWZmZXIudW5tYXAoKTtcclxuICAgIHJldHVybiBlbGFwc2VkTnM7XHJcbiAgfSBcclxufVxyXG4iLCJpbXBvcnQgc2hhZGVyQ29kZSBmcm9tIFwiLi9tYXRyaXhNdWx0aS53Z3NsXCI7XG5pbXBvcnQgeyBxdWl0SWZXZWJHUFVOb3RBdmFpbGFibGUgfSBmcm9tIFwiLi91dGlsXCI7XG5pbXBvcnQgVGltZXN0YW1wUXVlcnlNYW5hZ2VyIGZyb20gXCIuL1RpbWVzdGFtcFF1ZXJ5TWFuYWdlclwiO1xuXG4vLyBWZXJpZnkgdGhlIG1hdHJpeCBtdWx0aXBsaWNhdGlvbiByZXN1bHRcbmZ1bmN0aW9uIHZlcmlmeV9yZXN1bHQoTTogVWludDMyQXJyYXksIE46IFVpbnQzMkFycmF5LCBQOiBVaW50MzJBcnJheSwgd2lkdGg6IG51bWJlcikge1xuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHdpZHRoOyByb3crKykge1xuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB3aWR0aDsgY29sKyspIHtcbiAgICAgICAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCB3aWR0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IE1bcm93ICogd2lkdGggKyBrXSAqIE5bayAqIHdpZHRoICsgY29sXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkID0gc3VtO1xuICAgICAgICAgICAgY29uc3QgYWN0dWFsID0gUFtyb3cgKiB3aWR0aCArIGNvbF07XG4gICAgICAgICAgICBpZiAoZXhwZWN0ZWQgIT09IGFjdHVhbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYE1pc21hdGNoIGF0IFske3Jvd30sICR7Y29sfV06IGV4cGVjdGVkICR7ZXhwZWN0ZWR9LCBnb3QgJHthY3R1YWx9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFwiTWF0cml4IG11bHRpcGxpY2F0aW9uIHJlc3VsdCBpcyBjb3JyZWN0LlwiKTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gcHJpbnQgYSBtYXRyaXggdG8gdGhlIGNvbnNvbGVcbmZ1bmN0aW9uIHByaW50TWF0cml4KG1hdHJpeDogVWludDMyQXJyYXksIHdpZHRoOiBudW1iZXIsIGxhYmVsOiBzdHJpbmcpIHtcbiAgICBjb25zb2xlLmxvZyhgXFxuJHtsYWJlbH06YCk7XG4gICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgd2lkdGg7IHJvdysrKSB7XG4gICAgICAgIGxldCByb3dTdHIgPSAnJztcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgd2lkdGg7IGNvbCsrKSB7XG4gICAgICAgICAgICByb3dTdHIgKz0gbWF0cml4W3JvdyAqIHdpZHRoICsgY29sXS50b1N0cmluZygpLnBhZFN0YXJ0KDQpICsgJyAnO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKHJvd1N0cik7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5XZWJHUFVNdWx0aXBsaWNhdGlvbihNOiBudW1iZXJbXVtdLCBOOiBudW1iZXJbXVtdKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiAobmF2aWdhdG9yLmdwdSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViZ3B1LWNhbnZhc1wiKS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcImRpc3BsYXk6bm9uZTtcIik7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm8td2ViZ3B1XCIpLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiZGlzcGxheTpibG9jaztcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBHZXQgYSBHUFUgZGV2aWNlIHRvIHJlbmRlciB3aXRoXG4gICAgY29uc3QgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHU/LnJlcXVlc3RBZGFwdGVyKHtcbiAgICAgICAgZmVhdHVyZUxldmVsOiAnY29tcGF0aWJpbGl0eScsXG4gICAgfSk7XG4gICAgY29uc3Qgc3VwcG9ydHNUaW1lc3RhbXBRdWVyaWVzID0gYWRhcHRlcj8uZmVhdHVyZXMuaGFzKCd0aW1lc3RhbXAtcXVlcnknKTtcbiAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBhZGFwdGVyPy5yZXF1ZXN0RGV2aWNlKHtcbiAgICAgICAgLy8gV2UgcmVxdWVzdCBhIGRldmljZSB0aGF0IGhhcyBzdXBwb3J0IGZvciB0aW1lc3RhbXAgcXVlcmllc1xuICAgICAgICByZXF1aXJlZEZlYXR1cmVzOiBzdXBwb3J0c1RpbWVzdGFtcFF1ZXJpZXMgPyBbJ3RpbWVzdGFtcC1xdWVyeSddIDogW10sXG4gICAgfSk7XG4gICAgcXVpdElmV2ViR1BVTm90QXZhaWxhYmxlKGFkYXB0ZXIsIGRldmljZSk7XG5cbiAgICBjb25zdCBjb21wdXRlUGFzc0Rlc2NyaXB0b3I6IEdQVUNvbXB1dGVQYXNzRGVzY3JpcHRvciA9IHt9O1xuICAgIGNvbnN0IHRpbWVzdGFtcFF1ZXJ5TWFuYWdlciA9IG5ldyBUaW1lc3RhbXBRdWVyeU1hbmFnZXIoZGV2aWNlLCAoZWxhcHNlZE5zKSA9PiB7XG4gICAgICAgIC8vIENvbnZlcnQgZnJvbSBuYW5vc2Vjb25kcyB0byBtaWxsaXNlY29uZHM6XG4gICAgICAgIGNvbnN0IGVsYXBzZWRNcyA9IE51bWJlcihlbGFwc2VkTnMpICogMWUtNjtcbiAgICB9KTtcblxuICAgIC8vIFNldHVwIHNoYWRlciBtb2R1bGVzXG4gICAgdmFyIHNoYWRlck1vZHVsZSA9IGRldmljZS5jcmVhdGVTaGFkZXJNb2R1bGUoe2NvZGU6IHNoYWRlckNvZGV9KTtcbiAgICB2YXIgY29tcGlsYXRpb25JbmZvID0gYXdhaXQgc2hhZGVyTW9kdWxlLmdldENvbXBpbGF0aW9uSW5mbygpO1xuICAgIGlmIChjb21waWxhdGlvbkluZm8ubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgaGFkRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgY29uc29sZS5sb2coXCJTaGFkZXIgY29tcGlsYXRpb24gbG9nOlwiKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21waWxhdGlvbkluZm8ubWVzc2FnZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtc2cgPSBjb21waWxhdGlvbkluZm8ubWVzc2FnZXNbaV07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHttc2cubGluZU51bX06JHttc2cubGluZVBvc30gLSAke21zZy5tZXNzYWdlfWApO1xuICAgICAgICAgICAgaGFkRXJyb3IgPSBoYWRFcnJvciB8fCBtc2cudHlwZSA9PSBcImVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhZEVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNoYWRlciBmYWlsZWQgdG8gY29tcGlsZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgc2l6ZSBvZiBtYXRyaXhcbiAgICBjb25zdCBXaWR0aCA9IE0ubGVuZ3RoO1xuICAgIGNvbnN0IG1hdHJpeFNpemUgPSBXaWR0aCAqIFdpZHRoO1xuICAgIGNvbnN0IGJ1ZmZlclNpemUgPSBtYXRyaXhTaXplICogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQ7XG5cbiAgICAvLyBHZW5lcmF0ZSByYW5kb20gTSBhbmQgTiBtYXRyaWNlc1xuICAgIGNvbnN0IGhfTSA9IG5ldyBVaW50MzJBcnJheShNLmZsYXQoKSk7XG4gICAgY29uc3QgaF9OID0gbmV3IFVpbnQzMkFycmF5KE4uZmxhdCgpKTtcbiAgICAvLyBwcmludE1hdHJpeChoX00sIFdpZHRoLCBcIk1hdHJpeCBNXCIpO1xuICAgIC8vIHByaW50TWF0cml4KGhfTiwgV2lkdGgsIFwiTWF0cml4IE5cIik7XG5cbiAgICAvLyBBbGxvY2F0ZSBHUFUgbWVtb3J5IGZvciBNLCBOLCBQLCBhbmQgV2lkdGhcbiAgICBjb25zdCBkX00gPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgbGFiZWw6IFwiTVwiLFxuICAgICAgICBzaXplOiBidWZmZXJTaXplLFxuICAgICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDLFxuICAgICAgICBtYXBwZWRBdENyZWF0aW9uOiB0cnVlXG4gICAgfSk7XG4gICAgY29uc3QgZF9OID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICAgIGxhYmVsOiBcIk5cIixcbiAgICAgICAgc2l6ZTogYnVmZmVyU2l6ZSxcbiAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyxcbiAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogdHJ1ZVxuICAgIH0pOyBcbiAgICBjb25zdCBkX1AgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgbGFiZWw6IFwiUFwiLFxuICAgICAgICBzaXplOiBidWZmZXJTaXplLFxuICAgICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDLFxuICAgICAgICBtYXBwZWRBdENyZWF0aW9uOiB0cnVlXG4gICAgfSk7IFxuICAgIGNvbnN0IGRfV2lkdGggPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgbGFiZWw6IFwiV2lkdGhcIixcbiAgICAgICAgc2l6ZTogNCxcbiAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyxcbiAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogdHJ1ZVxuICAgIH0pOyBcblxuICAgIC8vIFRyYW5zZmVyIE0sIE4sIGFuZCBXaWR0aCBmcm9tIENQVSB0byBHUFVcbiAgICBuZXcgVWludDMyQXJyYXkoZF9NLmdldE1hcHBlZFJhbmdlKCkpLnNldChoX00pO1xuICAgIG5ldyBVaW50MzJBcnJheShkX04uZ2V0TWFwcGVkUmFuZ2UoKSkuc2V0KGhfTik7XG4gICAgbmV3IFVpbnQzMkFycmF5KGRfV2lkdGguZ2V0TWFwcGVkUmFuZ2UoKSkuc2V0KFtXaWR0aF0pO1xuXG4gICAgLy8gVW5tYXAgdGhlIGJ1ZmZlcnNcbiAgICBkX00udW5tYXAoKTtcbiAgICBkX04udW5tYXAoKTtcbiAgICBkX1AudW5tYXAoKTtcbiAgICBkX1dpZHRoLnVubWFwKCk7XG5cbiAgICAvLyBCSW5kIGdyb3VwIGxheW91dCBhbmQgYmluZCBncm91cFxuICAgIGNvbnN0IGJpbmRHcm91cExheW91dCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXBMYXlvdXQoe1xuICAgICAgICBlbnRyaWVzOiBbXG4gICAgICAgICAgICB7YmluZGluZzogMCwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7dHlwZTogXCJyZWFkLW9ubHktc3RvcmFnZVwiIGFzIEdQVUJ1ZmZlckJpbmRpbmdUeXBlfX0sICAvLyBNXG4gICAgICAgICAgICB7YmluZGluZzogMSwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7dHlwZTogXCJyZWFkLW9ubHktc3RvcmFnZVwiIGFzIEdQVUJ1ZmZlckJpbmRpbmdUeXBlfX0sICAvLyBOXG4gICAgICAgICAgICB7YmluZGluZzogMiwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7dHlwZTogXCJzdG9yYWdlXCIgYXMgR1BVQnVmZmVyQmluZGluZ1R5cGV9fSwgICAgICAgICAgICAvLyBQXG4gICAgICAgICAgICB7YmluZGluZzogMywgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7dHlwZTogXCJyZWFkLW9ubHktc3RvcmFnZVwiIGFzIEdQVUJ1ZmZlckJpbmRpbmdUeXBlfX0sICAvLyBXaWR0aFxuICAgICAgICBdXG4gICAgfSk7XG4gICAgXG4gICAgY29uc3QgYmluZEdyb3VwID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cCh7XG4gICAgICAgIGxheW91dDogYmluZEdyb3VwTGF5b3V0LFxuICAgICAgICBlbnRyaWVzOiBbXG4gICAgICAgICAgICB7YmluZGluZzogMCwgcmVzb3VyY2U6IHtidWZmZXI6IGRfTX19LFxuICAgICAgICAgICAge2JpbmRpbmc6IDEsIHJlc291cmNlOiB7YnVmZmVyOiBkX059fSxcbiAgICAgICAgICAgIHtiaW5kaW5nOiAyLCByZXNvdXJjZToge2J1ZmZlcjogZF9QfX0sXG4gICAgICAgICAgICB7YmluZGluZzogMywgcmVzb3VyY2U6IHtidWZmZXI6IGRfV2lkdGh9fVxuICAgICAgICBdXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYSBwaXBlbGluZSBsYXlvdXRcbiAgICBjb25zdCBwaXBlbGluZUxheW91dCA9IGRldmljZS5jcmVhdGVQaXBlbGluZUxheW91dCh7XG4gICAgICAgIGJpbmRHcm91cExheW91dHM6IFtiaW5kR3JvdXBMYXlvdXRdLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGEgY29tcHV0ZSBwaXBlbGluZVxuICAgIGNvbnN0IGNvbXB1dGVQaXBlbGluZSA9IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoe1xuICAgICAgICBsYXlvdXQ6IHBpcGVsaW5lTGF5b3V0LFxuICAgICAgICBjb21wdXRlOiB7XG4gICAgICAgICAgICBtb2R1bGU6IHNoYWRlck1vZHVsZSxcbiAgICAgICAgICAgIGVudHJ5UG9pbnQ6IFwibWFpblwiLFxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGltZXN0YW1wUXVlcnlNYW5hZ2VyLmFkZFRpbWVzdGFtcFdyaXRlKGNvbXB1dGVQYXNzRGVzY3JpcHRvcik7XG5cbiAgICAvLyBDcmVhdGUgYSBjb21tYW5kIGVuY29kZXIgYW5kIGEgY29tcHV0ZSBwYXNzXG4gICAgY29uc3QgY29tbWFuZEVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBjb25zdCBwYXNzID0gY29tbWFuZEVuY29kZXIuYmVnaW5Db21wdXRlUGFzcyhjb21wdXRlUGFzc0Rlc2NyaXB0b3IpO1xuICAgIHBhc3Muc2V0UGlwZWxpbmUoY29tcHV0ZVBpcGVsaW5lKTtcbiAgICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXApO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKE1hdGguY2VpbChXaWR0aCAvIDE2KSwgTWF0aC5jZWlsKFdpZHRoIC8gMTYpKTtcbiAgICBwYXNzLmVuZCgpO1xuXG4gICAgdGltZXN0YW1wUXVlcnlNYW5hZ2VyLnJlc29sdmUoY29tbWFuZEVuY29kZXIpO1xuXG4gICAgLy8gQ29weSB0aGUgcmVzdWx0IGZyb20gR1BVIHRvIENQVVxuICAgIGNvbnN0IGhfUCA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgICBzaXplOiBidWZmZXJTaXplLFxuICAgICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICB9KTtcbiAgICBjb21tYW5kRW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIoZF9QLCAwLCBoX1AsIDAsIGJ1ZmZlclNpemUpO1xuXG4gICAgLy8gV2FpdCBmb3IgdGhlIHF1ZXVlIHRvIGZpbmlzaCBhbmQgcmVhZCB0aGUgcmVzdWx0XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbY29tbWFuZEVuY29kZXIuZmluaXNoKCldKTtcbiAgICBhd2FpdCBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgIGF3YWl0IGhfUC5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgIHZhciBlbGFwc2VkTnMgPSBhd2FpdCB0aW1lc3RhbXBRdWVyeU1hbmFnZXIuZG93bmxvYWRUaW1lc3RhbXBSZXN1bHQoKTtcbiAgICBlbGFwc2VkTnMgPSBlbGFwc2VkTnMgKiAxZS02O1xuICAgIFxuXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IFVpbnQzMkFycmF5KGhfUC5nZXRNYXBwZWRSYW5nZSgpKTtcblxuICAgIC8vIFByaW50IHRoZSByZXN1bHQgbWF0cml4XG4gICAgLy8gcHJpbnRNYXRyaXgocmVzdWx0LCBXaWR0aCwgXCJNYXRyaXggUFwiKTtcblxuICAgIC8vIFZlcmlmeSB0aGUgcmVzdWx0XG4gICAgdmVyaWZ5X3Jlc3VsdChoX00sIGhfTiwgcmVzdWx0LCBXaWR0aCk7XG4gICAgXG4gICAgcmV0dXJuIGVsYXBzZWROcztcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBqc011bHRpcGx5KEE6IG51bWJlcltdW10sIEI6IG51bWJlcltdW10pOiBudW1iZXJbXVtdIHtcbiAgY29uc3QgbiA9IEEubGVuZ3RoO1xuICBjb25zdCByZXN1bHQ6IG51bWJlcltdW10gPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiBuIH0sICgpID0+IEFycmF5KG4pLmZpbGwoMCkpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBuOyBqKyspIHtcbiAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBuOyBrKyspIHtcbiAgICAgICAgc3VtICs9IEFbaV1ba10gKiBCW2tdW2pdO1xuICAgICAgfVxuICAgICAgcmVzdWx0W2ldW2pdID0gc3VtO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufSIsIi8qKiBTaG93cyBhbiBlcnJvciBkaWFsb2cgaWYgZ2V0dGluZyBhbiBhZGFwdGVyIHdhc24ndCBzdWNjZXNzZnVsLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcXVpdElmQWRhcHRlck5vdEF2YWlsYWJsZShcclxuICAgIGFkYXB0ZXI6IEdQVUFkYXB0ZXIgfCBudWxsXHJcbiAgKTogYXNzZXJ0cyBhZGFwdGVyIHtcclxuICAgIGlmICghKCdncHUnIGluIG5hdmlnYXRvcikpIHtcclxuICAgICAgZmFpbCgnbmF2aWdhdG9yLmdwdSBpcyBub3QgZGVmaW5lZCAtIFdlYkdQVSBub3QgYXZhaWxhYmxlIGluIHRoaXMgYnJvd3NlcicpO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgaWYgKCFhZGFwdGVyKSB7XHJcbiAgICAgIGZhaWwoXCJyZXF1ZXN0QWRhcHRlciByZXR1cm5lZCBudWxsIC0gdGhpcyBzYW1wbGUgY2FuJ3QgcnVuIG9uIHRoaXMgc3lzdGVtXCIpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBleHBvcnQgZnVuY3Rpb24gcXVpdElmTGltaXRMZXNzVGhhbihcclxuICAgIGFkYXB0ZXI6IEdQVUFkYXB0ZXIsXHJcbiAgICBsaW1pdDogc3RyaW5nLFxyXG4gICAgcmVxdWlyZWRWYWx1ZTogbnVtYmVyLFxyXG4gICAgbGltaXRzOiBSZWNvcmQ8c3RyaW5nLCBHUFVTaXplMzI+XHJcbiAgKSB7XHJcbiAgICBpZiAobGltaXQgaW4gYWRhcHRlci5saW1pdHMpIHtcclxuICAgICAgY29uc3QgbGltaXRLZXkgPSBsaW1pdCBhcyBrZXlvZiBHUFVTdXBwb3J0ZWRMaW1pdHM7XHJcbiAgICAgIGNvbnN0IGxpbWl0VmFsdWUgPSBhZGFwdGVyLmxpbWl0c1tsaW1pdEtleV0gYXMgbnVtYmVyO1xyXG4gICAgICBpZiAobGltaXRWYWx1ZSA8IHJlcXVpcmVkVmFsdWUpIHtcclxuICAgICAgICBmYWlsKFxyXG4gICAgICAgICAgYFRoaXMgc2FtcGxlIGNhbid0IHJ1biBvbiB0aGlzIHN5c3RlbS4gJHtsaW1pdH0gaXMgJHtsaW1pdFZhbHVlfSwgYW5kIHRoaXMgc2FtcGxlIHJlcXVpcmVzIGF0IGxlYXN0ICR7cmVxdWlyZWRWYWx1ZX0uYFxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgbGltaXRzW2xpbWl0XSA9IHJlcXVpcmVkVmFsdWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIFNob3dzIGFuIGVycm9yIGRpYWxvZyBpZiBnZXR0aW5nIGEgYWRhcHRlciBvciBkZXZpY2Ugd2Fzbid0IHN1Y2Nlc3NmdWwsXHJcbiAgICogb3IgaWYvd2hlbiB0aGUgZGV2aWNlIGlzIGxvc3Qgb3IgaGFzIGFuIHVuY2FwdHVyZWQgZXJyb3IuXHJcbiAgICovXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIHF1aXRJZldlYkdQVU5vdEF2YWlsYWJsZShcclxuICAgIGFkYXB0ZXI6IEdQVUFkYXB0ZXIgfCBudWxsLFxyXG4gICAgZGV2aWNlOiBHUFVEZXZpY2UgfCBudWxsXHJcbiAgKTogYXNzZXJ0cyBkZXZpY2Uge1xyXG4gICAgaWYgKCFkZXZpY2UpIHtcclxuICAgICAgcXVpdElmQWRhcHRlck5vdEF2YWlsYWJsZShhZGFwdGVyKTtcclxuICAgICAgZmFpbCgnVW5hYmxlIHRvIGdldCBhIGRldmljZSBmb3IgYW4gdW5rbm93biByZWFzb24nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgZGV2aWNlLmxvc3QudGhlbigocmVhc29uKSA9PiB7XHJcbiAgICAgIGZhaWwoYERldmljZSBsb3N0IChcIiR7cmVhc29uLnJlYXNvbn1cIik6XFxuJHtyZWFzb24ubWVzc2FnZX1gKTtcclxuICAgIH0pO1xyXG4gICAgZGV2aWNlLm9udW5jYXB0dXJlZGVycm9yID0gKGV2KSA9PiB7XHJcbiAgICAgIGZhaWwoYFVuY2FwdHVyZWQgZXJyb3I6XFxuJHtldi5lcnJvci5tZXNzYWdlfWApO1xyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgLyoqIEZhaWwgYnkgc2hvd2luZyBhIGNvbnNvbGUgZXJyb3IsIGFuZCBkaWFsb2cgYm94IGlmIHBvc3NpYmxlLiAqL1xyXG4gIGNvbnN0IGZhaWwgPSAoKCkgPT4ge1xyXG4gICAgdHlwZSBFcnJvck91dHB1dCA9IHsgc2hvdyhtc2c6IHN0cmluZyk6IHZvaWQgfTtcclxuICBcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVycm9yT3V0cHV0KCkge1xyXG4gICAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIC8vIE5vdCBpbXBsZW1lbnRlZCBpbiB3b3JrZXJzLlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzaG93KG1zZzogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gIFxyXG4gICAgICBjb25zdCBkaWFsb2dCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaWFsb2cnKTtcclxuICAgICAgZGlhbG9nQm94LmNsb3NlKCk7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKGRpYWxvZ0JveCk7XHJcbiAgXHJcbiAgICAgIGNvbnN0IGRpYWxvZ1RleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcclxuICAgICAgZGlhbG9nVGV4dC5zdHlsZS53aGl0ZVNwYWNlID0gJ3ByZS13cmFwJztcclxuICAgICAgZGlhbG9nQm94LmFwcGVuZChkaWFsb2dUZXh0KTtcclxuICBcclxuICAgICAgY29uc3QgY2xvc2VCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgY2xvc2VCdG4udGV4dENvbnRlbnQgPSAnT0snO1xyXG4gICAgICBjbG9zZUJ0bi5vbmNsaWNrID0gKCkgPT4gZGlhbG9nQm94LmNsb3NlKCk7XHJcbiAgICAgIGRpYWxvZ0JveC5hcHBlbmQoY2xvc2VCdG4pO1xyXG4gIFxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHNob3cobXNnOiBzdHJpbmcpIHtcclxuICAgICAgICAgIC8vIERvbid0IG92ZXJ3cml0ZSB0aGUgZGlhbG9nIG1lc3NhZ2Ugd2hpbGUgaXQncyBzdGlsbCBvcGVuXHJcbiAgICAgICAgICAvLyAoc2hvdyB0aGUgZmlyc3QgZXJyb3IsIG5vdCB0aGUgbW9zdCByZWNlbnQgZXJyb3IpLlxyXG4gICAgICAgICAgaWYgKCFkaWFsb2dCb3gub3Blbikge1xyXG4gICAgICAgICAgICBkaWFsb2dUZXh0LnRleHRDb250ZW50ID0gbXNnO1xyXG4gICAgICAgICAgICBkaWFsb2dCb3guc2hvd01vZGFsKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfTtcclxuICAgIH1cclxuICBcclxuICAgIGxldCBvdXRwdXQ6IEVycm9yT3V0cHV0IHwgdW5kZWZpbmVkO1xyXG4gIFxyXG4gICAgcmV0dXJuIChtZXNzYWdlOiBzdHJpbmcpID0+IHtcclxuICAgICAgaWYgKCFvdXRwdXQpIG91dHB1dCA9IGNyZWF0ZUVycm9yT3V0cHV0KCk7XHJcbiAgXHJcbiAgICAgIG91dHB1dC5zaG93KG1lc3NhZ2UpO1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgICB9O1xyXG4gIH0pKCk7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBqc011bHRpcGx5IH0gZnJvbSAnLi9qcy1tYXRyaXgnO1xuaW1wb3J0IHsgcnVuV2ViR1BVTXVsdGlwbGljYXRpb24gfSBmcm9tICcuL2dwdS1tYXRyaXgnO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICBjb25zdCBzaXplU2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaXplU2xpZGVyXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gIGNvbnN0IHNpemVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYXRyaXhTaXplRGlzcGxheVwiKSE7XG4gIGNvbnN0IHNpemVEaXNwbGF5MiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWF0cml4U2l6ZURpc3BsYXkyXCIpITtcbiAgY29uc3QgbWF0cml4QSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWF0cml4QVwiKSE7XG4gIGNvbnN0IG1hdHJpeEIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1hdHJpeEJcIikhO1xuICBjb25zdCByZXN1bHRNYXRyaXggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdE1hdHJpeFwiKSE7XG4gIC8vIGNvbnN0IGpzVGltZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwianNUaW1lXCIpITtcbiAgLy8gY29uc3QgZ3B1VGltZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ3B1VGltZVwiKSE7XG4gIGNvbnN0IGNhbGN1bGF0ZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FsY3VsYXRlQnRuXCIpITtcbiAgY29uc3QgY2xlYXJCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsZWFyQnRuXCIpITtcbiAgY29uc3QgcmFuZG9tQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyYW5kb21CdG5cIikhO1xuICBjb25zdCBsYXJnZVRlc3RCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhcmdlVGVzdEJ0blwiKSE7XG4gIGNvbnN0IGxhcmdlTWF0cml4U2l6ZVNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGFyZ2VNYXRyaXhTaXplXCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xuICBjb25zdCBsYXJnZU1hdHJpeFRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhcmdlTWF0cml4VGltZVwiKSE7XG5cbiAgbGV0IHNpemUgPSBwYXJzZUludChzaXplU2xpZGVyLnZhbHVlKTtcblxuICAvLyBDcmVhdGUgbWF0cml4IGlucHV0IGdyaWRzXG4gIGZ1bmN0aW9uIGNyZWF0ZU1hdHJpeChjb250YWluZXI6IEhUTUxFbGVtZW50LCBzaXplOiBudW1iZXIsIGVkaXRhYmxlID0gdHJ1ZSkge1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgICBjb250YWluZXIuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IGByZXBlYXQoJHtzaXplfSwgMWZyKWA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplICogc2l6ZTsgaSsrKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgIGlucHV0LnR5cGUgPSBcIm51bWJlclwiO1xuICAgICAgaW5wdXQudmFsdWUgPSBcIjBcIjtcbiAgICAgIGlmICghZWRpdGFibGUpIGlucHV0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgLy8gR2V0IHZhbHVlcyBmcm9tIGEgbWF0cml4XG4gIGZ1bmN0aW9uIGdldE1hdHJpeFZhbHVlcyhjb250YWluZXI6IEhUTUxFbGVtZW50LCBzaXplOiBudW1iZXIpOiBudW1iZXJbXVtdIHtcbiAgICBjb25zdCBpbnB1dHMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpO1xuICAgIGNvbnN0IHZhbHVlczogbnVtYmVyW11bXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICBjb25zdCByb3c6IG51bWJlcltdID0gW107XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNpemU7IGorKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IGkgKiBzaXplICsgajtcbiAgICAgICAgcm93LnB1c2gocGFyc2VGbG9hdCgoaW5wdXRzW2luZGV4XSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSkgfHwgMCk7XG4gICAgICB9XG4gICAgICB2YWx1ZXMucHVzaChyb3cpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9XG5cbiAgLy8gRmlsbCB0aGUgcmVzdWx0IG1hdHJpeFxuICBmdW5jdGlvbiBzZXRNYXRyaXhWYWx1ZXMoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgdmFsdWVzOiBudW1iZXJbXVtdKSB7XG4gICAgY29uc3QgaW5wdXRzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKTtcbiAgICB2YWx1ZXMuZmxhdCgpLmZvckVhY2goKHZhbCwgaSkgPT4ge1xuICAgICAgKGlucHV0c1tpXSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSA9IHZhbC50b1N0cmluZygpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIGFuZCBkaXNwbGF5IHJlc3VsdFxuICBhc3luYyBmdW5jdGlvbiB1cGRhdGVSZXN1bHQoKSB7XG4gICAgY29uc3QgQSA9IGdldE1hdHJpeFZhbHVlcyhtYXRyaXhBLCBzaXplKTtcbiAgICBjb25zdCBCID0gZ2V0TWF0cml4VmFsdWVzKG1hdHJpeEIsIHNpemUpO1xuXG4gICAgLy8gSmF2YVNjcmlwdCBtdWx0aXBsaWNhdGlvblxuICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3QgcmVzdWx0ID0ganNNdWx0aXBseShBLCBCKTtcbiAgICBjb25zdCBlbmQgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgIC8vIFdlYkdQVSBtdWx0aXBsaWNhdGlvblxuICAgIGNvbnN0IHJ1bnRpbWUgPSBhd2FpdCBydW5XZWJHUFVNdWx0aXBsaWNhdGlvbihBLCBCKTtcblxuICAgIHNldE1hdHJpeFZhbHVlcyhyZXN1bHRNYXRyaXgsIHJlc3VsdCk7XG4gICAgY29uc3QgdGltZVRha2VuID0gKGVuZCAtIHN0YXJ0KS50b0ZpeGVkKDYpO1xuICAgIC8vIGpzVGltZS50ZXh0Q29udGVudCA9IGBKYXZhU2NyaXB0IHRpbWU6ICR7dGltZVRha2VufSBtc2A7XG4gICAgLy8gZ3B1VGltZS50ZXh0Q29udGVudCA9IGBXZWJHUFUgdGltZTogJHtydW50aW1lLnRvRml4ZWQoNil9IG1zYDtcbiAgfVxuXG4gIC8vIEZpbGwgcmFuZG9tIGludGVnZXJzIGludG8gYSBtYXRyaXhcbiAgZnVuY3Rpb24gZmlsbFJhbmRvbU1hdHJpeChjb250YWluZXI6IEhUTUxFbGVtZW50LCBzaXplOiBudW1iZXIpIHtcbiAgICBjb25zdCBpbnB1dHMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpO1xuICAgIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgIChpbnB1dCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKS50b1N0cmluZygpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gUmVzZXQgYWxsIG1hdHJpY2VzIHRvIHplcm9cbiAgZnVuY3Rpb24gY2xlYXJBbGxNYXRyaWNlcygpIHtcbiAgICBbbWF0cml4QSwgbWF0cml4QiwgcmVzdWx0TWF0cml4XS5mb3JFYWNoKG1hdHJpeCA9PiB7XG4gICAgICBtYXRyaXgucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpLmZvckVhY2goaW5wdXQgPT4gKGlucHV0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlID0gXCIwXCIpO1xuICAgIH0pO1xuICAgIC8vIGpzVGltZS50ZXh0Q29udGVudCA9IGBKYXZhU2NyaXB0IHRpbWU6IDAgbXNgO1xuICAgIC8vIGdwdVRpbWUudGV4dENvbnRlbnQgPSBgV2ViR1BVIHRpbWU6IDAgbXNgO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZSBtYXRyaXggVUlcbiAgZnVuY3Rpb24gc2V0dXBNYXRyaWNlcygpIHtcbiAgICBjcmVhdGVNYXRyaXgobWF0cml4QSwgc2l6ZSk7XG4gICAgY3JlYXRlTWF0cml4KG1hdHJpeEIsIHNpemUpO1xuICAgIGNyZWF0ZU1hdHJpeChyZXN1bHRNYXRyaXgsIHNpemUsIGZhbHNlKTtcbiAgICAvLyBqc1RpbWUudGV4dENvbnRlbnQgPSBgSmF2YVNjcmlwdCB0aW1lOiAwIG1zYDtcbiAgICAvLyBncHVUaW1lLnRleHRDb250ZW50ID0gYFdlYkdQVSB0aW1lOiAwIG1zYDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlTWF0cml4KG46IG51bWJlcik6IG51bWJlcltdW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHsgbGVuZ3RoOiBuIH0sICgpID0+XG4gICAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBuIH0sICgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSlcbiAgICApO1xuICB9ICBcblxuICAvLyBVcGRhdGUgb24gc2xpZGVyIGNoYW5nZVxuICBzaXplU2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgc2l6ZSA9IHBhcnNlSW50KHNpemVTbGlkZXIudmFsdWUpO1xuICAgIHNpemVEaXNwbGF5LnRleHRDb250ZW50ID0gc2l6ZS50b1N0cmluZygpO1xuICAgIHNpemVEaXNwbGF5Mi50ZXh0Q29udGVudCA9IHNpemUudG9TdHJpbmcoKTtcbiAgICBzZXR1cE1hdHJpY2VzKCk7XG4gIH0pO1xuXG4gIC8vIEJ1dHRvbiBiaW5kaW5nc1xuICBjYWxjdWxhdGVCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHVwZGF0ZVJlc3VsdCk7XG4gIGNsZWFyQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGVhckFsbE1hdHJpY2VzKTtcbiAgcmFuZG9tQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZmlsbFJhbmRvbU1hdHJpeChtYXRyaXhBLCBzaXplKTtcbiAgICBmaWxsUmFuZG9tTWF0cml4KG1hdHJpeEIsIHNpemUpO1xuICB9KTtcblxuICBsYXJnZVRlc3RCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBzaXplID0gcGFyc2VJbnQobGFyZ2VNYXRyaXhTaXplU2VsZWN0LnZhbHVlKTtcbiAgICBjb25zdCBBID0gZ2VuZXJhdGVNYXRyaXgoc2l6ZSk7XG4gICAgY29uc3QgQiA9IGdlbmVyYXRlTWF0cml4KHNpemUpO1xuICBcbiAgICAvLyBKUyBtdWx0aXBseVxuICAgIGNvbnN0IGpzU3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBqc011bHRpcGx5KEEsIEIpO1xuICAgIGNvbnN0IGpzRW5kID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3QganNUaW1lID0gKGpzRW5kIC0ganNTdGFydCkudG9GaXhlZCg2KTtcbiAgXG4gICAgLy8gV2ViR1BVIG11bHRpcGx5XG4gICAgY29uc3QgZ3B1VGltZSA9IGF3YWl0IHJ1bldlYkdQVU11bHRpcGxpY2F0aW9uKEEsIEIpO1xuICAgIGNvbnN0IGdwdVRpbWVTdHIgPSBncHVUaW1lLnRvRml4ZWQoNik7XG4gIFxuICAgIGxhcmdlTWF0cml4VGltZS50ZXh0Q29udGVudCA9XG4gICAgICBgSmF2YVNjcmlwdCB0aW1lOiAke2pzVGltZX0gbXMsIFdlYkdQVSB0aW1lOiAke2dwdVRpbWVTdHJ9IG1zYDtcbiAgfSk7XG5cbiAgLy8gSW5pdGlhbCBsb2FkXG4gIHNldHVwTWF0cmljZXMoKTtcbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9