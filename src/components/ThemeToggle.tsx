import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? '切换到白天模式' : '切换到黑夜模式';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
    </button>
  );
};

export default ThemeToggle;
