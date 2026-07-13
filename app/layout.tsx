import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hyunkeo.vercel.app";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "현커거래소 - 모솔연애2 실시간 커플 차트 & 최종커플 픽",
    template: "%s | 현커거래소",
  },
  description:
    "모솔연애2(모태솔로지만 연애는 하고 싶어 시즌2) 커플 예측은 현커거래소에서! 실시간 커플 차트 보고 최애에게 하트 주고, 최종커플 픽을 락인하세요. 적중하면 당신의 카드가 성지가 됩니다.",
  keywords: [
    "모솔연애2",
    "모태솔로지만 연애는 하고 싶어",
    "모솔연애 시즌2",
    "모솔연애2 출연자",
    "모솔연애2 출연진",
    "모솔연애2 메기",
    "최종커플 예측",
    "현커",
    "커플 차트",
    "넷플릭스 연애 프로그램",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "현커거래소",
    title: "💘 내 최애 커플, 지금 몇 위? — 모솔연애2 실시간 차트",
    description:
      "당신의 최애 커플에게 투표하세요! 매일 하트 리셋, 최종커플 픽 락인. 적중하면 그 픽이 성지가 됩니다 🔮",
    type: "website",
    locale: "ko_KR",
    url: "/",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "현커거래소 실시간 커플 차트" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "💘 내 최애 커플, 지금 몇 위? — 모솔연애2 실시간 차트",
    description:
      "당신의 최애 커플에게 투표하세요! 매일 하트 리셋, 적중하면 그 픽이 성지가 됩니다 🔮",
    images: ["/api/og"],
  },
  robots: { index: true, follow: true },
  // 검색엔진 소유 확인 (환경변수에 인증 코드만 넣으면 됨)
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? {
          other: {
            "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION,
          },
        }
      : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF7F0",
};

// GEO(생성형 검색)/SEO 공용 구조화 데이터
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "현커거래소",
  url: SITE_URL,
  description:
    "넷플릭스 '모태솔로지만 연애는 하고 싶어 시즌2' 비공식 팬 서비스. 실시간 커플 차트와 최종커플 픽 락인, 성지 카드를 제공합니다.",
  inLanguage: "ko",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-board font-sans">
        {children}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                // 운영자 기기 제외: /?owner=1 로 한 번 접속하면 이 기기는 영구 집계 제외
                // (해제: /?owner=0)
                try {
                  var q = new URLSearchParams(location.search);
                  if (q.get('owner') === '1') localStorage.setItem('hyunkeo_owner', '1');
                  if (q.get('owner') === '0') localStorage.removeItem('hyunkeo_owner');
                  if (localStorage.getItem('hyunkeo_owner') === '1') {
                    window['ga-disable-${GA_ID}'] = true;
                  }
                } catch (e) {}
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
