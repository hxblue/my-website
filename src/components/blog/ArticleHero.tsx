import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../../types/blog';
import { formatBlogDate } from '../../utils/blog';

interface ArticleHeroProps {
  post: BlogPost;
  readingMinutes: number;
}

export default function ArticleHero({ post, readingMinutes }: ArticleHeroProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <header className="article-hero">
      {!imageFailed && post.cover && (
        <img
          src={post.cover}
          alt=""
          className="article-hero__image"
          fetchPriority="high"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="article-hero__overlay" />
      <div className="article-hero__content">
        <Link to="/blog" className="article-back-link">← 返回博客</Link>
        <div className="article-hero__meta">
          <time dateTime={post.date}>发布于 {formatBlogDate(post.date)}</time>
          {post.updatedAt && (
            <time dateTime={post.updatedAt}>更新于 {formatBlogDate(post.updatedAt)}</time>
          )}
          {post.category && <span>{post.category}</span>}
          <span>{readingMinutes} 分钟阅读</span>
        </div>
        <h1>{post.title}</h1>
        {post.tags.length > 0 && (
          <div className="article-hero__tags">
            {post.tags.map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
        )}
      </div>
    </header>
  );
}
