# AK-project AgentKernel

Phase 2 adds a runnable AgentKernel integration layer that sits above any specific model backend. The kernel preserves stable identity, operating rules, memory policy, response structure, and routing behavior while treating the LLM as a replaceable reasoning engine.

## Phase 2 architecture

### Identity layer
Human-readable identity documents live in `identity/` and a machine-consumable `identity/config.json` makes the same policy available to runtime code.

### Core runtime
- `src/types.ts`: shared `KernelInput` / `KernelOutput` / provider types.
- `src/agentKernel.ts`: main `runAgentKernel()` entrypoint.
- `src/identityLoader.ts`: loads identity docs and JSON config into one bundle.
- `src/router.ts`: deterministic route selection.
- `src/promptCompiler.ts`: provider-neutral prompt compilation.
- `src/responseNormalizer.ts`: stable response skeleton enforcement.
- `src/memoryWriter.ts`: policy-limited memory extraction.
- `src/riskGuard.ts`: wording-based risk checks.
- `src/logger.ts`: structured logging for governance steps.

### Provider adapters
- `src/providers/localProvider.ts`
- `src/providers/cloudProvider.ts`
- `src/providers/fallbackProvider.ts`

Each adapter implements the same interface, so local, cloud, and fallback backends remain interchangeable.

### Evaluation
`eval/consistency/` contains benchmark cases and a runner that can be used to compare consistency across provider backends.

## Usage

```ts
import { runAgentKernel } from './src/agentKernel';

const result = await runAgentKernel({
  userMessage: 'Build a compact integration plan.',
  preferredProvider: 'local'
});

console.log(result.normalizedResponse);
console.log(result.logs);
```

## Development

```bash
npm install
npm run build
npm run test:unit
npm run eval:consistency
```
