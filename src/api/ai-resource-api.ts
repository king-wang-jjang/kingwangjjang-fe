import { apiFetch } from './http';

export type AICapability = 'analysis' | 'chat' | 'vision';
export type AIProvider = 'ollama' | 'openai_compatible';
export type AIResourceStatus = 'healthy' | 'busy' | 'overloaded' | 'unavailable';
export type AICapabilityStatus = 'healthy' | 'busy' | 'saturated' | 'unavailable';
export type AIAnalysisQueueStatus = 'healthy' | 'busy' | 'overloaded' | 'unavailable';

export type AINodeModel = {
  name: string;
  capabilities: AICapability[];
  enabled: boolean;
  isDefault: boolean;
};

export type AINodeRuntime = {
  inFlight: number;
  configuredCapacity: number;
  effectiveCapacity: number;
  availableCapacity: number;
  utilizationPercent: number;
  saturated: boolean;
  attempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  requestRejections: number;
  capacityRejections: number;
  peakInFlight: number;
};

export type AIResourceNode = {
  id: string;
  name: string;
  provider: AIProvider;
  baseUrl: string;
  enabled: boolean;
  priority: number;
  weight: number;
  maxConcurrency: number;
  timeoutSeconds: number;
  apiKeyEnv: string | null;
  healthStatus: string;
  consecutiveFailures: number;
  lastLatencyMs: number | null;
  lastError: string | null;
  lastCheckedAt: string | null;
  lastSuccessAt: string | null;
  createdAt: string;
  updatedAt: string;
  models: AINodeModel[];
  runtime: AINodeRuntime;
};

export type AICapabilityResource = {
  capability: AICapability;
  enabledNodes: number;
  effectiveCapacity: number;
  activeRequests: number;
  availableCapacity: number;
  status: AICapabilityStatus;
};

export type AIResourceOverview = {
  generatedAt: string;
  metricsStartedAt: string;
  status: AIResourceStatus;
  isOverloaded: boolean;
  windowSeconds: number;
  capacity: {
    configuredCapacity: number;
    effectiveCapacity: number;
    activeRequests: number;
    availableCapacity: number;
    utilizationPercent: number;
    peakInFlight: number;
  };
  traffic: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    capacityRejectedRequests: number;
    spilloverRequests: number;
    recentRequests: number;
    recentSuccesses: number;
    recentFailures: number;
    recentCapacityRejections: number;
    recentSpillovers: number;
  };
  capabilities: AICapabilityResource[];
  nodes: AIResourceNode[];
};

export type AIAnalysisQueueOverview = {
  generatedAt: string;
  status: AIAnalysisQueueStatus;
  isOverloaded: boolean;
  workerEnabled: boolean;
  workerConcurrency: number;
  totalCount: number;
  pendingCount: number;
  readyPendingCount: number;
  deferredPendingCount: number;
  processingCount: number;
  doneCount: number;
  failedCount: number;
  staleProcessingCount: number;
  oldestPendingAt: string | null;
  oldestPendingAgeSeconds: number;
  recentArrivals: number;
  recentCompletions: number;
  estimatedClearSeconds: number | null;
};

export type AIResourceDashboard = AIResourceOverview & {
  analysisQueue: AIAnalysisQueueOverview | null;
};

export type AINodeInput = {
  name: string;
  provider: AIProvider;
  baseUrl: string;
  enabled: boolean;
  priority: number;
  weight: number;
  maxConcurrency: number;
  timeoutSeconds: number;
  apiKeyEnv: string | null;
  models: AINodeModel[];
};

type RestNodeModel = {
  name: string;
  capabilities: AICapability[];
  enabled: boolean;
  is_default: boolean;
};

type RestNodeRuntime = {
  in_flight: number;
  configured_capacity: number;
  effective_capacity: number;
  available_capacity: number;
  utilization_percent: number;
  saturated: boolean;
  attempts: number;
  successful_attempts: number;
  failed_attempts: number;
  request_rejections: number;
  capacity_rejections: number;
  peak_in_flight: number;
};

type RestNode = {
  id: string;
  name: string;
  provider: AIProvider;
  base_url: string;
  enabled: boolean;
  priority: number;
  weight: number;
  max_concurrency: number;
  timeout_seconds: number;
  api_key_env: string | null;
  health_status: string;
  consecutive_failures: number;
  last_latency_ms: number | null;
  last_error: string | null;
  last_checked_at: string | null;
  last_success_at: string | null;
  created_at: string;
  updated_at: string;
  models: RestNodeModel[];
};

type RestResourceNode = RestNode & {
  runtime: RestNodeRuntime;
};

type RestResourceOverview = {
  generated_at: string;
  metrics_started_at: string;
  status: AIResourceStatus;
  is_overloaded: boolean;
  window_seconds: number;
  capacity: {
    configured_capacity: number;
    effective_capacity: number;
    active_requests: number;
    available_capacity: number;
    utilization_percent: number;
    peak_in_flight: number;
  };
  traffic: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    capacity_rejected_requests: number;
    spillover_requests: number;
    recent_requests: number;
    recent_successes: number;
    recent_failures: number;
    recent_capacity_rejections: number;
    recent_spillovers: number;
  };
  capabilities: {
    capability: AICapability;
    enabled_nodes: number;
    effective_capacity: number;
    active_requests: number;
    available_capacity: number;
    status: AICapabilityStatus;
  }[];
  nodes: RestResourceNode[];
};

type RestAnalysisQueueOverview = {
  generated_at: string;
  status: AIAnalysisQueueStatus;
  is_overloaded: boolean;
  worker_enabled: boolean;
  worker_concurrency: number;
  total_count: number;
  pending_count: number;
  ready_pending_count: number;
  deferred_pending_count: number;
  processing_count: number;
  done_count: number;
  failed_count: number;
  stale_processing_count: number;
  oldest_pending_at: string | null;
  oldest_pending_age_seconds: number;
  recent_arrivals: number;
  recent_completions: number;
  estimated_clear_seconds: number | null;
};

function normalizeModel(model: RestNodeModel): AINodeModel {
  return {
    name: model.name,
    capabilities: model.capabilities,
    enabled: model.enabled,
    isDefault: model.is_default,
  };
}

function normalizeNode(node: RestResourceNode): AIResourceNode {
  return {
    id: node.id,
    name: node.name,
    provider: node.provider,
    baseUrl: node.base_url,
    enabled: node.enabled,
    priority: node.priority,
    weight: node.weight,
    maxConcurrency: node.max_concurrency,
    timeoutSeconds: node.timeout_seconds,
    apiKeyEnv: node.api_key_env,
    healthStatus: node.health_status,
    consecutiveFailures: node.consecutive_failures,
    lastLatencyMs: node.last_latency_ms,
    lastError: node.last_error,
    lastCheckedAt: node.last_checked_at,
    lastSuccessAt: node.last_success_at,
    createdAt: node.created_at,
    updatedAt: node.updated_at,
    models: node.models.map(normalizeModel),
    runtime: {
      inFlight: node.runtime.in_flight,
      configuredCapacity: node.runtime.configured_capacity,
      effectiveCapacity: node.runtime.effective_capacity,
      availableCapacity: node.runtime.available_capacity,
      utilizationPercent: node.runtime.utilization_percent,
      saturated: node.runtime.saturated,
      attempts: node.runtime.attempts,
      successfulAttempts: node.runtime.successful_attempts,
      failedAttempts: node.runtime.failed_attempts,
      requestRejections: node.runtime.request_rejections,
      capacityRejections: node.runtime.capacity_rejections,
      peakInFlight: node.runtime.peak_in_flight,
    },
  };
}

export async function getAIResourceOverview(): Promise<AIResourceOverview> {
  const overview = await apiFetch<RestResourceOverview>('/gptservice/api/ai/resources', {
    cache: 'no-store',
  });

  return {
    generatedAt: overview.generated_at,
    metricsStartedAt: overview.metrics_started_at,
    status: overview.status,
    isOverloaded: overview.is_overloaded,
    windowSeconds: overview.window_seconds,
    capacity: {
      configuredCapacity: overview.capacity.configured_capacity,
      effectiveCapacity: overview.capacity.effective_capacity,
      activeRequests: overview.capacity.active_requests,
      availableCapacity: overview.capacity.available_capacity,
      utilizationPercent: overview.capacity.utilization_percent,
      peakInFlight: overview.capacity.peak_in_flight,
    },
    traffic: {
      totalRequests: overview.traffic.total_requests,
      successfulRequests: overview.traffic.successful_requests,
      failedRequests: overview.traffic.failed_requests,
      capacityRejectedRequests: overview.traffic.capacity_rejected_requests,
      spilloverRequests: overview.traffic.spillover_requests,
      recentRequests: overview.traffic.recent_requests,
      recentSuccesses: overview.traffic.recent_successes,
      recentFailures: overview.traffic.recent_failures,
      recentCapacityRejections: overview.traffic.recent_capacity_rejections,
      recentSpillovers: overview.traffic.recent_spillovers,
    },
    capabilities: overview.capabilities.map((capability) => ({
      capability: capability.capability,
      enabledNodes: capability.enabled_nodes,
      effectiveCapacity: capability.effective_capacity,
      activeRequests: capability.active_requests,
      availableCapacity: capability.available_capacity,
      status: capability.status,
    })),
    nodes: overview.nodes.map(normalizeNode),
  };
}

export async function getAIAnalysisQueueOverview(): Promise<AIAnalysisQueueOverview> {
  const queue = await apiFetch<RestAnalysisQueueOverview>('/boardservice/api/boards/ai/resources', {
    cache: 'no-store',
  });

  return {
    generatedAt: queue.generated_at,
    status: queue.status,
    isOverloaded: queue.is_overloaded,
    workerEnabled: queue.worker_enabled,
    workerConcurrency: queue.worker_concurrency,
    totalCount: queue.total_count,
    pendingCount: queue.pending_count,
    readyPendingCount: queue.ready_pending_count,
    deferredPendingCount: queue.deferred_pending_count,
    processingCount: queue.processing_count,
    doneCount: queue.done_count,
    failedCount: queue.failed_count,
    staleProcessingCount: queue.stale_processing_count,
    oldestPendingAt: queue.oldest_pending_at,
    oldestPendingAgeSeconds: queue.oldest_pending_age_seconds,
    recentArrivals: queue.recent_arrivals,
    recentCompletions: queue.recent_completions,
    estimatedClearSeconds: queue.estimated_clear_seconds,
  };
}

export async function getAIResourceDashboard(): Promise<AIResourceDashboard> {
  const [overview, analysisQueue] = await Promise.all([
    getAIResourceOverview(),
    getAIAnalysisQueueOverview().catch(() => null),
  ]);
  return { ...overview, analysisQueue };
}

function nodeInputToRest(input: AINodeInput) {
  return {
    name: input.name.trim(),
    provider: input.provider,
    base_url: input.baseUrl.trim(),
    enabled: input.enabled,
    priority: input.priority,
    weight: input.weight,
    max_concurrency: input.maxConcurrency,
    timeout_seconds: input.timeoutSeconds,
    api_key_env: input.apiKeyEnv?.trim() || null,
    models: input.models.map((model) => ({
      name: model.name.trim(),
      capabilities: model.capabilities,
      enabled: model.enabled,
      is_default: model.isDefault,
    })),
  };
}

export function createAINode(input: AINodeInput) {
  return apiFetch<RestNode>('/gptservice/api/ai/nodes', {
    method: 'POST',
    body: JSON.stringify(nodeInputToRest(input)),
  });
}

export function updateAINode(nodeId: string, input: AINodeInput) {
  return apiFetch<RestNode>(`/gptservice/api/ai/nodes/${nodeId}`, {
    method: 'PATCH',
    body: JSON.stringify(nodeInputToRest(input)),
  });
}

export function deleteAINode(nodeId: string) {
  return apiFetch<{ deleted: string }>(`/gptservice/api/ai/nodes/${nodeId}`, {
    method: 'DELETE',
  });
}

export function checkAINode(nodeId: string) {
  return apiFetch<RestNode>(`/gptservice/api/ai/nodes/${nodeId}/health-check`, {
    method: 'POST',
  });
}

export function checkAllAINodes() {
  return apiFetch<RestNode[]>('/gptservice/api/ai/nodes/health-check', {
    method: 'POST',
  });
}
