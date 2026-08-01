/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "hsl(150 14% 90%)",
        input: "hsl(150 14% 88%)",
        ring: "hsl(152 65% 22%)",
        background: "hsl(40 20% 99%)",
        foreground: "hsl(150 15% 8%)",
        primary: { DEFAULT: "hsl(152 65% 22%)", foreground: "hsl(0 0% 100%)" },
        secondary: { DEFAULT: "hsl(150 25% 94%)", foreground: "hsl(152 65% 16%)" },
        muted: { DEFAULT: "hsl(150 12% 96%)", foreground: "hsl(155 10% 44%)" },
        accent: { DEFAULT: "hsl(43 90% 46%)", foreground: "hsl(43 80% 10%)" },
        destructive: { DEFAULT: "hsl(0 84% 55%)", foreground: "hsl(0 0% 100%)" },
        card: { DEFAULT: "hsl(0 0% 100%)", foreground: "hsl(150 15% 8%)" },
      },
      borderRadius: {
        lg: "10px",
        md: "8px",
        sm: "6px",
      },
    },
  },
  plugins: [],
};
