@group(0) @binding(0) var<storage, read> M: array<u32>;
@group(0) @binding(1) var<storage, read> N: array<u32>;
@group(0) @binding(2) var<storage, read_write> P: array<u32>;
@group(0) @binding(3) var<storage, read> Width: u32;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row = global_id.y;
    let col = global_id.x;
    if((row < Width) && (col < Width)) {
        var Pvalue: u32 = 0;
        for(var i: u32 = 0u; i < Width; i++) {
            let m = M[row * Width + i];
            let n = N[i * Width + col];
            Pvalue = Pvalue + m * n;
        }
        P[row * Width + col] = Pvalue;
    }
}