import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Check, Code2 } from 'lucide-react';
import { useRef } from 'react';
import { projects } from '../data/projects';

/**
 * 精选项目使用真实界面截图，并通过问题、能力和结果讲述项目价值。
 */
const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="projects"
      ref={ref}
      className="border-y border-gray-200 bg-white px-4 py-24 dark:border-white/10 dark:bg-[#0d0d0d] sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-14 flex flex-col gap-5 border-b border-gray-200 pb-8 dark:border-white/10 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="font-mono text-xs uppercase text-purple-600 dark:text-purple-300">
              02 / Selected work
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">
              精选真实项目
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-gray-600 dark:text-gray-400">
            不展示虚构案例，只记录我真正构建、部署并持续思考的产品。
          </p>
        </motion.div>

        <div className="space-y-10">
          {projects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="grid overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-white/10 dark:bg-[#111] lg:grid-cols-2"
            >
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative min-h-80 overflow-hidden bg-gray-200 dark:bg-gray-900 ${
                  index % 2 === 1 ? 'lg:order-2' : ''
                }`}
                aria-label={`访问 ${project.name}`}
              >
                <img
                  src={project.image}
                  alt={project.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.02]"
                />
                <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-black/65 text-white backdrop-blur transition group-hover:bg-purple-600">
                  <ArrowUpRight size={19} />
                </span>
              </a>

              <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-mono uppercase text-purple-600 dark:text-purple-300">
                      {project.label}
                    </span>
                    <span className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {project.status}
                    </span>
                  </div>

                  <h3 className="mt-5 text-3xl font-bold text-gray-950 dark:text-white">
                    {project.name}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>

                  <ul className="mt-7 space-y-3">
                    {project.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Check className="text-emerald-500" size={16} />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-9 border-t border-gray-200 pt-6 dark:border-white/10">
                  <div className="mb-6 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-gray-200/70 px-2.5 py-1.5 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-5">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-purple-600 dark:text-gray-200 dark:hover:text-purple-300"
                    >
                      <Code2 size={17} />
                      查看源码
                    </a>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-200"
                    >
                      在线体验
                      <ArrowUpRight size={17} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
