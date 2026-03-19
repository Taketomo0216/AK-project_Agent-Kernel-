export type ProviderKind = 'local' | 'cloud' | 'fallback';
export type RouteKind = 'general' | 'implementation' | 'analysis' | 'safety';
export type MemoryKind =
  | 'user_preference'
  | 'verified_fact'
  | 'project_state'
  | 'next_action';

export interface MemoryRecord {
  kind: MemoryKind;
  value: string;
  source: 'user' | 'system' | 'assistant';
}

export interface KernelInput {
  userMessage: string;
  task?: string;
  context?: string[];
  memory?: MemoryRecord[];
  preferredProvider?: ProviderKind;
  metadata?: Record<string, string | number | boolean>;
}

export interface KernelOutput {
  provider: ProviderKind;
  route: RouteKind;
  prompt: string;
  rawResponse: string;
  normalizedResponse: string;
  memoryWrites: MemoryRecord[];
  riskFlags: string[];
  logs: LogEvent[];
}

export interface ProviderRequest {
  prompt: string;
  input: KernelInput;
  route: RouteKind;
}

export interface ProviderResponse {
  provider: ProviderKind;
  content: string;
  modelLabel: string;
}

export interface ProviderAdapter {
  kind: ProviderKind;
  canHandle(input: KernelInput): boolean;
  generate(request: ProviderRequest): Promise<ProviderResponse>;
}

export interface IdentityBundle {
  name: string;
  persona: string;
  responseSkeleton: string[];
  memoryBuckets: MemoryKind[];
  forbiddenMemoryPatterns: string[];
  routingModes: RouteKind[];
  documents: {
    identity: string;
    soul: string;
    constitution: string;
    operatingProtocol: string;
    memoryPolicy: string;
    responseSpec: string;
  };
}

export interface RouteDecision {
  route: RouteKind;
  reason: string;
}

export interface LogEvent {
  stage: 'routing' | 'normalization' | 'risk' | 'memory' | 'provider';
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}
