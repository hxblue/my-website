import type { Comment } from '../types/comment';
import { formatRelativeTime } from '../utils/time';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="border-b border-line py-4 last:border-b-0">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="font-medium">
          {comment.nickname}
        </span>
        <span className="font-mono text-xs text-muted">
          {formatRelativeTime(comment.created_at)}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-muted">
        {comment.content}
      </p>
    </div>
  );
}
