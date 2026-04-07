import { useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BlogDetail from '../components/BlogDetail';
import { BlogPost } from '../types/blog';
import { parseMarkdown } from '../utils/markdown';
import { Loader2 } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    setLoading(true);
    const data = await parseMarkdown(postSlug);
    setPost(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      <BlogDetail post={post} />
    </div>
  );
};

export default BlogPostPage;
