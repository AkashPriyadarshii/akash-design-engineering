# WebAudio Synthesis Mathematics for UI Acoustics

## Mechanical Clicks and Transient Generation

UI interaction acoustics rely on short, broadband transients. A mechanical click is synthesized via a Dirac delta approximation, realized digitally as an impulse passed through a resonant filter network.

The continuous-time representation of an exponentially decaying impulse:
$$h(t) = A e^{-t/\tau} \sin(2\pi f_c t + \phi) u(t)$$
Where $A$ is the peak amplitude, $\tau$ is the decay time constant ($< 5\text{ms}$ for tactile clicks), and $f_c$ is the resonant frequency (typically $1.5 - 3 \text{kHz}$).

## Q Factor Biquad Filters

To shape the frequency spectrum of noise bursts into mechanical clicks, second-order infinite impulse response (IIR) biquad bandpass filters are applied. The transfer function is:
$$H(z) = \frac{b_0 + b_1 z^{-1} + b_2 z^{-2}}{1 + a_1 z^{-1} + a_2 z^{-2}}$$

The quality factor $Q$ determines the bandwidth $\Delta f = f_c / Q$. High $Q$ ($>10$) produces a tonal "ping", while low $Q$ ($0.5 < Q < 2$) creates a damped, plastic or wood-like mechanical "thud".

## Pink and White Noise Generation

White noise $W[n]$ is a sequence of uncorrelated random variables with uniform spectral density.
$$E[W[n]] = 0, \quad R_{ww}[k] = \sigma^2 \delta[k]$$

Pink noise $P[n]$, characterized by a $1/f$ power spectral density, is perceptually uniform across logarithmic frequency bands. It is computationally approximated by passing white noise through a cascade of first-order IIR filters (Voss-McCartney algorithm), shaping the spectrum to roll off at -3 dB per octave.

## Sub-bass Oscillator Decay

For weight and material density perception in UI interactions, an underlying sub-bass oscillator ($40 - 80 \text{Hz}$) provides kinetic grounding. An ADSR envelope governs the amplitude, heavily weighted to the decay phase for percussive hits.
$$E_{sub}(t) = \begin{cases} (t/T_a) & 0 \le t \le T_a \\ e^{-(t-T_a)/\tau_d} & t > T_a \end{cases}$$
The oscillator waveform is typically a triangle or heavily low-passed square wave to introduce odd harmonics, ensuring audibility on mobile device micro-speakers.

## Temporal Binding (<10ms)

Psychophysical temporal binding requires visual and auditory stimuli to occur within a $<10\text{ms}$ window to be perceived as a single, causal event. Total system latency $L_{total}$:
$$L_{total} = L_{input} + L_{js} + L_{webaudio} + L_{hardware}$$
To maintain $L_{total} < 10\text{ms}$, audio assets must be synthesized synchronously or pre-computed in `AudioBuffer`s, bypassing Main Thread blocking operations and relying on the high-priority Audio Thread rendering graph.
