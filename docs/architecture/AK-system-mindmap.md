# AK-project System Mindmap

> This document reflects the current verified phase 2 baseline of AK-project.

```mermaid
mindmap
  root((AK-project / AgentKernel))
    Core philosophy
      Identity is repository-owned
      LLM is a replaceable reasoning engine
      Behavioral consistency over novelty
      Structured output over improvisation
      Deterministic governance over hidden heuristics
    Identity layer
      identity/
        IDENTITY.md
        SOUL.md
        CONSTITUTION.md
        OPERATING_PROTOCOL.md
        MEMORY_POLICY.md
        RESPONSE_SPEC.md
        config.json
      src/identityLoader.ts
    Governance layer
      src/agentKernel.ts
      src/router.ts
      src/promptCompiler.ts
      src/responseNormalizer.ts
      src/riskGuard.ts
      src/memoryWriter.ts
      src/logger.ts
    Provider layer
      src/providers/
        base.ts
        localProvider.ts
        cloudProvider.ts
        fallbackProvider.ts
      LLM backend stays replaceable
    Integration layer
      Channel / Gateway boundary
      Session / Conversation boundary
      src/openclawAdapter.ts
        map runtime to KernelInput
        call runAgentKernel()
        map KernelOutput to bot reply
      Transport remains unchanged
    Evaluation layer
      tests/
        router
        response normalization
        memory policy
        risk guard
        kernel orchestration
        openclaw adapter
      eval/consistency/
        cases.json
        runConsistencyEval.ts
    Runtime flow
      User
      Channel / Gateway
      Session / Conversation Layer
      AgentKernel orchestration
      Model routing
      Provider adapter
      LLM reasoning
      Post-processing / guard
      Memory governance
      Persistence / retrieval boundary
      Logging / eval / observability
      Final response
    System value
      Stable identity across providers
      Safer memory handling
      Reversible OpenClaw readiness
      Better debugging via logs and evals
      Faster onboarding for contributors
```
