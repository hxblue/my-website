import { useComments } from '../hooks/useComments';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  blogSlug: string;
}

export default function CommentSection({ blogSlug }: CommentSectionProps) {
  const { comments, isLoading, error, submitComment } = useComments(blogSlug);

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        留言板
      </h2>

      <div className="space-y-8">
        <CommentForm onSubmit={submitComment} />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <CommentList comments={comments} isLoading={isLoading} error={error} />
        </div>
      </div>
    </section>
  );
}
