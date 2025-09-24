module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.145 0 0)',
        primary: 'oklch(0.205 0 0)',
        // ... match web globals.css oklch values for consistency
        border: 'oklch(0.922 0 0)',
        input: 'oklch(0.922 0 0)',
        ring: 'oklch(0.708 0 0)',
        // Dark mode
        dark: {
          background: 'oklch(0.145 0 0)',
          foreground: 'oklch(0.985 0 0)',
        }
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      }
    },
  },
  plugins: [],
};