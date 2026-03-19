import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMemory } from '../src/memoryWriter';

test('extractMemory keeps allowed memory classes', () => {
  const records = extractMemory({
    userMessage: 'I prefer compact answers. Verified fact: the repo uses TypeScript. Next action: wire the CLI.',
    context: ['Project state: phase 2 modules are in progress.']
  });

  assert.deepEqual(records.map((record) => record.kind), [
    'user_preference',
    'verified_fact',
    'project_state',
    'next_action'
  ]);
});

test('extractMemory rejects secrets and credentials', () => {
  const records = extractMemory({ userMessage: 'Verified fact: password is swordfish. I prefer concise answers.' });
  assert.deepEqual(records.map((record) => record.kind), ['user_preference']);
});
