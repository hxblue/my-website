import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Github, Mail } from 'lucide-react';
import { useRef } from 'react';

const contactLinks = [
  {
    label: 'GitHub',
    value: 'github.com/hxblue',
    href: 'https://github.com/hxblue',
    icon: Github,
  },
  {
    label: 'Google 邮箱',
    value: 'wanglemao03@gmail.com',
    href: 'mailto:wanglemao03@gmail.com',
    icon: Mail,
  },
  {
    label: '163 邮箱',
    value: 'wanglemao03@163.com',
    href: 'mailto:wanglemao03@163.com',
    icon: Mail,
  },
];

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="contact"
      ref={ref}
      className="border-t border-gray-200 bg-gray-950 px-4 py-24 text-white dark:border-white/10 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_480px] lg:items-end"
      >
        <div>
          <p className="font-mono text-xs uppercase text-purple-300">04 / Contact</p>
          <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            正在寻找可以一起
            <span className="block text-purple-300">学习、构建和成长的机会。</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
            如果你正在寻找愿意快速学习、重视产品体验并且乐于把事情真正做出来的开发者，欢迎联系我。
          </p>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group flex items-center gap-4 py-5"
            >
              <link.icon className="text-purple-300" size={20} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/40">{link.label}</p>
                <p className="mt-1 truncate text-sm font-medium text-white/85">{link.value}</p>
              </div>
              <ArrowUpRight
                size={18}
                className="text-white/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
              />
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
