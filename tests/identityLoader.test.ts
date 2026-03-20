import test from 'node:test';
import assert from 'node:assert/strict';
import { loadIdentityBundleWithMeta, resetIdentityBundleCache } from '../src/identityLoader';

test('loadIdentityBundleWithMeta loads and freezes all identity assets', () => {
  resetIdentityBundleCache();
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
  assert.equal(result.fromCache, false);
});

test('loadIdentityBundleWithMeta reuses a cached identity bundle after first load', () => {
  resetIdentityBundleCache();
  const first = loadIdentityBundleWithMeta();
  const second = loadIdentityBundleWithMeta();

  assert.equal(first.bundle, second.bundle);
  assert.equal(second.fromCache, true);
});
