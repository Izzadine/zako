import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zako: {
          red: "#E63946",   // accent prix / CTA
          dark: "#1D3557",  // header
          wa: "#25D366",    // WhatsApp
        },
      },
    },
  },
  plugins: [],
};

export default config;
