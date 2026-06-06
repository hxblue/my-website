export interface Project {
  id: number;
  name: string;
  label: string;
  description: string;
  image: string;
  imageAlt: string;
  status: string;
  highlights: string[];
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
}

// 首页只展示已经可以访问和验证的真实项目。
export const projects: Project[] = [
  {
    id: 1,
    name: '个人作品集与技术博客',
    label: '内容平台 / 个人品牌',
    description:
      '从作品展示页逐步迭代为可持续更新的个人技术站点，整合 Notion 博客、Supabase 评论、主题切换和 Vercel 部署。',
    image: '/images/projects/portfolio-blog.png',
    imageAlt: 'Chenblue 技术博客页面',
    status: '持续迭代',
    highlights: ['Notion 内容管理', 'Supabase 评论系统', '响应式深浅色界面'],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Notion API', 'Supabase', 'Vercel'],
    githubUrl: 'https://github.com/hxblue/my-website',
    liveUrl: 'https://my-website-two-mauve-11.vercel.app',
  },
  {
    id: 2,
    name: 'AI 智能伴侣',
    label: 'AI 应用 / 对话体验',
    description:
      '一个可自定义昵称与性格的 AI 伴侣 Demo，支持多轮对话、流式回复和本地会话管理，用来探索大模型能力如何成为可用产品。',
    image: '/images/projects/ai-partner.png',
    imageAlt: 'AI 智能伴侣 Streamlit 应用界面',
    status: '实验项目',
    highlights: ['可配置 AI 人设', '流式多轮对话', '历史会话持久化'],
    techStack: ['Python', 'Streamlit', 'DeepSeek API', 'OpenAI SDK', 'JSON'],
    githubUrl: 'https://github.com/hxblue/ai-partner',
    liveUrl: 'https://ai-partner-avpommj9cgqym7ymgz6gsb.streamlit.app',
  },
];
