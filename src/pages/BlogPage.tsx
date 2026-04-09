import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BlogList from '../components/BlogList';
import { getPublishedPosts } from '../api/posts';
import { isNotionConfigured } from '../lib/notion';
import { blogs as fallbackBlogs } from '../data/blogs';
import { BookOpen, Loader2 } from 'lucide-react';
import type { BlogMeta } from '../types/blog';

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

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
          {useFallback && !isNotionConfigured() && (
            <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">
              (使用本地缓存数据 - Notion 未配置)
            </p>
          )}
          {useFallback && isNotionConfigured() && (
            <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">
              (Notion 已配置但暂无文章)
            </p>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
          </div>
        )}

        {/* Blog List */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BlogList blogs={posts} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
