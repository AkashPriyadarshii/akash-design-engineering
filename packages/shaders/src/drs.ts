/**
 * @design-engineer/shaders - DynamicResolutionScaler
 * Ensures strict 120 FPS / 8.33ms frame stability by scaling render buffer resolution
 * dynamically based on an Exponential Moving Average (EMA) of frame execution times.
 */

export class DynamicResolutionScaler {
  private scale = 1.0;
  private readonly minScale = 0.5;
  private readonly maxScale = 1.0;
  private emaFrameTime = 8.33;
  private readonly alpha = 0.1;
  private readonly targetBudgetMs: number;

  constructor(targetBudgetMs = 7.8) {
    this.targetBudgetMs = targetBudgetMs;
  }

  public update(executionTimeMs: number): number {
    this.emaFrameTime = this.alpha * executionTimeMs + (1 - this.alpha) * this.emaFrameTime;

    if (this.emaFrameTime > this.targetBudgetMs) {
      // Scale down under load to prevent dropped frames
      this.scale = Math.max(this.minScale, this.scale - 0.05);
    } else if (this.emaFrameTime < this.targetBudgetMs - 1.5 && this.scale < this.maxScale) {
      // Slowly ramp back up when headroom is available
      this.scale = Math.min(this.maxScale, this.scale + 0.01);
    }

    return this.scale;
  }

  public getScale(): number {
    return this.scale;
  }
}
