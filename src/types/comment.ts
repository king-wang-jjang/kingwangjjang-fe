export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  parentId?: string | null;
  replies?: Comment[];
}

export interface CommentFormData {
  content: string;
}
