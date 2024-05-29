/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,scss}"],
  theme: {
    extend: {
      colors: {
        "tooltip-border": 'var(--tooltip-border)',
        editor: {
          DEFAULT: 'var(--editor)',
          foreground: 'var(--editor-foreground)',
          border: 'var(--editor-border)'
        },
        button: {
          DEFAULT: 'var(--button)',
          foreground: 'var(--button-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        tooltip: {
          DEFAULT: 'var(--tooltip)',
          foreground: 'var(--tooltip-foreground)'
        },
      },
    },
  },
  plugins: [],
}

