import type { Metadata } from "next";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import SajiCard from "@/components/SajiCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "성지 카드 | 현커거래소",
    description: "모솔연애2 최종커플 예측 락인 카드. 적중하면 이 카드는 성지가 됩니다.",
    openGraph: {
      title: "최종커플 예측 락인 완료 🔒 | 현커거래소",
      description: "종영 후 적중 시 이 카드는 성지가 됩니다.",
      images: [{ url: `/api/og?id=${id}`, width: 1200, height: 630 }],
    },
  };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-lg">
      <TopBar />
      <main className="px-4 pt-4">
        <SajiCard predictionId={id} />
      </main>
      <Footer />
    </div>
  );
}
