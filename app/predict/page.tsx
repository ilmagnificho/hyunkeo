import type { Metadata } from "next";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import PredictFlow from "@/components/PredictFlow";

export const metadata: Metadata = {
  title: "최종커플 예측 락인 | 현커거래소",
  description: "모솔연애2 최종커플을 예측하고 락인하세요. 적중하면 성지가 됩니다.",
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
