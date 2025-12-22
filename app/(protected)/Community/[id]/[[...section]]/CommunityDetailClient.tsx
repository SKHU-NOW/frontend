// app/(protected)/Community/[id]/[[...section]]/CommunityDetailClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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

  // 2) 커뮤니티 상세 조회 API 연결
  useEffect(() => {
    const run = async () => {
      if (!Number.isFinite(communityId)) return;

      try {
        setLoading(true);
        const data = await communityService.getCommunityById(communityId);
        setCommunity(data);
      } catch (e) {
        // 상세가 없거나 권한 없으면 목록으로
        router.replace("/Community");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [communityId, router]);

  const Left = useMemo(() => {
    if (!section) return null;
    if (section === "Article")
      return <CommunityArticlePage communityId={communityId} />;
    if (section === "File")
      return <CommunityFilePage communityId={communityId} />;
    return null;
  }, [section, communityId]);

  const termText = community
    ? `${community.year}년 ${community.semester}학기`
    : "-";

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
            starIconSrc={starIcon}
            onDeleted={() => router.replace("/Community")}
          />
          <ScheduleCard />
        </aside>
      </div>
    </div>
  );
}
