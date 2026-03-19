import { BaseProvider } from './base';
import { KernelInput, ProviderRequest, ProviderResponse } from '../types';

export class CloudProvider extends BaseProvider {
  readonly kind = 'cloud' as const;

  canHandle(input: KernelInput): boolean {
    return input.preferredProvider === 'cloud';
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    return this.buildResponse(this.kind, 'cloud-simulated', request, 'Cloud backend selected through the provider adapter interface.');
  }
}
