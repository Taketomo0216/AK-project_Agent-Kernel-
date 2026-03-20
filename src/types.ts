export type ProviderKind = 'local' | 'cloud' | 'fallback';
export type RouteKind = 'general' | 'implementation' | 'analysis' | 'safety';
export type TaskType = 'general' | 'implementation' | 'analysis' | 'safety';
export type MemoryKind =
  | 'user_preference'
  | 'verified_fact'
  | 'project_state'
  | 'next_action';
export type MemorySource = 'user' | 'system' | 'assistant';
export type RiskSeverity = 'low' | 'medium' | 'high';

export interface MemoryRecord {
  kind: MemoryKind;
  value: string;
  source: MemorySource;
  confidence?: number;
  reason?: string;
  dedupeKey?: string;
}

export interface KernelInput {
  userMessage: string;
  task?: string;
  taskType?: TaskType;
  memorySummary?: string;
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
  riskFindings: RiskFinding[];
  logs: LogEvent[];
}

export interface PromptSection {
  label: string;
  content: string;
}

export interface ProviderRequest {
  prompt: string;
  promptSections: PromptSection[];
  systemPrompt: string;
  userPrompt: string;
  input: KernelInput;
  route: RouteKind;
  metadata: Record<string, unknown>;
}

export interface ProviderUsage {
  promptChars: number;
  completionChars: number;
  totalChars: number;
}

export interface ProviderResponse {
  provider: ProviderKind;
  content: string;
  modelLabel: string;
  latencyMs: number;
  usage: ProviderUsage;
  raw?: Record<string, unknown>;
}

export interface ProviderAdapter {
  kind: ProviderKind;
  canHandle(input: KernelInput): boolean;
  generate(request: ProviderRequest): Promise<ProviderResponse>;
}

export interface IdentityDocuments {
  identity: string;
  soul: string;
  constitution: string;
  operatingProtocol: string;
  memoryPolicy: string;
  responseSpec: string;
}

export interface IdentityBundle {
  name: string;
  persona: string;
  responseSkeleton: string[];
  memoryBuckets: MemoryKind[];
  forbiddenMemoryPatterns: string[];
  routingModes: RouteKind[];
  documents: IdentityDocuments;
}

export interface IdentityLoadResult {
  bundle: Readonly<IdentityBundle>;
  identityLoaded: true;
  loadedFiles: string[];
  fromCache: boolean;
}

export interface PromptDiagnostics {
  containsIdentity: boolean;
  containsSoul: boolean;
  containsConstitution: boolean;
  containsOperatingProtocol: boolean;
  containsMemoryPolicy: boolean;
  containsResponseSpec: boolean;
  estimatedLength: number;
  promptHash: string;
  sectionCount: number;
}

export interface CompiledPrompt {
  prompt: string;
  sections: PromptSection[];
  diagnostics: PromptDiagnostics;
}

export interface RouteDecision {
  route: RouteKind;
  reason: string;
}

export interface RiskFinding {
  id: string;
  severity: RiskSeverity;
  description: string;
  matchedText: string;
}

export interface LogEvent {
  stage:
    | 'identity_loaded'
    | 'route_selected'
    | 'prompt_compiled'
    | 'provider_responded'
    | 'response_normalized'
    | 'risk_checked'
    | 'memory_selected';
  message: string;
  success?: boolean;
  durationMs?: number;
  data?: Record<string, unknown>;
  timestamp: string;
}
