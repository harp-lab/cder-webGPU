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

/***/ "./src/edge.wgsl":
/*!***********************!*\
  !*** ./src/edge.wgsl ***!
  \***********************/
/***/ ((module) => {

module.exports = "struct Node {\n    pos: vec2f,\n    padding: vec2f,\n    color: vec4f,\n};\n\nstruct Edge {\n    start: u32,\n    end: u32,\n    padding: vec2u\n}\n\nstruct Camera {\n    position: vec2f,\n    zoom: f32,\n    padding: f32,\n};\n\n@group(0) @binding(0) var<storage, read> nodes: array<Node>;\n@group(0) @binding(1) var<storage, read> edges: array<Edge>;\n@group(0) @binding(2) var<uniform> camera: Camera;\n\nstruct VertexOutput {\n    @builtin(position) position: vec4f,\n    @location(0) color: vec4f\n};\n\n@vertex\nfn vertexMain(@builtin(vertex_index) vertexIndex: u32, \n                @builtin(instance_index) instanceIndex: u32) -> VertexOutput {\n    var node = Node();\n    if (vertexIndex == 0) {\n        node = nodes[edges[instanceIndex].start];\n    } else {\n        node = nodes[edges[instanceIndex].end];\n    }\n    var viewPos = (node.pos - camera.position) / camera.zoom;\n    \n    var output: VertexOutput;\n    output.position = vec4f(viewPos, 1.0, 1.0);\n    output.color = node.color;\n    return output;\n}\n\n@fragment\nfn fragmentMain(input: VertexOutput) -> @location(0) vec4f {\n    return input.color;\n}";

/***/ }),

/***/ "./src/forceDirected.ts":
/*!******************************!*\
  !*** ./src/forceDirected.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ForceDirectedLayout: () => (/* binding */ ForceDirectedLayout)
/* harmony export */ });
/* harmony import */ var _forces_wgsl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./forces.wgsl */ "./src/forces.wgsl");

class ForceDirectedLayout {
    constructor(device, nodebuffer, edges, coolingFactor = 0.975) {
        this.adjacencyMatrixBuffer = null;
        this.computePipeline = null;
        this.bindGroup = null;
        this.nodeCount = 0;
        this.iterationCount = 0;
        this.device = device;
        this.nodebuffer = nodebuffer;
        this.edges = edges;
        this.coolingFactor = coolingFactor;
        this.currentCoolingFactor = 0.05; // Initial cooling factor
        // Initialize the adjacency matrix right away
        this.nodeCount = nodebuffer.size / (8 * 4);
        this.createAdjacencyMatrix();
        // Create uniform buffer for parameters
        this.uniformBuffer = this.device.createBuffer({
            size: 16, // 4 float32 values
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        // Update uniform buffer values
        this.updateUniformBuffer();
        // Create compute pipeline
        this.computePipeline = this.device.createComputePipeline({
            layout: "auto",
            compute: {
                module: device.createShaderModule({
                    code: _forces_wgsl__WEBPACK_IMPORTED_MODULE_0__
                }),
                entryPoint: "main",
            },
        });
        // Create bind group
        this.bindGroup = this.device.createBindGroup({
            layout: this.computePipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.nodebuffer,
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.adjacencyMatrixBuffer,
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.uniformBuffer,
                    },
                }
            ]
        });
    }
    // Update uniform buffer with current parameters
    updateUniformBuffer() {
        this.device.queue.writeBuffer(this.uniformBuffer, 0, new Uint32Array([this.nodeCount]), 0, 1);
        this.device.queue.writeBuffer(this.uniformBuffer, 4, new Float32Array([this.currentCoolingFactor, 2 / this.nodeCount]), 0, 2);
    }
    // Set the cooling factor
    setCoolingFactor(newCoolingFactor) {
        this.coolingFactor = newCoolingFactor;
        // Reset the current cooling factor to allow re-running the algorithm
        this.currentCoolingFactor = 0.5;
        this.iterationCount = 0;
        this.updateUniformBuffer();
    }
    // Reset the algorithm
    reset() {
        this.currentCoolingFactor = 0.5;
        this.iterationCount = 0;
        this.updateUniformBuffer();
    }
    // Run a single iteration of force-directed layout
    runForceDirected() {
        // Check if we should stop
        if (this.currentCoolingFactor < 0.0001) {
            return false; // Indicate algorithm has completed
        }
        // Run a compute pass to update node positions
        const commandEncoder = this.device.createCommandEncoder();
        const pass = commandEncoder.beginComputePass();
        pass.setBindGroup(0, this.bindGroup);
        pass.setPipeline(this.computePipeline);
        pass.dispatchWorkgroups(Math.ceil(this.nodeCount / 64), 1, 1);
        pass.end();
        // Update cooling factor
        this.currentCoolingFactor = this.coolingFactor * this.currentCoolingFactor;
        this.device.queue.writeBuffer(this.uniformBuffer, 4, new Float32Array([this.currentCoolingFactor]), 0, 1);
        // Submit command buffer
        this.device.queue.submit([commandEncoder.finish()]);
        // Increment iteration count
        this.iterationCount++;
        return true; // Indicate algorithm is still running
    }
    // Create adjacency matrix from edges
    createAdjacencyMatrix() {
        // Create adjacency matrix as Uint32Array
        const adjacencyMatrixSize = this.nodeCount * this.nodeCount;
        const adjacencyMatrix = new Uint32Array(adjacencyMatrixSize);
        // Fill the adjacency matrix with 0s initially
        adjacencyMatrix.fill(0);
        // For each edge, set the corresponding entries in the adjacency matrix to 1
        for (const edge of this.edges) {
            const startIndex = edge.start * this.nodeCount + edge.end;
            const endIndex = edge.end * this.nodeCount + edge.start;
            adjacencyMatrix[startIndex] = 1;
            adjacencyMatrix[endIndex] = 1;
        }
        // Create a GPU buffer for the adjacency matrix
        this.adjacencyMatrixBuffer = this.device.createBuffer({
            size: adjacencyMatrix.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Uint32Array(this.adjacencyMatrixBuffer.getMappedRange()).set(adjacencyMatrix);
        this.adjacencyMatrixBuffer.unmap();
    }
}


/***/ }),

/***/ "./src/forces.wgsl":
/*!*************************!*\
  !*** ./src/forces.wgsl ***!
  \*************************/
/***/ ((module) => {

module.exports = "struct Node {\n    pos: vec2f,\n    padding: vec2f,\n    color: vec4f,\n};\n\nstruct Uniforms {\n    nodes_length : u32,\n    cooling_factor : f32,\n    ideal_length : f32,\n    padding : u32\n};\n\n@group(0) @binding(0) var<storage, read_write> nodes : array<Node>;\n@group(0) @binding(1) var<storage, read> adjacency_matrix : array<u32>;\n@group(0) @binding(2) var<uniform> uniforms : Uniforms;\n\n@compute @workgroup_size(64, 1, 1)\nfn main(@builtin(global_invocation_id) global_id : vec3<u32>) {\n    if (global_id.x > uniforms.nodes_length) {\n        return;\n    }\n    let l = uniforms.ideal_length;\n    let node = nodes[global_id.x];\n    var force : vec2<f32> = vec2<f32>(0.0, 0.0);\n    for (var i : u32 = 0u; i < uniforms.nodes_length; i = i + 1u) {\n        if (i == global_id.x) {\n            continue;\n        }\n        var node2 = nodes[i];\n        var dist : f32 = distance(node.pos, node2.pos);\n        if (adjacency_matrix[i * uniforms.nodes_length + global_id.x] == 1u) {\n            var dir : vec2<f32> = normalize(node2.pos - node.pos);\n            force += ((dist * dist) / l) * dir;\n        } else {\n            var dir : vec2<f32> = normalize(node.pos - node2.pos);\n            force += ((l * l) / dist) * dir;\n        }\n    }\n    if (length(force) > 0.000000001) {\n        force = normalize(force) * min(uniforms.cooling_factor, length(force));\n    }\n    else{\n        force.x = 0.0;\n        force.y = 0.0;\n    }\n    nodes[global_id.x].pos.x += force.x;\n    nodes[global_id.x].pos.y += force.y;\n}\n";

/***/ }),

/***/ "./src/node.wgsl":
/*!***********************!*\
  !*** ./src/node.wgsl ***!
  \***********************/
/***/ ((module) => {

module.exports = "struct Node {\n    pos: vec2f,\n    padding: vec2f,\n    color: vec4f,\n};\n\nstruct Edge {\n    start: u32,\n    end: u32,\n    padding: vec2u\n}\n\nstruct Camera {\n    position: vec2f,\n    zoom: f32,\n    padding: f32,\n};\n\n@group(0) @binding(0) var<storage, read> nodes: array<Node>;\n@group(0) @binding(1) var<storage, read> edges: array<Edge>;\n@group(0) @binding(2) var<uniform> camera: Camera;\n\nstruct VertexOutput {\n    @builtin(position) position: vec4f,\n    @location(0) color: vec4f,\n    @location(1) @interpolate(flat) center: vec2f,\n    @location(2) pos: vec2f\n};\n\n@vertex\nfn vertexMain(@builtin(vertex_index) vertexIndex: u32, \n                @builtin(instance_index) instanceIndex: u32) -> VertexOutput {\n    // Node vertices (square centered at origin)\n    var positions = array<vec2f, 6>(\n        vec2f(-0.02, -0.02),\n        vec2f(0.02, -0.02),\n        vec2f(0.02, 0.02),\n        vec2f(-0.02, 0.02),\n        vec2f(-0.02, -0.02),\n        vec2f(0.02, 0.02)\n    );\n    var testEdge = edges[0];\n    \n    // Proper camera transform for zooming\n    // 1. Apply object position (square center)\n    // 2. Subtract camera position to move camera\n    // 3. Apply zoom (divide by zoom factor to make objects appear smaller when zooming out)\n    var worldPos = positions[vertexIndex] + nodes[instanceIndex].pos;\n    var viewPos = (worldPos - camera.position) / camera.zoom;\n    \n    var output: VertexOutput;\n    output.position = vec4f(viewPos, 0.0, 1.0);\n    output.color = nodes[instanceIndex].color;\n    output.pos = worldPos;\n    output.center = nodes[instanceIndex].pos;\n    return output;\n}\n\n@fragment\nfn fragmentMain(input: VertexOutput) -> @location(0) vec4f {\n    let dist = distance(input.pos, input.center);\n    if (dist > 0.02) {\n        discard;\n    }\n\n    return input.color;\n}";

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
/*!**********************!*\
  !*** ./src/graph.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_wgsl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node.wgsl */ "./src/node.wgsl");
/* harmony import */ var _edge_wgsl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edge.wgsl */ "./src/edge.wgsl");
/* harmony import */ var _camera__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./camera */ "./src/camera.ts");
/* harmony import */ var _forceDirected__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./forceDirected */ "./src/forceDirected.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




// Global variables for state management
let device;
let context;
let format;
let nodes = [];
let edges = [];
let nodeBuffer;
let edgeBuffer;
let forces;
let animationId = null;
let bindGroup = null;
let startForces = false;
// Configuration options
let numNodes = 10;
let coolingFactor = 0.975;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Canvas and device setup
        const canvas = document.getElementById("webgpu-canvas");
        if (!navigator.gpu) {
            document.getElementById("no-webgpu").style.display = "block";
            return;
        }
        device = yield navigator.gpu.requestAdapter().then(adapter => adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
        if (!device) {
            document.getElementById("no-webgpu").style.display = "block";
            return;
        }
        // Configure context
        context = canvas.getContext("webgpu");
        format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device,
            format,
        });
        // Initialize camera
        const camera = (0,_camera__WEBPACK_IMPORTED_MODULE_2__.createCamera)();
        // Create a uniform buffer for camera data
        const cameraUniformBuffer = device.createBuffer({
            size: 16, // Aligned size for 3 floats (x, y, zoom) + padding
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        // Update camera uniforms
        function updateCameraUniform() {
            device.queue.writeBuffer(cameraUniformBuffer, 0, new Float32Array([camera.x, camera.y, camera.zoom, 0.0]) // Add padding for alignment
            );
        }
        // Initial camera update
        updateCameraUniform();
        // Set up camera controls
        (0,_camera__WEBPACK_IMPORTED_MODULE_2__.setupCameraControls)(canvas, camera, updateCameraUniform);
        // Create bind group layout
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "read-only-storage" }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "read-only-storage" }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" }
                }
            ]
        });
        // Create shader modules
        const nodeShaderModule = device.createShaderModule({
            code: _node_wgsl__WEBPACK_IMPORTED_MODULE_0__
        });
        const edgeShaderModule = device.createShaderModule({
            code: _edge_wgsl__WEBPACK_IMPORTED_MODULE_1__
        });
        // Create pipelines
        const nodePipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            }),
            vertex: {
                module: nodeShaderModule,
                entryPoint: "vertexMain"
            },
            fragment: {
                module: nodeShaderModule,
                entryPoint: "fragmentMain",
                targets: [{ format }]
            }
        });
        const edgePipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            }),
            vertex: {
                module: edgeShaderModule,
                entryPoint: "vertexMain"
            },
            fragment: {
                module: edgeShaderModule,
                entryPoint: "fragmentMain",
                targets: [{ format }]
            },
            primitive: {
                topology: "line-list"
            }
        });
        // Initialize graph
        generateRandomGraph();
        // Set up UI controls
        setupControls();
        // Render function
        function render() {
            if (forces && startForces) {
                forces.runForceDirected();
            }
            const commandEncoder = device.createCommandEncoder();
            const pass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                        view: context.getCurrentTexture().createView(),
                        loadOp: "clear",
                        storeOp: "store",
                        clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }
                    }]
            });
            // Ensure we have a valid bind group before drawing
            if (bindGroup) {
                pass.setPipeline(nodePipeline);
                pass.setBindGroup(0, bindGroup);
                pass.draw(6, nodes.length);
                pass.setPipeline(edgePipeline);
                pass.setBindGroup(0, bindGroup);
                pass.draw(2, edges.length);
            }
            pass.end();
            device.queue.submit([commandEncoder.finish()]);
            // Request next frame
            animationId = requestAnimationFrame(render);
        }
        // Function to generate a random graph
        function generateRandomGraph() {
            // Stop any running animation
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            // Generate random nodes
            nodes = Array.from({ length: numNodes }, () => ({
                // Random position between -0.8 and 0.8 to keep nodes visible
                x: Math.random() * 1.6 - 0.8,
                y: Math.random() * 1.6 - 0.8,
                // Random color with full alpha
                color: [
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    1.0
                ]
            }));
            if (document.getElementById("random-graph-type").checked) {
                // Create a random graph
                edges = [];
                for (let i = 0; i < numNodes; i++) {
                    edges.push({
                        start: i,
                        end: Math.floor(Math.random() * numNodes)
                    });
                }
            }
            else {
                // Create a ring graph
                edges = [];
                for (let i = 0; i < numNodes; i++) {
                    edges.push({
                        start: i,
                        end: (i + 1) % numNodes
                    });
                }
            }
            // Create node buffer
            const nodeData = new Float32Array(nodes.length * 8);
            nodes.forEach((node, i) => {
                const offset = i * 8;
                nodeData[offset] = node.x;
                nodeData[offset + 1] = node.y;
                nodeData[offset + 2] = 0.0; // padding
                nodeData[offset + 3] = 0.0; // padding
                nodeData[offset + 4] = node.color[0];
                nodeData[offset + 5] = node.color[1];
                nodeData[offset + 6] = node.color[2];
                nodeData[offset + 7] = node.color[3];
            });
            // Create edge buffer
            const edgeData = new Uint32Array(edges.length * 4);
            edges.forEach((edge, i) => {
                const offset = i * 4;
                edgeData[offset] = edge.start;
                edgeData[offset + 1] = edge.end;
                edgeData[offset + 2] = 0; // padding
                edgeData[offset + 3] = 0; // padding
            });
            // Create GPU buffers
            nodeBuffer = device.createBuffer({
                size: nodeData.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true,
            });
            new Float32Array(nodeBuffer.getMappedRange()).set(nodeData);
            nodeBuffer.unmap();
            edgeBuffer = device.createBuffer({
                size: edgeData.byteLength,
                usage: GPUBufferUsage.STORAGE,
                mappedAtCreation: true,
            });
            new Uint32Array(edgeBuffer.getMappedRange()).set(edgeData);
            edgeBuffer.unmap();
            // Create force-directed layout
            forces = new _forceDirected__WEBPACK_IMPORTED_MODULE_3__.ForceDirectedLayout(device, nodeBuffer, edges, coolingFactor);
            // Create bind group
            bindGroup = device.createBindGroup({
                layout: bindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: nodeBuffer }
                    },
                    {
                        binding: 1,
                        resource: { buffer: edgeBuffer }
                    },
                    {
                        binding: 2,
                        resource: { buffer: cameraUniformBuffer }
                    }
                ]
            });
            render();
        }
        // UI Controls setup
        function setupControls() {
            document.getElementById('generate-graph').addEventListener('click', () => {
                startForces = false;
                generateRandomGraph();
            });
            document.getElementById('run-layout').addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                if (forces) {
                    forces.reset();
                }
                startForces = true;
                animationId = requestAnimationFrame(render);
            });
            // Cooling factor slider
            const coolingFactorSlider = document.getElementById('cooling-factor');
            const coolingFactorValue = document.getElementById('cooling-value');
            coolingFactorSlider.addEventListener('input', () => {
                coolingFactor = parseFloat(coolingFactorSlider.value);
                coolingFactorValue.textContent = coolingFactor.toFixed(3);
                if (forces) {
                    forces.setCoolingFactor(coolingFactor);
                }
            });
            // Node count slider
            const nodeCountSlider = document.getElementById('node-count');
            const nodeCountValue = document.getElementById('node-count-value');
            nodeCountSlider.addEventListener('input', () => {
                numNodes = parseInt(nodeCountSlider.value);
                nodeCountValue.textContent = `${numNodes}`;
            });
        }
    });
}
// Start the application when the page loads
window.addEventListener("load", main);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Z0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDM0MsY0FBYyxDQUFDLFdBQVcsR0FBRyxHQUFHLFFBQVEsRUFBRSxDQUFDO1lBQzdDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7Q0FBQTtBQUVELDRDQUE0QztBQUM1QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci8uL3NyYy9jYW1lcmEudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci8uL3NyYy9mb3JjZURpcmVjdGVkLnRzIiwid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vd2ViZ3B1LXdlYnBhY2stc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3dlYmdwdS13ZWJwYWNrLXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWJncHUtd2VicGFjay1zdGFydGVyLy4vc3JjL2dyYXBoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENhbWVyYSBzdGF0ZSBhbmQgdXRpbGl0eSBmdW5jdGlvbnNcbmV4cG9ydCBpbnRlcmZhY2UgQ2FtZXJhIHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIHpvb206IG51bWJlcjtcbiAgICBpc0RyYWdnaW5nOiBib29sZWFuO1xuICAgIGxhc3RNb3VzZVg6IG51bWJlcjtcbiAgICBsYXN0TW91c2VZOiBudW1iZXI7XG4gIH1cbiAgXG4gIGV4cG9ydCBpbnRlcmZhY2UgQ2FudmFzRGltZW5zaW9ucyB7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICByZWN0OiBET01SZWN0O1xuICB9XG4gIFxuICBleHBvcnQgaW50ZXJmYWNlIFBvaW50IHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICB9XG4gIFxuICBleHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2FtZXJhKCk6IENhbWVyYSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgem9vbTogMS4wLFxuICAgICAgaXNEcmFnZ2luZzogZmFsc2UsXG4gICAgICBsYXN0TW91c2VYOiAwLFxuICAgICAgbGFzdE1vdXNlWTogMFxuICAgIH07XG4gIH1cbiAgXG4gIC8vIEdldCBjYW52YXMgZGltZW5zaW9uc1xuICBleHBvcnQgZnVuY3Rpb24gZ2V0Q2FudmFzRGltZW5zaW9ucyhjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogQ2FudmFzRGltZW5zaW9ucyB7XG4gICAgcmV0dXJuIHsgXG4gICAgICB3aWR0aDogY2FudmFzLndpZHRoLCBcbiAgICAgIGhlaWdodDogY2FudmFzLmhlaWdodCxcbiAgICAgIHJlY3Q6IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIH07XG4gIH1cbiAgXG4gIC8vIENvbnZlcnQgc2NyZWVuIGNvb3JkaW5hdGVzIHRvIGNhbnZhcyBjb29yZGluYXRlc1xuICBleHBvcnQgZnVuY3Rpb24gZ2V0Q2FudmFzQ29vcmRpbmF0ZXMoXG4gICAgc2NyZWVuWDogbnVtYmVyLCBcbiAgICBzY3JlZW5ZOiBudW1iZXIsIFxuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnRcbiAgKTogUG9pbnQge1xuICAgIGNvbnN0IGRpbWVuc2lvbnMgPSBnZXRDYW52YXNEaW1lbnNpb25zKGNhbnZhcyk7XG4gICAgY29uc3QgcmVjdCA9IGRpbWVuc2lvbnMucmVjdDtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgeDogc2NyZWVuWCAtIHJlY3QubGVmdCxcbiAgICAgIHk6IHNjcmVlblkgLSByZWN0LnRvcFxuICAgIH07XG4gIH1cbiAgXG4gIC8vIENvbnZlcnQgY2FudmFzIGNvb3JkaW5hdGVzIHRvIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3JkaW5hdGVzICgtMSB0byAxKVxuICBleHBvcnQgZnVuY3Rpb24gY2FudmFzVG9OREMoXG4gICAgY2FudmFzWDogbnVtYmVyLCBcbiAgICBjYW52YXNZOiBudW1iZXIsIFxuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnRcbiAgKTogUG9pbnQge1xuICAgIGNvbnN0IGRpbWVuc2lvbnMgPSBnZXRDYW52YXNEaW1lbnNpb25zKGNhbnZhcyk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IChjYW52YXNYIC8gZGltZW5zaW9ucy53aWR0aCkgKiAyIC0gMSxcbiAgICAgIHk6IC0oKGNhbnZhc1kgLyBkaW1lbnNpb25zLmhlaWdodCkgKiAyIC0gMSkgLy8gRmxpcCBZIGF4aXNcbiAgICB9O1xuICB9XG4gIFxuICAvLyBDb252ZXJ0IG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3JkaW5hdGVzIHRvIHdvcmxkIGNvb3JkaW5hdGVzXG4gIGV4cG9ydCBmdW5jdGlvbiBuZGNUb1dvcmxkKFxuICAgIG5kY1g6IG51bWJlciwgXG4gICAgbmRjWTogbnVtYmVyLCBcbiAgICBjYW1lcmE6IENhbWVyYVxuICApOiBQb2ludCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IG5kY1ggKiBjYW1lcmEuem9vbSArIGNhbWVyYS54LFxuICAgICAgeTogbmRjWSAqIGNhbWVyYS56b29tICsgY2FtZXJhLnlcbiAgICB9O1xuICB9XG4gIFxuICAvLyBDb252ZXJ0IHNjcmVlbiBjb29yZGluYXRlcyB0byB3b3JsZCBjb29yZGluYXRlc1xuICBleHBvcnQgZnVuY3Rpb24gc2NyZWVuVG9Xb3JsZChcbiAgICBzY3JlZW5YOiBudW1iZXIsIFxuICAgIHNjcmVlblk6IG51bWJlciwgXG4gICAgY2FtZXJhOiBDYW1lcmEsIFxuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnRcbiAgKTogUG9pbnQge1xuICAgIGNvbnN0IGNhbnZhc0Nvb3JkcyA9IGdldENhbnZhc0Nvb3JkaW5hdGVzKHNjcmVlblgsIHNjcmVlblksIGNhbnZhcyk7XG4gICAgY29uc3QgbmRjQ29vcmRzID0gY2FudmFzVG9OREMoY2FudmFzQ29vcmRzLngsIGNhbnZhc0Nvb3Jkcy55LCBjYW52YXMpO1xuICAgIHJldHVybiBuZGNUb1dvcmxkKG5kY0Nvb3Jkcy54LCBuZGNDb29yZHMueSwgY2FtZXJhKTtcbiAgfVxuICBcbiAgLy8gU2V0dXAgY2FtZXJhIGV2ZW50IGxpc3RlbmVyc1xuICBleHBvcnQgZnVuY3Rpb24gc2V0dXBDYW1lcmFDb250cm9scyhcbiAgICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBcbiAgICBjYW1lcmE6IENhbWVyYSwgXG4gICAgdXBkYXRlQ2FtZXJhQ2FsbGJhY2s6ICgpID0+IHZvaWRcbiAgKTogdm9pZCB7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNhbWVyYS5pc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGNhbnZhc0Nvb3JkcyA9IGdldENhbnZhc0Nvb3JkaW5hdGVzKGUuY2xpZW50WCwgZS5jbGllbnRZLCBjYW52YXMpO1xuICAgICAgY2FtZXJhLmxhc3RNb3VzZVggPSBjYW52YXNDb29yZHMueDtcbiAgICAgIGNhbWVyYS5sYXN0TW91c2VZID0gY2FudmFzQ29vcmRzLnk7XG4gICAgfSk7XG4gIFxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICBpZiAoY2FtZXJhLmlzRHJhZ2dpbmcpIHtcbiAgICAgICAgLy8gR2V0IGNhbnZhcy1yZWxhdGl2ZSBjb29yZGluYXRlc1xuICAgICAgICBjb25zdCBjYW52YXNDb29yZHMgPSBnZXRDYW52YXNDb29yZGluYXRlcyhlLmNsaWVudFgsIGUuY2xpZW50WSwgY2FudmFzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY2hhbmdlIGluIG1vdXNlIHBvc2l0aW9uIHdpdGhpbiBjYW52YXNcbiAgICAgICAgY29uc3QgZHggPSBjYW52YXNDb29yZHMueCAtIGNhbWVyYS5sYXN0TW91c2VYO1xuICAgICAgICBjb25zdCBkeSA9IGNhbnZhc0Nvb3Jkcy55IC0gY2FtZXJhLmxhc3RNb3VzZVk7XG4gICAgICAgIFxuICAgICAgICAvLyBDb252ZXJ0IHBpeGVsIG1vdmVtZW50IHRvIHdvcmxkIHNwYWNlIG1vdmVtZW50IChhY2NvdW50aW5nIGZvciB6b29tKVxuICAgICAgICBjb25zdCBkaW1lbnNpb25zID0gZ2V0Q2FudmFzRGltZW5zaW9ucyhjYW52YXMpO1xuICAgICAgICBjb25zdCB3b3JsZER4ID0gKGR4IC8gZGltZW5zaW9ucy53aWR0aCkgKiAyICogY2FtZXJhLnpvb207XG4gICAgICAgIGNvbnN0IHdvcmxkRHkgPSAtKGR5IC8gZGltZW5zaW9ucy5oZWlnaHQpICogMiAqIGNhbWVyYS56b29tOyAvLyBGbGlwIFlcbiAgICAgICAgXG4gICAgICAgIC8vIFVwZGF0ZSBjYW1lcmEgcG9zaXRpb25cbiAgICAgICAgY2FtZXJhLnggLT0gd29ybGREeDtcbiAgICAgICAgY2FtZXJhLnkgLT0gd29ybGREeTtcbiAgICAgICAgXG4gICAgICAgIC8vIFVwZGF0ZSBsYXN0IG1vdXNlIHBvc2l0aW9uXG4gICAgICAgIGNhbWVyYS5sYXN0TW91c2VYID0gY2FudmFzQ29vcmRzLng7XG4gICAgICAgIGNhbWVyYS5sYXN0TW91c2VZID0gY2FudmFzQ29vcmRzLnk7XG4gICAgICAgIFxuICAgICAgICB1cGRhdGVDYW1lcmFDYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH0pO1xuICBcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKCkgPT4ge1xuICAgICAgY2FtZXJhLmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICAgIGNhbWVyYS5pc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIFxuICAgIC8vIEltcHJvdmVkIHpvb20gdGhhdCB6b29tcyB0b3dhcmQgY3Vyc29yIHBvc2l0aW9uXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZTogV2hlZWxFdmVudCkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgXG4gICAgICAvLyBHZXQgd29ybGQgcG9zaXRpb24gdW5kZXIgdGhlIGN1cnNvciBiZWZvcmUgem9vbVxuICAgICAgY29uc3QgbW91c2VXb3JsZFBvcyA9IHNjcmVlblRvV29ybGQoZS5jbGllbnRYLCBlLmNsaWVudFksIGNhbWVyYSwgY2FudmFzKTtcbiAgICAgIFxuICAgICAgLy8gQWRqdXN0IHpvb20gYmFzZWQgb24gc2Nyb2xsIGRpcmVjdGlvblxuICAgICAgY29uc3Qgem9vbUZhY3RvciA9IGUuZGVsdGFZID4gMCA/IDEuMSA6IDAuOTsgLy8gWm9vbSBvdXQvaW5cbiAgICAgIGNhbWVyYS56b29tICo9IHpvb21GYWN0b3I7XG4gICAgICBcbiAgICAgIC8vIENsYW1wIHpvb20gdG8gcmVhc29uYWJsZSBsaW1pdHNcbiAgICAgIGNhbWVyYS56b29tID0gTWF0aC5tYXgoMC4xLCBNYXRoLm1pbigxMC4wLCBjYW1lcmEuem9vbSkpO1xuICAgICAgXG4gICAgICAvLyBHZXQgbmV3IHdvcmxkIHBvc2l0aW9uIHVuZGVyIGN1cnNvciBhZnRlciB6b29tIGNoYW5nZVxuICAgICAgY29uc3QgbmV3TW91c2VXb3JsZFBvcyA9IHNjcmVlblRvV29ybGQoZS5jbGllbnRYLCBlLmNsaWVudFksIGNhbWVyYSwgY2FudmFzKTtcbiAgICAgIFxuICAgICAgLy8gQWRqdXN0IGNhbWVyYSBwb3NpdGlvbiB0byBrZWVwIGN1cnNvciBvdmVyIHRoZSBzYW1lIHdvcmxkIHBvaW50XG4gICAgICBjYW1lcmEueCArPSAobW91c2VXb3JsZFBvcy54IC0gbmV3TW91c2VXb3JsZFBvcy54KTtcbiAgICAgIGNhbWVyYS55ICs9IChtb3VzZVdvcmxkUG9zLnkgLSBuZXdNb3VzZVdvcmxkUG9zLnkpO1xuICAgICAgXG4gICAgICB1cGRhdGVDYW1lcmFDYWxsYmFjaygpO1xuICAgIH0sIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gIH0iLCJpbXBvcnQgZm9yY2VzIGZyb20gXCIuL2ZvcmNlcy53Z3NsXCI7XG5cbmludGVyZmFjZSBFZGdlIHtcbiAgICBzdGFydDogbnVtYmVyO1xuICAgIGVuZDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgRm9yY2VEaXJlY3RlZExheW91dCB7XG4gICAgcHJpdmF0ZSBhZGphY2VuY3lNYXRyaXhCdWZmZXI6IEdQVUJ1ZmZlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgY29tcHV0ZVBpcGVsaW5lOiBHUFVDb21wdXRlUGlwZWxpbmUgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGJpbmRHcm91cDogR1BVQmluZEdyb3VwIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBub2RlQ291bnQ6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBkZXZpY2U6IEdQVURldmljZTtcbiAgICBwcml2YXRlIG5vZGVidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgICBwcml2YXRlIGVkZ2VzOiBFZGdlW107XG4gICAgcHJpdmF0ZSBjb29saW5nRmFjdG9yOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBjdXJyZW50Q29vbGluZ0ZhY3RvcjogbnVtYmVyO1xuICAgIHByaXZhdGUgdW5pZm9ybUJ1ZmZlcjogR1BVQnVmZmVyO1xuICAgIHByaXZhdGUgaXRlcmF0aW9uQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcihkZXZpY2U6IEdQVURldmljZSwgbm9kZWJ1ZmZlcjogR1BVQnVmZmVyLCBlZGdlczogRWRnZVtdLCBjb29saW5nRmFjdG9yOiBudW1iZXIgPSAwLjk3NSkge1xuICAgICAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICAgICAgdGhpcy5ub2RlYnVmZmVyID0gbm9kZWJ1ZmZlcjtcbiAgICAgICAgdGhpcy5lZGdlcyA9IGVkZ2VzO1xuICAgICAgICB0aGlzLmNvb2xpbmdGYWN0b3IgPSBjb29saW5nRmFjdG9yO1xuICAgICAgICB0aGlzLmN1cnJlbnRDb29saW5nRmFjdG9yID0gMC4wNTsgLy8gSW5pdGlhbCBjb29saW5nIGZhY3RvclxuICAgICAgICBcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgYWRqYWNlbmN5IG1hdHJpeCByaWdodCBhd2F5XG4gICAgICAgIHRoaXMubm9kZUNvdW50ID0gbm9kZWJ1ZmZlci5zaXplIC8gKDggKiA0KTtcbiAgICAgICAgdGhpcy5jcmVhdGVBZGphY2VuY3lNYXRyaXgoKTtcblxuICAgICAgICAvLyBDcmVhdGUgdW5pZm9ybSBidWZmZXIgZm9yIHBhcmFtZXRlcnNcbiAgICAgICAgdGhpcy51bmlmb3JtQnVmZmVyID0gdGhpcy5kZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgICAgIHNpemU6IDE2LCAvLyA0IGZsb2F0MzIgdmFsdWVzXG4gICAgICAgICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFVwZGF0ZSB1bmlmb3JtIGJ1ZmZlciB2YWx1ZXNcbiAgICAgICAgdGhpcy51cGRhdGVVbmlmb3JtQnVmZmVyKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGNvbXB1dGUgcGlwZWxpbmVcbiAgICAgICAgdGhpcy5jb21wdXRlUGlwZWxpbmUgPSB0aGlzLmRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoe1xuICAgICAgICAgICAgbGF5b3V0OiBcImF1dG9cIixcbiAgICAgICAgICAgIGNvbXB1dGU6IHtcbiAgICAgICAgICAgICAgICBtb2R1bGU6IGRldmljZS5jcmVhdGVTaGFkZXJNb2R1bGUoe1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBmb3JjZXNcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBlbnRyeVBvaW50OiBcIm1haW5cIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIGJpbmQgZ3JvdXBcbiAgICAgICAgdGhpcy5iaW5kR3JvdXAgPSB0aGlzLmRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgICAgICAgbGF5b3V0OiB0aGlzLmNvbXB1dGVQaXBlbGluZS5nZXRCaW5kR3JvdXBMYXlvdXQoMCksXG4gICAgICAgICAgICBlbnRyaWVzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiAwLFxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiB0aGlzLm5vZGVidWZmZXIsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZzogMSxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogdGhpcy5hZGphY2VuY3lNYXRyaXhCdWZmZXIsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZzogMixcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogdGhpcy51bmlmb3JtQnVmZmVyLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHVuaWZvcm0gYnVmZmVyIHdpdGggY3VycmVudCBwYXJhbWV0ZXJzXG4gICAgcHJpdmF0ZSB1cGRhdGVVbmlmb3JtQnVmZmVyKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihcbiAgICAgICAgICAgIHRoaXMudW5pZm9ybUJ1ZmZlcixcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBuZXcgVWludDMyQXJyYXkoW3RoaXMubm9kZUNvdW50XSksXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5kZXZpY2UucXVldWUud3JpdGVCdWZmZXIoXG4gICAgICAgICAgICB0aGlzLnVuaWZvcm1CdWZmZXIsXG4gICAgICAgICAgICA0LFxuICAgICAgICAgICAgbmV3IEZsb2F0MzJBcnJheShbdGhpcy5jdXJyZW50Q29vbGluZ0ZhY3RvciwgMiAvIHRoaXMubm9kZUNvdW50XSksXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMlxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgY29vbGluZyBmYWN0b3JcbiAgICBwdWJsaWMgc2V0Q29vbGluZ0ZhY3RvcihuZXdDb29saW5nRmFjdG9yOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb29saW5nRmFjdG9yID0gbmV3Q29vbGluZ0ZhY3RvcjtcbiAgICAgICAgLy8gUmVzZXQgdGhlIGN1cnJlbnQgY29vbGluZyBmYWN0b3IgdG8gYWxsb3cgcmUtcnVubmluZyB0aGUgYWxnb3JpdGhtXG4gICAgICAgIHRoaXMuY3VycmVudENvb2xpbmdGYWN0b3IgPSAwLjU7XG4gICAgICAgIHRoaXMuaXRlcmF0aW9uQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnVwZGF0ZVVuaWZvcm1CdWZmZXIoKTtcbiAgICB9XG5cbiAgICAvLyBSZXNldCB0aGUgYWxnb3JpdGhtXG4gICAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmN1cnJlbnRDb29saW5nRmFjdG9yID0gMC41O1xuICAgICAgICB0aGlzLml0ZXJhdGlvbkNvdW50ID0gMDtcbiAgICAgICAgdGhpcy51cGRhdGVVbmlmb3JtQnVmZmVyKCk7XG4gICAgfVxuXG4gICAgLy8gUnVuIGEgc2luZ2xlIGl0ZXJhdGlvbiBvZiBmb3JjZS1kaXJlY3RlZCBsYXlvdXRcbiAgICBwdWJsaWMgcnVuRm9yY2VEaXJlY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgd2Ugc2hvdWxkIHN0b3BcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudENvb2xpbmdGYWN0b3IgPCAwLjAwMDEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gSW5kaWNhdGUgYWxnb3JpdGhtIGhhcyBjb21wbGV0ZWRcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gUnVuIGEgY29tcHV0ZSBwYXNzIHRvIHVwZGF0ZSBub2RlIHBvc2l0aW9uc1xuICAgICAgICBjb25zdCBjb21tYW5kRW5jb2RlciA9IHRoaXMuZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgICAgIGNvbnN0IHBhc3MgPSBjb21tYW5kRW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgICAgIHBhc3Muc2V0QmluZEdyb3VwKDAsIHRoaXMuYmluZEdyb3VwKTtcbiAgICAgICAgcGFzcy5zZXRQaXBlbGluZSh0aGlzLmNvbXB1dGVQaXBlbGluZSk7XG4gICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKE1hdGguY2VpbCh0aGlzLm5vZGVDb3VudCAvIDY0KSwgMSwgMSk7XG4gICAgICAgIHBhc3MuZW5kKCk7XG4gICAgICAgIFxuICAgICAgICAvLyBVcGRhdGUgY29vbGluZyBmYWN0b3JcbiAgICAgICAgdGhpcy5jdXJyZW50Q29vbGluZ0ZhY3RvciA9IHRoaXMuY29vbGluZ0ZhY3RvciAqIHRoaXMuY3VycmVudENvb2xpbmdGYWN0b3I7XG4gICAgICAgIHRoaXMuZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKFxuICAgICAgICAgICAgdGhpcy51bmlmb3JtQnVmZmVyLFxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIG5ldyBGbG9hdDMyQXJyYXkoW3RoaXMuY3VycmVudENvb2xpbmdGYWN0b3JdKSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICAvLyBTdWJtaXQgY29tbWFuZCBidWZmZXJcbiAgICAgICAgdGhpcy5kZXZpY2UucXVldWUuc3VibWl0KFtjb21tYW5kRW5jb2Rlci5maW5pc2goKV0pO1xuICAgICAgICBcbiAgICAgICAgLy8gSW5jcmVtZW50IGl0ZXJhdGlvbiBjb3VudFxuICAgICAgICB0aGlzLml0ZXJhdGlvbkNvdW50Kys7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gSW5kaWNhdGUgYWxnb3JpdGhtIGlzIHN0aWxsIHJ1bm5pbmdcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYWRqYWNlbmN5IG1hdHJpeCBmcm9tIGVkZ2VzXG4gICAgcHJpdmF0ZSBjcmVhdGVBZGphY2VuY3lNYXRyaXgoKTogdm9pZCB7XG4gICAgICAgIC8vIENyZWF0ZSBhZGphY2VuY3kgbWF0cml4IGFzIFVpbnQzMkFycmF5XG4gICAgICAgIGNvbnN0IGFkamFjZW5jeU1hdHJpeFNpemUgPSB0aGlzLm5vZGVDb3VudCAqIHRoaXMubm9kZUNvdW50O1xuICAgICAgICBjb25zdCBhZGphY2VuY3lNYXRyaXggPSBuZXcgVWludDMyQXJyYXkoYWRqYWNlbmN5TWF0cml4U2l6ZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBGaWxsIHRoZSBhZGphY2VuY3kgbWF0cml4IHdpdGggMHMgaW5pdGlhbGx5XG4gICAgICAgIGFkamFjZW5jeU1hdHJpeC5maWxsKDApO1xuICAgICAgICBcbiAgICAgICAgLy8gRm9yIGVhY2ggZWRnZSwgc2V0IHRoZSBjb3JyZXNwb25kaW5nIGVudHJpZXMgaW4gdGhlIGFkamFjZW5jeSBtYXRyaXggdG8gMVxuICAgICAgICBmb3IgKGNvbnN0IGVkZ2Ugb2YgdGhpcy5lZGdlcykge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IGVkZ2Uuc3RhcnQgKiB0aGlzLm5vZGVDb3VudCArIGVkZ2UuZW5kO1xuICAgICAgICAgICAgY29uc3QgZW5kSW5kZXggPSBlZGdlLmVuZCAqIHRoaXMubm9kZUNvdW50ICsgZWRnZS5zdGFydDtcbiAgICAgICAgICAgIGFkamFjZW5jeU1hdHJpeFtzdGFydEluZGV4XSA9IDE7XG4gICAgICAgICAgICBhZGphY2VuY3lNYXRyaXhbZW5kSW5kZXhdID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBhIEdQVSBidWZmZXIgZm9yIHRoZSBhZGphY2VuY3kgbWF0cml4XG4gICAgICAgIHRoaXMuYWRqYWNlbmN5TWF0cml4QnVmZmVyID0gdGhpcy5kZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgICAgICAgIHNpemU6IGFkamFjZW5jeU1hdHJpeC5ieXRlTGVuZ3RoLFxuICAgICAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICAgICAgICAgIG1hcHBlZEF0Q3JlYXRpb246IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICBuZXcgVWludDMyQXJyYXkodGhpcy5hZGphY2VuY3lNYXRyaXhCdWZmZXIuZ2V0TWFwcGVkUmFuZ2UoKSkuc2V0KGFkamFjZW5jeU1hdHJpeCk7XG4gICAgICAgIHRoaXMuYWRqYWNlbmN5TWF0cml4QnVmZmVyLnVubWFwKCk7XG4gICAgfVxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IG5vZGVTaGFkZXJDb2RlIGZyb20gXCIuL25vZGUud2dzbFwiO1xuaW1wb3J0IGVkZ2VTaGFkZXJDb2RlIGZyb20gXCIuL2VkZ2Uud2dzbFwiO1xuaW1wb3J0IHsgXG4gIGNyZWF0ZUNhbWVyYSwgXG4gIHNldHVwQ2FtZXJhQ29udHJvbHMgXG59IGZyb20gXCIuL2NhbWVyYVwiO1xuaW1wb3J0IHsgRm9yY2VEaXJlY3RlZExheW91dCB9IGZyb20gXCIuL2ZvcmNlRGlyZWN0ZWRcIjtcblxuLy8gR2xvYmFsIHZhcmlhYmxlcyBmb3Igc3RhdGUgbWFuYWdlbWVudFxubGV0IGRldmljZSA6IEdQVURldmljZTtcbmxldCBjb250ZXh0IDogR1BVQ2FudmFzQ29udGV4dDtcbmxldCBmb3JtYXQ7XG5sZXQgbm9kZXMgPSBbXTtcbmxldCBlZGdlcyA9IFtdO1xubGV0IG5vZGVCdWZmZXI7XG5sZXQgZWRnZUJ1ZmZlcjtcbmxldCBmb3JjZXMgOiBGb3JjZURpcmVjdGVkTGF5b3V0O1xubGV0IGFuaW1hdGlvbklkIDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5sZXQgYmluZEdyb3VwIDogR1BVQmluZEdyb3VwID0gbnVsbDtcbmxldCBzdGFydEZvcmNlcyA9IGZhbHNlO1xuXG4vLyBDb25maWd1cmF0aW9uIG9wdGlvbnNcbmxldCBudW1Ob2RlcyA9IDEwO1xubGV0IGNvb2xpbmdGYWN0b3IgPSAwLjk3NTtcblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcbiAgLy8gQ2FudmFzIGFuZCBkZXZpY2Ugc2V0dXBcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJncHUtY2FudmFzXCIpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICBpZiAoIW5hdmlnYXRvci5ncHUpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vLXdlYmdwdVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIHJldHVybjtcbiAgfVxuICBcbiAgZGV2aWNlID0gYXdhaXQgbmF2aWdhdG9yLmdwdS5yZXF1ZXN0QWRhcHRlcigpLnRoZW4oYWRhcHRlciA9PiBhZGFwdGVyPy5yZXF1ZXN0RGV2aWNlKCkpO1xuICBpZiAoIWRldmljZSkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm8td2ViZ3B1XCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQ29uZmlndXJlIGNvbnRleHRcbiAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwid2ViZ3B1XCIpO1xuICBmb3JtYXQgPSBuYXZpZ2F0b3IuZ3B1LmdldFByZWZlcnJlZENhbnZhc0Zvcm1hdCgpO1xuICBjb250ZXh0LmNvbmZpZ3VyZSh7XG4gICAgZGV2aWNlLFxuICAgIGZvcm1hdCxcbiAgfSk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBjYW1lcmFcbiAgY29uc3QgY2FtZXJhID0gY3JlYXRlQ2FtZXJhKCk7XG5cbiAgLy8gQ3JlYXRlIGEgdW5pZm9ybSBidWZmZXIgZm9yIGNhbWVyYSBkYXRhXG4gIGNvbnN0IGNhbWVyYVVuaWZvcm1CdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICBzaXplOiAxNiwgLy8gQWxpZ25lZCBzaXplIGZvciAzIGZsb2F0cyAoeCwgeSwgem9vbSkgKyBwYWRkaW5nXG4gICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlVOSUZPUk0gfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgfSk7XG5cbiAgLy8gVXBkYXRlIGNhbWVyYSB1bmlmb3Jtc1xuICBmdW5jdGlvbiB1cGRhdGVDYW1lcmFVbmlmb3JtKCkge1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihcbiAgICAgIGNhbWVyYVVuaWZvcm1CdWZmZXIsXG4gICAgICAwLFxuICAgICAgbmV3IEZsb2F0MzJBcnJheShbY2FtZXJhLngsIGNhbWVyYS55LCBjYW1lcmEuem9vbSwgMC4wXSkgLy8gQWRkIHBhZGRpbmcgZm9yIGFsaWdubWVudFxuICAgICk7XG4gIH1cbiAgXG4gIC8vIEluaXRpYWwgY2FtZXJhIHVwZGF0ZVxuICB1cGRhdGVDYW1lcmFVbmlmb3JtKCk7XG5cbiAgLy8gU2V0IHVwIGNhbWVyYSBjb250cm9sc1xuICBzZXR1cENhbWVyYUNvbnRyb2xzKGNhbnZhcywgY2FtZXJhLCB1cGRhdGVDYW1lcmFVbmlmb3JtKTtcblxuICAvLyBDcmVhdGUgYmluZCBncm91cCBsYXlvdXRcbiAgY29uc3QgYmluZEdyb3VwTGF5b3V0ID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgZW50cmllczogW1xuICAgICAge1xuICAgICAgICBiaW5kaW5nOiAwLFxuICAgICAgICB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5WRVJURVgsXG4gICAgICAgIGJ1ZmZlcjogeyB0eXBlOiBcInJlYWQtb25seS1zdG9yYWdlXCIgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmluZGluZzogMSxcbiAgICAgICAgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuVkVSVEVYLFxuICAgICAgICBidWZmZXI6IHsgdHlwZTogXCJyZWFkLW9ubHktc3RvcmFnZVwiIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJpbmRpbmc6IDIsXG4gICAgICAgIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLlZFUlRFWCB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5ULFxuICAgICAgICBidWZmZXI6IHsgdHlwZTogXCJ1bmlmb3JtXCIgfVxuICAgICAgfVxuICAgIF1cbiAgfSk7XG5cbiAgLy8gQ3JlYXRlIHNoYWRlciBtb2R1bGVzXG4gIGNvbnN0IG5vZGVTaGFkZXJNb2R1bGUgPSBkZXZpY2UuY3JlYXRlU2hhZGVyTW9kdWxlKHtcbiAgICBjb2RlOiBub2RlU2hhZGVyQ29kZVxuICB9KTtcbiAgY29uc3QgZWRnZVNoYWRlck1vZHVsZSA9IGRldmljZS5jcmVhdGVTaGFkZXJNb2R1bGUoe1xuICAgIGNvZGU6IGVkZ2VTaGFkZXJDb2RlXG4gIH0pO1xuXG4gIC8vIENyZWF0ZSBwaXBlbGluZXNcbiAgY29uc3Qgbm9kZVBpcGVsaW5lID0gZGV2aWNlLmNyZWF0ZVJlbmRlclBpcGVsaW5lKHtcbiAgICBsYXlvdXQ6IGRldmljZS5jcmVhdGVQaXBlbGluZUxheW91dCh7XG4gICAgICBiaW5kR3JvdXBMYXlvdXRzOiBbYmluZEdyb3VwTGF5b3V0XVxuICAgIH0pLFxuICAgIHZlcnRleDoge1xuICAgICAgbW9kdWxlOiBub2RlU2hhZGVyTW9kdWxlLFxuICAgICAgZW50cnlQb2ludDogXCJ2ZXJ0ZXhNYWluXCJcbiAgICB9LFxuICAgIGZyYWdtZW50OiB7XG4gICAgICBtb2R1bGU6IG5vZGVTaGFkZXJNb2R1bGUsXG4gICAgICBlbnRyeVBvaW50OiBcImZyYWdtZW50TWFpblwiLFxuICAgICAgdGFyZ2V0czogW3sgZm9ybWF0IH1dXG4gICAgfVxuICB9KTtcbiAgXG4gIGNvbnN0IGVkZ2VQaXBlbGluZSA9IGRldmljZS5jcmVhdGVSZW5kZXJQaXBlbGluZSh7XG4gICAgbGF5b3V0OiBkZXZpY2UuY3JlYXRlUGlwZWxpbmVMYXlvdXQoe1xuICAgICAgYmluZEdyb3VwTGF5b3V0czogW2JpbmRHcm91cExheW91dF1cbiAgICB9KSxcbiAgICB2ZXJ0ZXg6IHtcbiAgICAgIG1vZHVsZTogZWRnZVNoYWRlck1vZHVsZSxcbiAgICAgIGVudHJ5UG9pbnQ6IFwidmVydGV4TWFpblwiXG4gICAgfSxcbiAgICBmcmFnbWVudDoge1xuICAgICAgbW9kdWxlOiBlZGdlU2hhZGVyTW9kdWxlLFxuICAgICAgZW50cnlQb2ludDogXCJmcmFnbWVudE1haW5cIixcbiAgICAgIHRhcmdldHM6IFt7IGZvcm1hdCB9XVxuICAgIH0sXG4gICAgcHJpbWl0aXZlOiB7XG4gICAgICB0b3BvbG9neTogXCJsaW5lLWxpc3RcIlxuICAgIH1cbiAgfSk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBncmFwaFxuICBnZW5lcmF0ZVJhbmRvbUdyYXBoKCk7XG5cbiAgLy8gU2V0IHVwIFVJIGNvbnRyb2xzXG4gIHNldHVwQ29udHJvbHMoKTtcblxuICAvLyBSZW5kZXIgZnVuY3Rpb25cbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmIChmb3JjZXMgJiYgc3RhcnRGb3JjZXMpIHtcbiAgICAgIGZvcmNlcy5ydW5Gb3JjZURpcmVjdGVkKCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29tbWFuZEVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBjb25zdCBwYXNzID0gY29tbWFuZEVuY29kZXIuYmVnaW5SZW5kZXJQYXNzKHtcbiAgICAgIGNvbG9yQXR0YWNobWVudHM6IFt7XG4gICAgICAgIHZpZXc6IGNvbnRleHQuZ2V0Q3VycmVudFRleHR1cmUoKS5jcmVhdGVWaWV3KCksXG4gICAgICAgIGxvYWRPcDogXCJjbGVhclwiLFxuICAgICAgICBzdG9yZU9wOiBcInN0b3JlXCIsXG4gICAgICAgIGNsZWFyVmFsdWU6IHsgcjogMS4wLCBnOiAxLjAsIGI6IDEuMCwgYTogMS4wIH1cbiAgICAgIH1dXG4gICAgfSk7XG4gICAgXG4gICAgLy8gRW5zdXJlIHdlIGhhdmUgYSB2YWxpZCBiaW5kIGdyb3VwIGJlZm9yZSBkcmF3aW5nXG4gICAgaWYgKGJpbmRHcm91cCkge1xuICAgICAgcGFzcy5zZXRQaXBlbGluZShub2RlUGlwZWxpbmUpO1xuICAgICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwKTtcbiAgICAgIHBhc3MuZHJhdyg2LCBub2Rlcy5sZW5ndGgpO1xuICAgICAgXG4gICAgICBwYXNzLnNldFBpcGVsaW5lKGVkZ2VQaXBlbGluZSk7XG4gICAgICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXApO1xuICAgICAgcGFzcy5kcmF3KDIsIGVkZ2VzLmxlbmd0aCk7XG4gICAgfVxuICAgIFxuICAgIHBhc3MuZW5kKCk7XG4gICAgXG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbY29tbWFuZEVuY29kZXIuZmluaXNoKCldKTtcbiAgICBcbiAgICAvLyBSZXF1ZXN0IG5leHQgZnJhbWVcbiAgICBhbmltYXRpb25JZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICB9XG5cbiAgLy8gRnVuY3Rpb24gdG8gZ2VuZXJhdGUgYSByYW5kb20gZ3JhcGhcbiAgZnVuY3Rpb24gZ2VuZXJhdGVSYW5kb21HcmFwaCgpIHtcbiAgICAvLyBTdG9wIGFueSBydW5uaW5nIGFuaW1hdGlvblxuICAgIGlmIChhbmltYXRpb25JZCkge1xuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uSWQpO1xuICAgICAgYW5pbWF0aW9uSWQgPSBudWxsO1xuICAgIH1cbiAgICBcbiAgICAvLyBHZW5lcmF0ZSByYW5kb20gbm9kZXNcbiAgICBub2RlcyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IG51bU5vZGVzIH0sICgpID0+ICh7XG4gICAgICAvLyBSYW5kb20gcG9zaXRpb24gYmV0d2VlbiAtMC44IGFuZCAwLjggdG8ga2VlcCBub2RlcyB2aXNpYmxlXG4gICAgICB4OiBNYXRoLnJhbmRvbSgpICogMS42IC0gMC44LFxuICAgICAgeTogTWF0aC5yYW5kb20oKSAqIDEuNiAtIDAuOCxcbiAgICAgIC8vIFJhbmRvbSBjb2xvciB3aXRoIGZ1bGwgYWxwaGFcbiAgICAgIGNvbG9yOiBbXG4gICAgICAgIE1hdGgucmFuZG9tKCksXG4gICAgICAgIE1hdGgucmFuZG9tKCksXG4gICAgICAgIE1hdGgucmFuZG9tKCksXG4gICAgICAgIDEuMFxuICAgICAgXVxuICAgIH0pKTtcbiAgICBcbiAgICBpZiAoKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmFuZG9tLWdyYXBoLXR5cGVcIikgYXMgSFRNTElucHV0RWxlbWVudCkuY2hlY2tlZCkge1xuICAgICAgLy8gQ3JlYXRlIGEgcmFuZG9tIGdyYXBoXG4gICAgICBlZGdlcyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Ob2RlczsgaSsrKSB7XG4gICAgICAgIGVkZ2VzLnB1c2goe1xuICAgICAgICAgIHN0YXJ0OiBpLFxuICAgICAgICAgIGVuZDogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbnVtTm9kZXMpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDcmVhdGUgYSByaW5nIGdyYXBoXG4gICAgICBlZGdlcyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Ob2RlczsgaSsrKSB7XG4gICAgICAgIGVkZ2VzLnB1c2goe1xuICAgICAgICAgIHN0YXJ0OiBpLFxuICAgICAgICAgIGVuZDogKGkgKyAxKSAlIG51bU5vZGVzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBDcmVhdGUgbm9kZSBidWZmZXJcbiAgICBjb25zdCBub2RlRGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkobm9kZXMubGVuZ3RoICogOCk7XG4gICAgbm9kZXMuZm9yRWFjaCgobm9kZSwgaSkgPT4ge1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gaSAqIDg7XG4gICAgICBub2RlRGF0YVtvZmZzZXRdID0gbm9kZS54O1xuICAgICAgbm9kZURhdGFbb2Zmc2V0ICsgMV0gPSBub2RlLnk7XG4gICAgICBub2RlRGF0YVtvZmZzZXQgKyAyXSA9IDAuMDsgLy8gcGFkZGluZ1xuICAgICAgbm9kZURhdGFbb2Zmc2V0ICsgM10gPSAwLjA7IC8vIHBhZGRpbmdcbiAgICAgIG5vZGVEYXRhW29mZnNldCArIDRdID0gbm9kZS5jb2xvclswXTtcbiAgICAgIG5vZGVEYXRhW29mZnNldCArIDVdID0gbm9kZS5jb2xvclsxXTtcbiAgICAgIG5vZGVEYXRhW29mZnNldCArIDZdID0gbm9kZS5jb2xvclsyXTtcbiAgICAgIG5vZGVEYXRhW29mZnNldCArIDddID0gbm9kZS5jb2xvclszXTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBDcmVhdGUgZWRnZSBidWZmZXJcbiAgICBjb25zdCBlZGdlRGF0YSA9IG5ldyBVaW50MzJBcnJheShlZGdlcy5sZW5ndGggKiA0KTtcbiAgICBlZGdlcy5mb3JFYWNoKChlZGdlLCBpKSA9PiB7XG4gICAgICBjb25zdCBvZmZzZXQgPSBpICogNDtcbiAgICAgIGVkZ2VEYXRhW29mZnNldF0gPSBlZGdlLnN0YXJ0O1xuICAgICAgZWRnZURhdGFbb2Zmc2V0ICsgMV0gPSBlZGdlLmVuZDtcbiAgICAgIGVkZ2VEYXRhW29mZnNldCArIDJdID0gMDsgLy8gcGFkZGluZ1xuICAgICAgZWRnZURhdGFbb2Zmc2V0ICsgM10gPSAwOyAvLyBwYWRkaW5nXG4gICAgfSk7XG4gICAgXG4gICAgLy8gQ3JlYXRlIEdQVSBidWZmZXJzXG4gICAgbm9kZUJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgc2l6ZTogbm9kZURhdGEuYnl0ZUxlbmd0aCxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgICBtYXBwZWRBdENyZWF0aW9uOiB0cnVlLFxuICAgIH0pO1xuICAgIG5ldyBGbG9hdDMyQXJyYXkobm9kZUJ1ZmZlci5nZXRNYXBwZWRSYW5nZSgpKS5zZXQobm9kZURhdGEpO1xuICAgIG5vZGVCdWZmZXIudW5tYXAoKTtcbiAgICBcbiAgICBlZGdlQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBzaXplOiBlZGdlRGF0YS5ieXRlTGVuZ3RoLFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UsXG4gICAgICBtYXBwZWRBdENyZWF0aW9uOiB0cnVlLFxuICAgIH0pO1xuICAgIG5ldyBVaW50MzJBcnJheShlZGdlQnVmZmVyLmdldE1hcHBlZFJhbmdlKCkpLnNldChlZGdlRGF0YSk7XG4gICAgZWRnZUJ1ZmZlci51bm1hcCgpO1xuICAgIFxuICAgIC8vIENyZWF0ZSBmb3JjZS1kaXJlY3RlZCBsYXlvdXRcbiAgICBmb3JjZXMgPSBuZXcgRm9yY2VEaXJlY3RlZExheW91dChkZXZpY2UsIG5vZGVCdWZmZXIsIGVkZ2VzLCBjb29saW5nRmFjdG9yKTtcbiAgICBcbiAgICAvLyBDcmVhdGUgYmluZCBncm91cFxuICAgIGJpbmRHcm91cCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGF5b3V0OiBiaW5kR3JvdXBMYXlvdXQsXG4gICAgICBlbnRyaWVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBiaW5kaW5nOiAwLFxuICAgICAgICAgIHJlc291cmNlOiB7IGJ1ZmZlcjogbm9kZUJ1ZmZlciB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBiaW5kaW5nOiAxLFxuICAgICAgICAgIHJlc291cmNlOiB7IGJ1ZmZlcjogZWRnZUJ1ZmZlciB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBiaW5kaW5nOiAyLFxuICAgICAgICAgIHJlc291cmNlOiB7IGJ1ZmZlcjogY2FtZXJhVW5pZm9ybUJ1ZmZlciB9XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KTtcbiAgICBcbiAgICByZW5kZXIoKTtcbiAgfVxuICBcbiAgLy8gVUkgQ29udHJvbHMgc2V0dXBcbiAgZnVuY3Rpb24gc2V0dXBDb250cm9scygpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2VuZXJhdGUtZ3JhcGgnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIHN0YXJ0Rm9yY2VzID0gZmFsc2U7XG4gICAgICBnZW5lcmF0ZVJhbmRvbUdyYXBoKCk7XG4gICAgfSk7XG4gICAgXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bi1sYXlvdXQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGlmIChhbmltYXRpb25JZCkge1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb25JZCk7XG4gICAgICB9XG4gICAgICBpZiAoZm9yY2VzKSB7XG4gICAgICAgIGZvcmNlcy5yZXNldCgpO1xuICAgICAgfVxuICAgICAgc3RhcnRGb3JjZXMgPSB0cnVlO1xuICAgICAgYW5pbWF0aW9uSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBDb29saW5nIGZhY3RvciBzbGlkZXJcbiAgICBjb25zdCBjb29saW5nRmFjdG9yU2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvb2xpbmctZmFjdG9yJykgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBjb29saW5nRmFjdG9yVmFsdWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29vbGluZy12YWx1ZScpO1xuICAgIFxuICAgIGNvb2xpbmdGYWN0b3JTbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICBjb29saW5nRmFjdG9yID0gcGFyc2VGbG9hdChjb29saW5nRmFjdG9yU2xpZGVyLnZhbHVlKTtcbiAgICAgIGNvb2xpbmdGYWN0b3JWYWx1ZS50ZXh0Q29udGVudCA9IGNvb2xpbmdGYWN0b3IudG9GaXhlZCgzKTtcbiAgICAgIFxuICAgICAgaWYgKGZvcmNlcykge1xuICAgICAgICBmb3JjZXMuc2V0Q29vbGluZ0ZhY3Rvcihjb29saW5nRmFjdG9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvLyBOb2RlIGNvdW50IHNsaWRlclxuICAgIGNvbnN0IG5vZGVDb3VudFNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWNvdW50JykgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBub2RlQ291bnRWYWx1ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWNvdW50LXZhbHVlJyk7XG4gICAgXG4gICAgbm9kZUNvdW50U2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgbnVtTm9kZXMgPSBwYXJzZUludChub2RlQ291bnRTbGlkZXIudmFsdWUpO1xuICAgICAgbm9kZUNvdW50VmFsdWUudGV4dENvbnRlbnQgPSBgJHtudW1Ob2Rlc31gO1xuICAgIH0pO1xuICB9XG59XG5cbi8vIFN0YXJ0IHRoZSBhcHBsaWNhdGlvbiB3aGVuIHRoZSBwYWdlIGxvYWRzXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbWFpbik7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9