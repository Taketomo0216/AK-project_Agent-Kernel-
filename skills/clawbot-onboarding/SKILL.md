---
name: clawbot-onboarding
description: Guide for integrating AK-project into Clawbot or OpenClaw runtimes, including session-to-KernelInput mapping, rollout checks, local verification, and deployment-oriented onboarding steps. Use when Codex needs to help a user connect Clawbot/OpenClaw message handling to runAgentKernel() or explain how to adopt and deploy the adapter safely.
---

Integrate Clawbot or OpenClaw with AK-project by keeping the transport layer unchanged and routing runtime turns through `src/openclawAdapter.ts`.

## Follow this workflow
1. Read `README.md` for the high-level product flow and local verification commands.
2. Read `references/openclaw-integration-checklist.md` for the integration sequence and rollout checklist.
3. Inspect `src/openclawAdapter.ts`, `src/agentKernel.ts`, and `src/types.ts` before proposing changes.
4. Preserve the message path `Clawbot/OpenClaw -> map session -> runAgentKernel() -> map reply -> transport`.
5. Keep responses structured and inspect `kernel.logs`, `riskFlags`, and `memoryWrites` during rollout.
6. Re-run `npm run build`, `npm run test:unit`, and `npm run eval:consistency` after changes.

## Output expectations
- Explain which runtime entrypoint should call `handleClawbotTurn()`.
- Show the exact session fields that map into `KernelInput`.
- Keep the integration minimal and reversible.
- Recommend the rollout checklist from the reference file when the user asks for deployment or onboarding help.
