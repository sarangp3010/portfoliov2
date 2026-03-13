import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--color-accent)',
        surface: {
          900: 'var(--surface-900)',
          950: 'var(--surface-950)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
