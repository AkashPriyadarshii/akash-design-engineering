# Concentric Radii Mathematics in UI Design

## Derivation of Concentric Corner Radii

When nesting a rounded rectangle within another, matching corner radii mathematically fail to produce a visually concentric border. A uniform gap requires the center of curvature for both arcs to share the same origin point.

Let the outer rounded rectangle have a corner radius $R_{outer}$.
Let $P$ be the padding between the outer and inner bounding boxes.
Let $B$ be the border width (if applicable, zero otherwise).

The distance from the center of curvature to the outer edge is $R_{outer}$.
To maintain concentricity, the distance from the center of curvature to the inner edge must be exactly $R_{outer} - P - B$.
Thus, the required inner radius $R_{inner}$ is:
$$R_{inner} = R_{outer} - P - B$$

### Preventing Negative Radii
If the padding exceeds the outer radius ($P + B > R_{outer}$), the mathematical inner radius becomes negative, representing an inversion of the curve. In standard UI rendering systems (CSS, Canvas, Compose), a negative radius is invalid or renders unpredictably. We clamp the value to zero, defaulting to a sharp right angle, which geometrically satisfies the bounding box constraints.
$$R_{inner} = \max(0, R_{outer} - P - B)$$

## Elimination of Elliptical Edge Pinch

If $R_{inner} = R_{outer}$ is incorrectly applied, the gap at the 45-degree diagonal is narrower than the orthogonal gap.
Orthogonal gap: $G_{orth} = P$
Diagonal gap: $G_{diag} = (R_{outer}) - (R_{inner} - P\sqrt{2})$ (when misaligned)

With matching radii, the centers of curvature do not align, resulting in an "elliptical pinch" where the inner curve appears to bulge towards the corners. By enforcing $R_{inner} = R_{outer} - P$, the centers of the circular arcs become strictly coincident $(x_c, y_c)$. 
The arc equations:
$$Outer: (x - x_c)^2 + (y - y_c)^2 = R_{outer}^2$$
$$Inner: (x - x_c)^2 + (y - y_c)^2 = (R_{outer} - P)^2$$
This ensures the radial derivative $\frac{dR}{d\theta} = 0$, guaranteeing a uniform gap across the entire $0$ to $\pi/2$ sweep of the corner.
