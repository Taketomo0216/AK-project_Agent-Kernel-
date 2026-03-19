import { loadIdentityBundle } from './identityLoader';
import { KernelLogger } from './logger';
import { extractMemory } from './memoryWriter';
import { compilePrompt } from './promptCompiler';
import { CloudProvider } from './providers/cloudProvider';
import { FallbackProvider } from './providers/fallbackProvider';
import { LocalProvider } from './providers/localProvider';
import { normalizeResponse } from './responseNormalizer';
import { detectRiskWording } from './riskGuard';
import { selectRoute } from './router';
import { KernelInput, KernelOutput, ProviderAdapter } from './types';

const providers: ProviderAdapter[] = [new LocalProvider(), new CloudProvider(), new FallbackProvider()];

function pickProvider(input: KernelInput): ProviderAdapter {
  return providers.find((provider) => provider.canHandle(input)) ?? providers[0];
}

export async function runAgentKernel(input: KernelInput): Promise<KernelOutput> {
  const logger = new KernelLogger();
  const identity = loadIdentityBundle();
  const routeDecision = selectRoute(input);
  logger.add({ stage: 'routing', message: routeDecision.reason, data: { route: routeDecision.route } });

  const prompt = compilePrompt(identity, input, routeDecision);
  const provider = pickProvider(input);
  logger.add({ stage: 'provider', message: 'Selected provider adapter.', data: { provider: provider.kind } });

  const providerResponse = await provider.generate({ prompt, input, route: routeDecision.route });
  const normalizedResponse = normalizeResponse(providerResponse.content);
  logger.add({
    stage: 'normalization',
    message: 'Normalized provider output into the stable response skeleton.',
    data: { provider: providerResponse.provider, modelLabel: providerResponse.modelLabel }
  });

  const riskFlags = [
    ...new Set([...detectRiskWording(input.userMessage), ...detectRiskWording(providerResponse.content)])
  ];
  logger.add({ stage: 'risk', message: 'Evaluated request and response wording for risk markers.', data: { riskFlags } });

  const memoryWrites = extractMemory(input);
  logger.add({ stage: 'memory', message: 'Extracted allowed memory records.', data: { count: memoryWrites.length } });

  return {
    provider: providerResponse.provider,
    route: routeDecision.route,
    prompt,
    rawResponse: providerResponse.content,
    normalizedResponse,
    memoryWrites,
    riskFlags,
    logs: logger.list()
  };
}
