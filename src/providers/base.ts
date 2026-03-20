import { ProviderAdapter, ProviderRequest, ProviderResponse } from '../types';

export abstract class BaseProvider implements ProviderAdapter {
  abstract readonly kind: ProviderAdapter['kind'];

  canHandle(_input: import('../types').KernelInput): boolean {
    return true;
  }

  protected buildResponse(provider: ProviderResponse['provider'], modelLabel: string, request: ProviderRequest, summary: string): ProviderResponse {
    const content = `Conclusion: ${summary}\n\nAnalysis: Route ${request.route} was executed with a provider-agnostic prompt.\n\nNext step: Review logs, risk flags, and memory writes before integrating with a live backend.`;

    return {
      provider,
      modelLabel,
      content,
      latencyMs: Math.max(1, Math.round(request.prompt.length / 40)),
      usage: {
        promptChars: request.prompt.length,
        completionChars: content.length,
        totalChars: request.prompt.length + content.length
      },
      raw: {
        systemPromptLength: request.systemPrompt.length,
        userPromptLength: request.userPrompt.length,
        sectionLabels: request.promptSections.map((section) => section.label)
      }
    };
  }

  abstract generate(request: ProviderRequest): Promise<ProviderResponse>;
}
