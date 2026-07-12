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
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blinkDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        heartPop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.45) rotate(-8deg)" },
          "100%": { transform: "scale(1)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-28px)", opacity: "0" },
        },
      },
      animation: {
        "flash-up": "flashUp 0.6s ease-out",
        "flash-down": "flashDown 0.6s ease-out",
        marquee: "marquee 30s linear infinite",
        "blink-dot": "blinkDot 1.6s ease-in-out infinite",
        "heart-pop": "heartPop 0.35s ease-out",
        "float-up": "floatUp 0.9s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
