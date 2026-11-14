'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseOptions, validateUrl, validateSlug, transformMarkdown } = require('./sync-feishu.cjs');

test('文档 URL 去掉分享跟踪参数，拒绝伪造域名和其他路径', () => {
  assert.equal(validateUrl('https://example.feishu.cn/wiki/Abc123?from=copy'), 'https://example.feishu.cn/wiki/Abc123');
  for (const url of ['https://feishu.cn.evil.example/wiki/Abc', 'http://example.feishu.cn/wiki/Abc', 'https://example.feishu.cn/other/Abc']) assert.throws(() => validateUrl(url));
  for (const slug of ['../secret', 'a/b', '--bad']) assert.throws(() => validateSlug(slug));
});

test('参数不经过 shell，支持重复标签并拒绝缺失值', () => {
  const options = parseOptions(['--publish', 'https://example.feishu.cn/docx/Abc', '--tag', 'Agent', '--tag', '源码']);
  assert.equal(options.publish, true);
  assert.deepEqual(options.tags, ['Agent', '源码']);
  assert.throws(() => parseOptions(['--slug', '--publish']));
});

test('画板替换为本地图片，代码围栏内的示例保留，提示块转引用', () => {
  const calls = [];
  const input = '<title>阅读笔记</title>\n<callout emoji="💡">先读主链</callout>\n\n<whiteboard token="Board123"></whiteboard>\n\n```Plain Text\n<whiteboard token="Example"></whiteboard>\n```';
  const result = transformMarkdown(input, (token, kind) => { calls.push([token, kind]); return '/images/diagram.png'; });
  assert.equal(result.title, '阅读笔记');
  assert.match(result.body, /!\[文档图示\]\(\/images\/diagram\.png\)/);
  assert.match(result.body, /> 先读主链/);
  assert.match(result.body, /```text\n<whiteboard token="Example"><\/whiteboard>\n```/);
  assert.deepEqual(calls, [['Board123', 'whiteboard']]);
});

test('普通图片、附件与表格保持语义，代码和链接不被改写', () => {
  const input = '<title>表格</title>\n| A | B |\n| - | - |\n| x | y |\n\n<img token="Img123" alt="示意图"/>\n<source token="File123" name="说明.pdf"/>\n[源码](https://github.com/example/repo)';
  const result = transformMarkdown(input, (_, kind) => kind === 'source' ? '/files/a.pdf' : '/images/a.png');
  assert.match(result.body, /\| x \| y \|/);
  assert.match(result.body, /!\[示意图\]\(\/images\/a\.png\)/);
  assert.match(result.body, /\[说明\.pdf\]\(\/files\/a\.pdf\)/);
  assert.match(result.body, /https:\/\/github\.com\/example\/repo/);
});

test('中文提示语的加粗能正常渲染，代码示例中的星号保持不变', () => {
  const input = '<title>中文格式</title>\n**阅读目标：**沿主链阅读。\n\n```text\n**阅读目标：**代码示例\n```';
  const { body } = transformMarkdown(input, () => '/img.png');
  assert.match(body, /\*\*阅读目标\*\*：沿主链阅读/);
  assert.match(body, /```text\n\*\*阅读目标：\*\*代码示例\n```/);
});

test('未转换的资源、失效风险链接与缺失标题阻止发布', () => {
  for (const body of ['<sheet token="Sheet123"/>', '<img url="https://example.feishu.cn/a.png"/>', '![图](https://example.feishu.cn/space/api/box/stream/download/asynccode/?code=abc)']) {
    assert.throws(() => transformMarkdown(`<title>文章</title>\n${body}`, () => '/img.png'));
  }
  assert.throws(() => transformMarkdown('没有标题的内容', () => '/img.png'));
});
