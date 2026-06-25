/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../frontends/commons/**/*.{js,ts,jsx,tsx}",
    "../../**/*.{js,ts,jsx,tsx}",
    "../**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
    "./../../apps/front/commons/src/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {},
  },

  plugins: [],
};
