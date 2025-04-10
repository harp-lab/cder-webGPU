/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/arrayMulti.wgsl":
/*!*****************************!*\
  !*** ./src/arrayMulti.wgsl ***!
  \*****************************/
/***/ ((module) => {

module.exports = "@group(0) @binding(0) var<storage, read> input: array<f32>;\n@group(0) @binding(1) var<storage, read_write> output: array<f32>;\n\n@compute @workgroup_size(64)\nfn main(@builtin(global_invocation_id) global_id: vec3<u32>) {\n    let index = global_id.x;\n    \n    // Only process if within array bounds\n    if (index < arrayLength(&input)) {\n    // Simple computation: double each value\n    output[index] = input[index] * 2.0;\n    }\n}";

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
/* harmony import */ var _arrayMulti_wgsl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayMulti.wgsl */ "./src/arrayMulti.wgsl");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

(() => __awaiter(void 0, void 0, void 0, function* () {
    // Get the info element where we'll display results
    const infoElement = document.querySelector("#info pre");
    var displayError = false;
    if (navigator.gpu === undefined) {
        displayError = true;
        if (infoElement) {
            infoElement.textContent = "WebGPU is not supported in your browser.";
        }
        return;
    }
    // Check for WebGPU support
    if (!navigator.gpu) {
        displayError = true;
        if (infoElement) {
            infoElement.textContent = "WebGPU not supported on this browser.";
        }
        throw new Error("WebGPU not supported on this browser.");
    }
    // Request an adapter
    const adapter = yield navigator.gpu.requestAdapter();
    if (!adapter) {
        displayError = true;
        if (infoElement) {
            infoElement.textContent = "No appropriate GPU adapter found.";
        }
        throw new Error("No appropriate GPU adapter found.");
    }
    if (displayError) {
        console.log("No WebGPU Device available.");
        alert("WebGPU is not supported in your browser! Visit https://webgpureport.org/ for info about your system.");
    }
    // Request a device from the adapter
    const device = yield adapter.requestDevice();
    // Log success message to the page
    if (infoElement) {
        infoElement.textContent = "WebGPU device initialized successfully\n";
    }
    // Setup shader modules
    var shaderModule = device.createShaderModule({ code: _arrayMulti_wgsl__WEBPACK_IMPORTED_MODULE_0__ });
    var compilationInfo = yield shaderModule.getCompilationInfo();
    if (compilationInfo.messages.length > 0) {
        var hadError = false;
        let logMessage = "Shader compilation log:\n";
        for (var i = 0; i < compilationInfo.messages.length; ++i) {
            var msg = compilationInfo.messages[i];
            logMessage += `${msg.lineNum}:${msg.linePos} - ${msg.message}\n`;
            hadError = hadError || msg.type == "error";
        }
        if (hadError) {
            logMessage += "Shader failed to compile";
            if (infoElement) {
                infoElement.textContent += logMessage;
            }
            return;
        }
        if (infoElement) {
            infoElement.textContent += logMessage;
        }
    }
    // Create the data for our compute operation
    // We'll create an array of 1000 floating point numbers
    const dataCount = 1000;
    const data = new Float32Array(dataCount);
    // Initialize with values from 0 to 999
    for (let i = 0; i < dataCount; i++) {
        data[i] = i;
    }
    // Create an input buffer with our data
    const inputBuffer = device.createBuffer({
        label: "Input Buffer",
        size: data.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false
    });
    // Write our data to the input buffer
    device.queue.writeBuffer(inputBuffer, 0, data);
    // Create an output buffer to store results
    const outputBuffer = device.createBuffer({
        label: "Output Buffer",
        size: data.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: false
    });
    // Create a result staging buffer
    // This is used to read back the results from the GPU
    const resultStagingBuffer = device.createBuffer({
        label: "Result Staging Buffer",
        size: data.byteLength,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false
    });
    // BInd group layout and bind group
    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } }, // input
            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } }, // output
        ]
    });
    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer: inputBuffer } },
            { binding: 1, resource: { buffer: outputBuffer } },
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
    // Create a command encoder and a compute pass
    const commandEncoder = device.createCommandEncoder();
    const pass = commandEncoder.beginComputePass();
    pass.setPipeline(computePipeline);
    pass.setBindGroup(0, bindGroup);
    // Calculate workgroup counts based on data size and workgroup size
    const workgroupSize = 64; // Must match shader's @workgroup_size
    const workgroupCount = Math.ceil(dataCount / workgroupSize);
    pass.dispatchWorkgroups(workgroupCount, 1, 1);
    pass.end();
    // Copy output to staging buffer for reading
    commandEncoder.copyBufferToBuffer(outputBuffer, 0, resultStagingBuffer, 0, data.byteLength);
    // Submit commands to the queue
    const commandBuffer = commandEncoder.finish();
    device.queue.submit([commandBuffer]);
    // Read back the results
    yield resultStagingBuffer.mapAsync(GPUMapMode.READ);
    const resultArrayBuffer = resultStagingBuffer.getMappedRange();
    const resultData = new Float32Array(resultArrayBuffer);
    // Create HTML content for displaying results
    let resultHtml = "";
    // Add a heading for the input data
    resultHtml += "Original data (first 10 values):\n";
    // Display first 10 input values
    for (let i = 0; i < 10; i++) {
        resultHtml += `[${i}]: ${data[i]}\n`;
    }
    // Add a heading for the output data
    resultHtml += "\nResult data (first 10 values):\n";
    // Display first 10 output values
    for (let i = 0; i < 10; i++) {
        resultHtml += `[${i}]: ${resultData[i]}\n`;
    }
    // Compare input and output to verify the operation
    let allCorrect = true;
    for (let i = 0; i < dataCount; i++) {
        if (resultData[i] !== data[i] * 2.0) {
            resultHtml += `\nMismatch at index ${i}: expected ${data[i] * 2.0}, got ${resultData[i]}\n`;
            allCorrect = false;
            break;
        }
    }
    if (allCorrect) {
        resultHtml += "\nCompute operation successful! All values correctly doubled.";
    }
    // Update the info element with all results
    if (infoElement) {
        infoElement.textContent += resultHtml;
    }
    // Clean up
    resultStagingBuffer.unmap();
}))();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQztJQUNMLENBQUM7SUFFRCxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQ2IsVUFBVSxJQUFJLCtEQUErRCxDQUFDO0lBQ2xGLENBQUM7SUFFRCwyQ0FBMkM7SUFDM0MsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNkLFdBQVcsQ0FBQyxXQUFXLElBQUksVUFBVSxDQUFDO0lBQzFDLENBQUM7SUFFRCxXQUFXO0lBQ1gsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvLi9zcmMvYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgc2hhZGVyQ29kZSBmcm9tIFwiLi9hcnJheU11bHRpLndnc2xcIjtcblxuKGFzeW5jICgpID0+IHtcbiAgICAvLyBHZXQgdGhlIGluZm8gZWxlbWVudCB3aGVyZSB3ZSdsbCBkaXNwbGF5IHJlc3VsdHNcbiAgICBjb25zdCBpbmZvRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5mbyBwcmVcIik7XG4gICAgdmFyIGRpc3BsYXlFcnJvciA9IGZhbHNlO1xuICAgIFxuICAgIGlmIChuYXZpZ2F0b3IuZ3B1ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGlzcGxheUVycm9yID0gdHJ1ZTtcbiAgICAgICAgaWYgKGluZm9FbGVtZW50KSB7XG4gICAgICAgICAgICBpbmZvRWxlbWVudC50ZXh0Q29udGVudCA9IFwiV2ViR1BVIGlzIG5vdCBzdXBwb3J0ZWQgaW4geW91ciBicm93c2VyLlwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgV2ViR1BVIHN1cHBvcnRcbiAgICBpZiAoIW5hdmlnYXRvci5ncHUpIHtcbiAgICAgICAgZGlzcGxheUVycm9yID0gdHJ1ZTtcbiAgICAgICAgaWYgKGluZm9FbGVtZW50KSB7XG4gICAgICAgICAgICBpbmZvRWxlbWVudC50ZXh0Q29udGVudCA9IFwiV2ViR1BVIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBicm93c2VyLlwiO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIldlYkdQVSBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgYnJvd3Nlci5cIik7XG4gICAgfVxuXG4gICAgLy8gUmVxdWVzdCBhbiBhZGFwdGVyXG4gICAgY29uc3QgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIoKTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgZGlzcGxheUVycm9yID0gdHJ1ZTtcbiAgICAgICAgaWYgKGluZm9FbGVtZW50KSB7XG4gICAgICAgICAgICBpbmZvRWxlbWVudC50ZXh0Q29udGVudCA9IFwiTm8gYXBwcm9wcmlhdGUgR1BVIGFkYXB0ZXIgZm91bmQuXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYXBwcm9wcmlhdGUgR1BVIGFkYXB0ZXIgZm91bmQuXCIpO1xuICAgIH1cblxuICAgIGlmIChkaXNwbGF5RXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJObyBXZWJHUFUgRGV2aWNlIGF2YWlsYWJsZS5cIik7XG4gICAgICAgIGFsZXJ0KFwiV2ViR1BVIGlzIG5vdCBzdXBwb3J0ZWQgaW4geW91ciBicm93c2VyISBWaXNpdCBodHRwczovL3dlYmdwdXJlcG9ydC5vcmcvIGZvciBpbmZvIGFib3V0IHlvdXIgc3lzdGVtLlwiKVxuICAgIH1cbiAgICAvLyBSZXF1ZXN0IGEgZGV2aWNlIGZyb20gdGhlIGFkYXB0ZXJcbiAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBhZGFwdGVyLnJlcXVlc3REZXZpY2UoKTtcbiAgICBcbiAgICAvLyBMb2cgc3VjY2VzcyBtZXNzYWdlIHRvIHRoZSBwYWdlXG4gICAgaWYgKGluZm9FbGVtZW50KSB7XG4gICAgICAgIGluZm9FbGVtZW50LnRleHRDb250ZW50ID0gXCJXZWJHUFUgZGV2aWNlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVxcblwiO1xuICAgIH1cblxuICAgIC8vIFNldHVwIHNoYWRlciBtb2R1bGVzXG4gICAgdmFyIHNoYWRlck1vZHVsZSA9IGRldmljZS5jcmVhdGVTaGFkZXJNb2R1bGUoe2NvZGU6IHNoYWRlckNvZGV9KTtcbiAgICB2YXIgY29tcGlsYXRpb25JbmZvID0gYXdhaXQgc2hhZGVyTW9kdWxlLmdldENvbXBpbGF0aW9uSW5mbygpO1xuICAgIGlmIChjb21waWxhdGlvbkluZm8ubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgaGFkRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgbGV0IGxvZ01lc3NhZ2UgPSBcIlNoYWRlciBjb21waWxhdGlvbiBsb2c6XFxuXCI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcGlsYXRpb25JbmZvLm1lc3NhZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbXNnID0gY29tcGlsYXRpb25JbmZvLm1lc3NhZ2VzW2ldO1xuICAgICAgICAgICAgbG9nTWVzc2FnZSArPSBgJHttc2cubGluZU51bX06JHttc2cubGluZVBvc30gLSAke21zZy5tZXNzYWdlfVxcbmA7XG4gICAgICAgICAgICBoYWRFcnJvciA9IGhhZEVycm9yIHx8IG1zZy50eXBlID09IFwiZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFkRXJyb3IpIHtcbiAgICAgICAgICAgIGxvZ01lc3NhZ2UgKz0gXCJTaGFkZXIgZmFpbGVkIHRvIGNvbXBpbGVcIjtcbiAgICAgICAgICAgIGlmIChpbmZvRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGluZm9FbGVtZW50LnRleHRDb250ZW50ICs9IGxvZ01lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZm9FbGVtZW50KSB7XG4gICAgICAgICAgICBpbmZvRWxlbWVudC50ZXh0Q29udGVudCArPSBsb2dNZXNzYWdlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBkYXRhIGZvciBvdXIgY29tcHV0ZSBvcGVyYXRpb25cbiAgICAvLyBXZSdsbCBjcmVhdGUgYW4gYXJyYXkgb2YgMTAwMCBmbG9hdGluZyBwb2ludCBudW1iZXJzXG4gICAgY29uc3QgZGF0YUNvdW50ID0gMTAwMDtcbiAgICBjb25zdCBkYXRhID0gbmV3IEZsb2F0MzJBcnJheShkYXRhQ291bnQpO1xuICAgIC8vIEluaXRpYWxpemUgd2l0aCB2YWx1ZXMgZnJvbSAwIHRvIDk5OVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YUNvdW50OyBpKyspIHtcbiAgICAgICAgZGF0YVtpXSA9IGk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGFuIGlucHV0IGJ1ZmZlciB3aXRoIG91ciBkYXRhXG4gICAgY29uc3QgaW5wdXRCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgbGFiZWw6IFwiSW5wdXQgQnVmZmVyXCIsXG4gICAgICAgIHNpemU6IGRhdGEuYnl0ZUxlbmd0aCxcbiAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogZmFsc2VcbiAgICB9KTtcblxuICAgIC8vIFdyaXRlIG91ciBkYXRhIHRvIHRoZSBpbnB1dCBidWZmZXJcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoaW5wdXRCdWZmZXIsIDAsIGRhdGEpO1xuXG4gICAgLy8gQ3JlYXRlIGFuIG91dHB1dCBidWZmZXIgdG8gc3RvcmUgcmVzdWx0c1xuICAgIGNvbnN0IG91dHB1dEJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgICBsYWJlbDogXCJPdXRwdXQgQnVmZmVyXCIsXG4gICAgICAgIHNpemU6IGRhdGEuYnl0ZUxlbmd0aCxcbiAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyxcbiAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogZmFsc2VcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhIHJlc3VsdCBzdGFnaW5nIGJ1ZmZlclxuICAgIC8vIFRoaXMgaXMgdXNlZCB0byByZWFkIGJhY2sgdGhlIHJlc3VsdHMgZnJvbSB0aGUgR1BVXG4gICAgY29uc3QgcmVzdWx0U3RhZ2luZ0J1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgICBsYWJlbDogXCJSZXN1bHQgU3RhZ2luZyBCdWZmZXJcIixcbiAgICAgICAgc2l6ZTogZGF0YS5ieXRlTGVuZ3RoLFxuICAgICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogZmFsc2VcbiAgICB9KTtcblxuICAgIC8vIEJJbmQgZ3JvdXAgbGF5b3V0IGFuZCBiaW5kIGdyb3VwXG4gICAgY29uc3QgYmluZEdyb3VwTGF5b3V0ID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgICAgIHtiaW5kaW5nOiAwLCB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5DT01QVVRFLCBidWZmZXI6IHt0eXBlOiBcInJlYWQtb25seS1zdG9yYWdlXCIgYXMgR1BVQnVmZmVyQmluZGluZ1R5cGV9fSwgIC8vIGlucHV0XG4gICAgICAgICAgICB7YmluZGluZzogMSwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7dHlwZTogXCJzdG9yYWdlXCIgYXMgR1BVQnVmZmVyQmluZGluZ1R5cGV9fSwgICAgICAgICAgICAvLyBvdXRwdXRcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIFxuICAgIGNvbnN0IGJpbmRHcm91cCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgICBsYXlvdXQ6IGJpbmRHcm91cExheW91dCxcbiAgICAgICAgZW50cmllczogW1xuICAgICAgICAgICAge2JpbmRpbmc6IDAsIHJlc291cmNlOiB7YnVmZmVyOiBpbnB1dEJ1ZmZlcn19LFxuICAgICAgICAgICAge2JpbmRpbmc6IDEsIHJlc291cmNlOiB7YnVmZmVyOiBvdXRwdXRCdWZmZXJ9fSxcbiAgICAgICAgXVxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGEgcGlwZWxpbmUgbGF5b3V0XG4gICAgY29uc3QgcGlwZWxpbmVMYXlvdXQgPSBkZXZpY2UuY3JlYXRlUGlwZWxpbmVMYXlvdXQoe1xuICAgICAgICBiaW5kR3JvdXBMYXlvdXRzOiBbYmluZEdyb3VwTGF5b3V0XSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhIGNvbXB1dGUgcGlwZWxpbmVcbiAgICBjb25zdCBjb21wdXRlUGlwZWxpbmUgPSBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHtcbiAgICAgICAgbGF5b3V0OiBwaXBlbGluZUxheW91dCxcbiAgICAgICAgY29tcHV0ZToge1xuICAgICAgICAgICAgbW9kdWxlOiBzaGFkZXJNb2R1bGUsXG4gICAgICAgICAgICBlbnRyeVBvaW50OiBcIm1haW5cIixcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhIGNvbW1hbmQgZW5jb2RlciBhbmQgYSBjb21wdXRlIHBhc3NcbiAgICBjb25zdCBjb21tYW5kRW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGNvbnN0IHBhc3MgPSBjb21tYW5kRW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgcGFzcy5zZXRQaXBlbGluZShjb21wdXRlUGlwZWxpbmUpO1xuICAgIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cCk7XG5cbiAgICAvLyBDYWxjdWxhdGUgd29ya2dyb3VwIGNvdW50cyBiYXNlZCBvbiBkYXRhIHNpemUgYW5kIHdvcmtncm91cCBzaXplXG4gICAgY29uc3Qgd29ya2dyb3VwU2l6ZSA9IDY0OyAvLyBNdXN0IG1hdGNoIHNoYWRlcidzIEB3b3JrZ3JvdXBfc2l6ZVxuICAgIGNvbnN0IHdvcmtncm91cENvdW50ID0gTWF0aC5jZWlsKGRhdGFDb3VudCAvIHdvcmtncm91cFNpemUpO1xuXG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMod29ya2dyb3VwQ291bnQsIDEsIDEpO1xuICAgIHBhc3MuZW5kKCk7XG5cbiAgICAvLyBDb3B5IG91dHB1dCB0byBzdGFnaW5nIGJ1ZmZlciBmb3IgcmVhZGluZ1xuICAgIGNvbW1hbmRFbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihvdXRwdXRCdWZmZXIsIDAsIHJlc3VsdFN0YWdpbmdCdWZmZXIsIDAsIGRhdGEuYnl0ZUxlbmd0aCk7XG5cbiAgICAvLyBTdWJtaXQgY29tbWFuZHMgdG8gdGhlIHF1ZXVlXG4gICAgY29uc3QgY29tbWFuZEJ1ZmZlciA9IGNvbW1hbmRFbmNvZGVyLmZpbmlzaCgpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2NvbW1hbmRCdWZmZXJdKTtcbiAgICBcbiAgICAvLyBSZWFkIGJhY2sgdGhlIHJlc3VsdHNcbiAgICBhd2FpdCByZXN1bHRTdGFnaW5nQnVmZmVyLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgY29uc3QgcmVzdWx0QXJyYXlCdWZmZXIgPSByZXN1bHRTdGFnaW5nQnVmZmVyLmdldE1hcHBlZFJhbmdlKCk7XG4gICAgY29uc3QgcmVzdWx0RGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkocmVzdWx0QXJyYXlCdWZmZXIpO1xuXG4gICAgLy8gQ3JlYXRlIEhUTUwgY29udGVudCBmb3IgZGlzcGxheWluZyByZXN1bHRzXG4gICAgbGV0IHJlc3VsdEh0bWwgPSBcIlwiO1xuICAgIFxuICAgIC8vIEFkZCBhIGhlYWRpbmcgZm9yIHRoZSBpbnB1dCBkYXRhXG4gICAgcmVzdWx0SHRtbCArPSBcIk9yaWdpbmFsIGRhdGEgKGZpcnN0IDEwIHZhbHVlcyk6XFxuXCI7XG4gICAgLy8gRGlzcGxheSBmaXJzdCAxMCBpbnB1dCB2YWx1ZXNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgcmVzdWx0SHRtbCArPSBgWyR7aX1dOiAke2RhdGFbaV19XFxuYDtcbiAgICB9XG4gICAgXG4gICAgLy8gQWRkIGEgaGVhZGluZyBmb3IgdGhlIG91dHB1dCBkYXRhXG4gICAgcmVzdWx0SHRtbCArPSBcIlxcblJlc3VsdCBkYXRhIChmaXJzdCAxMCB2YWx1ZXMpOlxcblwiO1xuICAgIC8vIERpc3BsYXkgZmlyc3QgMTAgb3V0cHV0IHZhbHVlc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICByZXN1bHRIdG1sICs9IGBbJHtpfV06ICR7cmVzdWx0RGF0YVtpXX1cXG5gO1xuICAgIH1cbiAgICBcbiAgICAvLyBDb21wYXJlIGlucHV0IGFuZCBvdXRwdXQgdG8gdmVyaWZ5IHRoZSBvcGVyYXRpb25cbiAgICBsZXQgYWxsQ29ycmVjdCA9IHRydWU7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhQ291bnQ7IGkrKykge1xuICAgICAgICBpZiAocmVzdWx0RGF0YVtpXSAhPT0gZGF0YVtpXSAqIDIuMCkge1xuICAgICAgICAgICAgcmVzdWx0SHRtbCArPSBgXFxuTWlzbWF0Y2ggYXQgaW5kZXggJHtpfTogZXhwZWN0ZWQgJHtkYXRhW2ldICogMi4wfSwgZ290ICR7cmVzdWx0RGF0YVtpXX1cXG5gO1xuICAgICAgICAgICAgYWxsQ29ycmVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYgKGFsbENvcnJlY3QpIHtcbiAgICAgICAgcmVzdWx0SHRtbCArPSBcIlxcbkNvbXB1dGUgb3BlcmF0aW9uIHN1Y2Nlc3NmdWwhIEFsbCB2YWx1ZXMgY29ycmVjdGx5IGRvdWJsZWQuXCI7XG4gICAgfVxuICAgIFxuICAgIC8vIFVwZGF0ZSB0aGUgaW5mbyBlbGVtZW50IHdpdGggYWxsIHJlc3VsdHNcbiAgICBpZiAoaW5mb0VsZW1lbnQpIHtcbiAgICAgICAgaW5mb0VsZW1lbnQudGV4dENvbnRlbnQgKz0gcmVzdWx0SHRtbDtcbiAgICB9XG5cbiAgICAvLyBDbGVhbiB1cFxuICAgIHJlc3VsdFN0YWdpbmdCdWZmZXIudW5tYXAoKTtcbn0pKCk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9