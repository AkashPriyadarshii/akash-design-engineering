import test from 'node:test';
import assert from 'node:assert/strict';

test('FLIP Inversion Math: delta and counter-scaling formulas', () => {
  // First rect (before state change)
  const first = { left: 100, top: 50, width: 200, height: 100 };
  // Last rect (after state change)
  const last = { left: 250, top: 120, width: 100, height: 50 };

  // INVERT transform: dx = first.left - last.left, dy = first.top - last.top
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = first.width / last.width;
  const sy = first.height / last.height;

  assert.equal(dx, -150, 'dx must invert position delta');
  assert.equal(dy, -70, 'dy must invert position delta');
  assert.equal(sx, 2.0, 'sx must invert scale change (200 / 100 = 2.0)');
  assert.equal(sy, 2.0, 'sy must invert scale change (100 / 50 = 2.0)');

  // Child glyph counter-scaling: 1 / sx, 1 / sy
  const counterSx = 1 / sx;
  const counterSy = 1 / sy;
  assert.equal(counterSx, 0.5, 'Counter scale must prevent child text distortion (1 / 2 = 0.5)');
  assert.equal(counterSy, 0.5, 'Counter scale must prevent child text distortion (1 / 2 = 0.5)');
});
