/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--on-primary) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        destructive: 'rgb(var(--destructive) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--surface-elevated) / <alpha-value>)',
        'surface-soft': 'rgb(var(--surface-soft) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
      },
      boxShadow: {
        window: '0 28px 80px -36px rgba(var(--shadow-strong), 0.72)',
        panel: '0 18px 44px -32px rgba(var(--shadow-strong), 0.55)',
        glow: '0 12px 30px -18px rgba(var(--accent), 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'fade-out': 'fadeOut 150ms ease-in',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-in',
        'pulse-soft': 'pulseSoft 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
