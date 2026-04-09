// 本地 Markdown 文件回退映射
// 当 Notion 未配置或不可用时使用

import helloWorld from './posts/hello-world.md?raw';

export const postsMap: Record<string, string> = {
  'hello-world': helloWorld,
};
