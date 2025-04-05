struct Node {
    pos: vec2f,
    padding: vec2f,
    color: vec4f,
};

struct Edge {
    start: u32,
    end: u32,
    padding: vec2u
}

struct Camera {
    position: vec2f,
    zoom: f32,
    padding: f32,
};

@group(0) @binding(0) var<storage, read> nodes: array<Node>;
@group(0) @binding(1) var<storage, read> edges: array<Edge>;
@group(0) @binding(2) var<uniform> camera: Camera;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) @interpolate(flat) center: vec2f,
    @location(2) pos: vec2f
};

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32, 
                @builtin(instance_index) instanceIndex: u32) -> VertexOutput {
    // Node vertices (square centered at origin)
    var positions = array<vec2f, 6>(
        vec2f(-0.02, -0.02),
        vec2f(0.02, -0.02),
        vec2f(0.02, 0.02),
        vec2f(-0.02, 0.02),
        vec2f(-0.02, -0.02),
        vec2f(0.02, 0.02)
    );
    var testEdge = edges[0];
    
    // Proper camera transform for zooming
    // 1. Apply object position (square center)
    // 2. Subtract camera position to move camera
    // 3. Apply zoom (divide by zoom factor to make objects appear smaller when zooming out)
    var worldPos = positions[vertexIndex] + nodes[instanceIndex].pos;
    var viewPos = (worldPos - camera.position) / camera.zoom;
    
    var output: VertexOutput;
    output.position = vec4f(viewPos, 0.0, 1.0);
    output.color = nodes[instanceIndex].color;
    output.pos = worldPos;
    output.center = nodes[instanceIndex].pos;
    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    let dist = distance(input.pos, input.center);
    if (dist > 0.02) {
        discard;
    }

    return input.color;
}