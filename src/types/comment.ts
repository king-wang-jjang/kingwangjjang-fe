export interface Comment {
  Id: string;
  boardId: string;
  parentId: string | null;
  content: string;
  userId: string;
  userNickname: string;
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentFormData {
  content: string;
  parentId?: string | null;
}

export interface CreateCommentInput {
  boardId: string;
  parentId?: string | null;
  content: string;
}

export interface CreateCommentResponse {
  Id: string;
  boardId: string;
  parentId: string | null;
  content: string;
  userId: string;
  userNickname: string;
  likeCount: number;
  replyCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
