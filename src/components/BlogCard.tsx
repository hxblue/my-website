import { Link } from 'react-router-dom';
import type { BlogMeta } from '../types/blog';
import { Calendar, Tag } from 'lucide-react';

interface BlogCardProps {
  blog: BlogMeta;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group block bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-[1.02]"
    >
      {/* Cover Image */}
      <div className="aspect-video overflow-hidden bg-gray-800">
        <img
          src={blog.cover}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {blog.excerpt}
        </p>

        {/* Date */}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar size={14} />
          <time>{new Date(blog.date).toLocaleDateString('zh-CN')}</time>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
