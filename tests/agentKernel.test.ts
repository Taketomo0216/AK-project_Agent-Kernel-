import test from 'node:test';
import assert from 'node:assert/strict';
import { runAgentKernel } from '../src/agentKernel';

test('runAgentKernel returns normalized output, logs, and memory writes', async () => {
  const result = await runAgentKernel({
    userMessage: 'Build the router. I prefer concise outputs. Next action: integrate the CLI.',
    preferredProvider: 'local'
  });

  assert.equal(result.provider, 'local');
  assert.equal(result.route, 'implementation');
  assert.match(result.normalizedResponse, /^Conclusion:/);
  assert.equal(result.logs.length, 5);
  assert.deepEqual(result.memoryWrites.map((entry) => entry.kind), ['user_preference', 'next_action']);
});
