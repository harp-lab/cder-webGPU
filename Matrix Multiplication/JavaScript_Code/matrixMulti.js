// Initialized a square matrix with random integer values
function initMatrix(matrix, width) {
    for (let i = 0; i < width * width; i++) {
        matrix[i] = Math.floor(Math.random() * 5);
    }
}

// Print a matrix in row-major order
function printMatrix(matrix, width, label) {
    console.log(`\n${label}:`);
    for (let row = 0; row < width; row++) {
        let rowStr = "";
        for (let col = 0; col < width; col++) {
            rowStr += matrix[row * width + col].toString().padStart(4) + " ";
        }
        console.log(rowStr);
    }
}


const width = 512;
const matrixSize = width * width;

const M = new Uint32Array(matrixSize);
const N = new Uint32Array(matrixSize);
const P = new Uint32Array(matrixSize);

initMatrix(M, width);
initMatrix(N, width);

const start = performance.now();

// Matrix multiplication
for(var i = 0; i < width; i++) {
    for(var j = 0; j < width; j++) {
        let temp = 0;
        for(var k = 0; k < width; k++) {
            temp += M[i * width + k] * N[k * width + j];
        }
        P[i * width + j] = temp;
    }
}
const end = performance.now();

// printMatrix(M, width, "Matrix M");
// printMatrix(N, width, "Matrix N");
// printMatrix(P, width, "Matrix P = M x N");

console.log(`CPU computation time: ${end - start} ms`);
