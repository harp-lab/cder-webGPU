import nodeShaderCode from "./node.wgsl";
import edgeShaderCode from "./edge.wgsl";
import { 
  createCamera, 
  setupCameraControls 
} from "./camera";
import { ForceDirectedLayout } from "./forceDirected";

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

  // Initialize camera
  const camera = createCamera();

  const N = 10;
  // Node interface
  interface Node {
    x: number;
    y: number;
    color: number[];
  }
  // Generate 5 random nodes
  const nodes: Node[] = Array.from({ length: N }, () => ({
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
  interface Edge {
    start: number;
    end: number;
  }
  const edges: Edge[] = Array.from({ length: N }, (_, index) => ({
    start: index,
    end: (index + 1) % N
  }));

  // Create buffer for node data (8 floats per node: 2 for position, 2 for padding, 4 for color)
  const nodeData = new Float32Array(nodes.length * 8);
  // Create buffer for edge data (2 floats per edge, 2 for padding)
  const edgeData = new Uint32Array(edges.length * 4);

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

  // Set up node and edge data
  nodes.forEach((node, i) => {
    const offset = i * 8;
    nodeData[offset] = node.x;
    nodeData[offset + 1] = node.y;
    nodeData[offset + 2] = 0.0;
    nodeData[offset + 3] = 0.0;
    nodeData[offset + 4] = node.color[0];
    nodeData[offset + 5] = node.color[1];
    nodeData[offset + 6] = node.color[2];
    nodeData[offset + 7] = node.color[3];
  });
  edges.forEach((edge, i) => {
    const offset = i * 4;
    edgeData[offset] = edge.start;
    edgeData[offset + 1] = edge.end;
    edgeData[offset + 2] = 0;
    edgeData[offset + 3] = 0;
  });

  const nodeBuffer = device.createBuffer({
    size: nodeData.byteLength,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });
  new Float32Array(nodeBuffer.getMappedRange()).set(nodeData);
  nodeBuffer.unmap();

  const edgeBuffer = device.createBuffer({
    size: edgeData.byteLength,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });
  new Uint32Array(edgeBuffer.getMappedRange()).set(edgeData);
  edgeBuffer.unmap();

  const forces = new ForceDirectedLayout(device, nodeBuffer, edges);
  
  // Create bind group layout (now with camera uniform buffer)
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

  const bindGroup = device.createBindGroup({
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

  const nodeShaderModule = device.createShaderModule({
    code: nodeShaderCode
  });
  const edgeShaderModule = device.createShaderModule({
    code: edgeShaderCode
  });
  console.log(edgeData)

  // Create pipeline
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
  var count = 0;

  // Render function
  async function render(): Promise<void> {
    count++;
    forces.runForceDirected();

    const commandEncoder = device.createCommandEncoder();
    const pass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        storeOp: "store",
        clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }
      }]
    });
    
    pass.setPipeline(nodePipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6, nodes.length);
    pass.setPipeline(edgePipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(2, edges.length);
    pass.end();
    
    device.queue.submit([commandEncoder.finish()]);

    await device.queue.onSubmittedWorkDone();
    requestAnimationFrame(render);
  }

  render();
}

window.addEventListener("load", main);