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
        // 37% (not 44%) — matches the web app's contrast fix; 44% measured ~4.46:1 on
        // this project's background, just under the 4.5:1 AA floor for normal text.
        muted: { DEFAULT: "hsl(150 12% 96%)", foreground: "hsl(155 10% 37%)" },
        accent: { DEFAULT: "hsl(43 90% 46%)", foreground: "hsl(43 80% 10%)" },
        // 48% (not 55%) — matches the web app's contrast fix; 55% only reached ~4.2:1
        // against white destructive-foreground text.
        destructive: { DEFAULT: "hsl(0 84% 48%)", foreground: "hsl(0 0% 100%)" },
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
