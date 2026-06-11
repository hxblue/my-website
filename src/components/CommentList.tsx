import type { Comment } from '../types/comment';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

export default function CommentList({ comments, isLoading, error }: CommentListProps) {
  if (isLoading) {
    return <p className="font-mono text-sm text-muted">Loading comments...</p>;
  }

  if (error) {
    return (
      <div className="py-8 text-accent">
        <p>加载留言失败: {error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-8 text-muted">
        <p>还没有留言。</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <h3 className="mb-4 text-lg font-medium">
        {comments.length} 条留言
      </h3>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
