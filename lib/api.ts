// basePath 대응 API 경로 헬퍼.
// yoongjae.com/hyunkeo 처럼 서브패스로 서빙할 때 NEXT_PUBLIC_BASE_PATH=/hyunkeo 를 설정하면
// next/link·라우터는 Next가 자동 프리픽스하지만, fetch() 는 수동 프리픽스가 필요하다.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function api(path: string): string {
  return BASE_PATH + path;
}

/** 성지 카드 등 화면 표기용 사이트 주소 (프로토콜 제외) */
export const SITE_DISPLAY = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hyunkeo.vercel.app"
).replace(/^https?:\/\//, "").replace(/\/$/, "");
