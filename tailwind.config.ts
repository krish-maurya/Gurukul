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
          dark: "#0a0a0a",    // Near-black — primary text, active elements
          tech: "#171717",    // Dark gray — secondary surfaces, cards
          ocean: "#737373",   // Mid gray — muted text, borders, subtle accents
          gray: "#e5e5e5",    // Light gray — borders, dividers
          white: "#fafafa",   // Off-white — page background
          surface: "#ffffff", // Pure white — cards, modals, panels
          muted: "#a3a3a3",   // Muted gray — placeholder text, disabled
          accent: "#0a0a0a",   // Accent for interactive elements (same as dark for monochrome)
          highlight: "#f5f5f5", // Highlight background for hover states
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        floating: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
        modal: "0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "check-pop": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "70%": { opacity: "1", transform: "scale(1.1)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "dot-bounce": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { opacity: "0.8", transform: "scale(0.9)" },
          "100%": { opacity: "0", transform: "scale(1.3)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.25s ease-out",
        shimmer: "shimmer 1.8s infinite linear",
        "check-pop": "check-pop 0.5s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "dot-bounce": "dot-bounce 1.4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.2s 0.2s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
