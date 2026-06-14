export interface Project {
  id: number;
  name: string;
  label: string;
  description: string;
  image: string;
  imageAlt: string;
  isWideImage?: boolean;
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
    name: "个人作品集与技术博客",
    label: "内容平台 / 个人品牌",
    description:
      "想做一个能“长出内容”的个人站点 → 接入 Notion 管理内容、Supabase 承载评论、Vercel 自动部署 → 已稳定运行约 2 个月，并持续迭代内容与体验。",
    image: "/images/projects/portfolio-editorial-v2.png",
    imageAlt: "Chblue 当前个人作品集首页",
    status: "持续迭代",
    highlights: ["Notion 内容管理", "Supabase 评论系统", "响应式深浅色界面"],
    techStack: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Notion API",
      "Supabase",
      "Vercel",
    ],
    githubUrl: "https://github.com/hxblue/my-website",
    liveUrl: "https://my-website-two-mauve-11.vercel.app",
  },
  {
    id: 2,
    name: "AI 智能伴侣",
    label: "AI 应用 / 对话体验",
    description:
      "想验证 LLM 长期对话的稳定性 → 完成人设配置、流式回复、会话持久化和错误降级 → 已在 Streamlit 上线，可直接访问体验。",
    image: "/images/projects/ai-partner.png",
    imageAlt: "AI 智能伴侣 Streamlit 应用界面",
    status: "实验项目",
    highlights: ["可配置 AI 人设", "流式多轮对话", "历史会话持久化"],
    techStack: ["Python", "Streamlit", "DeepSeek API", "OpenAI SDK", "JSON"],
    githubUrl: "https://github.com/hxblue/ai-partner",
    liveUrl: "https://ai-partner-avpommj9cgqym7ymgz6gsb.streamlit.app",
  },
  // 以下两个项目的 description、highlights 与 techStack 可按实际实现继续补充。
  {
    id: 3,
    name: "Chblue AI Agent",
    label: "AI 应用 / 智能体",
    description:
      "面向不同场景的 AI 智能体应用入口 -> 分为AI对话应用以及AI智能体应用 -> 涵盖多种AI应用功能落地",
    image: "/images/projects/cnblue-ai-agent.png",
    imageAlt: "Chblue AI Agent 智能体选择页面",
    isWideImage: true,
    status: "已上线",
    highlights: ["RAG知识库检索", "工具调用", "MCP服务", "自主推理和行动"],
    techStack: ["Spring Boot3", "Spring AI ", "MCP模型上下文协议", "ReAct"],
    githubUrl: "https://github.com/hxblue/cnblue-ai-agent",
    liveUrl:
      "https://chenblue-ai-frontend-260189-5-1435108627.sh.run.tcloudbase.com/",
  },
  {
    id: 4,
    name: "Chenblue 云图库",
    label: "Java 全栈 / 图片平台",
    description:
      "基于 Java 后端开发的全栈图片管理与分享平台，提供图片浏览与管理等功能。针对企业可开通团队空间，邀请成员，并实时协同编辑图片",
    image: "/images/projects/cnblue-picture.png",
    imageAlt: "Chenblue 云图库首页",
    status: "已上线",
    highlights: [
      "图片浏览与检索",
      "图片与空间管理",
      "团队空间",
      "实时协同编辑",
    ],
    techStack: [
      "spring boot",
      "MyBatis-Plus",
      "redis",
      "WebSocket",
      "AI绘画大模型接入",
    ],
    githubUrl: "https://github.com/hxblue/cnblue-picture",
    liveUrl: "http://8.163.131.203/",
  },
];
