import type { Comment } from '../types/comment';
import { formatRelativeTime } from '../utils/time';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 dark:text-white">
          {comment.nickname}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatRelativeTime(comment.created_at)}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {comment.content}
      </p>
    </div>
  );
}
