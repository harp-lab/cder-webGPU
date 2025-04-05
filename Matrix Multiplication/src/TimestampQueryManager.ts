export default class TimestampQueryManager {

  timestampSupported: boolean;

  #timestampQuerySet: GPUQuerySet;
  #timestampBuffer: GPUBuffer;
  #timestampMapBuffer: GPUBuffer;
  #callback?: (deltaTimeNs: number) => void;

  constructor(device: GPUDevice, callback?: (deltaTimeNs: number) => void) {
    this.timestampSupported = device.features.has('timestamp-query');
    if (!this.timestampSupported) return;

    this.#callback = callback;

    const timestampByteSize = 8;
    this.#timestampQuerySet = device.createQuerySet({
      type: 'timestamp',
      count: 2,
    });

    this.#timestampBuffer = device.createBuffer({
      size: this.#timestampQuerySet.count * timestampByteSize,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.QUERY_RESOLVE,
    });

    this.#timestampMapBuffer = device.createBuffer({
      size: this.#timestampBuffer.size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
  }

  addTimestampWrite(
    passDescriptor: GPURenderPassDescriptor | GPUComputePassDescriptor
  ) {
    if (this.timestampSupported) {
      passDescriptor.timestampWrites = {
        querySet: this.#timestampQuerySet,
        beginningOfPassWriteIndex: 0,
        endOfPassWriteIndex: 1,
      };
    }
    return passDescriptor;
  }

  resolve(commandEncoder: GPUCommandEncoder) {
    if (!this.timestampSupported) return;

    commandEncoder.resolveQuerySet(
      this.#timestampQuerySet,
      0,
      this.#timestampQuerySet.count,
      this.#timestampBuffer,
      0
    );

    if (this.#timestampMapBuffer.mapState === 'unmapped') {
      commandEncoder.copyBufferToBuffer(
        this.#timestampBuffer,
        0,
        this.#timestampMapBuffer,
        0,
        this.#timestampBuffer.size
      );
    }
  }

  tryInitiateTimestampDownload(): void {
    if (!this.timestampSupported) return;
    if (this.#timestampMapBuffer.mapState !== 'unmapped') return;

    const buffer = this.#timestampMapBuffer;
    void buffer.mapAsync(GPUMapMode.READ).then(() => {
      const rawData = buffer.getMappedRange();
      const timestamps = new BigUint64Array(rawData);
      const elapsedNs = Number(timestamps[1] - timestamps[0]);
      if (elapsedNs >= 0 && this.#callback) {
        this.#callback(elapsedNs);
      }
      buffer.unmap();
    });
  }

  async downloadTimestampResult(): Promise<number> {
    if (!this.timestampSupported) return 0;
    if (this.#timestampMapBuffer.mapState !== 'unmapped') return 0;

    await this.#timestampMapBuffer.mapAsync(GPUMapMode.READ);
    const rawData = this.#timestampMapBuffer.getMappedRange();
    const timestamps = new BigUint64Array(rawData);
    const elapsedNs = Number(timestamps[1] - timestamps[0]);
    this.#timestampMapBuffer.unmap();
    return elapsedNs;
  } 
}
