import { useEffect, useRef, useState, useCallback } from 'react';
import { KineticSpring, SpringConfig } from '@design-engineer/physics/src/spring';

export function useSpring(
  targetValue: number,
  config?: SpringConfig
) {
  const springRef = useRef<KineticSpring | null>(null);
  const rafRef = useRef<number | null>(null);
  const [value, setValue] = useState(targetValue);
  
  const tick = useCallback(() => {
    if (!springRef.current) return;
    
    const { current, done } = springRef.current.tick(performance.now());
    setValue(current);
    
    if (!done) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);
  
  useEffect(() => {
    if (!springRef.current) {
      springRef.current = new KineticSpring(targetValue, targetValue, 0, config);
    } else {
      springRef.current.setTarget(targetValue);
    }
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(tick);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, config, tick]);

  return value;
}
