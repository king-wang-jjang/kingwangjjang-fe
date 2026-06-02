import { apiFetch } from './http';

export type AnalysisStatus = 'pending' | 'processing' | 'done' | 'failed';

type BoardRestPost = {
  _id?: string | null;
  category: string;
  no: number;
  site: string;
  title: string;
  url: string;
  contents?: string | unknown[] | null;
  gpt_answer?: string | null;
  tags?: string[] | null;
  analysis_status?: AnalysisStatus | null;
  analysis_retry_count?: number | null;
  analysis_error?: string | null;
  create_time: string;
  thumbnail?: string | null;
  comment_count?: number | null;
  likeCount?: number | null;
};

export type BoardPost = {
  Id?: string | null;
  category: string;
  no: number;
  site: string;
  siteLabel: string;
  title: string;
  url: string;
  contents?: string | unknown[] | null;
  gptAnswer?: string | null;
  tags?: string[];
  analysisStatus?: AnalysisStatus | null;
  analysisRetryCount?: number | null;
  analysisError?: string | null;
  createTime: string;
  thumbnail?: string | null;
  commentCount?: number | null;
  likeCount?: number | null;
};

export type BoardAnalysis = {
  boardId: string;
  status: AnalysisStatus;
  summary?: string | null;
  tags: string[];
  retryCount?: number | null;
  error?: string | null;
  requestedAt?: string | null;
  startedAt?: string | null;
  updatedAt?: string | null;
};

export type BoardAnalysisJobStatus = {
  jobId: string;
  boardId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progressPercent: number;
  estimatedSecondsRemaining: number | null;
  message: string;
  summary?: string | null;
  tags?: string[];
  error?: string | null;
};

function getSiteLabel(site: string) {
  switch (site) {
    case 'ygosu':
      return '와이고수';
    case 'dcinside':
      return '디시인사이드';
    case 'ppomppu':
      return '뽐뿌';
    default:
      return site;
  }
}

function normalizeBoardPost(post: BoardRestPost): BoardPost {
  return {
    Id: post._id,
    category: post.category,
    no: post.no,
    site: post.site,
    siteLabel: getSiteLabel(post.site),
    title: post.title,
    url: post.url,
    contents: post.contents,
    gptAnswer: post.gpt_answer,
    tags: Array.isArray(post.tags) ? post.tags : [],
    analysisStatus: post.analysis_status,
    analysisRetryCount: post.analysis_retry_count,
    analysisError: post.analysis_error,
    createTime: post.create_time,
    thumbnail: post.thumbnail,
    commentCount: post.comment_count,
    likeCount: post.likeCount,
  };
}

export async function getRealtimeBoards(index: number, limit = 30) {
  const posts = await apiFetch<BoardRestPost[]>(
    `/boardservice/api/boards/realtime?index=${index}&limit=${limit}`
  );
  return posts.map(normalizeBoardPost);
}

export async function getDailyBoards(index: number, limit = 30) {
  const posts = await apiFetch<BoardRestPost[]>(
    `/boardservice/api/boards/daily?index=${index}&limit=${limit}`
  );
  return posts.map(normalizeBoardPost);
}

export function addBoardLike(boardId: string) {
  return apiFetch<{ boardId: string; site: string; likeCount: number }>(
    `/boardservice/api/boards/${boardId}/likes`,
    { method: 'POST' }
  );
}

export function analyzeBoardPost(boardId: string) {
  return apiFetch<BoardAnalysisJobStatus>(`/boardservice/api/boards/${boardId}/ai`, {
    method: 'POST',
  });
}

export function getBoardAnalysisJob(jobId: string) {
  return apiFetch<BoardAnalysisJobStatus>(`/boardservice/api/boards/ai/jobs/${jobId}`);
}

export function getBoardAnalysis(boardId: string) {
  return apiFetch<BoardAnalysis>(`/boardservice/api/boards/${boardId}/ai`);
}
