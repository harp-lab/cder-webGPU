import shaderCode from "./arrayMulti.wgsl";

(async () => {
    if (navigator.gpu === undefined) {
        document.getElementById("webgpu-canvas").setAttribute("style", "display:none;");
        document.getElementById("no-webgpu").setAttribute("style", "display:block;");
        return;
    }

    // Check for WebGPU support
    if (!navigator.gpu) {
        throw new Error("WebGPU not supported on this browser.");
    }

    // Request an adapter
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No appropriate GPU adapter found.");
    }

    // Request a device from the adapter
    const device = await adapter.requestDevice();
    
    // Log success message
    console.log("WebGPU device initialized successfully");

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

    // Create the data for our compute operation
    // We'll create an array of 1000 floating point numbers
    const dataCount = 1000;
    const data = new Float32Array(dataCount);
    // Initialize with values from 0 to 999
    for (let i = 0; i < dataCount; i++) {
        data[i] = i;
    }

    // Create an input buffer with our data
    const inputBuffer = device.createBuffer({
        label: "Input Buffer",
        size: data.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false
    });

    // Write our data to the input buffer
    device.queue.writeBuffer(inputBuffer, 0, data);

    // Create an output buffer to store results
    const outputBuffer = device.createBuffer({
        label: "Output Buffer",
        size: data.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: false
    });

    // Create a result staging buffer
    // This is used to read back the results from the GPU
    const resultStagingBuffer = device.createBuffer({
        label: "Result Staging Buffer",
        size: data.byteLength,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false
    });

    // BInd group layout and bind group
    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: {type: "read-only-storage" as GPUBufferBindingType}},  // input
            {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: {type: "storage" as GPUBufferBindingType}},            // output
        ]
    });
    
    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            {binding: 0, resource: {buffer: inputBuffer}},
            {binding: 1, resource: {buffer: outputBuffer}},
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

    // Create a command encoder and a compute pass
    const commandEncoder = device.createCommandEncoder();
    const pass = commandEncoder.beginComputePass();
    pass.setPipeline(computePipeline);
    pass.setBindGroup(0, bindGroup);

    // Calculate workgroup counts based on data size and workgroup size
    const workgroupSize = 64; // Must match shader's @workgroup_size
    const workgroupCount = Math.ceil(dataCount / workgroupSize);

    pass.dispatchWorkgroups(workgroupCount, 1, 1);
    pass.end();

    // Copy output to staging buffer for reading
    commandEncoder.copyBufferToBuffer(outputBuffer, 0, resultStagingBuffer, 0, data.byteLength);

    // Submit commands to the queue
    const commandBuffer = commandEncoder.finish();
    device.queue.submit([commandBuffer]);
    
    // Read back the results
    await resultStagingBuffer.mapAsync(GPUMapMode.READ);
    const resultArrayBuffer = resultStagingBuffer.getMappedRange();
    const resultData = new Float32Array(resultArrayBuffer);

    // Log some results to verify
    console.log("Original data (first 10 values):", data.slice(0, 10));
    console.log("Result data (first 10 values):", resultData.slice(0, 10));

    // Compare input and output to verify the operation
    let allCorrect = true;
    for (let i = 0; i < dataCount; i++) {
        if (resultData[i] !== data[i] * 2.0) {
        console.error(`Mismatch at index ${i}: expected ${data[i] * 2.0}, got ${resultData[i]}`);
        allCorrect = false;
        break;
        }
    }
    
    if (allCorrect) {
        console.log("Compute operation successful! All values correctly doubled.");
    }

    // Clean up
    resultStagingBuffer.unmap();
})();
