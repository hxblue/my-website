import { useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BlogDetail from '../components/BlogDetail';
import CommentSection from '../components/CommentSection';
import { getPostBySlug } from '../api/posts';
import { blogs as fallbackBlogs } from '../data/blogs';
import { postsMap as fallbackPostsMap } from '../data/postsMap';
import matter from 'gray-matter';
import type { BlogPost } from '../types/blog';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const notionPost = await getPostBySlug(slug);

        if (notionPost) {
          setPost(notionPost);
        } else {
          const fallbackPost = getFallbackPost(slug);
          if (fallbackPost) {
            setPost(fallbackPost);
          } else {
            setPost(null);
          }
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        const fallbackPost = getFallbackPost(slug);
        if (fallbackPost) {
          setPost(fallbackPost);
        } else {
          setError('加载文章失败');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const getFallbackPost = (slug: string): BlogPost | null => {
    const meta = fallbackBlogs.find(b => b.slug === slug);
    if (!meta) return null;

    const content = fallbackPostsMap[slug];
    if (!content) return null;

    const parsed = matter(content);

    return {
      slug,
      title: parsed.data.title || meta.title,
      date: parsed.data.date || meta.date,
      cover: parsed.data.cover || meta.cover,
      tags: parsed.data.tags || meta.tags,
      excerpt: parsed.data.excerpt || meta.excerpt,
      content: parsed.content,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 pt-32">
        <p className="mx-auto max-w-4xl font-mono text-sm text-muted">Loading article...</p>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen px-4 pt-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-serif text-4xl">Error loading post</h1>
          <p className="mt-4 text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen pt-20">
      <BlogDetail post={post} />
      <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        {slug && <CommentSection blogSlug={slug} />}
      </div>
    </div>
  );
};

export default BlogPostPage;
