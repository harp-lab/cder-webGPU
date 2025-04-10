/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/camera.ts":
/*!***********************!*\
  !*** ./src/camera.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   canvasToNDC: () => (/* binding */ canvasToNDC),
/* harmony export */   createCamera: () => (/* binding */ createCamera),
/* harmony export */   getCanvasCoordinates: () => (/* binding */ getCanvasCoordinates),
/* harmony export */   getCanvasDimensions: () => (/* binding */ getCanvasDimensions),
/* harmony export */   ndcToWorld: () => (/* binding */ ndcToWorld),
/* harmony export */   screenToWorld: () => (/* binding */ screenToWorld),
/* harmony export */   setupCameraControls: () => (/* binding */ setupCameraControls)
/* harmony export */ });
function createCamera() {
    return {
        x: 0,
        y: 0,
        zoom: 1.0,
        isDragging: false,
        lastMouseX: 0,
        lastMouseY: 0
    };
}
// Get canvas dimensions
function getCanvasDimensions(canvas) {
    return {
        width: canvas.width,
        height: canvas.height,
        rect: canvas.getBoundingClientRect()
    };
}
// Convert screen coordinates to canvas coordinates
function getCanvasCoordinates(screenX, screenY, canvas) {
    const dimensions = getCanvasDimensions(canvas);
    const rect = dimensions.rect;
    return {
        x: screenX - rect.left,
        y: screenY - rect.top
    };
}
// Convert canvas coordinates to normalized device coordinates (-1 to 1)
function canvasToNDC(canvasX, canvasY, canvas) {
    const dimensions = getCanvasDimensions(canvas);
    return {
        x: (canvasX / dimensions.width) * 2 - 1,
        y: -((canvasY / dimensions.height) * 2 - 1) // Flip Y axis
    };
}
// Convert normalized device coordinates to world coordinates
function ndcToWorld(ndcX, ndcY, camera) {
    return {
        x: ndcX * camera.zoom + camera.x,
        y: ndcY * camera.zoom + camera.y
    };
}
// Convert screen coordinates to world coordinates
function screenToWorld(screenX, screenY, camera, canvas) {
    const canvasCoords = getCanvasCoordinates(screenX, screenY, canvas);
    const ndcCoords = canvasToNDC(canvasCoords.x, canvasCoords.y, canvas);
    return ndcToWorld(ndcCoords.x, ndcCoords.y, camera);
}
// Setup camera event listeners
function setupCameraControls(canvas, camera, updateCameraCallback) {
    canvas.addEventListener("mousedown", (e) => {
        camera.isDragging = true;
        const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY, canvas);
        camera.lastMouseX = canvasCoords.x;
        camera.lastMouseY = canvasCoords.y;
    });
    canvas.addEventListener("mousemove", (e) => {
        if (camera.isDragging) {
            // Get canvas-relative coordinates
            const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY, canvas);
            // Calculate the change in mouse position within canvas
            const dx = canvasCoords.x - camera.lastMouseX;
            const dy = canvasCoords.y - camera.lastMouseY;
            // Convert pixel movement to world space movement (accounting for zoom)
            const dimensions = getCanvasDimensions(canvas);
            const worldDx = (dx / dimensions.width) * 2 * camera.zoom;
            const worldDy = -(dy / dimensions.height) * 2 * camera.zoom; // Flip Y
            // Update camera position
            camera.x -= worldDx;
            camera.y -= worldDy;
            // Update last mouse position
            camera.lastMouseX = canvasCoords.x;
            camera.lastMouseY = canvasCoords.y;
            updateCameraCallback();
        }
    });
    canvas.addEventListener("mouseup", () => {
        camera.isDragging = false;
    });
    canvas.addEventListener("mouseleave", () => {
        camera.isDragging = false;
    });
    // Improved zoom that zooms toward cursor position
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        // Get world position under the cursor before zoom
        const mouseWorldPos = screenToWorld(e.clientX, e.clientY, camera, canvas);
        // Adjust zoom based on scroll direction
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9; // Zoom out/in
        camera.zoom *= zoomFactor;
        // Clamp zoom to reasonable limits
        camera.zoom = Math.max(0.1, Math.min(10.0, camera.zoom));
        // Get new world position under cursor after zoom change
        const newMouseWorldPos = screenToWorld(e.clientX, e.clientY, camera, canvas);
        // Adjust camera position to keep cursor over the same world point
        camera.x += (mouseWorldPos.x - newMouseWorldPos.x);
        camera.y += (mouseWorldPos.y - newMouseWorldPos.y);
        updateCameraCallback();
    }, { passive: false });
}


/***/ }),

/***/ "./src/triangle.wgsl":
/*!***************************!*\
  !*** ./src/triangle.wgsl ***!
  \***************************/
/***/ ((module) => {

module.exports = "struct Triangle {\n    pos: vec2f,\n    padding: vec2f,\n    color: vec4f,\n};\n\nstruct Camera {\n    position: vec2f,\n    zoom: f32,\n    padding: f32,\n};\n\n@group(0) @binding(0) var<storage, read> triangles: array<Triangle>;\n@group(0) @binding(1) var<uniform> camera: Camera;\n\nstruct VertexOutput {\n    @builtin(position) position: vec4f,\n    @location(0) color: vec4f,\n};\n\n@vertex\nfn vertexMain(@builtin(vertex_index) vertexIndex: u32, \n                @builtin(instance_index) instanceIndex: u32) -> VertexOutput {\n    // Triangle vertices (equilateral triangle centered at origin)\n    var positions = array<vec2f, 3>(\n        vec2f(0.0, 0.1),\n        vec2f(-0.1, -0.1),\n        vec2f(0.1, -0.1)\n    );\n    \n    // Proper camera transform for zooming\n    // 1. Apply object position (triangle center)\n    // 2. Subtract camera position to move camera\n    // 3. Apply zoom (divide by zoom factor to make objects appear smaller when zooming out)\n    var worldPos = positions[vertexIndex] + triangles[instanceIndex].pos;\n    var viewPos = (worldPos - camera.position) / camera.zoom;\n    \n    var output: VertexOutput;\n    output.position = vec4f(viewPos, 0.0, 1.0);\n    output.color = triangles[instanceIndex].color;\n    \n    return output;\n}\n\n@fragment\nfn fragmentMain(input: VertexOutput) -> @location(0) vec4f {\n    return input.color;\n}";

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
/*!*************************!*\
  !*** ./src/triangle.ts ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _triangle_wgsl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./triangle.wgsl */ "./src/triangle.wgsl");
/* harmony import */ var _camera__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./camera */ "./src/camera.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


function main() {
    return __awaiter(this, void 0, void 0, function* () {
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
        // Canvas and device setup
        const device = yield adapter.requestDevice();
        if (!device) {
            console.log("WebGPU not supported");
            alert("WebGPU not supported");
            return;
        }
        // Configure rendering context
        const canvas = document.getElementById("webgpu-canvas");
        const context = canvas.getContext("webgpu");
        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device,
            format,
        });
        // Initialize camera
        const camera = (0,_camera__WEBPACK_IMPORTED_MODULE_1__.createCamera)();
        let triangleBuffer;
        // Generate 5 random triangles
        function generateTriangles() {
            const triangles = Array.from({ length: 5 }, () => ({
                x: Math.random() * 1.2 - 0.6,
                y: Math.random() * 1.2 - 0.6,
                color: [
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    1.0
                ]
            }));
            return triangles;
        }
        // Set up triangle data
        function updateTriangleBuffer(triangles, device) {
            const triangleData = new Float32Array(triangles.length * 8);
            triangles.forEach((triangle, i) => {
                const offset = i * 8;
                triangleData[offset] = triangle.x;
                triangleData[offset + 1] = triangle.y;
                triangleData[offset + 2] = 0.0;
                triangleData[offset + 3] = 0.0;
                triangleData[offset + 4] = triangle.color[0];
                triangleData[offset + 5] = triangle.color[1];
                triangleData[offset + 6] = triangle.color[2];
                triangleData[offset + 7] = triangle.color[3];
            });
            if (triangleBuffer) {
                device.queue.writeBuffer(triangleBuffer, 0, triangleData);
            }
            else {
                triangleBuffer = device.createBuffer({
                    size: triangleData.byteLength,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
                    mappedAtCreation: true,
                });
                new Float32Array(triangleBuffer.getMappedRange()).set(triangleData);
                triangleBuffer.unmap();
            }
            return triangleBuffer;
        }
        let triangles = generateTriangles();
        triangleBuffer = updateTriangleBuffer(triangles, device);
        // Add event listener for randomize button
        document.getElementById("randomize-btn").addEventListener("click", () => {
            triangles = generateTriangles();
            updateTriangleBuffer(triangles, device);
        });
        // Create a uniform buffer for camera data - now with proper size
        // We need 3 float32 values (12 bytes) but must align to 16 bytes for WebGPU
        const cameraUniformBuffer = device.createBuffer({
            size: 16, // Properly aligned size for 3 floats (x, y, zoom)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        // Update camera uniforms
        function updateCameraUniform() {
            device.queue.writeBuffer(cameraUniformBuffer, 0, new Float32Array([camera.x, camera.y, camera.zoom, 0.0]) // Add padding for alignment
            );
        }
        updateCameraUniform();
        (0,_camera__WEBPACK_IMPORTED_MODULE_1__.setupCameraControls)(canvas, camera, updateCameraUniform);
        // Create bind group layout (now with camera uniform buffer)
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "read-only-storage" }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "uniform" }
                }
            ]
        });
        const bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: triangleBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: cameraUniformBuffer }
                }
            ]
        });
        // Create shader module
        const shaderModule = device.createShaderModule({
            code: _triangle_wgsl__WEBPACK_IMPORTED_MODULE_0__
        });
        // Create pipeline
        const pipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            }),
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain"
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: [{ format }]
            }
        });
        // Render function
        function render() {
            const commandEncoder = device.createCommandEncoder();
            const pass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                        view: context.getCurrentTexture().createView(),
                        loadOp: "clear",
                        storeOp: "store",
                        clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }
                    }]
            });
            pass.setPipeline(pipeline);
            pass.setBindGroup(0, bindGroup);
            pass.draw(3, triangles.length); // 3 vertices per triangle
            pass.end();
            device.queue.submit([commandEncoder.finish()]);
            requestAnimationFrame(render);
        }
        render();
    });
}
window.addEventListener("load", main);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRTtxQkFDakQsQ0FBQzthQUNELENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsMEJBQTBCO1lBQzFELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUVYLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsTUFBTSxFQUFFLENBQUM7SUFDYixDQUFDO0NBQUE7QUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci8uL3NyYy9jYW1lcmEudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvLi9zcmMvdHJpYW5nbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ2FtZXJhIHN0YXRlIGFuZCB1dGlsaXR5IGZ1bmN0aW9uc1xuZXhwb3J0IGludGVyZmFjZSBDYW1lcmEge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgem9vbTogbnVtYmVyO1xuICAgIGlzRHJhZ2dpbmc6IGJvb2xlYW47XG4gICAgbGFzdE1vdXNlWDogbnVtYmVyO1xuICAgIGxhc3RNb3VzZVk6IG51bWJlcjtcbiAgfVxuICBcbiAgZXhwb3J0IGludGVyZmFjZSBDYW52YXNEaW1lbnNpb25zIHtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHJlY3Q6IERPTVJlY3Q7XG4gIH1cbiAgXG4gIGV4cG9ydCBpbnRlcmZhY2UgUG9pbnQge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gIH1cbiAgXG4gIGV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDYW1lcmEoKTogQ2FtZXJhIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICB6b29tOiAxLjAsXG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZSxcbiAgICAgIGxhc3RNb3VzZVg6IDAsXG4gICAgICBsYXN0TW91c2VZOiAwXG4gICAgfTtcbiAgfVxuICBcbiAgLy8gR2V0IGNhbnZhcyBkaW1lbnNpb25zXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRDYW52YXNEaW1lbnNpb25zKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiBDYW52YXNEaW1lbnNpb25zIHtcbiAgICByZXR1cm4geyBcbiAgICAgIHdpZHRoOiBjYW52YXMud2lkdGgsIFxuICAgICAgaGVpZ2h0OiBjYW52YXMuaGVpZ2h0LFxuICAgICAgcmVjdDogY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgfTtcbiAgfVxuICBcbiAgLy8gQ29udmVydCBzY3JlZW4gY29vcmRpbmF0ZXMgdG8gY2FudmFzIGNvb3JkaW5hdGVzXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRDYW52YXNDb29yZGluYXRlcyhcbiAgICBzY3JlZW5YOiBudW1iZXIsIFxuICAgIHNjcmVlblk6IG51bWJlciwgXG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuICApOiBQb2ludCB7XG4gICAgY29uc3QgZGltZW5zaW9ucyA9IGdldENhbnZhc0RpbWVuc2lvbnMoY2FudmFzKTtcbiAgICBjb25zdCByZWN0ID0gZGltZW5zaW9ucy5yZWN0O1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICB4OiBzY3JlZW5YIC0gcmVjdC5sZWZ0LFxuICAgICAgeTogc2NyZWVuWSAtIHJlY3QudG9wXG4gICAgfTtcbiAgfVxuICBcbiAgLy8gQ29udmVydCBjYW52YXMgY29vcmRpbmF0ZXMgdG8gbm9ybWFsaXplZCBkZXZpY2UgY29vcmRpbmF0ZXMgKC0xIHRvIDEpXG4gIGV4cG9ydCBmdW5jdGlvbiBjYW52YXNUb05EQyhcbiAgICBjYW52YXNYOiBudW1iZXIsIFxuICAgIGNhbnZhc1k6IG51bWJlciwgXG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuICApOiBQb2ludCB7XG4gICAgY29uc3QgZGltZW5zaW9ucyA9IGdldENhbnZhc0RpbWVuc2lvbnMoY2FudmFzKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgeDogKGNhbnZhc1ggLyBkaW1lbnNpb25zLndpZHRoKSAqIDIgLSAxLFxuICAgICAgeTogLSgoY2FudmFzWSAvIGRpbWVuc2lvbnMuaGVpZ2h0KSAqIDIgLSAxKSAvLyBGbGlwIFkgYXhpc1xuICAgIH07XG4gIH1cbiAgXG4gIC8vIENvbnZlcnQgbm9ybWFsaXplZCBkZXZpY2UgY29vcmRpbmF0ZXMgdG8gd29ybGQgY29vcmRpbmF0ZXNcbiAgZXhwb3J0IGZ1bmN0aW9uIG5kY1RvV29ybGQoXG4gICAgbmRjWDogbnVtYmVyLCBcbiAgICBuZGNZOiBudW1iZXIsIFxuICAgIGNhbWVyYTogQ2FtZXJhXG4gICk6IFBvaW50IHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogbmRjWCAqIGNhbWVyYS56b29tICsgY2FtZXJhLngsXG4gICAgICB5OiBuZGNZICogY2FtZXJhLnpvb20gKyBjYW1lcmEueVxuICAgIH07XG4gIH1cbiAgXG4gIC8vIENvbnZlcnQgc2NyZWVuIGNvb3JkaW5hdGVzIHRvIHdvcmxkIGNvb3JkaW5hdGVzXG4gIGV4cG9ydCBmdW5jdGlvbiBzY3JlZW5Ub1dvcmxkKFxuICAgIHNjcmVlblg6IG51bWJlciwgXG4gICAgc2NyZWVuWTogbnVtYmVyLCBcbiAgICBjYW1lcmE6IENhbWVyYSwgXG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuICApOiBQb2ludCB7XG4gICAgY29uc3QgY2FudmFzQ29vcmRzID0gZ2V0Q2FudmFzQ29vcmRpbmF0ZXMoc2NyZWVuWCwgc2NyZWVuWSwgY2FudmFzKTtcbiAgICBjb25zdCBuZGNDb29yZHMgPSBjYW52YXNUb05EQyhjYW52YXNDb29yZHMueCwgY2FudmFzQ29vcmRzLnksIGNhbnZhcyk7XG4gICAgcmV0dXJuIG5kY1RvV29ybGQobmRjQ29vcmRzLngsIG5kY0Nvb3Jkcy55LCBjYW1lcmEpO1xuICB9XG4gIFxuICAvLyBTZXR1cCBjYW1lcmEgZXZlbnQgbGlzdGVuZXJzXG4gIGV4cG9ydCBmdW5jdGlvbiBzZXR1cENhbWVyYUNvbnRyb2xzKFxuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIFxuICAgIGNhbWVyYTogQ2FtZXJhLCBcbiAgICB1cGRhdGVDYW1lcmFDYWxsYmFjazogKCkgPT4gdm9pZFxuICApOiB2b2lkIHtcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgY2FtZXJhLmlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgY29uc3QgY2FudmFzQ29vcmRzID0gZ2V0Q2FudmFzQ29vcmRpbmF0ZXMoZS5jbGllbnRYLCBlLmNsaWVudFksIGNhbnZhcyk7XG4gICAgICBjYW1lcmEubGFzdE1vdXNlWCA9IGNhbnZhc0Nvb3Jkcy54O1xuICAgICAgY2FtZXJhLmxhc3RNb3VzZVkgPSBjYW52YXNDb29yZHMueTtcbiAgICB9KTtcbiAgXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGlmIChjYW1lcmEuaXNEcmFnZ2luZykge1xuICAgICAgICAvLyBHZXQgY2FudmFzLXJlbGF0aXZlIGNvb3JkaW5hdGVzXG4gICAgICAgIGNvbnN0IGNhbnZhc0Nvb3JkcyA9IGdldENhbnZhc0Nvb3JkaW5hdGVzKGUuY2xpZW50WCwgZS5jbGllbnRZLCBjYW52YXMpO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjaGFuZ2UgaW4gbW91c2UgcG9zaXRpb24gd2l0aGluIGNhbnZhc1xuICAgICAgICBjb25zdCBkeCA9IGNhbnZhc0Nvb3Jkcy54IC0gY2FtZXJhLmxhc3RNb3VzZVg7XG4gICAgICAgIGNvbnN0IGR5ID0gY2FudmFzQ29vcmRzLnkgLSBjYW1lcmEubGFzdE1vdXNlWTtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbnZlcnQgcGl4ZWwgbW92ZW1lbnQgdG8gd29ybGQgc3BhY2UgbW92ZW1lbnQgKGFjY291bnRpbmcgZm9yIHpvb20pXG4gICAgICAgIGNvbnN0IGRpbWVuc2lvbnMgPSBnZXRDYW52YXNEaW1lbnNpb25zKGNhbnZhcyk7XG4gICAgICAgIGNvbnN0IHdvcmxkRHggPSAoZHggLyBkaW1lbnNpb25zLndpZHRoKSAqIDIgKiBjYW1lcmEuem9vbTtcbiAgICAgICAgY29uc3Qgd29ybGREeSA9IC0oZHkgLyBkaW1lbnNpb25zLmhlaWdodCkgKiAyICogY2FtZXJhLnpvb207IC8vIEZsaXAgWVxuICAgICAgICBcbiAgICAgICAgLy8gVXBkYXRlIGNhbWVyYSBwb3NpdGlvblxuICAgICAgICBjYW1lcmEueCAtPSB3b3JsZER4O1xuICAgICAgICBjYW1lcmEueSAtPSB3b3JsZER5O1xuICAgICAgICBcbiAgICAgICAgLy8gVXBkYXRlIGxhc3QgbW91c2UgcG9zaXRpb25cbiAgICAgICAgY2FtZXJhLmxhc3RNb3VzZVggPSBjYW52YXNDb29yZHMueDtcbiAgICAgICAgY2FtZXJhLmxhc3RNb3VzZVkgPSBjYW52YXNDb29yZHMueTtcbiAgICAgICAgXG4gICAgICAgIHVwZGF0ZUNhbWVyYUNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIFxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoKSA9PiB7XG4gICAgICBjYW1lcmEuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgIH0pO1xuICBcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCkgPT4ge1xuICAgICAgY2FtZXJhLmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgXG4gICAgLy8gSW1wcm92ZWQgem9vbSB0aGF0IHpvb21zIHRvd2FyZCBjdXJzb3IgcG9zaXRpb25cbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIChlOiBXaGVlbEV2ZW50KSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBcbiAgICAgIC8vIEdldCB3b3JsZCBwb3NpdGlvbiB1bmRlciB0aGUgY3Vyc29yIGJlZm9yZSB6b29tXG4gICAgICBjb25zdCBtb3VzZVdvcmxkUG9zID0gc2NyZWVuVG9Xb3JsZChlLmNsaWVudFgsIGUuY2xpZW50WSwgY2FtZXJhLCBjYW52YXMpO1xuICAgICAgXG4gICAgICAvLyBBZGp1c3Qgem9vbSBiYXNlZCBvbiBzY3JvbGwgZGlyZWN0aW9uXG4gICAgICBjb25zdCB6b29tRmFjdG9yID0gZS5kZWx0YVkgPiAwID8gMS4xIDogMC45OyAvLyBab29tIG91dC9pblxuICAgICAgY2FtZXJhLnpvb20gKj0gem9vbUZhY3RvcjtcbiAgICAgIFxuICAgICAgLy8gQ2xhbXAgem9vbSB0byByZWFzb25hYmxlIGxpbWl0c1xuICAgICAgY2FtZXJhLnpvb20gPSBNYXRoLm1heCgwLjEsIE1hdGgubWluKDEwLjAsIGNhbWVyYS56b29tKSk7XG4gICAgICBcbiAgICAgIC8vIEdldCBuZXcgd29ybGQgcG9zaXRpb24gdW5kZXIgY3Vyc29yIGFmdGVyIHpvb20gY2hhbmdlXG4gICAgICBjb25zdCBuZXdNb3VzZVdvcmxkUG9zID0gc2NyZWVuVG9Xb3JsZChlLmNsaWVudFgsIGUuY2xpZW50WSwgY2FtZXJhLCBjYW52YXMpO1xuICAgICAgXG4gICAgICAvLyBBZGp1c3QgY2FtZXJhIHBvc2l0aW9uIHRvIGtlZXAgY3Vyc29yIG92ZXIgdGhlIHNhbWUgd29ybGQgcG9pbnRcbiAgICAgIGNhbWVyYS54ICs9IChtb3VzZVdvcmxkUG9zLnggLSBuZXdNb3VzZVdvcmxkUG9zLngpO1xuICAgICAgY2FtZXJhLnkgKz0gKG1vdXNlV29ybGRQb3MueSAtIG5ld01vdXNlV29ybGRQb3MueSk7XG4gICAgICBcbiAgICAgIHVwZGF0ZUNhbWVyYUNhbGxiYWNrKCk7XG4gICAgfSwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcbiAgfSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHNoYWRlckNvZGUgZnJvbSBcIi4vdHJpYW5nbGUud2dzbFwiO1xuaW1wb3J0IHsgXG4gICAgY3JlYXRlQ2FtZXJhLCBcbiAgICBzZXR1cENhbWVyYUNvbnRyb2xzIFxufSBmcm9tIFwiLi9jYW1lcmFcIjtcblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcbiAgICBjb25zdCBpbmZvRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5mbyBwcmVcIik7XG4gICAgdmFyIGRpc3BsYXlFcnJvciA9IGZhbHNlO1xuICAgIFxuICAgIGlmIChuYXZpZ2F0b3IuZ3B1ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGlzcGxheUVycm9yID0gdHJ1ZTtcbiAgICAgICAgaWYgKGluZm9FbGVtZW50KSB7XG4gICAgICAgICAgICBpbmZvRWxlbWVudC50ZXh0Q29udGVudCA9IFwiV2ViR1BVIGlzIG5vdCBzdXBwb3J0ZWQgaW4geW91ciBicm93c2VyLlwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgV2ViR1BVIHN1cHBvcnRcbiAgICBpZiAoIW5hdmlnYXRvci5ncHUpIHtcbiAgICAgICAgZGlzcGxheUVycm9yID0gdHJ1ZTtcbiAgICAgICAgaWYgKGluZm9FbGVtZW50KSB7XG4gICAgICAgICAgICBpbmZvRWxlbWVudC50ZXh0Q29udGVudCA9IFwiV2ViR1BVIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBicm93c2VyLlwiO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIldlYkdQVSBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgYnJvd3Nlci5cIik7XG4gICAgfVxuXG4gICAgLy8gUmVxdWVzdCBhbiBhZGFwdGVyXG4gICAgY29uc3QgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIoKTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgZGlzcGxheUVycm9yID0gdHJ1ZTtcbiAgICAgICAgaWYgKGluZm9FbGVtZW50KSB7XG4gICAgICAgICAgICBpbmZvRWxlbWVudC50ZXh0Q29udGVudCA9IFwiTm8gYXBwcm9wcmlhdGUgR1BVIGFkYXB0ZXIgZm91bmQuXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYXBwcm9wcmlhdGUgR1BVIGFkYXB0ZXIgZm91bmQuXCIpO1xuICAgIH1cblxuICAgIGlmIChkaXNwbGF5RXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJObyBXZWJHUFUgRGV2aWNlIGF2YWlsYWJsZS5cIik7XG4gICAgICAgIGFsZXJ0KFwiV2ViR1BVIGlzIG5vdCBzdXBwb3J0ZWQgaW4geW91ciBicm93c2VyISBWaXNpdCBodHRwczovL3dlYmdwdXJlcG9ydC5vcmcvIGZvciBpbmZvIGFib3V0IHlvdXIgc3lzdGVtLlwiKVxuICAgIH1cblxuICAgIC8vIENhbnZhcyBhbmQgZGV2aWNlIHNldHVwXG4gICAgY29uc3QgZGV2aWNlID0gYXdhaXQgYWRhcHRlci5yZXF1ZXN0RGV2aWNlKCk7XG4gICAgaWYgKCFkZXZpY2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJXZWJHUFUgbm90IHN1cHBvcnRlZFwiKTtcbiAgICAgICAgYWxlcnQoXCJXZWJHUFUgbm90IHN1cHBvcnRlZFwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBDb25maWd1cmUgcmVuZGVyaW5nIGNvbnRleHRcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndlYmdwdS1jYW52YXNcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwid2ViZ3B1XCIpIGFzIEdQVUNhbnZhc0NvbnRleHQ7XG4gICAgY29uc3QgZm9ybWF0ID0gbmF2aWdhdG9yLmdwdS5nZXRQcmVmZXJyZWRDYW52YXNGb3JtYXQoKTtcbiAgICBjb250ZXh0LmNvbmZpZ3VyZSh7XG4gICAgICAgIGRldmljZSxcbiAgICAgICAgZm9ybWF0LFxuICAgIH0pO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBjYW1lcmFcbiAgICBjb25zdCBjYW1lcmEgPSBjcmVhdGVDYW1lcmEoKTtcblxuICAgIC8vIFRyaWFuZ2xlIGludGVyZmFjZVxuICAgIGludGVyZmFjZSBUcmlhbmdsZSB7XG4gICAgICAgIHg6IG51bWJlcjtcbiAgICAgICAgeTogbnVtYmVyO1xuICAgICAgICBjb2xvcjogbnVtYmVyW107XG4gICAgfVxuICAgIGxldCB0cmlhbmdsZUJ1ZmZlciA6IEdQVUJ1ZmZlcjtcblxuICAgIC8vIEdlbmVyYXRlIDUgcmFuZG9tIHRyaWFuZ2xlc1xuICAgIGZ1bmN0aW9uIGdlbmVyYXRlVHJpYW5nbGVzKCkge1xuICAgICAgICBjb25zdCB0cmlhbmdsZXMgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiA1IH0sICgpID0+ICh7XG4gICAgICAgICAgICB4OiBNYXRoLnJhbmRvbSgpICogMS4yIC0gMC42LFxuICAgICAgICAgICAgeTogTWF0aC5yYW5kb20oKSAqIDEuMiAtIDAuNixcbiAgICAgICAgICAgIGNvbG9yOiBbXG4gICAgICAgICAgICAgICAgTWF0aC5yYW5kb20oKSxcbiAgICAgICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxuICAgICAgICAgICAgICAgIE1hdGgucmFuZG9tKCksXG4gICAgICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0cmlhbmdsZXM7XG4gICAgfVxuXG4gICAgLy8gU2V0IHVwIHRyaWFuZ2xlIGRhdGFcbiAgICBmdW5jdGlvbiB1cGRhdGVUcmlhbmdsZUJ1ZmZlcih0cmlhbmdsZXMgOiBUcmlhbmdsZVtdLCBkZXZpY2UgOiBHUFVEZXZpY2UpIHtcbiAgICAgICAgY29uc3QgdHJpYW5nbGVEYXRhID0gbmV3IEZsb2F0MzJBcnJheSh0cmlhbmdsZXMubGVuZ3RoICogOCk7XG4gICAgICAgIHRyaWFuZ2xlcy5mb3JFYWNoKCh0cmlhbmdsZSA6IFRyaWFuZ2xlLCBpIDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBpICogODtcbiAgICAgICAgICAgIHRyaWFuZ2xlRGF0YVtvZmZzZXRdID0gdHJpYW5nbGUueDtcbiAgICAgICAgICAgIHRyaWFuZ2xlRGF0YVtvZmZzZXQgKyAxXSA9IHRyaWFuZ2xlLnk7XG4gICAgICAgICAgICB0cmlhbmdsZURhdGFbb2Zmc2V0ICsgMl0gPSAwLjA7XG4gICAgICAgICAgICB0cmlhbmdsZURhdGFbb2Zmc2V0ICsgM10gPSAwLjA7XG4gICAgICAgICAgICB0cmlhbmdsZURhdGFbb2Zmc2V0ICsgNF0gPSB0cmlhbmdsZS5jb2xvclswXTtcbiAgICAgICAgICAgIHRyaWFuZ2xlRGF0YVtvZmZzZXQgKyA1XSA9IHRyaWFuZ2xlLmNvbG9yWzFdO1xuICAgICAgICAgICAgdHJpYW5nbGVEYXRhW29mZnNldCArIDZdID0gdHJpYW5nbGUuY29sb3JbMl07XG4gICAgICAgICAgICB0cmlhbmdsZURhdGFbb2Zmc2V0ICsgN10gPSB0cmlhbmdsZS5jb2xvclszXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0cmlhbmdsZUJ1ZmZlcikge1xuICAgICAgICAgICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKHRyaWFuZ2xlQnVmZmVyLCAwLCB0cmlhbmdsZURhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJpYW5nbGVCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgICAgICAgICBzaXplOiB0cmlhbmdsZURhdGEuYnl0ZUxlbmd0aCxcbiAgICAgICAgICAgICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICAgICAgICAgICAgICAgIG1hcHBlZEF0Q3JlYXRpb246IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG5ldyBGbG9hdDMyQXJyYXkodHJpYW5nbGVCdWZmZXIuZ2V0TWFwcGVkUmFuZ2UoKSkuc2V0KHRyaWFuZ2xlRGF0YSk7XG4gICAgICAgICAgICB0cmlhbmdsZUJ1ZmZlci51bm1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cmlhbmdsZUJ1ZmZlcjtcbiAgICB9XG5cbiAgICBsZXQgdHJpYW5nbGVzID0gZ2VuZXJhdGVUcmlhbmdsZXMoKTtcbiAgICB0cmlhbmdsZUJ1ZmZlciA9IHVwZGF0ZVRyaWFuZ2xlQnVmZmVyKHRyaWFuZ2xlcywgZGV2aWNlKTtcblxuICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lciBmb3IgcmFuZG9taXplIGJ1dHRvblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmFuZG9taXplLWJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICB0cmlhbmdsZXMgPSBnZW5lcmF0ZVRyaWFuZ2xlcygpO1xuICAgICAgICB1cGRhdGVUcmlhbmdsZUJ1ZmZlcih0cmlhbmdsZXMsIGRldmljZSk7XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYSB1bmlmb3JtIGJ1ZmZlciBmb3IgY2FtZXJhIGRhdGEgLSBub3cgd2l0aCBwcm9wZXIgc2l6ZVxuICAgIC8vIFdlIG5lZWQgMyBmbG9hdDMyIHZhbHVlcyAoMTIgYnl0ZXMpIGJ1dCBtdXN0IGFsaWduIHRvIDE2IGJ5dGVzIGZvciBXZWJHUFVcbiAgICBjb25zdCBjYW1lcmFVbmlmb3JtQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICAgIHNpemU6IDE2LCAvLyBQcm9wZXJseSBhbGlnbmVkIHNpemUgZm9yIDMgZmxvYXRzICh4LCB5LCB6b29tKVxuICAgICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIGNhbWVyYSB1bmlmb3Jtc1xuICAgIGZ1bmN0aW9uIHVwZGF0ZUNhbWVyYVVuaWZvcm0oKTogdm9pZCB7XG4gICAgICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihcbiAgICAgICAgY2FtZXJhVW5pZm9ybUJ1ZmZlcixcbiAgICAgICAgMCxcbiAgICAgICAgbmV3IEZsb2F0MzJBcnJheShbY2FtZXJhLngsIGNhbWVyYS55LCBjYW1lcmEuem9vbSwgMC4wXSkgLy8gQWRkIHBhZGRpbmcgZm9yIGFsaWdubWVudFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbWVyYVVuaWZvcm0oKTtcbiAgICBzZXR1cENhbWVyYUNvbnRyb2xzKGNhbnZhcywgY2FtZXJhLCB1cGRhdGVDYW1lcmFVbmlmb3JtKTtcblxuICAgIC8vIENyZWF0ZSBiaW5kIGdyb3VwIGxheW91dCAobm93IHdpdGggY2FtZXJhIHVuaWZvcm0gYnVmZmVyKVxuICAgIGNvbnN0IGJpbmRHcm91cExheW91dCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXBMYXlvdXQoe1xuICAgICAgICBlbnRyaWVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJpbmRpbmc6IDAsXG4gICAgICAgICAgICB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5WRVJURVggfCBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVCxcbiAgICAgICAgICAgIGJ1ZmZlcjogeyB0eXBlOiBcInJlYWQtb25seS1zdG9yYWdlXCIgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBiaW5kaW5nOiAxLFxuICAgICAgICAgICAgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuVkVSVEVYLFxuICAgICAgICAgICAgYnVmZmVyOiB7IHR5cGU6IFwidW5pZm9ybVwiIH1cbiAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSk7XG5cbiAgICBjb25zdCBiaW5kR3JvdXAgPSBkZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICAgICAgbGF5b3V0OiBiaW5kR3JvdXBMYXlvdXQsXG4gICAgICAgIGVudHJpZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmluZGluZzogMCxcbiAgICAgICAgICAgIHJlc291cmNlOiB7IGJ1ZmZlcjogdHJpYW5nbGVCdWZmZXIgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBiaW5kaW5nOiAxLFxuICAgICAgICAgICAgcmVzb3VyY2U6IHsgYnVmZmVyOiBjYW1lcmFVbmlmb3JtQnVmZmVyIH1cbiAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgc2hhZGVyIG1vZHVsZVxuICAgIGNvbnN0IHNoYWRlck1vZHVsZSA9IGRldmljZS5jcmVhdGVTaGFkZXJNb2R1bGUoe1xuICAgICAgICBjb2RlOiBzaGFkZXJDb2RlXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgcGlwZWxpbmVcbiAgICBjb25zdCBwaXBlbGluZSA9IGRldmljZS5jcmVhdGVSZW5kZXJQaXBlbGluZSh7XG4gICAgICAgIGxheW91dDogZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICAgICAgYmluZEdyb3VwTGF5b3V0czogW2JpbmRHcm91cExheW91dF1cbiAgICAgICAgfSksXG4gICAgICAgIHZlcnRleDoge1xuICAgICAgICBtb2R1bGU6IHNoYWRlck1vZHVsZSxcbiAgICAgICAgZW50cnlQb2ludDogXCJ2ZXJ0ZXhNYWluXCJcbiAgICAgICAgfSxcbiAgICAgICAgZnJhZ21lbnQ6IHtcbiAgICAgICAgbW9kdWxlOiBzaGFkZXJNb2R1bGUsXG4gICAgICAgIGVudHJ5UG9pbnQ6IFwiZnJhZ21lbnRNYWluXCIsXG4gICAgICAgIHRhcmdldHM6IFt7IGZvcm1hdCB9XVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBSZW5kZXIgZnVuY3Rpb25cbiAgICBmdW5jdGlvbiByZW5kZXIoKTogdm9pZCB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjb21tYW5kRW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgICAgICBjb25zdCBwYXNzID0gY29tbWFuZEVuY29kZXIuYmVnaW5SZW5kZXJQYXNzKHtcbiAgICAgICAgY29sb3JBdHRhY2htZW50czogW3tcbiAgICAgICAgICAgIHZpZXc6IGNvbnRleHQuZ2V0Q3VycmVudFRleHR1cmUoKS5jcmVhdGVWaWV3KCksXG4gICAgICAgICAgICBsb2FkT3A6IFwiY2xlYXJcIixcbiAgICAgICAgICAgIHN0b3JlT3A6IFwic3RvcmVcIixcbiAgICAgICAgICAgIGNsZWFyVmFsdWU6IHsgcjogMS4wLCBnOiAxLjAsIGI6IDEuMCwgYTogMS4wIH1cbiAgICAgICAgfV1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHBpcGVsaW5lKTtcbiAgICAgICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwKTtcbiAgICAgICAgcGFzcy5kcmF3KDMsIHRyaWFuZ2xlcy5sZW5ndGgpOyAvLyAzIHZlcnRpY2VzIHBlciB0cmlhbmdsZVxuICAgICAgICBwYXNzLmVuZCgpO1xuICAgICAgICBcbiAgICAgICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbY29tbWFuZEVuY29kZXIuZmluaXNoKCldKTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk7XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBtYWluKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=