import type { BlogMeta } from '../types/blog';
import BlogCard from './BlogCard';

interface BlogListProps {
  blogs: BlogMeta[];
}

const BlogList = ({ blogs }: BlogListProps) => (
  <div>
    {[...blogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((blog) => <BlogCard key={blog.slug} blog={blog} />)}
  </div>
);

export default BlogList;
