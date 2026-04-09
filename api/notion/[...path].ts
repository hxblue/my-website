import type { VercelRequest, VercelResponse } from '@vercel/node';

const NOTION_TOKEN = process.env.VITE_NOTION_TOKEN;
const NOTION_API_URL = 'https://api.notion.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 使用 req.query.path 获取动态路由参数
    const pathSegments = req.query.path as string[] || [];
    const notionPath = pathSegments.join('/');

    if (!notionPath) {
      return res.status(400).json({ error: 'Path is required' });
    }

    const targetUrl = `${NOTION_API_URL}/${notionPath}`;

    console.log('[Notion API] Path:', notionPath);
    console.log('[Notion API] Target URL:', targetUrl);

    // 转发请求到 Notion API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.body
        ? JSON.stringify(req.body)
        : undefined,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[Notion API] Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
