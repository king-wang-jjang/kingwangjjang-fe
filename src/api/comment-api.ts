import type { Comment } from 'src/types/comment';

import { apiFetch } from './http';

export type CommentListResponse = {
  boardId: string;
  totalCount: number;
  comments: Comment[];
};

export type CreateCommentPayload = {
  boardId: string;
  parentId?: string | null;
  content: string;
};

export function getComments(boardId: string, page = 1, limit = 100) {
  return apiFetch<CommentListResponse>(
    `/commentservice/api/comments?boardId=${boardId}&page=${page}&limit=${limit}`
  );
}

export function createComment(payload: CreateCommentPayload) {
  return apiFetch<Comment>('/commentservice/api/comments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateComment(commentId: string, content: string) {
  return apiFetch<Comment>(`/commentservice/api/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
}

export function deleteComment(commentId: string) {
  return apiFetch<{ deleted: boolean }>(`/commentservice/api/comments/${commentId}`, {
    method: 'DELETE',
  });
}

export function likeComment(commentId: string) {
  return apiFetch<Comment>(`/commentservice/api/comments/${commentId}/like`, {
    method: 'POST',
  });
}
