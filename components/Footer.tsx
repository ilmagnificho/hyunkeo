import Link from "next/link";

export const DISCLAIMER =
  "본 사이트는 비공식 팬 서비스로, 넷플릭스 및 제작사와 무관합니다. 출연자 비방/사생활 추측 콘텐츠를 금지합니다.";

export default function Footer() {
  return (
    <footer className="mt-12 pb-10 px-4 text-center">
      <p className="text-xs leading-relaxed text-muted/90">{DISCLAIMER}</p>
      <p className="mt-2 text-xs">
        <Link href="/about" className="text-muted underline underline-offset-2">
          현커거래소 소개
        </Link>
      </p>
    </footer>
  );
}
