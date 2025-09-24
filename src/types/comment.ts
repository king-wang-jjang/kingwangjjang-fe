export interface Comment {
  Id: string;
  boardId: string;
  parentId: string | null;
  content: string;
  userId: string;
  likeCount: number;
  replyCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentFormData {
  content: string;
}

export interface CreateCommentInput {
  boardId: string;
  parentId: string | null;
  content: string;
  userId: string;
}

export interface CreateCommentResponse {
  Id: string;
  boardId: string;
  parentId: string | null;
  content: string;
  userId: string;
  likeCount: number;
  replyCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
