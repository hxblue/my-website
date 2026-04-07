import { useParams, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import BlogDetail from '../components/BlogDetail';
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

  const post = useMemo<BlogPost | null>(() => {
    if (!slug) return null;

    // 获取元数据
    const meta = blogs.find(b => b.slug === slug);
    if (!meta) return null;

    // 获取 Markdown 内容
    const content = postsMap[slug];
    if (!content) return null;

    // 解析 front matter
    const { data, content: markdownContent } = matter(content);

    return {
      slug,
      title: data.title || meta.title,
      date: data.date || meta.date,
      cover: data.cover || meta.cover,
      tags: data.tags || meta.tags,
      excerpt: data.excerpt || meta.excerpt,
      content: markdownContent,
    };
  }, [slug]);

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
