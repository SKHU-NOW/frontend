"use client";

import { useEffect, useState } from "react";
import FileList from "@/app/(protected)/components/FileList";
import { fileService, type CommunityResourceDto } from "@/app/lib/api/file";
import { useAuth } from "@/app/providers/AuthProvider";

export default function CommunityFilePage({
  communityId,
}: {
  communityId: number;
}) {
  const { user } = useAuth?.() as any;
  const currentUserId: number = Number.isFinite(user?.id)
    ? Number(user.id)
    : -1;

  const [items, setItems] = useState<CommunityResourceDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchResources = async () => {
    if (!Number.isFinite(communityId)) return;

    try {
      setIsLoading(true);
      setErrorMsg(null);

      const data = await fileService.getCommunityResources(communityId);
      setItems(data);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "자료 목록 조회에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [communityId]);

  return (
    <FileList
      communityId={communityId}
      currentUserId={currentUserId}
      items={items}
      isLoading={isLoading}
      errorMsg={errorMsg}
      onRetry={fetchResources}
      onUploaded={fetchResources}
      onDeleted={fetchResources}
    />
  );
}
