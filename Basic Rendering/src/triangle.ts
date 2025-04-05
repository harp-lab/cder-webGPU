import shaderCode from "./triangle.wgsl";

async function main() {
  // Canvas and device setup
  const canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement;
  const device = await navigator.gpu.requestAdapter().then(adapter => adapter?.requestDevice());
  if (!device) {
    alert("WebGPU not supported");
    return;
  }

  // Configure context
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format,
  });

  // Camera state
  interface Camera {
    x: number;
    y: number;
    zoom: number;
    isDragging: boolean;
    lastMouseX: number;
    lastMouseY: number;
  }

  const camera: Camera = {
    x: 0,
    y: 0,
    zoom: 1.0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  };

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

  interface CanvasDimensions {
    width: number;
    height: number;
    rect: DOMRect;
  }

  // Get canvas dimensions
  function getCanvasDimensions(): CanvasDimensions {
    return { 
      width: canvas.width, 
      height: canvas.height,
      rect: canvas.getBoundingClientRect()
    };
  }

  interface Point {
    x: number;
    y: number;
  }

  // Convert screen coordinates to canvas coordinates
  function getCanvasCoordinates(screenX: number, screenY: number): Point {
    const dimensions = getCanvasDimensions();
    const rect = dimensions.rect;
    
    return {
      x: screenX - rect.left,
      y: screenY - rect.top
    };
  }

  // Convert canvas coordinates to normalized device coordinates (-1 to 1)
  function canvasToNDC(canvasX: number, canvasY: number): Point {
    const dimensions = getCanvasDimensions();
    
    return {
      x: (canvasX / dimensions.width) * 2 - 1,
      y: -((canvasY / dimensions.height) * 2 - 1) // Flip Y axis
    };
  }

  // Convert normalized device coordinates to world coordinates
  function ndcToWorld(ndcX: number, ndcY: number): Point {
    return {
      x: ndcX * camera.zoom + camera.x,
      y: ndcY * camera.zoom + camera.y
    };
  }

  // Convert screen coordinates to world coordinates
  function screenToWorld(screenX: number, screenY: number): Point {
    const canvasCoords = getCanvasCoordinates(screenX, screenY);
    const ndcCoords = canvasToNDC(canvasCoords.x, canvasCoords.y);
    return ndcToWorld(ndcCoords.x, ndcCoords.y);
  }

  // Add event listeners for camera control
  canvas.addEventListener("mousedown", (e: MouseEvent) => {
    camera.isDragging = true;
    const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
    camera.lastMouseX = canvasCoords.x;
    camera.lastMouseY = canvasCoords.y;
  });

  canvas.addEventListener("mousemove", (e: MouseEvent) => {
    if (camera.isDragging) {
      // Get canvas-relative coordinates
      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      
      // Calculate the change in mouse position within canvas
      const dx = canvasCoords.x - camera.lastMouseX;
      const dy = canvasCoords.y - camera.lastMouseY;
      
      // Convert pixel movement to world space movement (accounting for zoom)
      const dimensions = getCanvasDimensions();
      const worldDx = (dx / dimensions.width) * 2 * camera.zoom;
      const worldDy = -(dy / dimensions.height) * 2 * camera.zoom; // Flip Y
      
      // Update camera position
      camera.x -= worldDx;
      camera.y -= worldDy;
      
      // Update last mouse position
      camera.lastMouseX = canvasCoords.x;
      camera.lastMouseY = canvasCoords.y;
      
      updateCameraUniform();
    }
  });

  canvas.addEventListener("mouseup", () => {
    camera.isDragging = false;
  });

  canvas.addEventListener("mouseleave", () => {
    camera.isDragging = false;
  });

  // Improved zoom that zooms toward cursor position
  canvas.addEventListener("wheel", (e: WheelEvent) => {
    e.preventDefault();
    
    // Get world position under the cursor before zoom
    const mouseWorldPos = screenToWorld(e.clientX, e.clientY);
    
    // Adjust zoom based on scroll direction
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9; // Zoom out/in
    camera.zoom *= zoomFactor;
    
    // Clamp zoom to reasonable limits
    camera.zoom = Math.max(0.1, Math.min(10.0, camera.zoom));
    
    // Get new world position under cursor after zoom change
    const newMouseWorldPos = screenToWorld(e.clientX, e.clientY);
    
    // Adjust camera position to keep cursor over the same world point
    camera.x += (mouseWorldPos.x - newMouseWorldPos.x);
    camera.y += (mouseWorldPos.y - newMouseWorldPos.y);
    
    updateCameraUniform();
  }, { passive: false });

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