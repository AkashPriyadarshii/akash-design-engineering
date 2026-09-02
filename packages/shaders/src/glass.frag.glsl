#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSceneTexture;   // Background scene render target (with mipmaps)
uniform sampler2D uNormalMap;       // Surface perturbation normal map
uniform vec2 uResolution;
uniform float uIOR;                 // Index of Refraction (e.g., 1.52)
uniform float uDispersion;          // Spectral split delta (e.g., 0.035)
uniform float uThickness;           // Glass slab thickness (e.g., 0.12)
uniform float uRoughness;           // Frosted blur level [0.0, 1.0]
uniform vec3 uTintColor;            // Glass volumetric tint

float fresnelSchlick(float cosTheta, float F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
    vec3 V = normalize(vec3(0.0, 0.0, 1.0));
    vec3 N = normalize(texture(uNormalMap, vUv).xyz * 2.0 - 1.0);

    float NdotV = max(dot(N, V), 0.0);
    float F = fresnelSchlick(NdotV, 0.04);

    // Chromatic dispersion offsets (Snell's Law per wavelength)
    float etaR = 1.0 / (uIOR - uDispersion);
    float etaG = 1.0 / uIOR;
    float etaB = 1.0 / (uIOR + uDispersion);

    vec3 refR = refract(-V, N, etaR);
    vec3 refG = refract(-V, N, etaG);
    vec3 refB = refract(-V, N, etaB);

    float lod = uRoughness * 6.0;
    float r = textureLod(uSceneTexture, vUv + refR.xy * uThickness, lod).r;
    float g = textureLod(uSceneTexture, vUv + refG.xy * uThickness, lod).g;
    float b = textureLod(uSceneTexture, vUv + refB.xy * uThickness, lod).b;
    vec3 refractedColor = vec3(r, g, b);

    // Beer-Lambert absorption
    vec3 absorption = exp(-((vec3(1.0) - uTintColor) * 6.0) * (uThickness / max(NdotV, 0.1)));
    refractedColor *= absorption;

    // Specular highlight
    vec3 L = normalize(vec3(0.5, 0.8, 1.0));
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 32.0) * (1.0 - uRoughness * 0.5);
    vec3 specularColor = vec3(1.0) * spec * F;

    vec3 finalColor = mix(refractedColor, vec3(1.0), F * 0.3) + specularColor;
    fragColor = vec4(finalColor, 1.0);
}
