import test from 'node:test';
import assert from 'node:assert';
import { isBloodCompatible, getCompatibilityExplanation } from '../src/utils/compatibility.js';
import { calculateDistanceKm } from '../src/utils/geo.js';

test('Blood Compatibility Matrix - Red Blood Cells / Whole Blood', (t) => {
  // O- is universal RBC donor
  assert.strictEqual(isBloodCompatible('O-', 'A+'), true, 'O- should be compatible with A+');
  assert.strictEqual(isBloodCompatible('O-', 'AB+'), true, 'O- should be compatible with AB+');
  assert.strictEqual(isBloodCompatible('O-', 'B-'), true, 'O- should be compatible with B-');
  assert.strictEqual(isBloodCompatible('O-', 'O-'), true, 'O- should be compatible with O-');

  // O+ can donate to Rh+ only
  assert.strictEqual(isBloodCompatible('O+', 'O+'), true, 'O+ can donate to O+');
  assert.strictEqual(isBloodCompatible('O+', 'A+'), true, 'O+ can donate to A+');
  assert.strictEqual(isBloodCompatible('O+', 'A-'), false, 'O+ cannot donate to A-');
  assert.strictEqual(isBloodCompatible('O+', 'O-'), false, 'O+ cannot donate to O-');

  // AB+ is universal RBC recipient
  assert.strictEqual(isBloodCompatible('A+', 'AB+'), true);
  assert.strictEqual(isBloodCompatible('B+', 'AB+'), true);
  assert.strictEqual(isBloodCompatible('AB-', 'AB+'), true);

  // A+ cannot donate to B+ or O+
  assert.strictEqual(isBloodCompatible('A+', 'B+'), false);
  assert.strictEqual(isBloodCompatible('A+', 'O+'), false);
});

test('Blood Compatibility Matrix - Plasma Inverted Rules', (t) => {
  const component = 'Fresh Frozen Plasma (FFP)';
  // AB is universal Plasma donor
  assert.strictEqual(isBloodCompatible('AB+', 'O+', component), true, 'AB+ is universal plasma donor to O+');
  assert.strictEqual(isBloodCompatible('AB+', 'A-', component), true, 'AB+ is universal plasma donor to A-');
  
  // O plasma can only donate to O recipients
  assert.strictEqual(isBloodCompatible('O+', 'A+', component), false, 'O+ plasma cannot donate to A+');
  assert.strictEqual(isBloodCompatible('O+', 'O+', component), true, 'O+ plasma can donate to O+');
});

test('Haversine Distance Calculation', (t) => {
  // Distance between Empire State Building (40.7484, -73.9857) and Grand Central (40.7527, -73.9772)
  const dist = calculateDistanceKm(40.7484, -73.9857, 40.7527, -73.9772);
  assert.ok(dist > 0.5 && dist < 1.5, `Calculated distance ${dist} km is reasonable for Midtown NYC`);

  // Same coordinates should yield 0 km
  assert.strictEqual(calculateDistanceKm(40.75, -73.98, 40.75, -73.98), 0);
});

test('Compatibility Explanation generator', (t) => {
  const exact = getCompatibilityExplanation('A+', 'A+', 'Whole Blood');
  assert.strictEqual(exact, 'Exact A+ group match for Whole Blood');

  const universal = getCompatibilityExplanation('O-', 'B+', 'Whole Blood');
  assert.ok(universal.includes('Universal'));
});
