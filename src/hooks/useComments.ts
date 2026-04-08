import { useState, useEffect, useCallback } from 'react';
import { getComments, createComment as apiCreateComment } from '../api/comments';
import type { Comment, CommentFormData } from '../types/comment';

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  submitComment: (formData: CommentFormData) => Promise<{ success: boolean; isPending: boolean; message: string }>;
}

export function useComments(blogSlug: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getComments(blogSlug);
        setComments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    }

    fetchComments();
  }, [blogSlug]);

  const submitComment = useCallback(
    async (formData: CommentFormData): Promise<{ success: boolean; isPending: boolean; message: string }> => {
      try {
        const { comment, isPending } = await apiCreateComment(blogSlug, formData);

        if (!isPending) {
          setComments(prev => [comment, ...prev]);
        }

        return {
          success: true,
          isPending,
          message: isPending
            ? '留言已提交，等待审核后显示'
            : '留言发布成功！',
        };
      } catch (err) {
        return {
          success: false,
          isPending: false,
          message: err instanceof Error ? err.message : '发布失败，请重试',
        };
      }
    },
    [blogSlug]
  );

  return { comments, isLoading, error, submitComment };
}
