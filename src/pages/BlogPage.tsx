import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BlogList from '../components/BlogList';
import { getPublishedPosts } from '../api/posts';
import { isNotionConfigured } from '../lib/notion';
import { blogs as fallbackBlogs } from '../data/blogs';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  Hash,
  Layers3,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react';
import type { BlogMeta } from '../types/blog';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatStatDate = (date: string) => {
  const parsedDate = new Date(date);
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  return `${month}.${day}`;
};

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [selectedTag, setSelectedTag] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('[BlogPage] Fetching posts...');
        const notionPosts = await getPublishedPosts();
        console.log('[BlogPage] Notion posts:', notionPosts);

        if (notionPosts.length > 0) {
          setPosts(notionPosts);
        } else {
          // 如果 Notion 没有配置或没有文章，使用本地数据
          console.log('[BlogPage] Using fallback blogs');
          setUseFallback(true);
          setPosts(fallbackBlogs);
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('加载文章失败');
        setUseFallback(true);
        setPosts(fallbackBlogs);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [posts]
  );

  const tagCounts = useMemo(() => {
    return sortedPosts.reduce<Record<string, number>>((counts, post) => {
      post.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
      return counts;
    }, {});
  }, [sortedPosts]);

  const tags = useMemo(() => ['全部', ...Object.keys(tagCounts)], [tagCounts]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sortedPosts.filter((post) => {
      const matchesTag = selectedTag === '全部' || post.tags.includes(selectedTag);
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesTag && matchesSearch;
    });
  }, [searchQuery, selectedTag, sortedPosts]);

  const featuredPost = filteredPosts[0];
  const remainingPosts = featuredPost
    ? filteredPosts.filter((post) => post.slug !== featuredPost.slug)
    : [];
  const latestDate = sortedPosts[0]?.date;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Blog header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white px-6 py-10 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:px-8 lg:px-12"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-300">
                <Sparkles size={16} />
                Chenblue 的技术日志
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-950 dark:text-white md:text-6xl">
                把学习过程写成
                <span className="block bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  可复用的经验
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
                这里收集算法练习、工程实践和 AI 时代的学习笔记。每篇文章都尽量记录问题背景、推导过程和可以复盘的细节。
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20">
                <FileText className="mb-4 text-purple-500" size={22} />
                <p className="text-2xl font-bold">{loading ? '-' : posts.length}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">篇文章</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20">
                <Hash className="mb-4 text-cyan-500" size={22} />
                <p className="text-2xl font-bold">
                  {loading ? '-' : Object.keys(tagCounts).length}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">个标签</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20">
                <CalendarDays className="mb-4 text-pink-500" size={22} />
                <p className="text-2xl font-bold">
                  {loading ? '-' : latestDate ? formatStatDate(latestDate) : '-'}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">最近更新</p>
              </div>
            </div>
          </div>

          {useFallback && !isNotionConfigured() && (
            <p className="relative mt-6 text-sm text-amber-600 dark:text-amber-300">
              (使用本地缓存数据 - Notion 未配置)
            </p>
          )}
          {useFallback && isNotionConfigured() && (
            <p className="relative mt-6 text-sm text-amber-600 dark:text-amber-300">
              (Notion 已配置但暂无文章)
            </p>
          )}
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
          </div>
        )}

        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"
          >
            <section className="space-y-8">
              <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="搜索标题、摘要或标签"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/30"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 md:max-w-md">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                        selectedTag === tag
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                      }`}
                    >
                      {tag}
                      {tag !== '全部' && (
                        <span className="ml-2 text-xs opacity-70">{tagCounts[tag]}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {featuredPost && (
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="group grid overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-400/70 hover:shadow-xl hover:shadow-purple-500/10 dark:border-white/10 dark:bg-white/[0.04] lg:grid-cols-[0.9fr_1.1fr]"
                >
                  <div className="relative min-h-72 overflow-hidden bg-gray-200 dark:bg-gray-900">
                    {featuredPost.cover ? (
                      <img
                        src={featuredPost.cover}
                        alt={featuredPost.title}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-purple-900 via-gray-900 to-cyan-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur">
                      <BookOpen size={16} />
                      精选笔记
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <div className="mb-5 flex flex-wrap gap-2">
                        {featuredPost.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h2 className="text-3xl font-bold leading-tight text-gray-950 transition group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-300">
                        {featuredPost.title}
                      </h2>
                      <p className="mt-4 line-clamp-3 text-base leading-8 text-gray-600 dark:text-gray-300">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <CalendarDays size={18} />
                        <time dateTime={featuredPost.date}>{formatDate(featuredPost.date)}</time>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-300">
                        阅读全文
                        <ArrowRight
                          size={18}
                          className="transition group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              <div>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
                      {featuredPost ? '更多笔记' : '全部笔记'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      当前匹配 {filteredPosts.length} 篇文章
                    </p>
                  </div>
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      暂时没有匹配的文章
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      换个关键词或标签再试试。
                    </p>
                  </div>
                ) : remainingPosts.length > 0 ? (
                  <BlogList blogs={remainingPosts} />
                ) : (
                  <p className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
                    这个筛选下只有精选文章，后续文章会显示在这里。
                  </p>
                )}
              </div>
            </section>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300">
                    <Layers3 size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-950 dark:text-white">写作主题</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">按标签快速浏览</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {Object.entries(tagCounts).map(([tag, count]) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      <span className="text-gray-700 dark:text-gray-300">#{tag}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-white/10 dark:text-gray-400">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-950 dark:text-white">最近更新</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">最新发布的笔记</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {sortedPosts.slice(0, 5).map((post) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="group block border-l border-gray-200 pl-4 transition hover:border-purple-400 dark:border-white/10"
                    >
                      <p className="line-clamp-2 text-sm font-medium text-gray-800 transition group-hover:text-purple-600 dark:text-gray-200 dark:group-hover:text-purple-300">
                        {post.title}
                      </p>
                      <time
                        dateTime={post.date}
                        className="mt-1 block text-xs text-gray-500 dark:text-gray-500"
                      >
                        {formatDate(post.date)}
                      </time>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default BlogPage;
