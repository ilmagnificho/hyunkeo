import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "현커거래소 - 모솔연애2 커플 시세판 & 최종커플 예측",
  description:
    "모솔연애2 커플 예측은 현커거래소에서! 커플 지지율 시세판 확인하고 최종커플 예측을 락인하세요. 적중하면 당신의 카드가 성지가 됩니다.",
  keywords: ["모솔연애2", "커플 예측", "현커", "최종커플", "모태솔로지만 연애는 하고 싶어"],
  openGraph: {
    title: "현커거래소 - 모솔연애2 커플 시세판 & 최종커플 예측",
    description: "당신의 훈수, 이제 시세로 증명하세요",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F1522",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-board font-sans">{children}</body>
    </html>
  );
}
