import { jsMultiply } from './js-matrix';
import { runWebGPUMultiplication } from './gpu-matrix';

document.addEventListener('DOMContentLoaded', () => {
  const sizeSlider = document.getElementById("sizeSlider") as HTMLInputElement;
  const sizeDisplay = document.getElementById("matrixSizeDisplay")!;
  const sizeDisplay2 = document.getElementById("matrixSizeDisplay2")!;
  const matrixA = document.getElementById("matrixA")!;
  const matrixB = document.getElementById("matrixB")!;
  const resultMatrix = document.getElementById("resultMatrix")!;
  // const jsTime = document.getElementById("jsTime")!;
  // const gpuTime = document.getElementById("gpuTime")!;
  const calculateBtn = document.getElementById("calculateBtn")!;
  const clearBtn = document.getElementById("clearBtn")!;
  const randomBtn = document.getElementById("randomBtn")!;
  const largeTestBtn = document.getElementById("largeTestBtn")!;
  const largeMatrixSizeSelect = document.getElementById("largeMatrixSize") as HTMLSelectElement;
  const largeMatrixTime = document.getElementById("largeMatrixTime")!;

  let size = parseInt(sizeSlider.value);

  // Create matrix input grids
  function createMatrix(container: HTMLElement, size: number, editable = true) {
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    for (let i = 0; i < size * size; i++) {
      const input = document.createElement("input");
      input.type = "number";
      input.value = "0";
      if (!editable) input.disabled = true;
      container.appendChild(input);
    }
  }

  // Get values from a matrix
  function getMatrixValues(container: HTMLElement, size: number): number[][] {
    const inputs = container.querySelectorAll("input");
    const values: number[][] = [];
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        const index = i * size + j;
        row.push(parseFloat((inputs[index] as HTMLInputElement).value) || 0);
      }
      values.push(row);
    }
    return values;
  }

  // Fill the result matrix
  function setMatrixValues(container: HTMLElement, values: number[][]) {
    const inputs = container.querySelectorAll("input");
    values.flat().forEach((val, i) => {
      (inputs[i] as HTMLInputElement).value = val.toString();
    });
  }

  // Calculate and display result
  async function updateResult() {
    const A = getMatrixValues(matrixA, size);
    const B = getMatrixValues(matrixB, size);

    // JavaScript multiplication
    const start = performance.now();
    const result = jsMultiply(A, B);
    const end = performance.now();

    // WebGPU multiplication
    const runtime = await runWebGPUMultiplication(A, B);

    setMatrixValues(resultMatrix, result);
    const timeTaken = (end - start).toFixed(6);
    // jsTime.textContent = `JavaScript time: ${timeTaken} ms`;
    // gpuTime.textContent = `WebGPU time: ${runtime.toFixed(6)} ms`;
  }

  // Fill random integers into a matrix
  function fillRandomMatrix(container: HTMLElement, size: number) {
    const inputs = container.querySelectorAll("input");
    inputs.forEach(input => {
      (input as HTMLInputElement).value = Math.floor(Math.random() * 10).toString();
    });
  }

  // Reset all matrices to zero
  function clearAllMatrices() {
    [matrixA, matrixB, resultMatrix].forEach(matrix => {
      matrix.querySelectorAll("input").forEach(input => (input as HTMLInputElement).value = "0");
    });
    // jsTime.textContent = `JavaScript time: 0 ms`;
    // gpuTime.textContent = `WebGPU time: 0 ms`;
  }

  // Initialize matrix UI
  function setupMatrices() {
    createMatrix(matrixA, size);
    createMatrix(matrixB, size);
    createMatrix(resultMatrix, size, false);
    // jsTime.textContent = `JavaScript time: 0 ms`;
    // gpuTime.textContent = `WebGPU time: 0 ms`;
  }

  function generateMatrix(n: number): number[][] {
    return Array.from({ length: n }, () =>
      Array.from({ length: n }, () => Math.floor(Math.random() * 10))
    );
  }  

  // Update on slider change
  sizeSlider.addEventListener("input", () => {
    size = parseInt(sizeSlider.value);
    sizeDisplay.textContent = size.toString();
    sizeDisplay2.textContent = size.toString();
    setupMatrices();
  });

  // Button bindings
  calculateBtn.addEventListener("click", updateResult);
  clearBtn.addEventListener("click", clearAllMatrices);
  randomBtn.addEventListener("click", () => {
    fillRandomMatrix(matrixA, size);
    fillRandomMatrix(matrixB, size);
  });

  largeTestBtn.addEventListener("click", async () => {
    const size = parseInt(largeMatrixSizeSelect.value);
    const A = generateMatrix(size);
    const B = generateMatrix(size);
  
    // JS multiply
    const jsStart = performance.now();
    jsMultiply(A, B);
    const jsEnd = performance.now();
    const jsTime = (jsEnd - jsStart).toFixed(6);
  
    // WebGPU multiply
    const gpuTime = await runWebGPUMultiplication(A, B);
    const gpuTimeStr = gpuTime.toFixed(6);
  
    largeMatrixTime.textContent =
      `JavaScript time: ${jsTime} ms, WebGPU time: ${gpuTimeStr} ms`;
  });

  // Initial load
  setupMatrices();
});
