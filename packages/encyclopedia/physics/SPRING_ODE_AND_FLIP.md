# Spring ODEs and FLIP Animations

## Harmonic Oscillator Second-Order Differential Equation

UI spring animations model a damped harmonic oscillator. The motion of a mass $m$ attached to a spring with stiffness $k$ and damping coefficient $c$, aiming for a target resting position $x_t$, is governed by Newton's Second Law:
$$m \ddot{x} + c \dot{x} + k(x - x_t) = 0$$

Dividing by $m$ yields the standard kinematic form:
$$\ddot{x} + 2\zeta\omega_n\dot{x} + \omega_n^2(x - x_t) = 0$$
Where:
- $\omega_n = \sqrt{k/m}$ is the undamped angular frequency (controls speed).
- $\zeta = \frac{c}{2\sqrt{km}}$ is the damping ratio (controls bounciness).
  - $\zeta < 1$: Underdamped (bouncy)
  - $\zeta = 1$: Critically damped (fastest settling without oscillation)
  - $\zeta > 1$: Overdamped (sluggish)

## Analytical Closed-Form vs RK4 Numerical Integration

### Analytical Closed-Form
For an underdamped system ($\zeta < 1$), the exact position at time $t$ is:
$$x(t) = x_t + e^{-\zeta\omega_n t} \left[ (x_0 - x_t) \cos(\omega_d t) + \frac{\dot{x}_0 + \zeta\omega_n(x_0 - x_t)}{\omega_d} \sin(\omega_d t) \right]$$
Where $\omega_d = \omega_n\sqrt{1-\zeta^2}$. 
**Pros:** $O(1)$ computation for any $t$. Perfect for stateless frame interpolation.
**Cons:** Fails to support dynamic mid-flight target $x_t$ updates without complex boundary condition recalculations.

### RK4 Numerical Integration (Runge-Kutta 4th Order)
A step-wise approximation evaluating the derivative at four points within the timestep $\Delta t$:
$$k_1 = f(t_n, y_n)$$
$$k_2 = f(t_n + \frac{\Delta t}{2}, y_n + k_1 \frac{\Delta t}{2})$$
$$k_3 = f(t_n + \frac{\Delta t}{2}, y_n + k_2 \frac{\Delta t}{2})$$
$$k_4 = f(t_n + \Delta t, y_n + k_3 \Delta t)$$
$$y_{n+1} = y_n + \frac{\Delta t}{6}(k_1 + 2k_2 + 2k_3 + k_4)$$
**Pros:** Easily handles dynamic inputs (mass, stiffness, target changing per frame).
**Cons:** Requires stateful iteration, susceptible to explosion if $\Delta t$ is too large.

## Matrix Inversion for Child Glyph Counter-Scaling

In FLIP (First, Last, Invert, Play) animations, scaling a parent container distorts its children (e.g., text stretching). To maintain child geometry while the parent scales by $(s_x, s_y)$, the child must apply an inverse scale transformation matrix.

Parent Transformation:
$$M_{parent} = \begin{bmatrix} s_x & 0 & 0 \\ 0 & s_y & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

To counteract this, the child applies the inverse matrix:
$$M_{child} = M_{parent}^{-1} = \begin{bmatrix} 1/s_x & 0 & 0 \\ 0 & 1/s_y & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

This guarantees the child's global scale remains $1.0$ throughout the interpolation phase.
$$(M_{parent} \cdot M_{child}) \cdot v = I \cdot v = v$$
In CSS/JS: `transform: scale(${1/sx}, ${1/sy})` prevents typographical shearing during spatial transitions.
