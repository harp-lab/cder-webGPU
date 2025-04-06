async function checkWebGPU() {
    const statusElement = document.getElementById('status') as HTMLDivElement;
    
    // Check if WebGPU is supported
    if (!navigator.gpu) {
        statusElement.textContent = 'WebGPU is not supported in your browser.';
        statusElement.style.color = 'red';
        return false;
    }
    
    try {
        // Request adapter
        const adapter = await navigator.gpu.requestAdapter();

        if (!adapter) {
            statusElement.textContent = 'Failed to get GPU adapter.';
            statusElement.style.color = 'red';
            return false;
        }
              
        // Request device
        const device = await adapter.requestDevice();
                      
        // Show success message
        statusElement.textContent = `WebGPU is supported and ready!`;
        statusElement.style.color = 'green';
        return true;
    } catch (error) {
        statusElement.textContent = `Error initializing WebGPU: ${error instanceof Error ? error.message : String(error)}`;
        statusElement.style.color = 'red';
        return false;
    }
}