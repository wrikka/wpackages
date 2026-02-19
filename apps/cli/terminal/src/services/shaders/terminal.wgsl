struct Uniforms {
    resolution: vec2<f32>,
    font_size: f32,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

@vertex
fn vs_main(
    @location(0) position: vec2<f32>,
    @location(1) uv: vec2<f32>,
) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4<f32>(position, 0.0, 1.0);
    output.uv = uv;
    return output;
}

@fragment
fn fs_main(
    @location(0) uv: vec2<f32>,
    @group(0) @binding(0) texture: texture_2d<f32>,
    @group(0) @binding(1) sampler: sampler,
    @group(0) @binding(2) uniforms: Uniforms,
) -> @location(0) vec4<f32> {
    let tex_color = textureSample(texture, sampler, uv);
    return tex_color;
}
