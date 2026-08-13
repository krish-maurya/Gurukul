import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gurukul: {
          dark: "#071116",      // Primary dark surface / sidebar / high-contrast text
          tech: "#3251EB",      // Primary accent — main buttons, active states, links
          ocean: "#508FFF",     // Secondary accent — hover states, highlights, charts
          gray: "#DCDDDD",      // Neutral backgrounds, dividers, disabled states
          white: "#FFFFFF",     // Base surface / cards
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(7, 17, 22, 0.05), 0 1px 2px 0 rgba(7, 17, 22, 0.03)",
        card: "0 4px 6px -1px rgba(7, 17, 22, 0.04), 0 2px 4px -1px rgba(7, 17, 22, 0.02)",
        floating: "0 10px 25px -5px rgba(7, 17, 22, 0.1), 0 8px 10px -6px rgba(7, 17, 22, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
