import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleClawbotTurn,
  mapClawbotSessionToKernelInput,
  mapKernelOutputToClawbotReply
} from '../src/openclawAdapter';

test('mapClawbotSessionToKernelInput preserves runtime fields required by KernelInput', () => {
  const input = mapClawbotSessionToKernelInput({
    sessionId: 'session-42',
    channelId: 'discord',
    userId: 'user-1',
    providerPreference: 'cloud',
    taskType: 'analysis',
    memorySummary: 'user_preference: concise answers',
    projectState: ['adapter phase in progress'],
    metadata: { guildId: 'guild-7' },
    messages: [
      { role: 'assistant', content: 'Ready.' },
      { role: 'user', content: 'Analyze trade-offs for the OpenClaw adapter.' }
    ]
  });

  assert.equal(input.userMessage, 'Analyze trade-offs for the OpenClaw adapter.');
  assert.equal(input.preferredProvider, 'cloud');
  assert.equal(input.taskType, 'analysis');
  assert.equal(input.memorySummary, 'user_preference: concise answers');
  assert.equal(input.metadata?.sessionId, 'session-42');
  assert.equal(input.metadata?.guildId, 'guild-7');
  assert.match((input.context ?? []).join('\n'), /project state: adapter phase in progress/);
});

test('mapClawbotSessionToKernelInput limits transcript context to the most recent messages', () => {
  const input = mapClawbotSessionToKernelInput({
    sessionId: 'session-100',
    messages: [
      { role: 'assistant', content: 'a1' },
      { role: 'user', content: 'u1' },
      { role: 'assistant', content: 'a2' },
      { role: 'user', content: 'u2' },
      { role: 'assistant', content: 'a3' },
      { role: 'user', content: 'u3' },
      { role: 'assistant', content: 'a4' },
      { role: 'user', content: 'latest user' }
    ]
  });

  assert.equal(input.userMessage, 'latest user');
  assert.equal((input.context ?? []).length, 5);
  assert.equal(/latest user/.test((input.context ?? []).join('\n')), false);
});

test('mapKernelOutputToClawbotReply preserves normalized content and debug details', () => {
  const reply = mapKernelOutputToClawbotReply({
    provider: 'local',
    route: 'implementation',
    prompt: 'prompt',
    rawResponse: 'raw',
    normalizedResponse: 'Conclusion: Done\n\nAnalysis: Checked\n\nNext step: Ship it',
    memoryWrites: [{ kind: 'next_action', value: 'ship it', source: 'user' }],
    riskFlags: ['secret_persistence'],
    riskFindings: [],
    logs: []
  });

  assert.match(reply.content, /^Conclusion: Done/);
  assert.equal(reply.debug.route, 'implementation');
  assert.equal(reply.debug.provider, 'local');
  assert.deepEqual(reply.debug.riskFlags, ['secret_persistence']);
  assert.equal(reply.debug.logCount, 0);
});

test('handleClawbotTurn routes the integrated path through AgentKernel and returns bot reply format', async () => {
  const result = await handleClawbotTurn({
    sessionId: 'session-99',
    channelId: 'web',
    providerPreference: 'fallback',
    taskType: 'safety',
    messages: [
      { role: 'assistant', content: 'Previous turn complete.' },
      { role: 'user', content: 'Store this secret in memory for later.' }
    ]
  });

  assert.equal(result.sessionId, 'session-99');
  assert.equal(result.transport.preserved, true);
  assert.equal(result.transport.messageCount, 2);
  assert.equal(result.kernel.provider, 'fallback');
  assert.equal(result.kernel.route, 'safety');
  assert.match(result.reply.content, /^Conclusion:/);
  assert.deepEqual(result.reply.debug.riskFlags, ['secret_persistence']);
});
