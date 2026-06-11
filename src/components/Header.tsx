import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: '能力', href: '/#about', isAnchor: true },
    { name: '项目', href: '/#projects', isAnchor: true },
    { name: '博客', href: '/blog', isAnchor: false },
    { name: '联系', href: '/#contact', isAnchor: true },
  ];

  const handleNavClick = (href: string, isAnchor: boolean) => {
    setIsMobileMenuOpen(false);

    if (isAnchor && isHomePage) {
      const element = document.querySelector(href.replace('/', ''));
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-canvas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="font-serif text-xl font-semibold text-ink">
            Chblue
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => handleNavClick(link.href, link.isAnchor)}
                  className="nav-link"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <ThemeToggle />

            <button
              type="button"
              className="font-mono text-sm text-ink md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="切换导航菜单"
            >
              {isMobileMenuOpen ? 'CLOSE' : 'MENU'}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-line py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="nav-link"
                  onClick={() => handleNavClick(link.href, link.isAnchor)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
