/**
 * @design-engineer/shaders - DOMCanvasSyncEngine
 * 1:1 Perspective camera projection engine mapping HTML DOM bounding rects
 * to WebGL coordinate space without causing layout reflows in the requestAnimationFrame loop.
 */

export interface SyncedElement {
  domNode: HTMLElement;
  initialTop: number;
  initialLeft: number;
  width: number;
  height: number;
  isVisible: boolean;
  isFixed: boolean;
}

export class DOMCanvasSyncEngine {
  private items = new Map<HTMLElement, SyncedElement>();
  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;
  private viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  private viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  constructor() {
    this.resizeObserver = new ResizeObserver(() => {
      this.recalculateBounds();
    });

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const item = this.items.get(entry.target as HTMLElement);
          if (item) {
            item.isVisible = entry.isIntersecting;
          }
        }
      },
      { rootMargin: '100px' }
    );
  }

  /**
   * Register a DOM node for perspective tracking
   */
  public register(domNode: HTMLElement): void {
    const rect = domNode.getBoundingClientRect();
    const style = window.getComputedStyle(domNode);
    const isFixed = style.position === 'fixed' || style.position === 'sticky';
    
    const item: SyncedElement = {
      domNode,
      initialTop: rect.top + (isFixed || typeof window === 'undefined' ? 0 : window.scrollY),
      initialLeft: rect.left,
      width: rect.width,
      height: rect.height,
      isVisible: true,
      isFixed,
    };

    this.items.set(domNode, item);
    this.resizeObserver.observe(domNode);
    this.intersectionObserver.observe(domNode);
  }

  private recalculateBounds(): void {
    if (typeof window === 'undefined') return;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;

    for (const [domNode, item] of this.items.entries()) {
      const rect = domNode.getBoundingClientRect();
      const style = window.getComputedStyle(domNode);
      item.isFixed = style.position === 'fixed' || style.position === 'sticky';
      item.initialTop = rect.top + (item.isFixed ? 0 : window.scrollY);
      item.initialLeft = rect.left;
      item.width = rect.width;
      item.height = rect.height;
    }
  }

  /**
   * Compute exact WebGL position (X, Y, Width, Height) in pixels at current scroll position.
   * Zero DOM reads inside rAF. Pure mathematical evaluation.
   */
  public getWebGLCoords(domNode: HTMLElement, currentScrollY: number): { x: number; y: number; width: number; height: number; isVisible: boolean } | null {
    const item = this.items.get(domNode);
    if (!item) return null;

    const halfW = this.viewportWidth / 2;
    const halfH = this.viewportHeight / 2;

    const screenTop = item.isFixed ? item.initialTop : item.initialTop - currentScrollY;
    const x = item.initialLeft + item.width / 2 - halfW;
    const y = -(screenTop + item.height / 2 - halfH);

    return {
      x,
      y,
      width: item.width,
      height: item.height,
      isVisible: item.isVisible,
    };
  }

  public destroy(): void {
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.items.clear();
  }
}
