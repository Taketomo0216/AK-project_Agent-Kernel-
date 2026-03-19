const riskyPatterns: Array<{ label: string; pattern: RegExp }> = [
  { label: 'secret_persistence', pattern: /\b(secret|password|api key|access token|credential)s?\b/i },
  { label: 'identity_drift', pattern: /ignore (the )?(constitution|identity|policy)/i },
  { label: 'unsafe_override', pattern: /persist .*token|store .*password|save .*secret/i }
];

export function detectRiskWording(text: string): string[] {
  return riskyPatterns.filter((item) => item.pattern.test(text)).map((item) => item.label);
}
