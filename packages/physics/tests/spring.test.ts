import test from 'node:test';
import assert from 'node:assert/strict';
import { KineticSpring } from '../src/spring.ts';

test('KineticSpring: Underdamped harmonic oscillator converges to target', () => {
  // zeta < 1: underdamped (oscillates and decays)
  const spring = new KineticSpring(0, { stiffness: 200, damping: 10, mass: 1 });
  spring.retarget(100);

  let settled = false;
  const dt = 1 / 60; // 60fps frame
  for (let i = 0; i < 300; i++) {
    settled = spring.stepAnalytical(dt);
    if (settled) break;
  }

  assert.equal(settled, true, 'Spring should settle within 300 frames');
  assert.equal(Math.round(spring.current), 100, 'Position should settle at target (100)');
  assert.equal(spring.velocity, 0, 'Velocity should be zero at rest');
});

test('KineticSpring: Critically damped oscillator achieves fast settling without overshoot', () => {
  // zeta = 1: critically damped
  // c = 2 * sqrt(k * m) = 2 * sqrt(100 * 1) = 20
  const spring = new KineticSpring(0, { stiffness: 100, damping: 20, mass: 1 });
  spring.retarget(1);

  let maxPos = 0;
  const dt = 1 / 60;
  for (let i = 0; i < 200; i++) {
    spring.stepAnalytical(dt);
    if (spring.current > maxPos) maxPos = spring.current;
  }

  assert.ok(maxPos <= 1.001, 'Critically damped spring must not overshoot target');
  assert.equal(spring.isSettled(), true, 'Should be settled');
});

test('KineticSpring: Overdamped oscillator slowly converges monotonically', () => {
  // zeta > 1: overdamped
  const spring = new KineticSpring(0, { stiffness: 50, damping: 40, mass: 1 });
  spring.retarget(50);

  const dt = 1 / 60;
  let lastPos = 0;
  let monotonic = true;

  for (let i = 0; i < 400; i++) {
    spring.stepAnalytical(dt);
    if (spring.current < lastPos - 0.001) monotonic = false;
    lastPos = spring.current;
  }

  assert.equal(monotonic, true, 'Overdamped motion should be monotonic');
});

test('KineticSpring: fromApple factory correctly derives stiffness and damping', () => {
  const spring = KineticSpring.fromApple(0, { duration: 0.5, bounce: 0.2 });
  spring.retarget(10);

  assert.ok(spring.stiffness > 0, 'Stiffness must be positive');
  assert.ok(spring.damping > 0, 'Damping must be positive');

  // Step 60 frames
  for (let i = 0; i < 60; i++) {
    spring.stepAnalytical(1 / 60);
  }
  assert.ok(spring.current > 0, 'Spring should advance toward target');
});

test('KineticSpring: RK4 numerical solver converges to target', () => {
  const spring = new KineticSpring(0, { stiffness: 180, damping: 12, mass: 1 });
  spring.retarget(50);

  let settled = false;
  const dt = 1 / 120; // High frequency sub-stepping for RK4
  for (let i = 0; i < 600; i++) {
    settled = spring.stepRK4(dt);
    if (settled) break;
  }

  assert.equal(settled, true, 'RK4 should settle');
  assert.equal(Math.round(spring.current), 50, 'RK4 position should settle at 50');
});

test('KineticSpring: Retargeting preserves velocity and momentum', () => {
  const spring = new KineticSpring(0, { stiffness: 200, damping: 10, mass: 1 });
  spring.retarget(100);

  // Run 10 frames to build velocity
  for (let i = 0; i < 10; i++) {
    spring.stepAnalytical(1 / 60);
  }
  const midVelocity = spring.velocity;
  assert.ok(midVelocity > 0, 'Velocity should be positive');

  // Mid-flight retarget to 200
  spring.retarget(200);
  assert.equal(spring.velocity, midVelocity, 'Velocity must be preserved across interruptible retarget');
});
