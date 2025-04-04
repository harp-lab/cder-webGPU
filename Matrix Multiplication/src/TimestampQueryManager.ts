export default class TimestampQueryManager {

    // The device may not support timestamp queries, on which case this whole
    // class does nothing.
    timestampSupported: boolean;
  
    // The query objects. This is meant to be used in a ComputePassDescriptor's
    // or RenderPassDescriptor's 'timestampWrites' field.
    #timestampQuerySet: GPUQuerySet;
  
    // A buffer where to store query results
    #timestampBuffer: GPUBuffer;
  
    // A buffer to map this result back to CPU
    #timestampMapBuffer: GPUBuffer;
  
    // Callback to call when results are available.
    #callback: (deltaTimeMs: number) => void;
  
    // Device must have the "timestamp-query" feature
    constructor(device: GPUDevice, callback: (deltaTimeNs: number) => void) {
      this.timestampSupported = device.features.has('timestamp-query');
      if (!this.timestampSupported) return;
  
      this.#callback = callback;
  
      // Create timestamp queries
      this.#timestampQuerySet = device.createQuerySet({
        type: 'timestamp',
        count: 2, // begin and end
      });
  
      // Create a buffer where to store the result of GPU queries
      const timestampByteSize = 8; // timestamps are uint64
      this.#timestampBuffer = device.createBuffer({
        size: this.#timestampQuerySet.count * timestampByteSize,
        usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.QUERY_RESOLVE,
      });
  
      // Create a buffer to map the result back to the CPU
      this.#timestampMapBuffer = device.createBuffer({
        size: this.#timestampBuffer.size,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      });
    }
  
    // Add both a start and end timestamp.
    addTimestampWrite(
      passDescriptor: GPURenderPassDescriptor | GPUComputePassDescriptor
    ) {
      if (this.timestampSupported) {
        // We instruct the render pass to write to the timestamp query before/after
        passDescriptor.timestampWrites = {
          querySet: this.#timestampQuerySet,
          beginningOfPassWriteIndex: 0,
          endOfPassWriteIndex: 1,
        };
      }
      return passDescriptor;
    }
  
    // Resolve the timestamp queries and copy the result into the mappable buffer if possible.
    resolve(commandEncoder: GPUCommandEncoder) {
      if (!this.timestampSupported) return;
  
      // After the end of the measured render pass, we resolve queries into a
      // dedicated buffer.
      commandEncoder.resolveQuerySet(
        this.#timestampQuerySet,
        0 /* firstQuery */,
        this.#timestampQuerySet.count /* queryCount */,
        this.#timestampBuffer,
        0 /* destinationOffset */
      );
  
      if (this.#timestampMapBuffer.mapState === 'unmapped') {
        // Copy values to the mappable buffer
        commandEncoder.copyBufferToBuffer(
          this.#timestampBuffer,
          0,
          this.#timestampMapBuffer,
          0,
          this.#timestampBuffer.size
        );
      }
    }
  
    // Read the values of timestamps.
    tryInitiateTimestampDownload(): void {
      if (!this.timestampSupported) return;
      if (this.#timestampMapBuffer.mapState !== 'unmapped') return;
  
      const buffer = this.#timestampMapBuffer;
      void buffer.mapAsync(GPUMapMode.READ).then(() => {
        const rawData = buffer.getMappedRange();
        const timestamps = new BigUint64Array(rawData);
        
        const elapsedNs = Number(timestamps[1] - timestamps[0]);
        
        if (elapsedNs >= 0) {
          this.#callback(elapsedNs);
        }
        buffer.unmap();
      });
    }
  }