# AGENTS.md — akash-design-engineering Project Architecture & Directives

Welcome, AI Agent. You are operating inside **akash-design-engineering**, authored by Akash Priyadarshi. This repository builds physical, mathematical, and sensory user interfaces that permanently bar LLM template slop.

## Pipeline Architecture & Handoff
- **Specification Layer (`design-genius`)**: Harvests intent, routes layout archetypes and pigment families, and emits a bespoke `DESIGN.md`.
- **Implementation Layer (`akash-design-engineering`)**: Consumes `DESIGN.md` and builds tactile, production-ready code using `@design-engineer/{tokens,physics,shaders,audio,android,react}`.
- Neither skill should duplicate the other. `design-genius` generates the design DNA; `design-engineer` executes the physics, shaders, audio, and DOM geometry.

## Mandatory Architectural Directives

1. **Zero AI Slop Rule:**
   - NEVER use text emojis (🚀, ✨, 🔥, 💡) in code, commit messages, or UI copy.
   - NEVER use generic marketing buzzwords ("elevate", "seamless", "robust", "unleash", "streamline", "delve", "comprehensive").
   - NEVER use em-dashes (`—`) in UI copy or commit messages. Use clean hyphens or colons.
   - Button labels must name the verb ("Deploy", "Save"), never the noun ("Submit", "Learn more").

2. **The 10-Dimension Design Engineering Standard:**
   - **Concentric Radii:** $R_{\text{inner}} = \max(0, R_{\text{outer}} - P - B)$.
   - **OKLCH Pigments:** All neutrals carry anchor chroma $\ge 0.006$. No flat `#000`/`#fff` voids.
   - **Timing Canon:** Instant: 100ms, Hover: 180ms, Modal: 280ms, Page Reveal: 450ms. Exit = 65% of enter duration.
   - **Kinetic Physics:** Analytical RK4 spring solver (`@design-engineer/physics`). Banned: `scale(0)` and `ease-in` on enter.
   - **Reduced Motion:** Every animation MUST provide `@media (prefers-reduced-motion: reduce)` fallbacks.
   - **Typography:** 2+1 family limit, weight contrast $\ge 300$, tabular numerals (`tnum`), dynamic negative tracking.
   - **Touch & Click Targets:** Minimum $40\text{px}$ ($44\text{px}$ on touch).
   - **Sensory Acoustics:** Zero-asset procedural clicks via Web Audio API (`@design-engineer/audio`).
   - **Shader Budget:** 120 FPS frame budget (8.33ms), clamped DPR $\le 1.75$, dynamic resolution scaling.
   - **ARIA Strictness:** Icon buttons must have `aria-label`, decorative icons must have `aria-hidden="true"`.

3. **Directory Map:**
   - `packages/tokens/`: Pure CSS custom properties for OKLCH, typography, timing, spacing, anchor positioning, and subgrid.
   - `packages/physics/`: Analytical RK4 spring solver, FLIP layout engine, gesture fling momentum.
   - `packages/audio/`: Zero-asset procedural mechanical click synthesizer using Web Audio API.
   - `packages/shaders/`: Snell refraction liquid glass, Kodak film grain, Bayer dithering, DOM-to-Canvas sync.
   - `packages/android/`: Kotlin Jetpack Compose spring physics, Android 11+ HapticEngine waveforms.
   - `packages/react/`: Production React hooks (`useSpring`, `useFLIP`, `useAudioFeedback`, `useReducedMotion`).
   - `packages/encyclopedia/`: Authoritative mathematical derivations and specs for acoustics, geometry, native, optics, and physics.
   - `bin/audit.mjs`: Industrial 10-dimension automated CLI audit engine.

4. **Verification & Audit:**
   - Always run `node bin/audit.mjs` before concluding tasks.
   - Must achieve $\ge 85\%$ clean pass with zero emoji or buzzword violations.
