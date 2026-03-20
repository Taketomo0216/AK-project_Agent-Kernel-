import { runAgentKernel } from './agentKernel';
import { KernelInput, KernelOutput, MemoryRecord, ProviderKind, TaskType } from './types';

const MAX_CONTEXT_MESSAGES = 6;

export interface ClawbotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ClawbotSession {
  sessionId: string;
  channelId?: string;
  userId?: string;
  providerPreference?: ProviderKind;
  taskType?: TaskType;
  messages: ClawbotMessage[];
  projectState?: string[];
  memory?: MemoryRecord[];
  memorySummary?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ClawbotReply {
  content: string;
  debug: {
    route: string;
    provider: ProviderKind;
    riskFlags: string[];
    memoryWrites: MemoryRecord[];
    logCount: number;
  };
}

export interface ClawbotAdapterResult {
  sessionId: string;
  reply: ClawbotReply;
  kernel: KernelOutput;
  transport: {
    channelId?: string;
    preserved: true;
    messageCount: number;
  };
}

function selectUserMessage(messages: ClawbotMessage[]): string {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  return latestUserMessage?.content ?? '';
}

function buildContext(messages: ClawbotMessage[], projectState: string[] = []): string[] {
  const transcriptContext = messages
    .slice(-MAX_CONTEXT_MESSAGES)
    .filter((message) => message.role !== 'user' || message.content !== selectUserMessage(messages))
    .map((message) => `${message.role}: ${message.content}`);

  return [...projectState.map((state) => `project state: ${state}`), ...transcriptContext];
}

function buildMemorySummary(memory: MemoryRecord[] = [], explicitSummary?: string): string {
  if (explicitSummary) {
    return explicitSummary;
  }

  if (memory.length === 0) {
    return 'none';
  }

  return memory.map((record) => `${record.kind}: ${record.value}`).join(' | ');
}

export function mapClawbotSessionToKernelInput(session: ClawbotSession): KernelInput {
  return {
    userMessage: selectUserMessage(session.messages),
    taskType: session.taskType ?? 'general',
    memorySummary: buildMemorySummary(session.memory, session.memorySummary),
    context: buildContext(session.messages, session.projectState),
    memory: session.memory,
    preferredProvider: session.providerPreference,
    metadata: {
      sessionId: session.sessionId,
      channelId: session.channelId ?? 'unknown',
      userId: session.userId ?? 'anonymous',
      source: 'clawbot',
      ...(session.metadata ?? {})
    }
  };
}

export function mapKernelOutputToClawbotReply(kernel: KernelOutput): ClawbotReply {
  return {
    content: kernel.normalizedResponse,
    debug: {
      route: kernel.route,
      provider: kernel.provider,
      riskFlags: kernel.riskFlags,
      memoryWrites: kernel.memoryWrites,
      logCount: kernel.logs.length
    }
  };
}

export async function handleClawbotTurn(session: ClawbotSession): Promise<ClawbotAdapterResult> {
  const kernelInput = mapClawbotSessionToKernelInput(session);
  const kernel = await runAgentKernel(kernelInput);

  return {
    sessionId: session.sessionId,
    reply: mapKernelOutputToClawbotReply(kernel),
    kernel,
    transport: {
      channelId: session.channelId,
      preserved: true,
      messageCount: session.messages.length
    }
  };
}
