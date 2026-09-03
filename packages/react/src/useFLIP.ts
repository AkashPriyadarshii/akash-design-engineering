import { useLayoutEffect, useRef } from 'react';
import { FLIPLayoutEngine, FLIPOptions } from '@design-engineer/physics';

export function useFLIP<T extends HTMLElement = HTMLElement>(
  deps: unknown[],
  options?: FLIPOptions
) {
  const ref = useRef<T>(null);
  const engine = useRef<FLIPLayoutEngine | null>(null);

  if (!engine.current) {
    engine.current = new FLIPLayoutEngine();
  }

  useLayoutEffect(() => {
    if (ref.current && engine.current) {
      engine.current.snapshot(ref.current);
    }
  }, []);

  useLayoutEffect(() => {
    if (ref.current && engine.current) {
      engine.current.play(ref.current, options);
      engine.current.snapshot(ref.current);
    }
  }, deps);

  return ref;
}
