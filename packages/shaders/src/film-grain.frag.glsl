#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uIntensity; // e.g. 0.04

float hash(vec2 p, float t) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031 + fract(t * 0.6180339887));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {
    vec4 baseColor = texture(tDiffuse, vUv);
    float luma = dot(baseColor.rgb, vec3(0.2126, 0.7152, 0.0722));

    // Kodak film bell curve response concentrated in midtones
    float midtoneWeight = 4.0 * luma * (1.0 - luma);
    midtoneWeight = clamp(midtoneWeight, 0.0, 1.0);

    float noiseR = hash(vUv * 1000.0 + vec2(0.0, 0.0), uTime);
    float noiseG = hash(vUv * 1000.0 + vec2(1.7, 3.1), uTime);
    float noiseB = hash(vUv * 1000.0 + vec2(4.9, 7.3), uTime);
    vec3 noise = (vec3(noiseR, noiseG, noiseB) * 2.0 - 1.0) * uIntensity * midtoneWeight;

    fragColor = vec4(baseColor.rgb + noise, baseColor.a);
}
