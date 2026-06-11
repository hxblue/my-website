export interface SkillGroup {
  title: string;
  description: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: '前端实现',
    description:
      '能够借助 AI 编程工具完成页面与交互开发，初步了解 React、Vue 等前端框架，让项目具备可访问的使用界面。',
    skills: ['React', 'Vue', 'TypeScript', 'Tailwind CSS', 'AI 辅助编程'],
  },
  {
    title: '后端与数据库',
    description:
      '主攻 Java 后端开发，持续学习服务端业务实现、项目依赖管理以及关系型数据库的设计与使用。',
    skills: ['Java', 'Maven', 'Spring', 'Spring Boot', 'Spring AI', 'MySQL'],
  },
  {
    title: 'AI 应用能力',
    description:
      '关注大模型能力在实际项目中的落地，尝试知识检索、工具调用、智能体工作流与上下文协议。',
    skills: ['RAG', 'ReAct', 'Tool Calling', 'MCP', 'Claude Code', 'Codex'],
  },
  {
    title: '工程与交付',
    description:
      '能够使用常见工程工具管理代码、容器化运行，并将个人项目部署到线上持续迭代。',
    skills: ['Git', 'Docker', 'GitHub', 'Vercel'],
  },
];
