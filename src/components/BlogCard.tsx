import { Link } from 'react-router-dom';
import type { BlogMeta } from '../types/blog';

interface BlogCardProps {
  blog: BlogMeta;
}

const BlogCard = ({ blog }: BlogCardProps) => (
  <article className="grid gap-4 border-b border-line py-8 md:grid-cols-[220px_minmax(0,1fr)_100px]">
    <p className="font-mono text-sm text-muted">{blog.date} · {blog.tags[0]}</p>
    <div>
      <h3 className="font-serif text-3xl font-medium leading-tight">{blog.title}</h3>
      <p className="mt-3 text-base leading-7 text-muted">{blog.excerpt}</p>
    </div>
    <Link to={`/blog/${blog.slug}`} className="editorial-link md:text-right">→ 阅读</Link>
  </article>
);

export default BlogCard;
