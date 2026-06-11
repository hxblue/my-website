const Availability = () => {
  return (
    <section className="editorial-section pt-0" aria-label="availability">
      <p className="mb-4 text-sm text-muted">
        // 投递简历 / 约面试之前，可以先看这个
      </p>
      <pre className="availability-code overflow-x-auto bg-[#1A1A1A] p-6 text-sm leading-7 text-[#FAFAF7] sm:p-8 sm:text-base">
        <code>
          <span className="text-[#FAFAF7]">{'{'}</span>{'\n'}
          {'  '}<span className="text-[#C3A6FF]">"name"</span>: <span className="text-[#FFB18F]">"Chblue"</span>,{'\n'}
          {'  '}<span className="text-[#C3A6FF]">"role"</span>: <span className="text-[#FFB18F]">"Full-stack developer (intern)"</span>,{'\n'}
          {'  '}<span className="text-[#C3A6FF]">"available"</span>: <span className="text-[#FFB18F]">"2026 年 7 月起，全职实习"</span>,{'\n'}
          {'  '}<span className="text-[#C3A6FF]">"location"</span>: <span className="text-[#FFB18F]">"广州 / 上海 / 杭州"</span>,{'\n'}
          {'  '}<span className="text-[#C3A6FF]">"关注方向"</span>: [<span className="text-[#FFB18F]">"AI 应用"</span>, <span className="text-[#FFB18F]">"后端开发"</span>, <span className="text-[#FFB18F]">"产品体验"</span>],{'\n'}
          {'  '}<span className="text-[#C3A6FF]">"求职方向"</span>: [<span className="text-[#FFB18F]">"后端实习"</span>, <span className="text-[#FFB18F]">"全栈实习"</span>, <span className="text-[#FFB18F]">"AI 应用相关岗位"</span>]{'\n'}
          <span className="text-[#FAFAF7]">{'}'}</span>
        </code>
      </pre>
    </section>
  );
};

export default Availability;
