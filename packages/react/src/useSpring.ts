import { useEffect, useRef, useState, useCallback } from 'react';
import { KineticSpring, SpringConfig } from '@design-engineer/physics';

export function useSpring(
  targetValue: number,
  config?: SpringConfig
): number {
  const springRef = useRef<KineticSpring | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const [value, setValue] = useState(targetValue);
  
  const tick = useCallback((timestamp: number) => {
    if (!springRef.current) return;
    
    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.064);
    lastTimeRef.current = timestamp;
    
    const settled = springRef.current.stepAnalytical(dt);
    setValue(springRef.current.current);
    
    if (!settled) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      lastTimeRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    if (!springRef.current) {
      springRef.current = new KineticSpring(targetValue, config);
    } else {
      springRef.current.retarget(targetValue);
    }
    
    lastTimeRef.current = null;
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
