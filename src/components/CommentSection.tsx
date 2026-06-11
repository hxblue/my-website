import { useComments } from '../hooks/useComments';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  blogSlug: string;
}

export default function CommentSection({ blogSlug }: CommentSectionProps) {
  const { comments, isLoading, error, submitComment } = useComments(blogSlug);

  return (
    <section className="mt-12 border-t border-line pt-10">
      <h2 className="font-serif text-4xl font-medium">留言</h2>

      <div className="mt-8 space-y-8">
        <CommentForm onSubmit={submitComment} />

        <div className="border-t border-line pt-6">
          <CommentList comments={comments} isLoading={isLoading} error={error} />
        </div>
      </div>
    </section>
  );
}
