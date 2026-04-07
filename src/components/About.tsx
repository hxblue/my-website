import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { skills } from '../data/skills'

/**
 * 关于我组件
 * 展示详细介绍和技能列表
 */
const About = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section Title */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">关于我</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full" />
          </motion.div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 介绍文本 */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-200">
                热爱代码，追求卓越的开发者
              </h3>
              <p className="text-gray-400 leading-relaxed">
                我是一名充满热情的全栈开发者，拥有多年的 Web 开发经验。
                我专注于创建美观、高性能的应用程序，注重用户体验和代码质量。
              </p>
              <p className="text-gray-400 leading-relaxed">
                在工作中，我喜欢探索新技术，不断学习成长。我相信好的代码不仅要能运行，
                还要易于维护和扩展。团队合作中，我乐于分享知识，与同事们共同进步。
              </p>
            </motion.div>

            {/* 技能列表 */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold mb-6 text-gray-200">技术栈</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 hover:border-purple-500/50 transition-all duration-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default About
