#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uColorLevels; // e.g., 4.0 for 4-tier quantization

// 4x4 Ordered Bayer Matrix
const float bayerMatrix[16] = float[16](
     0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
    12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
     3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
    15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
);

float bayer4(vec2 p) {
    int x = int(mod(p.x, 4.0));
    int y = int(mod(p.y, 4.0));
    int index = x + y * 4;
    return bayerMatrix[index];
}

void main() {
    vec4 color = texture(tDiffuse, vUv);
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    vec2 pixelCoord = vUv * uResolution;
    float threshold = bayer4(pixelCoord) - 0.5;
    
    float ditheredLuma = floor(luma * uColorLevels + threshold) / uColorLevels;
    fragColor = vec4(vec3(ditheredLuma), color.a);
}
