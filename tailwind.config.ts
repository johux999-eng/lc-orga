import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'media',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Avenir Next',
          'Avenir',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'system-ui',
          'sans-serif',
        ],
        avenir: [
          'Avenir Next',
          'Avenir',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'system-ui',
          'sans-serif',
        ],
        didot: [
          'Didot',
          'var(--font-playfair)',
          '"GFS Didot"',
          '"Bodoni MT"',
          'Georgia',
          'serif',
        ],
      },
      colors: {
        lc: {
          navy:           'rgb(var(--lc-navy) / <alpha-value>)',
          blue:           'rgb(var(--lc-blue) / <alpha-value>)',
          cream:          'rgb(var(--lc-cream) / <alpha-value>)',
          surface:        'rgb(var(--lc-surface) / <alpha-value>)',
          hover:          'rgb(var(--lc-hover) / <alpha-value>)',
          border:         'rgb(var(--lc-border) / <alpha-value>)',
          'border-strong':'rgb(var(--lc-border-strong) / <alpha-value>)',
          ink:            'rgb(var(--lc-ink) / <alpha-value>)',
          secondary:      'rgb(var(--lc-secondary) / <alpha-value>)',
          muted:          'rgb(var(--lc-muted) / <alpha-value>)',
          faint:          'rgb(var(--lc-faint) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}

export default config
