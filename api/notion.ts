import type { VercelRequest, VercelResponse } from '@vercel/node';

const NOTION_TOKEN = process.env.VITE_NOTION_TOKEN;
const NOTION_API_URL = 'https://api.notion.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[Notion API] Request:', req.method, req.url);

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 构建目标 URL - Vercel 会把 /api/notion/databases/xxx 作为 req.url
    const originalUrl = req.url || '';
    const path = originalUrl.replace(/^\/api\/notion/, '').replace(/\?.*$/, '');
    const url = `${NOTION_API_URL}${path}`;

    console.log('[Notion API] Proxying to:', url);
    console.log('[Notion API] Token exists:', !!NOTION_TOKEN);

    // 转发请求到 Notion API
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD'
        ? JSON.stringify(req.body)
        : undefined,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Notion proxy error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
