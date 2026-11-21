import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

// theme.extend copied verbatim from the prototype's inline tailwind.config
const config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            primary: "#161427",
            "on-primary": "#ffffff",
            "primary-container": "#241f3d",
            "on-primary-container": "#e6deff",
            secondary: "#5f3add",
            "on-secondary": "#ffffff",
            "secondary-container": "#ede8ff",
            "on-secondary-container": "#35159b",
            "secondary-fixed": "#ede8fc",
            "on-secondary-fixed": "#35159b",
            "on-secondary-fixed-variant": "#5f3add",
            surface: "#faf9fe",
            "on-surface": "#161427",
            "surface-container-lowest": "#ffffff",
            "surface-container-low": "#f4f3f8",
            "surface-container": "#eeedf2",
            "surface-container-high": "#e8e7ec",
            "surface-container-highest": "#e3e2e7",
            "on-surface-variant": "#5f5c72",
            "outline": "#78767d",
            "outline-variant": "#e2dfec",
            "error": "#dc2626",
            "error-container": "#fee2e2",
            "on-error": "#ffffff",
            brand: {
              DEFAULT: "#5b46e8",
              hover: "#4f3bd4",
              light: "#ede8fc",
              surface: "#f0ecfc",
              dark: "#161427"
            }
          },
          borderRadius: {
            "DEFAULT": "0.75rem",
            "lg": "1.25rem",
            "xl": "1.75rem",
            "2xl": "2rem",
            "3xl": "2.5rem",
            "full": "9999px"
          },
          fontFamily: {
            sans: ["'Plus Jakarta Sans'", "sans-serif"],
            serif: ["'Playfair Display'", "serif"],
            mono: ["'JetBrains Mono'", "monospace"]
          }
        }
      }
    } satisfies Config;

export default {
  ...config,
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  plugins: [forms, containerQueries],
} satisfies Config;
