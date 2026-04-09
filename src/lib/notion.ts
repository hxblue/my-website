// Notion 配置检查
const NOTION_TOKEN = import.meta.env.VITE_NOTION_TOKEN;
const NOTION_DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;

console.log('[Notion Config] Token exists:', !!NOTION_TOKEN);
console.log('[Notion Config] Database ID exists:', !!NOTION_DATABASE_ID);
console.log('[Notion Config] Token prefix:', NOTION_TOKEN?.substring(0, 10) + '...');

export function isNotionConfigured(): boolean {
  const configured = !!NOTION_TOKEN && !!NOTION_DATABASE_ID;
  console.log('[Notion Config] isNotionConfigured:', configured);
  return configured;
}

export { NOTION_TOKEN, NOTION_DATABASE_ID };
