import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        board: "#0F1522",
        panel: "#161E30",
        "panel-2": "#1C2640",
        up: "#F04452",
        down: "#3182F6",
        accent: "#FF5C7A",
        muted: "#8B93A7",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      keyframes: {
        flashUp: {
          "0%": { backgroundColor: "rgba(240, 68, 82, 0.22)" },
          "100%": { backgroundColor: "transparent" },
        },
        flashDown: {
          "0%": { backgroundColor: "rgba(49, 130, 246, 0.22)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        "flash-up": "flashUp 0.6s ease-out",
        "flash-down": "flashDown 0.6s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
