import { useState } from 'react';
import type { BlogProfile } from '../../types/blog';

interface BlogHeroProps {
  profile: BlogProfile;
  contentTargetId: string;
}

const isExternal = (href: string) => /^https?:\/\//.test(href);

export default function BlogHero({ profile, contentTargetId }: BlogHeroProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [primaryName, ...remainingName] = profile.name.split(' ');

  const scrollToContent = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(contentTargetId)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="blog-hero" aria-labelledby="blog-hero-title">
      {!imageFailed && (
        <img
          src={profile.heroImage}
          alt=""
          className="blog-hero__image"
          fetchPriority="high"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="blog-hero__overlay" />
      <div className="blog-hero__content">
        <p className="blog-eyebrow">WRITING · BUILDING · LEARNING</p>
        <h1 id="blog-hero-title">
          <span>{primaryName}</span>
          {remainingName.length > 0 && <span>{remainingName.join(' ')}</span>}
        </h1>
        <p>{profile.description}</p>
        <div className="blog-hero__socials" aria-label="社交链接">
          {profile.socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={isExternal(link.href) ? '_blank' : undefined}
              rel={isExternal(link.href) ? 'noopener noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <button type="button" className="blog-scroll-cue" onClick={scrollToContent}>
        <span>浏览文章</span>
        <span aria-hidden="true">↓</span>
      </button>
    </section>
  );
}
