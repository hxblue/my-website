import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ExternalLink, Code2 } from 'lucide-react'
import { projects } from '../data/projects'

/**
 * 项目展示组件
 * 展示项目卡片列表，每个卡片包含项目信息
 */
const Projects = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-100/50 dark:bg-black/20" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section Title */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">项目展示</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full" />
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              以下是一些我近期参与开发的项目，涵盖了 Web 应用、移动端开发等多个领域
            </p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className="group bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-lg dark:hover:shadow-purple-500/10"
              >
                {/* Project Image */}
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center overflow-hidden">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {project.image}
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex gap-4">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        <Code2 size={16} />
                        <span>源码</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                      >
                        <ExternalLink size={16} />
                        <span>访问</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Projects
