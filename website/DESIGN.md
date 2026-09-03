# DESIGN SPEC: design-engineer Marketing Site

## Archetype
**Editorial & Print**
- Adheres to a strict 16-field modular Swiss Grid framework mapped via `CSS Grid` (`grid-template-columns: repeat(4, 1fr)` on desktop, adapting elegantly).
- Incorporates Dutch conceptual typography (utilizing conceptual contrasting combinations like bold grotesque for headers and italicized serif for conceptual markers).
- Asymmetric balance is enforced through deliberate column spanning (`asymmetric-col-*`) leaving active negative space.

## Pigmentation
- **Primary Accent**: Cinnabar Red (`oklch(0.62 0.22 28.0)`) — Causal receipt: Derived from the red sealing wax and traditional iron-oxide stamps of historical Indian gazette printing, grounding the tool's anti-slop mandate in tactile editorial authority.
- **Base Canvas**: Warm Ivory (`oklch(0.97 0.01 75.0)`) — Micro-textured newsprint substrate ($R_a \approx 2.4\,\mu\text{m}$), avoiding digital flat voids.
- **Typography/Ink**: Custom deep iron gall ink (`oklch(0.15 0.02 260.0)`) with anchor chroma $\ge 0.006$ to harmonize with Warm Ivory and Cinnabar.

## Typography
- No emojis. Zero slop copy. Direct and concise language communicating the exact functionality of the design-engineer framework by Akash Priyadarshi.

## Interaction Physics
- GSAP solely powers kinetic responses.
- Explicit CustomEase springs defined `CustomEase.create("custom", "M0,0 C0.1,0.8 0.2,1 1,1")` to avoid default generic easings.
- No `scale(0)` pops; text reveals rely on clip-path typography masking mimicking print revealing itself progressively.

## Structure
Monolithic index HTML combining exact styles, Tailwind configuration scoped strictly to OKLCH, GSAP, and structural markup for ease of deployment.
