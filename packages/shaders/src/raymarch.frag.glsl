#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;

#define MAX_STEPS 80
#define SURF_DIST 0.001
#define MAX_DIST 20.0

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

mat2 rot2D(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

float map(vec3 p) {
    vec3 pM = p;
    pM.xy *= rot2D(uTime * 0.2);
    pM.yz *= rot2D(uTime * 0.15);

    float sphere = length(pM) - 1.1;
    float torus = length(vec2(length(pM.xz) - 1.2, pM.y)) - 0.35;
    return smin(sphere, torus, 0.4);
}

vec3 calcNormal(vec3 p) {
    const vec2 e = vec2(1.0, -1.0) * 0.0005;
    return normalize(
        e.xyy * map(p + e.xyy) +
        e.yyx * map(p + e.yyx) +
        e.yxy * map(p + e.yxy) +
        e.xxx * map(p + e.xxx)
    );
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
    vec3 ro = vec3(0.0, 0.0, 3.5);
    vec3 rd = normalize(vec3(uv, -1.8));

    float t = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if (d < SURF_DIST || t > MAX_DIST) break;
        t += d * 0.85;
    }

    vec3 col = mix(vec3(0.05, 0.05, 0.07), vec3(0.09, 0.09, 0.13), length(uv));

    if (t < MAX_DIST) {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);
        vec3 v = -rd;
        vec3 l = normalize(vec3(2.0, 3.0, 2.5) - p);
        vec3 h = normalize(l + v);

        float diff = max(dot(n, l), 0.0);
        float spec = pow(max(dot(n, h), 0.0), 32.0);
        float fresnel = pow(1.0 - max(dot(v, n), 0.0), 4.0);

        vec3 albedo = vec3(0.92, 0.88, 0.82);
        col = albedo * diff + vec3(1.0) * (spec + fresnel * 0.3);
    }

    // ACES Tone Map
    col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
    fragColor = vec4(col, 1.0);
}
