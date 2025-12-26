"use client";

import { useEffect, useMemo, useState } from "react";

type ScheduleItem = {
  id: string;
  text: string;
};

type Cell = {
  date: Date;
  inMonth: boolean;
};

// ✅ 여기만 프로젝트 primary 토큰에 맞게 바꾸면 됨
const PRIMARY_BG = "bg-primary-500";
const PRIMARY_TEXT = "text-primary-600";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, diff: number) {
  return new Date(d.getFullYear(), d.getMonth() + diff, 1);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** ✅ 35칸(5주)만 생성 */
function buildMonthGrid5Rows(viewDate: Date): Cell[] {
  const first = startOfMonth(viewDate);
  const last = endOfMonth(viewDate);

  const firstWeekday = first.getDay(); // 0(일)~6(토)
  const daysInMonth = last.getDate();

  const prevMonthLast = new Date(first.getFullYear(), first.getMonth(), 0);
  const prevMonthDays = prevMonthLast.getDate();

  const total = 35;
  const cells: Cell[] = [];

  for (let i = 0; i < total; i++) {
    const dayIndex = i - firstWeekday + 1;

    let cellDate: Date;
    let inMonth = true;

    if (dayIndex <= 0) {
      cellDate = new Date(
        first.getFullYear(),
        first.getMonth() - 1,
        prevMonthDays + dayIndex
      );
      inMonth = false;
    } else if (dayIndex > daysInMonth) {
      cellDate = new Date(
        first.getFullYear(),
        first.getMonth() + 1,
        dayIndex - daysInMonth
      );
      inMonth = false;
    } else {
      cellDate = new Date(first.getFullYear(), first.getMonth(), dayIndex);
      inMonth = true;
    }

    cells.push({ date: cellDate, inMonth });
  }

  return cells;
}

type Props = {
  communityId: number; // ✅ 커뮤니티별로 일정 분리 저장
};

export default function ScheduleCard({ communityId }: Props) {
  const LS_KEY = useMemo(
    () => `community-schedule-v1:${communityId}`,
    [communityId]
  );

  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // ✅ 초기값을 localStorage에서 “바로” 읽어서 설정 (덮어쓰기 방지)
  const [eventsMap, setEventsMap] = useState<Record<string, ScheduleItem[]>>(
    () => {
      if (typeof window === "undefined") return {};
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    }
  );

  const [draft, setDraft] = useState("");

  const today = useMemo(() => new Date(), []);
  const grid = useMemo(() => buildMonthGrid5Rows(viewDate), [viewDate]);

  const title = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth() + 1;
    return `${y}년 ${m}월`;
  }, [viewDate]);

  const week = ["일", "월", "화", "수", "목", "금", "토"] as const;

  // ✅ eventsMap 변경될 때만 저장 (초기 mount에서 {}로 덮어쓰기 문제가 사라짐)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(eventsMap));
    } catch {
      // ignore
    }
  }, [LS_KEY, eventsMap]);

  const selectedKey = selectedDate ? toKey(selectedDate) : null;
  const selectedEvents = selectedKey ? eventsMap[selectedKey] ?? [] : [];

  const hasEvents = (d: Date) => {
    const k = toKey(d);
    return (eventsMap[k]?.length ?? 0) > 0;
  };

  const onSelectDate = (d: Date) => {
    setSelectedDate(d);
    setDraft("");
  };

  const onAddEvent = () => {
    if (!selectedKey) return;
    const text = draft.trim();
    if (!text) return;

    const item: ScheduleItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
    };

    setEventsMap((prev) => ({
      ...prev,
      [selectedKey]: [...(prev[selectedKey] ?? []), item],
    }));
    setDraft("");
  };

  const onDeleteEvent = (id: string) => {
    if (!selectedKey) return;
    setEventsMap((prev) => {
      const nextList = (prev[selectedKey] ?? []).filter((it) => it.id !== id);
      const next = { ...prev, [selectedKey]: nextList };
      if (nextList.length === 0) delete next[selectedKey];
      return next;
    });
  };

  const closePanel = () => {
    setSelectedDate(null);
    setDraft("");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="relative">
        {selectedDate && (
          <>
            {/* lg 이상: 왼쪽 */}
            <div className="hidden lg:block absolute right-full mr-4 top-0 w-[330px]">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold text-gray-900">
                    {toKey(selectedDate)}
                  </div>
                  <button
                    type="button"
                    onClick={closePanel}
                    className="h-8 w-8 rounded-md text-gray-500"
                    aria-label="닫기"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3">
                  {selectedEvents.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-xs font-semibold text-gray-600">
                      등록된 일정이 없습니다.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {selectedEvents.map((ev) => (
                        <li
                          key={ev.id}
                          className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                        >
                          <div className="text-sm font-semibold text-gray-800 wrap-break-word">
                            {ev.text}
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteEvent(ev.id)}
                            className="shrink-0 text-xs font-bold text-red-500 hover:underline"
                          >
                            삭제
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-xs font-extrabold text-gray-700 mb-2">
                    일정 추가
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onAddEvent();
                      }}
                      placeholder="예) 과제 제출"
                      className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm font-semibold text-gray-800 outline-none focus:border-gray-400"
                    />
                    <button
                      type="button"
                      onClick={onAddEvent}
                      disabled={!draft.trim()}
                      className={`h-10 px-3 rounded-md text-sm font-extrabold text-white disabled:opacity-50 ${PRIMARY_BG} whitespace-nowrap`}
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 작은 화면: 아래 */}
            <div className="lg:hidden mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold text-gray-900">
                  {toKey(selectedDate)}
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="h-8 w-8 rounded-md hover:bg-gray-50 text-gray-500"
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3">
                {selectedEvents.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-xs font-semibold text-gray-600">
                    등록된 일정이 없습니다.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {selectedEvents.map((ev) => (
                      <li
                        key={ev.id}
                        className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                      >
                        <div className="text-sm font-semibold text-gray-800 wrap-break-word">
                          {ev.text}
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteEvent(ev.id)}
                          className="shrink-0 text-xs font-bold text-red-500 hover:underline"
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4">
                <div className="text-xs font-extrabold text-gray-700 mb-2">
                  일정 추가
                </div>
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onAddEvent();
                    }}
                    placeholder="예) 과제 제출"
                    className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm font-semibold text-gray-800 outline-none focus:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={onAddEvent}
                    disabled={!draft.trim()}
                    className={`h-10 px-4 rounded-md text-sm font-extrabold text-white disabled:opacity-50 ${PRIMARY_BG} whitespace-nowrap`}
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">일정</h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, -1))}
              className="h-8 w-8 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="이전 달"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              className="h-8 w-8 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="다음 달"
            >
              ›
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-extrabold text-gray-900">{title}</div>
          <div className={`text-xs font-semibold ${PRIMARY_TEXT}`} />
        </div>

        <div className="mt-4 grid grid-cols-7 text-center text-sm font-bold">
          {week.map((w, idx) => (
            <div
              key={w}
              className={
                idx === 0
                  ? "text-orange-500"
                  : idx === 6
                  ? "text-blue-500"
                  : "text-gray-900"
              }
            >
              {w}
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-y-2 text-center">
          {grid.map(({ date, inMonth }, i) => {
            const isToday = sameDay(date, today);
            const isSelected = selectedDate
              ? sameDay(date, selectedDate)
              : false;

            const circleClass = isToday
              ? "bg-blue-500 text-white"
              : isSelected
              ? `${PRIMARY_BG} text-white`
              : "";

            const baseText = inMonth ? "text-gray-900" : "text-gray-300";
            const hoverClass =
              !isSelected && !isToday ? "hover:bg-gray-50" : "";

            const showDot = hasEvents(date);

            return (
              <button
                key={`${date.toISOString()}-${i}`}
                type="button"
                onClick={() => onSelectDate(date)}
                className="flex items-center justify-center"
                aria-label={toKey(date)}
              >
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={[
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      "text-base font-semibold",
                      isToday ? "" : baseText,
                      hoverClass,
                      circleClass,
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </div>

                  <div className="h-2 mt-0.5 flex items-center justify-center">
                    {showDot && (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
