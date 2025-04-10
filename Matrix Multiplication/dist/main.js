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
        const infoElement = document.querySelector("#info pre");
        var displayError = false;
        if (navigator.gpu === undefined) {
            console.log("test");
            displayError = true;
            if (infoElement) {
                infoElement.textContent = "WebGPU is not supported in your browser.";
            }
            return 0;
        }
        // Check for WebGPU support
        if (!navigator.gpu) {
            displayError = true;
            if (infoElement) {
                infoElement.textContent = "WebGPU not supported on this browser.";
            }
            return 0;
        }
        // Request an adapter
        const adapter = yield navigator.gpu.requestAdapter();
        if (!adapter) {
            displayError = true;
            if (infoElement) {
                infoElement.textContent = "No appropriate GPU adapter found.";
            }
            return 0;
        }
        if (displayError) {
            console.log("No WebGPU Device available.");
            alert("WebGPU is not supported in your browser! Visit https://webgpureport.org/ for info about your system.");
        }
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
                return 0;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TUFBTSxDQUFDLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9CLGNBQWM7UUFDZCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDbEMsc0RBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sTUFBTSxHQUFHLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU1QyxrQkFBa0I7UUFDbEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxvRUFBdUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV0QyxlQUFlLENBQUMsV0FBVztZQUN6QixvQkFBb0IsTUFBTSxxQkFBcUIsVUFBVSxLQUFLLENBQUM7SUFDbkUsQ0FBQyxFQUFDLENBQUM7SUFFSCxlQUFlO0lBQ2YsYUFBYSxFQUFFLENBQUM7QUFDbEIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyLy4vc3JjL1RpbWVzdGFtcFF1ZXJ5TWFuYWdlci50cyIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyLy4vc3JjL2dwdS1tYXRyaXgudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci8uL3NyYy9qcy1tYXRyaXgudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci8uL3NyYy91dGlsLnRzIiwid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyLy4vc3JjL2FwcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lc3RhbXBRdWVyeU1hbmFnZXIge1xyXG5cclxuICB0aW1lc3RhbXBTdXBwb3J0ZWQ6IGJvb2xlYW47XHJcblxyXG4gICN0aW1lc3RhbXBRdWVyeVNldDogR1BVUXVlcnlTZXQ7XHJcbiAgI3RpbWVzdGFtcEJ1ZmZlcjogR1BVQnVmZmVyO1xyXG4gICN0aW1lc3RhbXBNYXBCdWZmZXI6IEdQVUJ1ZmZlcjtcclxuICAjY2FsbGJhY2s/OiAoZGVsdGFUaW1lTnM6IG51bWJlcikgPT4gdm9pZDtcclxuXHJcbiAgY29uc3RydWN0b3IoZGV2aWNlOiBHUFVEZXZpY2UsIGNhbGxiYWNrPzogKGRlbHRhVGltZU5zOiBudW1iZXIpID0+IHZvaWQpIHtcclxuICAgIHRoaXMudGltZXN0YW1wU3VwcG9ydGVkID0gZGV2aWNlLmZlYXR1cmVzLmhhcygndGltZXN0YW1wLXF1ZXJ5Jyk7XHJcbiAgICBpZiAoIXRoaXMudGltZXN0YW1wU3VwcG9ydGVkKSByZXR1cm47XHJcblxyXG4gICAgdGhpcy4jY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuXHJcbiAgICBjb25zdCB0aW1lc3RhbXBCeXRlU2l6ZSA9IDg7XHJcbiAgICB0aGlzLiN0aW1lc3RhbXBRdWVyeVNldCA9IGRldmljZS5jcmVhdGVRdWVyeVNldCh7XHJcbiAgICAgIHR5cGU6ICd0aW1lc3RhbXAnLFxyXG4gICAgICBjb3VudDogMixcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuI3RpbWVzdGFtcEJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xyXG4gICAgICBzaXplOiB0aGlzLiN0aW1lc3RhbXBRdWVyeVNldC5jb3VudCAqIHRpbWVzdGFtcEJ5dGVTaXplLFxyXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMgfCBHUFVCdWZmZXJVc2FnZS5RVUVSWV9SRVNPTFZFLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4jdGltZXN0YW1wTWFwQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XHJcbiAgICAgIHNpemU6IHRoaXMuI3RpbWVzdGFtcEJ1ZmZlci5zaXplLFxyXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYWRkVGltZXN0YW1wV3JpdGUoXHJcbiAgICBwYXNzRGVzY3JpcHRvcjogR1BVUmVuZGVyUGFzc0Rlc2NyaXB0b3IgfCBHUFVDb21wdXRlUGFzc0Rlc2NyaXB0b3JcclxuICApIHtcclxuICAgIGlmICh0aGlzLnRpbWVzdGFtcFN1cHBvcnRlZCkge1xyXG4gICAgICBwYXNzRGVzY3JpcHRvci50aW1lc3RhbXBXcml0ZXMgPSB7XHJcbiAgICAgICAgcXVlcnlTZXQ6IHRoaXMuI3RpbWVzdGFtcFF1ZXJ5U2V0LFxyXG4gICAgICAgIGJlZ2lubmluZ09mUGFzc1dyaXRlSW5kZXg6IDAsXHJcbiAgICAgICAgZW5kT2ZQYXNzV3JpdGVJbmRleDogMSxcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXNzRGVzY3JpcHRvcjtcclxuICB9XHJcblxyXG4gIHJlc29sdmUoY29tbWFuZEVuY29kZXI6IEdQVUNvbW1hbmRFbmNvZGVyKSB7XHJcbiAgICBpZiAoIXRoaXMudGltZXN0YW1wU3VwcG9ydGVkKSByZXR1cm47XHJcblxyXG4gICAgY29tbWFuZEVuY29kZXIucmVzb2x2ZVF1ZXJ5U2V0KFxyXG4gICAgICB0aGlzLiN0aW1lc3RhbXBRdWVyeVNldCxcclxuICAgICAgMCxcclxuICAgICAgdGhpcy4jdGltZXN0YW1wUXVlcnlTZXQuY291bnQsXHJcbiAgICAgIHRoaXMuI3RpbWVzdGFtcEJ1ZmZlcixcclxuICAgICAgMFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAodGhpcy4jdGltZXN0YW1wTWFwQnVmZmVyLm1hcFN0YXRlID09PSAndW5tYXBwZWQnKSB7XHJcbiAgICAgIGNvbW1hbmRFbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihcclxuICAgICAgICB0aGlzLiN0aW1lc3RhbXBCdWZmZXIsXHJcbiAgICAgICAgMCxcclxuICAgICAgICB0aGlzLiN0aW1lc3RhbXBNYXBCdWZmZXIsXHJcbiAgICAgICAgMCxcclxuICAgICAgICB0aGlzLiN0aW1lc3RhbXBCdWZmZXIuc2l6ZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdHJ5SW5pdGlhdGVUaW1lc3RhbXBEb3dubG9hZCgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy50aW1lc3RhbXBTdXBwb3J0ZWQpIHJldHVybjtcclxuICAgIGlmICh0aGlzLiN0aW1lc3RhbXBNYXBCdWZmZXIubWFwU3RhdGUgIT09ICd1bm1hcHBlZCcpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBidWZmZXIgPSB0aGlzLiN0aW1lc3RhbXBNYXBCdWZmZXI7XHJcbiAgICB2b2lkIGJ1ZmZlci5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICBjb25zdCByYXdEYXRhID0gYnVmZmVyLmdldE1hcHBlZFJhbmdlKCk7XHJcbiAgICAgIGNvbnN0IHRpbWVzdGFtcHMgPSBuZXcgQmlnVWludDY0QXJyYXkocmF3RGF0YSk7XHJcbiAgICAgIGNvbnN0IGVsYXBzZWROcyA9IE51bWJlcih0aW1lc3RhbXBzWzFdIC0gdGltZXN0YW1wc1swXSk7XHJcbiAgICAgIGlmIChlbGFwc2VkTnMgPj0gMCAmJiB0aGlzLiNjYWxsYmFjaykge1xyXG4gICAgICAgIHRoaXMuI2NhbGxiYWNrKGVsYXBzZWROcyk7XHJcbiAgICAgIH1cclxuICAgICAgYnVmZmVyLnVubWFwKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRvd25sb2FkVGltZXN0YW1wUmVzdWx0KCk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICBpZiAoIXRoaXMudGltZXN0YW1wU3VwcG9ydGVkKSByZXR1cm4gMDtcclxuICAgIGlmICh0aGlzLiN0aW1lc3RhbXBNYXBCdWZmZXIubWFwU3RhdGUgIT09ICd1bm1hcHBlZCcpIHJldHVybiAwO1xyXG5cclxuICAgIGF3YWl0IHRoaXMuI3RpbWVzdGFtcE1hcEJ1ZmZlci5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xyXG4gICAgY29uc3QgcmF3RGF0YSA9IHRoaXMuI3RpbWVzdGFtcE1hcEJ1ZmZlci5nZXRNYXBwZWRSYW5nZSgpO1xyXG4gICAgY29uc3QgdGltZXN0YW1wcyA9IG5ldyBCaWdVaW50NjRBcnJheShyYXdEYXRhKTtcclxuICAgIGNvbnN0IGVsYXBzZWROcyA9IE51bWJlcih0aW1lc3RhbXBzWzFdIC0gdGltZXN0YW1wc1swXSk7XHJcbiAgICB0aGlzLiN0aW1lc3RhbXBNYXBCdWZmZXIudW5tYXAoKTtcclxuICAgIHJldHVybiBlbGFwc2VkTnM7XHJcbiAgfSBcclxufVxyXG4iLCJpbXBvcnQgc2hhZGVyQ29kZSBmcm9tIFwiLi9tYXRyaXhNdWx0aS53Z3NsXCI7XG5pbXBvcnQgeyBxdWl0SWZXZWJHUFVOb3RBdmFpbGFibGUgfSBmcm9tIFwiLi91dGlsXCI7XG5pbXBvcnQgVGltZXN0YW1wUXVlcnlNYW5hZ2VyIGZyb20gXCIuL1RpbWVzdGFtcFF1ZXJ5TWFuYWdlclwiO1xuXG4vLyBWZXJpZnkgdGhlIG1hdHJpeCBtdWx0aXBsaWNhdGlvbiByZXN1bHRcbmZ1bmN0aW9uIHZlcmlmeV9yZXN1bHQoTTogVWludDMyQXJyYXksIE46IFVpbnQzMkFycmF5LCBQOiBVaW50MzJBcnJheSwgd2lkdGg6IG51bWJlcikge1xuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHdpZHRoOyByb3crKykge1xuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB3aWR0aDsgY29sKyspIHtcbiAgICAgICAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCB3aWR0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IE1bcm93ICogd2lkdGggKyBrXSAqIE5bayAqIHdpZHRoICsgY29sXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkID0gc3VtO1xuICAgICAgICAgICAgY29uc3QgYWN0dWFsID0gUFtyb3cgKiB3aWR0aCArIGNvbF07XG4gICAgICAgICAgICBpZiAoZXhwZWN0ZWQgIT09IGFjdHVhbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYE1pc21hdGNoIGF0IFske3Jvd30sICR7Y29sfV06IGV4cGVjdGVkICR7ZXhwZWN0ZWR9LCBnb3QgJHthY3R1YWx9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFwiTWF0cml4IG11bHRpcGxpY2F0aW9uIHJlc3VsdCBpcyBjb3JyZWN0LlwiKTtcbn1cblxuLy8gRnVuY3Rpb24gdG8gcHJpbnQgYSBtYXRyaXggdG8gdGhlIGNvbnNvbGVcbmZ1bmN0aW9uIHByaW50TWF0cml4KG1hdHJpeDogVWludDMyQXJyYXksIHdpZHRoOiBudW1iZXIsIGxhYmVsOiBzdHJpbmcpIHtcbiAgICBjb25zb2xlLmxvZyhgXFxuJHtsYWJlbH06YCk7XG4gICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgd2lkdGg7IHJvdysrKSB7XG4gICAgICAgIGxldCByb3dTdHIgPSAnJztcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgd2lkdGg7IGNvbCsrKSB7XG4gICAgICAgICAgICByb3dTdHIgKz0gbWF0cml4W3JvdyAqIHdpZHRoICsgY29sXS50b1N0cmluZygpLnBhZFN0YXJ0KDQpICsgJyAnO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKHJvd1N0cik7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5XZWJHUFVNdWx0aXBsaWNhdGlvbihNOiBudW1iZXJbXVtdLCBOOiBudW1iZXJbXVtdKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBpbmZvRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5mbyBwcmVcIik7XG4gICAgdmFyIGRpc3BsYXlFcnJvciA9IGZhbHNlO1xuICAgIFxuICAgIGlmIChuYXZpZ2F0b3IuZ3B1ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJ0ZXN0XCIpO1xuICAgICAgICBkaXNwbGF5RXJyb3IgPSB0cnVlO1xuICAgICAgICBpZiAoaW5mb0VsZW1lbnQpIHtcbiAgICAgICAgICAgIGluZm9FbGVtZW50LnRleHRDb250ZW50ID0gXCJXZWJHUFUgaXMgbm90IHN1cHBvcnRlZCBpbiB5b3VyIGJyb3dzZXIuXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIFdlYkdQVSBzdXBwb3J0XG4gICAgaWYgKCFuYXZpZ2F0b3IuZ3B1KSB7XG4gICAgICAgIGRpc3BsYXlFcnJvciA9IHRydWU7XG4gICAgICAgIGlmIChpbmZvRWxlbWVudCkge1xuICAgICAgICAgICAgaW5mb0VsZW1lbnQudGV4dENvbnRlbnQgPSBcIldlYkdQVSBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgYnJvd3Nlci5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvLyBSZXF1ZXN0IGFuIGFkYXB0ZXJcbiAgICBjb25zdCBhZGFwdGVyID0gYXdhaXQgbmF2aWdhdG9yLmdwdS5yZXF1ZXN0QWRhcHRlcigpO1xuICAgIGlmICghYWRhcHRlcikge1xuICAgICAgICBkaXNwbGF5RXJyb3IgPSB0cnVlO1xuICAgICAgICBpZiAoaW5mb0VsZW1lbnQpIHtcbiAgICAgICAgICAgIGluZm9FbGVtZW50LnRleHRDb250ZW50ID0gXCJObyBhcHByb3ByaWF0ZSBHUFUgYWRhcHRlciBmb3VuZC5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBpZiAoZGlzcGxheUVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTm8gV2ViR1BVIERldmljZSBhdmFpbGFibGUuXCIpO1xuICAgICAgICBhbGVydChcIldlYkdQVSBpcyBub3Qgc3VwcG9ydGVkIGluIHlvdXIgYnJvd3NlciEgVmlzaXQgaHR0cHM6Ly93ZWJncHVyZXBvcnQub3JnLyBmb3IgaW5mbyBhYm91dCB5b3VyIHN5c3RlbS5cIilcbiAgICB9XG5cbiAgICBjb25zdCBzdXBwb3J0c1RpbWVzdGFtcFF1ZXJpZXMgPSBhZGFwdGVyPy5mZWF0dXJlcy5oYXMoJ3RpbWVzdGFtcC1xdWVyeScpO1xuICAgIGNvbnN0IGRldmljZSA9IGF3YWl0IGFkYXB0ZXI/LnJlcXVlc3REZXZpY2Uoe1xuICAgICAgICAvLyBXZSByZXF1ZXN0IGEgZGV2aWNlIHRoYXQgaGFzIHN1cHBvcnQgZm9yIHRpbWVzdGFtcCBxdWVyaWVzXG4gICAgICAgIHJlcXVpcmVkRmVhdHVyZXM6IHN1cHBvcnRzVGltZXN0YW1wUXVlcmllcyA/IFsndGltZXN0YW1wLXF1ZXJ5J10gOiBbXSxcbiAgICB9KTtcbiAgICBxdWl0SWZXZWJHUFVOb3RBdmFpbGFibGUoYWRhcHRlciwgZGV2aWNlKTtcblxuICAgIGNvbnN0IGNvbXB1dGVQYXNzRGVzY3JpcHRvcjogR1BVQ29tcHV0ZVBhc3NEZXNjcmlwdG9yID0ge307XG4gICAgY29uc3QgdGltZXN0YW1wUXVlcnlNYW5hZ2VyID0gbmV3IFRpbWVzdGFtcFF1ZXJ5TWFuYWdlcihkZXZpY2UsIChlbGFwc2VkTnMpID0+IHtcbiAgICAgICAgLy8gQ29udmVydCBmcm9tIG5hbm9zZWNvbmRzIHRvIG1pbGxpc2Vjb25kczpcbiAgICAgICAgY29uc3QgZWxhcHNlZE1zID0gTnVtYmVyKGVsYXBzZWROcykgKiAxZS02O1xuICAgIH0pO1xuXG4gICAgLy8gU2V0dXAgc2hhZGVyIG1vZHVsZXNcbiAgICB2YXIgc2hhZGVyTW9kdWxlID0gZGV2aWNlLmNyZWF0ZVNoYWRlck1vZHVsZSh7Y29kZTogc2hhZGVyQ29kZX0pO1xuICAgIHZhciBjb21waWxhdGlvbkluZm8gPSBhd2FpdCBzaGFkZXJNb2R1bGUuZ2V0Q29tcGlsYXRpb25JbmZvKCk7XG4gICAgaWYgKGNvbXBpbGF0aW9uSW5mby5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBoYWRFcnJvciA9IGZhbHNlO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlNoYWRlciBjb21waWxhdGlvbiBsb2c6XCIpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBpbGF0aW9uSW5mby5tZXNzYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1zZyA9IGNvbXBpbGF0aW9uSW5mby5tZXNzYWdlc1tpXTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke21zZy5saW5lTnVtfToke21zZy5saW5lUG9zfSAtICR7bXNnLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICBoYWRFcnJvciA9IGhhZEVycm9yIHx8IG1zZy50eXBlID09IFwiZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFkRXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2hhZGVyIGZhaWxlZCB0byBjb21waWxlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHNpemUgb2YgbWF0cml4XG4gICAgY29uc3QgV2lkdGggPSBNLmxlbmd0aDtcbiAgICBjb25zdCBtYXRyaXhTaXplID0gV2lkdGggKiBXaWR0aDtcbiAgICBjb25zdCBidWZmZXJTaXplID0gbWF0cml4U2l6ZSAqIFVpbnQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UO1xuXG4gICAgLy8gR2VuZXJhdGUgcmFuZG9tIE0gYW5kIE4gbWF0cmljZXNcbiAgICBjb25zdCBoX00gPSBuZXcgVWludDMyQXJyYXkoTS5mbGF0KCkpO1xuICAgIGNvbnN0IGhfTiA9IG5ldyBVaW50MzJBcnJheShOLmZsYXQoKSk7XG4gICAgLy8gcHJpbnRNYXRyaXgoaF9NLCBXaWR0aCwgXCJNYXRyaXggTVwiKTtcbiAgICAvLyBwcmludE1hdHJpeChoX04sIFdpZHRoLCBcIk1hdHJpeCBOXCIpO1xuXG4gICAgLy8gQWxsb2NhdGUgR1BVIG1lbW9yeSBmb3IgTSwgTiwgUCwgYW5kIFdpZHRoXG4gICAgY29uc3QgZF9NID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICAgIGxhYmVsOiBcIk1cIixcbiAgICAgICAgc2l6ZTogYnVmZmVyU2l6ZSxcbiAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyxcbiAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogdHJ1ZVxuICAgIH0pO1xuICAgIGNvbnN0IGRfTiA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgICBsYWJlbDogXCJOXCIsXG4gICAgICAgIHNpemU6IGJ1ZmZlclNpemUsXG4gICAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMsXG4gICAgICAgIG1hcHBlZEF0Q3JlYXRpb246IHRydWVcbiAgICB9KTsgXG4gICAgY29uc3QgZF9QID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICAgIGxhYmVsOiBcIlBcIixcbiAgICAgICAgc2l6ZTogYnVmZmVyU2l6ZSxcbiAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyxcbiAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogdHJ1ZVxuICAgIH0pOyBcbiAgICBjb25zdCBkX1dpZHRoID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICAgIGxhYmVsOiBcIldpZHRoXCIsXG4gICAgICAgIHNpemU6IDQsXG4gICAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMsXG4gICAgICAgIG1hcHBlZEF0Q3JlYXRpb246IHRydWVcbiAgICB9KTsgXG5cbiAgICAvLyBUcmFuc2ZlciBNLCBOLCBhbmQgV2lkdGggZnJvbSBDUFUgdG8gR1BVXG4gICAgbmV3IFVpbnQzMkFycmF5KGRfTS5nZXRNYXBwZWRSYW5nZSgpKS5zZXQoaF9NKTtcbiAgICBuZXcgVWludDMyQXJyYXkoZF9OLmdldE1hcHBlZFJhbmdlKCkpLnNldChoX04pO1xuICAgIG5ldyBVaW50MzJBcnJheShkX1dpZHRoLmdldE1hcHBlZFJhbmdlKCkpLnNldChbV2lkdGhdKTtcblxuICAgIC8vIFVubWFwIHRoZSBidWZmZXJzXG4gICAgZF9NLnVubWFwKCk7XG4gICAgZF9OLnVubWFwKCk7XG4gICAgZF9QLnVubWFwKCk7XG4gICAgZF9XaWR0aC51bm1hcCgpO1xuXG4gICAgLy8gQkluZCBncm91cCBsYXlvdXQgYW5kIGJpbmQgZ3JvdXBcbiAgICBjb25zdCBiaW5kR3JvdXBMYXlvdXQgPSBkZXZpY2UuY3JlYXRlQmluZEdyb3VwTGF5b3V0KHtcbiAgICAgICAgZW50cmllczogW1xuICAgICAgICAgICAge2JpbmRpbmc6IDAsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIGJ1ZmZlcjoge3R5cGU6IFwicmVhZC1vbmx5LXN0b3JhZ2VcIiBhcyBHUFVCdWZmZXJCaW5kaW5nVHlwZX19LCAgLy8gTVxuICAgICAgICAgICAge2JpbmRpbmc6IDEsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIGJ1ZmZlcjoge3R5cGU6IFwicmVhZC1vbmx5LXN0b3JhZ2VcIiBhcyBHUFVCdWZmZXJCaW5kaW5nVHlwZX19LCAgLy8gTlxuICAgICAgICAgICAge2JpbmRpbmc6IDIsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIGJ1ZmZlcjoge3R5cGU6IFwic3RvcmFnZVwiIGFzIEdQVUJ1ZmZlckJpbmRpbmdUeXBlfX0sICAgICAgICAgICAgLy8gUFxuICAgICAgICAgICAge2JpbmRpbmc6IDMsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIGJ1ZmZlcjoge3R5cGU6IFwicmVhZC1vbmx5LXN0b3JhZ2VcIiBhcyBHUFVCdWZmZXJCaW5kaW5nVHlwZX19LCAgLy8gV2lkdGhcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIFxuICAgIGNvbnN0IGJpbmRHcm91cCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgICBsYXlvdXQ6IGJpbmRHcm91cExheW91dCxcbiAgICAgICAgZW50cmllczogW1xuICAgICAgICAgICAge2JpbmRpbmc6IDAsIHJlc291cmNlOiB7YnVmZmVyOiBkX019fSxcbiAgICAgICAgICAgIHtiaW5kaW5nOiAxLCByZXNvdXJjZToge2J1ZmZlcjogZF9OfX0sXG4gICAgICAgICAgICB7YmluZGluZzogMiwgcmVzb3VyY2U6IHtidWZmZXI6IGRfUH19LFxuICAgICAgICAgICAge2JpbmRpbmc6IDMsIHJlc291cmNlOiB7YnVmZmVyOiBkX1dpZHRofX1cbiAgICAgICAgXVxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGEgcGlwZWxpbmUgbGF5b3V0XG4gICAgY29uc3QgcGlwZWxpbmVMYXlvdXQgPSBkZXZpY2UuY3JlYXRlUGlwZWxpbmVMYXlvdXQoe1xuICAgICAgICBiaW5kR3JvdXBMYXlvdXRzOiBbYmluZEdyb3VwTGF5b3V0XSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhIGNvbXB1dGUgcGlwZWxpbmVcbiAgICBjb25zdCBjb21wdXRlUGlwZWxpbmUgPSBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHtcbiAgICAgICAgbGF5b3V0OiBwaXBlbGluZUxheW91dCxcbiAgICAgICAgY29tcHV0ZToge1xuICAgICAgICAgICAgbW9kdWxlOiBzaGFkZXJNb2R1bGUsXG4gICAgICAgICAgICBlbnRyeVBvaW50OiBcIm1haW5cIixcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRpbWVzdGFtcFF1ZXJ5TWFuYWdlci5hZGRUaW1lc3RhbXBXcml0ZShjb21wdXRlUGFzc0Rlc2NyaXB0b3IpO1xuXG4gICAgLy8gQ3JlYXRlIGEgY29tbWFuZCBlbmNvZGVyIGFuZCBhIGNvbXB1dGUgcGFzc1xuICAgIGNvbnN0IGNvbW1hbmRFbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgY29uc3QgcGFzcyA9IGNvbW1hbmRFbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoY29tcHV0ZVBhc3NEZXNjcmlwdG9yKTtcbiAgICBwYXNzLnNldFBpcGVsaW5lKGNvbXB1dGVQaXBlbGluZSk7XG4gICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwKTtcbiAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhNYXRoLmNlaWwoV2lkdGggLyAxNiksIE1hdGguY2VpbChXaWR0aCAvIDE2KSk7XG4gICAgcGFzcy5lbmQoKTtcblxuICAgIHRpbWVzdGFtcFF1ZXJ5TWFuYWdlci5yZXNvbHZlKGNvbW1hbmRFbmNvZGVyKTtcblxuICAgIC8vIENvcHkgdGhlIHJlc3VsdCBmcm9tIEdQVSB0byBDUFVcbiAgICBjb25zdCBoX1AgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgc2l6ZTogYnVmZmVyU2l6ZSxcbiAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSk7XG4gICAgY29tbWFuZEVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKGRfUCwgMCwgaF9QLCAwLCBidWZmZXJTaXplKTtcblxuICAgIC8vIFdhaXQgZm9yIHRoZSBxdWV1ZSB0byBmaW5pc2ggYW5kIHJlYWQgdGhlIHJlc3VsdFxuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2NvbW1hbmRFbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICBhd2FpdCBoX1AubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICB2YXIgZWxhcHNlZE5zID0gYXdhaXQgdGltZXN0YW1wUXVlcnlNYW5hZ2VyLmRvd25sb2FkVGltZXN0YW1wUmVzdWx0KCk7XG4gICAgZWxhcHNlZE5zID0gZWxhcHNlZE5zICogMWUtNjtcbiAgICBcblxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBVaW50MzJBcnJheShoX1AuZ2V0TWFwcGVkUmFuZ2UoKSk7XG5cbiAgICAvLyBQcmludCB0aGUgcmVzdWx0IG1hdHJpeFxuICAgIC8vIHByaW50TWF0cml4KHJlc3VsdCwgV2lkdGgsIFwiTWF0cml4IFBcIik7XG5cbiAgICAvLyBWZXJpZnkgdGhlIHJlc3VsdFxuICAgIHZlcmlmeV9yZXN1bHQoaF9NLCBoX04sIHJlc3VsdCwgV2lkdGgpO1xuICAgIFxuICAgIHJldHVybiBlbGFwc2VkTnM7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24ganNNdWx0aXBseShBOiBudW1iZXJbXVtdLCBCOiBudW1iZXJbXVtdKTogbnVtYmVyW11bXSB7XG4gIGNvbnN0IG4gPSBBLmxlbmd0aDtcbiAgY29uc3QgcmVzdWx0OiBudW1iZXJbXVtdID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogbiB9LCAoKSA9PiBBcnJheShuKS5maWxsKDApKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgbjsgaisrKSB7XG4gICAgICBsZXQgc3VtID0gMDtcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgbjsgaysrKSB7XG4gICAgICAgIHN1bSArPSBBW2ldW2tdICogQltrXVtqXTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdFtpXVtqXSA9IHN1bTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn0iLCIvKiogU2hvd3MgYW4gZXJyb3IgZGlhbG9nIGlmIGdldHRpbmcgYW4gYWRhcHRlciB3YXNuJ3Qgc3VjY2Vzc2Z1bC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHF1aXRJZkFkYXB0ZXJOb3RBdmFpbGFibGUoXHJcbiAgICBhZGFwdGVyOiBHUFVBZGFwdGVyIHwgbnVsbFxyXG4gICk6IGFzc2VydHMgYWRhcHRlciB7XHJcbiAgICBpZiAoISgnZ3B1JyBpbiBuYXZpZ2F0b3IpKSB7XHJcbiAgICAgIGZhaWwoJ25hdmlnYXRvci5ncHUgaXMgbm90IGRlZmluZWQgLSBXZWJHUFUgbm90IGF2YWlsYWJsZSBpbiB0aGlzIGJyb3dzZXInKTtcclxuICAgIH1cclxuICBcclxuICAgIGlmICghYWRhcHRlcikge1xyXG4gICAgICBmYWlsKFwicmVxdWVzdEFkYXB0ZXIgcmV0dXJuZWQgbnVsbCAtIHRoaXMgc2FtcGxlIGNhbid0IHJ1biBvbiB0aGlzIHN5c3RlbVwiKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIHF1aXRJZkxpbWl0TGVzc1RoYW4oXHJcbiAgICBhZGFwdGVyOiBHUFVBZGFwdGVyLFxyXG4gICAgbGltaXQ6IHN0cmluZyxcclxuICAgIHJlcXVpcmVkVmFsdWU6IG51bWJlcixcclxuICAgIGxpbWl0czogUmVjb3JkPHN0cmluZywgR1BVU2l6ZTMyPlxyXG4gICkge1xyXG4gICAgaWYgKGxpbWl0IGluIGFkYXB0ZXIubGltaXRzKSB7XHJcbiAgICAgIGNvbnN0IGxpbWl0S2V5ID0gbGltaXQgYXMga2V5b2YgR1BVU3VwcG9ydGVkTGltaXRzO1xyXG4gICAgICBjb25zdCBsaW1pdFZhbHVlID0gYWRhcHRlci5saW1pdHNbbGltaXRLZXldIGFzIG51bWJlcjtcclxuICAgICAgaWYgKGxpbWl0VmFsdWUgPCByZXF1aXJlZFZhbHVlKSB7XHJcbiAgICAgICAgZmFpbChcclxuICAgICAgICAgIGBUaGlzIHNhbXBsZSBjYW4ndCBydW4gb24gdGhpcyBzeXN0ZW0uICR7bGltaXR9IGlzICR7bGltaXRWYWx1ZX0sIGFuZCB0aGlzIHNhbXBsZSByZXF1aXJlcyBhdCBsZWFzdCAke3JlcXVpcmVkVmFsdWV9LmBcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGxpbWl0c1tsaW1pdF0gPSByZXF1aXJlZFZhbHVlO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBTaG93cyBhbiBlcnJvciBkaWFsb2cgaWYgZ2V0dGluZyBhIGFkYXB0ZXIgb3IgZGV2aWNlIHdhc24ndCBzdWNjZXNzZnVsLFxyXG4gICAqIG9yIGlmL3doZW4gdGhlIGRldmljZSBpcyBsb3N0IG9yIGhhcyBhbiB1bmNhcHR1cmVkIGVycm9yLlxyXG4gICAqL1xyXG4gIGV4cG9ydCBmdW5jdGlvbiBxdWl0SWZXZWJHUFVOb3RBdmFpbGFibGUoXHJcbiAgICBhZGFwdGVyOiBHUFVBZGFwdGVyIHwgbnVsbCxcclxuICAgIGRldmljZTogR1BVRGV2aWNlIHwgbnVsbFxyXG4gICk6IGFzc2VydHMgZGV2aWNlIHtcclxuICAgIGlmICghZGV2aWNlKSB7XHJcbiAgICAgIHF1aXRJZkFkYXB0ZXJOb3RBdmFpbGFibGUoYWRhcHRlcik7XHJcbiAgICAgIGZhaWwoJ1VuYWJsZSB0byBnZXQgYSBkZXZpY2UgZm9yIGFuIHVua25vd24gcmVhc29uJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICBcclxuICAgIGRldmljZS5sb3N0LnRoZW4oKHJlYXNvbikgPT4ge1xyXG4gICAgICBmYWlsKGBEZXZpY2UgbG9zdCAoXCIke3JlYXNvbi5yZWFzb259XCIpOlxcbiR7cmVhc29uLm1lc3NhZ2V9YCk7XHJcbiAgICB9KTtcclxuICAgIGRldmljZS5vbnVuY2FwdHVyZWRlcnJvciA9IChldikgPT4ge1xyXG4gICAgICBmYWlsKGBVbmNhcHR1cmVkIGVycm9yOlxcbiR7ZXYuZXJyb3IubWVzc2FnZX1gKTtcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIC8qKiBGYWlsIGJ5IHNob3dpbmcgYSBjb25zb2xlIGVycm9yLCBhbmQgZGlhbG9nIGJveCBpZiBwb3NzaWJsZS4gKi9cclxuICBjb25zdCBmYWlsID0gKCgpID0+IHtcclxuICAgIHR5cGUgRXJyb3JPdXRwdXQgPSB7IHNob3cobXNnOiBzdHJpbmcpOiB2b2lkIH07XHJcbiAgXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVFcnJvck91dHB1dCgpIHtcclxuICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAvLyBOb3QgaW1wbGVtZW50ZWQgaW4gd29ya2Vycy5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc2hvdyhtc2c6IHN0cmluZykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgY29uc3QgZGlhbG9nQm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGlhbG9nJyk7XHJcbiAgICAgIGRpYWxvZ0JveC5jbG9zZSgpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChkaWFsb2dCb3gpO1xyXG4gIFxyXG4gICAgICBjb25zdCBkaWFsb2dUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XHJcbiAgICAgIGRpYWxvZ1RleHQuc3R5bGUud2hpdGVTcGFjZSA9ICdwcmUtd3JhcCc7XHJcbiAgICAgIGRpYWxvZ0JveC5hcHBlbmQoZGlhbG9nVGV4dCk7XHJcbiAgXHJcbiAgICAgIGNvbnN0IGNsb3NlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgIGNsb3NlQnRuLnRleHRDb250ZW50ID0gJ09LJztcclxuICAgICAgY2xvc2VCdG4ub25jbGljayA9ICgpID0+IGRpYWxvZ0JveC5jbG9zZSgpO1xyXG4gICAgICBkaWFsb2dCb3guYXBwZW5kKGNsb3NlQnRuKTtcclxuICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzaG93KG1zZzogc3RyaW5nKSB7XHJcbiAgICAgICAgICAvLyBEb24ndCBvdmVyd3JpdGUgdGhlIGRpYWxvZyBtZXNzYWdlIHdoaWxlIGl0J3Mgc3RpbGwgb3BlblxyXG4gICAgICAgICAgLy8gKHNob3cgdGhlIGZpcnN0IGVycm9yLCBub3QgdGhlIG1vc3QgcmVjZW50IGVycm9yKS5cclxuICAgICAgICAgIGlmICghZGlhbG9nQm94Lm9wZW4pIHtcclxuICAgICAgICAgICAgZGlhbG9nVGV4dC50ZXh0Q29udGVudCA9IG1zZztcclxuICAgICAgICAgICAgZGlhbG9nQm94LnNob3dNb2RhbCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgXHJcbiAgICBsZXQgb3V0cHV0OiBFcnJvck91dHB1dCB8IHVuZGVmaW5lZDtcclxuICBcclxuICAgIHJldHVybiAobWVzc2FnZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgIGlmICghb3V0cHV0KSBvdXRwdXQgPSBjcmVhdGVFcnJvck91dHB1dCgpO1xyXG4gIFxyXG4gICAgICBvdXRwdXQuc2hvdyhtZXNzYWdlKTtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgfTtcclxuICB9KSgpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsganNNdWx0aXBseSB9IGZyb20gJy4vanMtbWF0cml4JztcbmltcG9ydCB7IHJ1bldlYkdQVU11bHRpcGxpY2F0aW9uIH0gZnJvbSAnLi9ncHUtbWF0cml4JztcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgY29uc3Qgc2l6ZVNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2l6ZVNsaWRlclwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICBjb25zdCBzaXplRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWF0cml4U2l6ZURpc3BsYXlcIikhO1xuICBjb25zdCBzaXplRGlzcGxheTIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1hdHJpeFNpemVEaXNwbGF5MlwiKSE7XG4gIGNvbnN0IG1hdHJpeEEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1hdHJpeEFcIikhO1xuICBjb25zdCBtYXRyaXhCID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYXRyaXhCXCIpITtcbiAgY29uc3QgcmVzdWx0TWF0cml4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRNYXRyaXhcIikhO1xuICAvLyBjb25zdCBqc1RpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImpzVGltZVwiKSE7XG4gIC8vIGNvbnN0IGdwdVRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdwdVRpbWVcIikhO1xuICBjb25zdCBjYWxjdWxhdGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbGN1bGF0ZUJ0blwiKSE7XG4gIGNvbnN0IGNsZWFyQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbGVhckJ0blwiKSE7XG4gIGNvbnN0IHJhbmRvbUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmFuZG9tQnRuXCIpITtcbiAgY29uc3QgbGFyZ2VUZXN0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYXJnZVRlc3RCdG5cIikhO1xuICBjb25zdCBsYXJnZU1hdHJpeFNpemVTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhcmdlTWF0cml4U2l6ZVwiKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcbiAgY29uc3QgbGFyZ2VNYXRyaXhUaW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYXJnZU1hdHJpeFRpbWVcIikhO1xuXG4gIGxldCBzaXplID0gcGFyc2VJbnQoc2l6ZVNsaWRlci52YWx1ZSk7XG5cbiAgLy8gQ3JlYXRlIG1hdHJpeCBpbnB1dCBncmlkc1xuICBmdW5jdGlvbiBjcmVhdGVNYXRyaXgoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc2l6ZTogbnVtYmVyLCBlZGl0YWJsZSA9IHRydWUpIHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgY29udGFpbmVyLnN0eWxlLmdyaWRUZW1wbGF0ZUNvbHVtbnMgPSBgcmVwZWF0KCR7c2l6ZX0sIDFmcilgO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZSAqIHNpemU7IGkrKykge1xuICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICBpbnB1dC50eXBlID0gXCJudW1iZXJcIjtcbiAgICAgIGlucHV0LnZhbHVlID0gXCIwXCI7XG4gICAgICBpZiAoIWVkaXRhYmxlKSBpbnB1dC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEdldCB2YWx1ZXMgZnJvbSBhIG1hdHJpeFxuICBmdW5jdGlvbiBnZXRNYXRyaXhWYWx1ZXMoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc2l6ZTogbnVtYmVyKTogbnVtYmVyW11bXSB7XG4gICAgY29uc3QgaW5wdXRzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKTtcbiAgICBjb25zdCB2YWx1ZXM6IG51bWJlcltdW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgY29uc3Qgcm93OiBudW1iZXJbXSA9IFtdO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzaXplOyBqKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBpICogc2l6ZSArIGo7XG4gICAgICAgIHJvdy5wdXNoKHBhcnNlRmxvYXQoKGlucHV0c1tpbmRleF0gYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpIHx8IDApO1xuICAgICAgfVxuICAgICAgdmFsdWVzLnB1c2gocm93KTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxuXG4gIC8vIEZpbGwgdGhlIHJlc3VsdCBtYXRyaXhcbiAgZnVuY3Rpb24gc2V0TWF0cml4VmFsdWVzKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHZhbHVlczogbnVtYmVyW11bXSkge1xuICAgIGNvbnN0IGlucHV0cyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIik7XG4gICAgdmFsdWVzLmZsYXQoKS5mb3JFYWNoKCh2YWwsIGkpID0+IHtcbiAgICAgIChpbnB1dHNbaV0gYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUgPSB2YWwudG9TdHJpbmcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIENhbGN1bGF0ZSBhbmQgZGlzcGxheSByZXN1bHRcbiAgYXN5bmMgZnVuY3Rpb24gdXBkYXRlUmVzdWx0KCkge1xuICAgIGNvbnN0IEEgPSBnZXRNYXRyaXhWYWx1ZXMobWF0cml4QSwgc2l6ZSk7XG4gICAgY29uc3QgQiA9IGdldE1hdHJpeFZhbHVlcyhtYXRyaXhCLCBzaXplKTtcblxuICAgIC8vIEphdmFTY3JpcHQgbXVsdGlwbGljYXRpb25cbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGpzTXVsdGlwbHkoQSwgQik7XG4gICAgY29uc3QgZW5kID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAvLyBXZWJHUFUgbXVsdGlwbGljYXRpb25cbiAgICBjb25zdCBydW50aW1lID0gYXdhaXQgcnVuV2ViR1BVTXVsdGlwbGljYXRpb24oQSwgQik7XG5cbiAgICBzZXRNYXRyaXhWYWx1ZXMocmVzdWx0TWF0cml4LCByZXN1bHQpO1xuICAgIGNvbnN0IHRpbWVUYWtlbiA9IChlbmQgLSBzdGFydCkudG9GaXhlZCg2KTtcbiAgICAvLyBqc1RpbWUudGV4dENvbnRlbnQgPSBgSmF2YVNjcmlwdCB0aW1lOiAke3RpbWVUYWtlbn0gbXNgO1xuICAgIC8vIGdwdVRpbWUudGV4dENvbnRlbnQgPSBgV2ViR1BVIHRpbWU6ICR7cnVudGltZS50b0ZpeGVkKDYpfSBtc2A7XG4gIH1cblxuICAvLyBGaWxsIHJhbmRvbSBpbnRlZ2VycyBpbnRvIGEgbWF0cml4XG4gIGZ1bmN0aW9uIGZpbGxSYW5kb21NYXRyaXgoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc2l6ZTogbnVtYmVyKSB7XG4gICAgY29uc3QgaW5wdXRzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKTtcbiAgICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgICAoaW5wdXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCkudG9TdHJpbmcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJlc2V0IGFsbCBtYXRyaWNlcyB0byB6ZXJvXG4gIGZ1bmN0aW9uIGNsZWFyQWxsTWF0cmljZXMoKSB7XG4gICAgW21hdHJpeEEsIG1hdHJpeEIsIHJlc3VsdE1hdHJpeF0uZm9yRWFjaChtYXRyaXggPT4ge1xuICAgICAgbWF0cml4LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKS5mb3JFYWNoKGlucHV0ID0+IChpbnB1dCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSA9IFwiMFwiKTtcbiAgICB9KTtcbiAgICAvLyBqc1RpbWUudGV4dENvbnRlbnQgPSBgSmF2YVNjcmlwdCB0aW1lOiAwIG1zYDtcbiAgICAvLyBncHVUaW1lLnRleHRDb250ZW50ID0gYFdlYkdQVSB0aW1lOiAwIG1zYDtcbiAgfVxuXG4gIC8vIEluaXRpYWxpemUgbWF0cml4IFVJXG4gIGZ1bmN0aW9uIHNldHVwTWF0cmljZXMoKSB7XG4gICAgY3JlYXRlTWF0cml4KG1hdHJpeEEsIHNpemUpO1xuICAgIGNyZWF0ZU1hdHJpeChtYXRyaXhCLCBzaXplKTtcbiAgICBjcmVhdGVNYXRyaXgocmVzdWx0TWF0cml4LCBzaXplLCBmYWxzZSk7XG4gICAgLy8ganNUaW1lLnRleHRDb250ZW50ID0gYEphdmFTY3JpcHQgdGltZTogMCBtc2A7XG4gICAgLy8gZ3B1VGltZS50ZXh0Q29udGVudCA9IGBXZWJHUFUgdGltZTogMCBtc2A7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZU1hdHJpeChuOiBudW1iZXIpOiBudW1iZXJbXVtdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogbiB9LCAoKSA9PlxuICAgICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogbiB9LCAoKSA9PiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCkpXG4gICAgKTtcbiAgfSAgXG5cbiAgLy8gVXBkYXRlIG9uIHNsaWRlciBjaGFuZ2VcbiAgc2l6ZVNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgIHNpemUgPSBwYXJzZUludChzaXplU2xpZGVyLnZhbHVlKTtcbiAgICBzaXplRGlzcGxheS50ZXh0Q29udGVudCA9IHNpemUudG9TdHJpbmcoKTtcbiAgICBzaXplRGlzcGxheTIudGV4dENvbnRlbnQgPSBzaXplLnRvU3RyaW5nKCk7XG4gICAgc2V0dXBNYXRyaWNlcygpO1xuICB9KTtcblxuICAvLyBCdXR0b24gYmluZGluZ3NcbiAgY2FsY3VsYXRlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB1cGRhdGVSZXN1bHQpO1xuICBjbGVhckJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xlYXJBbGxNYXRyaWNlcyk7XG4gIHJhbmRvbUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGZpbGxSYW5kb21NYXRyaXgobWF0cml4QSwgc2l6ZSk7XG4gICAgZmlsbFJhbmRvbU1hdHJpeChtYXRyaXhCLCBzaXplKTtcbiAgfSk7XG5cbiAgbGFyZ2VUZXN0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3Qgc2l6ZSA9IHBhcnNlSW50KGxhcmdlTWF0cml4U2l6ZVNlbGVjdC52YWx1ZSk7XG4gICAgY29uc3QgQSA9IGdlbmVyYXRlTWF0cml4KHNpemUpO1xuICAgIGNvbnN0IEIgPSBnZW5lcmF0ZU1hdHJpeChzaXplKTtcbiAgXG4gICAgLy8gSlMgbXVsdGlwbHlcbiAgICBjb25zdCBqc1N0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAganNNdWx0aXBseShBLCBCKTtcbiAgICBjb25zdCBqc0VuZCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IGpzVGltZSA9IChqc0VuZCAtIGpzU3RhcnQpLnRvRml4ZWQoNik7XG4gIFxuICAgIC8vIFdlYkdQVSBtdWx0aXBseVxuICAgIGNvbnN0IGdwdVRpbWUgPSBhd2FpdCBydW5XZWJHUFVNdWx0aXBsaWNhdGlvbihBLCBCKTtcbiAgICBjb25zdCBncHVUaW1lU3RyID0gZ3B1VGltZS50b0ZpeGVkKDYpO1xuICBcbiAgICBsYXJnZU1hdHJpeFRpbWUudGV4dENvbnRlbnQgPVxuICAgICAgYEphdmFTY3JpcHQgdGltZTogJHtqc1RpbWV9IG1zLCBXZWJHUFUgdGltZTogJHtncHVUaW1lU3RyfSBtc2A7XG4gIH0pO1xuXG4gIC8vIEluaXRpYWwgbG9hZFxuICBzZXR1cE1hdHJpY2VzKCk7XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==