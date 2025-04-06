import nodeShaderCode from "./node.wgsl";
import edgeShaderCode from "./edge.wgsl";
import { 
  createCamera, 
  setupCameraControls 
} from "./camera";
import { ForceDirectedLayout } from "./forceDirected";

// Global variables for state management
let device : GPUDevice;
let context : GPUCanvasContext;
let format;
let nodes = [];
let edges = [];
let nodeBuffer;
let edgeBuffer;
let forces : ForceDirectedLayout;
let animationId : number | null = null;
let bindGroup : GPUBindGroup = null;
let startForces = false;

// Configuration options
let numNodes = 10;
let coolingFactor = 0.975;

async function main() {
  // Canvas and device setup
  const canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement;
  if (!navigator.gpu) {
    document.getElementById("no-webgpu").style.display = "block";
    return;
  }
  
  device = await navigator.gpu.requestAdapter().then(adapter => adapter?.requestDevice());
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
  const camera = createCamera();

  // Create a uniform buffer for camera data
  const cameraUniformBuffer = device.createBuffer({
    size: 16, // Aligned size for 3 floats (x, y, zoom) + padding
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Update camera uniforms
  function updateCameraUniform() {
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
    code: nodeShaderCode
  });
  const edgeShaderModule = device.createShaderModule({
    code: edgeShaderCode
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
    
    if ((document.getElementById("random-graph-type") as HTMLInputElement).checked) {
      // Create a random graph
      edges = [];
      for (let i = 0; i < numNodes; i++) {
        edges.push({
          start: i,
          end: Math.floor(Math.random() * numNodes)
        });
      }
    } else {
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
    forces = new ForceDirectedLayout(device, nodeBuffer, edges, coolingFactor);
    
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
    const coolingFactorSlider = document.getElementById('cooling-factor') as HTMLInputElement;
    const coolingFactorValue = document.getElementById('cooling-value');
    
    coolingFactorSlider.addEventListener('input', () => {
      coolingFactor = parseFloat(coolingFactorSlider.value);
      coolingFactorValue.textContent = coolingFactor.toFixed(3);
      
      if (forces) {
        forces.setCoolingFactor(coolingFactor);
      }
    });
    
    // Node count slider
    const nodeCountSlider = document.getElementById('node-count') as HTMLInputElement;
    const nodeCountValue = document.getElementById('node-count-value');
    
    nodeCountSlider.addEventListener('input', () => {
      numNodes = parseInt(nodeCountSlider.value);
      nodeCountValue.textContent = `${numNodes}`;
    });
  }
}

// Start the application when the page loads
window.addEventListener("load", main);