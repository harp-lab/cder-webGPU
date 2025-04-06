import shaderCode from "./triangle.wgsl";
import { 
    createCamera, 
    setupCameraControls 
  } from "./camera";

async function main() {
  // Canvas and device setup
  const device = await navigator.gpu.requestAdapter().then(adapter => adapter?.requestDevice());
  if (!device) {
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

  // Generate 5 random triangles
  const triangles: Triangle[] = Array.from({ length: 5 }, () => ({
    // Random position between -0.8 and 0.8 to keep triangles visible
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

  // Create buffer for triangle data (8 floats per triangle: 2 for position, 2 for zeros, 4 for color)
  const triangleData = new Float32Array(triangles.length * 8);
  
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
  
  // Initial camera update
  updateCameraUniform();

  // Set up camera controls
  setupCameraControls(canvas, camera, updateCameraUniform);

  // Set up triangle data
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

  const triangleBuffer = device.createBuffer({
    size: triangleData.byteLength,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });
  new Float32Array(triangleBuffer.getMappedRange()).set(triangleData);
  triangleBuffer.unmap();

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

  // Create shader module with updated code
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