import { RiskFinding } from './types';

const riskyPatterns: Array<{
  id: string;
  severity: RiskFinding['severity'];
  description: string;
  patterns: RegExp[];
}> = [
  {
    id: 'secret_persistence',
    severity: 'high',
    description: 'Detected an attempt to store or persist sensitive credentials.',
    patterns: [/\b(secret|password|api key|access token|credential)s?\b/i]
  },
  {
    id: 'identity_drift',
    severity: 'high',
    description: 'Detected an attempt to override repository-owned identity or persona rules.',
    patterns: [
      /ignore (the )?(constitution|identity|policy)/i,
      /ignore previous personality/i,
      /ignore your personality/i,
      /change your personality/i,
      /be a normal assistant instead/i,
      /respond like a normal assistant/i,
      /act like a different assistant/i
    ]
  },
  {
    id: 'unsafe_override',
    severity: 'high',
    description: 'Detected an attempt to bypass response structure or force unsafe persistence.',
    patterns: [/persist .*token/i, /store .*password/i, /save .*secret/i, /stop using structured output/i]
  }
];

export function detectRiskFindings(text: string): RiskFinding[] {
  return riskyPatterns.flatMap((rule) =>
    rule.patterns.flatMap((pattern) => {
      const match = text.match(pattern);
      if (!match) {
        return [];
      }

      return [
        {
          id: rule.id,
          severity: rule.severity,
          description: rule.description,
          matchedText: match[0]
        }
      ];
    })
  );
}

export function detectRiskWording(text: string): string[] {
  return [...new Set(detectRiskFindings(text).map((finding) => finding.id))];
}
