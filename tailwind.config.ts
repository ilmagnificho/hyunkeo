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
        board: "#FFF7F0",      // 웜 크림 배경
        panel: "#FFFFFF",      // 카드
        "panel-2": "#FFEFE8",  // 서브 카드 (피치)
        ink: "#43303B",        // 본문 (웜 다크)
        up: "#FF4D6D",         // 순위 상승 ▲
        down: "#7BA6E8",       // 순위 하락 ▼ (소프트 블루)
        accent: "#FF5C8A",     // 메인 핑크
        "accent-soft": "#FFE3EC",
        gold: "#F0A93B",
        lavender: "#B7A6FF",
        muted: "#A58E99",
        line: "#F6E3E9",       // 구분선
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
          "0%": { backgroundColor: "rgba(255, 92, 138, 0.16)" },
          "100%": { backgroundColor: "transparent" },
        },
        flashDown: {
          "0%": { backgroundColor: "rgba(123, 166, 232, 0.16)" },
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
