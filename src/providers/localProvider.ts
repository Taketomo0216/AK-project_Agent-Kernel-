import { BaseProvider } from './base';
import { KernelInput, ProviderRequest, ProviderResponse } from '../types';

export class LocalProvider extends BaseProvider {
  readonly kind = 'local' as const;

  canHandle(input: KernelInput): boolean {
    return input.preferredProvider === undefined || input.preferredProvider === 'local';
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    return this.buildResponse(this.kind, 'local-simulated', request, 'Local backend selected for deterministic offline execution.');
  }
}
