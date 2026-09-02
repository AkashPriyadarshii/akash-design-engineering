/**
 * @design-engineer/physics - GesturePhysics
 * Velocity momentum calculation and boundary friction physics for swipe dismissals & fling gestures.
 */

export interface DragSample {
  position: number;
  time: number;
}

export class GesturePhysics {
  /**
   * Calculate velocity from distance delta and elapsed time in px/ms
   */
  public static calculateVelocity(startPos: number, endPos: number, durationMs: number): number {
    if (durationMs <= 0) return 0;
    return (endPos - startPos) / durationMs;
  }

  /**
   * Determine if swipe velocity crosses the dismissal threshold regardless of drag distance.
   * Standard threshold: 0.11 px/ms (fast flick).
   */
  public static shouldDismissOnFling(
    dragDistance: number,
    velocity: number,
    distanceThreshold = 120,
    velocityThreshold = 0.11
  ): boolean {
    const isPastDistance = Math.abs(dragDistance) >= distanceThreshold;
    const isHighVelocity = Math.abs(velocity) >= velocityThreshold;
    const isSameDirection = (dragDistance > 0 && velocity > 0) || (dragDistance < 0 && velocity < 0);

    return isPastDistance || (isHighVelocity && isSameDirection);
  }

  /**
   * Non-linear resistance when dragging past natural boundaries (Rubber-banding / Damping)
   * x_clamped = x_bound + (x - x_bound) * (1 - 1 / ( (x - x_bound) * c / dim + 1 ))
   */
  public static applyRubberBanding(overshootDistance: number, dimension = 300, constant = 0.55): number {
    if (overshootDistance <= 0) return 0;
    return (overshootDistance * dimension * constant) / (dimension + constant * overshootDistance);
  }
}
