import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedPosts } from '../api/posts';
import { blogs as fallbackBlogs } from '../data/blogs';
import type { BlogMeta } from '../types/blog';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const LatestPosts = () => {
  const [posts, setPosts] = useState<BlogMeta[]>(fallbackBlogs);

  useEffect(() => {
    let isActive = true;

    getPublishedPosts().then((notionPosts) => {
      if (isActive && notionPosts.length > 0) {
        setPosts(notionPosts);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const latestPosts = useMemo(
    () =>
      [...posts]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3),
    [posts]
  );

  return (
    <section className="editorial-section">
      <div className="editorial-rule pt-10">
        <p className="section-kicker">03 / LATEST WRITING</p>
        <h2 className="section-title mt-4">最近博客</h2>
        <p className="mt-4 text-muted">主要记录学习过程和工程上的小思考。</p>
        <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {latestPosts.map((post) => (
            <article key={post.slug} className="border-t border-line pt-6">
              <p className="font-mono text-sm text-muted">
                {formatDate(post.date)} · {post.tags[0] || '笔记'}
              </p>
              <h3 className="mt-3 font-serif text-2xl font-medium leading-tight">{post.title}</h3>
              <p className="mt-3 text-base leading-6 text-muted">{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="editorial-link mt-5 inline-block">
                → 阅读
              </Link>
            </article>
          ))}
        </div>
        <Link to="/blog" className="editorial-link mt-10 inline-block">
          → 浏览全部文章（{posts.length}）
        </Link>
      </div>
    </section>
  );
};

export default LatestPosts;
