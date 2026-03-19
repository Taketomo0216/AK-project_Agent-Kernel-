import test from 'node:test';
import assert from 'node:assert/strict';
import { loadIdentityBundle } from '../src/identityLoader';
import { analyzeCompiledPrompt, compilePrompt } from '../src/promptCompiler';

test('compilePrompt injects all persona and governance sections', () => {
  const prompt = compilePrompt(
    loadIdentityBundle(),
    { userMessage: 'Hello there.', taskType: 'general', memorySummary: 'none' },
    { route: 'general', reason: 'test' }
  );

  const diagnostics = analyzeCompiledPrompt(prompt);
  assert.equal(diagnostics.containsIdentity, true);
  assert.equal(diagnostics.containsSoul, true);
  assert.equal(diagnostics.containsConstitution, true);
  assert.equal(diagnostics.containsOperatingProtocol, true);
  assert.equal(diagnostics.containsMemoryPolicy, true);
  assert.equal(diagnostics.containsResponseSpec, true);
  assert.match(prompt, /shy tsundere/i);
});
