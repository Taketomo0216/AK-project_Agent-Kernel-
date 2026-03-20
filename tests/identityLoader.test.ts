import test from 'node:test';
import assert from 'node:assert/strict';
import { loadIdentityBundleWithMeta } from '../src/identityLoader';

test('loadIdentityBundleWithMeta loads and freezes all identity assets', () => {
  const result = loadIdentityBundleWithMeta();

  assert.equal(result.identityLoaded, true);
  assert.deepEqual(result.loadedFiles, [
    'config.json',
    'IDENTITY.md',
    'SOUL.md',
    'CONSTITUTION.md',
    'OPERATING_PROTOCOL.md',
    'MEMORY_POLICY.md',
    'RESPONSE_SPEC.md'
  ]);
  assert.equal(Object.isFrozen(result.bundle), true);
  assert.equal(Object.isFrozen(result.bundle.documents), true);
});
