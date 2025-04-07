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
        // Canvas and device setup
        const device = yield navigator.gpu.requestAdapter().then(adapter => adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
        if (!device) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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aUJBQWlCLEVBQUUsQ0FBQyxVQUFVLEVBQUU7d0JBQzlDLE1BQU0sRUFBRSxPQUFPO3dCQUNmLE9BQU8sRUFBRSxPQUFPO3dCQUNoQixVQUFVLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFO3FCQUNqRCxDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQywwQkFBMEI7WUFDMUQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBRVgsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9DLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxNQUFNLEVBQUUsQ0FBQztJQUNiLENBQUM7Q0FBQTtBQUVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyLy4vc3JjL2NhbWVyYS50cyIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci8uL3NyYy90cmlhbmdsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDYW1lcmEgc3RhdGUgYW5kIHV0aWxpdHkgZnVuY3Rpb25zXG5leHBvcnQgaW50ZXJmYWNlIENhbWVyYSB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICB6b29tOiBudW1iZXI7XG4gICAgaXNEcmFnZ2luZzogYm9vbGVhbjtcbiAgICBsYXN0TW91c2VYOiBudW1iZXI7XG4gICAgbGFzdE1vdXNlWTogbnVtYmVyO1xuICB9XG4gIFxuICBleHBvcnQgaW50ZXJmYWNlIENhbnZhc0RpbWVuc2lvbnMge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgcmVjdDogRE9NUmVjdDtcbiAgfVxuICBcbiAgZXhwb3J0IGludGVyZmFjZSBQb2ludCB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgfVxuICBcbiAgZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNhbWVyYSgpOiBDYW1lcmEge1xuICAgIHJldHVybiB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIHpvb206IDEuMCxcbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgbGFzdE1vdXNlWDogMCxcbiAgICAgIGxhc3RNb3VzZVk6IDBcbiAgICB9O1xuICB9XG4gIFxuICAvLyBHZXQgY2FudmFzIGRpbWVuc2lvbnNcbiAgZXhwb3J0IGZ1bmN0aW9uIGdldENhbnZhc0RpbWVuc2lvbnMoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IENhbnZhc0RpbWVuc2lvbnMge1xuICAgIHJldHVybiB7IFxuICAgICAgd2lkdGg6IGNhbnZhcy53aWR0aCwgXG4gICAgICBoZWlnaHQ6IGNhbnZhcy5oZWlnaHQsXG4gICAgICByZWN0OiBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICB9O1xuICB9XG4gIFxuICAvLyBDb252ZXJ0IHNjcmVlbiBjb29yZGluYXRlcyB0byBjYW52YXMgY29vcmRpbmF0ZXNcbiAgZXhwb3J0IGZ1bmN0aW9uIGdldENhbnZhc0Nvb3JkaW5hdGVzKFxuICAgIHNjcmVlblg6IG51bWJlciwgXG4gICAgc2NyZWVuWTogbnVtYmVyLCBcbiAgICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50XG4gICk6IFBvaW50IHtcbiAgICBjb25zdCBkaW1lbnNpb25zID0gZ2V0Q2FudmFzRGltZW5zaW9ucyhjYW52YXMpO1xuICAgIGNvbnN0IHJlY3QgPSBkaW1lbnNpb25zLnJlY3Q7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHNjcmVlblggLSByZWN0LmxlZnQsXG4gICAgICB5OiBzY3JlZW5ZIC0gcmVjdC50b3BcbiAgICB9O1xuICB9XG4gIFxuICAvLyBDb252ZXJ0IGNhbnZhcyBjb29yZGluYXRlcyB0byBub3JtYWxpemVkIGRldmljZSBjb29yZGluYXRlcyAoLTEgdG8gMSlcbiAgZXhwb3J0IGZ1bmN0aW9uIGNhbnZhc1RvTkRDKFxuICAgIGNhbnZhc1g6IG51bWJlciwgXG4gICAgY2FudmFzWTogbnVtYmVyLCBcbiAgICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50XG4gICk6IFBvaW50IHtcbiAgICBjb25zdCBkaW1lbnNpb25zID0gZ2V0Q2FudmFzRGltZW5zaW9ucyhjYW52YXMpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICB4OiAoY2FudmFzWCAvIGRpbWVuc2lvbnMud2lkdGgpICogMiAtIDEsXG4gICAgICB5OiAtKChjYW52YXNZIC8gZGltZW5zaW9ucy5oZWlnaHQpICogMiAtIDEpIC8vIEZsaXAgWSBheGlzXG4gICAgfTtcbiAgfVxuICBcbiAgLy8gQ29udmVydCBub3JtYWxpemVkIGRldmljZSBjb29yZGluYXRlcyB0byB3b3JsZCBjb29yZGluYXRlc1xuICBleHBvcnQgZnVuY3Rpb24gbmRjVG9Xb3JsZChcbiAgICBuZGNYOiBudW1iZXIsIFxuICAgIG5kY1k6IG51bWJlciwgXG4gICAgY2FtZXJhOiBDYW1lcmFcbiAgKTogUG9pbnQge1xuICAgIHJldHVybiB7XG4gICAgICB4OiBuZGNYICogY2FtZXJhLnpvb20gKyBjYW1lcmEueCxcbiAgICAgIHk6IG5kY1kgKiBjYW1lcmEuem9vbSArIGNhbWVyYS55XG4gICAgfTtcbiAgfVxuICBcbiAgLy8gQ29udmVydCBzY3JlZW4gY29vcmRpbmF0ZXMgdG8gd29ybGQgY29vcmRpbmF0ZXNcbiAgZXhwb3J0IGZ1bmN0aW9uIHNjcmVlblRvV29ybGQoXG4gICAgc2NyZWVuWDogbnVtYmVyLCBcbiAgICBzY3JlZW5ZOiBudW1iZXIsIFxuICAgIGNhbWVyYTogQ2FtZXJhLCBcbiAgICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50XG4gICk6IFBvaW50IHtcbiAgICBjb25zdCBjYW52YXNDb29yZHMgPSBnZXRDYW52YXNDb29yZGluYXRlcyhzY3JlZW5YLCBzY3JlZW5ZLCBjYW52YXMpO1xuICAgIGNvbnN0IG5kY0Nvb3JkcyA9IGNhbnZhc1RvTkRDKGNhbnZhc0Nvb3Jkcy54LCBjYW52YXNDb29yZHMueSwgY2FudmFzKTtcbiAgICByZXR1cm4gbmRjVG9Xb3JsZChuZGNDb29yZHMueCwgbmRjQ29vcmRzLnksIGNhbWVyYSk7XG4gIH1cbiAgXG4gIC8vIFNldHVwIGNhbWVyYSBldmVudCBsaXN0ZW5lcnNcbiAgZXhwb3J0IGZ1bmN0aW9uIHNldHVwQ2FtZXJhQ29udHJvbHMoXG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgXG4gICAgY2FtZXJhOiBDYW1lcmEsIFxuICAgIHVwZGF0ZUNhbWVyYUNhbGxiYWNrOiAoKSA9PiB2b2lkXG4gICk6IHZvaWQge1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICBjYW1lcmEuaXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICBjb25zdCBjYW52YXNDb29yZHMgPSBnZXRDYW52YXNDb29yZGluYXRlcyhlLmNsaWVudFgsIGUuY2xpZW50WSwgY2FudmFzKTtcbiAgICAgIGNhbWVyYS5sYXN0TW91c2VYID0gY2FudmFzQ29vcmRzLng7XG4gICAgICBjYW1lcmEubGFzdE1vdXNlWSA9IGNhbnZhc0Nvb3Jkcy55O1xuICAgIH0pO1xuICBcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgaWYgKGNhbWVyYS5pc0RyYWdnaW5nKSB7XG4gICAgICAgIC8vIEdldCBjYW52YXMtcmVsYXRpdmUgY29vcmRpbmF0ZXNcbiAgICAgICAgY29uc3QgY2FudmFzQ29vcmRzID0gZ2V0Q2FudmFzQ29vcmRpbmF0ZXMoZS5jbGllbnRYLCBlLmNsaWVudFksIGNhbnZhcyk7XG4gICAgICAgIFxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNoYW5nZSBpbiBtb3VzZSBwb3NpdGlvbiB3aXRoaW4gY2FudmFzXG4gICAgICAgIGNvbnN0IGR4ID0gY2FudmFzQ29vcmRzLnggLSBjYW1lcmEubGFzdE1vdXNlWDtcbiAgICAgICAgY29uc3QgZHkgPSBjYW52YXNDb29yZHMueSAtIGNhbWVyYS5sYXN0TW91c2VZO1xuICAgICAgICBcbiAgICAgICAgLy8gQ29udmVydCBwaXhlbCBtb3ZlbWVudCB0byB3b3JsZCBzcGFjZSBtb3ZlbWVudCAoYWNjb3VudGluZyBmb3Igem9vbSlcbiAgICAgICAgY29uc3QgZGltZW5zaW9ucyA9IGdldENhbnZhc0RpbWVuc2lvbnMoY2FudmFzKTtcbiAgICAgICAgY29uc3Qgd29ybGREeCA9IChkeCAvIGRpbWVuc2lvbnMud2lkdGgpICogMiAqIGNhbWVyYS56b29tO1xuICAgICAgICBjb25zdCB3b3JsZER5ID0gLShkeSAvIGRpbWVuc2lvbnMuaGVpZ2h0KSAqIDIgKiBjYW1lcmEuem9vbTsgLy8gRmxpcCBZXG4gICAgICAgIFxuICAgICAgICAvLyBVcGRhdGUgY2FtZXJhIHBvc2l0aW9uXG4gICAgICAgIGNhbWVyYS54IC09IHdvcmxkRHg7XG4gICAgICAgIGNhbWVyYS55IC09IHdvcmxkRHk7XG4gICAgICAgIFxuICAgICAgICAvLyBVcGRhdGUgbGFzdCBtb3VzZSBwb3NpdGlvblxuICAgICAgICBjYW1lcmEubGFzdE1vdXNlWCA9IGNhbnZhc0Nvb3Jkcy54O1xuICAgICAgICBjYW1lcmEubGFzdE1vdXNlWSA9IGNhbnZhc0Nvb3Jkcy55O1xuICAgICAgICBcbiAgICAgICAgdXBkYXRlQ2FtZXJhQ2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsICgpID0+IHtcbiAgICAgIGNhbWVyYS5pc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIFxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgICBjYW1lcmEuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgIH0pO1xuICBcbiAgICAvLyBJbXByb3ZlZCB6b29tIHRoYXQgem9vbXMgdG93YXJkIGN1cnNvciBwb3NpdGlvblxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgKGU6IFdoZWVsRXZlbnQpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIFxuICAgICAgLy8gR2V0IHdvcmxkIHBvc2l0aW9uIHVuZGVyIHRoZSBjdXJzb3IgYmVmb3JlIHpvb21cbiAgICAgIGNvbnN0IG1vdXNlV29ybGRQb3MgPSBzY3JlZW5Ub1dvcmxkKGUuY2xpZW50WCwgZS5jbGllbnRZLCBjYW1lcmEsIGNhbnZhcyk7XG4gICAgICBcbiAgICAgIC8vIEFkanVzdCB6b29tIGJhc2VkIG9uIHNjcm9sbCBkaXJlY3Rpb25cbiAgICAgIGNvbnN0IHpvb21GYWN0b3IgPSBlLmRlbHRhWSA+IDAgPyAxLjEgOiAwLjk7IC8vIFpvb20gb3V0L2luXG4gICAgICBjYW1lcmEuem9vbSAqPSB6b29tRmFjdG9yO1xuICAgICAgXG4gICAgICAvLyBDbGFtcCB6b29tIHRvIHJlYXNvbmFibGUgbGltaXRzXG4gICAgICBjYW1lcmEuem9vbSA9IE1hdGgubWF4KDAuMSwgTWF0aC5taW4oMTAuMCwgY2FtZXJhLnpvb20pKTtcbiAgICAgIFxuICAgICAgLy8gR2V0IG5ldyB3b3JsZCBwb3NpdGlvbiB1bmRlciBjdXJzb3IgYWZ0ZXIgem9vbSBjaGFuZ2VcbiAgICAgIGNvbnN0IG5ld01vdXNlV29ybGRQb3MgPSBzY3JlZW5Ub1dvcmxkKGUuY2xpZW50WCwgZS5jbGllbnRZLCBjYW1lcmEsIGNhbnZhcyk7XG4gICAgICBcbiAgICAgIC8vIEFkanVzdCBjYW1lcmEgcG9zaXRpb24gdG8ga2VlcCBjdXJzb3Igb3ZlciB0aGUgc2FtZSB3b3JsZCBwb2ludFxuICAgICAgY2FtZXJhLnggKz0gKG1vdXNlV29ybGRQb3MueCAtIG5ld01vdXNlV29ybGRQb3MueCk7XG4gICAgICBjYW1lcmEueSArPSAobW91c2VXb3JsZFBvcy55IC0gbmV3TW91c2VXb3JsZFBvcy55KTtcbiAgICAgIFxuICAgICAgdXBkYXRlQ2FtZXJhQ2FsbGJhY2soKTtcbiAgICB9LCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICB9IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgc2hhZGVyQ29kZSBmcm9tIFwiLi90cmlhbmdsZS53Z3NsXCI7XG5pbXBvcnQgeyBcbiAgICBjcmVhdGVDYW1lcmEsIFxuICAgIHNldHVwQ2FtZXJhQ29udHJvbHMgXG59IGZyb20gXCIuL2NhbWVyYVwiO1xuXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuXG4gICAgLy8gQ2FudmFzIGFuZCBkZXZpY2Ugc2V0dXBcbiAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKCkudGhlbihhZGFwdGVyID0+IGFkYXB0ZXI/LnJlcXVlc3REZXZpY2UoKSk7XG4gICAgaWYgKCFkZXZpY2UpIHtcbiAgICAgICAgYWxlcnQoXCJXZWJHUFUgbm90IHN1cHBvcnRlZFwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENvbmZpZ3VyZSByZW5kZXJpbmcgY29udGV4dFxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViZ3B1LWNhbnZhc1wiKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCJ3ZWJncHVcIikgYXMgR1BVQ2FudmFzQ29udGV4dDtcbiAgICBjb25zdCBmb3JtYXQgPSBuYXZpZ2F0b3IuZ3B1LmdldFByZWZlcnJlZENhbnZhc0Zvcm1hdCgpO1xuICAgIGNvbnRleHQuY29uZmlndXJlKHtcbiAgICAgICAgZGV2aWNlLFxuICAgICAgICBmb3JtYXQsXG4gICAgfSk7XG5cbiAgICAvLyBJbml0aWFsaXplIGNhbWVyYVxuICAgIGNvbnN0IGNhbWVyYSA9IGNyZWF0ZUNhbWVyYSgpO1xuXG4gICAgLy8gVHJpYW5nbGUgaW50ZXJmYWNlXG4gICAgaW50ZXJmYWNlIFRyaWFuZ2xlIHtcbiAgICAgICAgeDogbnVtYmVyO1xuICAgICAgICB5OiBudW1iZXI7XG4gICAgICAgIGNvbG9yOiBudW1iZXJbXTtcbiAgICB9XG4gICAgbGV0IHRyaWFuZ2xlQnVmZmVyIDogR1BVQnVmZmVyO1xuXG4gICAgLy8gR2VuZXJhdGUgNSByYW5kb20gdHJpYW5nbGVzXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVUcmlhbmdsZXMoKSB7XG4gICAgICAgIGNvbnN0IHRyaWFuZ2xlcyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDUgfSwgKCkgPT4gKHtcbiAgICAgICAgICAgIHg6IE1hdGgucmFuZG9tKCkgKiAxLjIgLSAwLjYsXG4gICAgICAgICAgICB5OiBNYXRoLnJhbmRvbSgpICogMS4yIC0gMC42LFxuICAgICAgICAgICAgY29sb3I6IFtcbiAgICAgICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxuICAgICAgICAgICAgICAgIE1hdGgucmFuZG9tKCksXG4gICAgICAgICAgICAgICAgTWF0aC5yYW5kb20oKSxcbiAgICAgICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSkpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRyaWFuZ2xlcztcbiAgICB9XG5cbiAgICAvLyBTZXQgdXAgdHJpYW5nbGUgZGF0YVxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRyaWFuZ2xlQnVmZmVyKHRyaWFuZ2xlcyA6IFRyaWFuZ2xlW10sIGRldmljZSA6IEdQVURldmljZSkge1xuICAgICAgICBjb25zdCB0cmlhbmdsZURhdGEgPSBuZXcgRmxvYXQzMkFycmF5KHRyaWFuZ2xlcy5sZW5ndGggKiA4KTtcbiAgICAgICAgdHJpYW5nbGVzLmZvckVhY2goKHRyaWFuZ2xlIDogVHJpYW5nbGUsIGkgOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IGkgKiA4O1xuICAgICAgICAgICAgdHJpYW5nbGVEYXRhW29mZnNldF0gPSB0cmlhbmdsZS54O1xuICAgICAgICAgICAgdHJpYW5nbGVEYXRhW29mZnNldCArIDFdID0gdHJpYW5nbGUueTtcbiAgICAgICAgICAgIHRyaWFuZ2xlRGF0YVtvZmZzZXQgKyAyXSA9IDAuMDtcbiAgICAgICAgICAgIHRyaWFuZ2xlRGF0YVtvZmZzZXQgKyAzXSA9IDAuMDtcbiAgICAgICAgICAgIHRyaWFuZ2xlRGF0YVtvZmZzZXQgKyA0XSA9IHRyaWFuZ2xlLmNvbG9yWzBdO1xuICAgICAgICAgICAgdHJpYW5nbGVEYXRhW29mZnNldCArIDVdID0gdHJpYW5nbGUuY29sb3JbMV07XG4gICAgICAgICAgICB0cmlhbmdsZURhdGFbb2Zmc2V0ICsgNl0gPSB0cmlhbmdsZS5jb2xvclsyXTtcbiAgICAgICAgICAgIHRyaWFuZ2xlRGF0YVtvZmZzZXQgKyA3XSA9IHRyaWFuZ2xlLmNvbG9yWzNdO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRyaWFuZ2xlQnVmZmVyKSB7XG4gICAgICAgICAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIodHJpYW5nbGVCdWZmZXIsIDAsIHRyaWFuZ2xlRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cmlhbmdsZUJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgICAgICAgICAgIHNpemU6IHRyaWFuZ2xlRGF0YS5ieXRlTGVuZ3RoLFxuICAgICAgICAgICAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgICAgICAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbmV3IEZsb2F0MzJBcnJheSh0cmlhbmdsZUJ1ZmZlci5nZXRNYXBwZWRSYW5nZSgpKS5zZXQodHJpYW5nbGVEYXRhKTtcbiAgICAgICAgICAgIHRyaWFuZ2xlQnVmZmVyLnVubWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRyaWFuZ2xlQnVmZmVyO1xuICAgIH1cblxuICAgIGxldCB0cmlhbmdsZXMgPSBnZW5lcmF0ZVRyaWFuZ2xlcygpO1xuICAgIHRyaWFuZ2xlQnVmZmVyID0gdXBkYXRlVHJpYW5nbGVCdWZmZXIodHJpYW5nbGVzLCBkZXZpY2UpO1xuXG4gICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyIGZvciByYW5kb21pemUgYnV0dG9uXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyYW5kb21pemUtYnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIHRyaWFuZ2xlcyA9IGdlbmVyYXRlVHJpYW5nbGVzKCk7XG4gICAgICAgIHVwZGF0ZVRyaWFuZ2xlQnVmZmVyKHRyaWFuZ2xlcywgZGV2aWNlKTtcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhIHVuaWZvcm0gYnVmZmVyIGZvciBjYW1lcmEgZGF0YSAtIG5vdyB3aXRoIHByb3BlciBzaXplXG4gICAgLy8gV2UgbmVlZCAzIGZsb2F0MzIgdmFsdWVzICgxMiBieXRlcykgYnV0IG11c3QgYWxpZ24gdG8gMTYgYnl0ZXMgZm9yIFdlYkdQVVxuICAgIGNvbnN0IGNhbWVyYVVuaWZvcm1CdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgc2l6ZTogMTYsIC8vIFByb3Blcmx5IGFsaWduZWQgc2l6ZSBmb3IgMyBmbG9hdHMgKHgsIHksIHpvb20pXG4gICAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5VTklGT1JNIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgY2FtZXJhIHVuaWZvcm1zXG4gICAgZnVuY3Rpb24gdXBkYXRlQ2FtZXJhVW5pZm9ybSgpOiB2b2lkIHtcbiAgICAgICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKFxuICAgICAgICBjYW1lcmFVbmlmb3JtQnVmZmVyLFxuICAgICAgICAwLFxuICAgICAgICBuZXcgRmxvYXQzMkFycmF5KFtjYW1lcmEueCwgY2FtZXJhLnksIGNhbWVyYS56b29tLCAwLjBdKSAvLyBBZGQgcGFkZGluZyBmb3IgYWxpZ25tZW50XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FtZXJhVW5pZm9ybSgpO1xuICAgIHNldHVwQ2FtZXJhQ29udHJvbHMoY2FudmFzLCBjYW1lcmEsIHVwZGF0ZUNhbWVyYVVuaWZvcm0pO1xuXG4gICAgLy8gQ3JlYXRlIGJpbmQgZ3JvdXAgbGF5b3V0IChub3cgd2l0aCBjYW1lcmEgdW5pZm9ybSBidWZmZXIpXG4gICAgY29uc3QgYmluZEdyb3VwTGF5b3V0ID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgICAgIGVudHJpZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgYmluZGluZzogMCxcbiAgICAgICAgICAgIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLlZFUlRFWCB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5ULFxuICAgICAgICAgICAgYnVmZmVyOiB7IHR5cGU6IFwicmVhZC1vbmx5LXN0b3JhZ2VcIiB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJpbmRpbmc6IDEsXG4gICAgICAgICAgICB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5WRVJURVgsXG4gICAgICAgICAgICBidWZmZXI6IHsgdHlwZTogXCJ1bmlmb3JtXCIgfVxuICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9KTtcblxuICAgIGNvbnN0IGJpbmRHcm91cCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgICBsYXlvdXQ6IGJpbmRHcm91cExheW91dCxcbiAgICAgICAgZW50cmllczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBiaW5kaW5nOiAwLFxuICAgICAgICAgICAgcmVzb3VyY2U6IHsgYnVmZmVyOiB0cmlhbmdsZUJ1ZmZlciB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJpbmRpbmc6IDEsXG4gICAgICAgICAgICByZXNvdXJjZTogeyBidWZmZXI6IGNhbWVyYVVuaWZvcm1CdWZmZXIgfVxuICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBzaGFkZXIgbW9kdWxlXG4gICAgY29uc3Qgc2hhZGVyTW9kdWxlID0gZGV2aWNlLmNyZWF0ZVNoYWRlck1vZHVsZSh7XG4gICAgICAgIGNvZGU6IHNoYWRlckNvZGVcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBwaXBlbGluZVxuICAgIGNvbnN0IHBpcGVsaW5lID0gZGV2aWNlLmNyZWF0ZVJlbmRlclBpcGVsaW5lKHtcbiAgICAgICAgbGF5b3V0OiBkZXZpY2UuY3JlYXRlUGlwZWxpbmVMYXlvdXQoe1xuICAgICAgICBiaW5kR3JvdXBMYXlvdXRzOiBbYmluZEdyb3VwTGF5b3V0XVxuICAgICAgICB9KSxcbiAgICAgICAgdmVydGV4OiB7XG4gICAgICAgIG1vZHVsZTogc2hhZGVyTW9kdWxlLFxuICAgICAgICBlbnRyeVBvaW50OiBcInZlcnRleE1haW5cIlxuICAgICAgICB9LFxuICAgICAgICBmcmFnbWVudDoge1xuICAgICAgICBtb2R1bGU6IHNoYWRlck1vZHVsZSxcbiAgICAgICAgZW50cnlQb2ludDogXCJmcmFnbWVudE1haW5cIixcbiAgICAgICAgdGFyZ2V0czogW3sgZm9ybWF0IH1dXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFJlbmRlciBmdW5jdGlvblxuICAgIGZ1bmN0aW9uIHJlbmRlcigpOiB2b2lkIHtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvbW1hbmRFbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgICAgIGNvbnN0IHBhc3MgPSBjb21tYW5kRW5jb2Rlci5iZWdpblJlbmRlclBhc3Moe1xuICAgICAgICBjb2xvckF0dGFjaG1lbnRzOiBbe1xuICAgICAgICAgICAgdmlldzogY29udGV4dC5nZXRDdXJyZW50VGV4dHVyZSgpLmNyZWF0ZVZpZXcoKSxcbiAgICAgICAgICAgIGxvYWRPcDogXCJjbGVhclwiLFxuICAgICAgICAgICAgc3RvcmVPcDogXCJzdG9yZVwiLFxuICAgICAgICAgICAgY2xlYXJWYWx1ZTogeyByOiAxLjAsIGc6IDEuMCwgYjogMS4wLCBhOiAxLjAgfVxuICAgICAgICB9XVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHBhc3Muc2V0UGlwZWxpbmUocGlwZWxpbmUpO1xuICAgICAgICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXApO1xuICAgICAgICBwYXNzLmRyYXcoMywgdHJpYW5nbGVzLmxlbmd0aCk7IC8vIDMgdmVydGljZXMgcGVyIHRyaWFuZ2xlXG4gICAgICAgIHBhc3MuZW5kKCk7XG4gICAgICAgIFxuICAgICAgICBkZXZpY2UucXVldWUuc3VibWl0KFtjb21tYW5kRW5jb2Rlci5maW5pc2goKV0pO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKTtcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG1haW4pOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==