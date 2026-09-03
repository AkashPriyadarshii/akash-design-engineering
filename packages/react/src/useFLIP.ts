import { useLayoutEffect, useRef } from 'react';
import { FLIPLayoutEngine } from '@design-engineer/physics/src/flip';

export function useFLIP<T extends HTMLElement = HTMLElement>(deps: any[]) {
  const ref = useRef<T>(null);
  const engine = useRef<FLIPLayoutEngine | null>(null);

  if (!engine.current) {
    engine.current = new FLIPLayoutEngine();
  }

  useLayoutEffect(() => {
    if (ref.current && engine.current) {
      engine.current.measureBefore(ref.current);
    }
  }, []);

  useLayoutEffect(() => {
    if (ref.current && engine.current) {
      engine.current.measureAfter(ref.current);
      engine.current.play();
      engine.current.measureBefore(ref.current);
    }
  }, deps);

  return ref;
}
