import { useParams, Navigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import BlogDetail from '../components/BlogDetail';
import CommentSection from '../components/CommentSection';
import type { BlogPost } from '../types/blog';
import { blogs } from '../data/blogs';

// 导入所有 Markdown 文件
import helloWorld from '../data/posts/hello-world.md?raw';
import matter from 'gray-matter';

// 文章映射表
const postsMap: Record<string, string> = {
  'hello-world': helloWorld,
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);

  const post = useMemo<BlogPost | null>(() => {
    try {
      if (!slug) {
        console.log('No slug provided');
        return null;
      }

      // 获取元数据
      const meta = blogs.find(b => b.slug === slug);
      if (!meta) {
        console.log('Meta not found for slug:', slug);
        return null;
      }

      // 获取 Markdown 内容
      const content = postsMap[slug];
      if (!content) {
        console.log('Content not found for slug:', slug);
        return null;
      }

      console.log('Raw content:', content.substring(0, 100));

      // 解析 front matter
      const parsed = matter(content);
      console.log('Parsed data:', parsed.data);

      return {
        slug,
        title: parsed.data.title || meta.title,
        date: parsed.data.date || meta.date,
        cover: parsed.data.cover || meta.cover,
        tags: parsed.data.tags || meta.tags,
        excerpt: parsed.data.excerpt || meta.excerpt,
        content: parsed.content,
      };
    } catch (err) {
      console.error('Error parsing post:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [slug]);

  if (error) {
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
    console.log('Post is null, redirecting...');
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
