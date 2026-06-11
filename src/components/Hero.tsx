const Hero = () => {
  return (
    <section className="editorial-section flex min-h-[80svh] flex-col justify-center pt-28 sm:pt-32">
      <p className="meta-label">Shanghai · 2026 · seeking backend / full-stack internship</p>
      <div className="mt-20 sm:mt-24">
        <h1 className="hero-title max-w-6xl">你好，我是 Chblue。</h1>
        <p className="mt-8 max-w-[600px] text-xl leading-[1.55] text-muted sm:text-2xl">
          正在找后端 / 全栈实习的全栈开发者，专注用 Web 和 AI 做能真正上线的产品。
          最近在关注 LLM 能力怎么变成稳定可用的产品功能。
        </p>
        <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 text-lg">
          <a href="#projects" className="editorial-link">→ 查看项目</a>
          <a href="mailto:wanglemao03@gmail.com" className="editorial-link">→ 写邮件</a>
          <a href="https://github.com/hxblue" target="_blank" rel="noopener noreferrer" className="editorial-link">
            → GitHub
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
