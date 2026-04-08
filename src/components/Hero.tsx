import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

/**
 * 首页英雄区组件
 * 展示大标题、简介和头像
 */
const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-transparent dark:to-transparent">
      {/* 背景渐变装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* 头像 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-400 p-1">
            <div className="w-full h-full rounded-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
              <span className="text-4xl sm:text-5xl">👋</span>
            </div>
          </div>
        </motion.div>

        {/* 标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 dark:text-white"
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            你好，我是开发者
          </span>
        </motion.h1>

        {/* 简介 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12"
        >
          热爱创造优雅的用户体验，专注于现代 Web 开发技术栈。
          致力于构建高性能、可扩展的应用程序。
        </motion.p>

        {/* CTA 按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#projects"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-purple-500/25"
          >
            查看作品
          </a>
          <a
            href="#contact"
            className="px-8 py-3 rounded-full border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
          >
            联系我
          </a>
        </motion.div>
      </div>

      {/* 滚动提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="text-gray-400 dark:text-gray-500" size={24} />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
