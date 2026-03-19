import test from 'node:test';
import assert from 'node:assert/strict';
import { handleClawbotTurn, mapClawbotSessionToKernelInput } from '../src/openclawAdapter';

test('mapClawbotSessionToKernelInput preserves session context and provider preference', () => {
  const input = mapClawbotSessionToKernelInput({
    sessionId: 'session-42',
    channelId: 'discord',
    userId: 'user-1',
    providerPreference: 'cloud',
    projectState: ['adapter phase in progress'],
    messages: [
      { role: 'assistant', content: 'Ready.' },
      { role: 'user', content: 'Analyze trade-offs for the OpenClaw adapter.' }
    ]
  });

  assert.equal(input.userMessage, 'Analyze trade-offs for the OpenClaw adapter.');
  assert.equal(input.preferredProvider, 'cloud');
  assert.equal(input.metadata?.sessionId, 'session-42');
  assert.match((input.context ?? []).join('\n'), /project state: adapter phase in progress/);
});

test('handleClawbotTurn routes the reply through AgentKernel normalization', async () => {
  const result = await handleClawbotTurn({
    sessionId: 'session-99',
    channelId: 'web',
    providerPreference: 'fallback',
    messages: [
      { role: 'assistant', content: 'Previous turn complete.' },
      { role: 'user', content: 'Store this secret in memory for later.' }
    ]
  });

  assert.equal(result.sessionId, 'session-99');
  assert.equal(result.transport.preserved, true);
  assert.equal(result.kernel.provider, 'fallback');
  assert.equal(result.kernel.route, 'safety');
  assert.match(result.reply, /^Conclusion:/);
  assert.deepEqual(result.kernel.riskFlags, ['secret_persistence']);
});
