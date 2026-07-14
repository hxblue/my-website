import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { BlogFilterState, BlogIndexStats, BlogProfile } from '../../types/blog';
import { formatBlogDate } from '../../utils/blog';

interface BlogSidebarProps {
  profile: BlogProfile;
  stats: BlogIndexStats;
  filters: BlogFilterState;
  onFilterChange(next: BlogFilterState): void;
}

const SidebarCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="blog-sidebar-card">
    <h2>{title}</h2>
    {children}
  </section>
);

export default function BlogSidebar({ profile, stats, filters, onFilterChange }: BlogSidebarProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <aside className="blog-sidebar" aria-label="博客信息">
      <section className="blog-sidebar-card blog-author-card">
        <div className="blog-avatar">
          {!avatarFailed ? (
            <img src={profile.avatar} alt={`${profile.name}头像`} onError={() => setAvatarFailed(true)} />
          ) : (
            <span aria-hidden="true">CB</span>
          )}
        </div>
        <h2>{profile.name}</h2>
        <p>{profile.description}</p>
        <div className="blog-author-stats">
          <span><strong>{stats.postCount}</strong>文章</span>
          <span><strong>{Object.keys(stats.tagCounts).length}</strong>标签</span>
          <span><strong>{Object.keys(stats.categoryCounts).length}</strong>分类</span>
        </div>
      </section>

      {stats.recentPosts.length > 0 && (
        <SidebarCard title="最近文章">
          <div className="blog-sidebar-list">
            {stats.recentPosts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`}>
                <span>{post.title}</span>
                <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
              </Link>
            ))}
          </div>
        </SidebarCard>
      )}

      {Object.keys(stats.categoryCounts).length > 0 && (
        <SidebarCard title="分类">
          <div className="blog-sidebar-buttons">
            {Object.entries(stats.categoryCounts).map(([category, count]) => (
              <button
                key={category}
                type="button"
                className={filters.category === category ? 'is-active' : ''}
                aria-pressed={filters.category === category}
                onClick={() => onFilterChange({ ...filters, category })}
              >
                <span>{category}</span><span>{count}</span>
              </button>
            ))}
          </div>
        </SidebarCard>
      )}

      {Object.keys(stats.tagCounts).length > 0 && (
        <SidebarCard title="标签云">
          <div className="blog-tag-cloud">
            {Object.entries(stats.tagCounts).map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                className={filters.tag === tag ? 'is-active' : ''}
                aria-pressed={filters.tag === tag}
                onClick={() => onFilterChange({ ...filters, tag })}
              >
                #{tag} <small>{count}</small>
              </button>
            ))}
          </div>
        </SidebarCard>
      )}

      {stats.archives.length > 0 && (
        <SidebarCard title="归档">
          <div className="blog-sidebar-buttons">
            {stats.archives.map((archive) => (
              <button
                key={archive.key}
                type="button"
                className={filters.archiveMonth === archive.key ? 'is-active' : ''}
                aria-pressed={filters.archiveMonth === archive.key}
                onClick={() => onFilterChange({ ...filters, archiveMonth: archive.key })}
              >
                <span>{archive.label}</span><span>{archive.count}</span>
              </button>
            ))}
          </div>
        </SidebarCard>
      )}
    </aside>
  );
}
