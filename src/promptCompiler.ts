import { IdentityBundle, KernelInput, RouteDecision } from './types';

export function compilePrompt(identity: IdentityBundle, input: KernelInput, decision: RouteDecision): string {
  const memorySection = (input.memory ?? [])
    .map((entry) => `- ${entry.kind}: ${entry.value}`)
    .join('\n') || '- none';
  const contextSection = (input.context ?? []).map((item) => `- ${item}`).join('\n') || '- none';

  return [
    `Identity: ${identity.name} (${identity.persona})`,
    `Route: ${decision.route}`,
    `Route reason: ${decision.reason}`,
    `Response skeleton: ${identity.responseSkeleton.join(' | ')}`,
    'Constitution summary:',
    identity.documents.constitution,
    'Memory policy summary:',
    identity.documents.memoryPolicy,
    'Context:',
    contextSection,
    'Known memory:',
    memorySection,
    `User request: ${input.userMessage}`,
    `Task focus: ${input.task ?? 'none'}`,
    'Instruction: Produce a compact response that preserves the required response skeleton.'
  ].join('\n\n');
}
