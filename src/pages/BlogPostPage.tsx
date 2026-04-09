import { useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BlogDetail from '../components/BlogDetail';
import CommentSection from '../components/CommentSection';
import { getPostBySlug } from '../api/posts';
import { blogs as fallbackBlogs } from '../data/blogs';
import { postsMap as fallbackPostsMap } from '../data/postsMap';
import matter from 'gray-matter';
import { Loader2 } from 'lucide-react';
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

        // 首先尝试从 Notion 获取
        const notionPost = await getPostBySlug(slug);

        if (notionPost) {
          setPost(notionPost);
        } else {
          // 回退到本地数据
          const fallbackPost = getFallbackPost(slug);
          if (fallbackPost) {
            setPost(fallbackPost);
          } else {
            setPost(null);
          }
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        // 出错时尝试回退
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

  // 获取本地回退文章
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
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white pt-20 px-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white pt-20 px-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl text-red-500 mb-4">Error loading post</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white pt-20 transition-colors duration-300">
      <BlogDetail post={post} />
      {slug && <CommentSection blogSlug={slug} />}
    </div>
  );
};

export default BlogPostPage;
