/**
 * @design-engineer/audio - Spatial Thud Synthesizer
 * Low-frequency resonant impact sound for modal sheets, drawers, and heavy UI bounds.
 */

import { getAudioContext } from './context';

export function playThud(frequency = 120, volume = 0.4): void {
  if (typeof window === 'undefined') return;

  const ctx = getAudioContext();

  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, t0);
  osc.frequency.exponentialRampToValueAtTime(30, t0 + 0.08);

  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t0);
  osc.stop(t0 + 0.09);
}
