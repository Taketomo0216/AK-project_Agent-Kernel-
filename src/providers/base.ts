import { ProviderAdapter, ProviderRequest, ProviderResponse } from '../types';

export abstract class BaseProvider implements ProviderAdapter {
  abstract readonly kind: ProviderAdapter['kind'];

  canHandle(_input: import('../types').KernelInput): boolean {
    return true;
  }

  protected buildResponse(provider: ProviderResponse['provider'], modelLabel: string, request: ProviderRequest, summary: string): ProviderResponse {
    return {
      provider,
      modelLabel,
      content: `Conclusion: ${summary}\n\nAnalysis: Route ${request.route} was executed with a provider-agnostic prompt.\n\nNext step: Review logs, risk flags, and memory writes before integrating with a live backend.`
    };
  }

  abstract generate(request: ProviderRequest): Promise<ProviderResponse>;
}
