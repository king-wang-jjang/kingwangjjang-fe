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
  site_label?: string | null;
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

export type BoardFilterOption = {
  value: string;
  label: string;
};

export type BoardFilterOptions = {
  sites: BoardFilterOption[];
};

type IssueOverviewRest = {
  generated_at: string;
  window_hours: number;
  total_posts: number;
  total_categories: number;
  categories: {
    category: string;
    post_count: number;
    current_posts: number;
    previous_posts: number;
    impact_score: number;
    share: number;
    momentum_percent: number;
    top_sites: {
      site: string;
      site_label: string;
      post_count: number;
    }[];
    top_tags: string[];
  }[];
};

export type IssueCategory = {
  category: string;
  postCount: number;
  currentPosts: number;
  previousPosts: number;
  impactScore: number;
  share: number;
  momentumPercent: number;
  topSites: {
    site: string;
    siteLabel: string;
    postCount: number;
  }[];
  topTags: string[];
};

export type IssueOverview = {
  generatedAt: string;
  windowHours: number;
  totalPosts: number;
  totalCategories: number;
  categories: IssueCategory[];
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

export type ShortsSource = {
  rank: number;
  boardId: string;
  site: string;
  title: string;
  summary?: string | null;
  hasSummary: boolean;
  isValid: boolean;
  url: string;
  thumbnailUrl?: string | null;
  referenceUsage: 'metadata_only_unverified';
  rightsVerified: boolean;
  publishedAt?: string | null;
  dailyScore?: number | null;
};

export type NanoBananaInputBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; mime_type: string; data: string };

export type NanoBananaImageRequest = {
  sceneId: string;
  referenceSceneId?: string | null;
  requiresApprovedMasterReference: boolean;
  runnerRequired: boolean;
  request: {
    model: string;
    input: NanoBananaInputBlock[];
    response_format: {
      type: 'image';
      mime_type: string;
      aspect_ratio: '9:16';
      image_size: string;
    };
  };
};

export type ShortsScene = {
  id: string;
  type: 'intro' | 'ranking' | 'outro';
  order: number;
  startSecond: number;
  durationSeconds: number;
  estimatedNarrationSeconds: number;
  overlayText: string;
  narration: string;
  nanoBananaPrompt: string;
  sourceRank?: number | null;
};

export type Top10ShortsPackage = {
  schemaVersion: string;
  rankingDate: string;
  rankingMode: 'live' | 'historical_ranking_current_content';
  rankingMetadata: {
    rankingSnapshot: 'live' | 'historical';
    rankingSnapshotDate: string;
    contentSnapshot: 'current';
    contentSnapshotAt: string | null;
  };
  generatedAt: string;
  readiness: {
    dataReady: boolean;
    publishReady: boolean;
    sourceCount: number;
    summaryCount: number;
    missingSummaryRanks: number[];
    invalidSourceRanks: number[];
    duplicateSourceRanks: number[];
    rightsReviewRequired: boolean;
    aiDisclosureReviewRequired: boolean;
    warnings: string[];
  };
  production: {
    platform: 'youtube_shorts';
    language: string;
    storyOrder: 'countdown';
    aspectRatio: '9:16';
    targetDurationSeconds: number;
    recommendedImageModel: string;
    draftImageModel: string;
    draftImageSize: string;
    finalImageSize: string;
    draftOutputPixels: string;
    finalOutputPixels: string;
    visualDirection: string;
    timingMode: 'estimate';
    timingNote: string;
    houseSafeAreaGuideline: string;
    continuityGuide: {
      masterReferenceSceneId: string;
      useApprovedMasterFrameAsReference: boolean;
      instruction: string;
      queueUsage: string;
    };
    generationWorkflow: {
      step: 'draft' | 'final' | 'edit';
      requestField:
        | 'nanoBananaDraftRequests'
        | 'nanoBananaFinalRequestTemplates'
        | null;
      execution: 'parallel' | 'parallel_after_master_approval' | 'external_video_editor';
      review: string;
    }[];
    nanoBananaRequestTemplate: {
      api: 'interactions';
      model: string;
      input: NanoBananaInputBlock[];
      response_format: {
        type: 'image';
        mime_type: string;
        aspect_ratio: '9:16';
        image_size: string;
      };
    };
  };
  nanoBananaDraftRequests: NanoBananaImageRequest[];
  nanoBananaFinalRequestTemplates: NanoBananaImageRequest[];
  video: {
    title: string;
    hook: string;
    outro: string;
    narrationScript: string;
    description: string;
    hashtags: string[];
  };
  scenes: ShortsScene[];
  sources: ShortsSource[];
  notices: string[];
};

function normalizeBoardPost(post: BoardRestPost): BoardPost {
  return {
    Id: post._id,
    category: post.category,
    no: post.no,
    site: post.site,
    siteLabel: post.site_label || post.site,
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

export function getBoardFilterOptions() {
  return apiFetch<BoardFilterOptions>('/boardservice/api/boards/filters');
}

export async function getIssueOverview({
  hours = 24,
  limit = 16,
  sites = [],
}: {
  hours?: number;
  limit?: number;
  sites?: string[];
} = {}): Promise<IssueOverview> {
  const params = new URLSearchParams({
    hours: String(hours),
    limit: String(limit),
  });
  sites.forEach((site) => {
    const trimmedSite = site.trim();
    if (trimmedSite) {
      params.append('sites', trimmedSite);
    }
  });

  const overview = await apiFetch<IssueOverviewRest>(
    `/boardservice/api/boards/issues?${params}`
  );

  return {
    generatedAt: overview.generated_at,
    windowHours: overview.window_hours,
    totalPosts: overview.total_posts,
    totalCategories: overview.total_categories,
    categories: overview.categories.map((category) => ({
      category: category.category,
      postCount: category.post_count,
      currentPosts: category.current_posts,
      previousPosts: category.previous_posts,
      impactScore: category.impact_score,
      share: category.share,
      momentumPercent: category.momentum_percent,
      topSites: category.top_sites.map((site) => ({
        site: site.site,
        siteLabel: site.site_label,
        postCount: site.post_count,
      })),
      topTags: category.top_tags,
    })),
  };
}

export async function getRealtimeBoards(index: number, limit = 30, filters: BoardListFilters = {}) {
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

export async function getDailyBoardHistoryDates(limit = 30) {
  const params = new URLSearchParams({ limit: String(limit) });

  return apiFetch<string[]>(`/boardservice/api/boards/daily/history/dates?${params}`);
}

export async function getDailyBoardHistory(date: string, limit = 10) {
  const params = new URLSearchParams({
    date,
    limit: String(limit),
  });
  const posts = await apiFetch<BoardRestPost[]>(`/boardservice/api/boards/daily/history?${params}`);

  return posts.map(normalizeBoardPost);
}

export function getDailyShortsPackage(date?: string) {
  const query = date ? `?${new URLSearchParams({ date })}` : '';
  return apiFetch<Top10ShortsPackage>(`/boardservice/api/boards/daily/shorts-package${query}`, {
    cache: 'no-store',
  });
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
