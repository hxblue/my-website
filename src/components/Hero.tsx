import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowRight, Github, Sparkles } from 'lucide-react';

const focusItems = [
  { label: '当前目标', value: '寻找前端 / 全栈开发实习' },
  { label: '正在关注', value: 'AI 应用、React 与产品体验' },
];

/**
 * 首页首屏：用真实项目页面作为背景，并明确表达身份、目标和行动入口。
 */
const Hero = () => {
  return (
    <section className="relative flex min-h-[88svh] items-end overflow-hidden bg-[#080808] px-4 pb-8 pt-24 text-white sm:min-h-[92svh] sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 sm:opacity-20"
        style={{ backgroundImage: "url('/images/projects/portfolio-blog.png')" }}
      />
      <div className="absolute inset-0 bg-black/70 sm:bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/25" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-wrap items-center gap-3 text-sm"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Open to internship
            </span>
            <span className="inline-flex items-center gap-2 text-white/60">
              <Sparkles size={15} />
              Full-stack developer · AI product explorer
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-5xl text-4xl font-bold leading-[1.08] text-white sm:text-6xl lg:text-7xl"
          >
            把想法做成
            <span className="block text-purple-300">真正可用的产品。</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg"
          >
            你好，我是 Chenblue。一名正在寻找实习机会的全栈开发者，喜欢从真实问题出发，
            用 Web 技术和 AI 能力完成可以访问、可以体验、可以持续迭代的产品。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-purple-100"
            >
              查看精选项目
              <ArrowRight size={17} />
            </a>
            <a
              href="https://github.com/hxblue"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Github size={17} />
              GitHub
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="border-l border-white/15 pl-5 sm:pl-7"
        >
          <p className="mb-5 font-mono text-xs uppercase text-purple-300">
            developer_status.json
          </p>
          <div className="grid grid-cols-2 gap-4 sm:block sm:space-y-5">
            {focusItems.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-white/40">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-white/85">{item.value}</p>
              </div>
            ))}
          </div>
          <a
            href="#about"
            className="mt-7 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
          >
            继续了解我
            <ArrowDownRight size={17} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
