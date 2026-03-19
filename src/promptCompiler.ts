import { IdentityBundle, KernelInput, PromptDiagnostics, RouteDecision } from './types';

export function analyzeCompiledPrompt(prompt: string): PromptDiagnostics {
  return {
    containsIdentity: prompt.includes('Identity definition:') && prompt.includes('shy tsundere'),
    containsSoul: prompt.includes('Soul definition:'),
    containsConstitution: prompt.includes('Constitution:'),
    containsOperatingProtocol: prompt.includes('Operating protocol:'),
    containsMemoryPolicy: prompt.includes('Memory policy:'),
    containsResponseSpec: prompt.includes('Response specification:'),
    estimatedLength: prompt.length
  };
}

export function compilePrompt(identity: IdentityBundle, input: KernelInput, decision: RouteDecision): string {
  const memorySection = (input.memory ?? [])
    .map((entry) => `- ${entry.kind}: ${entry.value}`)
    .join('\n') || '- none';
  const contextSection = (input.context ?? []).map((item) => `- ${item}`).join('\n') || '- none';

  return [
    `Identity header: ${identity.name} (${identity.persona})`,
    'Identity definition:',
    identity.documents.identity,
    'Soul definition:',
    identity.documents.soul,
    'Constitution:',
    identity.documents.constitution,
    'Operating protocol:',
    identity.documents.operatingProtocol,
    'Memory policy:',
    identity.documents.memoryPolicy,
    'Response specification:',
    identity.documents.responseSpec,
    `Route: ${decision.route}`,
    `Route reason: ${decision.reason}`,
    `Task type: ${input.taskType ?? 'general'}`,
    `Response skeleton: ${identity.responseSkeleton.join(' | ')}`,
    `Memory summary: ${input.memorySummary ?? 'none'}`,
    'Context:',
    contextSection,
    'Known memory:',
    memorySection,
    `User request: ${input.userMessage}`,
    `Task focus: ${input.task ?? 'none'}`,
    'Instruction: Preserve AK identity, keep subtle flavor only, and never drop the required response skeleton.'
  ].join('\n\n');
}
