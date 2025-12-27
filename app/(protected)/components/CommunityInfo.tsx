"use client";

import ConfirmModal from "@/app/components/ui/Modal";
import { communityService } from "@/app/lib/api/community";
import Image from "next/image";
import { useState } from "react";

import starEmpty from "@/app/assets/star_empty.svg";
import starFull from "@/app/assets/star_full.svg";
import starBlue from "@/app/assets/star_blue.svg";

type Props = {
  communityId: number;
  title: string;
  term: string;
  manager: string;
  isStarred: boolean;
  onToggleStar?: () => void;
  onDeleted?: () => void;
  adminNickname?: string;
  myNickname?: string;
};

export default function CommunityInfoCard({
  communityId,
  title,
  term,
  manager,
  isStarred,
  onToggleStar,
  onDeleted,
  adminNickname = "",
  myNickname = "",
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (!Number.isFinite(communityId)) return;

    try {
      setIsDeleting(true);
      await communityService.deleteCommunity(communityId);

      setConfirmOpen(false);
      onDeleted?.();
    } catch (e: any) {
      alert(e?.message ?? "커뮤니티 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isCreator =
    !!adminNickname && !!myNickname && adminNickname === myNickname;

  const icon = !isStarred ? starEmpty : isCreator ? starFull : starBlue;

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <button
        type="button"
        className="absolute right-4 top-4 h-10 w-10 rounded-md  flex items-center justify-center"
        onClick={onToggleStar}
      >
        <Image src={icon} alt="즐겨찾기" width={22} height={22} />
      </button>

      <div className="text-center">
        <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
        <div className="mt-6 space-y-2 text-sm font-semibold text-gray-800">
          <p>학기: {term}</p>
          <p>관리자: {manager}</p>
        </div>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isDeleting}
          className="mt-8 h-11 w-28 rounded-md bg-secondary-400 text-white font-semibold hover:bg-secondary-500 transition-colors"
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message="커뮤니티를 삭제하겠습니까?"
        confirmText={isDeleting ? "삭제 중..." : "삭제"}
        cancelText="취소"
        confirmVariant="danger"
        onCancel={() => {
          if (isDeleting) return;
          setConfirmOpen(false);
        }}
        onConfirm={() => {
          if (isDeleting) return;
          handleConfirmDelete();
        }}
      />
    </div>
  );
}
