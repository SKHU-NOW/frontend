"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CommunitySearchBar from "../components/Search";
import CommunityCard, { Community } from "../components/CommunityCard";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import CreateCommunityModal from "../components/CreateCommunityModal";
import { CommunityDto, communityService } from "@/app/lib/api/community";
import { userService } from "@/app/lib/api/userService";

export default function CommunityPage() {
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);

  const [rows, setRows] = useState<CommunityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [myNickname, setMyNickname] = useState<string>("");

  const router = useRouter();

  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const el = popoverRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await userService.getMe();
        if (!mounted) return;
        setMyNickname(me.nickname ?? "");
      } catch {
        // 인증 실패 등일 수 있으니 일단 빈 값 유지
        if (!mounted) return;
        setMyNickname("");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchMyCommunities = useCallback(async () => {
    let mounted = true;

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

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchMyCommunities();
  }, [fetchMyCommunities]);

  const communities: Community[] = useMemo(() => {
    const myNick = (myNickname ?? "").trim();

    return rows.map((c) => {
      const adminNick = (c.adminNickname ?? "").trim();
      const isCreator = !!myNick && adminNick === myNick;

      return {
        id: String(c.id),
        title: `${c.name}`,
        semester: ` ${c.year} - ${c.semester}학기`,
        isStarred: !!c.communityMembershipResponse?.pinned,
        isCreator,
      };
    });
  }, [rows, myNickname]);

  const filtered = useMemo(() => {
    const q = keyword.trim();
    if (!q) return communities;
    return communities.filter((c) => c.title.includes(q));
  }, [keyword, communities]);

  const handleToggleStar = useCallback(
    async (communityIdStr: string) => {
      const communityId = Number(communityIdStr);
      if (!Number.isFinite(communityId)) return;

      setRows((prev) =>
        prev.map((c) => {
          if (c.id !== communityId) return c;
          const prevPinned = !!c.communityMembershipResponse?.pinned;

          const nextMembership = {
            ...(c.communityMembershipResponse ?? {
              id: -1,
              role: "MEMBER",
              joinAt: new Date().toISOString(),
              userId: -1,
              userNickname: "",
              communityId,
              banned: false,
              pinned: false,
            }),
            pinned: !prevPinned,
          };

          return { ...c, communityMembershipResponse: nextMembership };
        })
      );

      try {
        const updated = await communityService.toggleCommunityPinned(
          communityId
        );

        setRows((prev) =>
          prev.map((c) => (c.id === communityId ? updated : c))
        );
      } catch (e: any) {
        await fetchMyCommunities();
        alert(e?.message ?? "즐겨찾기 처리에 실패했습니다.");
      }
    },
    [fetchMyCommunities]
  );

  return (
    <div className="mx-auto pb-15 pt-10 px-40">
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
          <div className="mt-6 min-h-[200px] text-sm text-gray-500">
            불러오는 중...
          </div>
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
                onToggleStar={() => handleToggleStar(community.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
