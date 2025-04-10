import shaderCode from "./arrayMulti.wgsl";

(async () => {
    // Get the info element where we'll display results
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
    // Request a device from the adapter
    const device = await adapter.requestDevice();
    
    // Log success message to the page
    if (infoElement) {
        infoElement.textContent = "WebGPU device initialized successfully\n";
    }

    // Setup shader modules
    var shaderModule = device.createShaderModule({code: shaderCode});
    var compilationInfo = await shaderModule.getCompilationInfo();
    if (compilationInfo.messages.length > 0) {
        var hadError = false;
        let logMessage = "Shader compilation log:\n";
        for (var i = 0; i < compilationInfo.messages.length; ++i) {
            var msg = compilationInfo.messages[i];
            logMessage += `${msg.lineNum}:${msg.linePos} - ${msg.message}\n`;
            hadError = hadError || msg.type == "error";
        }
        if (hadError) {
            logMessage += "Shader failed to compile";
            if (infoElement) {
                infoElement.textContent += logMessage;
            }
            return;
        }
        if (infoElement) {
            infoElement.textContent += logMessage;
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

    // Create HTML content for displaying results
    let resultHtml = "";
    
    // Add a heading for the input data
    resultHtml += "Original data (first 10 values):\n";
    // Display first 10 input values
    for (let i = 0; i < 10; i++) {
        resultHtml += `[${i}]: ${data[i]}\n`;
    }
    
    // Add a heading for the output data
    resultHtml += "\nResult data (first 10 values):\n";
    // Display first 10 output values
    for (let i = 0; i < 10; i++) {
        resultHtml += `[${i}]: ${resultData[i]}\n`;
    }
    
    // Compare input and output to verify the operation
    let allCorrect = true;
    for (let i = 0; i < dataCount; i++) {
        if (resultData[i] !== data[i] * 2.0) {
            resultHtml += `\nMismatch at index ${i}: expected ${data[i] * 2.0}, got ${resultData[i]}\n`;
            allCorrect = false;
            break;
        }
    }
    
    if (allCorrect) {
        resultHtml += "\nCompute operation successful! All values correctly doubled.";
    }
    
    // Update the info element with all results
    if (infoElement) {
        infoElement.textContent += resultHtml;
    }

    // Clean up
    resultStagingBuffer.unmap();
})();