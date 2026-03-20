# OpenClaw / Clawbot Integration Checklist

Use this checklist when onboarding a user or team to AK-project integration.

## Minimal integration path
1. Install dependencies and verify the repo locally.
2. Confirm the existing runtime entrypoint that receives inbound Clawbot messages.
3. Convert the runtime payload into the `ClawbotSession` shape expected by `src/openclawAdapter.ts`.
4. Call `handleClawbotTurn()` instead of calling an LLM provider directly.
5. Return `reply.content` to the transport layer unchanged.
6. Expose `reply.debug` and `kernel.logs` in non-production diagnostics during rollout.

## Required runtime fields
- `sessionId`
- `messages`
- optional `channelId`
- optional `userId`
- optional `providerPreference`
- optional `taskType`
- optional `projectState`
- optional `memory`
- optional `memorySummary`
- optional transport metadata

## Verification sequence
```bash
npm install
npm run build
npm run test:unit
npm run eval:consistency
```

## Rollout notes
- Keep the existing channel, gateway, and session transport behavior intact.
- Do not bypass `runAgentKernel()` in the integrated path.
- Inspect `identity_loaded`, `prompt_compiled`, `provider_responded`, `risk_checked`, and `memory_selected` log events during rollout.
- If the runtime already has memory or session state, pass it through `memory`, `memorySummary`, and `projectState` rather than mutating the kernel contract.
