/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}", // <-- Add this line
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#093FB4", // Blue 600
        secondary: "#F59E0B", // Amber 500
        accent: "teal", // Emerald 500
        background: "#FFFCFB", // Yellow 200
        text: "#111827", // Gray 900
      },
    },
  },
  plugins: [],
};
