import forces from "./forces.wgsl";

interface Edge {
    start: number;
    end: number;
}

export class ForceDirectedLayout {
    private adjacencyMatrixBuffer: GPUBuffer | null = null;
    private computePipeline: GPUComputePipeline | null = null;
    private bindGroup: GPUBindGroup | null = null;
    private nodeCount: number = 0;
    private device: GPUDevice;
    private nodebuffer: GPUBuffer;
    private edges: Edge[];
    private coolingFactor: number;
    private currentCoolingFactor: number;
    private uniformBuffer: GPUBuffer;
    private iterationCount: number = 0;

    constructor(device: GPUDevice, nodebuffer: GPUBuffer, edges: Edge[], coolingFactor: number = 0.975) {
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
                    code: forces
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
    private updateUniformBuffer(): void {
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            new Uint32Array([this.nodeCount]),
            0,
            1
        );
        
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            4,
            new Float32Array([this.currentCoolingFactor, 2 / this.nodeCount]),
            0,
            2
        );
    }

    // Set the cooling factor
    public setCoolingFactor(newCoolingFactor: number): void {
        this.coolingFactor = newCoolingFactor;
        // Reset the current cooling factor to allow re-running the algorithm
        this.currentCoolingFactor = 0.5;
        this.iterationCount = 0;
        this.updateUniformBuffer();
    }

    // Reset the algorithm
    public reset(): void {
        this.currentCoolingFactor = 0.5;
        this.iterationCount = 0;
        this.updateUniformBuffer();
    }

    // Run a single iteration of force-directed layout
    public runForceDirected(): boolean {
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
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            4,
            new Float32Array([this.currentCoolingFactor]),
            0,
            1
        );
        
        // Submit command buffer
        this.device.queue.submit([commandEncoder.finish()]);
        
        // Increment iteration count
        this.iterationCount++;
        
        return true; // Indicate algorithm is still running
    }

    // Create adjacency matrix from edges
    private createAdjacencyMatrix(): void {
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