import type { VercelRequest, VercelResponse } from '@vercel/node';

const NOTION_TOKEN = process.env.VITE_NOTION_TOKEN;
const NOTION_API_URL = 'https://api.notion.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[Notion API] Full URL:', req.url);
  console.log('[Notion API] Method:', req.method);

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 从 URL 中提取路径
    // 请求URL格式: /api/notion/databases/xxx/query
    const urlParts = req.url?.split('/api/notion') || [];
    const notionPath = urlParts[1] || '';

    if (!notionPath) {
      return res.status(400).json({ error: 'Path is required', receivedUrl: req.url });
    }

    const targetUrl = `${NOTION_API_URL}${notionPath}`;

    console.log('[Notion API] Notion path:', notionPath);
    console.log('[Notion API] Target URL:', targetUrl);
    console.log('[Notion API] Token exists:', !!NOTION_TOKEN);

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
    console.log('[Notion API] Notion response status:', response.status);

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[Notion API] Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: String(error) });
  }
}
