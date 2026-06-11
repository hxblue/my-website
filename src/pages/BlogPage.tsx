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

const formatShortDate = (date: string) => {
  const parsedDate = new Date(date);
  return `${String(parsedDate.getMonth() + 1).padStart(2, '0')}.${String(parsedDate.getDate()).padStart(2, '0')}`;
};

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogMeta[]>(fallbackBlogs);
  const [selectedTag, setSelectedTag] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isActive = true;

    getPublishedPosts()
      .then((notionPosts) => {
        if (isActive && notionPosts.length > 0) {
          setPosts(notionPosts);
        }
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [posts],
  );

  const tagCounts = useMemo(
    () =>
      sortedPosts.reduce<Record<string, number>>((counts, post) => {
        post.tags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
        return counts;
      }, {}),
    [sortedPosts],
  );

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

  return (
    <main className="editorial-section min-h-screen pt-32">
      <header className="grid gap-12 border-b border-line pb-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
        <div>
          <p className="meta-label">Writing / notes from building</p>
          <h1 className="section-title mt-5 text-5xl sm:text-7xl">最近写的东西</h1>
          <p className="mt-6 max-w-[680px] text-muted">
            记录学习过程、工程实践和 AI 产品实验。文章不多，但每一篇都来自真正遇到的问题。
          </p>
        </div>

        <dl className="grid grid-cols-3 border-y border-line">
          <div className="border-r border-line py-5 pr-4">
            <dt className="meta-label">文章</dt>
            <dd className="mt-2 font-serif text-4xl">{posts.length}</dd>
          </div>
          <div className="border-r border-line px-4 py-5">
            <dt className="meta-label">标签</dt>
            <dd className="mt-2 font-serif text-4xl">{Object.keys(tagCounts).length}</dd>
          </div>
          <div className="py-5 pl-4">
            <dt className="meta-label">最近更新</dt>
            <dd className="mt-2 font-serif text-4xl">{sortedPosts[0] ? formatShortDate(sortedPosts[0].date) : '-'}</dd>
          </div>
        </dl>
      </header>

      <div className="border-b border-line py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex max-w-md flex-1 items-center gap-3 font-mono text-sm">
            <span className="text-muted">SEARCH</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索标题、摘要或标签"
              className="w-full border-b border-line bg-transparent px-1 py-2 outline-none focus:border-accent"
            />
          </label>
          <div className="flex gap-x-5 gap-y-2 overflow-x-auto pb-1">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`shrink-0 font-mono text-sm ${selectedTag === tag ? 'text-accent' : 'text-muted'}`}
              >
                {tag}{tag === '全部' ? '' : ` ${tagCounts[tag]}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          {featuredPost && (
            <article className="grid overflow-hidden border border-line bg-surface md:grid-cols-[0.9fr_1.1fr]">
              <Link to={`/blog/${featuredPost.slug}`} className="blog-cover block min-h-64 overflow-hidden bg-soft">
                <img
                  src={featuredPost.cover}
                  alt={featuredPost.title}
                  loading="eager"
                  decoding="async"
                  className="h-full min-h-64 w-full object-cover"
                />
              </Link>
              <div className="flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <p className="meta-label">Featured note · {featuredPost.tags.join(' · ')}</p>
                  <h2 className="mt-5 font-serif text-4xl font-medium leading-tight">{featuredPost.title}</h2>
                  <p className="mt-5 text-muted">{featuredPost.excerpt}</p>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
                  <time dateTime={featuredPost.date} className="font-mono text-sm text-muted">
                    {formatDate(featuredPost.date)}
                  </time>
                  <Link to={`/blog/${featuredPost.slug}`} className="editorial-link shrink-0">→ 阅读全文</Link>
                </div>
              </div>
            </article>
          )}

          {remainingPosts.length > 0 && (
            <div className="mt-14">
              <div className="border-b border-line pb-5">
                <h2 className="font-serif text-4xl font-medium">更多笔记</h2>
                <p className="mt-2 text-sm text-muted">当前匹配 {filteredPosts.length} 篇文章</p>
              </div>
              <div className="grid gap-x-7 gap-y-10 pt-8 md:grid-cols-2">
                {remainingPosts.map((post) => (
                  <article key={post.slug} className="border-b border-line pb-8">
                    <Link to={`/blog/${post.slug}`} className="blog-cover block overflow-hidden border border-line bg-soft">
                      <img
                        src={post.cover}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </Link>
                    <p className="mt-5 font-mono text-xs text-muted">
                      {formatDate(post.date)} · {post.tags.join(' · ')}
                    </p>
                    <h3 className="mt-3 font-serif text-3xl font-medium leading-tight">{post.title}</h3>
                    <p className="mt-3 text-base leading-7 text-muted">{post.excerpt}</p>
                    <Link to={`/blog/${post.slug}`} className="editorial-link mt-5 inline-block">→ 阅读</Link>
                  </article>
                ))}
              </div>
            </div>
          )}

          {filteredPosts.length === 0 && (
            <p className="border-y border-line py-12 text-muted">没有找到匹配的文章。</p>
          )}
        </section>

        <aside className="space-y-12 lg:sticky lg:top-24 lg:self-start">
          <section className="border-t border-line pt-5">
            <h2 className="font-serif text-2xl font-medium">写作主题</h2>
            <p className="mt-2 text-sm text-muted">按标签快速浏览</p>
            <div className="mt-5">
              {Object.entries(tagCounts).map(([tag, count]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className="flex w-full items-center justify-between border-b border-line py-3 text-left font-mono text-sm"
                >
                  <span className={selectedTag === tag ? 'text-accent' : 'text-ink'}>#{tag}</span>
                  <span className="text-muted">{count}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="border-t border-line pt-5">
            <h2 className="font-serif text-2xl font-medium">最近更新</h2>
            <p className="mt-2 text-sm text-muted">最新发布的笔记</p>
            <div className="mt-5">
              {sortedPosts.slice(0, 5).map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="group block border-b border-line py-3">
                  <span className="block text-sm group-hover:text-accent">{post.title}</span>
                  <time dateTime={post.date} className="mt-1 block font-mono text-xs text-muted">
                    {formatDate(post.date)}
                  </time>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
};

export default BlogPage;
