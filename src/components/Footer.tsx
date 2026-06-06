const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-gray-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© {currentYear} Chenblue. Built through learning and iteration.</p>
        <p>React · TypeScript · Tailwind CSS · Vercel</p>
      </div>
    </footer>
  );
};

export default Footer;
