import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-white/5 dark:bg-white/5 bg-gray-100 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200 border border-gray-200 dark:border-white/10 dark:border-transparent"
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`w-5 h-5 text-amber-500 absolute inset-0 transition-all duration-300 ${
            theme === 'dark' ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
          }`}
        />
        <Moon
          className={`w-5 h-5 text-purple-400 absolute inset-0 transition-all duration-300 ${
            theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-0'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
