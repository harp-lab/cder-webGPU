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
    if (navigator.gpu === undefined) {
        document.getElementById("webgpu-canvas").setAttribute("style", "display:none;");
        document.getElementById("no-webgpu").setAttribute("style", "display:block;");
        if (infoElement) {
            infoElement.textContent = "WebGPU is not supported in your browser.";
        }
        return;
    }
    // Check for WebGPU support
    if (!navigator.gpu) {
        if (infoElement) {
            infoElement.textContent = "WebGPU not supported on this browser.";
        }
        throw new Error("WebGPU not supported on this browser.");
    }
    // Request an adapter
    const adapter = yield navigator.gpu.requestAdapter();
    if (!adapter) {
        if (infoElement) {
            infoElement.textContent = "No appropriate GPU adapter found.";
        }
        throw new Error("No appropriate GPU adapter found.");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUM7SUFDbEYsQ0FBQztJQUVELDJDQUEyQztJQUMzQyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ2QsV0FBVyxDQUFDLFdBQVcsSUFBSSxVQUFVLENBQUM7SUFDMUMsQ0FBQztJQUVELFdBQVc7SUFDWCxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoQyxDQUFDLEVBQUMsRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci8uL3NyYy9hcHAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBzaGFkZXJDb2RlIGZyb20gXCIuL2FycmF5TXVsdGkud2dzbFwiO1xuXG4oYXN5bmMgKCkgPT4ge1xuICAgIC8vIEdldCB0aGUgaW5mbyBlbGVtZW50IHdoZXJlIHdlJ2xsIGRpc3BsYXkgcmVzdWx0c1xuICAgIGNvbnN0IGluZm9FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbmZvIHByZVwiKTtcbiAgICBcbiAgICBpZiAobmF2aWdhdG9yLmdwdSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViZ3B1LWNhbnZhc1wiKS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcImRpc3BsYXk6bm9uZTtcIik7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm8td2ViZ3B1XCIpLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiZGlzcGxheTpibG9jaztcIik7XG4gICAgICAgIGlmIChpbmZvRWxlbWVudCkge1xuICAgICAgICAgICAgaW5mb0VsZW1lbnQudGV4dENvbnRlbnQgPSBcIldlYkdQVSBpcyBub3Qgc3VwcG9ydGVkIGluIHlvdXIgYnJvd3Nlci5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIFdlYkdQVSBzdXBwb3J0XG4gICAgaWYgKCFuYXZpZ2F0b3IuZ3B1KSB7XG4gICAgICAgIGlmIChpbmZvRWxlbWVudCkge1xuICAgICAgICAgICAgaW5mb0VsZW1lbnQudGV4dENvbnRlbnQgPSBcIldlYkdQVSBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgYnJvd3Nlci5cIjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXZWJHUFUgbm90IHN1cHBvcnRlZCBvbiB0aGlzIGJyb3dzZXIuXCIpO1xuICAgIH1cblxuICAgIC8vIFJlcXVlc3QgYW4gYWRhcHRlclxuICAgIGNvbnN0IGFkYXB0ZXIgPSBhd2FpdCBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKCk7XG4gICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICAgIGlmIChpbmZvRWxlbWVudCkge1xuICAgICAgICAgICAgaW5mb0VsZW1lbnQudGV4dENvbnRlbnQgPSBcIk5vIGFwcHJvcHJpYXRlIEdQVSBhZGFwdGVyIGZvdW5kLlwiO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGFwcHJvcHJpYXRlIEdQVSBhZGFwdGVyIGZvdW5kLlwiKTtcbiAgICB9XG5cbiAgICAvLyBSZXF1ZXN0IGEgZGV2aWNlIGZyb20gdGhlIGFkYXB0ZXJcbiAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBhZGFwdGVyLnJlcXVlc3REZXZpY2UoKTtcbiAgICBcbiAgICAvLyBMb2cgc3VjY2VzcyBtZXNzYWdlIHRvIHRoZSBwYWdlXG4gICAgaWYgKGluZm9FbGVtZW50KSB7XG4gICAgICAgIGluZm9FbGVtZW50LnRleHRDb250ZW50ID0gXCJXZWJHUFUgZGV2aWNlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVxcblwiO1xuICAgIH1cblxuICAgIC8vIFNldHVwIHNoYWRlciBtb2R1bGVzXG4gICAgdmFyIHNoYWRlck1vZHVsZSA9IGRldmljZS5jcmVhdGVTaGFkZXJNb2R1bGUoe2NvZGU6IHNoYWRlckNvZGV9KTtcbiAgICB2YXIgY29tcGlsYXRpb25JbmZvID0gYXdhaXQgc2hhZGVyTW9kdWxlLmdldENvbXBpbGF0aW9uSW5mbygpO1xuICAgIGlmIChjb21waWxhdGlvbkluZm8ubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgaGFkRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgbGV0IGxvZ01lc3NhZ2UgPSBcIlNoYWRlciBjb21waWxhdGlvbiBsb2c6XFxuXCI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcGlsYXRpb25JbmZvLm1lc3NhZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbXNnID0gY29tcGlsYXRpb25JbmZvLm1lc3NhZ2VzW2ldO1xuICAgICAgICAgICAgbG9nTWVzc2FnZSArPSBgJHttc2cubGluZU51bX06JHttc2cubGluZVBvc30gLSAke21zZy5tZXNzYWdlfVxcbmA7XG4gICAgICAgICAgICBoYWRFcnJvciA9IGhhZEVycm9yIHx8IG1zZy50eXBlID09IFwiZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFkRXJyb3IpIHtcbiAgICAgICAgICAgIGxvZ01lc3NhZ2UgKz0gXCJTaGFkZXIgZmFpbGVkIHRvIGNvbXBpbGVcIjtcbiAgICAgICAgICAgIGlmIChpbmZvRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGluZm9FbGVtZW50LnRleHRDb250ZW50ICs9IGxvZ01lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZm9FbGVtZW50KSB7XG4gICAgICAgICAgICBpbmZvRWxlbWVudC50ZXh0Q29udGVudCArPSBsb2dNZXNzYWdlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBkYXRhIGZvciBvdXIgY29tcHV0ZSBvcGVyYXRpb25cbiAgICAvLyBXZSdsbCBjcmVhdGUgYW4gYXJyYXkgb2YgMTAwMCBmbG9hdGluZyBwb2ludCBudW1iZXJzXG4gICAgY29uc3QgZGF0YUNvdW50ID0gMTAwMDtcbiAgICBjb25zdCBkYXRhID0gbmV3IEZsb2F0MzJBcnJheShkYXRhQ291bnQpO1xuICAgIC8vIEluaXRpYWxpemUgd2l0aCB2YWx1ZXMgZnJvbSAwIHRvIDk5OVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YUNvdW50OyBpKyspIHtcbiAgICAgICAgZGF0YVtpXSA9IGk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGFuIGlucHV0IGJ1ZmZlciB3aXRoIG91ciBkYXRhXG4gICAgY29uc3QgaW5wdXRCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgbGFiZWw6IFwiSW5wdXQgQnVmZmVyXCIsXG4gICAgICAgIHNpemU6IGRhdGEuYnl0ZUxlbmd0aCxcbiAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogZmFsc2VcbiAgICB9KTtcblxuICAgIC8vIFdyaXRlIG91ciBkYXRhIHRvIHRoZSBpbnB1dCBidWZmZXJcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoaW5wdXRCdWZmZXIsIDAsIGRhdGEpO1xuXG4gICAgLy8gQ3JlYXRlIGFuIG91dHB1dCBidWZmZXIgdG8gc3RvcmUgcmVzdWx0c1xuICAgIGNvbnN0IG91dHB1dEJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgICBsYWJlbDogXCJPdXRwdXQgQnVmZmVyXCIsXG4gICAgICAgIHNpemU6IGRhdGEuYnl0ZUxlbmd0aCxcbiAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyxcbiAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogZmFsc2VcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhIHJlc3VsdCBzdGFnaW5nIGJ1ZmZlclxuICAgIC8vIFRoaXMgaXMgdXNlZCB0byByZWFkIGJhY2sgdGhlIHJlc3VsdHMgZnJvbSB0aGUgR1BVXG4gICAgY29uc3QgcmVzdWx0U3RhZ2luZ0J1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgICBsYWJlbDogXCJSZXN1bHQgU3RhZ2luZyBCdWZmZXJcIixcbiAgICAgICAgc2l6ZTogZGF0YS5ieXRlTGVuZ3RoLFxuICAgICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogZmFsc2VcbiAgICB9KTtcblxuICAgIC8vIEJJbmQgZ3JvdXAgbGF5b3V0IGFuZCBiaW5kIGdyb3VwXG4gICAgY29uc3QgYmluZEdyb3VwTGF5b3V0ID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgICAgIHtiaW5kaW5nOiAwLCB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5DT01QVVRFLCBidWZmZXI6IHt0eXBlOiBcInJlYWQtb25seS1zdG9yYWdlXCIgYXMgR1BVQnVmZmVyQmluZGluZ1R5cGV9fSwgIC8vIGlucHV0XG4gICAgICAgICAgICB7YmluZGluZzogMSwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7dHlwZTogXCJzdG9yYWdlXCIgYXMgR1BVQnVmZmVyQmluZGluZ1R5cGV9fSwgICAgICAgICAgICAvLyBvdXRwdXRcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIFxuICAgIGNvbnN0IGJpbmRHcm91cCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgICBsYXlvdXQ6IGJpbmRHcm91cExheW91dCxcbiAgICAgICAgZW50cmllczogW1xuICAgICAgICAgICAge2JpbmRpbmc6IDAsIHJlc291cmNlOiB7YnVmZmVyOiBpbnB1dEJ1ZmZlcn19LFxuICAgICAgICAgICAge2JpbmRpbmc6IDEsIHJlc291cmNlOiB7YnVmZmVyOiBvdXRwdXRCdWZmZXJ9fSxcbiAgICAgICAgXVxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGEgcGlwZWxpbmUgbGF5b3V0XG4gICAgY29uc3QgcGlwZWxpbmVMYXlvdXQgPSBkZXZpY2UuY3JlYXRlUGlwZWxpbmVMYXlvdXQoe1xuICAgICAgICBiaW5kR3JvdXBMYXlvdXRzOiBbYmluZEdyb3VwTGF5b3V0XSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhIGNvbXB1dGUgcGlwZWxpbmVcbiAgICBjb25zdCBjb21wdXRlUGlwZWxpbmUgPSBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHtcbiAgICAgICAgbGF5b3V0OiBwaXBlbGluZUxheW91dCxcbiAgICAgICAgY29tcHV0ZToge1xuICAgICAgICAgICAgbW9kdWxlOiBzaGFkZXJNb2R1bGUsXG4gICAgICAgICAgICBlbnRyeVBvaW50OiBcIm1haW5cIixcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhIGNvbW1hbmQgZW5jb2RlciBhbmQgYSBjb21wdXRlIHBhc3NcbiAgICBjb25zdCBjb21tYW5kRW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGNvbnN0IHBhc3MgPSBjb21tYW5kRW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgcGFzcy5zZXRQaXBlbGluZShjb21wdXRlUGlwZWxpbmUpO1xuICAgIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cCk7XG5cbiAgICAvLyBDYWxjdWxhdGUgd29ya2dyb3VwIGNvdW50cyBiYXNlZCBvbiBkYXRhIHNpemUgYW5kIHdvcmtncm91cCBzaXplXG4gICAgY29uc3Qgd29ya2dyb3VwU2l6ZSA9IDY0OyAvLyBNdXN0IG1hdGNoIHNoYWRlcidzIEB3b3JrZ3JvdXBfc2l6ZVxuICAgIGNvbnN0IHdvcmtncm91cENvdW50ID0gTWF0aC5jZWlsKGRhdGFDb3VudCAvIHdvcmtncm91cFNpemUpO1xuXG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMod29ya2dyb3VwQ291bnQsIDEsIDEpO1xuICAgIHBhc3MuZW5kKCk7XG5cbiAgICAvLyBDb3B5IG91dHB1dCB0byBzdGFnaW5nIGJ1ZmZlciBmb3IgcmVhZGluZ1xuICAgIGNvbW1hbmRFbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihvdXRwdXRCdWZmZXIsIDAsIHJlc3VsdFN0YWdpbmdCdWZmZXIsIDAsIGRhdGEuYnl0ZUxlbmd0aCk7XG5cbiAgICAvLyBTdWJtaXQgY29tbWFuZHMgdG8gdGhlIHF1ZXVlXG4gICAgY29uc3QgY29tbWFuZEJ1ZmZlciA9IGNvbW1hbmRFbmNvZGVyLmZpbmlzaCgpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2NvbW1hbmRCdWZmZXJdKTtcbiAgICBcbiAgICAvLyBSZWFkIGJhY2sgdGhlIHJlc3VsdHNcbiAgICBhd2FpdCByZXN1bHRTdGFnaW5nQnVmZmVyLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgY29uc3QgcmVzdWx0QXJyYXlCdWZmZXIgPSByZXN1bHRTdGFnaW5nQnVmZmVyLmdldE1hcHBlZFJhbmdlKCk7XG4gICAgY29uc3QgcmVzdWx0RGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkocmVzdWx0QXJyYXlCdWZmZXIpO1xuXG4gICAgLy8gQ3JlYXRlIEhUTUwgY29udGVudCBmb3IgZGlzcGxheWluZyByZXN1bHRzXG4gICAgbGV0IHJlc3VsdEh0bWwgPSBcIlwiO1xuICAgIFxuICAgIC8vIEFkZCBhIGhlYWRpbmcgZm9yIHRoZSBpbnB1dCBkYXRhXG4gICAgcmVzdWx0SHRtbCArPSBcIk9yaWdpbmFsIGRhdGEgKGZpcnN0IDEwIHZhbHVlcyk6XFxuXCI7XG4gICAgLy8gRGlzcGxheSBmaXJzdCAxMCBpbnB1dCB2YWx1ZXNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgcmVzdWx0SHRtbCArPSBgWyR7aX1dOiAke2RhdGFbaV19XFxuYDtcbiAgICB9XG4gICAgXG4gICAgLy8gQWRkIGEgaGVhZGluZyBmb3IgdGhlIG91dHB1dCBkYXRhXG4gICAgcmVzdWx0SHRtbCArPSBcIlxcblJlc3VsdCBkYXRhIChmaXJzdCAxMCB2YWx1ZXMpOlxcblwiO1xuICAgIC8vIERpc3BsYXkgZmlyc3QgMTAgb3V0cHV0IHZhbHVlc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICByZXN1bHRIdG1sICs9IGBbJHtpfV06ICR7cmVzdWx0RGF0YVtpXX1cXG5gO1xuICAgIH1cbiAgICBcbiAgICAvLyBDb21wYXJlIGlucHV0IGFuZCBvdXRwdXQgdG8gdmVyaWZ5IHRoZSBvcGVyYXRpb25cbiAgICBsZXQgYWxsQ29ycmVjdCA9IHRydWU7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhQ291bnQ7IGkrKykge1xuICAgICAgICBpZiAocmVzdWx0RGF0YVtpXSAhPT0gZGF0YVtpXSAqIDIuMCkge1xuICAgICAgICAgICAgcmVzdWx0SHRtbCArPSBgXFxuTWlzbWF0Y2ggYXQgaW5kZXggJHtpfTogZXhwZWN0ZWQgJHtkYXRhW2ldICogMi4wfSwgZ290ICR7cmVzdWx0RGF0YVtpXX1cXG5gO1xuICAgICAgICAgICAgYWxsQ29ycmVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYgKGFsbENvcnJlY3QpIHtcbiAgICAgICAgcmVzdWx0SHRtbCArPSBcIlxcbkNvbXB1dGUgb3BlcmF0aW9uIHN1Y2Nlc3NmdWwhIEFsbCB2YWx1ZXMgY29ycmVjdGx5IGRvdWJsZWQuXCI7XG4gICAgfVxuICAgIFxuICAgIC8vIFVwZGF0ZSB0aGUgaW5mbyBlbGVtZW50IHdpdGggYWxsIHJlc3VsdHNcbiAgICBpZiAoaW5mb0VsZW1lbnQpIHtcbiAgICAgICAgaW5mb0VsZW1lbnQudGV4dENvbnRlbnQgKz0gcmVzdWx0SHRtbDtcbiAgICB9XG5cbiAgICAvLyBDbGVhbiB1cFxuICAgIHJlc3VsdFN0YWdpbmdCdWZmZXIudW5tYXAoKTtcbn0pKCk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9