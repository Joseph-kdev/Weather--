import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#111113",
        panel: "#d8d8d8"
      }
    }
  },
  plugins: []
} satisfies Config;
