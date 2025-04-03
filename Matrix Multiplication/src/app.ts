import shaderCode from "./matrixMulti.wgsl";
import { quitIfWebGPUNotAvailable } from "./util";
import TimestampQueryManager from "./TimestampQueryManager";

// Initialize the matrices with random values
function init_matrix(matrix: Uint32Array, width: number) {
    for(let i = 0; i < width; i++) {
        for(let j = 0; j < width; j++) {
            matrix[i*width+j] = Math.floor(Math.random() * 5);
        }
    }
}

// Verify the matrix multiplication result
function verify_result(M: Uint32Array, N: Uint32Array, P: Uint32Array, width: number) {
    for (let row = 0; row < width; row++) {
        for (let col = 0; col < width; col++) {
            let sum = 0;
            for (let k = 0; k < width; k++) {
                sum += M[row * width + k] * N[k * width + col];
            }
            const expected = sum;
            const actual = P[row * width + col];
            if (expected !== actual) {
                console.error(`Mismatch at [${row}, ${col}]: expected ${expected}, got ${actual}`);
                return false;
            }
        }
    }
    console.log("Matrix multiplication result is correct.");
}

// Function to print a matrix to the console
function printMatrix(matrix: Uint32Array, width: number, label: string) {
    console.log(`\n${label}:`);
    for (let row = 0; row < width; row++) {
        let rowStr = '';
        for (let col = 0; col < width; col++) {
            rowStr += matrix[row * width + col].toString().padStart(4) + ' ';
        }
        console.log(rowStr);
    }
}


(async () => {
    if (navigator.gpu === undefined) {
        document.getElementById("webgpu-canvas").setAttribute("style", "display:none;");
        document.getElementById("no-webgpu").setAttribute("style", "display:block;");
        return;
    }

    // Get a GPU device to render with
    const adapter = await navigator.gpu?.requestAdapter({
        featureLevel: 'compatibility',
    });
    const supportsTimestampQueries = adapter?.features.has('timestamp-query');
    const device = await adapter?.requestDevice({
        // We request a device that has support for timestamp queries
        requiredFeatures: supportsTimestampQueries ? ['timestamp-query'] : [],
    });
    quitIfWebGPUNotAvailable(adapter, device);

    const computePassDescriptor: GPUComputePassDescriptor = {};
    const perfDisplay = document.querySelector('#info pre');
    const timestampQueryManager = new TimestampQueryManager(device, (elapsedNs) => {
        // Convert from nanoseconds to milliseconds:
        const elapsedMs = Number(elapsedNs) * 1e-6;
        perfDisplay.innerHTML = `Compute Pass duration: ${elapsedMs.toFixed(6)} ms`;
    });

    if (!supportsTimestampQueries) {
        perfDisplay.innerHTML = 'Timestamp queries are not supported';
    }

    // Setup shader modules
    var shaderModule = device.createShaderModule({code: shaderCode});
    var compilationInfo = await shaderModule.getCompilationInfo();
    if (compilationInfo.messages.length > 0) {
        var hadError = false;
        console.log("Shader compilation log:");
        for (var i = 0; i < compilationInfo.messages.length; ++i) {
            var msg = compilationInfo.messages[i];
            console.log(`${msg.lineNum}:${msg.linePos} - ${msg.message}`);
            hadError = hadError || msg.type == "error";
        }
        if (hadError) {
            console.log("Shader failed to compile");
            return;
        }
    }

    // Define the size of matrix
    const Width = 512;
    const matrixSize = Width * Width;
    const bufferSize = matrixSize * Uint32Array.BYTES_PER_ELEMENT;

    // Generate random M and N matrices
    const h_M = new Uint32Array(matrixSize);
    const h_N = new Uint32Array(matrixSize);
    init_matrix(h_M, Width);
    // printMatrix(h_M, Width, "Matrix M");
    init_matrix(h_N, Width);
    // printMatrix(h_N, Width, "Matrix N");

    // Allocate GPU memory for M, N, P, and Width
    const d_M = device.createBuffer({
        label: "M",
        size: bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true
    });
    const d_N = device.createBuffer({
        label: "N",
        size: bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true
    }); 
    const d_P = device.createBuffer({
        label: "P",
        size: bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true
    }); 
    const d_Width = device.createBuffer({
        label: "Width",
        size: 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true
    }); 

    // Transfer M, N, and Width from CPU to GPU
    new Uint32Array(d_M.getMappedRange()).set(h_M);
    new Uint32Array(d_N.getMappedRange()).set(h_N);
    new Uint32Array(d_Width.getMappedRange()).set([Width]);

    // Unmap the buffers
    d_M.unmap();
    d_N.unmap();
    d_P.unmap();
    d_Width.unmap();

    // BInd group layout and bind group
    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: {type: "read-only-storage" as GPUBufferBindingType}},  // M
            {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: {type: "read-only-storage" as GPUBufferBindingType}},  // N
            {binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: {type: "storage" as GPUBufferBindingType}},            // P
            {binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: {type: "read-only-storage" as GPUBufferBindingType}},  // Width
        ]
    });
    
    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            {binding: 0, resource: {buffer: d_M}},
            {binding: 1, resource: {buffer: d_N}},
            {binding: 2, resource: {buffer: d_P}},
            {binding: 3, resource: {buffer: d_Width}}
        ]
    });

    // Create a pipeline layout
    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
    });

    // Create a compute pipeline
    const computePipeline = device.createComputePipeline({
        layout: pipelineLayout,
        compute: {
            module: shaderModule,
            entryPoint: "main",
        },
    });

    timestampQueryManager.addTimestampWrite(computePassDescriptor);

    // Create a command encoder and a compute pass
    const commandEncoder = device.createCommandEncoder();
    const pass = commandEncoder.beginComputePass(computePassDescriptor);
    pass.setPipeline(computePipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(Math.ceil(Width / 16), Math.ceil(Width / 16));
    pass.end();

    timestampQueryManager.resolve(commandEncoder);

    // Copy the result from GPU to CPU
    const h_P = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
    commandEncoder.copyBufferToBuffer(d_P, 0, h_P, 0, bufferSize);

    // Wait for the queue to finish and read the result
    device.queue.submit([commandEncoder.finish()]);
    await device.queue.onSubmittedWorkDone();
    await h_P.mapAsync(GPUMapMode.READ);
    timestampQueryManager.tryInitiateTimestampDownload();

    const result = new Uint32Array(h_P.getMappedRange());

    // Print the result matrix
    // printMatrix(result, Width, "Matrix P");

    // Verify the result
    verify_result(h_M, h_N, result, Width);
})();
