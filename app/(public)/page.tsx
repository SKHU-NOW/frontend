"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import memoImg from "../assets/memo.svg";
import plusIcon from "../assets/icon_plus.svg";
import { memoService, type MemoDto } from "@/app/lib/api/memo";

type DraftMemo = {
  x: number; // px (렌더용)
  y: number; // px (렌더용)
  posX: number; // 0~1 (서버 저장용)
  posY: number; // 0~1 (서버 저장용)
  content: string;
};

const BOARD_ID = 0; // ✅ 필요하면 실제 보드 id로 변경

function colorToBg(color: string) {
  // 서버 color enum이 뭐가 오든 “보기 좋은 기본값”으로 매핑
  switch (color) {
    case "RED":
      return "#FCA5A5";
    case "YELLOW":
      return "#FDE68A";
    case "GREEN":
      return "#A7F3D0";
    case "BLUE":
      return "#BFDBFE";
    case "PURPLE":
      return "#DDD6FE";
    default:
      return "#FDE68A";
  }
}

export default function LandingPage() {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [memos, setMemos] = useState<MemoDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<DraftMemo | null>(null);

  const hasAnyMemo = memos.length > 0;

  const fetchMemos = async () => {
    setIsLoading(true);
    try {
      const data = await memoService.getMemos(true); // ✅ all=true로 전체 조회
      setMemos(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  const onBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 이미 입력창이 떠 있으면 새로 만들지 않기 (원하면 이 조건 제거 가능)
    if (draft) return;

    const el = boardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // px
    const y = e.clientY - rect.top; // px

    // 보드 밖 클릭 방지
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

    // 서버 저장용 0~1
    const posX = rect.width === 0 ? 0 : x / rect.width;
    const posY = rect.height === 0 ? 0 : y / rect.height;

    setDraft({
      x,
      y,
      posX,
      posY,
      content: "",
    });
  };

  const submitDraft = async () => {
    if (!draft) return;
    const content = draft.content.trim();
    if (!content) {
      setDraft(null);
      return;
    }

    // 서버 저장
    const created = await memoService.createMemo({
      boardId: BOARD_ID,
      contentText: content,
      posX: draft.posX,
      posY: draft.posY,
      drawingImageUrl: "",
    });

    // 즉시 반영(append) + 안내 문구 숨김 조건 충족
    setMemos((prev) => [created, ...prev]);
    setDraft(null);
  };

  const boardStyle = useMemo(() => {
    return "relative mx-auto px-50 py-10";
  }, []);

  return (
    <main className="text-gray-500">
      {/* 보드 영역 */}
      <div
        ref={boardRef}
        onClick={onBoardClick}
        className={`${boardStyle} min-h-[calc(100vh-100px)]`}
      >
        {/* ✅ 메모가 없을 때만: 기존 랜딩 UI 표시 */}
        {!hasAnyMemo && !draft && (
          <>
            <section className="flex items-center justify-between gap-12">
              <div className="space-y-6 text-center">
                <p className="text-2xl md:text-4xl font-extrabold whitespace-nowrap">
                  성공회대 학생들을 위한 커뮤니티
                </p>
                <p className="text-3xl md:text-4xl font-extrabold">SKHU Link</p>
              </div>

              <div className="flex shrink-0">
                <Image
                  src={memoImg}
                  alt="메모지"
                  className="drop-shadow-md"
                  priority
                />
              </div>
            </section>

            <div className="mt-6 flex items-center gap-2">
              <Image src={plusIcon} alt="플러스버튼" />
              <span className="text-sm font-medium mt-1">
                보드를 클릭하면 새 메모가 생성됩니다.
              </span>
            </div>
          </>
        )}

        {/* ✅ 서버 메모 렌더 */}
        {memos.map((m) => (
          <div
            key={m.id}
            className="absolute w-60 rounded-[14px] border border-gray-200 p-4 shadow-sm"
            style={{
              left: `calc(${m.posX * 100}% - 120px)`, // 중앙 정렬 느낌
              top: `calc(${m.posY * 100}% - 40px)`,
              backgroundColor: colorToBg(m.color),
            }}
            onClick={(e) => e.stopPropagation()} // 메모 클릭이 보드 클릭으로 번지지 않게
          >
            <div className="text-sm font-semibold text-gray-800 whitespace-pre-wrap wrap-break-word">
              {m.contentText}
            </div>
            <div className="mt-2 text-[11px] font-medium text-gray-700/70">
              #{m.id}
            </div>
          </div>
        ))}

        {/* ✅ 입력용 임시 메모 */}
        {draft && (
          <div
            className="absolute w-[260px] rounded-[14px] border border-gray-200 bg-[#FDE68A] p-3 shadow-sm"
            style={{
              left: Math.max(8, draft.x - 120),
              top: Math.max(8, draft.y - 20),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              autoFocus
              value={draft.content}
              onChange={(e) =>
                setDraft((prev) =>
                  prev ? { ...prev, content: e.target.value } : prev
                )
              }
              onKeyDown={(e) => {
                // Enter로 저장 (Shift+Enter는 줄바꿈)
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitDraft();
                }
                // ESC로 취소
                if (e.key === "Escape") setDraft(null);
              }}
              placeholder="메모를 입력하고 Enter..."
              className="h-[120px] w-full resize-none bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-600/70"
            />

            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-md px-2 py-1 text-xs font-extrabold text-gray-700 hover:bg-black/5"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submitDraft}
                className="rounded-md px-2 py-1 text-xs font-extrabold text-gray-900 hover:bg-black/5"
              >
                저장(Enter)
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
