import shaderCode from "./triangle.wgsl";
import { 
    createCamera, 
    setupCameraControls 
} from "./camera";

async function main() {
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
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        displayError = true;
        if (infoElement) {
            infoElement.textContent = "No appropriate GPU adapter found.";
        }
        throw new Error("No appropriate GPU adapter found.");
    }

    if (displayError) {
        console.log("No WebGPU Device available.");
        alert("WebGPU is not supported in your browser! Visit https://webgpureport.org/ for info about your system.")
    }

    // Canvas and device setup
    const device = await adapter.requestDevice();
    if (!device) {
        console.log("WebGPU not supported");
        alert("WebGPU not supported");
        return;
    }
    // Configure rendering context
    const canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement;
    const context = canvas.getContext("webgpu") as GPUCanvasContext;
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format,
    });

    // Initialize camera
    const camera = createCamera();

    // Triangle interface
    interface Triangle {
        x: number;
        y: number;
        color: number[];
    }
    let triangleBuffer : GPUBuffer;

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
    function updateTriangleBuffer(triangles : Triangle[], device : GPUDevice) {
        const triangleData = new Float32Array(triangles.length * 8);
        triangles.forEach((triangle : Triangle, i : number) => {
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
        } else {
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
    function updateCameraUniform(): void {
        device.queue.writeBuffer(
        cameraUniformBuffer,
        0,
        new Float32Array([camera.x, camera.y, camera.zoom, 0.0]) // Add padding for alignment
        );
    }

    updateCameraUniform();
    setupCameraControls(canvas, camera, updateCameraUniform);

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
        code: shaderCode
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
    function render(): void {
        
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
}

window.addEventListener("load", main);