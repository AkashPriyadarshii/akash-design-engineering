/**
 * @design-engineer/audio - Metallic Modal Chime Synthesizer
 * Synthesizes inharmonic metallic bell resonances (Euler-Bernoulli partial ratios)
 * with differential high-frequency damping for task completion and celebrations.
 */

import { getAudioContext } from './context';

export function playSuccessChime(fundamental = 880, volume = 0.4): void {
  if (typeof window === 'undefined') return;

  const ctx = getAudioContext();

  const t0 = ctx.currentTime;

  // Inharmonic metallic beam partial modes: [Ratio, Relative Amplitude, Decay Factor]
  const modes: Array<[number, number, number]> = [
    [1.0, 0.6, 1.0],     // Fundamental
    [1.583, 0.35, 0.7],  // Mode 1
    [2.321, 0.25, 0.45], // Mode 2
    [3.012, 0.15, 0.25], // Mode 3
    [4.250, 0.08, 0.12], // Mode 4 (Rapidly damped high partial)
  ];

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, t0);
  masterGain.connect(ctx.destination);

  // 1. Mallet impact transient
  const mallet = ctx.createOscillator();
  const malletGain = ctx.createGain();
  mallet.type = 'triangle';
  mallet.frequency.setValueAtTime(3200, t0);
  mallet.frequency.exponentialRampToValueAtTime(600, t0 + 0.008);

  malletGain.gain.setValueAtTime(0.4, t0);
  malletGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.008);

  mallet.connect(malletGain);
  malletGain.connect(masterGain);
  mallet.start(t0);
  mallet.stop(t0 + 0.01);

  // 2. Resonant partial synthesis
  modes.forEach(([ratio, amp, decayFactor]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(fundamental * ratio, t0);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(amp, t0 + 0.003); // 3ms attack
    gain.gain.exponentialRampToValueAtTime(0.00001, t0 + 1.2 * decayFactor); // Differential damping

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t0);
    osc.stop(t0 + 1.3);
  });
}
