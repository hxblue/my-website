/* 作品集首页、项目页、文章列表数据与评论配置的生成脚本（Hexo 启动时自动加载 scripts/ 目录）。 */
'use strict';

const fs = require('fs');
const path = require('path');

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const isExternal = (href) => /^https?:\/\//.test(href);
const linkAttrs = (href) => (isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : '');

function renderProjects(projects, urlFor) {
  return projects
    .map(
      (p) => `
    <article class="cb-project">
      <a class="cb-project__preview" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="在线体验：${esc(p.name)}">
        <img src="${esc(urlFor(p.image))}" alt="${esc(p.imageAlt)}" loading="lazy" decoding="async" class="${p.isWideImage ? 'is-wide' : ''}">
      </a>
      <div class="cb-project__body">
        <div class="cb-project__meta">
          <span class="cb-label">${esc(p.label)}</span>
          <span class="cb-chip cb-chip--soft">${esc(p.status)}</span>
        </div>
        <h3 class="cb-project__title">${esc(p.name)}</h3>
        <p class="cb-muted">${esc(p.description)}</p>
        <ul class="cb-chips">${(p.highlights || []).map((h) => `<li class="cb-chip">${esc(h)}</li>`).join('')}</ul>
        <p class="cb-tech">${(p.techStack || []).map(esc).join(' · ')}</p>
        <div class="cb-links">
          <a class="cb-link" href="${esc(p.githubUrl)}" target="_blank" rel="noopener noreferrer">[view source]</a>
          <a class="cb-link" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer">[live demo]</a>
        </div>
      </div>
    </article>`,
    )
    .join('');
}

function renderProjectsSection(data, urlFor) {
  const s = data.profile.projects_section;
  return `
  <section id="projects" class="cb-section">
    <p class="cb-kicker">${esc(s.kicker)}</p>
    <h2 class="cb-section__title">${esc(s.title)}</h2>
    <p class="cb-muted cb-lead">${data.projects.length} ${esc(s.intro)}</p>
    <div class="cb-projects">${renderProjects(data.projects, urlFor)}</div>
  </section>`;
}

function renderAvailability(av) {
  const val = (v) =>
    Array.isArray(v)
      ? `[${v.map((x) => `<span class="cb-json-str">"${esc(x)}"</span>`).join(', ')}]`
      : `<span class="cb-json-str">"${esc(v)}"</span>`;
  const lines = av.fields
    .map((f, i) => `  <span class="cb-json-key">"${esc(f.key)}"</span>: ${val(f.value)}${i < av.fields.length - 1 ? ',' : ''}`)
    .join('\n');
  return `
  <section class="cb-section cb-section--tight" aria-label="availability">
    <p class="cb-note">${esc(av.note)}</p>
    <pre class="cb-availability"><code>{\n${lines}\n}</code></pre>
  </section>`;
}

function renderHome(ctx) {
  const data = ctx.site.data;
  const urlFor = ctx.url_for.bind(ctx);
  const p = data.profile;

  const posts = ctx.site.posts.sort('date', -1).toArray();
  const latest = posts.slice(0, 4);
  const latestHtml = latest
    .map((post) => {
      const tag = post.tags && post.tags.length ? post.tags.data[0].name : '笔记';
      return `
      <article class="cb-post">
        <p class="cb-mono cb-muted">${post.date.format('YYYY 年 M 月 D 日')} · ${esc(tag)}</p>
        <h3 class="cb-post__title"><a href="${urlFor(post.path)}">${esc(post.title)}</a></h3>
        <p class="cb-muted">${esc(post.description || '')}</p>
        <a class="cb-link" href="${urlFor(post.path)}">→ 阅读</a>
      </article>`;
    })
    .join('');

  const skills = data.skills
    .map(
      (g, i) => `
      <article class="cb-skill">
        <p class="cb-kicker">${String(i + 1).padStart(2, '0')}</p>
        <h3 class="cb-skill__title">${esc(g.title)}</h3>
        <p class="cb-muted cb-small">${esc(g.description)}</p>
        <ul class="cb-chips">${g.skills.map((s) => `<li class="cb-chip cb-chip--soft">${esc(s)}</li>`).join('')}</ul>
      </article>`,
    )
    .join('');

  return `
<div class="cb-home">
  <section class="cb-hero">
    <p class="cb-label">${esc(p.hero.meta)}</p>
    <h1 class="cb-hero__title">${esc(p.hero.title)}</h1>
    <p class="cb-hero__intro">${esc(p.hero.intro)}</p>
    <div class="cb-links cb-links--lg">
      ${p.hero.links.map((l) => `<a class="cb-link" href="${esc(l.href)}"${linkAttrs(l.href)}>${esc(l.text)}</a>`).join('')}
    </div>
  </section>

  ${renderAvailability(p.availability)}

  <section id="about" class="cb-section">
    <div class="cb-about">
      <div class="cb-about__intro">
        <p class="cb-kicker">${esc(p.about.kicker)}</p>
        <h2 class="cb-section__title">${esc(p.about.title)}</h2>
        <p class="cb-muted cb-lead">${esc(p.about.intro)}</p>
        <dl class="cb-meta-grid">
          ${p.about.meta.map(([k, v]) => `<div><dt class="cb-label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>
      </div>
      <div class="cb-skills">${skills}</div>
    </div>
  </section>

  ${renderProjectsSection(data, urlFor)}

  <section id="latest" class="cb-section">
    <p class="cb-kicker">${esc(p.latest_section.kicker)}</p>
    <h2 class="cb-section__title">${esc(p.latest_section.title)}</h2>
    <p class="cb-muted">${esc(p.latest_section.intro)}</p>
    <div class="cb-posts">${latestHtml}</div>
    <a class="cb-link cb-more" href="${urlFor('/blog/')}">→ 浏览全部文章（${posts.length}）</a>
  </section>

  <section id="contact" class="cb-section">
    <div class="cb-contact">
      <div>
        <p class="cb-kicker">${esc(p.contact.kicker)}</p>
        <h2 class="cb-section__title">${esc(p.contact.title)}</h2>
        <p class="cb-muted cb-lead">${esc(p.contact.intro)}</p>
      </div>
      <div class="cb-contact__list">
        ${p.contact.links
          .map(
            (l) => `<a href="${esc(l.href)}"${linkAttrs(l.href)}><span class="cb-muted">${esc(l.label)}</span><span class="cb-link">${esc(l.value)}</span></a>`,
          )
          .join('')}
      </div>
    </div>
  </section>
</div>`;
}

// 页面中写 {% chblue_home %} / {% chblue_projects %} 即可渲染
hexo.extend.tag.register('chblue_home', function () {
  return renderHome(hexoCtx());
});
hexo.extend.tag.register('chblue_projects', function () {
  const ctx = hexoCtx();
  return `<div class="cb-home">${renderProjectsSection(ctx.site.data, ctx.url_for.bind(ctx))}</div>`;
});

function hexoCtx() {
  const locals = hexo.locals;
  return {
    site: { data: locals.get('data'), posts: locals.get('posts') },
    url_for: hexo.extend.helper.get('url_for').bind(hexo),
  };
}

// 评论区配置：只输出 Supabase 的匿名公钥（本来就会出现在浏览器里，依赖数据库 RLS 保护）
function readEnv() {
  const env = { ...process.env };
  const file = path.join(hexo.base_dir, '.env');
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

hexo.extend.generator.register('chblue_comment_config', function () {
  const env = readEnv();
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL || '';
  const key = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !key) hexo.log.warn('[chblue] 未配置 SUPABASE_URL / SUPABASE_ANON_KEY，文章评论区将显示为不可用');
  return {
    path: 'js/comment-config.js',
    data: `window.CHBLUE_COMMENTS=${JSON.stringify({ url, anonKey: key })};`,
  };
});
