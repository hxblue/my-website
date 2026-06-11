/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: '#0a0a0a',
        light: '#fafafa',
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        body: 'var(--color-body)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        soft: 'var(--color-soft)',
        accent: 'var(--color-accent)',
        action: 'var(--color-action)',
        'action-text': 'var(--color-action-text)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
