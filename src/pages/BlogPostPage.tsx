import { Link, useParams } from 'react-router-dom';
import BlogDetail from '../components/BlogDetail';
import CommentSection from '../components/CommentSection';
import ArticleHero from '../components/blog/ArticleHero';
import { useBlogPost } from '../hooks/useBlogPost';
import { usePageMeta } from '../hooks/usePageMeta';
import { estimateReadingMinutes } from '../utils/blog';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { post, status, error, retry } = useBlogPost(slug);

  usePageMeta({
    title: post ? `${post.title} | Chblue` : status === 'not-found' ? '文章未找到 | Chblue' : '正在加载文章 | Chblue',
    description: post?.excerpt ?? 'Chblue 的工程实践与学习笔记。',
    image: post?.cover,
  });

  if (status === 'loading') {
    return (
      <main className="blog-status-page" aria-live="polite">
        <p className="blog-eyebrow">LOADING ARTICLE</p>
        <h1>正在加载文章</h1>
        <div className="blog-loading-bar" aria-hidden="true" />
      </main>
    );
  }

  if (status === 'not-found' || !post) {
    if (status === 'error') {
      return (
        <main className="blog-status-page" role="alert">
          <p className="blog-eyebrow">NOTION SYNC ERROR</p>
          <h1>暂时无法加载文章</h1>
          <p>{error}</p>
          <button type="button" onClick={retry}>重新同步</button>
          <Link to="/blog">← 返回博客首页</Link>
        </main>
      );
    }

    return (
      <main className="blog-status-page">
        <p className="blog-eyebrow">404 · NOT FOUND</p>
        <h1>没有找到这篇文章</h1>
        <p>文章可能已经移动，或者当前地址不完整。</p>
        <Link to="/blog">← 返回博客首页</Link>
      </main>
    );
  }

  const readingMinutes = post.readingMinutes ?? estimateReadingMinutes(post.content);

  return (
    <main>
      <ArticleHero post={post} readingMinutes={readingMinutes} />
      <BlogDetail post={post} />
      <div className="article-comments">
        {slug && <CommentSection blogSlug={slug} />}
      </div>
    </main>
  );
};

export default BlogPostPage;
