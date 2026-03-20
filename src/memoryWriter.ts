import { KernelInput, MemoryRecord } from './types';

const secretPattern = /\b(secret|password|api key|access token|credential|token)\b/i;

const candidates: Array<{ kind: MemoryRecord['kind']; pattern: RegExp; reason: string; confidence: number }> = [
  { kind: 'user_preference', pattern: /i prefer ([^.\n]+)/gi, reason: 'Explicit user preference statement.', confidence: 0.95 },
  { kind: 'verified_fact', pattern: /verified fact:? ([^.\n]+)/gi, reason: 'Explicit verified fact marker.', confidence: 0.92 },
  { kind: 'project_state', pattern: /project state:? ([^.\n]+)/gi, reason: 'Explicit project state marker.', confidence: 0.9 },
  { kind: 'next_action', pattern: /next action:? ([^.\n]+)/gi, reason: 'Explicit next action marker.', confidence: 0.93 }
];

function normalizeValue(value: string): string {
  return value.replace(/\s+/g, ' ').trim().replace(/[.\s]+$/g, '');
}

function buildDedupeKey(kind: MemoryRecord['kind'], value: string): string {
  return `${kind}:${value.toLowerCase()}`;
}

export function extractMemory(input: KernelInput): MemoryRecord[] {
  const text = `${input.userMessage}\n${(input.context ?? []).join('\n')}`;
  const writes: MemoryRecord[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    for (const match of text.matchAll(candidate.pattern)) {
      const value = normalizeValue(match[1] ?? '');
      const dedupeKey = buildDedupeKey(candidate.kind, value);

      if (!value || secretPattern.test(value) || seen.has(dedupeKey)) {
        continue;
      }

      seen.add(dedupeKey);
      writes.push({
        kind: candidate.kind,
        value,
        source: 'user',
        confidence: candidate.confidence,
        reason: candidate.reason,
        dedupeKey
      });
    }
  }

  return writes;
}
