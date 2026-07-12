"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDeviceId,
  getSavedNickname,
  saveNickname,
  hasReported,
  markReported,
} from "@/lib/device";
import type { CommentRow } from "@/lib/types";

export default function CommentSection({ coupleId }: { coupleId: string }) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    fetch(`/api/comments?coupleId=${encodeURIComponent(coupleId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setComments(json.comments);
      })
      .catch(() => {});
  }, [coupleId]);

  useEffect(() => {
    setNickname(getSavedNickname());
    load();
  }, [load]);

  function showMsg(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  }

  async function submit() {
    const nick = nickname.trim();
    const text = body.trim();
    if (!nick || !text || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupleId, deviceId: getDeviceId(), nickname: nick, body: text }),
      });
      const json = await res.json();
      if (json.ok) {
        saveNickname(nick);
        setBody("");
        setComments((prev) => [json.comment, ...prev].slice(0, 50));
        showMsg("훈수 등록 완료! 💬");
      } else if (json.reason === "moderation") {
        showMsg(json.message ?? "표현을 조금 바꿔주세요 🙏");
      } else if (json.reason === "rate_limited") {
        showMsg("오늘 훈수 한도(10개)에 도달했어요");
      } else {
        showMsg("등록에 실패했어요. 잠시 후 다시 시도해주세요.");
      }
    } catch {
      showMsg("등록에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function report(commentId: string) {
    if (hasReported(commentId)) {
      showMsg("이미 신고한 훈수예요");
      return;
    }
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, deviceId: getDeviceId() }),
      });
      const json = await res.json();
      if (json.ok) {
        markReported(commentId);
        if (json.hidden) {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
        showMsg("신고가 접수됐어요");
      }
    } catch {
      showMsg("신고에 실패했어요");
    }
  }

  return (
    <section className="mt-4 rounded-3xl bg-panel border border-line p-4 shadow-sm">
      <p className="text-sm font-bold text-ink">한 줄 훈수 💬</p>
      <p className="mt-0.5 text-[11px] text-muted">
        60자 이내 · 비방/외모품평/사생활 언급은 등록되지 않아요
      </p>

      <div className="mt-3 space-y-2">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 12))}
          placeholder="닉네임 (1-12자)"
          maxLength={12}
          className="w-full rounded-xl border border-line bg-board/60 px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 60))}
            placeholder="이 커플, 어떻게 보고 계세요?"
            maxLength={60}
            rows={2}
            className="w-full resize-none rounded-xl border border-line bg-board/60 px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
          <span className="absolute bottom-2 right-2.5 text-[10px] text-muted tabular-nums">
            {body.length}/60
          </span>
        </div>
        <button
          onClick={submit}
          disabled={busy || !nickname.trim() || !body.trim()}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-white shadow-md shadow-accent/20 disabled:opacity-40"
        >
          {busy ? "등록 중..." : "훈수 남기기"}
        </button>
        {msg && <p className="text-center text-xs font-semibold text-accent">{msg}</p>}
      </div>

      <ul className="mt-4 space-y-2">
        {comments.length === 0 && (
          <li className="py-4 text-center text-xs text-muted">
            아직 훈수가 없어요. 첫 훈수의 주인공이 되어보세요!
          </li>
        )}
        {comments.map((c) => (
          <li
            key={c.id}
            className="flex items-start gap-2 rounded-2xl bg-panel-2/60 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-accent">{c.nickname}</p>
              <p className="mt-0.5 break-words text-sm text-ink">{c.body}</p>
            </div>
            <button
              onClick={() => report(c.id)}
              className="shrink-0 text-xs opacity-40 hover:opacity-100"
              aria-label="신고"
              title="신고"
            >
              🚨
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
