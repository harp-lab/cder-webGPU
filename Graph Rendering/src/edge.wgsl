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
    @location(0) color: vec4f
};

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32, 
                @builtin(instance_index) instanceIndex: u32) -> VertexOutput {
    var node = Node();
    if (vertexIndex == 0) {
        node = nodes[edges[instanceIndex].start];
    } else {
        node = nodes[edges[instanceIndex].end];
    }
    var viewPos = (node.pos - camera.position) / camera.zoom;
    
    var output: VertexOutput;
    output.position = vec4f(viewPos, 1.0, 1.0);
    output.color = node.color;
    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    return input.color;
}