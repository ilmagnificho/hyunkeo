import type { Metadata } from "next";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import PredictFlow from "@/components/PredictFlow";

export const metadata: Metadata = {
  title: "최종커플 픽 락인 | 현커거래소",
  description:
    "모솔연애2 최종커플, 누가 이어질까? 마감 전에 픽을 락인하세요. 적중하면 그 타임스탬프가 성지가 됩니다 🔮",
  alternates: { canonical: "/predict" },
  openGraph: {
    title: "🔮 최종커플 픽, 마감 전에 락인하세요!",
    description: "이른 라운드 적중일수록 높은 점수. 지금이 제일 쌉니다 💘",
  },
};

export default function PredictPage() {
  return (
    <div className="mx-auto max-w-lg">
      <TopBar />
      <main className="px-4 pt-4">
        <PredictFlow />
      </main>
      <Footer />
    </div>
  );
}
