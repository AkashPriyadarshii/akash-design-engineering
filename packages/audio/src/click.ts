/**
 * @design-engineer/audio - Mechanical Click Synthesizer
 * Zero-asset procedural mechanical switch click using Web Audio API BiquadFilter noise bursts.
 */

import { getAudioContext } from './context';

let sharedNoiseBuffer: AudioBuffer | null = null;

function getContext(): AudioContext {
  const ctx = getAudioContext();
  if (!sharedNoiseBuffer) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.03);
    sharedNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = sharedNoiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return ctx;
}

export function playClick(type: 'press' | 'release' = 'press', volume = 0.5): void {
  if (typeof window === 'undefined') return;

  const ctx = getContext();
  const t0 = ctx.currentTime;
  const isPress = type === 'press';

  // 1. Noise snap impulse (High-Q mechanical bandpass)
  if (sharedNoiseBuffer) {
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = sharedNoiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isPress ? 3400 : 2800, t0);
    filter.Q.setValueAtTime(isPress ? 8.0 : 5.0, t0);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.linearRampToValueAtTime(volume * (isPress ? 0.7 : 0.4), t0 + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (isPress ? 0.012 : 0.008));

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(t0);
    noiseSource.stop(t0 + 0.02);
  }

  // 2. Sub-bass bottom-out thud (Press impact)
  if (isPress) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t0);
    osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.015);

    oscGain.gain.setValueAtTime(volume * 0.35, t0);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.015);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + 0.02);
  }
}
