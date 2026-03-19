import { loadIdentityBundleWithMeta } from './identityLoader';
import { KernelLogger } from './logger';
import { extractMemory } from './memoryWriter';
import { analyzeCompiledPrompt, compilePrompt } from './promptCompiler';
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
  const identityLoad = loadIdentityBundleWithMeta();
  logger.add({
    stage: 'identity_loaded',
    message: 'identity_loaded',
    data: { identityLoaded: identityLoad.identityLoaded, loadedFiles: identityLoad.loadedFiles }
  });

  const routeDecision = selectRoute(input);
  logger.add({ stage: 'route_selected', message: 'route_selected', data: { route: routeDecision.route, reason: routeDecision.reason } });

  const prompt = compilePrompt(identityLoad.bundle, input, routeDecision);
  const promptDiagnostics = analyzeCompiledPrompt(prompt);
  logger.add({ stage: 'prompt_compiled', message: 'prompt_compiled', data: { ...promptDiagnostics } });

  const provider = pickProvider(input);
  const providerResponse = await provider.generate({ prompt, input, route: routeDecision.route });
  logger.add({
    stage: 'provider_responded',
    message: 'provider_responded',
    data: { provider: providerResponse.provider, modelLabel: providerResponse.modelLabel, route: routeDecision.route }
  });

  const normalizedResponse = normalizeResponse(providerResponse.content);
  logger.add({
    stage: 'response_normalized',
    message: 'response_normalized',
    data: { provider: providerResponse.provider, preservesSkeleton: /^Conclusion:[\s\S]*Analysis:[\s\S]*Next step:/m.test(normalizedResponse) }
  });

  const riskFlags = [
    ...new Set([...detectRiskWording(input.userMessage), ...detectRiskWording(providerResponse.content)])
  ];
  logger.add({ stage: 'risk_checked', message: 'risk_checked', data: { riskFlags, route: routeDecision.route } });

  const memoryWrites = extractMemory(input);
  logger.add({ stage: 'memory_selected', message: 'memory_selected', data: { memoryWrites } });

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
