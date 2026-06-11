import { skillGroups } from '../data/skills';

const capabilityMeta = [
  ['主攻方向', 'Java 后端开发'],
  ['持续关注', 'AI 应用落地'],
  ['前端定位', '支持项目完整呈现'],
  ['工程实践', '部署、迭代与复盘'],
];

const About = () => {
  return (
    <section id="about" className="editorial-section">
      <div className="editorial-rule pt-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="section-kicker">01 / CAPABILITIES</p>
            <h2 className="section-title mt-4 max-w-[560px]">技术方向与能力</h2>
            <p className="mt-7 max-w-[560px] text-muted">
              我目前主攻 Java 后端开发，也在学习如何把大模型能力接入实际项目。前端部分主要借助
              AI 编程工具完成页面实现，对 React、Vue 等框架有初步了解，目标是能够独立完成从后端逻辑到上线交付的完整项目。
            </p>

            <dl className="mt-10 grid grid-cols-2 border-t border-line">
              {capabilityMeta.map(([label, value]) => (
                <div key={label} className="border-b border-line py-5 pr-4">
                  <dt className="meta-label">{label}</dt>
                  <dd className="mt-2 text-sm font-semibold text-ink sm:text-base">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 四组能力同时展示当前技术方向与真实学习边界。 */}
          <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {skillGroups.map((group, index) => (
              <article key={group.title} className="bg-canvas p-6 sm:p-8">
                <p className="section-kicker">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-6 font-serif text-2xl font-medium leading-tight">{group.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">{group.description}</p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="border border-line bg-soft px-2.5 py-1.5 font-mono text-xs text-body"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
