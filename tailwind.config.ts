import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        destructive: 'var(--destructive)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        brand: {
          DEFAULT: '#1f5d50',
          600: '#256e5f',
          700: '#1c5a4f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}

export default config
