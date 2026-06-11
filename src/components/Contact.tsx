const contactLinks = [
  {
    label: 'GitHub',
    value: 'github.com/hxblue',
    href: 'https://github.com/hxblue',
  },
  {
    label: 'Email',
    value: 'wanglemao03@gmail.com',
    href: 'mailto:wanglemao03@gmail.com',
  },
  {
    label: 'Backup',
    value: 'wanglemao03@163.com',
    href: 'mailto:wanglemao03@163.com',
  },
];

const Contact = () => {
  return (
    <section id="contact" className="editorial-section">
      <div className="editorial-rule grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_480px] lg:items-end">
        <div>
          <p className="section-kicker">04 / CONTACT</p>
          <h2 className="section-title mt-4 max-w-3xl">如果你对我的项目感兴趣，欢迎联系我。</h2>
          <p className="mt-6 max-w-[680px] text-muted">
            我正在寻找后端 / 全栈实习机会，也愿意交流 Web、AI 应用和项目实践。
          </p>
        </div>
        <div className="border-y border-line font-mono text-sm">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="grid grid-cols-[88px_minmax(0,1fr)] border-b border-line py-4 last:border-b-0"
            >
              <span className="text-muted">{link.label}</span>
              <span className="editorial-link min-w-0 break-all">{link.value}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;
