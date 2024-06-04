/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,scss,tsx}"],
  theme: {
    extend: {
      colors: {
        "tooltip-border": 'var(--tooltip-border)',
        "activity-bar": {
          DEFAULT: 'var(--vscode-activityBar-background)',
          foreground: 'var(--vscode-activityBar-foreground)',
          "inactive-foreground": 'var(--vscode-activityBar-inactiveForeground)',
          "active-border": 'var(--vscode-activityBar-activeBorder)',
          "drop-border": 'var(--vscode-activityBar-dropBorder)',
        },
        editor: {
          DEFAULT: 'var(--editor)',
          foreground: 'var(--editor-foreground)',
          border: 'var(--editor-border)'
        },
        "side-bar": {
          DEFAULT: 'var(--vscode-sideBar-background)',
          "title-background": 'var(--vscode-sideBarTitle-background)',
          "title-foreground": 'var(--vscode-sideBarTitle-foreground)',
        },
        "side-bar-title": {
          DEFAULT: 'var(--vscode-sideBarTitle-background)',
          foreground: 'var(--vscode-sideBarTitle-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        button: {
          DEFAULT: 'var(--button)',
          foreground: 'var(--button-foreground)'
        },
        "button-secondary": {
          DEFAULT: 'var(--button-secondary)',
          foreground: 'var(--button-secondary-foreground)'
        },
        tooltip: {
          DEFAULT: 'var(--tooltip)',
          foreground: 'var(--tooltip-foreground)'
        },
      },
    },
  },
  plugins: [],
};

