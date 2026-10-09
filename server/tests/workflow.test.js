import test from 'node:test';
import assert from 'node:assert';
import { REQUEST_STATUS, VALID_STATUS_TRANSITIONS } from '../../shared/constants/requestStatus.js';
import { validateStatusTransition } from '../src/validators/requestValidators.js';

test('Request State Transition Rules', (t) => {
  // Submitted -> Pending Verification or Verified is valid
  assert.strictEqual(validateStatusTransition(REQUEST_STATUS.SUBMITTED, REQUEST_STATUS.PENDING_VERIFICATION), true);
  assert.strictEqual(validateStatusTransition(REQUEST_STATUS.SUBMITTED, REQUEST_STATUS.VERIFIED), true);

  // Submitted -> Searching for Donors is NOT allowed without verification
  assert.strictEqual(validateStatusTransition(REQUEST_STATUS.SUBMITTED, REQUEST_STATUS.SEARCHING), false);

  // Pending Verification -> Verified is valid
  assert.strictEqual(validateStatusTransition(REQUEST_STATUS.PENDING_VERIFICATION, REQUEST_STATUS.VERIFIED), true);

  // Verified -> Searching for Donors is valid
  assert.strictEqual(validateStatusTransition(REQUEST_STATUS.VERIFIED, REQUEST_STATUS.SEARCHING), true);

  // Searching -> Donor Response Received is valid
  assert.strictEqual(validateStatusTransition(REQUEST_STATUS.SEARCHING, REQUEST_STATUS.RESPONSE_RECEIVED), true);

  // Response Received -> Fulfilled is valid
  assert.strictEqual(validateStatusTransition(REQUEST_STATUS.RESPONSE_RECEIVED, REQUEST_STATUS.FULFILLED), true);

  // Terminal states cannot transition to anything
  assert.strictEqual(validateStatusTransition(REQUEST_STATUS.FULFILLED, REQUEST_STATUS.SEARCHING), false);
  assert.strictEqual(validateStatusTransition(REQUEST_STATUS.CANCELLED, REQUEST_STATUS.VERIFIED), false);
});
