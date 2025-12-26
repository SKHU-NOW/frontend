// app/(protected)/Community/[id]/[[...section]]/CommunityDetailClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import CommunityInfoCard from "@/app/(protected)/components/CommunityInfo";
import ScheduleCard from "@/app/(protected)/components/ScheduleCard";
import starIcon from "@/app/assets/star_empty.svg";

import CommunityArticlePage from "@/app/(protected)/components/CommunityArticlePage";
import CommunityFilePage from "@/app/(protected)/components/CommunityFilePage";

import { communityService, type CommunityDto } from "@/app/lib/api/community";

export default function CommunityDetailClient() {
  const router = useRouter();
  const params = useParams();

  const rawId = (params as any)?.id as string | string[] | undefined;
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId;
  const communityId = idStr ? Number(idStr) : NaN;

  const rawSection = (params as any)?.section as string[] | undefined;
  const section = rawSection?.[0]; // "Article" | "File" | undefined

  const [community, setCommunity] = useState<CommunityDto | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) 라우팅 방어 + 초기 진입은 Article로
  useEffect(() => {
    if (!Number.isFinite(communityId)) {
      router.replace("/Community");
      return;
    }
    if (!section) {
      router.replace(`/Community/${communityId}/Article`);
      return;
    }
    if (section !== "Article" && section !== "File") {
      router.replace(`/Community/${communityId}/Article`);
      return;
    }
  }, [communityId, section, router]);

  const fetchCommunity = useCallback(async () => {
    if (!Number.isFinite(communityId)) return;

    try {
      setLoading(true);
      const data = await communityService.getCommunityById(communityId);
      setCommunity(data);
    } catch {
      router.replace("/Community");
    } finally {
      setLoading(false);
    }
  }, [communityId, router]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  const Left = useMemo(() => {
    if (!section) return null;
    if (section === "Article")
      return (
        <CommunityArticlePage
          communityId={communityId}
          adminNickname={community?.adminNickname ?? ""}
        />
      );
    if (section === "File")
      return <CommunityFilePage communityId={communityId} />;
    return null;
  }, [section, communityId, community?.adminNickname]);

  const termText = community
    ? `${community.year}년 ${community.semester}학기`
    : "-";

  const isStarred = !!community?.communityMembershipResponse?.pinned;

  const handleToggleStar = useCallback(async () => {
    if (!Number.isFinite(communityId)) return;

    // optimistic
    setCommunity((prev) => {
      if (!prev) return prev;
      const prevPinned = !!prev.communityMembershipResponse?.pinned;

      const nextMembership = {
        ...(prev.communityMembershipResponse ?? {
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

      return { ...prev, communityMembershipResponse: nextMembership };
    });

    try {
      const updated = await communityService.toggleCommunityPinned(communityId);
      setCommunity(updated);
    } catch (e: any) {
      await fetchCommunity(); // rollback
      alert(e?.message ?? "즐겨찾기 처리에 실패했습니다.");
    }
  }, [communityId, fetchCommunity]);

  return (
    <div className="mx-auto py-8 pl-40 pr-30">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* 좌측: 메뉴별 */}
        <section>{Left}</section>

        {/* 우측: 공통 카드 */}
        <aside className="space-y-6">
          <CommunityInfoCard
            communityId={communityId}
            title={loading ? "불러오는 중..." : community?.name ?? "-"}
            term={loading ? "-" : termText}
            manager={loading ? "-" : community?.adminNickname ?? "-"}
            isStarred={isStarred}
            onToggleStar={handleToggleStar}
            onDeleted={() => router.replace("/Community")}
          />
          <ScheduleCard />
        </aside>
      </div>
    </div>
  );
}
