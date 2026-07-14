import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BlogFilters from '../components/blog/BlogFilters';
import BlogHero from '../components/blog/BlogHero';
import BlogPagination from '../components/blog/BlogPagination';
import BlogSidebar from '../components/blog/BlogSidebar';
import PostCard from '../components/blog/PostCard';
import { blogProfile } from '../data/blogProfile';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePublishedPosts } from '../hooks/usePublishedPosts';
import type { BlogFilterState } from '../types/blog';
import {
  buildBlogIndexStats,
  filterPosts,
  getPageCount,
  paginatePosts,
  sortPostsByDate,
} from '../utils/blog';

const emptyFilters: BlogFilterState = {
  query: '',
  tag: null,
  category: null,
  archiveMonth: null,
};

const BlogPage = () => {
  const { posts, status } = usePublishedPosts();
  const [filters, setFilters] = useState<BlogFilterState>(emptyFilters);
  const [page, setPage] = useState(1);
  const location = useLocation();

  usePageMeta({
    title: `${blogProfile.name} | Chblue`,
    description: blogProfile.description,
    image: blogProfile.heroImage,
  });

  const sortedPosts = useMemo(() => sortPostsByDate(posts), [posts]);
  const stats = useMemo(() => buildBlogIndexStats(sortedPosts), [sortedPosts]);
  const filteredPosts = useMemo(
    () => filterPosts(sortedPosts, filters),
    [filters, sortedPosts],
  );
  const pageCount = getPageCount(filteredPosts.length);
  const visiblePosts = useMemo(
    () => paginatePosts(filteredPosts, page),
    [filteredPosts, page],
  );

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, [location.hash]);

  const updateFilters = (nextFilters: BlogFilterState) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const scrollToArticles = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('articles')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), pageCount));
    requestAnimationFrame(scrollToArticles);
  };

  return (
    <main>
      <BlogHero profile={blogProfile} contentTargetId="articles" />

      <div id="articles" className="blog-index">
        <BlogFilters
          value={filters}
          tags={Object.keys(stats.tagCounts)}
          categories={Object.keys(stats.categoryCounts)}
          resultCount={filteredPosts.length}
          onChange={updateFilters}
          onReset={() => updateFilters(emptyFilters)}
        />

        {status === 'loading' && (
          <p className="blog-sync-status" role="status">正在同步最新文章…</p>
        )}

        <div className="blog-index__layout">
          <section className="blog-post-list" aria-label="文章列表">
            {visiblePosts.map((post, index) => (
              <PostCard
                key={post.slug}
                post={post}
                imageSide={index % 2 === 0 ? 'left' : 'right'}
                eager={index === 0}
              />
            ))}

            {filteredPosts.length === 0 && (
              <div className="blog-empty-state">
                <p className="blog-eyebrow">NO MATCHES</p>
                <h2>没有找到匹配的文章</h2>
                <p>换一个关键词，或者清除当前筛选条件。</p>
                <button type="button" onClick={() => updateFilters(emptyFilters)}>
                  查看全部文章
                </button>
              </div>
            )}

            <BlogPagination page={page} pageCount={pageCount} onPageChange={handlePageChange} />
          </section>

          <BlogSidebar
            profile={blogProfile}
            stats={stats}
            filters={filters}
            onFilterChange={(nextFilters) => {
              updateFilters(nextFilters);
              requestAnimationFrame(scrollToArticles);
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default BlogPage;
