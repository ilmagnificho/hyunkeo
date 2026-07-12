import type { Metadata } from "next";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import CastBook from "@/components/CastBook";
import { getServiceClient } from "@/lib/supabase";

// 출연자 이름을 DB에서 가져와 롱테일 검색("모솔연애2 재서" 등)에 대응
export async function generateMetadata(): Promise<Metadata> {
  let names = "";
  try {
    const sb = getServiceClient();
    const { data } = await sb.from("cast_members").select("name,gender");
    if (data && data.length > 0) {
      names = data.map((c) => c.name).join(", ");
    }
  } catch {
    // 폴백
  }
  const description = names
    ? `모솔연애2(모태솔로지만 연애는 하고 싶어 시즌2) 출연자 ${names} 총정리. 초기 멤버부터 메기까지 캐릭터별 관전 포인트와 현재 최고 케미 커플을 한눈에.`
    : "모솔연애2(모태솔로지만 연애는 하고 싶어 시즌2) 출연자 12인 총정리. 초기 멤버부터 메기까지, 캐릭터별 관전 포인트와 현재 최고 케미 커플을 한눈에.";
  return {
    title: "출연자 도감 - 모솔연애2 캐릭터 정리",
    description,
    alternates: { canonical: "/cast" },
    openGraph: {
      title: "모솔연애2 출연자 도감 | 현커거래소",
      description: "출연자 12인 캐릭터별 관전 포인트와 현재 최고 케미 커플 총정리",
    },
  };
}

export default function CastPage() {
  return (
    <div className="mx-auto max-w-lg">
      <TopBar />
      <main className="px-4 pt-4">
        <h1 className="text-xl font-extrabold text-ink">출연자 도감 👀</h1>
        <p className="mt-1 text-xs text-muted">
          캐릭터를 알면 차트가 더 재밌어져요. 도트 캐릭터는 사진 대신 쓰는
          현커거래소만의 표현이에요.
        </p>
        <CastBook />
      </main>
      <Footer />
    </div>
  );
}
