import { KernelInput, RouteDecision, RouteKind } from './types';

const routePatterns: Array<{ route: RouteKind; patterns: RegExp[]; reason: string }> = [
  {
    route: 'safety',
    patterns: [/credential/i, /secret/i, /token/i, /password/i, /risk/i],
    reason: 'Detected sensitive or safety-related wording.'
  },
  {
    route: 'implementation',
    patterns: [/implement/i, /build/i, /create/i, /code/i, /refactor/i, /test/i],
    reason: 'Detected implementation-oriented request language.'
  },
  {
    route: 'analysis',
    patterns: [/analy[sz]e/i, /compare/i, /evaluate/i, /trade[- ]?off/i, /benchmark/i],
    reason: 'Detected analytical request language.'
  }
];

export function selectRoute(input: KernelInput): RouteDecision {
  if (input.taskType && input.taskType !== 'general') {
    return {
      route: input.taskType,
      reason: `Selected ${input.taskType} route from runtime taskType metadata.`
    };
  }

  const haystack = [input.task, input.userMessage, input.memorySummary, ...(input.context ?? [])].filter(Boolean).join(' ');

  for (const candidate of routePatterns) {
    if (candidate.patterns.some((pattern) => pattern.test(haystack))) {
      return { route: candidate.route, reason: candidate.reason };
    }
  }

  return { route: 'general', reason: 'Defaulted to general route because no specialized pattern matched.' };
}
