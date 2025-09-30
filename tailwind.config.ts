import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          secondary: "hsl(var(--background-secondary))",
          tertiary: "hsl(var(--background-tertiary))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          secondary: "hsl(var(--foreground-secondary))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          soft: "hsl(var(--primary-soft))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          glow: "hsl(var(--secondary-glow))",
          soft: "hsl(var(--secondary-soft))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          glow: "hsl(var(--accent-glow))",
          soft: "hsl(var(--accent-soft))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
          glow: "hsl(var(--gold-glow))",
          soft: "hsl(var(--gold-soft))",
        },
        mood: {
          chill: "hsl(var(--mood-chill))",
          melancholy: "hsl(var(--mood-melancholy))",
          workout: "hsl(var(--mood-workout))",
          focus: "hsl(var(--mood-focus))",
          love: "hsl(var(--mood-love))",
          party: "hsl(var(--mood-party))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          glass: "hsl(var(--card-glass))",
          hover: "hsl(var(--card-hover))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          glow: "hsl(var(--border-glow))",
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-cosmic': 'var(--gradient-cosmic)',
        'gradient-hero': 'var(--gradient-hero)',
      },
      boxShadow: {
        'primary': 'var(--shadow-primary)',
        'secondary': 'var(--shadow-secondary)',
        'accent': 'var(--shadow-accent)',
        'gold': 'var(--shadow-gold)',
        'intense': 'var(--shadow-intense)',
        'neon': 'var(--shadow-neon)',
        'soft': 'var(--shadow-soft)',
      },
      fontFamily: {
        'japanese': ['Noto Sans JP', 'sans-serif'],
        'calligraphy': ['Dancing Script', 'cursive'],
        'elegant': ['Crimson Text', 'serif'],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
