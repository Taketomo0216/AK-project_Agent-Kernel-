import { KernelInput, MemoryRecord } from './types';

const secretPattern = /\b(secret|password|api key|access token|credential|token)\b/i;

export function extractMemory(input: KernelInput): MemoryRecord[] {
  const text = `${input.userMessage}\n${(input.context ?? []).join('\n')}`;
  const writes: MemoryRecord[] = [];

  const candidates: Array<{ kind: MemoryRecord['kind']; pattern: RegExp }> = [
    { kind: 'user_preference', pattern: /i prefer ([^.\n]+)/i },
    { kind: 'verified_fact', pattern: /verified fact:? ([^.\n]+)/i },
    { kind: 'project_state', pattern: /project state:? ([^.\n]+)/i },
    { kind: 'next_action', pattern: /next action:? ([^.\n]+)/i }
  ];

  for (const candidate of candidates) {
    const match = text.match(candidate.pattern);
    const value = match?.[1]?.trim();
    if (value && !secretPattern.test(value)) {
      writes.push({ kind: candidate.kind, value, source: 'user' });
    }
  }

  return writes;
}
