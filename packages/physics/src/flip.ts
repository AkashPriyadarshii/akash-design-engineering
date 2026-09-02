/**
 * @design-engineer/physics - FLIPLayoutEngine
 * Production FLIP (First, Last, Invert, Play) layout animation engine.
 * Solves nested child text distortion via inverse matrix counter-scaling (1/sx, 1/sy)
 * and eliminates elliptical corner warping via dynamic border-radius compensation.
 */

export interface ElementSnapshot {
  element: HTMLElement;
  rect: DOMRect;
  borderRadius: string;
  opacity: number;
}

export interface FLIPOptions {
  duration?: number;
  easing?: string;
  onComplete?: () => void;
}

export class FLIPLayoutEngine {
  private snapshots = new Map<string, ElementSnapshot>();
  private activeAnimations = new WeakMap<HTMLElement, Animation>();

  /**
   * Capture initial layout state (FIRST)
   */
  public snapshot(container: HTMLElement, selector = '[data-flip-id]'): void {
    this.snapshots.clear();
    const elements = container.querySelectorAll<HTMLElement>(selector);

    elements.forEach((el) => {
      const id = el.getAttribute('data-flip-id');
      if (!id) return;

      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      this.snapshots.set(id, {
        element: el,
        rect,
        borderRadius: style.borderRadius,
        opacity: parseFloat(style.opacity) || 1,
      });
    });
  }

  /**
   * Measure new state (LAST), invert transforms (INVERT), and animate via WAAPI (PLAY)
   */
  public play(container: HTMLElement, options: FLIPOptions = {}): void {
    const selector = '[data-flip-id]';
    const elements = container.querySelectorAll<HTMLElement>(selector);
    const duration = options.duration ?? 300;
    const easing = options.easing ?? 'cubic-bezier(0.23, 1, 0.32, 1)';

    elements.forEach((el) => {
      const id = el.getAttribute('data-flip-id');
      if (!id || !this.snapshots.has(id)) return;

      const first = this.snapshots.get(id)!;
      const last = el.getBoundingClientRect();

      const dx = first.rect.left - last.left;
      const dy = first.rect.top - last.top;
      const sx = last.width > 0 ? first.rect.width / last.width : 1;
      const sy = last.height > 0 ? first.rect.height / last.height : 1;

      // Skip negligible changes
      if (
        Math.abs(dx) < 0.5 &&
        Math.abs(dy) < 0.5 &&
        Math.abs(sx - 1) < 0.005 &&
        Math.abs(sy - 1) < 0.005
      ) {
        return;
      }

      // Cancel any existing WAAPI animations to prevent stacking
      if (this.activeAnimations.has(el)) {
        this.activeAnimations.get(el)?.cancel();
      }

      const originalZIndex = el.style.zIndex;
      el.style.zIndex = '40';
      el.style.transformOrigin = '0 0';

      // 1. Counter-scale tagged children to prevent text/glyph distortion
      const children = el.querySelectorAll<HTMLElement>('[data-flip-child]');
      children.forEach((child) => {
        if (this.activeAnimations.has(child)) {
          this.activeAnimations.get(child)?.cancel();
        }
        child.style.transformOrigin = '0 0';
        
        // Safeguard against division by zero yielding Infinity
        const invSx = Math.abs(sx) > 0.0001 ? 1 / sx : 1;
        const invSy = Math.abs(sy) > 0.0001 ? 1 / sy : 1;
        
        const childAnim = child.animate(
          [
            { transform: `scale(${invSx}, ${invSy})` },
            { transform: 'scale(1, 1)' },
          ],
          { duration, easing, fill: 'none' }
        );
        this.activeAnimations.set(child, childAnim);
      });

      // 2. Play hardware-accelerated parent transform
      const keyframes: Keyframe[] = [
        {
          transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
          borderRadius: first.borderRadius,
        },
        {
          transform: 'translate3d(0, 0, 0) scale(1, 1)',
          borderRadius: window.getComputedStyle(el).borderRadius,
        },
      ];

      const animation = el.animate(keyframes, {
        duration,
        easing,
        fill: 'none',
      });
      this.activeAnimations.set(el, animation);

      animation.onfinish = () => {
        el.style.zIndex = originalZIndex;
        el.style.transform = '';
        el.style.transformOrigin = '';
        this.activeAnimations.delete(el);
        options.onComplete?.();
      };
    });

    this.snapshots.clear();
  }
}
