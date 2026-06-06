import { motion, useInView } from 'framer-motion';
import { Bot, Database, MonitorSmartphone, Rocket } from 'lucide-react';
import { useRef } from 'react';
import { skillGroups } from '../data/skills';

const groupIcons = [MonitorSmartphone, Database, Bot, Rocket];

/**
 * 将技能从标签墙改为围绕产品交付过程组织的能力分组。
 */
const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" ref={ref} className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]"
        >
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-xs uppercase text-purple-600 dark:text-purple-300">
              01 / Capabilities
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-gray-950 dark:text-white sm:text-4xl">
              从问题到上线，
              <span className="block text-gray-500 dark:text-gray-400">关注完整的产品过程。</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-gray-600 dark:text-gray-400">
              我还在持续学习，但已经习惯用项目验证技术：先理解需求，再完成界面、数据连接、部署和迭代，
              让每一次练习都尽可能接近真实产品。
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-gray-200 pt-7 dark:border-white/10">
              <div>
                <dt className="text-xs text-gray-500">当前阶段</dt>
                <dd className="mt-2 font-semibold text-gray-900 dark:text-white">寻找开发实习</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">工作方式</dt>
                <dd className="mt-2 font-semibold text-gray-900 dark:text-white">构建中学习</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">关注方向</dt>
                <dd className="mt-2 font-semibold text-gray-900 dark:text-white">AI + Web 产品</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">交付习惯</dt>
                <dd className="mt-2 font-semibold text-gray-900 dark:text-white">上线与复盘</dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-white/10 dark:bg-white/10 sm:grid-cols-2">
            {skillGroups.map((group, index) => {
              const Icon = groupIcons[index];

              return (
                <article
                  key={group.title}
                  className="bg-white p-6 dark:bg-[#101010] sm:p-8"
                >
                  <Icon className="text-purple-600 dark:text-purple-300" size={24} />
                  <h3 className="mt-6 text-xl font-bold text-gray-950 dark:text-white">
                    {group.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                    {group.description}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
