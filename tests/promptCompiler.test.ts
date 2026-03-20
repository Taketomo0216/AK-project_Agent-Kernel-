import test from 'node:test';
import assert from 'node:assert/strict';
import { loadIdentityBundle } from '../src/identityLoader';
import { analyzeCompiledPrompt, compilePrompt, compilePromptWithSections } from '../src/promptCompiler';

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

test('compilePromptWithSections returns inspectable sections and prompt diagnostics', () => {
  const compiled = compilePromptWithSections(
    loadIdentityBundle(),
    { userMessage: 'Implement the adapter.', taskType: 'implementation', memorySummary: 'project_state: adapter in progress' },
    { route: 'implementation', reason: 'test route' }
  );

  assert.deepEqual(compiled.sections.map((section) => section.label), [
    'persona_core',
    'governance',
    'runtime_context',
    'execution_rules'
  ]);
  assert.equal(compiled.diagnostics.sectionCount, 4);
  assert.match(compiled.diagnostics.promptHash, /^[a-f0-9]{12}$/);
});
