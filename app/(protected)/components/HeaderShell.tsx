"use client";

import { useParams } from "next/navigation";
import ProtectedHeader from "./Header";

export default function HeaderShell() {
  const params = useParams();

  const raw = (params as any)?.id as string | string[] | undefined;
  const idStr = Array.isArray(raw) ? raw[0] : raw;

  const communityId = idStr ? Number(idStr) : undefined;
  const safeCommunityId = Number.isFinite(communityId)
    ? communityId
    : undefined;

  return <ProtectedHeader communityId={safeCommunityId} />;
}
