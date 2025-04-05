@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> output: array<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
    
    // Only process if within array bounds
    if (index < arrayLength(&input)) {
    // Simple computation: double each value
    output[index] = input[index] * 2.0;
    }
}