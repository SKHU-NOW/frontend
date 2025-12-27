"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import memoImg from "../assets/memo.svg";
import plusIcon from "../assets/icon_plus.svg";
import { memoService, type MemoDto, type MemoColor } from "@/app/lib/api/memo";
import { formatTimeAgoWithPlus9 } from "../lib/utils/time_memo";

type DraftMemo = {
  x: number;
  y: number;
  posX: number;
  posY: number;
  content: string;
  color: MemoColor;
};

const BOARD_ID = 0;

const COLORS: MemoColor[] = ["RED", "YELLOW", "GREEN", "BLUE", "PURPLE"];
function pickRandomColor(): MemoColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function colorToBg(color: string) {
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

const COLOR_MAP_KEY = `skhu-link:memo-color-map:v1:board-${BOARD_ID}`;

function safeLoadColorMap(): Record<number, MemoColor> {
  try {
    const raw = localStorage.getItem(COLOR_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);

    const next: Record<number, MemoColor> = {};
    for (const [k, v] of Object.entries(parsed ?? {})) {
      const id = Number(k);
      if (!Number.isNaN(id)) next[id] = v as MemoColor;
    }
    return next;
  } catch {
    return {};
  }
}

function safeSaveColorMap(map: Record<number, MemoColor>) {
  try {
    localStorage.setItem(COLOR_MAP_KEY, JSON.stringify(map));
  } catch {}
}

export default function LandingPage() {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [memos, setMemos] = useState<MemoDto[]>([]);
  const [draft, setDraft] = useState<DraftMemo | null>(null);

  const [colorOverrideMap, setColorOverrideMap] = useState<
    Record<number, MemoColor>
  >({});

  const hasAnyMemo = memos.length > 0;

  useEffect(() => {
    setColorOverrideMap(safeLoadColorMap());
  }, []);

  useEffect(() => {
    safeSaveColorMap(colorOverrideMap);
  }, [colorOverrideMap]);

  const fetchMemos = async () => {
    const data = await memoService.getMemos(true);
    setMemos(data);

    setColorOverrideMap((prev) => {
      const next = { ...prev };
      for (const m of data) {
        if (next[m.id] == null) next[m.id] = pickRandomColor();
      }
      return next;
    });
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  const onBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draft) return;

    const el = boardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

    const posX = rect.width === 0 ? 0 : x / rect.width;
    const posY = rect.height === 0 ? 0 : y / rect.height;

    setDraft({
      x,
      y,
      posX,
      posY,
      content: "",
      color: pickRandomColor(),
    });
  };

  const submitDraft = async () => {
    if (!draft) return;

    const content = draft.content.trim();
    if (!content) {
      setDraft(null);
      return;
    }

    const created = await memoService.createMemo({
      boardId: BOARD_ID,
      contentText: content,
      posX: draft.posX,
      posY: draft.posY,
      drawingImageUrl: "",
    });

    setColorOverrideMap((prev) => ({
      ...prev,
      [created.id]: draft.color,
    }));

    setMemos((prev) => [created, ...prev]);
    setDraft(null);
  };

  const boardStyle = useMemo(() => "relative mx-auto px-50 py-10", []);

  return (
    <main className="text-gray-500">
      <div
        ref={boardRef}
        onClick={onBoardClick}
        className={`${boardStyle} min-h-[calc(100vh-100px)]`}
      >
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

        {memos.map((m) => {
          const color = colorOverrideMap[m.id];
          if (!color) return null;

          return (
            <div
              key={m.id}
              className="absolute w-60 rounded-[14px] border border-gray-200 p-4 shadow-sm"
              style={{
                left: `calc(${m.posX * 100}% - 120px)`,
                top: `calc(${m.posY * 100}% - 40px)`,
                backgroundColor: colorToBg(color),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-sm font-semibold text-gray-800 whitespace-pre-wrap wrap-break-word">
                {m.contentText}
              </div>
              <div className="mt-2 text-[11px] font-medium text-gray-700/70">
                {formatTimeAgoWithPlus9(m.createdAt)}
              </div>
            </div>
          );
        })}

        {draft && (
          <div
            className="absolute w-[260px] rounded-[14px] border border-gray-200 p-3 shadow-sm"
            style={{
              left: Math.max(8, draft.x - 120),
              top: Math.max(8, draft.y - 20),
              backgroundColor: colorToBg(draft.color),
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
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitDraft();
                }
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
