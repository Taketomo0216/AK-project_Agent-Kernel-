import { BaseProvider } from './base';
import { KernelInput, ProviderRequest, ProviderResponse } from '../types';

export class FallbackProvider extends BaseProvider {
  readonly kind = 'fallback' as const;

  canHandle(input: KernelInput): boolean {
    return input.preferredProvider === 'fallback';
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    return this.buildResponse(this.kind, 'fallback-simulated', request, 'Fallback backend selected to preserve continuity when higher-priority providers are unavailable.');
  }
}
