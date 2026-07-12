import type { Metadata } from "next";
import Footer, { DISCLAIMER } from "@/components/Footer";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "소개·자주 묻는 질문",
  description:
    "현커거래소는 모솔연애2 비공식 팬 서비스입니다. 실시간 커플 차트, 최종커플 픽 락인, 성지 카드의 작동 방식과 운영 원칙을 안내합니다.",
  alternates: { canonical: "/about" },
};

// GEO(생성형 검색) 대응: FAQ 구조화 데이터
const FAQ = [
  {
    q: "현커거래소는 어떤 서비스인가요?",
    a: "넷플릭스 '모태솔로지만 연애는 하고 싶어 시즌2' 시청자들이 커플에게 매일 하트를 보내 실시간 커플 차트를 만들고, 회차 공개 전에 최종커플 픽을 락인하는 비공식 팬 서비스입니다.",
  },
  {
    q: "넷플릭스 공식 서비스인가요?",
    a: "아니요. 현커거래소는 넷플릭스 및 제작사와 무관한 비공식 팬 서비스입니다.",
  },
  {
    q: "성지 카드가 뭔가요?",
    a: "최종커플 픽을 제출하면 제출 시각이 새겨진 이미지 카드를 받습니다. 예측은 제출 후 수정할 수 없고, 종영 후 적중하면 이 카드가 '성지' 인증이 됩니다.",
  },
  {
    q: "최종커플 픽은 어떻게 하나요?",
    a: "매주 회차 공개 전까지 최종커플이 될 것 같은 커플을 1~3쌍 선택해 락인합니다. 이른 라운드에 적중할수록 높은 점수를 받습니다.",
  },
  {
    q: "로그인이 필요한가요?",
    a: "필요 없습니다. 개인정보를 수집하지 않으며 닉네임과 기기 식별값만 사용합니다.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
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

        <h2 className="mt-8 text-base font-bold text-ink">자주 묻는 질문</h2>
        <ul className="mt-3 space-y-3">
          {FAQ.map((f) => (
            <li key={f.q} className="rounded-3xl bg-panel border border-line p-4 shadow-sm">
              <p className="text-sm font-bold text-ink">Q. {f.q}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{f.a}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-base font-bold text-ink">면책 안내</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">{DISCLAIMER}</p>
        <p className="mt-4 text-xs text-muted">문의: 준비 중입니다.</p>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </main>
      <Footer />
    </div>
  );
}
