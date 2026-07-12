import Board from "@/components/Board";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-lg">
      <TopBar />
      <main className="pt-2">
        <h1 className="sr-only">현커거래소 - 모솔연애2 실시간 커플 차트</h1>
        <Board />
      </main>
      <Footer />
    </div>
  );
}
