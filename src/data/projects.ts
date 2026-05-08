/**
 * 项目数据类型定义
 */
export interface Project {
  id: number
  name: string
  description: string
  image: string
  techStack: string[]
  githubUrl?: string
  liveUrl?: string
}

/**
 * 项目列表数据
 * 用于展示在项目展示页面的卡片
 */
export const projects: Project[] = [
  {
    id: 1,
    name: '个人作品集网站',
    description: '基于 React、TypeScript、Tailwind CSS 构建的个人作品集，集成博客、评论和深浅色主题切换。',
    image: '🛒',
    techStack: ['React', 'Streamlit', 'OpenAI Python SDK', 'JSON 文件会话持久化' ,'DeepSeek API'],
    githubUrl: 'https://github.com/hxblue/my-website',
    liveUrl: 'https://my-website-two-mauve-11.vercel.app',
  },
  {
    id: 2,
    name: 'AI智能伴侣',
    description: '一个基于 Streamlit 和 DeepSeek 大模型 API 构建的 AI 伴侣聊天 Demo。用户可以自定义 AI 伴侣的昵称和性格，并在网页端进行多轮对话。',
    image: '📋',
    techStack: ['Python', 'TypeScript', 'Pinia', 'Express', 'PostgreSQL'],
    githubUrl: 'https://github.com/hxblue/ai-partner',
    liveUrl: 'https://ai-partner-avpommj9cgqym7ymgz6gsb.streamlit.app',
  },
  {
    id: 3,
    name: '数据可视化仪表盘',
    description: '实时数据监控仪表盘，支持多种图表类型、数据筛选和导出功能。为企业决策提供直观的数据支持。',
    image: '📊',
    techStack: ['React', 'D3.js', 'ECharts', 'Python', 'FastAPI'],
    githubUrl: 'https://github.com/example/dashboard',
    liveUrl: 'https://dashboard-demo.example.com',
  },
  {
    id: 4,
    name: '社交媒体应用',
    description: '一个轻量级的社交平台，支持发布动态、点赞评论、关注用户等功能。注重隐私保护和内容质量。',
    image: '💬',
    techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Redis'],
    githubUrl: 'https://github.com/example/social',
  },
  {
    id: 5,
    name: '在线教育平台',
    description: '支持视频课程、在线测验、学习进度追踪的综合性学习平台。提供沉浸式的学习体验。',
    image: '🎓',
    techStack: ['React', 'GraphQL', 'Node.js', 'AWS S3', 'Stripe'],
    githubUrl: 'https://github.com/example/education',
    liveUrl: 'https://edu-demo.example.com',
  },
  {
    id: 6,
    name: '天气应用',
    description: '简洁美观的天气查询应用，支持实时天气、未来预报、城市管理等功能。数据来源可靠，更新及时。',
    image: '🌤️',
    techStack: ['React Native', 'TypeScript', 'Redux', 'OpenWeather API'],
    githubUrl: 'https://github.com/example/weather',
  },
]
