"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CommunitySearchBar from "../components/Search";
import CommunityCard, { Community } from "../components/CommunityCard";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import CreateCommunityModal from "../components/CreateCommunityModal";

export default function CommunityPage() {
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const el = popoverRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return; // 내부 클릭은 유지
      setOpen(false); // 외부 클릭은 닫기
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  // 임시 데이터 (나중에 API로 교체)
  const communities: Community[] = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: String(i + 1),
        title: "영어단어외2:알맹이와 껍데기 / 2025 - 2학기 / 전공선택",
        isStarred: false,
      })),
    []
  );

  const filtered = useMemo(() => {
    const q = keyword.trim();
    if (!q) return communities;
    return communities.filter((c) => c.title.includes(q));
  }, [keyword, communities]);

  return (
    <div className="mx-auto py-8 pl-40 pr-30">
      {/* 전체 패널(흰 박스) */}
      <div className="rounded-[10px] border border-gray-200 bg-white p-14 shadow-sm">
        {/* 상단: 검색 + 버튼 */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex-1">
            <CommunitySearchBar
              value={keyword}
              onChange={setKeyword}
              placeholder="검색어를 입력하세요"
            />
          </div>

          {/* 버튼 + 팝오버를 같은 영역에 묶기 */}
          <div ref={popoverRef} className="relative">
            <Button
              type="button"
              className="h-11 px-6 font-semibold"
              onClick={() => setOpen((v) => !v)}
            >
              커뮤니티 생성
            </Button>

            <CreateCommunityModal open={open} onClose={() => setOpen(false)} />
          </div>
        </div>

        {/* 리스트 */}
        <div className="mt-6 space-y-4">
          {filtered.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onClick={() => {
                // TODO: 커뮤니티 상세로 이동 (나중에 router.push)
                router.push(`/Community/${community.id}/Article`);
                console.log("open", community.id);
              }}
              onToggleStar={() => {
                // TODO: 즐겨찾기 토글 (나중에 상태/서버 연동)
                console.log("toggle star", community.id);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
