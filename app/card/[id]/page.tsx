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
  let nickname = "";
  try {
    const { getServiceClient } = await import("@/lib/supabase");
    const { data } = await getServiceClient()
      .from("predictions")
      .select("nickname")
      .eq("id", id)
      .maybeSingle();
    nickname = data?.nickname ?? "";
  } catch {
    // 폴백
  }
  const who = nickname ? `${nickname}님` : "이 사람";
  return {
    title: "성지 카드 | 현커거래소",
    description: `${who}이 모솔연애2 최종커플을 락인했어요. 적중하면 이 카드는 성지가 됩니다.`,
    openGraph: {
      title: `🔮 ${who}의 최종커플 픽 — 적중하면 성지`,
      description: "누굴 골랐는지 확인하고, 나도 내 최애 커플 픽 락인하기 💘",
      images: [{ url: `/api/og?id=${id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `🔮 ${who}의 최종커플 픽 — 적중하면 성지`,
      images: [`/api/og?id=${id}`],
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
