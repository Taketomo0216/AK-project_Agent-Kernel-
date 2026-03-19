import { runAgentKernel } from './agentKernel';
import { KernelInput, KernelOutput, MemoryRecord, ProviderKind } from './types';

export interface ClawbotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ClawbotSession {
  sessionId: string;
  channelId?: string;
  userId?: string;
  providerPreference?: ProviderKind;
  messages: ClawbotMessage[];
  projectState?: string[];
  memory?: MemoryRecord[];
}

export interface ClawbotAdapterResult {
  sessionId: string;
  reply: string;
  kernel: KernelOutput;
  transport: {
    channelId?: string;
    preserved: true;
  };
}

function selectUserMessage(messages: ClawbotMessage[]): string {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  return latestUserMessage?.content ?? '';
}

function buildContext(messages: ClawbotMessage[], projectState: string[] = []): string[] {
  const transcriptContext = messages.slice(-6, -1).map((message) => `${message.role}: ${message.content}`);
  return [...projectState.map((state) => `project state: ${state}`), ...transcriptContext];
}

export function mapClawbotSessionToKernelInput(session: ClawbotSession): KernelInput {
  return {
    userMessage: selectUserMessage(session.messages),
    context: buildContext(session.messages, session.projectState),
    memory: session.memory,
    preferredProvider: session.providerPreference,
    metadata: {
      sessionId: session.sessionId,
      channelId: session.channelId ?? 'unknown',
      userId: session.userId ?? 'anonymous',
      source: 'clawbot'
    }
  };
}

export async function handleClawbotTurn(session: ClawbotSession): Promise<ClawbotAdapterResult> {
  const kernelInput = mapClawbotSessionToKernelInput(session);
  const kernel = await runAgentKernel(kernelInput);

  return {
    sessionId: session.sessionId,
    reply: kernel.normalizedResponse,
    kernel,
    transport: {
      channelId: session.channelId,
      preserved: true
    }
  };
}
