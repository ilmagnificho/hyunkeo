import type { MetadataRoute } from "next";
import { getServiceClient } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hyunkeo.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/predict`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/cast`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // 커플 상세 36개 (롱테일 검색: "재서 수지" 등)
  try {
    const sb = getServiceClient();
    const { data } = await sb.from("couples").select("id");
    for (const c of data ?? []) {
      base.push({
        url: `${SITE_URL}/couple/${c.id}`,
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  } catch {
    // 환경변수 없는 빌드 등에서는 기본 페이지만
  }

  return base;
}
