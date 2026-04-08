import type { Comment } from '../types/comment';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

export default function CommentList({ comments, isLoading, error }: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>加载留言失败: {error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">还没有留言</p>
        <p className="text-sm">来抢沙发吧~</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {comments.length} 条留言
      </h3>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
