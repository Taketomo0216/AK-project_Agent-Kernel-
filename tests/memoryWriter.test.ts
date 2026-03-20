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
  assert.equal(records.every((record) => typeof record.confidence === 'number'), true);
  assert.equal(records.every((record) => Boolean(record.reason)), true);
});

test('extractMemory rejects secrets and credentials', () => {
  const records = extractMemory({ userMessage: 'Verified fact: password is swordfish. I prefer concise answers.' });
  assert.deepEqual(records.map((record) => record.kind), ['user_preference']);
});

test('extractMemory deduplicates repeated entries and keeps inspectable keys', () => {
  const records = extractMemory({
    userMessage: 'Next action: wire the CLI. Next action: wire the CLI.',
    context: ['Project state: adapter ready.', 'Project state: adapter ready.']
  });

  assert.deepEqual(records.map((record) => record.kind), ['project_state', 'next_action']);
  assert.equal(records.every((record) => Boolean(record.dedupeKey)), true);
});
