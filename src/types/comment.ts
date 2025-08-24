export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface CommentFormData {
  content: string;
}
