import type { AIResourceDashboard } from 'src/api/ai-resource-api';

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { vi, test, expect, describe, beforeEach } from 'vitest';

import { ResourcesView } from 'src/sections/admin/resources/view/resources-view';

const mocks = vi.hoisted(() => ({
  refetch: vi.fn(),
  createNode: vi.fn(),
  updateNode: vi.fn(),
  deleteNode: vi.fn(),
  checkNode: vi.fn(),
  checkAllNodes: vi.fn(),
}));

const OVERVIEW: AIResourceDashboard = {
  generatedAt: '2026-09-01T01:00:00Z',
  metricsStartedAt: '2026-09-01T00:00:00Z',
  status: 'overloaded',
  isOverloaded: true,
  windowSeconds: 60,
  capacity: {
    configuredCapacity: 2,
    effectiveCapacity: 2,
    activeRequests: 2,
    availableCapacity: 0,
    utilizationPercent: 100,
    peakInFlight: 2,
  },
  traffic: {
    totalRequests: 12,
    successfulRequests: 8,
    failedRequests: 2,
    capacityRejectedRequests: 2,
    spilloverRequests: 1,
    recentRequests: 4,
    recentSuccesses: 2,
    recentFailures: 2,
    recentCapacityRejections: 2,
    recentSpillovers: 1,
  },
  capabilities: [
    {
      capability: 'analysis',
      enabledNodes: 1,
      effectiveCapacity: 2,
      activeRequests: 2,
      availableCapacity: 0,
      status: 'saturated',
    },
    {
      capability: 'chat',
      enabledNodes: 1,
      effectiveCapacity: 2,
      activeRequests: 0,
      availableCapacity: 0,
      status: 'saturated',
    },
    {
      capability: 'vision',
      enabledNodes: 0,
      effectiveCapacity: 0,
      activeRequests: 0,
      availableCapacity: 0,
      status: 'unavailable',
    },
  ],
  nodes: [
    {
      id: 'node-1',
      name: 'primary-ollama',
      provider: 'ollama',
      baseUrl: 'http://ollama.local:11434',
      enabled: true,
      priority: 10,
      weight: 1,
      maxConcurrency: 2,
      timeoutSeconds: 60,
      apiKeyEnv: null,
      healthStatus: 'healthy',
      consecutiveFailures: 0,
      lastLatencyMs: 420,
      lastError: null,
      lastCheckedAt: '2026-09-01T01:00:00Z',
      lastSuccessAt: '2026-09-01T01:00:00Z',
      createdAt: '2026-08-01T01:00:00Z',
      updatedAt: '2026-09-01T01:00:00Z',
      models: [
        {
          name: 'gemma4:e4b',
          capabilities: ['analysis', 'chat'],
          enabled: true,
          isDefault: true,
        },
      ],
      runtime: {
        inFlight: 2,
        configuredCapacity: 2,
        effectiveCapacity: 2,
        availableCapacity: 0,
        utilizationPercent: 100,
        saturated: true,
        attempts: 10,
        successfulAttempts: 8,
        failedAttempts: 0,
        requestRejections: 0,
        capacityRejections: 2,
        peakInFlight: 2,
      },
    },
  ],
  analysisQueue: {
    generatedAt: '2026-09-01T01:00:00Z',
    status: 'overloaded',
    isOverloaded: true,
    workerEnabled: true,
    workerConcurrency: 2,
    totalCount: 30,
    pendingCount: 12,
    readyPendingCount: 10,
    deferredPendingCount: 2,
    processingCount: 2,
    doneCount: 15,
    failedCount: 1,
    staleProcessingCount: 0,
    oldestPendingAt: '2026-09-01T00:45:00Z',
    oldestPendingAgeSeconds: 900,
    recentArrivals: 18,
    recentCompletions: 12,
    estimatedClearSeconds: 3600,
  },
};

vi.mock('src/hooks/use-ai-resources', () => ({
  useAIResources: () => ({
    data: OVERVIEW,
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    isMutating: false,
    ...mocks,
  }),
}));

describe('ResourcesView', () => {
  beforeEach(() => {
    mocks.createNode.mockResolvedValue({});
    mocks.checkNode.mockResolvedValue({});
    mocks.checkAllNodes.mockResolvedValue([]);
  });

  test('makes unhandled AI throughput visible', () => {
    render(<ResourcesView />);

    expect(screen.getAllByText('처리량 부족').length).toBeGreaterThan(0);
    expect(screen.getByText(/최근 60초 동안 2건을 처리하지 못했습니다/)).toBeTruthy();
    expect(screen.getByText(/분석 대기 12건, 최장 15분/)).toBeTruthy();
    expect(screen.getByText('분석 대기열')).toBeTruthy();
    expect(screen.getAllByText('2 / 2').length).toBeGreaterThan(0);
    expect(screen.getByText('primary-ollama')).toBeTruthy();
    expect(screen.getAllByText('포화').length).toBeGreaterThan(0);
  });

  test('checks an individual node and opens the add-node form', async () => {
    const user = userEvent.setup();
    render(<ResourcesView />);

    await user.click(screen.getByRole('button', { name: 'primary-ollama 연결 상태 확인' }));
    expect(mocks.checkNode).toHaveBeenCalledWith('node-1');

    await user.click(screen.getByRole('button', { name: 'Node 추가' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'AI Node 추가' })).toBeTruthy();
  });

  test('submits a new node with its routing capacity and model', async () => {
    const user = userEvent.setup();
    render(<ResourcesView />);

    await user.click(screen.getByRole('button', { name: 'Node 추가' }));
    await user.type(screen.getByRole('textbox', { name: 'Node 이름' }), 'secondary-node');
    await user.type(
      screen.getByRole('textbox', { name: 'Base URL' }),
      'http://secondary.local:11434'
    );
    await user.type(screen.getByRole('textbox', { name: '모델 1' }), 'gemma-new');
    await user.click(screen.getByRole('button', { name: 'Node 추가' }));

    expect(mocks.createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'secondary-node',
        baseUrl: 'http://secondary.local:11434',
        maxConcurrency: 1,
        models: [
          expect.objectContaining({
            name: 'gemma-new',
            capabilities: ['analysis'],
          }),
        ],
      })
    );
  });
});
