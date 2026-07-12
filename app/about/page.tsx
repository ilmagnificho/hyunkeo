import type { Metadata } from "next";
import Footer, { DISCLAIMER } from "@/components/Footer";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "소개 | 현커거래소",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-lg">
      <TopBar />
      <main className="px-4 pt-6">
        <h1 className="text-xl font-extrabold text-ink">현커거래소란? 💘</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          넷플릭스 &lsquo;모태솔로지만 연애는 하고 싶어 시즌2&rsquo; 시청자들이 최애
          커플에게 매일 하트를 보내고, 회차 공개 전에 최종커플 픽을
          &lsquo;락인&rsquo;해서 성지 인증 카드를 받는 팬 서비스입니다.
        </p>
        <p className="mt-2 text-sm font-semibold text-accent">
          &ldquo;당신의 팬심, 이제 차트로 증명하세요&rdquo;
        </p>

        <h2 className="mt-8 text-base font-bold text-ink">운영 원칙 3가지</h2>
        <ul className="mt-3 space-y-3">
          <li className="rounded-3xl bg-panel border border-line p-4 shadow-sm">
            <p className="text-sm font-bold text-ink">1. 사진 미사용</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              출연자 사진과 방송 캡처를 일절 사용하지 않습니다. 모든 출연자는
              도트 캐릭터로만 표현합니다.
            </p>
          </li>
          <li className="rounded-3xl bg-panel border border-line p-4 shadow-sm">
            <p className="text-sm font-bold text-ink">2. 실명 미표기</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              성(姓)을 표기하지 않고 팬 커뮤니티에서 통용되는 이름만 사용합니다.
              로그인과 개인정보 수집도 없습니다.
            </p>
          </li>
          <li className="rounded-3xl bg-panel border border-line p-4 shadow-sm">
            <p className="text-sm font-bold text-ink">3. 악플 무관용</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              한 줄 훈수는 금칙어 필터를 통과해야 등록되며, 신고 3회 누적 시
              자동으로 블라인드 처리됩니다. 자유게시판은 만들지 않습니다.
            </p>
          </li>
        </ul>

        <h2 className="mt-8 text-base font-bold text-ink">면책 안내</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">{DISCLAIMER}</p>
        <p className="mt-4 text-xs text-muted">문의: 준비 중입니다.</p>
      </main>
      <Footer />
    </div>
  );
}
