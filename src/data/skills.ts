export interface SkillGroup {
  title: string;
  description: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: '前端体验',
    description: '把产品思路转化为清晰、响应式且可维护的界面。',
    skills: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Vue.js'],
  },
  {
    title: '后端与数据',
    description: '为内容、评论和业务状态建立可靠的数据连接。',
    skills: ['Node.js', 'Python', 'Supabase', 'PostgreSQL', 'REST API'],
  },
  {
    title: 'AI 与产品',
    description: '关注大模型能力在真实交互场景中的落地方式。',
    skills: ['DeepSeek API', 'OpenAI SDK', 'Prompt Design', 'Streamlit'],
  },
  {
    title: '工程与交付',
    description: '让项目从本地开发稳定走向线上可访问状态。',
    skills: ['Git', 'GitHub', 'Vercel', 'Docker', 'Codex'],
  },
];
