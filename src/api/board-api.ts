import { apiFetch } from './http';

export type AnalysisStatus = 'pending' | 'processing' | 'done' | 'failed';

export type CrawledContentBlock = {
  type: 'text' | 'image' | 'video' | string;
  text?: string;
  content?: string;
  media_path?: string;
  path?: string;
  source_url?: string;
  url?: string;
  alt_text?: string;
  alt?: string;
};

type BoardRestPost = {
  _id?: string | null;
  category: string;
  no: number;
  site: string;
  title: string;
  url: string;
  contents?: string | CrawledContentBlock[] | Record<string, unknown> | null;
  gpt_answer?: string | null;
  tags?: string[] | null;
  llm_engagement_score?: number | null;
  llm_engagement_reason?: string | null;
  analysis_status?: AnalysisStatus | null;
  analysis_retry_count?: number | null;
  analysis_error?: string | null;
  create_time: string;
  thumbnail?: string | null;
  comment_count?: number | null;
  likeCount?: number | null;
  native_comment_count?: number | null;
  native_like_count?: number | null;
  native_view_count?: number | null;
  source_rank?: number | null;
  hot_score?: number | null;
  daily_score?: number | null;
  metrics_crawled_at?: string | null;
  score_updated_at?: string | null;
};

export type BoardListFilters = {
  category?: string;
  hasThumbnail?: boolean;
  query?: string;
  sites?: string[];
  tag?: string;
};

export type BoardPost = {
  Id?: string | null;
  category: string;
  no: number;
  site: string;
  siteLabel: string;
  title: string;
  url: string;
  contents?: string | CrawledContentBlock[] | Record<string, unknown> | null;
  gptAnswer?: string | null;
  tags?: string[];
  llmEngagementScore?: number | null;
  llmEngagementReason?: string | null;
  analysisStatus?: AnalysisStatus | null;
  analysisRetryCount?: number | null;
  analysisError?: string | null;
  createTime: string;
  thumbnail?: string | null;
  commentCount?: number | null;
  likeCount?: number | null;
  nativeCommentCount?: number | null;
  nativeLikeCount?: number | null;
  nativeViewCount?: number | null;
  sourceRank?: number | null;
  hotScore?: number | null;
  dailyScore?: number | null;
  metricsCrawledAt?: string | null;
  scoreUpdatedAt?: string | null;
};

export type BoardAnalysis = {
  boardId: string;
  status: AnalysisStatus;
  summary?: string | null;
  tags: string[];
  llmEngagementScore?: number | null;
  llmEngagementReason?: string | null;
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
  llmEngagementScore?: number | null;
  llmEngagementReason?: string | null;
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
    llmEngagementScore: post.llm_engagement_score,
    llmEngagementReason: post.llm_engagement_reason,
    analysisStatus: post.analysis_status,
    analysisRetryCount: post.analysis_retry_count,
    analysisError: post.analysis_error,
    createTime: post.create_time,
    thumbnail: post.thumbnail,
    commentCount: post.comment_count,
    likeCount: post.likeCount,
    nativeCommentCount: post.native_comment_count,
    nativeLikeCount: post.native_like_count,
    nativeViewCount: post.native_view_count,
    sourceRank: post.source_rank,
    hotScore: post.hot_score,
    dailyScore: post.daily_score,
    metricsCrawledAt: post.metrics_crawled_at,
    scoreUpdatedAt: post.score_updated_at,
  };
}

export async function getRealtimeBoards(
  index: number,
  limit = 30,
  filters: BoardListFilters = {}
) {
  const posts = await apiFetch<BoardRestPost[]>(
    `/boardservice/api/boards/realtime?${toBoardListSearchParams(index, limit, filters)}`
  );
  return posts.map(normalizeBoardPost);
}

export async function getDailyBoards(index: number, limit = 30, filters: BoardListFilters = {}) {
  const posts = await apiFetch<BoardRestPost[]>(
    `/boardservice/api/boards/daily?${toBoardListSearchParams(index, limit, filters)}`
  );
  return posts.map(normalizeBoardPost);
}

function toBoardListSearchParams(index: number, limit: number, filters: BoardListFilters) {
  const params = new URLSearchParams({
    index: String(index),
    limit: String(limit),
  });

  filters.sites?.forEach((site) => {
    const trimmedSite = site.trim();
    if (trimmedSite) {
      params.append('sites', trimmedSite);
    }
  });

  appendSearchParam(params, 'category', filters.category);
  appendSearchParam(params, 'tag', filters.tag);
  appendSearchParam(params, 'q', filters.query);

  if (typeof filters.hasThumbnail === 'boolean') {
    params.set('has_thumbnail', String(filters.hasThumbnail));
  }

  return params.toString();
}

function appendSearchParam(params: URLSearchParams, key: string, value?: string) {
  const trimmedValue = value?.trim();
  if (trimmedValue) {
    params.set(key, trimmedValue);
  }
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
