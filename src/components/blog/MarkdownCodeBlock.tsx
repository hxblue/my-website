import { useState, type ReactNode } from 'react';
import type {} from 'react-syntax-highlighter';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import { useTheme } from '../../hooks/useTheme';

// Light 入口只注册博客常用语言，避免把 Prism 的全部语言打进文章页分块。
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown);
SyntaxHighlighter.registerLanguage('powershell', powershell);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);

interface MarkdownCodeBlockProps {
  className?: string;
  children: ReactNode;
}

export default function MarkdownCodeBlock({ className, children }: MarkdownCodeBlockProps) {
  const { theme } = useTheme();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const languageMatch = /language-([\w-]+)/.exec(className ?? '');
  const content = String(children).replace(/\n$/, '');
  const isBlock = Boolean(languageMatch) || content.includes('\n');

  if (!isBlock) return <code className={className}>{children}</code>;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
    window.setTimeout(() => setCopyStatus('idle'), 2200);
  };

  const language = languageMatch?.[1] ?? 'text';

  return (
    <div className="markdown-code-block">
      <div className="markdown-code-block__toolbar">
        <span>{language.toUpperCase()}</span>
        <button type="button" onClick={copyCode}>
          {copyStatus === 'success' ? '已复制' : copyStatus === 'error' ? '复制失败，请手动复制' : '复制'}
        </button>
      </div>
      <div aria-live="polite" className="sr-only">
        {copyStatus === 'success' ? '代码已复制' : copyStatus === 'error' ? '代码复制失败' : ''}
      </div>
      <SyntaxHighlighter
        style={theme === 'dark' ? oneDark : oneLight}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, background: 'transparent' }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}
