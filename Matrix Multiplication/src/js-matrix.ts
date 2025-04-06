export function jsMultiply(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}