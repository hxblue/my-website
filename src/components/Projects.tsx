import { projects } from '../data/projects';

const Projects = () => {
  return (
    <section id="projects" className="editorial-section">
      <div className="editorial-rule pt-10">
        <p className="section-kicker">02 / SELECTED WORK</p>
        <h2 className="section-title mt-4">代表项目</h2>
        <p className="mt-4 max-w-[620px] text-muted">
          {projects.length} 个真正上线、能够访问和验证的项目。重点不是功能数量，而是如何把一个想法完整交付。
        </p>
        <div className="mt-12">
          {projects.map((project) => (
            <article
              key={project.id}
              className="grid gap-8 border-t border-line py-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12"
            >
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-preview block overflow-hidden border border-line bg-surface"
                aria-label={`在线体验：${project.name}`}
              >
                <img
                  src={project.image}
                  alt={project.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className={`${project.isWideImage ? 'aspect-[1380/444]' : 'aspect-[16/10]'} w-full object-cover object-top`}
                />
              </a>
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <p className="meta-label">{project.label}</p>
                  <span className="border border-line bg-soft px-2 py-0.5 font-mono text-xs text-muted">
                    {project.status}
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-3xl font-medium leading-tight">{project.name}</h3>
                <p className="mt-5 max-w-[720px] text-muted">{project.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="border border-line px-2.5 py-1 font-mono text-xs text-body">
                      {highlight}
                    </li>
                  ))}
                </ul>
                <p className="tech-inline mt-5">{project.techStack.join(' · ')}</p>
                <div className="mt-6 flex flex-wrap gap-5">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="editorial-link">
                    [view source]
                  </a>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="editorial-link">
                    [live demo]
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
