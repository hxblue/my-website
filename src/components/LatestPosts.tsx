import { motion, useInView } from 'framer-motion';
import { ArrowRight, ArrowUpRight, CalendarDays } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

/**
 * 首页文章入口：先显示本地文章，再在 Notion 数据返回后无缝更新。
 */
const LatestPosts = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
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
    <section ref={ref} className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-10 flex flex-col gap-5 border-b border-gray-200 pb-8 dark:border-white/10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-purple-600 dark:text-purple-300">
                03 / Latest writing
              </p>
              <h2 className="mt-4 text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">
                最近博客
              </h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-200"
            >
              浏览全部文章
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="divide-y divide-gray-200 border-b border-gray-200 dark:divide-white/10 dark:border-white/10">
            {latestPosts.map((post, index) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group grid gap-5 py-7 transition md:grid-cols-[64px_minmax(0,1fr)_180px_24px] md:items-center"
              >
                <span className="font-mono text-sm text-gray-400 dark:text-gray-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-gray-950 transition group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-300">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 md:hidden">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs text-purple-600 dark:text-purple-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs text-purple-600 dark:text-purple-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <time
                    dateTime={post.date}
                    className="mt-3 flex items-center gap-2 text-xs text-gray-500"
                  >
                    <CalendarDays size={14} />
                    {formatDate(post.date)}
                  </time>
                </div>
                <ArrowUpRight
                  size={19}
                  className="hidden text-gray-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-300 md:block"
                />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LatestPosts;
