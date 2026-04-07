import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Mail, Github } from 'lucide-react'

/**
 * 联系方式组件
 * 展示邮箱、GitHub、社交媒体链接
 */
const Contact = () => {
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

  const contactLinks = [
    {
      name: '邮箱',
      value: 'developer@example.com',
      icon: Mail,
      href: 'mailto:developer@example.com',
    },
    {
      name: 'GitHub',
      value: '@developer',
      icon: Github,
      href: 'https://github.com/developer',
    },
    {
      name: 'LinkedIn',
      value: 'Developer Profile',
      icon: Mail,
      href: 'https://linkedin.com/in/developer',
    },
    {
      name: 'Twitter',
      value: '@developer',
      icon: Mail,
      href: 'https://twitter.com/developer',
    },
  ]

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section Title */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">联系方式</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full" />
            <p className="mt-4 text-gray-400">
              有合作意向或想了解更多？欢迎随时联系我
            </p>
          </motion.div>

          {/* Contact Cards */}
          <motion.div
            variants={itemVariants}
            className="grid sm:grid-cols-2 gap-6"
          >
            {contactLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                  <link.icon className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{link.name}</p>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    {link.value}
                  </p>
                </div>
              </a>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={itemVariants} className="text-center mt-16">
            <p className="text-gray-500 text-sm">
              期待与您的合作
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
