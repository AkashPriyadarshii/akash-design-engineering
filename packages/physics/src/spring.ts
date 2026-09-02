/**
 * @design-engineer/physics - KineticSpring
 * Zero-dependency harmonic oscillator spring solver supporting both
 * exact closed-form analytical integration and 4th-order Runge-Kutta (RK4).
 */

export interface SpringConfig {
  stiffness?: number; // k in N/m (default: 180)
  damping?: number;   // c in N·s/m (default: 12)
  mass?: number;      // m in kg (default: 1.0)
  restThreshold?: number; // Precision delta (default: 0.001)
}

export interface AppleSpringConfig {
  duration: number; // Natural response period (seconds)
  bounce: number;   // -1.0 to 1.0 (0 = critical damping, 0.2 = standard UI bounce)
}

export class KineticSpring {
  public current: number;
  public target: number;
  public velocity: number;

  public mass: number;
  public stiffness: number;
  public damping: number;
  public restThreshold: number;

  constructor(initialPosition: number, config: SpringConfig = {}) {
    this.current = initialPosition;
    this.target = initialPosition;
    this.velocity = 0;

    this.mass = Math.max(0.001, config.mass ?? 1.0);
    this.stiffness = Math.max(0.001, config.stiffness ?? 180.0);
    this.damping = Math.max(0.0, config.damping ?? 12.0);
    this.restThreshold = config.restThreshold ?? 0.001;
  }

  /**
   * Factory to construct a spring using Apple's duration & bounce model
   */
  public static fromApple(initialPosition: number, apple: AppleSpringConfig): KineticSpring {
    const duration = Math.max(0.01, apple.duration);
    const bounce = Math.min(1.0, Math.max(-1.0, apple.bounce));
    const zeta = bounce >= 0 ? 1 - bounce : 1 / (1 + Math.abs(bounce));
    const omega0 = (2 * Math.PI) / duration;
    const mass = 1.0;
    const stiffness = mass * omega0 * omega0;
    const damping = 2 * mass * zeta * omega0;

    return new KineticSpring(initialPosition, { mass, stiffness, damping });
  }

  /**
   * Retarget spring destination while preserving current momentum (Interruptibility)
   */
  public retarget(newTarget: number, initialVelocity?: number): void {
    this.target = newTarget;
    if (initialVelocity !== undefined) {
      this.velocity = initialVelocity;
    }
  }

  /**
   * Exact Closed-Form Analytical Step
   * Evaluates the continuous ODE solution at arbitrary delta-time dt with zero accumulation error.
   */
  public stepAnalytical(dt: number): boolean {
    if (dt <= 0) return this.isSettled();
    if (this.isSettled()) {
      this.current = this.target;
      this.velocity = 0;
      return true;
    }

    const m = this.mass;
    const k = this.stiffness;
    const c = this.damping;

    const omega0 = Math.sqrt(k / m);
    const zeta = c / (2 * Math.sqrt(k * m));
    const y0 = this.current - this.target;
    const v0 = this.velocity;

    let xNew: number;
    let vNew: number;

    if (Math.abs(zeta - 1.0) < 1e-5) {
      // Critically Damped (zeta = 1)
      const c1 = y0;
      const c2 = v0 + omega0 * y0;
      const expTerm = Math.exp(-omega0 * dt);

      xNew = this.target + expTerm * (c1 + c2 * dt);
      vNew = expTerm * (c2 - omega0 * (c1 + c2 * dt));
    } else if (zeta < 1.0) {
      // Underdamped (zeta < 1)
      const omegaD = omega0 * Math.sqrt(1.0 - zeta * zeta);
      const c1 = y0;
      const c2 = (v0 + zeta * omega0 * y0) / omegaD;
      const expTerm = Math.exp(-zeta * omega0 * dt);
      const cosTerm = Math.cos(omegaD * dt);
      const sinTerm = Math.sin(omegaD * dt);

      xNew = this.target + expTerm * (c1 * cosTerm + c2 * sinTerm);
      vNew = expTerm * (
        (-zeta * omega0 * c1 + omegaD * c2) * cosTerm -
        (zeta * omega0 * c2 + omegaD * c1) * sinTerm
      );
    } else {
      // Overdamped (zeta > 1)
      const alpha = omega0 * Math.sqrt(zeta * zeta - 1.0);
      const r1 = -zeta * omega0 + alpha;
      const r2 = -zeta * omega0 - alpha;
      const c1 = (v0 - r2 * y0) / (r1 - r2);
      const c2 = y0 - c1;

      xNew = this.target + c1 * Math.exp(r1 * dt) + c2 * Math.exp(r2 * dt);
      vNew = c1 * r1 * Math.exp(r1 * dt) + c2 * r2 * Math.exp(r2 * dt);
    }

    this.current = xNew;
    this.velocity = vNew;

    if (this.isSettled()) {
      this.current = this.target;
      this.velocity = 0;
      return true;
    }

    return false;
  }

  /**
   * 4th-Order Runge-Kutta (RK4) Step for nonlinear constraints or variable external forces
   */
  public stepRK4(dt: number, externalForce = 0): boolean {
    if (this.isSettled()) {
      this.current = this.target;
      this.velocity = 0;
      return true;
    }

    const omega0Sq = this.stiffness / this.mass;
    const twoZetaOmega0 = this.damping / this.mass;
    const forcePerMass = externalForce / this.mass;

    const acceleration = (x: number, v: number): number => {
      return -omega0Sq * (x - this.target) - twoZetaOmega0 * v + forcePerMass;
    };

    const x = this.current;
    const v = this.velocity;

    // k1
    const k1_v = acceleration(x, v);
    const k1_x = v;

    // k2
    const x_k2 = x + 0.5 * dt * k1_x;
    const v_k2 = v + 0.5 * dt * k1_v;
    const k2_v = acceleration(x_k2, v_k2);
    const k2_x = v_k2;

    // k3
    const x_k3 = x + 0.5 * dt * k2_x;
    const v_k3 = v + 0.5 * dt * k2_v;
    const k3_v = acceleration(x_k3, v_k3);
    const k3_x = v_k3;

    // k4
    const x_k4 = x + dt * k3_x;
    const v_k4 = v + dt * k3_v;
    const k4_v = acceleration(x_k4, v_k4);
    const k4_x = v_k4;

    this.current += (dt / 6.0) * (k1_x + 2 * k2_x + 2 * k3_x + k4_x);
    this.velocity += (dt / 6.0) * (k1_v + 2 * k2_v + 2 * k3_v + k4_v);

    if (this.isSettled()) {
      this.current = this.target;
      this.velocity = 0;
      return true;
    }

    return false;
  }

  public isSettled(): boolean {
    return Math.abs(this.current - this.target) < this.restThreshold && 
           Math.abs(this.velocity) < this.restThreshold;
  }
}
