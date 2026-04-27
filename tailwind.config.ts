import type { Config } from 'tailwindcss'

const config: Config = {
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
          navy: '#081c74',
          blue: '#1e69c4',
          cream: '#f8f5f2',
          white: '#ffffff',
          hover: '#f0ede9',
          border: '#e5e2de',
          'border-strong': '#d4d0cb',
          ink: '#202020',
          secondary: '#363636',
          muted: '#4a4a4a',
          faint: '#8a8682',
        },
      },
    },
  },
  plugins: [],
}

export default config
