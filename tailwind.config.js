module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
    colors: {
      primary: "#FFDE2D",
      primaryDark: "#2366bf",
      white: "#ffffff",
      black: "#000000",
      transparent: "transparent",
    },
    fontFamily: {
      roboto: ["Roboto", "sans-serif"],
    },
    keyframes: {
      btnPulse: {
        "0%": {
          boxShadow: "0 0 0 0 rgba(255, 222, 45, 0.6)",
        },
        "70%": {
          boxShadow: "0 0 0 20px rgba(255, 222, 45, 0)",
        },
        "100%": {
          boxShadow: "0 0 0 0 rgba(255, 222, 45, 0)",
        },
      },
    },
  },
  plugins: [],
};
