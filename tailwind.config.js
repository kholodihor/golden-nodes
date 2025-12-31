/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Golden color palette
        golden: "#d0af51",
        lightgray: "#a4a2a2",
        darkgray: "#505050",
        dark: "#181818",
        black: "#000000",
        red: "#ba0f30",
      },
      // Override primary colors with golden theme
      primary: {
        DEFAULT: "#d0af51",
        foreground: "#000000",
      },
      accent: {
        DEFAULT: "#d0af51",
        foreground: "#000000",
      },
      ring: "#d0af51",
      border: "#505050",
      input: "#505050",
      background: "#181818",
      foreground: "#a4a2a2",
      card: "#505050",
      "card-foreground": "#a4a2a2",
      popover: "#505050",
      "popover-foreground": "#a4a2a2",
      muted: "#505050",
      "muted-foreground": "#a4a2a2",
      destructive: "#ba0f30",
      "destructive-foreground": "#a4a2a2",
    },
  },
  plugins: [],
};
