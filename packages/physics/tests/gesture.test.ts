import test from 'node:test';
import assert from 'node:assert/strict';
import { GesturePhysics } from '../src/gesture.ts';

test('GesturePhysics: calculateVelocity returns velocity in px/ms', () => {
  const vel = GesturePhysics.calculateVelocity(0, 100, 200);
  assert.equal(vel, 0.5, '100px over 200ms should be 0.5 px/ms');

  const zeroVel = GesturePhysics.calculateVelocity(0, 100, 0);
  assert.equal(zeroVel, 0, 'Zero duration should return 0 velocity');
});

test('GesturePhysics: shouldDismissOnFling honors distance and fast flick thresholds', () => {
  // Past distance threshold
  assert.equal(GesturePhysics.shouldDismissOnFling(150, 0.05), true, 'Over 120px should dismiss');

  // Fast flick under distance
  assert.equal(GesturePhysics.shouldDismissOnFling(50, 0.15), true, 'High velocity in same direction should dismiss');

  // Fast flick in opposite direction should NOT dismiss
  assert.equal(GesturePhysics.shouldDismissOnFling(50, -0.15), false, 'Velocity opposing drag direction must not dismiss');

  // Weak drag under distance
  assert.equal(GesturePhysics.shouldDismissOnFling(40, 0.02), false, 'Slow sub-threshold drag should not dismiss');
});

test('GesturePhysics: applyRubberBanding produces logarithmic deceleration', () => {
  const r1 = GesturePhysics.applyRubberBanding(100, 300, 0.55);
  const r2 = GesturePhysics.applyRubberBanding(200, 300, 0.55);
  const r3 = GesturePhysics.applyRubberBanding(300, 300, 0.55);

  assert.ok(r1 > 0, 'Rubber band displacement must be positive');
  assert.ok(r2 > r1, 'Greater overshoot produces greater displacement');
  assert.ok(r2 - r1 > r3 - r2, 'Marginal displacement must decrease as resistance stiffens across equal intervals');
  assert.equal(GesturePhysics.applyRubberBanding(0), 0, 'Zero overshoot has zero displacement');
});
