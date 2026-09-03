# OKLCH and GLSL Dispersion Optics

## OKLCH Color Space Perceptual Uniformity

OKLCH is a polar coordinate transformation of the Oklab color space, designed to maintain perceptual uniformity across hue shifts. Oklab maps LMS cone responses via a non-linear $M_1$ transformation to estimate perceived lightness ($L$), red-green ($a$), and yellow-blue ($b$).

The transformation to OKLCH is:
$$C = \sqrt{a^2 + b^2}$$
$$h = \operatorname{atan2}(b, a)$$

Unlike HSL, where lightness is mathematically decoupled from perceived luminance, OKLCH guarantees that interpolating between $h_1$ and $h_2$ at constant $L$ and $C$ results in zero lightness shifting. The $\Delta E_{OK}$ metric for perceptual distance is simply Euclidean in the Oklab space:
$$\Delta E_{OK} = \sqrt{\Delta L^2 + \Delta a^2 + \Delta b^2}$$

## Chroma-Bleeding Algorithms for Neutrals

Pure grayscale ($C = 0$) appears sterile in digital UI. "Chroma-bleeding" injects ambient environmental hues into neutral surfaces. To maintain the perception of neutrality while warming/cooling the surface, chroma is clamped slightly above the perceivable threshold.

For a target background hue $h_{bg}$, the neutral surface color is calculated as:
$$L_{surface} = L_{target}$$
$$C_{surface} = \max(0.006, C_{bg} \cdot \alpha)$$
$$h_{surface} = h_{bg}$$

A chroma of $C \ge 0.006$ ensures the color is not mathematically desaturated, allowing it to sit harmoniously over varied backgrounds without shifting into dissonant grey values.

## Snell's Law and Cauchy's Equation in GLSL Glass Shaders

To simulate chromatic aberration and refractive index ($IOR$) variance in real-time GLSL glass materials, Snell's law computes the view vector refraction:
$$\eta_1 \sin(\theta_1) = \eta_2 \sin(\theta_2)$$
$$\vec{R} = \operatorname{refract}(\vec{V}, \vec{N}, \frac{\eta_1}{\eta_2})$$

Dispersion (the variance of IOR with wavelength $\lambda$) is approximated using Cauchy's Equation:
$$n(\lambda) = B + \frac{C}{\lambda^2}$$
For a glass shader, three distinct refractive indices are computed for RGB channels:
$$n_{red} \approx 1.50, \quad n_{green} \approx 1.52, \quad n_{blue} \approx 1.54$$

In GLSL:
```glsl
vec3 V = normalize(cameraPos - fragPos);
vec3 N = normalize(normal);
float iorR = 1.0 / 1.50;
float iorG = 1.0 / 1.52;
float iorB = 1.0 / 1.54;

vec3 refractR = refract(-V, N, iorR);
vec3 refractG = refract(-V, N, iorG);
vec3 refractB = refract(-V, N, iorB);

float r = texture(envMap, refractR).r;
float g = texture(envMap, refractG).g;
float b = texture(envMap, refractB).b;
```
This multi-tap sampling creates physically accurate chromatic fringing at the geometry edges, critical for photorealistic optical material perception.
