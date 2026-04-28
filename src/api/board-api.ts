import { apiFetch } from './http';

type BoardRestPost = {
  _id?: string | null;
  category: string;
  no: number;
  site: string;
  title: string;
  url: string;
  contents?: string | unknown[] | null;
  gpt_answer?: string | null;
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
  title: string;
  url: string;
  contents?: string | unknown[] | null;
  gptAnswer?: string | null;
  createTime: string;
  thumbnail?: string | null;
  commentCount?: number | null;
  likeCount?: number | null;
};

function normalizeBoardPost(post: BoardRestPost): BoardPost {
  return {
    Id: post._id,
    category: post.category,
    no: post.no,
    site: post.site,
    title: post.title,
    url: post.url,
    contents: post.contents,
    gptAnswer: post.gpt_answer,
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
