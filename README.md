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

### OpenClaw adapter
`src/openclawAdapter.ts` is the reversible integration seam for the next phase. It maps Clawbot/OpenClaw runtime data into `KernelInput` (`userMessage`, `taskType`, `memorySummary`, `context`, `metadata`), calls `runAgentKernel()`, and maps `KernelOutput` back into a bot reply envelope while leaving the transport/channel layer unchanged.

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

## OpenClaw integration sketch

```ts
import { handleClawbotTurn } from './src/openclawAdapter';

const turn = await handleClawbotTurn({
  sessionId: 'session-1',
  channelId: 'discord',
  providerPreference: 'local',
  messages: [
    { role: 'assistant', content: 'How can I help?' },
    { role: 'user', content: 'Build a compact plan.' }
  ]
});

console.log(turn.reply.content);
console.log(turn.reply.debug);
```
## list

┌─────────────────────────────────────────────────────────────┐
│                        User Layer                           │
│  Telegram / Discord / Web UI / CLI / OpenClaw Canvas       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Channel / Gateway Layer                  │
│  message intake / auth / transport / session binding        │
│  - telegram adapter                                         │
│  - discord adapter                                          │
│  - webchat adapter                                          │
│  - control-ui / gateway                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Conversation / Session Layer               │
│  session state / user thread / transport metadata           │
│  - session id                                               │
│  - channel context                                          │
│  - runtime state                                            │
│  - transient conversation buffer                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
╔═════════════════════════════════════════════════════════════╗
║                   AK-Project / AgentKernel Layer            ║
║                                                             ║
║  1. Identity Layer                                          ║
║     - IDENTITY.md                                           ║
║     - SOUL.md                                               ║
║     - CONSTITUTION.md                                       ║
║     - OPERATING_PROTOCOL.md                                 ║
║     - MEMORY_POLICY.md                                      ║
║     - RESPONSE_SPEC.md                                      ║
║     - identity/config.json                                  ║
║                                                             ║
║  2. Runtime Governance Layer                                ║
║     - router.ts                                             ║
║     - promptCompiler.ts                                     ║
║     - responseNormalizer.ts                                 ║
║     - memoryWriter.ts                                       ║
║     - riskGuard.ts                                          ║
║                                                             ║
║  3. Integration Core                                        ║
║     - agentKernel.ts                                        ║
║     - runAgentKernel()                                      ║
║                                                             ║
║  Function:                                                  ║
║  define identity → choose route → compile prompt →          ║
║  constrain output → enforce memory policy → stabilize bot   ║
╚═════════════════════════════════════════════════════════════╝
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Model Routing Layer                      │
│  route by task / risk / freshness / complexity              │
│  - local path                                               │
│  - cloud path                                               │
│  - fallback path                                            │
└─────────────────────────────────────────────────────────────┘
             │                         │                      │
             ▼                         ▼                      ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│   Local Provider      │  │   Cloud Provider      │  │  Fallback Provider    │
│  Ollama / local LLM   │  │  API / hosted LLM     │  │  rule-based degrade   │
└───────────────────────┘  └───────────────────────┘  └───────────────────────┘
             │                         │                      │
             └───────────────┬─────────┴───────────────┬──────┘
                             ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     LLM Reasoning Layer                     │
│  replaceable reasoning engine                               │
│  - generation                                               │
│  - inference                                                │
│  - tool-use planning (if enabled)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Post-Processing / Guard Layer              │
│  - response normalization                                   │
│  - risk wording softening                                   │
│  - stable output skeleton                                   │
│  - formatting into conclusion / analysis / next_step        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Memory Governance Layer                     │
│  selective extraction only                                  │
│  - user_preference                                          │
│  - verified_fact                                            │
│  - project_state                                            │
│  - next_action                                              │
│  block: secrets / tokens / passwords / raw credentials      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             Persistence / Retrieval / Knowledge Layer       │
│  - session store                                            │
│  - structured memory store                                  │
│  - optional vector / summary layer                          │
│  - project state snapshots                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Logging / Eval / Observability              │
│  - route logs                                               │
│  - provider logs                                            │
│  - risk flags                                               │
│  - memory write logs                                        │
│  - consistency evaluation                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Final User Response                    │
│  stable agent persona across model changes                  │
└─────────────────────────────────────────────────────────────┘

__________________________________
## Architecture

For a quick repository-owned view of the current AK-project runtime, see:

- [`docs/architecture/AK-system-overview.md`](docs/architecture/AK-system-overview.md)
- [`docs/architecture/AK-system-mindmap.md`](docs/architecture/AK-system-mindmap.md)


## Development

```bash
npm install
npm run build
npm run test:unit
npm run eval:consistency
```
