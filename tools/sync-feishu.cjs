#!/usr/bin/env node
'use strict';

// 放在 tools/，避免被 Hexo 当成 scripts/ 下的站点生成插件自动执行。
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '..');

function run(command, args, inherit = false) {
  const result = spawnSync(command, args, {
    cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    stdio: inherit ? 'inherit' : 'pipe', windowsHide: true,
    env: { ...process.env, LARKSUITE_CLI_NO_UPDATE_NOTIFIER: '1', LARKSUITE_CLI_NO_SKILLS_NOTIFIER: '1' },
  });
  if (result.error || result.status !== 0) {
    throw new Error(result.error?.message || result.stderr?.trim() || result.stdout?.trim() || `${command} 执行失败`);
  }
  return result.stdout?.trim() || '';
}

function lark(args) {
  // Windows 的 npm .cmd 包装器不能安全地用 shell:false 直接启动；改用其 JS 入口和参数数组。
  if (process.platform === 'win32') {
    for (const dir of (process.env.PATH || '').split(path.delimiter)) {
      const runner = path.join(dir.replace(/^"|"$/g, ''), 'node_modules/@larksuite/cli/scripts/run.js');
      if (fs.existsSync(runner)) return run(process.execPath, [runner, ...args, '--as', 'user']);
    }
  }
  return run('lark-cli', [...args, '--as', 'user']);
}

function parseOptions(args) {
  const options = { tags: [] };
  const flags = { '--slug': 'slug', '--category': 'category', '--tag': 'tags', '--description': 'description', '--cover': 'cover' };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--publish') options.publish = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (flags[arg]) {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`${arg} 缺少参数`);
      if (arg === '--tag') options.tags.push(value);
      else options[flags[arg]] = value;
    } else if (!arg.startsWith('-') && !options.url) options.url = arg;
    else throw new Error(`未知参数：${arg}`);
  }
  return options;
}

function validateUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !/(?:^|\.)(?:feishu\.cn|larksuite\.com|doubao\.com)$/.test(url.hostname) ||
      !/^\/(?:wiki|docx)\/[A-Za-z0-9]+\/?$/.test(url.pathname)) {
    throw new Error('请使用飞书 /docx/ 或 /wiki/ 文档 HTTPS 链接');
  }
  // 去掉复制链接的跟踪参数，不把临时分享参数写入博客。
  return `${url.origin}${url.pathname}`;
}

function validateSlug(slug) {
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug)) throw new Error('slug 请使用不超过 80 字符的小写英文、数字和连字符');
  return slug;
}

function readPost(file) {
  // Windows 检出可能使用 CRLF；比较前统一换行，避免无改动时误判成需要发布。
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return { text, metadata: match ? yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) || {} : {} };
}

function decodeText(text) {
  return text.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, (entity) => {
    const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
    if (named[entity]) return named[entity];
    return String.fromCodePoint(parseInt(entity.slice(entity[2] === 'x' ? 3 : 2, -1), entity[2] === 'x' ? 16 : 10));
  });
}

function attributes(text) {
  const attrs = {};
  for (const match of text.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[match[1]] = decodeText(match[2] ?? match[3]);
  return attrs;
}

// 仅转换正文中的飞书块；代码围栏里的示例内容原样保留。
function transformMarkdown(content, download) {
  const titleMatch = content.match(/^\s*<title>([\s\S]*?)<\/title>\s*/);
  if (!titleMatch) throw new Error('飞书返回内容中缺少文档标题，停止导入');
  const title = decodeText(titleMatch[1]).trim();
  const source = content.slice(titleMatch[0].length).replace(/\r\n/g, '\n');
  let buffer = '', body = '', fence = null;
  function flush() {
    let text = buffer;
    // 飞书会导出 **提示：**正文；把标点移到强调范围外，避免 Markdown 将星号原样显示。
    text = text.replace(/\*\*([^\n*]+?)([：:；;，,。.!！?？])\*\*(?=\S)/g, '**$1**$2');
    text = text.replace(/<callout\b([^>]*)>\s*([\s\S]*?)\s*<\/callout>/g, (_, attr, inner) => {
      const emoji = attributes(attr).emoji;
      return `${emoji ? `> ${emoji}\n>\n` : ''}${inner.split('\n').map((line) => `> ${line}`).join('\n')}\n`;
    });
    text = text.replace(/<(whiteboard|img|source)\b([^>]*?)(?:\/\s*>|>\s*<\/\1>)/g, (_, kind, attr) => {
      const data = attributes(attr);
      if (!/^[A-Za-z0-9]+$/.test(data.token || '')) throw new Error(`${kind} 缺少可下载的素材 token，停止导入`);
      const url = download(data.token, kind);
      const label = (data.alt || data.name || (kind === 'whiteboard' ? '文档图示' : '文档图片')).replace(/[\[\]\\]/g, '\\$&');
      return `${kind === 'source' ? '' : '!'}[${label}](${url})`;
    });
    if (/<\/?(?:whiteboard|img|source|callout|sheet|bitable|synced_reference|table|iframe|script)\b/i.test(text) ||
        /https?:\/\/[^\s)"<>]*(?:feishu\.cn|larksuite\.com)\/[^\s)"<>]*(?:asynccode|box\/stream|drive\/v1\/medias)/i.test(text)) {
      throw new Error('文档仍含未转换的内嵌资源或临时素材链接，停止导入，请先检查转换格式');
    }
    body += text;
    buffer = '';
  }
  for (const line of source.split('\n')) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!fence && marker) {
      flush(); fence = marker[1];
      const language = marker[2].trim();
      const aliases = { 'plain text': 'text', 'plaintext': 'text', 'javascript': 'javascript', 'typescript': 'typescript' };
      body += `${marker[1]}${aliases[language.toLowerCase()] || language}\n`;
    } else if (fence) {
      body += `${line}\n`;
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
    } else buffer += `${line}\n`;
  }
  flush();
  return { title, body: body.trim() + '\n' };
}

function timestamp() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
}

function main() {
  const options = parseOptions(process.argv.slice(2));
  if (options.help || !options.url) {
    console.log('用法：npm run feishu:sync -- "飞书文档链接" [--slug english-slug] [--category 分类] [--tag 标签] [--description 摘要] [--cover 图片路径]\n发布：npm run feishu:publish -- "飞书文档链接"\n同步默认为本地导入；发布会构建、提交文章与图片，再快进推送到 main 和 hexo-site。');
    return;
  }
  const sourceUrl = validateUrl(options.url);
  let branch;
  if (options.publish) {
    if (run('git', ['status', '--porcelain'])) throw new Error('发布前请先处理工作区改动；同步工具不会把其他修改一起提交');
    branch = run('git', ['branch', '--show-current']);
    if (!['main', 'hexo-site'].includes(branch)) throw new Error('请在 main 或 hexo-site 分支发布');
    run('git', ['fetch', 'origin', 'main', 'hexo-site']);
    for (const ref of ['origin/main', 'origin/hexo-site']) {
      try { run('git', ['merge-base', '--is-ancestor', ref, 'HEAD']); }
      catch { throw new Error(`${ref} 有未合入的提交，请先同步分支后再发布`); }
    }
  }
  console.log('读取飞书文档……');
  const envelope = JSON.parse(lark(['docs', '+fetch', '--doc', sourceUrl, '--doc-format', 'markdown', '--detail', 'full']));
  if (envelope.ok !== true || !envelope.data?.document?.content) throw new Error('飞书读取未成功，未写入文章');
  const document = envelope.data.document;
  if (!/^[A-Za-z0-9]+$/.test(document.document_id || '')) throw new Error('飞书文档 ID 无效');
  const postsDir = path.join(root, 'source/_posts');
  const matches = fs.readdirSync(postsDir).filter((name) => name.endsWith('.md')).map((name) => ({ name, ...readPost(path.join(postsDir, name)) })).filter((post) => post.metadata.feishu_document_id === document.document_id);
  if (matches.length > 1) throw new Error('发现多个文章对应同一飞书文档，请先消除重复映射');
  const existing = matches[0];
  const slug = validateSlug(existing ? path.basename(existing.name, '.md') : options.slug || `feishu-${crypto.createHash('sha256').update(document.document_id).digest('hex').slice(0, 12)}`);
  if (existing && options.slug && options.slug !== slug) throw new Error(`这篇文档已有固定网址 ${slug}，请不要重新指定其他 slug`);
  const postPath = `source/_posts/${slug}.md`;
  if (!existing && fs.existsSync(path.join(root, postPath))) throw new Error('文件名已被其他文章使用，请换一个 slug');
  const assetDir = `source/images/posts/${slug}`;
  const cacheDir = `.preview/feishu-sync/${document.document_id}`;
  fs.mkdirSync(path.join(root, cacheDir), { recursive: true });
  const assets = new Map();
  function download(token, kind) {
    const key = `${kind === 'whiteboard' ? 'whiteboard' : 'media'}:${token}`;
    if (assets.has(key)) return assets.get(key).url;
    const basename = `${kind}-${crypto.createHash('sha256').update(key).digest('hex').slice(0, 12)}`;
    console.log(`下载${kind === 'whiteboard' ? '画板' : '素材'} ${assets.size + 1}……`);
    lark(['docs', '+media-download', '--type', kind === 'whiteboard' ? 'whiteboard' : 'media', '--token', token, '--output', `./${cacheDir}/${basename}`, '--overwrite']);
    const files = fs.readdirSync(path.join(root, cacheDir)).filter((name) => name.startsWith(`${basename}.`));
    if (files.length !== 1) throw new Error('无法唯一确认下载文件，未写入文章');
    const filename = files[0];
    if (!/\.(?:png|jpe?g|webp|gif|pdf|txt|zip)$/i.test(filename) || (kind !== 'source' && !/\.(?:png|jpe?g|webp|gif)$/i.test(filename))) throw new Error(`不支持的素材格式：${path.extname(filename)}`);
    const bytes = fs.readFileSync(path.join(root, cacheDir, filename));
    if (!bytes.length) throw new Error('下载素材为空，未写入文章');
    const url = `/images/posts/${slug}/${filename}`;
    assets.set(key, { url, bytes, target: path.join(root, assetDir, filename) });
    return url;
  }
  const { title, body } = transformMarkdown(document.content, download);
  const now = timestamp();
  const metadata = { ...existing?.metadata, title, date: existing?.metadata.date || now, updated: existing?.metadata.updated || now,
    categories: options.category ? [options.category] : existing?.metadata.categories || ['笔记'],
    tags: options.tags.length ? options.tags : existing?.metadata.tags || [],
    description: options.description ?? existing?.metadata.description ?? '',
    cover: options.cover ?? existing?.metadata.cover ?? '/images/blog-hero-anime.webp',
    feishu_document_id: document.document_id, feishu_source: sourceUrl, feishu_revision: document.revision_id };
  const serialize = () => `---\n${yaml.dump(metadata, { noRefs: true, lineWidth: -1 })}---\n\n${body}`;
  let text = serialize();
  const articleChanged = existing?.text !== text;
  const assetChanged = [...assets.values()].some((asset) => !fs.existsSync(asset.target) || !fs.readFileSync(asset.target).equals(asset.bytes));
  if (existing && (articleChanged || assetChanged)) { metadata.updated = now; text = serialize(); }
  // 所有素材和特殊块检查通过后，才更新公开文章与图片；失败不会覆盖旧文章。
  if (assets.size) fs.mkdirSync(path.join(root, assetDir), { recursive: true });
  for (const asset of assets.values()) fs.writeFileSync(asset.target, asset.bytes);
  fs.writeFileSync(path.join(root, postPath), text);
  console.log(`${existing ? '更新' : '新增'}：${postPath}\n素材：${assets.size} 个；飞书版本：${document.revision_id}`);
  const siteUrl = new URL(yaml.load(fs.readFileSync(path.join(root, '_config.yml'), 'utf8')).url);
  const articleUrl = new URL(`/blog/${slug}/`, siteUrl).href;
  if (options.publish && (articleChanged || assetChanged)) {
    run(process.execPath, [require.resolve('hexo/bin/hexo'), 'clean'], true);
    run(process.execPath, [require.resolve('hexo/bin/hexo'), 'generate'], true);
    run('git', ['add', '--', postPath, ...(assets.size ? [assetDir] : [])]);
    run('git', ['commit', '-m', `docs: sync Feishu article ${slug}`], true);
    run('git', ['push', '--atomic', 'origin', 'HEAD:refs/heads/main', 'HEAD:refs/heads/hexo-site'], true);
    console.log(`已推送，Vercel 将自动部署：${articleUrl}`);
  } else console.log(`${options.publish ? '内容未变化，无需重复发布' : '本地同步完成；检查预览后可提交发布'}：${articleUrl}`);
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(`同步失败：${error.message}`); process.exitCode = 1; }
}
module.exports = { parseOptions, validateUrl, validateSlug, transformMarkdown, readPost };
