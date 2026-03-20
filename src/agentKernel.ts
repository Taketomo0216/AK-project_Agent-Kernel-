import { loadIdentityBundleWithMeta } from './identityLoader';
import { KernelLogger } from './logger';
import { extractMemory } from './memoryWriter';
import { compilePromptWithSections } from './promptCompiler';
import { CloudProvider } from './providers/cloudProvider';
import { FallbackProvider } from './providers/fallbackProvider';
import { LocalProvider } from './providers/localProvider';
import { normalizeResponse } from './responseNormalizer';
import { detectRiskFindings } from './riskGuard';
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
    success: true,
    data: {
      identityLoaded: identityLoad.identityLoaded,
      loadedFiles: identityLoad.loadedFiles,
      fromCache: identityLoad.fromCache
    }
  });

  const routeDecision = selectRoute(input);
  logger.add({
    stage: 'route_selected',
    message: 'route_selected',
    success: true,
    data: { route: routeDecision.route, reason: routeDecision.reason }
  });

  const compiledPrompt = compilePromptWithSections(identityLoad.bundle, input, routeDecision);
  logger.add({
    stage: 'prompt_compiled',
    message: 'prompt_compiled',
    success: true,
    data: {
      ...compiledPrompt.diagnostics,
      sectionLabels: compiledPrompt.sections.map((section) => section.label)
    }
  });

  const provider = pickProvider(input);
  const providerResponse = await provider.generate({
    prompt: compiledPrompt.prompt,
    promptSections: compiledPrompt.sections,
    systemPrompt: compiledPrompt.sections.filter((section) => section.label !== 'runtime_context').map((section) => section.content).join('\n\n'),
    userPrompt: compiledPrompt.sections.find((section) => section.label === 'runtime_context')?.content ?? input.userMessage,
    input,
    route: routeDecision.route,
    metadata: {
      taskType: input.taskType ?? 'general',
      preferredProvider: input.preferredProvider ?? 'local'
    }
  });
  logger.add({
    stage: 'provider_responded',
    message: 'provider_responded',
    success: true,
    durationMs: providerResponse.latencyMs,
    data: {
      provider: providerResponse.provider,
      modelLabel: providerResponse.modelLabel,
      route: routeDecision.route,
      usage: providerResponse.usage
    }
  });

  const normalizedResponse = normalizeResponse(providerResponse.content);
  logger.add({
    stage: 'response_normalized',
    message: 'response_normalized',
    success: true,
    data: {
      provider: providerResponse.provider,
      preservesSkeleton: /^Conclusion:[\s\S]*Analysis:[\s\S]*Next step:/m.test(normalizedResponse)
    }
  });

  const riskFindings = [
    ...detectRiskFindings(input.userMessage),
    ...detectRiskFindings(providerResponse.content)
  ].filter((finding, index, all) => all.findIndex((candidate) => `${candidate.id}:${candidate.matchedText}` === `${finding.id}:${finding.matchedText}`) === index);
  const riskFlags = [...new Set(riskFindings.map((finding) => finding.id))];
  logger.add({
    stage: 'risk_checked',
    message: 'risk_checked',
    success: true,
    data: { riskFlags, riskFindings, route: routeDecision.route }
  });

  const memoryWrites = extractMemory(input);
  logger.add({
    stage: 'memory_selected',
    message: 'memory_selected',
    success: true,
    data: {
      memoryWrites,
      selectedMemoryKinds: memoryWrites.map((entry) => entry.kind)
    }
  });

  return {
    provider: providerResponse.provider,
    route: routeDecision.route,
    prompt: compiledPrompt.prompt,
    rawResponse: providerResponse.content,
    normalizedResponse,
    memoryWrites,
    riskFlags,
    riskFindings,
    logs: logger.list()
  };
}
