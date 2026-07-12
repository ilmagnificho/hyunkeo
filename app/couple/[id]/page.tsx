import type { Metadata } from "next";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import CoupleDetail from "@/components/CoupleDetail";

export const metadata: Metadata = {
  title: "커플 상세 | 현커거래소",
};

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
