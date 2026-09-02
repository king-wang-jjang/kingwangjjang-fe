'use client';

import type {
  AINodeInput,
  AIResourceNode,
  AIResourceStatus,
  AICapabilityStatus,
  AIAnalysisQueueStatus,
} from 'src/api/ai-resource-api';

import { useState } from 'react';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Button,
  Dialog,
  Divider,
  Tooltip,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

import { useAIResources } from 'src/hooks/use-ai-resources';

import { ApiError } from 'src/api/http';

import { AINodeDialog } from './ai-node-dialog';

const STATUS_META: Record<
  AIResourceStatus,
  { label: string; color: 'success' | 'warning' | 'error'; description: string }
> = {
  healthy: {
    label: '여유',
    color: 'success',
    description: 'AI Node와 분석 대기열이 현재 유입량을 처리하고 있습니다.',
  },
  busy: {
    label: '주의',
    color: 'warning',
    description: 'Node 사용률이 높거나 분석 대기가 증가하고 있습니다.',
  },
  overloaded: {
    label: '처리량 부족',
    color: 'error',
    description: '현재 AI 파이프라인에 처리하지 못한 요청 또는 과도한 분석 대기가 있습니다.',
  },
  unavailable: {
    label: '사용 불가',
    color: 'error',
    description: 'AI Node 또는 분석 Worker가 요청 처리에 사용할 수 없는 상태입니다.',
  },
};

const QUEUE_STATUS_META: Record<
  AIAnalysisQueueStatus,
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  healthy: { label: '원활', color: 'success' },
  busy: { label: '대기 증가', color: 'warning' },
  overloaded: { label: '적체', color: 'error' },
  unavailable: { label: 'Worker 중지', color: 'error' },
};

const CAPABILITY_LABELS = {
  analysis: 'Analysis',
  chat: 'Chat',
  vision: 'Vision',
};

const CAPABILITY_COLORS: Record<AICapabilityStatus, 'success' | 'warning' | 'error' | 'default'> = {
  healthy: 'success',
  busy: 'warning',
  saturated: 'error',
  unavailable: 'default',
};

const DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    try {
      const parsed = JSON.parse(error.message) as { detail?: string };
      if (parsed.detail) return parsed.detail;
    } catch {
      return error.message;
    }
  }
  if (error instanceof Error) return error.message;
  return '요청을 처리하지 못했습니다.';
}

function healthMeta(node: AIResourceNode) {
  if (!node.enabled) return { label: '비활성', color: 'default' as const };
  if (node.runtime.saturated) return { label: '포화', color: 'error' as const };
  if (node.healthStatus === 'healthy') return { label: '정상', color: 'success' as const };
  if (node.healthStatus === 'degraded') return { label: '저하', color: 'warning' as const };
  if (node.healthStatus === 'unhealthy') return { label: '장애', color: 'error' as const };
  return { label: '확인 전', color: 'default' as const };
}

function formatLatency(latency: number | null) {
  if (latency === null) return '—';
  if (latency < 1000) return `${Math.round(latency)} ms`;
  return `${(latency / 1000).toFixed(1)} s`;
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return '계산 중';
  if (seconds <= 0) return '대기 없음';
  if (seconds < 60) return `${seconds}초`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}분`;
  return `${(seconds / 3600).toFixed(1)}시간`;
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: React.ReactNode;
  helper: string;
}) {
  return (
    <Card>
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.35, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function ResourcesView() {
  const resources = useAIResources();
  const [editingNode, setEditingNode] = useState<AIResourceNode | null | undefined>(undefined);
  const [deletingNode, setDeletingNode] = useState<AIResourceNode | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  const run = async (operation: () => Promise<unknown>, successMessage: string) => {
    setOperationError(null);
    setOperationMessage(null);
    try {
      await operation();
      setOperationMessage(successMessage);
      return true;
    } catch (error) {
      setOperationError(errorMessage(error));
      return false;
    }
  };

  const saveNode = async (input: AINodeInput) => {
    const node = editingNode || null;
    const saved = await run(
      () => (node ? resources.updateNode({ nodeId: node.id, input }) : resources.createNode(input)),
      node ? `${input.name} Node 설정을 저장했습니다.` : `${input.name} Node를 추가했습니다.`
    );
    if (saved) setEditingNode(undefined);
  };

  if (resources.isPending) {
    return (
      <Stack
        role="status"
        spacing={1.5}
        sx={{ minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size={30} />
        <Typography variant="body2" color="text.secondary">
          AI Resource를 불러오고 있습니다.
        </Typography>
      </Stack>
    );
  }

  if (resources.isError || !resources.data) {
    return (
      <Box sx={{ width: 'min(100%, 760px)', mx: 'auto', py: 5 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => resources.refetch()}>
              다시 시도
            </Button>
          }
        >
          AI Resource 정보를 불러오지 못했습니다. {errorMessage(resources.error)}
        </Alert>
      </Box>
    );
  }

  const overview = resources.data;
  const queue = overview.analysisQueue;
  const combinedStatus: AIResourceStatus =
    overview.status === 'unavailable' || queue?.status === 'unavailable'
      ? 'unavailable'
      : overview.status === 'overloaded' || queue?.status === 'overloaded'
        ? 'overloaded'
        : overview.status === 'busy' || queue?.status === 'busy'
          ? 'busy'
          : 'healthy';
  const status = STATUS_META[combinedStatus];

  return (
    <Box sx={{ width: 'min(100%, 1440px)', mx: 'auto', pb: 6 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <DnsOutlinedIcon color="action" />
              <Typography variant="h4">AI Resource</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              AI 처리량과 Node 상태를 확인하고 여러 추론 서버의 라우팅을 관리합니다.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Button
              color="inherit"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => resources.refetch()}
              disabled={resources.isFetching}
            >
              새로고침
            </Button>
            <Button
              variant="outlined"
              startIcon={<HealthAndSafetyOutlinedIcon />}
              disabled={resources.isMutating || overview.nodes.length === 0}
              onClick={() => run(resources.checkAllNodes, '모든 Node의 연결 상태를 확인했습니다.')}
            >
              전체 상태 확인
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setEditingNode(null)}
            >
              Node 추가
            </Button>
          </Stack>
        </Stack>

        {operationError && (
          <Alert severity="error" onClose={() => setOperationError(null)}>
            {operationError}
          </Alert>
        )}
        {operationMessage && (
          <Alert severity="success" onClose={() => setOperationMessage(null)}>
            {operationMessage}
          </Alert>
        )}

        <Alert severity={status.color}>
          <Typography variant="subtitle2" component="span" sx={{ mr: 1 }}>
            {status.label}
          </Typography>
          {status.description}
          {overview.traffic.recentCapacityRejections > 0 && (
            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700 }}>
              최근 {overview.windowSeconds}초 동안 {overview.traffic.recentCapacityRejections}건을
              처리하지 못했습니다. Node 추가 또는 동시 처리 한도 조정이 필요합니다.
            </Typography>
          )}
          {queue?.isOverloaded && (
            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700 }}>
              분석 대기 {queue.pendingCount}건, 최장 {formatDuration(queue.oldestPendingAgeSeconds)}
              입니다. 최근 유입량과 Worker/Node 처리량을 함께 조정해야 합니다.
            </Typography>
          )}
        </Alert>

        {!queue && (
          <Alert severity="warning">
            Node 지표는 확인했지만 분석 대기열 정보는 불러오지 못했습니다. Board Service 연결과 배포
            버전을 확인해 주세요.
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1.5,
          }}
        >
          <MetricCard
            label="처리 상태"
            value={<Chip label={status.label} color={status.color} size="small" />}
            helper={
              queue
                ? `Node 최근 ${overview.windowSeconds}초 + 분석 대기열`
                : `Node 최근 ${overview.windowSeconds}초 기준`
            }
          />
          <MetricCard
            label="현재 동시 처리"
            value={`${overview.capacity.activeRequests} / ${overview.capacity.effectiveCapacity}`}
            helper={`여유 ${overview.capacity.availableCapacity} · 최대 관측 ${overview.capacity.peakInFlight}`}
          />
          <MetricCard
            label={`최근 ${overview.windowSeconds}초 요청`}
            value={overview.traffic.recentRequests.toLocaleString('ko-KR')}
            helper={`완료 ${overview.traffic.recentSuccesses} · 실패 ${overview.traffic.recentFailures}`}
          />
          <MetricCard
            label="Node 용량 거절"
            value={overview.traffic.recentCapacityRejections.toLocaleString('ko-KR')}
            helper={`누적 ${overview.traffic.capacityRejectedRequests} · 우회 ${overview.traffic.recentSpillovers}`}
          />
        </Box>

        {queue && (
          <Box>
            <Stack
              direction="row"
              sx={{ mb: 1.5, alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Box>
                <Typography variant="h6">분석 대기열</Typography>
                <Typography variant="body2" color="text.secondary">
                  10분 이상 기다리거나 Worker당 대기가 10건 이상이면 적체로 판정합니다.
                </Typography>
              </Box>
              <Chip
                label={QUEUE_STATUS_META[queue.status].label}
                color={QUEUE_STATUS_META[queue.status].color}
                size="small"
              />
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              <MetricCard
                label="분석 대기"
                value={queue.pendingCount.toLocaleString('ko-KR')}
                helper={`즉시 ${queue.readyPendingCount} · 재시도 대기 ${queue.deferredPendingCount}`}
              />
              <MetricCard
                label="Worker 처리 중"
                value={`${queue.processingCount} / ${queue.workerConcurrency}`}
                helper={
                  queue.staleProcessingCount > 0
                    ? `멈춤 의심 ${queue.staleProcessingCount}건`
                    : '멈춤으로 의심되는 작업 없음'
                }
              />
              <MetricCard
                label="가장 오래된 대기"
                value={formatDuration(queue.oldestPendingAgeSeconds)}
                helper={`현재 속도 예상 해소 ${formatDuration(queue.estimatedClearSeconds)}`}
              />
              <MetricCard
                label="최근 1시간 완료"
                value={queue.recentCompletions.toLocaleString('ko-KR')}
                helper={`같은 시간 새 유입 ${queue.recentArrivals.toLocaleString('ko-KR')}`}
              />
            </Box>
          </Box>
        )}

        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
              >
                <Box>
                  <Typography variant="h6">전체 처리 용량</Typography>
                  <Typography variant="body2" color="text.secondary">
                    정상·확인 전 Node의 동시 처리 한도를 합산합니다.
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {overview.capacity.utilizationPercent.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={overview.capacity.utilizationPercent}
                color={
                  overview.status === 'overloaded'
                    ? 'error'
                    : overview.status === 'busy'
                      ? 'warning'
                      : 'primary'
                }
                sx={{ height: 10, borderRadius: 999 }}
              />
              <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary">
                  설정 용량 {overview.capacity.configuredCapacity}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  유효 용량 {overview.capacity.effectiveCapacity}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  측정 시작 {DATE_FORMATTER.format(new Date(overview.metricsStartedAt))}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Box>
          <Typography variant="h6">Capability별 용량</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1.5 }}>
            하나의 Node 용량은 여러 capability가 함께 사용합니다.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 1.5,
            }}
          >
            {overview.capabilities.map((capability) => (
              <Card key={capability.capability}>
                <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
                  <Stack spacing={1.25}>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <Typography variant="subtitle1">
                        {CAPABILITY_LABELS[capability.capability]}
                      </Typography>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={CAPABILITY_COLORS[capability.status]}
                        label={
                          capability.status === 'unavailable'
                            ? 'Node 없음'
                            : capability.status === 'saturated'
                              ? '포화'
                              : capability.status === 'busy'
                                ? '주의'
                                : '여유'
                        }
                      />
                    </Stack>
                    <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {capability.activeRequests} / {capability.effectiveCapacity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {capability.enabledNodes}개 Node · 여유 {capability.availableCapacity}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        <Box>
          <Stack
            direction="row"
            sx={{ mb: 1.5, justifyContent: 'space-between', alignItems: 'baseline' }}
          >
            <Box>
              <Typography variant="h6">AI Nodes</Typography>
              <Typography variant="body2" color="text.secondary">
                우선순위가 낮은 숫자부터 선택하고, 같은 우선순위에서는 가중치로 분산합니다.
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {overview.nodes.length}개
            </Typography>
          </Stack>

          {overview.nodes.length === 0 ? (
            <Card>
              <CardContent sx={{ py: 6, textAlign: 'center' }}>
                <DnsOutlinedIcon sx={{ fontSize: 42, color: 'text.secondary' }} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  등록된 AI Node가 없습니다
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  첫 Node를 추가하면 capability 기반 라우팅을 시작할 수 있습니다.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => setEditingNode(null)}
                >
                  Node 추가
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={1.25}>
              {overview.nodes.map((node) => {
                const health = healthMeta(node);
                return (
                  <Card key={node.id}>
                    <CardContent
                      sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}
                    >
                      <Stack spacing={2}>
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          spacing={2}
                          sx={{
                            justifyContent: 'space-between',
                            alignItems: { md: 'flex-start' },
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              useFlexGap
                              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                            >
                              <Typography variant="subtitle1">{node.name}</Typography>
                              <Chip size="small" label={health.label} color={health.color} />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={node.provider === 'ollama' ? 'Ollama' : 'OpenAI compatible'}
                              />
                            </Stack>
                            <Tooltip title={node.baseUrl} placement="bottom-start">
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  mt: 0.4,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {node.baseUrl}
                              </Typography>
                            </Tooltip>
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="연결 상태 확인">
                              <span>
                                <IconButton
                                  aria-label={`${node.name} 연결 상태 확인`}
                                  disabled={resources.isMutating}
                                  onClick={() =>
                                    run(
                                      () => resources.checkNode(node.id),
                                      `${node.name} 상태를 확인했습니다.`
                                    )
                                  }
                                >
                                  <SpeedRoundedIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="설정 수정">
                              <IconButton
                                aria-label={`${node.name} 수정`}
                                onClick={() => setEditingNode(node)}
                              >
                                <EditOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Node 삭제">
                              <IconButton
                                aria-label={`${node.name} 삭제`}
                                onClick={() => setDeletingNode(node)}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        <Divider />

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: 'repeat(2, minmax(0, 1fr))',
                              md: 'repeat(5, minmax(0, 1fr))',
                            },
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              현재 처리
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {node.runtime.inFlight} / {node.runtime.effectiveCapacity}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              최근 지연
                            </Typography>
                            <Typography variant="subtitle1">
                              {formatLatency(node.lastLatencyMs)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              우선순위 / 가중치
                            </Typography>
                            <Typography variant="subtitle1">
                              {node.priority} / {node.weight}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              처리 성공
                            </Typography>
                            <Typography variant="subtitle1">
                              {node.runtime.successfulAttempts.toLocaleString('ko-KR')}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              용량 거절
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              color={
                                node.runtime.capacityRejections > 0 ? 'error.main' : 'text.primary'
                              }
                            >
                              {node.runtime.capacityRejections.toLocaleString('ko-KR')}
                            </Typography>
                          </Box>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={node.runtime.utilizationPercent}
                          color={
                            node.runtime.saturated
                              ? 'error'
                              : node.runtime.utilizationPercent >= 80
                                ? 'warning'
                                : 'primary'
                          }
                          sx={{ height: 6, borderRadius: 999 }}
                        />

                        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                          {node.models.flatMap((model) =>
                            model.capabilities.map((capability) => (
                              <Chip
                                key={`${model.name}-${capability}`}
                                size="small"
                                variant="outlined"
                                label={`${model.name} · ${CAPABILITY_LABELS[capability]}`}
                              />
                            ))
                          )}
                        </Stack>

                        {node.lastError && (
                          <Alert severity="warning" sx={{ py: 0 }}>
                            {node.lastError}
                          </Alert>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      </Stack>

      {editingNode !== undefined && (
        <AINodeDialog
          node={editingNode}
          saving={resources.isMutating}
          onClose={() => setEditingNode(undefined)}
          onSubmit={saveNode}
        />
      )}

      <Dialog open={Boolean(deletingNode)} onClose={() => setDeletingNode(null)}>
        <DialogTitle>AI Node 삭제</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <strong>{deletingNode?.name}</strong> Node를 삭제하면 즉시 라우팅 대상에서 제외됩니다.
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeletingNode(null)}>
            취소
          </Button>
          <Button
            color="error"
            disabled={resources.isMutating}
            onClick={async () => {
              if (!deletingNode) return;
              const deleted = await run(
                () => resources.deleteNode(deletingNode.id),
                `${deletingNode.name} Node를 삭제했습니다.`
              );
              if (deleted) setDeletingNode(null);
            }}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
