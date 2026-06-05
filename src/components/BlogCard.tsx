import { Link } from 'react-router-dom';
import type { BlogMeta } from '../types/blog';
import { ArrowUpRight, CalendarDays, Tag } from 'lucide-react';

interface BlogCardProps {
  blog: BlogMeta;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-400/70 hover:shadow-xl hover:shadow-purple-500/10 dark:border-white/10 dark:bg-white/[0.04]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-200 dark:bg-gray-900">
        {blog.cover ? (
          <img
            src={blog.cover}
            alt={blog.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-900 via-gray-900 to-cyan-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent opacity-80" />
        <span className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          技术笔记
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-300"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-snug text-gray-950 transition group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-300">
          {blog.title}
        </h3>

        <p className="mb-6 line-clamp-3 flex-1 text-sm leading-7 text-gray-600 dark:text-gray-400">
          {blog.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm dark:border-white/10">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
            <CalendarDays size={15} />
            <time dateTime={blog.date}>{formatDate(blog.date)}</time>
          </div>
          <span className="inline-flex items-center gap-1 font-medium text-purple-600 dark:text-purple-300">
            阅读
            <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
