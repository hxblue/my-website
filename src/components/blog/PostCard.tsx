import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { BlogMeta } from '../../types/blog';
import { formatBlogDate } from '../../utils/blog';

interface PostCardProps {
  post: BlogMeta;
  imageSide: 'left' | 'right';
  eager?: boolean;
}

export default function PostCard({ post, imageSide, eager = false }: PostCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className={`blog-post-card image-${imageSide}`}>
      <Link to={`/blog/${post.slug}`} className="blog-post-card__link" aria-label={`阅读 ${post.title}`}>
        <div className="blog-post-card__media">
          {!imageFailed && post.cover && (
            <img
              src={post.cover}
              alt={post.coverAlt ?? post.title}
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={eager ? 'high' : 'auto'}
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
        <div className="blog-post-card__body">
          <div className="blog-post-card__meta">
            {post.pinned && <span className="blog-pin">置顶</span>}
            <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            {post.category && <span>{post.category}</span>}
            {post.readingMinutes && <span>{post.readingMinutes} 分钟阅读</span>}
          </div>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <div className="blog-post-card__footer">
            <div className="blog-post-card__tags">
              {post.tags.map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
            <span className="blog-read-more">阅读全文 <span aria-hidden="true">→</span></span>
          </div>
        </div>
      </Link>
    </article>
  );
}
