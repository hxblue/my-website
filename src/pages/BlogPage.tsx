import { motion } from 'framer-motion';
import BlogList from '../components/BlogList';
import { blogs } from '../data/blogs';
import { BookOpen } from 'lucide-react';

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-600 dark:text-purple-400 text-sm mb-6">
            <BookOpen size={16} />
            博客
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            学习笔记 <span className="text-purple-600 dark:text-purple-400">&</span> 技术分享
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            记录学习历程，分享技术心得，与你一起成长
          </p>
        </motion.div>

        {/* Blog List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BlogList blogs={blogs} />
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPage;
