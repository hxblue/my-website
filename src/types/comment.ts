export interface Comment {
  id: string;
  blog_slug: string;
  nickname: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface CommentFormData {
  nickname: string;
  content: string;
}
