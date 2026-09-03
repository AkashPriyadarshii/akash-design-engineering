# Android Compose Haptics

## VibrationEffect.Composition Primitives (Android 11+)

Modern Android haptics rely on the `VibrationEffect.Composition` API, replacing legacy duration-based vibration with semantic actuator primitives.

- `PRIMITIVE_CLICK`: A sharp, crisp tactile bump. Used for discrete state changes (e.g., switches toggling, pressing distinct buttons). Designed for high-frequency linear resonant actuators (LRAs).
- `PRIMITIVE_TICK`: A lighter, shorter, higher-frequency variation of a click. Ideal for continuous, granular feedback (e.g., scrolling through a picker, moving a slider).
- `PRIMITIVE_QUICK_FALL`: A sudden downward transient. Used for drops or negative interactions, often chained with a click to simulate weight or settling.

The composition API allows sequencing with explicit delays:
```kotlin
val effect = VibrationEffect.startComposition()
    .addPrimitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.5f)
    .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 1.0f, 10)
    .compose()
```

## Fallback Amplitude Envelopes

For devices lacking sophisticated LRAs or running pre-API 30 Android, semantic primitives fail. The fallback mechanism requires synthesizing discrete haptic events using amplitude-controlled step functions via `VibrationEffect.createWaveform()`.

A fallback "click" envelope requires a rapid attack, minimal sustain, and rapid release to prevent ERM (Eccentric Rotating Mass) motor spin-up blur.
Waveform timings (ms): `[0, 10, 5, 5]`
Amplitudes: `[0, 255, 0, 128]`

Equation for ERM spin-up compensation (overdrive):
$$A(t) = \begin{cases} A_{max} & 0 \le t \le T_{overdrive} \\ A_{target} & T_{overdrive} < t \le T_{duration} \end{cases}$$
Where $T_{overdrive}$ is $<10\text{ms}$ to counteract mechanical inertia.

## Latency Budgets in Jetpack Compose

To maintain psychophysical synchrony between visual state mutation and tactile feedback, the latency budget is $L_{total} < 15\text{ms}$.

In Compose, haptic feedback should bypass the recomposition loop to prevent frame-drop latency.
```kotlin
// INCORRECT: Tied to recomposition
var state by remember { mutableStateOf(false) }
if (state) { view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK) }

// CORRECT: Executed synchronously in the event handler
val haptic = LocalHapticFeedback.current
Modifier.clickable {
    haptic.performHapticFeedback(HapticFeedbackConstants.TextHandleMove)
    state = !state
}
```
Executing via `LocalHapticFeedback` directly in the pointer input lambda guarantees execution before the choreographer schedules the next VSYNC.
