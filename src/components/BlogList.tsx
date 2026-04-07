import { BlogMeta } from '../types/blog';
import BlogCard from './BlogCard';
import { motion } from 'framer-motion';

interface BlogListProps {
  blogs: BlogMeta[];
}

const BlogList = ({ blogs }: BlogListProps) => {
  // 按日期倒序排列
  const sortedBlogs = [...blogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedBlogs.map((blog, index) => (
        <motion.div
          key={blog.slug}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <BlogCard blog={blog} />
        </motion.div>
      ))}
    </div>
  );
};

export default BlogList;
