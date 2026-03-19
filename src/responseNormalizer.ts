const sectionOrder = ['Conclusion', 'Analysis', 'Next step'] as const;

function extractSection(label: string, text: string): string | undefined {
  const pattern = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=(?:Conclusion|Analysis|Next step):|$)`, 'i');
  return text.match(pattern)?.[1]?.trim();
}

export function normalizeResponse(rawResponse: string): string {
  const clean = rawResponse.trim();
  const extracted = new Map<string, string>();

  for (const label of sectionOrder) {
    const value = extractSection(label, clean);
    if (value) {
      extracted.set(label, value.replace(/\n{3,}/g, '\n\n'));
    }
  }

  if (extracted.size === sectionOrder.length) {
    return sectionOrder.map((label) => `${label}: ${extracted.get(label)}`).join('\n\n');
  }

  const lines = clean.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const fallback = {
    Conclusion: lines[0] ?? 'No conclusion provided.',
    Analysis: lines.slice(1).join(' ') || 'No analysis provided.',
    'Next step': lines.at(-1) ?? 'No next step provided.'
  } as const;

  return sectionOrder.map((label) => `${label}: ${fallback[label]}`).join('\n\n');
}
