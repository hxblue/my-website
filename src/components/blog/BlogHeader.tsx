import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

const links = [
  { label: '博客', to: '/blog' },
  { label: '分类', to: '/blog#categories' },
  { label: '标签', to: '/blog#tags' },
  { label: '关于', to: '/#about' },
];

export default function BlogHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 32);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  return (
    <header className={`blog-header ${isScrolled || isMenuOpen ? 'is-scrolled' : ''}`}>
      <div className="blog-header__inner">
        <Link to="/" className="blog-brand" aria-label="返回 Chblue 作品集首页">
          Chblue<span>/blog</span>
        </Link>

        <div className="blog-header__actions">
          <nav className="blog-nav" aria-label="博客导航">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="blog-nav__link">
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <button
            type="button"
            className="blog-menu-button"
            aria-expanded={isMenuOpen}
            aria-controls="blog-mobile-nav"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? '关闭' : '菜单'}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav id="blog-mobile-nav" className="blog-mobile-nav" aria-label="移动端博客导航">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="blog-mobile-nav__link"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
