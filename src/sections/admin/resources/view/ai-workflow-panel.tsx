'use client';

import type { AIAnalysisRun, AIAnalysisRunFilters } from 'src/api/ai-resource-api';

import { useState, useEffect } from 'react';

import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Table,
  Button,
  Dialog,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  LinearProgress,
  TablePagination,
} from '@mui/material';

import { useAIAnalysisRuns } from 'src/hooks/use-ai-analysis-runs';

import { ApiError } from 'src/api/http';

const STATUS = {
  pending: { label: '대기', color: 'warning' },
  processing: { label: '실행 중', color: 'info' },
  done: { label: '성공', color: 'success' },
  failed: { label: '실패', color: 'error' },
} as const;

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ko-KR', { hour12: false });
}

function retryError(error: unknown) {
  if (error instanceof ApiError) {
    try {
      const body = JSON.parse(error.message) as { detail?: unknown };
      if (typeof body.detail === 'string') return body.detail;
    } catch {
      /* Use the fallback message below. */
    }
  }
  return '재시도 요청에 실패했습니다. 연결 상태를 확인하고 다시 시도해 주세요.';
}

function RunFlow({ run }: { run: AIAnalysisRun }) {
  const active = run.status === 'pending' ? 0 : run.status === 'done' ? 2 : 1;
  const labels = ['대기', run.status === 'failed' ? '분석 실패' : 'LLM 분석', '완료'];
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }} aria-label="작업 진행 흐름">
      {labels.map((label, index) => (
        <Stack key={index} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {index > 0 && <ArrowForwardRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
          <Chip
            label={label}
            size="small"
            color={
              index < active ? 'success' : index === active ? STATUS[run.status].color : 'default'
            }
            variant={index === active ? 'filled' : 'outlined'}
            sx={{ borderRadius: 1, fontSize: 11 }}
          />
        </Stack>
      ))}
    </Stack>
  );
}

export function AIWorkflowPanel() {
  const [filters, setFilters] = useState<AIAnalysisRunFilters>({
    status: 'all',
    query: '',
    page: 0,
  });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AIAnalysisRun | null>(null);
  const [notice, setNotice] = useState<{ severity: 'success' | 'error'; text: string } | null>(
    null
  );
  const runs = useAIAnalysisRuns(filters);
  const queue = runs.data?.queue;
  const detail = runs.data?.items.find((item) => item.boardId === selected?.boardId) ?? selected;

  useEffect(() => {
    if (runs.data && filters.page > 0 && filters.page * 20 >= runs.data.total) {
      const page = Math.max(0, Math.ceil(runs.data.total / 20) - 1);
      setFilters((current) => ({ ...current, page }));
    }
  }, [runs.data, filters.page]);

  const retry = async (run: AIAnalysisRun) => {
    setNotice(null);
    try {
      await runs.retryRun(run.boardId);
      setSelected(null);
      setNotice({
        severity: 'success',
        text: `“${run.title}” 작업을 대기열에 등록했습니다. 실행 결과는 자동으로 갱신됩니다.`,
      });
    } catch (error) {
      setNotice({ severity: 'error', text: retryError(error) });
    }
  };

  const counts = queue
    ? {
        all: queue.totalCount,
        pending: queue.pendingCount,
        processing: queue.processingCount,
        done: queue.doneCount,
        failed: queue.failedCount,
      }
    : null;
  const retryButton = (run: AIAnalysisRun) =>
    run.status === 'failed' && (
      <Button
        size="small"
        color="error"
        variant="outlined"
        startIcon={<ReplayRoundedIcon />}
        aria-label={`${run.title} 재시도`}
        disabled={runs.isRetrying || !queue?.workerEnabled || runs.isError}
        onClick={() => retry(run)}
        sx={{ whiteSpace: 'nowrap' }}
      >
        {runs.retryingBoardId === run.boardId ? '등록 중…' : '재시도'}
      </Button>
    );

  return (
    <Card component="section" aria-label="LLM 분석 워크플로우">
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h5">LLM 분석 워크플로우</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                게시글별 최신 실행 상태를 확인하고 실패한 분석을 재시도하세요.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                5초마다 자동 갱신{queue ? ` · 마지막 확인 ${formatDate(queue.generatedAt)}` : ''}
              </Typography>
            </Box>
            <Button
              color="inherit"
              startIcon={<RefreshRoundedIcon />}
              disabled={runs.isFetching}
              onClick={() => runs.refetch()}
              sx={{ flexShrink: 0 }}
            >
              실행 상태 갱신
            </Button>
          </Stack>

          {notice && (
            <Alert severity={notice.severity} onClose={() => setNotice(null)}>
              {notice.text}
            </Alert>
          )}
          {runs.isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={() => runs.refetch()}>
                  다시 불러오기
                </Button>
              }
            >
              실행 상태를 불러오지 못했습니다.
              {runs.data ? ' 이전 조회 결과가 표시되고 있습니다.' : ''}
            </Alert>
          )}
          {queue && !queue.workerEnabled && (
            <Alert severity="warning">
              분석 Worker가 중지되어 있습니다. Worker를 시작하면 대기 중인 작업이 처리되며 재시도할
              수 있습니다.
            </Alert>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
              gap: 1.25,
            }}
          >
            {(['all', 'pending', 'processing', 'done', 'failed'] as const).map((status) => {
              const color = status === 'all' ? 'primary' : STATUS[status].color;
              const label = status === 'all' ? '전체' : STATUS[status].label;
              return (
                <Button
                  key={status}
                  color={color}
                  variant="outlined"
                  aria-pressed={filters.status === status}
                  aria-label={`${label} 작업 보기`}
                  onClick={() => setFilters((current) => ({ ...current, status, page: 0 }))}
                  sx={{
                    p: 2,
                    justifyContent: 'flex-start',
                    borderWidth: filters.status === status ? 2 : 1,
                    bgcolor: filters.status === status ? `${color}.lighter` : 'transparent',
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" component="span">
                      {label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {counts ? counts[status].toLocaleString('ko-KR') : '—'}
                    </Typography>
                  </Box>
                </Button>
              );
            })}
          </Box>

          <Stack
            component="form"
            direction="row"
            spacing={1}
            onSubmit={(event) => {
              event.preventDefault();
              setFilters((current) => ({ ...current, query: search.trim(), page: 0 }));
            }}
          >
            <TextField
              size="small"
              fullWidth
              label="제목 · 사이트 · 작업 ID 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
            <Button type="submit" variant="outlined">
              검색
            </Button>
          </Stack>

          {runs.isPending && <LinearProgress aria-label="실행 상태 불러오는 중" />}
          {runs.data && (
            <Box>
              <TableContainer>
                <Table size="small" aria-label="LLM 분석 작업 목록" sx={{ minWidth: 850 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>작업</TableCell>
                      <TableCell>상태</TableCell>
                      <TableCell>진행 흐름</TableCell>
                      <TableCell align="right">연속 실패</TableCell>
                      <TableCell>최근 변경</TableCell>
                      <TableCell align="right">작업 관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {runs.data.items.map((run) => (
                      <TableRow
                        key={run.boardId}
                        hover
                        sx={{
                          '& td': { py: 1.75 },
                          bgcolor: run.status === 'failed' ? 'error.lighter' : undefined,
                        }}
                      >
                        <TableCell sx={{ maxWidth: 320 }}>
                          <Button
                            color="inherit"
                            onClick={() => setSelected(run)}
                            sx={{
                              p: 0,
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              maxWidth: '100%',
                            }}
                          >
                            <Typography variant="subtitle2" noWrap>
                              {run.title}
                            </Typography>
                          </Button>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {run.siteLabel}
                          </Typography>
                          {run.error && (
                            <Typography
                              variant="caption"
                              color="error.main"
                              sx={{ display: 'block' }}
                              noWrap
                              title={run.error}
                            >
                              {run.error}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={STATUS[run.status].color}
                            label={
                              run.status === 'pending' && run.error
                                ? '재시도 대기'
                                : STATUS[run.status].label
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <RunFlow run={run} />
                        </TableCell>
                        <TableCell align="right">{run.retryCount}회</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="caption">
                            {formatDate(run.updatedAt ?? run.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              color="inherit"
                              aria-label={`${run.title} 상세 보기`}
                              onClick={() => setSelected(run)}
                            >
                              상세
                            </Button>
                            {retryButton(run)}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {runs.data.items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                          조건에 맞는 분석 작업이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={runs.data.total}
                page={filters.page}
                rowsPerPage={20}
                rowsPerPageOptions={[20]}
                onPageChange={(_, page) => setFilters((current) => ({ ...current, page }))}
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}건`}
                getItemAriaLabel={(type) => (type === 'next' ? '다음 페이지' : '이전 페이지')}
              />
            </Box>
          )}
        </Stack>
      </CardContent>

      <Dialog open={Boolean(detail)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>분석 작업 상세</DialogTitle>
        {detail && (
          <DialogContent>
            <Stack spacing={2}>
              {notice?.severity === 'error' && <Alert severity="error">{notice.text}</Alert>}
              <Typography variant="subtitle1">{detail.title}</Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ overflowWrap: 'anywhere' }}
              >
                작업 ID: {detail.boardId} · {detail.siteLabel}
              </Typography>
              <RunFlow run={detail} />
              <Chip
                sx={{ alignSelf: 'flex-start' }}
                label={STATUS[detail.status].label}
                color={STATUS[detail.status].color}
              />
              {detail.error && (
                <Alert
                  severity={detail.status === 'failed' ? 'error' : 'warning'}
                  sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                >
                  {detail.error}
                </Alert>
              )}
              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 1,
                  '& dd': { m: 0 },
                }}
              >
                <Typography component="dt" variant="body2">
                  작업 생성
                </Typography>
                <Typography component="dd" variant="body2">
                  {formatDate(detail.createdAt)}
                </Typography>
                <Typography component="dt" variant="body2">
                  실행 요청 / 예약
                </Typography>
                <Typography component="dd" variant="body2">
                  {formatDate(detail.requestedAt)}
                </Typography>
                <Typography component="dt" variant="body2">
                  현재 실행 시작
                </Typography>
                <Typography component="dd" variant="body2">
                  {formatDate(detail.startedAt)}
                </Typography>
                <Typography component="dt" variant="body2">
                  최근 상태 변경
                </Typography>
                <Typography component="dd" variant="body2">
                  {formatDate(detail.updatedAt)}
                </Typography>
                <Typography component="dt" variant="body2">
                  연속 실패
                </Typography>
                <Typography component="dd" variant="body2">
                  {detail.retryCount}회
                </Typography>
              </Box>
              {detail.status === 'failed' && (
                <Typography variant="body2" color="text.secondary">
                  재시도하면 실패 횟수를 초기화하고 분석 대기열에 다시 등록합니다.
                </Typography>
              )}
            </Stack>
          </DialogContent>
        )}
        <DialogActions>
          <Button color="inherit" onClick={() => setSelected(null)}>
            닫기
          </Button>
          {detail && retryButton(detail)}
        </DialogActions>
      </Dialog>
    </Card>
  );
}
