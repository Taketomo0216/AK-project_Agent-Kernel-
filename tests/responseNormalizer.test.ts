import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeResponse } from '../src/responseNormalizer';

test('normalizeResponse preserves labeled sections', () => {
  const normalized = normalizeResponse('Conclusion: Done\n\nAnalysis: Checked all rules\n\nNext step: Run tests');
  assert.match(normalized, /^Conclusion: Done/);
  assert.match(normalized, /Analysis: Checked all rules/);
  assert.match(normalized, /Next step: Run tests/);
});

test('normalizeResponse creates stable skeleton for unlabeled text', () => {
  const normalized = normalizeResponse('Result line\nMore detail\nFinal action');
  assert.match(normalized, /^Conclusion: Result line/);
  assert.match(normalized, /Analysis: More detail Final action/);
  assert.match(normalized, /Next step: Final action/);
});
