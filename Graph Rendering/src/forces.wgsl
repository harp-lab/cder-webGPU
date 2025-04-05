struct Node {
    pos: vec2f,
    padding: vec2f,
    color: vec4f,
};

struct Uniforms {
    nodes_length : u32,
    cooling_factor : f32,
    ideal_length : f32,
    padding : u32
};

@group(0) @binding(0) var<storage, read_write> nodes : array<Node>;
@group(0) @binding(1) var<storage, read> adjacency_matrix : array<u32>;
@group(0) @binding(2) var<uniform> uniforms : Uniforms;

@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    if (global_id.x > uniforms.nodes_length) {
        return;
    }
    let l = uniforms.ideal_length;
    let node = nodes[global_id.x];
    var force : vec2<f32> = vec2<f32>(0.0, 0.0);
    for (var i : u32 = 0u; i < uniforms.nodes_length; i = i + 1u) {
        if (i == global_id.x) {
            continue;
        }
        var node2 = nodes[i];
        var dist : f32 = distance(node.pos, node2.pos);
        if (adjacency_matrix[i * uniforms.nodes_length + global_id.x] == 1u) {
            var dir : vec2<f32> = normalize(node2.pos - node.pos);
            force += ((dist * dist) / l) * dir;
        } else {
            var dir : vec2<f32> = normalize(node.pos - node2.pos);
            force += ((l * l) / dist) * dir;
        }
    }
    if (length(force) > 0.000000001) {
        force = normalize(force) * min(uniforms.cooling_factor, length(force));
    }
    else{
        force.x = 0.0;
        force.y = 0.0;
    }
    nodes[global_id.x].pos.x += force.x;
    nodes[global_id.x].pos.y += force.y;
}
