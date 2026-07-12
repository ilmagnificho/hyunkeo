import type { Metadata } from "next";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import CoupleDetail from "@/components/CoupleDetail";
import { getServiceClient } from "@/lib/supabase";

// 롱테일 SEO: "재서 수지" 같은 커플명 검색을 커플 페이지로 유입
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const sb = getServiceClient();
    const { data: couple } = await sb
      .from("couples")
      .select("m_id,f_id")
      .eq("id", id)
      .maybeSingle();
    if (couple) {
      const { data: cast } = await sb
        .from("cast_members")
        .select("id,name")
        .in("id", [couple.m_id, couple.f_id]);
      const name = new Map((cast ?? []).map((c) => [c.id, c.name]));
      const m = name.get(couple.m_id);
      const f = name.get(couple.f_id);
      if (m && f) {
        return {
          title: `${m}♥${f} 실시간 케미 온도·하트 순위`,
          description: `${m}♥${f}, 이 케미 진짜일까? 실시간 케미 온도 확인하고 하트로 투표하세요 💘 한 줄 훈수는 덤.`,
          alternates: { canonical: `/couple/${id}` },
          openGraph: {
            title: `${m}♥${f} 실시간 케미 차트 | 현커거래소`,
            description: `${m}♥${f} 케미 온도, 지금 몇 도게? 🌡️ 하트 주고 확인하기`,
          },
        };
      }
    }
  } catch {
    // 폴백
  }
  return { title: "커플 상세 | 현커거래소" };
}

export default async function CouplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-lg">
      <TopBar />
      <main className="px-4 pt-4">
        <CoupleDetail coupleId={id} />
      </main>
      <Footer />
    </div>
  );
}
