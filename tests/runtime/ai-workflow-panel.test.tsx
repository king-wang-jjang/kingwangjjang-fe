import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '@testing-library/react';
import { vi, test, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ApiError, apiFetch } from 'src/api/http';
import { AIWorkflowPanel } from 'src/sections/admin/resources/view/ai-workflow-panel';

vi.mock('src/api/http', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/api/http')>()),
  apiFetch: vi.fn(),
}));

let workerEnabled: boolean;
let retryFailure: boolean;
let items: ReturnType<typeof makeRun>[];

function makeRun(status: string, index = 0) {
  return {
    board_id: `${status}-${index}`,
    title: `${status} 게시글 ${index}`,
    site_label: '테스트 사이트',
    status,
    retry_count: status === 'failed' ? 5 : 0,
    error: status === 'failed' ? 'LLM 응답 시간 초과' : null,
    created_at: '2026-09-01T00:00:00Z',
    requested_at: null,
    started_at: null,
    updated_at: '2026-09-01T01:00:00Z',
  };
}

beforeEach(() => {
  workerEnabled = true;
  retryFailure = false;
  items = ['failed', 'done', 'processing', 'pending'].map((status) => makeRun(status));
  vi.mocked(apiFetch).mockImplementation(async (path, options) => {
    const url = new URL(path, 'http://localhost');
    if (options?.method === 'POST') {
      if (retryFailure)
        throw new ApiError(409, JSON.stringify({ detail: '이미 실행 중인 작업입니다.' }));
      const run = items.find((item) => path.includes(`/${item.board_id}/retry`))!;
      run.status = 'pending';
      run.retry_count = 0;
      run.error = null;
      return { board_id: run.board_id, status: 'pending' };
    }
    if (url.pathname.endsWith('/runs')) {
      const filtered = items.filter(
        (item) =>
          (!url.searchParams.has('status') || item.status === url.searchParams.get('status')) &&
          (!url.searchParams.has('q') || item.title.includes(url.searchParams.get('q')!))
      );
      const offset = Number(url.searchParams.get('offset'));
      return {
        items: filtered.slice(offset, offset + 20).map((item) => ({ ...item })),
        total: filtered.length,
      };
    }
    return {
      generated_at: '2026-09-01T01:00:00Z',
      worker_enabled: workerEnabled,
      total_count: items.length,
      pending_count: items.filter((item) => item.status === 'pending').length,
      processing_count: items.filter((item) => item.status === 'processing').length,
      done_count: items.filter((item) => item.status === 'done').length,
      failed_count: items.filter((item) => item.status === 'failed').length,
    };
  });
});

function renderPanel() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AIWorkflowPanel />
    </QueryClientProvider>
  );
}

test('shows workflow states and error details, with retry only on failed work', async () => {
  const user = userEvent.setup();
  renderPanel();
  await screen.findByText('failed 게시글 0');
  expect(screen.getAllByRole('button', { name: /게시글 0 재시도/ })).toHaveLength(1);
  expect(screen.getByText('LLM 응답 시간 초과')).toBeTruthy();
  expect(screen.getAllByLabelText('작업 진행 흐름')).toHaveLength(4);
  await user.click(screen.getByRole('button', { name: 'failed 게시글 0 상세 보기' }));
  expect(within(screen.getByRole('dialog')).getByText('LLM 응답 시간 초과')).toBeTruthy();
  expect(within(screen.getByRole('dialog')).getByText('5회')).toBeTruthy();
});

test('filters, searches, and paginates on the server', async () => {
  const user = userEvent.setup();
  items = Array.from({ length: 21 }, (_, index) => makeRun('failed', index));
  renderPanel();
  await screen.findByText('failed 게시글 0');
  await user.click(screen.getByRole('button', { name: '다음 페이지' }));
  await screen.findByText('failed 게시글 20');
  expect(screen.queryByText('failed 게시글 0')).toBeNull();
  await user.click(screen.getByRole('button', { name: '성공 작업 보기' }));
  await screen.findByText('조건에 맞는 분석 작업이 없습니다.');
  await user.click(screen.getByRole('button', { name: '실패 작업 보기' }));
  await screen.findByText('failed 게시글 0');
  await user.type(screen.getByRole('textbox'), '게시글 20');
  await user.click(screen.getByRole('button', { name: '검색' }));
  await waitFor(() => expect(screen.queryByText('failed 게시글 0')).toBeNull());
  expect(screen.getByText('failed 게시글 20')).toBeTruthy();
  expect(apiFetch).toHaveBeenCalledWith(expect.stringContaining('status=failed&q='), {
    cache: 'no-store',
  });
});

test('retries a failed run and refreshes its state and totals', async () => {
  const user = userEvent.setup();
  renderPanel();
  await user.click(await screen.findByRole('button', { name: 'failed 게시글 0 재시도' }));
  await screen.findByText(/작업을 대기열에 등록했습니다/);
  expect(apiFetch).toHaveBeenCalledWith(
    '/boardservice/api/boards/ai/resources/runs/failed-0/retry',
    { method: 'POST' }
  );
  expect(screen.queryByRole('button', { name: 'failed 게시글 0 재시도' })).toBeNull();
  expect(
    within(screen.getByRole('button', { name: '실패 작업 보기' })).getByText('0')
  ).toBeTruthy();
  expect(
    within(screen.getByRole('button', { name: '대기 작업 보기' })).getByText('2')
  ).toBeTruthy();
});

test('keeps failed state and displays the API error when retry is rejected', async () => {
  retryFailure = true;
  const user = userEvent.setup();
  renderPanel();
  await user.click(await screen.findByRole('button', { name: 'failed 게시글 0 상세 보기' }));
  const dialog = within(screen.getByRole('dialog'));
  await user.click(dialog.getByRole('button', { name: 'failed 게시글 0 재시도' }));
  await dialog.findByText('이미 실행 중인 작업입니다.');
  expect(dialog.getByText('LLM 응답 시간 초과')).toBeTruthy();
});

test('moves to a valid page after retry removes the last failed item on a page', async () => {
  const user = userEvent.setup();
  items = Array.from({ length: 21 }, (_, index) => makeRun('failed', index));
  renderPanel();
  await screen.findByText('failed 게시글 0');
  await user.click(screen.getByRole('button', { name: '실패 작업 보기' }));
  await screen.findByText('failed 게시글 0');
  await user.click(screen.getByRole('button', { name: '다음 페이지' }));
  await user.click(await screen.findByRole('button', { name: 'failed 게시글 20 재시도' }));
  await screen.findByText('failed 게시글 0');
  expect(screen.queryByRole('button', { name: 'failed 게시글 20 재시도' })).toBeNull();
});

test('disables repeat submissions while a retry request is pending', async () => {
  const user = userEvent.setup();
  renderPanel();
  const button = await screen.findByRole('button', { name: 'failed 게시글 0 재시도' });
  let finish!: (value: unknown) => void;
  vi.mocked(apiFetch).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  await user.click(button);
  expect((button as HTMLButtonElement).disabled).toBe(true);
  (button as HTMLButtonElement).click();
  expect(
    vi.mocked(apiFetch).mock.calls.filter(([, options]) => options?.method === 'POST')
  ).toHaveLength(1);
  finish({ board_id: 'failed-0', status: 'pending' });
  await screen.findByText(/작업을 대기열에 등록했습니다/);
});

test('disables retry while the worker is stopped', async () => {
  workerEnabled = false;
  renderPanel();
  const button = await screen.findByRole('button', { name: 'failed 게시글 0 재시도' });
  expect((button as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByText(/분석 Worker가 중지되어 있습니다/)).toBeTruthy();
});

test('shows a recoverable load error instead of an empty success state', async () => {
  vi.mocked(apiFetch).mockRejectedValue(new Error('offline'));
  renderPanel();
  await screen.findByText('실행 상태를 불러오지 못했습니다.');
  expect(screen.getByRole('button', { name: '다시 불러오기' })).toBeTruthy();
  expect(screen.queryByText('조건에 맞는 분석 작업이 없습니다.')).toBeNull();
});
