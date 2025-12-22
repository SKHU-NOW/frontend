"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CommunitySearchBar from "../components/Search";
import CommunityCard, { Community } from "../components/CommunityCard";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import CreateCommunityModal from "../components/CreateCommunityModal";
import { CommunityDto, communityService } from "@/app/lib/api/community";

export default function CommunityPage() {
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);

  const [rows, setRows] = useState<CommunityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const data = await communityService.getMyCommunities();
        if (!mounted) return;

        setRows(data);
      } catch (e: any) {
        if (!mounted) return;
        setErrorMsg(e?.message ?? "커뮤니티 목록을 불러오지 못했습니다.");
        setRows([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const communities: Community[] = useMemo(() => {
    return rows.map((c) => ({
      id: String(c.id),
      title: `${c.name} / ${c.year} - ${c.semester}학기`,
      isStarred: false, // 즐겨찾기 API 붙이기 전까지 임시
    }));
  }, [rows]);

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

            <CreateCommunityModal
              open={open}
              onClose={() => setOpen(false)}
              onCreated={(id) => {
                router.push(`/Community/${id}/Article`);
              }}
            />
          </div>
        </div>

        {/* 상태 표시 */}
        {loading && (
          <div className="mt-6 text-sm text-gray-500">불러오는 중...</div>
        )}
        {!loading && errorMsg && (
          <div className="mt-6 text-sm text-red-500">{errorMsg}</div>
        )}

        {/* 리스트 */}
        {!loading && !errorMsg && (
          <div className="mt-6 space-y-4">
            {filtered.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onClick={() => {
                  router.push(`/Community/${community.id}/Article`);
                }}
                onToggleStar={() => {
                  console.log("toggle star", community.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
