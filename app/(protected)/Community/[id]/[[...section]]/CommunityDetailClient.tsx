"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import CommunityInfoCard from "@/app/(protected)/components/CommunityInfo";
import ScheduleCard from "@/app/(protected)/components/ScheduleCard";

import CommunityArticlePage from "@/app/(protected)/components/CommunityArticlePage";
import CommunityFilePage from "@/app/(protected)/components/CommunityFilePage";

import { communityService, type CommunityDto } from "@/app/lib/api/community";
import { userService } from "@/app/lib/api/userService";
import ConfirmModal from "@/app/components/ui/Modal";

export default function CommunityDetailClient() {
  const router = useRouter();
  const params = useParams();

  const rawId = (params as any)?.id as string | string[] | undefined;
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId;
  const communityId = idStr ? Number(idStr) : NaN;

  const rawSection = (params as any)?.section as string[] | undefined;
  const section = rawSection?.[0];

  const [community, setCommunity] = useState<CommunityDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [myNickname, setMyNickname] = useState<string>("");

  const [accessDeniedOpen, setAccessDeniedOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await userService.getMe();
        if (!mounted) return;
        setMyNickname(me.nickname ?? "");
      } catch {
        if (!mounted) return;
        setMyNickname("");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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

      setAccessDeniedOpen(false);
    } catch {
      setCommunity(null);
      setAccessDeniedOpen(true);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

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
      await fetchCommunity();
      alert(e?.message ?? "즐겨찾기 처리에 실패했습니다.");
    }
  }, [communityId, fetchCommunity]);

  return (
    <>
      <div className="mx-auto pb-15 pt-10 px-40">
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
              adminNickname={community?.adminNickname ?? ""}
              myNickname={myNickname}
              isStarred={isStarred}
              onToggleStar={handleToggleStar}
              onDeleted={() => router.replace("/Community")}
            />
            <ScheduleCard communityId={communityId} />
          </aside>
        </div>
      </div>

      <ConfirmModal
        isOpen={accessDeniedOpen}
        message={"커뮤니티 목록에서 즐겨찾기 후 이용 가능합니다."}
        messageVariant="body"
        confirmText="목록으로 돌아가기"
        showCancel={false}
        closeOnOverlay={false}
        onConfirm={() => router.replace("/Community")}
        onCancel={() => router.replace("/Community")}
      />
    </>
  );
}
