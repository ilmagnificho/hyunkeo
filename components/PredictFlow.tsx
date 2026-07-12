"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Badge from "./Badge";
import Countdown from "./Countdown";
import { getDeviceId, getSavedNickname, saveNickname } from "@/lib/device";
import { track } from "@/lib/analytics";
import type { BoardResponse, CoupleInfo, RoundResponse } from "@/lib/types";

const LOCKED_CARD_KEY = "hyunkeo_prediction_"; // + round_no → prediction id

export default function PredictFlow() {
  const router = useRouter();
  const [round, setRound] = useState<RoundResponse | null>(null);
  const [couples, setCouples] = useState<CoupleInfo[]>([]);
  const [nickname, setNickname] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lockedCardId, setLockedCardId] = useState<string | null>(null);

  useEffect(() => {
    setNickname(getSavedNickname());
    fetch("/api/round")
      .then((r) => r.json())
      .then((r: RoundResponse) => {
        setRound(r);
        if (!r.closed && r.round) {
          track("predict_start", { round_no: r.round.round_no });
          const saved = localStorage.getItem(LOCKED_CARD_KEY + r.round.round_no);
          if (saved) setLockedCardId(saved);
        }
      })
      .catch(() => setRound({ closed: true, serverTime: "" }));
    fetch("/api/board")
      .then((r) => r.json())
      .then((b: BoardResponse) => setCouples(b.couples ?? []))
      .catch(() => {});
  }, []);

  const men = useMemo(() => {
    const m = new Map<string, CoupleInfo["m"]>();
    couples.forEach((c) => m.set(c.m.id, c.m));
    return Array.from(m.values());
  }, [couples]);
  const women = useMemo(() => {
    const w = new Map<string, CoupleInfo["f"]>();
    couples.forEach((c) => w.set(c.f.id, c.f));
    return Array.from(w.values());
  }, [couples]);
  const coupleById = useMemo(() => new Map(couples.map((c) => [c.id, c])), [couples]);

  function toggle(coupleId: string) {
    setPicked((prev) => {
      if (prev.includes(coupleId)) return prev.filter((c) => c !== coupleId);
      if (prev.length >= 3) return prev;
      return [...prev, coupleId];
    });
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: getDeviceId(),
          nickname: nickname.trim(),
          coupleIds: picked,
        }),
      });
      const json = await res.json();
      if (json.ok && json.prediction) {
        track("predict_lock", {
          round_no: round?.round?.round_no,
          couples_count: picked.length,
        });
        if (round?.round) {
          localStorage.setItem(LOCKED_CARD_KEY + round.round.round_no, json.prediction.id);
        }
        router.push(`/card/${json.prediction.id}`);
        return;
      }
      if (json.reason === "locked" && json.prediction) {
        if (round?.round) {
          localStorage.setItem(LOCKED_CARD_KEY + round.round.round_no, json.prediction.id);
        }
        setLockedCardId(json.prediction.id);
        setConfirming(false);
        return;
      }
      if (json.reason === "closed") {
        setRound({ closed: true, serverTime: "" });
      } else if (json.reason === "moderation") {
        setErrorMsg("닉네임에 사용할 수 없는 표현이 있어요. 바꿔주세요 🙏");
        setStep(1);
        setConfirming(false);
      } else {
        setErrorMsg("제출에 실패했어요. 잠시 후 다시 시도해주세요.");
        setConfirming(false);
      }
    } catch {
      setErrorMsg("제출에 실패했어요. 잠시 후 다시 시도해주세요.");
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  }

  // 로딩
  if (!round) {
    return <p className="py-16 text-center text-sm text-muted animate-pulse">불러오는 중...</p>;
  }

  // 전 라운드 마감
  if (round.closed) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold text-ink">모든 픽이 마감됐어요</p>
        <p className="mt-2 text-sm text-muted">
          최종회가 공개됐습니다. 차트에서 결과의 여운을 함께해요.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/25"
        >
          차트 보러가기
        </Link>
      </div>
    );
  }

  // 이번 라운드 이미 제출
  if (lockedCardId) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold text-ink">이번 라운드 픽은 이미 락인됐어요 💌</p>
        <p className="mt-2 text-sm text-muted">
          픽은 제출 후 수정할 수 없어요. 그게 성지의 조건이니까요.
        </p>
        <Link
          href={`/card/${lockedCardId}`}
          className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/25"
        >
          내 성지 카드 보기 💌
        </Link>
      </div>
    );
  }

  const r = round.round!;

  return (
    <div>
      <div className="rounded-3xl bg-gradient-to-br from-accent-soft via-panel to-panel border border-line p-4 shadow-sm">
        <p className="text-xs font-bold text-accent">ROUND {r.round_no} · {r.label}</p>
        <p className="mt-1 text-lg font-extrabold text-ink">
          최종커플 픽, 지금 락인하세요
        </p>
        <p className="mt-1 text-xs text-muted">
          이른 라운드 적중일수록 높은 훈수 점수 (이번 라운드 적중 시 {r.points}점)
        </p>
        <div className="mt-2">
          <Countdown lockAt={r.lock_at} label="마감" />
        </div>
      </div>

      {errorMsg && (
        <p className="mt-3 rounded-lg bg-up/10 px-3 py-2 text-xs font-semibold text-up">{errorMsg}</p>
      )}

      {step === 1 && (
        <div className="mt-5">
          <label className="text-sm font-bold text-ink" htmlFor="nickname">
            1단계 · 닉네임
          </label>
          <p className="mt-1 text-xs text-muted">성지 카드에 새겨질 이름이에요 (1-12자)</p>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 12))}
            placeholder="예: 훈수왕참견러"
            className="mt-3 w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
            maxLength={12}
          />
          <button
            onClick={() => {
              if (nickname.trim().length >= 1) {
                saveNickname(nickname.trim());
                setStep(2);
              }
            }}
            disabled={nickname.trim().length < 1}
            className="mt-4 w-full rounded-2xl bg-accent py-3 text-sm font-bold text-white shadow-md shadow-accent/25 disabled:opacity-40"
          >
            다음 → 커플 선택
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-5">
          <p className="text-sm font-bold text-ink">
            2단계 · 최종커플 선택 <span className="text-accent">({picked.length}/3)</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            남 → 여 순서로 눌러 커플을 만드세요. 1~3쌍까지 선택할 수 있어요.
          </p>

          <CouplePicker
            men={men}
            women={women}
            picked={picked}
            onToggle={toggle}
          />

          {picked.length > 0 && (
            <div className="mt-4 space-y-2">
              {picked.map((cid) => {
                const c = coupleById.get(cid);
                if (!c) return null;
                return (
                  <div
                    key={cid}
                    className="flex items-center justify-between rounded-2xl bg-panel border border-line px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex -space-x-1.5">
                        <Badge member={c.m} size={28} />
                        <Badge member={c.f} size={28} />
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {c.m.name} <span className="text-accent">♥</span> {c.f.name}
                      </span>
                    </span>
                    <button
                      onClick={() => toggle(cid)}
                      className="text-xs text-muted underline"
                    >
                      빼기
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setConfirming(true)}
            disabled={picked.length < 1}
            className="mt-5 w-full rounded-2xl bg-accent py-3 text-sm font-bold text-white shadow-md shadow-accent/25 disabled:opacity-40"
          >
            픽 락인하기 💌
          </button>
          <button
            onClick={() => setStep(1)}
            className="mt-2 w-full py-2 text-xs text-muted underline"
          >
            ← 닉네임 다시 정하기
          </button>
        </div>
      )}

      {confirming && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-6"
          role="dialog"
          aria-modal
        >
          <div className="w-full max-w-sm rounded-2xl bg-panel p-5 border border-line shadow-2xl">
            <p className="text-base font-extrabold text-ink">정말 락인할까요?</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              제출 후 수정 불가. 이 타임스탬프가 당신의 성지가 됩니다.
            </p>
            <div className="mt-3 rounded-2xl bg-panel-2/70 px-3 py-2.5">
              {picked.map((cid) => {
                const c = coupleById.get(cid);
                return c ? (
                  <p key={cid} className="py-0.5 text-sm font-semibold text-ink">
                    {c.m.name} <span className="text-accent">♥</span> {c.f.name}
                  </p>
                ) : null;
              })}
              <p className="mt-1 text-xs text-muted">by {nickname.trim()}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="flex-1 rounded-2xl bg-panel-2 py-3 text-sm font-bold text-ink/80"
              >
                다시 볼게요
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 rounded-2xl bg-accent py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {submitting ? "락인 중..." : "락인 확정 🔒"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 380px 에서 실제로 쓸 수 있는 2열 픽커: 남자 선택 → 여자 선택 = 커플 추가 */
function CouplePicker({
  men,
  women,
  picked,
  onToggle,
}: {
  men: CoupleInfo["m"][];
  women: CoupleInfo["f"][];
  picked: string[];
  onToggle: (coupleId: string) => void;
}) {
  const [pendingMan, setPendingMan] = useState<string | null>(null);

  function pickMan(id: string) {
    setPendingMan((cur) => (cur === id ? null : id));
  }
  function pickWoman(id: string) {
    if (!pendingMan) return;
    onToggle(`${pendingMan}-${id}`);
    setPendingMan(null);
  }

  if (men.length === 0) {
    return (
      <p className="mt-4 text-center text-xs text-muted animate-pulse">
        출연자 불러오는 중...
      </p>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <p className="mb-2 text-xs font-bold text-muted">남자 출연자</p>
        <div className="space-y-1.5">
          {men.map((m) => (
            <button
              key={m.id}
              onClick={() => pickMan(m.id)}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors ${
                pendingMan === m.id
                  ? "bg-accent-soft ring-2 ring-accent"
                  : "bg-panel border border-line hover:bg-accent-soft/40"
              }`}
            >
              <Badge member={m} size={28} />
              <span className="text-sm font-semibold text-ink">{m.name}</span>
              {m.is_maegi && (
                <span className="ml-auto rounded bg-lavender/15 px-1 py-0.5 text-[10px] font-bold text-lavender">
                  메기
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold text-muted">
          여자 출연자 {pendingMan ? "← 골라주세요!" : ""}
        </p>
        <div className={`space-y-1.5 ${pendingMan ? "" : "opacity-50"}`}>
          {women.map((f) => {
            const wouldBe = pendingMan ? `${pendingMan}-${f.id}` : null;
            const already = wouldBe ? picked.includes(wouldBe) : false;
            return (
              <button
                key={f.id}
                onClick={() => pickWoman(f.id)}
                disabled={!pendingMan}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors ${
                  already ? "bg-accent-soft ring-2 ring-accent" : "bg-panel border border-line hover:bg-accent-soft/40"
                }`}
              >
                <Badge member={f} size={28} />
                <span className="text-sm font-semibold text-ink">{f.name}</span>
                {f.is_maegi && (
                  <span className="ml-auto rounded bg-lavender/15 px-1 py-0.5 text-[10px] font-bold text-lavender">
                    메기
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
