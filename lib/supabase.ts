import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 서버 전용 Supabase 클라이언트 (service role).
// 절대 클라이언트 컴포넌트에서 import 하지 말 것.
let client: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase 환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 를 설정하세요."
    );
  }
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
