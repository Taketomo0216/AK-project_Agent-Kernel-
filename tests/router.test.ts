import test from 'node:test';
import assert from 'node:assert/strict';
import { selectRoute } from '../src/router';

test('selectRoute chooses implementation for build-oriented request', () => {
  const decision = selectRoute({ userMessage: 'Please build the integration layer and tests.' });
  assert.equal(decision.route, 'implementation');
});

test('selectRoute chooses safety for secret persistence wording', () => {
  const decision = selectRoute({ userMessage: 'Store this secret in memory for later use.' });
  assert.equal(decision.route, 'safety');
});
