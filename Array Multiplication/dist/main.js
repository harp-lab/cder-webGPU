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
    if (navigator.gpu === undefined) {
        document.getElementById("webgpu-canvas").setAttribute("style", "display:none;");
        document.getElementById("no-webgpu").setAttribute("style", "display:block;");
        return;
    }
    // Check for WebGPU support
    if (!navigator.gpu) {
        throw new Error("WebGPU not supported on this browser.");
    }
    // Request an adapter
    const adapter = yield navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No appropriate GPU adapter found.");
    }
    // Request a device from the adapter
    const device = yield adapter.requestDevice();
    // Log success message
    console.log("WebGPU device initialized successfully");
    // Setup shader modules
    var shaderModule = device.createShaderModule({ code: _arrayMulti_wgsl__WEBPACK_IMPORTED_MODULE_0__ });
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
    // Log some results to verify
    console.log("Original data (first 10 values):", data.slice(0, 10));
    console.log("Result data (first 10 values):", resultData.slice(0, 10));
    // Compare input and output to verify the operation
    let allCorrect = true;
    for (let i = 0; i < dataCount; i++) {
        if (resultData[i] !== data[i] * 2.0) {
            console.error(`Mismatch at index ${i}: expected ${data[i] * 2.0}, got ${resultData[i]}`);
            allCorrect = false;
            break;
        }
    }
    if (allCorrect) {
        console.log("Compute operation successful! All values correctly doubled.");
    }
    // Clean up
    resultStagingBuffer.unmap();
}))();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLFNBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN6RixVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ25CLE1BQU07UUFDTixDQUFDO0lBQ0wsQ0FBQztJQUVELElBQUksVUFBVSxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELFdBQVc7SUFDWCxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoQyxDQUFDLEVBQUMsRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci8uL3NyYy9hcHAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBzaGFkZXJDb2RlIGZyb20gXCIuL2FycmF5TXVsdGkud2dzbFwiO1xuXG4oYXN5bmMgKCkgPT4ge1xuICAgIGlmIChuYXZpZ2F0b3IuZ3B1ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJncHUtY2FudmFzXCIpLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiZGlzcGxheTpub25lO1wiKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuby13ZWJncHVcIikuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgXCJkaXNwbGF5OmJsb2NrO1wiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBXZWJHUFUgc3VwcG9ydFxuICAgIGlmICghbmF2aWdhdG9yLmdwdSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXZWJHUFUgbm90IHN1cHBvcnRlZCBvbiB0aGlzIGJyb3dzZXIuXCIpO1xuICAgIH1cblxuICAgIC8vIFJlcXVlc3QgYW4gYWRhcHRlclxuICAgIGNvbnN0IGFkYXB0ZXIgPSBhd2FpdCBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKCk7XG4gICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGFwcHJvcHJpYXRlIEdQVSBhZGFwdGVyIGZvdW5kLlwiKTtcbiAgICB9XG5cbiAgICAvLyBSZXF1ZXN0IGEgZGV2aWNlIGZyb20gdGhlIGFkYXB0ZXJcbiAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBhZGFwdGVyLnJlcXVlc3REZXZpY2UoKTtcbiAgICBcbiAgICAvLyBMb2cgc3VjY2VzcyBtZXNzYWdlXG4gICAgY29uc29sZS5sb2coXCJXZWJHUFUgZGV2aWNlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVwiKTtcblxuICAgIC8vIFNldHVwIHNoYWRlciBtb2R1bGVzXG4gICAgdmFyIHNoYWRlck1vZHVsZSA9IGRldmljZS5jcmVhdGVTaGFkZXJNb2R1bGUoe2NvZGU6IHNoYWRlckNvZGV9KTtcbiAgICB2YXIgY29tcGlsYXRpb25JbmZvID0gYXdhaXQgc2hhZGVyTW9kdWxlLmdldENvbXBpbGF0aW9uSW5mbygpO1xuICAgIGlmIChjb21waWxhdGlvbkluZm8ubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgaGFkRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgY29uc29sZS5sb2coXCJTaGFkZXIgY29tcGlsYXRpb24gbG9nOlwiKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21waWxhdGlvbkluZm8ubWVzc2FnZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtc2cgPSBjb21waWxhdGlvbkluZm8ubWVzc2FnZXNbaV07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHttc2cubGluZU51bX06JHttc2cubGluZVBvc30gLSAke21zZy5tZXNzYWdlfWApO1xuICAgICAgICAgICAgaGFkRXJyb3IgPSBoYWRFcnJvciB8fCBtc2cudHlwZSA9PSBcImVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhZEVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNoYWRlciBmYWlsZWQgdG8gY29tcGlsZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgZGF0YSBmb3Igb3VyIGNvbXB1dGUgb3BlcmF0aW9uXG4gICAgLy8gV2UnbGwgY3JlYXRlIGFuIGFycmF5IG9mIDEwMDAgZmxvYXRpbmcgcG9pbnQgbnVtYmVyc1xuICAgIGNvbnN0IGRhdGFDb3VudCA9IDEwMDA7XG4gICAgY29uc3QgZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoZGF0YUNvdW50KTtcbiAgICAvLyBJbml0aWFsaXplIHdpdGggdmFsdWVzIGZyb20gMCB0byA5OTlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGFDb3VudDsgaSsrKSB7XG4gICAgICAgIGRhdGFbaV0gPSBpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhbiBpbnB1dCBidWZmZXIgd2l0aCBvdXIgZGF0YVxuICAgIGNvbnN0IGlucHV0QnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICAgIGxhYmVsOiBcIklucHV0IEJ1ZmZlclwiLFxuICAgICAgICBzaXplOiBkYXRhLmJ5dGVMZW5ndGgsXG4gICAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgICAgIG1hcHBlZEF0Q3JlYXRpb246IGZhbHNlXG4gICAgfSk7XG5cbiAgICAvLyBXcml0ZSBvdXIgZGF0YSB0byB0aGUgaW5wdXQgYnVmZmVyXG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGlucHV0QnVmZmVyLCAwLCBkYXRhKTtcblxuICAgIC8vIENyZWF0ZSBhbiBvdXRwdXQgYnVmZmVyIHRvIHN0b3JlIHJlc3VsdHNcbiAgICBjb25zdCBvdXRwdXRCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgbGFiZWw6IFwiT3V0cHV0IEJ1ZmZlclwiLFxuICAgICAgICBzaXplOiBkYXRhLmJ5dGVMZW5ndGgsXG4gICAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMsXG4gICAgICAgIG1hcHBlZEF0Q3JlYXRpb246IGZhbHNlXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYSByZXN1bHQgc3RhZ2luZyBidWZmZXJcbiAgICAvLyBUaGlzIGlzIHVzZWQgdG8gcmVhZCBiYWNrIHRoZSByZXN1bHRzIGZyb20gdGhlIEdQVVxuICAgIGNvbnN0IHJlc3VsdFN0YWdpbmdCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgbGFiZWw6IFwiUmVzdWx0IFN0YWdpbmcgQnVmZmVyXCIsXG4gICAgICAgIHNpemU6IGRhdGEuYnl0ZUxlbmd0aCxcbiAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgICAgIG1hcHBlZEF0Q3JlYXRpb246IGZhbHNlXG4gICAgfSk7XG5cbiAgICAvLyBCSW5kIGdyb3VwIGxheW91dCBhbmQgYmluZCBncm91cFxuICAgIGNvbnN0IGJpbmRHcm91cExheW91dCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXBMYXlvdXQoe1xuICAgICAgICBlbnRyaWVzOiBbXG4gICAgICAgICAgICB7YmluZGluZzogMCwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7dHlwZTogXCJyZWFkLW9ubHktc3RvcmFnZVwiIGFzIEdQVUJ1ZmZlckJpbmRpbmdUeXBlfX0sICAvLyBpbnB1dFxuICAgICAgICAgICAge2JpbmRpbmc6IDEsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIGJ1ZmZlcjoge3R5cGU6IFwic3RvcmFnZVwiIGFzIEdQVUJ1ZmZlckJpbmRpbmdUeXBlfX0sICAgICAgICAgICAgLy8gb3V0cHV0XG4gICAgICAgIF1cbiAgICB9KTtcbiAgICBcbiAgICBjb25zdCBiaW5kR3JvdXAgPSBkZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICAgICAgbGF5b3V0OiBiaW5kR3JvdXBMYXlvdXQsXG4gICAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgICAgIHtiaW5kaW5nOiAwLCByZXNvdXJjZToge2J1ZmZlcjogaW5wdXRCdWZmZXJ9fSxcbiAgICAgICAgICAgIHtiaW5kaW5nOiAxLCByZXNvdXJjZToge2J1ZmZlcjogb3V0cHV0QnVmZmVyfX0sXG4gICAgICAgIF1cbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhIHBpcGVsaW5lIGxheW91dFxuICAgIGNvbnN0IHBpcGVsaW5lTGF5b3V0ID0gZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICAgICAgYmluZEdyb3VwTGF5b3V0czogW2JpbmRHcm91cExheW91dF0sXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYSBjb21wdXRlIHBpcGVsaW5lXG4gICAgY29uc3QgY29tcHV0ZVBpcGVsaW5lID0gZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7XG4gICAgICAgIGxheW91dDogcGlwZWxpbmVMYXlvdXQsXG4gICAgICAgIGNvbXB1dGU6IHtcbiAgICAgICAgICAgIG1vZHVsZTogc2hhZGVyTW9kdWxlLFxuICAgICAgICAgICAgZW50cnlQb2ludDogXCJtYWluXCIsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYSBjb21tYW5kIGVuY29kZXIgYW5kIGEgY29tcHV0ZSBwYXNzXG4gICAgY29uc3QgY29tbWFuZEVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBjb25zdCBwYXNzID0gY29tbWFuZEVuY29kZXIuYmVnaW5Db21wdXRlUGFzcygpO1xuICAgIHBhc3Muc2V0UGlwZWxpbmUoY29tcHV0ZVBpcGVsaW5lKTtcbiAgICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXApO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHdvcmtncm91cCBjb3VudHMgYmFzZWQgb24gZGF0YSBzaXplIGFuZCB3b3JrZ3JvdXAgc2l6ZVxuICAgIGNvbnN0IHdvcmtncm91cFNpemUgPSA2NDsgLy8gTXVzdCBtYXRjaCBzaGFkZXIncyBAd29ya2dyb3VwX3NpemVcbiAgICBjb25zdCB3b3JrZ3JvdXBDb3VudCA9IE1hdGguY2VpbChkYXRhQ291bnQgLyB3b3JrZ3JvdXBTaXplKTtcblxuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKHdvcmtncm91cENvdW50LCAxLCAxKTtcbiAgICBwYXNzLmVuZCgpO1xuXG4gICAgLy8gQ29weSBvdXRwdXQgdG8gc3RhZ2luZyBidWZmZXIgZm9yIHJlYWRpbmdcbiAgICBjb21tYW5kRW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIob3V0cHV0QnVmZmVyLCAwLCByZXN1bHRTdGFnaW5nQnVmZmVyLCAwLCBkYXRhLmJ5dGVMZW5ndGgpO1xuXG4gICAgLy8gU3VibWl0IGNvbW1hbmRzIHRvIHRoZSBxdWV1ZVxuICAgIGNvbnN0IGNvbW1hbmRCdWZmZXIgPSBjb21tYW5kRW5jb2Rlci5maW5pc2goKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtjb21tYW5kQnVmZmVyXSk7XG4gICAgXG4gICAgLy8gUmVhZCBiYWNrIHRoZSByZXN1bHRzXG4gICAgYXdhaXQgcmVzdWx0U3RhZ2luZ0J1ZmZlci5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgIGNvbnN0IHJlc3VsdEFycmF5QnVmZmVyID0gcmVzdWx0U3RhZ2luZ0J1ZmZlci5nZXRNYXBwZWRSYW5nZSgpO1xuICAgIGNvbnN0IHJlc3VsdERhdGEgPSBuZXcgRmxvYXQzMkFycmF5KHJlc3VsdEFycmF5QnVmZmVyKTtcblxuICAgIC8vIExvZyBzb21lIHJlc3VsdHMgdG8gdmVyaWZ5XG4gICAgY29uc29sZS5sb2coXCJPcmlnaW5hbCBkYXRhIChmaXJzdCAxMCB2YWx1ZXMpOlwiLCBkYXRhLnNsaWNlKDAsIDEwKSk7XG4gICAgY29uc29sZS5sb2coXCJSZXN1bHQgZGF0YSAoZmlyc3QgMTAgdmFsdWVzKTpcIiwgcmVzdWx0RGF0YS5zbGljZSgwLCAxMCkpO1xuXG4gICAgLy8gQ29tcGFyZSBpbnB1dCBhbmQgb3V0cHV0IHRvIHZlcmlmeSB0aGUgb3BlcmF0aW9uXG4gICAgbGV0IGFsbENvcnJlY3QgPSB0cnVlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YUNvdW50OyBpKyspIHtcbiAgICAgICAgaWYgKHJlc3VsdERhdGFbaV0gIT09IGRhdGFbaV0gKiAyLjApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgTWlzbWF0Y2ggYXQgaW5kZXggJHtpfTogZXhwZWN0ZWQgJHtkYXRhW2ldICogMi4wfSwgZ290ICR7cmVzdWx0RGF0YVtpXX1gKTtcbiAgICAgICAgYWxsQ29ycmVjdCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiAoYWxsQ29ycmVjdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNvbXB1dGUgb3BlcmF0aW9uIHN1Y2Nlc3NmdWwhIEFsbCB2YWx1ZXMgY29ycmVjdGx5IGRvdWJsZWQuXCIpO1xuICAgIH1cblxuICAgIC8vIENsZWFuIHVwXG4gICAgcmVzdWx0U3RhZ2luZ0J1ZmZlci51bm1hcCgpO1xufSkoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==