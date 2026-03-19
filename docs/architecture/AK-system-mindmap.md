# AK-project System Mindmap

This tree mirrors the current verified phase 2 baseline and the existing OpenClaw integration seam.

```text
AK-project / AgentKernel
├── Core philosophy
│   ├── Identity is repository-owned
│   ├── LLM is a replaceable reasoning engine
│   ├── Behavioral consistency is prioritized over novelty
│   ├── Outputs remain compact and structurally stable
│   └── Governance logic should be inspectable and deterministic
├── Identity layer
│   ├── identity/IDENTITY.md
│   ├── identity/SOUL.md
│   ├── identity/CONSTITUTION.md
│   ├── identity/OPERATING_PROTOCOL.md
│   ├── identity/MEMORY_POLICY.md
│   ├── identity/RESPONSE_SPEC.md
│   ├── identity/config.json
│   └── src/identityLoader.ts
├── Governance layer
│   ├── src/agentKernel.ts
│   ├── src/router.ts
│   ├── src/promptCompiler.ts
│   ├── src/responseNormalizer.ts
│   ├── src/riskGuard.ts
│   ├── src/memoryWriter.ts
│   └── src/logger.ts
├── Provider layer
│   ├── src/providers/base.ts
│   ├── src/providers/localProvider.ts
│   ├── src/providers/cloudProvider.ts
│   ├── src/providers/fallbackProvider.ts
│   └── LLM backend remains outside the identity layer
├── Integration layer
│   ├── External boundary: Channel / Gateway
│   ├── External boundary: Session / Conversation runtime
│   ├── src/openclawAdapter.ts
│   │   ├── map session data into KernelInput
│   │   ├── pass through runAgentKernel()
│   │   └── map KernelOutput back into bot reply shape
│   └── Transport/channel code remains unchanged
├── Evaluation layer
│   ├── tests/
│   │   ├── router
│   │   ├── response normalization
│   │   ├── memory policy
│   │   ├── risk guard
│   │   ├── kernel orchestration
│   │   └── OpenClaw adapter path
│   └── eval/consistency/
│       ├── cases.json
│       └── runConsistencyEval.ts
├── Runtime flow
│   ├── User
│   ├── Channel / Gateway
│   ├── Session / Conversation Layer
│   ├── AgentKernel orchestration
│   ├── Model routing
│   ├── Provider adapter
│   ├── LLM reasoning
│   ├── Post-processing / guard
│   ├── Memory governance
│   ├── Persistence / retrieval boundary
│   ├── Logging / eval / observability
│   └── Final response
└── System value
    ├── Stable identity across providers
    ├── Safer memory handling
    ├── Reversible integration with bot runtimes
    ├── Easier debugging through logs and evals
    └── Faster onboarding for future contributors and Codex
```

## Notes

- The mindmap intentionally distinguishes between **implemented repository modules** and **integration boundaries**.
- Channel/gateway transport and durable persistence are shown as architecture layers because they are part of the runtime story, but the repository currently defines only the AgentKernel side and the OpenClaw adapter seam.
