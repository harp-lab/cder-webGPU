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
    private initialCoolingFactor: number;
    private coolingFactor: number;
    private uniformBuffer: GPUBuffer;

    constructor(device: GPUDevice, nodebuffer: GPUBuffer, edges: Edge[]) {
        this.device = device;
        this.nodebuffer = nodebuffer;
        this.edges = edges;
        this.coolingFactor = 0.985;
        this.initialCoolingFactor = 0.1;
        
        // Initialize the adjacency matrix right away
        this.nodeCount = nodebuffer.size / (8 * 4);
        this.createAdjacencyMatrix();

          // We need 4 float32 values
        this.uniformBuffer = this.device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            4,
            new Float32Array([this.coolingFactor, 2 / this.nodeCount]),
            0,
            2
        );
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            new Uint32Array([this.nodeCount]),
            0,
            1
        );

        this.computePipeline = this.device.createComputePipeline({
            layout: "auto",
            compute: {
                module: device.createShaderModule({
                    code: forces
                }),
                entryPoint: "main",
            },
        });
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
        })

    }

    public runForceDirected() {
        if (this.initialCoolingFactor < 0.0001) {
            return;
        }
        console.log(this.initialCoolingFactor);
        const commandEncoder = this.device.createCommandEncoder();
        const pass = commandEncoder.beginComputePass();
        pass.setBindGroup(0, this.bindGroup);
        pass.setPipeline(this.computePipeline);
        pass.dispatchWorkgroups(Math.ceil(this.nodeCount / 64), 1, 1);
        pass.end();
        this.initialCoolingFactor = this.coolingFactor * this.initialCoolingFactor;
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            4,
            new Float32Array([this.initialCoolingFactor]),
            0,
            1
        );
        this.device.queue.submit([commandEncoder.finish()]);
    }

    private createAdjacencyMatrix() {
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